import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { privacyPolicy } from "../legal/privacyPolicy";
import { termsOfService } from "../legal/termsOfService";

type LegalType = "privacy" | "terms";

const CONTENT: Record<LegalType, { title: string; text: string }> = {
  privacy: { title: "Privacy Policy", text: privacyPolicy },
  terms:   { title: "Terms of Service", text: termsOfService },
};

export default function LegalScreen() {
  const { type } = useParams<{ type: string }>();

  if (type !== "privacy" && type !== "terms") {
    return <Navigate to="/" replace />;
  }

  const { title, text } = CONTENT[type as LegalType];

  useEffect(() => {
    document.title = `${title} — Sovereign Engine OS`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div style={{
      maxWidth: 760,
      margin: "0 auto",
      padding: "48px 24px 96px",
      color: "#e2e8f0",
      fontFamily: "inherit",
      lineHeight: 1.7,
    }}>
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
