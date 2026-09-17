import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/admin-shell";

export const metadata: Metadata = {
  title: "Edit website",
  robots: { index: false, follow: false },
};

export default function WebsiteEditorPage() {
  return (
    <main id="main-content">
      <AdminShell initialSection="website" />
    </main>
  );
}
