import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export type TriageResponse = {
  risk_level: "HIGH" | "MEDIUM" | "LOW" | string;
  emergency_flag: boolean;
  advisory_message: string;
  disclaimer: string;
  detected_symptoms: string[];
};

export type EligibilityResponse = {
  eligible: boolean;
  reasons: string[];
  benefits: Record<string, string>;
  next_steps: string[];
  disclaimer: string;
};

export type HospitalItem = {
  hospital_name: string;
  government: boolean;
  scheme_supported: boolean;
  contact_number: string;
};

export type HospitalResponse = {
  city: string;
  hospitals: HospitalItem[];
  disclaimer: string;
};

export async function signup(payload: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  state?: string;
}) {
  const response = await api.post("/auth/signup", payload);
  return response.data;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await api.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data as { access_token: string; token_type: string };
}

export async function transcribeVoice(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/voice/transcribe", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as { transcript: string; disclaimer: string };
}

export async function runTriage(symptom_text: string, token: string) {
  const response = await api.post<TriageResponse>(
    "/triage",
    { symptom_text },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function runEligibility(
  payload: { income: number; age: number; bpl_card: boolean; state: string },
  token: string,
) {
  const response = await api.post<EligibilityResponse>("/eligibility", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getHospitals(city: string) {
  const response = await api.post<HospitalResponse>("/hospital/suggest", { city });
  return response.data;
}
