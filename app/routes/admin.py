from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import get_database
from app.core.deps import get_current_user
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import pytz
import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from bson import ObjectId

router = APIRouter()
IST = pytz.timezone('Asia/Kolkata')

# --- Models ---
class RemarkUpdate(BaseModel):
    student_id: str
    date: str  # YYYY-MM-DD
    remark: str

# --- Helper to fix ObjectId ---
def fix_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ==========================================
# 1. GET DAILY REPORT (For Dashboard)
# ==========================================
@router.get("/daily-report")
async def get_daily_report(
    date: str = Query(..., description="Format: YYYY-MM-DD"),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db = get_database()
    
    # Define Time Range
    start_dt = datetime.strptime(date, "%Y-%m-%d").replace(hour=0, minute=0, second=0)
    end_dt = datetime.strptime(date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
    
    # Get Data
    students = await db["students"].find({"role": "student"}).to_list(length=1000)
    attendance_logs = await db["attendance"].find({
        "date": {"$gte": start_dt, "$lte": end_dt}
    }).to_list(length=1000)

    report = []
    
    for student in students:
        student_id = str(student["_id"])
        # Find log for this student
        log = next((a for a in attendance_logs if str(a["student_id"]) == student_id), None)
        
        status = "Absent"
        check_in = "-"
        check_out = "-"
        duration = "-"
        tasks = "-"
        proof_url = None
        remarks = "-" 

        if log:
            status = log.get("status", "Absent")
            remarks = log.get("remarks", "-")
            
            if log.get("check_in_time"):
                c_in = log["check_in_time"]
                if c_in.tzinfo is None:
                    c_in = pytz.utc.localize(c_in).astimezone(IST)
                check_in = c_in.strftime("%I:%M %p")
            
            if log.get("check_out_time"):
                c_out = log["check_out_time"]
                if c_out.tzinfo is None:
                    c_out = pytz.utc.localize(c_out).astimezone(IST)
                check_out = c_out.strftime("%I:%M %p")
                
            if log.get("duration_hours") is not None:
                duration = f"{log['duration_hours']} hrs"
                
            tasks = log.get("tasks", "-")
            proof_url = log.get("proof_url", None)
            
        report.append({
            "student_id": student_id,
            "name": student.get("full_name", "Unknown"),
            "username": student.get("username", ""),
            "image": student.get("image", ""),
            "status": status,
            "check_in": check_in,
            "check_out": check_out,
            "duration": duration,
            "tasks": tasks,
            "proof_url": proof_url,
            "remarks": remarks
        })

    return report

# ==========================================
# 2. ADD/UPDATE REMARK (For Absentees)
# ==========================================
@router.post("/student-remark")
async def update_student_remark(
    data: RemarkUpdate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    db = get_database()
    
    target_date = datetime.strptime(data.date, "%Y-%m-%d")
    start_dt = target_date.replace(hour=0, minute=0, second=0)
    end_dt = target_date.replace(hour=23, minute=59, second=59)

    existing_log = await db["attendance"].find_one({
        "student_id": data.student_id,
        "date": {"$gte": start_dt, "$lte": end_dt}
    })

    if existing_log:
        await db["attendance"].update_one(
            {"_id": existing_log["_id"]},
            {"$set": {"remarks": data.remark}}
        )
    else:
        # Create Absent Record
        new_entry = {
            "student_id": data.student_id,
            "date": target_date.replace(hour=12),
            "status": "Absent",
            "remarks": data.remark,
            "check_in_time": None,
            "check_out_time": None,
            "duration_hours": 0,
            "tasks": "Marked by Admin",
            "proof_url": None
        }
        await db["attendance"].insert_one(new_entry)

    return {"message": "Remark updated successfully"}

# ==========================================
# 3. DOWNLOAD CSV REPORT
# ==========================================
@router.get("/download-daily-report")
async def download_daily_report(
    date: str,
    current_user: dict = Depends(get_current_user)
):
    report_data = await get_daily_report(date, current_user)
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Student Name", "Username", "Date", "Status", 
        "Check In", "Check Out", "Duration", "Task Details", 
        "Proof Link", "Reason/Remarks"
    ])
    
    for row in report_data:
        writer.writerow([
            row["name"],
            row["username"],
            date,
            row["status"],
            row["check_in"],
            row["check_out"],
            row["duration"],
            row["tasks"],
            row["proof_url"] or "N/A",
            row["remarks"]
        ])
    
    output.seek(0)
    headers = {'Content-Disposition': f'attachment; filename="Attendance_Report_{date}.csv"'}
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers=headers)

# ==========================================
# 4. GET STUDENT HISTORY
# ==========================================
@router.get("/attendance/{student_id}")
async def get_student_history_admin(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = get_database()
    cursor = db["attendance"].find({"student_id": student_id}).sort("date", -1)
    logs = await cursor.to_list(length=365)
    
    cleaned_logs = []
    for log in logs:
        log["_id"] = str(log["_id"])
        log["student_id"] = str(log["student_id"])
        if log.get("date"): log["date"] = log["date"].isoformat()
        if log.get("check_in_time"): log["check_in_time"] = log["check_in_time"].isoformat()
        if log.get("check_out_time"): log["check_out_time"] = log["check_out_time"].isoformat()
        cleaned_logs.append(log)
        
    return cleaned_logs

# ==========================================
# 5. GET ALL STUDENTS
# ==========================================
@router.get("/students")
async def get_all_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = get_database()
    students = await db["students"].find({"role": "student"}).to_list(length=1000)
    
    return [fix_id(s) for s in students]