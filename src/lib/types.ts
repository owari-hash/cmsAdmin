// ─── API v2 types ─────────────────────────────────────────────────────────────

export interface ApiUserProject {
  projectName: string;
  roles: string[];
}

export interface ApiUser {
  email: string;
  role: string;
  projects: ApiUserProject[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  projectName: string;
  status?: string;        // running | stopped | building | unknown
  domain?: string;
  [key: string]: unknown; // other fields the backend may return
}

// ─── Design ───────────────────────────────────────────────────────────────────

export interface DesignTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  darkMode: boolean;
  customTokens?: Record<string, string>;
}

export interface DesignPage {
  route: string;
  title: string;
  description: string;
}

export interface Design {
  projectName: string;
  domain: string;
  theme: DesignTheme;
  pages: DesignPage[];
}

// ─── Components ───────────────────────────────────────────────────────────────

export interface ComponentInstance {
  instanceId: string;
  componentType: string;
  pageRoute: string;
  order: number;
  props: Record<string, unknown>;
}

// ─── Domain ───────────────────────────────────────────────────────────────────

export interface DomainBinding {
  domain: string;
  upstreamHost?: string;
  upstreamPort?: number;
  isEnabled: boolean;
}

// ─── Legacy admin user (kept for Sidebar display) ────────────────────────────

export interface AdminUser {
  email: string;
  role: string;
  projects: ApiUserProject[];
}
