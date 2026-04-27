# Install uv
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Change the working directory to the `app` directory
WORKDIR /app

# Install dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project

# Copy the project into the image
COPY . /app

# Sync the project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

ENV SECRET_KEY="your_secret_key"
ENV ALGORITHM="HS256"
ENV ACCESS_TOKEN_EXPIRE_MINUTES=30
ENV DB_PATH="/db/snapvent_db.json"
ENV GCS_BUCKET_NAME="m245-snapvent"
ENV GCS_THUMBNAIL_BUCKET_NAME="m245-snapvent-thumbnails"
   # IMPORTANT: Use the ABSOLUTE path to your JSON key file. 
   # Do NOT put the key file inside this Git repository!
ENV GOOGLE_APPLICATION_CREDENTIALS="/auth/google-api-key.json"
ENV BASE_URL="https://api2.snapvent.ch"
ENV GCS_SERVICE_ACCOUNT_EMAIL="snapvent@m245-snapvent.iam.gserviceaccount.com"

CMD ["uv", "run", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]