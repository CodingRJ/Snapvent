import jwt
from fastapi import HTTPException, Header
from datetime import datetime, timedelta
from ..config import get_settings
from passlib.context import CryptContext

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

def verify_access_token(token: str):
    """
    Decodes and verifies a JWT token.
    Returns the payload if valid, otherwise raises an HTTPException.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.secret_key, 
            algorithms=[settings.algorithm]
        )
        # Check if 'sub' (user_id) exists in payload
        user_id: str = payload.get("user_id")
        if user_id is None:
            return jwt.InvalidTokenError("Token missing user_id")
        return payload
    except jwt.ExpiredSignatureError:
        return jwt.ExpiredSignatureError("Token has expired")
    except jwt.InvalidTokenError:
        return jwt.InvalidTokenError("Invalid token")


# -- FastAPI Dependency Helpers ------------------------------------------------

def verify_token(x_token: str = Header(...)):
    """Simply verifies the token exists and is valid."""
    try:
        verify_access_token(x_token)
        return True
    except jwt.PyJWTError:
        # Catching any JWT error from the service layer
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def verify_token_and_get_user_id(x_token: str = Header(...)) -> str:
    """Helper to verify token and return user_id, or raise 401."""
    try:
        payload = verify_access_token(x_token)
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=str(e))