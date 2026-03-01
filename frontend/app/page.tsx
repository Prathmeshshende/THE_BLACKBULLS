"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureBackendToken } from "@/lib/client-auth";

export default function LandingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    void ensureBackendToken()
      .then(() => { router.replace("/voice"); })
      .catch(() => { setError("Unable to open app right now. Please try again."); });
  }, [router]);

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,160,0.10) 0%, transparent 65%), #020817" }}
    >
      {/* Animated rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${180 + i * 100}px`,
              height: `${180 + i * 100}px`,
              borderColor: `rgba(0,229,160,${0.12 - i * 0.03})`,
              animation: `pulse-glow ${2 + i * 0.6}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black animate-float"
          style={{
            background: "linear-gradient(135deg,#00e5a0,#38bdf8)",
            boxShadow: "0 0 40px rgba(0,229,160,0.5), 0 0 80px rgba(0,229,160,0.2)",
            color: "#020817",
          }}
        >
          A+
        </div>

        {/* Title */}
        <div>
          <div className="badge-mint mb-4 mx-auto w-fit">Arogya AI Premium</div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Opening{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#00e5a0,#38bdf8,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Healthcare AI
            </span>
          </h1>
          <p className="mt-3 text-slate-400">Redirecting you to the assistant{dots}</p>
        </div>

        {/* Progress bar */}
        {!error && (
          <div className="h-1 w-48 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full w-full origin-left rounded-full"
              style={{
                background: "linear-gradient(90deg,#00e5a0,#38bdf8)",
                animation: "border-flow 1.8s ease-in-out infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-5 py-3 text-sm text-rose-300"
            style={{ background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.25)" }}
          >
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
