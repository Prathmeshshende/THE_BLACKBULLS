type Props = {
  title: string;
  value: string | number;
};

export default function SalesMetricCard({ title, value }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
