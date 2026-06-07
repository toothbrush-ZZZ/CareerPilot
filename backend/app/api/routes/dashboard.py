from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.core.database import AsyncSessionLocal
from app.models import Application, Profile, Goal, Skill, RoadmapMilestone, Task
from app.agents.nudge_agent import should_nudge, generate_nudge
from app.services.vector_store import query_cv, _collection
from app.jobs.scraper import search_jobs
from sqlalchemy import select, func, text, case
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

_nudge_cache: Dict[str, Dict] = {}

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

    monday = today - timedelta(days=today.weekday())
    monday_start = datetime.combine(monday, datetime.min.time())
    sunday_end = datetime.combine(monday + timedelta(days=6), datetime.max.time())

    # We use skills_extracted from ChromaDB as the total skills added metric
    skills_added = skills_extracted

    milestones_res = await db.execute(
        select(
            func.count(),
            func.sum(case((RoadmapMilestone.completed == True, 1), else_=0))
        ).where(RoadmapMilestone.user_id == user_id)
    )
    milestones_row = milestones_res.one()
    milestones_total = milestones_row[0] or 0
    milestones_completed = int(milestones_row[1] or 0)
    roadmap_percent = int((milestones_completed / milestones_total) * 100) if milestones_total > 0 else 0
    
    week_apps_res = await db.execute(
        select(Application.applied_at).where(
            Application.user_id == user_id,
            Application.applied_at >= monday_start
        )
    )
    weekly_activity = [0] * 7
    for row in week_apps_res.all():
        if row[0]:
            weekly_activity[row[0].date().weekday()] += 1



    # 3. active_goals
    active_goals_res = await db.execute(
        select(Goal).where(
            Goal.user_id == user_id, Goal.completed == False
        ).order_by(Goal.due_date.asc().nullslast()).limit(3)
    )
    active_goals_db = active_goals_res.scalars().all()
    active_goals = [
        {
            "id": g.id,
            "title": g.text,
            "target": g.target,
            "current": g.current,
            "due_date": g.due_date.isoformat() if g.due_date else None,
        } for g in active_goals_db
    ]

    # 4. due_this_week
    goals_due_res = await db.execute(
        select(Goal).where(
            Goal.user_id == user_id,
            Goal.completed == False,
            Goal.due_date >= monday,
            Goal.due_date <= (monday + timedelta(days=6))
        )
    )
    goals_due = goals_due_res.scalars().all()
    
    interviews_res = await db.execute(
        select(Application).where(
            Application.user_id == user_id,
            Application.status == "interviewing",
            Application.interview_date >= monday_start,
            Application.interview_date <= sunday_end
        )
    )
    interviews_due = interviews_res.scalars().all()

    tasks_res = await db.execute(
        select(Task).where(
            Task.user_id == user_id,
            Task.completed == False,
            Task.due_date >= monday,
            Task.due_date <= (monday + timedelta(days=6))
        )
    )
    tasks_due = tasks_res.scalars().all()

    due_this_week = []
    for g in goals_due:
        if g.due_date:
            due_this_week.append({
                "id": g.id,
                "type": "goal",
                "title": g.text,
                "date": g.due_date.isoformat(),
            })
    for i in interviews_due:
        if i.interview_date:
            due_this_week.append({
                "id": i.id,
                "type": "interview",
                "title": f"Interview @ {i.company}",
                "date": i.interview_date.isoformat(),
            })
    for t in tasks_due:
        if t.due_date:
            due_this_week.append({
                "id": t.id,
                "type": "todo",
                "title": t.title,
                "date": t.due_date.isoformat(),
            })
    due_this_week.sort(key=lambda x: x["date"])

    stats = {
        "total_applications": total_apps,
        "this_week": this_week,
        "by_status": by_status,
        "goals_total": goals_total,
        "goals_completed": goals_completed,
        "roadmap_progress_percent": roadmap_progress_percent,
        "streak_counter": streak_counter,
        "skills_added": skills_added,
        "weekly_activity": weekly_activity,
        "roadmap_percent": roadmap_percent,
        "active_goals": active_goals,
        "due_this_week": due_this_week,
        "nudge": None,
    }

    try:
        if should_nudge(last_app_row):
            now = datetime.utcnow()
            # Cache check (valid for 12 hours)
            if user_id in _nudge_cache and (now - _nudge_cache[user_id]["timestamp"]).total_seconds() < 43200:
                stats["nudge"] = _nudge_cache[user_id]["nudge"]
            else:
                cv_chunks = query_cv(user_id, "job search skills experience", n=3)
                cv_summary = " ".join(cv_chunks)[:300] if cv_chunks else ""
                
                profile_res = await db.execute(select(Profile).where(Profile.id == user_id))
                profile = profile_res.scalar_one_or_none()
                desired_role = (profile.desired_role if profile else None) or "software engineer"
                location = (profile.location_city if profile else None) or "BD"

                recent_jobs = await search_jobs(query=desired_role, location=location, limit=3)
                if recent_jobs:
                    nudge_copy = await generate_nudge(cv_summary, recent_jobs)
                    generated_nudge = {
                        "type": "no_applications_this_week",
                        "copy": nudge_copy,
                        "sub_copy": "Here are openings matching your profile:",
                        "jobs": [
                            {"title": j.get("title", ""), "company": j.get("company", ""), "job_id": j.get("id", "xyz"), "job_url": j.get("job_url", "")} 
                            for j in recent_jobs[:3]
                        ]
                    }
                else:
                    generated_nudge = {
                        "type": "no_jobs_found",
                        "copy": "We haven't tracked any applications from you this week, and we couldn't automatically find new openings for your exact profile right now.",
                        "sub_copy": "Head over to the Job Search page to explore broader opportunities!",
                        "jobs": []
                    }
                stats["nudge"] = generated_nudge
                _nudge_cache[user_id] = {"nudge": generated_nudge, "timestamp": now}
    except Exception as e:
        logger.warning(f"Nudge generation failed (non-fatal): {e}")

    return stats
