import { ExternalLink } from "@/components/ui/content-ui";
import type { RecordData } from "@/types/admin";

export function TaxonomyRecords({
  usage = "projects",
  records,
  pending,
  onEdit,
  onToggle,
  onDelete,
}: {
  usage?: "projects" | "skills";
  records: RecordData[];
  pending: boolean;
  onEdit: (record: RecordData) => void;
  onToggle: (record: RecordData) => void;
  onDelete: (record: RecordData) => void;
}) {
  return (
    <div className="taxonomy-grid">
      {records.map((record) => {
        const visible = record.is_visible !== false;
        const count = Number(record[usage + "_count"] || 0);
        return (
          <article className="taxonomy-card" key={record.id}>
            <div className="taxonomy-card-heading">
              <h2>{String(record.name)}</h2>
              <span
                className={`badge taxonomy-status ${visible ? "is-visible" : ""}`}
              >
                {visible ? "Visible" : "Hidden"}
              </span>
            </div>
            <p className="muted small">/{String(record.slug)}</p>
            {record.description ? (
              <p className="project-summary">{String(record.description)}</p>
            ) : null}
            {record.website_url ? (
              <ExternalLink href={String(record.website_url)}>
                Official website ↗
              </ExternalLink>
            ) : null}
            <p className="muted small">
              {usage === "projects" ? "Used in " : ""}
              {count} {count === 1 ? usage.slice(0, -1) : usage}
              {record.sort_order !== undefined
                ? ` · Display order ${record.sort_order}`
                : ""}
            </p>
            <div className="taxonomy-actions">
              <button
                className="button secondary"
                disabled={pending}
                onClick={() => onEdit(record)}
                aria-label={`Edit ${record.name}`}
              >
                Edit
              </button>
              <button
                className="text-link"
                disabled={pending}
                onClick={() => onToggle(record)}
                aria-label={`${visible ? "Hide" : "Show"} ${record.name}`}
              >
                {visible ? "Hide" : "Make visible"}
              </button>
              <button
                className="text-link"
                disabled={pending}
                onClick={() => onDelete(record)}
                aria-label={`Delete ${record.name}`}
              >
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
