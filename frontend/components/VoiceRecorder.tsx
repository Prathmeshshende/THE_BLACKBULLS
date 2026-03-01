"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike> & { isFinal: boolean };
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionErrorEventLike = { error: string };
type SpeechRecognitionLike = {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives?: number;
  onstart: (() => void) | null; onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null; onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void; stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Props = { onTranscript: (transcript: string) => void; language?: "en" | "hi" };

export default function VoiceRecorder({ onTranscript, language = "en" }: Props) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef("");
  const liveTranscriptRef = useRef("");
  const submittedTranscriptRef = useRef("");
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micError, setMicError] = useState("");

  const labels = language === "hi"
    ? { voiceInput: "वॉइस इनपुट", stop: "रोकें", startMic: "माइक शुरू करें", transcriptPlaceholder: "आपकी आवाज़ यहाँ दिखेगी…", webSpeechNotAvailable: "इस ब्राउज़र में Web Speech API उपलब्ध नहीं है।", micPermissionDenied: "माइक की अनुमति नहीं मिली।", noSpeechDetected: "आवाज़ स्पष्ट नहीं मिली।", audioCaptureIssue: "माइक्रोफोन से ऑडियो कैप्चर नहीं हो रहा।", micStartFailed: "माइक शुरू नहीं हो सका।", listeningIn: "सुनने की भाषा" }
    : { voiceInput: "Voice Input", stop: "Stop", startMic: "Start Mic", transcriptPlaceholder: "Your speech will appear here…", webSpeechNotAvailable: "Web Speech API is not available in this browser.", micPermissionDenied: "Microphone permission denied.", noSpeechDetected: "No clear speech detected.", audioCaptureIssue: "Unable to capture microphone audio.", micStartFailed: "Could not start microphone.", listeningIn: "Listening in" };

  const toggleRecording = async () => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) { alert(labels.webSpeechNotAvailable); return; }
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = true; recognition.interimResults = true; recognition.maxAlternatives = 1;
      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i]; const chunk = r[0]?.transcript ?? "";
          if (r.isFinal) finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk}`.trim();
          else interim += chunk;
        }
        const combined = `${finalTranscriptRef.current} ${interim}`.trim();
        liveTranscriptRef.current = combined; setLiveTranscript(combined);
      };
      recognition.onstart = () => { if (startTimeoutRef.current) { clearTimeout(startTimeoutRef.current); startTimeoutRef.current = null; } setStarting(false); setRecording(true); };
      recognition.onend = () => {
        if (startTimeoutRef.current) { clearTimeout(startTimeoutRef.current); startTimeoutRef.current = null; }
        setRecording(false); setStarting(false);
        const t = finalTranscriptRef.current.trim() || liveTranscriptRef.current.trim();
        if (t && t !== submittedTranscriptRef.current) { submittedTranscriptRef.current = t; onTranscript(t); }
      };
      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (startTimeoutRef.current) { clearTimeout(startTimeoutRef.current); startTimeoutRef.current = null; }
        setRecording(false); setStarting(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") { setMicError(labels.micPermissionDenied); return; }
        if (event.error === "no-speech") { setMicError(labels.noSpeechDetected); return; }
        if (event.error === "audio-capture") { setMicError(labels.audioCaptureIssue); return; }
      };
      recognitionRef.current = recognition;
    }
    const recognition = recognitionRef.current;
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    if (recording) {
      const t = finalTranscriptRef.current.trim() || liveTranscriptRef.current.trim();
      if (t && t !== submittedTranscriptRef.current) { submittedTranscriptRef.current = t; onTranscript(t); }
      recognition.stop(); setRecording(false); setStarting(false); return;
    }
    if (starting) return;
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t) => t.stop()); }
    catch { setMicError(labels.micPermissionDenied); return; }
    setMicError(""); finalTranscriptRef.current = ""; liveTranscriptRef.current = ""; submittedTranscriptRef.current = ""; setLiveTranscript(""); setStarting(true);
    try {
      recognition.start();
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = window.setTimeout(() => { setStarting(false); setRecording(false); setMicError(labels.micStartFailed); }, 3500);
    } catch { setRecording(false); setStarting(false); setMicError(labels.micStartFailed); }
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(0,229,160,0.7)" }}
        >
          {labels.voiceInput}
        </h3>

        {/* Mic Button */}
        <div className="relative">
          {recording && (
            <>
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(244,63,94,0.2)", animation: "mic-ring 1.5s ease-out infinite" }}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(244,63,94,0.12)", animation: "mic-ring 1.5s ease-out 0.5s infinite" }}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => { void toggleRecording(); }}
            disabled={starting}
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white transition-all"
            style={
              recording
                ? {
                  background: "linear-gradient(135deg,#f43f5e,#dc2626)",
                  boxShadow: "0 0 24px rgba(244,63,94,0.5)",
                }
                : starting
                  ? { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }
                  : {
                    background: "linear-gradient(135deg,#00e5a0,#38bdf8)",
                    boxShadow: "0 0 20px rgba(0,229,160,0.4)",
                    color: "#020817",
                  }
            }
          >
            {starting ? "…" : recording ? "⏹" : "🎤"}
          </button>
        </div>
      </div>

      {/* Waveform + Transcript */}
      <div className="mt-4 flex items-center gap-4">
        {/* Waveform bars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                height: "24px",
                background: recording ? "linear-gradient(180deg,#00e5a0,#38bdf8)" : "rgba(255,255,255,0.15)",
                animation: recording ? `waveform 0.9s ease-in-out ${(i - 1) * 0.15}s infinite` : undefined,
                transform: recording ? undefined : "scaleY(0.3)",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>

        <div className="flex-1 rounded-xl p-3 text-sm leading-relaxed text-slate-300"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", minHeight: "48px" }}>
          {liveTranscript || <span className="text-slate-500">{labels.transcriptPlaceholder}</span>}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {labels.listeningIn}: {language === "hi" ? "Hindi (hi-IN)" : "English (en-IN)"}
      </p>
      {micError && <p className="mt-2 text-sm text-rose-400">{micError}</p>}
    </div>
  );
}
