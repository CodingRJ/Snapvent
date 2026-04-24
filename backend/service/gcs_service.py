from google.cloud import storage
from datetime import timedelta
from ..config import get_settings
from typing import Optional

settings = get_settings()

# Initialize the GCS client.
# NOTE: This requires the GOOGLE_APPLICATION_CREDENTIALS environment variable
# to be set, pointing to your service account JSON key file!
storage_client = storage.Client()

def generate_signed_upload_url(object_name: str, content_type: str, expiration_minutes: int = 15) -> str:
    """
    Generates a v4 signed URL for uploading a file using HTTP PUT.
    """
    bucket = storage_client.bucket(settings.gcs_bucket_name)
    blob = bucket.blob(object_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expiration_minutes),
        method="PUT",
        content_type=content_type
    )
    return url

def generate_signed_download_url(
    object_name: str,
    expiration_minutes: int = 60,
    bucket_name: Optional[str] = None
) -> str:
    """
    Generates a v4 signed URL for downloading a file.
    """
    target_bucket = bucket_name if bucket_name else settings.gcs_bucket_name
    bucket = storage_client.bucket(target_bucket)
    blob = bucket.blob(object_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expiration_minutes),
        method="GET",
    )
    return url

def delete_blob(object_name: str, bucket_name: Optional[str] = None):
    """Deletes a file from Google Cloud Storage."""
    try:
        target_bucket = bucket_name if bucket_name else settings.gcs_bucket_name
        bucket = storage_client.bucket(target_bucket)
        blob = bucket.blob(object_name)
        blob.delete()
    except Exception as e:
        print(f"Warning: Could not delete {object_name} from {target_bucket}. Reason: {e}")