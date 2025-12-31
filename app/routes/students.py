from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from app.core.database import get_database
from app.core.deps import get_current_user
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from datetime import datetime
import shutil
import os
import uuid
import pytz

router = APIRouter()
IST = pytz.timezone('Asia/Kolkata')

# ==========================================
# 1. MODELS
# ==========================================
class StudentUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    course: Optional[str] = None
    mentor_name: Optional[str] = None # 👈 Added New Field

class StudentRemarkRequest(BaseModel):
    date: str  # YYYY-MM-DD
    remark: str

# ==========================================
# 2. HELPER FUNCTIONS
# ==========================================
def fix_student_data(student: dict) -> dict:
    """
    Cleans up student data:
    1. Converts ObjectId -> String
    2. Ensures all UI fields exist (avoids undefined errors on frontend)
    """
    new_doc = {}
    
    # 1. Handle ID
    if "_id" in student:
        new_doc["_id"] = str(student["_id"])

    # 2. Copy Existing Data
    for k, v in student.items():
        if k == "_id": continue
        if isinstance(v, ObjectId):
            new_doc[k] = str(v)
        elif isinstance(v, bytes):
            continue 
        else:
            new_doc[k] = v

    # 3. Set Defaults for Missing Fields (Important for Profile Page)
    defaults = {
        "full_name": "", 
        "username": "", 
        "email": "",
        "role": "student", 
        "is_active": True, 
        "image": "",
        "course": "", 
        "phone": "", 
        "address": "", 
        "mentor_name": "" # 👈 Default empty string
    }

    for key, default_val in defaults.items():
        if key not in new_doc or new_doc[key] is None:
            new_doc[key] = default_val

    if "created_at" not in new_doc:
        new_doc["created_at"] = new_doc.get("registered_on")
        
    return new_doc

# ==========================================
# 3. GET MY PROFILE
# ==========================================
@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return fix_student_data(current_user)

# ==========================================
# 4. UPDATE PROFILE DETAILS
# ==========================================
@router.put("/me")
async def update_my_profile(
    updates: StudentUpdateProfile, 
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Only update fields that are sent (not None)
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    if not update_data:
        return {"message": "No data provided to update"}

    await db["students"].update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    return {"message": "Profile updated successfully! 🚀"}

# ==========================================
# 5. UPLOAD PROFILE PICTURE 📸
# ==========================================
@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # 1. Ensure Directory Exists
    upload_dir = "static/images"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # 2. Validate & Save File
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{current_user['username']}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = f"{upload_dir}/{unique_filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save image")

    # 3. Generate URL (Update localhost to domain in production)
    image_url = f"http://127.0.0.1:8000/{file_path}"
    
    # 4. Update Database
    await db["students"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"image": image_url}}
    )
    
    return {"message": "Photo uploaded!", "image_url": image_url}

# ==========================================
# 6. ADD/UPDATE MY REMARK 📝
# ==========================================
@router.post("/remark")
async def add_my_remark(
    data: StudentRemarkRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Student can add a remark (e.g., Sick Leave) for a specific date.
    """
    db = get_database()
    
    # Parse Date
    try:
        target_date = datetime.strptime(data.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Set Time Range for Query
    start_dt = target_date.replace(hour=0, minute=0, second=0)
    end_dt = target_date.replace(hour=23, minute=59, second=59)

    # Check for existing record
    existing_log = await db["attendance"].find_one({
        "student_id": str(current_user["_id"]),
        "date": {"$gte": start_dt, "$lte": end_dt}
    })

    if existing_log:
        # Update existing record
        await db["attendance"].update_one(
            {"_id": existing_log["_id"]},
            {"$set": {"remarks": data.remark}}
        )
    else:
        # Create 'Absent' record with remark if no check-in exists
        new_entry = {
            "student_id": str(current_user["_id"]),
            "date": target_date.replace(hour=12), # Default noon time
            "status": "Absent", 
            "remarks": data.remark,
            "check_in_time": None,
            "check_out_time": None,
            "duration_hours": 0,
            "tasks": None,
            "proof_url": None,
            "doubts": None
        }
        await db["attendance"].insert_one(new_entry)

    return {"message": "Remark added successfully"}