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
    
    # Transcribe with LARGE-V3 model for maximum accuracy
    # Optimized for: pronunciation understanding, accents, long speeches
    # VAD disabled to get full transcription without audio removal
    segments_gen, info = model.transcribe(
        path,
        beam_size=5,  # Multiple decoding paths for accuracy
        best_of=5,  # Best of 5 attempts
        temperature=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],  # Temperature fallback
        vad_filter=False,  # DISABLED - Get full transcription
        condition_on_previous_text=True,  # Use context from previous segments
        no_speech_threshold=0.5,  # Lower threshold to catch more speech
        compression_ratio_threshold=2.4,  # Detect repetition
        log_prob_threshold=-1.0,  # Accept lower confidence for difficult audio
        word_timestamps=True,  # Enable word-level timestamps
        language="en",  # Force English for consistency
        initial_prompt="This is a presentation or speech recording. The speaker may use filler words like um, uh, like, you know. Pay attention to pronunciation and accents.",
    )
    
    segments: list[dict[str, float | str]] = []
    for s in segments_gen:
        text = (s.text or "").strip()
        if not text:
            continue
        # Accept even single characters to get full transcription
        segments.append({"start": float(s.start), "end": float(s.end), "text": text})
        # Log each segment for debugging
        logger.info(f"Segment {len(segments)}: [{s.start:.2f}s - {s.end:.2f}s] '{text}'")

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
