import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from ..db import tinydb_schema as db
from ..config import get_settings
from passlib.context import CryptContext

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    """Generates a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt =jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def hash_password(password: str) -> str:
    """Returns a bcrypt hashed string (includes salt)."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies the plain text password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)