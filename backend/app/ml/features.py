from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass(frozen=True)
class FeatureVector:
    names: list[str]
    values: np.ndarray  # shape: (n_features,)


def _safe_mean(x: np.ndarray) -> float:
    if x.size == 0:
        return 0.0
    return float(np.nanmean(x))


def _safe_std(x: np.ndarray) -> float:
    if x.size == 0:
        return 0.0
    return float(np.nanstd(x))


def _stats(prefix: str, x: np.ndarray) -> tuple[list[str], list[float]]:
    return (
        [f"{prefix}_mean", f"{prefix}_std"],
        [_safe_mean(x), _safe_std(x)],
    )


def _pctl_range(x: np.ndarray, lo: float = 5.0, hi: float = 95.0) -> float:
    if x.size == 0:
        return 0.0
    x = x[np.isfinite(x)]
    if x.size == 0:
        return 0.0
    return float(np.percentile(x, hi) - np.percentile(x, lo))


def extract_audio_features(
    *,
    audio_path: str,
    sr: int = 16000,
    n_mfcc: int = 13,
) -> FeatureVector:
    """
    Librosa-based tabular features for scikit-learn models.

    Returns a fixed-order 1D feature vector with matching `names`.
    """
    import librosa

    y, _ = librosa.load(audio_path, sr=sr, mono=True)
    if y.size == 0:
        return FeatureVector(names=["empty"], values=np.array([1.0], dtype=np.float32))

    names: list[str] = []
    vals: list[float] = []

    # RMS energy
    rms = librosa.feature.rms(y=y)[0]
    n, v = _stats("rms", rms)
    names += n
    vals += v
    names.append("rms_p95_p5_range")
    vals.append(_pctl_range(rms))

    # Spectral features
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)[0]
    for feat_name, feat in [("spec_centroid", centroid), ("spec_bandwidth", bandwidth), ("spec_rolloff", rolloff)]:
        n, v = _stats(feat_name, feat)
        names += n
        vals += v

    # Zero-crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    n, v = _stats("zcr", zcr)
    names += n
    vals += v

    # MFCC + delta MFCC
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    d_mfcc = librosa.feature.delta(mfcc)
    for i in range(n_mfcc):
        n, v = _stats(f"mfcc{i+1}", mfcc[i])
        names += n
        vals += v
        n, v = _stats(f"dmfcc{i+1}", d_mfcc[i])
        names += n
        vals += v

    # Pitch (F0) using YIN (faster than pYIN for large-scale training)
    try:
        f0 = librosa.yin(
            y,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sr,
        )
        f0 = np.asarray(f0, dtype=np.float32)
        f0_voiced = f0[np.isfinite(f0) & (f0 > 0)]
        n, v = _stats("f0", f0_voiced)
        names += n
        vals += v
        names.append("f0_range")
        vals.append(float(np.nanmax(f0_voiced) - np.nanmin(f0_voiced)) if f0_voiced.size else 0.0)
        names.append("voiced_ratio")
        vals.append(float(f0_voiced.size / max(f0.size, 1)))
    except Exception:
        names += ["f0_mean", "f0_std", "f0_range", "voiced_ratio"]
        vals += [0.0, 0.0, 0.0, 0.0]

    return FeatureVector(names=names, values=np.asarray(vals, dtype=np.float32))


def ensure_feature_order(vec: FeatureVector, feature_names: Iterable[str]) -> np.ndarray:
    """
    Reorder a FeatureVector to match `feature_names`.
    Missing features become 0.0.
    Extra features are ignored.
    """
    idx = {n: i for i, n in enumerate(vec.names)}
    # feature_names might be a generator; materialize once
    names_list = list(feature_names)
    out = np.zeros((len(names_list),), dtype=np.float32)
    for j, name in enumerate(names_list):
        i = idx.get(name)
        out[j] = float(vec.values[i]) if i is not None else 0.0
    return out

