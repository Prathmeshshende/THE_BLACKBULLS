import type { WhatsAppLog } from "@/lib/api";

type Props = {
  logs: WhatsAppLog[];
};

export default function WhatsAppLogPanel({ logs }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Delivery Logs</h3>
      <div className="space-y-2">
        {logs.length ? (
          logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-sm font-medium">{log.phone_number}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Status: {log.delivery_status}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No WhatsApp history yet.</p>
        )}
      </div>
    </div>
  );
}
