from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.redis import get_redis, close_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_redis()
    
    # Seed stable demo data on startup (creates stable demo account with sample data if missing)
    from app.core.database import get_db
    from app.services.seed_service import seed_demo_data, DEMO_USER_ID
    import logging
    try:
        async with get_db(DEMO_USER_ID) as db:
            await seed_demo_data(db)
        logging.getLogger("uvicorn").info("Demo data seeding checked/completed successfully on startup.")
    except Exception as e:
        logging.getLogger("uvicorn").error(f"Failed to seed demo data on startup: {e}")
        
    yield
    await close_redis()

app = FastAPI(
    title="CareerPilot API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    except Exception:
        return {"status": "error", "redis": "Service unavailable"}

from app.api.routes import profile, cv, jobs, tracker, dashboard, auth, debug
from app.api import assistant, cover_letter

app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(cv.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(tracker.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(assistant.router, prefix="/api/v1")
app.include_router(cover_letter.router, prefix="/api/v1")
app.include_router(debug.router, prefix="/api/v1")
