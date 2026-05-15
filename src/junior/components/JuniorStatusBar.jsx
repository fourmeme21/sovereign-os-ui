import { useJuniorStore } from "../stores/juniorStore";

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
    </div>
  );
}
