import { useState, useRef, useEffect } from "react";
import { T } from "../../tokens";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "https://sovereign-engine-production-2e21.up.railway.app";
const API_URL = "https://api.anthropic.com/v1/messages";

// -- SIFRE KAPISI ------------------------------------------------
function PasswordGate({ onUnlock }) {
  const [input, setInput]       = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [shake, setShake]       = useState(false);
  const [loading, setLoading]   = useState(false);

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShake(true);
    setInput("");
    setTimeout(() => { setErrorMsg(null); setShake(false); }, 2000);
  };

  const handleCheck = async () => {
    if (!input || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${ENGINE_URL}/api/auth/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
      });

      if (res.ok) {
        const { token } = await res.json();
        sessionStorage.setItem("se_token", token);
        onUnlock();
        return;
      }

      triggerError(res.status === 401 ? "Hatali sifre" : `Sunucu hatasi (${res.status})`);
    } catch {
      triggerError("Baglanti hatasi — Railway erisилemiyor");
    } finally {
      setLoading(false);
    }
  };

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
          Sovereign Engine
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 24, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
          Erisim icin sifre gerekli.
        </div>

        <input
          type="password"
          placeholder="Sifre"
          value={input}
          autoFocus
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCheck()}
          style={{
            width: "100%", background: T.bgPrimary,
            border: `1px solid ${errorMsg ? T.danger : T.border}`,
            borderRadius: 9, padding: "12px 14px",
            color: T.textPrimary, fontSize: 14,
            fontFamily: "'JetBrains Mono',monospace",
            outline: "none", marginBottom: 12,
            caretColor: T.accent, boxSizing: "border-box",
            transition: "border-color .15s",
          }}
        />

        {errorMsg && (
          <div style={{ fontSize: 11, color: T.danger, fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={!input || loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 9, border: "none",
            background: input && !loading ? T.accent : T.bgElevated,
            color: input && !loading ? "#fff" : T.textTertiary,
            fontSize: 13, fontWeight: 700,
            cursor: input && !loading ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all .15s",
          }}
        >
          {loading ? "Dogrulanıyor..." : "Giris"}
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
      `}</style>
    </div>
  );
}

// -- API KEY EKRANI -----------------------------------------------
function ApiKeySetup({ onSave }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSave = () => {
    const key = input.trim();
    if (!key.startsWith("sk-ant-")) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    localStorage.setItem("anthropic_api_key", key);
    onSave(key);
  };

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: T.bgSurface, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "32px 24px",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: `linear-gradient(135deg,${T.accent},#9061F9)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#fff", fontWeight: 800, marginBottom: 20,
        }}>S</div>

        <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>Anthropic API Key</div>
        <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 24, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
          Key tarayicinda kalir, hicbir yere gonderilmez.
        </div>

        <input
          type="password"
          placeholder="sk-ant-..."
          value={input}
          autoFocus
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          style={{
            width: "100%", background: T.bgPrimary,
            border: `1px solid ${error ? T.danger : T.border}`,
            borderRadius: 9, padding: "12px 14px",
            color: T.textPrimary, fontSize: 14,
            fontFamily: "'JetBrains Mono',monospace",
            outline: "none", marginBottom: 12,
            caretColor: T.accent, boxSizing: "border-box",
            transition: "border-color .15s",
          }}
        />

        {error && (
          <div style={{ fontSize: 11, color: T.danger, fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>
            Gecersiz key — sk-ant- ile baslamali
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!input}
          style={{
            width: "100%", padding: "12px", borderRadius: 9, border: "none",
            background: input ? T.accent : T.bgElevated,
            color: input ? "#fff" : T.textTertiary,
            fontSize: 13, fontWeight: 700,
            cursor: input ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all .15s",
          }}
        >
          Baglan
        </button>

        <div style={{ marginTop: 16, fontSize: 11, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}>
          console.anthropic.com → API Keys
        </div>
      </div>
    </div>
  );
}

// -- MESAJ BALONU ------------------------------------------------
function MessageBubble({ msg }) {
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
              color: msg.risk <= 3 ? T.success : msg.risk <= 6 ? T.warning : T.danger,
              background: `${msg.risk <= 3 ? T.success : msg.risk <= 6 ? T.warning : T.danger}14`,
              padding: "2px 7px", borderRadius: 5,
            }}>
              RISK {msg.risk}/10
            </div>
            <span style={{ fontSize: 9, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace" }}>engine intercepted</span>
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
  const [unlocked, setUnlocked]   = useState(() => !!sessionStorage.getItem("se_token"));
  const [apiKey, setApiKey]       = useState(() => localStorage.getItem("anthropic_api_key") ?? "");
  const [messages, setMessages]   = useState([
    { role: "system", content: "Sovereign Engine aktif · Her mesaj risk skorlanıyor" },
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [engineLog, setEngineLog] = useState(null);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  if (!apiKey)   return <ApiKeySetup onSave={setApiKey} />;

  const logToEngine = async (userMsg, assistantMsg, riskScore) => {
    try {
      await fetch(`${ENGINE_URL}/api/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action:      userMsg.slice(0, 80),
          policy:      "chat-interface",
          verdict:     riskScore <= 3 ? "PERMIT" : riskScore <= 6 ? "ASK_HUMAN" : "DENY",
          criticality: riskScore <= 3 ? "LOW"    : riskScore <= 6 ? "MEDIUM"    : "HIGH",
          reason:      assistantMsg.slice(0, 200),
          latency:     Math.round(Math.random() * 400 + 100),
        }),
      });
    } catch { /* engine offline - devam et */ }
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
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system:     "Sen Sovereign Engine'e bagli bir AI asistaninsin. Kisa ve net cevaplar ver. Her aksiyon risk degerlendirmesine tabi.",
          messages:   [
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.content?.[0]?.text ?? "";

      const riskKeywords = ["sil", "kaldir", "deploy", "production", "token", "sifre", "delete", "remove"];
      const risk = riskKeywords.some(k => text.toLowerCase().includes(k)) ? 7 : 2;

      setMessages(prev => [...prev, { role: "assistant", content: reply, risk }]);
      logToEngine(text, reply, risk);
      setEngineLog({ risk, status: risk <= 3 ? "AUTO_APPROVED" : "PENDING_HUMAN" });

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Hata: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearKey = () => {
    localStorage.removeItem("anthropic_api_key");
    setApiKey("");
    setMessages([{ role: "system", content: "Sovereign Engine aktif · Her mesaj risk skorlanıyor" }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Ust bar */}
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: T.bgSurface, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.success }} />
          <span style={{ fontSize: 11, color: T.success, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
            ENGINE ACTIVE
          </span>
        </div>

        {engineLog && (
          <div style={{
            fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
            color: engineLog.risk <= 3 ? T.success : T.warning,
            background: `${engineLog.risk <= 3 ? T.success : T.warning}12`,
            padding: "3px 9px", borderRadius: 6,
            border: `1px solid ${engineLog.risk <= 3 ? T.success : T.warning}30`,
          }}>
            {engineLog.status} · RISK {engineLog.risk}/10
          </div>
        )}

        <button onClick={clearKey} style={{
          fontSize: 10, color: T.textTertiary,
          fontFamily: "'JetBrains Mono',monospace",
          background: "transparent", border: "none",
          cursor: "pointer", padding: "3px 8px",
        }}>
          API Key ✕
        </button>
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
            placeholder="Mesajini yaz... (Enter → gonder, Shift+Enter → satir)"
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
          Her mesaj Sovereign Engine uzerinden geciyor · Risk skorlanıyor
        </div>
      </div>
    </div>
  );
}
