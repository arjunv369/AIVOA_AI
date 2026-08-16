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

export type ComplaintPayload = Partial<Omit<ComplaintFormData, "quantity_affected">> & {
  customer_name: string;
  description: string;
  quantity_affected?: number;
  status?: string;
  overall_risk?: string;
  confidence_score?: number;
  potential_impact?: string;
  recommended_action?: string;
  reasoning?: string;
  completeness_percentage?: number;
}

export interface ComplaintRecord {
  id: number;
  complaint_id: string;
  complaint_source?: string | null;
  customer_name: string;
  product_name?: string | null;
  product_strength?: string | null;
  batch_number?: string | null;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  quantity_affected?: number | null;
  complaint_type?: string | null;
  complaint_date?: string | null;
  description: string;
  initial_severity?: string | null;
  priority?: string | null;
  status?: string | null;
  overall_risk?: string | null;
  confidence_score?: number | null;
  potential_impact?: string | null;
  recommended_action?: string | null;
  reasoning?: string | null;
  completeness_percentage?: number | null;
  created_at: string;
}

export type ComplaintErrors = Partial<
  Record<keyof ComplaintFormData, string>
>;

export type FormValidationErrors = ComplaintErrors;

export type FieldSourceBadge =
  | "Awaiting AI extraction..."
  | "AI extracted"
  | "User entered"
  | "Updated by AI";

export interface ComplaintFieldBadges {
  [field: string]: FieldSourceBadge;
}
