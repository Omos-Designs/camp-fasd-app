"""
Medication and Allergy Pydantic schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, UUID4


# Medication Dose Schemas
class MedicationDoseBase(BaseModel):
    given_type: str  # 'At specific time' or 'As needed'
    time: Optional[str] = None
    notes: Optional[str] = None
    order_index: int = 0


class MedicationDoseCreate(MedicationDoseBase):
    pass


class MedicationDoseUpdate(BaseModel):
    given_type: Optional[str] = None
    time: Optional[str] = None
    notes: Optional[str] = None
    order_index: Optional[int] = None


class MedicationDose(MedicationDoseBase):
    id: UUID4
    medication_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Medication Schemas
class MedicationBase(BaseModel):
    medication_name: str
    strength: Optional[str] = None
    dose_amount: Optional[str] = None
    dose_form: Optional[str] = None
    order_index: int = 0


class MedicationCreate(MedicationBase):
    application_id: UUID4
    question_id: UUID4
    doses: List[MedicationDoseCreate] = []


class MedicationUpdate(BaseModel):
    medication_name: Optional[str] = None
    strength: Optional[str] = None
    dose_amount: Optional[str] = None
    dose_form: Optional[str] = None
    order_index: Optional[int] = None


class Medication(MedicationBase):
    id: UUID4
    application_id: UUID4
    question_id: UUID4
    doses: List[MedicationDose] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Allergy Schemas
class AllergyBase(BaseModel):
    allergen: str
    reaction: Optional[str] = None
    severity: Optional[str] = None  # 'Mild', 'Moderate', 'Severe'
    notes: Optional[str] = None
    order_index: int = 0


class AllergyCreate(AllergyBase):
    application_id: UUID4
    question_id: UUID4


class AllergyUpdate(BaseModel):
    allergen: Optional[str] = None
    reaction: Optional[str] = None
    severity: Optional[str] = None
    notes: Optional[str] = None
    order_index: Optional[int] = None


class Allergy(AllergyBase):
    id: UUID4
    application_id: UUID4
    question_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bulk save schemas for saving all medications/allergies for a question at once
class MedicationListSave(BaseModel):
    """Save all medications for a specific question in one request"""
    application_id: UUID4
    question_id: UUID4
    medications: List[MedicationCreate]


class AllergyListSave(BaseModel):
    """Save all allergies for a specific question in one request"""
    application_id: UUID4
    question_id: UUID4
    allergies: List[AllergyCreate]
