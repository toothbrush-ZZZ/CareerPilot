from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # AI Models
    GROQ_API_KEY: str
    GEMINI_API_KEY: str
    GROQ_CHAT_MODEL: str = "llama3-70b-8192"
    GROQ_FAST_MODEL: str = "llama3-8b-8192"
    
    # External APIs
    ADZUNA_APP_ID: str
    ADZUNA_API_KEY: str
    ADZUNA_BASE_URL: str = "https://api.adzuna.com/v1/api/jobs"
    
    # Infrastructure
    POSTGRES_URL: str
    REDIS_URL: str
    EMBED_URL: str
    
    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
