from typing import Annotated
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, case
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, PracticeSession, SessionAnalysis
from app.schemas import UserOut
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current: User = Depends(get_current_user)) -> User:
    """Dependency that ensures the caller is an admin."""
    if not current.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current


class AdminStats(BaseModel):
    total_users: int
    total_sessions: int
    avg_score: float | None
    active_today: int


@router.get("/stats", response_model=AdminStats)
def get_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> AdminStats:
    total_users = db.execute(select(func.count(User.id))).scalar_one()
    total_sessions = db.execute(select(func.count(PracticeSession.id))).scalar_one()

    avg_row = db.execute(
        select(func.avg(SessionAnalysis.payload["overall_score"].as_float()))
    ).scalar_one()
    avg_score = round(float(avg_row), 1) if avg_row is not None else None

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    active_today = db.execute(
        select(func.count(func.distinct(PracticeSession.user_id))).where(
            PracticeSession.created_at >= today_start
        )
    ).scalar_one()

    return AdminStats(
        total_users=total_users,
        total_sessions=total_sessions,
        avg_score=avg_score,
        active_today=active_today,
    )


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
    skip: int = 0,
    limit: int = 50,
) -> list[User]:
    q = select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    return list(db.execute(q).scalars().all())


class AdminSessionOut(BaseModel):
    id: int
    user_email: str
    mode: str
    status: str
    overall_score: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/sessions")
