import { useJuniorStore } from "../stores/juniorStore";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

export default function JuniorStatusBar() {
  const pendingCount = useJuniorStore(
    (s) => s.decisions.filter((d) => d.status === "PENDING_HUMAN").length
  );

  return (
    <div className="junior-status-bar">
      <span className="status-item">Engine: 🟢 AKTİF</span>
      <span className="status-item">Hafıza: ✓</span>
      <span className="status-item">GitHub: main</span>
      {pendingCount > 0 && (
        <span className="status-item status-pending">
          🟡 {pendingCount} bekliyor
        </span>
      )}
      {/* DEBUG — URL doğrulama, sonra kaldır */}
      <span className="status-item" style={{ fontSize: 9, opacity: 0.5 }}>
        {ENGINE_URL ?? "⚠️ URL YOK"}
      </span>
    </div>
  );
}
