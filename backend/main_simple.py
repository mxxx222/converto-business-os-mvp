#!/usr/bin/env python3
"""Minimal FastAPI application for testing Fly.io deployment."""

from fastapi import FastAPI

# Test basic backend imports
try:
    from backend.config import get_settings
    settings = get_settings()
    print("✅ backend.config imported successfully")
except ImportError as e:
    print(f"❌ Failed to import backend.config: {e}")

app = FastAPI(title="DocFlow Test API", version="0.1.0")

@app.get("/")
async def root():
    return {"message": "Hello from DocFlow backend!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)