import { siteSettings } from "@/services/site";
import Link from "next/link";
import { optionalContent } from "@/services/content";
export async function SiteFooter() {
  const settings = await siteSettings();
  const profiles = await optionalContent("profile");
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-10">
        <p>
          © {new Date().getFullYear()} {profiles?.data[0]?.name || "Chimeng Ly"}
        </p>
        <p>{settings.footer}</p>
        <Link className="text-link" href="/admin/website">
          Manage website
        </Link>
      </div>
    </footer>
  );
}
