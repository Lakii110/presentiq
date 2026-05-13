from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.ml.features import ensure_feature_order, extract_audio_features

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SpeechSkillPredictions:
    fluency_0_100: int
    tone_0_100: int


class ModelNotReady(RuntimeError):
    pass


class SpeechSkillModelBundle:
    def __init__(self, *, fluency_model: Any, tone_model: Any, feature_names: list[str]):
        self.fluency_model = fluency_model
        self.tone_model = tone_model
        self.feature_names = feature_names

    @classmethod
    def load_from_dir(cls, artifacts_dir: str | Path) -> "SpeechSkillModelBundle":
        artifacts_dir = Path(artifacts_dir)
        meta_path = artifacts_dir / "feature_schema.json"
        fluency_path = artifacts_dir / "fluency_model.pkl"
        tone_path = artifacts_dir / "tone_model.pkl"
        if not meta_path.exists() or not fluency_path.exists() or not tone_path.exists():
            raise ModelNotReady(f"Missing model artifacts in {artifacts_dir}")
        feature_names = json.loads(meta_path.read_text(encoding="utf-8"))["feature_names"]
        fluency_model = joblib.load(fluency_path)
        tone_model = joblib.load(tone_path)
        return cls(fluency_model=fluency_model, tone_model=tone_model, feature_names=feature_names)

    def predict_from_audio(self, audio_path: str, mode: str = "practice") -> SpeechSkillPredictions:
        vec = extract_audio_features(audio_path=audio_path)
        x = ensure_feature_order(vec, self.feature_names).reshape(1, -1)
        fluency_0_10 = float(np.asarray(self.fluency_model.predict(x)).ravel()[0])
        tone_0_10 = float(np.asarray(self.tone_model.predict(x)).ravel()[0])

        # Apply strict scaling to prevent inflated scores
        # Practice mode: 50% reduction (multiply by 0.50)
        # Exam mode: 60% reduction (multiply by 0.40) - MUCH STRICTER
        fluency_0_100_raw = fluency_0_10 * 10.0
        tone_0_100_raw = tone_0_10 * 10.0
        
        # PRACTICE MODE: 50% reduction (multiply by 0.50)
        # EXAM MODE: 60% reduction (multiply by 0.40) - VERY STRICT
        if mode == "exam":
            base_multiplier = 0.40  # Exam mode is VERY strict
        else:
            base_multiplier = 0.50  # Practice mode is moderately strict
        
        fluency_0_100 = int(round(np.clip(fluency_0_100_raw * base_multiplier, 0.0, 100.0)))
        tone_0_100 = int(round(np.clip(tone_0_100_raw * base_multiplier, 0.0, 100.0)))
        
        return SpeechSkillPredictions(fluency_0_100=fluency_0_100, tone_0_100=tone_0_100)


_bundle: SpeechSkillModelBundle | None = None


def get_model_bundle(artifacts_dir: str | Path) -> SpeechSkillModelBundle:
    global _bundle
    if _bundle is None:
        logger.info("Loading speech skill models from %s", artifacts_dir)
        _bundle = SpeechSkillModelBundle.load_from_dir(artifacts_dir)
    return _bundle

