"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EligibilityCard from "@/components/EligibilityCard";
import Navbar from "@/components/Navbar";
import { runEligibility, type EligibilityResponse } from "@/lib/api";
import { ensureBackendToken, isGoogleLoggedIn } from "@/lib/client-auth";

type VoiceLanguage = "en" | "hi";

export default function EligibilityCheckerPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>("en");

  const primaryButtonClass =
    "rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-slate-900";
  const secondaryButtonClass =
    "rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900";

  useEffect(() => {
    if (!isGoogleLoggedIn()) {
      router.replace("/");
      return;
    }

    if (!token) {
      void ensureBackendToken()
        .then((resolvedToken) => {
          setToken(resolvedToken);
          setSubmitError("");
        })
        .catch(() => {
          setSubmitError("Session setup failed. Please login again.");
          router.replace("/");
        });
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [router, token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setSubmitError("Please login first.");
      return;
    }

    setLoading(true);
    setSubmitError("");

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
      setEligibility(result);
      setVoiceError("");
    } catch {
      setSubmitError("Failed to run eligibility check.");
    } finally {
      setLoading(false);
    }
  };

  const buildEligibilityVoiceText = (result: EligibilityResponse | null) => {
    if (!result) {
      return voiceLanguage === "hi"
        ? "अभी पात्रता परिणाम उपलब्ध नहीं है। पहले पात्रता जांच चलाएं।"
        : "No eligibility result yet. Please run the eligibility checker first.";
    }

    const eligibleSchemes = result.scheme_decisions
      .filter((item) => item.eligible)
      .map((item) => item.scheme_name);

    const eligibilityLine = voiceLanguage === "hi"
      ? (result.eligible ? "आप वर्तमान में पात्र हैं।" : "आप वर्तमान में पात्र नहीं हैं।")
      : (result.eligible ? "You are currently eligible." : "You are currently not eligible.");
    const schemesLine = voiceLanguage === "hi"
      ? (eligibleSchemes.length ? `पात्र योजनाएं हैं: ${eligibleSchemes.join(", ")}।` : "अभी कोई योजना पात्र नहीं मिली।")
      : (eligibleSchemes.length ? `Eligible schemes are ${eligibleSchemes.join(", ")}.` : "No scheme is currently marked as eligible.");

    return `${eligibilityLine} ${result.assessment_summary} ${schemesLine}`;
  };

  const playEligibilityVoice = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Voice response is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(buildEligibilityVoiceText(eligibility));
    const voices = synth.getVoices();
    const preferredVoice =
      voiceLanguage === "hi"
        ? (voices.find((voice) => voice.lang.toLowerCase() === "hi-in") ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("hi")))
        : (voices.find((voice) => voice.lang.toLowerCase() === "en-in") ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en")));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = voiceLanguage === "hi" ? "hi-IN" : "en-US";
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setVoiceError("");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceError("Voice playback failed. Please try again.");
    };

    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    synth.speak(utterance);
  };

  const stopEligibilityVoice = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar language={voiceLanguage} />
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Eligibility Checker</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Run eligibility check with voice response in English or Hindi.</p>
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Voice Language</label>
            <select
              value={voiceLanguage}
              onChange={(event) => setVoiceLanguage(event.target.value as VoiceLanguage)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold">Eligibility Form</h2>
          <div className="mt-3 grid gap-3">
            <input name="income" type="number" required placeholder="Income" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input name="age" type="number" required placeholder="Age" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input name="state" required placeholder="State" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input name="family_size" type="number" min={1} defaultValue={1} placeholder="Family size" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input name="annual_hospital_visits" type="number" min={0} defaultValue={0} placeholder="Hospital visits per year" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />
            <input name="occupation" placeholder="Occupation (optional)" className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" />

            <label className="flex items-center gap-2 text-sm"><input name="bpl_card" type="checkbox" /> BPL Card</label>
            <label className="flex items-center gap-2 text-sm"><input name="has_government_id" type="checkbox" defaultChecked /> Has Government ID</label>
            <label className="flex items-center gap-2 text-sm"><input name="rural_resident" type="checkbox" /> Rural Resident</label>
            <label className="flex items-center gap-2 text-sm"><input name="has_chronic_illness" type="checkbox" /> Chronic Illness</label>
            <label className="flex items-center gap-2 text-sm"><input name="has_disability" type="checkbox" /> Disability</label>
            <label className="flex items-center gap-2 text-sm"><input name="is_pregnant" type="checkbox" /> Pregnant</label>

            <button disabled={loading} className={primaryButtonClass}>
              {loading ? "Checking..." : "Check Eligibility"}
            </button>
          </div>
          {submitError ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{submitError}</p> : null}
        </form>

        <EligibilityCard data={eligibility} />

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-semibold">Eligibility Voice Response</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{isSpeaking ? "Speaking..." : "Voice idle"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={playEligibilityVoice} className={primaryButtonClass}>
              Play Eligibility Voice
            </button>
            <button type="button" onClick={stopEligibilityVoice} className={secondaryButtonClass}>
              Stop
            </button>
          </div>
          {voiceError ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{voiceError}</p> : null}
        </div>
      </section>
    </main>
  );
}
