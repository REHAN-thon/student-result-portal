from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.deps import get_current_student
from app.models import StudentResult
from app.schemas import StudentResultOut

router = APIRouter(prefix="/api/results", tags=["Results"])


def _find_result(db: Session, roll_number: str) -> StudentResult:
    roll_number = roll_number.strip().upper()
    result = db.query(StudentResult).filter(StudentResult.roll_number == roll_number).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    return result


@router.get("/search", response_model=StudentResultOut)
def search_result(
    roll_number: str,
    db: Session = Depends(get_db),
    _student: dict = Depends(get_current_student),
):
    return _find_result(db, roll_number)


@router.get("/{roll_number}/pdf")
def get_result_pdf(
    roll_number: str,
    db: Session = Depends(get_db),
    _student: dict = Depends(get_current_student),
):
    result = _find_result(db, roll_number)
    file_path = UPLOAD_DIR / result.pdf_file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Result file is missing on the server")
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{result.roll_number}_SemesterIV_Result.pdf",
    )
