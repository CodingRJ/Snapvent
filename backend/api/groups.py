from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from ..db import tinydb_schema as db
from backend.service.auth_service import verify_token_and_get_user_id, verify_token
from ..service import gcs_service
from ..config import get_settings

settings = get_settings()
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
        return {"group_id": g["group_id"], "owner_id": g["organizer_id"]}
    except db.ResourceNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
def list_groups(user_id: str = Depends(verify_token_and_get_user_id)):
    return db.list_user_groups(user_id)

@router.delete("/{group_id}")
def delete_group(group_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        paths_to_delete = db.delete_group(group_id, user_id)

        for path in paths_to_delete:
            gcs_service.delete_blob(path)
            gcs_service.delete_blob(path, bucket_name=settings.gcs_thumbnail_bucket_name)

        return {"message": "Group deleted successfully"}
    except db.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except db.ResourceNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{group_id}/qr-data")
def qr_data(group_id: str, _ = Depends(verify_token)):
    g = db.get_group_by_id(group_id)
    if not g:
        raise HTTPException(status_code=404, detail="group not found")
    return {"invite_code": g["join_code"]}

@router.post("/join")
def join_group(payload: JoinGroupIn, user_id: str = Depends(verify_token_and_get_user_id)):
    g = db.get_group_by_join_code(payload.invite_code)
    if not g:
        raise HTTPException(status_code=404, detail="invite not found")
    try:
        db.add_member(user_id, g["group_id"], role="member")
        return {"group_id": g["group_id"], "status": "ok"}
    except db.ResourceNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{group_id}/members/{member_id}")
def remove_member(group_id: str, member_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        db.remove_member(group_id, member_id, user_id)
        return {"message": "Member removed"}
    except db.ResourceNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except db.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
