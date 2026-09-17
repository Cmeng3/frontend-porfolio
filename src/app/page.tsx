import Link from "next/link";
import { siteSettings } from "@/services/site";
import { optionalContent } from "@/services/content";
import { resumeFileUrl } from "@/lib/resume";
import {
  ProjectCard,
  EmptyState,
  ExternalLink,
  TechnologyBadge,
  MediaImage,
  Unavailable,
} from "@/components/ui/content-ui";
export default async function Home() {
  const [copy, profiles, projects, technologies, experience, resumes, socials] =
    await Promise.all([
      siteSettings(),
      optionalContent("profile"),
      optionalContent("projects", "featured=1&per_page=3"),
      optionalContent("technologies", "per_page=12"),
      optionalContent("experience", "per_page=2"),
      optionalContent("resumes", "per_page=1"),
      optionalContent("social-links", "per_page=100"),
    ]);
  const profile = profiles?.data[0];
  const github =
    socials?.data.find((s) => s.platform?.toLowerCase() === "github")?.url ||
    process.env.NEXT_PUBLIC_GITHUB_URL;
  return (
    <main id="main-content" className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">
            <span className="status-dot" /> {copy.heroBadge}
          </p>
          <h1>
            {copy.heroGreeting}
            <br />
            <span>{profile?.name || "Chimeng Ly"}</span>.
          </h1>
          <p className="hero-subtitle">
            {profile?.headline ||
              "Computer Science Graduate | Backend & Full-Stack Developer"}
          </p>
          <p className="lede">
            {profile?.introduction ||
              "I build backend systems, APIs, full-stack and mobile applications. I’m interested in how thoughtful database design and cloud infrastructure turn practical ideas into useful software."}
          </p>
          <div className="link-row">
            <Link className="button" href="/projects">
              {copy.projectsButton}
            </Link>
            {resumes?.data[0]?.media?.url ? (
              <a
                className="button secondary"
                href={resumeFileUrl(resumes.data[0].id, true)}
                download
              >
                {copy.resumeButton}
              </a>
            ) : (
              <Link className="button secondary" href="/resume">
                {copy.resumeButton}
              </Link>
            )}
            {github ? (
              <ExternalLink href={github}>GitHub</ExternalLink>
            ) : (
              <span
                className="muted small"
                aria-disabled="true"
                title="GitHub profile has not been added yet"
              >
                GitHub
              </span>
            )}
            <Link className="text-link" href="/contact">
              {copy.contactButton}
            </Link>
          </div>
        </div>
        <aside className="hero-card">
          <div className="eyebrow">
            {copy.profileLabel} <span aria-hidden="true">&lt;/&gt;</span>
          </div>
          {profile?.avatar ? (
            <div className="hero-portrait">
              <MediaImage media={profile.avatar} priority />
            </div>
          ) : (
            <div className="monogram" aria-hidden="true">
              {(profile?.name || "Chimeng Ly")
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <h2>{copy.profileTitle}</h2>
          <p>{copy.profileSummary}</p>
          <div className="hero-card-footer">{copy.profileFooter}</div>
        </aside>
      </section>
      <section className="section-block">
        <p className="eyebrow">{copy.focusEyebrow}</p>
        <h2>{copy.focusTitle}</h2>
        <div className="card-grid">
          {[
            ["01", copy.focus1Title, copy.focus1Description],
            ["02", copy.focus2Title, copy.focus2Description],
            ["03", copy.focus3Title, copy.focus3Description],
          ].map(([number, title, description]) => (
            <article className="content-card card-body" key={number}>
              <span className="eyebrow">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section-block">
        <div className="section-top">
          <div>
            <p className="eyebrow">{copy.projectsEyebrow}</p>
            <h2>{copy.projectsTitle}</h2>
          </div>
          <Link className="text-link" href="/projects">
            {copy.allProjectsButton}
          </Link>
        </div>
        {!projects ? (
          <Unavailable />
        ) : projects.data.length ? (
          <div className="card-grid">
            {projects.data.map((item) => (
              <ProjectCard item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <EmptyState>{copy.projectsEmpty}</EmptyState>
        )}
      </section>
      <section className="section-block">
        <p className="eyebrow">{copy.technologiesEyebrow}</p>
        <h2>{copy.technologiesTitle}</h2>
        <div className="badge-row spacious">
          {technologies?.data.map((t) => (
            <TechnologyBadge key={t.id}>{t.name}</TechnologyBadge>
          ))}
        </div>
        <Link className="text-link" href="/skills">
          {copy.skillsButton}
        </Link>
      </section>
      <section className="section-block">
        <div className="section-top">
          <h2>{copy.experienceTitle}</h2>
          <Link className="text-link" href="/experience">
            {copy.experienceButton}
          </Link>
        </div>
        {experience?.data.length ? (
          experience.data.map((item) => (
            <article className="content-card card-body" key={item.id}>
              <h3>{item.role}</h3>
              <p>{item.organization}</p>
            </article>
          ))
        ) : (
          <EmptyState>{copy.experienceEmpty}</EmptyState>
        )}
      </section>
      <section className="contact-cta">
        <p className="eyebrow">{copy.contactEyebrow}</p>
        <h2>{copy.contactTitle}</h2>
        <p>
          {profile?.availability ||
            "Available for Backend, Full-Stack, Mobile, and Software Engineering opportunities."}
        </p>
        <Link className="button" href="/contact">
          {copy.ctaButton}
        </Link>
      </section>
    </main>
  );
}
