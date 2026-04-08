import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CMS Admin",
  description: "Website builder admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
  var t=JSON.parse(localStorage.getItem('cms-theme')||'{}').state||{};
  if((t.theme||'dark')==='dark')document.documentElement.classList.add('dark');
  var themes={indigo:{'--accent-600':'#4f46e5','--accent-500':'#6366f1','--accent-400':'#818cf8','--accent-faint':'rgba(99,102,241,0.1)','--accent-faint-hover':'rgba(99,102,241,0.2)','--accent-border':'rgba(99,102,241,0.5)'},blue:{'--accent-600':'#2563eb','--accent-500':'#3b82f6','--accent-400':'#60a5fa','--accent-faint':'rgba(59,130,246,0.1)','--accent-faint-hover':'rgba(59,130,246,0.2)','--accent-border':'rgba(59,130,246,0.5)'},violet:{'--accent-600':'#7c3aed','--accent-500':'#8b5cf6','--accent-400':'#a78bfa','--accent-faint':'rgba(139,92,246,0.1)','--accent-faint-hover':'rgba(139,92,246,0.2)','--accent-border':'rgba(139,92,246,0.5)'},emerald:{'--accent-600':'#059669','--accent-500':'#10b981','--accent-400':'#34d399','--accent-faint':'rgba(16,185,129,0.1)','--accent-faint-hover':'rgba(16,185,129,0.2)','--accent-border':'rgba(16,185,129,0.5)'},rose:{'--accent-600':'#e11d48','--accent-500':'#f43f5e','--accent-400':'#fb7185','--accent-faint':'rgba(244,63,94,0.1)','--accent-faint-hover':'rgba(244,63,94,0.2)','--accent-border':'rgba(244,63,94,0.5)'},amber:{'--accent-600':'#d97706','--accent-500':'#f59e0b','--accent-400':'#fbbf24','--accent-faint':'rgba(245,158,11,0.1)','--accent-faint-hover':'rgba(245,158,11,0.2)','--accent-border':'rgba(245,158,11,0.5)'}};
  var vars=themes[t.accent||'indigo']||themes.indigo;
  var r=document.documentElement;
  Object.keys(vars).forEach(function(k){r.style.setProperty(k,vars[k]);});
}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white antialiased min-h-full transition-colors duration-200`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
