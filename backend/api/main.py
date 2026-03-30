from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router
from .groups import router as groups_router
from .pictures import router as pictures_router

app = FastAPI(title="Snapvent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(groups_router, prefix="/api/groups")
app.include_router(pictures_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Snapvent API running"}
