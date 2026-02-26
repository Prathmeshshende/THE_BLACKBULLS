"use client";

import { useState } from "react";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import Navbar from "@/components/Navbar";
import SalesMetricCard from "@/components/SalesMetricCard";
import Sidebar from "@/components/Sidebar";
import { salesConvert, salesMetrics, type SalesMetrics } from "@/lib/api";

export default function SalesPage() {
  const [token, setToken] = useState("");
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);

  const loadMetrics = async () => {
    if (!token) return;
    const data = await salesMetrics(token);
    setMetrics(data);
  };

  const addConversion = async () => {
    if (!token) return;
    const data = await salesConvert(
      {
        inquiry_source: "voice",
        converted: true,
        eligibility_approved: true,
        follow_up_pending: false,
      },
      token,
    );
    setMetrics(data);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="rounded-2xl border border-indigo-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void loadMetrics()} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-premium transition hover:opacity-95">
              Load Sales Metrics
              </button>
              <button type="button" onClick={() => void addConversion()} className="rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-premium transition hover:opacity-95">
              Add Converted Lead
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SalesMetricCard title="Total Inquiries" value={metrics?.total_inquiries ?? 0} />
            <SalesMetricCard title="Converted Cases" value={metrics?.converted_cases ?? 0} />
            <SalesMetricCard title="Eligibility Approvals" value={metrics?.eligibility_approvals ?? 0} />
            <SalesMetricCard title="Follow-up Pending" value={metrics?.follow_up_pending ?? 0} />
            <SalesMetricCard title="Conversion Rate" value={`${metrics?.conversion_rate ?? 0}%`} />
          </div>

          <div className="rounded-2xl border border-indigo-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            <h3 className="text-base font-semibold">Funnel (Simple)</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">Inquiries: {metrics?.total_inquiries ?? 0}</div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-100 px-3 py-2 dark:border-cyan-800 dark:bg-cyan-900/30">Approved: {metrics?.eligibility_approvals ?? 0}</div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/30">Converted: {metrics?.converted_cases ?? 0}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
