import functions_framework


@functions_framework.cloud_event
def log_new_file(cloud_event):
    data = cloud_event.data
    file_name = data["name"]
    bucket_name = data["bucket"]

    print(f"Cloud Function Triggered!")
    print(f"File: {file_name}")
    print(f"Bucket: {bucket_name}")