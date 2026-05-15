// Engine offline banner
export function EngineOfflineBar() {
  return (
    <div className="error-bar engine-offline">
      ⚠️ Engine bağlantısı yok. Railway kontrol edilsin.
    </div>
  );
}

// Hafıza boş
export function EmptyMemoryState() {
  return (
    <div className="empty-state">
      <span className="empty-icon">🧠</span>
      <p>Henüz hiç doküman eklenmedi.</p>
      <p className="empty-sub">PRD, schema veya API dokümanı ekleyerek başla.</p>
    </div>
  );
}

// WebSocket koptu
export function WSDisconnectedBadge() {
  return (
    <div className="ws-badge error">
      🔴 Gerçek zamanlı bağlantı yok
    </div>
  );
}

// Karar akışı boş
export function EmptyDecisionState() {
  return (
    <div className="empty-state">
      <span className="empty-icon">✨</span>
      <p>Bekleyen karar yok.</p>
      <p className="empty-sub">Prompt yaz, AI kodu üretsin.</p>
    </div>
  );
}
