import { useJuniorStore } from "../stores/juniorStore";
import DecisionCard from "./DecisionCard";
import SilentSuccessDot from "./SilentSuccessDot";
import "./karar.css";

export default function KararAkisiPanel() {
  const decisions = useJuniorStore((s) => s.decisions);
  const autoApprovedCount = useJuniorStore((s) => s.autoApprovedCount);

  // Risk 0-3 ve AUTO_APPROVED olanları gizle
  const visibleDecisions = decisions.filter(
    (d) => !(d.status === "AUTO_APPROVED" && d.riskScore <= 3)
  );

  return (
    <div className="karar-panel">
      <div className="karar-panel-header">
        <span className="karar-panel-title">Karar Akışı</span>
        {autoApprovedCount > 0 && (
          <SilentSuccessDot count={autoApprovedCount} />
        )}
      </div>

      <div className="karar-list">
        {visibleDecisions.length === 0 ? (
          <div className="karar-empty">Henüz bekleyen karar yok.</div>
        ) : (
          visibleDecisions.map((d) => (
            <DecisionCard key={d.id} decision={d} />
          ))
        )}
      </div>
    </div>
  );
}
