"""
Super Admin related database models
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class SystemConfiguration(Base):
    """System configuration model - stores configurable settings"""

    __tablename__ = "system_configuration"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSONB, nullable=False)
    description = Column(Text)
    data_type = Column(String(20), nullable=False)  # 'string', 'number', 'boolean', 'date', 'json'
    category = Column(String(50), default='general')  # 'camp', 'workflow', 'files', 'email', 'contact'
    is_public = Column(Boolean, default=False)  # Can non-admins see this setting?
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Relationship
    updater = relationship("User", foreign_keys=[updated_by])

    def __repr__(self):
        return f"<SystemConfiguration {self.key}={self.value}>"


class AuditLog(Base):
    """Audit log model - tracks all system actions"""

    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(UUID(as_uuid=True), index=True)
    action = Column(String(50), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    details = Column(JSONB)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"), index=True)

    # Relationship
    actor = relationship("User", foreign_keys=[actor_id])

    def __repr__(self):
        return f"<AuditLog {self.entity_type}.{self.action} by {self.actor_id}>"


class EmailTemplate(Base):
    """Email template model - stores email templates with variable support"""

    __tablename__ = "email_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text)
    variables = Column(JSONB)  # Array of available variables
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Relationship
    updater = relationship("User", foreign_keys=[updated_by])

    def __repr__(self):
        return f"<EmailTemplate {self.key}: {self.name}>"


class Team(Base):
    """Team model - configurable teams for admin workflow"""

    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    key = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(7), default='#3B82F6')  # Hex color
    is_active = Column(Boolean, default=True, index=True)
    order_index = Column(Integer, default=0, index=True)
    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"))

    def __repr__(self):
        return f"<Team {self.key}: {self.name}>"
