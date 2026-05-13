from typing import Annotated
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.database import get_db
from app.models import User, UserFeedback

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    message: str = Field(min_length=3, max_length=1000)
    display_name: str = Field(min_length=1, max_length=128)
    job_title: str | None = Field(default=None, max_length=128)


class FeedbackOut(BaseModel):
    id: int
    rating: int
    message: str
    display_name: str
    job_title: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    body: FeedbackCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> UserFeedback:
    # One pending/approved feedback per user at a time — prevent spam
    existing = db.execute(
        select(UserFeedback).where(UserFeedback.user_id == user.id)
    ).scalars().first()
    if existing:
        # Update existing instead of creating duplicate
        existing.rating = body.rating
        existing.message = body.message.strip()
        existing.display_name = body.display_name.strip()
        existing.job_title = body.job_title.strip() if body.job_title else None
        existing.is_approved = False  # reset approval on edit
        db.commit()
        db.refresh(existing)
        return existing

    fb = UserFeedback(
        user_id=user.id,
        rating=body.rating,
        message=body.message.strip(),
        display_name=body.display_name.strip(),
        job_title=body.job_title.strip() if body.job_title else None,
        is_approved=False,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


@router.get("/my", response_model=FeedbackOut | None)
def get_my_feedback(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Returns the current user's own feedback submission if it exists."""
    fb = db.execute(
        select(UserFeedback).where(UserFeedback.user_id == user.id)
    ).scalars().first()
    return fb


@router.get("/public", response_model=list[FeedbackOut])
def get_public_feedback(db: Annotated[Session, Depends(get_db)]):
    """Returns all approved feedback — public, no auth required."""
    rows = db.execute(
        select(UserFeedback)
        .where(UserFeedback.is_approved == True)  # noqa: E712
        .order_by(UserFeedback.created_at.desc())
        .limit(20)
    ).scalars().all()
    return list(rows)
