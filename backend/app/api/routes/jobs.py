import asyncio
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.middleware.auth import CurrentUser
from app.jobs.scraper import search_jobs as _search_jobs
from app.jobs.fit import compute_fit
from app.services.vector_store import query_cv

router = APIRouter(prefix="/jobs", tags=["jobs"])


async def _enhance_job_with_fit(job: dict, user_id: str) -> dict:
    cv_chunks = query_cv(user_id, job.get("description", ""), n=5)
    if not cv_chunks:
        return job
    fit = await compute_fit(job, cv_chunks)
    job["fit_score"] = fit.get("score")
    job["reasoning"] = fit.get("reasoning")
    job["matched_skills"] = fit.get("matched_skills", [])
    job["missing_skills"] = fit.get("missing_skills", [])
    return job


class JobSearchRequest(BaseModel):
    query: str
    location: Optional[str] = None
    limit: Optional[int] = 10


class FitRequest(BaseModel):
    job_title: str
    company: Optional[str] = None
    job_description: str


@router.post("/search")
async def search(req: JobSearchRequest, user: CurrentUser):
    jobs = await _search_jobs(
        query=req.query,
        location=req.location or "Bangladesh",
        limit=req.limit or 10,
    )
    user_id = str(user["user_id"])
    tasks = [_enhance_job_with_fit(job, user_id) for job in jobs]
    enhanced_jobs = await asyncio.gather(*tasks)
    return {"jobs": enhanced_jobs, "count": len(enhanced_jobs)}


@router.post("/compute-fit")
async def fit_score(req: FitRequest, user: CurrentUser):
    cv_chunks = query_cv(str(user["user_id"]), req.job_description, n=5)
    if not cv_chunks:
        return {"error": "No CV found. Please upload your CV first."}
    return await compute_fit(
        job={
            "title": req.job_title,
            "company": req.company or "",
            "description": req.job_description,
        },
        cv_chunks=cv_chunks,
    )


@router.get("/search")
async def search_get(
    user: CurrentUser,
    query: str = "",
    location: Optional[str] = None,
    limit: int = 10,
):
    jobs = await _search_jobs(
        query=query,
        location=location or "Bangladesh",
        limit=limit,
    )
    user_id = str(user["user_id"])
    tasks = [_enhance_job_with_fit(job, user_id) for job in jobs]
    enhanced_jobs = await asyncio.gather(*tasks)
    return {"jobs": enhanced_jobs, "count": len(enhanced_jobs)}
