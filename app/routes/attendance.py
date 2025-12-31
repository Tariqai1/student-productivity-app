from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.database import get_database
from app.core.deps import get_current_user
from pydantic import BaseModel, Field
from datetime import datetime
import pytz 
from typing import Optional
from bson import ObjectId
import shutil
import os
import uuid

router = APIRouter()

# 🇮🇳 STRICT INDIAN STANDARD TIME (IST) CONFIGURATION
IST = pytz.timezone('Asia/Kolkata')

# 🛠 Models
class CheckOutRequest(BaseModel):
    tasks: str = Field(..., min_length=5, description="Aaj kya padha uski details")
    proof_url: Optional[str] = None # 👈 URL of the uploaded file
    doubts: Optional[str] = None

# 🧠 INTERNAL HELPER: Get Current IST Time
def get_ist_time():
    """
    Returns current time strictly in IST.
    Removes microseconds for clean database storage.
    """
    return datetime.now(IST).replace(microsecond=0)

# ==========================================
# 1. UPLOAD TASK PROOF 📂 (New Feature)
# ==========================================
@router.post("/upload-proof")
async def upload_proof(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Uploads a screenshot or PDF proof of work.
    Saves to 'static/proofs/' directory.
    """
    # 1. Ensure Directory Exists (Robustness)
    upload_dir = "static/proofs"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # 2. Validate File Type (Optional Security)
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only Images (JPG/PNG) and PDF allowed!")

    # 3. Generate Unique Filename
    # Format: username_date_uuid.ext
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{current_user['username']}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = f"{upload_dir}/{unique_filename}"
    
    # 4. Save File Locally
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save file on server")

    # 5. Generate Public URL
    # Note: In production, change localhost to your domain
    proof_url = f"http://localhost:8000/{file_path}"
    
    return {
        "message": "Proof uploaded successfully! 📎", 
        "url": proof_url
    }

# ==========================================
# 2. CHECK-IN (Strict: Once Per Day)
# ==========================================
@router.post("/check-in")
async def check_in(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    now_ist = get_ist_time()
    today_start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now_ist.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    existing_log = await db["attendance"].find_one({
        "student_id": str(current_user["_id"]),
        "date": {"$gte": today_start, "$lte": today_end}
    })
    
    if existing_log:
        raise HTTPException(
            status_code=400, 
            detail="⚠️ You have already checked in today! Discipline is key - one focused session per day."
        )

    new_entry = {
        "student_id": str(current_user["_id"]),
        "date": now_ist,          
        "check_in_time": now_ist, 
        "check_out_time": None,   
        "status": "In Progress",  
        "tasks": None,
        "proof_url": None,        
        "doubts": None,
        "rating": None,           
        "duration_hours": 0       
    }
    
    await db["attendance"].insert_one(new_entry)
    
    return {
        "message": "✅ Check-in Successful! Your productivity timer has started.",
        "time": now_ist.strftime("%I:%M %p")
    }

# ==========================================
# 3. CHECK-OUT (With Task Report & Proof)
# ==========================================
@router.post("/check-out")
async def check_out(data: CheckOutRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    now_ist = get_ist_time()
    today_start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now_ist.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    attendance_entry = await db["attendance"].find_one({
        "student_id": str(current_user["_id"]),
        "date": {"$gte": today_start, "$lte": today_end}
    })
    
    if not attendance_entry:
        raise HTTPException(status_code=400, detail="⚠️ No active session found for today.")

    if attendance_entry.get("status") == "Completed":
        raise HTTPException(status_code=400, detail="✅ Session already completed!")

    # Calculate Duration
    check_in_time = attendance_entry["check_in_time"]
    if check_in_time.tzinfo is None:
        check_in_time = pytz.utc.localize(check_in_time).astimezone(IST)
        
    duration_seconds = (now_ist - check_in_time).total_seconds()
    hours_spent = round(duration_seconds / 3600, 2)

    # Update Entry
    await db["attendance"].update_one(
        {"_id": attendance_entry["_id"]},
        {"$set": {
            "check_out_time": now_ist,
            "status": "Completed",
            "tasks": data.tasks,
            "proof_url": data.proof_url, # 👈 Saving the Proof URL
            "doubts": data.doubts,
            "duration_hours": hours_spent
        }}
    )
    
    return {
        "message": f"🎉 Session Ended! You focused for {hours_spent} hours today.",
        "duration": f"{hours_spent} hrs"
    }

# ==========================================
# 4. GET MY HISTORY
# ==========================================
@router.get("/my-history")
async def get_my_history(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    cursor = db["attendance"].find(
        {"student_id": str(current_user["_id"])}
    ).sort("date", -1)
    
    logs = await cursor.to_list(length=365)
    
    cleaned_logs = []
    for log in logs:
        log["_id"] = str(log["_id"])
        log["student_id"] = str(log["student_id"])
        
        # ISO Format Dates for Frontend
        if log.get("date"): log["date"] = log["date"].isoformat()
        if log.get("check_in_time"): log["check_in_time"] = log["check_in_time"].isoformat()
        if log.get("check_out_time"): log["check_out_time"] = log["check_out_time"].isoformat()
            
        cleaned_logs.append(log)
            
    return cleaned_logs