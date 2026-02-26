"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

type Props = {
  onTranscript: (transcript: string) => void;
};

export default function VoiceRecorder({ onTranscript }: Props) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const toggleRecording = () => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      alert("Web Speech API is not available in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionImpl();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript;
        }
        setLiveTranscript(transcript.trim());
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = recognition;
    }

    if (recording) {
      recognitionRef.current.stop();
      if (liveTranscript.trim()) {
        onTranscript(liveTranscript.trim());
      }
      setRecording(false);
      return;
    }

    setLiveTranscript("");
    recognitionRef.current.start();
    setRecording(true);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Voice Input</h3>
        <button
          type="button"
          onClick={toggleRecording}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {recording ? "Stop" : "Start Mic"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <motion.div
          className="h-4 w-4 rounded-full bg-emerald-500"
          animate={recording ? { scale: [1, 1.8, 1], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 0.6 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
        <p className="text-sm text-slate-600 dark:text-slate-300">{liveTranscript || "Listening transcript will appear here."}</p>
      </div>
    </div>
  );
}
