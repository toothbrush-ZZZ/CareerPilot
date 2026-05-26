from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from sqlalchemy import text
import uuid
import os
import shutil
from app.core.database import get_db
from app.core.redis import get_redis
from app.middleware.auth import CurrentUser
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

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
async def signup(data: UserSignup):
    user_id = str(uuid.uuid4())
    hashed_password = auth_service.hash_password(data.password)

    async with get_db(user_id) as db:
        result = await db.execute(
            text("SELECT id FROM profiles WHERE email = :email"),
            {"email": data.email}
        )
        if result.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        await db.execute(
            text("""
                INSERT INTO profiles (id, email, password_hash, full_name)
                VALUES (:uid, :email, :pw, :name)
            """),
            {
                "uid": user_id,
                "email": data.email,
                "pw": hashed_password,
                "name": data.full_name
            }
        )
        
        access_token = auth_service.create_access_token(data={"sub": user_id, "email": data.email})
        return {"access_token": access_token, "user_id": user_id}

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    async with get_db() as db:
        result = await db.execute(
            text("SELECT id, email, password_hash FROM profiles WHERE email = :email"),
            {"email": data.email}
        )
        user = result.mappings().first()
        
        if not user or not user["password_hash"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not auth_service.verify_password(data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        user_id = str(user["id"])
        access_token = auth_service.create_access_token(data={"sub": user_id, "email": user["email"]})
        return {"access_token": access_token, "user_id": user_id}


@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, user: CurrentUser):
    user_id = user["user_id"]

    async with get_db(user_id) as db:
        result = await db.execute(
            text("SELECT password_hash FROM profiles WHERE id = :uid"),
            {"uid": user_id}
        )
        row = result.mappings().first()
        if not row or not row["password_hash"]:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if not auth_service.verify_password(data.current_password, row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        new_hash = auth_service.hash_password(data.new_password)
        await db.execute(
            text("UPDATE profiles SET password_hash = :new_hash WHERE id = :uid"),
            {"new_hash": new_hash, "uid": user_id}
        )
        await db.commit()

    return {"status": "success", "message": "Password updated successfully"}


@router.delete("/delete-account")
async def delete_account(data: DeleteAccountRequest, user: CurrentUser):
    user_id = user["user_id"]

    async with get_db(user_id) as db:
        result = await db.execute(
            text("SELECT password_hash FROM profiles WHERE id = :uid"),
            {"uid": user_id}
        )
        row = result.mappings().first()
        if not row or not row["password_hash"]:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if not auth_service.verify_password(data.password, row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )

        await db.execute(
            text("DELETE FROM profiles WHERE id = :uid"),
            {"uid": user_id}
        )
        await db.commit()

    redis = await get_redis()
    await redis.delete(f"profile:{user_id}")

    user_dir = f"uploads/{user_id}"
    if os.path.exists(user_dir):
        shutil.rmtree(user_dir)

    return {"status": "success", "message": "Account deleted successfully"}
