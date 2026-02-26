from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="Hospital ERP AI Assistant", alias="APP_NAME")
    app_env: str = Field(default="dev", alias="APP_ENV")
    app_jwt_secret: str = Field(default="change-me-strong-secret", alias="APP_JWT_SECRET")
    app_jwt_algorithm: str = Field(default="HS256", alias="APP_JWT_ALGORITHM")

    erp_base_url: str = Field(default="https://erp.example-hospital.com", alias="ERP_BASE_URL")
    erp_token_url: str = Field(default="https://erp.example-hospital.com/oauth2/token", alias="ERP_TOKEN_URL")
    erp_client_id: str = Field(default="", alias="ERP_CLIENT_ID")
    erp_client_secret: str = Field(default="", alias="ERP_CLIENT_SECRET")
    erp_scope: str = Field(default="beds:read claims:read appointments:read records:read", alias="ERP_SCOPE")

    cache_beds_ttl: int = Field(default=15, alias="CACHE_BEDS_TTL")
    cache_slots_ttl: int = Field(default=30, alias="CACHE_SLOTS_TTL")

    database_url: str = Field(default="sqlite+aiosqlite:///./erp_ai_assistant.db", alias="DATABASE_URL")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
