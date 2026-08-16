import { API_ENDPOINTS } from "@/config/api";
import type {
  AiToolResponse,
  AIChatResponse,
  CompletenessData,
  DuplicateMatch,
  ExtractedComplaintData,
  RiskAssessment,
} from "@/types/ai";
import type { ComplaintFormData } from "@/types/complaint";
import { post } from "./httpClient";

export interface AiRequest {
  prompt: string;
  current_state?: Partial<ComplaintFormData> | Record<string, unknown>;
}

function normalizeToolResponse(
  response: AiToolResponse,
): {
  extractedData: ExtractedComplaintData;
  riskAssessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicateMatch?: DuplicateMatch;
  explanation?: string;
  changedFields?: Partial<ExtractedComplaintData>;
  updatedFieldsList?: string[];
} {
  return {
    extractedData: response.extracted_data ?? {},
    riskAssessment: response.risk_assessment,
    completeness: response.completeness
      ? {
          ...response.completeness,
          missingFields:
            response.completeness.missingFields ??
            response.completeness.missing ??
            [],
        }
      : undefined,
    duplicateMatch: response.duplicate_match,
    explanation: response.explanation,
    changedFields: response.changed_fields,
    updatedFieldsList: response.updated_fields_list,
  };
}

export async function logComplaintAi(
  request: AiRequest,
) {
  const response = await post<AiToolResponse>(
    API_ENDPOINTS.aiLogComplaint,
    request,
  );
  return normalizeToolResponse(response);
}

export async function editComplaintAi(
  request: AiRequest,
) {
  const response = await post<AiToolResponse>(
    API_ENDPOINTS.aiEditComplaint,
    request,
  );
  return normalizeToolResponse(response);
}

export async function chatWithCopilot(
  request: AiRequest,
): Promise<{
  reply: string;
  extractedData: ExtractedComplaintData;
  riskAssessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicateMatch?: DuplicateMatch;
  toolUsed?: string;
}> {
  const response = await post<AIChatResponse>(
    API_ENDPOINTS.aiChat,
    request,
  );

  return {
    reply: response.reply,
    extractedData: response.extracted_data ?? {},
    riskAssessment: response.risk_assessment,
    completeness: response.completeness
      ? {
          ...response.completeness,
          missingFields:
            response.completeness.missingFields ??
            response.completeness.missing ??
            [],
        }
      : undefined,
    duplicateMatch: response.duplicate_match,
    toolUsed: response.tool_used,
  };
}

export async function assessRisk(
  complaint: Record<string, unknown>,
): Promise<RiskAssessment> {
  return post<RiskAssessment>(
    API_ENDPOINTS.aiRisk,
    complaint,
  );
}

export async function checkDuplicate(
  complaint: Record<string, unknown>,
): Promise<DuplicateMatch> {
  return post<DuplicateMatch>(
    API_ENDPOINTS.aiDuplicate,
    complaint,
  );
}

export async function checkCompleteness(
  complaint: Record<string, unknown>,
): Promise<CompletenessData> {
  return post<CompletenessData>(
    API_ENDPOINTS.aiCompleteness,
    complaint,
  );
}
