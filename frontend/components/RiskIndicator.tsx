type Risk = "LOW" | "MEDIUM" | "HIGH" | string;

type Props = {
  risk: Risk;
  emergency?: boolean;
  language?: "en" | "hi";
};

const RISK_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string; icon: string; label: string }> = {
  HIGH: { color: "#f43f5e", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.30)", glow: "0 0 20px rgba(244,63,94,0.4)", icon: "🔴", label: "HIGH RISK" },
  MEDIUM: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.30)", glow: "0 0 20px rgba(251,191,36,0.35)", icon: "🟡", label: "MEDIUM RISK" },
  LOW: { color: "#00e5a0", bg: "rgba(0,229,160,0.10)", border: "rgba(0,229,160,0.28)", glow: "0 0 20px rgba(0,229,160,0.3)", icon: "🟢", label: "LOW RISK" },
};

export default function RiskIndicator({ risk, emergency }: Props) {
  const upper = (risk ?? "").toUpperCase();
  const cfg = RISK_CONFIG[upper] ?? RISK_CONFIG.LOW;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-5 py-4"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        backdropFilter: "blur(20px)",
      }}
    >
      <span className="text-2xl leading-none">{cfg.icon}</span>
      <div className="flex-1">
        <p
          className="text-xs font-black uppercase tracking-[0.16em]"
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </p>
        {emergency && (
          <p className="mt-0.5 text-xs font-semibold" style={{ color: "#f43f5e" }}>
            ⚠️ Emergency — seek immediate care
          </p>
        )}
      </div>
      {/* Pulsing dot */}
      <div
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{
          background: cfg.color,
          boxShadow: cfg.glow,
          animation: upper === "HIGH"
            ? "pulse-glow-rose 1.8s ease-in-out infinite"
            : upper === "MEDIUM"
              ? undefined
              : "pulse-glow 2.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
