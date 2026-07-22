from sqlalchemy.orm import Session

from app.config import (
    DEFAULT_STUDENT_USER_ID,
    DEFAULT_STUDENT_PASSWORD,
    DEFAULT_ADMIN_USER_ID,
    DEFAULT_ADMIN_PASSWORD,
)
from app.models import User, Admin
from app.security import hash_password


def seed_defaults(db: Session) -> None:
    if not db.query(User).filter(User.user_id == DEFAULT_STUDENT_USER_ID).first():
        db.add(User(user_id=DEFAULT_STUDENT_USER_ID, hashed_password=hash_password(DEFAULT_STUDENT_PASSWORD)))

    if not db.query(Admin).filter(Admin.user_id == DEFAULT_ADMIN_USER_ID).first():
        db.add(Admin(user_id=DEFAULT_ADMIN_USER_ID, hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD)))

    db.commit()
