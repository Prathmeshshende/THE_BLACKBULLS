"use client";

import { useState } from "react";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import FraudAlertCard from "@/components/FraudAlertCard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { fraudCheck, fraudFlagged, type FraudRecord } from "@/lib/api";

export default function FraudPage() {
  const [token, setToken] = useState("");
  const [income, setIncome] = useState(650000);
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState<FraudRecord[]>([]);

  const loadFlagged = async () => {
    if (!token) return;
    const data = await fraudFlagged(token);
    setRows(data);
  };

  const runCheck = async () => {
    if (!token) return;
    await fraudCheck({ current_income: income, phone: phone || undefined }, token);
    await loadFlagged();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Fraud Detection</h2>
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
              <input
                type="number"
                value={income}
                onChange={(event) => setIncome(Number(event.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Current income"
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Phone (optional)"
              />
              <button type="button" onClick={() => void runCheck()} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                Run Check
              </button>
              <button type="button" onClick={() => void loadFlagged()} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Load Flagged
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {rows.map((item) => (
              <FraudAlertCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
