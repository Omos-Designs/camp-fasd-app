"""
Dependency injection for FastAPI routes
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token

    Args:
        credentials: Bearer token from Authorization header
        db: Database session

    Returns:
        User model instance

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    user_id = decode_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (email verified)

    Args:
        current_user: Current user from token

    Returns:
        User model instance

    Raises:
        HTTPException: If user email is not verified
    """
    # For now, we'll allow unverified users
    # Uncomment below to require email verification
    # if not current_user.email_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Email not verified"
    #     )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user if they are admin or super_admin

    Args:
        current_user: Current user from token

    Returns:
        User model instance

    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_current_super_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user if they are super_admin

    Args:
        current_user: Current user from token

    Returns:
        User model instance

    Raises:
        HTTPException: If user is not a super admin
    """
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user