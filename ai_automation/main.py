"""
AI & Automation Layer - Main Entry Point
LangGraph Agent Orchestration + RAG Memory Layer
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import logging
from datetime import datetime

# Import AI automation components
from agents.document_workflow_agent import DocumentWorkflowAgent
from rag.vector_memory_layer import VectorMemoryLayer, RAGQueryEngine
from gpt5_vision_integration import GPT5VisionAnalyzer, VisionAnalysisRequest, DocumentType, AnalysisType

app = FastAPI(title="AI & Automation Layer", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AI automation components
document_agent = None
vector_memory = None
rag_engine = None
gpt5_analyzer = None


@app.on_event("startup")
async def startup_event():
    """Initialize AI automation components on startup"""
    
    global document_agent, vector_memory, rag_engine, gpt5_analyzer
    
    try:
        # Initialize Document Workflow Agent
        document_agent = DocumentWorkflowAgent(
            openai_api_key="your-openai-api-key"  # Get from environment
        )
        
        # Initialize Vector Memory Layer
        vector_memory = VectorMemoryLayer(
            vector_db_type="qdrant",  # or "opensearch"
            embedding_model="text-embedding-3-large"
        )
        
        # Initialize RAG Query Engine
        rag_engine = RAGQueryEngine(vector_memory)
        
        # Initialize GPT-5 Vision Analyzer
        gpt5_analyzer = GPT5VisionAnalyzer(
            api_key="your-openai-api-key"  # Get from environment
        )
        
        logger.info("AI & Automation Layer initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize AI automation components: {str(e)}")
        raise


# Pydantic models for API
class DocumentProcessRequest(BaseModel):
    document_id: str
    tenant_id: str
    user_id: str
    content: str
    document_type: Optional[str] = "general"


class DocumentProcessResponse(BaseModel):
    document_id: str
    workflow_status: str
    confidence_score: float
    extracted_data: Dict[str, Any]
    processing_steps: List[str]
    processing_time_ms: int


class DocumentSearchRequest(BaseModel):
    tenant_id: str
    query: str
    document_type: Optional[str] = None
    limit: int = 10


class DocumentSearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_count: int
    search_time_ms: int


class RAGQueryRequest(BaseModel):
    tenant_id: str
    question: str
    document_type: Optional[str] = None
    context_limit: int = 5


class RAGQueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float
    query_time_ms: int


class VisionAnalysisResponse(BaseModel):
    request_id: str
    document_type: str
    analysis_type: str
    extracted_text: str
    structured_data: Dict[str, Any]
    confidence_scores: Dict[str, float]
    quality_metrics: Dict[str, Any]
    detected_issues: List[str]
    recommendations: List[str]
    processing_time_ms: int


# API Endpoints

@app.post("/ai/process-document", response_model=DocumentProcessResponse)
async def process_document(request: DocumentProcessRequest):
    """Process document using LangGraph agent orchestration"""
    
    if not document_agent:
        raise HTTPException(status_code=503, detail="Document agent not initialized")
    
    try:
        start_time = datetime.utcnow()
        
        # Process document with workflow agent
        result = await document_agent.process_document(
            document_id=request.document_id,
            tenant_id=request.tenant_id,
            user_id=request.user_id,
            content=request.content
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Store document in vector database for RAG
        if vector_memory and result["workflow_status"] == "completed":
            await vector_memory.store_document(
                tenant_id=request.tenant_id,
                document_id=request.document_id,
                document_type=result.get("document_type", "general"),
                content=request.content,
                metadata=result.get("extracted_data", {})
            )
        
        return DocumentProcessResponse(
            document_id=request.document_id,
            workflow_status=result["workflow_status"],
            confidence_score=result["confidence_score"],
            extracted_data=result.get("extracted_data", {}),
            processing_steps=result.get("processing_steps", []),
            processing_time_ms=int(processing_time)
        )
        
    except Exception as e:
        logger.error(f"Document processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/ai/search-documents", response_model=DocumentSearchResponse)
async def search_documents(request: DocumentSearchRequest):
    """Search documents using vector similarity"""
    
    if not vector_memory:
        raise HTTPException(status_code=503, detail="Vector memory not initialized")
    
    try:
        start_time = datetime.utcnow()
        
        # Search documents
        results = await vector_memory.search_documents(
            tenant_id=request.tenant_id,
            query=request.query,
            document_type=request.document_type,
            limit=request.limit
        )
        
        search_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Convert results to response format
        search_results = []
        for result in results:
            search_results.append({
                "document_id": result.document_id,
                "chunk_id": result.chunk_id,
                "content": result.content,
                "metadata": result.metadata,
                "similarity_score": result.similarity_score,
                "tenant_id": result.tenant_id
            })
        
        return DocumentSearchResponse(
            results=search_results,
            total_count=len(search_results),
            search_time_ms=int(search_time)
        )
        
    except Exception as e:
        logger.error(f"Document search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.post("/ai/query-documents", response_model=RAGQueryResponse)
async def query_documents(request: RAGQueryRequest):
    """Query documents using RAG"""
    
    if not rag_engine:
        raise HTTPException(status_code=503, detail="RAG engine not initialized")
    
    try:
        start_time = datetime.utcnow()
        
        # Query documents with RAG
        result = await rag_engine.query_documents(
            tenant_id=request.tenant_id,
            question=request.question,
            document_type=request.document_type,
            context_limit=request.context_limit
        )
        
        query_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Convert sources to response format
        sources = []
        for source in result.get("sources", []):
            sources.append({
                "document_id": source.document_id,
                "chunk_id": source.chunk_id,
                "content": source.content,
                "similarity_score": source.similarity_score
            })
        
        return RAGQueryResponse(
            question=request.question,
            answer=result.get("answer", ""),
            sources=sources,
            confidence=result.get("confidence", 0.0),
            query_time_ms=int(query_time)
        )
        
    except Exception as e:
        logger.error(f"RAG query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@app.post("/ai/analyze-vision", response_model=VisionAnalysisResponse)
async def analyze_vision(
    file: UploadFile = File(...),
    document_type: str = "general",
    analysis_type: str = "text_extraction",
    tenant_id: str = "tenant_demo",
    user_id: str = "user_demo"
):
    """Analyze document using GPT-5 Vision"""
    
    if not gpt5_analyzer:
        raise HTTPException(status_code=503, detail="GPT-5 analyzer not initialized")
    
    try:
        # Read uploaded file
        image_data = await file.read()
        
        # Create vision analysis request
        vision_request = VisionAnalysisRequest(
            image_data=image_data,
            document_type=DocumentType(document_type),
            analysis_type=AnalysisType(analysis_type),
            tenant_id=tenant_id,
            user_id=user_id
        )
        
        # Analyze document
        result = await gpt5_analyzer.analyze_document(vision_request)
        
        return VisionAnalysisResponse(
            request_id=result.request_id,
            document_type=result.document_type.value,
            analysis_type=result.analysis_type.value,
            extracted_text=result.extracted_text,
            structured_data=result.structured_data,
            confidence_scores=result.confidence_scores,
            quality_metrics=result.quality_metrics,
            detected_issues=result.detected_issues,
            recommendations=result.recommendations,
            processing_time_ms=result.processing_time_ms
        )
        
    except Exception as e:
        logger.error(f"Vision analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")


@app.get("/ai/tenant/{tenant_id}/statistics")
async def get_tenant_statistics(tenant_id: str):
    """Get statistics for tenant's documents"""
    
    if not vector_memory:
        raise HTTPException(status_code=503, detail="Vector memory not initialized")
    
    try:
        stats = await vector_memory.get_tenant_statistics(tenant_id)
        return {"tenant_id": tenant_id, "statistics": stats}
        
    except Exception as e:
        logger.error(f"Failed to get tenant statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Statistics retrieval failed: {str(e)}")


