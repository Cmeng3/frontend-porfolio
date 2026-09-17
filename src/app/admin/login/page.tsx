import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main id="main-content">
      <AdminShell initialSection="login" />
    </main>
  );
}
