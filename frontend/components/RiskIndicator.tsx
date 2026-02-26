type Props = {
  risk: string;
  emergency: boolean;
  language?: "en" | "hi";
};

export default function RiskIndicator({ risk, emergency, language = "en" }: Props) {
  const displayRisk = language === "hi"
    ? (risk.toUpperCase() === "HIGH" ? "उच्च" : risk.toUpperCase() === "MEDIUM" ? "मध्यम" : "कम")
    : risk;

  const palette = risk === "HIGH"
    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    : risk === "MEDIUM"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">{language === "hi" ? "जोखिम संकेतक" : "Risk Indicator"}</h3>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${palette}`}>
        {displayRisk}
      </div>
      {emergency ? (
        <p className="mt-3 rounded-lg bg-rose-100 p-2 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {language === "hi" ? "आपातकालीन चेतावनी: तुरंत चिकित्सा सहायता लें।" : "Emergency alert: escalate immediately."}
        </p>
      ) : null}
    </div>
  );
}
