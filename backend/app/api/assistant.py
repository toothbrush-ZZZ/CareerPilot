from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.schemas.all import ChatRequest, ChatResponse, ChatMessage
from app.services import cv_service
from app.core import redis, groq
from app.core.config import get_settings
from google import genai
import json
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["assistant"])
settings = get_settings()

SYSTEM_PROMPT = """
You are CareerPilot, a personal career co-pilot AI assistant.
You have access to the user's CV — treat it as the absolute source of truth about who they are.
Never make up experience, skills, or credentials the user does not have.
Be direct, specific, and actionable. Reference the user's actual background when giving advice.

BENCHMARK QUERY TYPES you must handle with structured output:

1. READINESS CHECK — "Am I ready for X role?"
   Response format:
   **Verdict:** [Ready / Almost Ready / Not Yet]
   **Reasoning:** (reference specific CV items vs JD requirements)
   **Top 3 strengths:** ...
   **Top 3 gaps:** ...
   **Recommendation:** ...

2. SKILL GAP — "What skills am I missing for X?"
   Response format:
   **Required skills for this role:** (list)
   **Skills you already have:** (from CV, list)
   **Missing skills:** (list with priority: Critical / Nice-to-have)
   **Suggested resources:** (free resources only: Coursera, freeCodeCamp, YouTube, roadmap.sh)

3. LEARNING ROADMAP — "Build me a N-month roadmap for X"
   Response format:
   ## N-Month Roadmap: [Goal]
   **Month 1 - Foundation:** ...
   **Month 2 - Building:** ...
   **Week-by-week breakdown:** ...
   **Free resources:** ...
   **Milestones & checkpoints:** ...

4. COVER LETTER — "Draft a cover letter for [job]"
   If the user asks you to draft a cover letter (especially for the currently selected job or a job found in the session), generate a professional, personalized cover letter grounded ONLY in the user's CV chunks.
   Always output the cover letter in this exact format:
   ### Cover Letter for [Job Title] at [Company]
   ---
   [Cover letter content here, keeping it under 350 words, grounded in candidate's experience, with no placeholders like [Your Name]]

CV CONTEXT (retrieved for this query):
{cv_context}
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: CurrentUser):
    user_id = user["user_id"]
    from app.core.database import get_db
    
    try:
        async with get_db(user_id) as db:
            context_chunks = await cv_service.search_cv(request.message, user_id, db, limit=5)
    except Exception as e:
        logger.error(f"CV search failed: {e}")
        context_chunks = []
    
    cv_context = "\n\n".join([f"[{c['section']}]\n{c['content']}" for c in context_chunks])
    if not cv_context:
        cv_context = "No CV data available. The user hasn't uploaded a CV yet."
    
    redis_client = await redis.get_redis()
    history_key = f"chat_history:{user_id}:{request.session_id}"
    history_raw = await redis_client.get_json(history_key) or []
    history = [ChatMessage(**m) for m in history_raw]
    
    history.append(ChatMessage(role="user", content=request.message))
    
    full_system_prompt = SYSTEM_PROMPT.format(cv_context=cv_context)
    
    if request.last_search_results:
        full_system_prompt += "\n\n--- RECENT JOB SEARCH RESULTS (from this session) ---\n"
        for i, job in enumerate(request.last_search_results):
            full_system_prompt += f"Job {i + 1}: {job.get('role') or job.get('title')} at {job.get('company')} | {job.get('location')} | Fit: {job.get('fit_percentage') or job.get('fitScore') or 50}%\n"
            full_system_prompt += f"  Deadline: {job.get('deadline')} | Salary: {job.get('salary_range') or job.get('salaryRange')}\n"
            
    if request.selected_job:
        full_system_prompt += "\n\n--- CURRENTLY SELECTED JOB ---\n"
        full_system_prompt += json.dumps(request.selected_job, indent=2)
    
    from app.services import llm_factory
    
    messages_for_ai = []
    for msg in history:
        messages_for_ai.append({"role": msg.role, "content": msg.content})
        
    logger.info(f"Generating AI response for user {user_id} with {len(messages_for_ai)} messages")
    ai_response = await llm_factory.get_ai_response(messages_for_ai, full_system_prompt)
    logger.info(f"AI response generated: {len(ai_response)} chars")

    history.append(ChatMessage(role="assistant", content=ai_response))
    if len(history) > 20: history = history[-20:]
    
    await redis_client.set_json(history_key, [m.model_dump() for m in history], ttl=3600)
    
    return ChatResponse(
        response=ai_response,
        session_id=request.session_id,
        history=history
    )

@router.delete("/session/{session_id}")
async def clear_session(session_id: str, user: CurrentUser):
    redis_client = await redis.get_redis()
    await redis_client.delete(f"chat_history:{user['user_id']}:{session_id}")
    return {"status": "success"}
