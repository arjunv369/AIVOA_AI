from typing import Any, Optional, TypedDict

try:
    from langgraph.graph import END, StateGraph
except Exception:
    END = None
    StateGraph = None

from ai_service import (
    compute_completeness,
    compute_risk_assessment,
    run_ai_document_extraction,
    run_ai_edit_complaint,
    run_ai_log_complaint,
)


class ComplaintWorkflowState(TypedDict, total=False):
    prompt: str
    current_state: Optional[dict[str, Any]]
    file_bytes: Optional[bytes]
    filename: Optional[str]
    tool_type: str
    extracted_data: dict[str, Any]
    changed_fields: Optional[dict[str, Any]]
    updated_fields_list: Optional[list[str]]
    risk_assessment: Optional[dict[str, Any]]
    completeness: Optional[dict[str, Any]]
    explanation: str


def node_parse_input(state: ComplaintWorkflowState) -> ComplaintWorkflowState:
    prompt = state.get("prompt", "")
    current_state = state.get("current_state") or {}
    lower = prompt.lower()

    if state.get("file_bytes") and state.get("filename"):
        tool_type = "DOCUMENT_EXTRACTION"
    elif current_state and any(
        word in lower
        for word in ("update", "change", "correct", "batch", "quantity", "replace")
    ):
        tool_type = "EDIT_COMPLAINT"
    else:
        tool_type = "LOG_COMPLAINT"

    state["tool_type"] = tool_type
    return state


def node_execute_tool(state: ComplaintWorkflowState) -> ComplaintWorkflowState:
    tool_type = state.get("tool_type", "LOG_COMPLAINT")
    prompt = state.get("prompt", "")
    current_state = state.get("current_state") or {}

    if tool_type == "DOCUMENT_EXTRACTION":
        result = run_ai_document_extraction(
            state.get("file_bytes") or b"",
            state.get("filename") or "document.pdf",
        )
        state["extracted_data"] = result["extracted_data"]
        state["explanation"] = result["explanation"]
    elif tool_type == "EDIT_COMPLAINT":
        result = run_ai_edit_complaint(prompt, current_state)
        state["extracted_data"] = result["extracted_data"]
        state["changed_fields"] = result.get("changed_fields")
        state["updated_fields_list"] = result.get("updated_fields_list")
        state["explanation"] = result["explanation"]
    else:
        result = run_ai_log_complaint(prompt, current_state)
        state["extracted_data"] = result["extracted_data"]
        state["explanation"] = result["explanation"]

    return state


def node_enrich_analysis(state: ComplaintWorkflowState) -> ComplaintWorkflowState:
    data = state.get("extracted_data") or {}
    state["risk_assessment"] = compute_risk_assessment(data)
    state["completeness"] = compute_completeness(data)
    return state


def build_langgraph_pipeline():
    if StateGraph is None or END is None:
        return None

    workflow = StateGraph(ComplaintWorkflowState)
    workflow.add_node("parse_input", node_parse_input)
    workflow.add_node("execute_tool", node_execute_tool)
    workflow.add_node("enrich_analysis", node_enrich_analysis)

    workflow.set_entry_point("parse_input")
    workflow.add_edge("parse_input", "execute_tool")
    workflow.add_edge("execute_tool", "enrich_analysis")
    workflow.add_edge("enrich_analysis", END)

    return workflow.compile()


langgraph_app = build_langgraph_pipeline()


def execute_complaint_pipeline(
    prompt: str = "",
    current_state: Optional[dict[str, Any]] = None,
    file_bytes: Optional[bytes] = None,
    filename: Optional[str] = None,
) -> dict[str, Any]:
    initial_state: ComplaintWorkflowState = {
        "prompt": prompt,
        "current_state": current_state,
        "file_bytes": file_bytes,
        "filename": filename,
    }

    if langgraph_app is not None:
        try:
            return dict(langgraph_app.invoke(initial_state))
        except Exception as exc:
            print(f"LangGraph warning: {exc}")

    state = node_parse_input(initial_state)
    state = node_execute_tool(state)
    state = node_enrich_analysis(state)
    return dict(state)
