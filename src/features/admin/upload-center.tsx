import Link from "next/link";
const areas = [
  [
    "education",
    "Education photos & documents",
    "Edit your education to upload a campus photo, diploma image, or supporting PDF, then save the entry.",
  ],
  [
    "website",
    "Profile photo & portfolio logo",
    "Upload your portrait or replace your CL logo, then save your profile.",
  ],
  [
    "resumes",
    "Resume / CV",
    "Add or edit a resume, upload your PDF, choose Visible, and save to show it on your website.",
  ],
  [
    "projects",
    "Project screenshots & diagrams",
    "Edit a project to upload its cover, screenshots, architecture diagram and database diagram.",
  ],
  [
    "certifications",
    "Certificates",
    "Add a certification with its image and optional certificate PDF.",
  ],
  [
    "blog",
    "Blog images",
    "Edit a post to upload its cover and article gallery images.",
  ],
  [
    "engineering",
    "Engineering diagrams",
    "Edit an engineering article to upload diagrams and supporting images.",
  ],
  [
    "experience",
    "Company logos",
    "Edit an experience entry to upload its company logo.",
  ],
  [
    "media",
    "All photos & files",
    "Upload files for later use, edit alt text, or manage your media library.",
  ],
];
export function UploadCenter() {
  return (
    <section>
      <p className="eyebrow">Your portfolio assets</p>
      <h1>Photos & uploads</h1>
      <p className="lede">
        Choose where your file should appear. Upload directly in that editor,
        then save the entry.
      </p>
      <div className="admin-quick-actions">
        {areas.map(([path, title, description]) => (
          <Link className="quick-edit-card" href={"/admin/" + path} key={path}>
            <strong>{title}</strong>
            <span>{description}</span>
            <span className="text-link">Open uploader →</span>
          </Link>
        ))}
      </div>
      <p className="muted">
        Photos: JPG, PNG or WEBP. Documents: PDF. Maximum 10 MB per file.
        Uploading adds a file to your library; saving the entry connects it to
        your website.
      </p>
    </section>
  );
}
