from fastapi import APIRouter, Depends, HTTPException, status, Body
from app.core.database import get_database
from app.core.deps import get_current_admin
from bson import ObjectId
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

# --- Schema for Rating ---
class RatingUpdate(BaseModel):
    rating: int  # 1 to 5
    feedback: str

# 1. Activate / Deactivate Student (Block User)
@router.patch("/users/{student_id}/status")
async def toggle_student_status(student_id: str, is_active: bool, admin: dict = Depends(get_current_admin)):
    db = get_database()
    
    # Check if student exists
    student = await db["students"].find_one({"_id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Update Status
    await db["students"].update_one(
        {"_id": student_id},
        {"$set": {"is_active": is_active}}
    )
    
    status_msg = "Activated" if is_active else "Deactivated"
    return {"message": f"Student {status_msg} successfully"}

# 2. Delete Student (Danger Zone)
@router.delete("/users/{student_id}")
async def delete_student(student_id: str, admin: dict = Depends(get_current_admin)):
    db = get_database()
    
    result = await db["students"].delete_one({"_id": student_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
        
    return {"message": "Student permanently deleted"}

# 3. Rate a Student's Work (For a specific day/attendance)
@router.put("/attendance/{attendance_id}/rate")
async def rate_student_work(
    attendance_id: str, 
    rating_data: RatingUpdate, 
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    
    if not (1 <= rating_data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    result = await db["attendance"].update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": {
            "rating": rating_data.rating, 
            "feedback": rating_data.feedback,
            "rated_by": admin["username"]
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    return {"message": "Rating and feedback submitted successfully"}