import json
import os
import re
from datetime import date
from typing import Any

from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session

from models import Complaint

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

COMPLAINT_FIELDS = [
    "complaint_source",
    "customer_name",
    "product_name",
    "product_strength",
    "batch_number",
    "manufacturing_date",
    "expiry_date",
    "quantity_affected",
    "complaint_type",
    "complaint_date",
    "description",
    "initial_severity",
    "priority",
]

SYSTEM_PROMPT = """You are an AI assistant for a pharmaceutical customer complaint
quality-management system. Extract complaint information accurately from user text.

Return ONLY valid JSON with these keys:
complaint_source, customer_name, product_name, product_strength, batch_number,
manufacturing_date, expiry_date, quantity_affected, complaint_type,
complaint_date, description, initial_severity, priority.

Rules:
- Use null for information that is not present.
- Dates must use YYYY-MM-DD when possible.
- quantity_affected must be a number when present.
- Do not invent facts.
- initial_severity must be one of Critical, Major, Minor, or null.
- priority must be one of Urgent, High, Medium, Low, or null.
"""


def _json_from_text(text: str) -> dict[str, Any]:
    text = text.strip()
    try:
        value = json.loads(text)
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return {}
        try:
            value = json.loads(match.group(0))
            return value if isinstance(value, dict) else {}
        except json.JSONDecodeError:
            return {}


def _normalize_value(field: str, value: Any) -> Any:
    if value is None:
        return None

    if field == "quantity_affected":
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    if field in {"manufacturing_date", "expiry_date", "complaint_date"}:
        if isinstance(value, date):
            return value.isoformat()
        text = str(value).strip()
        return text or None

    text = str(value).strip()
    return text or None


def _normalize_extracted(data: dict[str, Any]) -> dict[str, Any]:
    return {
        field: _normalize_value(field, data.get(field))
        for field in COMPLAINT_FIELDS
        if field in data
    }


def _groq_json(prompt: str) -> dict[str, Any]:
    if not _client:
        return {}

    response = _client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    return _json_from_text(content)


