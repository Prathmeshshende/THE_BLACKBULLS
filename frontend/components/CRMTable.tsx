import type { CRMRecord, CRMUser } from "@/lib/api";

type Props = {
  users: CRMUser[];
  records: CRMRecord[];
  onViewHistory: (userId: number) => void;
  onMarkFollowUp: (recordId: number) => void;
};

export default function CRMTable({ users, records, onViewHistory, onMarkFollowUp }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">CRM Users</h3>
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/90 dark:border-slate-700">
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Phone</th>
              <th className="px-2 py-2">Follow-up</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const latestRecord = records.find((item) => item.user_id === user.id);
              return (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2 font-medium">{user.full_name}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">{user.phone ?? "-"}</td>
                  <td className="px-2 py-2">{latestRecord?.follow_up_status ?? user.latest_follow_up_status}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onViewHistory(user.id)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        History
                      </button>
                      {latestRecord ? (
                        <button
                          type="button"
                          onClick={() => onMarkFollowUp(latestRecord.id)}
                          className="rounded-lg bg-brand-gradient px-2.5 py-1 text-xs font-semibold text-white shadow-soft transition hover:opacity-95"
                        >
                          Mark Follow-up
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
