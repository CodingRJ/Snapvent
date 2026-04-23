import os
import datetime
from google.cloud import storage

# 1. Point to your key
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/home/hubschel/Documents/m245/m245-snapvent-ec8f9882c871.json"


def get_simple_upload_url(bucket_name, blob_name):
    # Initialize the client
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    # Generate the Signed URL
    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=30),
        method="PUT",
        content_type="application/octet-stream"
    )
    return url


if __name__ == "__main__":
    BUCKET = "m245-snapvent"
    FILE_NAME = "test_from_python.png"

    generated_url = get_simple_upload_url(BUCKET, FILE_NAME)

    print("\n--- GENERATED SIGNED URL ---")
    print(generated_url)
    print("----------------------------\n")
    print(f"To test this, run this command in your terminal:")
    print(f"curl -X PUT -H 'Content-Type: application/octet-stream' --data-binary '@YOUR_IMAGE.png' '{generated_url}'")