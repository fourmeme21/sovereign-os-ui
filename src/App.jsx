// App.jsx
// Amaç:    Sovereign OS ana uygulama kabuğu — sidebar, prompt tab, routing
// Bağlı:   /api/ai/chat · useEnginePolling · useAuthStore · useJuniorStore
// Karar:   Session 42 — Junior butonu + Memory nav eklendi
//          Session 43 — analyze() Math.random kaldırıldı → /api/ai/chat bağlandı (Karar #analyze-realdata)
// Dokunma: analyze() değiştirilirse aiProxy /chat response şeması kontrol edilmeli
//          Auth token akışı değişirse useAuthStore.session güncellenmeli

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase }        from "./lib/supabaseClient";
import { useAuthStore }    from "./stores/authStore";
import { T } from "./tokens";
import { LANG } from "./lang";
import { INIT_CARDS, NAV_ICONS } from "./data";
import { useBreakpoint } from "./hooks/useBreakpoint";
import { useEnginePolling } from "./hooks/useEnginePolling";
import { GlobalStyle } from "./components/GlobalStyle";
import { RiskCard } from "./components/RiskCard";
import { Skeleton } from "./components/Skeleton";
import { DashboardScreen } from "./screens/DashboardScreen";
import { DecisionsScreen } from "./screens/DecisionsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { respondDecision } from "./api/decisionsApi";
import { StatusBar } from "./components/StatusBar";
import { useJuniorStore } from "./junior/stores/juniorStore";
import KararAkisiPanel from "./junior/components/KararAkisiPanel";
import { MemoryPanel } from "./memory/MemoryPanel";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL ?? "";

