"""
User Pydantic schemas for validation
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, UUID4


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class User(UserBase):
    """Full user schema"""
    id: UUID4
    role: str
    team: Optional[str] = None
    email_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True  # Allows SQLAlchemy models to be converted


class UserResponse(BaseModel):
    """Schema for user response (without sensitive data)"""
    id: UUID4
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    team: Optional[str] = None
    email_verified: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse