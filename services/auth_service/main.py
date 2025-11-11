"""
Authentication Microservice - Handles JWT, OAuth, and user management
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import jwt
import bcrypt
import os
import logging
from datetime import datetime, timedelta
from enum import Enum

app = FastAPI(title="Auth Service", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    company_name: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenData(BaseModel):
    user_id: str
    email: str
    role: UserRole
    tenant_id: Optional[str] = None


# Mock user database (in production, use real database)
USERS_DB = {
    "user1": {
        "id": "user1",
        "email": "demo@converto.fi",
        "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5J5f5zF5z2",  # "password"
        "full_name": "Demo User",
        "role": UserRole.USER,
        "company_name": "Demo Company",
        "created_at": datetime.utcnow(),
        "last_login": None,
        "tenant_id": "tenant_demo"
    }
}


@app.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register new user"""
    
    try:
        # Check if user already exists
        for user in USERS_DB.values():
            if user["email"] == user_data.email:
                raise HTTPException(
                    status_code=400, 
                    detail="User with this email already exists"
                )
        
        # Hash password
        password_hash = bcrypt.hashpw(
            user_data.password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Create user
        user_id = f"user_{len(USERS_DB) + 1}"
        user = {
            "id": user_id,
            "email": user_data.email,
            "password_hash": password_hash,
            "full_name": user_data.full_name,
            "role": UserRole.USER,
            "company_name": user_data.company_name,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "tenant_id": f"tenant_{user_id}"
        }
        
        USERS_DB[user_id] = user
        
        return UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})
        
    except Exception as e:
        logger.error(f"User registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")


@app.post("/auth/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user and return JWT token"""
    
    try:
        # Find user by email
        user = None
        for u in USERS_DB.values():
            if u["email"] == login_data.email:
                user = u
                break
        
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not bcrypt.checkpw(
            login_data.password.encode('utf-8'), 
            user["password_hash"].encode('utf-8')
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Update last login
        user["last_login"] = datetime.utcnow()
        
        # Create JWT token
        token_data = {
            "user_id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "tenant_id": user["tenant_id"],
            "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES),
            "iat": datetime.utcnow()
        }
        
        access_token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        user_response = UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})
        
        return TokenResponse(
            access_token=access_token,
            expires_in=JWT_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            credentials.credentials, 
            JWT_SECRET, 
            algorithms=[JWT_ALGORITHM]
        )
        
        user_id = payload.get("user_id")
        if not user_id or user_id not in USERS_DB:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        
        user = USERS_DB[user_id]
        return UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@app.post("/auth/refresh")
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh JWT token"""
    
    try:
        # Decode current token
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_exp": False}  # Allow expired tokens for refresh
        )
        
        user_id = payload.get("user_id")
        if not user_id or user_id not in USERS_DB:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        
        user = USERS_DB[user_id]
        
        # Create new token
        token_data = {
            "user_id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "tenant_id": user["tenant_id"],
            "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES),
            "iat": datetime.utcnow()
        }
        
        new_token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return TokenResponse(
            access_token=new_token,
            expires_in=JWT_EXPIRE_MINUTES * 60,
            user=UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})
        )
        
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@app.post("/auth/logout")
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user (in production, add token to blacklist)"""
    
    try:
        # Decode token to get user info
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        
        user_id = payload.get("user_id")
        logger.info(f"User {user_id} logged out")
        
        return {"message": "Successfully logged out"}
        
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@app.get("/auth/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token validity"""
    
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        
        user_id = payload.get("user_id")
        if not user_id or user_id not in USERS_DB:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        
        return {
            "valid": True,
            "user_id": user_id,
            "role": payload.get("role"),
            "tenant_id": payload.get("tenant_id")
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@app.get("/auth/users")
async def list_users(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """List all users (admin only)"""
    
    try:
        # Verify admin role
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        
        if payload.get("role") != UserRole.ADMIN:
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )
        
        users = []
        for user in USERS_DB.values():
            users.append(UserResponse(**{k: v for k, v in user.items() if k != "password_hash"}))
        
        return {"users": users}
        
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@app.get("/auth/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "auth-service"}


# Dependency for other services
async def get_current_user_from_token(token: str) -> TokenData:
    """Extract user data from JWT token (for use by other services)"""
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return TokenData(
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            role=UserRole(payload.get("role")),
            tenant_id=payload.get("tenant_id")
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
