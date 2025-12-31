from pydantic import BaseModel, EmailStr
from typing import Optional

# 1. FORGOT PASSWORD & RESET
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# 2. REGISTRATION SCHEMA (Updated to fix 422 Error)
class StudentRegister(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    
    # 👇 Maine inhein Optional bana diya hai taaki Registration fail na ho
    # Agar Frontend ye data nahi bhejta, to koi error nahi aayega.
    course: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    mentor_name: Optional[str] = None

# 3. LOGIN SCHEMA
class LoginSchema(BaseModel):
    username: str
    password: str

# 4. TOKEN SCHEMA
class Token(BaseModel):
    access_token: str
    token_type: str
    username: str