def list_all_sessions(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
    skip: int = 0,
    limit: int = 50,
):
    q = (
        select(PracticeSession, User.email, SessionAnalysis.payload)
        .join(User, PracticeSession.user_id == User.id)
        .outerjoin(SessionAnalysis, SessionAnalysis.session_id == PracticeSession.id)
        .order_by(PracticeSession.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = db.execute(q).all()
    result = []
    for session, email, payload in rows:
        score = None
        if payload and isinstance(payload, dict):
            score = payload.get("overall_score")
        result.append({
            "id": session.id,
            "user_email": email,
            "mode": session.mode,
            "status": session.status,
            "overall_score": score,
            "created_at": session.created_at.isoformat(),
        })
    return result


class ScoreRange(BaseModel):
    range: str
    count: int

class SkillIssue(BaseModel):
    name: str
    value: int
    color: str

class AdminAnalytics(BaseModel):
    score_distribution: list[ScoreRange]
    avg_score: float | None
    total_analyzed: int
    top_skill: str | None
    weakest_skill: str | None

@router.get("/analytics", response_model=AdminAnalytics)
def get_analytics(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> AdminAnalytics:
    analyses = db.execute(select(SessionAnalysis.payload)).scalars().all()
    scores = [p.get("overall_score") for p in analyses if p and isinstance(p, dict) and p.get("overall_score") is not None]

    dist = [
        ScoreRange(range="0-40",   count=sum(1 for s in scores if s <= 40)),
        ScoreRange(range="41-60",  count=sum(1 for s in scores if 41 <= s <= 60)),
        ScoreRange(range="61-80",  count=sum(1 for s in scores if 61 <= s <= 80)),
        ScoreRange(range="81-100", count=sum(1 for s in scores if s >= 81)),
    ]

    avg = round(sum(scores) / len(scores), 1) if scores else None

    # Aggregate skill averages
    skill_totals: dict[str, list[float]] = {}
    for p in analyses:
        if not p or not isinstance(p, dict): continue
        for sk in p.get("skills", []):
            name = sk.get("skill")
            val = sk.get("value")
            if name and val is not None and name != "Eye Contact":
                skill_totals.setdefault(name, []).append(val)

    skill_avgs = {k: sum(v)/len(v) for k, v in skill_totals.items() if v}
    top = max(skill_avgs, key=skill_avgs.get) if skill_avgs else None
    weak = min(skill_avgs, key=skill_avgs.get) if skill_avgs else None

    return AdminAnalytics(
        score_distribution=dist,
        avg_score=avg,
        total_analyzed=len(scores),
        top_skill=top,
        weakest_skill=weak,
    )


class HealthStatus(BaseModel):
    api: str
    database: str
    ai_engine: str
    storage: str
    overall: str

@router.get("/health", response_model=HealthStatus)
def get_health(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> HealthStatus:
    try:
        db.execute(select(func.count(User.id))).scalar_one()
        db_status = "Operational"
    except Exception:
        db_status = "Degraded"
    
    # Check AI Engine (whisper models directory)
    import os
    ai_status = "Operational" if os.path.exists("backend/models") or os.path.exists("models") else "Degraded"
    
    # Check Storage (uploads directory)
    storage_status = "Operational" if os.path.exists("backend/uploads") or os.path.exists("uploads") else "Degraded"
    
    overall = "Healthy" if all(s == "Operational" for s in [db_status, ai_status, storage_status]) else "Degraded"
    
    return HealthStatus(
        api="Operational", 
        database=db_status, 
        ai_engine=ai_status,
        storage=storage_status,
        overall=overall
    )


# ── Feedback moderation ──────────────────────────────────────────────────────

from app.models import UserFeedback as _UserFeedback  # local import to avoid circular

class AdminFeedbackOut(BaseModel):
    id: int
    user_id: int
    rating: int
    message: str
    display_name: str
    job_title: str | None
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/feedback", response_model=list[AdminFeedbackOut])
def list_feedback(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
    approved_only: bool = False,
):
    q = select(_UserFeedback).order_by(_UserFeedback.created_at.desc())
    if approved_only:
        q = q.where(_UserFeedback.is_approved == True)  # noqa: E712
    return list(db.execute(q).scalars().all())


@router.patch("/feedback/{feedback_id}/approve", response_model=AdminFeedbackOut)
def approve_feedback(
    feedback_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    fb = db.get(_UserFeedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    fb.is_approved = True
    db.commit()
    db.refresh(fb)
    return fb


@router.patch("/feedback/{feedback_id}/reject", response_model=AdminFeedbackOut)
def reject_feedback(
    feedback_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    fb = db.get(_UserFeedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    fb.is_approved = False
    db.commit()
    db.refresh(fb)
    return fb


@router.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(
    feedback_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    fb = db.get(_UserFeedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    db.delete(fb)
    db.commit()


@router.delete("/sessions/all", status_code=204)
def clear_all_sessions(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    """Delete every practice session in the platform."""
    from sqlalchemy import delete as sql_delete
    db.execute(sql_delete(PracticeSession))
    db.commit()


# ── Platform Settings (Feature Toggles) ─────────────────────────────────────

FEATURE_KEYS = ["practice_mode", "exam_mode", "ai_coaching_tips", "session_recording", "email_notifications"]
DEFAULT_SETTINGS = {
    "practice_mode": "true",
    "exam_mode": "true",
    "ai_coaching_tips": "true",
    "session_recording": "false",
    "email_notifications": "true",
}

from app.models import PlatformSetting as _PlatformSetting

class FeatureToggles(BaseModel):
    practice_mode: bool
    exam_mode: bool
    ai_coaching_tips: bool
    session_recording: bool
    email_notifications: bool

@router.get("/settings/features", response_model=FeatureToggles)
def get_feature_toggles(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> FeatureToggles:
    result = {}
    for key in FEATURE_KEYS:
        row = db.get(_PlatformSetting, key)
        result[key] = (row.value == "true") if row else (DEFAULT_SETTINGS[key] == "true")
    return FeatureToggles(**result)


# Public endpoint for feature toggles (no auth required)
@router.get("/settings/features/public", response_model=FeatureToggles)
def get_public_feature_toggles(
    db: Annotated[Session, Depends(get_db)],
) -> FeatureToggles:
    """Public endpoint to get feature toggles without authentication."""
    result = {}
    for key in FEATURE_KEYS:
        row = db.get(_PlatformSetting, key)
        result[key] = (row.value == "true") if row else (DEFAULT_SETTINGS[key] == "true")
    return FeatureToggles(**result)

@router.put("/settings/features", response_model=FeatureToggles)
def update_feature_toggles(
    body: FeatureToggles,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> FeatureToggles:
    for key, val in body.model_dump().items():
        row = db.get(_PlatformSetting, key)
        if row:
            row.value = "true" if val else "false"
        else:
            db.add(_PlatformSetting(key=key, value="true" if val else "false"))
    db.commit()
    return body
