"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const users = [
  { id: 1, name: "Ravi Kumar", risk: "MEDIUM", eligibility: "Eligible" },
  { id: 2, name: "Asha Devi", risk: "HIGH", eligibility: "Eligible" },
  { id: 3, name: "Imran Ali", risk: "LOW", eligibility: "Not Eligible" },
];

export default function CrmPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = users.find((user) => user.id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold">CRM Users</h2>
            <div className="grid gap-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedId(user.id)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {user.name} • Risk: {user.risk} • {user.eligibility}
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-semibold">Profile: {selected.name}</h3>
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
                <li>Interaction history: 5 recent triage calls</li>
                <li>Risk history: {selected.risk}</li>
                <li>Eligibility history: {selected.eligibility}</li>
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
