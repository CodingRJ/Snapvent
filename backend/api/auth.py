from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

from backend.service.auth_service import create_access_token
from ..db import tinydb_schema as db

router = APIRouter()

class RegisterIn(BaseModel):
    username: str
    email: str
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register")
def register(payload: RegisterIn = Body(...)):
    try:
        user = db.create_user(payload.username, payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Session Management: Create a database record of the session
    db.create_session(user["user_id"]) 
    
    # JWT Logic: Create the token
    access_token = create_access_token(data={
    "username": user["username"], 
    "email": user["user_email"], 
    "user_id": user["user_id"]
    })

    return {"user_id": user["user_id"], "access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(payload: LoginIn = Body(...)):
    # Authenticate user (Logic handled by db module)
    user = db.authenticate_user(payload.username, payload.password) 
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    
    # Session Management: Create a database record of the session
    db.create_session(user["user_id"]) 
    
    # JWT Logic: Create the token
    access_token = create_access_token(data={
    "username": user["username"], 
    "email": user["user_email"], 
    "user_id": user["user_id"]
    })
    
    return {"access_token": access_token, "token_type": "bearer"}