@app.delete("/ai/tenant/{tenant_id}/document/{document_id}")
async def delete_document(tenant_id: str, document_id: str, document_type: str = "general"):
    """Delete document from vector database"""
    
    if not vector_memory:
        raise HTTPException(status_code=503, detail="Vector memory not initialized")
    
    try:
        success = await vector_memory.delete_document(
            tenant_id=tenant_id,
            document_id=document_id,
            document_type=document_type
        )
        
        return {
            "tenant_id": tenant_id,
            "document_id": document_id,
            "deleted": success
        }
        
    except Exception as e:
        logger.error(f"Failed to delete document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document deletion failed: {str(e)}")


@app.get("/ai/health")
async def health_check():
    """Health check endpoint"""
    
    health_status = {
        "status": "healthy",
        "service": "ai-automation-layer",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "document_agent": document_agent is not None,
            "vector_memory": vector_memory is not None,
            "rag_engine": rag_engine is not None,
            "gpt5_analyzer": gpt5_analyzer is not None
        }
    }
    
    return health_status


@app.get("/ai/models")
async def list_available_models():
    """List available AI models"""
    
    return {
        "embedding_models": [
            "text-embedding-3-large",
            "text-embedding-3-small",
            "text-embedding-ada-002"
        ],
        "vision_models": [
            "gpt-5-vision-preview",
            "gpt-4-vision-preview"
        ],
        "llm_models": [
            "gpt-4-turbo-preview",
            "gpt-4",
            "gpt-3.5-turbo"
        ]
    }


@app.get("/ai/config")
async def get_configuration():
    """Get current configuration"""
    
    return {
        "vector_db_type": "qdrant",
        "embedding_model": "text-embedding-3-large",
        "chunk_size": 1000,
        "chunk_overlap": 200,
        "max_search_results": 10,
        "similarity_threshold": 0.7
    }


# Background tasks
@app.on_event("startup")
async def start_background_tasks():
    """Start background tasks"""
    
    # Start document processing queue
    asyncio.create_task(process_document_queue())
    
    # Start vector database maintenance
    asyncio.create_task(vector_db_maintenance())


async def process_document_queue():
    """Background task for processing document queue"""
    
    while True:
        try:
            # Process queued documents
            # Implementation would process documents from a queue
            await asyncio.sleep(60)  # Process every minute
            
        except Exception as e:
            logger.error(f"Document queue processing error: {str(e)}")
            await asyncio.sleep(300)  # Wait 5 minutes on error


async def vector_db_maintenance():
    """Background task for vector database maintenance"""
    
    while True:
        try:
            # Perform vector database maintenance
            # Implementation would clean up old data, optimize indexes, etc.
            await asyncio.sleep(3600)  # Run every hour
            
        except Exception as e:
            logger.error(f"Vector DB maintenance error: {str(e)}")
            await asyncio.sleep(3600)  # Wait 1 hour on error


if __name__ == "__main__":
    import uvicorn
    
    # Run the FastAPI application
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8007,
        log_level="info"
    )
