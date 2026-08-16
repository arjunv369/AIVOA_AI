import type { ComplaintFormData } from "./complaint";

export type ExtractionStatus =
  | "idle"
  | "uploading"
  | "analyzing"
  | "complete"
  | "completed"
  | "error";

export interface ExtractedComplaintData
  extends Partial<Omit<ComplaintFormData, "quantity_affected">> {
  quantity_affected?: string | number;
}

export interface RiskAssessment {
  overall_risk: string;
  confidence_score: number;
  potential_impact: string;
  recommended_action: string;
  reasoning: string;
}

export type RiskAssessmentData = RiskAssessment;

export interface CompletenessData {
  score: number;
  missing: string[];
  missingFields?: string[];
}

export type CompletenessResult = CompletenessData;
export type DuplicateComplaintMatch = DuplicateMatch;

export interface DuplicateMatch {
  found: boolean;
  complaint_id?: string | null;
  similarity: number;
  reason: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickQuestions?: string[];
  timestamp?: string;
  extractedData?: ExtractedComplaintData;
}

export type AIChatMessage = AIMessage;

export interface AIChatResponse {
  reply: string;
  extracted_data?: ExtractedComplaintData;
  tool_used?: string;
  risk_assessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicate_match?: DuplicateMatch;
}

export interface AiToolResponse {
  tool_used: string;
  extracted_data: ExtractedComplaintData;
  changed_fields?: Partial<ExtractedComplaintData>;
  updated_fields_list?: string[];
  risk_assessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicate_match?: DuplicateMatch;
  explanation?: string;
}
