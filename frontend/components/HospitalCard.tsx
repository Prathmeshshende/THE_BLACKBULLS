import type { HospitalItem } from "@/lib/api";

type Props = {
  item: HospitalItem;
  language?: "en" | "hi";
};

export default function HospitalCard({ item, language = "en" }: Props) {
  const isGov = item.government;
  const schemeSupported = item.scheme_supported;

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(56,189,248,0.20)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 16px rgba(56,189,248,0.08), 0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}
        >
          🏥
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold leading-tight text-white">{item.hospital_name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {isGov && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}
              >
                {language === "hi" ? "सरकारी" : "Government"}
              </span>
            )}
            {schemeSupported && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "rgba(0,229,160,0.10)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.25)" }}
              >
                {language === "hi" ? "योजना समर्थित" : "Scheme Supported"}
              </span>
            )}
          </div>
        </div>
      </div>

      {item.contact_number && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <span className="text-xs">📞</span>
          <a
            href={`tel:${item.contact_number}`}
            className="font-medium transition-colors hover:text-sky-300"
            style={{ color: "#38bdf8" }}
          >
            {item.contact_number}
          </a>
        </div>
      )}
    </div>
  );
}
