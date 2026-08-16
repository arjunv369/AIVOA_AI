from typing import Any

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from ai_service import (
    check_duplicates_in_db,
    compute_completeness,
    compute_risk_assessment,
)
from database import SessionLocal, engine
from langgraph_workflow import execute_complaint_pipeline
from models import Base, Complaint
from schemas import (
    AiEditRequest,
    AiLogRequest,
    AiToolResponse,
    ComplaintCreate,
    ComplaintResponse,
    CompletenessResult,
    DocumentUploadResponse,
    DuplicateMatch,
    RiskAssessment,
)

app = FastAPI(
    title="AIVOA QMS AI Customer Complaint Management API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _apply_ai_fields(payload: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    data = result.get("extracted_data") or {}
    risk = result.get("risk_assessment") or {}
    completeness = result.get("completeness") or {}

    merged = dict(payload)
    for key, value in data.items():
        if value is not None:
            merged[key] = value

    if risk:
        merged.update(risk)

    if completeness:
        merged["completeness_percentage"] = completeness.get("score")

    return merged


@app.get("/")
def root():
    return {"message": "AIVOA QMS AI Customer Complaint API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "database": "configured"}


@app.get("/complaints", response_model=list[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.id.desc()).all()


@app.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@app.post("/complaints", response_model=ComplaintResponse)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
):
    values = complaint.model_dump(exclude_none=True)
    values.setdefault("status", "Pending Triage")

    new_complaint = Complaint(**values)
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint


@app.put("/complaints/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: int,
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
):
    db_complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(db_complaint, key, value)

    db.commit()
    db.refresh(db_complaint)
    return db_complaint


@app.post("/api/ai/log-complaint", response_model=AiToolResponse)
def ai_log_complaint(
    req: AiLogRequest,
    db: Session = Depends(get_db),
):
    result = execute_complaint_pipeline(
        prompt=req.prompt,
        current_state=req.current_state,
    )
    result["duplicate_match"] = check_duplicates_in_db(
        result.get("extracted_data") or {},
        db,
    )

    return AiToolResponse(
        tool_used="LOG_COMPLAINT_TOOL",
        extracted_data=result.get("extracted_data") or {},
        risk_assessment=result.get("risk_assessment"),
        completeness=result.get("completeness"),
        duplicate_match=result.get("duplicate_match"),
        explanation=result.get("explanation", "Complaint intake processed."),
    )


@app.post("/api/ai/edit-complaint", response_model=AiToolResponse)
def ai_edit_complaint(
    req: AiEditRequest,
    db: Session = Depends(get_db),
):
    result = execute_complaint_pipeline(
        prompt=req.prompt,
        current_state=req.current_state,
    )
    result["duplicate_match"] = check_duplicates_in_db(
        result.get("extracted_data") or {},
        db,
    )

    return AiToolResponse(
        tool_used="EDIT_COMPLAINT_TOOL",
        extracted_data=result.get("extracted_data") or {},
        changed_fields=result.get("changed_fields"),
        updated_fields_list=result.get("updated_fields_list"),
        risk_assessment=result.get("risk_assessment"),
        completeness=result.get("completeness"),
        duplicate_match=result.get("duplicate_match"),
        explanation=result.get("explanation", "Complaint fields updated."),
    )


@app.post("/api/ai/extract-document", response_model=DocumentUploadResponse)
async def ai_extract_document(file: UploadFile = File(...)):
    content = await file.read()
    result = execute_complaint_pipeline(
        file_bytes=content,
        filename=file.filename or "document",
    )

    return DocumentUploadResponse(
        filename=file.filename or "document",
        tool_used="DOCUMENT_EXTRACTION_TOOL",
        extracted_data=result.get("extracted_data") or {},
        risk_assessment=result.get("risk_assessment"),
        completeness=result.get("completeness"),
        explanation=result.get("explanation", "Document processed."),
    )


@app.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    return await ai_extract_document(file)


@app.post("/api/ai/chat")
def ai_chat(
    req: AiLogRequest,
    db: Session = Depends(get_db),
):
    result = execute_complaint_pipeline(
        prompt=req.prompt,
        current_state=req.current_state,
    )
    result["duplicate_match"] = check_duplicates_in_db(
        result.get("extracted_data") or {},
        db,
    )

    return {
        "reply": result.get("explanation", "Processing complaint request..."),
        "extracted_data": result.get("extracted_data") or {},
        "tool_used": result.get("tool_type", "CHAT"),
        "risk_assessment": result.get("risk_assessment"),
        "completeness": result.get("completeness"),
        "duplicate_match": result.get("duplicate_match"),
    }


@app.post("/api/ai/risk-assessment", response_model=RiskAssessment)
def ai_risk_assessment(complaint: dict[str, Any]):
    return compute_risk_assessment(complaint)


@app.post("/api/ai/duplicate-detection", response_model=DuplicateMatch)
def ai_duplicate_detection(
    complaint: dict[str, Any],
    db: Session = Depends(get_db),
):
    return check_duplicates_in_db(complaint, db)


@app.post("/api/ai/completeness", response_model=CompletenessResult)
def ai_completeness(complaint: dict[str, Any]):
    return compute_completeness(complaint)
