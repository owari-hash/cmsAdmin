"use client";
import { use, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "navbar" | "hero" | "features" | "cta" | "footer";
type AnimStyle = "none" | "fade-up" | "slide-left" | "zoom-in";

interface GlobalTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingSize: number;
  bodySize: number;
  animation: AnimStyle;
}

interface Section {
  id: string;
  type: SectionType;
  props: Record<string, string | number | boolean>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONTS = ["Inter", "Roboto", "Poppins", "Montserrat", "Georgia", "Playfair Display"];
const ANIM_OPTIONS: AnimStyle[] = ["none", "fade-up", "slide-left", "zoom-in"];
const SECTION_LABELS: Record<SectionType, string> = {
  navbar: "Навбар", hero: "Герой", features: "Онцлогууд", cta: "Уриалга", footer: "Хөл хуудас",
};

const DEFAULT_THEME: GlobalTheme = {
  primaryColor: "#6366f1",
  secondaryColor: "#0f172a",
  fontFamily: "Inter",
  headingSize: 48,
  bodySize: 16,
  animation: "fade-up",
};

const DEFAULT_PROPS: Record<SectionType, Record<string, string | number | boolean>> = {
  navbar: {
    logo: "МайБрэнд",
    links: "Нүүр,Онцлог,Үнэ,Холбоо барих",
    ctaText: "Эхлэх",
    bgColor: "#ffffff",
    textColor: "#0f172a",
  },
  hero: {
    heading: "Гайхалтай зүйл бүтээ",
    subheading: "Вебсайтаа хамгийн хурдан байдлаар нийтэл.",
    body: "Үнэгүй эхэл, банкны карт шаардлагагүй.",
    ctaText: "Үнэгүй эхлэх",
    ctaSecText: "Дэлгэрэнгүй",
    imageUrl: "",
    bgColor: "#6366f1",
    textColor: "#ffffff",
    align: "center",
  },
  features: {
    title: "Яагаад биднийг сонгох вэ?",
    subtitle: "Хурдан нийтлэхэд шаардлагатай бүх зүйл",
    bgColor: "#f8fafc",
    titleColor: "#0f172a",
    textColor: "#64748b",
    items: "⚡ Хурдан|Гүйцэтгэл болон хурдад зориулсан\n🔒 Аюулгүй|Корпорацийн түвшний аюулгүй байдал\n📱 Дасан зохицох|Ямар ч төхөөрөмж дээр ажилладаг\n🎨 Тохируулах боломжтой|Өөрийнхөөрөө болго",
  },
  cta: {
    heading: "Эхлэхэд бэлэн үү?",
    subheading: "Мянга мянган хэрэглэгчтэй нэгд.",
    ctaText: "Үнэгүй туршиж үзэх",
    bgColor: "#4f46e5",
    textColor: "#ffffff",
  },
  footer: {
    brand: "МайБрэнд",
    links: "Нууцлал,Нөхцөл,Холбоо барих",
    copyright: "© 2024 МайБрэнд. Бүх эрх хуулиар хамгаалагдсан.",
    bgColor: "#0f172a",
    textColor: "#94a3b8",
  },
};

const MOCK_SECTIONS: Section[] = [
  { id: "nav-1", type: "navbar", props: { ...DEFAULT_PROPS.navbar } },
  { id: "hero-1", type: "hero", props: { ...DEFAULT_PROPS.hero } },
  { id: "feat-1", type: "features", props: { ...DEFAULT_PROPS.features } },
  { id: "cta-1", type: "cta", props: { ...DEFAULT_PROPS.cta } },
  { id: "footer-1", type: "footer", props: { ...DEFAULT_PROPS.footer } },
];

// Field definitions for the editor panel
type FieldType = "text" | "textarea" | "color" | "url" | "select";
interface FieldDef { key: string; label: string; type: FieldType; options?: string[] }

const FIELD_DEFS: Record<SectionType, FieldDef[]> = {
  navbar: [
    { key: "logo", label: "Лого текст", type: "text" },
    { key: "links", label: "Навигацийн холбоосууд (таслалаар)", type: "text" },
    { key: "ctaText", label: "Товчны текст", type: "text" },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
  ],
  hero: [
    { key: "heading", label: "Гарчиг", type: "text" },
    { key: "subheading", label: "Дэд гарчиг", type: "text" },
    { key: "body", label: "Үндсэн текст", type: "textarea" },
    { key: "ctaText", label: "Үндсэн товч", type: "text" },
    { key: "ctaSecText", label: "Хоёрдогч товч", type: "text" },
    { key: "imageUrl", label: "Зургийн URL", type: "url" },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
    { key: "align", label: "Тэгшлэх", type: "select", options: ["left", "center", "right"] },
  ],
  features: [
    { key: "title", label: "Хэсгийн гарчиг", type: "text" },
    { key: "subtitle", label: "Дэд гарчиг", type: "text" },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "titleColor", label: "Гарчгийн өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
    { key: "items", label: "Зүйлүүд (мөр бүр: emoji гарчиг|тайлбар)", type: "textarea" },
  ],
  cta: [
    { key: "heading", label: "Гарчиг", type: "text" },
    { key: "subheading", label: "Дэд гарчиг", type: "text" },
    { key: "ctaText", label: "Товчны текст", type: "text" },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
  ],
  footer: [
    { key: "brand", label: "Брэндийн нэр", type: "text" },
    { key: "links", label: "Холбоосууд (таслалаар)", type: "text" },
    { key: "copyright", label: "Зохиогчийн эрхийн текст", type: "text" },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [templateName, setTemplateName] = useState(id === "mock-landing" ? "Нүүр хуудас загвар" : id);
  const [theme, setTheme] = useState<GlobalTheme>({ ...DEFAULT_THEME });
  const [sections, setSections] = useState<Section[]>(
    MOCK_SECTIONS.map((s) => ({ ...s, props: { ...s.props } }))
  );
  const [selectedId, setSelectedId] = useState<string | null>("hero-1");

  const selected = sections.find((s) => s.id === selectedId) ?? null;

  function updateProps(id: string, patch: Record<string, string | number | boolean>) {
    setSections((ss) => ss.map((s) => s.id === id ? { ...s, props: { ...s.props, ...patch } } : s));
  }

  function moveSection(id: string, dir: -1 | 1) {
    setSections((ss) => {
      const idx = ss.findIndex((s) => s.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= ss.length) return ss;
      const copy = [...ss];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }

  function deleteSection(id: string) {
    setSections((ss) => ss.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addSection(type: SectionType) {
    const id = `${type}-${Date.now()}`;
    setSections((ss) => [...ss, { id, type, props: { ...DEFAULT_PROPS[type] } }]);
    setSelectedId(id);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ templateName, theme, sections }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${templateName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center gap-3 px-4 flex-shrink-0">
        <Link href="/templates" className="text-slate-400 hover:text-white transition-colors p-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white border-b border-transparent hover:border-slate-600 focus:border-slate-400 focus:outline-none px-1 py-0.5 transition-colors min-w-0"
        />
        <div className="flex-1" />
        <span className="text-xs text-slate-600 hidden sm:inline">Орон нутгийн ноорог — бэкэнд рүү хадгалагдаагүй</span>
        <button
          onClick={exportJson}
          className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          JSON экспортлох
        </button>
      </header>

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          theme={theme}
          sections={sections}
          selectedId={selectedId}
          onThemeChange={(p) => setTheme((t) => ({ ...t, ...p }))}
          onSelect={setSelectedId}
          onMove={moveSection}
          onDelete={deleteSection}
          onAdd={addSection}
        />

        {/* Center: Live Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-800 p-4 sm:p-6">
          <div
            className="mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            style={{ maxWidth: 960, fontFamily: theme.fontFamily }}
          >
            {sections.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-white text-slate-400 text-sm">
                Зүүн самраас хэсэг нэм
              </div>
            ) : (
              sections.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`relative cursor-pointer transition-all ${
                    selectedId === s.id
                      ? "ring-2 ring-inset ring-blue-500"
                      : "hover:ring-1 hover:ring-inset hover:ring-slate-400/60"
                  }`}
                >
                  {selectedId === s.id && (
                    <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-medium pointer-events-none">
                      {SECTION_LABELS[s.type]}
                    </div>
                  )}
                  <SectionPreview section={s} theme={theme} />
                </div>
              ))
            )}
          </div>
        </div>

        <RightPanel
          section={selected}
          onChange={(patch) => selected && updateProps(selected.id, patch)}
        />
      </div>
    </div>
  );
}

// ─── Left Panel ───────────────────────────────────────────────────────────────

function LeftPanel({
  theme, sections, selectedId, onThemeChange, onSelect, onMove, onDelete, onAdd,
}: {
  theme: GlobalTheme;
  sections: Section[];
  selectedId: string | null;
  onThemeChange: (p: Partial<GlobalTheme>) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onAdd: (type: SectionType) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(true);
  const inp = "w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition";

  return (
    <div className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Theme */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => setThemeOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
          >
            Ерөнхий загвар
            <svg className={`w-3 h-3 transition-transform ${themeOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {themeOpen && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Үндсэн өнгө</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={theme.primaryColor} onChange={(e) => onThemeChange({ primaryColor: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-700 bg-transparent flex-shrink-0" />
                  <input type="text" value={theme.primaryColor} onChange={(e) => onThemeChange({ primaryColor: e.target.value })} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Фонт</label>
                <select value={theme.fontFamily} onChange={(e) => onThemeChange({ fontFamily: e.target.value })} className={inp}>
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Гарчгийн хэмжээ: {theme.headingSize}px</label>
                <input type="range" min={24} max={80} value={theme.headingSize} onChange={(e) => onThemeChange({ headingSize: Number(e.target.value) })} className="w-full accent-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Текстийн хэмжээ: {theme.bodySize}px</label>
                <input type="range" min={12} max={22} value={theme.bodySize} onChange={(e) => onThemeChange({ bodySize: Number(e.target.value) })} className="w-full accent-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Хөдөлгөөний хэв маяг</label>
                <select value={theme.animation} onChange={(e) => onThemeChange({ animation: e.target.value as AnimStyle })} className={inp}>
                  {ANIM_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a === "none" ? "Байхгүй" : a === "fade-up" ? "Дээшээ гарах" : a === "slide-left" ? "Зүүнээс гулсах" : "Томрох"}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sections list */}
        <div>
          <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Хэсгүүд</div>
          <div className="space-y-0.5 px-2 pb-2">
            {sections.map((s, i) => (
              <div
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-xs transition-colors group ${
                  selectedId === s.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex-1 font-medium">{SECTION_LABELS[s.type]}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); onMove(s.id, -1); }} disabled={i === 0} className="px-1 py-0.5 rounded hover:bg-slate-700 disabled:opacity-20 transition-colors">↑</button>
                  <button onClick={(e) => { e.stopPropagation(); onMove(s.id, 1); }} disabled={i === sections.length - 1} className="px-1 py-0.5 rounded hover:bg-slate-700 disabled:opacity-20 transition-colors">↓</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} className="px-1 py-0.5 rounded hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors">×</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add section */}
          <div className="px-2 pb-4 relative">
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Хэсэг нэмэх
            </button>
            {addOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAddOpen(false)} />
                <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                  {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { onAdd(t); setAddOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      {SECTION_LABELS[t]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({ section, onChange }: {
  section: Section | null;
  onChange: (patch: Record<string, string | number | boolean>) => void;
}) {
  const inp = "w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition";

  if (!section) {
    return (
      <div className="w-72 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex items-center justify-center">
        <div className="text-center text-slate-600 px-6">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
          <p className="text-xs">Засварлахын тулд урьдчилан харахаас хэсэг сонгоно уу</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-xs font-semibold text-white uppercase tracking-wider">
          {SECTION_LABELS[section.type]} <span className="text-slate-500 normal-case font-normal">Тохиргоо</span>
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {FIELD_DEFS[section.type].map((field) => {
          const val = String(section.props[field.key] ?? "");

          if (field.type === "color") return (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={val || "#000000"} onChange={(e) => onChange({ [field.key]: e.target.value })} className="w-7 h-7 rounded cursor-pointer border border-slate-700 bg-transparent flex-shrink-0" />
                <input type="text" value={val} onChange={(e) => onChange({ [field.key]: e.target.value })} className={inp} />
              </div>
            </div>
          );

          if (field.type === "textarea") return (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
              <textarea value={val} onChange={(e) => onChange({ [field.key]: e.target.value })} rows={field.key === "items" ? 7 : 3} className={inp + " resize-y"} />
            </div>
          );

          if (field.type === "select") return (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
              <select value={val} onChange={(e) => onChange({ [field.key]: e.target.value })} className={inp}>
                {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          );

          if (field.type === "url") return (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
              <input type="url" value={val} placeholder="https://..." onChange={(e) => onChange({ [field.key]: e.target.value })} className={inp} />
              {val && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 h-20 bg-slate-800">
                  <img src={val} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </div>
              )}
            </div>
          );

          return (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
              <input type="text" value={val} onChange={(e) => onChange({ [field.key]: e.target.value })} className={inp} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section Preview ──────────────────────────────────────────────────────────

function SectionPreview({ section, theme }: { section: Section; theme: GlobalTheme }) {
  const p = section.props;
  const font = theme.fontFamily;
  const animClass = theme.animation !== "none" ? `animate-${theme.animation}` : "";

  switch (section.type) {
    case "navbar":
      return (
        <nav style={{ background: String(p.bgColor), color: String(p.textColor), fontFamily: font, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: theme.primaryColor }}>{String(p.logo)}</span>
          <div style={{ display: "flex", gap: 24 }}>
            {String(p.links).split(",").map((l, i) => (
              <span key={i} style={{ fontSize: 14, cursor: "pointer", opacity: 0.8 }}>{l.trim()}</span>
            ))}
          </div>
          <button style={{ background: theme.primaryColor, color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer" }}>
            {String(p.ctaText)}
          </button>
        </nav>
      );

    case "hero": {
      const align = (String(p.align ?? "center")) as "left" | "center" | "right";
      const justifyMap = { left: "flex-start", center: "center", right: "flex-end" };
      return (
        <section style={{ background: String(p.bgColor), color: String(p.textColor), fontFamily: font, padding: "80px 48px", textAlign: align }}>
          <div style={{ maxWidth: 720, margin: align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0" }}>
            {p.imageUrl && (
              <img src={String(p.imageUrl)} alt="hero" style={{ width: "100%", borderRadius: 16, marginBottom: 32, maxHeight: 300, objectFit: "cover" }} />
            )}
            <h1 className={animClass} style={{ fontSize: theme.headingSize, fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px" }}>
              {String(p.heading)}
            </h1>
            <p className={animClass} style={{ fontSize: theme.headingSize * 0.42, fontWeight: 500, margin: "0 0 12px", opacity: 0.88, animationDelay: "60ms" }}>
              {String(p.subheading)}
            </p>
            <p className={animClass} style={{ fontSize: theme.bodySize, margin: "0 0 32px", opacity: 0.7, animationDelay: "120ms" }}>
              {String(p.body)}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: justifyMap[align], flexWrap: "wrap" }}>
              <button style={{ background: "#fff", color: theme.primaryColor, fontSize: 15, fontWeight: 700, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer" }}>
                {String(p.ctaText)}
              </button>
              {p.ctaSecText && (
                <button style={{ background: "transparent", color: String(p.textColor), fontSize: 15, fontWeight: 600, padding: "12px 24px", borderRadius: 10, border: `2px solid ${String(p.textColor)}50`, cursor: "pointer" }}>
                  {String(p.ctaSecText)}
                </button>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "features": {
      const items = String(p.items || "").split("\n").filter(Boolean).map((line) => {
        const [left = "", desc = ""] = line.split("|");
        const parts = left.trim().split(" ");
        const icon = parts[0] ?? "";
        const title = parts.slice(1).join(" ");
        return { icon, title, desc: desc.trim() };
      });
      const cols = Math.min(items.length, 3);
      return (
        <section style={{ background: String(p.bgColor), fontFamily: font, padding: "64px 48px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className={animClass} style={{ fontSize: theme.headingSize * 0.65, fontWeight: 800, color: String(p.titleColor), margin: "0 0 10px" }}>
              {String(p.title)}
            </h2>
            <p style={{ fontSize: theme.bodySize, color: String(p.textColor) }}>{String(p.subtitle)}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
            {items.map((item, i) => (
              <div key={i} className={animClass} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", animationDelay: `${i * 80}ms` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: theme.bodySize + 2, color: String(p.titleColor), margin: "0 0 6px" }}>{item.title}</h3>
                <p style={{ fontSize: theme.bodySize - 1, color: String(p.textColor), lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "cta":
      return (
        <section style={{ background: String(p.bgColor), color: String(p.textColor), fontFamily: font, padding: "72px 48px", textAlign: "center" }}>
          <h2 className={animClass} style={{ fontSize: theme.headingSize * 0.6, fontWeight: 800, margin: "0 0 14px" }}>{String(p.heading)}</h2>
          <p style={{ fontSize: theme.bodySize, margin: "0 0 32px", opacity: 0.85 }}>{String(p.subheading)}</p>
          <button style={{ background: "#fff", color: String(p.bgColor), fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            {String(p.ctaText)}
          </button>
        </section>
      );

    case "footer":
      return (
        <footer style={{ background: String(p.bgColor), fontFamily: font, padding: "36px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: theme.primaryColor }}>{String(p.brand)}</span>
            <div style={{ display: "flex", gap: 20 }}>
              {String(p.links).split(",").map((l, i) => (
                <span key={i} style={{ fontSize: 13, color: String(p.textColor), cursor: "pointer", opacity: 0.8 }}>{l.trim()}</span>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 12, color: String(p.textColor), opacity: 0.5, margin: 0 }}>{String(p.copyright)}</p>
        </footer>
      );

    default:
      return null;
  }
}
