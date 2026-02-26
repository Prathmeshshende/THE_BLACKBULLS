import type { ERPStatusPayload } from "@/lib/api";

type Props = {
  data: ERPStatusPayload | null;
};

export default function ERPStatusCard({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <p className="text-sm text-slate-500 dark:text-slate-400">No ERP status available yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">ERP Status</h3>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">API Health: {data.api_health}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">Last Sync: {data.last_sync ? new Date(data.last_sync).toLocaleString() : "N/A"}</p>
      <div className="mt-3 space-y-2">
        {data.hospital_availability.map((item) => (
          <div key={`${item.hospital_name}-${item.synced_at}`} className="rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-sm font-medium">{item.hospital_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scheme: {item.scheme_mapping}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Slots: {item.slots_available}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
