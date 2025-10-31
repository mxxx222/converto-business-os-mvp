from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# Lazy-initialize OpenAI client at request time to avoid build-time failures
client: Optional[OpenAI] = None

def get_openai_client() -> OpenAI:
    global client
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            # Create a placeholder client with empty key to raise clear error later
            raise RuntimeError("OPENAI_API_KEY not configured")
        client = OpenAI(api_key=api_key)
    return client

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gpt-4o-mini"
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    success: bool
    response: str
    model: str
    usage: Optional[dict] = None

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    """AI chat endpoint for business assistance."""
    try:
        # Add system message if not present
        system_message = ChatMessage(
            role="system",
            content="You are CONVERTO AI Assistant, a helpful business automation expert. Provide clear, actionable advice for business operations, OCR, VAT calculations, and legal compliance."
        )
        
        messages = request.messages
        if not any(msg.role == "system" for msg in messages):
            messages = [system_message] + messages
        
        # Convert to OpenAI format
        openai_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
        
        completion = get_openai_client().chat.completions.create(
            model=request.model,
            messages=openai_messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
        
        return ChatResponse(
            success=True,
            response=completion.choices[0].message.content,
            model=completion.model,
            usage=completion.usage.dict() if completion.usage else None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI chat failed: {str(e)}"
        )

@router.get("/models")
async def list_models():
    """List available AI models."""
    return {
        "openai": {
            "recommended": "gpt-4o-mini",
            "models": {
                "gpt-4o": "Most capable (expensive)",
                "gpt-4o-mini": "Fast and cheap (recommended)",
                "gpt-3.5-turbo": "Legacy (not recommended)"
            }
        }
    }

@router.get("/health")
async def ai_health():
    """AI service health check."""
    return {
        "status": "ok",
        "service": "AI Chat",
        "model": "gpt-4o-mini",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY"))
    }
