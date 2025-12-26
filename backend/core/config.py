"""
Core configuration for Arogya-Swarm backend
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "Arogya-Swarm"
    
    # Database
    DATABASE_URL: str
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "arogya_swarm"
    DB_USER: str = "arogya_user"
    DB_PASSWORD: str = "arogya_pass"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # Google Gemini
    GEMINI_API_KEY: str
    
    # Weather
    OPENWEATHER_API_KEY: str
    
    # AQI
    SAFAR_API_KEY: str = ""
    
    # Nutrition
    USDA_API_KEY: str = ""
    EDAMAM_APP_ID: str = ""
    EDAMAM_APP_KEY: str = ""
    
    # Translation
    MYMEMORY_API_KEY: str = ""
    
    # Messaging
    MSG91_AUTH_KEY: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # Payment
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    
    # Image Storage
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Jitsi
    JITSI_DOMAIN: str = "meet.jit.si"
    JITSI_APP_ID: str = ""
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
