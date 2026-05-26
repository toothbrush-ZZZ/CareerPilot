import httpx
import json
from typing import List, Dict, Optional
from app.core.config import get_settings
from app.core import groq
import google.generativeai as genai
import asyncio

import logging

logger = logging.getLogger(__name__)

settings = get_settings()

async def call_gemini(messages: List[Dict[str, str]], system_instruction: str) -> Optional[str]:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_instruction)
        
        history = []
        for msg in messages[:-1]:
            history.append({"role": "user" if msg["role"] == "user" else "model", "parts": [msg["content"]]})
            
        chat_session = model.start_chat(history=history or None)
        response = await asyncio.to_thread(chat_session.send_message, messages[-1]["content"])
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
        url = f"{settings.OLLAMA_URL}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "stream": False
        }
        logger.error(f"DEBUG: Ollama Request Model={settings.OLLAMA_MODEL} URL={url}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            logger.error(f"DEBUG: Ollama Response Status={response.status_code}")
            if response.status_code == 200:
                return response.json()["message"]["content"]
            else:
                logger.error(f"DEBUG: Ollama Error Body={response.text}")
    except Exception as e:
        logger.error(f"DEBUG: Ollama Exception: {e}")
        return None
    return None

async def get_ai_response(messages: List[Dict[str, str]], system_prompt: str) -> str:
    """
    Tries AI providers in order: Ollama -> Groq -> Gemini -> Error
    """
    # 1. Try Ollama (Local/Free/Primary)
    response = await call_ollama(messages, system_prompt)
    if response: return response
    
    # 2. Try Groq (Fastest)
    response = await call_groq(messages, system_prompt)
    if response: return response
    
    # 3. Try Gemini (High quality)
    response = await call_gemini(messages, system_prompt)
    if response: return response
    
    return "I'm sorry, I'm having trouble connecting to my AI engines. Please check your API keys or Ollama status."
