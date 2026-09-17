type SiteEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
};

function parseOrigin(value?: string): string | undefined {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  try {
    // Vercel's generated hostnames do not include a protocol.
    const url = new URL(
      candidate.includes("://") ? candidate : `https://${candidate}`,
    );
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      (url.hostname !== "localhost" && !url.hostname.includes(".")) ||
      /[\s<>\[\]"']/.test(candidate)
    ) {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}

export function getSiteUrl(
  environment: SiteEnvironment = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  },
): string {
  const configured = parseOrigin(environment.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;
  if (environment.NEXT_PUBLIC_SITE_URL?.trim()) {
    // Do not print the supplied value: environment variables may be misassigned.
    console.warn(
      "NEXT_PUBLIC_SITE_URL is invalid. Using the deployment hostname for metadata; set it to your frontend HTTPS URL.",
    );
  }
  return (
    parseOrigin(environment.VERCEL_PROJECT_PRODUCTION_URL) ||
    parseOrigin(environment.VERCEL_URL) ||
    "http://localhost:3000"
  );
}
