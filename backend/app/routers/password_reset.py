"""
Password reset flow:
  POST /auth/forgot-password       → generates a 6-digit OTP, sends via email (or logs to console)
  POST /auth/verify-reset-code     → validates the OTP
  POST /auth/reset-password        → validates OTP + sets new password
"""
from __future__ import annotations

import logging
import random
import smtplib
import string
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import settings
from app.database import get_db
from app.models import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])

_otp_store: dict[str, tuple[str, float]] = {}
OTP_TTL = 600  # 10 minutes


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _send_email(to: str, otp: str) -> None:
    """Send OTP via Gmail SMTP if configured, otherwise log to console."""
    if not settings.smtp_user or not settings.smtp_password:
        logger.info("=" * 50)
        logger.info("PASSWORD RESET CODE for %s: %s", to, otp)
        logger.info("(Set SMTP_USER and SMTP_PASSWORD in backend/.env to send real emails)")
        logger.info("=" * 50)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your PresentIQ Password Reset Code"
    msg["From"] = settings.smtp_from
    msg["To"] = to

    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8f9fc;border-radius:16px;">
      <h2 style="color:#1e293b;margin-bottom:8px;">Reset your password</h2>
      <p style="color:#64748b;margin-bottom:24px;">Use the code below to reset your PresentIQ password. It expires in 10 minutes.</p>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#4f46e5;">{otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to, msg.as_string())
        logger.info("Reset code sent to %s", to)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)
        # Fall back to console so the user can still test
        logger.info("FALLBACK — Reset code for %s: %s", to, otp)
        raise


class ForgotPasswordBody(BaseModel):
    email: EmailStr


class VerifyCodeBody(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordBody(BaseModel):
    email: EmailStr
    code: str
    new_password: str


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(body: ForgotPasswordBody, db: Annotated[Session, Depends(get_db)]):
    user = db.execute(select(User).where(User.email == body.email.lower())).scalar_one_or_none()
    if user:
        otp = _generate_otp()
        _otp_store[body.email.lower()] = (otp, time.time() + OTP_TTL)
        try:
            _send_email(body.email.lower(), otp)
        except Exception:
            pass  # already logged; OTP still stored so console fallback works
    return {"message": "If that email exists, a reset code has been sent."}


@router.post("/verify-reset-code", status_code=status.HTTP_200_OK)
def verify_reset_code(body: VerifyCodeBody):
    entry = _otp_store.get(body.email.lower())
    if not entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")
    code, expires_at = entry
    if time.time() > expires_at:
        _otp_store.pop(body.email.lower(), None)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code has expired. Request a new one.")
    if code != body.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code")
    return {"message": "Code verified"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(body: ResetPasswordBody, db: Annotated[Session, Depends(get_db)]):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")
    entry = _otp_store.get(body.email.lower())
    if not entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")
    code, expires_at = entry
    if time.time() > expires_at or code != body.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")
    user = db.execute(select(User).where(User.email == body.email.lower())).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.hashed_password = hash_password(body.new_password)
    db.commit()
    _otp_store.pop(body.email.lower(), None)
    return {"message": "Password reset successfully"}
