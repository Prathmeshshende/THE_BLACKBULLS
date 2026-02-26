"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAppLanguage, onAppLanguageChange, setAppLanguage, type AppLanguage } from "@/lib/language";

type Props = {
  language?: AppLanguage;
};

export default function Navbar({ language }: Props) {
  const [dark, setDark] = useState(false);
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

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          HealthVoice AI
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/voice" className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            {resolvedLanguage === "hi" ? "आवाज़" : "Voice"}
          </Link>
          <Link href="/dashboard" className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            {resolvedLanguage === "hi" ? "डैशबोर्ड" : "Dashboard"}
          </Link>
          <Link href="/hospitals" className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            {resolvedLanguage === "hi" ? "अस्पताल" : "Hospitals"}
          </Link>
          <Link href="/eligibility-checker" className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
            {resolvedLanguage === "hi" ? "पात्रता चेकर" : "Eligibility Checker"}
          </Link>
          <button
            type="button"
            onClick={() => setDark((prev) => !prev)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
          >
            {dark ? (resolvedLanguage === "hi" ? "लाइट" : "Light") : (resolvedLanguage === "hi" ? "डार्क" : "Dark")}
          </button>
        </nav>
      </div>
    </header>
  );
}
