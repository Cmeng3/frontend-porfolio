import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminMenu } from "@/lib/admin-navigation";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!adminMenu.some(([key]) => key === section)) notFound();
  return null;
}
