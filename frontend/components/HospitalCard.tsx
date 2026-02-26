import type { HospitalItem } from "@/lib/api";

type Props = {
  item: HospitalItem;
};

export default function HospitalCard({ item }: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h4 className="font-semibold text-slate-900 dark:text-white">{item.hospital_name}</h4>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Government: {item.government ? "Yes" : "No"}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">Scheme supported: {item.scheme_supported ? "Yes" : "No"}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">Contact: {item.contact_number}</p>
    </article>
  );
}
