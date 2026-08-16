import {
  API_ENDPOINTS,
  API_BASE_URL,
  CONNECTION_ERROR_MESSAGE,
} from "@/config/api";

import { ApiError } from "@/services/httpClient";

import type {
  ExtractedComplaintData,
  RiskAssessmentData,
  CompletenessData,
  DuplicateComplaintMatch,
} from "@/types/ai";

import type { ComplaintPayload } from "@/types/complaint";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = [
  "pdf",
  "docx",
  "txt",
  "eml",
] as const;

export function describeFile(file: File) {
  const extension =
    file.name.split(".").pop()?.toLowerCase() ?? "";

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension,
  };
}

export function validateFile(file: File): string | null {
  const { extension } = describeFile(file);

  if (
    !ACCEPTED_EXTENSIONS.includes(
      extension as (typeof ACCEPTED_EXTENSIONS)[number],
    )
  ) {
    return "Unsupported format. Upload a PDF, DOCX, TXT or EML file.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File exceeds the 10 MB maximum size.";
  }

  return null;
}

/**
 * Upload a document to the backend.
 */
export async function uploadComplaintDocument(
  file: File,
): Promise<{ document_id?: string }> {
  const form = new FormData();

  form.append("file", file);

  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.documentUpload}`,
      {
        method: "POST",
        body: form,
      },
    );

    if (!response.ok) {
      throw new ApiError(
        `Upload failed with status ${response.status}.`,
        response.status,
      );
    }

    return (await response.json()) as {
      document_id?: string;
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("[documentApi] upload failed", error);

    throw new ApiError(
      CONNECTION_ERROR_MESSAGE,
      0,
      true,
    );
  }
}

/**
 * Runs the actual AI document extraction endpoint.
 *
 * FastAPI:
 * POST /api/ai/extract-document
 */
export async function extractDocumentAi(
  file: File,
): Promise<{
  extractedData: ExtractedComplaintData;
  riskAssessment?: RiskAssessmentData;
  completeness?: CompletenessData;
  duplicateMatch?: DuplicateComplaintMatch;
  explanation?: string;
}> {
  const form = new FormData();

  form.append("file", file);

  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.aiExtractDocument}`,
      {
        method: "POST",
        body: form,
      },
    );

    if (!response.ok) {
      throw new ApiError(
        `AI document extraction failed with status ${response.status}.`,
        response.status,
      );
    }

    const result = (await response.json()) as {
      extracted_data?: Partial<ComplaintPayload>;
      risk_assessment?: RiskAssessmentData;
      completeness?: CompletenessData;
      duplicate_match?: DuplicateComplaintMatch;
      explanation?: string;
    };

    const extractedData: ExtractedComplaintData = {
      ...result.extracted_data,
      quantity_affected:
        result.extracted_data?.quantity_affected === undefined
          ? undefined
          : String(result.extracted_data.quantity_affected),
    };

    return {
      extractedData,
      riskAssessment: result.risk_assessment,
      completeness: result.completeness,
      duplicateMatch: result.duplicate_match,
      explanation: result.explanation,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "[documentApi] AI extraction failed",
      error,
    );

    throw new ApiError(
      CONNECTION_ERROR_MESSAGE,
      0,
      true,
    );
  }
}