from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import text
from app.middleware.auth import CurrentUser
from app.core.database import get_db
from app.core.redis import get_redis

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None

@router.get("")
async def get_profile(user: CurrentUser):
    user_id = user["user_id"]
    cache_key = f"profile:{user_id}"
    
    redis = await get_redis()
    cached_profile = await redis.get_json(cache_key)
    if cached_profile:
        return cached_profile

    async with get_db(user_id) as db:
        result = await db.execute(
            text("SELECT id, email, full_name, location_city, location_country FROM profiles WHERE id = :uid"),
            {"uid": user_id}
        )
        profile = result.mappings().first()
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile_dict = dict(profile)
        profile_dict["id"] = str(profile_dict["id"])
        await redis.set_json(cache_key, profile_dict, ttl=600)
        return profile_dict

@router.post("")
async def update_profile(data: ProfileUpdate, user: CurrentUser):
    user_id = user["user_id"]
    email = user.get("email", "")
    
    async with get_db(user_id) as db:
        await db.execute(
            text("""
                INSERT INTO profiles (id, email, full_name, location_city, location_country)
                VALUES (:uid, :email, :name, :city, :country)
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    location_city = EXCLUDED.location_city,
                    location_country = EXCLUDED.location_country
            """),
            {
                "uid": user_id,
                "email": email,
                "name": data.full_name,
                "city": data.location_city,
                "country": data.location_country
            }
        )
        
        await db.commit()
        
        # Clear cache
        redis = await get_redis()
        await redis.delete(f"profile:{user_id}")
        
        return {"status": "success", "message": "Profile updated"}
