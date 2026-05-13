from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

from app.ml.features import extract_audio_features


@dataclass(frozen=True)
class Example:
    utt_id: str
    wav_rel: str
    split: str  # "train" | "test"


def read_wav_scp(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        utt, wav = line.split(maxsplit=1)
        out[utt] = wav.strip()
    return out


def load_scores(scores_path: Path) -> dict[str, dict]:
    return json.loads(scores_path.read_text(encoding="utf-8"))


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    archive = repo_root / "archive"
    cache_path = repo_root / "backend" / "data" / "ml_cache_speechocean_features.npz"
    scores_path = archive / "resource" / "scores.json"
    scores = load_scores(scores_path)

    train_wavs = read_wav_scp(archive / "train" / "wav.scp")
    test_wavs = read_wav_scp(archive / "test" / "wav.scp")

    examples: list[Example] = []
    for utt, wav in train_wavs.items():
        examples.append(Example(utt_id=utt, wav_rel=wav, split="train"))
    for utt, wav in test_wavs.items():
        examples.append(Example(utt_id=utt, wav_rel=wav, split="test"))

    # Build feature schema from first available audio
    first = next(e for e in examples if (archive / e.wav_rel).exists())
    schema_vec = extract_audio_features(audio_path=str(archive / first.wav_rel))
    feature_names = schema_vec.names

    def featurize(ex: Example) -> np.ndarray:
        vec = extract_audio_features(audio_path=str(archive / ex.wav_rel))
        # Ensure consistent order by using schema names (missing -> 0)
        idx = {n: i for i, n in enumerate(vec.names)}
        x = np.zeros((len(feature_names),), dtype=np.float32)
        for j, name in enumerate(feature_names):
            i = idx.get(name)
            x[j] = float(vec.values[i]) if i is not None else 0.0
        return x

    X_train: list[np.ndarray] = []
    y_flu_train: list[float] = []
    y_pro_train: list[float] = []

    X_test: list[np.ndarray] = []
    y_flu_test: list[float] = []
    y_pro_test: list[float] = []

    valid: list[Example] = []
    skipped = 0
    for ex in examples:
        if ex.utt_id not in scores:
            skipped += 1
            continue
        if not (archive / ex.wav_rel).exists():
            skipped += 1
            continue
        valid.append(ex)

    # Feature extraction (reliable on Windows). If you want parallelism,
    # set N_JOBS=2 or N_JOBS=4 in the environment.
    n_jobs = int(os.environ.get("N_JOBS", "1"))
    print(f"Featurizing {len(valid)} utterances with n_jobs={n_jobs} ...")

    def handle(ex: Example) -> None:
        item = scores[ex.utt_id]
        x = featurize(ex)
        flu = float(item.get("fluency", 0.0))
        pro = float(item.get("prosodic", 0.0))
        if ex.split == "train":
            X_train.append(x)
            y_flu_train.append(flu)
            y_pro_train.append(pro)
        else:
            X_test.append(x)
            y_flu_test.append(flu)
            y_pro_test.append(pro)

    if n_jobs <= 1:
        for i, ex in enumerate(valid, start=1):
            handle(ex)
            if i % 100 == 0:
                print(f"  featurized {i}/{len(valid)}")
    else:
        from joblib import Parallel, delayed

        def one(ex: Example) -> tuple[str, np.ndarray, float, float]:
            item = scores[ex.utt_id]
            x = featurize(ex)
            flu = float(item.get("fluency", 0.0))
            pro = float(item.get("prosodic", 0.0))
            return ex.split, x, flu, pro

        rows = Parallel(n_jobs=n_jobs, backend="loky", batch_size=16)(delayed(one)(ex) for ex in valid)
        for split, x, flu, pro in rows:
            if split == "train":
                X_train.append(x)
                y_flu_train.append(flu)
                y_pro_train.append(pro)
            else:
                X_test.append(x)
                y_flu_test.append(flu)
                y_pro_test.append(pro)

    # Cache features to avoid recomputing (feature extraction is the slow part)
    use_cache = os.environ.get("USE_CACHE", "1") == "1"
    if use_cache and cache_path.exists():
        cached = np.load(cache_path, allow_pickle=False)
        Xtr = cached["Xtr"]
        Xte = cached["Xte"]
        y_flu_train = cached["y_flu_train"].tolist()
        y_pro_train = cached["y_pro_train"].tolist()
        y_flu_test = cached["y_flu_test"].tolist()
        y_pro_test = cached["y_pro_test"].tolist()
        feature_names = json.loads((cached["feature_names_json"].tobytes()).decode("utf-8"))
        print(f"Loaded cached features from: {cache_path}")
    else:
        Xtr = np.stack(X_train, axis=0)
        Xte = np.stack(X_test, axis=0)
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(
            cache_path,
            Xtr=Xtr,
            Xte=Xte,
            y_flu_train=np.asarray(y_flu_train, dtype=np.float32),
            y_pro_train=np.asarray(y_pro_train, dtype=np.float32),
            y_flu_test=np.asarray(y_flu_test, dtype=np.float32),
            y_pro_test=np.asarray(y_pro_test, dtype=np.float32),
            feature_names_json=np.frombuffer(json.dumps(feature_names).encode("utf-8"), dtype=np.uint8),
        )
        print(f"Saved cached features to: {cache_path}")

    flu_model = HistGradientBoostingRegressor(
        max_depth=8,
        learning_rate=0.05,
        max_iter=800,
        l2_regularization=0.1,
        min_samples_leaf=10,
        max_leaf_nodes=50,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=50,
    )
    tone_model = HistGradientBoostingRegressor(
        max_depth=8,
        learning_rate=0.05,
        max_iter=800,
        l2_regularization=0.1,
        min_samples_leaf=10,
        max_leaf_nodes=50,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=50,
    )

    flu_model.fit(Xtr, np.asarray(y_flu_train))
    tone_model.fit(Xtr, np.asarray(y_pro_train))

    def report(name: str, y_true: list[float], y_pred: np.ndarray) -> None:
        mae = mean_absolute_error(y_true, y_pred)
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        print(f"{name}: MAE={mae:.3f} RMSE={rmse:.3f}")

    flu_pred = flu_model.predict(Xte)
    tone_pred = tone_model.predict(Xte)
    report("fluency", y_flu_test, flu_pred)
    report("prosodic", y_pro_test, tone_pred)
    print(f"examples train={len(X_train)} test={len(X_test)} skipped={skipped}")

    artifacts_dir = repo_root / "backend" / "data" / "ml_artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(flu_model, artifacts_dir / "fluency_model.pkl")
    joblib.dump(tone_model, artifacts_dir / "tone_model.pkl")
    (artifacts_dir / "feature_schema.json").write_text(
        json.dumps({"feature_names": feature_names}, indent=2),
        encoding="utf-8",
    )
    print(f"Saved artifacts to: {artifacts_dir}")


if __name__ == "__main__":
    # Ensure we run from backend venv if available (optional)
    os.environ.setdefault("PYTHONHASHSEED", "0")
    main()

