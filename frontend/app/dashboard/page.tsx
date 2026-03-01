"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SentimentMeter from "@/components/SentimentMeter";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const periodOffset = period === "today" ? 0 : period === "week" ? 18 : 40;
    const variability = refreshTick % 7;
    return {
      todayCalls: 128 + periodOffset + variability,
      highRiskCases: 14 + Math.floor((periodOffset + variability) / 6),
      schemeApprovals: Math.min(92, 72 + Math.floor((periodOffset + variability) / 5)),
    };
  }, [period, refreshTick]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshTick((p) => p + 1);
      setRefreshing(false);
    }, 600);
  };

  const metricCards = [
    {
      label: "Today's Calls",
      value: stats.todayCalls,
      suffix: "",
      icon: "📞",
      gradient: "metric-sky",
      border: "rgba(56,189,248,0.25)",
      valueColor: "#38bdf8",
      glow: "rgba(56,189,248,0.15)",
    },
    {
      label: "High Risk Cases",
      value: stats.highRiskCases,
      suffix: "",
      icon: "⚠️",
      gradient: "metric-rose",
      border: "rgba(244,63,94,0.25)",
      valueColor: "#f43f5e",
      glow: "rgba(244,63,94,0.12)",
    },
    {
      label: "Scheme Approvals",
      value: stats.schemeApprovals,
      suffix: "%",
      icon: "✅",
      gradient: "metric-mint",
      border: "rgba(0,229,160,0.25)",
      valueColor: "#00e5a0",
      glow: "rgba(0,229,160,0.12)",
    },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[256px_1fr]">
        <Sidebar />
        <div className="space-y-5 animate-slide-up">
          {/* Controls Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
          >
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "rgba(0,229,160,0.7)" }}
              >
                Dashboard Controls
              </p>
              <p className="mt-0.5 text-sm text-slate-400">Select period and refresh key metrics.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as "today" | "week" | "month")}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="rounded-xl px-5 py-2 text-sm font-semibold transition-all disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#00e5a0,#38bdf8)",
                  color: "#020817",
                  boxShadow: "0 0 20px rgba(0,229,160,0.35)",
                }}
              >
                {refreshing ? "Refreshing…" : "⟳ Refresh"}
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-5"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${card.border}`,
                  backdropFilter: "blur(20px)",
                  boxShadow: `0 0 24px ${card.glow}, 0 8px 32px rgba(0,0,0,0.35)`,
                }}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <p
                  className="mt-3 text-4xl font-extrabold tabular-nums animate-number-pop"
                  style={{ color: card.valueColor, textShadow: `0 0 20px ${card.valueColor}55` }}
                >
                  {card.value}{card.suffix}
                </p>
                <div className="mt-3 h-0.5 rounded-full" style={{ background: card.border }} />
              </div>
            ))}
          </div>

          {/* Sentiment */}
          <SentimentMeter score={76} />
        </div>
      </section>
    </main>
  );
}
