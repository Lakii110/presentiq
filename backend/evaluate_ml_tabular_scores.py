"""
Evaluate fluency / prosodic prediction **without audio**, using only fields from
`archive/resource/scores.json` and the official **train/test wav.scp** splits.

This fills supervisor tables when WAV files are missing from the repo.
Production scoring still uses **Librosa + waveform** (see `train_models.py`).

Outputs JSON and prints markdown-friendly rows for COMPLETE_PROJECT_REPORT.md.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    recall_score,
    roc_auc_score,
    r2_score,
)
from sklearn.model_selection import KFold


def read_wav_scp_ids(path: Path) -> list[str]:
    ids: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        utt, _ = line.split(maxsplit=1)
        ids.append(utt)
    return ids


def utterance_features(entry: dict) -> np.ndarray | None:
    """Scalar features that do not include fluency/prosodic targets."""
    words = entry.get("words") or []
    if not isinstance(words, list):
        words = []

    acc_vals = [float(w.get("accuracy") or 0.0) for w in words]
    tot_vals = [float(w.get("total") or 0.0) for w in words]
    stress_vals = [float(w.get("stress") or 0.0) for w in words]

    text = str(entry.get("text") or "")
    n_words = float(len(words))

    def _mean_std(xs: list[float]) -> tuple[float, float]:
        if not xs:
            return 0.0, 0.0
        a = np.asarray(xs, dtype=np.float64)
        return float(a.mean()), float(a.std())

    ma, sa = _mean_std(acc_vals)
    mt, st = _mean_std(tot_vals)
    ms, ss = _mean_std(stress_vals)

    top_acc = float(entry.get("accuracy") or 0.0)
    top_comp = float(entry.get("completeness") or 0.0)
    top_tot = float(entry.get("total") or 0.0)

    return np.asarray(
        [
            top_acc,
            top_comp,
            top_tot,
            float(len(text)),
            n_words,
            ma,
            sa,
            mt,
            st,
            ms,
            ss,
        ],
        dtype=np.float64,
    )


FEATURE_NAMES = [
    "top_accuracy",
    "top_completeness",
    "top_total",
    "text_len_chars",
    "word_count",
    "word_accuracy_mean",
    "word_accuracy_std",
    "word_total_mean",
    "word_total_std",
    "word_stress_mean",
    "word_stress_std",
]


def build_matrices(
    *,
    scores: dict,
    train_ids: list[str],
    test_ids: list[str],
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    def stack(ids: list[str]) -> tuple[list[np.ndarray], list[float], list[float]]:
        xs: list[np.ndarray] = []
        ys_f: list[float] = []
        ys_p: list[float] = []
        for utt in ids:
            row = scores.get(utt)
            if not isinstance(row, dict):
                continue
            vec = utterance_features(row)
            if vec is None:
                continue
            xs.append(vec)
            ys_f.append(float(row.get("fluency") or 0.0))
            ys_p.append(float(row.get("prosodic") or 0.0))
        return xs, ys_f, ys_p

    xt, flu_tr_list, pro_tr_list = stack(train_ids)
    xv, flu_te_list, pro_te_list = stack(test_ids)
    if not xt or not xv:
        raise RuntimeError("No overlapping scores for train or test split.")

    return (
        np.stack(xt),
        np.stack(xv),
        np.asarray(flu_tr_list, dtype=np.float64),
        np.asarray(flu_te_list, dtype=np.float64),
        np.asarray(pro_tr_list, dtype=np.float64),
        np.asarray(pro_te_list, dtype=np.float64),
    )


def _make_model(seed: int) -> HistGradientBoostingRegressor:
    return HistGradientBoostingRegressor(
        max_depth=8,
        learning_rate=0.05,
        max_iter=800,
        l2_regularization=0.1,
        min_samples_leaf=10,
        max_leaf_nodes=50,
        random_state=seed,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=50,
    )


def classify_stats(y_true: np.ndarray, y_pred: np.ndarray, threshold: float) -> dict:
    yt = (y_true >= threshold).astype(int)
    yp = (y_pred >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(yt, yp, labels=[0, 1]).ravel()
    out = {
        "accuracy": float(accuracy_score(yt, yp)),
        "precision": float(precision_score(yt, yp, zero_division=0)),
        "recall": float(recall_score(yt, yp, zero_division=0)),
        "f1": float(f1_score(yt, yp, zero_division=0)),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }
    if np.unique(yt).size > 1:
        try:
            out["roc_auc"] = float(roc_auc_score(yt, y_pred))
        except ValueError:
            out["roc_auc"] = float("nan")
    else:
        out["roc_auc"] = float("nan")
    return out


def evaluate_target(
    *,
    Xtr: np.ndarray,
    Xte: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    name: str,
    threshold: float,
) -> dict:
    model = _make_model(42 if name == "fluency" else 43)
    model.fit(Xtr, y_train)
    pred = model.predict(Xte)
    mae = float(mean_absolute_error(y_test, pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, pred)))
    r2 = float(r2_score(y_test, pred))
    clf = classify_stats(y_test, pred, threshold)
    return {
        "target": name,
        "holdout": {
            "regression": {"mae": mae, "rmse": rmse, "r2": r2},
            "classification": clf,
        },
    }


def run_cv(
    X: np.ndarray,
    y: np.ndarray,
    name: str,
    folds: int,
    threshold: float,
    seed0: int,
) -> dict:
    kf = KFold(n_splits=folds, shuffle=True, random_state=seed0)
    maes: list[float] = []
    rmses: list[float] = []
    r2s: list[float] = []
    accs: list[float] = []
    precs: list[float] = []
    recs: list[float] = []
    f1s: list[float] = []
    rocs: list[float] = []

    y_oof = np.zeros_like(y, dtype=np.float64)
    for fi, (tr, va) in enumerate(kf.split(X)):
        m = _make_model(seed0 + fi * 9973)
        m.fit(X[tr], y[tr])
        pv = m.predict(X[va])
        y_oof[va] = pv
        maes.append(float(mean_absolute_error(y[va], pv)))
        rmses.append(float(np.sqrt(mean_squared_error(y[va], pv))))
        r2s.append(float(r2_score(y[va], pv)))
        st = classify_stats(y[va], pv, threshold)
        accs.append(st["accuracy"])
        precs.append(st["precision"])
        recs.append(st["recall"])
        f1s.append(st["f1"])
        roc = st["roc_auc"]
        if np.isfinite(roc):
            rocs.append(roc)

    oof_clf = classify_stats(y, y_oof, threshold)
    roc_fold_mean = float(np.mean(rocs)) if rocs else float("nan")
    roc_fold_std = float(np.std(rocs)) if rocs else float("nan")

    return {
        "target": name,
        "folds": folds,
        "regression_fold_mean": {"mae": float(np.mean(maes)), "rmse": float(np.mean(rmses)), "r2": float(np.mean(r2s))},
        "regression_fold_std": {"mae": float(np.std(maes)), "rmse": float(np.std(rmses)), "r2": float(np.std(r2s))},
        "classification_fold_mean": {
            "accuracy": float(np.mean(accs)),
            "precision": float(np.mean(precs)),
            "recall": float(np.mean(recs)),
            "f1": float(np.mean(f1s)),
            "roc_auc": roc_fold_mean,
        },
        "classification_fold_std": {
            "accuracy": float(np.std(accs)),
            "precision": float(np.std(precs)),
            "recall": float(np.std(recs)),
            "f1": float(np.std(f1s)),
            "roc_auc": roc_fold_std,
        },
        "classification_oof": oof_clf,
    }


def fmt4(x: float) -> str:
    if not np.isfinite(x):
        return "nan"
    return f"{x:.4f}"


def fmt_pct(x: float) -> str:
    if not np.isfinite(x):
        return "nan"
    return f"{100.0 * x:.2f}%"


def cm_cell(d: dict) -> str:
    cm = d["confusion_matrix"]
    return f"{cm['tn']} / {cm['fp']} / {cm['fn']} / {cm['tp']}"


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--threshold", type=float, default=5.0)
    p.add_argument("--folds", type=int, default=10)
    p.add_argument("--json-out", type=Path, default=None)
    args = p.parse_args()

    repo = Path(__file__).resolve().parent.parent
    archive = repo / "archive"
    scores_path = archive / "resource" / "scores.json"
    train_ids = read_wav_scp_ids(archive / "train" / "wav.scp")
    test_ids = read_wav_scp_ids(archive / "test" / "wav.scp")

    scores = json.loads(scores_path.read_text(encoding="utf-8"))
    Xtr, Xte, y_flu_tr, y_flu_te, y_pro_tr, y_pro_te = build_matrices(scores=scores, train_ids=train_ids, test_ids=test_ids)

    X_full = np.vstack([Xtr, Xte])
    y_flu_full = np.concatenate([y_flu_tr, y_flu_te])
    y_pro_full = np.concatenate([y_pro_tr, y_pro_te])

    flu_h = evaluate_target(Xtr=Xtr, Xte=Xte, y_train=y_flu_tr, y_test=y_flu_te, name="fluency", threshold=args.threshold)
    pro_h = evaluate_target(Xtr=Xtr, Xte=Xte, y_train=y_pro_tr, y_test=y_pro_te, name="prosodic_tone", threshold=args.threshold)

    flu_cv = run_cv(X_full, y_flu_full, "fluency", args.folds, args.threshold, seed0=42)
    pro_cv = run_cv(X_full, y_pro_full, "prosodic_tone", args.folds, args.threshold, seed0=4242)

    results = {
        "evaluation_type": "tabular_scores_json_no_audio",
        "threshold": args.threshold,
        "feature_names": FEATURE_NAMES,
        "train_n": int(Xtr.shape[0]),
        "test_n": int(Xte.shape[0]),
        "fluency_holdout": flu_h["holdout"],
        "prosodic_holdout": pro_h["holdout"],
        "fluency_cv": flu_cv,
        "prosodic_cv": pro_cv,
    }

    json_out = args.json_out or (repo / "backend" / "data" / "ml_evaluation_tabular_scores_results.json")
    json_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(results, indent=2), encoding="utf-8")

    print(json.dumps(results, indent=2))
    print("\n--- Markdown tables (paste into COMPLETE_PROJECT_REPORT.md) ---\n", file=sys.stderr)

    fh = flu_h["holdout"]["classification"]
    ph = pro_h["holdout"]["classification"]

    print(
        "| Metric | Fluency (**>= 5** rule) | Prosodic/tone (**>= 5** rule) |\n"
        "|--------|-------------------------|--------------------------------|\n"
        f"| Accuracy | {fmt_pct(fh['accuracy'])} | {fmt_pct(ph['accuracy'])} |\n"
        f"| Precision | {fmt4(fh['precision'])} | {fmt4(ph['precision'])} |\n"
        f"| Recall | {fmt4(fh['recall'])} | {fmt4(ph['recall'])} |\n"
        f"| F1 | {fmt4(fh['f1'])} | {fmt4(ph['f1'])} |\n"
        f"| ROC-AUC | {fmt4(fh['roc_auc'])} | {fmt4(ph['roc_auc'])} |\n"
        f"| Confusion (TN / FP / FN / TP) | {cm_cell(fh)} | {cm_cell(ph)} |\n",
        file=sys.stderr,
    )

    fcm = flu_cv["classification_fold_mean"]
    pcm = pro_cv["classification_fold_mean"]
    fcs = flu_cv["classification_fold_std"]
    pcs = pro_cv["classification_fold_std"]
    frm = flu_cv["regression_fold_mean"]
    prm = pro_cv["regression_fold_mean"]
    frs = flu_cv["regression_fold_std"]
    prs = pro_cv["regression_fold_std"]

    print(
        "**10-fold (tabular, merged train+test)** — mean ± std:\n\n"
        "| Target | MAE | RMSE | R² | Accuracy | Precision | Recall | F1 | ROC-AUC |\n"
        "|--------|-----|------|----|---------|-----------|-------|----|---------|\n"
        f"| Fluency | {fmt4(frm['mae'])} ± {fmt4(frs['mae'])} | {fmt4(frm['rmse'])} ± {fmt4(frs['rmse'])} | "
        f"{fmt4(frm['r2'])} ± {fmt4(frs['r2'])} | "
        f"{fmt_pct(fcm['accuracy'])} ± {fmt4(fcs['accuracy'])} | "
        f"{fmt4(fcm['precision'])} ± {fmt4(fcs['precision'])} | "
        f"{fmt4(fcm['recall'])} ± {fmt4(fcs['recall'])} | "
        f"{fmt4(fcm['f1'])} ± {fmt4(fcs['f1'])} | "
        f"{fmt4(fcm['roc_auc'])} ± {fmt4(fcs['roc_auc'])} |\n"
        f"| Prosodic/tone | {fmt4(prm['mae'])} ± {fmt4(prs['mae'])} | {fmt4(prm['rmse'])} ± {fmt4(prs['rmse'])} | "
        f"{fmt4(prm['r2'])} ± {fmt4(prs['r2'])} | "
        f"{fmt_pct(pcm['accuracy'])} ± {fmt4(pcs['accuracy'])} | "
        f"{fmt4(pcm['precision'])} ± {fmt4(pcs['precision'])} | "
        f"{fmt4(pcm['recall'])} ± {fmt4(pcs['recall'])} | "
        f"{fmt4(pcm['f1'])} ± {fmt4(pcs['f1'])} | "
        f"{fmt4(pcm['roc_auc'])} ± {fmt4(pcs['roc_auc'])} |\n",
        file=sys.stderr,
    )

    fo = flu_cv["classification_oof"]
    po = pro_cv["classification_oof"]
    print(
        "**Pooled OOF confusion (10-fold, all samples):** Fluency TN/FP/FN/TP = "
        f"{cm_cell(fo)}; Prosodic TN/FP/FN/TP = {cm_cell(po)}.\n",
        file=sys.stderr,
    )
    print(f"\nWrote: {json_out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

