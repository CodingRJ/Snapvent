# Snapvent backend

This backend uses FastAPI for the HTTP API and TinyDB as the embedded JSON database.

## Requirements

- Python 3.8+ (project contains .pyc files for Python 3.11 but any modern Python 3 should work).
- PowerShell (Windows) or a POSIX shell for the commands below.

## Main libraries used

- `fastapi` — web framework for the API
- `uvicorn` — ASGI server to run the FastAPI app
- `tinydb` — lightweight JSON database used by the project
- `python-multipart` — (optional) required if the API accepts file uploads via form data

## Install dependencies (Windows PowerShell)

1. From the `backend` folder create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install the required packages:

```powershell
pip install fastapi "uvicorn[standard]" tinydb python-multipart
```

## Start the backend

Run the FastAPI app with Uvicorn from the `backend` directory:

```powershell
cd c:\Users\ambauer1\Documents\Snapvent\backend
.\.venv\Scripts\Activate.ps1
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
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
