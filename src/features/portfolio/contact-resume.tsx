import { optionalContent } from "@/services/content";
import {
  EmptyState,
  Unavailable,
  ExternalLink,
  safeUrl,
} from "@/components/ui/content-ui";
import { ContactForm } from "./contact-form";
import { ResumePages } from "./resume-pages";
import { resumeFileUrl } from "@/lib/resume";
export async function ContactSection() {
  const [profiles, socials] = await Promise.all([
    optionalContent("profile"),
    optionalContent("social-links"),
  ]);
  const profile = profiles?.data[0];
  return (
    <div className="contact-layout">
      <aside className="contact-details">
        <p className="eyebrow">
          <span className="status-dot" /> Open to opportunities
        </p>
        <h2>
          Good software starts
          <br />
          with a conversation.
        </h2>
        <p>
          {profile?.availability ||
            "Available for Backend, Full-Stack, Mobile, and Software Engineering opportunities."}
        </p>
        {profile?.public_email && (
          <div className="contact-direct">
            <span className="contact-note">Prefer email?</span>
            <a className="text-link" href={"mailto:" + profile.public_email}>
              {profile.public_email} ↗
            </a>
          </div>
        )}
        {profile?.location && (
          <p className="contact-location">Based in {profile.location}</p>
        )}
        <div className="link-row contact-socials">
          {socials?.data.map((s) => (
            <ExternalLink key={s.id} href={s.url}>
              {s.label || s.platform}
            </ExternalLink>
          ))}
        </div>
        <div className="contact-guidance">
          <h3>What to include</h3>
          <p>
            A short introduction, a little about the opportunity, and the best
            way to reach you. A job description or project link is welcome.
          </p>
        </div>
      </aside>
      <ContactForm />
    </div>
  );
}
export async function ResumeSection() {
  const result = await optionalContent("resumes", "per_page=1");
  if (!result) return <Unavailable />;
  const resume = result.data[0];
  const url = safeUrl(resume?.media?.url);
  if (!url)
    return (
      <EmptyState>
        The resume PDF will be available here once it has been uploaded.
      </EmptyState>
    );
  return (
    <>
      <div className="link-row">
        <a className="button" href={resumeFileUrl(resume.id, true)} download>
          Download resume PDF
        </a>
      </div>
      <ResumePages
        url={resumeFileUrl(resume.id)}
        title={resume.title || "Resume"}
      />
    </>
  );
}
