"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import AdminShell from "@/components/layout/AdminShell";

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "1";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!DEV_AUTH && !user) router.replace("/login");
  }, [user, router]);

  if (!DEV_AUTH && !user) return null;

  return <AdminShell>{children}</AdminShell>;
}
