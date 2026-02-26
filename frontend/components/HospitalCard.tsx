import type { HospitalItem } from "@/lib/api";

type Props = {
  item: HospitalItem;
  language?: "en" | "hi";
};

export default function HospitalCard({ item, language = "en" }: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h4 className="font-semibold text-slate-900 dark:text-white">{item.hospital_name}</h4>
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
