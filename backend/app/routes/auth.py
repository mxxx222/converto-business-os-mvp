"""Authentication routes for DocFlow Admin API."""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import jwt as pyjwt
from passlib.context import CryptContext

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mock user database (replace with actual database in production)
users_db = {}

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "docflow-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    company: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    plan: str = "free"
    created_at: str

def create_access_token(user_id: str) -> str:
    """Create JWT access token."""
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    encoded_jwt = pyjwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token."""
    try:
        token = credentials.credentials
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Find user in database
        for user in users_db.values():
            if user["id"] == user_id:
                return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except pyjwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/health")
async def auth_health():
    """Authentication service health check."""
    return {
        "status": "healthy",
        "service": "authentication",
        "features": ["signup", "login", "logout", "profile", "token-refresh"],
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest):
    """User registration."""
    
    # Check if user already exists
    for user in users_db.values():
        if user["email"] == request.email:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
    
    # Validate password
    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )
    
    # Create new user
    user_id = "user_" + secrets.token_hex(16)
    user = {
        "id": user_id,
        "email": request.email,
        "password": get_password_hash(request.password),
        "full_name": request.full_name,
        "company": request.company,
        "plan": "free",
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None
    }
    
    users_db[user_id] = user
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        company=user["company"],
        plan=user["plan"],
        created_at=user["created_at"]
    )

@router.post("/login")
async def login(request: LoginRequest):
    """User authentication."""
    
    # Find user by email
    user = None
    for u in users_db.values():
        if u["email"] == request.email:
            user = u
            break
    
    if user is None or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last login
    user["last_login"] = datetime.utcnow().isoformat()
    
    # Create access token
    access_token = create_access_token(user["id"])
    
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "company": user["company"],
            "plan": user["plan"],
            "created_at": user["created_at"],
            "last_login": user["last_login"]
        },
        "session": {
            "access_token": access_token,
            "expires_at": (datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)).isoformat()
        }
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """User logout."""
    # In a real implementation, you'd invalidate the token
    # For now, just return success
    return {
        "success": True,
        "message": "User logged out successfully"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        company=current_user["company"],
        plan=current_user["plan"],
        created_at=current_user["created_at"]
    )

@router.put("/profile")
async def update_user_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile."""
    
    # Update allowed fields
    allowed_fields = ["full_name", "company"]
    for field in allowed_fields:
        if field in profile_data:
            current_user[field] = profile_data[field]
    
    # Update password if provided
    if "password" in profile_data:
        if len(profile_data["password"]) < 6:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 6 characters long"
            )
        current_user["password"] = get_password_hash(profile_data["password"])
    
    return {
        "success": True,
        "message": "Profile updated successfully"
    }

@router.post("/refresh")
async def refresh_token(refresh_data: dict):
    """Refresh access token."""
    
    current_token = refresh_data.get("access_token")
    if not current_token:
        raise HTTPException(
            status_code=400,
            detail="Access token required"
        )
    
    try:
        # Verify current token
        payload = pyjwt.decode(current_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        
        # Create new token
        new_token = create_access_token(user_id)
        
        return {
            "success": True,
            "session": {
                "access_token": new_token,
                "expires_at": (datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)).isoformat()
            }
        }
    except pyjwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )