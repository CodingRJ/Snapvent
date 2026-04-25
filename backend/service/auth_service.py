import jwt
from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from ..config import get_settings
from passlib.context import CryptContext

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Returns a bcrypt hashed string (includes salt)."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies the plain text password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """Generates a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt =jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_access_token(token: str) -> dict:
    """
    Decodes and verifies a JWT token.
    Raises jwt exceptions if invalid or expired.
    """
    # jwt.decode already raises ExpiredSignatureError and InvalidTokenError
    payload = jwt.decode(
        token, 
        settings.secret_key, 
        algorithms=[settings.algorithm]
    )
    
    if "user_id" not in payload:
        raise jwt.InvalidTokenError("Token missing user_id")
        
    return payload


# -- FastAPI Dependency Helpers ------------------------------------------------

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Simply verifies the token exists and is valid."""
    try:
        verify_access_token(credentials.credentials)
        return True
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        raise HTTPException(status_code=401, detail=str(e))

def verify_token_and_get_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """FastAPI Dependency: Converts logic errors into HTTP 401s."""
    try:
        payload = verify_access_token(credentials.credentials)
        return payload["user_id"]
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        raise HTTPException(status_code=401, detail=str(e))