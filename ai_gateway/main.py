"""
AI Gateway Service - Orchestrates multiple AI models
Cost and performance-based routing to OpenAI, Anthropic, Claude, Gemini
"""

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import time
import logging
from enum import Enum
import os
import hashlib
import json
import redis
import httpx

app = FastAPI(title="AI Gateway", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis cache for inference
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    decode_responses=True,
)

BILLING_URL = os.getenv("BILLING_URL", "http://billing-service:8004")
ENABLE_EMBED_DEDUP = os.getenv("ENABLE_EMBED_DEDUP", "false").lower() == "true"


class AIModel(str, Enum):
    OPENAI_GPT4 = "openai-gpt-4"
    OPENAI_GPT35 = "openai-gpt-3.5-turbo"
    OPENAI_VISION = "openai-gpt-4-vision"
    ANTHROPIC_CLAUDE = "anthropic-claude-3"
    GOOGLE_GEMINI = "google-gemini-pro"
    GOOGLE_VISION = "google-gemini-vision"


class AIRequest(BaseModel):
    prompt: str
    model_preference: Optional[AIModel] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7
    images: Optional[List[str]] = None  # Base64 encoded images
    context: Optional[Dict[str, Any]] = None


class AIResponse(BaseModel):
    content: str
    model_used: AIModel
    tokens_used: int
    cost_usd: float
    latency_ms: int
    confidence: Optional[float] = None


class ModelMetrics:
    def __init__(self):
        self.models = {
            AIModel.OPENAI_GPT4: {
                "cost_per_1k_tokens": 0.03,
                "avg_latency_ms": 1200,
                "availability": 0.99,
                "max_tokens": 8192
            },
            AIModel.OPENAI_GPT35: {
                "cost_per_1k_tokens": 0.002,
                "avg_latency_ms": 800,
                "availability": 0.99,
                "max_tokens": 4096
            },
            AIModel.OPENAI_VISION: {
                "cost_per_1k_tokens": 0.01,
                "avg_latency_ms": 2000,
                "availability": 0.98,
                "max_tokens": 4096
            },
            AIModel.ANTHROPIC_CLAUDE: {
                "cost_per_1k_tokens": 0.015,
                "avg_latency_ms": 1500,
                "availability": 0.97,
                "max_tokens": 100000
            },
            AIModel.GOOGLE_GEMINI: {
                "cost_per_1k_tokens": 0.001,
                "avg_latency_ms": 600,
                "availability": 0.96,
                "max_tokens": 32768
            },
            AIModel.GOOGLE_VISION: {
                "cost_per_1k_tokens": 0.005,
                "avg_latency_ms": 1200,
                "availability": 0.95,
                "max_tokens": 16384
            }
        }

    def get_optimal_model(self, request: AIRequest, strategy: str = "cost_performance") -> AIModel:
        """Select optimal model based on strategy"""
        
        # Filter models that support images if needed
        available_models = list(self.models.keys())
        if request.images:
            available_models = [m for m in available_models if "vision" in m.value or m == AIModel.ANTHROPIC_CLAUDE]
        
        if strategy == "cost":
            # Choose cheapest model
            return min(available_models, key=lambda m: self.models[m]["cost_per_1k_tokens"])
        
        elif strategy == "speed":
            # Choose fastest model
            return min(available_models, key=lambda m: self.models[m]["avg_latency_ms"])
        
        elif strategy == "quality":
            # Choose highest quality model (GPT-4, Claude)
            if AIModel.OPENAI_GPT4 in available_models:
                return AIModel.OPENAI_GPT4
            elif AIModel.ANTHROPIC_CLAUDE in available_models:
                return AIModel.ANTHROPIC_CLAUDE
            else:
                return available_models[0]
        
        else:  # cost_performance
            # Balance cost and performance
            def score_model(model):
                cost_score = 1 / self.models[model]["cost_per_1k_tokens"]
                speed_score = 1 / (self.models[model]["avg_latency_ms"] / 1000)
                availability_score = self.models[model]["availability"]
                return (cost_score * 0.4 + speed_score * 0.4 + availability_score * 0.2)
            
            return max(available_models, key=score_model)


# Global metrics instance
metrics = ModelMetrics()


