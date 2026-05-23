// src/screens/SettingsScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { T, getRiskColor } from "../tokens";
import { useAuthStore } from "../stores/authStore";
import { apiCall } from "../lib/apiClient";
import { LanguageSelector } from "../i18n/LanguageSelector";

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_COLOR = {
  free: "#555",
  solo: "#2DD4BF",
  pro:  "#818CF8",
  team: "#F59E0B",
};

const TIER_LIMIT = {
  free: 50,
  solo: null,
  pro:  null,
  team: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsScreen({ onClear }) {
  const navigate = useNavigate();
  const { t }           = useTranslation("settings");
  const { t: tCommon }  = useTranslation("common");
  const { t: tPricing } = useTranslation("pricing");

  const { tier, decisionCount, user } = useAuthStore();
  const userEmail = user?.email ?? "";

  const [threshold,     setThreshold]     = useState(7);
  const [cleared,       setCleared]       = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError,   setPortalError]   = useState(null);

  const handleClear = () => {
    onClear();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const handlePortal = async () => {
    setPortalError(null);
    setPortalLoading(true);
    try {
      const data = await apiCall(
        `/api/billing/portal?email=${encodeURIComponent(userEmail)}`,
        { method: "GET" }
      );
      window.location.href = data.portalUrl;
    } catch {
      setPortalError(tPricing("portal_error"));
    } finally {
      setPortalLoading(false);
    }
  };

  const limit      = TIER_LIMIT[tier];
  const usagePct   = limit ? Math.min((decisionCount / limit) * 100, 100) : 0;
  const usageColor = usagePct > 80 ? "#EF4444" : usagePct > 60 ? "#F59E0B" : "#2DD4BF";

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
        color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace",
        marginBottom: 14,
      }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ animation: "fade-in .25s ease" }}>

      {/* ── Abonelik ── */}
      <Section title={t("sections.subscription")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
            fontFamily: "'JetBrains Mono',monospace",
            color: TIER_COLOR[tier],
            background: `${TIER_COLOR[tier]}18`,
            border: `1px solid ${TIER_COLOR[tier]}44`,
            borderRadius: 20, padding: "3px 10px",
          }}>
            {tCommon(`tier.${tier}`)}
          </span>
          {tier === "free" && (
            <span style={{ fontSize: 11, color: T.textTertiary }}>
              {t("free_plan")}
            </span>
          )}
        </div>

        {tier === "free" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace" }}>
                {tCommon("status.usage", { used: decisionCount, limit })}
              </span>
              {usagePct > 80 && (
                <span style={{ fontSize: 11, color: "#EF4444" }}>
                  {t("usage_full", { pct: Math.round(usagePct) })}
                </span>
              )}
            </div>
            <div style={{ height: 3, background: T.border, borderRadius: 2 }}>
              <div style={{
                width: `${usagePct}%`, height: "100%",
                background: usageColor, borderRadius: 2,
                transition: "width .3s ease",
              }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tier === "free" ? (
            <button
              onClick={() => navigate("/junior/fiyatlandirma")}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: "#2DD4BF", color: "#0D0D0D",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: ".04em",
              }}
            >
              {tCommon("actions.upgrade")}
            </button>
          ) : (
            <>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                style={{
                  padding: "8px 18px", borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: portalLoading ? T.textTertiary : T.textPrimary,
                  fontSize: 12, fontWeight: 600,
                  cursor: portalLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", letterSpacing: ".04em",
                  opacity: portalLoading ? 0.6 : 1,
                  transition: "opacity .2s",
                }}
              >
                {portalLoading ? t("opening") : t("manage_portal")}
              </button>
              <button
                onClick={() => navigate("/junior/fiyatlandirma")}
                style={{
                  padding: "8px 18px", borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: "transparent", color: T.textTertiary,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: ".04em",
                }}
              >
                {tPricing("view_plans")}
              </button>
            </>
          )}
        </div>

        {portalError && (
          <p style={{ fontSize: 11, color: "#EF4444", margin: "10px 0 0" }}>
            {portalError}
          </p>
        )}
      </Section>

      {/* ── Dil ── */}
      <Section title={t("sections.language")}>
        <LanguageSelector />
      </Section>

      {/* ── Risk eşiği ── */}
      <Section title={t("sections.risk")}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <input
            type="range" min={1} max={10} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ flex: 1, accentColor: T.accent, cursor: "pointer" }}
          />
          <span style={{
            fontSize: 20, fontWeight: 800, color: getRiskColor(threshold),
            fontFamily: "'Inter',sans-serif", minWidth: 32, textAlign: "right",
          }}>
            {threshold}
          </span>
        </div>
        <p style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.6, margin: 0 }}>
          {t("risk_note")}
        </p>
      </Section>

      {/* ── Veri temizle ── */}
      <Section title={t("sections.clear")}>
        <p style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.6, marginBottom: 12 }}>
          {t("clear_note")}
        </p>
        <button onClick={handleClear} style={{
          padding: "8px 18px", borderRadius: 8,
          border: `1px solid ${cleared ? T.success : T.danger}`,
          background: cleared ? `${T.success}14` : "transparent",
          color: cleared ? T.success : T.danger,
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit", transition: "all .2s",
        }}>
          {cleared ? t("cleared") : `⚠ ${t("clear_btn")}`}
        </button>
      </Section>

      {/* ── Versiyon ── */}
      <div style={{
        fontSize: 10, color: T.textTertiary,
        fontFamily: "'JetBrains Mono',monospace",
        paddingTop: 16, borderTop: `1px solid ${T.borderSubtle}`,
      }}>
        {t("version_label")} · sovereign.os v0.1.0-alpha
      </div>
    </div>
  );
}
