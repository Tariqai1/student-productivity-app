from pydantic import BaseModel
from typing import Optional

# 1. Update Schema (Data user can change)
class StudentUpdate(BaseModel):
    phone_number: Optional[str] = None
    address: Optional[str] = None
    mentor_name: Optional[str] = None
    course: Optional[str] = None

# 2. Profile Schema (Data sent to frontend)
class StudentProfile(BaseModel):
    full_name: str
    username: str
    email: str
    course: str
    phone_number: str
    address: Optional[str] = None
    mentor_name: Optional[str] = None
    is_active: bool