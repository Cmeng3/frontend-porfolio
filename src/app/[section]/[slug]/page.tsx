import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent, optionalContent } from "@/services/content";
import { ApiError } from "@/services/api";
import {
  SectionTitle,
  MediaImage,
  ExternalLink,
  TechnologyBadge,
  BlogCard,
  formatDate,
} from "@/components/ui/content-ui";
import { RichContent } from "@/components/ui/rich-content";
type Props = { params: Promise<{ section: string; slug: string }> };
async function load(section: string, slug: string) {
  if (!["projects", "blog"].includes(section)) notFound();
  try {
    return (await getContent(section, slug)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const item = await load(section, slug);
  const title = item.meta_title || item.title;
  const description = item.meta_description || item.summary || item.excerpt;
  return {
    title,
    description,
    alternates: { canonical: "/" + section + "/" + slug },
    openGraph: {
      title,
      description,
      type: section === "projects" ? "website" : "article",
      images: item.cover
        ? [{ url: item.cover.url, alt: item.cover.alt_text || "" }]
        : [],
    },
  };
}
export default async function DetailPage({ params }: Props) {
  const { section, slug } = await params;
  const item = await load(section, slug);
  const related =
    section !== "projects"
      ? await optionalContent(
          section,
          "per_page=4" +
            (item.category?.slug ? "&category=" + item.category.slug : ""),
        )
      : null;
  const sections: [string, string | undefined][] = [
    ["Project overview", item.description],
    ["Problem", item.problem],
    ["Target users", item.target_users],
    ["Solution", item.solution],
    ["Key features", item.key_features],
    ["System architecture", item.architecture],
    ["Database design", item.database_design],
    ["API architecture", item.api_architecture],
    ["Challenges", item.challenges],
    ["Solutions & outcomes", item.outcomes],
    ["What I learned", item.lessons_learned],
    ["Future improvements", item.future_improvements],
  ];
  return (
    <main
      id="main-content"
      className={`page-shell detail-page ${section === "projects" ? "project-detail" : ""}`}
    >
      <Link className="text-link" href={"/" + section}>
        ← Back to {section}
      </Link>
      <SectionTitle
        eyebrow={item.category?.name || section}
        title={item.title || ""}
        description={item.summary || item.excerpt}
      />
      <div className="badge-row">
        {item.status && (
          <TechnologyBadge>{item.status.replaceAll("_", " ")}</TechnologyBadge>
        )}
        {item.technologies?.map((t) => (
          <TechnologyBadge key={t.id}>{t.name}</TechnologyBadge>
        ))}
      </div>
      <MediaImage media={item.cover} priority />
      {section === "projects" && (
        <div className="project-detail-summary">
          {item.role && (
            <div>
              <span className="muted small">My role</span>
              <p>{item.role}</p>
            </div>
          )}
          {(item.started_on || item.ended_on) && (
            <div>
              <span className="muted small">Project timeline</span>
              <p>
                {[formatDate(item.started_on), formatDate(item.ended_on)]
                  .filter(Boolean)
                  .join(" – ")}
              </p>
            </div>
          )}
          <div className="link-row">
            <ExternalLink href={item.repository_url}>
              GitHub repository ↗
            </ExternalLink>
            <ExternalLink href={item.demo_url}>Live demo ↗</ExternalLink>
          </div>
        </div>
      )}
      {section === "projects" ? (
        <>
          {sections.map(([title, body]) =>
            body ? (
              <section className="section-block" key={title}>
                <h2>{title}</h2>
                <RichContent content={body} />
              </section>
            ) : null,
          )}
          {item.architecture_image && (
            <section className="section-block">
              <h2>Architecture diagram</h2>
              <MediaImage media={item.architecture_image} />
            </section>
          )}
          {item.database_image && (
            <section className="section-block">
              <h2>Database diagram</h2>
              <MediaImage media={item.database_image} />
            </section>
          )}
        </>
      ) : (
        <>
          <p className="muted">
            {formatDate(item.published_at)} · {item.reading_minutes || 1} min
            read
          </p>
          <RichContent content={item.body} />
          {item.project && (
            <Link className="text-link" href={"/projects/" + item.project.slug}>
              Related project: {item.project.title}
            </Link>
          )}
        </>
      )}
      {item.gallery && item.gallery.length > 0 && (
        <section className="section-block">
          <h2>
            {section === "projects" ? "Screenshots" : "Diagrams & images"}
          </h2>
          <div className="image-gallery">
            {item.gallery.map((media) => (
              <a
                href={media.url}
                key={media.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MediaImage media={media} />
              </a>
            ))}
          </div>
        </section>
      )}
      {section !== "projects" && (
        <div className="link-row">
          <ExternalLink href={item.repository_url}>
            GitHub repository ↗
          </ExternalLink>
          <ExternalLink href={item.demo_url}>Live demo ↗</ExternalLink>
        </div>
      )}
      <div className="badge-row">
        {item.tags?.map((t) => (
          <Link className="badge" href={"/blog?tag=" + t.slug} key={t.id}>
            {t.name}
          </Link>
        ))}
      </div>
      {related && related.data.some((r) => r.id !== item.id) && (
        <section className="section-block">
          <h2>Related reading</h2>
          <div className="card-grid">
            {related.data
              .filter((r) => r.id !== item.id)
              .slice(0, 3)
              .map((r) => (
                <BlogCard key={r.id} item={r} section={section} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
