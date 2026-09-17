import type { Content } from "@/types/content";
import {
  ExternalLink,
  MediaImage,
  formatDate,
} from "@/components/ui/content-ui";
import { RichContent } from "@/components/ui/rich-content";

export function QualificationCard({
  item,
  education,
}: {
  item: Content;
  education: boolean;
}) {
  const title = education ? item.qualification : item.name;
  const period = education
    ? [
        formatDate(item.started_on),
        item.is_current ? "Present" : formatDate(item.ended_on),
      ]
        .filter(Boolean)
        .join(" – ")
    : item.issued_on
      ? `Issued ${formatDate(item.issued_on)}`
      : undefined;
  return (
    <article
      className={`qualification-card ${education ? "education-card" : "certificate-card"}`}
    >
      {item.media && (
        <div className="qualification-visual">
          <ExternalLink
            href={item.media.url}
            className="qualification-image-link"
          >
            <MediaImage
              media={{
                ...item.media,
                alt_text:
                  item.media.alt_text ||
                  `${title} — ${education ? item.institution : item.issuer}`,
              }}
            />
            <span className="qualification-image-caption">
              View full image ↗
            </span>
          </ExternalLink>
        </div>
      )}
      <div className="qualification-body">
        <div className="qualification-meta">
          <span className="eyebrow">
            {education ? "Education" : "Certification"}
          </span>
          {period && <span className="muted small">{period}</span>}
        </div>
        <h2>{title}</h2>
        <p className="qualification-institution">
          {education ? item.institution : item.issuer}
        </p>
        {(item.field_of_study || item.location) && (
          <p className="muted">
            {[item.field_of_study, item.location].filter(Boolean).join(" · ")}
          </p>
        )}
        <RichContent content={item.description} />
        {item.coursework && (
          <details className="qualification-coursework">
            <summary>Relevant coursework</summary>
            <RichContent content={item.coursework} />
          </details>
        )}
        {(item.credential_id || item.expires_on) && (
          <dl className="qualification-facts">
            {item.credential_id && (
              <div>
                <dt>Credential ID</dt>
                <dd>{item.credential_id}</dd>
              </div>
            )}
            {item.expires_on && (
              <div>
                <dt>Expires</dt>
                <dd>{formatDate(item.expires_on)}</dd>
              </div>
            )}
          </dl>
        )}
        {(item.credential_url || item.pdf) && (
          <div className="qualification-actions">
            <ExternalLink href={item.credential_url} className="button">
              Verify credential ↗
            </ExternalLink>
            <ExternalLink href={item.pdf?.url} className="button secondary">
              {education ? "View education PDF" : "View certificate PDF"} ↗
            </ExternalLink>
          </div>
        )}
      </div>
    </article>
  );
}
