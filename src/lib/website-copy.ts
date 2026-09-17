export const websiteDefaults = {
  title: "Chimeng Ly | Software Developer",
  description:
    "Computer Science graduate focused on backend systems, REST APIs, full-stack and mobile development.",
  footer: "Backend. Full Stack. Mobile.",
  heroGreeting: "Hi, I’m",
  heroBadge: "Open to engineering opportunities",
  profileLabel: "Developer profile",
  profileTitle: "Software with a purpose.",
  profileSummary:
    "A Computer Science graduate focused on useful software, clear architecture, and practical problem solving.",
  profileFooter: "Backend / Full Stack / Mobile",
  focusEyebrow: "What I focus on",
  focusTitle: "From application logic to deployment.",
  focus1Title: "Backend & APIs",
  focus1Description:
    "Application logic, REST APIs, authentication, and maintainable services.",
  focus2Title: "Web & mobile",
  focus2Description:
    "Connected full-stack and mobile applications built around real user needs.",
  focus3Title: "Data & infrastructure",
  focus3Description:
    "Database design, cloud deployment, DevOps, and system architecture.",
  projectsEyebrow: "Selected work",
  projectsTitle: "Featured projects",
  projectsEmpty:
    "Project case studies are being prepared. They will appear here once published.",
  technologiesEyebrow: "The toolkit",
  technologiesTitle: "Technologies",
  experienceTitle: "Experience",
  experienceEmpty: "Experience details will be shared when confirmed.",
  contactEyebrow: "Let’s connect",
  contactTitle: "Useful software starts with a conversation.",
  projectsButton: "View projects ↗",
  resumeButton: "Download CV",
  contactButton: "Contact me",
  allProjectsButton: "All projects ↗",
  skillsButton: "Explore skills by category ↗",
  experienceButton: "View timeline ↗",
  ctaButton: "Get in touch ↗",
};
export type WebsiteCopy = typeof websiteDefaults;
export function readWebsiteCopy(value: unknown): WebsiteCopy {
  const stored =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    Object.entries(websiteDefaults).map(([key, fallback]) => [
      key,
      typeof stored[key] === "string" ? stored[key] : fallback,
    ]),
  ) as WebsiteCopy;
}