@app.post("/ai/chat", response_model=AIResponse)
async def chat_completion(request: AIRequest):
    """Main AI chat endpoint with intelligent model routing"""
    
    start_time = time.time()
    
    # Caching key (prompt + images + optional tenant)
    cache_key = build_prompt_cache_key(request)
    cached = redis_client.get(f"ai:inference:{cache_key}")
    if cached:
        try:
            cached_obj = json.loads(cached)
            return AIResponse(**cached_obj)
        except Exception:
            pass

    # Select optimal model
    selected_model = request.model_preference or metrics.get_optimal_model(request)
    
    try:
        # Route to appropriate AI service
        if selected_model == AIModel.OPENAI_GPT4:
            content, tokens = await call_openai_gpt4(request)
        elif selected_model == AIModel.OPENAI_GPT35:
            content, tokens = await call_openai_gpt35(request)
        elif selected_model == AIModel.OPENAI_VISION:
            content, tokens = await call_openai_vision(request)
        elif selected_model == AIModel.ANTHROPIC_CLAUDE:
            content, tokens = await call_anthropic_claude(request)
        elif selected_model == AIModel.GOOGLE_GEMINI:
            content, tokens = await call_google_gemini(request)
        elif selected_model == AIModel.GOOGLE_VISION:
            content, tokens = await call_google_vision(request)
        else:
            raise HTTPException(status_code=400, detail="Unsupported model")
        
        latency_ms = int((time.time() - start_time) * 1000)
        cost_usd = (tokens / 1000) * metrics.models[selected_model]["cost_per_1k_tokens"]
        
        response_obj = AIResponse(
            content=content,
            model_used=selected_model,
            tokens_used=tokens,
            cost_usd=cost_usd,
            latency_ms=latency_ms
        )

        # Write cache
        try:
            redis_client.setex(f"ai:inference:{cache_key}", 60 * 60 * 24 * 7, response_obj.model_dump())
        except Exception:
            pass

        # Bill token usage if tenant_id present
        tenant_id = (request.context or {}).get("tenant_id") if request.context else None
        if tenant_id:
            asyncio.create_task(record_token_usage(tenant_id, tokens))

        return response_obj
        
    except Exception as e:
        logger.error(f"AI request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@app.get("/ai/models")
async def list_models():
    """List available AI models and their metrics"""
    return {
        "models": metrics.models,
        "strategies": ["cost", "speed", "quality", "cost_performance"]
    }


@app.get("/ai/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-gateway"}


# Mock AI service implementations (replace with actual API calls)
async def call_openai_gpt4(request: AIRequest) -> tuple[str, int]:
    """Mock OpenAI GPT-4 call"""
    await asyncio.sleep(1.2)  # Simulate latency
    return f"GPT-4 response to: {request.prompt[:50]}...", 150

async def call_openai_gpt35(request: AIRequest) -> tuple[str, int]:
    """Mock OpenAI GPT-3.5 call"""
    await asyncio.sleep(0.8)
    return f"GPT-3.5 response to: {request.prompt[:50]}...", 120

async def call_openai_vision(request: AIRequest) -> tuple[str, int]:
    """Mock OpenAI Vision call"""
    await asyncio.sleep(2.0)
    return f"Vision analysis: {len(request.images or [])} images processed", 200

async def call_anthropic_claude(request: AIRequest) -> tuple[str, int]:
    """Mock Anthropic Claude call"""
    await asyncio.sleep(1.5)
    return f"Claude response to: {request.prompt[:50]}...", 180

async def call_google_gemini(request: AIRequest) -> tuple[str, int]:
    """Mock Google Gemini call"""
    await asyncio.sleep(0.6)
    return f"Gemini response to: {request.prompt[:50]}...", 100

async def call_google_vision(request: AIRequest) -> tuple[str, int]:
    """Mock Google Vision call"""
    await asyncio.sleep(1.2)
    return f"Google Vision: {len(request.images or [])} images analyzed", 150


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# Helpers
def build_prompt_cache_key(req: AIRequest) -> str:
    base = {
        "prompt": req.prompt.strip(),
        "images": [hashlib.sha256(img.encode()).hexdigest() for img in (req.images or [])],
        "tenant": (req.context or {}).get("tenant_id") if req.context else None,
    }
    raw = json.dumps(base, sort_keys=True)
    h = hashlib.sha256(raw.encode()).hexdigest()
    return h


async def record_token_usage(tenant_id: str, tokens: int) -> None:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                f"{BILLING_URL}/billing/usage",
                json={"tenant_id": tenant_id, "feature": "ai_tokens_per_month", "quantity": int(tokens)},
            )
    except Exception:
        pass
