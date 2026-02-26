import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SentimentMeter from "@/components/SentimentMeter";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Today Calls</p>
              <p className="mt-2 text-3xl font-bold">128</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">High Risk Cases</p>
              <p className="mt-2 text-3xl font-bold text-rose-600">14</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Scheme Approvals</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">72%</p>
            </div>
          </div>
          <SentimentMeter score={76} />
        </div>
      </section>
    </main>
  );
}
