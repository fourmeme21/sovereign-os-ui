const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

export async function sendDecisionResponse(decisionId, action) {
  const res = await fetch(`${ENGINE_URL}/api/decisions/${decisionId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    throw new Error(`Karar gönderilemedi: ${res.status}`);
  }

  return res.json();
}
