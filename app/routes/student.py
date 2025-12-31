from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from app.core.deps import get_current_user
from app.schemas.student import StudentUpdate, StudentProfile

router = APIRouter()

# 1. Get My Profile
@router.get("/me", response_model=StudentProfile)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Fetch the currently logged-in student's profile.
    """
    return current_user

# 2. Update My Profile
@router.put("/me", response_model=dict)
async def update_my_profile(
    update_data: StudentUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """
    Update allowed fields (Phone, Address, Mentor).
    """
    db = get_database()
    
    # Filter out None values
    update_fields = update_data.dict(exclude_unset=True)

    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    # Perform Update in MongoDB
    result = await db["students"].update_one(
        {"_id": current_user["_id"]},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        return {"message": "Profile is already up to date"}

    return {"message": "Profile updated successfully"}