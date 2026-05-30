from fastapi import APIRouter, HTTPException
from app.middleware.auth import CurrentUser
from app.schemas.all import CoverLetterRequest, CoverLetterResponse, RefineRequest
from app.services import cv_service, llm_factory
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])

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
    
    # 1. Build a search query from whatever the user gave us
    search_query = ""
    if request.mode == "paste" and request.job_description:
        search_query = request.job_description[:500]
    else:
        role_part = request.role_title or ""
        req_part = request.requirements or ""
        search_query = f"{role_part} {req_part}".strip()
        
    if not search_query:
        search_query = "Software Engineer" # fallback
        
    async with get_db(user_id) as db:
        context_chunks = await cv_service.search_cv(search_query, user_id, db, limit=6)
        
    if not context_chunks:
        # Check if user has a CV uploaded at all by querying all CV chunks
        async with get_db(user_id) as db:
            all_chunks = await cv_service.get_cv_chunks(user_id, db)
        if not all_chunks:
            raise HTTPException(status_code=400, detail="Upload your CV first so we can personalize your letter.")
        context_chunks = all_chunks[:6]
        
    cv_context = "\n\n".join([f"[{c['section']}]\n{c['content']}" for c in context_chunks])
    
    # 2. Build the generation prompt
    if request.mode == "paste":
        job_section = f"FULL JOB DESCRIPTION (user-pasted):\n{request.job_description}"
    else:
        job_section = f"""JOB DETAILS (user-described):
- Title: {request.role_title or 'Not specified'}
- Company: {request.company_name or 'Not specified'}
- Location: {request.location or 'Not specified'}
- Key Requirements: {request.requirements or 'Not specified'}"""

    tone_instruction = "Use a formal, professional tone."
    if request.tone == "conversational":
        tone_instruction = "Use a warm, approachable tone while remaining professional."
    elif request.tone == "enthusiastic":
        tone_instruction = "Show genuine excitement for the role without being over the top."

    prompt = f"""
You are a professional cover letter writer. Write a personalized cover letter using ONLY the candidate's actual experience listed below — do not invent anything.

{job_section}

CANDIDATE'S RELEVANT EXPERIENCE (from their CV):
{cv_context}

Writing instructions:
- {tone_instruction}
- Open with a strong hook that names the role (and company if known)
- Body: highlight 2–3 specific experiences from the CV that map to the job requirements
- Close with a clear call to action
- Length: 280–350 words
- Do NOT use placeholder text like "[Your Name]" or "[Date]" — write the letter ready to send, signing off as "{request.user_name}"
- If the company name is unknown or left blank, write naturally without referencing it (e.g., address "Dear Hiring Team" or similar, and never use placeholders like "[Company Name]")
"""

    letter_text = await llm_factory.get_ai_response(
        [{"role": "user", "content": prompt}],
        "You write professional cover letters grounded only in the user's CV.",
    )
    if "trouble connecting" in letter_text.lower():
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Configure Ollama, GROQ_API_KEY, or GEMINI_API_KEY.",
        )

    return CoverLetterResponse(
        letter_text=letter_text,
        word_count=len(letter_text.split()),
        key_cv_points_used=[],
        tone=request.tone or "professional"
    )

@router.post("/refine", response_model=CoverLetterResponse)
async def refine_cover_letter(request: RefineRequest, user: CurrentUser):
    full_prompt = f"Original Letter:\n{request.existing_letter}\n\nFeedback: {request.feedback}\n\nJob Description: {request.job_description}\n\nPlease regenerate the letter incorporating the feedback while staying grounded in the user's CV."
    
    letter_text = await llm_factory.get_ai_response(
        [{"role": "user", "content": full_prompt}],
        "You refine cover letters using the user's feedback while staying CV-grounded.",
    )
    if "trouble connecting" in letter_text.lower():
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Configure Ollama, GROQ_API_KEY, or GEMINI_API_KEY.",
        )
        
    return CoverLetterResponse(
        letter_text=letter_text,
        word_count=len(letter_text.split()),
        key_cv_points_used=[]
    )
