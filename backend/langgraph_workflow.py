from typing import Any, Dict, Optional, TypedDict

try:
    from langgraph.graph import END, StateGraph

    LANGGRAPH_AVAILABLE = True

except Exception as exc:
    print(f"[LangGraph] LangGraph unavailable: {exc}")

    StateGraph = None
    END = None
    LANGGRAPH_AVAILABLE = False


from ai_service import (
    check_duplicates_in_db,
    compute_completeness,
    compute_risk_assessment,
    run_ai_document_extraction,
    run_ai_edit_complaint,
    run_ai_log_complaint,
)


# ============================================================
# WORKFLOW STATE
# ============================================================


class ComplaintWorkflowState(TypedDict, total=False):
    prompt: str

    current_state: Optional[Dict[str, Any]]

    file_bytes: Optional[bytes]

    filename: Optional[str]

    db_session: Any

    tool_type: str

    extracted_data: Dict[str, Any]

    changed_fields: Optional[Dict[str, Any]]

    updated_fields_list: Optional[list]

    risk_assessment: Optional[Dict[str, Any]]

    completeness: Optional[Dict[str, Any]]

    duplicate_match: Optional[Dict[str, Any]]

    explanation: str


# ============================================================
# NODE 1 — PARSE / ROUTE INPUT
# ============================================================


def node_parse_input(
    state: ComplaintWorkflowState,
) -> ComplaintWorkflowState:

    """
    Determines which AI tool should process the request.

    Tools:
        1. LOG_COMPLAINT
        2. EDIT_COMPLAINT
        3. DOCUMENT_EXTRACTION
    """

    prompt = state.get("prompt", "") or ""

    current_state = (
        state.get("current_state")
        or {}
    )

    lower = prompt.lower()

    # --------------------------------------------------------
    # Document extraction has highest priority.
    # --------------------------------------------------------

    if (
        state.get("file_bytes")
        and state.get("filename")
    ):
        state["tool_type"] = "DOCUMENT_EXTRACTION"

        return state

    # --------------------------------------------------------
    # Detect edit requests.
    # --------------------------------------------------------

    edit_words = [
        "update",
        "change",
        "correct",
        "edit",
        "replace",
        "modify",
        "fix",
    ]

    complaint_field_words = [
        "batch",
        "quantity",
        "customer",
        "product",
        "severity",
        "priority",
        "date",
        "description",
        "source",
    ]

    has_existing_complaint = bool(
        current_state.get("customer_name")
        or current_state.get("product_name")
        or current_state.get("batch_number")
    )

    has_edit_language = any(
        word in lower
        for word in edit_words
    )

    has_field_language = any(
        word in lower
        for word in complaint_field_words
    )

    if (
        has_existing_complaint
        and has_edit_language
        and has_field_language
    ):
        state["tool_type"] = "EDIT_COMPLAINT"

        return state

    # --------------------------------------------------------
    # Default = Log Complaint.
    # --------------------------------------------------------

    state["tool_type"] = "LOG_COMPLAINT"

    return state


# ============================================================
# NODE 2 — EXECUTE AI TOOL
# ============================================================


def node_execute_tool(
    state: ComplaintWorkflowState,
) -> ComplaintWorkflowState:

    tool_type = state.get(
        "tool_type",
        "LOG_COMPLAINT",
    )

    prompt = state.get(
        "prompt",
        "",
    ) or ""

    current_state = (
        state.get("current_state")
        or {}
    )

    # --------------------------------------------------------
    # DOCUMENT EXTRACTION
    # --------------------------------------------------------

    if tool_type == "DOCUMENT_EXTRACTION":

        file_bytes = (
            state.get("file_bytes")
            or b""
        )

        filename = (
            state.get("filename")
            or "document.txt"
        )

        result = run_ai_document_extraction(
            file_bytes=file_bytes,
            filename=filename,
        )

    # --------------------------------------------------------
    # EDIT COMPLAINT
    # --------------------------------------------------------

    elif tool_type == "EDIT_COMPLAINT":

        result = run_ai_edit_complaint(
            prompt=prompt,
            current_state=current_state,
        )

    # --------------------------------------------------------
    # LOG COMPLAINT
    # --------------------------------------------------------

    else:

        result = run_ai_log_complaint(
            prompt=prompt,
            current_state=current_state,
        )

    # --------------------------------------------------------
    # Copy result into workflow state.
    # --------------------------------------------------------

    state["extracted_data"] = (
        result.get("extracted_data")
        or {}
    )

    state["changed_fields"] = (
        result.get("changed_fields")
    )

    state["updated_fields_list"] = (
        result.get("updated_fields_list")
    )

    state["risk_assessment"] = (
        result.get("risk_assessment")
    )

    state["completeness"] = (
        result.get("completeness")
    )

    state["explanation"] = (
        result.get("explanation")
        or "Complaint processing completed."
    )

    return state


