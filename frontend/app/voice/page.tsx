"use client";

import { useMemo, useState } from "react";
import EligibilityCard from "@/components/EligibilityCard";
import HospitalCard from "@/components/HospitalCard";
import Navbar from "@/components/Navbar";
import RiskIndicator from "@/components/RiskIndicator";
import VoiceRecorder from "@/components/VoiceRecorder";
import {
  getHospitals,
  login,
  runEligibility,
  runTriage,
  type EligibilityResponse,
  type HospitalItem,
  type TriageResponse,
} from "@/lib/api";

export default function VoicePage() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [token, setToken] = useState("");
  const [symptomText, setSymptomText] = useState("");
  const [triage, setTriage] = useState<TriageResponse | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [city, setCity] = useState("Bengaluru");

  const emergencyBanner = useMemo(() => {
    if (!triage?.emergency_flag) return null;
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-300">
        Emergency alert: please seek immediate care.
      </div>
    );
  }, [triage]);

  const handleLogin = async () => {
    const result = await login(email, password);
    setToken(result.access_token);
  };

  const handleTriage = async (text: string) => {
    setSymptomText(text);
    if (!token) {
      alert("Please login first to access protected triage endpoint.");
      return;
    }
    const result = await runTriage(text, token);
    setTriage(result);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.advisory_message);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const handleEligibility = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      alert("Please login first to access protected eligibility endpoint.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      income: Number(form.get("income")),
      age: Number(form.get("age")),
      bpl_card: form.get("bpl_card") === "on",
      state: String(form.get("state")),
    };

    const result = await runEligibility(payload, token);
    setEligibility(result);
  };

  const handleHospital = async () => {
    const result = await getHospitals(city);
    setHospitals(result.hospitals);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Auth (Required for Triage & Eligibility)</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Password" />
            <button type="button" onClick={handleLogin} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">Login</button>
            <p className="self-center text-sm text-slate-600 dark:text-slate-300">{token ? "Token ready" : "No token yet"}</p>
          </div>
        </div>

        <VoiceRecorder onTranscript={handleTriage} />

        <div className="grid gap-4 md:grid-cols-2">
          <RiskIndicator risk={triage?.risk_level ?? "LOW"} emergency={triage?.emergency_flag ?? false} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-500">Advisory</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{triage?.advisory_message ?? "No triage result yet."}</p>
            <p className="mt-3 text-xs text-slate-500">{triage?.disclaimer}</p>
          </div>
        </div>

        {emergencyBanner}

        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={handleEligibility} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold">Eligibility Checker</h3>
            <div className="mt-3 grid gap-3">
              <input name="income" type="number" required placeholder="Income" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
              <input name="age" type="number" required placeholder="Age" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
              <input name="state" required placeholder="State" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
              <label className="flex items-center gap-2 text-sm">
                <input name="bpl_card" type="checkbox" /> BPL Card
              </label>
              <button className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">Check Eligibility</button>
            </div>
          </form>
          <EligibilityCard data={eligibility} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">Hospital Suggestion</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              placeholder="City"
            />
            <button type="button" onClick={handleHospital} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
              Find Hospitals
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {hospitals.map((item) => (
              <HospitalCard key={`${item.hospital_name}-${item.contact_number}`} item={item} />
            ))}
          </div>
        </div>

        {symptomText ? <p className="text-xs text-slate-500">Last transcript: {symptomText}</p> : null}
      </section>
    </main>
  );
}
