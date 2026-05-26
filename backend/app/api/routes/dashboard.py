from fastapi import APIRouter, Depends
from app.middleware.auth import CurrentUser
from app.core.database import get_db
from app.agents.nudge_agent import NudgeAgent
from app.core import redis
from sqlalchemy import text
from typing import Dict, List

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
nudge_agent = NudgeAgent()

@router.get("/stats")
async def get_dashboard_stats(user: CurrentUser):
    user_id = user["user_id"]
    
    async with get_db(user_id) as db:
        total_res = await db.execute(
            text("SELECT COUNT(*) FROM applications WHERE user_id = :uid"),
            {"uid": user_id}
        )
        total_apps = total_res.scalar()
        
        week_res = await db.execute(
            text("SELECT COUNT(*) FROM applications WHERE user_id = :uid AND applied_at >= now() - interval '7 days'"),
            {"uid": user_id}
        )
        this_week = week_res.scalar()
        
        status_res = await db.execute(
            text("SELECT status, COUNT(*) FROM applications WHERE user_id = :uid GROUP BY status"),
            {"uid": user_id}
        )
        by_status = {r[0]: r[1] for r in status_res.all()}
        for s in ["applied", "interviewing", "offer", "rejected"]:
            if s not in by_status:
                by_status[s] = 0
                
        goals_res = await db.execute(
            text("SELECT COUNT(*), SUM(CASE WHEN completed THEN 1 ELSE 0 END) FROM goals WHERE user_id = :uid"),
            {"uid": user_id}
        )
        goals_row = goals_res.one()
        goals_total = goals_row[0] or 0
        goals_completed = int(goals_row[1] or 0)
        
        redis_client = await redis.get_redis()
        recent_jobs = await redis_client.get_json(f"recent_searches:{user_id}") or []
        
        stats = {
            "total_applications": total_apps,
            "this_week": this_week,
            "by_status": by_status,
            "goals_total": goals_total,
            "goals_completed": goals_completed
        }
        
        nudges = nudge_agent.generate_nudges(stats, recent_jobs)
        stats["nudges"] = nudges
        
        return stats
