import { PortfolioNavigation } from "./portfolio-navigation";
import { optionalContent } from "@/services/content";

function profileUrl(value: string | undefined, ...hosts: string[]) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      hosts.some(
        (host) => url.hostname === host || url.hostname === `www.${host}`,
      ) &&
      url.pathname !== "/"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export async function SiteHeader() {
  const profile = (await optionalContent("profile"))?.data[0];
  const socialLinks = await optionalContent("social-links", "per_page=100");
  const github = socialLinks?.data.find(
    (item) => item.platform?.toLowerCase() === "github",
  )?.url;
  const linkedin = socialLinks?.data.find(
    (item) => item.platform?.toLowerCase() === "linkedin",
  )?.url;
  const telegram = socialLinks?.data.find(
    (item) => item.platform?.trim().toLowerCase() === "telegram",
  )?.url;
  const facebook = socialLinks?.data.find(
    (item) => item.platform?.trim().toLowerCase() === "facebook",
  )?.url;
  const profiles = [
    {
      label: "Telegram",
      href: profileUrl(telegram, "t.me", "telegram.me"),
      path: "M21.4 3.4 18.2 20c-.2 1.2-.9 1.5-1.9.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.4-.1-.6-.6-.2L5.7 13.7l-4.8-1.5c-1-.3-1-1 .2-1.5L20 3.4c.9-.3 1.6.2 1.4 0Z",
    },
    {
      label: "Facebook",
      href: profileUrl(facebook, "facebook.com", "m.facebook.com", "fb.com"),
      path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.71 4.53-4.71 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.28h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z",
    },
    {
      label: "GitHub",
      href: profileUrl(
        github || process.env.NEXT_PUBLIC_GITHUB_URL,
        "github.com",
      ),
      path: "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.98c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.59c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
    },
    {
      label: "LinkedIn",
      href: profileUrl(
        linkedin || process.env.NEXT_PUBLIC_LINKEDIN_URL,
        "linkedin.com",
      ),
      path: "M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 9h3v12h-3V9Zm5.5 0h3v1.6c.7-1.1 1.8-1.9 3.7-1.9 3.1 0 4.3 2 4.3 5V21h-3v-6.4c0-1.6-.3-3-2.2-3-2 0-2.8 1.5-2.8 3.3V21H9V9Z",
    },
  ];
  return (
    <PortfolioNavigation logo={profile?.logo}>
      <div className="header-socials" role="group" aria-label="Social profiles">
        {profiles.map((profile) => {
          const icon = (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d={profile.path} />
            </svg>
          );
          return profile.href ? (
            <a
              key={profile.label}
              href={profile.href}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-button"
              aria-label={`${profile.label} profile (opens in a new tab)`}
              title={profile.label}
            >
              {icon}
            </a>
          ) : (
            <span
              key={profile.label}
              className="icon-button social-unconfigured"
              role="img"
              aria-label={`${profile.label} profile not added yet`}
              title={`${profile.label} profile not added yet`}
            >
              {icon}
            </span>
          );
        })}
      </div>
    </PortfolioNavigation>
  );
}
