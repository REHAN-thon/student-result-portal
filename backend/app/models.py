from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class User(Base):
    """Portal login account for students (gates access to the Dashboard)."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Admin(Base):
    """Admin login account used to access the Admin Panel."""

    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class StudentResult(Base):
    """One uploaded Semester IV result PDF, keyed by roll number."""

    __tablename__ = "student_results"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    pdf_file_path = Column(String, nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)
