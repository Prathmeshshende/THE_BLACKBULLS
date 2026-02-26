"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HospitalCard from "@/components/HospitalCard";
import Navbar from "@/components/Navbar";
import { getHospitals, type HospitalItem } from "@/lib/api";
import { getAppLanguage, onAppLanguageChange, type AppLanguage } from "@/lib/language";

function HospitalsPageContent() {
  const searchParams = useSearchParams();
  const initialCity = useMemo(() => searchParams.get("city") || "Bengaluru", [searchParams]);
  const [language, setLanguage] = useState<AppLanguage>("en");

  const [city, setCity] = useState(initialCity);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLanguage(getAppLanguage());
    return onAppLanguageChange((next) => setLanguage(next));
  }, []);

  const handleFindHospitals = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getHospitals(city.trim() || "Bengaluru");
      setHospitals(result.hospitals);
    } catch {
      setError(
        language === "hi"
          ? "अभी अस्पताल सुझाव प्राप्त नहीं हो सके। कृपया फिर से कोशिश करें।"
          : "Unable to fetch hospital suggestions right now. Please try again.",
      );
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar language={language} onLanguageChange={(nextLanguage) => setLanguage(nextLanguage)} />
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-5 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            {language === "hi" ? "अस्पताल सुझाव" : "Hospital Suggestion"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {language === "hi"
              ? "इस सहायक द्वारा समर्थित शहर-वार नज़दीकी अस्पताल खोजें।"
              : "Search city-wise nearby hospitals supported by this assistant."}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2.5 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              placeholder={language === "hi" ? "शहर" : "City"}
            />
            <button
              type="button"
              onClick={handleFindHospitals}
              disabled={loading}
              className="rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-premium transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-slate-900"
            >
              {loading ? (language === "hi" ? "खोज रहे हैं..." : "Searching...") : language === "hi" ? "नज़दीकी अस्पताल खोजें" : "Find Nearby Hospitals"}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((item) => (
            <HospitalCard key={`${item.hospital_name}-${item.contact_number}`} item={item} language={language} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <HospitalsPageContent />
    </Suspense>
  );
}
