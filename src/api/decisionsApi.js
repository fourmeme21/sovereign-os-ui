const ENGINE_URL = "https://sovereign-engine-production-2e21.up.railway.app";

// ── Criticality → riskScore ──────────────────────────────
function criticalityToRisk(criticality) {
  switch (criticality) {
    case "CRITICAL": return Math.floor(Math.random() * 2) + 8; // 8–10
    case "HIGH":     return Math.floor(Math.random() * 2) + 6; // 6–7
    case "MEDIUM":   return Math.floor(Math.random() * 2) + 4; // 4–5
    case "LOW":      return Math.floor(Math.random() * 3) + 1; // 1–3
    default:         return 5;
  }
}

// ── Verdict → status ─────────────────────────────────────
function verdictToStatus(verdict) {
  switch (verdict) {
    case "ASK_HUMAN": return "PENDING_HUMAN";
    case "PERMIT":    return "AUTO_APPROVED";
    case "DENY":      return "REJECTED";
    default:          return "PENDING_HUMAN";
  }
}

// ── Confidence: verdict + criticality'ye göre ────────────
function deriveConfidence(verdict, criticality) {
  if (verdict === "PERMIT" && criticality === "LOW")      return 0.92;
  if (verdict === "PERMIT")                               return 0.80;
  if (verdict === "DENY")                                 return 0.70;
  if (criticality === "CRITICAL")                         return 0.45;
  return 0.62;
}

// ── Engine kararını UI formatına map et ──────────────────
export function mapDecision(d) {
  const riskScore = criticalityToRisk(d.criticality);
  return {
    id:           d.id,
    status:       verdictToStatus(d.verdict),
    riskScore,
    affectedArea: `${d.action} · ${d.policy}`,
    reason:       d.reason,
    traceId:      d.id,
    ago:          d.time,
    latency:      d.latency,
    confidence:   deriveConfidence(d.verdict, d.criticality),
    factors:      null, // WhyPanel engine entegrasyonu sonra
    _raw:         d,    // orijinal engine objesi sakla
  };
}

// ── GET /api/decisions ───────────────────────────────────
export async function fetchDecisions() {
  const res = await fetch(`${ENGINE_URL}/api/decisions`);
  if (!res.ok) throw new Error(`Engine error: ${res.status}`);
  const data = await res.json();
  return data.map(mapDecision);
}

// ── POST /api/decisions/:id/respond ─────────────────────
// Engine endpoint hazır olunca aktif olur — şimdilik log atar
export async function respondDecision(id, action) {
  try {
    const res = await fetch(`${ENGINE_URL}/api/decisions/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error(`Respond error: ${res.status}`);
    return await res.json();
  } catch (err) {
    // Endpoint henüz yoksa local state'i güncellemeye devam et
    console.warn("respond endpoint:", err.message);
    return null;
  }
}
