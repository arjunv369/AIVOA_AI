export const COMPLAINT_SOURCES = [
  "Email",
  "Phone",
  "Web Portal",
  "Sales Representative",
  "Distributor",
  "Healthcare Professional",
  "Other",
] as const;

export const COMPLAINT_TYPES = [
  "Product Quality",
  "Packaging Defect",
  "Labeling Issue",
  "Delivery Issue",
  "Adverse Event",
  "Foreign Matter",
  "Contamination",
  "Stability Issue",
  "Other",
] as const;

export const SEVERITY_LEVELS = [
  "Minor",
  "Major",
  "Critical",
] as const;

export const PRIORITY_LEVELS = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const;

export type ComplaintSource =
  (typeof COMPLAINT_SOURCES)[number];

export type ComplaintType =
  (typeof COMPLAINT_TYPES)[number];

export type Severity =
  (typeof SEVERITY_LEVELS)[number];

export type Priority =
  (typeof PRIORITY_LEVELS)[number];

export type ComplaintStatus =
  | "Pending Triage"
  | "Under Investigation"
  | "Awaiting Response"
  | "Closed";

export interface ComplaintFormData {
  complaint_source: string;
  customer_name: string;
  product_name: string;
  product_strength: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_affected: string;
  complaint_type: string;
  complaint_date: string;
  description: string;
  initial_severity: string;
  priority: string;
}

/**
 * Payload sent to FastAPI.
 */
export interface ComplaintPayload {
  complaint_source?: string;
  customer_name: string;

  product_name?: string;
  product_strength?: string;
  batch_number?: string;

  manufacturing_date?: string;
  expiry_date?: string;

  quantity_affected?: number;

  complaint_type?: string;
  complaint_date?: string;

  description: string;

  initial_severity?: string;
  priority?: string;

  overall_risk?: string;
  confidence_score?: number;
  potential_impact?: string;
  recommended_action?: string;
  reasoning?: string;
  completeness_percentage?: number;
}

export interface ComplaintRecord extends ComplaintPayload {
  id: number | string;

  complaint_id?: string;

  status?: ComplaintStatus;

  created_at?: string;
}

/**
 * Validation errors.
 *
 * `dates` is included because the current ComplaintForm
 * displays a combined manufacturing/expiry date error.
 */
export interface ComplaintErrors {
  complaint_source?: string;
  customer_name?: string;
  product_name?: string;
  product_strength?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity_affected?: string;
  complaint_type?: string;
  complaint_date?: string;
  description?: string;
  initial_severity?: string;
  priority?: string;

  dates?: string;
}

/**
 * Compatibility name used by existing frontend files.
 */
export type FormValidationErrors = ComplaintErrors;

export type ComplaintField = keyof ComplaintFormData;