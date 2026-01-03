from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import pytz

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Productivity App"
    API_V1_STR: str = "/api/v1"

    # Database
    MONGO_CONNECTION_STRING: str = "mongodb+srv://Student:student123@studentmgmtcluster.hn1j5la.mongodb.net/?retryWrites=true&w=majority&appName=StudentMgmtCluster"
    DATABASE_NAME: str = "student_app_v2"

    # Security
    SECRET_KEY: str = "super_secret_key_change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 

    ADMIN_USER: str = "admin"
    ADMIN_PASS: str = "admin123"

    ALLOWED_WIFI_SSID: List[str] = ["TECHSKILLS", "TECHSKILLS_5G"]

    # ===============================
    # 📧 NEW EMAIL CONFIG (BREVO API)
    # ===============================
    # Render Dashboard me "EMAIL_API_KEY" naam se variable add karna
    EMAIL_API_KEY: str = "xkeysib-YOUR_KEY_HERE_IF_LOCAL" 
    
    # Sender Email (Jo Brevo me account banate waqt use kiya tha)
    EMAIL_SENDER: str = "itsoft404@gmail.com" 
    
    TIMEZONE: str = "Asia/Kolkata"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()
IST = pytz.timezone(settings.TIMEZONE)
