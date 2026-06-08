// useChatActions.js
// Amaç:    Chat ve karar mesajlarının gönderilmesi + engine log yönetimi
// Bağlı:   /api/ai/chat, /api/ai/apply, /api/decisions rotaları
// Karar:   Karar #45 (sistem prompt engine'e taşındı), Session 22 refactor, TB-6 Session 37
// Dokunma: apiCall davranışı değişirse sendChatMessage + sendDecisionMessage güncellenmeli

import { useState } from "react";
import { apiCall }  from "../../lib/apiClient";

// ── Yardımcı: risk seviyesi → string ────────────────────────────
const riskLevel = (risk) =>
  risk <= 3 ? "LOW" : risk <= 7 ? "MEDIUM" : "HIGH";

// ── logToEngine: engine offline olsa bile sessizce geçer ─────────
// Edge: engine offline → catch sessiz, ana akış durmuyor
// Edge: payload boş → slice(0) güvenli, sıfır karakter döner
// Edge: verdict null → riskLevel ile otomatik türetilir
const logToEngine = async (userMsg, assistantMsg, riskScore, verdict, policy) => {
  try {
    await apiCall("/api/decisions", {
      method: "POST",
      body: JSON.stringify({
        action:      userMsg.slice(0, 80),
        policy:      policy ?? "chat-interface",
        verdict:     verdict ?? (riskScore <= 3 ? "PERMIT" : riskScore <= 7 ? "ASK_HUMAN" : "DENY"),
        criticality: riskLevel(riskScore),
        reason:      assistantMsg.slice(0, 200),
        // TODO: PROD — Math.random() production'da sahte veri üretir; gerçek latency ölçümü ekle
        latency:     Math.round(Math.random() * 400 + 100),
      }),
    });
  } catch { /* engine offline — continue */ }
};

// ── applyDecision: /api/ai/apply çağrısı — verdict + policy döner ─
// Edge: endpoint erişilemez → throw, çağıran catch'e düşer
// Edge: matched:false → verdict null döner, engineLog temizlenir
// TB-6: projectId context'e eklendi — session_id yerine project_id kullanılıyor
const applyDecision = async ({ text, risk, userId, projectId, initialVerdict, initialPolicy }) => {
  const applyData = await apiCall("/api/ai/apply", {
    method: "POST",
    body: JSON.stringify({
      decision: {
        category: "GENERAL",
        payload: {
          action_name: text.slice(0, 80),
          params: { message: text },
        },
        context: {
          risk_level:  riskLevel(risk),
          session_id:  userId,
          project_id:  projectId ?? null,
        },
      },
    }),
  });

  if (!applyData.matched) {
    return { verdict: null, policy: initialPolicy, softSteer: null, engineLog: null };
  }

  const verdict   = applyData.verdict ?? (applyData.success ? "PERMIT" : "DENY");
  const policy    = applyData.policy  ?? initialPolicy;
  const softSteer = applyData.soft_steer ?? null;
  return { verdict, policy, softSteer, engineLog: { risk, status: verdict, policy } };
};

// ── sendChatMessage: sohbet modu — sadece reply + risk ───────────
// Edge: /api/ai/chat timeout → catch yakalanır, loading false'a döner
// Edge: reply boş → "" ile mesaj eklenir, UI boş balon gösterir
// TB-6: projectId payload'a eklendi
const sendChatMessage = async ({ text, messages, projectId, setMessages, setLoading }) => {
  const history = messages.filter(m => m.role !== "system");
  setMessages(prev => [...prev, { role: "user", content: text, isDecision: false }]);
  setLoading(true);

  try {
    const data  = await apiCall("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ],
        max_tokens:  1024,
        project_id:  projectId ?? null,
      }),
    });
    const reply = data.reply ?? "";
    const risk  = data.risk  ?? 1;
    setMessages(prev => [...prev, { role: "assistant", content: reply, risk }]);
  } catch (err) {
    setMessages(prev => [...prev, { role: "assistant", content: `Hata: ${err.message}` }]);
  } finally {
    setLoading(false);
  }
};

// ── sendDecisionMessage: karar modu — apply + engineLog ──────────
// Edge: /api/ai/chat başarısız → catch, loading false, hata balonu
// Edge: /api/ai/apply erişilemez → logToEngine fallback devreye girer
// Edge: verdict DENY → softSteer VerdictBanner'a iletilir
// TB-6: projectId payload'a eklendi
const sendDecisionMessage = async ({
  text, messages, userId, projectId,
  setMessages, setLoading, setEngineLog,
}) => {
  const history = messages.filter(m => m.role !== "system");
  setMessages(prev => [...prev, { role: "user", content: text, isDecision: true }]);
  setLoading(true);
  setEngineLog(null);

  try {
    const data = await apiCall("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ],
        max_tokens:  1024,
        project_id:  projectId ?? null,
      }),
    });

    const reply          = data.reply       ?? "";
    const risk           = data.risk        ?? 1;
    const initialVerdict = data.verdict     ?? null;
    const initialPolicy  = data.policy      ?? "chat-interface";
    const initialSteer   = data.soft_steer  ?? null;

    let verdict   = initialVerdict;
    let policy    = initialPolicy;
    let softSteer = initialSteer;
    let engineLog = null;

    try {
      const result = await applyDecision({ text, risk, userId, projectId, initialVerdict, initialPolicy });
      verdict   = result.verdict;
      policy    = result.policy;
      softSteer = result.softSteer;
      engineLog = result.engineLog;
    } catch {
      // /api/ai/apply erişilemez — logToEngine fallback
      await logToEngine(text, reply, risk, initialVerdict, initialPolicy);
      engineLog = initialVerdict ? { risk, status: initialVerdict, policy: initialPolicy } : null;
    }

    setEngineLog(engineLog);
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: reply, risk, verdict, softSteer },
    ]);
  } catch (err) {
    setMessages(prev => [...prev, { role: "assistant", content: `Hata: ${err.message}` }]);
  } finally {
    setLoading(false);
  }
};

// ── Ana hook ─────────────────────────────────────────────────────
// TB-6: projectId parametresi eklendi — ChatScreen localStorage'dan okuyup geçirir
export function useChatActions({ messages, setMessages, userId, projectId }) {
  const [loading,   setLoading]   = useState(false);
  const [engineLog, setEngineLog] = useState(null);

  // Edge: loading true iken tekrar gönderim → early return ile engellenir
  const sendMessage = async (text, isDecision) => {
    if (!text.trim() || loading) return;

    if (!isDecision) {
      await sendChatMessage({ text, messages, projectId, setMessages, setLoading });
    } else {
      await sendDecisionMessage({
        text, messages, userId, projectId,
        setMessages, setLoading, setEngineLog,
      });
    }
  };

  return { loading, engineLog, sendMessage };
}
