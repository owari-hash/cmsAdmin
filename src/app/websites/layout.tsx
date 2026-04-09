"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import AdminShell from "@/components/layout/AdminShell";

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "1";

export default function WebsitesLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!DEV_AUTH && !user) router.replace("/login");
  }, [user, router]);

  if (!DEV_AUTH && !user) return null;

  // Editor is full-screen — no sidebar wrapper
  if (pathname.includes("/edit")) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}
