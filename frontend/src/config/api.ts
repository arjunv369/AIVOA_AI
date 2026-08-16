/**
 * Centralized API configuration.
 */

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ??
  "http://127.0.0.1:8000";

export const USE_MOCK_FALLBACK =
  (import.meta.env["VITE_USE_MOCK_API"] as string | undefined) !== "false";

export const API_ENDPOINTS = {
  complaints: "/complaints",
  complaint: (id: string | number) => `/complaints/${id}`,

  aiLogComplaint: "/api/ai/log-complaint",
  aiEditComplaint: "/api/ai/edit-complaint",
  aiExtractDocument: "/api/ai/extract-document",
  aiChat: "/api/ai/chat",
  aiRisk: "/api/ai/risk-assessment",
  aiDuplicate: "/api/ai/duplicate-detection",
  aiCompleteness: "/api/ai/completeness",

  documentUpload: "/documents/upload",
} as const;

export const REQUEST_TIMEOUT_MS = 15000;

export const CONNECTION_ERROR_MESSAGE =
  "Unable to connect to the complaint management server. Check that the FastAPI backend is running.";