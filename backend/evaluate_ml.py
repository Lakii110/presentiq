"""
Evaluation for PresentIQ scoring models: held-out split + optional 10-fold CV.

Held-out evaluation (matches train_models.py):
  Train on NPZ ``Xtr``, test on ``Xte``, report regression (MAE, RMSE, R²)
  plus classification metrics at a binary threshold.

Classification labels (supervisor-friendly):
  Positive = score >= ``--threshold`` (default 5.0) on the 0–10 label scale.

10-fold CV (optional):
  Merge train+test rows, KFold, out-of-fold predictions; report mean±std per fold
  and pooled OOF confusion counts.

Real data: requires ``backend/data/ml_cache_speechocean_features.npz`` from
``python train_models.py`` (with WAV files under ``archive/``).

Smoke test (no audio):
  python evaluate_ml.py --synthetic-samples 800 --fast

Typical (fast metrics on real cache):
  cd backend && python evaluate_ml.py

Full rubric (add 10-fold):
  cd backend && python evaluate_ml.py --cv
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass
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


@dataclass
class FoldRegression:
    fold: int
    mae: float
    rmse: float
    r2: float


@dataclass
class FoldClassification:
    fold: int
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float
    tn: int
    fp: int
    fn: int
    tp: int


def _make_regressor(random_state: int) -> HistGradientBoostingRegressor:
    return HistGradientBoostingRegressor(
        max_depth=8,
        learning_rate=0.05,
        max_iter=800,
        l2_regularization=0.1,
        min_samples_leaf=10,
        max_leaf_nodes=50,
        random_state=random_state,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=50,
    )


def _fast_regressor(random_state: int) -> HistGradientBoostingRegressor:
    return HistGradientBoostingRegressor(
        max_depth=6,
        learning_rate=0.08,
        max_iter=200,
        l2_regularization=0.1,
        min_samples_leaf=10,
        max_leaf_nodes=40,
        random_state=random_state,
        early_stopping=True,
        validation_fraction=0.15,
        n_iter_no_change=20,
    )


def load_npz_split(path: Path) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    cached = np.load(path, allow_pickle=False)
    Xtr = cached["Xtr"].astype(np.float64)
    Xte = cached["Xte"].astype(np.float64)
    y_flu_tr = cached["y_flu_train"].astype(np.float64)
    y_flu_te = cached["y_flu_test"].astype(np.float64)
    y_pro_tr = cached["y_pro_train"].astype(np.float64)
    y_pro_te = cached["y_pro_test"].astype(np.float64)
    return Xtr, Xte, y_flu_tr, y_flu_te, y_pro_tr, y_pro_te


def merge_splits(
    Xtr: np.ndarray,
    Xte: np.ndarray,
    y_flu_tr: np.ndarray,
    y_flu_te: np.ndarray,
    y_pro_tr: np.ndarray,
    y_pro_te: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    X = np.vstack([Xtr, Xte])
    y_flu = np.concatenate([y_flu_tr, y_flu_te])
    y_pro = np.concatenate([y_pro_tr, y_pro_te])
    return X, y_flu, y_pro


def build_synthetic(
    *,
    n_samples: int,
    n_features: int,
    rng: np.random.Generator,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Correlated-ish toy data only for smoke tests."""
    X = rng.standard_normal((n_samples, n_features)).astype(np.float64)
    w_f = rng.standard_normal(n_features)
    w_p = rng.standard_normal(n_features)
    noise_f = rng.standard_normal(n_samples) * 1.2
    noise_p = rng.standard_normal(n_samples) * 1.2
    flu = np.clip(X @ w_f / n_features ** 0.5 + noise_f + 5.0, 0.0, 10.0)
    pro = np.clip(X @ w_p / n_features ** 0.5 + noise_p + 5.0, 0.0, 10.0)
    return X, flu.astype(np.float64), pro.astype(np.float64)


