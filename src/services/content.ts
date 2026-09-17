import { cache } from "react";
import { getApi } from "./api";
import type { Content, PageData, SearchParams } from "@/types/content";
export const listContent = cache(
  async (resource: string, query = ""): Promise<PageData<Content>> => {
    return getApi<Content[]>(resource + (query ? "?" + query : "")) as Promise<
      PageData<Content>
    >;
  },
);
export const getContent = cache((resource: string, slug: string) =>
  getApi<Content>(resource + "/" + encodeURIComponent(slug)),
);
export function queryString(
  params: SearchParams,
  overrides: Record<string, string> = {},
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (
      typeof value === "string" &&
      [
        "search",
        "category",
        "technology",
        "tag",
        "sort",
        "page",
        "featured",
      ].includes(key)
    )
      query.set(key, value);
  for (const [key, value] of Object.entries(overrides)) query.set(key, value);
  return query.toString();
}
export async function optionalContent(resource: string, query = "") {
  try {
    return await listContent(resource, query);
  } catch {
    return null;
  }
}
