"use client";
import { Fragment, useEffect, useState, type FormEvent } from "react";
import { adminRequest, allAdminRecords, AdminError } from "@/services/admin";
import type { Definition, RecordData, Schema } from "@/types/admin";
import { MediaField } from "./media-field";
import {
  projectEditorSections,
  isProjectPublic,
} from "./project-editor-sections";
function label(value: string) {
  const titles: Record<string, string> = {
    project_category_id: "Project category",
    technology_ids: "Technologies",
    is_featured: "Featured project",
    sort_order: "Display order",
    repository_url: "GitHub repository URL",
    demo_url: "Live demo URL",
  };
  if (titles[value]) return titles[value];
  if (value === "is_visible") return "Visible on website";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
export function ContentForm({
  resource,
  definition,
  schema,
  record,
  onSaved,
  onCancel,
}: {
  resource: string;
  definition: Definition;
  schema: Schema;
  record: RecordData | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [options, setOptions] = useState<Record<string, RecordData[]>>({});
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referenceError, setReferenceError] = useState(false);
  useEffect(() => {
    let active = true;
    const refs = [
      ...new Set(
        Object.values(definition.fields)
          .map((f) => f.reference)
          .filter((x): x is string => !!x),
      ),
    ];
    Promise.all(
      refs.map(async (ref) => {
        const endpoint =
          ref === "media"
            ? "media"
            : Object.keys(schema).find((k) => schema[k].table === ref);
        return [ref, endpoint ? await allAdminRecords(endpoint) : []] as const;
      }),
    )
      .then((entries) => {
        if (active) {
          setOptions(Object.fromEntries(entries));
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "Could not load related records. Reload this editor before saving.",
          );
          setReferenceError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [definition, schema]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setErrors({});
    try {
      const values: Record<string, unknown> = {};
      for (const [name, spec] of Object.entries(definition.fields)) {
        if (resource === "projects" && name === "published_at") {
          values[name] =
            form.get(name) === "public"
              ? isProjectPublic(record?.published_at)
                ? record?.published_at
                : new Date().toISOString()
              : null;
          continue;
        }
        if (spec.type === "checkbox") {
          values[name] =
            [
              "resumes",
              "projects",
              "project-categories",
              "skill-categories",
              "technologies",
            ].includes(resource) && name === "is_visible"
              ? form.get(name) === "true"
              : form.has(name);
          continue;
        }
        if (spec.type === "multi-reference") {
          values[name] = form.getAll(name).map(Number);
          continue;
        }
        const raw = String(form.get(name) || "");
        values[name] =
          raw === ""
            ? null
            : spec.type === "json"
              ? JSON.parse(raw)
              : ["number", "reference"].includes(spec.type)
                ? Number(raw)
                : raw;
      }
      await adminRequest(
        resource + (record ? "/" + record.id : ""),
        record ? "PUT" : "POST",
        values,
      );
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      if (e instanceof AdminError) setErrors(e.errors);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p role="status">Loading editor…</p>;
  return (
    <section className="admin-editor">
      <div className="section-top">
        <h2>
          {record ? "Edit" : "Create"} {resource.replaceAll("-", " ")}
        </h2>
        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
          disabled={busy || uploading}
        >
          Cancel
        </button>
      </div>
      <p className="muted small">
        {resource === "skill-categories" ? (
          "Choose Visible to show this group on the Skills page, or Hidden to hide the group and its skills. Your skills and assignments are kept. Lower display order values appear first. Save changes to apply your settings."
        ) : ["project-categories", "technologies"].includes(resource) ? (
          "Choose Visible to show this item in public filters and labels, or Hidden to keep it in your admin library. Hiding a label does not hide its projects. Use a lowercase slug with hyphens, then save changes."
        ) : resource === "projects" ? (
          "Build your case study below. Save as Draft while working, or select Public and Visible when it is ready to share."
        ) : resource === "education" || resource === "certifications" ? (
          "Upload a JPG, PNG or WEBP image for the visual preview and an optional PDF for the full document. Save changes to attach your files. Set Published At to today or an earlier date to show this entry on your website."
        ) : resource === "resumes" ? (
          "Upload or select your CV, choose Visible or Hidden, and save changes. Visible resumes appear immediately on the Resume page and homepage download link."
        ) : (
          <>
            Long content supports Markdown. Leave publication date empty to keep
            a draft. Dates use the API timezone (UTC). Upload photos and PDFs
            directly below, or choose existing files from your library. Save
            changes to attach them.
          </>
        )}
      </p>
      <form onSubmit={submit} className="editor-grid">
        {(resource === "projects"
          ? projectEditorSections
              .flatMap((section) => section.fields)
              .filter((name) => definition.fields[name])
              .map((name) => [name, definition.fields[name]] as const)
          : Object.entries(definition.fields)
        ).map(([name, spec]) => {
          const group =
            resource === "projects"
              ? projectEditorSections.find(
                  (section) =>
                    section.fields.find((field) => definition.fields[field]) ===
                    name,
                )
              : undefined;
          const heading = group ? (
            <header className="project-editor-heading wide">
              <h3>{group.title}</h3>
              <p className="muted small">{group.description}</p>
            </header>
          ) : null;
          const original = spec.relation
            ? (record?.[spec.relation] as RecordData[] | undefined)?.map((r) =>
                String(r.id),
              ) || []
            : (record?.[name] ?? spec.default);
          let value =
            original === null || original === undefined
              ? ""
              : typeof original === "object"
                ? JSON.stringify(original, null, 2)
                : String(original);
          if (spec.type === "date") value = value.slice(0, 10);
          if (spec.type === "datetime-local") value = value.slice(0, 16);
          const id = "field-" + name;
          if (spec.reference === "media")
            return (
              <Fragment key={name}>
                {heading}
                <MediaField
                  key={name}
                  name={name}
                  resource={resource}
                  records={options.media || []}
                  initial={
                    spec.type === "multi-reference"
                      ? (original as string[])
                      : value
                  }
                  multiple={spec.type === "multi-reference"}
                  required={spec.required}
                  error={errors[name]?.join(" ")}
                  disabled={busy || uploading || referenceError}
                  onBusy={setUploading}
                />
              </Fragment>
            );
          return (
            <Fragment key={name}>
              {heading}
              <label
                htmlFor={id}
                className={
                  ["textarea", "json", "multi-reference"].includes(spec.type)
                    ? "wide"
                    : ""
                }
                key={name}
              >
                {resource === "projects" && name === "published_at"
                  ? "Publication"
                  : label(name)}
                {spec.required ? " *" : ""}
                {resource === "projects" && name === "published_at" ? (
                  <select
                    id={id}
                    name={name}
                    defaultValue={
                      isProjectPublic(original) ? "public" : "draft"
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="public">Public</option>
                  </select>
                ) : [
                    "resumes",
                    "projects",
                    "project-categories",
                    "skill-categories",
                    "technologies",
                  ].includes(resource) && name === "is_visible" ? (
                  <select
                    id={id}
                    name={name}
                    defaultValue={original ? "true" : "false"}
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                ) : spec.type === "checkbox" ? (
                  <input
                    id={id}
                    name={name}
                    type="checkbox"
                    defaultChecked={!!original}
                  />
                ) : spec.type === "reference" ||
                  spec.type === "multi-reference" ? (
                  <select
                    id={id}
                    name={name}
                    multiple={spec.type === "multi-reference"}
                    size={spec.type === "multi-reference" ? 5 : undefined}
                    defaultValue={
                      spec.type === "multi-reference"
                        ? (original as string[])
                        : value
                    }
                    required={spec.required}
                    disabled={loading}
                  >
                    {spec.type === "reference" && (
                      <option value="">None</option>
                    )}
                    {(options[spec.reference!] || []).map((o) => (
                      <option value={o.id} key={o.id}>
                        {String(o.title || o.name || o.original_name || o.id)}
                      </option>
                    ))}
                  </select>
                ) : spec.type === "select" ? (
                  <select
                    id={id}
                    name={name}
                    defaultValue={value}
                    required={spec.required}
                  >
                    <option value="">Not specified</option>
                    {[...new Set(spec.options || [])].map((o) => (
                      <option key={o} value={o}>
                        {label(o)}
                      </option>
                    ))}
                  </select>
                ) : spec.type === "textarea" || spec.type === "json" ? (
                  <textarea
                    id={id}
                    name={name}
                    defaultValue={value}
                    rows={spec.type === "json" ? 4 : 5}
                    required={spec.required}
                  />
                ) : (
                  <input
                    id={id}
                    name={name}
                    type={spec.type}
                    defaultValue={value}
                    required={spec.required}
                    min={spec.type === "number" ? 0 : undefined}
                  />
                )}
                {spec.type === "multi-reference" && (
                  <span className="muted small">
                    Hold Ctrl (Windows) or Command (Mac) to select multiple
                    entries.
                  </span>
                )}
                {name === "value" && spec.type === "json" && (
                  <span className="muted small">
                    Enter a JSON object, for example {`{"text":"Your text"}`}.
                  </span>
                )}
                {errors[name] && (
                  <span className="field-error">{errors[name].join(" ")}</span>
                )}
              </label>
            </Fragment>
          );
        })}
        <div className="wide">
          <p role="alert" className="error-message">
            {error}
          </p>
          <button
            className="button"
            disabled={busy || uploading || loading || referenceError}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
