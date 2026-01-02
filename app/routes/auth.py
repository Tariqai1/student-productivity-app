from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_database
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.email import send_reset_password_email
from app.core.config import settings
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from bson import ObjectId
import uuid

router = APIRouter()

# --- Models ---
class StudentRegister(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    course: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ==========================================
# 1. LOGIN
# ==========================================
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    
    # Check Admin
    if form_data.username == settings.ADMIN_USER and form_data.password == settings.ADMIN_PASS:
        return {
            "access_token": create_access_token(data={"sub": "admin", "role": "admin"}),
            "token_type": "bearer",
            "role": "admin"
        }

    # Check Student
    user = await db["students"].find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    # Support legacy/broken passwords during migration
    if "hashed_password" in user:
        stored_pw = user["hashed_password"]
    elif "password" in user:
        stored_pw = user["password"]
    else:
        raise HTTPException(status_code=400, detail="Account needs repair. Contact Admin.")

    if not verify_password(form_data.password, stored_pw):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {
        "access_token": create_access_token(data={"sub": str(user["_id"]), "role": "student"}),
        "token_type": "bearer",
        "role": "student"
    }

# ==========================================
# 2. REGISTER
# ==========================================
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(student: StudentRegister):
    db = get_database()
    
    if await db["students"].find_one({"username": student.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    if await db["students"].find_one({"email": student.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_student = {
        "full_name": student.full_name,
        "username": student.username,
        "email": student.email,
        "hashed_password": get_password_hash(student.password), # Store as hashed_password
        "course": student.course,
        "role": "student",
        "image": "", 
        "created_at": datetime.now()
    }
    
    await db["students"].insert_one(new_student)
    return {"message": "Student registered successfully"}

# ==========================================
3. FORGOT PASSWORD (Link Based)
# ==========================================
@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest): 
    # ⚠️ Maine 'BackgroundTasks' hata diya hai taaki hum wait karein result ka
    
    db = get_database()
    user = await db["students"].find_one({"email": request.email})
    
    if not user:
        # Security: Fake success message taaki hacker ko pata na chale email exist karta hai ya nahi
        # Lekin development mein aap isse comment out karke check kar sakte hain
        return {"message": "If this email is registered, you will receive a reset link."}

    token = str(uuid.uuid4())
    
    reset_entry = {
        "email": request.email,
        "token": token,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=30)
    }
    
    await db["password_resets"].insert_one(reset_entry)
    
    # ✅ FIX: Ab hum 'await' kar rahe hain. 
    # Agar email fail hua, to ye function False return karega.
    email_sent = await send_reset_password_email(request.email, token)
    
    if not email_sent:
        # Ab Frontend par Red Error aayega agar email nahi gaya
        raise HTTPException(status_code=500, detail="Failed to send email. Check Server Logs.")
    
    return {"message": "Password reset link sent to your email."}
# ==========================================
# 4. RESET PASSWORD
# ==========================================
@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    db = get_database()

    reset_record = await db["password_resets"].find_one({"token": request.token})
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if datetime.utcnow() > reset_record["expires_at"]:
        raise HTTPException(status_code=400, detail="Token has expired.")

    hashed_password = get_password_hash(request.new_password)

    await db["students"].update_one(
        {"email": reset_record["email"]},
        {"$set": {"hashed_password": hashed_password}} # Update hashed_password
    )

    await db["password_resets"].delete_one({"_id": reset_record["_id"]})

    return {"message": "Password reset successfully. Login now."}

# ==========================================
# 5. EMERGENCY FIXES (Admin Tools)
# ==========================================
@router.get("/fix-my-db")
async def fix_old_users():
    """Fixes users who don't have a hashed_password field."""
    db = get_database()
    # Find users missing hashed_password
    broken_users = await db["students"].find({"hashed_password": {"$exists": False}}).to_list(100)
    
    if not broken_users:
        return {"message": "All users are healthy!"}

    count = 0
    default_pass = get_password_hash("123456")
    
    for user in broken_users:
        # If they have old plain 'password', hash it
        if "password" in user:
            new_hash = get_password_hash(user["password"])
            await db["students"].update_one(
                {"_id": user["_id"]},
                {"$set": {"hashed_password": new_hash}, "$unset": {"password": ""}}
            )
        else:
            # Else set default
            await db["students"].update_one(
                {"_id": user["_id"]},
                {"$set": {"hashed_password": default_pass}}
            )
        count += 1
        
    return {"message": f"Fixed {count} users. Passwords updated."}

@router.get("/make-me-admin/{username}")
async def make_user_admin(username: str):
    """Promotes a user to Admin role."""
    db = get_database()
    result = await db["students"].update_one(
        {"username": username},
        {"$set": {"role": "admin"}} 
    )
    
    if result.matched_count == 0:
        return {"message": f"User '{username}' not found!"}
        
    return {"message": f"User '{username}' is now an Admin! 👑"}

# ==========================================
# 6. SUPER MIGRATION TOOL
# ==========================================
@router.get("/migrate-old-data")
async def migrate_old_data():
    """
    Imports 'activities' into 'attendance' table.
    """
    db = get_database()
    
    # 1. Fetch old activities
    old_activities = await db["activities"].find({}).to_list(length=2000)
    count = 0
    
    for act in old_activities:
        username = act.get("username")
        if not username: continue

        student = await db["students"].find_one({"username": username})
        if not student: continue
            
        student_id = str(student["_id"])
        
        # 2. Parse Dates logic
        date_str = act.get("date")  # "2025-06-27"
        time_in_str = act.get("check_in")
        
        final_check_in = datetime.utcnow()
        final_check_out = datetime.utcnow()
        
        try:
            if date_str and time_in_str:
                dt_str = f"{date_str} {time_in_str.split('.')[0]}"
                final_check_in = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                # Assume 1 hour duration if checkout missing or just set same time
                final_check_out = final_check_in + timedelta(hours=1)
                
            if act.get("check_out"):
                dt_out_str = f"{date_str} {act.get('check_out').split('.')[0]}"
                final_check_out = datetime.strptime(dt_out_str, "%Y-%m-%d %H:%M:%S")

        except Exception:
            if act.get("recorded_at"):
                final_check_in = act.get("recorded_at")

        # 3. Insert if not duplicate
        exists = await db["attendance"].find_one({
            "student_id": student_id,
            "tasks": act.get("task_description")
        })

        if not exists:
            duration = (final_check_out - final_check_in).total_seconds() / 3600
            new_log = {
                "student_id": student_id,
                "date": final_check_in,
                "check_in_time": final_check_in,
                "check_out_time": final_check_out,
                "duration_hours": round(duration, 2),
                "status": "Completed",
                "tasks": act.get("task_description", "Migrated Data"),
                "proof_url": None,
                "doubts": act.get("doubt", ""),
                "remarks": "-"
            }
            await db["attendance"].insert_one(new_log)
            count += 1

    return {"message": f"Migration Success! Imported {count} records."}
