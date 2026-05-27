from functools import lru_cache
import logging

from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Supabase (optional for now)
    SUPABASE_URL: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_KEY: str | None = None

    # AI Models (optional for now)
    GROQ_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None

    GROQ_CHAT_MODEL: str = "llama3-70b-8192"
    GROQ_FAST_MODEL: str = "llama3-8b-8192"


    # External APIs (optional for now)
    ADZUNA_APP_ID: str | None = None
    ADZUNA_API_KEY: str | None = None

    ADZUNA_BASE_URL: str = "https://api.adzuna.com/v1/api/jobs"

    # Infrastructure (required)
    POSTGRES_URL: PostgresDsn
    REDIS_URL: str
    EMBED_URL: str

    # Auth (required)
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Ollama (local/free AI)
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:8b"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


def mask_url(url: str | None) -> str:
    if not url:
        return "NOT SET"

    try:
        url = str(url)

        if "@" in url:
            prefix, rest = url.split("://", 1)
            auth, host_path = rest.split("@", 1)

            if ":" in auth:
                user, _ = auth.split(":", 1)
                return f"{prefix}://{user}:********@{host_path}"

        return url

    except Exception:
        return "********"


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()

    print("=" * 50)
    print("CONFIG LOADED")
    print("=" * 50)

    print(f"POSTGRES_URL: {mask_url(settings.POSTGRES_URL)}")
    print(f"REDIS_URL: {mask_url(settings.REDIS_URL)}")

    print(f"OLLAMA_URL: {settings.OLLAMA_URL}")
    print(f"OLLAMA_MODEL: {settings.OLLAMA_MODEL}")

    print(f"GROQ ENABLED: {bool(settings.GROQ_API_KEY)}")
    print(f"GEMINI ENABLED: {bool(settings.GEMINI_API_KEY)}")
    print(f"SUPABASE ENABLED: {bool(settings.SUPABASE_URL)}")
    print(f"ADZUNA ENABLED: {bool(settings.ADZUNA_APP_ID)}")

    print("=" * 50)

    logger.info("Application configuration loaded successfully")

    return settings