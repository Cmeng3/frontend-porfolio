import { siteSettings } from "@/services/site";
import { ManageWebsiteLink } from "./manage-website-link";
import { optionalContent } from "@/services/content";
export async function SiteFooter() {
  const [settings, profiles] = await Promise.all([
    siteSettings(),
    optionalContent("profile"),
  ]);
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-10">
        <p>
          © {new Date().getFullYear()} {profiles?.data[0]?.name || "Chimeng Ly"}
        </p>
        <p>{settings.footer}</p>
        <ManageWebsiteLink />
      </div>
    </footer>
  );
}
