"""
Medications and Allergies API endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.application import Application, Medication, MedicationDose, Allergy
from app.schemas.medication import (
    Medication as MedicationSchema,
    MedicationCreate,
    MedicationUpdate,
    MedicationDose as MedicationDoseSchema,
    MedicationDoseCreate,
    MedicationDoseUpdate,
    Allergy as AllergySchema,
    AllergyCreate,
    AllergyUpdate,
)

router = APIRouter()


# ============================================================================
# MEDICATIONS ENDPOINTS
# ============================================================================

@router.get("/medications/{application_id}", response_model=List[MedicationSchema])
async def get_medications_for_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all medications for an application"""
    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    medications = db.query(Medication).filter(
        Medication.application_id == application_id
    ).order_by(Medication.order_index).all()

    return medications


@router.get("/medications/{application_id}/question/{question_id}", response_model=List[MedicationSchema])
async def get_medications_for_question(
    application_id: str,
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all medications for a specific question in an application"""
    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    medications = db.query(Medication).filter(
        Medication.application_id == application_id,
        Medication.question_id == question_id
    ).order_by(Medication.order_index).all()

    return medications


@router.post("/medications", response_model=MedicationSchema, status_code=status.HTTP_201_CREATED)
async def create_medication(
    medication_data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new medication entry"""
    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == medication_data.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Create medication
    medication = Medication(
        application_id=medication_data.application_id,
        question_id=medication_data.question_id,
        medication_name=medication_data.medication_name,
        strength=medication_data.strength,
        dose_amount=medication_data.dose_amount,
        dose_form=medication_data.dose_form,
        order_index=medication_data.order_index
    )
    db.add(medication)
    db.flush()  # Get the medication ID

    # Create doses
    for dose_data in medication_data.doses:
        dose = MedicationDose(
            medication_id=medication.id,
            given_type=dose_data.given_type,
            time=dose_data.time,
            notes=dose_data.notes,
            order_index=dose_data.order_index
        )
        db.add(dose)

    db.commit()
    db.refresh(medication)

    return medication


@router.put("/medications/{medication_id}", response_model=MedicationSchema)
async def update_medication(
    medication_id: str,
    medication_data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a medication entry"""
    medication = db.query(Medication).filter(Medication.id == medication_id).first()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == medication.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this medication"
        )

    # Update fields
    if medication_data.medication_name is not None:
        medication.medication_name = medication_data.medication_name
    if medication_data.strength is not None:
        medication.strength = medication_data.strength
    if medication_data.dose_amount is not None:
        medication.dose_amount = medication_data.dose_amount
    if medication_data.dose_form is not None:
        medication.dose_form = medication_data.dose_form
    if medication_data.order_index is not None:
        medication.order_index = medication_data.order_index

    db.commit()
    db.refresh(medication)

    return medication


@router.delete("/medications/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a medication entry"""
    medication = db.query(Medication).filter(Medication.id == medication_id).first()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == medication.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this medication"
        )

    db.delete(medication)
    db.commit()


# ============================================================================
# MEDICATION DOSES ENDPOINTS
# ============================================================================

@router.post("/medications/{medication_id}/doses", response_model=MedicationDoseSchema, status_code=status.HTTP_201_CREATED)
async def create_medication_dose(
    medication_id: str,
    dose_data: MedicationDoseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new dose for a medication"""
    medication = db.query(Medication).filter(Medication.id == medication_id).first()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )

    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == medication.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add doses to this medication"
        )

    dose = MedicationDose(
        medication_id=medication_id,
        given_type=dose_data.given_type,
        time=dose_data.time,
        notes=dose_data.notes,
        order_index=dose_data.order_index
    )
    db.add(dose)
    db.commit()
    db.refresh(dose)

    return dose


@router.put("/doses/{dose_id}", response_model=MedicationDoseSchema)
async def update_medication_dose(
    dose_id: str,
    dose_data: MedicationDoseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a medication dose"""
    dose = db.query(MedicationDose).filter(MedicationDose.id == dose_id).first()

    if not dose:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dose not found"
        )

    # Verify application belongs to user
    medication = db.query(Medication).filter(Medication.id == dose.medication_id).first()
    application = db.query(Application).filter(
        Application.id == medication.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this dose"
        )

    # Update fields
    if dose_data.given_type is not None:
        dose.given_type = dose_data.given_type
    if dose_data.time is not None:
        dose.time = dose_data.time
    if dose_data.notes is not None:
        dose.notes = dose_data.notes
    if dose_data.order_index is not None:
        dose.order_index = dose_data.order_index

    db.commit()
    db.refresh(dose)

    return dose


@router.delete("/doses/{dose_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication_dose(
    dose_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a medication dose"""
    dose = db.query(MedicationDose).filter(MedicationDose.id == dose_id).first()

    if not dose:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dose not found"
        )

    # Verify application belongs to user
    medication = db.query(Medication).filter(Medication.id == dose.medication_id).first()
    application = db.query(Application).filter(
        Application.id == medication.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this dose"
        )

    db.delete(dose)
    db.commit()


# ============================================================================
# ALLERGIES ENDPOINTS
# ============================================================================

@router.get("/allergies/{application_id}", response_model=List[AllergySchema])
async def get_allergies_for_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all allergies for an application"""
    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    allergies = db.query(Allergy).filter(
        Allergy.application_id == application_id
    ).order_by(Allergy.order_index).all()

    return allergies


@router.get("/allergies/{application_id}/question/{question_id}", response_model=List[AllergySchema])
async def get_allergies_for_question(
    application_id: str,
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all allergies for a specific question in an application"""
    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    allergies = db.query(Allergy).filter(
        Allergy.application_id == application_id,
        Allergy.question_id == question_id
    ).order_by(Allergy.order_index).all()

    return allergies


@router.post("/allergies", response_model=AllergySchema, status_code=status.HTTP_201_CREATED)
async def create_allergy(
    allergy_data: AllergyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new allergy entry"""
    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == allergy_data.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    allergy = Allergy(
        application_id=allergy_data.application_id,
        question_id=allergy_data.question_id,
        allergen=allergy_data.allergen,
        reaction=allergy_data.reaction,
        severity=allergy_data.severity,
        notes=allergy_data.notes,
        order_index=allergy_data.order_index
    )
    db.add(allergy)
    db.commit()
    db.refresh(allergy)

    return allergy


@router.put("/allergies/{allergy_id}", response_model=AllergySchema)
async def update_allergy(
    allergy_id: str,
    allergy_data: AllergyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an allergy entry"""
    allergy = db.query(Allergy).filter(Allergy.id == allergy_id).first()

    if not allergy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allergy not found"
        )

    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == allergy.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this allergy"
        )

    # Update fields
    if allergy_data.allergen is not None:
        allergy.allergen = allergy_data.allergen
    if allergy_data.reaction is not None:
        allergy.reaction = allergy_data.reaction
    if allergy_data.severity is not None:
        allergy.severity = allergy_data.severity
    if allergy_data.notes is not None:
        allergy.notes = allergy_data.notes
    if allergy_data.order_index is not None:
        allergy.order_index = allergy_data.order_index

    db.commit()
    db.refresh(allergy)

    return allergy


@router.delete("/allergies/{allergy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_allergy(
    allergy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an allergy entry"""
    allergy = db.query(Allergy).filter(Allergy.id == allergy_id).first()

    if not allergy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allergy not found"
        )

    # Verify application belongs to user
    application = db.query(Application).filter(
        Application.id == allergy.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this allergy"
        )

    db.delete(allergy)
    db.commit()
