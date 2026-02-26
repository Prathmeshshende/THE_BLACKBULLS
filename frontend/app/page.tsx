"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureBackendToken } from "@/lib/client-auth";

export default function LandingPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    void ensureBackendToken()
      .then(() => {
        router.replace("/voice");
      })
      .catch(() => {
        setError("Unable to open app right now. Please try again.");
      });
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-20 md:py-28">
        <div className="w-full max-w-xl rounded-3xl border border-emerald-100/80 bg-white/90 p-8 shadow-premium backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Arogya AI Premium
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 dark:text-white">Opening website...</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Redirecting you to the app.
          </p>

          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
