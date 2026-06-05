from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.middleware.auth import CurrentUser
from app.services.assistant_service import chat
from app.services.session_store import get_history, append_message, clear_session
from app.services.vector_store import query_cv

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str
    session_id: str
    job_title: Optional[str] = None
    job_description: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def assistant_chat(req: ChatRequest, user: CurrentUser):
    user_id = user["user_id"]

    cv_chunks = query_cv(user_id, req.message, n=5)
    cv_context = "\n\n".join(cv_chunks) if cv_chunks else "No CV uploaded yet."

    job_context = None
    if req.job_title or req.job_description:
        job_context = f"Title: {req.job_title or ''}\n{req.job_description or ''}"

    history = await get_history(req.session_id)
    reply = await chat(req.message, cv_context, history, job_context)

    await append_message(req.session_id, "user", req.message)
    await append_message(req.session_id, "assistant", reply)

    return {"reply": reply, "session_id": req.session_id}


@router.delete("/session/{session_id}")
async def clear_chat(session_id: str, user: CurrentUser):
    await clear_session(session_id)
    return {"cleared": True}
