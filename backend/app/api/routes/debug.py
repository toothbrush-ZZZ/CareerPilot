from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from app.core.database import get_db
from app.core.redis import get_redis
from app.services.seed_service import DEMO_USER_ID, DEMO_EMAIL, reset_demo_data
from app.services import auth_service
from app.utils.hashing import cache_key_embed
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/debug", tags=["debug"])

@router.post("/reset-demo")
async def reset_demo():
    """
    Clears all data associated with the stable demo account and re-seeds it.
    """
    async with get_db(DEMO_USER_ID) as db:
        success = await reset_demo_data(db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reset demo data"
            )
            
    try:
        redis = await get_redis()
        await redis.delete(f"profile:{DEMO_USER_ID}")
        await redis.delete(cache_key_embed(DEMO_USER_ID)) # In case cv_service caches embeddings key
    except Exception as redis_err:
        logger.error(f"Error clearing cache during demo reset: {redis_err}")
        
    return {"status": "success", "message": "Demo data reset and re-seeded successfully."}

@router.post("/login-demo")
async def login_demo():
    """
    Bypasses standard password verification to log in as the stable demo user.
    Useful for hackathon presentation and quick access.
    """
    async with get_db(DEMO_USER_ID) as db:
        result = await db.execute(
            text("SELECT id FROM profiles WHERE id = :uid"),
            {"uid": DEMO_USER_ID}
        )
        row = result.first()
        if not row:
            from app.services.seed_service import seed_demo_data
            await seed_demo_data(db)
            
    access_token = auth_service.create_access_token(
        data={"sub": DEMO_USER_ID, "email": DEMO_EMAIL}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_id": DEMO_USER_ID
    }
