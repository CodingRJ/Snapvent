from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from ..db import tinydb_schema as db

router = APIRouter()

class RegisterIn(BaseModel):
    username: str
    email: str
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(payload: RegisterIn = Body(...)):
    try:
        user = db.create_user(payload.username, payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "User created", "user_id": user["user_id"]}

@router.post("/login")
def login(payload: LoginIn = Body(...)):
    user = db.authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = db.create_session(user["user_id"])
    return {"token": token}
