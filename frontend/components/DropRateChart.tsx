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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold text-slate-500">Operational Rates</h3>
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
