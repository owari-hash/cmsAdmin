"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser } from "./types";
import { login as apiLogin, logout as apiLogout, setApiTokens, setOnRefreshFailed } from "./api";

// ─── Accent Themes ────────────────────────────────────────────────────────────

export const ACCENT_THEMES = {
  indigo: {
    label: "Индиго",
    preview: "#6366f1",
    vars: {
      "--accent-600": "#4f46e5",
      "--accent-500": "#6366f1",
      "--accent-400": "#818cf8",
      "--accent-faint": "rgba(99,102,241,0.1)",
      "--accent-faint-hover": "rgba(99,102,241,0.2)",
      "--accent-border": "rgba(99,102,241,0.5)",
    },
  },
  blue: {
    label: "Цэнхэр",
    preview: "#3b82f6",
    vars: {
      "--accent-600": "#2563eb",
      "--accent-500": "#3b82f6",
      "--accent-400": "#60a5fa",
      "--accent-faint": "rgba(59,130,246,0.1)",
      "--accent-faint-hover": "rgba(59,130,246,0.2)",
      "--accent-border": "rgba(59,130,246,0.5)",
    },
  },
  violet: {
    label: "Нил",
    preview: "#8b5cf6",
    vars: {
      "--accent-600": "#7c3aed",
      "--accent-500": "#8b5cf6",
      "--accent-400": "#a78bfa",
      "--accent-faint": "rgba(139,92,246,0.1)",
      "--accent-faint-hover": "rgba(139,92,246,0.2)",
      "--accent-border": "rgba(139,92,246,0.5)",
    },
  },
  emerald: {
    label: "Ногоон",
    preview: "#10b981",
    vars: {
      "--accent-600": "#059669",
      "--accent-500": "#10b981",
      "--accent-400": "#34d399",
      "--accent-faint": "rgba(16,185,129,0.1)",
      "--accent-faint-hover": "rgba(16,185,129,0.2)",
      "--accent-border": "rgba(16,185,129,0.5)",
    },
  },
  rose: {
    label: "Ягаан",
    preview: "#f43f5e",
    vars: {
      "--accent-600": "#e11d48",
      "--accent-500": "#f43f5e",
      "--accent-400": "#fb7185",
      "--accent-faint": "rgba(244,63,94,0.1)",
      "--accent-faint-hover": "rgba(244,63,94,0.2)",
      "--accent-border": "rgba(244,63,94,0.5)",
    },
  },
  amber: {
    label: "Шар",
    preview: "#f59e0b",
    vars: {
      "--accent-600": "#d97706",
      "--accent-500": "#f59e0b",
      "--accent-400": "#fbbf24",
      "--accent-faint": "rgba(245,158,11,0.1)",
      "--accent-faint-hover": "rgba(245,158,11,0.2)",
      "--accent-border": "rgba(245,158,11,0.5)",
    },
  },
} as const;

export type AccentTheme = keyof typeof ACCENT_THEMES;

// ─── Theme Store ──────────────────────────────────────────────────────────────

interface ThemeState {
  theme: "dark" | "light";
  accent: AccentTheme;
  toggleTheme: () => void;
  setAccent: (accent: AccentTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      accent: "indigo",
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setAccent: (accent) => set({ accent }),
    }),
    { name: "cms-theme" }
  )
);

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Called by ThemeProvider / API module to sync tokens after load */
  syncTokens: () => void;
}

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "1";

const DEV_USER: AdminUser = {
  email: "dev@local",
  role: "admin",
  projects: [],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEV_AUTH ? DEV_USER : null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        try {
          const res = await apiLogin(email, password);
          if (!res.success) return false;
          const user: AdminUser = {
            email: res.user.email,
            role: res.user.role,
            projects: res.user.projects,
          };
          set({ user, accessToken: res.accessToken, refreshToken: res.refreshToken });
          setApiTokens(res.accessToken, res.refreshToken);
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        // Best-effort API logout
        if (refreshToken) {
          try { await apiLogout(refreshToken); } catch {}
        }
        set({ user: null, accessToken: null, refreshToken: null });
        setApiTokens(null, null);
      },

      syncTokens: () => {
        const { accessToken, refreshToken } = get();
        setApiTokens(accessToken, refreshToken);
        // Wire logout callback for 401 cascades
        setOnRefreshFailed(() => {
          set({ user: null, accessToken: null, refreshToken: null });
          setApiTokens(null, null);
        });
      },
    }),
    { name: "cms-auth" }
  )
);
