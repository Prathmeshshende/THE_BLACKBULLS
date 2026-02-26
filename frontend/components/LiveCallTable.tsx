import type { ActiveCall } from "@/lib/api";

type Props = {
  calls: ActiveCall[];
  onEscalate: (callerId: string) => void;
};

export default function LiveCallTable({ calls, onEscalate }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Active Calls</h3>
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-2 py-2">Caller</th>
              <th className="px-2 py-2">Risk</th>
              <th className="px-2 py-2">Sentiment</th>
              <th className="px-2 py-2">Duration</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-2 py-2">{call.caller_id}</td>
                <td className="px-2 py-2">{call.risk_level}</td>
                <td className="px-2 py-2">{call.sentiment_score.toFixed(2)}</td>
                <td className="px-2 py-2">{call.call_duration}s</td>
                <td className="px-2 py-2">{call.status}</td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => onEscalate(call.caller_id)}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-soft transition hover:opacity-95"
                  >
                    Escalate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
