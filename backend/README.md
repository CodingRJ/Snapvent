# Snapvent backend
This backend uses FastAPI for the HTTP API and TinyDB as the embedded JSON database.

## Setup Python venv

```powershell
// Move to the root folder
cd c:\Users\ambauer1\Documents\Snapvent\
```

1. From the `backend` folder create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
## Install dependencies

2. Install the required packages:

```powershell
pip install -r .\backend\requirements.txt
```

## Configuration

1. Create a `.env` file in the `backend/` directory.
2. Add the following required variables:
   ```env
   SECRET_KEY="your_secret_key"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DB_PATH="snapvent_db.json"

## Start the backend

Run the FastAPI app with Uvicorn from the `backend` directory:

```powershell
// Activate venv if not already done
.\.venv\Scripts\Activate.ps1

// Install uvicorn
uvicorn backend.api.main:app --reload --host 127.0.0.1 --port 8000
```

- The `--reload` flag enables auto-reload during development.
- The import path `api.main:app` matches `backend/api/main.py` where the FastAPI `app` instance is defined.

The API will then be available at: http://127.0.0.1:8000/

To view automatic API docs provided by FastAPI:

- Open http://127.0.0.1:8000/docs (Swagger UI)

## Database file

TinyDB stores data in a JSON file. This project includes `snapvent_db.json` at the repository root which is used by the backend.

- Backup this file if you need to preserve data.
- For a fresh start, stop the server and remove or rename the JSON file.

## Notes

- CORS is enabled to allow requests from any origin (configured in `api/main.py`).
- Adjust package versions in `requirements.txt` if you need pinning for deployments.
