"use client";
import { useState } from "react";
import { adminRequest } from "@/services/admin";
import { MediaImage } from "@/components/ui/content-ui";
import { PdfPreview } from "@/components/ui/pdf-preview";
import type { Media } from "@/types/content";
import type { RecordData } from "@/types/admin";
import { editorError } from "./editor-feedback";

const names: Record<string, string> = {
  avatar_media_id: "Profile photo",
  logo_media_id: "Logo",
  cover_media_id: "Cover image",
  architecture_media_id: "Architecture diagram",
  database_media_id: "Database diagram",
  pdf_media_id: "Certificate PDF",
  media_ids: "Screenshots & gallery",
  media_id: "Certificate image",
};
export function MediaField({
  name,
  resource,
  records,
  initial,
  multiple,
  required,
  error,
  disabled,
  onBusy,
}: {
  name: string;
  resource: string;
  records: RecordData[];
  initial: string | string[];
  multiple: boolean;
  required: boolean;
  error?: string;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const pdf = resource === "resumes" || name === "pdf_media_id";
  const title = resource === "resumes" ? "Resume PDF" : names[name] || "Image";
  const folder =
    resource === "resumes"
      ? "resume"
      : resource === "experience"
        ? "branding"
        : resource === "certifications"
          ? "certificates"
          : resource === "profile"
            ? name === "logo_media_id"
              ? "branding"
              : "profile"
            : resource;
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(initial) ? initial : initial ? [initial] : [],
  );
  const [uploaded, setUploaded] = useState<Media[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [alt, setAlt] = useState("");
  const all = [...uploaded, ...(records as unknown as Media[])].filter((m) =>
    pdf ? m.mime_type === "application/pdf" : m.mime_type?.startsWith("image/"),
  );
  const id = "field-" + name;
  return (
    <fieldset className="media-upload-field wide" disabled={disabled || busy}>
      <legend>
        {title}
        {required ? " *" : ""}
      </legend>
      <label htmlFor={id}>
        Choose from media library
        <select
          id={id}
          name={name}
          multiple={multiple}
          required={required}
          value={multiple ? selected : selected[0] || ""}
          onChange={(e) =>
            setSelected(
              Array.from(
                e.target.selectedOptions,
                (option) => option.value,
              ).filter(Boolean),
            )
          }
        >
          {!multiple && <option value="">None selected</option>}
          {all.map((m) => (
            <option key={m.id} value={m.id}>
              {m.original_name || "Uploaded file"}
            </option>
          ))}
        </select>
      </label>
      {multiple && (
        <p className="muted small">
          Hold Ctrl or Command to select several existing images. New uploads
          are selected automatically.
        </p>
      )}
      {!pdf && (
        <label htmlFor={id + "-alt"}>
          Description for new images (alt text)
          <input
            id={id + "-alt"}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={255}
          />
        </label>
      )}
      <label htmlFor={id + "-upload"}>
        Upload {title.toLowerCase()}
        <input
          id={id + "-upload"}
          type="file"
          multiple={multiple}
          accept={pdf ? "application/pdf" : "image/jpeg,image/png,image/webp"}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (!files.length) return;
            if (
              files.some(
                (f) =>
                  f.size > 10 * 1024 * 1024 ||
                  !(
                    pdf
                      ? ["application/pdf"]
                      : ["image/jpeg", "image/png", "image/webp"]
                  ).includes(f.type),
              )
            ) {
              setStatus(
                pdf
                  ? "Choose a PDF up to 10 MB."
                  : "Choose JPG, PNG or WEBP images up to 10 MB each.",
              );
              return;
            }
            if (multiple && selected.length + files.length > 100) {
              setStatus("Choose no more than 100 gallery images.");
              return;
            }
            setBusy(true);
            onBusy(true);
            setStatus("Uploading…");
            try {
              for (const file of files) {
                const form = new FormData();
                form.set("file", file);
                form.set("folder", "portfolio/" + folder);
                form.set("alt_text", alt);
                const response = await adminRequest<{ data: Media }>(
                  "media",
                  "POST",
                  form,
                );
                setUploaded((items) => [...items, response.data]);
                setSelected((items) =>
                  multiple
                    ? [...items, String(response.data.id)]
                    : [String(response.data.id)],
                );
              }
              setStatus(
                "Uploaded and selected. Save changes below to attach the file to this entry.",
              );
            } catch (e) {
              setStatus(editorError(e));
            } finally {
              setBusy(false);
              onBusy(false);
            }
          }}
        />
      </label>
      <p className="muted small">
        {pdf ? "PDF" : "JPG, PNG or WEBP"} · Maximum 10 MB per file. Files are
        uploaded to your configured storage.
      </p>
      <div className="media-field-previews">
        {all
          .filter((m) => selected.includes(String(m.id)))
          .map((m) => (
            <div key={m.id}>
              {pdf ? (
                <PdfPreview url={m.url} title={m.original_name || "Document"} />
              ) : (
                <MediaImage media={m} />
              )}
            </div>
          ))}
      </div>
      <p role="status">{status}</p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
