export function resumeFileUrl(id: number, download = false) {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
  ).replace(/\/$/, "");
  return `${base}/resumes/${id}/${download ? "download" : "file"}`;
}
