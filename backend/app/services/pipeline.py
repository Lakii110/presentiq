from __future__ import annotations

import logging
import traceback

from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import PracticeSession, SessionAnalysis
from app.services.analysis import build_analysis_payload
from app.services.transcription import transcribe_audio
from app.ml.features import extract_audio_features
from app.ml.scorer import ModelNotReady, get_model_bundle

logger = logging.getLogger(__name__)


def run_analysis_for_session(session_id: int) -> None:
    db: Session = SessionLocal()
    try:
        row = db.get(PracticeSession, session_id)
        if row is None:
            logger.error("Session %s not found", session_id)
            return
        if not row.audio_path:
            row.status = "failed"
            row.error_message = "No audio file attached."
            db.commit()
            return

        row.status = "processing"
        row.error_message = None
        db.commit()

        try:
            segments, duration, meta = transcribe_audio(row.audio_path)
            if not segments:
                row.status = "failed"
                row.error_message = "Transcription produced no speech segments."
                db.commit()
                return

            whisper_label = f"faster-whisper:{settings.whisper_model_size}"
            ml_fluency: int | None = None
            ml_tone: int | None = None
            ml_engagement: int | None = None
            try:
                bundle = get_model_bundle(settings.ml_artifacts_dir)
                preds = bundle.predict_from_audio(row.audio_path, mode=row.mode)  # Pass mode to ML scorer
                ml_fluency = preds.fluency_0_100
                ml_tone = preds.tone_0_100

                # Engagement proxy from acoustic variety (pitch range + energy variability)
                vec = extract_audio_features(audio_path=row.audio_path)
                by_name = dict(zip(vec.names, vec.values))
                f0_range = float(by_name.get("f0_range", 0.0))
                rms_std = float(by_name.get("rms_std", 0.0))
                # Heuristic normalization tuned for 16kHz speech: f0_range ~[0..250], rms_std ~[0..0.15]
                f0_bonus = max(0.0, min(30.0, (f0_range - 40.0) / 180.0 * 30.0))
                rms_bonus = max(0.0, min(25.0, (rms_std - 0.01) / 0.12 * 25.0))
                ml_engagement = int(max(25, min(95, round(45 + f0_bonus + rms_bonus))))
            except ModelNotReady:
                # Models not trained yet — continue with heuristic-only scoring
                pass
            except Exception:
                logger.exception("ML scoring failed; falling back to heuristics for session %s", session_id)

            payload = build_analysis_payload(
                segments,
                duration,
                whisper_model=whisper_label,
                language=meta.get("language"),
                mode=row.mode,  # Pass the session mode (practice/exam)
                ml_fluency=ml_fluency,
                ml_tone=ml_tone,
                ml_engagement=ml_engagement,
            )

            existing = row.analysis
            if existing:
                db.delete(existing)
                db.flush()

            db.add(
                SessionAnalysis(
                    session_id=row.id,
                    payload=payload,
                    whisper_model=whisper_label,
                )
            )
            row.status = "ready"
            db.commit()
        except Exception as e:  # noqa: BLE001 — log full traceback for ops
            logger.exception("Analysis failed for session %s", session_id)
            db.rollback()
            row = db.get(PracticeSession, session_id)
            if row:
                row.status = "failed"
                row.error_message = str(e)[:2000]
                db.commit()
    finally:
        db.close()
