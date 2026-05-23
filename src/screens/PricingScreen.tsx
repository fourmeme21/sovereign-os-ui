// src/screens/PricingScreen.tsx
// Route: /junior/fiyatlandirma
// Phase D.5 — Dodo Payments entegrasyonu

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore";
import { apiCall } from "../lib/apiClient";

// ─── Plan Yapısı ──────────────────────────────────────────────────────────────

const PLANS = [
  { tier: "free",  priceNum: 0,   highlight: false, badgeKey: null      },
  { tier: "solo",  priceNum: 29,  highlight: true,  badgeKey: "popular" },
  { tier: "pro",   priceNum: 79,  highlight: false, badgeKey: null      },
  { tier: "team",  priceNum: 199, highlight: false, badgeKey: null      },
] as const;

type PlanTier = (typeof PLANS)[number]["tier"];

const TIER_ORDER: Record<string, number> = { free: 0, solo: 1, pro: 2, team: 3 };

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { tier: currentTier, user } = useAuthStore();
  const userEmail = user?.email ?? "";

  const { t }          = useTranslation("pricing");
  const { t: tErrors } = useTranslation("errors");

  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const quotaExceeded = searchParams.get("reason") === "quota_exceeded";

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async (tier: PlanTier) => {
    if (tier === "free") return;

    if (!userEmail) {
      navigate("/junior/baglan?redirect=/junior/fiyatlandirma");
      return;
    }

    setError(null);
    setLoadingTier(tier);

    try {
      const data = await apiCall("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ tier, userEmail }),
      });
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setError(e.message ?? tErrors("unknown"));
      setLoadingTier(null);
    }
  };

  // ── Portal ────────────────────────────────────────────────────────────────
  const handlePortal = async () => {
    try {
      const data = await apiCall(
        `/api/billing/portal?email=${encodeURIComponent(userEmail)}`,
        { method: "GET" }
      );
      window.location.href = data.portalUrl;
    } catch {
      setError(t("portal_error"));
    }
  };

  // ── Yardımcılar ───────────────────────────────────────────────────────────
  const isCurrentPlan = (tier: PlanTier) => currentTier === tier;

  const getCtaLabel = (plan: (typeof PLANS)[number]) => {
    if (isCurrentPlan(plan.tier)) return t("current_plan");
    if (plan.tier === "free" && TIER_ORDER[currentTier] > 0) return t("downgrade");
    return t(`plans.${plan.tier}.cta`);
  };

  const getCtaDisabled = (plan: (typeof PLANS)[number]) =>
    isCurrentPlan(plan.tier) || loadingTier === plan.tier;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={styles.root}>

      {/* ── Başlık ── */}
      <div style={styles.header}>
        {quotaExceeded && (
          <div style={styles.quotaBanner}>
            ⚡ {t("banner.quota_exceeded")}
          </div>
        )}
        <p style={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 style={styles.title}>
          {t("headline")} <span style={styles.titleAccent}>{t("headline_accent")}</span>
        </h1>
        <p style={styles.subtitle}>{t("subtitle")}</p>
      </div>

      {/* ── Hata ── */}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* ── Plan Kartları ── */}
      <div style={styles.grid}>
        {PLANS.map((plan) => {
          const isCurrent = isCurrentPlan(plan.tier);
          const features  = t(`plans.${plan.tier}.features`, { returnObjects: true }) as string[];

          return (
            <div
              key={plan.tier}
              style={{
                ...styles.card,
                ...(plan.highlight ? styles.cardHighlighted : {}),
                ...(isCurrent ? styles.cardCurrent : {}),
              }}
            >
              {/* Badge */}
              {plan.badgeKey && (
                <div style={styles.badge}>{t(`badge.${plan.badgeKey}`)}</div>
              )}
              {isCurrent && !plan.badgeKey && (
                <div style={{ ...styles.badge, ...styles.badgeCurrent }}>
                  {t("badge.active")}
                </div>
              )}

              {/* İsim & Fiyat */}
              <div style={styles.cardHeader}>
                <span style={styles.planName}>{t(`plans.${plan.tier}.name`)}</span>
                <div style={styles.priceRow}>
                  <span style={styles.price}>{t(`plans.${plan.tier}.price`)}</span>
                  {plan.priceNum > 0 && (
                    <span style={styles.priceUnit}>{t(`plans.${plan.tier}.period`)}</span>
                  )}
                </div>
              </div>

              {/* Özellikler */}
              <ul style={styles.featureList}>
                {features.map((f) => (
                  <li key={f} style={styles.featureItem}>
                    <CheckIcon color={plan.tier !== "free" ? "#2DD4BF" : "#555"} />
                    <span style={styles.featureText}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                style={{
                  ...styles.btn,
                  ...(plan.tier !== "free" && !isCurrent
                    ? styles.btnPrimary
                    : styles.btnSecondary),
                  ...(getCtaDisabled(plan) ? styles.btnDisabled : {}),
                }}
                disabled={getCtaDisabled(plan)}
                onClick={() => {
                  if (plan.tier === "free") navigate("/junior/ayarlar");
                  else handleCheckout(plan.tier);
                }}
              >
                {loadingTier === plan.tier ? <Spinner /> : getCtaLabel(plan)}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Portal Linki ── */}
      {currentTier !== "free" && (
        <div style={styles.portalRow}>
          <button style={styles.portalBtn} onClick={handlePortal}>
            {t("manage")}
          </button>
        </div>
      )}

      {/* ── Alt Not ── */}
      <p style={styles.footerNote}>
        {t("footer").split("\n").map((line, i) => (
          <span key={i}>{line}{i === 0 && <br />}</span>
        ))}
      </p>

    </div>
  );
}

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M2 7L5.5 10.5L12 3.5"
        stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return <span style={styles.spinner} />;
}

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#0D0D0D",
    color: "#E5E5E5",
    padding: "48px 24px 80px",
    fontFamily: "'DM Mono', 'JetBrains Mono', 'Fira Code', monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: 48,
    maxWidth: 560,
    width: "100%",
  },
  quotaBanner: {
    backgroundColor: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#EF4444",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 13,
    marginBottom: 24,
    letterSpacing: "0.02em",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "#555",
    margin: "0 0 12px",
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.15,
    margin: "0 0 12px",
    letterSpacing: "-0.02em",
  },
  titleAccent: { color: "#2DD4BF" },
  subtitle: {
    fontSize: 14,
    color: "#666",
    margin: 0,
    lineHeight: 1.6,
  },
  errorBanner: {
    backgroundColor: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#EF4444",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 13,
    marginBottom: 24,
    maxWidth: 960,
    width: "100%",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    maxWidth: 960,
    width: "100%",
  },
  card: {
    backgroundColor: "#161616",
    border: "1px solid #252525",
    borderRadius: 12,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    position: "relative" as const,
  },
  cardHighlighted: {
    border: "1px solid rgba(45,212,191,0.4)",
    backgroundColor: "#111",
    boxShadow: "0 0 32px rgba(45,212,191,0.06)",
  },
  cardCurrent: {
    border: "1px solid rgba(129,140,248,0.35)",
  },
  badge: {
    position: "absolute" as const,
    top: -11,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#2DD4BF",
    color: "#0D0D0D",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    padding: "3px 10px",
    borderRadius: 20,
    whiteSpace: "nowrap" as const,
  },
  badgeCurrent: {
    backgroundColor: "#818CF8",
    color: "#fff",
  },
  cardHeader: {
    marginBottom: 20,
    paddingTop: 8,
  },
  planName: {
    display: "block",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#666",
    marginBottom: 6,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 700,
    color: "#E5E5E5",
    letterSpacing: "-0.02em",
  },
  priceUnit: { fontSize: 13, color: "#555" },
  featureList: {
    listStyle: "none",
    margin: "0 0 24px",
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    flexGrow: 1,
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: "#999",
    lineHeight: 1.4,
  },
  btn: {
    width: "100%",
    padding: "10px 0",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  btnPrimary: {
    backgroundColor: "#2DD4BF",
    color: "#0D0D0D",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    color: "#999",
    border: "1px solid #303030",
  },
  btnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  portalRow: {
    marginTop: 32,
    textAlign: "center",
  },
  portalBtn: {
    background: "none",
    border: "none",
    color: "#818CF8",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "underline",
    textDecorationColor: "rgba(129,140,248,0.35)",
  },
  footerNote: {
    marginTop: 40,
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    lineHeight: 1.7,
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(0,0,0,0.2)",
    borderTopColor: "#0D0D0D",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
