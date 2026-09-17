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
    <div className="about-grid">
      <ContactForm />
      <aside className="profile-aside">
        <h2>Let’s build something useful.</h2>
        <p>
          {profile?.availability ||
            "Available for Backend, Full-Stack, Mobile, and Software Engineering opportunities."}
        </p>
        {profile?.public_email && (
          <a className="text-link" href={"mailto:" + profile.public_email}>
            {profile.public_email}
          </a>
        )}
        <div className="link-row">
          {socials?.data.map((s) => (
            <ExternalLink key={s.id} href={s.url}>
              {s.label || s.platform}
            </ExternalLink>
          ))}
        </div>
      </aside>
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
