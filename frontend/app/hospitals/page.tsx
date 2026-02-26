"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HospitalCard from "@/components/HospitalCard";
import Navbar from "@/components/Navbar";
import { getHospitals, type HospitalItem } from "@/lib/api";

export default function HospitalsPage() {
  const searchParams = useSearchParams();
  const initialCity = useMemo(() => searchParams.get("city") || "Bengaluru", [searchParams]);

  const [city, setCity] = useState(initialCity);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFindHospitals = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getHospitals(city.trim() || "Bengaluru");
      setHospitals(result.hospitals);
    } catch {
      setError("Unable to fetch hospital suggestions right now. Please try again.");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Hospital Suggestion</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Search city-wise nearby hospitals supported by this assistant.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              placeholder="City"
            />
            <button
              type="button"
              onClick={handleFindHospitals}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-slate-900"
            >
              {loading ? "Searching..." : "Find Nearby Hospitals"}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((item) => (
            <HospitalCard key={`${item.hospital_name}-${item.contact_number}`} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
