type Props = {
  score: number;
};

export default function SentimentMeter({ score }: Props) {
  const normalized = Math.max(0, Math.min(100, score));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-500">Caller Sentiment</h3>
      <div className="mt-3 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${normalized}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{normalized}% calmness score</p>
    </div>
  );
}
