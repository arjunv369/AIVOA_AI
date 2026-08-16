import { API_ENDPOINTS } from "@/config/api";
import type {
  ComplaintPayload,
  ComplaintRecord,
} from "@/types/complaint";
import { get, post, put } from "./httpClient";

export async function listComplaints(): Promise<ComplaintRecord[]> {
  return get<ComplaintRecord[]>(API_ENDPOINTS.complaints);
}

export async function getComplaint(
  id: string | number,
): Promise<ComplaintRecord> {
  return get<ComplaintRecord>(API_ENDPOINTS.complaint(id));
}

export async function createComplaint(
  payload: ComplaintPayload,
): Promise<ComplaintRecord> {
  return post<ComplaintRecord>(API_ENDPOINTS.complaints, payload);
}

export async function updateComplaint(
  id: string | number,
  payload: ComplaintPayload,
): Promise<ComplaintRecord> {
  return put<ComplaintRecord>(
    API_ENDPOINTS.complaint(id),
    payload,
  );
}
