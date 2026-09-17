"use client";
import { useState, type FormEvent } from "react";
import type { RecordData } from "@/types/admin";
import { adminRequest } from "@/services/admin";
import { readWebsiteCopy, type WebsiteCopy } from "@/lib/website-copy";
import { SaveBar, editorError } from "./editor-feedback";
const groups: [string, [keyof WebsiteCopy, string][]][] = [
  [
    "Hero & profile card",
    [
      ["heroGreeting", "Greeting before your name"],
      ["heroBadge", "Availability badge"],
      ["profileLabel", "Profile card label"],
      ["profileTitle", "Profile card heading"],
      ["profileSummary", "Profile card description"],
      ["profileFooter", "Profile card footer"],
    ],
  ],
  [
    "Focus areas",
    [
      ["focusEyebrow", "Section label"],
      ["focusTitle", "Section heading"],
      ["focus1Title", "First focus heading"],
      ["focus1Description", "First focus description"],
      ["focus2Title", "Second focus heading"],
      ["focus2Description", "Second focus description"],
      ["focus3Title", "Third focus heading"],
      ["focus3Description", "Third focus description"],
    ],
  ],
  [
    "Projects, technologies & experience",
    [
      ["projectsEyebrow", "Projects section label"],
      ["projectsTitle", "Featured projects heading"],
      ["projectsEmpty", "Message when no featured projects are published"],
      ["technologiesEyebrow", "Technologies section label"],
      ["technologiesTitle", "Technologies heading"],
      ["experienceTitle", "Experience heading"],
      ["experienceEmpty", "Message when no experience is published"],
    ],
  ],
  [
    "Contact invitation",
    [
      ["contactEyebrow", "Contact section label"],
      ["contactTitle", "Contact heading"],
    ],
  ],
  [
    "Button labels",
    [
      ["projectsButton", "View projects button"],
      ["resumeButton", "Download CV button"],
      ["contactButton", "Contact me button"],
      ["allProjectsButton", "All projects link"],
      ["skillsButton", "Skills link"],
      ["experienceButton", "Experience link"],
      ["ctaButton", "Bottom contact button"],
    ],
  ],
  [
    "Search appearance & footer",
    [
      ["title", "Default browser/search title"],
      ["description", "Default search description"],
      ["footer", "Website footer text"],
    ],
  ],
];
export function HomepageEditor({
  initial,
  onDirtyChange,
}: {
  initial: RecordData | null;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [record, setRecord] = useState(initial);
  const [values, setValues] = useState(() => readWebsiteCopy(initial?.value));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const existing =
        record?.value &&
        typeof record.value === "object" &&
        !Array.isArray(record.value)
          ? (record.value as Record<string, unknown>)
          : {};
      const result = await adminRequest<{ data: RecordData }>(
        record ? "site-settings/" + record.id : "site-settings",
        record ? "PATCH" : "POST",
        { key: "site", value: { ...existing, ...values }, is_public: true },
      );
      setRecord(result.data);
      setDirty(false);
      onDirtyChange(false);
      setMessage("Website text saved and published.");
    } catch (error) {
      setMessage(editorError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="website-form" onSubmit={save}>
      <h2>Homepage text & website settings</h2>
      <p className="muted">
        Open a section below to change its wording. Your edits go live when you
        save.
      </p>
      <fieldset disabled={busy}>
        <legend className="sr-only">Homepage text</legend>
        {groups.map(([heading, fields], index) => (
          <details className="editor-section" key={heading} open={index === 0}>
            <summary>{heading}</summary>
            <div className="editor-grid">
              {fields.map(([key, label]) => (
                <label key={key} htmlFor={"copy-" + key}>
                  {label}
                  <textarea
                    id={"copy-" + key}
                    value={values[key]}
                    rows={
                      key.toLowerCase().match(/description|summary|empty/)
                        ? 3
                        : 2
                    }
                    maxLength={2000}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [key]: e.target.value }));
                      setDirty(true);
                      onDirtyChange(true);
                      setMessage("");
                    }}
                  />
                </label>
              ))}
            </div>
          </details>
        ))}
        <SaveBar
          busy={busy}
          dirty={dirty}
          message={message}
          label="Save website text"
        />
      </fieldset>
    </form>
  );
}
