from typing import List, Dict, Optional
from sqlalchemy import text
from app.utils import text as text_utils
from app.utils.hashing import cache_key_embed
from app.services import embed_service
from app.core.redis import get_redis

async def process_and_store_cv(
    file_bytes: bytes, 
    filename: str, 
    user_id: str, 
    db
) -> dict:
    if filename.endswith(".pdf"):
        raw_text = text_utils.extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        raw_text = text_utils.extract_text_from_docx(file_bytes)
    else:
        raw_text = file_bytes.decode('utf-8', errors='ignore')
        
    clean_text = text_utils.clean_text(raw_text)
    chunks = text_utils.chunk_cv(clean_text)
    
    location = text_utils.extract_location_from_cv(clean_text)
    
    texts_to_embed = [c["content"] for c in chunks]
    embeddings = await embed_service.embed_texts(texts_to_embed)
    
    await db.execute(
        text("DELETE FROM cv_chunks WHERE user_id = :uid"),
        {"uid": user_id}
    )
    
    for i, chunk in enumerate(chunks):
        await db.execute(
            text("""
                INSERT INTO cv_chunks (user_id, section, content, embedding)
                VALUES (:uid, :sec, :cont, :emb)
            """),
            {
                "uid": user_id,
                "sec": chunk["section"],
                "cont": chunk["content"],
                "emb": embeddings[i]
            }
        )
    
    if location:
        await db.execute(
            text("UPDATE profiles SET location_city = :loc WHERE id = :uid AND location_city IS NULL"),
            {"loc": location, "uid": user_id}
        )
        
    redis = await get_redis()
    await redis.delete(cache_key_embed(user_id))
    
    return {
        "chunks_stored": len(chunks),
        "sections": [c["section"] for c in chunks],
        "extracted_location": location
    }

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
    serializable_chunks = [{"section": c.section, "content": c.content, "embedding": list(c.embedding)} for c in chunks]
    
    await redis.set_json(cache_key, serializable_chunks, ttl=7200) # 2 hours
    return serializable_chunks

async def search_cv(query: str, user_id: str, db, limit: int = 5) -> List[Dict]:
    query_embedding = await embed_service.embed_one(query)
    
    result = await db.execute(
        text("SELECT * FROM match_cv_chunks(:emb, :uid, :limit)"),
        {"emb": query_embedding, "uid": user_id, "limit": limit}
    )
    return [dict(r) for r in result.mappings().all()]
