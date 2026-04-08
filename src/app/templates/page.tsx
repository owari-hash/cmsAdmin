"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { getDesign } from "@/lib/api";
import { Design } from "@/lib/types";

export default function TemplatesPage() {
  const user = useAuthStore((s) => s.user);
  const [designs, setDesigns] = useState<(Design & { error?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.projects?.length) { setLoading(false); return; }
      const results = await Promise.all(
        user.projects.map((p) =>
          getDesign(p.projectName)
            .then((d) => ({ ...d }))
            .catch(() => ({ projectName: p.projectName, domain: "", theme: { primaryColor: "#6366f1", secondaryColor: "#0f172a", fontFamily: "Inter", darkMode: false }, pages: [], error: true }))
        )
      );
      setDesigns(results);
      setLoading(false);
    }
    load();
  }, [user]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Дизайн тохиргоо</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Төслүүдийн дизайн болон өнгөний тохиргоо</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden animate-pulse border border-slate-200 dark:border-slate-700">
              <div className="h-32 bg-slate-200 dark:bg-slate-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-16 text-center">
          <p className="text-slate-900 dark:text-white font-semibold">Дизайн олдсонгүй</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Системийн администратортай холбогдоно уу</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {designs.map((design) => (
            <DesignCard key={design.projectName} design={design} />
          ))}
        </div>
      )}
    </div>
  );
}

function DesignCard({ design }: { design: Design & { error?: boolean } }) {
  const primary = design.theme.primaryColor || "#6366f1";
  const secondary = design.theme.secondaryColor || "#0f172a";

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-colors group">
      {/* Color preview */}
      <div className="h-28 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${secondary}, ${primary})` }}>
        {design.error ? (
          <span className="text-white/60 text-xs">Дизайн байхгүй</span>
        ) : (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white/30" style={{ backgroundColor: primary }} />
            <div className="w-8 h-8 rounded-full border-2 border-white/30" style={{ backgroundColor: secondary }} />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {design.theme.darkMode && (
            <span className="text-xs bg-black/30 text-white px-2 py-0.5 rounded-full">Харанхуй</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-slate-900 dark:text-white font-semibold truncate">{design.projectName}</h3>
          {!design.error && (
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full flex-shrink-0">
              {design.pages.length} хуудас
            </span>
          )}
        </div>

        {!design.error && (
          <>
            <p className="text-slate-500 text-xs mb-1">
              Фонт: <span className="font-medium">{design.theme.fontFamily}</span>
            </p>
            {design.domain && (
              <p className="text-slate-500 text-xs truncate mb-3">{design.domain}</p>
            )}
          </>
        )}

        <div className="flex gap-2 mt-3">
          <Link
            href={`/websites/${design.projectName}/edit?tab=design`}
            className="flex-1 text-center text-white text-sm font-medium py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent-600)" }}
          >
            Засварлах
          </Link>
          <Link
            href={`/preview/${design.projectName}`}
            target="_blank"
            className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
