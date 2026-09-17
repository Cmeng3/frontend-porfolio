import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/ui/content-ui";
import { ContentListing } from "@/features/portfolio/listing";
import { CareerSection } from "@/features/portfolio/career";
import { AboutSection, SkillsSection } from "@/features/portfolio/profile";
import {
  ContactSection,
  ResumeSection,
} from "@/features/portfolio/contact-resume";
import type { SearchParams } from "@/types/content";
const sections: Record<string, [string, string]> = {
  about: ["About", "Practical software. Thoughtful engineering."],
  skills: ["Skills", "The tools I use and the technologies I’m learning."],
  projects: [
    "Projects",
    "Real-world problems, considered decisions, and the systems behind them.",
  ],
  experience: ["Experience", "Professional experience and the work behind it."],
  education: ["Education", "A foundation in computer science."],
  certifications: [
    "Certifications",
    "Verified learning and professional credentials.",
  ],
  blog: ["Blog", "Notes on building software and understanding how it works."],
  resume: ["Resume", "My background, experience, and skills in one place."],
  contact: ["Contact", "Have a role or a project in mind? Let’s talk."],
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const info = sections[section];
  return {
    title: info?.[0] || "Not found",
    description: info?.[1],
    alternates: { canonical: "/" + section },
    openGraph: { title: info?.[0], description: info?.[1], url: "/" + section },
  };
}
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { section } = await params;
  const info = sections[section];
  if (!info) notFound();
  const search = await searchParams;
  return (
    <main id="main-content" className="page-shell">
      <SectionTitle
        eyebrow={"Chimeng Ly / " + info[0]}
        title={info[0]}
        description={info[1]}
      />
      {section === "about" ? (
        <AboutSection />
      ) : section === "skills" ? (
        <SkillsSection />
      ) : section === "contact" ? (
        <ContactSection />
      ) : section === "resume" ? (
        <ResumeSection />
      ) : section === "projects" || section === "blog" ? (
        <ContentListing section={section} params={search} />
      ) : section === "experience" ||
        section === "education" ||
        section === "certifications" ? (
        <CareerSection section={section} />
      ) : null}
    </main>
  );
}
