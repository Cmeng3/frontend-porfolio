import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteSettings } from "@/services/site";
import { optionalContent } from "@/services/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettings();
  const logo = (await optionalContent("profile"))?.data[0]?.logo;
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
      default: settings.title,
      template: "%s | Chimeng Ly",
    },
    description: settings.description,
    icons: logo
      ? {
          icon: [{ url: logo.url, type: logo.mime_type || undefined }],
          apple: logo.url,
        }
      : undefined,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.title,
      description: settings.description,
      type: "website",
      locale: "en_US",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="portfolio-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:p-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
