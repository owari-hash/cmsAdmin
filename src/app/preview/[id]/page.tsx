"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDesign, getComponents } from "@/lib/api";
import { Design, ComponentInstance } from "@/lib/types";

export default function PreviewPage() {
  const params = useParams();
  const projectName = params.id as string;
  const [design, setDesign] = useState<Design | null>(null);
  const [pageComponents, setPageComponents] = useState<ComponentInstance[]>([]);
  const [activePage, setActivePage] = useState("/");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDesign(projectName)
      .then((d) => {
        setDesign(d);
        const firstRoute = d.pages[0]?.route ?? "/";
        setActivePage(firstRoute);
        return getComponents(projectName, firstRoute);
      })
      .then(setPageComponents)
      .catch((err) => setError(err instanceof Error ? err.message : "Алдаа гарлаа"))
      .finally(() => setLoading(false));
  }, [projectName]);

  async function loadPage(route: string) {
    setActivePage(route);
    try {
      const comps = await getComponents(projectName, route);
      setPageComponents(comps.sort((a, b) => a.order - b.order));
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-2">Вебсайт олдсонгүй</p>
          <p className="text-gray-500 text-sm">{error ?? projectName}</p>
        </div>
      </div>
    );
  }

  const primary = design.theme.primaryColor || "#2563eb";
  const secondary = design.theme.secondaryColor || "#0f172a";
  const font = design.theme.fontFamily || "Inter";

  return (
    <div style={{ fontFamily: font, backgroundColor: design.theme.darkMode ? secondary : "#fff", color: design.theme.darkMode ? "#f8fafc" : "#0f172a", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ backgroundColor: secondary, borderBottom: `1px solid rgba(255,255,255,0.08)` }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-white font-bold text-lg">{projectName}</span>
          <div className="flex items-center gap-1">
            {design.pages.map((page) => (
              <button
                key={page.route}
                onClick={() => loadPage(page.route)}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: activePage === page.route ? primary : "transparent",
                  color: activePage === page.route ? "#fff" : "rgba(255,255,255,0.7)",
                }}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {pageComponents.length === 0 ? (
          <div className="text-center py-24 opacity-40">
            <p className="text-lg font-semibold mb-1">
              {design.pages.find((p) => p.route === activePage)?.title ?? activePage}
            </p>
            <p className="text-sm">Энэ хуудсанд агуулга байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-12">
            {pageComponents.map((comp) => (
              <ComponentPreview key={comp.instanceId} component={comp} primary={primary} secondary={secondary} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: secondary, borderTop: `1px solid rgba(255,255,255,0.08)` }} className="mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">
            © {new Date().getFullYear()} {projectName}. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ComponentPreview({ component, primary, secondary }: { component: ComponentInstance; primary: string; secondary: string }) {
  const p = component.props as Record<string, string | boolean | string[] | Record<string, string>[]>;
  const type = component.componentType;

  if (type === "hero") {
    return (
      <section className="text-center py-16 sm:py-24 rounded-2xl" style={{ background: `linear-gradient(135deg, ${secondary}, ${primary}20)`, border: `1px solid ${primary}30` }}>
        <h1 className="text-3xl sm:text-5xl font-bold mb-6" style={{ color: primary }}>
          {String(p.title || "Welcome")}
        </h1>
        {p.subtitle && <p className="text-lg sm:text-xl opacity-70 mb-8 max-w-2xl mx-auto">{String(p.subtitle)}</p>}
        {Array.isArray(p.buttons) && p.buttons.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {(p.buttons as Record<string, string>[]).map((btn, i) => (
              <a key={i} href={btn.href ?? "#"} className="px-6 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: i === 0 ? primary : "transparent", color: i === 0 ? "#fff" : primary, border: `2px solid ${primary}` }}>
                {btn.text}
              </a>
            ))}
          </div>
        )}
      </section>
    );
  }

  if (type === "features") {
    const items = Array.isArray(p.features) ? p.features as Record<string, string>[] : [];
    return (
      <section className="py-8">
        {p.title && <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: primary }}>{String(p.title)}</h2>}
        {p.subtitle && <p className="text-center opacity-60 mb-8">{String(p.subtitle)}</p>}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border" style={{ borderColor: `${primary}20`, backgroundColor: `${primary}05` }}>
                <p className="font-semibold mb-2">{f.title}</p>
                <p className="text-sm opacity-60">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Generic fallback: render all string props as a card
  const strings = Object.entries(component.props).filter(([, v]) => typeof v === "string" && (v as string).length > 0);
  return (
    <section className="py-8">
      <div className="p-6 rounded-xl border" style={{ borderColor: `${primary}20`, backgroundColor: `${primary}05` }}>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded mb-4 inline-block" style={{ backgroundColor: `${primary}15`, color: primary }}>
          {type}
        </span>
        <div className="space-y-3 mt-3">
          {strings.map(([key, val]) => (
            <div key={key}>
              <p className="text-xs opacity-40 uppercase tracking-wider mb-0.5">{key}</p>
              <p className="text-sm">{String(val)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
