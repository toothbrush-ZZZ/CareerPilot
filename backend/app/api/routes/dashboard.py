from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.core.database import AsyncSessionLocal
from app.models import Application, Profile
from app.agents.nudge_agent import should_nudge, generate_nudge
from app.services.vector_store import query_cv, _collection
from app.jobs.scraper import search_jobs
from sqlalchemy import select, func, text, case
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


async def _get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/stats")
async def get_dashboard_stats(user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    user_id = user["user_id"]

    total_res = await db.execute(
        select(func.count()).select_from(Application).where(Application.user_id == user_id)
    )
    total_apps = total_res.scalar() or 0

    one_week_ago = datetime.utcnow() - timedelta(days=7)
    week_res = await db.execute(
        select(func.count()).select_from(Application).where(
            Application.user_id == user_id,
            Application.applied_at >= one_week_ago,
        )
    )
    this_week = week_res.scalar() or 0

    status_res = await db.execute(
        select(Application.status, func.count()).where(Application.user_id == user_id).group_by(Application.status)
    )
    by_status: Dict[str, int] = {r[0]: r[1] for r in status_res.all()}
    for s in ["applied", "interviewing", "offer", "rejected"]:
        if s not in by_status:
            by_status[s] = 0

    from app.models import Goal
    goals_res = await db.execute(
        select(
            func.count(),
            func.sum(case((Goal.completed == True, 1), else_=0))
        ).where(Goal.user_id == user_id)
    )
    goals_row = goals_res.one()
    goals_total = goals_row[0] or 0
    goals_completed = int(goals_row[1] or 0)

    last_app_res = await db.execute(
        select(Application.applied_at).where(Application.user_id == user_id).order_by(Application.applied_at.desc()).limit(1)
    )
    last_app_row = last_app_res.scalar()

    try:
        col = _collection(user_id)
        skills_extracted = col.count()
    except Exception:
        skills_extracted = 0

    streak_res = await db.execute(
        select(Application.applied_at).where(Application.user_id == user_id).order_by(Application.applied_at.desc())
    )
    app_dates = [row[0].date() for row in streak_res.all() if row[0]]
    unique_dates = sorted(list(set(app_dates)), reverse=True)
    
    streak_counter = 0
    today = datetime.utcnow().date()
    
    if unique_dates:
        current_date = unique_dates[0]
        if (today - current_date).days <= 1:
            streak_counter = 1
            for i in range(1, len(unique_dates)):
                if (unique_dates[i-1] - unique_dates[i]).days == 1:
                    streak_counter += 1
                else:
                    break

    roadmap_progress_percent = int((goals_completed / goals_total) * 100) if goals_total > 0 else 0

    stats = {
        "total_applications": total_apps,
        "this_week": this_week,
        "by_status": by_status,
        "goals_total": goals_total,
        "goals_completed": goals_completed,
        "roadmap_progress_percent": roadmap_progress_percent,
        "streak_counter": streak_counter,
        "skills_extracted": skills_extracted,
        "nudge": None,
    }

    try:
        if should_nudge(last_app_row):
            cv_chunks = query_cv(user_id, "job search skills experience", n=3)
            cv_summary = " ".join(cv_chunks)[:300] if cv_chunks else ""
            
            profile_res = await db.execute(select(Profile).where(Profile.id == user_id))
            profile = profile_res.scalar_one_or_none()
            desired_role = (profile.desired_role if profile else None) or "software engineer"
            location = (profile.location_city if profile else None) or "Bangladesh"

            recent_jobs = await search_jobs(query=desired_role, location=location, limit=3)
            if recent_jobs:
                stats["nudge"] = await generate_nudge(cv_summary, recent_jobs)
    except Exception as e:
        logger.warning(f"Nudge generation failed (non-fatal): {e}")

    return stats
