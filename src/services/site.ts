import { cache } from "react";
import { optionalContent } from "./content";
import { readWebsiteCopy } from "@/lib/website-copy";
export const siteSettings = cache(async () => {
  const result = await optionalContent("site-settings", "per_page=100");
  return readWebsiteCopy(
    result?.data.find((item) => item.key === "site")?.value,
  );
});
