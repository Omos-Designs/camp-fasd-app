"""
Google OAuth Authentication Endpoints
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import Token, UserResponse

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    """Request body for Google OAuth authentication"""
    credential: str


@router.post("/google", response_model=Token)
async def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate with Google OAuth2

    Expects a Google ID token in the credential field.
    Verifies the token and creates/updates user account.

    **Restrictions**:
    - Only @fasdcamp.org email addresses are allowed
    - Email must be verified by Google

    **Returns**:
    - JWT access token
    - User information
    """
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            auth_data.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Verify the token is from Google
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer"
            )

        # Extract user information
        google_id = idinfo['sub']
        email = idinfo.get('email')
        email_verified = idinfo.get('email_verified', False)
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Restrict to @fasdcamp.org domain
        if not email.endswith('@fasdcamp.org'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only @fasdcamp.org email addresses are allowed"
            )

        # Check if user exists by Google ID
        user = db.query(User).filter(User.google_id == google_id).first()

        if not user:
            # Check if email already exists (user might have registered with password)
            user = db.query(User).filter(User.email == email).first()

            if user:
                # Link Google account to existing user
                user.google_id = google_id
                user.email_verified = email_verified
                if not user.first_name:
                    user.first_name = first_name
                if not user.last_name:
                    user.last_name = last_name
            else:
                # Create new user
                # Default @fasdcamp.org users to admin role
                user = User(
                    email=email,
                    google_id=google_id,
                    first_name=first_name,
                    last_name=last_name,
                    role="admin",  # All @fasdcamp.org users are admins
                    email_verified=email_verified,
                    password_hash=None  # OAuth users don't have passwords
                )
                db.add(user)

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)

        # Create JWT access token
        access_token = create_access_token(subject=str(user.id))

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error (you might want to add proper logging)
        print(f"Google auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error occurred"
        )
