import { listContent, optionalContent, queryString } from "@/services/content";
import {
  BlogCard,
  EmptyState,
  Pagination,
  ProjectCard,
  Unavailable,
} from "@/components/ui/content-ui";
import type { SearchParams } from "@/types/content";
export async function ContentListing({
  section,
  params,
}: {
  section: "projects" | "blog" | "engineering";
  params: SearchParams;
}) {
  const categoriesResource =
    section === "projects" ? "project-categories" : "blog-categories";
  const [result, categories, technologies, tags, featured] = await Promise.all([
    listContent(section, queryString(params)).catch(() => null),
    optionalContent(categoriesResource, "per_page=100"),
    section === "projects"
      ? optionalContent("technologies", "per_page=100")
      : null,
    section === "blog" ? optionalContent("blog-tags", "per_page=100") : null,
    section === "projects"
      ? optionalContent("projects", "featured=1&per_page=3")
      : null,
  ]);
  const selected = (key: string) =>
    typeof params[key] === "string" ? params[key] : "";
  return (
    <>
      {featured && featured.data.length > 0 && (
        <section className="section-block">
          <h2>Featured projects</h2>
          <div className="card-grid">
            {featured.data.map((item) => (
              <ProjectCard item={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
      <section className="section-block">
        <h2>
          {section === "projects"
            ? "All projects"
            : section === "blog"
              ? "Articles & notes"
              : "Engineering notes"}
        </h2>
        <form className="filter-bar" action={"/" + section}>
          <label>
            Search
            <input
              name="search"
              defaultValue={selected("search")}
              placeholder="Search by title"
            />
          </label>
          <label>
            Category
            <select name="category" defaultValue={selected("category")}>
              <option value="">All categories</option>
              {categories?.data.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {technologies && (
            <label>
              Technology
              <select name="technology" defaultValue={selected("technology")}>
                <option value="">All technologies</option>
                {technologies.data.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {tags && (
            <label>
              Tag
              <select name="tag" defaultValue={selected("tag")}>
                <option value="">All tags</option>
                {tags.data.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Sort
            <select name="sort" defaultValue={selected("sort") || "newest"}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
          </label>
          <button className="button" type="submit">
            Apply filters
          </button>
        </form>
        {!result ? (
          <Unavailable />
        ) : result.data.length === 0 ? (
          <EmptyState>
            No {section === "projects" ? "projects" : "articles"} match this
            selection. Try another filter or check back soon.
          </EmptyState>
        ) : (
          <>
            <div className="card-grid">
              {result.data.map((item) =>
                section === "projects" ? (
                  <ProjectCard item={item} key={item.id} />
                ) : (
                  <BlogCard item={item} section={section} key={item.id} />
                ),
              )}
            </div>
            <Pagination result={result} params={params} path={"/" + section} />
          </>
        )}
      </section>
    </>
  );
}
