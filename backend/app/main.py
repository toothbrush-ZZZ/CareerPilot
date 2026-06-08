from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.jobs.scraper import _executor  # FIX 6


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    
    # Auto-seed the demo user on every startup to ensure a pristine state for the demo
    from app.core.database import AsyncSessionLocal
    from app.services.seed_service import reset_demo_data
    try:
        async with AsyncSessionLocal() as session:
            await reset_demo_data(session)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to auto-seed demo data on startup: {e}")

    yield
    _executor.shutdown(wait=False)


app = FastAPI(
    title="CareerPilot API",
    version="2.0.0",
    lifespan=lifespan,
)

import os

_cors_origins = [o.strip() for o in os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "service": "careerpilot-api"}


@app.get("/health")
async def health():
    return {"status": "ok"}


from app.api.routes import profile, cv, jobs, tracker, dashboard, auth, debug
from app.api import assistant

app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(cv.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(tracker.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(assistant.router, prefix="/api/v1")
app.include_router(debug.router, prefix="/api/v1")
