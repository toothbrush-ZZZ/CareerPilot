import httpx
from typing import List
from app.core.config import get_settings

settings = get_settings()

client = httpx.AsyncClient(timeout=30.0)

async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Calls the internal embed microservice for a batch of texts."""
    response = await client.post(
        f"{settings.EMBED_URL}/embed",
        json={"texts": texts}
    )
    response.raise_for_status()
    return response.json()["embeddings"]

async def embed_one(text: str) -> List[float]:
    """Calls the internal embed microservice for a single text."""
    response = await client.post(
        f"{settings.EMBED_URL}/embed/one",
        json={"text": text}
    )
    response.raise_for_status()
    return response.json()["embedding"]
