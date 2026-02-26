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
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void loadMetrics()} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Load Sales Metrics
            </button>
            <button type="button" onClick={() => void addConversion()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Add Converted Lead
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SalesMetricCard title="Total Inquiries" value={metrics?.total_inquiries ?? 0} />
            <SalesMetricCard title="Converted Cases" value={metrics?.converted_cases ?? 0} />
            <SalesMetricCard title="Eligibility Approvals" value={metrics?.eligibility_approvals ?? 0} />
            <SalesMetricCard title="Follow-up Pending" value={metrics?.follow_up_pending ?? 0} />
            <SalesMetricCard title="Conversion Rate" value={`${metrics?.conversion_rate ?? 0}%`} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold">Funnel (Simple)</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">Inquiries: {metrics?.total_inquiries ?? 0}</div>
              <div className="rounded-lg bg-cyan-100 px-3 py-2 dark:bg-cyan-900/30">Approved: {metrics?.eligibility_approvals ?? 0}</div>
              <div className="rounded-lg bg-emerald-100 px-3 py-2 dark:bg-emerald-900/30">Converted: {metrics?.converted_cases ?? 0}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
