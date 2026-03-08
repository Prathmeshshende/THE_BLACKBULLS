"use client";

import { login, signup } from "@/lib/api";

const GOOGLE_SESSION_KEY = "hv_google_session";
const BACKEND_TOKEN_KEY = "hv_backend_token";

type GoogleSession = {
  name?: string;
  email?: string;
  picture?: string;
};

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore blocked storage environments.
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore blocked storage environments.
  }
}

export function isGoogleLoggedIn() {
  return true;
}

export function setGoogleSession(session: GoogleSession) {
  if (typeof window === "undefined") return;
  safeSet(GOOGLE_SESSION_KEY, JSON.stringify(session));
}

export function clearClientSession() {
  if (typeof window === "undefined") return;
  safeRemove(GOOGLE_SESSION_KEY);
  safeRemove(BACKEND_TOKEN_KEY);
}

export function getBackendToken() {
  if (typeof window === "undefined") return "";
  return safeGet(BACKEND_TOKEN_KEY) ?? "";
}

export async function ensureBackendToken() {
  if (typeof window === "undefined") return "";

  const existing = safeGet(BACKEND_TOKEN_KEY);
  if (existing) return existing;

  try {
    const result = await login("admin@example.com", "StrongPass123");
    safeSet(BACKEND_TOKEN_KEY, result.access_token);
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
    safeSet(BACKEND_TOKEN_KEY, result.access_token);
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
