/**
 * API client for ClientAdmin API v2
 * Base: NEXT_PUBLIC_API_URL (default: http://localhost:4000/api/v2)
 */

import type {
  ApiUser, AuthTokens, Project, Design, DesignTheme, DesignPage,
  ComponentInstance, DomainBinding,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v2";

// ─── Token access (set by store on change) ────────────────────────────────────

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onRefreshFailed: (() => void) | null = null;

export function setApiTokens(access: string | null, refresh: string | null) {
  _accessToken = access;
  _refreshToken = refresh;
}

export function setOnRefreshFailed(fn: () => void) {
  _onRefreshFailed = fn;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface CallOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  projectId?: string;
  /** Skip auth header (for login/refresh) */
  noAuth?: boolean;
  /** Skip auto-retry on 401 (used inside refreshTokens itself) */
  noRetry?: boolean;
}

async function call<T>(path: string, opts: CallOptions = {}): Promise<T> {
  const { method = "GET", body, projectId, noAuth, noRetry } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!noAuth && _accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;
  if (projectId) headers["x-project-id"] = projectId;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !noAuth && !noRetry && _refreshToken) {
    const ok = await attemptRefresh();
    if (ok) return call<T>(path, { ...opts, noRetry: true });
    _onRefreshFailed?.();
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      msg = json.message || json.error || msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }

  const json = await res.json();
  // Unwrap v2 envelope: { version, data: { ... } }
  return (json.data ?? json) as T;
}

/** Attempt token refresh; returns true if successful */
async function attemptRefresh(): Promise<boolean> {
  if (!_refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/core/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: _refreshToken }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    const data = json.data ?? json;
    if (data.accessToken) {
      _accessToken = data.accessToken;
      if (data.refreshToken) _refreshToken = data.refreshToken;
      // Persist updated tokens
      setApiTokens(_accessToken, _refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── 1. Authentication ────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return call<LoginResponse>("/core/auth/login", {
    method: "POST",
    body: { email, password },
    noAuth: true,
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await call("/core/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export async function getMe(): Promise<ApiUser> {
  return call<ApiUser>("/core/auth/me");
}

// ─── 2. Projects ──────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const result = await call<Project[] | { projects: Project[] }>("/core/projects");
  return Array.isArray(result) ? result : (result as { projects: Project[] }).projects ?? [];
}

export async function getProject(name: string): Promise<Project> {
  return call<Project>(`/core/projects/${name}`);
}

export async function buildProject(name: string): Promise<void> {
  await call(`/core/projects/${name}/build`, { method: "POST" });
}

export async function stopProject(name: string): Promise<void> {
  await call(`/core/projects/${name}/stop`, { method: "POST" });
}

// ─── 3. Design ────────────────────────────────────────────────────────────────

export async function getDesign(name: string): Promise<Design> {
  return call<Design>(`/core/designs/${name}`);
}

export async function upsertDesign(design: {
  projectName: string;
  domain?: string;
  theme?: Partial<DesignTheme>;
  pages?: DesignPage[];
}): Promise<Design> {
  return call<Design>("/core/designs", {
    method: "POST",
    body: design,
    projectId: design.projectName,
  });
}

export async function patchDesign(
  name: string,
  patch: { theme?: Partial<DesignTheme>; pages?: DesignPage[]; domain?: string },
  projectId: string
): Promise<Design> {
  return call<Design>(`/core/designs/${name}`, {
    method: "PATCH",
    body: patch,
    projectId,
  });
}

export async function deleteDesign(name: string, projectId: string): Promise<void> {
  await call(`/core/designs/${name}`, { method: "DELETE", projectId });
}

// ─── 4. Components ────────────────────────────────────────────────────────────

export async function getComponents(projectId: string, pageRoute: string): Promise<ComponentInstance[]> {
  const result = await call<ComponentInstance[] | { instances: ComponentInstance[] }>(
    `/core/components?pageRoute=${encodeURIComponent(pageRoute)}`,
    { projectId }
  );
  return Array.isArray(result) ? result : (result as { instances: ComponentInstance[] }).instances ?? [];
}

export async function createComponent(
  projectId: string,
  data: { componentType: string; pageRoute: string; order: number; props: Record<string, unknown> }
): Promise<ComponentInstance> {
  return call<ComponentInstance>("/core/components", {
    method: "POST",
    body: data,
    projectId,
  });
}

export async function updateComponent(
  instanceId: string,
  props: Record<string, unknown>,
  projectId: string
): Promise<ComponentInstance> {
  return call<ComponentInstance>(`/core/components/${instanceId}`, {
    method: "PATCH",
    body: { props },
    projectId,
  });
}

export async function deleteComponent(instanceId: string, projectId: string): Promise<void> {
  await call(`/core/components/${instanceId}`, { method: "DELETE", projectId });
}

export async function reorderComponents(
  projectId: string,
  instances: { instanceId: string; order: number }[]
): Promise<void> {
  await call("/core/components/reorder", {
    method: "POST",
    body: { instances },
    projectId,
  });
}

// ─── 5. Domains ───────────────────────────────────────────────────────────────

export async function getDomains(projectId: string): Promise<DomainBinding[]> {
  const result = await call<DomainBinding[] | { domains: DomainBinding[] }>(
    "/infrastructure/domains",
    { projectId }
  );
  return Array.isArray(result) ? result : (result as { domains: DomainBinding[] }).domains ?? [];
}

export async function bindDomain(
  projectId: string,
  data: { domain: string; upstreamHost: string; upstreamPort: number }
): Promise<DomainBinding> {
  return call<DomainBinding>("/infrastructure/domains/bind", {
    method: "POST",
    body: data,
    projectId,
  });
}

export async function setDomainEnabled(
  domain: string,
  isEnabled: boolean,
  projectId: string
): Promise<void> {
  await call(`/infrastructure/domains/${encodeURIComponent(domain)}/enabled`, {
    method: "PATCH",
    body: { isEnabled },
    projectId,
  });
}
