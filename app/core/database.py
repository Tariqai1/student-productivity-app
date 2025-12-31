from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGO_CONNECTION_STRING)
        # Verify connection
        await db.client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")

async def close_mongo_connection():
    """Close connection"""
    if db.client:
        db.client.close()
        print("🔒 MongoDB connection closed.")

# Helper to get database reference easily
def get_database():
    return db.client[settings.DATABASE_NAME]