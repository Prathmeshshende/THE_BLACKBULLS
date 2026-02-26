type Props = {
  score: number;
};

export default function SentimentMeter({ score }: Props) {
  const normalized = Math.max(0, Math.min(100, score));

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">Caller Sentiment</h3>
      <div className="mt-3 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${normalized}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{normalized}% calmness score</p>
    </div>
  );
}
