type Props = {
  title: string;
  value: string | number;
};

export default function SalesMetricCard({ title, value }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
