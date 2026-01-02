from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import pytz  # 👈 Indian Time ke liye zaroori import

class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "Student Productivity App"
    API_V1_STR: str = "/api/v1"

    # ===============================
    # DATABASE 🗄️
    # ===============================
    # Local/Default Value. Render par Environment Variables isse override kar denge.
    MONGO_CONNECTION_STRING: str = "mongodb+srv://Student:student123@studentmgmtcluster.hn1j5la.mongodb.net/?retryWrites=true&w=majority&appName=StudentMgmtCluster"
    DATABASE_NAME: str = "student_app_v2"

    # ===============================
    # SECURITY & AUTH 🔐
    # ===============================
    SECRET_KEY: str = "super_secret_key_change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 Day

    # Admin Credentials
    ADMIN_USER: str = "admin"
    ADMIN_PASS: str = "admin123"

    # ===============================
    # WIFI SECURITY 📶
    # ===============================
    ALLOWED_WIFI_SSID: List[str] = ["TECHSKILLS", "TECHSKILLS_5G"]

    # ===============================
    # EMAIL CONFIGURATION 📧
    # ===============================
    EMAIL_HOST: str = "smtp.gmail.com"
    
    # ✅ FIX: Port 465 (SSL) use kar rahe hain. 
    # Yeh Local aur Render dono par "Network Unreachable" error nahi deta.
    EMAIL_PORT: int = 465 
    
    EMAIL_SENDER: str = "itsoft404@gmail.com"
    EMAIL_PASSWORD: str = "fagbpflegfwegswk"

    # 🇮🇳 TIMEZONE CONFIGURATION
    TIMEZONE: str = "Asia/Kolkata"

    # ===============================
    # PYDANTIC CONFIGURATION (New Style)
    # ===============================
    # Yeh code ko smart banata hai: 
    # 1. Local par .env file dhundega.
    # 2. Render par wahan ke variables uthayega.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=True
    )

# Global Settings Object
settings = Settings()

# 🌍 GLOBAL IST OBJECT 
# Jahan bhi time chahiye, isko import karein: from app.core.config import IST
IST = pytz.timezone(settings.TIMEZONE)
