"""
GPT-5 Vision API Integration for Advanced Document Analysis
Enhanced vision capabilities with LangGraph state machine
"""

from typing import Dict, List, Any, Optional, Union
import asyncio
import base64
import json
import logging
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


class DocumentType(str, Enum):
    RECEIPT = "receipt"
    INVOICE = "invoice"
    CONTRACT = "contract"
    IDENTITY = "identity"
    FINANCIAL = "financial"
    LEGAL = "legal"
    MEDICAL = "medical"
    TECHNICAL = "technical"
    GENERAL = "general"


class AnalysisType(str, Enum):
    TEXT_EXTRACTION = "text_extraction"
    DATA_STRUCTURING = "data_structuring"
    FRAUD_DETECTION = "fraud_detection"
    COMPLIANCE_CHECK = "compliance_check"
    QUALITY_ASSESSMENT = "quality_assessment"
    MULTI_LANGUAGE = "multi_language"


@dataclass
class VisionAnalysisRequest:
    """Request for GPT-5 Vision analysis"""
    image_data: Union[str, bytes]  # Base64 or bytes
    document_type: DocumentType
    analysis_type: AnalysisType
    tenant_id: str
    user_id: str
    context: Optional[Dict[str, Any]] = None
    language: str = "en"
    confidence_threshold: float = 0.8


@dataclass
class VisionAnalysisResult:
    """Result from GPT-5 Vision analysis"""
    request_id: str
    document_type: DocumentType
    analysis_type: AnalysisType
    extracted_text: str
    structured_data: Dict[str, Any]
    confidence_scores: Dict[str, float]
    quality_metrics: Dict[str, Any]
    detected_issues: List[str]
    recommendations: List[str]
    processing_time_ms: int
    model_version: str
    created_at: datetime


