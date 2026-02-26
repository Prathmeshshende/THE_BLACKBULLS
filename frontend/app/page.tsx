import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Healthcare + Government Scheme Assistant
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Right care and right financial support at the right time.
            </h1>
            <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
              Voice-first triage guidance, emergency escalation, scheme eligibility, and hospital suggestions in one workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/voice"
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-emerald-700"
              >
                Start Voice Assessment
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">What this MVP does</h2>
            <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
              <li>• Voice symptom capture with live transcript.</li>
              <li>• Low / Medium / High risk triage with emergency flags.</li>
              <li>• Rule-based Ayushman Bharat / PM-JAY eligibility checks.</li>
              <li>• Mock government hospital recommendations.</li>
              <li>• JWT-based secured triage and eligibility APIs.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
