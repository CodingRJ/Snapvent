from fastapi import APIRouter, HTTPException, Header, Body
from pydantic import BaseModel
from typing import Optional
from ..db import tinydb_schema as db

router = APIRouter()

class UploadUrlIn(BaseModel):
    filename: str

@router.post("/groups/{group_id}/pictures")
def get_upload_url(group_id: str, payload: UploadUrlIn, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    # Simplified: return a placeholder upload_url and create image record
    # In production, generate S3 presigned URL
    file_url = f"https://example-bucket.s3.amazonaws.com/{payload.filename}"
    image = db.add_image(group_id, user["user_id"], file_url, 0)
    return {"upload_url": f"https://s3-presigned.example/{payload.filename}", "picture_id": image["image_id"]}

@router.get("/groups/{group_id}/thumbnails")
def list_thumbnails(group_id: str, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    thumbs = [ {"id": img["image_id"], "thumb_url": img["image_url"]} for img in db.images.search(db.Q.group_id == group_id) ]
    return thumbs

@router.get("/pictures/{picture_id}")
def get_picture(picture_id: str, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    img = db.get_image_by_id(picture_id)
    if not img:
        raise HTTPException(status_code=404, detail="picture not found")
    return {"id": img["image_id"], "full_url": img["image_url"], "uploader": db.get_user_by_id(img["uploader_id"])["username"]}

@router.delete("/pictures/{picture_id}")
def delete_picture(picture_id: str, x_token: Optional[str] = Header(None)):
    user = db.get_user_by_token(x_token) if x_token else None
    if not user:
        raise HTTPException(status_code=401, detail="authentication required")
    try:
        db.delete_image(picture_id, user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Deleted"}
