import type { ComplaintPayload, ComplaintRecord } from '../types/complaint';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // Use current relative origin or default FastAPI dev URL
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Creates a new customer complaint by sending POST /complaints
 */
export const createComplaint = async (
  payload: ComplaintPayload
): Promise<ComplaintRecord> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Server error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data: ComplaintRecord = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to the complaint management server. Check that the FastAPI backend is running on http://127.0.0.1:8000.'
      );
    }
    throw error;
  }
};

/**
 * Retrieves a single complaint by ID (for future GET /complaints/{id})
 */
export const getComplaint = async (id: number): Promise<ComplaintRecord> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch complaint #${id}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(
      error.message || 'Unable to connect to the complaint management server.'
    );
  }
};

/**
 * Updates an existing complaint (for future PUT/PATCH /complaints/{id})
 */
export const updateComplaint = async (
  id: number,
  payload: Partial<ComplaintPayload>
): Promise<ComplaintRecord> => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update complaint #${id}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(
      error.message || 'Unable to connect to the complaint management server.'
    );
  }
};
