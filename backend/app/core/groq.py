import asyncio
from concurrent.futures import ThreadPoolExecutor
from groq import Groq
from app.core.config import get_settings

settings = get_settings()
executor = ThreadPoolExecutor(max_workers=10)

def _sync_chat_completion(messages: list[dict], model: str, max_tokens: int) -> str:
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        messages=messages,
        model=model,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content

async def chat_completion(messages: list[dict], model: str = None, max_tokens: int = 1000) -> str:
    if not model:
        model = settings.GROQ_CHAT_MODEL
    
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor, 
        _sync_chat_completion, 
        messages, 
        model, 
        max_tokens
    )

async def fast_completion(prompt: str, max_tokens: int = 500) -> str:
    messages = [{"role": "user", "content": prompt}]
    return await chat_completion(
        messages, 
        model=settings.GROQ_FAST_MODEL, 
        max_tokens=max_tokens
    )
