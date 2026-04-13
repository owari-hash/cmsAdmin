"use client";
import AdminShell from "@/components/layout/AdminShell";

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
