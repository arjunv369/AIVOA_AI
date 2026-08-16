from typing import Any, Dict, List, Optional

from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Base, Complaint

from schemas import (
    AiEditRequest,
    AiLogRequest,
    AiToolResponse,
    ComplaintCreate,
    ComplaintResponse,
    CompletenessResult,
    DuplicateMatch,
    RiskAssessment,
)

from langgraph_workflow import (
    execute_complaint_pipeline,
)

from ai_service import (
    check_duplicates_in_db,
    compute_completeness,
    compute_risk_assessment,
)


# ============================================================
# FASTAPI APP
# ============================================================


app = FastAPI(
    title="AIVOA QMS AI Customer Complaint Management API",
    version="1.0.0",
    description=(
        "AI-powered pharmaceutical customer complaint "
        "management API using FastAPI, LangGraph and Groq."
    ),
)


# ============================================================
# CORS
# ============================================================

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


# ============================================================
# DATABASE INITIALIZATION
# ============================================================


Base.metadata.create_all(
    bind=engine
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# ROOT
# ============================================================


@app.get("/")
def root():

    return {
        "message": (
            "AIVOA QMS AI Customer Complaint API is running"
        ),
        "version": "1.0.0",
        "status": "online",
    }


# ============================================================
# HEALTH CHECK
# ============================================================


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# COMPLAINT CRUD
# ============================================================


@app.get(
    "/complaints",
    response_model=List[ComplaintResponse],
)
def get_complaints(
    db: Session = Depends(get_db),
):

    """
    Retrieves all complaints.
    """

    return (
        db.query(Complaint)
        .order_by(Complaint.id.desc())
        .all()
    )


@app.get(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse,
)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
):

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id
        )
        .first()
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    return complaint


@app.post(
    "/complaints",
    response_model=ComplaintResponse,
)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
):

    """
    Creates a complaint in the database.
    """

    new_complaint = Complaint(
        complaint_source=complaint.complaint_source,
        customer_name=complaint.customer_name,

        product_name=complaint.product_name,
        product_strength=complaint.product_strength,
        batch_number=complaint.batch_number,

        manufacturing_date=(
            complaint.manufacturing_date
        ),

        expiry_date=(
            complaint.expiry_date
        ),

        quantity_affected=(
            complaint.quantity_affected
        ),

        complaint_type=(
            complaint.complaint_type
        ),

        complaint_date=(
            complaint.complaint_date
        ),

        description=complaint.description,

        initial_severity=(
            complaint.initial_severity
        ),

        priority=complaint.priority,

        overall_risk=(
            complaint.overall_risk
        ),

        confidence_score=(
            complaint.confidence_score
        ),

        potential_impact=(
            complaint.potential_impact
        ),

        recommended_action=(
            complaint.recommended_action
        ),

        reasoning=(
            complaint.reasoning
        ),

        completeness_percentage=(
            complaint.completeness_percentage
        ),
    )

    db.add(new_complaint)

    db.commit()

    db.refresh(new_complaint)

    return new_complaint


@app.put(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse,
)
def update_complaint(
    complaint_id: int,
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
):

    """
    Updates an existing complaint.
    """

    db_complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id
        )
        .first()
    )

    if not db_complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    data = payload.model_dump(
        exclude_unset=True
    )

    for key, value in data.items():

        if hasattr(
            db_complaint,
            key,
        ):
            setattr(
                db_complaint,
                key,
                value,
            )

    db.commit()

    db.refresh(db_complaint)

    return db_complaint


# ============================================================
# AI — LOG COMPLAINT TOOL
# ============================================================


@app.post(
    "/api/ai/log-complaint",
    response_model=AiToolResponse,
)
@app.post(
    "/ai/log-complaint",
    response_model=AiToolResponse,
)
def ai_log_complaint(
    req: AiLogRequest,
    db: Session = Depends(get_db),
):

    """
    Tool 1:
    Natural language complaint logging.
    """

    prompt = (
        req.prompt
        or req.question
        or ""
    )

    current_state = (
        req.current_state
        or req.complaint
        or {}
    )

    result = execute_complaint_pipeline(
        prompt=prompt,
        current_state=current_state,
        db_session=db,
    )

    return AiToolResponse(
        tool_used="LOG_COMPLAINT_TOOL",

        extracted_data=(
            result.get(
                "extracted_data",
                {},
            )
        ),

        risk_assessment=(
            result.get(
                "risk_assessment"
            )
        ),

        completeness=(
            result.get(
                "completeness"
            )
        ),

        duplicate_match=(
            result.get(
                "duplicate_match"
            )
        ),

        explanation=(
            result.get(
                "explanation",
                "Complaint intake processed.",
            )
        ),
    )


# ============================================================
# AI — EDIT COMPLAINT TOOL
# ============================================================


