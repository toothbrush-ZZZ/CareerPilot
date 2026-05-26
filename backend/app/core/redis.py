import redis.asyncio as redis
import json
from typing import Any, Optional
from app.core.config import get_settings

settings = get_settings()

class RedisManager:
    def __init__(self):
        self.client: Optional[redis.Redis] = None

    async def connect(self):
        if not self.client:
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self):
        if self.client:
            await self.client.close()
            self.client = None

    async def get(self, key: str) -> Optional[str]:
        return await self.client.get(key)

    async def set(self, key: str, value: str, ttl: int = 3600):
        await self.client.set(key, value, ex=ttl)

    async def delete(self, key: str):
        await self.client.delete(key)

    async def get_json(self, key: str) -> Optional[Any]:
        data = await self.get(key)
        return json.loads(data) if data else None

    async def set_json(self, key: str, value: Any, ttl: int = 3600):
        await self.set(key, json.dumps(value), ttl)

redis_manager = RedisManager()

async def get_redis():
    await redis_manager.connect()
    return redis_manager

async def close_redis():
    await redis_manager.disconnect()
