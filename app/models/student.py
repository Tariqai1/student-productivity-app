from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId

# 1. Helper for MongoDB ObjectId
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, values=None, **kwargs):
        if isinstance(v, ObjectId):
            return str(v)
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

# 2. Base Model
class StudentBase(BaseModel):
    full_name: str
    username: str
    email: Optional[str] = None
    role: str = "student"
    is_active: bool = True
    
    # Optional Fields
    course: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phone") 
    address: Optional[str] = None
    mentor_name: Optional[str] = None

# 3. Database Model
class StudentInDB(StudentBase):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        extra = "allow" 

# 4. Response Model (Sent to Frontend)
class StudentResponse(StudentBase):
    id: Optional[PyObjectId] = Field(alias="_id") 
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        # 👇 IMPORTANT FIX: 'allow' ko 'ignore' kiya taaki Binary Password leak na ho
        extra = "ignore" 

# 5. Update Model
class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    course: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    mentor_name: Optional[str] = None