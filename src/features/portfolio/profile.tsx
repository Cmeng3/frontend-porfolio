import { listContent } from "@/services/content";
import {
  EmptyState,
  Unavailable,
  MediaImage,
  TechnologyBadge,
} from "@/components/ui/content-ui";
import { RichContent } from "@/components/ui/rich-content";
export async function AboutSection() {
  const result = await listContent("profile").catch(() => null);
  if (!result) return <Unavailable />;
  const profile = result.data[0];
  if (!profile) return <EmptyState />;
  return (
    <div className="about-grid">
      <div>
        {[
          ["About me", profile.biography],
          ["What I focus on", profile.focus],
          ["Currently learning", profile.learning],
          ["Developer philosophy", profile.philosophy],
        ].map(([heading, body]) =>
          body ? (
            <section className="section-block" key={heading}>
              <h2>{heading}</h2>
              <RichContent content={body} />
            </section>
          ) : null,
        )}
      </div>
      <aside className="profile-aside">
        <MediaImage media={profile.avatar} />
        <h2>{profile.name}</h2>
        <p>{profile.headline}</p>
        <p className="muted">{profile.location}</p>
      </aside>
    </div>
  );
}
export async function SkillsSection() {
  const result = await listContent("skills", "per_page=100").catch(() => null);
  if (!result) return <Unavailable />;
  if (!result.data.length) return <EmptyState />;
  const groups = Map.groupBy(
    result.data,
    (item) => item.category?.name || "Other",
  );
  return (
    <div className="card-grid">
      {Array.from(groups).map(([category, skills]) => (
        <section className="content-card card-body" key={category}>
          <h2>{category}</h2>
          <ul className="skill-list">
            {skills.map((skill) => (
              <li key={skill.id}>
                <span>
                  {skill.icon && <span aria-hidden="true">{skill.icon} </span>}
                  {skill.name}
                </span>
                {skill.proficiency && (
                  <TechnologyBadge>{skill.proficiency}</TechnologyBadge>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
