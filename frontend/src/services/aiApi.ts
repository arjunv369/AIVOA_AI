import type { ComplaintPayload } from '../types/complaint';
import type { RiskAssessmentData, CompletenessData, DuplicateComplaintMatch } from '../types/ai';
import { parseCopilotMessage } from '../utils/aiParser';
import { API_BASE_URL } from './complaintApi';

export interface AiLogResponse {
  tool_used: string;
  extracted_data: Partial<ComplaintPayload>;
  risk_assessment?: RiskAssessmentData;
  completeness?: CompletenessData;
  duplicate_match?: DuplicateComplaintMatch;
  explanation: string;
}

export interface AiEditResponse {
  tool_used: string;
  extracted_data: Partial<ComplaintPayload>;
  changed_fields?: Partial<ComplaintPayload>;
  updated_fields_list?: string[];
  risk_assessment?: RiskAssessmentData;
  completeness?: CompletenessData;
  duplicate_match?: DuplicateComplaintMatch;
  explanation: string;
}

/**
 * Real API call to FastAPI backend for Tool 1: Log Complaint Tool
 */
export const logComplaintAi = async (
  userPrompt: string,
  currentState?: ComplaintPayload
): Promise<AiLogResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/log-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, current_state: currentState }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        tool_used: data.tool_used,
        extracted_data: data.extracted_data,
        risk_assessment: data.risk_assessment
          ? {
              overallRisk: data.risk_assessment.overall_risk,
              severity: data.risk_assessment.severity,
              priority: data.risk_assessment.priority,
              confidenceScore: data.risk_assessment.confidence_score,
              potentialImpact: data.risk_assessment.potential_impact,
            }
          : undefined,
        completeness: data.completeness
          ? {
              percentage: data.completeness.percentage,
              missingFields: data.completeness.missing_fields,
            }
          : undefined,
        duplicate_match: data.duplicate_match
          ? {
              complaintId: data.duplicate_match.complaint_id,
              customerName: data.duplicate_match.customer_name,
              productName: data.duplicate_match.product_name,
              similarityScore: data.duplicate_match.similarity_score,
              date: data.duplicate_match.date,
              status: data.duplicate_match.status,
            }
          : undefined,
        explanation: data.explanation,
      };
    }
  } catch (err) {
    console.warn('Backend /api/ai/log-complaint warning:', err);
  }

  // Client-side fallback if server fails
  const local = parseCopilotMessage(userPrompt, currentState || ({} as any));
  return {
    tool_used: 'LOG_COMPLAINT_TOOL',
    extracted_data: local.extractedData,
    risk_assessment: local.riskAssessment,
    explanation: local.explanation,
  };
};

/**
 * Real API call to FastAPI backend for Tool 2: Edit Complaint Tool
 */
export const editComplaintAi = async (
  userPrompt: string,
  currentState: ComplaintPayload
): Promise<AiEditResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/edit-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, current_state: currentState }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        tool_used: data.tool_used,
        extracted_data: data.extracted_data,
        changed_fields: data.changed_fields || data.extracted_data,
        updated_fields_list: data.updated_fields_list,
        risk_assessment: data.risk_assessment
          ? {
              overallRisk: data.risk_assessment.overall_risk,
              severity: data.risk_assessment.severity,
              priority: data.risk_assessment.priority,
              confidenceScore: data.risk_assessment.confidence_score,
              potentialImpact: data.risk_assessment.potential_impact,
            }
          : undefined,
        completeness: data.completeness
          ? {
              percentage: data.completeness.percentage,
              missingFields: data.completeness.missing_fields,
            }
          : undefined,
        duplicate_match: data.duplicate_match
          ? {
              complaintId: data.duplicate_match.complaint_id,
              customerName: data.duplicate_match.customer_name,
              productName: data.duplicate_match.product_name,
              similarityScore: data.duplicate_match.similarity_score,
              date: data.duplicate_match.date,
              status: data.duplicate_match.status,
            }
          : undefined,
        explanation: data.explanation,
      };
    }
  } catch (err) {
    console.warn('Backend /api/ai/edit-complaint warning:', err);
  }

  const local = parseCopilotMessage(userPrompt, currentState);
  return {
    tool_used: 'EDIT_COMPLAINT_TOOL',
    extracted_data: local.extractedData,
    changed_fields: local.extractedData,
    updated_fields_list: local.updatedFieldsList,
    risk_assessment: local.riskAssessment,
    explanation: local.explanation,
  };
};
