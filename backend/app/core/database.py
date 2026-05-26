from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from contextlib import asynccontextmanager
from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.POSTGRES_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

@asynccontextmanager
async def get_db(user_id: str = None):
    """
    Context manager for async DB session.
    Sets the current_user_id for Row Level Security in Postgres.
    """
    session = AsyncSessionLocal()
    try:
        if user_id:
            await session.execute(
                text("SET app.current_user_id = :uid"),
                {"uid": user_id}
            )
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()
