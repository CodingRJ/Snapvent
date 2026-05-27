from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    # Works when running from backend directory (e.g. `uvicorn main:app`)
    from api.auth import router as auth_router
    from api.groups import router as groups_router
    from api.pictures import router as pictures_router
    from api.webhooks import router as webhooks_router
except ModuleNotFoundError:
    # Works when running from repo root (e.g. `uvicorn backend.main:app`)
    from backend.api.auth import router as auth_router
    from backend.api.groups import router as groups_router
    from backend.api.pictures import router as pictures_router
    from backend.api.webhooks import router as webhooks_router

app = FastAPI(title="Snapvent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(groups_router, prefix="/api/groups", tags=["Groups"])
app.include_router(pictures_router, prefix="/api", tags=["Pictures & Gallery"])
app.include_router(webhooks_router, prefix="/api/webhooks", tags=["Webhooks"])

@app.get("/")
def root():
    return {"message": "Snapvent API running"}
