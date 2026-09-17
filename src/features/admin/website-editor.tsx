"use client";
import { useCallback, useEffect, useState } from "react";
import { allAdminRecords } from "@/services/admin";
import type { RecordData } from "@/types/admin";
import type { Media } from "@/types/content";
import { ProfileEditor } from "./profile-editor";
import { HomepageEditor } from "./homepage-editor";
import { editorError } from "./editor-feedback";
export function WebsiteEditor({
  onDirtyChange,
}: {
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [data, setData] = useState<{
    profile: RecordData | null;
    site: RecordData | null;
    images: Media[];
  } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [dirty, setDirty] = useState({ profile: false, site: false });
  const profileDirty = useCallback(
    (value: boolean) => setDirty((d) => ({ ...d, profile: value })),
    [],
  );
  const siteDirty = useCallback(
    (value: boolean) => setDirty((d) => ({ ...d, site: value })),
    [],
  );
  useEffect(() => {
    onDirtyChange(dirty.profile || dirty.site);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    let active = true;
    Promise.all([
      allAdminRecords("profile"),
      allAdminRecords("site-settings"),
      allAdminRecords("media"),
    ])
      .then(([profiles, settings, media]) => {
        if (active) {
          profiles.sort(
            (a, b) =>
              String(b.created_at || "").localeCompare(
                String(a.created_at || ""),
              ) || a.id - b.id,
          );
          setData({
            profile: profiles[0] || null,
            site: settings.find((s) => s.key === "site") || null,
            images: media.filter((m) =>
              String(m.mime_type).startsWith("image/"),
            ) as unknown as Media[],
          });
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(editorError(e));
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (!data)
    return (
      <section>
        <h1>Edit website</h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button className="button" onClick={() => setAttempt((v) => v + 1)}>
              Retry
            </button>
          </>
        ) : (
          <p role="status">Loading your website editor…</p>
        )}
      </section>
    );
  return (
    <section>
      <div className="section-top">
        <div>
          <p className="eyebrow">Make it yours</p>
          <h1>Edit website</h1>
        </div>
        <a
          className="button secondary"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          View saved website ↗
        </a>
      </div>
      <p className="lede">
        Update your photo and words here. Each section has its own Save button.
      </p>
      <ProfileEditor
        initial={data.profile}
        images={data.images}
        onDirtyChange={profileDirty}
      />
      <HomepageEditor initial={data.site} onDirtyChange={siteDirty} />
    </section>
  );
}
