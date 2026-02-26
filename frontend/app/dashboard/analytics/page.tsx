"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import DropRateChart from "@/components/DropRateChart";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { analyticsDashboard, type AnalyticsDashboard } from "@/lib/api";

const pieColors = ["#16a34a", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [token, setToken] = useState("");
  const [metrics, setMetrics] = useState<AnalyticsDashboard | null>(null);
  const [error, setError] = useState("");

  const riskData = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.risk_distribution).map(([name, value]) => ({ name, value }));
  }, [metrics]);

  const loadDashboard = async () => {
    if (!token) return;
    setError("");
    try {
      const data = await analyticsDashboard(token);
      setMetrics(data);
    } catch {
      setError("Analytics endpoint requires admin role or valid token.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            <button
              type="button"
              onClick={() => {
                void loadDashboard();
              }}
              className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-premium transition hover:opacity-95"
            >
              Load Analytics Dashboard
            </button>
            {error ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <h3 className="mb-3 text-sm font-semibold text-slate-500">Calls Per Day</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics?.calls_per_day ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="count" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <h3 className="mb-3 text-sm font-semibold text-slate-500">Risk Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={80}>
                      {riskData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <DropRateChart
            dropRate={metrics?.drop_rate ?? 0}
            escalationRate={metrics?.escalation_rate ?? 0}
            conversionRate={metrics?.conversion_rate ?? 0}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <p className="text-sm text-slate-500">Eligibility Approval Rate</p>
              <p className="mt-2 text-2xl font-bold">{metrics?.eligibility_approval_rate ?? 0}%</p>
            </div>
            <div className="rounded-2xl border border-rose-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <p className="text-sm text-slate-500">Fraud Cases</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">{metrics?.fraud_cases ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <p className="text-sm text-slate-500">Conversion Rate</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{metrics?.conversion_rate ?? 0}%</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
