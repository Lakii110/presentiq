from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    two_factor_enabled: bool = False
    two_factor_method: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_admin: bool = False


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class SessionCreate(BaseModel):
    mode: Literal["practice", "exam"] = "practice"


class SessionOut(BaseModel):
    id: int
    mode: str
    status: str
    audio_mime: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SkillScore(BaseModel):
    skill: str
    value: int = Field(ge=0, le=100)
    tip: str


class TimelineSegment(BaseModel):
    start: float
    end: float
    type: str
    label: str
    color: Optional[str] = None


class TranscriptSegment(BaseModel):
    timeline_idx: int
    text: str
    start: float
    end: float


class InsightItem(BaseModel):
    type: Literal["strength", "weakness", "suggestion"]
    text: str


class AnalysisPayload(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    total_duration_sec: float
    skills: list[SkillScore]
    timeline_segments: list[TimelineSegment]
    transcript_segments: list[TranscriptSegment]
    insights: list[InsightItem]
    filler_words: list[str]
    language: Optional[str] = None
    whisper_model: str
    summary: str = ""


class AnalysisResponse(BaseModel):
    session: SessionOut
    analysis: AnalysisPayload
