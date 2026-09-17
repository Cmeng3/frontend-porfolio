import Link from "next/link";
import Image from "next/image";
import type { Content, Media, PageData, SearchParams } from "@/types/content";
import { queryString } from "@/services/content";
export function safeUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="lede">{description}</p>}
    </header>
  );
}
export function EmptyState({
  children = "Nothing has been published here yet.",
}: {
  children?: React.ReactNode;
}) {
  return <div className="empty-state">{children}</div>;
}
export function Unavailable() {
  return (
    <div className="empty-state" role="status">
      <h2>Content is temporarily unavailable</h2>
      <p>
        Please try again shortly. You can still explore the rest of the
        portfolio.
      </p>
    </div>
  );
}
export function MediaImage({
  media,
  priority = false,
}: {
  media?: Media | null;
  priority?: boolean;
}) {
  const url = safeUrl(media?.url);
  if (!url || !media) return null;
  const configured = process.env.NEXT_PUBLIC_MEDIA_URL;
  const optimized =
    !!configured &&
    url.startsWith(configured.replace(/\/$/, "") + "/") &&
    new URL(url).hostname !== "localhost" &&
    new URL(url).hostname !== "127.0.0.1";
  return (
    <Image
      src={url}
      alt={media.alt_text || ""}
      width={media.width || 1200}
      height={media.height || 750}
      sizes="(max-width: 700px) 100vw, 60vw"
      unoptimized={!optimized}
      loading={priority ? "eager" : "lazy"}
      className="content-image"
    />
  );
}
export function ExternalLink({
  href,
  children,
  className,
}: {
  href?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const url = safeUrl(href);
  return url ? (
    <a
      className={className || "text-link"}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : null;
}
export function TechnologyBadge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function ProjectCard({ item }: { item: Content }) {
  return (
    <article className="content-card project-card">
      {item.cover && (
        <Link
          href={"/projects/" + item.slug}
          className="project-card-cover"
          aria-label={`View ${item.title}`}
        >
          <MediaImage media={item.cover} />
        </Link>
      )}
      <div className="card-body">
        <div className="badge-row">
          {item.category && (
            <TechnologyBadge>{item.category.name}</TechnologyBadge>
          )}
          {item.is_featured && <TechnologyBadge>Featured</TechnologyBadge>}
        </div>
        <h3>
          <Link href={"/projects/" + item.slug}>{item.title}</Link>
        </h3>
        <p>{item.summary}</p>
        {item.status && (
          <p className="project-status">{item.status.replaceAll("_", " ")}</p>
        )}
        <div className="badge-row">
          {item.technologies?.map((t) => (
            <TechnologyBadge key={t.id}>{t.name}</TechnologyBadge>
          ))}
        </div>
        <div className="link-row project-card-actions">
          <Link className="text-link" href={"/projects/" + item.slug}>
            View case study ↗
          </Link>
          <ExternalLink href={item.repository_url}>GitHub</ExternalLink>
          <ExternalLink href={item.demo_url}>Live demo</ExternalLink>
        </div>
      </div>
    </article>
  );
}
export function BlogCard({
  item,
  section = "blog",
}: {
  item: Content;
  section?: string;
}) {
  return (
    <article className="content-card">
      <MediaImage media={item.cover} />
      <div className="card-body">
        <div className="badge-row">
          {item.is_featured && <TechnologyBadge>Featured</TechnologyBadge>}
          {item.category && (
            <TechnologyBadge>{item.category.name}</TechnologyBadge>
          )}
        </div>
        <h3>
          <Link href={"/" + section + "/" + item.slug}>{item.title}</Link>
        </h3>
        <p>{item.excerpt}</p>
        <p className="muted small">
          {formatDate(item.published_at)} · {item.reading_minutes || 1} min read
        </p>
        <Link className="text-link" href={"/" + section + "/" + item.slug}>
          Read article ↗
        </Link>
      </div>
    </article>
  );
}
export function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
export function Pagination({
  result,
  params,
  path,
}: {
  result: PageData<Content>;
  params: SearchParams;
  path: string;
}) {
  if (!result.meta || result.meta.last_page < 2) return null;
  const { current_page, last_page } = result.meta;
  return (
    <nav className="pagination" aria-label="Pagination">
      {current_page > 1 && (
        <Link
          className="button secondary"
          href={
            path + "?" + queryString(params, { page: String(current_page - 1) })
          }
        >
          Previous
        </Link>
      )}
      <span>
        Page {current_page} of {last_page}
      </span>
      {current_page < last_page && (
        <Link
          className="button secondary"
          href={
            path + "?" + queryString(params, { page: String(current_page + 1) })
          }
        >
          Next
        </Link>
      )}
    </nav>
  );
}
