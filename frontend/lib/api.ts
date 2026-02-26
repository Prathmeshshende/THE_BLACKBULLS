import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

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
  assessment_summary: string;
  score: number;
  matched_rules: string[];
  scheme_decisions: { scheme_name: string; eligible: boolean; reason: string; application_link?: string | null }[];
  reasons: string[];
  benefits: Record<string, string>;
  required_documents: string[];
  next_steps: string[];
  disclaimer: string;
};

export type EligibilityPayload = {
  income: number;
  age: number;
  bpl_card: boolean;
  state: string;
  family_size: number;
  has_chronic_illness: boolean;
  has_disability: boolean;
  is_pregnant: boolean;
  rural_resident: boolean;
  annual_hospital_visits: number;
  has_government_id: boolean;
  occupation?: string;
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

export async function generateVoiceTTS(payload: { text: string; language?: "en" | "hi" }) {
  const response = await api.post<{ audio_base64: string; mime_type: string; provider: string }>("/voice/tts", payload);
  return response.data;
}

export async function runTriage(symptom_text: string, token: string, language: "en" | "hi" = "en") {
  const response = await api.post<TriageResponse>(
    "/triage",
    { symptom_text, language },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function runEligibility(
  payload: EligibilityPayload,
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

export type CRMRecord = {
  id: number;
  user_id: number | null;
  phone: string | null;
  risk_level: string;
  sentiment_score: number;
  eligibility_status: string;
  follow_up_status: string;
  created_at: string;
};

export type CRMUser = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  state?: string | null;
  latest_follow_up_status: string;
};

export type WhatsAppLog = {
  id: number;
  phone_number: string;
  delivery_status: string;
  provider_reference?: string | null;
  created_at: string;
};

export type ERPStatusPayload = {
  api_health: string;
  hospital_availability: {
    hospital_name: string;
    scheme_mapping: string;
    slots_available: number;
    api_health_status: string;
    synced_at: string;
  }[];
  last_sync: string | null;
};

export type FraudRecord = {
  id: number;
  user_id: number | null;
  phone: string | null;
  fraud_probability: number;
  flagged: boolean;
  reason: string;
  created_at: string;
};

export type ActiveCall = {
  id: number;
  caller_id: string;
  risk_level: string;
  sentiment_score: number;
  status: string;
  call_duration: number;
  created_at: string;
};

export type SalesMetrics = {
  total_inquiries: number;
  converted_cases: number;
  eligibility_approvals: number;
  follow_up_pending: number;
  conversion_rate: number;
};

export type AnalyticsDashboard = {
  calls_per_day: { day: string; count: number }[];
  risk_distribution: Record<string, number>;
  eligibility_approval_rate: number;
  drop_rate: number;
  escalation_rate: number;
  fraud_cases: number;
  conversion_rate: number;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function crmStoreInteraction(
  payload: {
    user_id?: number;
    phone?: string;
    risk_level: string;
    sentiment_score: number;
    eligibility_status: string;
    follow_up_status: string;
  },
  token: string,
) {
  const response = await api.post<CRMRecord>("/crm/store-interaction", payload, { headers: authHeaders(token) });
  return response.data;
}

export async function crmGetUserRecords(userId: number, token: string) {
  const response = await api.get<CRMRecord[]>(`/crm/user/${userId}`, { headers: authHeaders(token) });
  return response.data;
}

export async function crmGetAllUsers(token: string) {
  const response = await api.get<CRMUser[]>("/crm/all-users", { headers: authHeaders(token) });
  return response.data;
}

export async function crmMarkFollowUp(crmRecordId: number, token: string) {
  const response = await api.post<CRMRecord>(
    "/crm/mark-follow-up",
    { crm_record_id: crmRecordId, follow_up_status: "completed" },
    { headers: authHeaders(token) },
  );
  return response.data;
}

export async function whatsappSendSummary(payload: { phone_number: string; message_summary: string }, token: string) {
  const response = await api.post<WhatsAppLog>("/whatsapp/send-summary", payload, { headers: authHeaders(token) });
  return response.data;
}

export type WhatsAppConversationSummaryPayload = {
  phone_number: string;
  triage_advice: string;
  risk_level?: string;
  eligibility_summary?: string;
  eligible_schemes: string[];
  city: string;
  preferred_language?: "en" | "hi";
};

export async function whatsappSendConversationSummary(payload: WhatsAppConversationSummaryPayload, token: string) {
  const response = await api.post<WhatsAppLog>("/whatsapp/send-conversation-summary", payload, { headers: authHeaders(token) });
  return response.data;
}

export async function whatsappGetDeliveryStatus(logId: number, token: string) {
  const response = await api.get<WhatsAppLog>(`/whatsapp/status/${logId}`, { headers: authHeaders(token) });
  return response.data;
}

export async function whatsappHistory(token: string) {
  const response = await api.get<WhatsAppLog[]>("/whatsapp/history", { headers: authHeaders(token) });
  return response.data;
}

export async function erpStatus(token: string) {
  const response = await api.get<ERPStatusPayload>("/erp/status", { headers: authHeaders(token) });
  return response.data;
}

export async function erpSyncHospital(
  payload: { hospital_name: string; scheme_mapping: string; slots_available: number; api_health_status: string },
  token: string,
) {
  const response = await api.post("/erp/sync-hospital", payload, { headers: authHeaders(token) });
  return response.data;
}

export async function fraudFlagged(token: string) {
  const response = await api.get<FraudRecord[]>("/fraud/flagged", { headers: authHeaders(token) });
  return response.data;
}

export async function fraudCheck(payload: { user_id?: number; phone?: string; current_income: number }, token: string) {
  const response = await api.post<FraudRecord>("/fraud/check", payload, { headers: authHeaders(token) });
  return response.data;
}

export async function callcenterActive(token: string) {
  const response = await api.get<ActiveCall[]>("/callcenter/active-calls", { headers: authHeaders(token) });
  return response.data;
}

export async function callcenterEscalate(
  payload: { caller_id: string; risk_level: string; sentiment_score: number; call_duration: number },
  token: string,
) {
  const response = await api.post<ActiveCall>("/callcenter/escalate", payload, { headers: authHeaders(token) });
  return response.data;
}

export async function salesMetrics(token: string) {
  const response = await api.get<SalesMetrics>("/sales/metrics", { headers: authHeaders(token) });
  return response.data;
}

export async function salesConvert(
  payload: { user_id?: number; inquiry_source: string; converted: boolean; eligibility_approved: boolean; follow_up_pending: boolean },
  token: string,
) {
  const response = await api.post<SalesMetrics>("/sales/convert", payload, { headers: authHeaders(token) });
  return response.data;
}

export async function analyticsDashboard(token: string) {
  const response = await api.get<AnalyticsDashboard>("/analytics/dashboard", { headers: authHeaders(token) });
  return response.data;
}
