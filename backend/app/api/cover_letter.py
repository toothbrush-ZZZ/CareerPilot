from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.schemas.all import CoverLetterRequest, CoverLetterResponse, RefineRequest
from app.services import cv_service
from app.core import groq
from app.core.config import get_settings
import google.generativeai as genai
import asyncio

router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])
settings = get_settings()

COVER_LETTER_PROMPT = """
You are an expert career counselor and professional writer.

Write a personalized, compelling cover letter for the job below.

STRICT RULES:
1. ONLY mention skills and experience that appear in the USER CV CONTEXT below
2. Reference the company name and role title from the job description
3. Do NOT invent projects, degrees, or skills not mentioned in the CV
4. Structure: Opening hook → Why this company → What I bring (CV-specific) → Call to action
5. Length: 3-4 paragraphs, professional tone
6. Do NOT use "I am writing to apply for..." as an opener — be original.

USER CV CONTEXT:
{cv_context}

JOB DESCRIPTION:
{job_description}

COMPANY NAME: {company_name}
ROLE TITLE: {role_title}
USER NAME: {user_name}

Write the cover letter now. Output ONLY the letter text.
"""

@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest, user: CurrentUser):
    user_id = user["user_id"]
    from app.core.database import get_db
    
    async with get_db(user_id) as db:
        context_chunks = await cv_service.search_cv(request.job_description, user_id, db, limit=6)
    
    cv_context = "\n\n".join([f"[{c['section']}]\n{c['content']}" for c in context_chunks])
    
    full_prompt = COVER_LETTER_PROMPT.format(
        cv_context=cv_context,
        job_description=request.job_description,
        company_name=request.company_name,
        role_title=request.role_title,
        user_name=request.user_name
    )
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = await asyncio.to_thread(model.generate_content, full_prompt)
        letter_text = response.text
    except Exception as e:
        print(f"Gemini error, falling back to Groq: {e}")
        letter_text = await groq.chat_completion([{"role": "user", "content": full_prompt}])

    key_points = []
    for chunk in context_chunks:
        content = chunk["content"]
        sentences = content.split(".")
        for sent in sentences:
            if len(sent) > 20 and sent[:20].lower() in letter_text.lower():
                key_points.append(sent[:50] + "...")
                break

    return CoverLetterResponse(
        letter_text=letter_text,
        word_count=len(letter_text.split()),
        key_cv_points_used=key_points[:5]
    )

@router.post("/refine", response_model=CoverLetterResponse)
async def refine_cover_letter(request: RefineRequest, user: CurrentUser):
    full_prompt = f"Original Letter:\n{request.existing_letter}\n\nFeedback: {request.feedback}\n\nJob Description: {request.job_description}\n\nPlease regenerate the letter incorporating the feedback while staying grounded in the user's CV."
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = await asyncio.to_thread(model.generate_content, full_prompt)
        letter_text = response.text
    except Exception:
        letter_text = await groq.chat_completion([{"role": "user", "content": full_prompt}])
        
    return CoverLetterResponse(
        letter_text=letter_text,
        word_count=len(letter_text.split()),
        key_cv_points_used=[]
    )
