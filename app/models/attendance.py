from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId

class AttendanceBase(BaseModel):
    date: str  # Format: "YYYY-MM-DD"
    status: str = "Active"  # Active, Absent, Completed

class AttendanceInDB(AttendanceBase):
    id: Optional[str] = Field(alias="_id")
    student_id: str  # Link to the student who checked in
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    tasks_description: Optional[str] = None
    proof_url: Optional[str] = None
    
    class Config:
        populate_by_name = True

# Response Model (What the user sees)
class AttendanceResponse(AttendanceBase):
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    tasks_description: Optional[str] = None