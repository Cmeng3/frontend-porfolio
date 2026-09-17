export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Education", href: "/education" },
  { label: "Certifications", href: "/certifications" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
] as const;

export const sectionDescriptions: Record<string, string> = {
  about:
    "Computer Science graduate interested in backend development, full-stack and mobile systems, cloud computing, and practical software engineering.",
  skills:
    "Backend, frontend, mobile, databases, cloud, and the tools that connect them. A categorized skills overview is on its way.",
  projects:
    "Project case studies will explore real-world problems, implementation decisions, and lessons learned. Projects have not been published yet.",
  experience:
    "Professional experience and responsibilities will be added here once the details are ready to share.",
  education:
    "Bachelor of Computer Science — Paragon International University. Coursework and further details will be added here.",
  certifications: "No certifications have been published yet.",
  blog: "Notes on software engineering and what I am learning. No articles have been published yet.",
  resume:
    "The resume PDF is not available yet. A preview and download will appear once it has been uploaded.",
  contact:
    "Available for Backend, Full-Stack, Mobile, and Software Engineering opportunities. Contact details and the message form will be added soon.",
};
