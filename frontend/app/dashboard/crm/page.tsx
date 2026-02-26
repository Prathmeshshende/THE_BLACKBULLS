"use client";

import { useState } from "react";
import CRMTable from "@/components/CRMTable";
import DashboardTokenPanel from "@/components/DashboardTokenPanel";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { crmGetAllUsers, crmGetUserRecords, crmMarkFollowUp, crmStoreInteraction, type CRMRecord, type CRMUser } from "@/lib/api";

export default function CrmPage() {
  const [token, setToken] = useState("");
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [history, setHistory] = useState<CRMRecord[]>([]);
  const [openHistory, setOpenHistory] = useState(false);

  const refreshUsers = async () => {
    if (!token) return;
    const allUsers = await crmGetAllUsers(token);
    setUsers(allUsers);
  };

  const createSampleInteraction = async () => {
    if (!token) return;
    await crmStoreInteraction(
      {
        risk_level: "MEDIUM",
        sentiment_score: 0.2,
        eligibility_status: "pending-review",
        follow_up_status: "pending",
      },
      token,
    );
    await refreshUsers();
  };

  const handleViewHistory = async (userId: number) => {
    if (!token) return;
    const rows = await crmGetUserRecords(userId, token);
    setHistory(rows);
    setRecords((prev) => [...rows, ...prev.filter((item) => item.user_id !== userId)]);
    setOpenHistory(true);
  };

  const handleMarkFollowUp = async (recordId: number) => {
    if (!token) return;
    await crmMarkFollowUp(recordId, token);
    await refreshUsers();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <DashboardTokenPanel token={token} onToken={setToken} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void refreshUsers();
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Load CRM Users
            </button>
            <button
              type="button"
              onClick={() => {
                void createSampleInteraction();
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Store Sample Interaction
            </button>
          </div>

          <CRMTable users={users} records={records} onViewHistory={handleViewHistory} onMarkFollowUp={handleMarkFollowUp} />

          {openHistory ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Interaction History</h3>
                <button
                  type="button"
                  onClick={() => setOpenHistory(false)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {history.map((row) => (
                  <div key={row.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                    <p className="font-medium">Risk: {row.risk_level}</p>
                    <p>Sentiment: {row.sentiment_score}</p>
                    <p>Eligibility: {row.eligibility_status}</p>
                    <p>Follow-up: {row.follow_up_status}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
