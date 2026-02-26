"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAppLanguage, onAppLanguageChange, setAppLanguage, type AppLanguage } from "@/lib/language";

type Props = {
  language?: AppLanguage;
  onLanguageChange?: (language: AppLanguage) => void;
};

export default function Navbar({ language, onLanguageChange }: Props) {
  const [dark, setDark] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [resolvedLanguage, setResolvedLanguage] = useState<AppLanguage>(language ?? "en");

  useEffect(() => {
    if (!language) {
      return;
    }
    setResolvedLanguage(language);
    setAppLanguage(language);
  }, [language]);

  useEffect(() => {
    if (language) return;

    setResolvedLanguage(getAppLanguage());
    return onAppLanguageChange((next) => {
      setResolvedLanguage(next);
    });
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    setResolvedLanguage(nextLanguage);
    setAppLanguage(nextLanguage);
    onLanguageChange?.(nextLanguage);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/70 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/65">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex items-center rounded-2xl border border-emerald-100/70 bg-white/80 px-2.5 py-1.5 shadow-soft backdrop-blur-sm transition hover:shadow-premium dark:border-slate-700 dark:bg-slate-900/80">
          {logoError ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-3 py-1.5 text-sm font-extrabold text-white shadow-premium">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20">A+</span>
              Arogya AI
            </span>
          ) : (
            <Image src="/arogya-ai-logo.svg" alt="Arogya AI logo" width={190} height={46} priority onError={() => setLogoError(true)} className="h-9 w-auto" />
          )}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <select
            value={resolvedLanguage}
            onChange={(event) => handleLanguageChange(event.target.value as AppLanguage)}
            className="rounded-xl border border-emerald-200/80 bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <Link href="/voice" className="rounded-lg px-2.5 py-1.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300">
            {resolvedLanguage === "hi" ? "आवाज़" : "Voice"}
          </Link>
          <Link href="/dashboard" className="rounded-lg px-2.5 py-1.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300">
            {resolvedLanguage === "hi" ? "डैशबोर्ड" : "Dashboard"}
          </Link>
          <Link href="/hospitals" className="rounded-lg px-2.5 py-1.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300">
            {resolvedLanguage === "hi" ? "अस्पताल" : "Hospitals"}
          </Link>
          <Link href="/eligibility-checker" className="rounded-lg px-2.5 py-1.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300">
            {resolvedLanguage === "hi" ? "पात्रता चेकर" : "Eligibility Checker"}
          </Link>
          <button
            type="button"
            onClick={() => setDark((prev) => !prev)}
            className="rounded-xl border border-emerald-300/80 bg-white px-3.5 py-1.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
          >
            {dark ? (resolvedLanguage === "hi" ? "लाइट" : "Light") : (resolvedLanguage === "hi" ? "डार्क" : "Dark")}
          </button>
        </nav>
      </div>
    </header>
  );
}
