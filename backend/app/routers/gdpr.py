"""
GDPR Compliance endpoints
- Data export (Right to access)
- Data deletion (Right to be forgotten)
- Data portability
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.auth import get_current_user
from app.database import get_db
from app.models import User, PracticeSession
from app.monitoring import logger
import json
from datetime import datetime


router = APIRouter(prefix="/gdpr", tags=["GDPR"])


@router.get("/export-my-data")
def export_user_data(
    current: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Export all user data (GDPR Right to Access)
    Returns all personal data in JSON format
    """
    
    # Get user data
    user_data = {
        "personal_information": {
            "email": current.email,
            "display_name": current.display_name,
            "is_admin": current.is_admin,
            "created_at": current.created_at.isoformat() if current.created_at else None,
        },
        "sessions": [],
        "export_date": datetime.now().isoformat(),
        "export_format": "JSON",
    }
    
    # Get all practice sessions
    sessions = db.execute(
        select(PracticeSession).where(PracticeSession.user_id == current.id)
    ).scalars().all()
    
    for session in sessions:
        user_data["sessions"].append({
            "id": session.id,
            "mode": session.mode,
            "status": session.status,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "transcript": session.transcript,
            "duration_seconds": session.duration_seconds,
            "scores": {
                "accuracy": session.accuracy_score,
                "fluency": session.fluency_score,
                "completeness": session.completeness_score,
                "prosody": session.prosody_score,
            }
        })
    
    logger.info(f"GDPR: Data export requested by user {current.email}")
    
    return user_data


@router.delete("/delete-my-account")
def delete_user_account(
    current: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Delete user account and all associated data (GDPR Right to be Forgotten)
    This action is irreversible!
    """
    
    user_email = current.email
    
    # Delete all practice sessions
    sessions = db.execute(
        select(PracticeSession).where(PracticeSession.user_id == current.id)
    ).scalars().all()
    
    for session in sessions:
        # Delete audio files if they exist
        if session.audio_path:
            from pathlib import Path
            audio_file = Path(session.audio_path)
            if audio_file.exists():
                audio_file.unlink()
        db.delete(session)
    
    # Delete user avatar if exists
    if current.avatar_url:
        from pathlib import Path
        avatar_path = Path("data/avatars") / current.avatar_url.split("/")[-1]
        if avatar_path.exists():
            avatar_path.unlink()
    
    # Delete user account
    db.delete(current)
    db.commit()
    
    logger.warning(f"GDPR: Account deleted for user {user_email}")
    
    return {
        "message": "Your account and all associated data have been permanently deleted.",
        "deleted_at": datetime.now().isoformat()
    }


@router.get("/data-processing-info")
def get_data_processing_info():
    """
    Information about how user data is processed (GDPR Transparency)
    """
    return {
        "data_controller": {
            "name": "PresentIQ",
            "contact": "privacy@presentiq.com"
        },
        "data_collected": [
            {
                "type": "Account Information",
                "data": ["Email address", "Display name", "Password (hashed)"],
                "purpose": "User authentication and account management",
                "retention": "Until account deletion"
            },
            {
                "type": "Practice Sessions",
                "data": ["Audio recordings", "Transcripts", "Scores", "Timestamps"],
                "purpose": "Pronunciation assessment and progress tracking",
                "retention": "Until account deletion or manual deletion"
            },
            {
                "type": "Usage Data",
                "data": ["IP address", "Request logs", "Session timestamps"],
                "purpose": "Security, performance monitoring, and service improvement",
                "retention": "30 days"
            }
        ],
        "data_sharing": "We do not share your personal data with third parties",
        "your_rights": [
            "Right to access your data (GET /gdpr/export-my-data)",
            "Right to delete your data (DELETE /gdpr/delete-my-account)",
            "Right to data portability (export in JSON format)",
            "Right to object to processing (contact privacy@presentiq.com)"
        ],
        "security_measures": [
            "Password hashing with Argon2",
            "HTTPS encryption in transit",
            "Rate limiting to prevent abuse",
            "Regular security audits"
        ]
    }
