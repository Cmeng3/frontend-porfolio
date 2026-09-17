"use client";
import { useEffect, useState } from "react";
import { adminRequest } from "@/services/admin";
import { ContentForm } from "./content-form";
import { ProjectRecords } from "./project-records";
import { ProjectTaxonomyRecords } from "./project-taxonomy-records";
import type { AdminPage, RecordData, Schema } from "@/types/admin";
export function ContentManager({
  resource,
  schema,
}: {
  resource: string;
  schema: Schema;
}) {
  const [result, setResult] = useState<AdminPage | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [changingVisibility, setChangingVisibility] = useState(false);
  const taxonomy = ["project-categories", "technologies"].includes(resource);
  async function toggleVisibility(record: RecordData) {
    setChangingVisibility(true);
    setError("");
    try {
      await adminRequest(resource + "/" + record.id, "PATCH", {
        is_visible: record.is_visible === false,
      });
      setResult((current) =>
        current
          ? {
              ...current,
              data: current.data.map((item) =>
                item.id === record.id
                  ? { ...item, is_visible: record.is_visible === false }
                  : item,
              ),
            }
          : current,
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update visibility.",
      );
    } finally {
      setChangingVisibility(false);
    }
  }
  const [editor, setEditor] = useState<RecordData | null | undefined>(
    undefined,
  );
  useEffect(() => {
    let active = true;
    adminRequest<AdminPage>(
      resource + "?page=" + page + "&search=" + encodeURIComponent(search),
    )
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [resource, page, search, version]);
  async function remove(record: RecordData) {
    if (
      !window.confirm(
        "Delete this record? Projects and articles are retained as soft-deleted records.",
      )
    )
      return;
    try {
      await adminRequest(resource + "/" + record.id, "DELETE");
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }
  if (editor !== undefined)
    return (
      <ContentForm
        resource={resource}
        definition={schema[resource]}
        schema={schema}
        record={editor}
        onCancel={() => setEditor(undefined)}
        onSaved={() => {
          setEditor(undefined);
          setVersion((v) => v + 1);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  return (
    <section>
      <div className="section-top">
        <h1>
          {resource === "technologies"
            ? "Project technologies"
            : resource.replaceAll("-", " ")}
        </h1>
        <button className="button" onClick={() => setEditor(null)}>
          Add new
        </button>
      </div>
      {taxonomy && (
        <p className="muted">
          Organize your projects with{" "}
          {resource === "technologies" ? "technology labels" : "categories"}.
          Hidden items are removed from public filters and labels; existing
          project assignments are kept.
        </p>
      )}
      {resource === "projects" && (
        <p className="muted">
          Manage your portfolio case studies, screenshots, and publishing
          settings. Only Public + Visible projects are shown to visitors.
        </p>
      )}
      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(String(new FormData(e.currentTarget).get("search") || ""));
        }}
      >
        <label>
          Search
          <input name="search" placeholder="Search by title or name" />
        </label>
        <button className="button secondary">Search</button>
      </form>
      <p role="alert" className="error-message">
        {error}
      </p>
      {!result ? (
        <p role="status">Loading content…</p>
      ) : result.data.length === 0 ? (
        <div className="empty-state">
          No records found. Add your first entry above.
        </div>
      ) : taxonomy ? (
        <ProjectTaxonomyRecords
          records={result.data}
          pending={changingVisibility}
          onEdit={setEditor}
          onToggle={toggleVisibility}
          onDelete={remove}
        />
      ) : resource === "projects" ? (
        <ProjectRecords
          records={result.data}
          onEdit={setEditor}
          onDelete={remove}
        />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Entry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>
                      {String(
                        record.title ||
                          record.name ||
                          record.organization ||
                          record.institution ||
                          record.key ||
                          record.id,
                      )}
                    </strong>
                    {record.subject ? (
                      <p className="muted small">{String(record.subject)}</p>
                    ) : null}
                  </td>
                  <td>
                    {String(
                      record.status ||
                        (resource === "resumes"
                          ? record.is_visible
                            ? "Visible"
                            : "Hidden"
                          : "published_at" in record
                            ? record.published_at
                              ? new Date(String(record.published_at)) >
                                new Date()
                                ? "Scheduled"
                                : "Published"
                              : "Draft"
                            : "is_visible" in record
                              ? record.is_visible
                                ? "Visible"
                                : "Hidden"
                              : "—"),
                    )}
                  </td>
                  <td>
                    <div className="link-row">
                      <button
                        className="text-link"
                        onClick={() => setEditor(record)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-link"
                        onClick={() => remove(record)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
            {result.meta.total} records · Page {page} of {result.meta.last_page}
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
