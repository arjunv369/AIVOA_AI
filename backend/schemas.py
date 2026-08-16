from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ============================================================
# COMPLAINT SCHEMAS
# ============================================================


class ComplaintCreate(BaseModel):
    complaint_source: Optional[str] = None
    customer_name: str

    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    quantity_affected: Optional[float] = None

    complaint_type: Optional[str] = None
    complaint_date: Optional[date] = None
    description: str

    initial_severity: Optional[str] = None
    priority: Optional[str] = None

    # AI assessment fields
    overall_risk: Optional[str] = None
    confidence_score: Optional[int] = None
    potential_impact: Optional[str] = None
    recommended_action: Optional[str] = None
    reasoning: Optional[str] = None
    completeness_percentage: Optional[int] = None


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    complaint_source: Optional[str] = None
    customer_name: str

    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    quantity_affected: Optional[float] = None

    complaint_type: Optional[str] = None
    complaint_date: Optional[date] = None
    description: str

    initial_severity: Optional[str] = None
    priority: Optional[str] = None

    # AI assessment fields
    overall_risk: Optional[str] = None
    confidence_score: Optional[int] = None
    potential_impact: Optional[str] = None
    recommended_action: Optional[str] = None
    reasoning: Optional[str] = None
    completeness_percentage: Optional[int] = None

    created_at: Optional[datetime] = None


# ============================================================
# AI REQUEST SCHEMAS
# ============================================================


class AiLogRequest(BaseModel):
    """
    Used by the AI Log Complaint tool and AI chat.

    The frontend can send:
        question
        complaint

    while the backend can also accept:
        prompt
        current_state
    """

    prompt: Optional[str] = None
    question: Optional[str] = None

    current_state: Optional[Dict[str, Any]] = None
    complaint: Optional[Dict[str, Any]] = None


class AiEditRequest(BaseModel):
    prompt: str

    current_state: Optional[Dict[str, Any]] = None


# ============================================================
# AI RESPONSE SCHEMAS
# ============================================================


class RiskAssessment(BaseModel):
    overall_risk: str
    severity: str
    priority: str
    confidence: int
    potential_impact: str

    recommended_action: Optional[str] = None


class CompletenessResult(BaseModel):
    score: int
    missing: List[str]


class DuplicateMatch(BaseModel):
    complaint_id: str
    similarity: int
    customer_name: str
    product_name: str


class AiToolResponse(BaseModel):
    tool_used: str

    extracted_data: Dict[str, Any] = {}

    changed_fields: Optional[Dict[str, Any]] = None

    updated_fields_list: Optional[List[str]] = None

    risk_assessment: Optional[Dict[str, Any]] = None

    completeness: Optional[Dict[str, Any]] = None

    duplicate_match: Optional[Dict[str, Any]] = None

    explanation: str