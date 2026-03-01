"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EligibilityCard from "@/components/EligibilityCard";
import Navbar from "@/components/Navbar";
import { runEligibility, type EligibilityResponse } from "@/lib/api";
import { ensureBackendToken, isGoogleLoggedIn } from "@/lib/client-auth";
import { getAppLanguage, setAppLanguage } from "@/lib/language";

type VoiceLanguage = "en" | "hi";

const inputClass =
  "glass-input";

export default function EligibilityCheckerPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>(() => getAppLanguage());

  useEffect(() => {
    if (!isGoogleLoggedIn()) { router.replace("/"); return; }
    if (!token) {
      void ensureBackendToken()
        .then((t) => { setToken(t); setSubmitError(""); })
        .catch(() => { setSubmitError("Session setup failed. Please login again."); router.replace("/"); });
    }
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  }, [router, token]);

  useEffect(() => { setAppLanguage(voiceLanguage); }, [voiceLanguage]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) { setSubmitError("Please login first."); return; }
    setLoading(true); setSubmitError("");
    try {
      const form = new FormData(event.currentTarget);
      const payload = {
        income: Number(form.get("income")),
        age: Number(form.get("age")),
        bpl_card: form.get("bpl_card") === "on",
        state: String(form.get("state")),
        family_size: Number(form.get("family_size") ?? 1),
        has_chronic_illness: form.get("has_chronic_illness") === "on",
        has_disability: form.get("has_disability") === "on",
        is_pregnant: form.get("is_pregnant") === "on",
        rural_resident: form.get("rural_resident") === "on",
        annual_hospital_visits: Number(form.get("annual_hospital_visits") ?? 0),
        has_government_id: form.get("has_government_id") === "on",
        occupation: String(form.get("occupation") ?? "").trim() || undefined,
      };
      const result = await runEligibility(payload, token);
      setEligibility(result); setVoiceError("");
    } catch { setSubmitError("Failed to run eligibility check."); }
    finally { setLoading(false); }
  };

  const buildVoiceText = (result: EligibilityResponse | null) => {
    if (!result) return voiceLanguage === "hi" ? "अभी पात्रता परिणाम उपलब्ध नहीं है।" : "No eligibility result yet.";
    const eligible = result.eligible;
    const schemes = result.scheme_decisions.filter((s) => s.eligible).map((s) => s.scheme_name);
    if (voiceLanguage === "hi") return `${eligible ? "आप पात्र हैं।" : "आप अभी पात्र नहीं हैं।"} ${result.assessment_summary}`;
    return `${eligible ? "You are eligible." : "You are not eligible."} ${result.assessment_summary} ${schemes.length ? `Schemes: ${schemes.join(", ")}.` : ""}`;
  };

  const playVoice = () => {
    if (!("speechSynthesis" in window)) { setVoiceError("Voice not supported."); return; }
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(buildVoiceText(eligibility));
    const voices = synth.getVoices();
    const voice = voiceLanguage === "hi"
      ? voices.find((v) => v.lang.startsWith("hi")) : voices.find((v) => v.lang.startsWith("en"));
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => { setIsSpeaking(false); setVoiceError("Voice playback failed."); };
    synth.cancel(); synth.speak(utterance);
  };

  const checkboxFields = [
    { name: "bpl_card", label: "BPL Card", defaultChecked: false },
    { name: "has_government_id", label: "Has Government ID", defaultChecked: true },
    { name: "rural_resident", label: "Rural Resident", defaultChecked: false },
    { name: "has_chronic_illness", label: "Chronic Illness", defaultChecked: false },
    { name: "has_disability", label: "Disability", defaultChecked: false },
    { name: "is_pregnant", label: "Pregnant", defaultChecked: false },
  ];

  return (
    <main className="min-h-screen">
      <Navbar language={voiceLanguage} onLanguageChange={(l) => setVoiceLanguage(l)} />
      <section className="mx-auto max-w-4xl space-y-5 px-6 py-10">
        {/* Header */}
        <div
          className="rounded-2xl p-6 animate-slide-up"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(167,139,250,0.20)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 24px rgba(167,139,250,0.10), 0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎫</span>
            <h1 className="text-xl font-extrabold text-white">Eligibility Checker</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Check your eligibility for government healthcare schemes with voice response.
          </p>
          {/* Language Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Voice Language</span>
            <div
              className="flex overflow-hidden rounded-lg text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {(["en", "hi"] as VoiceLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setVoiceLanguage(lang)}
                  className="px-3 py-1.5 transition-all"
                  style={voiceLanguage === lang
                    ? { background: "linear-gradient(135deg,#a78bfa,#38bdf8)", color: "#020817" }
                    : { color: "#94a3b8" }}
                >
                  {lang === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <h2
            className="mb-4 text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(167,139,250,0.7)" }}
          >
            Eligibility Form
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="income" type="number" required placeholder="Annual Income (₹)" className={inputClass} />
            <input name="age" type="number" required placeholder="Age" className={inputClass} />
            <input name="state" required placeholder="State (e.g. Karnataka)" className={inputClass} />
            <input name="family_size" type="number" min={1} defaultValue={1} placeholder="Family Size" className={inputClass} />
            <input name="annual_hospital_visits" type="number" min={0} defaultValue={0} placeholder="Hospital Visits/Year" className={inputClass} />
            <input name="occupation" placeholder="Occupation (optional)" className={inputClass} />
          </div>

          {/* Checkboxes */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {checkboxFields.map((f) => (
              <label
                key={f.name}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <input
                  name={f.name}
                  type="checkbox"
                  defaultChecked={f.defaultChecked}
                  className="h-4 w-4 rounded accent-violet-400"
                />
                {f.label}
              </label>
            ))}
          </div>

          {submitError && <p className="mt-3 text-sm text-rose-400">{submitError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon mt-5 w-full"
            style={{
              background: "linear-gradient(135deg,#a78bfa,#38bdf8)",
              boxShadow: "0 0 20px rgba(167,139,250,0.35)",
            }}
          >
            {loading ? "Checking eligibility…" : "🎫 Check Eligibility Now"}
          </button>
        </form>

        {/* Result */}
        <EligibilityCard data={eligibility} language={voiceLanguage} />

        {/* Voice Response */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h3 className="mb-1 text-sm font-semibold text-white">🔊 Eligibility Voice Response</h3>
          <p className="mb-3 text-xs text-slate-400">{isSpeaking ? "🔈 Speaking…" : "Voice idle"}</p>
          <div className="flex gap-3">
            <button type="button" onClick={playVoice} className="btn-neon" style={{ background: "linear-gradient(135deg,#a78bfa,#38bdf8)", boxShadow: "0 0 16px rgba(167,139,250,0.35)" }}>
              ▶ Play Voice
            </button>
            <button
              type="button"
              onClick={() => { window.speechSynthesis?.cancel(); setIsSpeaking(false); }}
              className="btn-ghost"
            >
              ⏹ Stop
            </button>
          </div>
          {voiceError && <p className="mt-2 text-sm text-rose-400">{voiceError}</p>}
        </div>
      </section>
    </main>
  );
}
