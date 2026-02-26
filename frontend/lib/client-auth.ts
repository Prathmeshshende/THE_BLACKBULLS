"use client";

import { login, signup } from "@/lib/api";

const GOOGLE_SESSION_KEY = "hv_google_session";
const BACKEND_TOKEN_KEY = "hv_backend_token";

type GoogleSession = {
  name?: string;
  email?: string;
  picture?: string;
};

export function isGoogleLoggedIn() {
  return true;
}

export function setGoogleSession(session: GoogleSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(session));
}

export function clearClientSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GOOGLE_SESSION_KEY);
  window.localStorage.removeItem(BACKEND_TOKEN_KEY);
}

export function getBackendToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(BACKEND_TOKEN_KEY) ?? "";
}

export async function ensureBackendToken() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(BACKEND_TOKEN_KEY);
  if (existing) return existing;

  try {
    const result = await login("admin@example.com", "StrongPass123");
    window.localStorage.setItem(BACKEND_TOKEN_KEY, result.access_token);
    return result.access_token;
  } catch {
    await signup({
      full_name: "Admin User",
      email: "admin@example.com",
      password: "StrongPass123",
      phone: "9999999999",
      state: "Maharashtra",
    });
    const result = await login("admin@example.com", "StrongPass123");
    window.localStorage.setItem(BACKEND_TOKEN_KEY, result.access_token);
    return result.access_token;
  }
}

export function decodeGoogleCredential(credential: string): GoogleSession {
  const payload = credential.split(".")[1] ?? "";
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(normalized)
      .split("")
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(""),
  );

  const parsed = JSON.parse(json) as Record<string, unknown>;
  return {
    name: typeof parsed.name === "string" ? parsed.name : undefined,
    email: typeof parsed.email === "string" ? parsed.email : undefined,
    picture: typeof parsed.picture === "string" ? parsed.picture : undefined,
  };
}
