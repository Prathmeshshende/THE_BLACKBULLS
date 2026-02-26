"use client";

import { useState } from "react";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import WhatsAppLogPanel from "@/components/WhatsAppLogPanel";
import { whatsappHistory, whatsappSendSummary, type WhatsAppLog } from "@/lib/api";

export default function WhatsAppPage() {
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("Triage is complete. Please follow the recommended next steps.");
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);

  const loadHistory = async () => {
    if (!token) return;
    const rows = await whatsappHistory(token);
    setLogs(rows);
  };

  const sendSummary = async () => {
    if (!token || !phone.trim()) return;
    await whatsappSendSummary({ phone_number: phone.trim(), message_summary: summary }, token);
    await loadHistory();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            <h2 className="mb-3 text-lg font-semibold">WhatsApp Bot Integration</h2>
            <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto_auto]">
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
                className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Message summary"
                className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <button type="button" onClick={() => void sendSummary()} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-premium transition hover:opacity-95">
                Send
              </button>
              <button type="button" onClick={() => void loadHistory()} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Refresh Logs
              </button>
            </div>
          </div>
          <WhatsAppLogPanel logs={logs} />
        </div>
      </section>
    </main>
  );
}
