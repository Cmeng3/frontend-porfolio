import type { Metadata } from "next";
import { AdminLogin } from "@/features/admin/admin-login";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main id="main-content">
      <AdminLogin />
    </main>
  );
}
