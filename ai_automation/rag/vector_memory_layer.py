"""
Retrieval-Augmented Memory Layer (RAG)
Tenant-specific vector database for OCR data
OpenSearch Vector / Qdrant integration
"""

from typing import Dict, List, Any, Optional, Tuple
import asyncio
import json
import uuid
from datetime import datetime
import logging
from dataclasses import dataclass

# Vector database imports
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False

try:
    from opensearchpy import OpenSearch
    OPENSEARCH_AVAILABLE = True
except ImportError:
    OPENSEARCH_AVAILABLE = False

from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)


@dataclass
class DocumentChunk:
    """Document chunk for vector storage"""
    id: str
    tenant_id: str
    document_id: str
    chunk_index: int
    content: str
    metadata: Dict[str, Any]
    embedding: List[float]
    created_at: datetime


@dataclass
class SearchResult:
    """Search result from vector database"""
    document_id: str
    chunk_id: str
    content: str
    metadata: Dict[str, Any]
    similarity_score: float
    tenant_id: str


class VectorMemoryLayer:
    """Retrieval-Augmented Memory Layer for tenant-specific OCR data"""
    
    def __init__(
        self,
        vector_db_type: str = "qdrant",  # "qdrant" or "opensearch"
        embedding_model: str = "text-embedding-3-large",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):
        self.vector_db_type = vector_db_type
        self.embedding_model = embedding_model
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # Initialize embedding model
        self.embeddings = OpenAIEmbeddings(
            model=embedding_model,
            openai_api_key="your-openai-api-key"
        )
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Initialize vector database
        self._init_vector_db()
    
    def _init_vector_db(self):
        """Initialize vector database connection"""
        
        if self.vector_db_type == "qdrant" and QDRANT_AVAILABLE:
            self.qdrant_client = QdrantClient(host="localhost", port=6333)
            self._setup_qdrant_collections()
            
        elif self.vector_db_type == "opensearch" and OPENSEARCH_AVAILABLE:
            self.opensearch_client = OpenSearch(
                hosts=[{"host": "localhost", "port": 9200}],
                http_auth=("admin", "admin"),
                use_ssl=False,
                verify_certs=False,
                ssl_assert_hostname=False,
                ssl_show_warn=False
            )
            self._setup_opensearch_indexes()
            
        else:
            logger.warning(f"Vector database {self.vector_db_type} not available, using mock implementation")
            self.mock_db = {}
    
    def _setup_qdrant_collections(self):
        """Setup Qdrant collections for different document types"""
        
        collections = [
            "ocr_receipts",
            "ocr_invoices", 
            "ocr_contracts",
            "ocr_general"
        ]
        
        for collection_name in collections:
            try:
                # Check if collection exists
                collections_info = self.qdrant_client.get_collections()
                existing_collections = [col.name for col in collections_info.collections]
                
                if collection_name not in existing_collections:
                    # Create collection
                    self.qdrant_client.create_collection(
                        collection_name=collection_name,
                        vectors_config=VectorParams(
                            size=3072,  # OpenAI text-embedding-3-large dimension
                            distance=Distance.COSINE
                        )
                    )
                    logger.info(f"Created Qdrant collection: {collection_name}")
                    
            except Exception as e:
                logger.error(f"Failed to setup Qdrant collection {collection_name}: {str(e)}")
    
    def _setup_opensearch_indexes(self):
        """Setup OpenSearch indexes for different document types"""
        
        indexes = [
            "ocr-receipts",
            "ocr-invoices",
            "ocr-contracts", 
            "ocr-general"
        ]
        
        for index_name in indexes:
            try:
                if not self.opensearch_client.indices.exists(index=index_name):
                    # Create index with mapping
                    mapping = {
                        "mappings": {
                            "properties": {
                                "content": {"type": "text"},
                                "metadata": {"type": "object"},
                                "embedding": {
                                    "type": "knn_vector",
                                    "dimension": 3072,
                                    "method": {
                                        "name": "hnsw",
                                        "engine": "nmslib"
                                    }
                                }
                            }
                        }
                    }
                    
                    self.opensearch_client.indices.create(
                        index=index_name,
                        body=mapping
                    )
                    logger.info(f"Created OpenSearch index: {index_name}")
                    
            except Exception as e:
                logger.error(f"Failed to setup OpenSearch index {index_name}: {str(e)}")
    
    async def store_document(
        self,
        tenant_id: str,
        document_id: str,
        document_type: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> List[str]:
        """Store document in vector database"""
        
        try:
            # Split document into chunks
            chunks = self.text_splitter.split_text(content)
            
            # Generate embeddings for chunks
            embeddings = await self._generate_embeddings(chunks)
            
            # Create document chunks
            document_chunks = []
            for i, (chunk_content, embedding) in enumerate(zip(chunks, embeddings)):
                chunk_id = str(uuid.uuid4())
                
                chunk_metadata = {
                    **metadata,
                    "tenant_id": tenant_id,
                    "document_id": document_id,
                    "document_type": document_type,
                    "chunk_index": i,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                document_chunk = DocumentChunk(
                    id=chunk_id,
                    tenant_id=tenant_id,
                    document_id=document_id,
                    chunk_index=i,
                    content=chunk_content,
                    metadata=chunk_metadata,
                    embedding=embedding,
                    created_at=datetime.utcnow()
                )
                
                document_chunks.append(document_chunk)
            
            # Store chunks in vector database
            chunk_ids = await self._store_chunks(document_chunks, document_type)
            
            logger.info(f"Stored document {document_id} with {len(chunks)} chunks")
            return chunk_ids
            
        except Exception as e:
            logger.error(f"Failed to store document {document_id}: {str(e)}")
            raise
    
    async def search_documents(
        self,
        tenant_id: str,
        query: str,
        document_type: Optional[str] = None,
        limit: int = 10,
        similarity_threshold: float = 0.7
    ) -> List[SearchResult]:
        """Search documents using semantic similarity"""
        
        try:
            # Generate query embedding
            query_embedding = await self._generate_embedding(query)
            
            # Search in vector database
            if self.vector_db_type == "qdrant" and QDRANT_AVAILABLE:
                results = await self._search_qdrant(
                    tenant_id, query_embedding, document_type, limit, similarity_threshold
                )
            elif self.vector_db_type == "opensearch" and OPENSEARCH_AVAILABLE:
                results = await self._search_opensearch(
                    tenant_id, query_embedding, document_type, limit, similarity_threshold
                )
            else:
                results = await self._search_mock(
                    tenant_id, query, document_type, limit
                )
            
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    async def get_document_chunks(
        self,
        tenant_id: str,
        document_id: str
    ) -> List[DocumentChunk]:
        """Get all chunks for a specific document"""
        
        try:
            if self.vector_db_type == "qdrant" and QDRANT_AVAILABLE:
                return await self._get_chunks_qdrant(tenant_id, document_id)
            elif self.vector_db_type == "opensearch" and OPENSEARCH_AVAILABLE:
                return await self._get_chunks_opensearch(tenant_id, document_id)
            else:
                return await self._get_chunks_mock(tenant_id, document_id)
                
        except Exception as e:
            logger.error(f"Failed to get document chunks: {str(e)}")
            return []
    
    async def delete_document(
        self,
        tenant_id: str,
        document_id: str,
        document_type: str
    ) -> bool:
        """Delete document from vector database"""
        
        try:
            if self.vector_db_type == "qdrant" and QDRANT_AVAILABLE:
                return await self._delete_document_qdrant(tenant_id, document_id, document_type)
            elif self.vector_db_type == "opensearch" and OPENSEARCH_AVAILABLE:
                return await self._delete_document_opensearch(tenant_id, document_id, document_type)
            else:
                return await self._delete_document_mock(tenant_id, document_id)
                
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            return False
    
    async def get_tenant_statistics(self, tenant_id: str) -> Dict[str, Any]:
        """Get statistics for tenant's documents"""
        
        try:
            if self.vector_db_type == "qdrant" and QDRANT_AVAILABLE:
                return await self._get_stats_qdrant(tenant_id)
            elif self.vector_db_type == "opensearch" and OPENSEARCH_AVAILABLE:
                return await self._get_stats_opensearch(tenant_id)
            else:
                return await self._get_stats_mock(tenant_id)
                
        except Exception as e:
            logger.error(f"Failed to get tenant statistics: {str(e)}")
            return {}
    
    # Embedding generation methods
    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        return await self.embeddings.aembed_documents(texts)
    
    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for single text"""
        return await self.embeddings.aembed_query(text)
    
    # Qdrant implementation methods
    async def _store_chunks(self, chunks: List[DocumentChunk], document_type: str) -> List[str]:
        """Store chunks in Qdrant"""
        
        if not QDRANT_AVAILABLE:
            return [chunk.id for chunk in chunks]
        
        collection_name = f"ocr_{document_type}s"
        
        points = []
        for chunk in chunks:
            point = PointStruct(
                id=chunk.id,
                vector=chunk.embedding,
                payload={
                    "tenant_id": chunk.tenant_id,
                    "document_id": chunk.document_id,
                    "content": chunk.content,
                    "metadata": chunk.metadata,
                    "chunk_index": chunk.chunk_index,
                    "created_at": chunk.created_at.isoformat()
                }
            )
            points.append(point)
        
        self.qdrant_client.upsert(
            collection_name=collection_name,
            points=points
        )
        
        return [chunk.id for chunk in chunks]
    
    async def _search_qdrant(
        self,
        tenant_id: str,
        query_embedding: List[float],
        document_type: Optional[str],
        limit: int,
        similarity_threshold: float
    ) -> List[SearchResult]:
        """Search in Qdrant"""
        
        if not QDRANT_AVAILABLE:
            return []
        
        # Determine collection name
        if document_type:
            collection_name = f"ocr_{document_type}s"
        else:
            collection_name = "ocr_general"
        
        # Create filter for tenant
        filter_condition = Filter(
            must=[
                FieldCondition(
                    key="tenant_id",
                    match=MatchValue(value=tenant_id)
                )
            ]
        )
        
        # Search
        search_results = self.qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            query_filter=filter_condition,
            limit=limit,
            score_threshold=similarity_threshold
        )
        
        # Convert to SearchResult objects
        results = []
        for result in search_results:
            search_result = SearchResult(
                document_id=result.payload["document_id"],
                chunk_id=result.id,
                content=result.payload["content"],
                metadata=result.payload["metadata"],
                similarity_score=result.score,
                tenant_id=result.payload["tenant_id"]
            )
            results.append(search_result)
        
        return results
    
    # OpenSearch implementation methods
    async def _store_chunks_opensearch(self, chunks: List[DocumentChunk], document_type: str) -> List[str]:
        """Store chunks in OpenSearch"""
        
        if not OPENSEARCH_AVAILABLE:
            return [chunk.id for chunk in chunks]
        
        index_name = f"ocr-{document_type}s"
        
        documents = []
        for chunk in chunks:
            doc = {
                "content": chunk.content,
                "metadata": chunk.metadata,
                "embedding": chunk.embedding,
                "tenant_id": chunk.tenant_id,
                "document_id": chunk.document_id,
                "chunk_index": chunk.chunk_index,
                "created_at": chunk.created_at.isoformat()
            }
            documents.append({
                "_index": index_name,
                "_id": chunk.id,
                "_source": doc
            })
        
        # Bulk insert
        from opensearchpy.helpers import bulk
        bulk(self.opensearch_client, documents)
        
        return [chunk.id for chunk in chunks]
    
    # Mock implementation methods
    async def _search_mock(
        self,
        tenant_id: str,
        query: str,
        document_type: Optional[str],
        limit: int
    ) -> List[SearchResult]:
        """Mock search implementation"""
        
        # Simple mock results
        results = []
        for i in range(min(limit, 3)):
            result = SearchResult(
                document_id=f"mock_doc_{i}",
                chunk_id=f"mock_chunk_{i}",
                content=f"Mock content for query: {query}",
                metadata={"tenant_id": tenant_id, "document_type": document_type or "general"},
                similarity_score=0.8 - (i * 0.1),
                tenant_id=tenant_id
            )
            results.append(result)
        
        return results
    
    # Additional helper methods would be implemented here...
    
    async def _get_chunks_qdrant(self, tenant_id: str, document_id: str) -> List[DocumentChunk]:
        """Get chunks from Qdrant"""
        # Implementation for Qdrant
        return []
    
    async def _get_chunks_opensearch(self, tenant_id: str, document_id: str) -> List[DocumentChunk]:
        """Get chunks from OpenSearch"""
        # Implementation for OpenSearch
        return []
    
    async def _get_chunks_mock(self, tenant_id: str, document_id: str) -> List[DocumentChunk]:
        """Mock get chunks"""
        return []


class RAGQueryEngine:
    """Query engine for RAG-based document retrieval"""
    
    def __init__(self, vector_memory: VectorMemoryLayer):
        self.vector_memory = vector_memory
    
    async def query_documents(
        self,
        tenant_id: str,
        question: str,
        document_type: Optional[str] = None,
        context_limit: int = 5
    ) -> Dict[str, Any]:
        """Query documents with RAG"""
        
        try:
            # Search for relevant documents
            search_results = await self.vector_memory.search_documents(
                tenant_id=tenant_id,
                query=question,
                document_type=document_type,
                limit=context_limit
            )
            
            # Prepare context
            context = self._prepare_context(search_results)
            
            # Generate answer using LLM
            answer = await self._generate_answer(question, context)
            
            return {
                "question": question,
                "answer": answer,
                "sources": search_results,
                "context": context,
                "confidence": self._calculate_confidence(search_results)
            }
            
        except Exception as e:
            logger.error(f"RAG query failed: {str(e)}")
            return {
                "question": question,
                "answer": "Sorry, I couldn't process your question.",
                "sources": [],
                "context": "",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _prepare_context(self, search_results: List[SearchResult]) -> str:
        """Prepare context from search results"""
        
        context_parts = []
        for result in search_results:
            context_parts.append(f"Document {result.document_id}: {result.content}")
        
        return "\n\n".join(context_parts)
    
    async def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using LLM"""
        
        prompt = f"""
        Based on the following document context, answer the user's question.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer:
        """
        
        # In a real implementation, this would call an LLM
        return f"Based on the documents, here's what I found regarding your question: {question}"
    
    def _calculate_confidence(self, search_results: List[SearchResult]) -> float:
        """Calculate confidence based on search results"""
        
        if not search_results:
            return 0.0
        
        # Average similarity score
        avg_score = sum(result.similarity_score for result in search_results) / len(search_results)
        return avg_score


# Example usage
async def main():
    """Example usage of VectorMemoryLayer and RAGQueryEngine"""
    
    # Initialize vector memory layer
    vector_memory = VectorMemoryLayer(
        vector_db_type="qdrant",
        embedding_model="text-embedding-3-large"
    )
    
    # Store a document
    await vector_memory.store_document(
        tenant_id="tenant_demo",
        document_id="receipt_123",
        document_type="receipt",
        content="Receipt from Restaurant ABC on 2024-01-15. Total: €45.50 including VAT.",
        metadata={"merchant": "Restaurant ABC", "amount": 45.50, "date": "2024-01-15"}
    )
    
    # Initialize RAG query engine
    rag_engine = RAGQueryEngine(vector_memory)
    
    # Query documents
    result = await rag_engine.query_documents(
        tenant_id="tenant_demo",
        question="What receipts do I have from Restaurant ABC?",
        document_type="receipt"
    )
    
    print(f"Question: {result['question']}")
    print(f"Answer: {result['answer']}")
    print(f"Confidence: {result['confidence']}")


if __name__ == "__main__":
    asyncio.run(main())
