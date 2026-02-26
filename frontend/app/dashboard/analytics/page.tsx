import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AnalyticsChart from "@/components/AnalyticsChart";

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <AnalyticsChart />
      </section>
    </main>
  );
}
