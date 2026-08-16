import {
  API_BASE_URL,
  CONNECTION_ERROR_MESSAGE,
  REQUEST_TIMEOUT_MS,
} from "../config/api";

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

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Generic JSON request helper for FastAPI.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
  } = options;

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  if (signal) {
    signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true },
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        method,

        headers: {
          Accept: "application/json",

          ...(body !== undefined
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),
        },

        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),

        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const detail =
        await safeReadDetail(response);

      throw new ApiError(
        detail ??
          `Request failed with status ${response.status}.`,
        response.status,
        false,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      `[api] ${method} ${path} failed`,
      error,
    );

    throw new ApiError(
      CONNECTION_ERROR_MESSAGE,
      0,
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function safeReadDetail(
  response: Response,
): Promise<string | null> {
  try {
    const data = (await response.json()) as {
      detail?: unknown;
      message?: unknown;
    };

    const detail =
      data.detail ?? data.message;

    if (typeof detail === "string") {
      return detail;
    }

    return null;
  } catch {
    return null;
  }
}

export function toUserMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  console.error(
    "[api] unexpected error",
    error,
  );

  return (
    "Something went wrong while contacting the server. Please try again."
  );
}