import type { MetadataRoute } from "next";
import { navigation } from "@/lib/navigation";
import { listContent } from "@/services/content";
import { getSiteUrl } from "@/lib/site-url";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = navigation.map((n) => ({
    url: base + n.href,
  }));
  for (const section of ["projects", "blog"]) {
    let page = 1;
    try {
      for (;;) {
        const result = await listContent(section, "per_page=100&page=" + page);
        entries.push(
          ...result.data.map((item) => ({
            url: base + "/" + section + "/" + item.slug,
            lastModified: item.updated_at
              ? new Date(item.updated_at)
              : undefined,
          })),
        );
        if (!result.meta || page >= result.meta.last_page) break;
        page++;
      }
    } catch {
      /* Static navigation stays available during API downtime. */
    }
  }
  return entries;
}
