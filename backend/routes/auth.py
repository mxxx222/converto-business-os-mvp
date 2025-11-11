ackend/routes/auth.py</path>
<content">
"""
Authentication Routes for DocFlow Admin API
Focus on core business functionality - authentication and user management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import os
import json
from typing import Optional
import httpx
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    company: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    company: Optional[str] = None
    created_at: str
    plan: str = "free"

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

supabase_headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    token = credentials.credentials
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return user_data
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token verification failed",
                headers={"WWW-Authenticate": "Bearer"},
            )

@router.post("/signup", response_model=dict)
async def signup(request: SignupRequest):
    """User registration with Supabase Auth"""
    
    async with httpx.AsyncClient() as client:
        try:
            # Create user with Supabase Auth
            auth_response = await client.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers=supabase_headers,
                json={
                    "email": request.email,
                    "password": request.password,
                    "data": {
                        "full_name": request.full_name,
                        "company": request.company
                    }
                }
            )
            
            if auth_response.status_code != 200:
                error_data = auth_response.json()
                raise HTTPException(
                    status_code=400,
                    detail=error_data.get("error", "Signup failed")
                )
            
            auth_data = auth_response.json()
            user = auth_data["user"]
            
            # Create user profile in custom table
            profile_data = {
                "user_id": user["id"],
                "email": request.email,
                "full_name": request.full_name,
                "company": request.company,
                "plan": "free",
                "created_at": datetime.now().isoformat()
            }
            
            profile_response = await client.post(
                f"{SUPABASE_URL}/rest/v1/user_profiles",
                headers=supabase_headers,
                json=profile_data
            )
            
            return {
                "success": True,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "full_name": request.full_name,
                    "company": request.company
                },
                "session": auth_data.get("session"),
                "message": "User registered successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Signup error: {str(e)}"
            )

@router.post("/login", response_model=dict)
async def login(request: LoginRequest):
    """User authentication with Supabase Auth"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers=supabase_headers,
                json={
                    "email": request.email,
                    "password": request.password
                }
            )
            
            if response.status_code != 200:
                error_data = response.json()
                raise HTTPException(
                    status_code=401,
                    detail="Invalid email or password"
                )
            
            auth_data = response.json()
            user = auth_data["user"]
            
            # Get user profile
            profile_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.{user['id']}&select=*",
                headers=supabase_headers
            )
            
            profile = None
            if profile_response.status_code == 200:
                profiles = profile_response.json()
                if profiles:
                    profile = profiles[0]
            
            return {
                "success": True,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "full_name": profile.get("full_name") if profile else None,
                    "company": profile.get("company") if profile else None,
                    "plan": profile.get("plan", "free") if profile else "free"
                },
                "session": {
                    "access_token": auth_data["access_token"],
                    "refresh_token": auth_data["refresh_token"],
                    "expires_at": auth_data["expires_at"]
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Login error: {str(e)}"
            )

@router.post("/logout")
async def logout(current_user: dict = Depends(verify_token)):
    """User logout"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/logout",
                headers={"Authorization": f"Bearer {current_user['access_token']}"}
            )
            
            return {
                "success": True,
                "message": "User logged out successfully"
            }
            
        except Exception as e:
            # Even if logout fails, return success
            return {
                "success": True,
                "message": "User logged out"
            }

@router.get("/me", response_model=UserProfile)
async def get_current_user(current_user: dict = Depends(verify_token)):
    """Get current user profile"""
    
    # Get user profile from database
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.{current_user['id']}&select=*",
                headers=supabase_headers
            )
            
            if response.status_code == 200:
                profiles = response.json()
                if profiles:
                    profile = profiles[0]
                    return UserProfile(
                        user_id=profile["user_id"],
                        email=profile["email"],
                        full_name=profile.get("full_name"),
                        company=profile.get("company"),
                        created_at=profile["created_at"],
                        plan=profile.get("plan", "free")
                    )
            
            # If no profile found, create basic profile
            return UserProfile(
                user_id=current_user["id"],
                email=current_user["email"],
                full_name=current_user.get("user_metadata", {}).get("full_name"),
                company=current_user.get("user_metadata", {}).get("company"),
                created_at=current_user.get("created_at", datetime.now().isoformat()),
                plan="free"
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Profile fetch error: {str(e)}"
            )

@router.put("/profile")
async def update_user_profile(
    profile_data: dict,
    current_user: dict = Depends(verify_token)
):
    """Update user profile"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.{current_user['id']}",
                headers=supabase_headers,
                json={
                    **profile_data,
                    "updated_at": datetime.now().isoformat()
                }
            )
            
            if response.status_code not in [200, 204]:
                raise HTTPException(
                    status_code=400,
                    detail="Profile update failed"
                )
            
            return {
                "success": True,
                "message": "Profile updated successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Profile update error: {str(e)}"
            )

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=refresh_token",
                headers=supabase_headers,
                json={
                    "refresh_token": refresh_token
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid refresh token"
                )
            
            auth_data = response.json()
            
            return {
                "success": True,
                "session": {
                    "access_token": auth_data["access_token"],
                    "refresh_token": auth_data["refresh_token"],
                    "expires_at": auth_data["expires_at"]
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Token refresh error: {str(e)}"
            )

@router.get("/health")
async def auth_health():
    """Authentication service health check"""
    
    return {
        "status": "healthy",
        "service": "authentication",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "user_signup",
            "user_login", 
            "user_logout",
            "profile_management",
            "token_refresh"
        ]
    }