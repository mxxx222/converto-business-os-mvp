from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# Lazy-initialize clients at request time to avoid build-time failures
openai_client: Optional[OpenAI] = None
deepseek_client: Optional[OpenAI] = None

def get_openai_client() -> OpenAI:
    """Get OpenAI client (fallback to DeepSeek if OpenAI key not available)."""
    global openai_client
    if openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            # Fallback to DeepSeek if OpenAI key not configured
            return get_deepseek_client()
        openai_client = OpenAI(api_key=api_key)
    return openai_client

def get_deepseek_client() -> OpenAI:
    """Get DeepSeek client (cost-effective alternative to OpenAI)."""
    global deepseek_client
    if deepseek_client is None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise RuntimeError("Neither OPENAI_API_KEY nor DEEPSEEK_API_KEY configured")
        # DeepSeek API is compatible with OpenAI SDK, just change base_url
        deepseek_client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com/v1"
        )
    return deepseek_client

def get_ai_client(provider: Optional[str] = None) -> OpenAI:
    """Get AI client based on provider preference or auto-detect."""
    # If provider specified, use it
    if provider == "deepseek":
        return get_deepseek_client()
    elif provider == "openai":
        return get_openai_client()
    
    # Auto-detect: prefer OpenAI if available, otherwise DeepSeek
    if os.getenv("OPENAI_API_KEY"):
        try:
            return get_openai_client()
        except Exception:
            # Fallback to DeepSeek if OpenAI fails
            return get_deepseek_client()
    else:
        # Use DeepSeek if OpenAI not configured
        return get_deepseek_client()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = None  # Auto-detect based on provider
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7
    provider: Optional[str] = None  # "openai" or "deepseek", None = auto-detect

class ChatResponse(BaseModel):
    success: bool
    response: str
    model: str
    usage: Optional[dict] = None

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    """AI chat endpoint for business assistance. Uses DeepSeek if OpenAI credits exhausted."""
    try:
        # Get appropriate client (auto-detect or use specified provider)
        client = get_ai_client(request.provider)
        
        # Determine model based on provider
        if request.model:
            model = request.model
        else:
            # Auto-select model based on provider or auto-detect
            if request.provider == "deepseek":
                model = "deepseek-chat"
            elif request.provider == "openai":
                model = "gpt-4o-mini"
            else:
                # Auto-detect: check base_url to determine provider
                try:
                    base_url = str(client._client.base_url) if hasattr(client, '_client') else ""
                    if 'deepseek' in base_url.lower():
                        model = "deepseek-chat"
                    else:
                        model = "gpt-4o-mini"
                except:
                    # Fallback: use DeepSeek if OpenAI not configured
                    model = "deepseek-chat" if not os.getenv("OPENAI_API_KEY") else "gpt-4o-mini"
        
        # Add system message if not present
        system_message = ChatMessage(
            role="system",
            content="You are DocFlow AI Assistant, a helpful business automation expert. Provide clear, actionable advice for business operations, OCR, VAT calculations, and legal compliance. Respond in Finnish when appropriate."
        )
        
        messages = request.messages
        if not any(msg.role == "system" for msg in messages):
            messages = [system_message] + messages
        
        # Convert to OpenAI format
        openai_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
        
        completion = client.chat.completions.create(
            model=model,
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
    models = {
        "deepseek": {
            "recommended": "deepseek-chat",
            "models": {
                "deepseek-chat": "Yleiskäyttöinen keskustelumalli (suositus)",
                "deepseek-coder": "Erikoistunut koodin generointiin",
                "deepseek-reasoner": "Päätöksentekoon erikoistunut"
            },
            "available": bool(os.getenv("DEEPSEEK_API_KEY")),
            "cost_effective": True
        },
        "openai": {
            "recommended": "gpt-4o-mini",
            "models": {
                "gpt-4o": "Most capable (expensive)",
                "gpt-4o-mini": "Fast and cheap (recommended)",
                "gpt-3.5-turbo": "Legacy (not recommended)"
            },
            "available": bool(os.getenv("OPENAI_API_KEY")),
            "cost_effective": False
        }
    }
    return models

@router.get("/health")
async def ai_health():
    """AI service health check."""
    openai_available = bool(os.getenv("OPENAI_API_KEY"))
    deepseek_available = bool(os.getenv("DEEPSEEK_API_KEY"))
    
    # Determine active provider
    if openai_available:
        active_provider = "openai"
        active_model = "gpt-4o-mini"
    elif deepseek_available:
        active_provider = "deepseek"
        active_model = "deepseek-chat"
    else:
        active_provider = "none"
        active_model = None
    
    return {
        "status": "ok" if (openai_available or deepseek_available) else "error",
        "service": "AI Chat",
        "active_provider": active_provider,
        "active_model": active_model,
        "openai_configured": openai_available,
        "deepseek_configured": deepseek_available,
        "fallback_enabled": True  # Auto-fallback to DeepSeek if OpenAI unavailable
    }
