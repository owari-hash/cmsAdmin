"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "1";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  // Preview pages are publicly accessible — no login required
  const isPreview = pathname?.endsWith("/preview");

  useEffect(() => {
    if (!DEV_AUTH && !user && !isPreview) router.replace("/login");
  }, [user, router, isPreview]);

  if (!DEV_AUTH && !user && !isPreview) return null;

  return <>{children}</>;
}
