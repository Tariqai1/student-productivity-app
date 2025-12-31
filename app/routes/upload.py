from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from uuid import uuid4

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/file")
async def upload_proof(file: UploadFile = File(...)):
    """
    Uploads a file (Image/PDF) and returns the URL.
    """
    # 1. Validate File Type
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf", "application/zip"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only Images, PDF, or ZIP allowed.")

    # 2. Generate Unique Filename (to avoid overwriting)
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid4()}.{file_extension}"
    file_path = f"{UPLOAD_DIR}/{new_filename}"

    # 3. Save File
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. Return the accessible URL
    # In production, this would be a full domain URL
    return {"url": f"/static/uploads/{new_filename}"}