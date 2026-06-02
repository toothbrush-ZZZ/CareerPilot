from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import os
import shutil
import logging
from pathlib import Path

from app.core.database import AsyncSessionLocal
from app.middleware.auth import CurrentUser
from app.models import Profile
from app.services import auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


async def _get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserSignup, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(select(Profile).where(Profile.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_id = str(uuid.uuid4())
    hashed_password = auth_service.hash_password(data.password)

    try:
        profile = Profile(
            id=user_id,
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name,
        )
        db.add(profile)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    access_token = auth_service.create_access_token(data={"sub": user_id, "email": data.email})
    return {"access_token": access_token, "user_id": user_id}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(select(Profile).where(Profile.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not auth_service.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = auth_service.create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": access_token, "user_id": user.id}


@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    user_id = user["user_id"]
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()

    if not profile or not profile.password_hash:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not auth_service.verify_password(data.current_password, profile.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    try:
        profile.password_hash = auth_service.hash_password(data.new_password)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"status": "success", "message": "Password updated successfully"}


@router.delete("/delete-account")
async def delete_account(data: DeleteAccountRequest, user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    user_id = user["user_id"]
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()

    if not profile or not profile.password_hash:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not auth_service.verify_password(data.password, profile.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password")

    try:
        await db.delete(profile)
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    user_dir = Path(f"uploads/{user_id}")
    try:
        if user_dir.exists():
            shutil.rmtree(user_dir)
    except OSError as e:
        logger.warning(f"[delete_account] could not remove user dir {user_dir}: {e}")

    from app.services.vector_store import delete_cv
    delete_cv(user_id)

    return {"status": "success", "message": "Account deleted successfully"}
