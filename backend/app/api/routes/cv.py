from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.services import cv_service
from app.core.database import get_db
from sqlalchemy import text
import os

router = APIRouter(prefix="/cv", tags=["cv"])

@router.post("/upload")
async def upload_cv(user: CurrentUser, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files allowed")
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    async with get_db(user["user_id"]) as db:
        result = await cv_service.process_and_store_cv(
            content, 
            file.filename, 
            user["user_id"], 
            db
        )
        return result

@router.get("/status")
async def get_cv_status(user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        result = await db.execute(
            text("SELECT COUNT(*) as count FROM cv_chunks WHERE user_id = :uid"),
            {"uid": user["user_id"]}
        )
        count = result.scalar()
        
        if count == 0:
            return {"has_cv": False}
            
        sections_result = await db.execute(
            text("SELECT DISTINCT section FROM cv_chunks WHERE user_id = :uid"),
            {"uid": user["user_id"]}
        )
        sections = [r[0] for r in sections_result.all()]
        
        return {
            "has_cv": True,
            "chunk_count": count,
            "sections": sections
        }

@router.delete("")
async def delete_cv(user: CurrentUser):
    async with get_db(user["user_id"]) as db:
        await db.execute(
            text("DELETE FROM cv_chunks WHERE user_id = :uid"),
            {"uid": user["user_id"]}
        )
        return {"status": "success", "message": "CV deleted"}

@router.post("/build")
async def build_cv(user: CurrentUser, data: dict):
    from app.utils.text import cv_builder_to_text
    from app.rag.pdf_builder import CVPDFBuilder
    import os
    
    cv_text = cv_builder_to_text(data)
    
    async with get_db(user["user_id"]) as db:
        result = await cv_service.process_and_store_cv(
            cv_text.encode(), 
            "built_cv.txt", 
            user["user_id"], 
            db
        )
        
        os.makedirs(f"uploads/{user['user_id']}", exist_ok=True)
        pdf_path = f"uploads/{user['user_id']}/cv.pdf"
        builder = CVPDFBuilder()
        builder.generate(data, pdf_path)
        
        result["pdf_url"] = f"/api/v1/cv/download"
        return result

@router.get("/download")
async def download_cv(user: CurrentUser):
    from fastapi.responses import FileResponse
    pdf_path = f"uploads/{user['user_id']}/cv.pdf"
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="CV PDF not found")
    return FileResponse(pdf_path, filename="careerpilot_cv.pdf")
