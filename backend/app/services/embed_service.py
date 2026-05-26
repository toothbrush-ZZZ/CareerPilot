import httpx
from typing import List
from app.core.config import get_settings

settings = get_settings()

async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generates embeddings by calling the remote embedding service."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{settings.EMBED_URL}/embed",
                json={"texts": texts}
            )
            response.raise_for_status()
            return response.json()["embeddings"]
        except Exception as e:
            print(f"Error calling embedding service: {e}")
            raise

async def embed_one(text: str) -> List[float]:
    """Generates a single embedding by calling the remote embedding service."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{settings.EMBED_URL}/embed/one",
                json={"text": text}
            )
            response.raise_for_status()
            return response.json()["embedding"]
        except Exception as e:
            print(f"Error calling embedding service: {e}")
            raise

