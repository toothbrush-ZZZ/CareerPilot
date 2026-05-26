from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from contextlib import async_lifespan
from app import embedder

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedOneRequest(BaseModel):
    text: str

@async_lifespan
async def lifespan(app: FastAPI):
   
    print("Pre-warming embedding model...")
    embedder.embed_one("warmup")
    yield
   
    pass

app = FastAPI(title="CareerPilot - Embed Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/embed")
async def embed(request: EmbedRequest):
    if not request.texts:
        raise HTTPException(status_code=400, detail="The 'texts' list cannot be empty")
    
    try:
        embeddings = embedder.embed_texts(request.texts)
        return {"embeddings": embeddings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed/one")
async def embed_one(request: EmbedOneRequest):
    try:
        embedding = embedder.embed_one(request.text)
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": "BAAI/bge-small-en-v1.5",
        "dimension": 384
    }
