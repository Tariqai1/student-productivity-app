from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App Info
    PROJECT_NAME: str = "Student Productivity App"
    API_V1_STR: str = "/api/v1"

    # ===============================
    # DATABASE 🗄️
    # ===============================
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
    
    # 👇 CHANGE HERE: Use Port 465 for SSL (Fixes Render Issue)
    EMAIL_PORT: int = 465 
    
    EMAIL_SENDER: str = "itsoft404@gmail.com"
    # Note: Ensure this is a Google App Password, not your login password
    EMAIL_PASSWORD: str = "fagbpflegfwegswk"

    class Config:
        case_sensitive = True

# Global Settings Object
settings = Settings()
