import type { FraudRecord } from "@/lib/api";

type Props = {
  item: FraudRecord;
};

export default function FraudAlertCard({ item }: Props) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-soft dark:border-rose-900 dark:bg-rose-950/30">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Fraud Alert</p>
        <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
          {item.fraud_probability}%
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{item.reason}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
    </div>
  );
}
