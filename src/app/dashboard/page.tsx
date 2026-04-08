"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { getProjects } from "@/lib/api";
import { Project } from "@/lib/types";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const running = projects.filter((p) => p.status === "running").length;
  const building = projects.filter((p) => p.status === "building").length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Тавтай морилно уу 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {user?.email} · {user?.role}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard
          label="Нийт төсөл"
          value={loading ? "–" : String(projects.length)}
          bgClass="bg-[var(--accent-faint)]"
          textClass="text-[var(--accent-500)]"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <StatCard
          label="Ажиллаж байна"
          value={loading ? "–" : String(running)}
          bgClass="bg-green-500/10"
          textClass="text-green-600 dark:text-green-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Бүтээгдэж байна"
          value={loading ? "–" : String(building)}
          bgClass="bg-yellow-500/10"
          textClass="text-yellow-600 dark:text-yellow-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
      </div>

      {/* Recent projects + bound projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Сүүлийн төслүүд</h2>
            <Link href="/websites" className="text-sm transition-colors" style={{ color: "var(--accent-500)" }}>
              Бүгдийг харах →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center">
              <p className="text-slate-700 dark:text-slate-300 font-medium">Одоогоор төсөл байхгүй</p>
              <p className="text-slate-500 text-sm mt-1">Системийн администратортай холбогдоно уу</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((proj) => (
                <div key={proj.projectName} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-900 dark:text-white font-medium truncate">{proj.projectName}</p>
                    {proj.domain && <p className="text-slate-500 text-xs mt-0.5 truncate">{proj.domain as string}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={(proj.status as string) ?? "unknown"} />
                    <Link href={`/websites/${proj.projectName}/edit`} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bound projects sidebar */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">Миний хандалт</h2>
          <div className="space-y-3">
            {(user?.projects ?? []).map((p) => (
              <Link
                key={p.projectName}
                href={`/websites/${p.projectName}/edit`}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[var(--accent-border)] rounded-xl p-4 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent-faint)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent-500)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{p.projectName}</p>
                  <p className="text-slate-500 text-xs truncate">{p.roles.join(", ")}</p>
                </div>
              </Link>
            ))}

            {(user?.projects ?? []).length === 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-500 text-sm">Холбогдсон төсөл байхгүй</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, bgClass, textClass, icon }: { label: string; value: string; bgClass: string; textClass: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 flex sm:block items-center gap-4">
      <div className={`w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 sm:mb-3 ${bgClass} ${textClass}`}>{icon}</div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
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
    building: "Бүтээгдэж байна",
    stopped: "Зогссон",
    unknown: "Тодорхойгүй",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${map[status] ?? map.unknown}`}>
      {labels[status] ?? status}
    </span>
  );
}
