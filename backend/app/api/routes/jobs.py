from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from app.middleware.auth import CurrentUser
from app.agents.job_hunter import JobHunterAgent
from app.agents.fit_scorer import FitScorer
from app.core.database import get_db
from sqlalchemy import text

router = APIRouter(prefix="/jobs", tags=["jobs"])

job_hunter = JobHunterAgent()
fit_scorer = FitScorer()

@router.get("/search")
async def search_jobs(
    user: CurrentUser,
    query: str = Query(..., description="Job title or keywords"),
    location: Optional[str] = None,
    max_results: int = 15
):
    async with get_db(user["user_id"]) as db:
        response = await job_hunter.search_jobs(
            query=query,
            user_id=user["user_id"],
            db=db,
            location_override=location,
            max_results=max_results
        )
        return response

@router.post("/manual-fit")
async def manual_fit(user: CurrentUser, data: dict):
    """Compute fit for a manually pasted job description."""
    jd = data.get("job_description")
    if not jd:
        raise HTTPException(status_code=400, detail="Job description is required")
        
    async with get_db(user["user_id"]) as db:
        result = await fit_scorer.compute_fit(user["user_id"], jd, db)
        return result

@router.get("/location")
async def get_user_location(user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        result = await db.execute(
            text("SELECT location_city FROM profiles WHERE id = :uid"),
            {"uid": user["user_id"]}
        )
        location = result.scalar()
        return {"location": location or "Not set"}