class GPT5VisionAnalyzer:
    """GPT-5 Vision API integration with advanced document analysis capabilities"""
    
    def __init__(self, api_key: str, model: str = "gpt-5-vision-preview"):
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI library not available. Install with: pip install openai")
        
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.analysis_graph = self._create_analysis_graph()
    
    def _create_analysis_graph(self) -> StateGraph:
        """Create LangGraph workflow for GPT-5 Vision analysis"""
        
        workflow = StateGraph(dict)
        
        # Define analysis nodes
        workflow.add_node("preprocess_image", self.preprocess_image)
        workflow.add_node("classify_document", self.classify_document)
        workflow.add_node("extract_text", self.extract_text)
        workflow.add_node("structure_data", self.structure_data)
        workflow.add_node("detect_fraud", self.detect_fraud)
        workflow.add_node("check_compliance", self.check_compliance)
        workflow.add_node("assess_quality", self.assess_quality)
        workflow.add_node("generate_recommendations", self.generate_recommendations)
        workflow.add_node("finalize_analysis", self.finalize_analysis)
        
        # Define workflow edges
        workflow.set_entry_point("preprocess_image")
        workflow.add_edge("preprocess_image", "classify_document")
        workflow.add_edge("classify_document", "extract_text")
        workflow.add_edge("extract_text", "structure_data")
        workflow.add_edge("structure_data", "detect_fraud")
        workflow.add_edge("detect_fraud", "check_compliance")
        workflow.add_edge("check_compliance", "assess_quality")
        workflow.add_edge("assess_quality", "generate_recommendations")
        workflow.add_edge("generate_recommendations", "finalize_analysis")
        workflow.add_edge("finalize_analysis", END)
        
        return workflow.compile()
    
    async def analyze_document(self, request: VisionAnalysisRequest) -> VisionAnalysisResult:
        """Main entry point for document analysis"""
        
        start_time = datetime.utcnow()
        request_id = f"vision_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{request.tenant_id}"
        
        try:
            # Prepare analysis state
            analysis_state = {
                "request": request,
                "request_id": request_id,
                "start_time": start_time,
                "results": {},
                "confidence_scores": {},
                "quality_metrics": {},
                "detected_issues": [],
                "recommendations": []
            }
            
            # Run analysis workflow
            final_state = await self.analysis_graph.ainvoke(analysis_state)
            
            # Create result
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            result = VisionAnalysisResult(
                request_id=request_id,
                document_type=request.document_type,
                analysis_type=request.analysis_type,
                extracted_text=final_state["results"].get("extracted_text", ""),
                structured_data=final_state["results"].get("structured_data", {}),
                confidence_scores=final_state["confidence_scores"],
                quality_metrics=final_state["quality_metrics"],
                detected_issues=final_state["detected_issues"],
                recommendations=final_state["recommendations"],
                processing_time_ms=int(processing_time),
                model_version=self.model,
                created_at=datetime.utcnow()
            )
            
            logger.info(f"GPT-5 Vision analysis completed: {request_id}")
            return result
            
        except Exception as e:
            logger.error(f"GPT-5 Vision analysis failed: {str(e)}")
            raise
    
    async def preprocess_image(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess image for analysis"""
        
        try:
            request = state["request"]
            
            # Convert image to base64 if needed
            if isinstance(request.image_data, bytes):
                image_b64 = base64.b64encode(request.image_data).decode()
            else:
                image_b64 = request.image_data
            
            state["processed_image"] = image_b64
            
            logger.info("Image preprocessing completed")
            return state
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {str(e)}")
            raise
    
    async def classify_document(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Classify document type using GPT-5 Vision"""
        
        try:
            request = state["request"]
            image_b64 = state["processed_image"]
            
            classification_prompt = f"""
            Analyze this document image and classify it into one of these categories:
            
            RECEIPT: Purchase receipts, payment confirmations, transaction records
            INVOICE: Bills, invoices, statements, payment requests
            CONTRACT: Legal agreements, contracts, terms and conditions
            IDENTITY: ID cards, passports, driver's licenses, certificates
            FINANCIAL: Bank statements, tax documents, financial reports
            LEGAL: Legal documents, court papers, regulatory filings
            MEDICAL: Medical records, prescriptions, health certificates
            TECHNICAL: Technical drawings, specifications, manuals
            GENERAL: Any other document type
            
            Provide your classification with confidence score (0-1).
            Return as JSON: {{"document_type": "category", "confidence": 0.95, "reasoning": "explanation"}}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert document classifier with advanced vision capabilities."
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": classification_prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                            }
                        ]
                    }
                ],
                max_tokens=500,
                temperature=0.1
            )
            
            classification_result = json.loads(response.choices[0].message.content)
            state["results"]["classification"] = classification_result
            state["confidence_scores"]["classification"] = classification_result["confidence"]
            
            logger.info(f"Document classified as: {classification_result['document_type']}")
            return state
            
        except Exception as e:
            logger.error(f"Document classification failed: {str(e)}")
            raise
    
    async def extract_text(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text from document using GPT-5 Vision"""
        
        try:
            request = state["request"]
            image_b64 = state["processed_image"]
            
            # Document-specific extraction prompts
            extraction_prompts = {
                DocumentType.RECEIPT: """
                Extract all text from this receipt with high accuracy:
                - Merchant name and address
                - Date and time
                - Line items with descriptions and prices
                - Subtotal, taxes, and total amount
                - Payment method
                - Any additional information
                
                Return as structured JSON with all fields.
                """,
                
                DocumentType.INVOICE: """
                Extract all information from this invoice:
                - Billing addresses (from/to)
                - Invoice number and date
                - Due date and payment terms
                - Line items with descriptions, quantities, rates, amounts
                - Subtotal, tax calculations, total amount
                - Payment instructions
                
                Return as structured JSON with all fields.
                """,
                
                DocumentType.CONTRACT: """
                Extract key information from this contract:
                - Parties involved
                - Contract date and duration
                - Key terms and conditions
                - Financial obligations
                - Important clauses and restrictions
                - Signatures and dates
                
                Return as structured JSON with all fields.
                """,
                
                DocumentType.IDENTITY: """
                Extract information from this identity document:
                - Document type
                - Personal information (name, date of birth, etc.)
                - Document number and expiry date
                - Issuing authority
                - Any restrictions or endorsements
                
                Return as structured JSON with all fields.
                """,
                
                DocumentType.FINANCIAL: """
                Extract financial information from this document:
                - Account information
                - Transaction details
                - Balances and amounts
                - Dates and periods
                - Any fees or charges
                
                Return as structured JSON with all fields.
                """
            }
            
            extraction_prompt = extraction_prompts.get(
                request.document_type,
                "Extract all text and structured information from this document. Return as JSON."
            )
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting text from documents with high accuracy."
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": extraction_prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.1
            )
            
            extracted_data = json.loads(response.choices[0].message.content)
            state["results"]["extracted_text"] = extracted_data.get("raw_text", "")
            state["results"]["extracted_data"] = extracted_data
            
            # Calculate confidence based on completeness
            confidence = self._calculate_extraction_confidence(extracted_data, request.document_type)
            state["confidence_scores"]["text_extraction"] = confidence
            
            logger.info("Text extraction completed")
            return state
            
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            raise
    
    async def structure_data(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Structure extracted data into standardized format"""
        
        try:
            request = state["request"]
            extracted_data = state["results"]["extracted_data"]
            
            # Document-specific structuring
            structured_data = self._structure_by_document_type(extracted_data, request.document_type)
            
            state["results"]["structured_data"] = structured_data
            
            # Calculate structuring confidence
            confidence = self._calculate_structuring_confidence(structured_data)
            state["confidence_scores"]["data_structuring"] = confidence
            
            logger.info("Data structuring completed")
            return state
            
        except Exception as e:
            logger.error(f"Data structuring failed: {str(e)}")
            raise
    
    async def detect_fraud(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Detect potential fraud indicators"""
        
        try:
            request = state["request"]
            structured_data = state["results"]["structured_data"]
            
            fraud_indicators = []
            
            # Check for common fraud patterns
            if request.document_type == DocumentType.RECEIPT:
                fraud_indicators.extend(self._check_receipt_fraud(structured_data))
            elif request.document_type == DocumentType.INVOICE:
                fraud_indicators.extend(self._check_invoice_fraud(structured_data))
            elif request.document_type == DocumentType.IDENTITY:
                fraud_indicators.extend(self._check_identity_fraud(structured_data))
            
            state["detected_issues"].extend(fraud_indicators)
            
            # Calculate fraud detection confidence
            confidence = 1.0 - (len(fraud_indicators) * 0.2)  # Reduce confidence for each fraud indicator
            state["confidence_scores"]["fraud_detection"] = max(0.0, confidence)
            
            logger.info(f"Fraud detection completed - {len(fraud_indicators)} indicators found")
            return state
            
        except Exception as e:
            logger.error(f"Fraud detection failed: {str(e)}")
            raise
    
    async def check_compliance(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Check document compliance with regulations"""
        
        try:
            request = state["request"]
            structured_data = state["results"]["structured_data"]
            
            compliance_issues = []
            
            # Check compliance based on document type and tenant location
            if request.document_type == DocumentType.RECEIPT:
                compliance_issues.extend(self._check_receipt_compliance(structured_data, request.tenant_id))
            elif request.document_type == DocumentType.INVOICE:
                compliance_issues.extend(self._check_invoice_compliance(structured_data, request.tenant_id))
            
            state["detected_issues"].extend(compliance_issues)
            
            # Calculate compliance confidence
            confidence = 1.0 - (len(compliance_issues) * 0.15)
            state["confidence_scores"]["compliance_check"] = max(0.0, confidence)
            
            logger.info(f"Compliance check completed - {len(compliance_issues)} issues found")
            return state
            
        except Exception as e:
            logger.error(f"Compliance check failed: {str(e)}")
            raise
    
    async def assess_quality(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Assess document quality metrics"""
        
        try:
            extracted_text = state["results"]["extracted_text"]
            structured_data = state["results"]["structured_data"]
            
            quality_metrics = {
                "text_completeness": self._assess_text_completeness(extracted_text),
                "data_accuracy": self._assess_data_accuracy(structured_data),
                "image_quality": self._assess_image_quality(state["processed_image"]),
                "readability": self._assess_readability(extracted_text)
            }
            
            state["quality_metrics"] = quality_metrics
            
            # Calculate overall quality score
            quality_score = sum(quality_metrics.values()) / len(quality_metrics)
            state["confidence_scores"]["quality_assessment"] = quality_score
            
            logger.info("Quality assessment completed")
            return state
            
        except Exception as e:
            logger.error(f"Quality assessment failed: {str(e)}")
            raise
    
    async def generate_recommendations(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate recommendations based on analysis"""
        
        try:
            detected_issues = state["detected_issues"]
            quality_metrics = state["quality_metrics"]
            confidence_scores = state["confidence_scores"]
            
            recommendations = []
            
            # Generate recommendations based on issues and quality
            if confidence_scores.get("text_extraction", 0) < 0.8:
                recommendations.append("Consider rescanning the document for better text extraction")
            
            if len(detected_issues) > 0:
                recommendations.append("Review detected issues and verify document authenticity")
            
            if quality_metrics.get("image_quality", 0) < 0.7:
                recommendations.append("Improve image quality for better analysis results")
            
            # Add document-specific recommendations
            if state["request"].document_type == DocumentType.RECEIPT:
                recommendations.extend(self._get_receipt_recommendations(state))
            elif state["request"].document_type == DocumentType.INVOICE:
                recommendations.extend(self._get_invoice_recommendations(state))
            
            state["recommendations"] = recommendations
            
            logger.info(f"Generated {len(recommendations)} recommendations")
            return state
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {str(e)}")
            raise
    
    async def finalize_analysis(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Finalize analysis and prepare results"""
        
        try:
            # Calculate overall confidence
            confidence_scores = state["confidence_scores"]
            overall_confidence = sum(confidence_scores.values()) / len(confidence_scores)
            state["confidence_scores"]["overall"] = overall_confidence
            
            logger.info("Analysis finalized")
            return state
            
        except Exception as e:
            logger.error(f"Analysis finalization failed: {str(e)}")
            raise
    
    # Helper methods for fraud detection
    def _check_receipt_fraud(self, data: Dict[str, Any]) -> List[str]:
        """Check for receipt fraud indicators"""
        issues = []
        
        # Check for suspicious amounts
        total = data.get("total_amount", 0)
        if total > 10000:  # Suspiciously high amount
            issues.append("Suspiciously high transaction amount")
        
        # Check for missing merchant information
        if not data.get("merchant_name"):
            issues.append("Missing merchant name")
        
        # Check for invalid dates
        date_str = data.get("date")
        if date_str:
            # Add date validation logic
            pass
        
        return issues
    
    def _check_invoice_fraud(self, data: Dict[str, Any]) -> List[str]:
        """Check for invoice fraud indicators"""
        issues = []
        
        # Check for suspicious patterns
        if not data.get("invoice_number"):
            issues.append("Missing invoice number")
        
        if not data.get("billing_address"):
            issues.append("Missing billing address")
        
        return issues
    
    def _check_identity_fraud(self, data: Dict[str, Any]) -> List[str]:
        """Check for identity document fraud indicators"""
        issues = []
        
        # Check for suspicious patterns
        if not data.get("document_number"):
            issues.append("Missing document number")
        
        if not data.get("expiry_date"):
            issues.append("Missing expiry date")
        
        return issues
    
    # Helper methods for compliance checking
    def _check_receipt_compliance(self, data: Dict[str, Any], tenant_id: str) -> List[str]:
        """Check receipt compliance"""
        issues = []
        
        # Check for required fields based on tenant location
        # This would be customized based on local regulations
        if not data.get("vat_amount"):
            issues.append("Missing VAT information")
        
        return issues
    
    def _check_invoice_compliance(self, data: Dict[str, Any], tenant_id: str) -> List[str]:
        """Check invoice compliance"""
        issues = []
        
        # Check for required invoice fields
        required_fields = ["invoice_number", "date", "total_amount", "vat_amount"]
        for field in required_fields:
            if not data.get(field):
                issues.append(f"Missing required field: {field}")
        
        return issues
    
    # Helper methods for quality assessment
    def _assess_text_completeness(self, text: str) -> float:
        """Assess text completeness"""
        if not text or len(text.strip()) < 10:
            return 0.0
        return min(1.0, len(text) / 100)  # Simple heuristic
    
    def _assess_data_accuracy(self, data: Dict[str, Any]) -> float:
        """Assess data accuracy"""
        # Simple heuristic based on number of populated fields
        if not data:
            return 0.0
        return min(1.0, len([v for v in data.values() if v]) / 10)
    
    def _assess_image_quality(self, image_b64: str) -> float:
        """Assess image quality"""
        # Simple heuristic based on image size
        try:
            image_size = len(image_b64)
            return min(1.0, image_size / 100000)  # Normalize to 0-1
        except:
            return 0.5
    
    def _assess_readability(self, text: str) -> float:
        """Assess text readability"""
        if not text:
            return 0.0
        
        # Simple readability assessment
        words = text.split()
        if len(words) < 5:
            return 0.0
        
        return min(1.0, len(words) / 50)  # Simple heuristic
    
    # Additional helper methods
    def _structure_by_document_type(self, data: Dict[str, Any], document_type: DocumentType) -> Dict[str, Any]:
        """Structure data based on document type"""
        # This would contain document-type-specific structuring logic
        return data
    
    def _calculate_extraction_confidence(self, data: Dict[str, Any], document_type: DocumentType) -> float:
        """Calculate extraction confidence"""
        # This would contain sophisticated confidence calculation logic
        return 0.9
    
    def _calculate_structuring_confidence(self, data: Dict[str, Any]) -> float:
        """Calculate structuring confidence"""
        # This would contain confidence calculation for data structuring
        return 0.85
    
    def _get_receipt_recommendations(self, state: Dict[str, Any]) -> List[str]:
        """Get receipt-specific recommendations"""
        return ["Consider categorizing this receipt for expense tracking"]
    
    def _get_invoice_recommendations(self, state: Dict[str, Any]) -> List[str]:
        """Get invoice-specific recommendations"""
        return ["Verify payment terms and due dates"]


# Example usage
async def main():
    """Example usage of GPT5VisionAnalyzer"""
    
    analyzer = GPT5VisionAnalyzer(api_key="your-openai-api-key")
    
    # Create analysis request
    request = VisionAnalysisRequest(
        image_data="base64_image_data_here",
        document_type=DocumentType.RECEIPT,
        analysis_type=AnalysisType.TEXT_EXTRACTION,
        tenant_id="tenant_demo",
        user_id="user_demo",
        language="en"
    )
    
    # Analyze document
    result = await analyzer.analyze_document(request)
    
    print(f"Analysis completed: {result.request_id}")
    print(f"Document type: {result.document_type}")
    print(f"Overall confidence: {result.confidence_scores.get('overall', 0)}")
    print(f"Issues detected: {len(result.detected_issues)}")
    print(f"Recommendations: {len(result.recommendations)}")


if __name__ == "__main__":
    asyncio.run(main())
