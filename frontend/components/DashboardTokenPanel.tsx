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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={() => {
            void handleLogin();
          }}
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Get Token"}
        </button>
        <div className="self-center text-xs text-slate-500 dark:text-slate-400">{token ? "Token ready" : "No token"}</div>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}
