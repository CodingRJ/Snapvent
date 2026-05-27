from fastapi import APIRouter, HTTPException, Body, Header
from pydantic import BaseModel
try:
    from service.auth_service import create_access_token, hash_password, verify_password
    from db import tinydb_schema as db
except ModuleNotFoundError:
    from backend.service.auth_service import create_access_token, hash_password, verify_password
    from backend.db import tinydb_schema as db

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
    # Hash the password before saving it to the database
    hashed_pwd = hash_password(payload.password)
    
    try:
        # Pass the hashed password to the database
        user = db.create_user(payload.username, payload.email, hashed_pwd)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    db.create_session(user["user_id"]) 
    
    access_token = create_access_token(data={
        "username": user["username"], 
        "email": user["user_email"], 
        "user_id": user["user_id"]
    })

    return {"user_id": user["user_id"], "access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(payload: LoginIn = Body(...)):
    # 1. Fetch the user by username to get the stored hash
    user = db.get_user_by_username(payload.username)
    
    # 2. Verify the password hash
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="invalid credentials")
    
    db.create_session(user["user_id"]) 
    
    access_token = create_access_token(data={
        "username": user["username"], 
        "email": user["user_email"], 
        "user_id": user["user_id"]
    })
    
    return {"access_token": access_token, "token_type": "bearer"}