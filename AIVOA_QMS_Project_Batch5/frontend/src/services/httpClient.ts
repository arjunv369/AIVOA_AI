import {
  API_BASE_URL,
  CONNECTION_ERROR_MESSAGE,
  REQUEST_TIMEOUT_MS,
} from "@/config/api";

export class ApiError extends Error {
  status: number;
  isConnectionError: boolean;

  constructor(
    message: string,
    status = 0,
    isConnectionError = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isConnectionError = isConnectionError;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const body = await parseResponse(response);

    if (!response.ok) {
      let message = `Request failed with status ${response.status}.`;

      if (typeof body === "object" && body !== null && "detail" in body) {
        const detail = (body as { detail?: unknown }).detail;
        if (typeof detail === "string") {
          message = detail;
        }
      } else if (typeof body === "string" && body.trim()) {
        message = body;
      }

      throw new ApiError(message, response.status);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The server request timed out.",
        408,
        true,
      );
    }

    throw new ApiError(CONNECTION_ERROR_MESSAGE, 0, true);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return CONNECTION_ERROR_MESSAGE;
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function post<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export async function put<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
