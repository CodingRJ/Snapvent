from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # App Settings
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database Settings
    db_path: str = "snapvent_db.json"

    # Google Cloud Settings
    gcs_bucket_name: str = ""
    gcs_thumbnail_bucket_name: str = ""

    # Webhook OIDC Settings
    base_url: str = "http://127.0.0.1:8000"
    gcs_service_account_email: str = ""

    # Tell Pydantic to read from a .env file
    model_config = SettingsConfigDict(env_file=("backend/.env", ".env"), extra="ignore")

@lru_cache()
def get_settings():
    """Returns a cached instance of the settings to avoid re-reading the file."""
    return Settings()