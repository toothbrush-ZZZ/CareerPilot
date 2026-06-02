from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.middleware.auth import CurrentUser
from app.services import cv_service
from app.services.vector_store import query_cv, delete_cv
from app.core.database import AsyncSessionLocal
import os

router = APIRouter(prefix="/cv", tags=["cv"])


async def _get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@router.post("/upload")
async def upload_cv(user: CurrentUser, background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files allowed")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    result = await cv_service.process_and_store_cv(
        content,
        file.filename,
        user["user_id"],
        background_tasks=background_tasks
    )
    return result


@router.get("/status")
async def get_cv_status(user: CurrentUser):
    from app.services.vector_store import _collection
    try:
        col = _collection(user["user_id"])
        count = col.count()
    except Exception:
        count = 0

    return {
        "has_cv": count > 0,
        "chunk_count": count,
        "sections": [],
    }


@router.delete("")
async def delete_cv_endpoint(user: CurrentUser):
    delete_cv(user["user_id"])
    return {"status": "success", "message": "CV deleted"}


@router.post("/build")
async def build_cv(user: CurrentUser, background_tasks: BackgroundTasks, data: dict):
    from app.utils.text import cv_builder_to_text
    cv_text = cv_builder_to_text(data)
    result = await cv_service.process_and_store_cv(
        cv_text.encode(),
        "built_cv.txt",
        user["user_id"],
        background_tasks=background_tasks
    )
    return result
