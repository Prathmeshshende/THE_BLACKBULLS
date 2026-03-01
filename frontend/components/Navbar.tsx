"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAppLanguage, onAppLanguageChange, setAppLanguage, type AppLanguage } from "@/lib/language";

type Props = {
  language?: AppLanguage;
  onLanguageChange?: (language: AppLanguage) => void;
};

const NAV_LINKS = [
  { href: "/voice", en: "Voice", hi: "आवाज़" },
  { href: "/dashboard", en: "Dashboard", hi: "डैशबोर्ड" },
  { href: "/hospitals", en: "Hospitals", hi: "अस्पताल" },
  { href: "/eligibility-checker", en: "Eligibility", hi: "पात्रता" },
];

export default function Navbar({ language, onLanguageChange }: Props) {
  const pathname = usePathname();
  const [resolvedLanguage, setResolvedLanguage] = useState<AppLanguage>(language ?? "en");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!language) {
      setResolvedLanguage(getAppLanguage());
      return onAppLanguageChange((next) => setResolvedLanguage(next));
    }
    setResolvedLanguage(language);
    setAppLanguage(language);
  }, [language]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    setResolvedLanguage(nextLanguage);
    setAppLanguage(nextLanguage);
    onLanguageChange?.(nextLanguage);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b py-2 shadow-glass-lg" : "border-b border-transparent py-3"
        }`}
      style={{
        background: scrolled ? "rgba(2,8,23,0.90)" : "rgba(2,8,23,0.65)",
        borderColor: scrolled ? "rgba(255,255,255,0.08)" : "transparent",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="relative flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg,#00e5a0,#38bdf8)",
              boxShadow: "0 0 20px rgba(0,229,160,0.45)",
            }}
          >
            <span className="text-sm font-black" style={{ color: "#020817" }}>A+</span>
            <span
              className="animate-mic-ring absolute inset-0 rounded-xl"
              style={{ border: "2px solid rgba(0,229,160,0.4)" }}
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-extrabold tracking-tight text-white">Arogya</span>
            <span
              className="ml-1 text-lg font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(90deg,#38bdf8,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (pathname?.startsWith(`${link.href}/`) ?? false);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${isActive ? "text-neon-mint" : "text-slate-400 hover:text-white"
                  }`}
              >
                {resolvedLanguage === "hi" ? link.hi : link.en}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#00e5a0,#38bdf8)",
                      boxShadow: "0 0 8px rgba(0,229,160,0.7)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div
            className="flex overflow-hidden rounded-lg text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            {(["en", "hi"] as AppLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className="px-3 py-1.5 transition-all"
                style={
                  resolvedLanguage === lang
                    ? { background: "linear-gradient(135deg,#00e5a0,#38bdf8)", color: "#020817" }
                    : { color: "#94a3b8" }
                }
              >
                {lang === "en" ? "EN" : "हि"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="flex items-center gap-1 overflow-x-auto px-6 pb-2 pt-1 md:hidden">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${isActive ? "text-neon-mint" : "text-slate-400"
                }`}
              style={
                isActive
                  ? { background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.25)" }
                  : {}
              }
            >
              {resolvedLanguage === "hi" ? link.hi : link.en}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
