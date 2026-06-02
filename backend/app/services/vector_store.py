import os
import logging
import chromadb
from typing import List

logger = logging.getLogger(__name__)

try:
    _client = chromadb.PersistentClient(path="./data/chroma")
except Exception as e:
    logger.error(f"[vector_store] failed to initialize ChromaDB: {e}")
    raise


def _collection(user_id: str):
    return _client.get_or_create_collection(
        name=f"cv_{user_id}",
    )


def store_cv_chunks(user_id: str, chunks: List[str]) -> None:
    """Replace the user's CV chunks. Raises on failure."""
    try:
        col = _collection(user_id)
        existing = col.get()
        if existing["ids"]:
            col.delete(ids=existing["ids"])
        if chunks:
            col.add(
                documents=chunks,
                ids=[f"chunk_{i}" for i in range(len(chunks))],
            )
        logger.info(f"[vector_store] stored {len(chunks)} chunks for user {user_id}")
    except Exception as e:
        logger.error(f"[vector_store] store_cv_chunks failed for user {user_id}: {e}")
        raise RuntimeError(f"Failed to store CV embeddings: {e}") from e


def query_cv(user_id: str, query: str, n: int = 5) -> List[str]:
    """Returns top-n relevant CV chunks. Returns empty list on failure."""
    try:
        col = _collection(user_id)
        count = col.count()
        if count == 0:
            return []
        results = col.query(
            query_texts=[query],
            n_results=min(n, count),
        )
        return results["documents"][0] if results["documents"] else []
    except Exception as e:
        logger.error(f"[vector_store] query_cv failed for user {user_id}: {e}")
        return []  # Degrade gracefully — assistant still works, just without CV context


def delete_cv(user_id: str) -> None:
    """Remove all CV data for a user. Logs but does not raise on failure."""
    try:
        _client.delete_collection(f"cv_{user_id}")
        logger.info(f"[vector_store] deleted CV for user {user_id}")
    except Exception as e:
        logger.warning(f"[vector_store] delete_cv failed for user {user_id}: {e}")
