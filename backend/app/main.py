from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.redis import get_redis, close_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_redis()
    yield
    await close_redis()

app = FastAPI(
    title="CareerPilot API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "service": "careerpilot-api"}
@app.get("/health")
async def health():
    try:
        from app.core.redis import redis_manager
        ping = await redis_manager.client.ping()
        return {"status": "ok", "redis": "ok" if ping else "error"}
    except Exception as e:
        return {"status": "error", "redis": str(e)}

from app.api.routes import profile, cv, jobs, tracker, dashboard, auth
from app.api import assistant, cover_letter

app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(cv.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(tracker.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(assistant.router, prefix="/api/v1")
app.include_router(cover_letter.router, prefix="/api/v1")
