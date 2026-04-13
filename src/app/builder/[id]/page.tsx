"use client";
import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "navbar" | "slider" | "hero" | "features" | "cta" | "footer";
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

const FONTS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Georgia",
  "Playfair Display",
];
const ANIM_OPTIONS: AnimStyle[] = ["none", "fade-up", "slide-left", "zoom-in"];

const SECTION_LABELS: Record<SectionType, string> = {
  navbar: "Навбар",
  slider: "Слайдер",
  hero: "Герой",
  features: "Онцлогууд",
  cta: "Уриалга",
  footer: "Хөл хуудас",
};

const DEFAULT_THEME: GlobalTheme = {
  primaryColor: "#16a34a",
  secondaryColor: "#052e16",
  fontFamily: "Inter",
  headingSize: 48,
  bodySize: 16,
  animation: "fade-up",
};

const DEFAULT_PROPS: Record<
  SectionType,
  Record<string, string | number | boolean>
> = {
  navbar: {
    logo: "HomePick",
    navlinks:
      "Нүүр|Home|/home\nБидний тухай|About Us|/about\nҮйл ажиллагаа|Services|/services\nХамтран ажиллах|Partnership|/partnership\nМэдээ мэдээлэл|News|/news\nХолбоо барих|Contact|/contact",
    buttons: "Үнэгүй бүртгүүлэх|Register Free|/register|primary",
    bgColor: "#ffffff",
    textColor: "#1e293b",
    showLangSwitch: "true",
  },
  slider: {
    slides: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400|Мөрөөдлийн гэрээ ол|10,000+ объектоос хайж олоорой|Одоо хайх",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1400|Тав тухтай амьдрал|Таны хэрэгцээнд нийцсэн байшин|Дэлгэрэнгүй",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400|Найдвартай хөрөнгө оруулалт|Шилдэг байршилд орон сууц|Холбоо барих",
    ].join("\n"),
    slides_en: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400|Find Your Dream Home|Search from 10,000+ properties|Search Now",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1400|Comfortable Living|The perfect home for your needs|Learn More",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400|Smart Investment|Premium properties in prime locations|Contact Us",
    ].join("\n"),
    height: "560",
    overlayColor: "#00000060",
    textColor: "#ffffff",
    autoPlay: "true",
    interval: "4000",
  },
  hero: {
    heading: "Мөрөөдлийн гэрээ олоорой",
    heading_en: "Find Your Dream Home",
    subheading: "Монголын шилдэг үл хөдлөхийн платформ",
    subheading_en: "Mongolia's Leading Real Estate Platform",
    body: "10,000+ объектоос хамгийн тохиромжтойг нь олоорой. Худалдаа, түрээс, хөрөнгө оруулалт.",
    body_en:
      "Browse 10,000+ properties to find the perfect one for you. Buy, rent or invest with confidence.",
    buttons:
      "Одоо хайх|Search Now|/search|primary\nДэлгэрэнгүй|Learn More|/about|outline",
    bgImage: "",
    bgOverlay: "#14532d99",
    bgColor: "#166534",
    textColor: "#ffffff",
    align: "center",
  },
  features: {
    title: "Яагаад HomePick вэ?",
    title_en: "Why Choose HomePick?",
    subtitle: "Таны хэрэгцээнд нийцсэн бүх боломж нэг дороос",
    subtitle_en: "Everything you need in one place",
    bgColor: "#f8fafc",
    bgImage: "",
    bgOverlay: "#f8fafc99",
    titleColor: "#0f172a",
    textColor: "#64748b",
    items:
      "🔍 Ухаалаг хайлт|Байршил, үнэ, хэмжээгээр нарийвчлан хайх\n📸 Виртуал аялал|Гэрийг биечлэн очилгүйгээр харах\n🤝 Итгэмжлэгдсэн агентууд|Баталгаажсан мэргэжилтнүүд\n📊 Зах зээлийн шинжилгээ|Бодит цагийн үнийн мэдээлэл\n🔔 Шуурхай мэдэгдэл|Шинэ объект гарахад тэр дор мэдэгдэнэ\n💰 Зээлийн тооцоолуур|Ипотекийн зээлээ урьдчилан тооцоол",
    items_en:
      "🔍 Smart Search|Filter by location, price, size and more\n📸 Virtual Tours|View properties without visiting in person\n🤝 Trusted Agents|Verified, experienced professionals\n📊 Market Analytics|Real-time price data and market trends\n🔔 Instant Alerts|Get notified when new matches appear\n💰 Loan Calculator|Estimate your monthly mortgage payments",
  },
  cta: {
    heading: "Өнөөдөр эхлэцгээе!",
    heading_en: "Get Started Today!",
    subheading:
      "Монголын хамгийн том үл хөдлөхийн платформд нэгдэж, мөрөөдлийн гэрээ олоорой.",
    subheading_en:
      "Join Mongolia's largest real estate platform and find your dream property.",
    buttons:
      "Үнэгүй бүртгүүлэх|Register Free|/register|primary\nОбъектууд харах|Browse Properties|/properties|outline",
    bgImage: "",
    bgOverlay: "#052e16cc",
    bgColor: "#052e16",
    textColor: "#ffffff",
  },
  footer: {
    brand: "HomePick",
    links: "Нууцлал,Нөхцөл,Холбоо барих,Бидний тухай",
    links_en: "Privacy,Terms,Contact,About Us",
    copyright: "© 2024 HomePick. Бүх эрх хуулиар хамгаалагдсан.",
    copyright_en: "© 2024 HomePick. All rights reserved.",
    bgColor: "#052e16",
    textColor: "#86efac",
  },
};

// ─── Field definitions ────────────────────────────────────────────────────────

