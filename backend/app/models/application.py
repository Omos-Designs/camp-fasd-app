"""
Application-related database models
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, DECIMAL, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class ApplicationSection(Base):
    """Application section model - defines sections of the application form"""

    __tablename__ = "application_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    order_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, server_default="true")
    visible_before_acceptance = Column(Boolean, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationship to questions
    questions = relationship("ApplicationQuestion", back_populates="section", order_by="ApplicationQuestion.order_index")

    def __repr__(self):
        return f"<ApplicationSection {self.title}>"


class ApplicationQuestion(Base):
    """Application question model - defines individual questions"""

    __tablename__ = "application_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    section_id = Column(UUID(as_uuid=True), ForeignKey("application_sections.id", ondelete="CASCADE"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # text, textarea, dropdown, etc.
    options = Column(JSONB)  # For dropdown/multiple choice options
    is_required = Column(Boolean, default=False, server_default="false")
    reset_annually = Column(Boolean, default=False, server_default="false")
    order_index = Column(Integer, nullable=False)
    validation_rules = Column(JSONB)
    help_text = Column(Text)
    placeholder = Column(Text)
    is_active = Column(Boolean, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationships
    section = relationship("ApplicationSection", back_populates="questions")
    responses = relationship("ApplicationResponse", back_populates="question")

    def __repr__(self):
        return f"<ApplicationQuestion {self.question_text[:50]}>"


class Application(Base):
    """User's application instance"""

    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    camper_first_name = Column(String(100))
    camper_last_name = Column(String(100))
    status = Column(String(50), default="in_progress", server_default="in_progress")
    completion_percentage = Column(Integer, default=0, server_default="0")
    is_returning_camper = Column(Boolean, default=False, server_default="false")
    cabin_assignment = Column(String(50))
    application_data = Column(JSONB, default={}, server_default=text("'{}'::jsonb"))

    # Approval tracking
    ops_approved = Column(Boolean, default=False, server_default="false")
    behavioral_approved = Column(Boolean, default=False, server_default="false")
    medical_approved = Column(Boolean, default=False, server_default="false")
    ops_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    behavioral_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    medical_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ops_approved_at = Column(DateTime(timezone=True))
    behavioral_approved_at = Column(DateTime(timezone=True))
    medical_approved_at = Column(DateTime(timezone=True))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"))
    completed_at = Column(DateTime(timezone=True))  # When application reached 100%
    accepted_at = Column(DateTime(timezone=True))
    declined_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    responses = relationship("ApplicationResponse", back_populates="application", cascade="all, delete-orphan")
    files = relationship("File", back_populates="application", cascade="all, delete-orphan")
    notes = relationship("AdminNote", back_populates="application", cascade="all, delete-orphan")
    approvals = relationship("ApplicationApproval", back_populates="application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application {self.camper_first_name} {self.camper_last_name} - {self.status}>"


class ApplicationResponse(Base):
    """User's response to a specific question"""

    __tablename__ = "application_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    question_id = Column(UUID(as_uuid=True), ForeignKey("application_questions.id", ondelete="CASCADE"))
    response_value = Column(Text)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationships
    application = relationship("Application", back_populates="responses")
    question = relationship("ApplicationQuestion", back_populates="responses")

    def __repr__(self):
        return f"<ApplicationResponse for question {self.question_id}>"


class File(Base):
    """Uploaded files"""

    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100))
    file_size = Column(Integer)
    storage_path = Column(String(500), nullable=False)
    section = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))

    # Relationships
    application = relationship("Application", back_populates="files")

    def __repr__(self):
        return f"<File {self.file_name}>"


class AdminNote(Base):
    """Admin notes on applications"""

    __tablename__ = "admin_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationships
    application = relationship("Application", back_populates="notes")
    admin = relationship("User", foreign_keys=[admin_id])

    def __repr__(self):
        return f"<AdminNote on application {self.application_id}>"


class ApplicationApproval(Base):
    """Admin approvals/declines for applications"""

    __tablename__ = "application_approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    approved = Column(Boolean, nullable=False)  # True = approve, False = decline
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))

    # Relationships
    application = relationship("Application", back_populates="approvals")
    admin = relationship("User", foreign_keys=[admin_id])

    def __repr__(self):
        return f"<ApplicationApproval {'approved' if self.approved else 'declined'} by {self.admin_id}>"