def eval_holdout(
    *,
    Xtr: np.ndarray,
    Xte: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    name: str,
    threshold: float,
    random_state: int,
    fast: bool,
) -> dict:
    reg = _fast_regressor(random_state) if fast else _make_regressor(random_state)
    reg.fit(Xtr, y_train)
    pred = reg.predict(Xte)
    mae = float(mean_absolute_error(y_test, pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, pred)))
    r2 = float(r2_score(y_test, pred))

    y_bin_true = (y_test >= threshold).astype(int)
    y_bin_pred = (pred >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_bin_true, y_bin_pred, labels=[0, 1]).ravel()
    acc = float(accuracy_score(y_bin_true, y_bin_pred))
    prec = float(precision_score(y_bin_true, y_bin_pred, zero_division=0))
    rec = float(recall_score(y_bin_true, y_bin_pred, zero_division=0))
    f1 = float(f1_score(y_bin_true, y_bin_pred, zero_division=0))
    auc = float("nan")
    if np.unique(y_bin_true).size > 1:
        try:
            auc = float(roc_auc_score(y_bin_true, pred))
        except ValueError:
            auc = float("nan")

    return {
        "target": name,
        "regression": {"mae": mae, "rmse": rmse, "r2": r2},
        "classification": {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
            "roc_auc": auc,
            "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        },
    }


def run_cv(
    *,
    X: np.ndarray,
    y: np.ndarray,
    name: str,
    folds: int,
    threshold: float,
    rng_base_seed: int,
    fast: bool,
) -> dict:
    kf = KFold(n_splits=folds, shuffle=True, random_state=rng_base_seed)
    reg_rows: list[FoldRegression] = []
    clf_rows: list[FoldClassification] = []

    y_true_all = y.copy()
    y_pred_oof = np.zeros_like(y, dtype=np.float64)

    for fold_idx, (train_idx, val_idx) in enumerate(kf.split(X)):
        seed = rng_base_seed + fold_idx * 9973
        reg = _fast_regressor(seed) if fast else _make_regressor(seed)
        reg.fit(X[train_idx], y[train_idx])
        pred = reg.predict(X[val_idx])
        y_pred_oof[val_idx] = pred

        mae = float(mean_absolute_error(y[val_idx], pred))
        rmse = float(np.sqrt(mean_squared_error(y[val_idx], pred)))
        r2 = float(r2_score(y[val_idx], pred))

        y_bin_true = (y[val_idx] >= threshold).astype(int)
        y_bin_pred = (pred >= threshold).astype(int)

        tn, fp, fn, tp = confusion_matrix(y_bin_true, y_bin_pred, labels=[0, 1]).ravel()

        acc = float(accuracy_score(y_bin_true, y_bin_pred))
        prec = float(precision_score(y_bin_true, y_bin_pred, zero_division=0))
        rec = float(recall_score(y_bin_true, y_bin_pred, zero_division=0))
        f1 = float(f1_score(y_bin_true, y_bin_pred, zero_division=0))

        uniq = np.unique(y_bin_true)
        if uniq.size > 1:
            try:
                auc = float(roc_auc_score(y_bin_true, pred))
            except ValueError:
                auc = float("nan")
        else:
            auc = float("nan")

        reg_rows.append(FoldRegression(fold=fold_idx + 1, mae=mae, rmse=rmse, r2=r2))
        clf_rows.append(
            FoldClassification(
                fold=fold_idx + 1,
                accuracy=acc,
                precision=prec,
                recall=rec,
                f1=f1,
                roc_auc=auc,
                tn=int(tn),
                fp=int(fp),
                fn=int(fn),
                tp=int(tp),
            )
        )

    mean_reg = lambda k: float(np.nanmean([getattr(r, k) for r in reg_rows]))  # noqa: E731
    std_reg = lambda k: float(np.nanstd([getattr(r, k) for r in reg_rows]))  # noqa: E731

    roc_vals = np.asarray([r.roc_auc for r in clf_rows], dtype=np.float64)
    roc_finite = roc_vals[np.isfinite(roc_vals)]

    y_bin_full_true = (y_true_all >= threshold).astype(int)
    y_bin_full_pred = (y_pred_oof >= threshold).astype(int)
    cm = confusion_matrix(y_bin_full_true, y_bin_full_pred, labels=[0, 1])
    tn_p, fp_p, fn_p, tp_p = cm.ravel()
    pooled_acc = float(accuracy_score(y_bin_full_true, y_bin_full_pred))
    pooled_prec = float(precision_score(y_bin_full_true, y_bin_full_pred, zero_division=0))
    pooled_rec = float(recall_score(y_bin_full_true, y_bin_full_pred, zero_division=0))
    pooled_f1 = float(f1_score(y_bin_full_true, y_bin_full_pred, zero_division=0))
    pooled_auc = float("nan")
    if np.unique(y_bin_full_true).size > 1:
        try:
            pooled_auc = float(roc_auc_score(y_bin_full_true, y_pred_oof))
        except ValueError:
            pooled_auc = float("nan")

    return {
        "target": name,
        "threshold": threshold,
        "folds": folds,
        "regression_fold_mean": {"mae": mean_reg("mae"), "rmse": mean_reg("rmse"), "r2": mean_reg("r2")},
        "regression_fold_std": {"mae": std_reg("mae"), "rmse": std_reg("rmse"), "r2": std_reg("r2")},
        "regression_fold_details": [asdict(r) for r in reg_rows],
        "classification_fold_mean": {
            "accuracy": float(np.nanmean([r.accuracy for r in clf_rows])),
            "precision": float(np.nanmean([r.precision for r in clf_rows])),
            "recall": float(np.nanmean([r.recall for r in clf_rows])),
            "f1": float(np.nanmean([r.f1 for r in clf_rows])),
            "roc_auc": float(np.nanmean(roc_finite)) if roc_finite.size else float("nan"),
        },
        "classification_fold_std": {
            "accuracy": float(np.nanstd([r.accuracy for r in clf_rows])),
            "precision": float(np.nanstd([r.precision for r in clf_rows])),
            "recall": float(np.nanstd([r.recall for r in clf_rows])),
            "f1": float(np.nanstd([r.f1 for r in clf_rows])),
            "roc_auc": float(np.nanstd(roc_finite)) if roc_finite.size else float("nan"),
        },
        "classification_fold_details": [asdict(r) for r in clf_rows],
        "classification_oof": {
            "accuracy": pooled_acc,
            "precision": pooled_prec,
            "recall": pooled_rec,
            "f1": pooled_f1,
            "roc_auc": pooled_auc,
            "confusion_matrix": {"tn": int(tn_p), "fp": int(fp_p), "fn": int(fn_p), "tp": int(tp_p)},
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="PresentIQ ML evaluation (held-out split + optional 10-fold CV).")
    parser.add_argument(
        "--cache",
        type=Path,
        default=None,
        help="Path to ml_cache_speechocean_features.npz",
    )
    parser.add_argument(
        "--cv",
        action="store_true",
        help="Run k-fold cross-validation on merged train+test samples (slow on full data).",
    )
    parser.add_argument("--folds", type=int, default=10)
    parser.add_argument(
        "--threshold",
        type=float,
        default=5.0,
        help="Binary rule: class 1 if score >= threshold (default 5.0 on 0–10 labels).",
    )
    parser.add_argument("--json-out", type=Path, default=None)
    parser.add_argument(
        "--synthetic-samples",
        type=int,
        default=0,
        help="If >0, ignore cache; run CV-only smoke test on synthetic data.",
    )
    parser.add_argument("--fast", action="store_true", help="Smaller trees. Env EVAL_FAST=1 also enables.")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    cache_path = args.cache or (repo_root / "backend" / "data" / "ml_cache_speechocean_features.npz")
    json_out = args.json_out or (repo_root / "backend" / "data" / "ml_evaluation_results.json")

    fast = args.fast or os.environ.get("EVAL_FAST", "") == "1"
    rng = np.random.default_rng(42)
    synthetic = args.synthetic_samples > 0

    results: dict = {
        "threshold": args.threshold,
        "fast_mode": fast,
        "binary_rule": f"Positive (class 1) if label >= {args.threshold} on 0–10 scale; same rule on predictions.",
    }

    if synthetic:
        schema_path = repo_root / "backend" / "data" / "ml_artifacts" / "feature_schema.json"
        n_feat = len(json.loads(schema_path.read_text(encoding="utf-8"))["feature_names"])
        X, y_flu, y_pro = build_synthetic(n_samples=args.synthetic_samples, n_features=n_feat, rng=rng)
        results["data_note"] = (
            f"synthetic_n={args.synthetic_samples}, feature_dim={n_feat}; not SpeechOcean762 — smoke test only"
        )
        results["synthetic"] = True
        results["samples"] = int(X.shape[0])
        results["cross_validation_only"] = True
        results["cross_validation"] = {
            "fluency": run_cv(
                X=X,
                y=y_flu,
                name="fluency",
                folds=args.folds,
                threshold=args.threshold,
                rng_base_seed=42,
                fast=fast,
            ),
            "prosodic_tone": run_cv(
                X=X,
                y=y_pro,
                name="prosodic_tone",
                folds=args.folds,
                threshold=args.threshold,
                rng_base_seed=4242,
                fast=fast,
            ),
        }
    else:
        if not cache_path.is_file():
            print(
                f"Missing feature cache: {cache_path}\n"
                "Generate it with WAV audio under archive/:\n"
                "  cd backend && python train_models.py\n"
                "\nSmoke test:\n"
                "  python evaluate_ml.py --synthetic-samples 800 --fast\n",
                file=sys.stderr,
            )
            return 1

        results["data_note"] = str(cache_path.resolve())
        results["synthetic"] = False

        Xtr, Xte, y_flu_tr, y_flu_te, y_pro_tr, y_pro_te = load_npz_split(cache_path)

        results["holdout_original_split"] = {
            "description": (
                "Trained on NPZ train split, evaluated on NPZ test split (same convention as train_models.py)."
            ),
            "train_n": int(Xtr.shape[0]),
            "test_n": int(Xte.shape[0]),
            "features": int(Xtr.shape[1]),
            "fluency": eval_holdout(
                Xtr=Xtr,
                Xte=Xte,
                y_train=y_flu_tr,
                y_test=y_flu_te,
                name="fluency",
                threshold=args.threshold,
                random_state=42,
                fast=fast,
            ),
            "prosodic_tone": eval_holdout(
                Xtr=Xtr,
                Xte=Xte,
                y_train=y_pro_tr,
                y_test=y_pro_te,
                name="prosodic_tone",
                threshold=args.threshold,
                random_state=43,
                fast=fast,
            ),
        }

        if args.cv:
            X, y_flu, y_pro = merge_splits(Xtr, Xte, y_flu_tr, y_flu_te, y_pro_tr, y_pro_te)
            results["cross_validation"] = {
                "merged_n": int(X.shape[0]),
                "folds": args.folds,
                "fluency": run_cv(
                    X=X,
                    y=y_flu,
                    name="fluency",
                    folds=args.folds,
                    threshold=args.threshold,
                    rng_base_seed=42,
                    fast=fast,
                ),
                "prosodic_tone": run_cv(
                    X=X,
                    y=y_pro,
                    name="prosodic_tone",
                    folds=args.folds,
                    threshold=args.threshold,
                    rng_base_seed=4242,
                    fast=fast,
                ),
            }

    json_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))
    print(f"\nWrote: {json_out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
