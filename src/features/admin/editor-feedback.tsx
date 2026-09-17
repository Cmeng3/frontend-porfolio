import { AdminError } from "@/services/admin";
export function editorError(error: unknown): string {
  if (error instanceof AdminError && Object.keys(error.errors).length)
    return Object.values(error.errors).flat().join(" ");
  return error instanceof Error
    ? error.message
    : "Could not save. Please try again.";
}
export function SaveBar({
  busy,
  dirty,
  message,
  label,
}: {
  busy: boolean;
  dirty: boolean;
  message: string;
  label: string;
}) {
  return (
    <div className="editor-savebar">
      <button className="button" disabled={busy || !dirty}>
        {busy ? "Saving…" : label}
      </button>
      <span className="muted small">
        {dirty ? "Unsaved changes" : "Up to date"}
      </span>
      <p role="status">{message}</p>
    </div>
  );
}
