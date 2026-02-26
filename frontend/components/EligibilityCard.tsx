import type { EligibilityResponse } from "@/lib/api";

type Props = {
  data: EligibilityResponse | null;
  language?: "en" | "hi";
};

export default function EligibilityCard({ data, language = "en" }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">{language === "hi" ? "परिणाम देखने के लिए पात्रता फॉर्म भरें।" : "Fill eligibility form to view result."}</p>
      </div>
    );
  }

  const eligibleSchemes = data.scheme_decisions.filter((decision) => decision.eligible);
  const notEligibleSchemes = data.scheme_decisions.filter((decision) => !decision.eligible);

  const fallbackSchemeLinks: Record<string, string> = {
    "Ayushman Bharat / PM-JAY": "https://beneficiary.nha.gov.in/",
    "Ayushman Bharat - PM-JAY": "https://beneficiary.nha.gov.in/",
    "Senior Citizen Health Support": "https://nhm.gov.in/",
    "Chronic Care Assistance Program": "https://nhm.gov.in/",
    "Maternal Health Benefit Scheme": "https://pmmvy.wcd.gov.in/",
    "Disability Health Protection Scheme": "https://www.swavlambancard.gov.in/",
    "Rural Family Health Relief Scheme": "https://nhm.gov.in/",
    "ABHA Health ID (Ayushman Bharat Digital Mission)": "https://abha.abdm.gov.in/abha/v3/",
    "Pradhan Mantri Matru Vandana Yojana (PMMVY)": "https://pmmvy.wcd.gov.in/",
    "Janani Suraksha Yojana (JSY)": "https://nhm.gov.in/",
    "Janani Shishu Suraksha Karyakram (JSSK)": "https://nhm.gov.in/",
    "Rashtriya Bal Swasthya Karyakram (RBSK)": "https://nhm.gov.in/",
    "Rashtriya Kishor Swasthya Karyakram (RKSK)": "https://nhm.gov.in/",
    "National Programme for Health Care of Elderly (NPHCE)": "https://nhm.gov.in/",
    "National TB Elimination Programme (NTEP)": "https://tbcindia.gov.in/",
    "National AIDS Control Programme (NACP) - free HIV services": "https://naco.gov.in/",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold">
        {language === "hi" ? "पात्रता परिणाम:" : "Eligibility Result:"} {data.eligible ? (language === "hi" ? "पात्र" : "Eligible") : (language === "hi" ? "अपात्र" : "Not Eligible")}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{data.assessment_summary}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{language === "hi" ? "मूल्यांकन स्कोर:" : "Assessment score:"} {data.score}/100</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{language === "hi" ? "कवरेज:" : "Coverage:"} {data.benefits.coverage}</p>

      {data.scheme_decisions.length ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{language === "hi" ? "योजना-वार पात्रता" : "Scheme-wise Eligibility"}</p>

          <div className="mt-2">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{language === "hi" ? "पात्र योजनाएं" : "Eligible Schemes"}</p>
            {eligibleSchemes.length ? (
              <ul className="mt-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {eligibleSchemes.map((decision) => (
                  <li key={decision.scheme_name} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <p className="font-medium">{decision.scheme_name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{decision.reason}</p>
                    {(decision.application_link ?? fallbackSchemeLinks[decision.scheme_name]) ? (
                      <a
                        href={decision.application_link ?? fallbackSchemeLinks[decision.scheme_name]}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-300 dark:hover:bg-emerald-900/20 dark:focus-visible:ring-offset-slate-900"
                      >
                        {language === "hi" ? "आवेदन लिंक" : "Application Link"}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{language === "hi" ? "अभी कोई योजना पात्र नहीं है।" : "No scheme currently matched as eligible."}</p>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{language === "hi" ? "अपात्र योजनाएं" : "Not Eligible Schemes"}</p>
            {notEligibleSchemes.length ? (
              <ul className="mt-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {notEligibleSchemes.map((decision) => (
                  <li key={decision.scheme_name} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-800 dark:bg-rose-900/20">
                    <p className="font-medium">{decision.scheme_name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{decision.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{language === "hi" ? "सभी ट्रैक की गई योजनाएं पात्र हैं।" : "All tracked schemes are currently eligible."}</p>
            )}
          </div>
        </div>
      ) : null}

      {data.matched_rules.length ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{language === "hi" ? "मिलान किए गए नियम" : "Matched Rules"}</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
            {data.matched_rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
        {data.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>

      {data.required_documents.length ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{language === "hi" ? "आवश्यक दस्तावेज़" : "Required Documents"}</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
            {data.required_documents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.next_steps.length ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{language === "hi" ? "अगले कदम" : "Next Steps"}</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
            {data.next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
