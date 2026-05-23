// src/components/UsageBar.tsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore";

export function UsageBar() {
  const { tier, decisionCount } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  if (tier !== "free") return null;

  const limit = 50;
  const pct = Math.min((decisionCount / limit) * 100, 100);
  const isWarning = pct > 80;
  const barColor = pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#2DD4BF";

  return (
    <div style={{
      padding: "8px 16px",
      borderTop: "1px solid #1E1E1E",
      background: "#0F0F0F",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "#555550", fontFamily: "'JetBrains Mono',monospace" }}>
          {t("status.usage", { used: decisionCount, limit })}
        </span>
        {isWarning && (
          <span
            onClick={() => navigate("/junior/fiyatlandirma")}
            style={{ fontSize: 11, color: "#2DD4BF", cursor: "pointer", fontWeight: 600 }}
          >
            {t("actions.upgrade")}
          </span>
        )}
      </div>
      <div style={{ height: 3, background: "#1E1E1E", borderRadius: 2 }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: barColor,
          borderRadius: 2,
          transition: "width 0.3s ease",
        }} />
      </div>
    </div>
  );
}
