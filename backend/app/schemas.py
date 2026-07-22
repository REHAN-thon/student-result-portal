from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    user_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class StudentResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_name: str
    roll_number: str
    created_date: datetime


class StudentResultCreate(BaseModel):
    student_name: str
    roll_number: str


class MessageResponse(BaseModel):
    message: str
