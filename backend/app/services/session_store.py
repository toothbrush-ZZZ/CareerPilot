import asyncio
from collections import defaultdict
from typing import List, Dict

_store: Dict[str, List[dict]] = defaultdict(list)
_lock = asyncio.Lock()


async def get_history(session_id: str) -> List[dict]:
    async with _lock:
        return list(_store[session_id])


async def append_message(session_id: str, role: str, content: str) -> None:
    async with _lock:
        _store[session_id].append({"role": role, "content": content})
        # Keep only the last 20 messages to avoid unbounded growth
        if len(_store[session_id]) > 20:
            _store[session_id] = _store[session_id][-20:]


async def clear_session(session_id: str) -> None:
    async with _lock:
        _store[session_id] = []
