// src/junior/components/DecisionCard.jsx
import { useState } from "react";
import { useJuniorStore } from "../../stores/juniorStore";
import { useGithubBridge } from "../hooks/useGithubBridge";
import { sendDecisionResponse } from "../api/decisionApi";
import RiskDetail from "./RiskDetail";
import { timeAgo } from "../utils/timeAgo";

export default function DecisionCard({ decision }) {
  const [showDetail, setShowDetail] = useState(false);
  const [commitStatus, setCommitStatus] = useState(null); // null | "loading" | "done" | "error"

  const approve = useJuniorStore((s) => s.approveDecision);
  const reject  = useJuniorStore((s) => s.rejectDecision);
  const { commitFile } = useGithubBridge();

  const isPending = decision.status === "PENDING_HUMAN";
  const cardClass = isPending ? "card-yellow" : "card-red";

  const handleApprove = async () => {
    // 1. Store + Engine'e bildir
    approve(decision.id);
    await sendDecisionResponse(decision.id, "approve");

    // 2. GitHub'a commit at (filePath varsa)
    if (decision.filePath && decision.fileContent) {
      setCommitStatus("loading");
      try {
        await commitFile({
          path:    decision.filePath,
          content: decision.fileContent,
          message: `sovereign: ${decision.filePath} onaylandı`,
        });
        setCommitStatus("done");
      } catch (err) {
        console.error("Commit hatası:", err.message);
        setCommitStatus("error");
      }
    }
  };

  const handleReject = async () => {
    reject(decision.id);
    await sendDecisionResponse(decision.id, "reject");
  };

  return (
    <div className={`decision-card ${cardClass}`}>
      {/* Başlık */}
      <div className="card-header">
        <span className="card-status">
          {isPending ? "🟡 Onayın lazım" : "🔴 Durduruldu"}
        </span>
        <span className="card-score">Risk: {decision.riskScore}/10</span>
      </div>

      {/* İçerik */}
      <div className="card-body">
        <p className="card-area">{decision.affectedArea}</p>
        <p className="card-label">{decision.humanLabel}</p>

        {/* Dosya yolu (varsa) */}
        {decision.filePath && (
          <p className="card-filepath">📄 {decision.filePath}</p>
        )}
      </div>

      {/* Commit durumu */}
      {commitStatus === "loading" && (
        <div className="commit-status loading">⏳ GitHub'a yazılıyor...</div>
      )}
      {commitStatus === "done" && (
        <div className="commit-status done">✅ GitHub'a yazıldı</div>
      )}
      {commitStatus === "error" && (
        <div className="commit-status error">⚠️ Commit başarısız — manuel push gerekebilir</div>
      )}

      {/* Aksiyonlar */}
      <div className="card-actions">
        {isPending && (
          <>
            <button
              className="btn-approve"
              onClick={handleApprove}
              disabled={commitStatus === "loading"}
            >
              ✅ Onayla
            </button>
            <button className="btn-reject" onClick={handleReject}>
              ❌ Reddet
            </button>
          </>
        )}
        <button
          className="btn-why"
          onClick={() => setShowDetail(!showDetail)}
        >
          {showDetail ? "▲ Kapat" : "? Neden bu skor"}
        </button>
      </div>

      {/* Risk detayı */}
      {showDetail && (
        <div className="card-detail">
          <RiskDetail decision={decision} />
        </div>
      )}

      <div className="card-time">{timeAgo(decision.timestamp)}</div>
    </div>
  );
}
