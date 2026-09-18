import { AdminShell } from "@/features/admin/admin-shell";

export default function AdminWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content">
      <AdminShell />
      {children}
    </main>
  );
}
