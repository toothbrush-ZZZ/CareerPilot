from typing import List, Dict, Optional
import logging
from sqlalchemy import text
from app.utils import text as text_utils
from app.utils.hashing import cache_key_embed
from app.services import embed_service, llm_factory
from app.core.redis import get_redis

logger = logging.getLogger(__name__)

async def process_and_store_cv(
    file_bytes: bytes, 
    filename: str, 
    user_id: str, 
    db
) -> dict:
    if filename.lower().endswith(".pdf"):
        raw_text = text_utils.extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".docx"):
        raw_text = text_utils.extract_text_from_docx(file_bytes)
    else:
        raw_text = file_bytes.decode('utf-8', errors='ignore')
        
    clean_text = text_utils.clean_text(raw_text)
    chunks = text_utils.chunk_cv(clean_text)
    
    if not chunks:
        return {"error": "Could not identify any content in CV"}
        
    location = text_utils.extract_location_from_cv(clean_text)
    
    # AI Fallback if regex fails or result is very short
    if not location or len(location) < 3:
        logger.info(f"Regex extraction failed for {user_id}, trying AI fallback")
        system_prompt = "Extract the candidate's current city and country from their CV text. Return ONLY the city and country, or 'Unknown' if not found. Example: 'Dhaka, Bangladesh' or 'San Francisco, CA'."
        ai_loc = await llm_factory.get_ai_response([{"role": "user", "content": clean_text[:3000]}], system_prompt)
        if ai_loc and "unknown" not in ai_loc.lower():
            location = ai_loc.strip()
            logger.info(f"AI extracted location: {location}")
    
    texts_to_embed = [c["content"] for c in chunks]
    logger.info(f"Attempting to generate embeddings for {len(texts_to_embed)} CV chunks")
    try:
        embeddings = await embed_service.embed_texts(texts_to_embed)
        logger.info(f"Successfully generated {len(embeddings)} embeddings for user {user_id}")
    except Exception as e:
        logger.error(f"Embedding service failed for user {user_id}: {e}")
        # Fallback: store chunks without embeddings
        embeddings = None
    
    await db.execute(
        text("DELETE FROM cv_chunks WHERE user_id = :uid"),
        {"uid": user_id}
    )
    
    for i, chunk in enumerate(chunks):
        if embeddings:
            await db.execute(
                text("""
                    INSERT INTO cv_chunks (user_id, section, content, embedding)
                    VALUES (:uid, :sec, :cont, CAST(:emb AS vector))
                """),
                {
                    "uid": user_id,
                    "sec": chunk["section"],
                    "cont": chunk["content"],
                    "emb": str(embeddings[i])
                }
            )
            logger.debug(f"Inserted chunk {i} with embedding type {type(str(embeddings[i]))}")
        else:
            await db.execute(
                text("""
                    INSERT INTO cv_chunks (user_id, section, content)
                    VALUES (:uid, :sec, :cont)
                """),
                {
                    "uid": user_id,
                    "sec": chunk["section"],
                    "cont": chunk["content"]
                }
            )
            logger.debug(f"Inserted chunk {i} without embedding (service unavailable)")
    
    if location:
        await db.execute(
            text("UPDATE profiles SET location_city = :loc WHERE id = :uid"),
            {"loc": location, "uid": user_id}
        )
        logger.info(f"Updated location for {user_id} to {location}")
    redis = await get_redis()
    await redis.delete(cache_key_embed(user_id))
    
    return {
        "chunks_stored": len(chunks),
        "sections": [c["section"] for c in chunks],
        "extracted_location": location
    }

def parse_vector(val) -> list:
    if val is None:
        return []
    if isinstance(val, str):
        val = val.strip('[]{}')
        return [float(x) for x in val.split(',')] if val else []
    if isinstance(val, (list, tuple)):
        return list(val)
    if hasattr(val, 'tolist'):
        return val.tolist()
    return list(val)

async def get_cv_chunks(user_id: str, db) -> List[Dict]:
    redis = await get_redis()
    cache_key = cache_key_embed(user_id)
    
    cached = await redis.get_json(cache_key)
    if cached:
        return cached
        
    result = await db.execute(
        text("SELECT section, content, embedding FROM cv_chunks WHERE user_id = :uid"),
        {"uid": user_id}
    )
    chunks = result.mappings().all()
    serializable_chunks = [{"section": c["section"], "content": c["content"], "embedding": parse_vector(c["embedding"])} for c in chunks]
    
    await redis.set_json(cache_key, serializable_chunks, ttl=7200)
    return serializable_chunks

async def search_cv(query: str, user_id: str, db, limit: int = 5) -> List[Dict]:
    query_embedding = await embed_service.embed_one(query)
    
    result = await db.execute(
        text("SELECT * FROM match_cv_chunks(CAST(:emb AS vector), :uid, :limit)"),
        {"emb": str(query_embedding), "uid": user_id, "limit": limit}
    )
    return [dict(r) for r in result.mappings().all()]
