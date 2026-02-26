"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

function DashboardLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Incorrect password. Please try again.");
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Unable to verify password right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-premium backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
          <h1 className="bg-gradient-to-r from-brand-700 via-violet-700 to-cyan-700 bg-clip-text text-xl font-semibold text-transparent dark:from-brand-300 dark:via-violet-300 dark:to-cyan-300">Dashboard Access</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter the dashboard password to continue.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-xl border border-brand-200/80 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-premium transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-slate-900"
            >
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </button>
          </form>

          {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <DashboardLoginPageContent />
    </Suspense>
  );
}
