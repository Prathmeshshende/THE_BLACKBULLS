"use client";

import { useState } from "react";
import { login } from "@/lib/api";

type Props = {
  token: string;
  onToken: (token: string) => void;
};

export default function DashboardTokenPanel({ token, onToken }: Props) {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      onToken(data.access_token);
    } catch {
      setError("Login failed for enterprise endpoints.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Enterprise Session</p>
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => {
            void handleLogin();
          }}
          disabled={loading}
          className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-premium transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Get Token"}
        </button>
        <div className="self-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{token ? "Token ready" : "No token"}</div>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}
