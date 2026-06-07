from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.core.database import AsyncSessionLocal
from app.models import Application, Goal
from app.schemas.all import ApplicationCreate, ApplicationUpdate, GoalCreate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

router = APIRouter(prefix="/tracker", tags=["tracker"])


async def _get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/applications")
async def get_applications(user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(
        select(Application).where(Application.user_id == user["user_id"]).order_by(Application.applied_at.desc())
    )
    apps = result.scalars().all()
    return [
        {
            "id": a.id,
            "job_title": a.job_title,
            "company": a.company,
            "location": a.location,
            "job_url": a.job_url,
            "status": a.status,
            "notes": a.notes,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
            "interview_date": a.interview_date.isoformat() if a.interview_date else None,
        }
        for a in apps
    ]


@router.post("/applications")
async def create_application(user: CurrentUser, data: ApplicationCreate, db: AsyncSession = Depends(_get_db)):
    app = Application(
        id=str(uuid.uuid4()),
        user_id=user["user_id"],
        job_title=data.job_title,
        company=data.company,
        location=data.location,
        job_url=data.job_url,
        status=data.status,
        notes=data.notes,
        interview_date=data.interview_date,
    )
    db.add(app)
    await db.commit()
    return {"status": "success", "id": app.id}


@router.patch("/applications/{app_id}")
async def update_application(app_id: str, user: CurrentUser, data: ApplicationUpdate, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == user["user_id"])
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.status is not None:
        app.status = data.status
    if data.notes is not None:
        app.notes = data.notes
    if data.job_url is not None:
        app.job_url = data.job_url
    if data.interview_date is not None:
        app.interview_date = data.interview_date
    app.updated_at = datetime.utcnow()

    await db.commit()
    return {"status": "success"}


@router.delete("/applications/{app_id}")
async def delete_application(app_id: str, user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == user["user_id"])
    )
    app = result.scalar_one_or_none()
    if app:
        await db.delete(app)
        await db.commit()
    return {"status": "success"}


@router.get("/goals")
async def get_goals(user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(
        select(Goal).where(Goal.user_id == user["user_id"]).order_by(Goal.due_date.asc().nullslast())
    )
    goals = result.scalars().all()
    return [
        {
            "id": g.id,
            "text": g.text,
            "due_date": g.due_date.isoformat() if g.due_date else None,
            "completed": g.completed,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in goals
    ]


@router.post("/goals")
async def create_goal(user: CurrentUser, data: GoalCreate, db: AsyncSession = Depends(_get_db)):
    goal = Goal(
        id=str(uuid.uuid4()),
        user_id=user["user_id"],
        text=data.text,
        due_date=data.due_date,
    )
    db.add(goal)
    await db.commit()
    return {"status": "success", "id": goal.id}


@router.patch("/goals/{goal_id}/toggle")
async def toggle_goal(goal_id: str, user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == user["user_id"])
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.completed = not goal.completed
    await db.commit()
    return {"status": "success"}


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user: CurrentUser, db: AsyncSession = Depends(_get_db)):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == user["user_id"])
    )
    goal = result.scalar_one_or_none()
    if goal:
        await db.delete(goal)
        await db.commit()
    return {"status": "success"}
