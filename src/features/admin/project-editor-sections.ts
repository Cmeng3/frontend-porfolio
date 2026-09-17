export const projectEditorSections = [
  {
    title: "Publishing",
    description:
      "Only Public + Visible projects appear on your website. Featured projects also appear in featured sections.",
    fields: ["published_at", "is_visible", "is_featured", "sort_order"],
  },
  {
    title: "Project overview",
    description:
      "Introduce the project, your contribution, and the technologies used.",
    fields: [
      "title",
      "slug",
      "summary",
      "project_category_id",
      "status",
      "role",
      "technology_ids",
      "repository_url",
      "demo_url",
      "started_on",
      "ended_on",
    ],
  },
  {
    title: "Case study",
    description:
      "Explain the problem, engineering decisions, and lessons learned. Markdown is supported.",
    fields: [
      "description",
      "problem",
      "target_users",
      "solution",
      "key_features",
      "architecture",
      "database_design",
      "api_architecture",
      "challenges",
      "outcomes",
      "lessons_learned",
      "future_improvements",
    ],
  },
  {
    title: "Images & diagrams",
    description:
      "Upload a cover, screenshots, and architecture diagrams. Save changes to attach your uploads.",
    fields: [
      "cover_media_id",
      "media_ids",
      "architecture_media_id",
      "database_media_id",
    ],
  },
];

export function isProjectPublic(publishedAt: unknown): boolean {
  return (
    typeof publishedAt === "string" &&
    new Date(publishedAt).getTime() <= Date.now()
  );
}
