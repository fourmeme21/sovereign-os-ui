import { useNavigate } from "react-router-dom";
import { useJuniorStore } from "../stores/juniorStore";
import { useAuthStore } from "../../stores/authStore";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

const TIER_COLOR = {
  free: "#555",
  solo: "#2DD4BF",
  pro:  "#818CF8",
  team: "#F59E0B",
};

const TIER_LABEL = {
  free: "FREE",
  solo: "SOLO",
  pro:  "PRO",
  team: "TEAM",
};

export default function JuniorStatusBar() {
  const navigate = useNavigate();

  const pendingCount = useJuniorStore(
    (s) => s.decisions.filter((d) => d.status === "PENDING_HUMAN").length
  );

  const { tier } = useAuthStore();

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

      {/* Tier badge → Ayarlar */}
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
        title="Ayarlar & Plan"
      >
        {TIER_LABEL[tier]} ⚙️
      </span>
    </div>
  );
}
