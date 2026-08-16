import json
import os
import re
from datetime import date
from typing import Any, Dict, Optional

from dotenv import load_dotenv

from models import Complaint


load_dotenv()


# ============================================================
# CONFIGURATION
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "gemma2-9b-it")


try:
    from groq import Groq
except ImportError:
    Groq = None


groq_client = None

if GROQ_API_KEY and Groq:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as exc:
        print(f"[AI] Failed to initialize Groq client: {exc}")


# ============================================================
# FIELD DEFINITIONS
# ============================================================

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


FIELD_LABELS = {
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


# ============================================================
# COMMON HELPERS
# ============================================================

def clean_string(value: Any) -> Optional[str]:
    """
    Converts a value into a clean string.

    Empty strings, null-like values and whitespace-only values
    become None.
    """
    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    if value.lower() in {"null", "none", "unknown", "n/a", "not provided"}:
        return None

    return value


def clean_number(value: Any) -> Optional[float]:
    """
    Converts quantity values to float where possible.
    """
    if value is None or value == "":
        return None

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()

    # Extract first numeric value.
    match = re.search(r"-?\d+(?:\.\d+)?", text)

    if not match:
        return None

    try:
        return float(match.group(0))
    except ValueError:
        return None


def normalize_date(value: Any) -> Optional[str]:
    """
    Normalizes common date formats to YYYY-MM-DD.

    If the value cannot safely be interpreted, it is returned
    as a cleaned string rather than inventing a date.
    """
    if value is None:
        return None

    if isinstance(value, date):
        return value.isoformat()

    text = str(value).strip()

    if not text:
        return None

    # Already ISO formatted.
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return text

    # Common formats.
    patterns = [
        (r"^(\d{2})/(\d{2})/(\d{4})$", "%d/%m/%Y"),
        (r"^(\d{2})-(\d{2})-(\d{4})$", "%d-%m-%Y"),
        (r"^(\d{4})/(\d{2})/(\d{2})$", "%Y/%m/%d"),
    ]

    from datetime import datetime

    for pattern, fmt in patterns:
        if re.match(pattern, text):
            try:
                return datetime.strptime(text, fmt).date().isoformat()
            except ValueError:
                pass

    return text


def normalize_extracted_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Keeps only the complaint fields used by the application
    and normalizes their values.
    """
    result: Dict[str, Any] = {}

    for field in COMPLAINT_FIELDS:
        if field not in data:
            continue

        value = data[field]

        if field == "quantity_affected":
            cleaned = clean_number(value)
        elif field in {
            "manufacturing_date",
            "expiry_date",
            "complaint_date",
        }:
            cleaned = normalize_date(value)
        else:
            cleaned = clean_string(value)

        if cleaned is not None:
            result[field] = cleaned

    return result


def extract_json(text: str) -> Dict[str, Any]:
    """
    Safely extracts a JSON object from an LLM response.

    Handles responses where the model accidentally wraps JSON
    in markdown code fences.
    """
    if not text:
        return {}

    text = text.strip()

    # Remove markdown fences.
    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        parsed = json.loads(text)

        if isinstance(parsed, dict):
            return parsed

    except json.JSONDecodeError:
        pass

    # Try to find the first JSON object.
    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end > start:
        candidate = text[start : end + 1]

        try:
            parsed = json.loads(candidate)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    return {}


# ============================================================
# GROQ
# ============================================================

def call_groq_llm(
    system_prompt: str,
    user_prompt: str,
) -> Optional[str]:
    """
    Calls Groq.

    No API key is exposed to the frontend.
    """

    if not groq_client:
        print("[AI] Groq client unavailable.")
        return None

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.1,
            max_tokens=2000,
        )

        content = response.choices[0].message.content

        if not content:
            return None

        return content

    except Exception as exc:
        print(f"[AI] Groq request failed: {exc}")
        return None


# ============================================================
# AI PROMPTS
# ============================================================

EXTRACTION_SYSTEM_PROMPT = """
You are an AI assistant inside a pharmaceutical Quality Management
System (QMS).

Your job is to analyze a customer complaint and extract structured
complaint information.

IMPORTANT:
- Do not invent information.
- If a field is not present, return null.
- Preserve exact batch numbers.
- Preserve product names accurately.
- Preserve quantities and units in the description when necessary.
- Dates should use YYYY-MM-DD when the source gives enough information.
- Use pharmaceutical complaint terminology.
- Severity must be one of: Minor, Major, Critical.
- Priority must be one of: Low, Medium, High, Urgent.
- complaint_type should be a concise category such as:
  Product Quality, Packaging Defect, Labeling Issue, Delivery Issue,
  Adverse Event, Foreign Matter, Contamination, Stability Issue, Other.

Return ONLY valid JSON.

Required JSON structure:

{
  "complaint_source": null,
  "customer_name": null,
  "product_name": null,
  "product_strength": null,
  "batch_number": null,
  "manufacturing_date": null,
  "expiry_date": null,
  "quantity_affected": null,
  "complaint_type": null,
  "complaint_date": null,
  "description": null,
  "initial_severity": null,
  "priority": null
}
"""


# ============================================================
# TOOL 1 — LOG COMPLAINT
# ============================================================

def run_ai_log_complaint(
    prompt: str,
    current_state: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Tool 1.

    Takes a natural-language complaint and converts it into
    structured complaint fields.
    """

    current_state = current_state or {}

    user_prompt = f"""
Analyze this pharmaceutical customer complaint:

{prompt}

Existing complaint state:

{json.dumps(current_state, default=str, indent=2)}

Extract only information supported by the complaint.

Return JSON only.
"""

    response = call_groq_llm(
        EXTRACTION_SYSTEM_PROMPT,
        user_prompt,
    )

    extracted = extract_json(response or "")
    extracted = normalize_extracted_fields(extracted)

    # If Groq is unavailable, provide a minimal safe fallback
    # rather than pretending that fake AI extraction occurred.
    if not extracted:
        extracted = fallback_extract_from_text(prompt)

    # Merge with existing state without replacing existing values
    # with null.
    merged = dict(current_state)

    for key, value in extracted.items():
        if value is not None and value != "":
            merged[key] = value

    changed_fields = {
        key: value
        for key, value in extracted.items()
        if current_state.get(key) != value
    }

    risk = compute_risk_assessment(merged)
    completeness = compute_completeness(merged)

    return {
        "extracted_data": changed_fields,
        "risk_assessment": risk,
        "completeness": completeness,
        "explanation": build_log_explanation(
            changed_fields,
            risk,
            completeness,
        ),
    }


# ============================================================
# TOOL 2 — EDIT COMPLAINT
# ============================================================

def run_ai_edit_complaint(
    prompt: str,
    current_state: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Tool 2.

    Updates only fields explicitly changed by the user.

    Existing complaint information is preserved.
    """

    current_state = current_state or {}

    user_prompt = f"""
The user wants to modify an existing pharmaceutical complaint.

Current complaint:

{json.dumps(current_state, default=str, indent=2)}

User's requested change:

{prompt}

Determine ONLY which complaint fields the user wants to change.

Rules:
- Do not remove existing information unless explicitly requested.
- Do not modify unrelated fields.
- Do not invent missing values.
- Return null for fields that were not changed.

Return ONLY valid JSON with these fields:

{
  "complaint_source": null,
  "customer_name": null,
  "product_name": null,
  "product_strength": null,
  "batch_number": null,
  "manufacturing_date": null,
  "expiry_date": null,
  "quantity_affected": null,
  "complaint_type": null,
  "complaint_date": null,
  "description": null,
  "initial_severity": null,
  "priority": null
}
"""

    response = call_groq_llm(
        EXTRACTION_SYSTEM_PROMPT,
        user_prompt,
    )

    changes = extract_json(response or "")
    changes = normalize_extracted_fields(changes)

    # Fallback for simple natural-language corrections.
    if not changes:
        changes = fallback_edit_from_text(prompt)

    # Only fields that actually differ are returned.
    changed_fields = {}

    for field, value in changes.items():
        if value is None:
            continue

        if str(current_state.get(field, "")) != str(value):
            changed_fields[field] = value

    updated_state = dict(current_state)
    updated_state.update(changed_fields)

    risk = compute_risk_assessment(updated_state)
    completeness = compute_completeness(updated_state)

    return {
        "extracted_data": changed_fields,
        "changed_fields": changed_fields,
        "updated_fields_list": list(changed_fields.keys()),
        "risk_assessment": risk,
        "completeness": completeness,
        "explanation": build_edit_explanation(
            changed_fields,
            risk,
        ),
    }


# ============================================================
# TOOL 3 — DOCUMENT EXTRACTION
# ============================================================

def extract_document_text(
    file_bytes: bytes,
    filename: str,
) -> str:
    """
    Extracts text from common demonstration document formats.

    Production OCR is intentionally not required by the assignment.
    """

    extension = filename.lower().split(".")[-1]

    # TXT / EML
    if extension in {"txt", "eml"}:
        return file_bytes.decode(
            "utf-8",
            errors="ignore",
        )

    # PDF
    if extension == "pdf":
        try:
            from pypdf import PdfReader

            import io

            reader = PdfReader(io.BytesIO(file_bytes))

            pages = []

            for page in reader.pages:
                text = page.extract_text() or ""
                pages.append(text)

            return "\n".join(pages)

        except Exception as exc:
            print(f"[AI] PDF extraction failed: {exc}")
            return ""

    # DOCX
    if extension == "docx":
        try:
            from docx import Document

            import io

            document = Document(io.BytesIO(file_bytes))

            paragraphs = [
                paragraph.text
                for paragraph in document.paragraphs
                if paragraph.text.strip()
            ]

            return "\n".join(paragraphs)

        except Exception as exc:
            print(f"[AI] DOCX extraction failed: {exc}")
            return ""

    return ""


def run_ai_document_extraction(
    file_bytes: bytes,
    filename: str,
) -> Dict[str, Any]:
    """
    Tool 3.

    Extracts document text and sends it to Groq for structured
    pharmaceutical complaint extraction.
    """

    raw_text = extract_document_text(
        file_bytes,
        filename,
    )

    if not raw_text.strip():
        return {
            "extracted_data": {},
            "risk_assessment": None,
            "completeness": compute_completeness({}),
            "explanation": (
                f"Unable to extract readable text from {filename}. "
                "Please upload a text-based PDF, DOCX, TXT or EML file."
            ),
        }

    response = call_groq_llm(
        EXTRACTION_SYSTEM_PROMPT,
        f"""
Extract the complaint information from this document.

Filename:
{filename}

Document content:
--------------------
{raw_text[:20000]}
--------------------

Return JSON only.
""",
    )

    extracted = extract_json(response or "")
    extracted = normalize_extracted_fields(extracted)

    if not extracted:
        extracted = fallback_extract_from_text(raw_text)

    risk = compute_risk_assessment(extracted)
    completeness = compute_completeness(extracted)

    return {
        "extracted_data": extracted,
        "risk_assessment": risk,
        "completeness": completeness,
        "explanation": (
            f"AI extracted complaint information from {filename}. "
            f"{len(extracted)} complaint fields were identified."
        ),
    }


# ============================================================
# RISK ASSESSMENT
# ============================================================

def compute_risk_assessment(
    complaint: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calculates a deterministic baseline risk assessment.

    This is intentionally transparent and explainable.
    """

    description = str(
        complaint.get("description") or ""
    ).lower()

    complaint_type = str(
        complaint.get("complaint_type") or ""
    ).lower()

    score = 0
    reasons = []

    critical_terms = [
        "contamination",
        "foreign matter",
        "adverse event",
        "serious",
        "hospitalization",
        "death",
        "recall",
        "wrong product",
    ]

    major_terms = [
        "discolored",
        "damaged",
        "broken",
        "leak",
        "seal failure",
        "incorrect",
        "defect",
        "quality issue",
    ]

    for term in critical_terms:
        if term in description or term in complaint_type:
            score += 4
            reasons.append(term)

    for term in major_terms:
        if term in description or term in complaint_type:
            score += 2
            reasons.append(term)

    severity = str(
        complaint.get("initial_severity") or ""
    ).strip()

    priority = str(
        complaint.get("priority") or ""
    ).strip()

    if severity == "Critical":
        score += 4
    elif severity == "Major":
        score += 2

    if priority == "Urgent":
        score += 4
    elif priority == "High":
        score += 2

    # Determine final classification.
    if score >= 6:
        overall_risk = "High"
        calculated_severity = "Critical" if score >= 8 else "Major"
        calculated_priority = "Urgent" if score >= 8 else "High"

    elif score >= 3:
        overall_risk = "Medium"
        calculated_severity = "Major"
        calculated_priority = "High"

    else:
        overall_risk = "Low"
        calculated_severity = "Minor"
        calculated_priority = "Low"

    # Respect explicitly supplied severity/priority when available.
    if severity in {"Minor", "Major", "Critical"}:
        calculated_severity = severity

    if priority in {"Low", "Medium", "High", "Urgent"}:
        calculated_priority = priority

    confidence = min(
        95,
        70 + min(score * 4, 25),
    )

    if not reasons:
        potential_impact = (
            "No high-risk indicators were identified from the "
            "available complaint information."
        )
    else:
        potential_impact = (
            "Potential product quality impact identified from "
            + ", ".join(reasons[:4])
            + "."
        )

    if overall_risk == "High":
        recommended_action = (
            "Route to QA investigation, verify the affected batch, "
            "review manufacturing and packaging records, and assess "
            "whether escalation or CAPA is required."
        )
    elif overall_risk == "Medium":
        recommended_action = (
            "Review the complaint, verify batch information and "
            "assess whether a formal investigation is required."
        )
    else:
        recommended_action = (
            "Complete complaint review and monitor for recurrence."
        )

    return {
        "overall_risk": overall_risk,
        "severity": calculated_severity,
        "priority": calculated_priority,
        "confidence": confidence,
        "potential_impact": potential_impact,
        "recommended_action": recommended_action,
    }


# ============================================================
# COMPLETENESS
# ============================================================

def compute_completeness(
    complaint: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Uses the same 13 complaint fields as the React frontend.
    """

    missing = []

    for field in COMPLAINT_FIELDS:
        value = complaint.get(field)

        if value is None:
            missing.append(FIELD_LABELS[field])
            continue

        if str(value).strip() == "":
            missing.append(FIELD_LABELS[field])

    total = len(COMPLAINT_FIELDS)
    completed = total - len(missing)

    score = round(
        (completed / total) * 100
    )

    return {
        "score": score,
        "missing": missing,
    }


# ============================================================
# DUPLICATE DETECTION
# ============================================================

def check_duplicates_in_db(
    data: Dict[str, Any],
    db_session=None,
) -> Optional[Dict[str, Any]]:
    """
    Searches existing complaints for a likely duplicate.

    A simple deterministic similarity score is used for the
    internship demonstration.
    """

    if db_session is None:
        return None

    complaints = (
        db_session.query(Complaint)
        .order_by(Complaint.id.desc())
        .limit(100)
        .all()
    )

    best_match = None
    best_score = 0

    new_customer = str(
        data.get("customer_name") or ""
    ).strip().lower()

    new_product = str(
        data.get("product_name") or ""
    ).strip().lower()

    new_batch = str(
        data.get("batch_number") or ""
    ).strip().lower()

    new_description = str(
        data.get("description") or ""
    ).strip().lower()

    for complaint in complaints:

        score = 0

        old_customer = str(
            complaint.customer_name or ""
        ).strip().lower()

        old_product = str(
            complaint.product_name or ""
        ).strip().lower()

        old_batch = str(
            complaint.batch_number or ""
        ).strip().lower()

        old_description = str(
            complaint.description or ""
        ).strip().lower()

        if new_customer and old_customer:
            if new_customer == old_customer:
                score += 35

        if new_product and old_product:
            if new_product == old_product:
                score += 30

        if new_batch and old_batch:
            if new_batch == old_batch:
                score += 25

        if (
            new_description
            and old_description
            and (
                new_description[:50] in old_description
                or old_description[:50] in new_description
            )
        ):
            score += 10

        if score > best_score:
            best_score = score
            best_match = complaint

    if not best_match or best_score < 60:
        return None

    return {
        "complaint_id": str(best_match.id),
        "similarity": best_score,
        "customer_name": best_match.customer_name,
        "product_name": best_match.product_name or "",
    }


# ============================================================
# FALLBACK EXTRACTION
# ============================================================

def fallback_extract_from_text(
    text: str,
) -> Dict[str, Any]:
    """
    Small deterministic fallback for development when Groq is
    unavailable.

    This does NOT pretend to be full AI extraction.
    """

    text_lower = text.lower()

    result: Dict[str, Any] = {
        "description": text.strip(),
    }

    # Customer examples.
    customer_patterns = [
        r"(?:reported by|customer|from)\s+([A-Z][A-Za-z0-9 &.-]+)",
    ]

    for pattern in customer_patterns:
        match = re.search(pattern, text)

        if match:
            result["customer_name"] = match.group(1).strip()
            break

    # Product strength.
    strength_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(mg|g|mcg|kg|ml|%)\b",
        text,
        flags=re.IGNORECASE,
    )

    if strength_match:
        result["product_strength"] = (
            f"{strength_match.group(1)} "
            f"{strength_match.group(2)}"
        )

    # Batch.
    batch_match = re.search(
        r"\b(?:batch|lot)(?:\s*(?:number|no\.|#))?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]+)",
        text,
        flags=re.IGNORECASE,
    )

    if batch_match:
        result["batch_number"] = batch_match.group(1)

    # Complaint type.
    if "discolor" in text_lower:
        result["complaint_type"] = "Product Quality"
    elif "foreign matter" in text_lower:
        result["complaint_type"] = "Foreign Matter"
    elif "contamin" in text_lower:
        result["complaint_type"] = "Contamination"
    elif "seal" in text_lower or "packaging" in text_lower:
        result["complaint_type"] = "Packaging Defect"

    # Severity.
    if any(
        term in text_lower
        for term in [
            "contamination",
            "foreign matter",
            "adverse event",
        ]
    ):
        result["initial_severity"] = "Critical"
        result["priority"] = "Urgent"
    elif any(
        term in text_lower
        for term in [
            "discolor",
            "damaged",
            "broken",
            "defect",
        ]
    ):
        result["initial_severity"] = "Major"
        result["priority"] = "High"
    else:
        result["initial_severity"] = "Minor"
        result["priority"] = "Low"

    return normalize_extracted_fields(result)


def fallback_edit_from_text(
    text: str,
) -> Dict[str, Any]:
    """
    Handles common correction phrases if Groq is unavailable.
    """

    result: Dict[str, Any] = {}

    batch_match = re.search(
        r"(?:batch|lot)(?:\s*(?:number|no\.|#))?\s*(?:is|:)?\s*([A-Z0-9][A-Z0-9\-]+)",
        text,
        flags=re.IGNORECASE,
    )

    if batch_match:
        result["batch_number"] = batch_match.group(1)

    quantity_match = re.search(
        r"(?:quantity|affected quantity|affected)\s*(?:is|:)?\s*(\d+(?:\.\d+)?)",
        text,
        flags=re.IGNORECASE,
    )

    if quantity_match:
        result["quantity_affected"] = float(
            quantity_match.group(1)
        )

    return normalize_extracted_fields(result)


# ============================================================
# EXPLANATIONS
# ============================================================

def build_log_explanation(
    extracted: Dict[str, Any],
    risk: Dict[str, Any],
    completeness: Dict[str, Any],
) -> str:

    fields = ", ".join(
        FIELD_LABELS.get(field, field)
        for field in extracted
    )

    if not fields:
        fields = "no reliable structured fields"

    return (
        f"I analyzed the complaint and extracted {fields}. "
        f"The current risk assessment is {risk['overall_risk']} "
        f"with {risk['severity']} severity and "
        f"{risk['priority']} priority. "
        f"The complaint is {completeness['score']}% complete."
    )


def build_edit_explanation(
    changed_fields: Dict[str, Any],
    risk: Dict[str, Any],
) -> str:

    if not changed_fields:
        return (
            "I could not identify a specific complaint field to update. "
            "Please provide the field and its new value."
        )

    fields = ", ".join(
        FIELD_LABELS.get(field, field)
        for field in changed_fields
    )

    return (
        f"I updated {fields} while preserving the other complaint "
        f"information. The updated risk assessment is "
        f"{risk['overall_risk']}."
    )