from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "PresentIQ API"
    secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    database_url: str = "sqlite:///./data/app.db"

    # Next.js dev server uses 3000-3002 range
    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:8080,http://127.0.0.1:8080,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3001,http://127.0.0.1:3001,"
        "http://localhost:3002,http://127.0.0.1:3002"
    )

    data_dir: Path = Path(__file__).resolve().parent.parent / "data"
    upload_dir: Path = data_dir / "uploads"
    ml_artifacts_dir: Path = Path(__file__).resolve().parent.parent / "ml_models_combined"

    max_upload_mb: int = 1024

    whisper_model_size: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"

    # Email (optional — leave blank to use console-only mode)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""        # your Gmail address
    smtp_password: str = ""    # Gmail App Password (not your login password)
    smtp_from: str = "PresentIQ <noreply@presentiq.com>"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
