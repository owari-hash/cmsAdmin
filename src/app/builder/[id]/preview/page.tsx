"use client";
import { use, useEffect, useState, useRef, useCallback, createContext, useContext, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ─── Language context ─────────────────────────────────────────────────────────
type Lang = "mn" | "en";
const LangCtx = createContext<Lang>("mn");
const useLang = () => useContext(LangCtx);

// ─── Navigation context ───────────────────────────────────────────────────────
interface NavCtxValue {
  activePage: string;
  pageList: PageDef[];
  navigate: (slug: string) => void;
}
const NavCtx = createContext<NavCtxValue>({ activePage: "home", pageList: [], navigate: () => {} });
const useNav = () => useContext(NavCtx);

/** Returns p[key_en] if lang=en and it exists, otherwise p[key] */
function t(p: Record<string, string | number | boolean>, key: string, lang: Lang): string {
  if (lang === "en") {
    const en = String(p[`${key}_en`] ?? "");
    if (en) return en;
  }
  return String(p[key] ?? "");
}

// ─── Button & nav link helpers ────────────────────────────────────────────────
interface NavLinkDef { text: string; text_en: string; url: string }

function parseNavLinks(raw: string): NavLinkDef[] {
  return raw.split("\n").map(line => {
    const [text = "", text_en = "", url = "#"] = line.split("|");
    return { text: text.trim(), text_en: text_en.trim(), url: url.trim() || "#" };
  }).filter(l => l.text);
}

interface ButtonDef { text: string; text_en: string; url: string; style: "primary" | "outline" | "ghost" }

function parseButtons(raw: string): ButtonDef[] {
  return raw.split("\n").map(line => {
    const [text = "", text_en = "", url = "#", style = "primary"] = line.split("|");
    return { text: text.trim(), text_en: text_en.trim(), url: url.trim() || "#", style: style.trim() as ButtonDef["style"] };
  }).filter(b => b.text);
}

function renderBtnText(b: ButtonDef, lang: Lang) {
  return lang === "en" && b.text_en ? b.text_en : b.text;
}

// ─── Types (mirrors builder page) ─────────────────────────────────────────────

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

interface PageDef { slug: string; title: string; title_en: string }

const PAGE_LIST: PageDef[] = [
  { slug: "home",        title: "Нүүр",            title_en: "Home" },
  { slug: "about",       title: "Бидний тухай",    title_en: "About Us" },
  { slug: "services",    title: "Үйл ажиллагаа",  title_en: "Services" },
  { slug: "partnership", title: "Хамтран ажиллах", title_en: "Partnership" },
  { slug: "news",        title: "Мэдээ мэдээлэл",  title_en: "News" },
  { slug: "contact",     title: "Холбоо барих",    title_en: "Contact" },
];

interface BuilderState {
  templateName: string;
  theme: GlobalTheme;
  allPages?: Record<string, Section[]>;
  pageList?: PageDef[];
  sections?: Section[]; // legacy
}

// ─── Defaults (fallback when no localStorage) ─────────────────────────────────

const DEFAULT_THEME: GlobalTheme = {
  primaryColor: "#1e40af",
  secondaryColor: "#0f172a",
  fontFamily: "Inter",
  headingSize: 48,
  bodySize: 16,
  animation: "fade-up",
};

const STORAGE_KEY = (id: string) => `builder-state-${id}`;

function loadState(id: string): BuilderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(id));
    if (!raw) return null;
    return JSON.parse(raw) as BuilderState;
  } catch {
    return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PreviewInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [activePage, setActivePage] = useState<string>(searchParams.get("page") ?? "home");
  const [state, setState] = useState<BuilderState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState<Lang>("mn");

  const refresh = useCallback(() => {
    const s = loadState(id);
    setState(s);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, [id]);

  useEffect(() => {
    refresh();

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY(id)) refresh();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id, refresh]);

  const theme = state?.theme ?? DEFAULT_THEME;
  const allPages = state?.allPages ?? (state?.sections ? { home: state.sections } : {});
  const sections = allPages[activePage] ?? [];
  const pageList = state?.pageList ?? PAGE_LIST;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: '${theme.fontFamily}', 'Inter', 'Segoe UI', sans-serif; color: #1e293b; background: #fff; font-size: ${theme.bodySize}px; }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; border: none; font-family: inherit; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ── Animations ── */
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideLeft { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes zoomIn   { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes sliderMove { from { transform:translateX(0); } to { transform:translateX(-100%); } }

        .anim-fade-up    { animation: fadeUp   0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-slide-left { animation: slideLeft 0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-zoom-in    { animation: zoomIn   0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-none { }

        /* ── Navbar ── */
        .pv-navbar {
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          height: 68px; display: flex; align-items: center;
        }
        .pv-nav-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .pv-nav-logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .pv-nav-links { display: flex; gap: 28px; }
        .pv-nav-links a { font-size: 14px; font-weight: 500; opacity: 0.7; transition: opacity 0.15s; }
        .pv-nav-links a:hover { opacity: 1; }
        .pv-nav-cta { font-size: 14px; font-weight: 600; padding: 10px 22px; border-radius: 8px; transition: opacity 0.15s; }
        .pv-nav-cta:hover { opacity: 0.85; }

        /* ── Slider ── */
        .pv-slider { position: relative; overflow: hidden; }
        .pv-slides-track { display: flex; transition: transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .pv-slide { min-width: 100%; position: relative; background-size: cover; background-position: center; }
        .pv-slide-overlay { position: absolute; inset: 0; }
        .pv-slide-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; padding: 48px 24px; }
        .pv-slide-title { font-size: 52px; font-weight: 900; line-height: 1.1; margin-bottom: 14px; letter-spacing: -0.02em; }
        .pv-slide-sub   { font-size: 20px; opacity: 0.85; margin-bottom: 32px; max-width: 560px; line-height: 1.5; }
        .pv-slide-btn   { padding: 13px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; }
        .pv-slider-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: #fff; border: 1px solid rgba(255,255,255,0.3); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; font-size: 20px; }
        .pv-slider-arrow:hover { background: rgba(255,255,255,0.35); }
        .pv-slider-prev { left: 20px; }
        .pv-slider-next { right: 20px; }
        .pv-slider-dots { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10; }
        .pv-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.45); cursor: pointer; transition: all 0.2s; border: none; }
        .pv-dot.active { background: #fff; transform: scale(1.3); }

        /* ── Hero ── */
        .pv-hero { padding: 90px 24px 110px; color: #fff; text-align: center; position: relative; overflow: hidden; background-size: cover; background-position: center; }
        .pv-hero-overlay { position: absolute; inset: 0; }
        .pv-hero-content { position: relative; z-index: 1; }
        .pv-hero h1 { font-weight: 900; line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.02em; }
        .pv-hero .sub { font-size: 17px; opacity: 0.8; margin-bottom: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .pv-hero .body { font-size: 17px; opacity: 0.75; margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.65; }
        .pv-hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .pv-btn-primary { font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; }
        .pv-btn-outline { background: transparent; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; border: 2px solid rgba(255,255,255,0.4); color: #fff; }
        .pv-btn-outline:hover { border-color: rgba(255,255,255,0.8); }

        /* ── Features ── */
        .pv-features { padding: 88px 24px; position: relative; background-size: cover; background-position: center; }
        .pv-features-overlay { position: absolute; inset: 0; }
        .pv-features-content { position: relative; z-index: 1; }
        .pv-section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .pv-section-title { font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 12px; }
        .pv-section-sub { font-size: 16px; opacity: 0.7; line-height: 1.6; max-width: 520px; margin-top: 12px; }
        .pv-feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-top: 48px; }
        .pv-feat-card { background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px; border: 1px solid rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; }
        .pv-feat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
        .pv-feat-icon { font-size: 28px; margin-bottom: 14px; }
        .pv-feat-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
        .pv-feat-desc  { font-size: 13px; opacity: 0.65; line-height: 1.65; }

        /* ── CTA ── */
        .pv-cta { padding: 80px 24px; text-align: center; position: relative; background-size: cover; background-position: center; }
        .pv-cta-overlay { position: absolute; inset: 0; }
        .pv-cta-content { position: relative; z-index: 1; }
        .pv-cta h2 { font-weight: 900; margin-bottom: 14px; letter-spacing: -0.02em; }
        .pv-cta p { font-size: 16px; opacity: 0.75; margin-bottom: 36px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.6; }
        .pv-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* ── Footer ── */
        .pv-footer { padding: 48px 24px 28px; }
        .pv-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .pv-footer-brand { font-size: 20px; font-weight: 800; }
        .pv-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .pv-footer-links a { font-size: 13px; opacity: 0.55; transition: opacity 0.15s; }
        .pv-footer-links a:hover { opacity: 1; }
        .pv-footer-copy { font-size: 12px; opacity: 0.4; margin-top: 20px; }

        /* ── Floating refresh ── */
        .pv-refresh { position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #1e293b; color: #fff; border: none; border-radius: 50px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); display: flex; align-items: center; gap-6px; transition: background 0.15s, transform 0.15s; gap: 6px; }
        .pv-refresh:hover { background: #0f172a; transform: scale(1.04); }
        .pv-refresh svg { transition: transform 0.4s; }
        .pv-refresh.spinning svg { animation: spin 0.5s linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Sections */}
      <NavCtx.Provider value={{ activePage, pageList, navigate: (slug) => { setActivePage(slug); window.scrollTo({ top: 0, behavior: "smooth" }); } }}>
      <LangCtx.Provider value={lang}>
        {sections.length === 0 ? (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#64748b", fontFamily: "Inter, sans-serif" }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: 0.3 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Байхгүй байна</p>
            <p style={{ fontSize: 13 }}>Эхлээд Builder хуудсанд хэсгүүд нэмнэ үү</p>
          </div>
        ) : sections.map((s, i) => (
          <SectionRenderer key={s.id} section={s} theme={theme} index={i} />
        ))}
      </LangCtx.Provider>
      </NavCtx.Provider>

      {/* Floating bar: lang toggle + refresh */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ background: "#1e293b", borderRadius: 50, display: "flex", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <button
            onClick={() => setLang("mn")}
            style={{ padding: "9px 16px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", border: "none", cursor: "pointer", background: lang === "mn" ? "#3b82f6" : "transparent", color: lang === "mn" ? "#fff" : "#94a3b8", transition: "all 0.15s" }}
          >МН</button>
          <button
            onClick={() => setLang("en")}
            style={{ padding: "9px 16px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", border: "none", cursor: "pointer", background: lang === "en" ? "#3b82f6" : "transparent", color: lang === "en" ? "#fff" : "#94a3b8", transition: "all 0.15s" }}
          >EN</button>
        </div>
        <button className={`pv-refresh${refreshing ? " spinning" : ""}`} onClick={refresh} title="Шинэчлэх">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Шинэчлэх
        </button>
      </div>
    </>
  );
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <PreviewInner id={id} />
    </Suspense>
  );
}

// ─── Section Renderer ─────────────────────────────────────────────────────────

function SectionRenderer({ section, theme, index }: { section: Section; theme: GlobalTheme; index: number }) {
  const animClass = theme.animation !== "none" ? `anim-${theme.animation}` : "";
  const delay = (n: number) => theme.animation !== "none" ? { animationDelay: `${n}ms`, animationFillMode: "both" } : {};
  const p = section.props;

  function bgStyle(bgImage: string | undefined, bgOverlay: string | undefined, bgColor: string | undefined) {
    const img = String(bgImage || "");
    const overlay = String(bgOverlay || "transparent");
    const color = String(bgColor || "#fff");
    if (img) {
      return {
        backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { backgroundColor: color };
  }

  switch (section.type) {
    case "navbar": return <NavbarSection p={p} theme={theme} />;
    case "slider": return <SliderSection p={p} theme={theme} />;
    case "hero":   return <HeroSection p={p} theme={theme} animClass={animClass} delay={delay} />;
    case "features": return <FeaturesSection p={p} theme={theme} animClass={animClass} delay={delay} bgStyle={bgStyle} />;
    case "cta":    return <CtaSection p={p} theme={theme} animClass={animClass} delay={delay} bgStyle={bgStyle} />;
    case "footer": return <FooterSection p={p} theme={theme} />;
    default: return null;
  }
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function NavbarSection({ p, theme }: { p: Record<string, string | number | boolean>; theme: GlobalTheme }) {
  const lang = useLang();
  const { activePage, pageList, navigate } = useNav();
  const bg = String(p.bgColor || "#ffffff");
  const color = String(p.textColor || "#1e293b");
  const navLinks = parseNavLinks(String(p.navlinks || ""));

  function resolveNav(e: React.MouseEvent<HTMLAnchorElement>, url: string) {
    const clean = url.replace(/^\//, "").toLowerCase();
    const matched = pageList.find(pg =>
      pg.slug === clean || ("/" + pg.slug) === url ||
      pg.title.toLowerCase() === clean || pg.title_en.toLowerCase() === clean
    );
    if (matched) { e.preventDefault(); navigate(matched.slug); }
  }

  return (
    <nav className="pv-navbar" style={{ background: `${bg}ee`, color }}>
      <div className="container">
        <div className="pv-nav-inner">
          {/* Logo */}
          <div className="pv-nav-logo" style={{ color: theme.primaryColor, cursor: "pointer" }}
            onClick={() => navigate(pageList[0]?.slug ?? "home")}>
            {String(p.logo || "Logo")}
          </div>

          {/* Nav links — use navlinks prop with individual URLs */}
          <div className="pv-nav-links">
            {navLinks.map((l, i) => {
              const linkText = lang === "en" && l.text_en ? l.text_en : l.text;
              const clean = l.url.replace(/^\//, "").toLowerCase();
              const matchedSlug = pageList.find(pg =>
                pg.slug === clean || ("/" + pg.slug) === l.url
              )?.slug;
              const isActive = matchedSlug === activePage;
              return (
                <a key={i} href={l.url}
                  onClick={(e) => resolveNav(e, l.url)}
                  style={{
                    color,
                    fontWeight: isActive ? 700 : 500,
                    opacity: isActive ? 1 : 0.65,
                    borderBottom: isActive ? `2px solid ${theme.primaryColor}` : "2px solid transparent",
                    paddingBottom: 2,
                    transition: "all 0.15s",
                  }}
                >{linkText}</a>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {parseButtons(String(p.buttons || "")).map((b, i) => (
              <a key={i} href={b.url} onClick={(e) => resolveNav(e, b.url)}
                className="pv-nav-cta"
                style={{
                  background: b.style === "primary" ? theme.primaryColor : "transparent",
                  color: b.style === "primary" ? "#fff" : theme.primaryColor,
                  border: b.style === "ghost" ? "none" : `2px solid ${theme.primaryColor}`,
                }}>
                {renderBtnText(b, lang)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function SliderSection({ p, theme }: { p: Record<string, string | number | boolean>; theme: GlobalTheme }) {
  const lang = useLang();
  const rawSlides = t(p, "slides", lang);
  const slides = rawSlides
    .split("\n")
    .map((line) => {
      const [img, title, sub, btn] = line.split("|");
      return { img: img?.trim() || "", title: title?.trim() || "", sub: sub?.trim() || "", btn: btn?.trim() || "Дэлгэрэнгүй" };
    })
    .filter((s) => s.img || s.title);

  const height = Number(p.height || 560);
  const overlay = String(p.overlayColor || "#00000060");
  const textColor = String(p.textColor || "#ffffff");
  const autoPlay = String(p.autoPlay) === "true";
  const interval = Number(p.interval || 4000);

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || slides.length < 2) return;
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, interval, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="pv-slider" style={{ height }}>
      <div className="pv-slides-track" style={{ transform: `translateX(-${current * 100}%)`, height: "100%" }}>
        {slides.map((s, i) => (
          <div
            key={i}
            className="pv-slide"
            style={{
              height,
              backgroundImage: s.img ? `url(${s.img})` : undefined,
              backgroundColor: s.img ? undefined : theme.secondaryColor,
            }}
          >
            <div className="pv-slide-overlay" style={{ background: overlay }} />
            <div className="pv-slide-content" style={{ color: textColor }}>
              <h2 className="pv-slide-title">{s.title}</h2>
              {s.sub && <p className="pv-slide-sub">{s.sub}</p>}
              <button className="pv-slide-btn" style={{ background: theme.primaryColor, color: "#fff" }}>{s.btn}</button>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button className="pv-slider-arrow pv-slider-prev" onClick={() => goTo(current - 1)}>‹</button>
          <button className="pv-slider-arrow pv-slider-next" onClick={() => goTo(current + 1)}>›</button>
          <div className="pv-slider-dots">
            {slides.map((_, i) => (
              <button key={i} className={`pv-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ p, theme, animClass, delay }: {
  p: Record<string, string | number | boolean>;
  theme: GlobalTheme;
  animClass: string;
  delay: (n: number) => React.CSSProperties;
}) {
  const lang = useLang();
  const { pageList, navigate } = useNav();

  function handleUrl(e: React.MouseEvent<HTMLAnchorElement>, url: string) {
    const clean = url.replace(/^\//, "").toLowerCase();
    const matched = pageList.find(pg => pg.slug === clean || ("/" + pg.slug) === url || pg.title_en.toLowerCase() === clean);
    if (matched) { e.preventDefault(); navigate(matched.slug); }
  }
  const bgImage = String(p.bgImage || "");
  const bgOverlay = String(p.bgOverlay || "#1e3a8a99");
  const bgColor = String(p.bgColor || theme.secondaryColor);
  const textColor = String(p.textColor || "#ffffff");
  const align = String(p.align || "center") as "left" | "center" | "right";

  const bgStyleObj = bgImage
    ? { backgroundImage: `linear-gradient(${bgOverlay}, ${bgOverlay}), url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${bgColor}, ${theme.primaryColor})` };

  return (
    <section className="pv-hero" style={{ ...bgStyleObj, textAlign: align }}>
      {bgImage && <div className="pv-hero-overlay" style={{ background: bgOverlay }} />}
      <div className="pv-hero-content" style={{ color: textColor }}>
        {p.subheading && (
          <div className={`sub ${animClass}`} style={delay(0)}>{t(p, "subheading", lang)}</div>
        )}
        <h1 className={animClass} style={{ ...delay(80), fontSize: theme.headingSize, color: textColor }}>
          {t(p, "heading", lang) || "Гарчиг"}
        </h1>
        {p.body && (
          <p className={`body ${animClass}`} style={delay(160)}>{t(p, "body", lang)}</p>
        )}
        <div className={`pv-hero-btns ${animClass}`} style={{ ...delay(240), justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center" }}>
          {parseButtons(String(p.buttons || "")).map((b, i) => (
            <a key={i} href={b.url} onClick={(e) => handleUrl(e, b.url)} style={{
              display: "inline-block",
              background: b.style === "primary" ? theme.primaryColor : "transparent",
              color: b.style === "primary" ? "#fff" : String(p.textColor || "#fff"),
              border: b.style === "ghost" ? "none" : `2px solid ${b.style === "primary" ? theme.primaryColor : "rgba(255,255,255,0.5)"}`,
              fontWeight: 700, fontSize: 15, padding: "13px 30px", borderRadius: 10, textDecoration: "none",
            }}>
              {renderBtnText(b, lang)}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection({ p, theme, animClass, delay, bgStyle }: {
  p: Record<string, string | number | boolean>;
  theme: GlobalTheme;
  animClass: string;
  delay: (n: number) => React.CSSProperties;
  bgStyle: (img?: string, overlay?: string, color?: string) => React.CSSProperties;
}) {
  const lang = useLang();
  const titleColor = String(p.titleColor || theme.secondaryColor);
  const textColor = String(p.textColor || "#64748b");
  const bg = bgStyle(String(p.bgImage || ""), String(p.bgOverlay || ""), String(p.bgColor || "#f8fafc"));

  const items = t(p, "items", lang)
    .split("\n")
    .map((line) => {
      const [titlePart, desc] = line.split("|");
      return { title: titlePart?.trim() || "", desc: desc?.trim() || "" };
    })
    .filter((i) => i.title);

  return (
    <section className="pv-features" style={bg}>
      {p.bgImage && <div className="pv-features-overlay" style={{ background: String(p.bgOverlay || "transparent") }} />}
      <div className="pv-features-content container">
        <div style={{ textAlign: "center" }}>
          {p.title && (
            <h2 className={`pv-section-title ${animClass}`} style={{ ...delay(0), fontSize: theme.headingSize * 0.7, color: titleColor }}>
              {t(p, "title", lang)}
            </h2>
          )}
          {p.subtitle && (
            <p className={`pv-section-sub ${animClass}`} style={{ ...delay(80), color: textColor, margin: "12px auto 0" }}>
              {t(p, "subtitle", lang)}
            </p>
          )}
        </div>
        <div className="pv-feat-grid">
          {items.map((item, i) => {
            // first "word" is emoji if it's 2 chars or less (emoji)
            const parts = item.title.split(" ");
            const firstWord = parts[0];
            const isEmoji = [...firstWord].length <= 2 && firstWord.length <= 4;
            const emoji = isEmoji ? firstWord : "";
            const title = isEmoji ? parts.slice(1).join(" ") : item.title;

            return (
              <div key={i} className={`pv-feat-card ${animClass}`} style={delay(i * 60)}>
                {emoji && <div className="pv-feat-icon">{emoji}</div>}
                <div className="pv-feat-title" style={{ color: titleColor }}>{title}</div>
                <div className="pv-feat-desc" style={{ color: textColor }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection({ p, theme, animClass, delay, bgStyle }: {
  p: Record<string, string | number | boolean>;
  theme: GlobalTheme;
  animClass: string;
  delay: (n: number) => React.CSSProperties;
  bgStyle: (img?: string, overlay?: string, color?: string) => React.CSSProperties;
}) {
  const lang = useLang();
  const { pageList, navigate } = useNav();

  function handleUrl(e: React.MouseEvent<HTMLAnchorElement>, url: string) {
    const clean = url.replace(/^\//, "").toLowerCase();
    const matched = pageList.find(pg => pg.slug === clean || ("/" + pg.slug) === url || pg.title_en.toLowerCase() === clean);
    if (matched) { e.preventDefault(); navigate(matched.slug); }
  }
  const textColor = String(p.textColor || "#ffffff");
  const bg = bgStyle(String(p.bgImage || ""), String(p.bgOverlay || ""), String(p.bgColor || theme.secondaryColor));

  return (
    <section className="pv-cta" style={bg}>
      {p.bgImage && <div className="pv-cta-overlay" style={{ background: String(p.bgOverlay || "transparent") }} />}
      <div className="pv-cta-content" style={{ color: textColor }}>
        <h2 className={animClass} style={{ ...delay(0), fontSize: theme.headingSize * 0.85, color: textColor }}>
          {t(p, "heading", lang) || "Уриалга"}
        </h2>
        {p.subheading && (
          <p className={animClass} style={delay(80)}>{t(p, "subheading", lang)}</p>
        )}
        <div className={`pv-cta-btns ${animClass}`} style={delay(160)}>
          {parseButtons(String(p.buttons || "")).map((b, i) => (
            <a key={i} href={b.url} onClick={(e) => handleUrl(e, b.url)} style={{
              display: "inline-block",
              background: b.style === "primary" ? theme.primaryColor : "transparent",
              color: b.style === "primary" ? "#fff" : String(p.textColor || "#fff"),
              border: b.style === "ghost" ? "none" : `2px solid ${b.style === "primary" ? theme.primaryColor : "rgba(255,255,255,0.4)"}`,
              fontWeight: 700, fontSize: 15, padding: "13px 30px", borderRadius: 10, textDecoration: "none",
            }}>
              {renderBtnText(b, lang)}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterSection({ p, theme }: { p: Record<string, string | number | boolean>; theme: GlobalTheme }) {
  const lang = useLang();
  const bg = String(p.bgColor || "#0f172a");
  const color = String(p.textColor || "#94a3b8");
  const links = t(p, "links", lang).split(",").map((l) => l.trim()).filter(Boolean);

  return (
    <footer className="pv-footer" style={{ background: bg, color }}>
      <div className="container">
        <div className="pv-footer-inner">
          <div className="pv-footer-brand" style={{ color: theme.primaryColor }}>
            {String(p.brand || "Brand")}
          </div>
          <div className="pv-footer-links">
            {links.map((l, i) => <a key={i} href="#" style={{ color }}>{l}</a>)}
          </div>
        </div>
        <div className="pv-footer-copy" style={{ color }}>
          {t(p, "copyright", lang) || `© ${new Date().getFullYear()} — All rights reserved`}
        </div>
      </div>
    </footer>
  );
}
