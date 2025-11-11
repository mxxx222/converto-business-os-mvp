"""
LangGraph Agent Orchestration for Document Workflow
OCR, Billing, and Tax Process Automation
"""

from typing import Dict, List, Any, Optional, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
import json
import base64
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DocumentWorkflowState(TypedDict):
    """State for document workflow processing"""
    document_id: str
    tenant_id: str
    user_id: str
    document_type: str  # receipt, invoice, contract, etc.
    raw_content: str
    extracted_data: Dict[str, Any]
    ocr_results: Dict[str, Any]
    vision_analysis: Dict[str, Any]
    billing_data: Dict[str, Any]
    tax_calculation: Dict[str, Any]
    validation_results: Dict[str, Any]
    workflow_status: str
    error_message: Optional[str]
    processing_steps: List[str]
    confidence_score: float


class DocumentWorkflowAgent:
    """LangGraph agent for orchestrating document processing workflows"""
    
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            api_key=openai_api_key,
            temperature=0.1
        )
        self.workflow_graph = self._create_workflow_graph()
    
    def _create_workflow_graph(self) -> StateGraph:
        """Create LangGraph workflow for document processing"""
        
        workflow = StateGraph(DocumentWorkflowState)
        
        # Define workflow nodes
        workflow.add_node("document_classifier", self.classify_document)
        workflow.add_node("ocr_processor", self.process_ocr)
        workflow.add_node("vision_analyzer", self.analyze_with_vision)
        workflow.add_node("data_extractor", self.extract_structured_data)
        workflow.add_node("billing_processor", self.process_billing)
        workflow.add_node("tax_calculator", self.calculate_taxes)
        workflow.add_node("validator", self.validate_data)
        workflow.add_node("finalizer", self.finalize_processing)
        workflow.add_node("error_handler", self.handle_error)
        
        # Define workflow edges
        workflow.set_entry_point("document_classifier")
        
        # Document classification routing
        workflow.add_conditional_edges(
            "document_classifier",
            self.route_after_classification,
            {
                "receipt": "ocr_processor",
                "invoice": "ocr_processor", 
                "contract": "vision_analyzer",
                "error": "error_handler"
            }
        )
        
        # OCR processing flow
        workflow.add_edge("ocr_processor", "vision_analyzer")
        workflow.add_edge("vision_analyzer", "data_extractor")
        workflow.add_edge("data_extractor", "billing_processor")
        workflow.add_edge("billing_processor", "tax_calculator")
        workflow.add_edge("tax_calculator", "validator")
        
        # Validation routing
        workflow.add_conditional_edges(
            "validator",
            self.route_after_validation,
            {
                "valid": "finalizer",
                "invalid": "error_handler",
                "needs_review": "finalizer"
            }
        )
        
        # End points
        workflow.add_edge("finalizer", END)
        workflow.add_edge("error_handler", END)
        
        return workflow.compile()
    
    async def classify_document(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Classify document type using AI"""
        
        try:
            state["processing_steps"].append("document_classification")
            
            # Use GPT-4 Vision for document classification
            classification_prompt = f"""
            Analyze this document and classify it into one of these categories:
            - receipt: Receipt, purchase confirmation, payment proof
            - invoice: Invoice, bill, statement
            - contract: Contract, agreement, legal document
            - other: Any other document type
            
            Document content: {state["raw_content"][:1000]}...
            
            Return only the category name.
            """
            
            response = await self.llm.ainvoke([
                SystemMessage(content="You are a document classification expert."),
                HumanMessage(content=classification_prompt)
            ])
            
            document_type = response.content.strip().lower()
            state["document_type"] = document_type
            
            logger.info(f"Document classified as: {document_type}")
            return state
            
        except Exception as e:
            logger.error(f"Document classification failed: {str(e)}")
            state["error_message"] = f"Classification failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def process_ocr(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Process document with OCR"""
        
        try:
            state["processing_steps"].append("ocr_processing")
            
            # Call OCR microservice
            ocr_results = await self._call_ocr_service(state["raw_content"])
            state["ocr_results"] = ocr_results
            
            logger.info("OCR processing completed")
            return state
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            state["error_message"] = f"OCR failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def analyze_with_vision(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Analyze document with GPT-5 Vision"""
        
        try:
            state["processing_steps"].append("vision_analysis")
            
            # Enhanced vision analysis for GPT-5 Vision
            vision_prompt = f"""
            Analyze this document image with advanced vision capabilities:
            
            For RECEIPTS:
            - Extract merchant name, date, total amount
            - Identify line items and prices
            - Detect VAT amounts and rates
            - Find payment method
            
            For INVOICES:
            - Extract billing information (from/to addresses)
            - Identify line items, quantities, prices
            - Calculate subtotals, taxes, total
            - Extract payment terms and due dates
            
            For CONTRACTS:
            - Identify parties involved
            - Extract key terms and conditions
            - Find dates and signatures
            - Identify important clauses
            
            Return structured JSON with all extracted information.
            """
            
            # Call GPT-5 Vision API
            vision_results = await self._call_gpt5_vision(state["raw_content"], vision_prompt)
            state["vision_analysis"] = vision_results
            
            logger.info("Vision analysis completed")
            return state
            
        except Exception as e:
            logger.error(f"Vision analysis failed: {str(e)}")
            state["error_message"] = f"Vision analysis failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def extract_structured_data(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Extract structured data from OCR and Vision results"""
        
        try:
            state["processing_steps"].append("data_extraction")
            
            # Combine OCR and Vision results
            ocr_data = state.get("ocr_results", {})
            vision_data = state.get("vision_analysis", {})
            
            # Use AI to merge and validate data
            extraction_prompt = f"""
            Merge and validate the following data sources:
            
            OCR Results: {json.dumps(ocr_data, indent=2)}
            Vision Analysis: {json.dumps(vision_data, indent=2)}
            
            Create a unified, validated data structure with:
            - Confidence scores for each field
            - Data quality indicators
            - Validation flags
            - Suggested corrections
            
            Return as structured JSON.
            """
            
            response = await self.llm.ainvoke([
                SystemMessage(content="You are a data extraction and validation expert."),
                HumanMessage(content=extraction_prompt)
            ])
            
            extracted_data = json.loads(response.content)
            state["extracted_data"] = extracted_data
            
            logger.info("Structured data extraction completed")
            return state
            
        except Exception as e:
            logger.error(f"Data extraction failed: {str(e)}")
            state["error_message"] = f"Data extraction failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def process_billing(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Process billing information"""
        
        try:
            state["processing_steps"].append("billing_processing")
            
            extracted_data = state.get("extracted_data", {})
            
            # Extract billing-specific information
            billing_data = {
                "merchant_name": extracted_data.get("merchant_name"),
                "total_amount": extracted_data.get("total_amount"),
                "currency": extracted_data.get("currency", "EUR"),
                "date": extracted_data.get("date"),
                "payment_method": extracted_data.get("payment_method"),
                "line_items": extracted_data.get("line_items", []),
                "document_type": state["document_type"]
            }
            
            # Call billing microservice for usage tracking
            await self._call_billing_service(state["tenant_id"], "document_processed")
            
            state["billing_data"] = billing_data
            
            logger.info("Billing processing completed")
            return state
            
        except Exception as e:
            logger.error(f"Billing processing failed: {str(e)}")
            state["error_message"] = f"Billing processing failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def calculate_taxes(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Calculate taxes using VAT calculator"""
        
        try:
            state["processing_steps"].append("tax_calculation")
            
            billing_data = state.get("billing_data", {})
            total_amount = billing_data.get("total_amount", 0)
            
            # Call VAT calculation service
            tax_data = await self._call_vat_calculator(
                amount=total_amount,
                category=billing_data.get("category", "standard")
            )
            
            state["tax_calculation"] = tax_data
            
            logger.info("Tax calculation completed")
            return state
            
        except Exception as e:
            logger.error(f"Tax calculation failed: {str(e)}")
            state["error_message"] = f"Tax calculation failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def validate_data(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Validate extracted data"""
        
        try:
            state["processing_steps"].append("data_validation")
            
            extracted_data = state.get("extracted_data", {})
            billing_data = state.get("billing_data", {})
            tax_data = state.get("tax_calculation", {})
            
            # Comprehensive data validation
            validation_results = {
                "data_completeness": self._check_completeness(extracted_data),
                "amount_consistency": self._check_amount_consistency(billing_data, tax_data),
                "date_validity": self._check_date_validity(billing_data.get("date")),
                "confidence_score": self._calculate_overall_confidence(extracted_data)
            }
            
            state["validation_results"] = validation_results
            state["confidence_score"] = validation_results["confidence_score"]
            
            # Determine validation status
            if validation_results["confidence_score"] > 0.8:
                state["workflow_status"] = "valid"
            elif validation_results["confidence_score"] > 0.6:
                state["workflow_status"] = "needs_review"
            else:
                state["workflow_status"] = "invalid"
            
            logger.info(f"Data validation completed - Status: {state['workflow_status']}")
            return state
            
        except Exception as e:
            logger.error(f"Data validation failed: {str(e)}")
            state["error_message"] = f"Data validation failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def finalize_processing(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Finalize document processing"""
        
        try:
            state["processing_steps"].append("finalization")
            
            # Store results in vector database for RAG
            await self._store_in_vector_db(state)
            
            # Publish completion event
            await self._publish_completion_event(state)
            
            state["workflow_status"] = "completed"
            
            logger.info("Document processing finalized")
            return state
            
        except Exception as e:
            logger.error(f"Finalization failed: {str(e)}")
            state["error_message"] = f"Finalization failed: {str(e)}"
            state["workflow_status"] = "error"
            return state
    
    async def handle_error(self, state: DocumentWorkflowState) -> DocumentWorkflowState:
        """Handle workflow errors"""
        
        logger.error(f"Workflow error: {state.get('error_message', 'Unknown error')}")
        
        # Publish error event
        await self._publish_error_event(state)
        
        state["workflow_status"] = "error"
        return state
    
    def route_after_classification(self, state: DocumentWorkflowState) -> str:
        """Route after document classification"""
        if state.get("error_message"):
            return "error"
        return state.get("document_type", "receipt")
    
    def route_after_validation(self, state: DocumentWorkflowState) -> str:
        """Route after data validation"""
        return state.get("workflow_status", "invalid")
    
    # Helper methods
    async def _call_ocr_service(self, content: str) -> Dict[str, Any]:
        """Call OCR microservice"""
        # Implementation would call OCR service API
        return {"text": "Mock OCR result", "confidence": 0.9}
    
    async def _call_gpt5_vision(self, content: str, prompt: str) -> Dict[str, Any]:
        """Call GPT-5 Vision API"""
        # Implementation would call GPT-5 Vision API
        return {"analysis": "Mock vision analysis", "confidence": 0.95}
    
    async def _call_billing_service(self, tenant_id: str, event: str):
        """Call billing microservice"""
        # Implementation would call billing service API
        pass
    
    async def _call_vat_calculator(self, amount: float, category: str) -> Dict[str, Any]:
        """Call VAT calculation service"""
        # Implementation would call VAT service API
        return {"vat_amount": amount * 0.24, "net_amount": amount / 1.24}
    
    def _check_completeness(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check data completeness"""
        required_fields = ["merchant_name", "total_amount", "date"]
        completeness = {}
        
        for field in required_fields:
            completeness[field] = field in data and data[field] is not None
        
        return completeness
    
    def _check_amount_consistency(self, billing_data: Dict[str, Any], tax_data: Dict[str, Any]) -> bool:
        """Check amount consistency"""
        # Implementation for amount validation
        return True
    
    def _check_date_validity(self, date_str: str) -> bool:
        """Check date validity"""
        # Implementation for date validation
        return True
    
    def _calculate_overall_confidence(self, data: Dict[str, Any]) -> float:
        """Calculate overall confidence score"""
        # Implementation for confidence calculation
        return 0.85
    
    async def _store_in_vector_db(self, state: DocumentWorkflowState):
        """Store results in vector database for RAG"""
        # Implementation would store in vector database
        pass
    
    async def _publish_completion_event(self, state: DocumentWorkflowState):
        """Publish completion event"""
        # Implementation would publish to event bus
        pass
    
    async def _publish_error_event(self, state: DocumentWorkflowState):
        """Publish error event"""
        # Implementation would publish to event bus
        pass
    
    async def process_document(self, document_id: str, tenant_id: str, user_id: str, content: str) -> Dict[str, Any]:
        """Main entry point for document processing"""
        
        initial_state: DocumentWorkflowState = {
            "document_id": document_id,
            "tenant_id": tenant_id,
            "user_id": user_id,
            "document_type": "",
            "raw_content": content,
            "extracted_data": {},
            "ocr_results": {},
            "vision_analysis": {},
            "billing_data": {},
            "tax_calculation": {},
            "validation_results": {},
            "workflow_status": "processing",
            "error_message": None,
            "processing_steps": [],
            "confidence_score": 0.0
        }
        
        # Run the workflow
        final_state = await self.workflow_graph.ainvoke(initial_state)
        
        return final_state


# Example usage
async def main():
    """Example usage of DocumentWorkflowAgent"""
    
    agent = DocumentWorkflowAgent(openai_api_key="your-api-key")
    
    result = await agent.process_document(
        document_id="doc_123",
        tenant_id="tenant_demo",
        user_id="user_demo",
        content="Receipt content here..."
    )
    
    print(f"Processing result: {result['workflow_status']}")
    print(f"Confidence score: {result['confidence_score']}")


if __name__ == "__main__":
    asyncio.run(main())