type FieldType =
  | "text"
  | "textarea"
  | "color"
  | "url"
  | "select"
  | "range"
  | "buttons"
  | "navlinks";
interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  min?: number;
  max?: number;
}

const FIELD_DEFS: Record<SectionType, FieldDef[]> = {
  navbar: [
    { key: "logo", label: "Лого текст", type: "text" },
    { key: "navlinks", label: "Цэсний холбоосууд", type: "navlinks" },
    { key: "buttons", label: "Товчнууд", type: "buttons" },
    {
      key: "showLangSwitch",
      label: "Хэлний солигч",
      type: "select",
      options: ["true", "false"],
    },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
  ],
  slider: [
    {
      key: "slides",
      label: "Слайдууд [МН] (мөр бүр: URL|гарчиг|дэд гарчиг|товч)",
      type: "textarea",
    },
    {
      key: "slides_en",
      label: "Слайдууд [EN] (мөр бүр: URL|title|subtitle|btn)",
      type: "textarea",
    },
    { key: "height", label: "Өндөр (px)", type: "range", min: 300, max: 800 },
    { key: "overlayColor", label: "Зургийн бүрхүүлийн өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
    {
      key: "autoPlay",
      label: "Автомат тоглуулах",
      type: "select",
      options: ["true", "false"],
    },
    {
      key: "interval",
      label: "Шилжих хугацаа (ms)",
      type: "range",
      min: 1000,
      max: 8000,
    },
  ],
  hero: [
    { key: "heading", label: "Гарчиг [МН]", type: "text" },
    { key: "heading_en", label: "Гарчиг [EN]", type: "text" },
    { key: "subheading", label: "Дэд гарчиг [МН]", type: "text" },
    { key: "subheading_en", label: "Дэд гарчиг [EN]", type: "text" },
    { key: "body", label: "Үндсэн текст [МН]", type: "textarea" },
    { key: "body_en", label: "Үндсэн текст [EN]", type: "textarea" },
    { key: "buttons", label: "Товчнууд", type: "buttons" },
    { key: "bgImage", label: "Арын зураг (URL)", type: "url" },
    { key: "bgOverlay", label: "Зургийн бүрхүүл", type: "color" },
    { key: "bgColor", label: "Арын өнгө (зураггүй үед)", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
    {
      key: "align",
      label: "Тэгшлэх",
      type: "select",
      options: ["left", "center", "right"],
    },
  ],
  features: [
    { key: "title", label: "Гарчиг [МН]", type: "text" },
    { key: "title_en", label: "Гарчиг [EN]", type: "text" },
    { key: "subtitle", label: "Дэд гарчиг [МН]", type: "text" },
    { key: "subtitle_en", label: "Дэд гарчиг [EN]", type: "text" },
    { key: "bgImage", label: "Арын зураг (URL)", type: "url" },
    { key: "bgOverlay", label: "Зургийн бүрхүүл", type: "color" },
    { key: "bgColor", label: "Арын өнгө (зураггүй үед)", type: "color" },
    { key: "titleColor", label: "Гарчгийн өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
    {
      key: "items",
      label: "Зүйлүүд [МН] (мөр бүр: emoji гарчиг|тайлбар)",
      type: "textarea",
    },
    {
      key: "items_en",
      label: "Зүйлүүд [EN] (мөр бүр: emoji title|description)",
      type: "textarea",
    },
  ],
  cta: [
    { key: "heading", label: "Гарчиг [МН]", type: "text" },
    { key: "heading_en", label: "Гарчиг [EN]", type: "text" },
    { key: "subheading", label: "Дэд гарчиг [МН]", type: "text" },
    { key: "subheading_en", label: "Дэд гарчиг [EN]", type: "text" },
    { key: "buttons", label: "Товчнууд", type: "buttons" },
    { key: "bgImage", label: "Арын зураг (URL)", type: "url" },
    { key: "bgOverlay", label: "Зургийн бүрхүүл", type: "color" },
    { key: "bgColor", label: "Арын өнгө (зураггүй үед)", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
  ],
  footer: [
    { key: "brand", label: "Брэндийн нэр", type: "text" },
    { key: "links", label: "Холбоосууд [МН] (таслалаар)", type: "text" },
    { key: "links_en", label: "Холбоосууд [EN] (таслалаар)", type: "text" },
    { key: "copyright", label: "Зохиогчийн эрх [МН]", type: "text" },
    { key: "copyright_en", label: "Зохиогчийн эрх [EN]", type: "text" },
    { key: "bgColor", label: "Арын өнгө", type: "color" },
    { key: "textColor", label: "Текстийн өнгө", type: "color" },
  ],
};

// ─── Button helpers ───────────────────────────────────────────────────────────

interface ButtonDef {
  text: string;
  text_en: string;
  url: string;
  style: "primary" | "outline" | "ghost";
}

function parseButtons(raw: string): ButtonDef[] {
  return raw
    .split("\n")
    .map((line) => {
      const [text = "", text_en = "", url = "#", style = "primary"] =
        line.split("|");
      return {
        text,
        text_en,
        url: url.trim() || "#",
        style: style.trim() as ButtonDef["style"],
      };
    })
    .filter((b) => b.text); // keep empty lines filtered so serialized blanks don't persist
}

function serializeButtons(btns: ButtonDef[]): string {
  return btns
    .map((b) => `${b.text}|${b.text_en}|${b.url}|${b.style}`)
    .join("\n");
}

// ─── Nav link helpers ─────────────────────────────────────────────────────────

interface NavLinkDef {
  text: string;
  text_en: string;
  url: string;
}

function parseNavLinks(raw: string): NavLinkDef[] {
  return raw
    .split("\n")
    .map((line) => {
      const [text = "", text_en = "", url = "#"] = line.split("|");
      return { text, text_en, url: url.trim() || "#" };
    })
    .filter((l) => l.text.trim());
}

function serializeNavLinks(links: NavLinkDef[]): string {
  return links.map((l) => `${l.text}|${l.text_en}|${l.url}`).join("\n");
}

// ─── Page list ───────────────────────────────────────────────────────────────

interface PageDef {
  slug: string;
  title: string;
  title_en: string;
}

const DEFAULT_PAGE_LIST: PageDef[] = [
  { slug: "home", title: "Нүүр", title_en: "Home" },
  { slug: "about", title: "Бидний тухай", title_en: "About Us" },
  { slug: "services", title: "Үйл ажиллагаа", title_en: "Services" },
  { slug: "partnership", title: "Хамтран ажиллах", title_en: "Partnership" },
  { slug: "news", title: "Мэдээ мэдээлэл", title_en: "News" },
  { slug: "contact", title: "Холбоо барих", title_en: "Contact" },
];

function defaultSectionsForPage(slug: string, customTitle?: string): Section[] {
  const nav = {
    id: `nav-${slug}`,
    type: "navbar" as SectionType,
    props: { ...DEFAULT_PROPS.navbar },
  };
  const footer = {
    id: `footer-${slug}`,
    type: "footer" as SectionType,
    props: { ...DEFAULT_PROPS.footer },
  };
  const pageTitle =
    customTitle ??
    DEFAULT_PAGE_LIST.find((p) => p.slug === slug)?.title ??
    slug;

  if (slug === "home") {
    return [
      nav,
      {
        id: `slider-${slug}`,
        type: "slider" as SectionType,
        props: { ...DEFAULT_PROPS.slider },
      },
      {
        id: `feat-${slug}`,
        type: "features" as SectionType,
        props: { ...DEFAULT_PROPS.features },
      },
      {
        id: `cta-${slug}`,
        type: "cta" as SectionType,
        props: { ...DEFAULT_PROPS.cta },
      },
      footer,
    ];
  }
  return [
    nav,
    {
      id: `hero-${slug}`,
      type: "hero" as SectionType,
      props: { ...DEFAULT_PROPS.hero, heading: pageTitle },
    },
    footer,
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = (id: string) => `builder-state-${id}`;

export default function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [templateName, setTemplateName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return (
          JSON.parse(localStorage.getItem(STORAGE_KEY(id)) || "{}")
            .templateName || ""
        );
      } catch {}
    }
    return id === "mock-landing" ? "Нүүр хуудас загвар" : id;
  });

  const [theme, setTheme] = useState<GlobalTheme>(() => {
    if (typeof window !== "undefined") {
      try {
        return (
          JSON.parse(localStorage.getItem(STORAGE_KEY(id)) || "{}").theme ||
          DEFAULT_THEME
        );
      } catch {}
    }
    return { ...DEFAULT_THEME };
  });

  const [currentPage, setCurrentPage] = useState<string>("home");

  const [pageList, setPageList] = useState<PageDef[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(
          localStorage.getItem(STORAGE_KEY(id)) || "{}",
        );
        if (stored.pageList?.length) return stored.pageList;
      } catch {}
    }
    return DEFAULT_PAGE_LIST;
  });

  const [allPages, setAllPages] = useState<Record<string, Section[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(
          localStorage.getItem(STORAGE_KEY(id)) || "{}",
        );
        if (stored.allPages) return stored.allPages;
        // migrate old single-page format
        if (stored.sections?.length) return { home: stored.sections };
      } catch {}
    }
    return Object.fromEntries(
      DEFAULT_PAGE_LIST.map((p) => [p.slug, defaultSectionsForPage(p.slug)]),
    );
  });

  const sections = allPages[currentPage] ?? [];

  function setSections(updater: Section[] | ((prev: Section[]) => Section[])) {
    setAllPages((ps) => {
      const prev = ps[currentPage] ?? [];
      const next = typeof updater === "function" ? updater(prev) : updater;
      return { ...ps, [currentPage]: next };
    });
  }

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const selected = sections.find((s) => s.id === selectedId) ?? null;

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY(id),
      JSON.stringify({ templateName, theme, allPages, pageList }),
    );
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [templateName, theme, allPages, pageList, id]);

  function addPage(title: string, title_en: string) {
    const slug = `page-${Date.now()}`;
    const newPage: PageDef = {
      slug,
      title: title || "Шинэ хуудас",
      title_en: title_en || title || "New Page",
    };
    setPageList((pl) => [...pl, newPage]);
    setAllPages((ap) => ({
      ...ap,
      [slug]: defaultSectionsForPage(slug, newPage.title),
    }));
    setCurrentPage(slug);
    setSelectedId(null);
  }

  function deletePage(slug: string) {
    if (pageList.length <= 1) return;
    setPageList((pl) => pl.filter((p) => p.slug !== slug));
    setAllPages((ap) => {
      const copy = { ...ap };
      delete copy[slug];
      return copy;
    });
    if (currentPage === slug) {
      const fallback = pageList.find((p) => p.slug !== slug)?.slug ?? "home";
      setCurrentPage(fallback);
      setSelectedId(null);
    }
  }

  function updateProps(
    sid: string,
    patch: Record<string, string | number | boolean>,
  ) {
    setSections((ss) =>
      ss.map((s) =>
        s.id === sid ? { ...s, props: { ...s.props, ...patch } } : s,
      ),
    );
  }

  function moveSection(sid: string, dir: -1 | 1) {
    setSections((ss) => {
      const idx = ss.findIndex((s) => s.id === sid);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= ss.length) return ss;
      const copy = [...ss];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }

  function deleteSection(sid: string) {
    setSections((ss) => ss.filter((s) => s.id !== sid));
    if (selectedId === sid) setSelectedId(null);
  }

  function addSection(type: SectionType) {
    const newId = `${type}-${Date.now()}`;
    setSections((ss) => [
      ...ss,
      { id: newId, type, props: { ...DEFAULT_PROPS[type] } },
    ]);
    setSelectedId(newId);
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ templateName, theme, allPages }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${templateName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center gap-3 px-4 flex-shrink-0">
        <Link
          href="/templates"
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white border-b border-transparent hover:border-slate-600 focus:border-slate-400 focus:outline-none px-1 py-0.5 transition-colors min-w-0"
        />
        <div className="flex-1" />
        {saved && (
          <span className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            Хадгалагдлаа
          </span>
        )}
        <a
          href={`/builder/${id}/preview?page=${currentPage}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Урьдчилан харах
        </a>
        <button
          onClick={exportJson}
          className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          JSON
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          theme={theme}
          sections={sections}
          selectedId={selectedId}
          currentPage={currentPage}
          pageList={pageList}
          onPageChange={(slug) => {
            setCurrentPage(slug);
            setSelectedId(null);
          }}
          onAddPage={addPage}
          onDeletePage={deletePage}
          onThemeChange={(p) => setTheme((t) => ({ ...t, ...p }))}
          onSelect={setSelectedId}
          onMove={moveSection}
          onDelete={deleteSection}
          onAdd={addSection}
        />

        {/* Preview canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-800 p-4 sm:p-6">
          <div
            className="mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            style={{ maxWidth: 960, fontFamily: theme.fontFamily }}
          >
            {sections.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center bg-white text-slate-400 text-sm gap-3">
                <svg
                  className="w-8 h-8 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Баруун доор байгаа товчоор хэсэг нэмнэ үү
              </div>
            ) : (
              sections.map((s, i) => (
                <CanvasSection
                  key={s.id}
                  section={s}
                  theme={theme}
                  isSelected={selectedId === s.id}
                  isFirst={i === 0}
                  isLast={i === sections.length - 1}
                  onSelect={() => setSelectedId(s.id)}
                  onDelete={() => deleteSection(s.id)}
                  onMove={(dir) => moveSection(s.id, dir)}
                  onAddAfter={addSection}
                />
              ))
            )}
          </div>
        </div>

        <RightPanel
          section={selected}
          pageList={pageList}
          onChange={(patch) => selected && updateProps(selected.id, patch)}
          onDelete={() => selected && deleteSection(selected.id)}
          onAdd={addSection}
        />
      </div>
    </div>
  );
}

// ─── Canvas Section (inline toolbar) ─────────────────────────────────────────

function CanvasSection({
  section,
  theme,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onDelete,
  onMove,
  onAddAfter,
}: {
  section: Section;
  theme: GlobalTheme;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onAddAfter: (type: SectionType) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all ${isSelected ? "ring-2 ring-inset ring-blue-500" : "hover:ring-2 hover:ring-inset hover:ring-slate-500/60"}`}
    >
      {/* Section label badge */}
      <div
        className={`absolute top-2 left-2 z-20 flex items-center gap-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-md font-medium border border-slate-700">
          {SECTION_LABELS[section.type]}
        </span>
      </div>

      {/* Action toolbar — top right */}
      <div
        className={`absolute top-2 right-2 z-20 flex items-center gap-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Move up */}
        <button
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          title="Дээш"
        >
          ↑
        </button>

        {/* Move down */}
        <button
          onClick={() => onMove(1)}
          disabled={isLast}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          title="Доош"
        >
          ↓
        </button>

        {/* Add section after */}
        <div className="relative">
          <button
            onClick={() => {
              setConfirmDel(false);
              setAddOpen((v) => !v);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:text-green-400 hover:bg-slate-700 transition-colors"
            title="Хэсэг нэмэх"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          {addOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setAddOpen(false)}
              />
              <div className="absolute top-full mt-1 right-0 z-40 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl w-40">
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Нэмэх
                  </p>
                </div>
                {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onAddAfter(t);
                      setAddOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {SECTION_LABELS[t]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete */}
        {confirmDel ? (
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm border border-red-700 rounded-md px-2 py-1">
            <span className="text-xs text-red-400 font-medium">Устгах?</span>
            <button
              onClick={onDelete}
              className="text-xs bg-red-600 hover:bg-red-500 text-white px-1.5 py-0.5 rounded transition-colors font-medium"
            >
              Тийм
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="text-xs text-slate-400 hover:text-white px-1 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAddOpen(false);
              setConfirmDel(true);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:text-red-400 hover:bg-red-900/40 transition-colors"
            title="Устгах"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <SectionPreview section={section} theme={theme} />
    </div>
  );
}

// ─── Left Panel ───────────────────────────────────────────────────────────────

function LeftPanel({
  theme,
  sections,
  selectedId,
  currentPage,
  pageList,
  onPageChange,
  onAddPage,
  onDeletePage,
  onThemeChange,
  onSelect,
  onMove,
  onDelete,
  onAdd,
}: {
  theme: GlobalTheme;
  sections: Section[];
  selectedId: string | null;
  currentPage: string;
  pageList: PageDef[];
  onPageChange: (slug: string) => void;
  onAddPage: (title: string, title_en: string) => void;
  onDeletePage: (slug: string) => void;
  onThemeChange: (p: Partial<GlobalTheme>) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onAdd: (type: SectionType) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);
  const [addingPage, setAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageTitleEn, setNewPageTitleEn] = useState("");
  const inp =
    "w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition";

  function confirmAddPage() {
    if (!newPageTitle.trim()) return;
    onAddPage(newPageTitle.trim(), newPageTitleEn.trim());
    setNewPageTitle("");
    setNewPageTitleEn("");
    setAddingPage(false);
  }

  return (
    <div className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Pages */}
        <div className="border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setPagesOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors flex-1 text-left"
            >
              Хуудсууд
              <svg
                className={`w-3 h-3 transition-transform ${pagesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setPagesOpen(true);
                setAddingPage((v) => !v);
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-green-400 hover:bg-slate-800 transition-colors"
              title="Хуудас нэмэх"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
          {pagesOpen && (
            <div className="px-2 pb-2 space-y-0.5">
              {pageList.map((page) => (
                <div
                  key={page.slug}
                  className={`flex items-center gap-1 rounded-lg group transition-colors ${
                    currentPage === page.slug
                      ? "bg-green-600"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <button
                    onClick={() => onPageChange(page.slug)}
                    className={`flex-1 flex items-center gap-2 px-2 py-2 text-xs font-medium text-left transition-colors ${
                      currentPage === page.slug
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="flex-1 truncate">{page.title}</span>
                  </button>
                  {pageList.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.slug);
                      }}
                      className={`opacity-0 group-hover:opacity-100 mr-1.5 w-4 h-4 flex items-center justify-center rounded text-xs transition-all ${
                        currentPage === page.slug
                          ? "text-green-200 hover:text-white hover:bg-green-700"
                          : "text-slate-600 hover:text-red-400 hover:bg-slate-700"
                      }`}
                      title="Устгах"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* Add page inline form */}
              {addingPage && (
                <div className="mt-2 space-y-1.5 px-1">
                  <input
                    autoFocus
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAddPage();
                      if (e.key === "Escape") setAddingPage(false);
                    }}
                    placeholder="Нэр (МН)"
                    className={inp}
                  />
                  <input
                    value={newPageTitleEn}
                    onChange={(e) => setNewPageTitleEn(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAddPage();
                      if (e.key === "Escape") setAddingPage(false);
                    }}
                    placeholder="Name (EN)"
                    className={inp}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={confirmAddPage}
                      className="flex-1 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
                    >
                      Нэмэх
                    </button>
                    <button
                      onClick={() => setAddingPage(false)}
                      className="flex-1 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      Болих
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => setThemeOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
          >
            Ерөнхий загвар
            <svg
              className={`w-3 h-3 transition-transform ${themeOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {themeOpen && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Үндсэн өнгө
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) =>
                      onThemeChange({ primaryColor: e.target.value })
                    }
                    className="w-7 h-7 rounded cursor-pointer border border-slate-700 bg-transparent flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) =>
                      onThemeChange({ primaryColor: e.target.value })
                    }
                    className={inp}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Фонт
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) =>
                    onThemeChange({ fontFamily: e.target.value })
                  }
                  className={inp}
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Гарчгийн хэмжээ: {theme.headingSize}px
                </label>
                <input
                  type="range"
                  min={24}
                  max={80}
                  value={theme.headingSize}
                  onChange={(e) =>
                    onThemeChange({ headingSize: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Текстийн хэмжээ: {theme.bodySize}px
                </label>
                <input
                  type="range"
                  min={12}
                  max={22}
                  value={theme.bodySize}
                  onChange={(e) =>
                    onThemeChange({ bodySize: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Хөдөлгөөний хэв маяг
                </label>
                <select
                  value={theme.animation}
                  onChange={(e) =>
                    onThemeChange({ animation: e.target.value as AnimStyle })
                  }
                  className={inp}
                >
                  {ANIM_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a === "none"
                        ? "Байхгүй"
                        : a === "fade-up"
                          ? "Дээшээ гарах"
                          : a === "slide-left"
                            ? "Зүүнээс гулсах"
                            : "Томрох"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sections list */}
        <div>
          <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Хэсгүүд
          </div>
          <div className="space-y-0.5 px-2 pb-2">
            {sections.map((s, i) => (
              <div
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-xs transition-colors group ${selectedId === s.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <span className="flex-1 font-medium">
                  {SECTION_LABELS[s.type]}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(s.id, -1);
                    }}
                    disabled={i === 0}
                    className="px-1 py-0.5 rounded hover:bg-slate-700 disabled:opacity-20 transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(s.id, 1);
                    }}
                    disabled={i === sections.length - 1}
                    className="px-1 py-0.5 rounded hover:bg-slate-700 disabled:opacity-20 transition-colors"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                    className="px-1 py-0.5 rounded hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-2 pb-4 relative">
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Хэсэг нэмэх
            </button>
            {addOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setAddOpen(false)}
                />
                <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                  {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        onAdd(t);
                        setAddOpen(false);
                      }}
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

// ─── Nav Link Editor ──────────────────────────────────────────────────────────

function NavLinkEditor({
  value,
  pageList,
  onChange,
}: {
  value: string;
  pageList: PageDef[];
  onChange: (v: string) => void;
}) {
  const [links, setLinks] = useState<NavLinkDef[]>(() => parseNavLinks(value));
  const lastPushed = useRef(value);

  useEffect(() => {
    if (value !== lastPushed.current) {
      lastPushed.current = value;
      setLinks(parseNavLinks(value));
    }
  }, [value]);

  const inp =
    "w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition";

  function push(next: NavLinkDef[]) {
    setLinks(next);
    const s = serializeNavLinks(next.filter((l) => l.text.trim()));
    lastPushed.current = s;
    onChange(s);
  }

  function update(i: number, patch: Partial<NavLinkDef>) {
    push(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function remove(i: number) {
    push(links.filter((_, idx) => idx !== i));
  }

  function add() {
    push([...links, { text: "Холбоос", text_en: "Link", url: "#" }]);
  }

  return (
    <div className="space-y-2">
      {links.map((l, i) => (
        <div
          key={i}
          className="border border-slate-700 rounded-lg p-2.5 space-y-1.5 bg-slate-800/50"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-slate-400 font-medium">
              Холбоос {i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              className="text-slate-600 hover:text-red-400 transition-colors text-sm leading-none"
            >
              ×
            </button>
          </div>
          <input
            value={l.text}
            onChange={(e) => update(i, { text: e.target.value })}
            placeholder="Нэр [МН]"
            className={inp}
          />
          <input
            value={l.text_en}
            onChange={(e) => update(i, { text_en: e.target.value })}
            placeholder="Name [EN]"
            className={inp}
          />
          {/* Route selector */}
          <div className="space-y-1">
            <select
              value={
                pageList.find(
                  (p) =>
                    "/" + p.slug === l.url ||
                    p.slug === l.url.replace(/^\//, ""),
                )?.slug
                  ? l.url
                  : "__custom__"
              }
              onChange={(e) => {
                if (e.target.value !== "__custom__")
                  update(i, { url: e.target.value });
              }}
              className={inp}
            >
              <option value="__custom__">— Хуудас сонгох —</option>
              {pageList.map((p) => (
                <option key={p.slug} value={"/" + p.slug}>
                  /{p.slug} ({p.title})
                </option>
              ))}
            </select>
            <input
              value={l.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="URL: /about эсвэл https://..."
              className={inp}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-600 text-slate-500 hover:border-green-500 hover:text-green-400 text-xs transition-colors"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Холбоос нэмэх
      </button>
    </div>
  );
}

// ─── Button Editor ────────────────────────────────────────────────────────────

function ButtonEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [buttons, setButtons] = useState<ButtonDef[]>(() =>
    parseButtons(value),
  );
  const lastPushed = useRef(value);

  useEffect(() => {
    if (value !== lastPushed.current) {
      lastPushed.current = value;
      setButtons(parseButtons(value));
    }
  }, [value]);

  const inp =
    "w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition";

  function push(next: ButtonDef[]) {
    setButtons(next);
    const s = serializeButtons(next.filter((b) => b.text.trim()));
    lastPushed.current = s;
    onChange(s);
  }

  function update(index: number, patch: Partial<ButtonDef>) {
    push(buttons.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function remove(index: number) {
    push(buttons.filter((_, i) => i !== index));
  }

  function add() {
    push([
      ...buttons,
      { text: "Товч", text_en: "Button", url: "#", style: "primary" },
    ]);
  }

  const STYLES: ButtonDef["style"][] = ["primary", "outline", "ghost"];
  const STYLE_LABELS = {
    primary: "Үндсэн",
    outline: "Хүрээтэй",
    ghost: "Тунгалаг",
  };
  const STYLE_COLORS = {
    primary: "#16a34a",
    outline: "transparent",
    ghost: "transparent",
  };

  return (
    <div className="space-y-2">
      {buttons.map((b, i) => (
        <div
          key={i}
          className="border border-slate-700 rounded-lg p-2.5 space-y-1.5 bg-slate-800/50"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">
              Товч {i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              className="text-slate-600 hover:text-red-400 transition-colors text-sm leading-none"
            >
              ×
            </button>
          </div>
          <input
            value={b.text}
            onChange={(e) => update(i, { text: e.target.value })}
            placeholder="Текст [МН]"
            className={inp}
          />
          <input
            value={b.text_en}
            onChange={(e) => update(i, { text_en: e.target.value })}
            placeholder="Text [EN]"
            className={inp}
          />
          <input
            value={b.url}
            onChange={(e) => update(i, { url: e.target.value })}
            placeholder="URL эсвэл /route"
            className={inp}
          />
          <div className="flex gap-1 pt-0.5">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => update(i, { style: s })}
                className={`flex-1 py-1 text-xs rounded-md border transition-colors font-medium ${
                  b.style === s
                    ? "border-green-500 bg-green-600 text-white"
                    : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>
          {/* Live preview */}
          <div className="pt-1 flex justify-center">
            <button
              style={{
                background: b.style === "primary" ? "#16a34a" : "transparent",
                color: b.style === "primary" ? "#fff" : "#16a34a",
                border: b.style === "ghost" ? "none" : "2px solid #16a34a",
                padding: "5px 14px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: "default",
              }}
            >
              {b.text || "Товч"}
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-600 text-slate-500 hover:border-green-500 hover:text-green-400 text-xs transition-colors"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Товч нэмэх
      </button>
    </div>
  );
}

function RightPanel({
  section,
  pageList,
  onChange,
  onDelete,
  onAdd,
}: {
  section: Section | null;
  pageList: PageDef[];
  onChange: (patch: Record<string, string | number | boolean>) => void;
  onDelete: () => void;
  onAdd: (type: SectionType) => void;
}) {
  const inp =
    "w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition";
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  if (!section)
    return (
      <div className="w-72 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-600 px-6">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
              />
            </svg>
            <p className="text-xs">Дунд хэсгээс засварлах хэсгийг сонгоно уу</p>
          </div>
        </div>
        {/* Add section button at bottom when nothing selected */}
        <div className="p-3 border-t border-slate-800 relative">
          <button
            onClick={() => setAddOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-green-500 hover:text-green-400 text-xs font-medium transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Хэсэг нэмэх
          </button>
          {addOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAddOpen(false)}
              />
              <div className="absolute bottom-full mb-1 left-3 right-3 z-20 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Хэсэг сонгох
                  </p>
                </div>
                {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onAdd(t);
                      setAddOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                    {SECTION_LABELS[t]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

  return (
    <div className="w-72 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
      {/* Header with section type + delete */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <p className="flex-1 text-xs font-semibold text-white uppercase tracking-wider">
          {SECTION_LABELS[section.type]}{" "}
          <span className="text-slate-500 normal-case font-normal">
            Тохиргоо
          </span>
        </p>
        {confirmDel ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-400">Устгах уу?</span>
            <button
              onClick={() => {
                onDelete();
                setConfirmDel(false);
              }}
              className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
            >
              Тийм
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="px-2 py-0.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              Үгүй
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
            title="Устгах"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-2">
        {FIELD_DEFS[section.type].map((field) => {
          const val = String(section.props[field.key] ?? "");

          if (field.type === "navlinks")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-2">
                  {field.label}
                </label>
                <NavLinkEditor
                  value={val}
                  pageList={pageList}
                  onChange={(v) => onChange({ [field.key]: v })}
                />
              </div>
            );

          if (field.type === "buttons")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-2">
                  {field.label}
                </label>
                <ButtonEditor
                  value={val}
                  onChange={(v) => onChange({ [field.key]: v })}
                />
              </div>
            );

          if (field.type === "color")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {field.label}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={val || "#000000"}
                    onChange={(e) => onChange({ [field.key]: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-slate-700 bg-transparent flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onChange({ [field.key]: e.target.value })}
                    className={inp}
                  />
                </div>
              </div>
            );

          if (field.type === "textarea")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {field.label}
                </label>
                <textarea
                  value={val}
                  onChange={(e) => onChange({ [field.key]: e.target.value })}
                  rows={field.key === "slides" || field.key === "items" ? 8 : 3}
                  className={inp + " resize-y"}
                />
              </div>
            );

          if (field.type === "select")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {field.label}
                </label>
                <select
                  value={val}
                  onChange={(e) => onChange({ [field.key]: e.target.value })}
                  className={inp}
                >
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            );

          if (field.type === "range")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {field.label}: <span className="text-white">{val}</span>
                </label>
                <input
                  type="range"
                  min={field.min ?? 0}
                  max={field.max ?? 100}
                  value={Number(val) || field.min}
                  onChange={(e) => onChange({ [field.key]: e.target.value })}
                  className="w-full accent-blue-500"
                />
              </div>
            );

          if (field.type === "url")
            return (
              <div key={field.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {field.label}
                </label>
                <input
                  type="url"
                  value={val}
                  placeholder="https://..."
                  onChange={(e) => onChange({ [field.key]: e.target.value })}
                  className={inp}
                />
                {val && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 h-20 bg-slate-800">
                    <img
                      src={val}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            );

          return (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={val}
                onChange={(e) => onChange({ [field.key]: e.target.value })}
                className={inp}
              />
            </div>
          );
        })}
      </div>

      {/* Add section footer */}
      <div className="p-3 border-t border-slate-800 relative flex-shrink-0">
        <button
          onClick={() => setAddOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-green-500 hover:text-green-400 text-xs font-medium transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Хэсэг нэмэх
        </button>
        {addOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setAddOpen(false)}
            />
            <div className="absolute bottom-full mb-1 left-3 right-3 z-20 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-3 py-2 border-b border-slate-700">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Хэсэг сонгох
                </p>
              </div>
              {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onAdd(t);
                    setAddOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
                  {SECTION_LABELS[t]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section Preview (builder thumbnail) ─────────────────────────────────────

function SectionPreview({
  section,
  theme,
}: {
  section: Section;
  theme: GlobalTheme;
}) {
  const p = section.props;
  const font = theme.fontFamily;
  const animClass =
    theme.animation !== "none" ? `animate-${theme.animation}` : "";

  const bgStyle = (s: typeof p) => {
    if (String(s.bgImage))
      return {
        backgroundImage: `linear-gradient(${String(s.bgOverlay || "#00000050")}, ${String(s.bgOverlay || "#00000050")}), url(${String(s.bgImage)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    return { background: String(s.bgColor) };
  };

  switch (section.type) {
    case "navbar": {
      const navBtns = parseButtons(String(p.buttons || ""));
      const navLinks = parseNavLinks(String(p.navlinks || ""));
      return (
        <nav
          style={{
            background: String(p.bgColor),
            color: String(p.textColor),
            fontFamily: font,
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span
            style={{ fontSize: 18, fontWeight: 800, color: theme.primaryColor }}
          >
            {String(p.logo)}
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {navLinks.map((l, i) => (
              <span key={i} style={{ fontSize: 13, opacity: 0.75 }}>
                {l.text}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {navBtns.map((b, i) => (
              <button
                key={i}
                style={{
                  background:
                    b.style === "primary" ? theme.primaryColor : "transparent",
                  color: b.style === "primary" ? "#fff" : theme.primaryColor,
                  border:
                    b.style === "ghost"
                      ? "none"
                      : `2px solid ${theme.primaryColor}`,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 7,
                  cursor: "pointer",
                }}
              >
                {b.text}
              </button>
            ))}
          </div>
        </nav>
      );
    }

    case "slider": {
      const firstSlide = String(p.slides).split("\n")[0] || "";
      const [imgUrl, title = "Слайдер гарчиг", sub = ""] =
        firstSlide.split("|");
      const h = Number(p.height) || 400;
      return (
        <div
          style={{
            height: Math.min(h, 300),
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imgUrl?.startsWith("http") && (
            <img
              src={imgUrl}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: String(p.overlayColor || "#00000060"),
            }}
          />
          <div
            style={{
              position: "relative",
              textAlign: "center",
              color: String(p.textColor || "#fff"),
              padding: "0 32px",
            }}
          >
            <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
              Слайд 1 / {String(p.slides).split("\n").filter(Boolean).length}
            </p>
            <div
              style={{
                fontSize: Math.min(theme.headingSize * 0.7, 32),
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              {title}
            </div>
            {sub && <div style={{ fontSize: 14, opacity: 0.85 }}>{sub}</div>}
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              {String(p.slides)
                .split("\n")
                .filter(Boolean)
                .map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === 0 ? 20 : 7,
                      height: 7,
                      borderRadius: 4,
                      background: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      );
    }

    case "hero": {
      const align = String(p.align ?? "center") as "left" | "center" | "right";
      const justifyMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
      };
      const style = p.bgImage
        ? {
            backgroundImage: `linear-gradient(${String(p.bgOverlay || "#00000070")}, ${String(p.bgOverlay || "#00000070")}), url(${String(p.bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { background: String(p.bgColor) };
      return (
        <section
          style={{
            ...style,
            color: String(p.textColor),
            fontFamily: font,
            padding: "64px 40px",
            textAlign: align,
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin:
                align === "center"
                  ? "0 auto"
                  : align === "right"
                    ? "0 0 0 auto"
                    : "0",
            }}
          >
            <h1
              className={animClass}
              style={{
                fontSize: theme.headingSize * 0.8,
                fontWeight: 900,
                lineHeight: 1.15,
                margin: "0 0 12px",
              }}
            >
              {String(p.heading)}
            </h1>
            <p
              className={animClass}
              style={{
                fontSize: theme.headingSize * 0.36,
                fontWeight: 500,
                margin: "0 0 10px",
                opacity: 0.88,
                animationDelay: "60ms",
              }}
            >
              {String(p.subheading)}
            </p>
            <p
              className={animClass}
              style={{
                fontSize: theme.bodySize,
                margin: "0 0 24px",
                opacity: 0.72,
                animationDelay: "120ms",
              }}
            >
              {String(p.body)}
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: justifyMap[align],
                flexWrap: "wrap",
              }}
            >
              {parseButtons(String(p.buttons || "")).map((b, i) => (
                <button
                  key={i}
                  style={{
                    background: b.style === "primary" ? "#fff" : "transparent",
                    color:
                      b.style === "primary"
                        ? theme.primaryColor
                        : String(p.textColor),
                    border:
                      b.style === "ghost"
                        ? "none"
                        : `2px solid ${b.style === "primary" ? "#fff" : String(p.textColor)}60`,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "10px 22px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  {b.text}
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "features": {
      const items = String(p.items || "")
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [left = "", desc = ""] = line.split("|");
          const parts = left.trim().split(" ");
          return {
            icon: parts[0] ?? "",
            title: parts.slice(1).join(" "),
            desc: desc.trim(),
          };
        });
      const style = p.bgImage
        ? {
            backgroundImage: `linear-gradient(${String(p.bgOverlay || "#f8fafc99")}, ${String(p.bgOverlay || "#f8fafc99")}), url(${String(p.bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { background: String(p.bgColor) };
      return (
        <section style={{ ...style, fontFamily: font, padding: "56px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2
              className={animClass}
              style={{
                fontSize: theme.headingSize * 0.6,
                fontWeight: 800,
                color: String(p.titleColor),
                margin: "0 0 8px",
              }}
            >
              {String(p.title)}
            </h2>
            <p
              style={{
                fontSize: theme.bodySize - 1,
                color: String(p.textColor),
              }}
            >
              {String(p.subtitle)}
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`,
              gap: 18,
            }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className={animClass}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 14,
                  padding: "22px 18px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: theme.bodySize,
                    color: String(p.titleColor),
                    margin: "0 0 4px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: theme.bodySize - 2,
                    color: String(p.textColor),
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "cta": {
      const style = p.bgImage
        ? {
            backgroundImage: `linear-gradient(${String(p.bgOverlay || "#0f172acc")}, ${String(p.bgOverlay || "#0f172acc")}), url(${String(p.bgImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { background: String(p.bgColor) };
      return (
        <section
          style={{
            ...style,
            color: String(p.textColor),
            fontFamily: font,
            padding: "64px 40px",
            textAlign: "center",
          }}
        >
          <h2
            className={animClass}
            style={{
              fontSize: theme.headingSize * 0.6,
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            {String(p.heading)}
          </h2>
          <p
            style={{
              fontSize: theme.bodySize,
              margin: "0 0 28px",
              opacity: 0.82,
            }}
          >
            {String(p.subheading)}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {parseButtons(String(p.buttons || "")).map((b, i) => (
              <button
                key={i}
                style={{
                  background:
                    b.style === "primary" ? theme.primaryColor : "transparent",
                  color: b.style === "primary" ? "#fff" : String(p.textColor),
                  border:
                    b.style === "ghost"
                      ? "none"
                      : `2px solid ${b.style === "primary" ? theme.primaryColor : String(p.textColor)}60`,
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "12px 28px",
                  borderRadius: 9,
                  cursor: "pointer",
                }}
              >
                {b.text}
              </button>
            ))}
          </div>
        </section>
      );
    }

    case "footer":
      return (
        <footer
          style={{
            background: String(p.bgColor),
            fontFamily: font,
            padding: "32px 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: theme.primaryColor,
              }}
            >
              {String(p.brand)}
            </span>
            <div style={{ display: "flex", gap: 18 }}>
              {String(p.links)
                .split(",")
                .map((l, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      color: String(p.textColor),
                      opacity: 0.8,
                    }}
                  >
                    {l.trim()}
                  </span>
                ))}
            </div>
          </div>
          <p
            style={{
              fontSize: 11,
              color: String(p.textColor),
              opacity: 0.5,
              margin: 0,
            }}
          >
            {String(p.copyright)}
          </p>
        </footer>
      );

    default:
      return null;
  }
}
