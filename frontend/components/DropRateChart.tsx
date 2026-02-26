"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  dropRate: number;
  escalationRate: number;
  conversionRate: number;
};

export default function DropRateChart({ dropRate, escalationRate, conversionRate }: Props) {
  const data = [
    { metric: "Drop", value: dropRate },
    { metric: "Escalation", value: escalationRate },
    { metric: "Conversion", value: conversionRate },
  ];

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Operational Rates</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
