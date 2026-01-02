from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from app.core.deps import get_current_user
from datetime import datetime, timedelta
import pytz 
from bson import ObjectId

router = APIRouter()

# 🇮🇳 Indian Standard Time Configuration
IST = pytz.timezone('Asia/Kolkata')

# 🔒 Helper to Verify Admin
def verify_admin(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role", "").lower()
    if role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized.")
    return current_user

# 🛠 INTERNAL HELPER: Safe Date Parser (Strictly converts to IST)
def parse_to_ist(date_val):
    """
    Converts String, UTC Datetime, or Naive Datetime -> IST Datetime
    """
    if not date_val:
        return None
    
    try:
        # 1. Agar String hai, to Datetime banao
        if isinstance(date_val, str):
            date_val = datetime.fromisoformat(date_val.replace("Z", "+00:00"))
        
        # 2. Agar Naive hai (bina timezone), to UTC maano (Render server UTC deta hai)
        if date_val.tzinfo is None:
            date_val = pytz.utc.localize(date_val)
            
        # 3. Final conversion to IST
        return date_val.astimezone(IST)
    except Exception:
        return None

# 🧠 CORE FUNCTION: Calculate Stats (Fixed Logic)
async def calculate_productivity(db, student_id: str):
    # Current Time in IST
    now_utc = datetime.utcnow().replace(tzinfo=pytz.utc)
    now_ist = now_utc.astimezone(IST)
    
    # 1. Define Time Ranges (Based on IST Midnight)
    start_of_day = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Start of week (Monday)
    start_of_week = start_of_day - timedelta(days=start_of_day.weekday())
    
    # Start of month
    start_of_month = start_of_day.replace(day=1)

    # 2. Fetch All Logs
    logs = await db["attendance"].find({"student_id": student_id}).to_list(length=2000)

    # 3. Initialize Counters
    stats = {
        "today": {"hours": 0, "status": "Absent"},
        "week": {"hours": 0, "days_present": 0},
        "month": {"hours": 0, "days_present": 0},
        "all_time": {"total_hours": 0, "total_days": 0},
        "lifetime": {"hours": 0, "sessions": len(logs)} # Profile page support
    }
    
    unique_days_week = set()
    unique_days_month = set()
    unique_days_all = set()

    for log in logs:
        # Step A: Parse Dates to IST
        # Check-in time DB se aata hai, usse IST mein convert karna zaroori hai
        check_in = parse_to_ist(log.get("check_in_time") or log.get("date"))
        check_out = parse_to_ist(log.get("check_out_time"))

        if not check_in:
            continue 

        # Step B: Calculate Duration (Hours)
        duration = 0
        is_active_now = False

        if check_out:
            # Case 1: Session Completed
            diff_seconds = (check_out - check_in).total_seconds()
        else:
            # Case 2: Session Active 
            # Agar session aaj (IST Date) start hua hai tabhi active mano
            if check_in.date() == now_ist.date():
                diff_seconds = (now_ist - check_in).total_seconds()
                is_active_now = True
            else:
                diff_seconds = 0 

        # Step C: Sanity Checks 
        if 0 < diff_seconds < 65000:
            duration = round(diff_seconds / 3600, 2)
        else:
            duration = 0

        # Step D: Aggregate Data
        log_date = check_in 
        
        # Add to All Time
        stats["all_time"]["total_hours"] += duration
        stats["lifetime"]["hours"] += duration
        
        if duration > 0 or is_active_now:
            unique_days_all.add(log_date.date())

        # Add to Today (Compare IST Dates)
        if log_date >= start_of_day:
            stats["today"]["hours"] += duration
            if is_active_now:
                stats["today"]["status"] = "Active Now 🟢"
            elif stats["today"]["status"] != "Active Now 🟢":
                stats["today"]["status"] = log.get("status", "Present")

        # Add to Week
        if log_date >= start_of_week:
            stats["week"]["hours"] += duration
            if duration > 0:
                unique_days_week.add(log_date.date())

        # Add to Month
        if log_date >= start_of_month:
            stats["month"]["hours"] += duration
            if duration > 0:
                unique_days_month.add(log_date.date())

    # Final Counts
    stats["week"]["days_present"] = len(unique_days_week)
    stats["month"]["days_present"] = len(unique_days_month)
    stats["all_time"]["total_days"] = len(unique_days_all)

    # Rounding
    stats["all_time"]["total_hours"] = round(stats["all_time"]["total_hours"], 2)
    stats["lifetime"]["hours"] = round(stats["lifetime"]["hours"], 2)
    stats["week"]["hours"] = round(stats["week"]["hours"], 2)
    stats["month"]["hours"] = round(stats["month"]["hours"], 2)
    stats["today"]["hours"] = round(stats["today"]["hours"], 2)

    return stats

# ============================
# 🚀 ROUTES
# ============================

# 1. FOR STUDENT: My Performance
@router.get("/my-performance")
async def get_my_performance(current_user: dict = Depends(get_current_user)):
    # ✅ FIX: Agar Admin login hai, to Crash mat hone do. Empty stats return karo.
    if current_user.get("role") == "admin":
        return {
            "today": {"hours": 0, "status": "Admin View"},
            "week": {"hours": 0, "days_present": 0},
            "month": {"hours": 0, "days_present": 0},
            "all_time": {"total_hours": 0, "total_days": 0},
            "lifetime": {"hours": 0, "sessions": 0}
        }

    db = get_database()
    # Ab ye line tabhi chalegi jab Student hoga (jiske paas _id hai)
    stats = await calculate_productivity(db, str(current_user["_id"]))
    return stats

# 2. FOR ADMIN: Get Any Student's Stats
@router.get("/admin/student-stats/{student_id}")
async def get_student_stats_admin(student_id: str, admin: dict = Depends(verify_admin)):
    db = get_database()
    
    # Validate ID
    if not ObjectId.is_valid(student_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    stats = await calculate_productivity(db, student_id)
    return stats
