"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminMenu } from "@/lib/admin-navigation";
import { adminRequest, AdminError } from "@/services/admin";
import { LoginPanel } from "./login-panel";
import { ContentManager } from "./content-manager";
import { MediaLibrary } from "./media-library";
import { WebsiteEditor } from "./website-editor";
import { UploadCenter } from "./upload-center";
import type { Schema, RecordData } from "@/types/admin";
type Dashboard = {
  counts: Record<string, number>;
  messages: RecordData[];
  projects: RecordData[];
};
const menu = adminMenu;
export function AdminShell({
  initialSection = "dashboard",
}: {
  initialSection?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null | undefined>(
    undefined,
  );
  const [schema, setSchema] = useState<Schema>({});
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const selected = initialSection;
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [websiteDirty, setWebsiteDirty] = useState(false);
  function selectSection(section: string) {
    if (section === selected) return;
    if (
      websiteDirty &&
      !window.confirm("You have unsaved website changes. Leave without saving?")
    )
      return;
    setWebsiteDirty(false);
    router.push(section === "dashboard" ? "/admin" : "/admin/" + section);
    window.scrollTo({ top: 0 });
  }
  useEffect(() => {
    if (!websiteDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const leaving = (event: MouseEvent) => {
      const link =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey)
        return;
      if (
        !window.confirm(
          "You have unsaved website changes. Leave without saving?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", leaving, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", leaving, true);
    };
  }, [websiteDirty]);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const me = await adminRequest<{ data: { name: string } }>("me");
        const [definitions, overview] = await Promise.all([
          adminRequest<{ data: Schema }>("schema"),
          adminRequest<{ data: Dashboard }>("dashboard"),
        ]);
        if (active) {
          setUser(me.data);
          setSchema(definitions.data);
          setDashboard(overview.data);
          setError("");
        }
      } catch (e) {
        if (active) {
          if (e instanceof AdminError && [401, 403, 419].includes(e.status))
            setUser(null);
          else
            setError(
              e instanceof Error ? e.message : "Could not connect to the API.",
            );
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [version]);
  async function logout() {
    if (
      websiteDirty &&
      !window.confirm(
        "You have unsaved website changes. Log out without saving?",
      )
    )
      return;
    try {
      await adminRequest("logout", "POST");
      setUser(null);
      setSchema({});
      setDashboard(null);
      setWebsiteDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logout failed.");
    }
  }
  if (user === undefined)
    return (
      <div className="page-shell">
        <p role="status">{error || "Loading your workspace…"}</p>
        {error && (
          <button className="button" onClick={() => setVersion((v) => v + 1)}>
            Retry
          </button>
        )}
      </div>
    );
  if (!user) return <LoginPanel onLogin={() => setVersion((v) => v + 1)} />;
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="eyebrow">Content workspace</p>
        <p className="admin-name">{user.name}</p>
        <nav aria-label="Admin navigation">
          {menu.map(([key, label]) => (
            <button
              key={key}
              className={key === selected ? "active" : ""}
              aria-current={key === selected ? "page" : undefined}
              onClick={() => selectSection(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button className="button secondary" onClick={logout}>
          Logout
        </button>
      </aside>
      <div className="admin-content">
        <p role="alert" className="error-message">
          {error}
        </p>
        {selected === "dashboard" ? (
          <>
            <p className="eyebrow">Overview</p>
            <h1>Welcome back.</h1>
            <div className="admin-quick-actions">
              <button
                className="quick-edit-card"
                onClick={() => selectSection("website")}
              >
                <strong>Edit website</strong>
                <span>
                  Change your photo, introduction, About page and homepage
                  wording.
                </span>
              </button>
              <button
                className="quick-edit-card"
                onClick={() => selectSection("social-links")}
              >
                <strong>Edit social links</strong>
                <span>
                  Add or update your GitHub, LinkedIn and other profiles.
                </span>
              </button>
              <button
                className="quick-edit-card"
                onClick={() => selectSection("uploads")}
              >
                <strong>Upload photos & resume</strong>
                <span>
                  Upload project screenshots, certificates and your CV.
                </span>
              </button>
            </div>
            <div className="stat-grid">
              {Object.entries(dashboard?.counts || {}).map(([label, value]) => (
                <div className="stat-card" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <section className="section-block">
              <h2>Recent messages</h2>
              {dashboard?.messages.length ? (
                dashboard.messages.map((m) => (
                  <article className="dashboard-row" key={m.id}>
                    <div>
                      <strong>{String(m.name)}</strong>
                      <p>{String(m.subject || "No subject")}</p>
                    </div>
                    <span className="badge">{String(m.status)}</span>
                  </article>
                ))
              ) : (
                <p className="muted">No messages yet.</p>
              )}
            </section>
            <section className="section-block">
              <h2>Recently updated projects</h2>
              {dashboard?.projects.map((p) => (
                <div className="dashboard-row" key={p.id}>
                  <strong>{String(p.title)}</strong>
                  <span className="badge">
                    {p.published_at ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </section>
          </>
        ) : selected === "website" ? (
          <WebsiteEditor onDirtyChange={setWebsiteDirty} />
        ) : selected === "uploads" ? (
          <UploadCenter />
        ) : selected === "media" ? (
          <MediaLibrary />
        ) : schema[selected] ? (
          <ContentManager key={selected} resource={selected} schema={schema} />
        ) : null}
      </div>
    </div>
  );
}
