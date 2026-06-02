from typing import List, Dict, Optional
from fastapi import BackgroundTasks
import logging
from app.utils import text as text_utils
from app.services.vector_store import store_cv_chunks, query_cv, delete_cv

logger = logging.getLogger(__name__)


async def process_and_store_cv(
    file_bytes: bytes,
    filename: str,
    user_id: str,
    db=None,
    background_tasks: BackgroundTasks = None,
) -> dict:
    if filename.lower().endswith(".pdf"):
        raw_text = text_utils.extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        raw_text = text_utils.extract_text_from_docx(file_bytes)
    else:
        raw_text = file_bytes.decode("utf-8", errors="ignore")

    clean_text = text_utils.clean_text(raw_text)
    chunks = text_utils.chunk_cv(clean_text)

    if not chunks:
        return {"error": "Could not identify any content in CV"}

    chunk_texts = [c["content"] for c in chunks]

    logger.info(f"Storing {len(chunk_texts)} CV chunks for user {user_id}")
    if background_tasks:
        background_tasks.add_task(store_cv_chunks, user_id, chunk_texts)
        logger.info(f"Queued chunks to be stored in ChromaDB for user {user_id}")
    else:
        store_cv_chunks(user_id, chunk_texts)
        logger.info(f"Successfully stored chunks in ChromaDB for user {user_id}")

    return {
        "chunks_stored": len(chunks),
        "sections": list({c["section"] for c in chunks}),
        "extracted_location": None,
    }


async def search_cv_chunks(query: str, user_id: str, n: int = 5) -> List[str]:
    return query_cv(user_id, query, n=n)


async def remove_cv(user_id: str) -> None:
    delete_cv(user_id)
