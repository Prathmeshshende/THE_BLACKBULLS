"use client";

import { useEffect, useState } from "react";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import LiveCallTable from "@/components/LiveCallTable";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { callcenterActive, callcenterEscalate, type ActiveCall } from "@/lib/api";

export default function CallcenterPage() {
  const [token, setToken] = useState("");
  const [calls, setCalls] = useState<ActiveCall[]>([]);

  const loadCalls = async () => {
    if (!token) return;
    const rows = await callcenterActive(token);
    setCalls(rows);
  };

  useEffect(() => {
    if (!token) return;
    void loadCalls();
    const id = window.setInterval(() => {
      void loadCalls();
    }, 6000);
    return () => window.clearInterval(id);
  }, [token]);

  const handleEscalate = async (callerId: string) => {
    if (!token) return;
    await callcenterEscalate(
      {
        caller_id: callerId,
        risk_level: "HIGH",
        sentiment_score: -0.35,
        call_duration: 180,
      },
      token,
    );
    await loadCalls();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Call Center Replacement Layer</h2>
              <button type="button" onClick={() => void loadCalls()} className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-premium transition hover:opacity-95">
                Refresh Active Calls
              </button>
            </div>
          </div>
          <LiveCallTable calls={calls} onEscalate={handleEscalate} />
        </div>
      </section>
    </main>
  );
}
