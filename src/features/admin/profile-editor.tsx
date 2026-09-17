"use client";
import { useState, type FormEvent } from "react";
import { adminRequest } from "@/services/admin";
import type { RecordData } from "@/types/admin";
import type { Media } from "@/types/content";
import { PhotoPicker } from "./photo-picker";
import { SaveBar, editorError } from "./editor-feedback";
const fields = [
  ["name", "Your name", "text"],
  ["headline", "Professional headline", "text"],
  ["introduction", "Homepage introduction", "textarea"],
  ["public_email", "Public contact email", "email"],
  ["phone", "Public phone number (optional)", "text"],
  ["location", "Location", "text"],
  ["availability", "Availability / contact message", "textarea"],
  ["biography", "About me", "textarea"],
  ["focus", "What I focus on", "textarea"],
  ["learning", "Currently learning", "textarea"],
  ["philosophy", "Developer philosophy", "textarea"],
] as const;
export function ProfileEditor({
  initial,
  images,
  onDirtyChange,
}: {
  initial: RecordData | null;
  images: Media[];
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [record, setRecord] = useState(initial);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map(([key]) => [key, String(initial?.[key] || "")]),
    ),
  );
  const [photo, setPhoto] = useState<number | null>(
    initial?.avatar_media_id ? Number(initial.avatar_media_id) : null,
  );
  const [dirty, setDirty] = useState(false);
  const [logo, setLogo] = useState<number | null>(
    initial?.logo_media_id ? Number(initial.logo_media_id) : null,
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  function markDirty() {
    setDirty(true);
    onDirtyChange(true);
    setMessage("");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        ...values,
        avatar_media_id: photo,
        logo_media_id: logo,
      };
      if (!record)
        payload.slug =
          values.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "profile";
      const result = await adminRequest<{ data: RecordData }>(
        record ? "profile/" + record.id : "profile",
        record ? "PATCH" : "POST",
        payload,
      );
      setRecord(result.data);
      setDirty(false);
      onDirtyChange(false);
      setMessage("Profile saved. Your changes are now on the website.");
    } catch (error) {
      setMessage(editorError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="website-form">
      <h2>Profile & photo</h2>
      <p className="muted">
        Change your introduction, contact information and About page here.
      </p>
      <fieldset disabled={busy || uploading}>
        <legend className="sr-only">Profile details</legend>
        <h3>Profile photo</h3>
        <p className="muted small">
          Your portrait appears inside the homepage hero card, replacing the
          initials.
        </p>
        <PhotoPicker
          images={images}
          value={photo}
          onBusy={setUploading}
          name={values.name}
          disabled={busy}
          onChange={(id) => {
            setPhoto(id);
            markDirty();
          }}
        />
        <h3>Portfolio logo</h3>
        <p className="muted small">
          This logo appears beside the site name in the navigation and in the
          browser tab. Use your CL logo here.
        </p>
        <PhotoPicker
          images={images}
          value={logo}
          onBusy={setUploading}
          name={values.name}
          disabled={busy}
          kind="logo"
          onChange={(id) => {
            setLogo(id);
            markDirty();
          }}
        />
        <div className="editor-grid">
          {fields.map(([key, label, type]) => (
            <label
              className={type === "textarea" ? "wide" : ""}
              key={key}
              htmlFor={"profile-" + key}
            >
              {label}
              {key === "name" ? " *" : ""}
              {type === "textarea" ? (
                <textarea
                  id={"profile-" + key}
                  value={values[key]}
                  rows={key === "biography" ? 6 : 3}
                  maxLength={
                    ["biography", "focus", "learning", "philosophy"].includes(
                      key,
                    )
                      ? 100000
                      : key === "availability"
                        ? 255
                        : 10000
                  }
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [key]: e.target.value }));
                    markDirty();
                  }}
                />
              ) : (
                <input
                  id={"profile-" + key}
                  type={type}
                  value={values[key]}
                  maxLength={key === "phone" ? 50 : 255}
                  required={key === "name"}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [key]: e.target.value }));
                    markDirty();
                  }}
                />
              )}
            </label>
          ))}
        </div>
        <aside
          className="profile-text-preview"
          aria-label="Profile text preview"
        >
          <p className="eyebrow">Profile preview</p>
          <h3>{values.name || "Your name"}</h3>
          <p>
            <strong>{values.headline}</strong>
          </p>
          <p>{values.introduction}</p>
        </aside>
        <SaveBar
          busy={busy}
          dirty={dirty}
          message={message}
          label="Save profile"
        />
      </fieldset>
    </form>
  );
}
