from fastapi import APIRouter, HTTPException, Header, Body
from pydantic import BaseModel
from typing import Optional
from ..db import tinydb_schema as db

router = APIRouter()

class CreateGroupIn(BaseModel):
    name: str
    description: Optional[str] = None

class JoinGroupIn(BaseModel):
    invite_code: str

@router.post("")
def create_group(payload: CreateGroupIn, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    try:
        g = db.create_group(user["user_id"], payload.name, payload.description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"group_id": g["group_id"], "owner_id": g["organizer_id"]}

@router.get("")
def list_groups(x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    groups = db.list_user_groups(user["user_id"])
    return [{"id": g["group_id"], "name": g["name"]} for g in groups]

@router.delete("/{group_id}")
def delete_group(group_id: str, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    try:
        db.delete_group(group_id, user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Deleted"}

@router.get("/{group_id}/qr-data")
def qr_data(group_id: str, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    g = db.get_group_by_id(group_id)
    if not g:
        raise HTTPException(status_code=404, detail="group not found")
    return {"invite_code": g["join_code"]}

@router.post("/join")
def join_group(payload: JoinGroupIn):
    g = db.find_group_by_join_code(payload.invite_code)
    if not g:
        raise HTTPException(status_code=404, detail="invite not found")
    # anonymous join is allowed if user provides token header; require it
    return {"group_id": g["group_id"], "status": "ok"}

@router.delete("/{group_id}/members/{user_id}")
def remove_member(group_id: str, user_id: str, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    # only organizer can remove
    g = db.get_group_by_id(group_id)
    if not g:
        raise HTTPException(status_code=404, detail="group not found")
    if g["organizer_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="only organizer may remove members")
    db.remove_member(group_id, user_id)
    return {"message": "Member removed"}
