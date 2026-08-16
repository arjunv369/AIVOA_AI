import { API_ENDPOINTS } from "@/config/api";
import type {
  AiToolResponse,
  CompletenessData,
  DuplicateMatch,
  ExtractedComplaintData,
  RiskAssessment,
} from "@/types/ai";
import { post } from "@/services/httpClient";

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
}

export interface UploadedFileResponse {
  filename: string;
  tool_used: string;
  extracted_data: ExtractedComplaintData;
  risk_assessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicate_match?: DuplicateMatch;
  explanation?: string;
}

export interface DocumentAiResult {
  filename: string;
  extractedData: ExtractedComplaintData;
  riskAssessment?: RiskAssessment;
  completeness?: CompletenessData;
  duplicateMatch?: DuplicateMatch;
  explanation?: string;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".txt",
  ".eml",
] as const;

function toDocumentResult(
  response: UploadedFileResponse | AiToolResponse,
  filename: string,
): DocumentAiResult {
  return {
    filename,
    extractedData: response.extracted_data ?? {},
    riskAssessment: response.risk_assessment,
    completeness: response.completeness,
    duplicateMatch: response.duplicate_match,
    explanation: response.explanation,
  };
}

export async function extractDocumentAi(
  file: File,
): Promise<DocumentAiResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File is larger than the 10 MB limit.");
  }

  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

  if (!ACCEPTED_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_EXTENSIONS)[number],
  )) {
    throw new Error("Supported files: PDF, DOCX, TXT, and EML.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await post<UploadedFileResponse>(
    API_ENDPOINTS.aiExtractDocument,
    formData,
  );

  return toDocumentResult(response, file.name);
}

export async function uploadComplaintDocument(
  file: File,
): Promise<DocumentAiResult> {
  return extractDocumentAi(file);
}
