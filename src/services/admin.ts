const base =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1")
    .trim()
    .replace(/\/+$/, "") + "/admin";
export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
async function readAdminJson(response: Response, path: string) {
  const message = `The API returned an unexpected response for ${path} (HTTP ${response.status}). Please try again. If this continues, check the backend deployment logs.`;
  if (!response.headers.get("content-type")?.includes("json")) {
    throw new AdminError(response.status, message);
  }
  try {
    return await response.json();
  } catch {
    throw new AdminError(response.status, message);
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
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!csrf.ok)
      throw new AdminError(
        csrf.status,
        "Could not start a secure session. Please reload.",
      );
    const session = await readAdminJson(csrf, "csrf");
    if (typeof session?.token !== "string" || !session.token) {
      throw new AdminError(
        csrf.status,
        "The API did not return a session token. Please try again.",
      );
    }
    headers["X-CSRF-TOKEN"] = session.token;
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
  if (
    path !== "login" &&
    [401, 403, 419].includes(response.status) &&
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(new Event("admin-session-expired"));
  }
  const data = await readAdminJson(response, path);
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
