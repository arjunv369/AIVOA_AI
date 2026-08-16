from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ComplaintCreate(BaseModel):
    complaint_source: str | None = None
    customer_name: str = Field(min_length=1)
    product_name: str | None = None
    product_strength: str | None = None
    batch_number: str | None = None
    manufacturing_date: date | None = None
    expiry_date: date | None = None
    quantity_affected: float | None = Field(default=None, ge=0)

    complaint_type: str | None = None
    complaint_date: date | None = None
    description: str = Field(min_length=1)

    initial_severity: str | None = None
    priority: str | None = None
    status: str | None = None

    overall_risk: str | None = None
    confidence_score: int | None = Field(default=None, ge=0, le=100)
    potential_impact: str | None = None
    recommended_action: str | None = None
    reasoning: str | None = None
    completeness_percentage: int | None = Field(default=None, ge=0, le=100)


class ComplaintResponse(ComplaintCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_id: str
    created_at: datetime


class AiLogRequest(BaseModel):
    prompt: str = ""
    current_state: dict[str, Any] | None = None


class AiEditRequest(AiLogRequest):
    pass


class AiToolResponse(BaseModel):
    tool_used: str
    extracted_data: dict[str, Any] = {}
    changed_fields: dict[str, Any] | None = None
    updated_fields_list: list[str] | None = None
    risk_assessment: dict[str, Any] | None = None
    completeness: dict[str, Any] | None = None
    duplicate_match: dict[str, Any] | None = None
    explanation: str = ""


class RiskAssessment(BaseModel):
    overall_risk: str
    confidence_score: int
    potential_impact: str
    recommended_action: str
    reasoning: str


class CompletenessResult(BaseModel):
    score: int
    missing: list[str]


class DuplicateMatch(BaseModel):
    found: bool
    complaint_id: str | None = None
    similarity: int = 0
    reason: str = ""


class DocumentUploadResponse(AiToolResponse):
    filename: str
