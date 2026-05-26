from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import CurrentUser
from app.schemas.all import ChatRequest, ChatResponse, ChatMessage
from app.services import cv_service
from app.core import redis, groq
from app.core.config import get_settings
import google.generativeai as genai
import json
from typing import List, Dict

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
   → Redirect the user to the Cover Letter tab if they want a full generation.

CV CONTEXT (retrieved for this query):
{cv_context}
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: CurrentUser):
    user_id = user["user_id"]
    from app.core.database import get_db
    
    async with get_db(user_id) as db:
        context_chunks = await cv_service.search_cv(request.message, user_id, db, limit=5)
    
    cv_context = "\n\n".join([f"[{c['section']}]\n{c['content']}" for c in context_chunks])
    
    redis_client = await redis.get_redis()
    history_key = f"chat_history:{user_id}:{request.session_id}"
    history_raw = await redis_client.get_json(history_key) or []
    history = [ChatMessage(**m) for m in history_raw]
    
    history.append(ChatMessage(role="user", content=request.message))
    
    full_system_prompt = SYSTEM_PROMPT.format(cv_context=cv_context)
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=full_system_prompt)
        
        gemini_history = []
        for msg in history[:-1]:
            gemini_history.append({"role": "user" if msg.role == "user" else "model", "parts": [msg.content]})
            
        chat_session = model.start_chat(history=gemini_history)
        response = await asyncio.to_thread(chat_session.send_message, request.message)
        ai_response = response.text
    except Exception as e:
        print(f"Gemini error, falling back to Groq: {e}")
        messages = [{"role": "system", "content": full_system_prompt}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        ai_response = await groq.chat_completion(messages)

    history.append(ChatMessage(role="assistant", content=ai_response))
    if len(history) > 20: history = history[-20:]
    
    await redis_client.set_json(history_key, [m.dict() for m in history], ttl=3600)
    
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

import asyncio
