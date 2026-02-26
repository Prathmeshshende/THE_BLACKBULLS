import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const flagged = [
  { id: "INT-109", reason: "Repeated contradictory eligibility claims", risk: 84 },
  { id: "INT-204", reason: "Unusual call pattern from same number", risk: 71 },
];

export default function FraudPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">Flagged Interactions</h2>
          <div className="space-y-3">
            {flagged.map((row) => (
              <div key={row.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="font-medium">{row.id}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{row.reason}</p>
                <span className="mt-2 inline-block rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Risk {row.risk}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
