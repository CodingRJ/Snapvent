from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from db import tinydb_schema as db
from service.auth_service import verify_token_and_get_user_id
from service import gcs_service
from config import get_settings
settings = get_settings()

router = APIRouter()

class UploadUrlIn(BaseModel):
    content_type: str

# ToDo check if this list is correct and complete
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heic": ".heic", # Common for modern iPhones
    "image/heif": ".heif"
}

@router.post("/groups/{group_id}/pictures")
def get_upload_url(group_id: str, payload: UploadUrlIn, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        db.verify_membership(user_id, group_id)

        ext = ALLOWED_IMAGE_TYPES.get(payload.content_type)
        if not ext:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed types are: {', '.join(ALLOWED_IMAGE_TYPES.keys())}"
            )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        object_name = f"{group_id}/{timestamp}_{db._new_uuid()}{ext}"

        image = db.add_image(group_id, user_id, object_name)

        upload_url = gcs_service.generate_signed_upload_url(object_name, payload.content_type)

        return {
            "upload_url": upload_url,
            "picture_id": image["image_id"]
        }
    except db.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except db.ResourceNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/groups/{group_id}/thumbnails")
def list_thumbnails(group_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        db.verify_membership(user_id, group_id)
        images = db.get_images_by_group(group_id)

        output = []
        for img in images:
            # Tell the service to use the THUMBNAIL bucket
            thumb_url = gcs_service.generate_signed_download_url(
                object_name=img["gcs_path"],
                bucket_name=settings.gcs_thumbnail_bucket_name
            )

            output.append({
                "id": img["image_id"],
                "thumb_url": thumb_url
            })
        return output
    except db.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/pictures/{picture_id}")
def get_picture(picture_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        img = db.get_image_by_id(picture_id)
        if not img:
            raise HTTPException(status_code=404, detail="Picture not found")

        db.verify_membership(user_id, img["group_id"])

        uploader = db.get_user_by_id(img["uploader_id"])

        download_url = gcs_service.generate_signed_download_url(img["gcs_path"])

        return {
            "id": img["image_id"],
            "full_url": download_url,
            "uploader": uploader["username"] if uploader else "Unknown"
        }
    except db.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/pictures/{picture_id}")
def delete_picture(picture_id: str, user_id: str = Depends(verify_token_and_get_user_id)):
    try:
        gcs_path = db.delete_image(picture_id, user_id)

        gcs_service.delete_blob(gcs_path)

        gcs_service.delete_blob(gcs_path, bucket_name=settings.gcs_thumbnail_bucket_name)

        return {"message": "Deleted"}
    except db.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except db.ResourceNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
