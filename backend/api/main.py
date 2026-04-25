from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router
from .groups import router as groups_router
from .pictures import router as pictures_router
from .webhooks import router as webhooks_router

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
