"""
Security utilities for password hashing and JWT tokens
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import bcrypt
from app.core.config import settings


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token

    Args:
        subject: The subject (usually user ID) to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    # Convert strings to bytes for bcrypt
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode a JWT access token and return the subject (user ID)

    Args:
        token: JWT token string

    Returns:
        User ID from token subject, or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        return user_id
    except jwt.JWTError:
        return None