export default function SovereignApp() {
  const navigate = useNavigate();
  const [nav, setNav]               = useState("prompt");
  const [lang, setLang]             = useState("tr");
  const [input, setInput]           = useState("");
  const [analyzing, setAnalyzing]   = useState(false);
  const [main, setMain]             = useState(null);
  const [mainKey, setMainKey]       = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    cards, setCards,
    autoCount, setAutoCount,
    loadingCards, engineError,
    refresh,
  } = useEnginePolling();

  const { isMobile, isDesktop } = useBreakpoint();
  const L          = LANG[lang];
  const canAnalyze = !!input.trim() && !analyzing;

  // ── Session persist (Phase C.4) ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Junior store senkronizasyonu ──
  useEffect(() => {
    useJuniorStore.setState({
      decisions: cards,
      autoApprovedCount: autoCount,
    });
  }, [cards, autoCount]);

  // ── Analiz — /api/ai/chat endpoint bağlantısı ──
  // Edge: engine offline → engineError banner zaten aktif, setAnalyzing(false) ile UI kurtarılır
  // Edge: token yoksa (oturum açılmamış) → 401 döner, hata loglanır, UI kilitlenmez
  // Edge: verdict null/tanımsız gelirse → PERMIT varsayılır, pending false olur
  const analyze = useCallback(async () => {
    if (!input.trim() || analyzing) return;
    setAnalyzing(true);
    setMain(null);

    try {
      const session = useAuthStore.getState().session;
      const token   = session?.access_token ?? null;

      const res = await fetch(`${ENGINE_URL}/api/ai/chat`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages:  [{ role: "user", content: input }],
          max_tokens: 512,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("[analyze] engine hata:", res.status, errBody);
        return;
      }

      const data = await res.json();

      // verdict: PERMIT → auto, ASK_HUMAN / DENY → pending_human
      const pending = data.verdict === "ASK_HUMAN" || data.verdict === "DENY";

      const card = {
        id:           `d-${Date.now()}`,
        status:       pending ? "PENDING_HUMAN" : "AUTO_APPROVED",
        riskScore:    typeof data.risk === "number" ? data.risk : 5,
        verdict:      data.verdict  ?? "PERMIT",
        affectedArea: input.slice(0, 48) + (input.length > 48 ? "…" : ""),
        humanLabel:   data.reason   ?? "",
        reason:       data.reason   ?? "",
        traceId:      data.trace_id ?? `chat-${Date.now().toString(16)}`,
        ago:          lang === "tr" ? "Az önce" : "Just now",
        timestamp:    Date.now(),
        confidence:   typeof data.confidence === "number" ? data.confidence : null,
        // factors: engine /chat response'unda dönmüyor; WhyPanel factors=[] ile boş render ediyor — davranış korundu
        factors:      [],
      };

      setMain(card);
      setMainKey(k => k + 1);
      if (!pending) setAutoCount(c => c + 1);
      else setCards(p => [card, ...p].slice(0, 8));

    } catch (err) {
      console.error("[analyze] beklenmeyen hata:", err);
    } finally {
      setAnalyzing(false);
    }
  }, [input, analyzing, lang, setAutoCount, setCards]);

  const approve = (id) => {
    setCards(p => p.map(c => c.id === id ? { ...c, status:"APPROVED" } : c));
    if (main?.id === id) setMain(d => d && { ...d, status:"APPROVED" });
    respondDecision(id, "APPROVE");
  };
  const reject = (id) => {
    setCards(p => p.map(c => c.id === id ? { ...c, status:"REJECTED" } : c));
    if (main?.id === id) setMain(d => d && { ...d, status:"REJECTED" });
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

        {/* ── SIDEBAR ── */}
        <div className="z sidebar-desktop" style={{
          width: isDesktop ? 80 : 56, flexShrink:0,
          flexDirection:"column", alignItems:"center",
          borderRight:`1px solid ${T.border}`,
          padding:"16px 0", gap:2, background:T.bgPrimary,
        }}>
          <div className="logo" style={{
            width:32, height:32, borderRadius:9,
            background:`linear-gradient(135deg, ${T.accent}, #5B21B6)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, marginBottom:20,
            fontFamily:"'Syne',sans-serif", color:"#fff", fontWeight:800,
            boxShadow:`0 4px 16px ${T.accent}28`,
          }}>S</div>

          {NAV_ICONS.map((icon, i) => {
            const id = ["prompt","dash","dec","set"][i];
            return (
              <button key={id} className={`nb${nav === id ? " on" : ""}`}
                onClick={() => setNav(id)}
                style={{
                  width:"100%", minHeight:44,
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:3,
                  background:"transparent", border:"none",
                  borderLeft:"4px solid transparent",
                  color:T.textTertiary, cursor:"pointer", padding:"6px 0",
                }}>
                <span style={{ fontSize:15, lineHeight:1 }}>{icon}</span>
                <span style={{ fontSize:9, fontWeight:600, letterSpacing:".06em", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>
                  {L.nav[i]}
                </span>
              </button>
            );
          })}

          {/* Memory butonu */}
          <button
            key="mem"
            className={`nb${nav === "mem" ? " on" : ""}`}
            onClick={() => setNav("mem")}
            style={{
              width:"100%", minHeight:44,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:3,
              background:"transparent", border:"none",
              borderLeft:"4px solid transparent",
              color: T.textTertiary, cursor:"pointer", padding:"6px 0",
            }}>
            <span style={{ fontSize:15, lineHeight:1 }}>🧠</span>
            <span style={{ fontSize:9, fontWeight:600, letterSpacing:".06em", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>
              MEMORY
            </span>
          </button>

          {/* Junior butonu */}
          <button
            onClick={() => navigate("/junior")}
            style={{
              width:"100%", minHeight:44,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:3,
              background:"transparent", border:"none",
              borderLeft:`4px solid ${T.accent}`,
              color:T.accent, cursor:"pointer", padding:"6px 0",
              marginTop:8,
            }}>
            <span style={{ fontSize:15, lineHeight:1 }}>🤖</span>
            <span style={{ fontSize:9, fontWeight:600, letterSpacing:".06em", fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>
              JUNIOR
            </span>
          </button>
        </div>

        {/* ── ANA ALAN ── */}
        <div className="z" style={{
          flex:1, overflowY:"auto", display:"flex", justifyContent:"center",
          padding: isMobile ? "16px 16px 88px" : "24px 20px",
        }}>
          <div style={{ width:"100%", maxWidth:600 }}>

            {/* Başlık + dil toggle */}
            <div className="head-anim" style={{ marginBottom:32, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <h1 style={{
                  fontSize:24, fontWeight:800, margin:0, marginBottom:6,
                  fontFamily:"'Syne',sans-serif", letterSpacing:"-0.04em", color:T.textPrimary,
                }}>
                  sovereign<span className="accent-dot">.</span>os
                </h1>
                <p style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.02em" }}>
                  {L.tagline}
                </p>
              </div>
              <div style={{ display:"flex", background:T.bgSurface, border:`1px solid ${T.border}`, borderRadius:8, padding:3, gap:2 }}>
                {["tr","en"].map(l => (
                  <button key={l} className={`lt${lang === l ? " active" : ""}`} onClick={() => setLang(l)}
                    style={{
                      padding:"5px 12px", borderRadius:6, border:"none",
                      background:"transparent", cursor:"pointer",
                      fontSize:11, fontWeight:600, letterSpacing:".04em",
                      color: lang === l ? T.accent : T.textTertiary,
                      fontFamily:"'JetBrains Mono',monospace",
                    }}>{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* Engine hata banner */}
            {engineError && (
              <div style={{
                padding:"8px 12px", marginBottom:16, borderRadius:8,
                background:`${T.danger}14`, border:`1px solid ${T.danger}40`,
                fontSize:11, color:T.danger, fontFamily:"'JetBrains Mono',monospace",
              }}>
                ⚠ Engine bağlantısı kurulamadı — yerel veriler gösteriliyor
              </div>
            )}

            {/* ── PROMPT TAB ── */}
            {nav === "prompt" && (<>
              <div className="pw" style={{
                background:T.bgSurface, border:`1px solid ${T.border}`,
                borderRadius:12, padding:20,
              }}>
                <label style={{
                  display:"block", fontSize:9, fontWeight:700,
                  letterSpacing:".14em", color:T.textTertiary,
                  marginBottom:12, fontFamily:"'JetBrains Mono',monospace",
                }}>{L.inputLabel}</label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze(); }}
                  placeholder={L.placeholder}
                  rows={3}
                  style={{
                    width:"100%", background:"transparent",
                    border:"none", outline:"none", resize:"none",
                    color:T.textPrimary, fontSize:14, lineHeight:1.7, fontFamily:"inherit",
                  }}
                />
              </div>

              <button className="analyze-btn" onClick={analyze} disabled={!canAnalyze}
                style={{
                  width:"100%", marginTop:10, height:46,
                  borderRadius:10, border:"none",
                  background: canAnalyze ? `linear-gradient(135deg, ${T.accent}, #5B21B6)` : T.bgElevated,
                  color: canAnalyze ? "#fff" : T.textTertiary,
                  fontSize:14, fontWeight:600,
                  cursor: canAnalyze ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  fontFamily:"inherit", letterSpacing:".015em",
                  boxShadow: canAnalyze ? `0 4px 20px ${T.accent}28` : "none",
                }}
              >
                {analyzing ? (
                  <>{[0,1,2].map(i => (
                    <span key={i} className={`db${i}`} style={{ width:5, height:5, borderRadius:"50%", background:T.accent, display:"inline-block" }} />
                  ))}<span>{L.analyzing}</span></>
                ) : (
                  <><span>{L.analyzeBtn}</span><span style={{ opacity:.38, fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>⌘↵</span></>
                )}
              </button>

              {analyzing && <Skeleton />}
              {main && !analyzing && (
                <RiskCard key={mainKey} decision={main} onApprove={approve} onReject={reject} lang={lang} />
              )}
            </>)}

            {nav === "dash" && (
              <DashboardScreen
                cards={cards} autoCount={autoCount} lang={lang}
                onGoPrompt={() => setNav("prompt")}
                loadingCards={loadingCards}
                onRefresh={refresh}
              />
            )}

            {nav === "dec" && (
              <DecisionsScreen
                cards={cards} lang={lang}
                onGoPrompt={() => setNav("prompt")}
                approve={approve} reject={reject}
                loadingCards={loadingCards}
                onRefresh={refresh}
              />
            )}

            {nav === "set" && (
              <SettingsScreen lang={lang} onLangChange={setLang} onClear={clearAll} />
            )}

            {nav === "mem" && (
              <MemoryPanel />
            )}

          </div>
        </div>

        {/* ── SAĞ PANEL — desktop ── */}
        <div className="z right-panel-desktop" style={{
          width:272, flexShrink:0,
          borderLeft:`1px solid ${T.border}`,
          display:"flex", flexDirection:"column",
          background:T.bgSurface,
        }}>
          <KararAkisiPanel />
        </div>

        {/* ── SAĞ PANEL — drawer ── */}
        {drawerOpen && <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />}
        <div className={`z right-panel-drawer${drawerOpen ? " open" : ""}`} style={{
          background:T.bgSurface, borderLeft:`1px solid ${T.border}`,
          display:"flex", flexDirection:"column",
        }}>
          <div style={{
            padding:"12px 16px 10px", borderBottom:`1px solid ${T.border}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:".14em", color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
              {L.decisionFlow}
            </span>
            <button onClick={() => setDrawerOpen(false)} style={{
              background:"transparent", border:"none", color:T.textTertiary,
              cursor:"pointer", fontSize:14, padding:"2px 6px",
            }}>✕</button>
          </div>
          <KararAkisiPanel />
        </div>

        {!isMobile && (
          <button className="drawer-toggle" onClick={() => setDrawerOpen(v => !v)} title={L.decisionFlow}>⚖</button>
        )}

        {/* ── STATUS BAR ── */}
        <StatusBar
          engineError={engineError}
          pendingCount={visible.length}
          autoCount={autoCount}
          loadingCards={loadingCards}
          onRefresh={refresh}
          lang={lang}
        />

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
          <button className="bnav-item" onClick={() => navigate("/junior")}>
            <span className="bnav-icon">🤖</span>
            <span className="bnav-label">Junior</span>
          </button>
        </nav>

      </div>
    </>
  );
}
