"""
Application API endpoints
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.application import (
    Application,
    ApplicationSection,
    ApplicationQuestion,
    ApplicationResponse,
    ApplicationApproval
)
from app.schemas.application import (
    ApplicationSectionWithQuestions,
    ApplicationCreate,
    ApplicationUpdate,
    Application as ApplicationSchema,
    ApplicationWithResponses,
    ApplicationWithUser,
    ApplicationProgress,
    SectionProgress,
    ApplicationResponseCreate
)

router = APIRouter()


@router.get("/sections", response_model=List[ApplicationSectionWithQuestions])
async def get_application_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all active application sections with their questions

    Returns sections in order with all active questions
    """
    sections = db.query(ApplicationSection).filter(
        ApplicationSection.is_active == True
    ).order_by(ApplicationSection.order_index).all()

    return sections


@router.post("", response_model=ApplicationSchema, status_code=status.HTTP_201_CREATED)
async def create_application(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new application for the current user

    Users can only have one active application at a time
    """
    # Check if user already has an application
    existing = db.query(Application).filter(
        Application.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active application"
        )

    # Create new application
    application = Application(
        user_id=current_user.id,
        camper_first_name=application_data.camper_first_name,
        camper_last_name=application_data.camper_last_name,
        status="in_progress"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get("", response_model=List[ApplicationSchema])
async def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all applications for the current user
    """
    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).all()

    return applications


@router.get("/admin/all")
async def get_all_applications_admin(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by camper name or user email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Admin-only: Get all applications with filtering and user information

    Query Parameters:
    - status_filter: Filter by application status (in_progress, under_review, approved, etc.)
    - search: Search by camper name or user email
    """
    from sqlalchemy.orm import joinedload

    query = db.query(Application).join(User, Application.user_id == User.id).options(
        joinedload(Application.user),
        joinedload(Application.responses),
        joinedload(Application.approvals).joinedload(ApplicationApproval.admin)
    )

    # Apply status filter
    if status_filter:
        query = query.filter(Application.status == status_filter)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Application.camper_first_name.ilike(search_term),
                Application.camper_last_name.ilike(search_term),
                User.email.ilike(search_term),
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term)
            )
        )

    # Order by most recent first
    query = query.order_by(Application.updated_at.desc())

    applications = query.all()

    # Convert to dict and add approval information
    result = []
    for app in applications:
        app_dict = ApplicationWithUser.model_validate(app).model_dump()

        # Add approval stats
        approvals = [a for a in app.approvals if a.approved]
        app_dict['approval_count'] = len(approvals)
        app_dict['approved_by_teams'] = [a.admin.team for a in approvals if a.admin and a.admin.team]

        result.append(app_dict)

    return result


@router.get("/admin/{application_id}", response_model=ApplicationWithUser)
async def get_application_admin(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Admin-only: Get any application with all responses and user info
    """
    from sqlalchemy.orm import joinedload

    application = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.responses)
    ).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return application


@router.get("/{application_id}", response_model=ApplicationWithResponses)
async def get_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific application with all responses (user must own the application)
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return application


@router.patch("/{application_id}", response_model=ApplicationSchema)
async def update_application(
    application_id: str,
    update_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update application and save responses (autosave)

    This endpoint handles:
    - Updating basic application info
    - Saving/updating responses to questions
    - Calculating completion percentage
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Update basic info
    if update_data.camper_first_name is not None:
        application.camper_first_name = update_data.camper_first_name
    if update_data.camper_last_name is not None:
        application.camper_last_name = update_data.camper_last_name

    # Save responses if provided
    if update_data.responses:
        for response_data in update_data.responses:
            # Check if response already exists
            existing_response = db.query(ApplicationResponse).filter(
                ApplicationResponse.application_id == application_id,
                ApplicationResponse.question_id == response_data.question_id
            ).first()

            if existing_response:
                # Update existing response
                existing_response.response_value = response_data.response_value
                existing_response.file_id = response_data.file_id
            else:
                # Create new response
                new_response = ApplicationResponse(
                    application_id=application_id,
                    question_id=response_data.question_id,
                    response_value=response_data.response_value,
                    file_id=response_data.file_id
                )
                db.add(new_response)

    # Calculate completion percentage
    completion = calculate_completion_percentage(db, application_id)
    application.completion_percentage = completion

    # Auto-mark as under_review when 100% complete
    if completion == 100 and application.status == "in_progress":
        application.status = "under_review"
        application.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(application)

    return application


@router.get("/{application_id}/progress", response_model=ApplicationProgress)
async def get_application_progress(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed progress for an application

    Returns completion status for each section and overall progress
    """
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Get all sections
    sections = db.query(ApplicationSection).filter(
        ApplicationSection.is_active == True
    ).order_by(ApplicationSection.order_index).all()

    section_progress_list = []
    completed_sections = 0

    for section in sections:
        # Get questions for this section
        questions = db.query(ApplicationQuestion).filter(
            ApplicationQuestion.section_id == section.id,
            ApplicationQuestion.is_active == True
        ).all()

        total_questions = len(questions)
        required_questions = sum(1 for q in questions if q.is_required)

        # Get responses for this section's questions
        question_ids = [q.id for q in questions]
        responses = db.query(ApplicationResponse).filter(
            ApplicationResponse.application_id == application_id,
            ApplicationResponse.question_id.in_(question_ids)
        ).all()

        answered_questions = len(responses)
        answered_required = sum(
            1 for r in responses
            if any(q.id == r.question_id and q.is_required for q in questions)
        )

        # Calculate section completion
        if required_questions > 0:
            section_percentage = int((answered_required / required_questions) * 100)
        else:
            section_percentage = 100 if answered_questions == total_questions else 0

        is_complete = answered_required == required_questions

        if is_complete:
            completed_sections += 1

        section_progress_list.append(SectionProgress(
            section_id=section.id,
            section_title=section.title,
            total_questions=total_questions,
            required_questions=required_questions,
            answered_questions=answered_questions,
            answered_required=answered_required,
            completion_percentage=section_percentage,
            is_complete=is_complete
        ))

    # Calculate overall percentage
    total_sections = len(sections)
    overall_percentage = int((completed_sections / total_sections) * 100) if total_sections > 0 else 0

    return ApplicationProgress(
        application_id=application.id,
        total_sections=total_sections,
        completed_sections=completed_sections,
        overall_percentage=overall_percentage,
        section_progress=section_progress_list
    )


def calculate_completion_percentage(db: Session, application_id: str) -> int:
    """
    Calculate the completion percentage for an application
    Based on required questions answered
    """
    # Get total required questions
    total_required = db.query(func.count(ApplicationQuestion.id)).filter(
        ApplicationQuestion.is_required == True,
        ApplicationQuestion.is_active == True
    ).scalar()

    if total_required == 0:
        return 100

    # Get answered required questions
    answered = db.query(func.count(ApplicationResponse.id)).join(
        ApplicationQuestion,
        ApplicationResponse.question_id == ApplicationQuestion.id
    ).filter(
        ApplicationResponse.application_id == application_id,
        ApplicationQuestion.is_required == True,
        ApplicationQuestion.is_active == True
    ).scalar()

    return int((answered / total_required) * 100)
