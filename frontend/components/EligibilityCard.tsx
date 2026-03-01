import type { EligibilityResponse } from "@/lib/api";

type Props = { data: EligibilityResponse | null; language?: "en" | "hi" };

export default function EligibilityCard({ data, language = "en" }: Props) {
  if (!data) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(20px)",
        }}
      >
        <p className="text-sm text-slate-500">
          {language === "hi" ? "परिणाम देखने के लिए पात्रता फॉर्म भरें।" : "Fill eligibility form to view result."}
        </p>
      </div>
    );
  }

  const eligibleSchemes = data.scheme_decisions.filter((d) => d.eligible);
  const notEligibleSchemes = data.scheme_decisions.filter((d) => !d.eligible);

  const fallbackLinks: Record<string, string> = {
    "Ayushman Bharat / PM-JAY": "https://beneficiary.nha.gov.in/",
    "Ayushman Bharat - PM-JAY": "https://beneficiary.nha.gov.in/",
    "Senior Citizen Health Support": "https://nhm.gov.in/",
    "Chronic Care Assistance Program": "https://nhm.gov.in/",
    "Maternal Health Benefit Scheme": "https://pmmvy.wcd.gov.in/",
    "Disability Health Protection Scheme": "https://www.swavlambancard.gov.in/",
    "Rural Family Health Relief Scheme": "https://nhm.gov.in/",
    "ABHA Health ID (Ayushman Bharat Digital Mission)": "https://abha.abdm.gov.in/abha/v3/",
  };

  return (
    <div
      className="rounded-2xl p-5 animate-slide-up"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${data.eligible ? "rgba(0,229,160,0.25)" : "rgba(244,63,94,0.20)"}`,
        backdropFilter: "blur(20px)",
        boxShadow: `0 0 24px ${data.eligible ? "rgba(0,229,160,0.10)" : "rgba(244,63,94,0.08)"}, 0 8px 32px rgba(0,0,0,0.35)`,
      }}
    >
      {/* Result Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-white">
            {language === "hi" ? "पात्रता परिणाम" : "Eligibility Result"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{data.assessment_summary}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase"
          style={
            data.eligible
              ? { background: "rgba(0,229,160,0.15)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.35)" }
              : { background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.30)" }
          }
        >
          {data.eligible ? (language === "hi" ? "✓ पात्र" : "✓ Eligible") : (language === "hi" ? "✗ अपात्र" : "✗ Not Eligible")}
        </span>
      </div>

      {/* Score + Coverage */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.20)" }}>
          <p className="text-xs text-slate-500">{language === "hi" ? "स्कोर" : "Score"}</p>
          <p className="text-xl font-extrabold" style={{ color: "#a78bfa" }}>{data.score}/100</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.20)" }}>
          <p className="text-xs text-slate-500">{language === "hi" ? "कवरेज" : "Coverage"}</p>
          <p className="text-sm font-semibold text-neon-sky leading-tight mt-1">{data.benefits?.coverage ?? "—"}</p>
        </div>
      </div>

      {/* Eligible Schemes */}
      {eligibleSchemes.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(0,229,160,0.7)" }}>
            {language === "hi" ? "✓ पात्र योजनाएं" : "✓ Eligible Schemes"}
          </p>
          <div className="space-y-2">
            {eligibleSchemes.map((d) => (
              <div
                key={d.scheme_name}
                className="rounded-xl p-3"
                style={{ background: "rgba(0,229,160,0.07)", border: "1px solid rgba(0,229,160,0.20)" }}
              >
                <p className="font-semibold text-white text-sm">{d.scheme_name}</p>
                <p className="mt-1 text-xs text-slate-400">{d.reason}</p>
                {(d.application_link ?? fallbackLinks[d.scheme_name]) && (
                  <a
                    href={d.application_link ?? fallbackLinks[d.scheme_name]}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: "rgba(0,229,160,0.12)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.30)" }}
                  >
                    🔗 {language === "hi" ? "आवेदन करें" : "Apply"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not Eligible Schemes */}
      {notEligibleSchemes.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(244,63,94,0.7)" }}>
            {language === "hi" ? "✗ अपात्र योजनाएं" : "✗ Not Eligible Schemes"}
          </p>
          <div className="space-y-2">
            {notEligibleSchemes.map((d) => (
              <div
                key={d.scheme_name}
                className="rounded-xl p-3"
                style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)" }}
              >
                <p className="font-semibold text-slate-300 text-sm">{d.scheme_name}</p>
                <p className="mt-1 text-xs text-slate-500">{d.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {data.next_steps?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(56,189,248,0.7)" }}>
            {language === "hi" ? "अगले कदम" : "Next Steps"}
          </p>
          <ul className="space-y-1.5">
            {data.next_steps.map((step) => (
              <li key={step} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-0.5 text-neon-sky">→</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