def run_ai_log_complaint(
    prompt: str,
    current_state: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not prompt.strip():
        return {
            "extracted_data": {},
            "explanation": "Enter a complaint description or complaint details.",
        }

    try:
        extracted = _normalize_extracted(_groq_json(prompt))
        merged = dict(current_state or {})
        merged.update({k: v for k, v in extracted.items() if v is not None})

        return {
            "extracted_data": merged if current_state else extracted,
            "explanation": "Complaint information extracted and normalized.",
        }
    except Exception as exc:
        return {
            "extracted_data": {},
            "explanation": f"AI extraction failed: {exc}",
        }


def run_ai_edit_complaint(
    prompt: str,
    current_state: dict[str, Any] | None = None,
) -> dict[str, Any]:
    current = dict(current_state or {})

    try:
        extracted = _normalize_extracted(_groq_json(
            f"""Current complaint:
{json.dumps(current, default=str)}

User correction/update:
{prompt}

Extract only fields that the user explicitly changes."""
        ))
    except Exception as exc:
        return {
            "extracted_data": current,
            "changed_fields": {},
            "updated_fields_list": [],
            "explanation": f"AI edit failed: {exc}",
        }

    changed: dict[str, Any] = {}
    for key, value in extracted.items():
        if value is not None and current.get(key) != value:
            changed[key] = value

    updated = dict(current)
    updated.update(changed)

    return {
        "extracted_data": updated,
        "changed_fields": changed,
        "updated_fields_list": list(changed.keys()),
        "explanation": (
            f"Updated {len(changed)} field(s)."
            if changed
            else "No complaint fields were changed."
        ),
    }


def _extract_document_text(file_bytes: bytes, filename: str) -> str:
    suffix = os.path.splitext(filename.lower())[1]

    if suffix == ".txt":
        return file_bytes.decode("utf-8", errors="ignore")

    if suffix == ".eml":
        from email import policy
        from email.parser import BytesParser

        message = BytesParser(policy=policy.default).parsebytes(file_bytes)
        parts = []
        if message["subject"]:
            parts.append(f"Subject: {message['subject']}")
        body = message.get_body(preferencelist=("plain", "html"))
        if body:
            parts.append(body.get_content())
        return "\n".join(parts)

    if suffix == ".pdf":
        from io import BytesIO
        from pypdf import PdfReader

        reader = PdfReader(BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if suffix == ".docx":
        from io import BytesIO
        from docx import Document

        document = Document(BytesIO(file_bytes))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    raise ValueError("Unsupported document type. Use PDF, DOCX, TXT, or EML.")


def run_ai_document_extraction(
    file_bytes: bytes,
    filename: str,
) -> dict[str, Any]:
    try:
        text = _extract_document_text(file_bytes, filename)
        if not text.strip():
            return {
                "extracted_data": {},
                "explanation": f"No readable text was found in {filename}.",
            }

        extracted = _normalize_extracted(
            _groq_json(f"Extract complaint information from this document:\n\n{text}")
        )
        return {
            "extracted_data": extracted,
            "explanation": f"Document {filename} was analyzed successfully.",
        }
    except Exception as exc:
        return {
            "extracted_data": {},
            "explanation": f"Document extraction failed: {exc}",
        }


def compute_risk_assessment(complaint: dict[str, Any]) -> dict[str, Any]:
    severity = str(complaint.get("initial_severity") or "").lower()
    priority = str(complaint.get("priority") or "").lower()

    try:
        quantity = float(complaint.get("quantity_affected") or 0)
    except (TypeError, ValueError):
        quantity = 0

    score = 35
    if severity == "critical":
        score += 45
    elif severity == "major":
        score += 30
    elif severity == "minor":
        score += 10

    if priority == "urgent":
        score += 15
    elif priority == "high":
        score += 10

    if quantity > 5000:
        score += 10
    elif quantity > 1000:
        score += 5

    score = min(score, 100)

    if score >= 80:
        risk = "HIGH"
        action = "Immediate QA review and formal investigation."
    elif score >= 55:
        risk = "MEDIUM"
        action = "Prioritized QA review and investigation."
    else:
        risk = "LOW"
        action = "Routine QA review and monitoring."

    impact = (
        "Potential product-quality or patient-impact concern requiring "
        "documented assessment."
        if risk == "HIGH"
        else "Potential quality impact should be assessed during triage."
    )

    return {
        "overall_risk": risk,
        "confidence_score": score,
        "potential_impact": impact,
        "recommended_action": action,
        "reasoning": (
            f"Risk score {score}/100 based on severity, priority, "
            f"and quantity affected."
        ),
    }


def compute_completeness(complaint: dict[str, Any]) -> dict[str, Any]:
    labels = {
        "complaint_source": "Complaint Source",
        "customer_name": "Customer Name",
        "product_name": "Product Name",
        "product_strength": "Product Strength / Grade",
        "batch_number": "Batch / Lot Number",
        "manufacturing_date": "Manufacturing Date",
        "expiry_date": "Expiry Date",
        "quantity_affected": "Quantity Affected",
        "complaint_type": "Complaint Type",
        "complaint_date": "Complaint Date",
        "description": "Detailed Complaint Description",
        "initial_severity": "Initial Severity",
        "priority": "Priority",
    }

    missing = [
        label for field, label in labels.items()
        if complaint.get(field) is None or str(complaint.get(field)).strip() == ""
    ]

    score = round(((len(labels) - len(missing)) / len(labels)) * 100)
    return {"score": score, "missing": missing}


def check_duplicates_in_db(
    complaint: dict[str, Any],
    db: Session | None = None,
) -> dict[str, Any]:
    if db is None:
        return {
            "found": False,
            "complaint_id": None,
            "similarity": 0,
            "reason": "Database session not supplied.",
        }

    product = str(complaint.get("product_name") or "").strip().lower()
    batch = str(complaint.get("batch_number") or "").strip().lower()
    customer = str(complaint.get("customer_name") or "").strip().lower()

    records = db.query(Complaint).order_by(Complaint.id.desc()).limit(200).all()

    best: Complaint | None = None
    best_score = 0

    for record in records:
        score = 0
        if product and record.product_name and product == record.product_name.lower():
            score += 40
        if batch and record.batch_number and batch == record.batch_number.lower():
            score += 40
        if customer and record.customer_name and customer == record.customer_name.lower():
            score += 20

        if score > best_score:
            best_score = score
            best = record

    return {
        "found": bool(best and best_score >= 60),
        "complaint_id": best.complaint_id if best and best_score >= 60 else None,
        "similarity": best_score if best else 0,
        "reason": (
            "Matching product, batch, or customer information found."
            if best and best_score >= 60
            else "No strong duplicate match found."
        ),
    }
