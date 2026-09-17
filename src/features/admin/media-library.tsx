"use client";
import { useEffect, useState, type FormEvent } from "react";
import { adminRequest } from "@/services/admin";
import type { AdminPage, RecordData } from "@/types/admin";
import { MediaImage, ExternalLink } from "@/components/ui/content-ui";
import type { Media } from "@/types/content";
import { PdfPreview } from "@/components/ui/pdf-preview";
export function MediaLibrary() {
  const [result, setResult] = useState<AdminPage | null>(null);
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    adminRequest<AdminPage>("media?page=" + page)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((e) => {
        if (active) setStatus(e.message);
      });
    return () => {
      active = false;
    };
  }, [page, version]);
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await adminRequest("media", "POST", new FormData(form));
      form.reset();
      setStatus("File uploaded.");
      setVersion((v) => v + 1);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: RecordData) {
    if (!window.confirm("Permanently delete this file?")) return;
    try {
      await adminRequest("media/" + item.id, "DELETE");
      setVersion((v) => v + 1);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Delete failed.");
    }
  }
  async function alt(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    try {
      await adminRequest(
        "media/" + id,
        "PATCH",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setStatus("Alt text saved.");
      setVersion((v) => v + 1);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed.");
    }
  }
  return (
    <section>
      <h1>Media library</h1>
      <p className="muted">
        JPEG, PNG, WEBP, or PDF. Maximum 10 MB. Files use the configured local
        or S3 storage disk.
      </p>
      <form className="filter-bar" onSubmit={upload}>
        <label>
          File
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
          />
        </label>
        <label>
          Folder
          <select name="folder">
            {[
              "profile",
              "branding",
              "projects",
              "blog",
              "certificates",
              "education",
              "resume",
            ].map((f) => (
              <option value={"portfolio/" + f} key={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label>
          Alt text
          <input name="alt_text" maxLength={255} />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Uploading…" : "Upload"}
        </button>
      </form>
      <p role="status">{status}</p>
      <div className="card-grid">
        {result?.data.map((item) => (
          <article className="content-card card-body" key={item.id}>
            {String(item.mime_type).startsWith("image/") ? (
              <MediaImage media={item as unknown as Media} />
            ) : (
              <PdfPreview
                url={String(item.url)}
                title={String(item.original_name)}
              />
            )}
            <h2>{String(item.original_name)}</h2>
            <p className="small">
              #{item.id} · {Math.ceil(Number(item.size) / 1024)} KB
            </p>
            <ExternalLink href={String(item.url)}>Open file</ExternalLink>
            <label>
              File URL
              <input
                readOnly
                value={String(item.url)}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <form onSubmit={(e) => alt(e, item.id)}>
              <label>
                Alt text
                <input
                  name="alt_text"
                  defaultValue={String(item.alt_text || "")}
                  maxLength={255}
                />
              </label>
              <button className="text-link">Save alt text</button>
            </form>
            <button className="text-link" onClick={() => remove(item)}>
              Delete file
            </button>
          </article>
        ))}
      </div>
      {result && (
        <div className="pagination">
          <button
            className="button secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {result.meta.last_page}
          </span>
          <button
            className="button secondary"
            disabled={page >= result.meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
