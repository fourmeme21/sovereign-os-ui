import { useState, useCallback } from "react";
import { T } from "./tokens";
import { LANG } from "./lang";
import { INIT_CARDS, NAV_ICONS } from "./data";
import { useBreakpoint } from "./hooks/useBreakpoint";
import { useEnginePolling } from "./hooks/useEnginePolling";
import { GlobalStyle } from "./components/GlobalStyle";
import { RiskCard } from "./components/RiskCard";
import { Skeleton } from "./components/Skeleton";
import { RightPanelContent } from "./components/RightPanel";
import { DashboardScreen } from "./screens/DashboardScreen";
import { DecisionsScreen } from "./screens/DecisionsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { respondDecision } from "./api/decisionsApi";

const rand  = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function generateFactors(riskScore, affectedArea) {
  const area       = affectedArea.toLowerCase();
  const isAuth     = /auth|login|session|token/.test(area);
  const isPayment  = /payment|stripe|billing/.test(area);
  const isSecurity = /security|middleware|policy/.test(area);
  const isUtils    = /utils|constants|helper/.test(area);
  const base = riskScore;
  return [
    { w:35, s: isAuth||isPayment  ? clamp(base + rand(-1,1), 0, 10)           : clamp(base * 0.6 + rand(-1,1),    0, 10) },
    { w:25, s: isUtils            ? clamp(base * 0.3 + rand(-0.5,0.5), 0, 10) : clamp(base * 0.5 + rand(-1,1),    0, 10) },
    { w:15, s: isSecurity         ? clamp(base + rand(-0.5,0.5), 0, 10)        : clamp(base * 0.7 + rand(-1.5,1.5),0, 10) },
    { w:10, s: clamp(base * 0.8 + rand(-2,0),     0, 10) },
    { w:10, s: clamp(base * 0.4 + rand(-1,1),     0, 10) },
    { w:5,  s: clamp(base * 0.3 + rand(-0.5,0.5), 0, 10) },
  ].map(f => ({ ...f, s: Math.round(f.s * 10) / 10 }));
}

