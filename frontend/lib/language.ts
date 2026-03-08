"use client";

export type AppLanguage = "en" | "hi";

const APP_LANGUAGE_KEY = "hv_app_language";
const APP_LANGUAGE_EVENT = "hv-language-change";

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
    // Ignore storage write failures (private mode / blocked storage).
  }
}

export function getAppLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const value = safeGet(APP_LANGUAGE_KEY);
  return value === "hi" ? "hi" : "en";
}

export function setAppLanguage(language: AppLanguage) {
  if (typeof window === "undefined") return;
  safeSet(APP_LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent(APP_LANGUAGE_EVENT, { detail: language }));
}

export function onAppLanguageChange(callback: (language: AppLanguage) => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === APP_LANGUAGE_KEY) {
      callback(getAppLanguage());
    }
  };

  const handleCustom = (event: Event) => {
    const custom = event as CustomEvent<AppLanguage>;
    callback(custom.detail === "hi" ? "hi" : "en");
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(APP_LANGUAGE_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(APP_LANGUAGE_EVENT, handleCustom as EventListener);
  };
}
