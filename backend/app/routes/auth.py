"""Authentication routes for DocFlow Admin API and Supabase onboarding.

NOTE: The legacy email/password JWT endpoints are kept for backwards
compatibility. New authentication should go through Supabase Auth, with
this module providing lightweight onboarding helpers for the backend.
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
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


class OnboardRequest(BaseModel):
    """Lightweight onboarding payload from the dashboard signup flow."""

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    business_id: Optional[str] = None
    plan: Optional[str] = None
    goal: Optional[str] = None

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


@router.post("/onboard")
async def onboard_user(request: Request, payload: OnboardRequest) -> dict:
    """Onboard a Supabase-authenticated user into the DocFlow backend.

    This endpoint is intentionally lightweight:
      - Reads Supabase JWT claims from request.state.supabase_claims
      - Derives a stable tenant identifier
      - Logs the onboarding context for later analytics

    It does not currently persist data to the backend database; that can be
    added once the tenant/user schema is finalised.
    """

    claims = getattr(request.state, "supabase_claims", None)
    if not isinstance(claims, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="supabase_claims_missing",
        )

    user_id = str(claims.get("sub", ""))
    email = claims.get("email") or payload.email

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="missing_user_identity",
        )

    # Derive tenant id from Supabase claims or fallback to company / email
    tenant_id = (
        claims.get("tenant_id")
        or claims.get("org_id")
        or claims.get("app_metadata", {}).get("tenant_id")
        or claims.get("user_metadata", {}).get("tenant_id")
        or (payload.company or "").lower().replace(" ", "-")  # best-effort
        or f"tenant-{user_id}"
    )

    # Mirror RBAC mapping for basic role classification
    role_value = None
    app_meta = claims.get("app_metadata") or {}
    user_meta = claims.get("user_metadata") or {}
    for key in ("role", "user_role", "user_type"):
        if key in claims:
            role_value = claims.get(key)
            break
        if key in app_meta:
            role_value = app_meta.get(key)
            break
        if key in user_meta:
            role_value = user_meta.get(key)
            break
    role = str(role_value or "user").lower()

    # For now we simply return the derived onboarding context; persistence
    # can be added once the multi-tenant schema is locked in.
    return {
        "status": "ok",
        "user": {
            "id": user_id,
            "email": email,
            "tenant_id": tenant_id,
            "role": role,
        },
        "meta": {
            "company": payload.company,
            "business_id": payload.business_id,
            "plan": payload.plan,
            "goal": payload.goal,
            "onboarded_at": datetime.utcnow().isoformat(),
        },
    }