@app.post(
    "/api/ai/edit-complaint",
    response_model=AiToolResponse,
)
@app.post(
    "/ai/edit-complaint",
    response_model=AiToolResponse,
)
def ai_edit_complaint(
    req: AiEditRequest,
    db: Session = Depends(get_db),
):

    """
    Tool 2:
    Incremental complaint editing.
    """

    result = execute_complaint_pipeline(
        prompt=req.prompt,
        current_state=(
            req.current_state
            or {}
        ),
        db_session=db,
    )

    return AiToolResponse(
        tool_used="EDIT_COMPLAINT_TOOL",

        extracted_data=(
            result.get(
                "extracted_data",
                {},
            )
        ),

        changed_fields=(
            result.get(
                "changed_fields"
            )
        ),

        updated_fields_list=(
            result.get(
                "updated_fields_list"
            )
        ),

        risk_assessment=(
            result.get(
                "risk_assessment"
            )
        ),

        completeness=(
            result.get(
                "completeness"
            )
        ),

        duplicate_match=(
            result.get(
                "duplicate_match"
            )
        ),

        explanation=(
            result.get(
                "explanation",
                "Complaint fields updated.",
            )
        ),
    )


# ============================================================
# AI — DOCUMENT EXTRACTION TOOL
# ============================================================


@app.post(
    "/api/ai/extract-document",
    response_model=AiToolResponse,
)
async def ai_extract_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    """
    Tool 3:
    Extracts complaint information from:
        PDF
        DOCX
        TXT
        EML
    """

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    allowed_extensions = {
        "pdf",
        "docx",
        "txt",
        "eml",
    }

    extension = (
        file.filename
        .lower()
        .split(".")[-1]
    )

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported format. "
                "Upload PDF, DOCX, TXT or EML."
            ),
        )

    content = await file.read()

    if not content:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(content) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=413,
            detail="File exceeds the 10 MB limit.",
        )

    result = execute_complaint_pipeline(
        file_bytes=content,
        filename=file.filename,
        db_session=db,
    )

    return AiToolResponse(
        tool_used="DOCUMENT_EXTRACTION_TOOL",

        extracted_data=(
            result.get(
                "extracted_data",
                {},
            )
        ),

        risk_assessment=(
            result.get(
                "risk_assessment"
            )
        ),

        completeness=(
            result.get(
                "completeness"
            )
        ),

        duplicate_match=(
            result.get(
                "duplicate_match"
            )
        ),

        explanation=(
            result.get(
                "explanation",
                f"Document {file.filename} extracted.",
            )
        ),
    )


# ============================================================
# FRONTEND-COMPATIBLE DOCUMENT ENDPOINT
# ============================================================


@app.post(
    "/documents/upload",
)
async def upload_document(
    file: UploadFile = File(...),
):

    """
    Lightweight upload endpoint used by the frontend
    document service.

    The actual AI extraction happens through
    /api/ai/extract-document.
    """

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    allowed_extensions = {
        "pdf",
        "docx",
        "txt",
        "eml",
    }

    extension = (
        file.filename
        .lower()
        .split(".")[-1]
    )

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Unsupported document format.",
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=413,
            detail="File exceeds the 10 MB limit.",
        )

    return {
        "document_id": (
            f"upload-{file.filename}"
        ),
        "file_name": file.filename,
        "size": len(content),
        "status": "uploaded",
    }


# ============================================================
# AI — CHAT / COPILOT
# ============================================================


@app.post(
    "/api/ai/chat",
)
@app.post(
    "/ai/chat",
)
def ai_chat(
    req: AiLogRequest,
    db: Session = Depends(get_db),
):

    """
    AI Copilot chat endpoint.

    Frontend format:
        {
            "question": "...",
            "complaint": {...}
        }

    Backend converts this into the common LangGraph workflow.
    """

    prompt = (
        req.question
        or req.prompt
        or ""
    )

    current_state = (
        req.complaint
        or req.current_state
        or {}
    )

    if not prompt.strip():

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    result = execute_complaint_pipeline(
        prompt=prompt,
        current_state=current_state,
        db_session=db,
    )

    return {
        "answer": result.get(
            "explanation",
            "Processing complaint request...",
        ),

        "reply": result.get(
            "explanation",
            "Processing complaint request...",
        ),

        "extracted_data": result.get(
            "extracted_data",
            {},
        ),

        "risk_assessment": result.get(
            "risk_assessment"
        ),

        "completeness": result.get(
            "completeness"
        ),

        "duplicate_match": result.get(
            "duplicate_match"
        ),

        "tool_used": result.get(
            "tool_type",
            "CHAT",
        ),
    }


# ============================================================
# AI — RISK ASSESSMENT
# ============================================================


@app.post(
    "/api/ai/risk-assessment",
    response_model=RiskAssessment,
)
@app.post(
    "/ai/risk-assessment",
    response_model=RiskAssessment,
)
def ai_risk_assessment(
    complaint: Dict[str, Any],
):

    return compute_risk_assessment(
        complaint
    )


# ============================================================
# AI — DUPLICATE DETECTION
# ============================================================


@app.post(
    "/api/ai/duplicate-detection",
)
@app.post(
    "/ai/duplicate-detection",
)
def ai_duplicate_detection(
    complaint: Dict[str, Any],
    db: Session = Depends(get_db),
):

    match = check_duplicates_in_db(
        complaint,
        db,
    )

    if not match:

        return {
            "duplicate": False,
            "match": None,
        }

    return {
        "duplicate": True,
        "match": match,
    }


# ============================================================
# AI — COMPLETENESS
# ============================================================


@app.post(
    "/api/ai/completeness",
    response_model=CompletenessResult,
)
@app.post(
    "/ai/completeness",
    response_model=CompletenessResult,
)
def ai_completeness(
    complaint: Dict[str, Any],
):

    return compute_completeness(
        complaint
    )