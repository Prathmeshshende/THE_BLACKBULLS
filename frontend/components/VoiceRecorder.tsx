"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike> & {
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Props = {
  onTranscript: (transcript: string) => void;
  language?: "en" | "hi";
};

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
    ? {
        voiceInput: "वॉइस इनपुट",
        stop: "रोकें",
        startMic: "माइक शुरू करें",
        transcriptPlaceholder: "सुनाई गई आवाज़ का टेक्स्ट यहां दिखाई देगा।",
        webSpeechNotAvailable: "इस ब्राउज़र में Web Speech API उपलब्ध नहीं है।",
        micPermissionDenied: "माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग में माइक्रोफोन अनुमति दें।",
        noSpeechDetected: "आवाज़ स्पष्ट नहीं मिली। कृपया थोड़ा धीरे और स्पष्ट बोलें।",
        audioCaptureIssue: "माइक्रोफोन से ऑडियो कैप्चर नहीं हो रहा है। कृपया माइक जांचें।",
        micStartFailed: "माइक शुरू नहीं हो सका। कृपया दोबारा कोशिश करें।",
        listeningIn: "सुनने की भाषा",
      }
    : {
        voiceInput: "Voice Input",
        stop: "Stop",
        startMic: "Start Mic",
        transcriptPlaceholder: "Listening transcript will appear here.",
        webSpeechNotAvailable: "Web Speech API is not available in this browser.",
        micPermissionDenied: "Microphone permission denied. Please allow microphone access in browser settings.",
        noSpeechDetected: "No clear speech detected. Please speak slowly and clearly.",
        audioCaptureIssue: "Unable to capture microphone audio. Please check your mic device.",
        micStartFailed: "Could not start microphone. Please try again.",
        listeningIn: "Listening in",
      };

  const toggleRecording = async () => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      alert(labels.webSpeechNotAvailable);
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interimTranscript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const chunk = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk}`.trim();
          } else {
            interimTranscript += chunk;
          }
        }

        const combinedTranscript = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
        liveTranscriptRef.current = combinedTranscript;
        setLiveTranscript(combinedTranscript);
      };

      recognition.onstart = () => {
        if (startTimeoutRef.current !== null) {
          window.clearTimeout(startTimeoutRef.current);
          startTimeoutRef.current = null;
        }
        setStarting(false);
        setRecording(true);
      };

      recognition.onend = () => {
        if (startTimeoutRef.current !== null) {
          window.clearTimeout(startTimeoutRef.current);
          startTimeoutRef.current = null;
        }
        setRecording(false);
        setStarting(false);
        const completedTranscript = finalTranscriptRef.current.trim() || liveTranscriptRef.current.trim();
        if (completedTranscript && completedTranscript !== submittedTranscriptRef.current) {
          submittedTranscriptRef.current = completedTranscript;
          onTranscript(completedTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (startTimeoutRef.current !== null) {
          window.clearTimeout(startTimeoutRef.current);
          startTimeoutRef.current = null;
        }
        setRecording(false);
        setStarting(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError(labels.micPermissionDenied);
          return;
        }
        if (event.error === "no-speech") {
          setMicError(labels.noSpeechDetected);
          return;
        }
        if (event.error === "audio-capture") {
          setMicError(labels.audioCaptureIssue);
          return;
        }
      };

      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

    if (recording) {
      const completedTranscript = finalTranscriptRef.current.trim() || liveTranscriptRef.current.trim();
      if (completedTranscript && completedTranscript !== submittedTranscriptRef.current) {
        submittedTranscriptRef.current = completedTranscript;
        onTranscript(completedTranscript);
      }
      recognition.stop();
      setRecording(false);
      setStarting(false);
      return;
    }

    if (starting) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setMicError(labels.micPermissionDenied);
      return;
    }

    setMicError("");
    finalTranscriptRef.current = "";
    liveTranscriptRef.current = "";
    submittedTranscriptRef.current = "";
    setLiveTranscript("");
    setStarting(true);
    try {
      recognition.start();
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
      }
      startTimeoutRef.current = window.setTimeout(() => {
        setStarting(false);
        setRecording(false);
        setMicError(labels.micStartFailed);
      }, 3500);
    } catch {
      setRecording(false);
      setStarting(false);
      setMicError(labels.micStartFailed);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">{labels.voiceInput}</h3>
        <button
          type="button"
          onClick={() => {
            void toggleRecording();
          }}
          disabled={starting}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
            recording
              ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500"
              : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
          } ${starting ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {starting ? (language === "hi" ? "शुरू हो रहा..." : "Starting...") : (recording ? labels.stop : labels.startMic)}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <motion.div
          className="h-4 w-4 rounded-full bg-emerald-500"
          animate={recording ? { scale: [1, 1.8, 1], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 0.6 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{liveTranscript || labels.transcriptPlaceholder}</p>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {labels.listeningIn}: {language === "hi" ? "Hindi (hi-IN)" : "English (en-IN)"}
      </p>
      {micError ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{micError}</p> : null}
    </div>
  );
}
