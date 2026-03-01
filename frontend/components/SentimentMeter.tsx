type Props = { score: number };

export default function SentimentMeter({ score }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (clamped / 100) * circumference;

  const color = clamped >= 70 ? "#00e5a0" : clamped >= 45 ? "#fbbf24" : "#f43f5e";
  const label = clamped >= 70 ? "Positive" : clamped >= 45 ? "Neutral" : "Negative";
  const glow = clamped >= 70
    ? "0 0 24px rgba(0,229,160,0.35)"
    : clamped >= 45
      ? "0 0 24px rgba(251,191,36,0.35)"
      : "0 0 24px rgba(244,63,94,0.35)";

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      <p
        className="mb-5 text-xs font-bold uppercase tracking-[0.18em]"
        style={{ color: "rgba(0,229,160,0.7)" }}
      >
        Caller Sentiment
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
        {/* SVG Arc Gauge */}
        <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            {/* Track */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            {/* Fill */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{
                filter: `drop-shadow(0 0 6px ${color}88)`,
                transition: "stroke-dasharray 0.8s ease-in-out",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color, textShadow: glow }}>
              {clamped}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-lg font-extrabold text-white">{label} Sentiment</p>
            <p className="text-sm text-slate-400">Based on current call analysis</p>
          </div>

          {/* Bar */}
          <div className="h-2 w-48 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${clamped}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
                boxShadow: glow,
              }}
            />
          </div>

          <span
            className="w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
          >
            Score: {clamped}/100
          </span>
        </div>
      </div>
    </div>
  );
}
