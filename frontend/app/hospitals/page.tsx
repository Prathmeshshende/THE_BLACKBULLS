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
    <main className="min-h-screen">
      <Navbar language={language} onLanguageChange={(l) => setLanguage(l)} />
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        {/* Header */}
        <div
          className="rounded-2xl p-6 animate-slide-up"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h1 className="text-xl font-extrabold text-white">
              {language === "hi" ? "अस्पताल सुझाव" : "Hospital Finder"}
            </h1>
          </div>
          <p className="mb-5 text-sm text-slate-400">
            {language === "hi"
              ? "इस सहायक द्वारा समर्थित शहर-वार नज़दीकी अस्पताल खोजें।"
              : "Find nearby hospitals city-wise supported by this assistant."}
          </p>

          <div className="flex flex-wrap gap-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleFindHospitals(); }}
              className="glass-input max-w-xs flex-1"
              placeholder={language === "hi" ? "शहर दर्ज करें…" : "Enter city…"}
            />
            <button
              type="button"
              onClick={() => void handleFindHospitals()}
              disabled={loading}
              className="btn-neon min-w-[140px]"
            >
              {loading
                ? (language === "hi" ? "खोज रहे हैं…" : "Searching…")
                : (language === "hi" ? "🔍 खोजें" : "🔍 Find Hospitals")}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-rose-400">{error}</p>
          )}
        </div>

        {/* Results */}
        {hospitals.length > 0 && (
          <div>
            <p
              className="mb-3 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "rgba(0,229,160,0.7)" }}
            >
              {hospitals.length} {language === "hi" ? "अस्पताल मिले" : "hospitals found"} in {city}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hospitals.map((item) => (
                <HospitalCard
                  key={`${item.hospital_name}-${item.contact_number}`}
                  item={item}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <HospitalsPageContent />
    </Suspense>
  );
}
