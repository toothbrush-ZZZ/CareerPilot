from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated
from app.core.supabase import verify_jwt

security = HTTPBearer()

async def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    """
    FastAPI dependency to extract and verify the JWT from the Authorization header.
    Returns a dict containing the user_id (sub).
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token"
        )
    
    payload = verify_jwt(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    return {"user_id": user_id, "email": payload.get("email")}

# Type alias for easy use in routes
CurrentUser = Annotated[dict, Depends(get_current_user)]
