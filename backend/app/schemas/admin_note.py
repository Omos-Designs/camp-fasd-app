"""
Admin Note Pydantic schemas for validation
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, UUID4


class AdminNoteBase(BaseModel):
    """Base admin note schema"""
    note: str


class AdminNoteCreate(AdminNoteBase):
    """Schema for creating an admin note"""
    pass


class AdminInfo(BaseModel):
    """Basic admin info for note display"""
    id: UUID4
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    team: Optional[str] = None

    class Config:
        from_attributes = True


class AdminNote(AdminNoteBase):
    """Full admin note schema with admin information"""
    id: UUID4
    application_id: UUID4
    admin_id: UUID4
    admin: Optional[AdminInfo] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
