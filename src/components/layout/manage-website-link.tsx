"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ManageWebsiteLink() {
  const pathname = usePathname();
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!isAdminPage || pathname === "/admin/login") return null;

  return (
    <Link className="text-link" href="/admin">
      Manage website
    </Link>
  );
}
