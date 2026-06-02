from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.middleware.auth import CurrentUser
from app.core.database import AsyncSessionLocal
from app.models import Profile

router = APIRouter(prefix="/profile", tags=["profile"])


async def _get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None
    desired_role: Optional[str] = None


@router.get("")
async def get_profile(user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    user_id = user["user_id"]
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "id": profile.id,
        "email": profile.email,
        "full_name": profile.full_name,
        "location_city": profile.location_city,
        "location_country": profile.location_country,
        "desired_role": profile.desired_role,
    }


@router.post("")
async def update_profile(data: ProfileUpdate, user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    user_id = user["user_id"]
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if data.full_name is not None:
        profile.full_name = data.full_name
    if data.location_city is not None:
        profile.location_city = data.location_city
    if data.location_country is not None:
        profile.location_country = data.location_country
    if data.desired_role is not None:
        profile.desired_role = data.desired_role

    await db.commit()
    return {"status": "success", "message": "Profile updated"}
