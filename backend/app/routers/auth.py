from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select
from sqlalchemy.orm import Session
import uuid
from pathlib import Path

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models import User
from app.schemas import LoginBody, Token, UserCreate, UserOut
from app.config import settings
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/test")
def test_endpoint():
    return {"message": "Auth router is working"}


@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)) -> User:
    return current


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(email=body.email.lower().strip(), hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(body: LoginBody, db: Session = Depends(get_db)) -> Token:
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Login attempt for email: {body.email}")
    
    user = db.execute(select(User).where(User.email == body.email.lower().strip())).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.hashed_password):
        logger.warning(f"Failed login for email: {body.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    logger.info(f"Successful login for email: {body.email}")
    token = create_access_token(str(user.id), is_admin=user.is_admin)
    return Token(access_token=token, is_admin=user.is_admin)


class UpdateProfileBody(BaseModel):
    display_name: str


@router.patch("/profile")
def update_profile(
    body: UpdateProfileBody,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> dict:
    name = body.display_name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name cannot be empty")
    if len(name) > 128:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name too long (max 128 characters)")
    current.display_name = name
    db.commit()
    return {"display_name": current.display_name}


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password(
    body: ChangePasswordBody,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> dict:
    if not verify_password(body.current_password, current.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 8 characters")
    current.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.delete("/delete-account")
def delete_account(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> dict:
    db.delete(current)
    db.commit()
    return {"message": "Account deleted"}


AVATAR_DIR = Path("data/avatars")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, or GIF images are allowed")
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "avatar.jpg").suffix or ".jpg"
    filename = f"{current.id}_{uuid.uuid4().hex}{ext}"
    dest = AVATAR_DIR / filename
    dest.write_bytes(contents)
    # Remove old avatar file if it exists
    if current.avatar_url:
        old_name = current.avatar_url.split("/avatars/")[-1]
        old_path = AVATAR_DIR / old_name
        if old_path.exists():
            old_path.unlink(missing_ok=True)
    current.avatar_url = f"/avatars/{filename}"
    db.commit()
    return {"avatar_url": current.avatar_url}


@router.delete("/avatar")
async def delete_avatar(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> dict:
    if current.avatar_url:
        old_name = current.avatar_url.split("/avatars/")[-1]
        old_path = AVATAR_DIR / old_name
        if old_path.exists():
            old_path.unlink(missing_ok=True)
        current.avatar_url = None
        db.commit()
    return {"avatar_url": None}
