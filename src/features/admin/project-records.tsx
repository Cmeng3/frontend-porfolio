import Link from "next/link";
import { MediaImage } from "@/components/ui/content-ui";
import type { Content } from "@/types/content";
import type { RecordData } from "@/types/admin";
import { isProjectPublic } from "./project-editor-sections";

export function ProjectRecords({
  records,
  onEdit,
  onDelete,
}: {
  records: RecordData[];
  onEdit: (record: RecordData) => void;
  onDelete: (record: RecordData) => void;
}) {
  return (
    <div className="admin-project-grid">
      {records.map((record) => {
        const project = record as unknown as Content;
        const published = isProjectPublic(record.published_at);
        const visible = record.is_visible !== false;
        return (
          <article className="admin-project-card" key={record.id}>
            {project.cover && (
              <div className="admin-project-cover">
                <MediaImage media={project.cover} />
              </div>
            )}
            <div className="admin-project-body">
              <div className="badge-row">
                <span className="badge">{published ? "Public" : "Draft"}</span>
                <span className="badge">{visible ? "Visible" : "Hidden"}</span>
                {project.is_featured && <span className="badge">Featured</span>}
              </div>
              <h2>{project.title}</h2>
              <p className="muted small">
                {[project.category?.name, project.status?.replaceAll("_", " ")]
                  .filter(Boolean)
                  .join(" · ") || "Project details not added yet"}
              </p>
              <p className="project-summary">
                {project.summary ||
                  "Add a short description to introduce this project."}
              </p>
              <div className="project-record-actions">
                <button className="button" onClick={() => onEdit(record)}>
                  Edit project
                </button>
                {published && visible && (
                  <Link
                    className="text-link"
                    href={"/projects/" + project.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View project
                    <span className="sr-only"> (opens in a new tab)</span> ↗
                  </Link>
                )}
                <button
                  className="text-link"
                  onClick={() => onDelete(record)}
                  aria-label={`Delete ${project.title}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
