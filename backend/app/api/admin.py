"""
Admin API routes for application management
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.deps import get_current_admin_user
from app.models.user import User
from app.models.application import Application, AdminNote, ApplicationApproval, ApplicationResponse
from app.schemas.admin_note import AdminNote as AdminNoteSchema, AdminNoteCreate
from app.schemas.application import ApplicationUpdate, Application as ApplicationSchema, ApplicationProgress

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/applications/{application_id}/progress", response_model=ApplicationProgress)
async def get_application_progress_admin(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get detailed progress for an application (admin version)

    Returns completion status for each section and overall progress.
    Admin can view progress for any application.
    """
    # Import here to avoid circular dependency
    from app.api.applications import (
        ApplicationSection,
        ApplicationQuestion,
        ApplicationResponse as AppResponse,
        SectionProgress
    )

    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Get application status for conditional filtering
    app_status = application.status

    # Get sections filtered by status
    sections_query = db.query(ApplicationSection).filter(
        ApplicationSection.is_active == True
    )

    # Filter sections by status
    if app_status:
        sections_query = sections_query.filter(
            (ApplicationSection.show_when_status == None) |
            (ApplicationSection.show_when_status == app_status)
        )
    else:
        sections_query = sections_query.filter(
            ApplicationSection.show_when_status == None
        )

    sections = sections_query.order_by(ApplicationSection.order_index).all()

    # Get all responses for this application
    all_responses = db.query(AppResponse).filter(
        AppResponse.application_id == application_id
    ).all()

    # Create a dict of question_id -> response_value for quick lookup
    response_dict = {str(r.question_id): r.response_value for r in all_responses}

    # Helper function to check if a question should be shown based on conditional logic
    def should_show_question(question: ApplicationQuestion) -> bool:
        # If no conditional logic, always show
        if not question.show_if_question_id or not question.show_if_answer:
            return True

        # Get the trigger question's response
        trigger_response = response_dict.get(str(question.show_if_question_id))

        # Show the question only if the trigger response matches the expected answer
        return trigger_response == question.show_if_answer

    section_progress_list = []
    completed_sections = 0

    for section in sections:
        # Get questions for this section, filtered by status
        questions_query = db.query(ApplicationQuestion).filter(
            ApplicationQuestion.section_id == section.id,
            ApplicationQuestion.is_active == True
        )

        # Filter questions by status
        if app_status:
            questions_query = questions_query.filter(
                (ApplicationQuestion.show_when_status == None) |
                (ApplicationQuestion.show_when_status == app_status)
            )
        else:
            questions_query = questions_query.filter(
                ApplicationQuestion.show_when_status == None
            )

        questions = questions_query.all()

        # Filter questions by conditional logic
        visible_questions = [q for q in questions if should_show_question(q)]

        total_questions = len(visible_questions)
        required_questions = sum(1 for q in visible_questions if q.is_required)

        # Get responses for visible questions only
        visible_question_ids = [q.id for q in visible_questions]
        responses = [r for r in all_responses if r.question_id in visible_question_ids]

        answered_questions = len(responses)
        answered_required = sum(
            1 for r in responses
            if any(q.id == r.question_id and q.is_required for q in visible_questions)
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


@router.get("/applications/{application_id}/approval-status")
async def get_approval_status(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get approval status for an application
    Returns approval count, decline count, and current user's vote
    """
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )

        # Get all approvals with admin info
        approvals = db.query(ApplicationApproval).options(
            joinedload(ApplicationApproval.admin)
        ).filter(
            ApplicationApproval.application_id == application_id
        ).all()

        # Count approvals and declines
        approval_count = sum(1 for a in approvals if a.approved)
        decline_count = sum(1 for a in approvals if not a.approved)

        # Check current user's vote
        current_user_vote = None
        for approval in approvals:
            if approval.admin_id == current_user.id:
                current_user_vote = "approved" if approval.approved else "declined"
                break

        # Get list of admins who approved/declined
        approved_by = [
            {
                "admin_id": str(a.admin_id),
                "name": f"{a.admin.first_name} {a.admin.last_name}" if a.admin else "Unknown",
                "team": a.admin.team if a.admin else None
            }
            for a in approvals if a.approved
        ]

        declined_by = [
            {
                "admin_id": str(a.admin_id),
                "name": f"{a.admin.first_name} {a.admin.last_name}" if a.admin else "Unknown",
                "team": a.admin.team if a.admin else None
            }
            for a in approvals if not a.approved
        ]

        return {
            "application_id": str(application_id),
            "approval_count": approval_count,
            "decline_count": decline_count,
            "current_user_vote": current_user_vote,
            "approved_by": approved_by,
            "declined_by": declined_by,
            "status": application.status
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting approval status: {str(e)}"
        )


@router.post("/applications/{application_id}/notes", response_model=AdminNoteSchema)
async def create_note(
    application_id: str,
    note_data: AdminNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new admin note on an application
    Admin-only endpoint
    """
    # Verify application exists
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Create note
    note = AdminNote(
        application_id=application_id,
        admin_id=current_user.id,
        note=note_data.note
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    # Load admin info
    note = db.query(AdminNote).options(
        joinedload(AdminNote.admin)
    ).filter(AdminNote.id == note.id).first()

    return note


@router.get("/applications/{application_id}/notes", response_model=List[AdminNoteSchema])
async def get_notes(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all notes for an application
    Admin-only endpoint
    """
    # Verify application exists
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Get notes with admin info, ordered by most recent first
    notes = db.query(AdminNote).options(
        joinedload(AdminNote.admin)
    ).filter(
        AdminNote.application_id == application_id
    ).order_by(AdminNote.created_at.desc()).all()

    return notes


@router.post("/applications/{application_id}/approve")
async def approve_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Approve an application (admin marks their approval)
    - Creates/updates approval record for this admin
    - If 3 approvals reached, auto-transitions to 'accepted' status
    Admin-only endpoint
    """
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )

        # Check if this admin already has an approval/decline record
        existing = db.query(ApplicationApproval).filter(
            ApplicationApproval.application_id == application_id,
            ApplicationApproval.admin_id == current_user.id
        ).first()

        if existing:
            # Update existing record
            existing.approved = True
            existing.created_at = datetime.now(timezone.utc)  # Update timestamp
        else:
            # Create new approval record
            approval = ApplicationApproval(
                application_id=application_id,
                admin_id=current_user.id,
                approved=True
            )
            db.add(approval)

        db.flush()  # Flush to get the record in the session

        # Count total approvals (approved=True)
        approval_count = db.query(ApplicationApproval).filter(
            ApplicationApproval.application_id == application_id,
            ApplicationApproval.approved == True
        ).count()

        # NOTE: 3 approvals no longer auto-accept - admin must manually click Accept button
        db.commit()
        db.refresh(application)

        return {
            "message": "Application approved successfully",
            "application_id": str(application.id),
            "status": application.status,
            "approval_count": approval_count,
            "accept_button_enabled": approval_count >= 3
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving application: {str(e)}"
        )


@router.post("/applications/{application_id}/decline")
async def decline_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Decline an application (admin marks their decline)
    - Creates/updates decline record for this admin
    - Does NOT change application status (status stays 'under_review')
    - Decline is tracked per-admin like approvals
    Admin-only endpoint
    """
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )

        # Check if this admin already has an approval/decline record
        existing = db.query(ApplicationApproval).filter(
            ApplicationApproval.application_id == application_id,
            ApplicationApproval.admin_id == current_user.id
        ).first()

        if existing:
            # Update existing record to declined
            existing.approved = False
            existing.created_at = datetime.now(timezone.utc)
        else:
            # Create new decline record
            decline = ApplicationApproval(
                application_id=application_id,
                admin_id=current_user.id,
                approved=False
            )
            db.add(decline)

        db.commit()

        # Count approvals and declines
        approval_count = db.query(ApplicationApproval).filter(
            ApplicationApproval.application_id == application_id,
            ApplicationApproval.approved == True
        ).count()

        decline_count = db.query(ApplicationApproval).filter(
            ApplicationApproval.application_id == application_id,
            ApplicationApproval.approved == False
        ).count()

        return {
            "message": "Application declined",
            "application_id": str(application.id),
            "status": application.status,
            "approval_count": approval_count,
            "decline_count": decline_count
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error declining application: {str(e)}"
        )


@router.post("/applications/{application_id}/accept")
async def accept_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Accept an application (manually transition to 'accepted' status)
    - Requires 3 approvals from 3 different teams
    - Sets status to 'accepted' and records timestamp
    - Triggers conditional questions to appear
    - Sends acceptance email (TODO)
    Admin/Super Admin only endpoint
    """
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )

        # Verify application is in under_review status
        if application.status != 'under_review':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Application must be 'under_review' to accept. Current status: {application.status}"
            )

        # Count approvals and verify 3 approvals from different teams
        approvals = db.query(ApplicationApproval).options(
            joinedload(ApplicationApproval.admin)
        ).filter(
            ApplicationApproval.application_id == application_id,
            ApplicationApproval.approved == True
        ).all()

        approval_count = len(approvals)
        if approval_count < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Application requires 3 approvals. Current approvals: {approval_count}"
            )

        # Verify approvals are from 3 different teams
        teams = set(a.admin.team for a in approvals if a.admin and a.admin.team)
        if len(teams) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Application requires approvals from 3 different teams. Current teams: {', '.join(teams)}"
            )

        # Accept the application
        application.status = 'accepted'
        application.accepted_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(application)

        # Recalculate progress - will now include conditional post-acceptance questions
        from app.api.applications import calculate_completion_percentage
        new_progress = calculate_completion_percentage(db, application_id)
        application.completion_percentage = new_progress
        db.commit()

        # TODO: Send acceptance email to family

        return {
            "message": "Application accepted successfully - new sections now available",
            "application_id": str(application.id),
            "status": application.status,
            "accepted_at": application.accepted_at.isoformat(),
            "approved_by_teams": list(teams),
            "new_completion_percentage": new_progress
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accepting application: {str(e)}"
        )


@router.patch("/applications/{application_id}", response_model=ApplicationSchema)
async def update_application_admin(
    application_id: str,
    update_data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update application as admin (can edit any application)
    Admin-only endpoint
    """
    try:
        application = db.query(Application).filter(
            Application.id == application_id
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

        db.commit()
        db.refresh(application)

        return application
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating application: {str(e)}"
        )
