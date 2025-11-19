from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
import time
from datetime import datetime, timedelta
from typing import Dict, Any

app = FastAPI(title="DocFlow Test Backend", version="1.0.0")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data generators
def generate_metrics() -> Dict[str, Any]:
    """Generate realistic dashboard metrics"""
    base_docs = random.randint(100, 200)
    base_success = random.uniform(92, 96)
    
    return {
        "documentsToday": base_docs + random.randint(-10, 20),
        "documentsGrowth": random.uniform(-5, 15),
        "successRate": base_success,
        "successRateChange": random.uniform(-1, 2),
        "activeCustomers": random.randint(20, 30),
        "customersChange": random.randint(-2, 5),
        "monthlyRevenue": random.randint(2000, 3000),
        "revenueChange": random.randint(-100, 300),
        "avgProcessingTime": random.uniform(2.0, 3.5),
        "processingTimeChange": random.uniform(-0.5, 0.5),
        "queueSize": random.randint(5, 25),
        "systemUptime": 168.5 + random.uniform(0, 24)
    }

def generate_system_status() -> Dict[str, Any]:
    """Generate realistic system status"""
    return {
        "cpuUsage": random.uniform(10, 60),
        "memoryUsage": random.uniform(40, 80),
        "diskUsage": random.uniform(20, 70),
        "uptimeHours": 168.5 + random.uniform(0, 24),
        "activeConnections": random.randint(50, 150),
        "queueSize": random.randint(5, 25),
        "lastError": None if random.random() > 0.1 else "OCR service timeout"
    }

# API endpoints
@app.get("/")
async def root():
    return {"message": "DocFlow Test Backend Running", "timestamp": datetime.now().isoformat()}

@app.get("/admin/metrics")
async def get_dashboard_metrics():
    """Return dashboard metrics"""
    return generate_metrics()

@app.get("/admin/system-status")
async def get_system_status():
    """Return system status"""
    return generate_system_status()

@app.get("/admin/documents")
async def get_documents():
    """Return mock documents"""
    documents = []
    statuses = ["pending", "processing", "completed", "error"]
    file_types = ["pdf", "jpg", "png", "tiff"]
    
    for i in range(20):
        status = random.choice(statuses)
        documents.append({
            "id": f"doc_{i+1}",
            "filename": f"invoice_{i+1}.pdf",
            "customerId": f"cust_{random.randint(1, 10)}",
            "customerName": f"Customer {random.randint(1, 10)}",
            "uploadedAt": (datetime.now() - timedelta(hours=random.randint(1, 72))).isoformat(),
            "status": status,
            "ocrConfidence": random.uniform(85, 99) if status == "completed" else None,
            "processingTime": random.uniform(1.5, 4.0) if status == "completed" else None,
            "fileSize": random.randint(1024, 10240),
            "fileType": random.choice(file_types),
            "extractedData": {
                "amount": random.uniform(100, 1000),
                "currency": "EUR",
                "date": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "merchant": f"Merchant {random.randint(1, 5)}",
                "vatNumber": f"FI{random.randint(10000000, 99999999)}"
            } if status == "completed" else None
        })
    
    return {
        "data": documents,
        "total": len(documents),
        "page": 1,
        "limit": 20,
        "totalPages": 1
    }

@app.post("/auth/login")
async def login():
    """Mock login endpoint"""
    return {
        "access_token": "mock_jwt_token",
        "refresh_token": "mock_refresh_token",
        "user": {
            "id": "admin_001",
            "email": "admin@docflow.fi",
            "name": "System Administrator",
            "role": "super_admin"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)