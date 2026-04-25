import functions_framework
import os
import io
import json
import urllib.request
from google.cloud import storage
from PIL import Image
from pillow_heif import register_heif_opener
import google.auth.transport.requests
import google.oauth2.id_token

register_heif_opener()
storage_client = storage.Client()

THUMBNAIL_BUCKET_NAME = os.environ.get("THUMBNAIL_BUCKET_NAME", "m245-snapvent-thumbnails")
BACKEND_URL = os.environ.get("BACKEND_URL", "https://snapvent.ch/api/webhooks/gcs")


@functions_framework.cloud_event
def process_image(cloud_event):
    """Triggered by a change to a Cloud Storage bucket."""
    data = cloud_event.data
    bucket_name = data["bucket"]
    file_name = data["name"]
    file_size = data.get("size", 0)

    print(f"Processing file: {file_name} from bucket: {bucket_name}")

    source_bucket = storage_client.bucket(bucket_name)
    source_blob = source_bucket.blob(file_name)

    try:
        image_bytes = source_blob.download_as_bytes()
    except Exception as e:
        print(f"Could not download file. It might have been deleted: {e}")
        return

    try:
        img = Image.open(io.BytesIO(image_bytes))
        original_format = img.format if img.format else "JPEG"

        img.thumbnail((400, 400))

        thumb_io = io.BytesIO()
        img.save(thumb_io, format=original_format)

        # Reset the buffer's pointer
        thumb_io.seek(0)
    except Exception as e:
        print(f"Error resizing image {file_name}: {e}")
        return

    try:
        dest_bucket = storage_client.bucket(THUMBNAIL_BUCKET_NAME)
        dest_blob = dest_bucket.blob(file_name)

        dest_blob.upload_from_file(thumb_io, content_type=source_blob.content_type)
        print(f"Successfully uploaded thumbnail to {THUMBNAIL_BUCKET_NAME}/{file_name}")
    except Exception as e:
        print(f"Error uploading thumbnail: {e}")
        return

    notify_backend(file_name, file_size)


def notify_backend(gcs_path: str, file_size: int):
    """Sends a POST request to the backend."""
    try:
        auth_req = google.auth.transport.requests.Request()
        token = google.oauth2.id_token.fetch_id_token(auth_req, BACKEND_URL)

        payload = json.dumps({
            "gcs_path": gcs_path,
            "file_size_bytes": int(file_size)
        }).encode("utf-8")

        req = urllib.request.Request(BACKEND_URL, data=payload)
        req.add_header("Authorization", f"Bearer {token}")
        req.add_header("Content-Type", "application/json")

        response = urllib.request.urlopen(req)
        print(f"Backend notified successfully: HTTP {response.getcode()}")

    except urllib.error.HTTPError as e:
        print(f"Backend rejected the webhook: {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")