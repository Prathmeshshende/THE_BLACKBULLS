"use client";

import { useState } from "react";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import ERPStatusCard from "@/components/ERPStatusCard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { erpStatus, erpSyncHospital, type ERPStatusPayload } from "@/lib/api";

export default function ErpPage() {
  const [token, setToken] = useState("");
  const [hospitalName, setHospitalName] = useState("City General Hospital");
  const [scheme, setScheme] = useState("PM-JAY");
  const [slots, setSlots] = useState(12);
  const [status, setStatus] = useState<ERPStatusPayload | null>(null);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    if (!token) return;
    setError("");
    try {
      const data = await erpStatus(token);
      setStatus(data);
    } catch {
      setError("ERP endpoints require admin access.");
    }
  };

  const syncHospital = async () => {
    if (!token) return;
    setError("");
    try {
      await erpSyncHospital(
        {
          hospital_name: hospitalName,
          scheme_mapping: scheme,
          slots_available: slots,
          api_health_status: "healthy",
        },
        token,
      );
      await loadStatus();
    } catch {
      setError("ERP sync failed. Ensure admin user token.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">ERP Integration</h2>
            <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_0.8fr_auto_auto]">
              <input
                value={hospitalName}
                onChange={(event) => setHospitalName(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Hospital"
              />
              <input
                value={scheme}
                onChange={(event) => setScheme(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Scheme"
              />
              <input
                type="number"
                value={slots}
                onChange={(event) => setSlots(Number(event.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Slots"
              />
              <button type="button" onClick={() => void syncHospital()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Sync Hospital
              </button>
              <button type="button" onClick={() => void loadStatus()} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Load Status
              </button>
            </div>
            {error ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
          </div>
          <ERPStatusCard data={status} />
        </div>
      </section>
    </main>
  );
}
