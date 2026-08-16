export type ExtractionStatus =
  | "idle"
  | "uploading"
  | "analyzing"
  | "complete"
  | "completed"
  | "error";

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  extension: string;
}

/**
 * Data extracted from AI.
 *
 * The backend can return numeric quantity values while
 * the frontend form normally stores quantity as text.
 */
export interface ExtractedComplaintData {
  complaint_source?: string;
  customer_name?: string;
  product_name?: string;
  product_strength?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;

  quantity_affected?: number | string;

  complaint_type?: string;
  complaint_date?: string;
  description?: string;
  initial_severity?: string;
  priority?: string;
}

/**
 * AI risk assessment.
 *
 * Both snake_case and camelCase names are supported because
 * the FastAPI backend uses snake_case while some frontend
 * components use camelCase.
 */
export interface RiskAssessment {
  overall_risk?: string;
  overallRisk?: string;

  severity?: string;
  priority?: string;

  confidence?: number;
  confidenceScore?: number;

  potential_impact?: string;
  potentialImpact?: string;
}

/**
 * Compatibility alias.
 */
export type RiskAssessmentData = RiskAssessment;

/**
 * AI chat message.
 *
 * Both role and sender are supported by the existing UI.
 */
export interface AIMessage {
  id: string;

  role?: "assistant" | "user";
  sender?: "assistant" | "user";

  content: string;
  quickQuestions?: string[];

  createdAt?: string;
  timestamp?: string;

  pending?: boolean;
}

/**
 * Compatibility alias.
 */
export type AIChatMessage = AIMessage;

/**
 * Completeness result.
 *
 * Backend terminology and existing frontend terminology
 * are both supported.
 */
export interface CompletenessData {
  percentage: number;
  missingFields: string[];

  score?: number;
  missing?: string[];
}

/**
 * Duplicate complaint information.
 *
 * Supports both backend snake_case and existing frontend
 * camelCase property names.
 */
export interface DuplicateMatch {
  complaint_id?: string | number;
  complaintId?: string | number;

  similarity?: number;
  similarityScore?: number;

  customer_name?: string;
  customerName?: string;

  product_name?: string;
  productName?: string;

  date?: string;
  status?: string;
}

/**
 * Compatibility alias.
 */
export type DuplicateComplaintMatch = DuplicateMatch;

export interface ExtractionResult {
  fields: ExtractedComplaintData;

  risk?: RiskAssessment;
  recommendations?: string[];

  completeness?: CompletenessData;

  duplicates?: DuplicateMatch[];

  summary?: string;
}

export interface AIExtractionResponse {
  extractedData: ExtractedComplaintData;

  riskAssessment?: RiskAssessment;

  completeness?: CompletenessData;

  duplicateMatch?: DuplicateMatch;

  explanation?: string;
}

export type WorkflowStep =
  | "upload"
  | "extraction"
  | "review"
  | "risk"
  | "save";
