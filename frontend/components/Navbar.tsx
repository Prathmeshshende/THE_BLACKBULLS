"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

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
          <Link href="/voice" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Voice
          </Link>
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setDark((prev) => !prev)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            {dark ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}
