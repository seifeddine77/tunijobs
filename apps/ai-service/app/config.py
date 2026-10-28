from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    GEMINI_API_KEY: str = ""
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:4000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
