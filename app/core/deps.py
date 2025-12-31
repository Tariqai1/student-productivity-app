from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import get_database
from bson import ObjectId

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode Token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # 2. Find User in DB
    db = get_database()
    
    # NOTE: Agar user_id "admin" hai toh alag check, warna ObjectId
    if user_id == "admin":
        user = {"username": "admin", "role": "admin"} # Dummy admin object
    else:
        try:
            # Convert String ID to ObjectId for MongoDB
            user = await db["students"].find_one({"_id": ObjectId(user_id)})
        except:
            raise credentials_exception

    if user is None:
        raise credentials_exception
        
    return user