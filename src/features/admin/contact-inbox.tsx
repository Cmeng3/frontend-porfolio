"use client";
import { useEffect, useState } from "react";
import { adminRequest } from "@/services/admin";
import type { AdminPage, RecordData } from "@/types/admin";

const statuses = ["unread", "read", "replied", "archived", "spam"];
export function ContactInbox() {
  const [result, setResult] = useState<AdminPage | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<RecordData | null>(null);
  const [status, setStatus] = useState("unread");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    adminRequest<AdminPage>(
      `contact-messages?page=${page}&search=${encodeURIComponent(search)}&status=${filter}`,
    )
      .then((data) => {
        if (active) {
          setResult(data);
          setFeedback("");
        }
      })
      .catch((e) => {
        if (active) setFeedback(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, filter, version]);
  async function open(item: RecordData) {
    setBusy(true);
    setFeedback("");
    try {
      const response = await adminRequest<{ data: RecordData }>(
        "contact-messages/" + item.id,
        item.status === "unread" ? "PATCH" : "GET",
        item.status === "unread" ? { status: "read" } : undefined,
      );
      setSelected(response.data);
      setStatus(String(response.data.status));
      setNotes(String(response.data.admin_notes || ""));
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Could not open message.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!selected) return;
    setBusy(true);
    setFeedback("");
    try {
      const response = await adminRequest<{ data: RecordData }>(
        "contact-messages/" + selected.id,
        "PATCH",
        { status, admin_notes: notes },
      );
      setSelected(response.data);
      setFeedback("Message status and private notes saved.");
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="section-top">
        <h1>Contact messages</h1>
        {selected ? (
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              if (
                (status !== selected.status ||
                  notes !== String(selected.admin_notes || "")) &&
                !window.confirm("Discard unsaved message changes?")
              )
                return;
              setSelected(null);
              setLoading(true);
              setVersion((v) => v + 1);
            }}
          >
            Back to inbox
          </button>
        ) : (
          <button
            className="button secondary"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setVersion((v) => v + 1);
            }}
          >
            Refresh
          </button>
        )}
      </div>
      <p className="muted">
        Messages submitted through your portfolio contact form appear here.
        Replies open in your email app.
      </p>
      <p role="status">{feedback}</p>
      {selected ? (
        <article className="website-form">
          <p className="eyebrow">From {String(selected.name)}</p>
          <h2>{String(selected.subject || "No subject")}</h2>
          <p>
            {String(selected.email)} ·{" "}
            {new Date(String(selected.created_at)).toLocaleString()}
          </p>
          <div className="inbox-message">{String(selected.message)}</div>
          <a
            className="button secondary"
            href={`mailto:${encodeURIComponent(String(selected.email))}?subject=${encodeURIComponent("Re: " + String(selected.subject || "Your portfolio message"))}`}
          >
            Reply by email
          </a>
          <p className="muted small">
            This opens your email app. After sending your reply, choose Replied
            below and save.
          </p>
          <fieldset disabled={busy} className="editor-grid">
            <legend className="sr-only">Message management</legend>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              Private notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={10000}
                rows={4}
              />
            </label>
            <button type="button" className="button" onClick={save}>
              {busy ? "Saving…" : "Save message"}
            </button>
          </fieldset>
        </article>
      ) : (
        <>
          <form
            className="filter-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setPage(1);
              setSearch(
                String(new FormData(e.currentTarget).get("search") || ""),
              );
              setVersion((v) => v + 1);
            }}
          >
            <label>
              Search messages
              <input
                name="search"
                placeholder="Name, email, subject or message"
              />
            </label>
            <label>
              Filter status
              <select
                value={filter}
                onChange={(e) => {
                  setLoading(true);
                  setPage(1);
                  setFilter(e.target.value);
                }}
              >
                <option value="">All messages</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary">Search</button>
          </form>
          {loading ? (
            <p>Loading messages…</p>
          ) : !result?.data.length ? (
            <div className="empty-state">
              No messages found. New submissions will appear here.
            </div>
          ) : (
            <div className="inbox-list">
              {result.data.map((item) => (
                <button
                  key={item.id}
                  className="inbox-row"
                  disabled={busy}
                  onClick={() => open(item)}
                >
                  <span>
                    <strong>{String(item.subject || "No subject")}</strong>
                    <span className="muted small">
                      {String(item.name)} · {String(item.email)}
                    </span>
                  </span>
                  <span className="badge">{String(item.status)}</span>
                  <span className="muted small">
                    {new Date(String(item.created_at)).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
          {result && (
            <div className="pagination">
              <button
                className="button secondary"
                disabled={page <= 1 || loading}
                onClick={() => {
                  setLoading(true);
                  setPage((p) => p - 1);
                }}
              >
                Previous
              </button>
              <span>
                {result.meta.total} messages · Page {page} of{" "}
                {result.meta.last_page}
              </span>
              <button
                className="button secondary"
                disabled={page >= result.meta.last_page || loading}
                onClick={() => {
                  setLoading(true);
                  setPage((p) => p + 1);
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
