import type {
  ClaimReview,
  ClaimsListResponse,
  HealthResponse,
} from "./api-types";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error.trim()) {
        message = payload.error;
      }
    } catch {
      // Keep the status-based message when the server response is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function getHealth(): Promise<HealthResponse> {
  return getJson<HealthResponse>("/api/health");
}

export function getClaimIds(): Promise<ClaimsListResponse> {
  return getJson<ClaimsListResponse>("/api/claims");
}

export function getClaimReview(claimId: string): Promise<ClaimReview> {
  return getJson<ClaimReview>(
    `/api/claims/${encodeURIComponent(claimId)}/review`,
  );
}