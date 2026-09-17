import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/admin-shell";
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return (
    <main id="main-content">
      <AdminShell />
    </main>
  );
}
