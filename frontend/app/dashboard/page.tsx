"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SentimentMeter from "@/components/SentimentMeter";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [refreshTick, setRefreshTick] = useState(0);

  const stats = useMemo(() => {
    const periodOffset = period === "today" ? 0 : period === "week" ? 18 : 40;
    const variability = refreshTick % 7;

    const todayCalls = 128 + periodOffset + variability;
    const highRiskCases = 14 + Math.floor((periodOffset + variability) / 6);
    const schemeApprovals = Math.min(92, 72 + Math.floor((periodOffset + variability) / 5));

    return {
      todayCalls,
      highRiskCases,
      schemeApprovals,
    };
  }, [period, refreshTick]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dashboard Controls</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select period and refresh key metrics.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as "today" | "week" | "month")}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                type="button"
                onClick={() => setRefreshTick((previous) => previous + 1)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                Refresh Metrics
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Today Calls</p>
              <p className="mt-2 text-3xl font-bold">{stats.todayCalls}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">High Risk Cases</p>
              <p className="mt-2 text-3xl font-bold text-rose-600">{stats.highRiskCases}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Scheme Approvals</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.schemeApprovals}%</p>
            </div>
          </div>
          <SentimentMeter score={76} />
        </div>
      </section>
    </main>
  );
}
