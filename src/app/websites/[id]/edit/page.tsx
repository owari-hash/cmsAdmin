"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDesign, patchDesign, getComponents, updateComponent, createComponent, deleteComponent,
  buildProject,
} from "@/lib/api";
import { Design, ComponentInstance, DesignPage } from "@/lib/types";

type Tab = "design" | "components";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = params.id as string;

  const [tab, setTab] = useState<Tab>("design");
  const [design, setDesign] = useState<Design | null>(null);
  const [loadingDesign, setLoadingDesign] = useState(true);
  const [designError, setDesignError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [building, setBuilding] = useState(false);

  // Components tab state
  const [activePage, setActivePage] = useState<string>("/");
  const [components, setComponents] = useState<ComponentInstance[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  const loadDesign = useCallback(async () => {
    setLoadingDesign(true);
    setDesignError(null);
    try {
      const d = await getDesign(projectName);
      setDesign(d);
      if (d.pages[0]) setActivePage(d.pages[0].route);
    } catch (err) {
      setDesignError(err instanceof Error ? err.message : "Дизайн ачааллахад алдаа гарлаа");
    } finally {
      setLoadingDesign(false);
    }
  }, [projectName]);

  const loadComponents = useCallback(async (route: string) => {
    setLoadingComponents(true);
    try {
      const data = await getComponents(projectName, route);
      setComponents(data.sort((a, b) => a.order - b.order));
    } catch {
      setComponents([]);
    } finally {
      setLoadingComponents(false);
    }
  }, [projectName]);

  useEffect(() => { loadDesign(); }, [loadDesign]);

  useEffect(() => {
    if (tab === "components" && activePage) loadComponents(activePage);
  }, [tab, activePage, loadComponents]);

  async function handleSaveTheme(theme: Design["theme"]) {
    if (!design) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await patchDesign(projectName, { theme }, projectName);
      setDesign(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  async function handleBuild() {
    setBuilding(true);
    try {
      await buildProject(projectName);
      alert("Нийтлэх хүсэлт амжилттай илгээгдлээ.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setBuilding(false);
    }
  }

  if (loadingDesign) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "var(--accent-500)", borderTopColor: "transparent" }} />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (designError) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-900 dark:text-white font-semibold mb-2">Алдаа гарлаа</p>
          <p className="text-slate-500 text-sm mb-4">{designError}</p>
          <Link href="/websites" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">← Буцах</Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "design", label: "Дизайн" },
    { id: "components", label: "Агуулга" },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <Link href="/websites" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Буцах</span>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base truncate">{projectName}</p>
          {design?.domain && <p className="text-slate-500 text-xs truncate">{design.domain}</p>}
        </div>

        <div className="flex items-center gap-2">
          {saved && <span className="text-green-600 dark:text-green-400 text-xs font-medium hidden sm:inline">Хадгалагдлаа!</span>}
          {saving && <span className="text-slate-400 text-xs hidden sm:inline">Хадгалж байна...</span>}
          <button
            onClick={handleBuild}
            disabled={building}
            className="flex items-center gap-1.5 text-white text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg disabled:opacity-60 transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: "var(--accent-600)" }}
          >
            {building ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            <span className="hidden sm:inline">{building ? "Нийтэлж байна..." : "Нийтлэх"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex gap-1 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-[var(--accent-500)] text-[var(--accent-600)] dark:text-[var(--accent-400)]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "design" && design && (
          <DesignTab design={design} onSaveTheme={handleSaveTheme} saving={saving} />
        )}
        {tab === "components" && design && (
          <ComponentsTab
            projectName={projectName}
            pages={design.pages}
            activePage={activePage}
            onPageChange={(route) => { setActivePage(route); }}
            components={components}
            loading={loadingComponents}
            onRefresh={() => loadComponents(activePage)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Design Tab ───────────────────────────────────────────────────────────────

function DesignTab({ design, onSaveTheme, saving }: {
  design: Design;
  onSaveTheme: (theme: Design["theme"]) => Promise<void>;
  saving: boolean;
}) {
  const [theme, setTheme] = useState({ ...design.theme });
  const dirty = JSON.stringify(theme) !== JSON.stringify(design.theme);

  const inputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] focus:border-transparent transition";

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6">

      {/* Theme card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6">
        <h2 className="text-slate-900 dark:text-white font-semibold mb-5">Өнгөний тохиргоо</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Үндсэн өнгө</label>
            <div className="flex items-center gap-2">
              <input type="color" value={theme.primaryColor} onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer" />
              <input type="text" value={theme.primaryColor} onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Хоёрдогч өнгө</label>
            <div className="flex items-center gap-2">
              <input type="color" value={theme.secondaryColor} onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer" />
              <input type="text" value={theme.secondaryColor} onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Фонт</label>
            <select value={theme.fontFamily} onChange={(e) => setTheme((t) => ({ ...t, fontFamily: e.target.value }))} className={inputClass}>
              {["Inter", "Roboto", "Poppins", "Montserrat", "Open Sans", "Lato", "Nunito"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Харанхуй горим</label>
            <button
              onClick={() => setTheme((t) => ({ ...t, darkMode: !t.darkMode }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${theme.darkMode ? "bg-[var(--accent-600)]" : "bg-slate-300 dark:bg-slate-600"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${theme.darkMode ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <button
            onClick={() => onSaveTheme(theme)}
            disabled={saving || !dirty}
            className="text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent-600)" }}
          >
            {saving ? "Хадгалж байна..." : dirty ? "Хадгалах" : "Хадгалагдсан"}
          </button>
          {dirty && (
            <button onClick={() => setTheme({ ...design.theme })} className="text-slate-500 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">
              Цуцлах
            </button>
          )}
        </div>
      </div>

      {/* Pages list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6">
        <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Хуудсууд</h2>
        <div className="space-y-2">
          {design.pages.map((page) => (
            <div key={page.route} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <code className="text-xs font-mono text-[var(--accent-500)] bg-[var(--accent-faint)] px-2 py-0.5 rounded flex-shrink-0">{page.route}</code>
              <div className="min-w-0">
                <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{page.title}</p>
                {page.description && <p className="text-slate-500 text-xs truncate">{page.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 sm:p-6">
        <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Домэйн</h2>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{design.domain || "—"}</p>
      </div>
    </div>
  );
}

// ─── Components Tab ───────────────────────────────────────────────────────────

function ComponentsTab({
  projectName, pages, activePage, onPageChange, components, loading, onRefresh,
}: {
  projectName: string;
  pages: DesignPage[];
  activePage: string;
  onPageChange: (route: string) => void;
  components: ComponentInstance[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Page selector */}
      <div className="md:w-48 flex-shrink-0 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Хуудас</p>
        </div>
        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-0.5 p-2">
          {pages.map((page) => (
            <button
              key={page.route}
              onClick={() => onPageChange(page.route)}
              className={`flex-shrink-0 text-left px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap md:w-full ${
                activePage === page.route ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              style={activePage === page.route ? { backgroundColor: "var(--accent-600)" } : {}}
            >
              <span className="font-mono text-xs block">{page.route}</span>
              <span className="text-xs opacity-75 hidden md:block">{page.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-white font-semibold">
            {pages.find((p) => p.route === activePage)?.title ?? activePage}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Шинэчлэх</button>
            <AddComponentButton projectName={projectName} pageRoute={activePage} onAdded={onRefresh} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : components.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center">
            <p className="text-slate-500 text-sm">Энэ хуудсанд компонент байхгүй байна.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {components.map((comp) => (
              <ComponentCard key={comp.instanceId} component={comp} projectName={projectName} onSaved={onRefresh} onDeleted={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component Card ───────────────────────────────────────────────────────────

function ComponentCard({ component, projectName, onSaved, onDeleted }: {
  component: ComponentInstance;
  projectName: string;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [props, setProps] = useState<Record<string, unknown>>({ ...component.props });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dirty = JSON.stringify(props) !== JSON.stringify(component.props);

  async function handleSave() {
    setSaving(true);
    try {
      await updateComponent(component.instanceId, props, projectName);
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Хадгалахад алдаа");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`"${component.componentType}" компонентыг устгах уу?`)) return;
    setDeleting(true);
    try {
      await deleteComponent(component.instanceId, projectName);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Устгахад алдаа");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--accent-faint)", color: "var(--accent-500)" }}>
          {component.componentType}
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-xs flex-1">#{component.order} · {component.instanceId.slice(0, 8)}…</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded props editor */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-3">
            {Object.entries(props).map(([key, val]) => (
              <PropField key={key} propKey={key} value={val} onChange={(v) => setProps((p) => ({ ...p, [key]: v }))} />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent-600)" }}
            >
              {saving ? "Хадгалж байна..." : dirty ? "Хадгалах" : "Хадгалагдсан"}
            </button>
            {dirty && (
              <button onClick={() => setProps({ ...component.props })} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                Цуцлах
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? "Устгаж байна..." : "Устгах"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Prop Field ───────────────────────────────────────────────────────────────

function PropField({ propKey, value, onChange }: { propKey: string; value: unknown; onChange: (v: unknown) => void }) {
  const inputClass = "w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)] focus:border-transparent transition";

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{propKey}</label>
        <button
          onClick={() => onChange(!value)}
          className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[var(--accent-600)]" : "bg-slate-300 dark:bg-slate-600"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
        </button>
      </div>
    );
  }

  if (typeof value === "string") {
    const isLong = value.length > 60 || value.includes("\n");
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{propKey}</label>
        {isLong ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={inputClass + " resize-y"} />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{propKey}</label>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />
      </div>
    );
  }

  // Arrays and objects → editable JSON textarea
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {propKey} <span className="text-slate-400 dark:text-slate-500 font-normal">(JSON)</span>
      </label>
      <textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try { onChange(JSON.parse(e.target.value)); } catch {}
        }}
        rows={4}
        className={inputClass + " resize-y font-mono text-xs"}
      />
    </div>
  );
}

// ─── Add Component Button ─────────────────────────────────────────────────────

const COMPONENT_TYPES = ["hero", "navbar", "features", "testimonials", "cta", "footer", "about", "services", "contact", "blog", "gallery", "pricing"];

function AddComponentButton({ projectName, pageRoute, onAdded }: { projectName: string; pageRoute: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("hero");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await createComponent(projectName, { componentType: type, pageRoute, order: 999, props: {} });
      setOpen(false);
      onAdded();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--accent-600)" }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Нэмэх
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 w-56">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Компонент төрөл</p>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm mb-3">
              {COMPONENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={handleAdd} disabled={adding} className="w-full text-white text-sm font-medium py-1.5 rounded-lg disabled:opacity-60 transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent-600)" }}>
              {adding ? "Нэмж байна..." : "Нэмэх"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
