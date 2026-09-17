import { listContent } from "@/services/content";
import {
  EmptyState,
  Unavailable,
  MediaImage,
  ExternalLink,
  TechnologyBadge,
  formatDate,
} from "@/components/ui/content-ui";
import { RichContent } from "@/components/ui/rich-content";
export async function CareerSection({
  section,
}: {
  section: "experience" | "education" | "certifications";
}) {
  const result = await listContent(section, "per_page=100").catch(() => null);
  if (!result) return <Unavailable />;
  if (!result.data.length)
    return (
      <EmptyState>
        {section === "certifications"
          ? "Certifications will appear here when verified credentials are added."
          : "Details will be published once they are ready to share."}
      </EmptyState>
    );
  return (
    <div className="timeline">
      {result.data.map((item) => (
        <article className="timeline-card" key={item.id}>
          <div className="timeline-date">
            {formatDate(item.started_on || item.issued_on)}
            {item.started_on && " — "}
            {item.is_current ? "Present" : formatDate(item.ended_on)}
          </div>
          <div>
            <h2>{item.role || item.qualification || item.name}</h2>
            <p className="accent">
              {item.organization || item.institution || item.issuer}
            </p>
            <p className="muted">
              {[item.employment_type, item.location, item.field_of_study]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <MediaImage media={item.logo || item.media} />
            <RichContent content={item.description} />
            <RichContent content={item.responsibilities} />
            {item.coursework && (
              <>
                <h3>Relevant coursework</h3>
                <RichContent content={item.coursework} />
              </>
            )}
            <div className="badge-row">
              {item.technologies?.map((t) => (
                <TechnologyBadge key={t.id}>{t.name}</TechnologyBadge>
              ))}
            </div>
            {item.credential_id && <p>Credential: {item.credential_id}</p>}
            {item.expires_on && <p>Expires {formatDate(item.expires_on)}</p>}
            <div className="link-row">
              <ExternalLink href={item.credential_url}>
                Verify credential
              </ExternalLink>
              <ExternalLink href={item.pdf?.url}>Certificate PDF</ExternalLink>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
