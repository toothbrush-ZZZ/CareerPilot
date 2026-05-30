from supabase import create_client, AsyncClient
from jose import jwt, JWTError
from fastapi import HTTPException, status
from app.core.config import get_settings

settings = get_settings()

_admin_client: AsyncClient = None

async def get_supabase_admin() -> AsyncClient:
    global _admin_client
    if not _admin_client:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set to use Supabase admin client")
        _admin_client = await create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_KEY
        )
    return _admin_client

def verify_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM],
            audience="authenticated" # Default Supabase audience
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