export default function SovereignApp() {
  const [nav, setNav]               = useState("prompt");
  const [lang, setLang]             = useState("tr");
  const [input, setInput]           = useState("");
  const [analyzing, setAnalyzing]   = useState(false);
  const [main, setMain]             = useState(null);
  const [mainKey, setMainKey]       = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Engine polling hook ──────────────────────────────
  const {
    cards, setCards,
    autoCount, setAutoCount,
    loadingCards, engineError,
    refresh,
  } = useEnginePolling();

  const { isMobile, isDesktop } = useBreakpoint();
  const L          = LANG[lang];
  const canAnalyze = !!input.trim() && !analyzing;

  const analyze = useCallback(() => {
    if (!input.trim() || analyzing) return;
    setAnalyzing(true);
    setMain(null);
    setTimeout(() => {
      const score   = Math.floor(Math.random() * 9) + 1;
      const pending = score >= 5;
      const reasons = {
        tr: {
          high:   "Auth modülünde kritik sembol silme tespit edildi. Güvenlik bölgesine dokunuluyor — insan onayı zorunlu.",
          medium: "Orta seviye etki. Dış bağımlılık değişikliği ve yeni API çağrısı mevcut. İnceleme önerilir.",
          low:    "Minimal etki. Yardımcı fonksiyon güncellemesi, sembol silinmiyor, dışa açık API değişmiyor.",
        },
        en: {
          high:   "Critical symbol deletion detected in auth module. Touching security zone — human approval required.",
          medium: "Medium-level impact. External dependency change and new API call present. Review recommended.",
          low:    "Minimal impact. Helper function update, no symbol deletion, no changes to public API.",
        },
      };
      const r    = reasons[lang];
      const card = {
        id: `d-${Date.now()}`,
        status: pending ? "PENDING_HUMAN" : "AUTO_APPROVED",
        riskScore: score,
        affectedArea: input.slice(0, 48) + (input.length > 48 ? "…" : ""),
        reason: score >= 7 ? r.high : score >= 4 ? r.medium : r.low,
        traceId: `${Math.random().toString(36).slice(2,10)}-${Math.random().toString(36).slice(2,6)}`,
        ago: lang === "tr" ? "Az önce" : "Just now",
        factors: generateFactors(score, input.slice(0, 48)),
        confidence: Math.max(0.3, 1 - (score / 10) * 0.5 + rand(-0.1, 0.1)),
      };
      setMain(card);
      setMainKey(k => k + 1);
      if (!pending) setAutoCount(c => c + 1);
      else setCards(p => [card, ...p].slice(0, 8));
      setAnalyzing(false);
    }, 1950);
  }, [input, analyzing, lang, setAutoCount, setCards]);

  const approve = (id) => {
    setCards(p => p.map(c => c.id === id ? { ...c, status: "APPROVED" } : c));
    if (main?.id === id) setMain(d => d && { ...d, status: "APPROVED" });
    respondDecision(id, "APPROVE");
  };
  const reject = (id) => {
    setCards(p => p.map(c => c.id === id ? { ...c, status: "REJECTED" } : c));
    if (main?.id === id) setMain(d => d && { ...d, status: "REJECTED" });
    respondDecision(id, "REJECT");
  };
  const clearAll = () => {
    setCards(INIT_CARDS);
    setAutoCount(14);
    setMain(null);
  };

  const visible  = cards.filter(c => c.status !== "AUTO_APPROVED");
  const approved = cards.filter(c => c.status === "APPROVED").length;
  const rejected = cards.filter(c => c.status === "REJECTED").length;

  return (
    <>
      <GlobalStyle />
      <div className="sv">

        {/* ── SIDEBAR — desktop only (≥1024px) ── */}
        <div className="z sidebar-desktop" style={{
          width: isDesktop ? 80 : 56, flexShrink: 0,
          flexDirection: "column", alignItems: "center",
          borderRight: `1px solid ${T.border}`,
          padding: "16px 0", gap: 2, background: T.bgPrimary,
        }}>
          <div className="logo" style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${T.accent}, #5B21B6)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, marginBottom: 20,
            fontFamily: "'Syne',sans-serif", color: "#fff", fontWeight: 800,
            boxShadow: `0 4px 16px ${T.accent}28`,
          }}>S</div>

          {NAV_ICONS.map((icon, i) => {
            const id = ["prompt","dash","dec","set"][i];
            return (
              <button key={id} className={`nb${nav === id ? " on" : ""}`}
                onClick={() => setNav(id)}
                style={{
                  width: "100%", minHeight: 44,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  background: "transparent", border: "none",
                  borderLeft: "4px solid transparent",
                  color: T.textTertiary, cursor: "pointer", padding: "6px 0",
                }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".06em", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>
                  {L.nav[i]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── ANA ALAN ── */}
        <div className="z" style={{
          flex: 1, overflowY: "auto", display: "flex", justifyContent: "center",
          padding: isMobile ? "16px 16px 88px" : "24px 20px",
        }}>
          <div style={{ width: "100%", maxWidth: 600 }}>

            {/* Başlık + dil toggle */}
            <div className="head-anim" style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h1 style={{
                  fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6,
                  fontFamily: "'Syne',sans-serif", letterSpacing: "-0.04em", color: T.textPrimary,
                }}>
                  sovereign<span className="accent-dot">.</span>os
                </h1>
                <p style={{ fontSize: 10, color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.02em" }}>
                  {L.tagline}
                </p>
              </div>
              <div style={{ display: "flex", background: T.bgSurface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 3, gap: 2 }}>
                {["tr","en"].map(l => (
                  <button key={l} className={`lt${lang === l ? " active" : ""}`} onClick={() => setLang(l)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, border: "none",
                      background: "transparent", cursor: "pointer",
                      fontSize: 11, fontWeight: 600, letterSpacing: ".04em",
                      color: lang === l ? T.accent : T.textTertiary,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* Engine hata banner */}
            {engineError && (
              <div style={{
                padding: "8px 12px", marginBottom: 16, borderRadius: 8,
                background: `${T.danger}14`, border: `1px solid ${T.danger}40`,
                fontSize: 11, color: T.danger, fontFamily: "'JetBrains Mono',monospace",
              }}>
                ⚠ Engine bağlantısı kurulamadı — yerel veriler gösteriliyor
              </div>
            )}

            {/* ── PROMPT TAB ── */}
            {nav === "prompt" && (<>
              <div className="pw" style={{
                background: T.bgSurface, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: 20,
                transition: "border-color .15s, box-shadow .15s",
              }}>
                <label style={{
                  display: "block", fontSize: 9, fontWeight: 700,
                  letterSpacing: ".14em", color: T.textTertiary,
                  marginBottom: 12, fontFamily: "'JetBrains Mono',monospace",
                }}>{L.inputLabel}</label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze(); }}
                  placeholder={L.placeholder}
                  rows={3}
                  style={{
                    width: "100%", background: "transparent",
                    border: "none", outline: "none", resize: "none",
                    color: T.textPrimary, fontSize: 14, lineHeight: 1.7, fontFamily: "inherit",
                  }}
                />
              </div>

              <button className="analyze-btn" onClick={analyze} disabled={!canAnalyze}
                style={{
                  width: "100%", marginTop: 10, height: 46,
                  borderRadius: 10, border: "none",
                  background: canAnalyze ? `linear-gradient(135deg, ${T.accent}, #5B21B6)` : T.bgElevated,
                  color: canAnalyze ? "#fff" : T.textTertiary,
                  fontSize: 14, fontWeight: 600,
                  cursor: canAnalyze ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontFamily: "inherit", letterSpacing: ".015em",
                  boxShadow: canAnalyze ? `0 4px 20px ${T.accent}28` : "none",
                }}
              >
                {analyzing ? (
                  <>{[0,1,2].map(i => (
                    <span key={i} className={`db${i}`} style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent, display: "inline-block" }} />
                  ))}<span>{L.analyzing}</span></>
                ) : (
                  <><span>{L.analyzeBtn}</span><span style={{ opacity: .38, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>⌘↵</span></>
                )}
              </button>

              {analyzing && <Skeleton />}
              {main && !analyzing && (
                <RiskCard key={mainKey} decision={main} onApprove={approve} onReject={reject} lang={lang} />
              )}
            </>)}

            {/* ── DASHBOARD TAB ── */}
            {nav === "dash" && (
              <DashboardScreen
                cards={cards} autoCount={autoCount} lang={lang}
                onGoPrompt={() => setNav("prompt")}
                loadingCards={loadingCards}
                onRefresh={refresh}
              />
            )}

            {/* ── DECISIONS TAB ── */}
            {nav === "dec" && (
              <DecisionsScreen
                cards={cards} lang={lang}
                onGoPrompt={() => setNav("prompt")}
                approve={approve} reject={reject}
                loadingCards={loadingCards}
                onRefresh={refresh}
              />
            )}

            {/* ── SETTINGS TAB ── */}
            {nav === "set" && (
              <SettingsScreen lang={lang} onLangChange={setLang} onClear={clearAll} />
            )}

          </div>
        </div>

        {/* ── SAĞ PANEL — desktop (≥900px) ── */}
        <div className="z right-panel-desktop" style={{
          width: 272, flexShrink: 0,
          borderLeft: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column",
          background: T.bgSurface,
        }}>
          <RightPanelContent
            L={L} autoCount={autoCount} visible={visible}
            cards={cards} approved={approved} rejected={rejected}
            approve={approve} reject={reject} lang={lang}
          />
        </div>

        {/* ── SAĞ PANEL — drawer (<900px) ── */}
        {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}
        <div className={`z right-panel-drawer${drawerOpen ? " open" : ""}`} style={{
          background: T.bgSurface, borderLeft: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            padding: "12px 16px 10px", borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".14em", color: T.textTertiary, fontFamily: "'JetBrains Mono',monospace" }}>
              {L.decisionFlow}
            </span>
            <button onClick={() => setDrawerOpen(false)} style={{
              background: "transparent", border: "none", color: T.textTertiary,
              cursor: "pointer", fontSize: 14, padding: "2px 6px",
            }}>✕</button>
          </div>
          <RightPanelContent
            L={L} autoCount={autoCount} visible={visible}
            cards={cards} approved={approved} rejected={rejected}
            approve={approve} reject={reject} lang={lang}
          />
        </div>

        {/* ── DRAWER TOGGLE — tablet ── */}
        {!isMobile && (
          <button className="drawer-toggle" onClick={() => setDrawerOpen(v => !v)} title={L.decisionFlow}>⚖</button>
        )}

        {/* ── BOTTOM NAV — mobile (<640px) ── */}
        <nav className="bottom-nav">
          {NAV_ICONS.map((icon, i) => {
            const id     = ["prompt","dash","dec","set"][i];
            const isFlow = i === 2;
            return (
              <button key={id}
                className={`bnav-item${nav === id && !isFlow ? " on" : ""}`}
                onClick={() => { if (isFlow) setDrawerOpen(v => !v); else setNav(id); }}>
                <span className="bnav-icon">{icon}</span>
                <span className="bnav-label">{isFlow ? L.decisionFlow.slice(0,5) : L.nav[i]}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </>
  );
}
