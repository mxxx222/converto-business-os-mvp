"""User management routes for DocFlow Admin API."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime, timedelta
import jwt as pyjwt
from collections import defaultdict

router = APIRouter(prefix="/api/users", tags=["users"])
security = HTTPBearer()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "docflow-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

# In-memory storage (replace with database in production)
user_documents = defaultdict(list)
processing_jobs = defaultdict(dict)

def get_user_id_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Extract user ID from JWT token."""
    try:
        token = credentials.credentials
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return user_id
    except pyjwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@router.get("/dashboard")
async def get_user_dashboard(user_id: str = Depends(get_user_id_from_token)):
    """Get user dashboard data."""
    user_docs = user_documents[user_id]
    
    # Calculate metrics
    total_documents = len(user_docs)
    this_week = len([doc for doc in user_docs 
                    if datetime.fromisoformat(doc.get('processed_at', datetime.now().isoformat())) 
                    >= datetime.now() - timedelta(days=7)])
    this_month = len([doc for doc in user_docs 
                     if datetime.fromisoformat(doc.get('processed_at', datetime.now().isoformat())) 
                     >= datetime.now().replace(day=1)])
    
    total_value = sum(doc.get('total', 0) for doc in user_docs)
    average_value = total_value / total_documents if total_documents > 0 else 0
    
    # Recent activity
    recent_activity = sorted(user_docs, 
                           key=lambda x: x.get('processed_at', ''), 
                           reverse=True)[:5]
    
    # Monthly trend (last 6 months)
    monthly_trend = []
    for i in range(5, -1, -1):
        month_date = datetime.now().replace(day=1) - timedelta(days=i*30)
        month_docs = [doc for doc in user_docs 
                     if datetime.fromisoformat(doc.get('processed_at', datetime.now().isoformat())).month == month_date.month
                     and datetime.fromisoformat(doc.get('processed_at', datetime.now().isoformat())).year == month_date.year]
        month_value = sum(doc.get('total', 0) for doc in month_docs)
        
        monthly_trend.append({
            "month": month_date.strftime("%b %Y"),
            "documents": len(month_docs),
            "value": round(month_value, 2)
        })
    
    # Top vendors
    vendor_counts = defaultdict(int)
    for doc in user_docs:
        vendor = doc.get('vendor', 'Unknown')
        vendor_counts[vendor] += 1
    
    top_vendors = sorted([(vendor, count) for vendor, count in vendor_counts.items()], 
                        key=lambda x: x[1], reverse=True)[:3]
    
    return {
        "user_id": user_id,
        "dashboard": {
            "overview": {
                "total_documents": total_documents,
                "this_week": this_week,
                "this_month": this_month,
                "total_value": round(total_value, 2),
                "average_value": round(average_value, 2)
            },
            "recent_activity": recent_activity,
            "monthly_trend": monthly_trend,
            "top_vendors": [{"vendor": vendor, "documents": count, "percentage": round(count/total_documents*100, 1) if total_documents > 0 else 0} for vendor, count in top_vendors]
        },
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/statistics")
async def get_user_statistics(user_id: str = Depends(get_user_id_from_token)):
    """Get user statistics."""
    user_docs = user_documents[user_id]
    user_jobs = [job for job in processing_jobs[user_id].values()]
    
    # Processing statistics
    completed_jobs = [job for job in user_jobs if job.get('status') == 'completed']
    failed_jobs = [job for job in user_jobs if job.get('status') == 'failed']
    processing_jobs_active = [job for job in user_jobs if job.get('status') == 'processing']
    
    # Value statistics
    total_value = sum(doc.get('total', 0) for doc in user_docs)
    max_value = max([doc.get('total', 0) for doc in user_docs] + [0])
    min_value = min([doc.get('total', 0) for doc in user_docs] if user_docs else [0])
    
    # Activity statistics
    now = datetime.now()
    last_24h = len([doc for doc in user_docs 
                   if now - datetime.fromisoformat(doc.get('processed_at', now.isoformat())) <= timedelta(days=1)])
    last_7d = len([doc for doc in user_docs 
                  if now - datetime.fromisoformat(doc.get('processed_at', now.isoformat())) <= timedelta(days=7)])
    last_30d = len([doc for doc in user_docs 
                   if now - datetime.fromisoformat(doc.get('processed_at', now.isoformat())) <= timedelta(days=30)])
    
    # Success rate
    total_jobs = len(user_jobs)
    success_rate = (len(completed_jobs) / total_jobs * 100) if total_jobs > 0 else 0
    
    return {
        "user_id": user_id,
        "statistics": {
            "processing": {
                "total_jobs": total_jobs,
                "completed": len(completed_jobs),
                "failed": len(failed_jobs),
                "processing": len(processing_jobs_active),
                "success_rate": round(success_rate, 1),
                "average_processing_time": "2-4s"
            },
            "value": {
                "total_value": round(total_value, 2),
                "max_single_value": max_value,
                "min_single_value": min_value,
                "average_value": round(total_value / len(user_docs), 2) if user_docs else 0
            },
            "activity": {
                "last_24h": last_24h,
                "last_7d": last_7d,
                "last_30d": last_30d,
                "total": len(user_docs)
            },
            "quality": {
                "accuracy_rate": round(85 + (success_rate * 0.1), 1),
                "data_completeness": round(90 + (success_rate * 0.05), 1)
            },
            "account": {
                "plan": "free",
                "documents_remaining": 100 - len(user_docs),
                "storage_used": f"{len(user_docs) * 0.5:.1f}MB"
            }
        },
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/profile")
async def get_user_profile(user_id: str = Depends(get_user_id_from_token)):
    """Get user profile summary."""
    user_docs = user_documents[user_id]
    
    # Calculate engagement metrics
    engagement = {
        "documents_uploaded": len(user_docs),
        "days_active": len(set(doc.get('processed_at', '').split('T')[0] for doc in user_docs)) if user_docs else 0,
        "documents_per_day": round(len(user_docs) / max(1, len(set(doc.get('processed_at', '').split('T')[0] for doc in user_docs))), 2) if user_docs else 0,
        "last_activity": user_docs[-1].get('processed_at') if user_docs else None
    }
    
    # Usage patterns
    peak_hour = "15:00"  # Default peak hour
    most_used_format = "pdf"  # Default format
    
    return {
        "user_id": user_id,
        "profile": {
            "engagement": engagement,
            "preferences": {
                "most_used_format": most_used_format,
                "peak_usage_hour": peak_hour,
                "timezone": "UTC"
            },
            "health": {
                "account_status": "active",
                "data_integrity": 0.95,
                "performance": "good",
                "storage_health": "optimal"
            }
        },
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/settings")
async def get_user_settings(user_id: str = Depends(get_user_id_from_token)):
    """Get user settings."""
    return {
        "user_id": user_id,
        "settings": {
            "notifications": {
                "email": True,
                "push": False,
                "weekly_report": True
            },
            "privacy": {
                "share_analytics": False,
                "allow_data_processing": True
            },
            "preferences": {
                "default_currency": "USD",
                "date_format": "MM/DD/YYYY",
                "language": "en"
            },
            "api": {
                "rate_limit": 100,
                "current_usage": 25
            }
        },
        "updated_at": datetime.utcnow().isoformat()
    }

@router.put("/settings")
async def update_user_settings(
    settings_data: dict,
    user_id: str = Depends(get_user_id_from_token)
):
    """Update user settings."""
    # In production, save to database
    return {
        "success": True,
        "message": "Settings updated successfully",
        "updated_settings": settings_data,
        "updated_at": datetime.utcnow().isoformat()
    }

# Add routes for OCR analytics that integrates with user management
@router.get("/ocr-analytics")
async def get_user_ocr_analytics(user_id: str = Depends(get_user_id_from_token)):
    """Get OCR analytics for user."""
    user_docs = user_documents[user_id]
    
    # Calculate OCR-specific analytics
    total_documents = len(user_docs)
    total_value = sum(doc.get('total', 0) for doc in user_docs)
    average_value = total_value / total_documents if total_documents > 0 else 0
    
    # Vendor analysis
    vendor_analysis = {}
    for doc in user_docs:
        vendor = doc.get('vendor', 'Unknown')
        if vendor not in vendor_analysis:
            vendor_analysis[vendor] = {"count": 0, "total_value": 0}
        vendor_analysis[vendor]["count"] += 1
        vendor_analysis[vendor]["total_value"] += doc.get('total', 0)
    
    # Recent processing activity
    recent_processing = sorted(user_docs, 
                             key=lambda x: x.get('processed_at', ''), 
                             reverse=True)[:10]
    
    return {
        "user_id": user_id,
        "ocr_analytics": {
            "summary": {
                "total_documents": total_documents,
                "total_value": round(total_value, 2),
                "average_value": round(average_value, 2),
                "success_rate": 95.2  # Mock success rate
            },
            "vendor_analysis": vendor_analysis,
            "recent_processing": recent_processing,
            "processing_insights": {
                "peak_processing_hour": "15:00",
                "average_processing_time": "3.2s",
                "most_processed_format": "PDF"
            }
        },
        "generated_at": datetime.utcnow().isoformat()
    }