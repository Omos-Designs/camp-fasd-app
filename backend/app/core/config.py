"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "CAMP FASD Application Portal"
    DEBUG: bool = True
    API_VERSION: str = "v1"

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback/google"

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    # SendGrid
    SENDGRID_API_KEY: str
    SENDGRID_FROM_EMAIL: str
    SENDGRID_FROM_NAME: str = "CAMP FASD"

    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png"]

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://camp-fasd.vercel.app"
    ]

    # Email Configuration
    EMAIL_REMINDER_INTERVALS: List[int] = [60, 80]  # Completion percentages

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings
