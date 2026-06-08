from fastapi import APIRouter, HTTPException, status
from app.services.seed_service import DEMO_USER_ID, DEMO_EMAIL, reset_demo_data
from app.services import auth_service
from app.middleware.auth import CurrentUser
from app.core.database import AsyncSessionLocal

router = APIRouter(prefix="/debug", tags=["debug"])


@router.post("/reset-demo")
async def reset_demo(user: CurrentUser):
    async with AsyncSessionLocal() as db:
        success = await reset_demo_data(db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reset demo data",
            )

    return {"status": "success", "message": "Demo data reset and re-seeded successfully."}


@router.post("/login-demo")
async def login_demo():
    """Public endpoint — returns a JWT for the demo account. No auth required."""
    from sqlalchemy import text

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("SELECT id FROM profiles WHERE id = :uid"),
            {"uid": DEMO_USER_ID},
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
        "user_id": DEMO_USER_ID,
    }

