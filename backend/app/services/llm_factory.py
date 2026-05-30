import httpx
import json
from typing import List, Dict, Optional
from app.core.config import get_settings
from app.core import groq
from google import genai
from google.genai import types
import asyncio

import logging


def _join_url(base_url: str, path: str) -> str:
    return base_url.rstrip("/") + "/" + path.lstrip("/")

logger = logging.getLogger(__name__)

settings = get_settings()

async def call_gemini(messages: List[Dict[str, str]], system_instruction: str) -> Optional[str]:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            history.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                )
            )
            
        config = types.GenerateContentConfig(
            system_instruction=system_instruction
        )
        
        chat = client.chats.create(
            model="gemini-1.5-flash",
            history=history or None,
            config=config
        )
        response = await asyncio.to_thread(chat.send_message, messages[-1]["content"])
        return response.text
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return None

async def call_groq(messages: List[Dict[str, str]], system_prompt: str) -> Optional[str]:
    if not settings.GROQ_API_KEY:
        return None
    try:
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        return await groq.chat_completion(full_messages)
    except Exception as e:
        logger.error(f"Groq error: {e}")
        return None

async def call_ollama(messages: List[Dict[str, str]], system_prompt: str) -> Optional[str]:
    try:
        url = _join_url(settings.OLLAMA_URL, "/api/chat")
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "stream": False
        }
        logger.debug(f"DEBUG: Ollama Request Model={settings.OLLAMA_MODEL} URL={url}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            logger.debug(f"DEBUG: Ollama Response Status={response.status_code}")
            if response.status_code == 200:
                return response.json()["message"]["content"]
            else:
                logger.debug(f"DEBUG: Ollama Error Body={response.text}")
    except Exception as e:
        logger.debug(f"DEBUG: Ollama Exception: {e}")
        return None
    return None

async def get_ai_response(messages: List[Dict[str, str]], system_prompt: str) -> str:
    """
    Tries AI providers in order of configuration/availability:
    If API keys are provided: Groq -> Gemini -> Ollama
    If no keys: Ollama
    """
    if settings.GROQ_API_KEY:
        response = await call_groq(messages, system_prompt)
        if response: return response
        
    if settings.GEMINI_API_KEY:
        response = await call_gemini(messages, system_prompt)
        if response: return response
        
    response = await call_ollama(messages, system_prompt)
    if response: return response

    return "I'm sorry, I'm having trouble connecting to my AI engines. Please check your API keys or Ollama status."
