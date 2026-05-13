"""
Class-imbalance study for high-vs-low bands (tabular scores.json pathway).

Computes train-set class proportions, compares classifiers **before vs after SMOTE**
(only on **training** data; **test set never augmented**).

Dependencies: `pip install imbalanced-learn` (see backend/requirements.txt).

Example:
    cd backend
    python evaluate_imbalance_smote_models.py --target fluency --threshold 5
"""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Callable
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from evaluate_ml_tabular_scores import build_matrices, read_wav_scp_ids

try:
    from imblearn.over_sampling import SMOTE
except ImportError:  # pragma: no cover
    SMOTE = None


def metrics_block(y_te: np.ndarray, proba: np.ndarray | None, pred: np.ndarray) -> dict:
    """Standard metrics vs positive class (= high band label 1); plus recall on **class 0** (low band)."""
    acc = float(accuracy_score(y_te, pred))
    prec = float(precision_score(y_te, pred, zero_division=0))
    rec_hi = float(recall_score(y_te, pred, zero_division=0))
    f1 = float(f1_score(y_te, pred, zero_division=0))
    auc_val = float("nan")
    if proba is not None and np.unique(y_te).size > 1:
        try:
            auc_val = float(roc_auc_score(y_te, proba))
        except ValueError:
            pass
    tn, fp, fn, tp = confusion_matrix(y_te, pred, labels=[0, 1]).ravel()
    actual_low = tn + fn
    recall_low_band = float(tn / actual_low) if actual_low > 0 else 0.0
    return {
        "accuracy": acc,
        "precision_positive_high_band": prec,
        "recall_positive_high_band": rec_hi,
        "recall_negative_low_band": recall_low_band,
        "f1_positive": f1,
        "roc_auc": auc_val,
        "confusion_tn_fp_fn_tp": [int(tn), int(fp), int(fn), int(tp)],
    }


def _proba_positive(clf: Any, X: np.ndarray) -> np.ndarray | None:
    if hasattr(clf, "predict_proba"):
        p = clf.predict_proba(X)
        return np.asarray(p[:, 1], dtype=np.float64)
    if hasattr(clf, "decision_function"):
        d = clf.decision_function(X)
        from scipy.special import expit

        return expit(np.asarray(d, dtype=np.float64))
    return None


def run_case(
    name: str,
    build_clf: Callable[[int], Any],
    Xtr: np.ndarray,
    ytr: np.ndarray,
    Xte: np.ndarray,
    yte: np.ndarray,
    *,
    seed: int,
    smote: Any,
) -> dict:
    clf = build_clf(seed)
    clf.fit(Xtr, ytr)
    pred = clf.predict(Xte)
    proba = _proba_positive(clf, Xte)
    out_before = metrics_block(yte, proba, pred)

    row_smote = None
    if smote is not None:
        Xs, ys = smote.fit_resample(Xtr, ytr)
        clf2 = build_clf(seed + 99)
        clf2.fit(Xs, ys)
        pred2 = clf2.predict(Xte)
        proba2 = _proba_positive(clf2, Xte)
        row_smote = {
            "train_shape_after_SMOTE": [int(Xs.shape[0]), int(Xs.shape[1])],
            **metrics_block(yte, proba2, pred2),
        }

    return {
        "model": name,
        "test_metrics_no_SMOTE": out_before,
        "test_metrics_with_SMOTE": row_smote,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", choices=["fluency", "prosodic"], default="fluency")
    ap.add_argument("--threshold", type=float, default=5.0)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--json-out", type=str, default="")
    args = ap.parse_args()

    repo = Path(__file__).resolve().parent.parent
    archive = repo / "archive"
    scores = json.loads((archive / "resource" / "scores.json").read_text(encoding="utf-8"))
    Xtr, Xte, flu_tr, flu_te, pro_tr, pro_te = build_matrices(
        scores=scores,
        train_ids=read_wav_scp_ids(archive / "train" / "wav.scp"),
        test_ids=read_wav_scp_ids(archive / "test" / "wav.scp"),
    )
    if args.target == "fluency":
        y_cont_tr, y_cont_te = flu_tr, flu_te
    else:
        y_cont_tr, y_cont_te = pro_tr, pro_te

    ytr = (y_cont_tr >= args.threshold).astype(int)
    yte = (y_cont_te >= args.threshold).astype(int)
    cnt0_tr = int((ytr == 0).sum())
    cnt1_tr = int((ytr == 1).sum())
    cnt0_te = int((yte == 0).sum())
    cnt1_te = int((yte == 1).sum())
    imb_ratio_tr = cnt1_tr / max(cnt0_tr, 1)

    minority_n = min(cnt0_tr, cnt1_tr)
    k_neighbors = max(1, min(5, minority_n - 1)) if minority_n > 1 else 1

    smote: SMOTE | None = None
    if SMOTE is None:
        print("WARNING: imbalanced-learn not installed. Run: pip install imbalanced-learn", file=sys.stderr)
    else:
        smote = SMOTE(random_state=args.seed, k_neighbors=k_neighbors)

    def hgb(seed: int) -> HistGradientBoostingClassifier:
        return HistGradientBoostingClassifier(
            max_depth=6,
            learning_rate=0.08,
            max_iter=300,
            l2_regularization=0.1,
            random_state=seed,
            class_weight="balanced",
        )

    def rf(seed: int) -> RandomForestClassifier:
        return RandomForestClassifier(
            n_estimators=300,
            max_depth=14,
            min_samples_leaf=3,
            random_state=seed,
            class_weight="balanced_subsample",
            n_jobs=-1,
        )

    def logreg(seed: int) -> LogisticRegression:
        return LogisticRegression(
            max_iter=3000,
            random_state=seed,
            class_weight="balanced",
        )

    results = {
        "target": args.target,
        "threshold": args.threshold,
        "binary_classes": {"0_low_band": ">= threshold false", "1_high_band": ">= threshold true"},
        "train_distribution": {"class_0": cnt0_tr, "class_1": cnt1_tr, "maj_min_ratio_about": round(imb_ratio_tr, 3)},
        "test_distribution": {"class_0": cnt0_te, "class_1": cnt1_te},
        "smote_k_neighbors": k_neighbors if smote is not None else None,
        "imbalance_handling_desc": (
            "Class imbalance addressed by reporting minority-sensitive metrics on a fixed held-out "
            "set; classifier training optionally uses sklearn class_weight=balanced (+ balanced_subsample RF). "
            "SMOTE enlarges minority in training only via synthetic interpolated samples."
        ),
        "runs": [
            run_case("HistGradientBoostingClassifier+balanced", hgb, Xtr, ytr, Xte, yte, seed=args.seed, smote=smote),
            run_case(
                "RandomForestClassifier+balanced_subsample", rf, Xtr, ytr, Xte, yte, seed=args.seed + 1, smote=smote
            ),
            run_case("LogisticRegression+balanced", logreg, Xtr, ytr, Xte, yte, seed=args.seed + 2, smote=smote),
        ],
    }

    if smote is not None:
        Xs, ys = smote.fit_resample(Xtr, ytr)
        results["train_shape_after_SMOTE_preview"] = {
            "samples": int(Xs.shape[0]),
            "class_0_after": int((ys == 0).sum()),
            "class_1_after": int((ys == 1).sum()),
        }

    out_path = (
        repo / "backend" / "data" / "ml_imbalance_smote_model_compare.json"
        if not args.json_out
        else Path(args.json_out)
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

    print(json.dumps(results, indent=2))
    print(f"\nWrote {out_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
