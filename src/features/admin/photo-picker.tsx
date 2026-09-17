"use client";
import { useState } from "react";
import { adminRequest } from "@/services/admin";
import type { Media } from "@/types/content";
import { MediaImage } from "@/components/ui/content-ui";
import { editorError } from "./editor-feedback";
export function PhotoPicker({
  images,
  value,
  onChange,
  onBusy,
  name,
  disabled,
  kind = "photo",
}: {
  images: Media[];
  value: number | null;
  onChange: (id: number | null) => void;
  onBusy: (busy: boolean) => void;
  name: string;
  disabled: boolean;
  kind?: "photo" | "logo";
}) {
  const [uploaded, setUploaded] = useState<Media[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const all = [...uploaded, ...images];
  const current = all.find((image) => image.id === value);
  return (
    <div className="photo-editor">
      <div className="photo-preview">
        {current ? (
          <MediaImage media={current} />
        ) : (
          <span className="muted">No image selected</span>
        )}
      </div>
      <div>
        <label htmlFor={"profile-" + kind}>
          {kind === "logo"
            ? "Choose a logo from your library"
            : "Choose a photo from your library"}
          <select
            id={"profile-" + kind}
            value={value || ""}
            disabled={disabled || busy}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">No photo</option>
            {all.map((image) => (
              <option value={image.id} key={image.id}>
                {image.original_name || "Photo #" + image.id}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={"upload-profile-" + kind}>
          {kind === "logo" ? "Or upload a new logo" : "Or upload a new photo"}
          <input
            id={"upload-profile-" + kind}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setError("");
              if (file.size > 10 * 1024 * 1024) {
                setError("Choose a photo smaller than 10 MB.");
                return;
              }
              setBusy(true);
              onBusy(true);
              try {
                const form = new FormData();
                form.set("file", file);
                form.set(
                  "folder",
                  kind === "logo" ? "portfolio/branding" : "portfolio/profile",
                );
                form.set(
                  "alt_text",
                  name
                    ? name + (kind === "logo" ? " logo" : " portrait")
                    : "Profile image",
                );
                const result = await adminRequest<{ data: Media }>(
                  "media",
                  "POST",
                  form,
                );
                setUploaded((items) => [result.data, ...items]);
                onChange(result.data.id);
              } catch (error) {
                setError(editorError(error));
              } finally {
                setBusy(false);
                onBusy(false);
              }
            }}
          />
        </label>
        <p className="muted small">
          JPG, PNG or WEBP, up to 10 MB. Uploads go into your library; your
          public image changes after you save your profile.
        </p>
        {busy && <p role="status">Uploading photo…</p>}
        <p role="alert" className="field-error">
          {error}
        </p>
      </div>
    </div>
  );
}
