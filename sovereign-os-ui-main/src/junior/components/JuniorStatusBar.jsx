// src/junior/components/JuniorStatusBar.jsx
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useJuniorStore } from "../stores/juniorStore";
import { useAuthStore } from "../../stores/authStore";

const TIER_COLOR = {
  free: "#555",
  solo: "#2DD4BF",
  pro:  "#818CF8",
  team: "#F59E0B",
};

export default function JuniorStatusBar() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const pendingCount = useJuniorStore(
    (s) => s.decisions.filter((d) => d.status === "PENDING_HUMAN").length
  );

  const { tier } = useAuthStore();

  return (
    <div className="junior-status-bar">
      <span className="status-item">{t("status.engine_active")}</span>
      <span className="status-item">{t("status.memory_ok")}</span>
      <span className="status-item">{t("status.github")}</span>

      {pendingCount > 0 && (
        <span className="status-item status-pending">
          🟡 {t("status.pending", { count: pendingCount })}
        </span>
      )}

      <span
        className="status-item"
        onClick={() => navigate("/junior/ayarlar")}
        style={{
          color: TIER_COLOR[tier],
          cursor: "pointer",
          fontWeight: 700,
          letterSpacing: ".1em",
          borderLeft: "1px solid #252525",
          paddingLeft: 10,
          marginLeft: 4,
        }}
        title={t("nav.settings")}
      >
        {t(`tier.${tier}`)} ⚙️
      </span>
    </div>
  );
}
