from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.core.database import get_db
from app.schemas.all import ApplicationCreate, ApplicationUpdate, GoalCreate
from sqlalchemy import text
from typing import List

router = APIRouter(prefix="/tracker", tags=["tracker"])

@router.get("/applications")
async def get_applications(user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        result = await db.execute(
            text("SELECT * FROM applications WHERE user_id = :uid ORDER BY applied_at DESC"),
            {"uid": user["user_id"]}
        )
        return [dict(r._mapping) for r in result.all()]

@router.post("/applications")
async def create_application(user: CurrentUser, data: ApplicationCreate):
    async with get_db(user["user_id"]) as db:
        await db.execute(
            text("""
                INSERT INTO applications (user_id, job_title, company, location, job_url, status, notes)
                VALUES (:uid, :title, :company, :loc, :url, :status, :notes)
            """),
            {
                "uid": user["user_id"],
                "title": data.job_title,
                "company": data.company,
                "loc": data.location,
                "url": data.job_url,
                "status": data.status,
                "notes": data.notes
            }
        )
        return {"status": "success"}

@router.patch("/applications/{app_id}")
async def update_application(app_id: str, user: CurrentUser, data: ApplicationUpdate):
    async with get_db(user["user_id"]) as db:
        update_fields = []
        params = {"uid": user["user_id"], "aid": app_id}
        
        if data.status:
            update_fields.append("status = :status")
            params["status"] = data.status
        if data.notes:
            update_fields.append("notes = :notes")
            params["notes"] = data.notes
        if data.job_url:
            update_fields.append("job_url = :url")
            params["url"] = data.job_url
            
        if not update_fields:
            return {"status": "no changes"}
            
        params["updated_at"] = "now()" # Placeholder for SQL update
        
        await db.execute(
            text(f"UPDATE applications SET {', '.join(update_fields)}, updated_at = now() WHERE id = :aid AND user_id = :uid"),
            params
        )
        return {"status": "success"}

@router.delete("/applications/{app_id}")
async def delete_application(app_id: str, user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        await db.execute(
            text("DELETE FROM applications WHERE id = :aid AND user_id = :uid"),
            {"aid": app_id, "uid": user["user_id"]}
        )
        return {"status": "success"}

@router.get("/goals")
async def get_goals(user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        result = await db.execute(
            text("SELECT * FROM goals WHERE user_id = :uid ORDER BY due_date NULLS LAST"),
            {"uid": user["user_id"]}
        )
        return [dict(r._mapping) for r in result.all()]

@router.post("/goals")
async def create_goal(user: CurrentUser, data: GoalCreate):
    async with get_db(user["user_id"]) as db:
        await db.execute(
            text("INSERT INTO goals (user_id, text, due_date) VALUES (:uid, :text, :due)"),
            {"uid": user["user_id"], "text": data.text, "due": data.due_date}
        )
        return {"status": "success"}

@router.patch("/goals/{goal_id}/toggle")
async def toggle_goal(goal_id: str, user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        await db.execute(
            text("UPDATE goals SET completed = NOT completed WHERE id = :gid AND user_id = :uid"),
            {"gid": goal_id, "uid": user["user_id"]}
        )
        return {"status": "success"}
