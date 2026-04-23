import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from ..db import tinydb_schema as db
from ..config import get_settings

settings = get_settings()

def create_access_token(data: dict):
    """Generates a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt =jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt