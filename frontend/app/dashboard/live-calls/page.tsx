import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const liveCalls = [
  { id: "CALL-001", risk: "HIGH", sentiment: "Stressed", status: "Escalated" },
  { id: "CALL-002", risk: "MEDIUM", sentiment: "Anxious", status: "Doctor Follow-up" },
  { id: "CALL-003", risk: "LOW", sentiment: "Calm", status: "Monitoring" },
];

export default function LiveCallsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="rounded-2xl border border-violet-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
          <h2 className="mb-4 text-lg font-semibold">Live Calls</h2>
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-700">
                  <th className="px-2 py-2">Caller ID</th>
                  <th className="px-2 py-2">Risk</th>
                  <th className="px-2 py-2">Sentiment</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {liveCalls.map((call) => (
                  <tr key={call.id} className="border-b border-slate-100/80 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-2 py-2">{call.id}</td>
                    <td className="px-2 py-2">{call.risk}</td>
                    <td className="px-2 py-2">{call.sentiment}</td>
                    <td className="px-2 py-2">{call.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
