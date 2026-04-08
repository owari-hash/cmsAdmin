"use client";
import { useEffect } from "react";
import { useThemeStore, useAuthStore, ACCENT_THEMES } from "@/lib/store";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const accent = useThemeStore((s) => s.accent);
  const syncTokens = useAuthStore((s) => s.syncTokens);

  // Sync persisted tokens into the API module on first mount
  useEffect(() => {
    syncTokens();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const vars = ACCENT_THEMES[accent]?.vars ?? ACCENT_THEMES.indigo.vars;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [accent]);

  return <>{children}</>;
}
