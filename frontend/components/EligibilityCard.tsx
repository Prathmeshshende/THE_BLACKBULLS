import type { EligibilityResponse } from "@/lib/api";

type Props = {
  data: EligibilityResponse | null;
};

export default function EligibilityCard({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Fill eligibility form to view result.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold">Eligibility Result: {data.eligible ? "Eligible" : "Not Eligible"}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Coverage: {data.benefits.coverage}</p>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600 dark:text-slate-300">
        {data.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}
