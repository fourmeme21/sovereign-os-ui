// src/screens/LegalScreen.tsx
// 4 dil desteği eklendi — EN / TR / DE / JA
// ADAPTERv1 Session 8

import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { privacyPolicy } from "../legal/privacyPolicy";
import { termsOfService, getTosLang, type LegalLang } from "../legal/termsOfService";

type LegalType = "privacy" | "terms";

const LANG_LABELS: Record<LegalLang, string> = {
  en: "EN",
  tr: "TR",
  de: "DE",
  ja: "JA",
};

const LANGS: LegalLang[] = ["en", "tr", "de", "ja"];

// Privacy policy tek dil (EN) — genişletilebilir
const PRIVACY_CONTENT = {
  title: "Privacy Policy",
  text:  privacyPolicy,
};

export default function LegalScreen() {
  const { type } = useParams<{ type: string }>();

  // Tarayıcı diline göre başlangıç dili — fallback: en
  const [lang, setLang] = useState<LegalLang>(() => {
    const browserLang = navigator.language ?? "en";
    return getTosLang(browserLang);
  });

  if (type !== "privacy" && type !== "terms") {
    return <Navigate to="/" replace />;
  }

  const isTerms = type === "terms";
  const title   = isTerms ? "Terms of Service" : PRIVACY_CONTENT.title;
  const text    = isTerms ? termsOfService[lang] : PRIVACY_CONTENT.text;

  useEffect(() => {
    document.title = `${title} — Sovereign Engine OS`;
    window.scrollTo(0, 0);
  }, [title, lang]);

  return (
    <div style={{
      maxWidth: 760,
      margin: "0 auto",
      padding: "48px 24px 96px",
      color: "#e2e8f0",
      fontFamily: "inherit",
      lineHeight: 1.7,
    }}>
      {/* Dil seçici — sadece ToS için */}
      {isTerms && (
        <div style={{
          display: "flex", gap: 6, marginBottom: 32,
          justifyContent: "flex-end",
        }}>
          {LANGS.map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: lang === l ? "1px solid #7C3AED" : "1px solid #2A2A2A",
                background: lang === l ? "#7C3AED22" : "transparent",
                color: lang === l ? "#9061F9" : "#555550",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: lang === l ? 700 : 400,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      )}

      <pre style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "inherit",
        fontSize: 15,
        margin: 0,
      }}>
        {text}
      </pre>
    </div>
  );
}
