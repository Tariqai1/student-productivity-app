from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import get_database
from app.core.email import send_checkout_reminder
from datetime import datetime
import pytz
from bson import ObjectId

# Scheduler Instance
scheduler = AsyncIOScheduler()
# 🇮🇳 STRICT IST TIMEZONE
IST = pytz.timezone('Asia/Kolkata')

# ==========================================
# JOB 1: WARN STUDENT (9:30 PM)
# ==========================================
async def notify_late_students():
    """
    CRON JOB: Runs daily at 9:30 PM IST.
    Warns students who are still 'In Progress'.
    """
    print("⏰ [Scheduler] 9:30 PM Warning Shot: Checking for pending check-outs...")
    db = get_database()
    
    now_ist = datetime.now(IST)
    today_start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now_ist.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Find active sessions
    active_sessions = await db["attendance"].find({
        "date": {"$gte": today_start, "$lte": today_end},
        "status": "In Progress"
    }).to_list(length=1000)

    if not active_sessions:
        print("✅ [Scheduler] Everyone has checked out. Good discipline!")
        return

    print(f"⚠️ [Scheduler] Found {len(active_sessions)} late students. Sending warning emails...")

    for session in active_sessions:
        student_id = session.get("student_id")
        try:
            student = await db["students"].find_one({"_id": ObjectId(student_id)})
            if student and student.get("email"):
                await send_checkout_reminder(
                    email=student["email"],
                    name=student["full_name"]
                )
                print(f"   📧 Warning sent to: {student['full_name']}")
        except Exception as e:
            print(f"   ❌ Email failed for {student_id}: {e}")

# ==========================================
# JOB 2: STRICT ACTION (10:00 PM)
# ==========================================
async def auto_close_sessions():
    """
    CRON JOB: Runs daily at 10:00 PM IST.
    Forcefully closes sessions as 'Forgot Checkout'.
    """
    print("🔒 [Scheduler] 10:00 PM Lockdown: Auto-closing remaining sessions...")
    db = get_database()
    
    now_ist = datetime.now(IST)
    today_start = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now_ist.replace(hour=23, minute=59, second=59, microsecond=999999)

    # 1. Update query: Jo abhi bhi 'In Progress' hain
    result = await db["attendance"].update_many(
        {
            "date": {"$gte": today_start, "$lte": today_end},
            "status": "In Progress"
        },
        {
            "$set": {
                "status": "Forgot Checkout",  # 👈 Key for Yellow Color in Calendar
                "check_out_time": now_ist,    # Mark current time
                "tasks": "System Auto-Close: Student forgot to checkout.",
                "duration_hours": 0           # Penalty: 0 Productivity Hours
            }
        }
    )
    
    if result.modified_count > 0:
        print(f"🚫 [Scheduler] Force closed {result.modified_count} sessions. Marked as 'Forgot Checkout'.")
    else:
        print("✅ [Scheduler] No sessions needed force closing.")

# ==========================================
# START ENGINE
# ==========================================
def start_scheduler():
    """
    Starts the scheduler when FastAPI app starts.
    """
    if not scheduler.running:
        # Job 1: Reminder at 9:30 PM
        scheduler.add_job(
            notify_late_students, 
            'cron', 
            hour=21, 
            minute=30, 
            timezone=IST,
            id="warning_shot",
            replace_existing=True
        )
        
        # Job 2: Auto-Close at 10:00 PM
        scheduler.add_job(
            auto_close_sessions, 
            'cron', 
            hour=22, 
            minute=0, 
            timezone=IST,
            id="lockdown",
            replace_existing=True
        )
        
        scheduler.start()
        print("✅ Personal Coach Scheduler Started! (Warning: 9:30 PM | Lockdown: 10:00 PM)")