import httpx
import logging
from typing import List
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def _join_url(base_url: str, path: str) -> str:
    return base_url.rstrip("/") + "/" + path.lstrip("/")

async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generates embeddings by calling the remote embedding service."""
    url = _join_url(settings.EMBED_URL, "/embed")
    logger.info(f"Calling embedding service at {url} with {len(texts)} texts")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                url,
                json={"texts": texts}
            )
            response.raise_for_status()
            result = response.json()["embeddings"]
            logger.info(f"Successfully generated {len(result)} embeddings")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from embedding service: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.ConnectError as e:
            logger.error(f"Failed to connect to embedding service at {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling embedding service: {e}")
            raise

async def embed_one(text: str) -> List[float]:
    """Generates a single embedding by calling the remote embedding service."""
    url = _join_url(settings.EMBED_URL, "/embed/one")
    logger.info(f"Calling embedding service at {url} for single text")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                url,
                json={"text": text}
            )
            response.raise_for_status()
            result = response.json()["embedding"]
            logger.info(f"Successfully generated single embedding")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from embedding service: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.ConnectError as e:
            logger.error(f"Failed to connect to embedding service at {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error calling embedding service: {e}")
            raise