# ============================================================
# NODE 3 — ENRICH ANALYSIS
# ============================================================


def node_enrich_analysis(
    state: ComplaintWorkflowState,
) -> ComplaintWorkflowState:

    """
    Calculates:
        - Risk
        - Completeness
        - Duplicate detection
    """

    current_state = (
        state.get("current_state")
        or {}
    )

    extracted = (
        state.get("extracted_data")
        or {}
    )

    # Merge current complaint with new AI fields.
    combined = dict(current_state)

    combined.update(extracted)

    # --------------------------------------------------------
    # Risk
    # --------------------------------------------------------

    state["risk_assessment"] = (
        compute_risk_assessment(combined)
    )

    # --------------------------------------------------------
    # Completeness
    # --------------------------------------------------------

    state["completeness"] = (
        compute_completeness(combined)
    )

    # --------------------------------------------------------
    # Duplicate detection
    # --------------------------------------------------------

    db_session = state.get(
        "db_session"
    )

    if db_session is not None:

        state["duplicate_match"] = (
            check_duplicates_in_db(
                combined,
                db_session,
            )
        )

    else:

        state["duplicate_match"] = None

    return state


# ============================================================
# BUILD LANGGRAPH
# ============================================================


def build_langgraph_pipeline():

    if not LANGGRAPH_AVAILABLE:
        return None

    try:

        workflow = StateGraph(
            ComplaintWorkflowState
        )

        workflow.add_node(
            "parse_input",
            node_parse_input,
        )

        workflow.add_node(
            "execute_tool",
            node_execute_tool,
        )

        workflow.add_node(
            "enrich_analysis",
            node_enrich_analysis,
        )

        workflow.set_entry_point(
            "parse_input"
        )

        workflow.add_edge(
            "parse_input",
            "execute_tool",
        )

        workflow.add_edge(
            "execute_tool",
            "enrich_analysis",
        )

        workflow.add_edge(
            "enrich_analysis",
            END,
        )

        return workflow.compile()

    except Exception as exc:

        print(
            f"[LangGraph] Failed to build workflow: {exc}"
        )

        return None


langgraph_app = build_langgraph_pipeline()


# ============================================================
# PUBLIC EXECUTION FUNCTION
# ============================================================


def execute_complaint_pipeline(
    prompt: str = "",
    current_state: Optional[Dict[str, Any]] = None,
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
    db_session=None,
) -> Dict[str, Any]:

    """
    Main entry point used by FastAPI.

    If LangGraph is installed and working:
        LangGraph executes the workflow.

    If LangGraph fails:
        the same nodes execute sequentially.

    This makes development much easier because a LangGraph
    installation problem does not completely break the API.
    """

    initial_state: ComplaintWorkflowState = {
        "prompt": prompt or "",
        "current_state": current_state or {},
        "file_bytes": file_bytes,
        "filename": filename,
        "db_session": db_session,
    }

    # --------------------------------------------------------
    # LangGraph execution
    # --------------------------------------------------------

    if langgraph_app is not None:

        try:

            output = langgraph_app.invoke(
                initial_state
            )

            return dict(output)

        except Exception as exc:

            print(
                f"[LangGraph] Execution warning: {exc}"
            )

    # --------------------------------------------------------
    # Sequential fallback
    # --------------------------------------------------------

    print(
        "[LangGraph] Using sequential fallback workflow."
    )

    state = node_parse_input(
        initial_state
    )

    state = node_execute_tool(
        state
    )

    state = node_enrich_analysis(
        state
    )

    return dict(state)