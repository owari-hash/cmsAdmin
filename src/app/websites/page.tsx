"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { getProjects, buildProject, stopProject, ApiError } from "@/lib/api";
import { Project } from "@/lib/types";

export default function WebsitesPage() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleBuild(name: string) {
    setActionLoading(`build-${name}`);
    try {
      await buildProject(name);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStop(name: string) {
    setActionLoading(`stop-${name}`);
    try {
      await stopProject(name);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setActionLoading(null);
    }
  }

  const boundProjects = user?.projects?.map((p) => p.projectName) ?? [];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Миний төслүүд</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
            {loading ? "Уншиж байна..." : `Нийт ${projects.length} төсөл`}
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Шинэчлэх
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-slate-900 dark:text-white font-semibold text-lg">Төсөл олдсонгүй</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Танд одоогоор нэмэгдсэн төсөл байхгүй байна.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, i) => (
            <div key={project.projectName ?? i} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProjectRow
                project={project}
                userRoles={user?.projects?.find((p) => p.projectName === project.projectName)?.roles ?? []}
                onBuild={() => handleBuild(project.projectName)}
                onStop={() => handleStop(project.projectName)}
                buildLoading={actionLoading === `build-${project.projectName}`}
                stopLoading={actionLoading === `stop-${project.projectName}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  userRoles,
  onBuild,
  onStop,
  buildLoading,
  stopLoading,
}: {
  project: Project;
  userRoles: string[];
  onBuild: () => void;
  onStop: () => void;
  buildLoading: boolean;
  stopLoading: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = (project.status as string | undefined) ?? "unknown";
  const isRunning = status === "running";
  const isBuilding = status === "building";

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-slate-900/50">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent-faint)" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-500)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-900 dark:text-white font-semibold">{project.projectName}</p>
            <StatusBadge status={status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            {project.domain && (
              <p className="text-slate-500 text-xs">{project.domain as string}</p>
            )}
            {userRoles.length > 0 && (
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                {userRoles.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <Link
            href={`/websites/${project.projectName}/edit`}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Засварлах</span>
          </Link>

          {/* Build */}
          {!isRunning && !isBuilding && (
            <button
              onClick={onBuild}
              disabled={buildLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent-600)" }}
            >
              {buildLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="hidden sm:inline">Нийтлэх</span>
            </button>
          )}

          {/* Stop */}
          {isRunning && (
            <button
              onClick={onStop}
              disabled={stopLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              {stopLoading ? "..." : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span className="hidden sm:inline">Зогсоох</span>
                </>
              )}
            </button>
          )}

          {isBuilding && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Бүтээж байна...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: "bg-green-500/10 text-green-600 dark:text-green-400",
    building: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    stopped: "bg-slate-200 dark:bg-slate-600/50 text-slate-500 dark:text-slate-400",
    unknown: "bg-slate-200 dark:bg-slate-600/50 text-slate-500 dark:text-slate-400",
  };
  const labels: Record<string, string> = {
    running: "Ажиллаж байна",
    building: "Бүтээж байна",
    stopped: "Зогссон",
    unknown: "Тодорхойгүй",
  };
  const cls = map[status] ?? map.unknown;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}
