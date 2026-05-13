from pathlib import Path
import threading
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import PracticeSession, User
from app.schemas import AnalysisPayload, AnalysisResponse, SessionCreate, SessionOut
from app.services.pipeline import run_analysis_for_session

router = APIRouter(prefix="/sessions", tags=["sessions"])

ALLOWED_SUFFIXES = {".webm", ".wav", ".mp3", ".m4a", ".ogg", ".flac", ".mp4", ".mpeg", ".mpga"}


def _suffix(name: str) -> str:
    p = Path(name or "")
    return p.suffix.lower()


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    body: SessionCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> PracticeSession:
    row = PracticeSession(user_id=user.id, mode=body.mode, status="pending")
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[SessionOut])
def list_sessions(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 50,
) -> list[PracticeSession]:
    q = (
        select(PracticeSession)
        .where(PracticeSession.user_id == user.id)
        .order_by(PracticeSession.created_at.desc())
        .offset(max(skip, 0))
        .limit(min(limit, 100))
    )
    return list(db.execute(q).scalars().all())


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> PracticeSession:
    row = db.get(PracticeSession, session_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return row


@router.post("/{session_id}/audio", response_model=SessionOut)
async def upload_audio(
    session_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    file: UploadFile = File(...),
) -> PracticeSession:
    row = db.get(PracticeSession, session_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if row.status not in {"pending", "failed"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session already has audio or is processing.",
        )

    suffix = _suffix(file.filename or "")
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type {suffix or '(none)'}. Allowed: {sorted(ALLOWED_SUFFIXES)}",
        )

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{row.id}{suffix}"
    dest = settings.upload_dir / safe_name

    # Stream-write in 4 MB chunks to avoid loading the entire file into RAM
    chunk_size = 4 * 1024 * 1024  # 4 MB
    max_bytes = settings.max_upload_mb * 1024 * 1024
    written = 0
    try:
        with dest.open("wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_bytes:
                    dest.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large (max {settings.max_upload_mb} MB).",
                    )
                f.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        dest.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {exc}",
        ) from exc

    row.audio_path = str(dest.resolve())
    row.audio_mime = file.content_type
    row.status = "processing"
    row.error_message = None
    db.commit()
    db.refresh(row)

    # IMPORTANT: FastAPI BackgroundTasks run in the same worker thread after the response,
    # which blocks the API during heavy work (Whisper/Librosa/ML). Run analysis in a true
    # background thread so auth endpoints stay responsive.
    threading.Thread(target=run_analysis_for_session, args=(row.id,), daemon=True).start()
    return row


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_sessions(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete all sessions (and their analyses) for the current user."""
    from sqlalchemy import delete as sql_delete
    db.execute(sql_delete(PracticeSession).where(PracticeSession.user_id == user.id))
    db.commit()


@router.get("/{session_id}/analysis")
def get_analysis(
    session_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    row = db.get(PracticeSession, session_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if row.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=row.error_message or "Analysis failed",
        )

    if row.status != "ready" or row.analysis is None:
        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={"status": row.status, "message": "Analysis not ready yet."},
        )

    payload = AnalysisPayload.model_validate(row.analysis.payload)
    return AnalysisResponse(session=SessionOut.model_validate(row), analysis=payload)
