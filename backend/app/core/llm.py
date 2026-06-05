import logging
from typing import List, Dict, Any
from groq import AsyncGroq
import groq
from google import genai
from google.genai import types

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

_groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

_gemini_client = None
if settings.GEMINI_API_KEY:
    _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def chat(
    messages: List[Dict[str, str]], 
    max_tokens: int = 1000, 
    temperature: float = 0.7, 
    json_mode: bool = False
) -> str:
    """Unified chat function with automatic fallback to Gemini Flash."""
    

    if _groq_client:
        try:
            kwargs = {
                "model": "llama-3.3-70b-versatile",
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = await _groq_client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except (groq.RateLimitError, groq.APIConnectionError, groq.APITimeoutError, groq.InternalServerError) as err:
            logger.warning(f"[LLM] Groq failed: {err}. Falling back to Gemini Flash.")
            if not _gemini_client:
                raise err
    

    if not _gemini_client:
        raise ValueError("Neither Groq nor Gemini API keys are configured correctly.")
        

    system_instruction = ""
    contents = []
    
    for m in messages:
        if m["role"] == "system":
            system_instruction += m["content"] + "\n"
        else:
            role = "user" if m["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=m["content"])]))
        
    config_args = {
        "max_output_tokens": max_tokens,
        "temperature": temperature,
    }
    if system_instruction:
        config_args["system_instruction"] = system_instruction
    if json_mode:
        config_args["response_mime_type"] = "application/json"
        
    config = types.GenerateContentConfig(**config_args)
    
    response = await _gemini_client.aio.models.generate_content(
        model='gemini-2.0-flash',
        contents=contents,
        config=config
    )
    return response.text
