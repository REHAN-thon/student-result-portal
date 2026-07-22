import re
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR, MAX_UPLOAD_SIZE_MB
from app.database import get_db
from app.deps import get_current_admin
from app.models import Admin, StudentResult
from app.schemas import LoginRequest, TokenResponse, StudentResultOut, MessageResponse
from app.security import verify_password, create_access_token

router = APIRouter(prefix="/api/admin", tags=["Admin"])

ROLL_NUMBER_PATTERN = re.compile(r"^[A-Za-z0-9\-\/]{1,50}$")


@router.post("/login", response_model=TokenResponse)
def admin_login(payload: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.user_id == payload.user_id).first()
    if not admin or not verify_password(payload.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Admin User ID or Password",
        )
    token = create_access_token(subject=admin.user_id, role="admin")
    return TokenResponse(access_token=token, role="admin")


@router.post("/results", response_model=StudentResultOut, status_code=status.HTTP_201_CREATED)
async def upload_result(
    student_name: str = Form(...),
    roll_number: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    student_name = student_name.strip()
    roll_number = roll_number.strip().upper()

    if not student_name:
        raise HTTPException(status_code=400, detail="Student Name is required")
    if not ROLL_NUMBER_PATTERN.match(roll_number):
        raise HTTPException(status_code=400, detail="Roll Number contains invalid characters")
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_UPLOAD_SIZE_MB}MB limit")

    existing = db.query(StudentResult).filter(StudentResult.roll_number == roll_number).first()

    filename = f"{roll_number}_{uuid.uuid4().hex[:8]}.pdf"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as f:
        f.write(contents)

    if existing:
        # Replace the previous result for this roll number
        old_path = UPLOAD_DIR / existing.pdf_file_path
        existing.student_name = student_name
        existing.pdf_file_path = filename
        db.commit()
        db.refresh(existing)
        if old_path.exists() and old_path.name != filename:
            old_path.unlink(missing_ok=True)
        return existing

    result = StudentResult(
        student_name=student_name,
        roll_number=roll_number,
        pdf_file_path=filename,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/results", response_model=List[StudentResultOut])
def list_results(
    db: Session = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    return db.query(StudentResult).order_by(StudentResult.created_date.desc()).all()


@router.delete("/results/{result_id}", response_model=MessageResponse)
def delete_result(
    result_id: int,
    db: Session = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    result = db.query(StudentResult).filter(StudentResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    file_path = UPLOAD_DIR / result.pdf_file_path
    file_path.unlink(missing_ok=True)
    db.delete(result)
    db.commit()
    return MessageResponse(message="Result deleted")
