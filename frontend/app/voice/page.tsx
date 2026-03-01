"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RiskIndicator from "@/components/RiskIndicator";
import VoiceRecorder from "@/components/VoiceRecorder";
import { getAppLanguage, setAppLanguage } from "@/lib/language";
import {
  generateVoiceTTS,
  login,
  runEligibility,
  runTriage,
  signup,
  type EligibilityResponse,
  type TriageResponse,
  whatsappGetDeliveryStatus,
  whatsappSendConversationSummary,
} from "@/lib/api";
import { ensureBackendToken, isGoogleLoggedIn } from "@/lib/client-auth";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type VoiceLanguage = "en" | "hi";

export default function VoicePage() {
  const router = useRouter();
  const SILENT_AUDIO_DATA_URI = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQAAAAA=";

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [token, setToken] = useState("");
  const [symptomText, setSymptomText] = useState("");
  const [triage, setTriage] = useState<TriageResponse | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>(() => getAppLanguage());
  const [voiceError, setVoiceError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showEnableAudioButton, setShowEnableAudioButton] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [whatsAppAutoSummary, setWhatsAppAutoSummary] = useState(false);
  const [whatsAppPhone, setWhatsAppPhone] = useState("");
  const [whatsAppCity, setWhatsAppCity] = useState("Nagpur");
  const [whatsAppStatus, setWhatsAppStatus] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [whatsAppSending, setWhatsAppSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, describe your symptoms here and I will triage the risk with specific advisory.",
    },
  ]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeSpeechIdRef = useRef(0);
  const lastWhatsAppSummarySignatureRef = useRef("");
  const primaryButtonClass = "btn-neon";
  const secondaryButtonClass = "btn-ghost";
  const voiceButtonClass = "btn-neon";

  const texts = useMemo(
    () =>
      voiceLanguage === "hi"
        ? {
          topLanguage: "भाषा",
          authTitle: "ऑथ (ट्रायेज और पात्रता के लिए आवश्यक)",
          emailPlaceholder: "ईमेल",
          passwordPlaceholder: "पासवर्ड",
          loginBtn: "लॉगिन",
          loggingInBtn: "लॉगिन हो रहा है...",
          tokenReady: "टोकन तैयार",
          noToken: "अभी टोकन नहीं",
          loginSuccess: "लॉगिन सफल।",
          signupAndLoginSuccess: "नया अकाउंट बना और लॉगिन हो गया।",
          loginFailed: "लॉगिन विफल। कृपया ईमेल/पासवर्ड जांचें या अलग ईमेल से कोशिश करें।",
          loginFirstTriage: "सुरक्षित ट्रायेज endpoint के लिए पहले लॉगिन करें।",
          loginFirstEligibility: "सुरक्षित पात्रता endpoint के लिए पहले लॉगिन करें।",
          chatTitle: "असिस्टेंट से चैट",
          chatTyping: "असिस्टेंट टाइप कर रहा है...",
          chatInputPlaceholder: "यहाँ लक्षण लिखें (उदाहरण: 104 बुखार और सिरदर्द)",
          sendBtn: "भेजें",
          sendSymptomsBtn: "लक्षण भेजें",
          chatLoginFirst: "कृपया पहले लॉगिन करें, फिर दोबारा लक्षण भेजें।",
          riskPrefix: "जोखिम",
          emergencyTag: "आपातकाल",
          advisoryTitle: "परामर्श",
          noTriage: "अभी कोई ट्रायेज परिणाम नहीं है।",
          playVoice: "वॉइस चलाएं",
          playAdvisoryVoice: "परामर्श वॉइस चलाएं",
          stop: "रोकें",
          enableAudio: "ऑडियो सक्षम करें",
          autoVoice: "ऑटो वॉइस रिप्लाई",
          voiceLanguage: "वॉइस भाषा",
          speaking: "बोल रहा है...",
          voiceIdle: "वॉइस निष्क्रिय",
          emergencyBanner: "आपातकालीन चेतावनी: कृपया तुरंत चिकित्सा सहायता लें।",
          eligibilityTitle: "पात्रता जांच",
          incomePlaceholder: "आय",
          agePlaceholder: "आयु",
          statePlaceholder: "राज्य",
          familySize: "परिवार का आकार",
          visitsPerYear: "प्रति वर्ष अस्पताल विज़िट",
          occupationOptional: "पेशा (वैकल्पिक)",
          bplCard: "बीपीएल कार्ड",
          hasGovId: "सरकारी आईडी है",
          ruralResident: "ग्रामीण निवासी",
          chronicIllness: "दीर्घकालिक बीमारी",
          disability: "दिव्यांगता",
          pregnant: "गर्भवती (यदि लागू हो)",
          checkEligibility: "पात्रता जांचें",
          checkEligibilityNow: "अभी पात्रता जांचें",
          noEligibility: "अभी कोई पात्रता परिणाम नहीं है।",
          eligibilityVoiceTitle: "पात्रता वॉइस उत्तर",
          playEligibilityVoice: "पात्रता वॉइस चलाएं",
          hospitalTitle: "अस्पताल सुझाव",
          cityPlaceholder: "शहर",
          findHospitals: "अस्पताल खोजें",
          findNearbyHospitals: "नज़दीकी अस्पताल खोजें",
          lastTranscript: "अंतिम ट्रांसक्रिप्ट:",
          tapEnableAudio: "वॉइस चलाने के लिए एक बार ऑडियो सक्षम करें।",
          audioPlaybackError: "ऑडियो चलाने में त्रुटि हुई। कृपया फिर से कोशिश करें।",
          noAdvisory: "अभी कोई परामर्श उपलब्ध नहीं है।",
          voiceUnsupported: "इस ब्राउज़र में वॉइस रिप्लाई समर्थित नहीं है।",
          voicePlaybackFailed: "वॉइस प्लेबैक विफल हुआ। कृपया फिर से कोशिश करें या ब्राउज़र ऑडियो अनुमति जांचें।",
          voicePlaybackBlocked: "ब्राउज़र ने वॉइस प्लेबैक रोक दिया। कृपया Play Voice बटन पर दोबारा टैप करें।",
          voiceStartFailed: "इस ब्राउज़र में वॉइस प्लेबैक शुरू नहीं हो सका।",
          hindiVoiceNotFound: "डिवाइस में हिंदी टेक्स्ट-टू-स्पीच वॉइस नहीं मिली। Windows Settings > Time & language > Speech में Hindi voice pack इंस्टॉल करें।",
          hindiVoiceFallback: "हिंदी वॉइस उपलब्ध नहीं है, इसलिए फिलहाल English वॉइस में आउटपुट चलाया जा रहा है।",
          englishOption: "अंग्रेज़ी",
          hindiOption: "हिंदी",
          medicalDisclaimer: "यह चिकित्सीय निदान नहीं है। कृपया लाइसेंसधारी चिकित्सा विशेषज्ञ से परामर्श करें।",
          whatsappTitle: "व्हाट्सऐप सारांश (वैकल्पिक)",
          whatsappAuto: "कॉल के बाद ऑटो-समरी भेजें (वैकल्पिक)",
          whatsappPhonePlaceholder: "व्हाट्सऐप नंबर (उदा. +919876543210)",
          whatsappCityPlaceholder: "अस्पताल शहर",
          whatsappSent: "व्हाट्सऐप सारांश भेज दिया गया।",
          whatsappSendFailed: "व्हाट्सऐप सारांश भेजने में समस्या आई।",
          whatsappNeedPhone: "ऑटो-समरी के लिए व्हाट्सऐप नंबर दर्ज करें।",
          whatsappSendNow: "अभी भेजें",
          whatsappSending: "व्हाट्सऐप सारांश भेजा जा रहा है...",
          whatsappNeedTriage: "पहले लक्षण भेजें ताकि सारांश बन सके।",
          whatsappLoginExpired: "सेशन समाप्त हो गया है। कृपया दोबारा लॉगिन करें।",
          whatsappBackendRestart: "बैकएंड अपडेट हुआ है। कृपया बैकएंड रीस्टार्ट करें और फिर कोशिश करें।",
          whatsappMockNotice: "यह डेमो (mock) भेजा गया है। असली WhatsApp संदेश के लिए Twilio कॉन्फ़िगर करें।",
          whatsappDeliveryFailed: "WhatsApp डिलीवरी विफल हुई।",
          whatsappProviderNotConfigured: "Twilio कॉन्फ़िगर नहीं है। .env में TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN और TWILIO_WHATSAPP_FROM सेट करें, फिर backend रीस्टार्ट करें।",
          whatsappInvalidPhone: "फोन नंबर मान्य नहीं है। देश कोड सहित नंबर डालें (उदा: +919699526226)।",
          whatsappTwilioFailed: "Twilio से संदेश भेजने में समस्या आई। कृपया Twilio sandbox/approved number जांचें।",
          whatsappNormalFallback: "Twilio उपलब्ध नहीं है, इसलिए सारांश सामान्य संदेश मोड में भेजा गया है।",
          smsSent: "SMS सफलतापूर्वक भेजा गया।",
          whatsappDeliveryPending: "व्हाट्सऐप संदेश कतार में है। अंतिम डिलीवरी स्थिति जांची जा रही है...",
          cloudTtsFailed: "क्लाउड हिंदी वॉइस उपलब्ध नहीं हो सकी। कृपया नेटवर्क जांचें या दोबारा कोशिश करें।",
        }
        : {
          topLanguage: "Language",
          authTitle: "Auth (Required for Triage & Eligibility)",
          emailPlaceholder: "Email",
          passwordPlaceholder: "Password",
          loginBtn: "Login",
          loggingInBtn: "Logging in...",
          tokenReady: "Token ready",
          noToken: "No token yet",
          loginSuccess: "Login successful.",
          signupAndLoginSuccess: "New account created and logged in.",
          loginFailed: "Login failed. Please check email/password or try a different email.",
          loginFirstTriage: "Please login first to access protected triage endpoint.",
          loginFirstEligibility: "Please login first to access protected eligibility endpoint.",
          chatTitle: "Chat with Assistant",
          chatTyping: "Assistant is typing...",
          chatInputPlaceholder: "Type symptoms here (example: 104 fever with headache)",
          sendBtn: "Send",
          sendSymptomsBtn: "Send Symptoms",
          chatLoginFirst: "Please login first, then send symptoms again.",
          riskPrefix: "Risk",
          emergencyTag: "Emergency",
          advisoryTitle: "Advisory",
          noTriage: "No triage result yet.",
          playVoice: "Play Voice Reply",
          playAdvisoryVoice: "Play Advisory Voice",
          stop: "Stop",
          enableAudio: "Enable Audio",
          autoVoice: "Auto Voice Reply",
          voiceLanguage: "Voice Language",
          speaking: "Speaking...",
          voiceIdle: "Voice idle",
          emergencyBanner: "Emergency alert: please seek immediate care.",
          eligibilityTitle: "Eligibility Checker",
          incomePlaceholder: "Income",
          agePlaceholder: "Age",
          statePlaceholder: "State",
          familySize: "Family Size",
          visitsPerYear: "Hospital Visits per Year",
          occupationOptional: "Occupation (optional)",
          bplCard: "BPL Card",
          hasGovId: "Has Government ID",
          ruralResident: "Rural Resident",
          chronicIllness: "Chronic Illness",
          disability: "Disability",
          pregnant: "Pregnant (if applicable)",
          checkEligibility: "Check Eligibility",
          checkEligibilityNow: "Check Eligibility Now",
          noEligibility: "No eligibility result yet.",
          eligibilityVoiceTitle: "Eligibility Voice Response",
          playEligibilityVoice: "Play Eligibility Voice",
          hospitalTitle: "Hospital Suggestion",
          cityPlaceholder: "City",
          findHospitals: "Find Hospitals",
          findNearbyHospitals: "Find Nearby Hospitals",
          lastTranscript: "Last transcript:",
          tapEnableAudio: "Tap Enable Audio once to allow voice playback.",
          audioPlaybackError: "Audio playback error. Please try again.",
          noAdvisory: "No advisory available yet.",
          voiceUnsupported: "Voice reply is not supported in this browser.",
          voicePlaybackFailed: "Voice playback failed. Try again or check browser audio permissions.",
          voicePlaybackBlocked: "Browser blocked voice playback. Please tap Play Voice again.",
          voiceStartFailed: "Unable to start voice playback in this browser.",
          hindiVoiceNotFound: "Hindi text-to-speech voice is not available on this device. Install Hindi voice pack from Windows Settings > Time & language > Speech.",
          hindiVoiceFallback: "Hindi voice is unavailable, so output is currently playing with an English voice fallback.",
          englishOption: "English",
          hindiOption: "Hindi",
          medicalDisclaimer: "This is not a medical diagnosis. Please consult a licensed medical professional.",
          whatsappTitle: "WhatsApp Summary (Optional)",
          whatsappAuto: "Auto-send summary after conversation (optional)",
          whatsappPhonePlaceholder: "WhatsApp number (e.g. +919876543210)",
          whatsappCityPlaceholder: "Hospital city",
          whatsappSent: "WhatsApp summary sent successfully.",
          whatsappSendFailed: "Failed to send WhatsApp summary.",
          whatsappNeedPhone: "Enter a WhatsApp number to enable auto summary.",
          whatsappSendNow: "Send now",
          whatsappSending: "Sending WhatsApp summary...",
          whatsappNeedTriage: "Send symptoms first to generate a summary.",
          whatsappLoginExpired: "Session expired. Please login again.",
          whatsappBackendRestart: "Backend was updated. Restart backend and try again.",
          whatsappMockNotice: "This is a mock send only. Configure Twilio for real WhatsApp delivery.",
          whatsappDeliveryFailed: "WhatsApp delivery failed.",
          whatsappProviderNotConfigured: "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in .env, then restart backend.",
          whatsappInvalidPhone: "Invalid phone number. Enter number with country code (e.g. +919699526226).",
          whatsappTwilioFailed: "Twilio failed to send the message. Check Twilio sandbox/approved recipient setup.",
          whatsappNormalFallback: "Twilio is unavailable, so the summary was sent in normal-message fallback mode.",
          smsSent: "SMS sent successfully.",
          whatsappDeliveryPending: "WhatsApp message is queued. Checking final delivery status...",
          cloudTtsFailed: "Cloud voice generation failed. Please check your network and try again.",
        },
    [voiceLanguage],
  );

  const isPendingWhatsAppStatus = (status: string) => {
    const normalized = status.trim().toLowerCase();
    return normalized === "queued" || normalized === "accepted" || normalized === "sending" || normalized === "sent";
  };

  const isFailedWhatsAppStatus = (status: string) => {
    const normalized = status.trim().toLowerCase();
    return normalized === "failed" || normalized === "undelivered" || normalized === "canceled";
  };

  const getWhatsAppDeliveryFailureMessage = (providerReference?: string | null) => {
    const code = (providerReference ?? "").trim();
    if (!code) {
      return texts.whatsappDeliveryFailed;
    }
    if (code === "whatsapp-provider-not-configured") {
      return texts.whatsappProviderNotConfigured;
    }
    if (code === "invalid-phone") {
      return texts.whatsappInvalidPhone;
    }
    if (code.startsWith("twilio-http-") || code === "twilio-request-failed") {
      return texts.whatsappTwilioFailed;
    }
    return code;
  };

  const getWhatsAppErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const status = axiosError?.response?.status;
    const detail = axiosError?.response?.data?.detail;

    if (status === 401) {
      return texts.whatsappLoginExpired;
    }
    if (status === 404) {
      return texts.whatsappBackendRestart;
    }
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    return texts.whatsappSendFailed;
  };

  useEffect(() => {
    setChatMessages((prev) => {
      if (prev.length === 1 && prev[0]?.role === "assistant") {
        return [
          {
            role: "assistant",
            text:
              voiceLanguage === "hi"
                ? "नमस्ते, अपने लक्षण बताइए। मैं जोखिम का ट्रायेज करके स्पष्ट सलाह दूंगा।"
                : "Hi, describe your symptoms here and I will triage the risk with specific advisory.",
          },
        ];
      }
      return prev;
    });
  }, [voiceLanguage]);

  useEffect(() => {
    if (!isGoogleLoggedIn()) {
      router.replace("/");
      return;
    }

    if (!token) {
      void ensureBackendToken()
        .then((resolvedToken) => {
          setToken(resolvedToken);
          setAuthError("");
        })
        .catch(() => {
          setAuthError("Session setup failed. Please login again.");
          router.replace("/");
        });
    }
  }, [router, token]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    setAppLanguage(voiceLanguage);
  }, [voiceLanguage]);

  const safePlayAudio = async (audioUrl: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;
    audio.src = audioUrl;

    try {
      await audio.play();
      return true;
    } catch (error) {
      if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError")) {
        setShowEnableAudioButton(true);
        setVoiceError(texts.tapEnableAudio);
        return false;
      }
      setVoiceError(texts.audioPlaybackError);
      return false;
    }
  };

  const ensureAudioUnlocked = async () => {
    if (audioUnlocked) {
      return true;
    }

    const unlocked = await safePlayAudio(SILENT_AUDIO_DATA_URI);
    if (unlocked && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      setShowEnableAudioButton(false);
      setVoiceError("");
    }

    return unlocked;
  };

  const onUserGestureEnableAudio = async () => {
    const unlocked = await ensureAudioUnlocked();
    if (!unlocked) {
      return;
    }
    setVoiceError("");
  };

  useEffect(() => {
    void ensureAudioUnlocked();
  }, []);

  const emergencyBanner = useMemo(() => {
    if (!triage?.emergency_flag) return null;
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-300">
        {texts.emergencyBanner}
      </div>
    );
  }, [triage, texts.emergencyBanner]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const result = await login(email, password);
      setToken(result.access_token);
      setAuthMessage(texts.loginSuccess);
      return;
    } catch {
      try {
        await signup({
          full_name: "Demo User",
          email,
          password,
          state: "Karnataka",
        });
        const result = await login(email, password);
        setToken(result.access_token);
        setAuthMessage(texts.signupAndLoginSuccess);
        return;
      } catch {
        setToken("");
        setAuthError(texts.loginFailed);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const processTriageText = async (text: string): Promise<TriageResponse | null> => {
    setSymptomText(text);
    if (!token) {
      setAuthError(texts.loginFirstTriage);
      return null;
    }

    const result = await runTriage(text, token, voiceLanguage);
    setTriage(result);
    setVoiceError("");
    if (autoVoiceReply) {
      speakText(buildTriageVoiceText(result, voiceLanguage), voiceLanguage);
    }

    return result;
  };

  const handleTriage = async (text: string) => {
    await processTriageText(text);
  };

  const pickVoiceForLanguage = (voices: SpeechSynthesisVoice[], language: VoiceLanguage) => {
    if (!voices.length) {
      return undefined;
    }

    if (language === "hi") {
      return (
        voices.find((voice) => voice.lang.toLowerCase() === "hi-in") ??
        voices.find((voice) => voice.lang.toLowerCase().startsWith("hi")) ??
        undefined
      );
    }

    return (
      voices.find((voice) => voice.lang.toLowerCase() === "en-in") ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
      voices[0]
    );
  };

  const playCloudTTS = async (text: string, language: VoiceLanguage) => {
    const unlocked = await ensureAudioUnlocked();
    if (!unlocked) {
      return false;
    }

    try {
      const response = await generateVoiceTTS({ text, language });
      const dataUri = `data:${response.mime_type};base64,${response.audio_base64}`;

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const played = await safePlayAudio(dataUri);
      if (!played || !audioRef.current) {
        return false;
      }

      setIsSpeaking(true);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
      audioRef.current.onpause = () => {
        if (audioRef.current && audioRef.current.ended) {
          setIsSpeaking(false);
        }
      };
      setVoiceError("");
      return true;
    } catch {
      setIsSpeaking(false);
      setVoiceError(texts.cloudTtsFailed);
      return false;
    }
  };

  const speakText = (text: string, language: VoiceLanguage = "en") => {
    if (!text.trim()) {
      setVoiceError(texts.noAdvisory);
      return;
    }
    if (!("speechSynthesis" in window)) {
      setVoiceError(texts.voiceUnsupported);
      return;
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const speechId = activeSpeechIdRef.current + 1;
    activeSpeechIdRef.current = speechId;
    const voices = synth.getVoices();
    if (!voices.length) {
      let resolved = false;
      const previousHandler = synth.onvoiceschanged;
      synth.onvoiceschanged = () => {
        if (resolved) {
          return;
        }
        resolved = true;
        synth.onvoiceschanged = previousHandler;
        window.setTimeout(() => {
          speakText(text, language);
        }, 50);
      };

      window.setTimeout(() => {
        if (resolved) {
          return;
        }
        resolved = true;
        synth.onvoiceschanged = previousHandler;
        speakText(text, language);
      }, 300);
      return;
    }
    const preferredVoice = pickVoiceForLanguage(voices, language);
    const englishFallbackVoice = voices.find((voice) => voice.lang.toLowerCase() === "en-in") ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

    if (language === "hi" && !preferredVoice) {
      void playCloudTTS(text, "hi");
      return;
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      if (language === "hi" && englishFallbackVoice) {
        utterance.voice = englishFallbackVoice;
        utterance.lang = englishFallbackVoice.lang;
      } else {
        utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      }
      if (language === "hi") {
        setVoiceError(englishFallbackVoice ? texts.hindiVoiceFallback : texts.hindiVoiceNotFound);
      }
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    let retriedWithDefaultVoice = false;

    const speakWithCurrentUtterance = () => {
      synth.cancel();
      synth.resume();
      try {
        synth.speak(utterance);
      } catch {
        setIsSpeaking(false);
        setVoiceError(texts.voiceStartFailed);
      }
    };

    utterance.onstart = () => {
      if (speechId !== activeSpeechIdRef.current) {
        return;
      }
      if (!(language === "hi" && !preferredVoice)) {
        setVoiceError("");
      }
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      if (speechId !== activeSpeechIdRef.current) {
        return;
      }
      setIsSpeaking(false);
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (speechId !== activeSpeechIdRef.current) {
        return;
      }
      setIsSpeaking(false);
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }
      if (!retriedWithDefaultVoice) {
        retriedWithDefaultVoice = true;
        if (language === "hi" && englishFallbackVoice) {
          utterance.voice = englishFallbackVoice;
          utterance.lang = englishFallbackVoice.lang;
        } else {
          utterance.voice = null;
          utterance.lang = language === "hi" ? "hi-IN" : "en-US";
        }
        window.setTimeout(() => {
          speakWithCurrentUtterance();
        }, 80);
        return;
      }

      if (event.error === "not-allowed") {
        setVoiceError(texts.voicePlaybackBlocked);
        return;
      }

      if (language === "hi") {
        setVoiceError(texts.hindiVoiceNotFound);
        return;
      }
      setVoiceError(texts.voicePlaybackFailed);
    };

    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    speakWithCurrentUtterance();
  };

  const playVoiceReply = () => {
    speakText(buildTriageVoiceText(triage, voiceLanguage), voiceLanguage);
  };

  const buildTriageVoiceText = (result: TriageResponse | null, language: VoiceLanguage) => {
    if (!result) {
      return language === "hi"
        ? "अभी कोई ट्रायेज परिणाम उपलब्ध नहीं है। पहले लक्षण दर्ज करें।"
        : "No triage result is available yet. Please enter symptoms first.";
    }

    if (language === "hi") {
      const normalizedRisk = result.risk_level.toUpperCase();
      const riskHindi = normalizedRisk === "HIGH" ? "उच्च" : normalizedRisk === "MEDIUM" ? "मध्यम" : normalizedRisk === "LOW" ? "कम" : result.risk_level;
      const emergencyLine = result.emergency_flag
        ? "यह आपातकालीन स्थिति हो सकती है। कृपया तुरंत नजदीकी अस्पताल या डॉक्टर से संपर्क करें।"
        : "कृपया जल्द डॉक्टर से सलाह लें और स्क्रीन पर दिया गया विस्तृत परामर्श पढ़ें।";

      return `ट्रायेज परिणाम तैयार है। जोखिम स्तर ${riskHindi} है। ${emergencyLine}`;
    }

    return result.advisory_message;
  };

  const buildEligibilityVoiceText = (result: EligibilityResponse | null, language: VoiceLanguage) => {
    if (!result) {
      return language === "hi"
        ? "अभी पात्रता परिणाम उपलब्ध नहीं है। कृपया पहले पात्रता जांच चलाएं।"
        : "No eligibility result is available yet. Please run the eligibility checker first.";
    }

    const eligibleSchemes = result.scheme_decisions
      .filter((item) => item.eligible)
      .map((item) => item.scheme_name);
    const notEligibleSchemes = result.scheme_decisions
      .filter((item) => !item.eligible)
      .map((item) => item.scheme_name);

    if (language === "hi") {
      const eligibleLine = eligibleSchemes.length
        ? `आप इन योजनाओं के लिए पात्र हैं: ${eligibleSchemes.join(", ")}।`
        : "आप अभी ट्रैक की गई किसी योजना के लिए पात्र नहीं हैं।";
      const notEligibleLine = notEligibleSchemes.length
        ? `आप इन योजनाओं के लिए अभी पात्र नहीं हैं: ${notEligibleSchemes.join(", ")}।`
        : "आप सभी ट्रैक की गई योजनाओं के लिए पात्र हैं।";

      return `पात्रता जांच पूरी हो गई है। कुल स्थिति: ${result.eligible ? "पात्र" : "अपात्र"}। ${eligibleLine} ${notEligibleLine}`;
    }

    const eligibleLine = eligibleSchemes.length
      ? `Eligible schemes are: ${eligibleSchemes.join(", ")}.`
      : "You are currently not eligible for the tracked schemes.";
    const notEligibleLine = notEligibleSchemes.length
      ? `Not eligible schemes are: ${notEligibleSchemes.join(", ")}.`
      : "You are eligible for all tracked schemes.";

    return `Eligibility check complete. Overall status: ${result.eligible ? "eligible" : "not eligible"}. ${result.assessment_summary}. ${eligibleLine} ${notEligibleLine}`;
  };

  const playEligibilityVoiceReply = () => {
    speakText(buildEligibilityVoiceText(eligibility, voiceLanguage), voiceLanguage);
  };

  const stopVoiceReply = () => {
    activeSpeechIdRef.current += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const applyWhatsAppResult = (deliveryStatus: string, providerReference?: string | null) => {
    if (deliveryStatus === "mock-delivered") {
      setWhatsAppStatus("");
      setWhatsAppError(texts.whatsappMockNotice);
      return;
    }
    if (deliveryStatus === "sms-sent") {
      setWhatsAppStatus(texts.smsSent);
      setWhatsAppError("");
      return;
    }
    if (deliveryStatus === "normal-message") {
      setWhatsAppStatus(texts.whatsappNormalFallback);
      setWhatsAppError("");
      return;
    }
    if (isFailedWhatsAppStatus(deliveryStatus)) {
      setWhatsAppStatus("");
      setWhatsAppError(getWhatsAppDeliveryFailureMessage(providerReference));
      return;
    }
    if (isPendingWhatsAppStatus(deliveryStatus)) {
      setWhatsAppStatus(texts.whatsappDeliveryPending);
      setWhatsAppError("");
      return;
    }
    setWhatsAppStatus(texts.whatsappSent);
    setWhatsAppError("");
  };

  const pollWhatsAppFinalStatus = async (logId: number) => {
    let latest = await whatsappGetDeliveryStatus(logId, token);
    if (!isPendingWhatsAppStatus(latest.delivery_status)) {
      return latest;
    }

    for (let attempt = 0; attempt < 7; attempt += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 1500);
      });
      latest = await whatsappGetDeliveryStatus(logId, token);
      if (!isPendingWhatsAppStatus(latest.delivery_status)) {
        return latest;
      }
    }

    return latest;
  };

  const handleEligibility = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      alert(texts.loginFirstEligibility);
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      income: Number(form.get("income")),
      age: Number(form.get("age")),
      bpl_card: form.get("bpl_card") === "on",
      state: String(form.get("state")),
      family_size: Number(form.get("family_size") ?? 1),
      has_chronic_illness: form.get("has_chronic_illness") === "on",
      has_disability: form.get("has_disability") === "on",
      is_pregnant: form.get("is_pregnant") === "on",
      rural_resident: form.get("rural_resident") === "on",
      annual_hospital_visits: Number(form.get("annual_hospital_visits") ?? 0),
      has_government_id: form.get("has_government_id") === "on",
      occupation: String(form.get("occupation") ?? "").trim() || undefined,
    };

    const result = await runEligibility(payload, token);
    setEligibility(result);

    if (autoVoiceReply) {
      speakText(buildEligibilityVoiceText(result, voiceLanguage), voiceLanguage);
    }
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) {
      return;
    }

    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setChatLoading(true);

    const result = await processTriageText(text);

    if (!result) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: texts.chatLoginFirst },
      ]);
      setChatLoading(false);
      return;
    }

    const displayRisk =
      voiceLanguage === "hi"
        ? (result.risk_level.toUpperCase() === "HIGH" ? "उच्च" : result.risk_level.toUpperCase() === "MEDIUM" ? "मध्यम" : result.risk_level.toUpperCase() === "LOW" ? "कम" : result.risk_level)
        : result.risk_level;

    const advisoryTextForDisplay = voiceLanguage === "hi"
      ? buildTriageVoiceText(result, "hi")
      : result.advisory_message;

    const assistantText = `${texts.riskPrefix}: ${displayRisk}${result.emergency_flag ? ` (${texts.emergencyTag})` : ""}\n${advisoryTextForDisplay}`;
    setChatMessages((prev) => [...prev, { role: "assistant", text: assistantText }]);
    setChatLoading(false);
  };

  const buildWhatsAppSummaryPayload = () => {
    if (!triage) {
      return null;
    }

    return {
      phone_number: whatsAppPhone.trim(),
      triage_advice: triage.advisory_message,
      risk_level: triage.risk_level,
      eligibility_summary: eligibility?.assessment_summary,
      eligible_schemes: (eligibility?.scheme_decisions ?? [])
        .filter((item) => item.eligible)
        .map((item) => item.scheme_name),
      city: whatsAppCity.trim() || "Nagpur",
      preferred_language: voiceLanguage,
    };
  };

  const sendWhatsAppSummaryNow = async () => {
    if (!token) {
      setWhatsAppStatus("");
      setWhatsAppError(texts.loginFirstTriage);
      return;
    }

    const payload = buildWhatsAppSummaryPayload();
    if (!payload) {
      setWhatsAppStatus("");
      setWhatsAppError(texts.whatsappNeedTriage);
      return;
    }

    if (!payload.phone_number) {
      setWhatsAppStatus("");
      setWhatsAppError(texts.whatsappNeedPhone);
      return;
    }

    setWhatsAppSending(true);
    setWhatsAppError("");
    try {
      const response = await whatsappSendConversationSummary(payload, token);
      lastWhatsAppSummarySignatureRef.current = JSON.stringify(payload);

      applyWhatsAppResult(response.delivery_status, response.provider_reference);
      if (isPendingWhatsAppStatus(response.delivery_status) && typeof response.id === "number") {
        const finalStatus = await pollWhatsAppFinalStatus(response.id);
        applyWhatsAppResult(finalStatus.delivery_status, finalStatus.provider_reference);
      }
    } catch (error) {
      setWhatsAppStatus("");
      setWhatsAppError(getWhatsAppErrorMessage(error));
    } finally {
      setWhatsAppSending(false);
    }
  };

  useEffect(() => {
    if (!whatsAppAutoSummary) {
      setWhatsAppStatus("");
      setWhatsAppError("");
      return;
    }

    if (!triage || !token) {
      return;
    }

    const phone = whatsAppPhone.trim();
    if (!phone) {
      setWhatsAppStatus("");
      setWhatsAppError(texts.whatsappNeedPhone);
      return;
    }

    const payload = buildWhatsAppSummaryPayload();
    if (!payload) {
      return;
    }

    const signature = JSON.stringify(payload);
    if (signature === lastWhatsAppSummarySignatureRef.current) {
      return;
    }

    let cancelled = false;

    const sendSummary = async () => {
      setWhatsAppSending(true);
      setWhatsAppError("");
      try {
        const response = await whatsappSendConversationSummary(payload, token);
        if (cancelled) {
          return;
        }
        lastWhatsAppSummarySignatureRef.current = signature;

        applyWhatsAppResult(response.delivery_status, response.provider_reference);
        if (isPendingWhatsAppStatus(response.delivery_status) && typeof response.id === "number") {
          const finalStatus = await pollWhatsAppFinalStatus(response.id);
          if (cancelled) {
            return;
          }
          applyWhatsAppResult(finalStatus.delivery_status, finalStatus.provider_reference);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        setWhatsAppStatus("");
        setWhatsAppError(getWhatsAppErrorMessage(error));
      } finally {
        if (!cancelled) {
          setWhatsAppSending(false);
        }
      }
    };

    void sendSummary();

    return () => {
      cancelled = true;
    };
  }, [whatsAppAutoSummary, whatsAppPhone, whatsAppCity, triage, eligibility, token, voiceLanguage, texts.whatsappNeedPhone, texts.whatsappSendFailed, texts.whatsappSent]);

  const triageDisplayText =
    voiceLanguage === "hi"
      ? buildTriageVoiceText(triage, "hi")
      : (triage?.advisory_message ?? texts.noTriage);

  const triageDisclaimerText =
    voiceLanguage === "hi"
      ? texts.medicalDisclaimer
      : (triage?.disclaimer ?? texts.medicalDisclaimer);

  const glassCard = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(20px)" as const,
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  return (
    <main className="min-h-screen">
      <Navbar language={voiceLanguage} onLanguageChange={(nextLanguage) => setVoiceLanguage(nextLanguage)} />
      <section className="mx-auto max-w-6xl space-y-5 px-6 py-8">

        {/* Language Bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl p-4" style={glassCard}>
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(0,229,160,0.7)" }}>
            {texts.topLanguage}
          </span>
          <div className="flex overflow-hidden rounded-lg text-xs font-bold" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {(["en", "hi"] as VoiceLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setVoiceLanguage(lang)}
                className="px-3 py-1.5 transition-all"
                style={voiceLanguage === lang
                  ? { background: "linear-gradient(135deg,#00e5a0,#38bdf8)", color: "#020817" }
                  : { color: "#94a3b8" }}
              >
                {lang === "en" ? texts.englishOption : texts.hindiOption}
              </button>
            ))}
          </div>
        </div>

        <VoiceRecorder onTranscript={handleTriage} language={voiceLanguage} />

        {/* WhatsApp Panel */}
        <div className="rounded-2xl p-5" style={{ ...glassCard, border: "1px solid rgba(37,211,102,0.20)" }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(37,211,102,0.8)" }}>
              {texts.whatsappTitle}
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={whatsAppPhone} onChange={(e) => { setWhatsAppPhone(e.target.value); setWhatsAppError(""); }} placeholder={texts.whatsappPhonePlaceholder} className="glass-input" />
            <input value={whatsAppCity} onChange={(e) => setWhatsAppCity(e.target.value)} placeholder={texts.whatsappCityPlaceholder} className="glass-input" />
            <label className="flex cursor-pointer items-center gap-2 self-center rounded-xl px-3 py-2.5 text-sm text-slate-300" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <input type="checkbox" checked={whatsAppAutoSummary} onChange={(e) => { setWhatsAppAutoSummary(e.target.checked); setWhatsAppError(""); }} className="accent-emerald-400" />
              {texts.whatsappAuto}
            </label>
            <button type="button" onClick={() => { void sendWhatsAppSummaryNow(); }} disabled={whatsAppSending} className="btn-neon">
              {texts.whatsappSendNow}
            </button>
          </div>
          {whatsAppSending && <p className="mt-2 text-sm text-slate-400">{texts.whatsappSending}</p>}
          {whatsAppStatus && <p className="mt-2 text-sm" style={{ color: "#00e5a0" }}>{whatsAppStatus}</p>}
          {whatsAppError && <p className="mt-2 text-sm text-rose-400">{whatsAppError}</p>}
        </div>

        {/* Chat */}
        <div className="rounded-2xl p-5" style={glassCard}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(167,139,250,0.7)" }}>
            💬 {texts.chatTitle}
          </h3>
          <div
            className="max-h-72 space-y-2 overflow-y-auto rounded-xl p-3"
            style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "ml-auto" : ""
                  }`}
                style={
                  message.role === "user"
                    ? { background: "linear-gradient(135deg,#00e5a0,#38bdf8)", color: "#020817", fontWeight: 600 }
                    : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "#cbd5e1" }
                }
              >
                {message.text}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-500" style={{ animation: `waveform 0.9s ease-in-out ${(i - 1) * 0.2}s infinite` }} />)}
                </div>
                {texts.chatTyping}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleSendChat(); } }}
              placeholder={texts.chatInputPlaceholder}
              className="glass-input flex-1"
            />
            <button type="button" onClick={() => { void handleSendChat(); }} disabled={chatLoading} className="btn-neon shrink-0">
              {texts.sendSymptomsBtn}
            </button>
          </div>
        </div>

        {/* Triage Results */}
        <div className="grid gap-4 md:grid-cols-2">
          <RiskIndicator risk={triage?.risk_level ?? "LOW"} emergency={triage?.emergency_flag ?? false} language={voiceLanguage} />
          <div className="rounded-2xl p-5" style={{ ...glassCard, border: "1px solid rgba(56,189,248,0.20)" }}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(56,189,248,0.7)" }}>
              🩺 {texts.advisoryTitle}
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">{triageDisplayText}</p>
            <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{triageDisclaimerText}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={playVoiceReply} className="btn-neon">
                ▶ {texts.playAdvisoryVoice}
              </button>
              <button type="button" onClick={stopVoiceReply} className="btn-ghost">
                ⏹ {texts.stop}
              </button>
              {showEnableAudioButton && (
                <button type="button" onClick={onUserGestureEnableAudio} className="btn-ghost" style={{ border: "1px solid rgba(167,139,250,0.35)", color: "#a78bfa" }}>
                  🔊 {texts.enableAudio}
                </button>
              )}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={autoVoiceReply} onChange={(e) => setAutoVoiceReply(e.target.checked)} className="accent-emerald-400" />
                {texts.autoVoice}
              </label>
            </div>
            <p className="mt-2 text-xs" style={{ color: isSpeaking ? "#00e5a0" : "rgba(255,255,255,0.3)" }}>
              {isSpeaking ? `🔈 ${texts.speaking}` : texts.voiceIdle}
            </p>
            {voiceError && <p className="mt-2 text-sm text-rose-400">{voiceError}</p>}
          </div>
        </div>

        {/* Emergency Banner */}
        {triage?.emergency_flag && (
          <div
            className="rounded-2xl px-5 py-4 text-sm font-bold animate-pulse-glow-rose"
            style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.40)", color: "#f43f5e", boxShadow: "0 0 32px rgba(244,63,94,0.25)" }}
          >
            🚨 {texts.emergencyBanner}
          </div>
        )}

        {symptomText && (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            {texts.lastTranscript} {symptomText}
          </p>
        )}
      </section>
    </main>
  );
}
