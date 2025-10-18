"""
Authentication API endpoints
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user

    - **email**: Valid email address
    - **password**: Password (min 8 characters)
    - **first_name**: User's first name (optional)
    - **last_name**: User's last name (optional)
    - **phone**: Phone number (optional)
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role="user",  # Default role
        email_verified=False
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token
    access_token = create_access_token(subject=str(db_user.id))

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(db_user)
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password

    - **email**: User's email address
    - **password**: User's password

    Returns JWT access token and user information
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Create access token
    access_token = create_access_token(subject=str(user.id))

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information

    Requires authentication (Bearer token in Authorization header)
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout (client should discard token)

    Note: JWT tokens are stateless, so logout is handled client-side
    by removing the token from storage.
    """
    return {"message": "Successfully logged out"}
