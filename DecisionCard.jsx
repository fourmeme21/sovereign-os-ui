import { useState } from "react";
import { useJuniorStore } from "../stores/juniorStore";
import { sendDecisionResponse } from "../api/decisionApi";
import { timeAgo } from "../utils/timeAgo";
import RiskDetail from "./RiskDetail";

export default function DecisionCard({ decision }) {
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  const approve = useJuniorStore((s) => s.approveDecision);
  const reject = useJuniorStore((s) => s.rejectDecision);

  const isPending = decision.status === "PENDING_HUMAN";
  const isApproved = decision.status === "APPROVED";
  const isRejected = decision.status === "REJECTED";

  const cardClass = decision.riskScore >= 7 ? "card-red" : "card-yellow";

  const handleApprove = async () => {
    setLoading(true);
    try {
      approve(decision.id);
      await sendDecisionResponse(decision.id, "approve");
    } catch {
      // sessizce geç, store zaten güncellendi
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      reject(decision.id);
      await sendDecisionResponse(decision.id, "reject");
    } catch {
      // sessizce geç
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`decision-card ${cardClass} ${isApproved ? "card-done" : ""} ${isRejected ? "card-rejected" : ""}`}>
      {/* Başlık */}
      <div className="card-header">
        <span className="card-status">
          {isApproved
            ? "✅ Onaylandı"
            : isRejected
            ? "❌ Reddedildi"
            : decision.riskScore >= 7
            ? "🔴 Durduruldu"
            : "🟡 Onayın lazım"}
        </span>
        <span className="card-score">Risk: {decision.riskScore}/10</span>
      </div>

      {/* Açıklama */}
      <div className="card-body">
        {decision.affectedArea && (
          <p className="card-area">{decision.affectedArea}</p>
        )}
        <p className="card-label">{decision.humanLabel}</p>
      </div>

      {/* Aksiyon butonları */}
      {isPending && (
        <div className="card-actions">
          {decision.riskScore < 7 && (
            <button
              className="btn-approve"
              onClick={handleApprove}
              disabled={loading}
            >
              ✅ Onayla
            </button>
          )}
          <button
            className="btn-reject"
            onClick={handleReject}
            disabled={loading}
          >
            ❌ Reddet
          </button>
          <button
            className="btn-why"
            onClick={() => setShowDetail(!showDetail)}
          >
            {showDetail ? "▲ Kapat" : "? Neden bu skor"}
          </button>
        </div>
      )}

      {/* Onaylandı/Reddedildi durumunda sadece Neden butonu */}
      {!isPending && (
        <div className="card-actions">
          <button
            className="btn-why"
            onClick={() => setShowDetail(!showDetail)}
          >
            {showDetail ? "▲ Kapat" : "? Neden bu skor"}
          </button>
        </div>
      )}

      {/* Risk detayı */}
      {showDetail && (
        <div className="card-detail">
          <RiskDetail decision={decision} />
        </div>
      )}

      {/* Zaman */}
      <div className="card-time">{timeAgo(decision.timestamp)}</div>
    </div>
  );
}
