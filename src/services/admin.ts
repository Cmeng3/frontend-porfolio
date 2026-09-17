const base =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") +
  "/admin";
export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
export async function adminRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") {
    const csrf = await fetch(base + "/csrf", {
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!csrf.ok)
      throw new AdminError(
        csrf.status,
        "Could not start a secure session. Please reload.",
      );
    headers["X-CSRF-TOKEN"] = (await csrf.json()).token;
  }
  const multipart = body instanceof FormData;
  if (body !== undefined && !multipart)
    headers["Content-Type"] = "application/json";
  const response = await fetch(base + "/" + path, {
    method,
    headers,
    credentials: "include",
    cache: "no-store",
    body:
      body === undefined ? undefined : multipart ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  if (!response.ok)
    throw new AdminError(
      response.status,
      response.status === 419
        ? "Your session expired. Please sign in again."
        : data.message || "The request failed.",
      data.errors || {},
    );
  return data as T;
}
export async function allAdminRecords(resource: string) {
  const records: import("@/types/admin").RecordData[] = [];
  let page = 1;
  for (;;) {
    const result = await adminRequest<import("@/types/admin").AdminPage>(
      resource + "?per_page=100&page=" + page,
    );
    records.push(...result.data);
    if (page >= result.meta.last_page) break;
    page++;
  }
  return records;
}
