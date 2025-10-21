"""
Application Pydantic schemas
"""

from typing import Optional, List, Any, Dict, Union
from datetime import datetime
from pydantic import BaseModel, UUID4


# Application Section Schemas
class ApplicationSectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int
    is_active: bool = True
    visible_before_acceptance: bool = True
    show_when_status: Optional[str] = None


class ApplicationSection(ApplicationSectionBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Application Question Schemas
class ApplicationQuestionBase(BaseModel):
    section_id: UUID4
    question_text: str
    question_type: str  # text, textarea, dropdown, multiple_choice, file_upload, checkbox, date, email, phone, signature
    options: Optional[Any] = None  # Can be array or dict
    is_required: bool = False
    reset_annually: bool = False
    order_index: int
    validation_rules: Optional[Any] = None  # Can be array or dict
    help_text: Optional[str] = None
    placeholder: Optional[str] = None
    is_active: bool = True
    show_when_status: Optional[str] = None


class ApplicationQuestion(ApplicationQuestionBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationSectionWithQuestions(ApplicationSection):
    """Section with its questions included"""
    questions: List[ApplicationQuestion] = []

    class Config:
        from_attributes = True


# Application Response Schemas
class ApplicationResponseBase(BaseModel):
    question_id: UUID4
    response_value: Optional[str] = None
    file_id: Optional[UUID4] = None


class ApplicationResponseCreate(ApplicationResponseBase):
    pass


class ApplicationResponse(ApplicationResponseBase):
    id: UUID4
    application_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Application Schemas
class ApplicationBase(BaseModel):
    camper_first_name: Optional[str] = None
    camper_last_name: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    camper_first_name: Optional[str] = None
    camper_last_name: Optional[str] = None
    responses: Optional[List[ApplicationResponseCreate]] = None


class Application(ApplicationBase):
    id: UUID4
    user_id: UUID4
    status: str
    completion_percentage: int
    is_returning_camper: bool
    cabin_assignment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None  # When application reached 100%

    class Config:
        from_attributes = True


class ApplicationWithResponses(Application):
    """Application with all responses"""
    responses: List[ApplicationResponse] = []

    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    """Basic user info for admin views"""
    id: UUID4
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationWithUser(ApplicationWithResponses):
    """Application with responses and user info (admin view)"""
    user: Optional[UserInfo] = None

    class Config:
        from_attributes = True


# Progress tracking
class SectionProgress(BaseModel):
    """Progress for a single section"""
    section_id: UUID4
    section_title: str
    total_questions: int
    required_questions: int
    answered_questions: int
    answered_required: int
    completion_percentage: int
    is_complete: bool


class ApplicationProgress(BaseModel):
    """Overall application progress"""
    application_id: UUID4
    total_sections: int
    completed_sections: int
    overall_percentage: int
    section_progress: List[SectionProgress]


# File schemas
class FileBase(BaseModel):
    file_name: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    section: Optional[str] = None


class FileUpload(FileBase):
    pass


class FileResponse(FileBase):
    id: UUID4
    application_id: UUID4
    storage_path: str
    created_at: datetime

    class Config:
        from_attributes = True
