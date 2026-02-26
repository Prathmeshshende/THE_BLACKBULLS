type Props = {
  risk: string;
  emergency: boolean;
};

export default function RiskIndicator({ risk, emergency }: Props) {
  const palette = risk === "HIGH"
    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    : risk === "MEDIUM"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-500">Risk Indicator</h3>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${palette}`}>
        {risk}
      </div>
      {emergency ? (
        <p className="mt-3 rounded-lg bg-rose-100 p-2 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          Emergency alert: escalate immediately.
        </p>
      ) : null}
    </div>
  );
}
