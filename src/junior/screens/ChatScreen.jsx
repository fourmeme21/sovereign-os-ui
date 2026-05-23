// src/junior/screens/Chat.jsx
// Phase B.2 — aiProxy refactor
// Phase B.3 — Gerçek risk skoru entegrasyonu
// i18n — Faz 3 güncelleme

import { apiCall }  from "../../lib/apiClient";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { T } from "../../tokens";
import { useAuth } from "../hooks/useAuth";

// -- LOGIN EKRANI ------------------------------------------------
function LoginGate({ onLogin }) {
  const { t }        = useTranslation("chat");
  const { t: tErr }  = useTranslation("errors");

  const [email,     setEmail]     = useState("");
  const [errorMsg,  setErrorMsg]  = useState(null);
  const [shake,     setShake]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const { signInWithOtp } = useAuth();

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => { setErrorMsg(null); setShake(false); }, 2500);
  };

  const handleMagicLink = async () => {
    if (!email || loading) return;
    setLoading(true);
    try {
      await signInWithOtp(email);
      setMagicSent(true);
    } catch (err) {
      triggerError(err.message ?? t("login.error_fallback"));
    } finally {
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{
          width: "100%", maxWidth: 360,
          background: T.bgSurface, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "32px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 38, marginBottom: 16, lineHeight: 1 }}>✉️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>
            {t("login.check_email")}
          </div>
          <div style={{
            fontSize: 12, color: T.textSecondary,
            fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7,
          }}>
            {t("login.magic_sent_before")}
            <span style={{ color: T.accent }}>{email}</span>
            {t("login.magic_sent_after")}
          </div>
          <div style={{
            marginTop: 18, padding: "8px 12px",
            background: `${T.success}10`, border: `1px solid ${T.success}30`,
            borderRadius: 8,
            fontSize: 10, color: T.textTertiary,
            fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6,
          }}>
            {t("login.link_note")}
          </div>
          <button
            onClick={() => { setMagicSent(false); setEmail(""); }}
            style={{
              marginTop: 20, fontSize: 11, color: T.textTertiary,
              background: "transparent", border: "none",
              cursor: "pointer", fontFamily: "'JetBrains Mono',monospace",
              textDecoration: "underline",
            }}
          >
            {t("login.use_different")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: T.bgSurface, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "32px 24px",
        animation: shake ? "shake .4s ease" : "none",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: `linear-gradient(135deg,${T.accent},#9061F9)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#fff", fontWeight: 800, marginBottom: 20,
        }}>S</div>

        <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>
          {t("login.title")}
        </div>
        <div style={{
          fontSize: 12, color: T.textSecondary, marginBottom: 24,
          fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6,
        }}>
          {t("login.subtitle")}
        </div>

        <input
          type="email"
          placeholder={t("login.email_placeholder")}
          value={email}
          autoFocus
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleMagicLink()}
          style={{
            width: "100%", background: T.bgPrimary,
            border: `1px solid ${errorMsg ? T.danger : T.border}`, borderRadius: 9,
            padding: "12px 14px", color: T.textPrimary, fontSize: 14,
            fontFamily: "'JetBrains Mono',monospace", outline: "none",
            marginBottom: 12, caretColor: T.accent, boxSizing: "border-box",
            transition: "border-color .15s",
          }}
        />

        {errorMsg && (
          <div style={{
            fontSize: 11, color: T.danger,
            fontFamily: "'JetBrains Mono',monospace", marginBottom: 10,
          }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleMagicLink}
          disabled={!email || loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 9, border: "none",
            background: (email && !loading) ? T.accent : T.bgElevated,
            color: (email && !loading) ? "#fff" : T.textTertiary,
            fontSize: 13, fontWeight: 700,
            cursor: (email && !loading) ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all .15s",
          }}
        >
          {loading ? t("login.sending") : t("login.send_btn")}
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-8px);}
          40%{transform:translateX(8px);}
          60%{transform:translateX(-5px);}
          80%{transform:translateX(5px);}
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// -- MESAJ BALONU ------------------------------------------------
function MessageBubble({ msg }) {
  const { t }  = useTranslation("chat");
  const isUser   = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div style={{ textAlign: "center", padding: "6px 0" }}>
        <span style={{
          fontSize: 10, color: T.textTertiary,
          fontFamily: "'JetBrains Mono',monospace",
          background: T.bgElevated, padding: "3px 10px",
          borderRadius: 20, border: `1px solid ${T.border}`,
        }}>{msg.content}</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: `linear-gradient(135deg,${T.accent},#9061F9)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#fff", fontWeight: 800,
          marginRight: 8, marginTop: 2,
        }}>S</div>
      )}
      <div style={{
        maxWidth: "78%",
        background: isUser ? T.accent : T.bgElevated,
        border: `1px solid ${isUser ? "transparent" : T.border}`,
        borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        padding: "10px 14px",
      }}>
        <div style={{ fontSize: 14, color: T.textPrimary, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {msg.content}
        </div>
        {msg.risk && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
              color: msg.risk <= 3 ? T.success : msg.risk <= 7 ? T.warning : T.danger,
              background: `${msg.risk <= 3 ? T.success : msg.risk <= 7 ? T.warning : T.danger}14`,
              padding: "2px 7px", borderRadius: 5,
            }}>
              RISK {msg.risk}/10
            </div>
            <span style={{ fontSize: 9, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace" }}>
              {t("risk.intercepted")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// -- TYPING INDICATOR --------------------------------------------
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: `linear-gradient(135deg,${T.accent},#9061F9)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, color: "#fff", fontWeight: 800,
      }}>S</div>
      <div style={{
        background: T.bgElevated, border: `1px solid ${T.border}`,
        borderRadius: "14px 14px 14px 4px", padding: "12px 16px",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: T.accent,
            animation: `dot-bounce .85s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes dot-bounce{0%,100%{transform:scale(1);opacity:.35;}50%{transform:scale(1.6);opacity:1;}}`}</style>
    </div>
  );
}

// -- ANA CHAT EKRANI ---------------------------------------------
export default function ChatScreen() {
  const { t }  = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");

  const { user, loading: authLoading } = useAuth();
  const [messages,  setMessages]  = useState([
    { role: "system", content: t("system.active") },
  ]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [engineLog, setEngineLog] = useState(null);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (authLoading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>
        <div style={{
          width: 20, height: 20,
          border: `2px solid ${T.border}`,
          borderTopColor: T.accent,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px",
        }} />
        <span style={{ fontSize: 11, color: T.textTertiary }}>
          {tCommon("actions.connecting")}
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!user) return <LoginGate onLogin={() => {}} />;

  const logToEngine = async (userMsg, assistantMsg, riskScore, verdict, policy) => {
    try {
      await apiCall("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          action:      userMsg.slice(0, 80),
          policy:      policy ?? "chat-interface",
          verdict:     verdict ?? (riskScore <= 3 ? "PERMIT" : riskScore <= 7 ? "ASK_HUMAN" : "DENY"),
          criticality: riskScore <= 3 ? "LOW" : riskScore <= 7 ? "MEDIUM" : "HIGH",
          reason:      assistantMsg.slice(0, 200),
          latency:     Math.round(Math.random() * 400 + 100),
        }),
      });
    } catch { /* engine offline — continue */ }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.filter(m => m.role !== "system");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setEngineLog(null);

    try {
      const data = await apiCall("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          system: "You are an AI assistant connected to the Sovereign Engine. Give short and clear answers. Every action is subject to risk assessment.",
          messages: [
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          max_tokens: 1024,
        }),
      });

      const reply = data.reply ?? "";
      const risk  = data.risk ?? 1;

      setMessages(prev => [...prev, { role: "assistant", content: reply, risk }]);
      logToEngine(text, reply, risk, data.verdict, data.policy);
      setEngineLog({ risk, status: data.verdict, policy: data.policy });

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `${t("error_prefix")}${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Üst bar */}
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: T.bgSurface, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.success }} />
          <span style={{ fontSize: 11, color: T.success, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
            {t("header.engine_active")}
          </span>
        </div>

        {engineLog && (
          <div style={{
            fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
            color: engineLog.risk <= 3 ? T.success : engineLog.risk <= 7 ? T.warning : T.danger,
            background: `${engineLog.risk <= 3 ? T.success : engineLog.risk <= 7 ? T.warning : T.danger}12`,
            padding: "3px 9px", borderRadius: 6,
            border: `1px solid ${engineLog.risk <= 3 ? T.success : engineLog.risk <= 7 ? T.warning : T.danger}30`,
          }}>
            {engineLog.status} · RISK {engineLog.risk}/10 · {engineLog.policy}
          </div>
        )}

        <span style={{ fontSize: 10, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace" }}>
          {user.email}
        </span>
      </div>

      {/* Mesajlar */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column" }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, background: T.bgSurface, flexShrink: 0 }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: T.bgPrimary, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: "10px 14px",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("input.placeholder")}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: T.textPrimary, fontSize: 14, fontFamily: "inherit",
              outline: "none", resize: "none", lineHeight: 1.5,
              caretColor: T.accent, maxHeight: 120, overflowY: "auto",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 9, border: "none",
              background: input.trim() && !loading ? T.accent : T.bgElevated,
              color: input.trim() && !loading ? "#fff" : T.textTertiary,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: 16, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, transition: "all .15s",
            }}
          >↑</button>
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>
          {t("footer.note")}
        </div>
      </div>
    </div>
  );
}
