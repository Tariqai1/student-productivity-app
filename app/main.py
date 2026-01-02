from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

# Config & DB
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.scheduler import start_scheduler 

# Import ALL routes
from app.routes import auth, attendance, students, analytics, admin 

# ✅ CRITICAL FIX: Folders create karo APP start hone se PEHLE
# Yeh error "Directory 'static' does not exist" ko rokega
if not os.path.exists("static"):
    os.makedirs("static")

if not os.path.exists("static/images"):
    os.makedirs("static/images")

# ===============================
# LIFESPAN EVENTS
# ===============================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Connect DB
    await connect_to_mongo()
    
    # 2. Start Scheduler
    start_scheduler() 
    
    yield
    
    # 3. Close DB
    await close_mongo_connection()

# ===============================
# APP INITIALIZATION
# ===============================
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# ===============================
# MOUNT STATIC FILES (IMAGES)
# ===============================
# Ab ye line crash nahi karegi kyunki humne upar folder bana diya hai
app.mount("/static", StaticFiles(directory="static"), name="static")

# ===============================
# CORS CONFIGURATION
# ===============================
origins = [
    "http://localhost:5173",
    "https://student-productivity-app-brown.vercel.app", # 👈 Apna naya Vercel link yahan paste karein
    "https://student-productivity-app-brown.vercel.app/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# INCLUDE ROUTES
# ===============================
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Panel"])
app.include_router(students.router, prefix="/api/v1/students", tags=["Student Profile"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

# ===============================
# HEALTH CHECK
# ===============================
@app.get("/")
async def root():
    return {"message": "Student Productivity API is Running with Scheduler! 🚀"}
