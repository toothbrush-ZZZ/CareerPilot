from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
import uuid
from app.core.database import get_db
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

@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserSignup):
    async with get_db() as db:
        result = await db.execute(
            text("SELECT id FROM profiles WHERE email = :email"),
            {"email": data.email}
        )
        if result.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        user_id = str(uuid.uuid4())
        hashed_password = auth_service.hash_password(data.password)
        
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
        
        access_token = auth_service.create_access_token(data={"sub": user["id"], "email": user["email"]})
        return {"access_token": access_token, "user_id": str(user["id"])}

from typing import Optional
