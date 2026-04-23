from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from ..db import tinydb_schema as db
from backend.service.auth_service import verify_token_and_get_user_id, verify_token
router = APIRouter()

class CreateGroupIn(BaseModel):
    name: str
    description: Optional[str] = None

class JoinGroupIn(BaseModel):
    invite_code: str
    

# -- Groups ----------------------------------------------------------------
@router.post("")
def create_group(payload: CreateGroupIn, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        g = db.create_group(user_id, payload.name, payload.description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"group_id": g["group_id"], "owner_id": g["organizer_id"]}

@router.get("")
def list_groups(user_id: str = Depends(verify_token_and_get_user_id)):
    memberships = db.group_members.search(db.Q.user_id == user_id)
    return [{"group_id": m["group_id"], "role": m["role"]} for m in memberships]


@router.delete("/{group_id}")
def delete_group(group_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        db.delete_group(group_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Deleted"}

@router.get("/{group_id}/qr-data")
def qr_data(group_id: str, _ = Depends(verify_token)):
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

@router.delete("/{group_id}/members/{member_id}")
def remove_member(group_id: str, member_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    # only organizer can remove
    g = db.get_group_by_id(group_id)
    if not g:
        raise HTTPException(status_code=404, detail="group not found")
    if g["organizer_id"] != user_id:
        raise HTTPException(status_code=403, detail="only organizer may remove members")
    db.remove_member(group_id, member_id)
    return {"message": "Member removed"}
