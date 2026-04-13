"use client";
import { usePathname } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";

export default function WebsitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Editor is full-screen — no sidebar wrapper
  if (pathname.includes("/edit")) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}
