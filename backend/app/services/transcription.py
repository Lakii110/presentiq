from __future__ import annotations

import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)
_model = None


def get_whisper_model() -> Any:
    """Lazy-load Whisper model once per process."""
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        _model = WhisperModel(
            settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
    return _model


def transcribe_audio(path: str) -> tuple[list[dict[str, float | str]], float, dict[str, Any]]:
    """
    Returns (segments, duration_seconds, meta).
    Each segment: {start, end, text}.
    """
    model = get_whisper_model()
    logger.info("Starting transcription of: %s", path)
    
    # Optimized for maximum speed while maintaining good accuracy
    segments_gen, info = model.transcribe(
        path,
        beam_size=1,  # Faster: single beam instead of 5
        vad_filter=True,  # Enable VAD to skip silence (faster)
        condition_on_previous_text=False,  # Disable for speed (slight accuracy trade-off)
        language="en",
        initial_prompt="This is a presentation or speech recording with filler words like um, uh, like, you know.",
        compression_ratio_threshold=2.4,  # Default, but explicit
        log_prob_threshold=-1.0,  # Default, but explicit
        no_speech_threshold=0.6,  # Default, but explicit
    )
    
    segments: list[dict[str, float | str]] = []
    for s in segments_gen:
        text = (s.text or "").strip()
        if not text:
            continue
        segments.append({"start": float(s.start), "end": float(s.end), "text": text})

    logger.info("Transcription complete: %d segments", len(segments))

    # Use the last segment end time as duration if info.duration is unreliable
    duration = float(info.duration or 0.0)
    if segments:
        last_end = float(segments[-1]["end"])
        # info.duration can be wrong for MP3 — use whichever is larger
        duration = max(duration, last_end)
    if duration <= 0:
        duration = 1.0

    logger.info("Duration: %.1f seconds, segments: %d", duration, len(segments))

    meta = {
        "language": getattr(info, "language", None),
        "language_probability": float(getattr(info, "language_probability", 0.0) or 0.0),
    }
    return segments, duration, meta
