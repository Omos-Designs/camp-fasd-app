"""
File Management API Routes
Handles file uploads and downloads for application documents
"""

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session, joinedload
from typing import List

from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..models.application import (
    Application,
    File as FileModel,
    ApplicationResponse,
    ApplicationQuestion,
)
from ..services import storage_service
from ..core.config import settings

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    application_id: str = Form(...),
    question_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file for an application question

    - Validates file type and size
    - Uploads to Supabase Storage
    - Creates ApplicationFile record
    - Links file to ApplicationResponse
    """
    # Validate application belongs to user
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)

    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE / (1024*1024)}MB"
        )

    # Validate file type
    file_extension = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_extension not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
        )

    # Reset file pointer for upload
    await file.seek(0)

    question = db.query(ApplicationQuestion).options(
        joinedload(ApplicationQuestion.section)
    ).filter(
        ApplicationQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    section_label = None
    if question.section and question.section.title:
        section_label = question.section.title[:100]

    try:
        # Upload to Supabase Storage
        upload_result = storage_service.upload_file(
            file=file_content,
            filename=file.filename,
            application_id=application_id,
            question_id=question_id,
            content_type=file.content_type or "application/octet-stream"
        )

        # Create File record
        file_record = FileModel(
            application_id=application_id,
            uploaded_by=current_user.id,
            file_name=file.filename,
            storage_path=upload_result["path"],
            file_size=file_size,
            file_type=file.content_type or "application/octet-stream",
            section=section_label
        )
        db.add(file_record)
        db.flush()  # Flush to get the file_record.id before using it

        # Update or create ApplicationResponse to link the file
        response = db.query(ApplicationResponse).filter(
            ApplicationResponse.application_id == application_id,
            ApplicationResponse.question_id == question_id
        ).first()

        if response:
            # Update existing response with file_id
            response.file_id = file_record.id
            response.response_value = None  # Clear text value when file is uploaded
        else:
            # Create new response with file
            response = ApplicationResponse(
                application_id=application_id,
                question_id=question_id,
                file_id=file_record.id
            )
            db.add(response)

        db.commit()
        db.refresh(file_record)

        return {
            "success": True,
            "file_id": file_record.id,
            "filename": file_record.file_name,
            "url": upload_result.get("url"),
            "message": "File uploaded successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get file metadata and download URL

    Returns file information and a signed URL for downloading
    """
    # Get file record
    file_record = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # Verify user owns the application
    application = db.query(Application).filter(
        Application.id == file_record.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        # Generate signed URL (valid for 1 hour)
        signed_url = storage_service.get_signed_url(
            file_record.storage_path,
            expires_in=3600
        )

        return {
            "id": file_record.id,
            "filename": file_record.file_name,
            "size": file_record.file_size,
            "content_type": file_record.file_type,
            "url": signed_url,
            "created_at": file_record.created_at.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file: {str(e)}")


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a file

    Removes file from storage and database
    """
    # Get file record
    file_record = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # Verify user owns the application
    application = db.query(Application).filter(
        Application.id == file_record.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        # Delete from storage
        storage_service.delete_file(file_record.storage_path)

        # Remove file_id from any responses
        responses = db.query(ApplicationResponse).filter(
            ApplicationResponse.file_id == file_id
        ).all()
        for response in responses:
            response.file_id = None

        # Delete file record
        db.delete(file_record)
        db.commit()

        return {
            "success": True,
            "message": "File deleted successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
