import type { HospitalItem } from "@/lib/api";

type Props = {
  item: HospitalItem;
  language?: "en" | "hi";
};

export default function HospitalCard({ item, language = "en" }: Props) {
  return (
    <article className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-white">{item.hospital_name}</h4>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {language === "hi" ? "सरकारी:" : "Government:"} {item.government ? (language === "hi" ? "हाँ" : "Yes") : (language === "hi" ? "नहीं" : "No")}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {language === "hi" ? "योजना समर्थित:" : "Scheme supported:"} {item.scheme_supported ? (language === "hi" ? "हाँ" : "Yes") : (language === "hi" ? "नहीं" : "No")}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{language === "hi" ? "संपर्क:" : "Contact:"} {item.contact_number}</p>
    </article>
  );
}
