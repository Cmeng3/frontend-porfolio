import type { ApiResponse, HealthStatus } from "@/types/api";

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super("The API request could not be completed.");
    this.name = "ApiError";
  }
}

// Public reads only. Authenticated requests will have a separate flow.
export async function getApi<T>(path: string): Promise<ApiResponse<T>> {
  // A sleeping Render instance can take longer than ten seconds to wake.
  // Bound the wait and never retry automatically (which would add more load).
  const configuredTimeout = Number(process.env.API_REQUEST_TIMEOUT_MS || 60000);
  const timeout = Number.isFinite(configuredTimeout)
    ? Math.floor(Math.min(60000, Math.max(1000, configuredTimeout)))
    : 60000;
  const baseUrl =
    (typeof window === "undefined" ? process.env.API_URL : undefined) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api/v1";
  const response = await fetch(
    baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, ""),
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeout),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<ApiResponse<T>>;
}
export const getHealth = () => getApi<HealthStatus>("health");
