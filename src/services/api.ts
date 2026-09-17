import type { ApiResponse, HealthStatus } from "@/types/api";

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super("The API request could not be completed.");
    this.name = "ApiError";
  }
}

// Public reads only. Authenticated requests will have a separate flow.
export async function getApi<T>(path: string): Promise<ApiResponse<T>> {
  const baseUrl =
    (typeof window === "undefined" ? process.env.API_URL : undefined) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api/v1";
  const response = await fetch(
    baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, ""),
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<ApiResponse<T>>;
}
export const getHealth = () => getApi<HealthStatus>("health");
