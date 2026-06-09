import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ───────────────────────────────────────────────
const T = {
  bgPrimary:    "#0F0F0F",
  bgSurface:    "#1A1A1A",
  bgElevated:   "#242424",
  border:       "#2A2A2A",
  borderSubtle: "#1E1E1E",
  success:      "#2DD4BF",
  warning:      "#F59E0B",
  danger:       "#EF4444",
  textPrimary:  "#EDEDEC",
  textSecondary:"#888884",
  textTertiary: "#555550",
  accent:       "#7C3AED",
  accentGlow:   "#7C3AED28",
};

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── GLOBAL CSS ──────────────────────────────────────────────────
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@700;800;900&family=Inter:wght@400;500;600;800&display=swap');

      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      html { scroll-behavior:smooth; }
      body { background:${T.bgPrimary}; color:${T.textPrimary}; font-family:'Inter',system-ui,sans-serif; overflow-x:hidden; }
      * { font-style:normal !important; font-synthesis:none !important; }
      ::-webkit-scrollbar { width:3px; }
      ::-webkit-scrollbar-thumb { background:#333; border-radius:2px; }

      @keyframes noise-drift {
        0%   { transform:translate(0,0) rotate(0deg); }
        33%  { transform:translate(-1%,.8%) rotate(.3deg); }
        66%  { transform:translate(.8%,-1%) rotate(-.3deg); }
        100% { transform:translate(0,0) rotate(0deg); }
      }
      @keyframes heartbeat {
        0%,100% { transform:scale(1); opacity:1; }
        12%     { transform:scale(1.4); opacity:.75; }
        24%     { transform:scale(1); opacity:1; }
        38%     { transform:scale(1.2); opacity:.88; }
        68%     { transform:scale(1); opacity:1; }
      }
      @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
      @keyframes card-in {
        from { opacity:0; transform:translateY(18px) scale(.976); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes sweep {
        0%   { transform:translateX(-110%); opacity:1; }
        85%  { transform:translateX(110%); opacity:1; }
        100% { transform:translateX(110%); opacity:0; }
      }
      @keyframes halo-pulse {
        0%,100% { opacity:.06; transform:scale(1); }
        50%     { opacity:.16; transform:scale(1.08); }
      }
      @keyframes scan-line {
        from { top:-15%; }
        to   { top:115%; }
      }
      @keyframes dot-bounce {
        0%,100% { transform:scale(1); opacity:.35; }
        50%     { transform:scale(1.6); opacity:1; }
      }
      @keyframes pulse-ring {
        0%   { transform:scale(1); opacity:.5; }
        100% { transform:scale(2.6); opacity:0; }
      }
      @keyframes fade-up {
        from { opacity:0; transform:translateY(24px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes stamp {
        from { transform:scale(1.3) rotate(-2deg); opacity:0; }
        to   { transform:scale(1) rotate(0deg); opacity:1; }
      }
      @keyframes wave-approve {
        from { transform:translateX(-110%); }
        to   { transform:translateX(110%); }
      }
      @keyframes glow-pulse {
        0%,100% { box-shadow:0 0 20px ${T.accent}22; }
        50%     { box-shadow:0 0 40px ${T.accent}44, 0 0 80px ${T.accent}18; }
      }
      @keyframes counter-tick {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }

      .noise-layer {
        content:''; position:fixed; inset:-20%; width:140%; height:140%;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        opacity:.018; pointer-events:none; z-index:0;
        animation:noise-drift 18s ease-in-out infinite;
      }

      .section-reveal {
        opacity:0; transform:translateY(32px);
        transition:opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
      }
      .section-reveal.visible { opacity:1; transform:translateY(0); }

      .hero-grid {
        background-image:
          linear-gradient(${T.border}40 1px, transparent 1px),
          linear-gradient(90deg, ${T.border}40 1px, transparent 1px);
        background-size:48px 48px;
        mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
      }

      .accent-text {
        background:linear-gradient(135deg, #7C3AED 0%, #9061F9 40%, #C4B5FD 100%);
        background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      }

      .live-dot {
        width:8px; height:8px; border-radius:50%; background:${T.success};
        animation:heartbeat 2.4s ease-in-out infinite; position:relative;
      }
      .live-dot::after {
        content:''; position:absolute; inset:-4px; border-radius:50%;
        background:${T.success}; animation:pulse-ring 2.4s ease-out infinite;
      }

      .db0 { animation:dot-bounce .85s ease-in-out infinite 0s; }
      .db1 { animation:dot-bounce .85s ease-in-out infinite .2s; }
      .db2 { animation:dot-bounce .85s ease-in-out infinite .4s; }

      .btn-primary {
        background:${T.accent}; color:#fff; border:none;
        padding:14px 28px; border-radius:10px; font-size:14px; font-weight:700;
        cursor:pointer; font-family:'Inter',sans-serif; letter-spacing:.02em;
        transition:transform .12s, box-shadow .2s;
        animation:glow-pulse 3s ease-in-out infinite;
      }
      .btn-primary:hover { transform:scale(1.025); }
      .btn-primary:active { transform:scale(.98); }

      .btn-ghost {
        background:transparent; color:${T.textSecondary};
        border:1px solid ${T.border}; padding:13px 24px; border-radius:10px;
        font-size:14px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif;
        transition:background .15s, color .15s, border-color .15s;
      }
      .btn-ghost:hover { background:${T.bgElevated}; color:${T.textPrimary}; border-color:${T.textTertiary}; }

      .risk-card-demo {
        border-radius:14px; border:1px solid ${T.border}; background:${T.bgSurface};
        padding:24px; position:relative; overflow:hidden;
        animation:card-in .6s cubic-bezier(.16,1,.3,1) both;
      }

      .tier-row {
        display:grid; grid-template-columns:64px 80px 1fr 120px;
        align-items:center; gap:16px; padding:16px 20px;
        border-bottom:1px solid ${T.borderSubtle}; transition:background .15s;
      }
      .tier-row:hover { background:${T.bgElevated}; }
      .tier-row:last-child { border-bottom:none; }

      .flow-connector {
        flex:1; height:1px; background:linear-gradient(90deg, ${T.border}, ${T.accent}60, ${T.border});
        position:relative; overflow:hidden;
      }
      .flow-connector::after {
        content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
        background:linear-gradient(90deg, transparent, ${T.accent}, transparent);
        animation:wave-approve 1.6s ease-in-out infinite;
      }

      /* Nav */
      .nav-inner {
        max-width:1120px; margin:0 auto;
        height:60px; display:flex; align-items:center; justify-content:space-between; gap:8px;
      }
      .nav-status { display:flex; }
      @media (max-width:540px) { .nav-status { display:none; } }
      .nav-download { display:flex; }
      @media (max-width:420px) { .nav-download { display:none; } }

      /* Hero */
      .hero-layout { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
      .hero-card-col { display:flex; flex-direction:column; gap:16px; animation:fade-up .8s .4s both; }
      @media (max-width:768px) {
        .hero-layout { grid-template-columns:1fr; gap:40px; }
        .hero-card-col { display:none; }
      }
      @media (max-width:640px) {
        .hero-h1 { font-size:clamp(26px,7vw,44px) !important; line-height:1.1 !important; }
        .hero-h1 br { display:none; }
        .hero-desc { font-size:14px !important; }
      }
      .hero-stats { display:flex; gap:32px; margin-top:40px; flex-wrap:wrap; }
      @media (max-width:480px) { .hero-stats { gap:20px; } }

      /* Grids */
      .status-grid { display:flex; gap:1px; border-radius:14px; overflow:hidden; border:1px solid ${T.border}; }
      @media (max-width:768px) {
        .status-grid { display:grid; grid-template-columns:1fr 1fr; }
        .status-grid > div { border-right:none !important; border-bottom:1px solid ${T.border}; }
      }
      @media (max-width:420px) { .status-grid { grid-template-columns:1fr; } }

      .problem-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; border-radius:14px; overflow:hidden; border:1px solid ${T.border}; }
      @media (max-width:768px) {
        .problem-grid { grid-template-columns:1fr; }
        .problem-grid > div { border-right:none !important; border-bottom:1px solid ${T.border}; }
        .problem-grid > div:last-child { border-bottom:none; }
      }

      .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; border-radius:16px; overflow:hidden; border:1px solid ${T.border}; }
      @media (max-width:768px) {
        .features-grid { grid-template-columns:1fr; }
        .features-grid > div { border-right:none !important; border-bottom:1px solid ${T.border}; }
        .features-grid > div:last-child { border-bottom:none; }
      }

      .adapter-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1px; border-radius:14px; overflow:hidden; border:1px solid ${T.border}; }
      @media (max-width:768px) { .adapter-grid { grid-template-columns:1fr; } }

      /* compare-grid: tüm 2-kolon karşılaştırma bölümleri */
      .compare-grid {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:1px;
        border-radius:14px;
        overflow:hidden;
        border:1px solid ${T.border};
      }
      @media (max-width:600px) {
        .compare-grid { grid-template-columns:1fr; }
        .compare-grid > div { border-right:none !important; }
      }

      /* adapter-two-col: AdapterSection'ın 2-kolon düzeni */
      .adapter-two-col {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:64px;
        align-items:center;
      }
      @media (max-width:768px) {
        .adapter-two-col { grid-template-columns:1fr; gap:32px; }
      }

      @media (max-width:640px) { .section-pad { padding-left:16px !important; padding-right:16px !important; } }
      @media (max-width:540px) { .footer-inner { flex-direction:column; align-items:flex-start; gap:12px; } }

      @media (max-width:640px) {
        .tier-row { grid-template-columns:48px 1fr 90px; }
        .tier-row .tier-desc { display:none; }
        .flow-viz { justify-content:flex-start !important; padding:20px 16px !important; -webkit-overflow-scrolling:touch; scroll-snap-type:x mandatory; }
        .flow-node { min-width:60px !important; scroll-snap-align:center; }
        .flow-connector { width:24px !important; flex-shrink:0 !important; }
      }

      input[type="email"] {
        background:${T.bgSurface}; border:1px solid ${T.border}; border-radius:10px;
        padding:14px 18px; color:${T.textPrimary}; font-size:14px; font-family:'Inter',sans-serif;
        outline:none; transition:border-color .15s, box-shadow .15s; caret-color:${T.accent};
      }
      input[type="email"]:focus { border-color:${T.accent}; box-shadow:0 0 0 3px ${T.accent}22; }
      input[type="email"]::placeholder { color:${T.textTertiary}; }

      :focus-visible {
        outline:2px solid ${T.accent};
        outline-offset:3px;
        border-radius:4px;
      }

      .toast {
        position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
        padding:12px 20px; border-radius:10px; z-index:999;
        font-size:13px; font-family:'Inter',sans-serif; font-weight:600;
        display:flex; align-items:center; gap:8px;
        animation:fade-up .3s ease both;
        box-shadow:0 8px 32px rgba(0,0,0,.4);
        white-space:nowrap;
      }
      .toast-error { background:${T.danger}; color:#fff; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration:0.01ms !important;
          animation-iteration-count:1 !important;
          transition-duration:0.01ms !important;
        }
        .noise-layer { display:none; }
        html { scroll-behavior:auto; }
      }
    `}</style>
  );
}

// ── USE INTERSECTION OBSERVER ───────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("visible"); },
      { threshold:0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── ANIMATED COUNTER ────────────────────────────────────────────
function Counter({ target, suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const t = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(Math.floor(start));
        if (start >= target) clearInterval(t);
      }, 16);
    }, { threshold:0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── SUPABASE STATS HOOK ─────────────────────────────────────────
function useDecisionStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    async function fetch_stats() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/decisions?select=verdict,created_at`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error("fetch failed");
        const rows = await res.json();

        const total = rows.length;
        const permitted = rows.filter(r => r.verdict === "PERMIT").length;
        const denied    = rows.filter(r => r.verdict === "DENY").length;
        const escalated = rows.filter(r => r.verdict === "ASK_HUMAN").length;
        const autoRate  = total > 0 ? Math.round((permitted / total) * 100) : 0;

        const memRes = await fetch(
          `${SUPABASE_URL}/rest/v1/user_sessions?select=id&limit=1000`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        const memRows = memRes.ok ? await memRes.json() : [];

        setStats({
          total,
          permitted,
          denied,
          escalated,
          autoRate,
          snapshots: memRows.length,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetch_stats();
  }, []);

  return { stats, loading };
}

// ── LIVE DECISION CARD ──────────────────────────────────────────
function LiveDecisionCard() {
  const [decisions, setDecisions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("show");
  const [decision, setDecision] = useState(null);
  const [sweep, setSweep] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    fetch(
      `${SUPABASE_URL}/rest/v1/decisions?select=risk_score,intent,reasoning,verdict&order=created_at.desc&limit=10`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then(r => r.ok ? r.json() : [])
      .then(rows => {
        if (rows.length > 0) {
          setDecisions(rows);
          setFetched(true);
        }
      })
      .catch(() => {});
  }, []);

  const d = decisions[idx] ?? null;

  const rc = d
    ? d.risk_score <= 3 ? T.success : d.risk_score <= 6 ? T.warning : T.danger
    : T.textTertiary;

  useEffect(() => {
    if (!d) return;
    setSweep(true);
    const st = setTimeout(() => setSweep(false), 900);
    return () => clearTimeout(st);
  }, [idx]);

  useEffect(() => {
    if (!d || decisions.length === 0) return;
    const isAuto = d.verdict === "PERMIT" && d.risk_score <= 3;

    if (isAuto) {
      const t1 = setTimeout(() => setPhase("deciding"), 1800);
      const t2 = setTimeout(() => { setDecision("approved"); setPhase("done"); }, 2400);
      const t3 = setTimeout(() => {
        setPhase("show"); setDecision(null);
        setIdx(i => (i + 1) % decisions.length);
      }, 4200);
      return () => [t1,t2,t3].forEach(clearTimeout);
    } else {
      const t1 = setTimeout(() => setPhase("deciding"), 2200);
      const t2 = setTimeout(() => {
        setDecision(d.verdict === "PERMIT" ? "approved" : "rejected");
        setPhase("done");
      }, 3000);
      const t3 = setTimeout(() => {
        setPhase("show"); setDecision(null);
        setIdx(i => (i + 1) % decisions.length);
      }, 5000);
      return () => [t1,t2,t3].forEach(clearTimeout);
    }
  }, [idx, decisions]);

  if (!fetched || !d) {
    return (
      <div className="risk-card-demo" style={{ borderLeft:`4px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{
            width:48, height:48, borderRadius:"50%", border:`2px solid ${T.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:T.bgElevated,
          }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.textTertiary }}>—</span>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".18em", color:T.textTertiary, marginBottom:4 }}>
              WAITING FOR DECISIONS
            </div>
            <div style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
              sovereign-engine · live
            </div>
          </div>
        </div>
        <p style={{ fontSize:13, color:T.textTertiary, lineHeight:1.7 }}>
          No decisions logged yet. Start a session to see live data here.
        </p>
      </div>
    );
  }

  const cardBg = decision === "approved" ? `${T.success}0D`
               : decision === "rejected" ? `${T.danger}09`
               : T.bgSurface;

  const riskLabel = d.risk_score <= 3 ? "LOW RISK" : d.risk_score <= 6 ? "MEDIUM RISK" : "HIGH RISK";

  return (
    <div className="risk-card-demo" style={{
      borderLeft:`4px solid ${rc}`, background:cardBg,
      transition:"background .5s ease", maxWidth:480, width:"100%",
    }}>
      {phase === "deciding" && (
        <div style={{
          position:"absolute", left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${rc}60,transparent)`,
          animation:"scan-line 1.2s linear infinite", pointerEvents:"none", top:0
        }} />
      )}
      {sweep && (
        <div style={{
          position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
          background:`linear-gradient(90deg, transparent, ${rc}28, ${rc}14, transparent)`,
          animation:"sweep .8s ease forwards",
        }} />
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:48, height:48, borderRadius:"50%",
            border:`2px solid ${rc}`, display:"flex", alignItems:"center", justifyContent:"center",
            background:`${rc}12`, flexShrink:0, position:"relative",
          }}>
            <div style={{
              position:"absolute", inset:-6, borderRadius:"50%",
              background:rc, opacity:.06, animation:"halo-pulse 3s ease-in-out infinite",
            }} />
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:rc, position:"relative" }}>
              {d.risk_score}
            </span>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".18em", color:rc, marginBottom:4 }}>
              {riskLabel}
            </div>
            <div style={{
              fontSize:11, color:T.textSecondary, fontFamily:"'JetBrains Mono',monospace",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200,
            }}>
              {d.intent ? d.intent.slice(0, 48) : "decision"}
            </div>
          </div>
        </div>
        <div style={{ fontSize:9, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", display:"flex", alignItems:"center", gap:4 }}>
          {phase === "deciding" ? (
            <>
              <span className="db0" style={{width:4,height:4,borderRadius:"50%",background:rc,display:"inline-block"}}/>
              <span className="db1" style={{width:4,height:4,borderRadius:"50%",background:rc,display:"inline-block"}}/>
              <span className="db2" style={{width:4,height:4,borderRadius:"50%",background:rc,display:"inline-block"}}/>
            </>
          ) : (
            <span>trace_{String(idx).padStart(4,"0")}</span>
          )}
        </div>
      </div>

      <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7, marginBottom:16 }}>
        {d.reasoning ? d.reasoning.slice(0, 120) + (d.reasoning.length > 120 ? "…" : "") : "Reasoning logged."}
      </p>

      {phase === "show" && d.verdict !== "PERMIT" && (
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ padding:"6px 14px", borderRadius:7, border:`1px solid ${T.warning}`, background:`${T.warning}10` }}>
            <span style={{ fontSize:11, color:T.warning, fontWeight:600, fontFamily:"'JetBrains Mono',monospace" }}>
              ASK_HUMAN
            </span>
          </div>
        </div>
      )}

      {phase === "show" && d.verdict === "PERMIT" && d.risk_score <= 3 && (
        <div style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"6px 12px", borderRadius:6,
          background:`${T.success}12`, border:`1px solid ${T.success}30`,
        }}>
          <div className="live-dot" style={{width:6,height:6}} />
          <span style={{ fontSize:11, color:T.success, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
            AUTO-APPROVED
          </span>
        </div>
      )}

      {decision && (
        <div style={{ animation:"stamp .3s cubic-bezier(.34,1.56,.64,1) both" }}>
          <div style={{
            padding:"8px 16px", borderRadius:7, display:"inline-block",
            background:decision === "approved" ? `${T.success}14` : `${T.danger}12`,
            border:`1px solid ${decision === "approved" ? T.success : T.danger}40`,
          }}>
            <span style={{
              fontSize:12, fontWeight:700, letterSpacing:".1em",
              color:decision === "approved" ? T.success : T.danger,
              fontFamily:"'JetBrains Mono',monospace",
            }}>
              {decision === "approved" ? "✅ APPROVED" : "❌ REJECTED"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TOAST ────────────────────────────────────────────────────────
function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="assertive">
      <span>{type === "error" ? "✗" : "✓"}</span>
      {message}
    </div>
  );
}

// ── NAV ─────────────────────────────────────────────────────────
const DOWNLOAD_URL = "https://github.com/fourmeme21/sovereign-os-ui/releases/download/v0.7.4/sovereign-os_0.6.6_x64-setup.exe";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav aria-label="Main navigation" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 24px",
      background:scrolled ? `${T.bgPrimary}E8` : "transparent",
      backdropFilter:scrolled ? "blur(12px)" : "none",
      borderBottom:scrolled ? `1px solid ${T.border}` : "none",
      transition:"all .25s ease",
    }}>
      <div className="nav-inner">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:28, height:28, borderRadius:7,
            background:`linear-gradient(135deg,${T.accent},#9061F9)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:"#fff", fontFamily:"'Outfit',sans-serif",
          }} aria-hidden="true">S</div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:T.textPrimary, letterSpacing:".02em" }}>
            SOVEREIGN<span className="accent-text"> ENGINE</span>
          </span>
        </div>

        <div className="nav-status" style={{
          alignItems:"center", gap:7, padding:"5px 12px", borderRadius:20,
          background:T.bgSurface, border:`1px solid ${T.border}`,
        }} aria-label="System status: operational">
          <div className="live-dot" aria-hidden="true" />
          <span style={{ fontSize:11, color:T.success, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
            OPERATIONAL
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <a href={DOWNLOAD_URL} className="nav-download" style={{ textDecoration:"none" }} aria-label="Download desktop app version 0.6.6">
            <button className="btn-ghost" style={{ padding:"9px 16px", fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:13 }} aria-hidden="true">⬇</span>
              Desktop App
              <span style={{ fontSize:9, opacity:.55, fontFamily:"'JetBrains Mono',monospace", background:T.bgElevated, padding:"2px 5px", borderRadius:4 }}>v0.6.6</span>
            </button>
          </a>
          <a href="/junior" style={{ textDecoration:"none" }} aria-label="Open Sovereign Engine web app">
            <button className="btn-primary" style={{ padding:"9px 18px", fontSize:13, animation:"none" }}>
              Open App →
            </button>
          </a>
        </div>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section aria-label="Hero" style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      position:"relative", overflow:"hidden", padding:"80px 24px 60px",
    }}>
      <div className="hero-grid" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
      <div style={{
        position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:600, height:600, borderRadius:"50%",
        background:`radial-gradient(ellipse, ${T.accent}12 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />

      <div style={{ maxWidth:1120, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
        <div className="hero-layout">

          {/* Left */}
          <div>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px",
              borderRadius:20, background:T.bgSurface, border:`1px solid ${T.border}`,
              marginBottom:28, animation:"fade-up .6s .1s both",
            }}>
              <div className="live-dot" style={{width:6,height:6}} />
              <span style={{ fontSize:11, color:T.textSecondary, fontFamily:"'JetBrains Mono',monospace", fontWeight:500 }}>
                SOVEREIGN ENGINE OS · PROJECT MEMORY RUNTIME
              </span>
            </div>

            <h1 className="hero-h1" style={{
              fontFamily:"'Outfit',sans-serif", fontWeight:900,
              fontSize:"clamp(34px,5vw,64px)", lineHeight:1.05,
              color:T.textPrimary, marginBottom:16,
              animation:"fade-up .7s .2s both", letterSpacing:"-.02em",
            }}>
              More powerful AI.<br />
              <span style={{ color:T.danger }}>Higher stakes.</span><br />
              <span className="accent-text">No governance.</span>
            </h1>

            <p style={{
              fontSize:"clamp(15px,1.6vw,18px)", color:T.textSecondary,
              lineHeight:1.7, maxWidth:440, marginBottom:36, animation:"fade-up .7s .35s both",
            }}>
              Every decision intercepted, signed, and logged — before it touches
              your project. Persistent memory. Zero context loss. Full audit chain.
            </p>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap", animation:"fade-up .7s .45s both" }}>
              <a href="#waitlist" style={{ textDecoration:"none" }}>
                <button className="btn-primary">Create Your Project Brain →</button>
              </a>
              <a href={DOWNLOAD_URL} style={{ textDecoration:"none" }}>
                <button className="btn-ghost">Download Desktop App</button>
              </a>
            </div>

            <LiveStats />
          </div>

          {/* Right */}
          <div className="hero-card-col">
            <div style={{
              display:"flex", alignItems:"center", gap:8, padding:"10px 16px",
              background:T.bgSurface, border:`1px solid ${T.border}`,
              borderRadius:"12px 12px 0 0", borderBottom:"none",
            }}>
              {["#EF4444","#F59E0B","#2DD4BF"].map(c => (
                <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:.7 }} />
              ))}
              <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", marginLeft:8 }}>
                sovereign-engine · live decisions
              </span>
              <div className="live-dot" style={{ marginLeft:"auto", width:6, height:6 }} />
            </div>
            <div style={{ margin:"-1px 0", border:`1px solid ${T.border}`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:"0 1px 1px" }}>
              <div style={{ background:T.bgSurface, borderRadius:"0 0 11px 11px", padding:16 }}>
                <LiveDecisionCard />
              </div>
            </div>
            <div style={{
              padding:"12px 16px", background:T.bgSurface, border:`1px solid ${T.borderSubtle}`,
              borderRadius:10, display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                engine://memory+semantic_diff+policy_kernel
              </span>
              <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                <span className="db0" style={{width:4,height:4,borderRadius:"50%",background:T.accent,display:"inline-block"}}/>
                <span className="db1" style={{width:4,height:4,borderRadius:"50%",background:T.accent,display:"inline-block"}}/>
                <span className="db2" style={{width:4,height:4,borderRadius:"50%",background:T.accent,display:"inline-block"}}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── LIVE STATS ──────────────────────────────────────────────────
function LiveStats() {
  const { stats, loading } = useDecisionStats();

  if (loading) {
    return (
      <div className="hero-stats" style={{ animation:"fade-up .7s .65s both" }}>
        {["decisions guarded","auto-approved rate","sessions closed"].map(label => (
          <div key={label}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, fontWeight:800, color:T.textTertiary }}>—</div>
            <div style={{ fontSize:11, color:T.textTertiary, marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>{label}</div>
          </div>
        ))}
      </div>
    );
  }

  const items = stats ? [
    { val: stats.total.toLocaleString(), label:"decisions guarded" },
    { val: `${stats.autoRate}%`, label:"auto-approved rate" },
    { val: stats.snapshots > 0 ? stats.snapshots.toLocaleString() : "—", label:"sessions closed" },
  ] : [
    { val: "—", label:"decisions guarded" },
    { val: "—", label:"auto-approved rate" },
    { val: "—", label:"sessions closed" },
  ];

  return (
    <div className="hero-stats" style={{ animation:"fade-up .7s .65s both" }}>
      {items.map(s => (
        <div key={s.label}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, fontWeight:800, color:T.textPrimary }}>
            {s.val}
          </div>
          <div style={{ fontSize:11, color:T.textTertiary, marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── STATUS SECTION ──────────────────────────────────────────────
function StatusSection() {
  const ref = useReveal();
  const { stats, loading } = useDecisionStats();

  const cells = stats ? [
    { label:"DECISIONS GUARDED",  value: stats.total,     color:T.textPrimary, bg:T.bgSurface },
    { label:"AUTO-APPROVED",      value: stats.permitted, color:T.success,     bg:`${T.success}08`, extra:`(${stats.autoRate}%)` },
    { label:"ESCALATED",          value: stats.escalated, color:T.warning,     bg:`${T.warning}08` },
    { label:"REJECTED",           value: stats.denied,    color:T.danger,      bg:`${T.danger}08` },
    { label:"SESSIONS CLOSED",    value: stats.snapshots, color:T.accent,      bg:`${T.accent}08` },
  ] : null;

  return (
    <div ref={ref} className="section-reveal" style={{ padding:"0 24px 80px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div className="status-grid">
          {(cells ?? Array(5).fill(null)).map((s, i) => (
            <div key={i} style={{
              flex:1, padding:"20px 16px",
              background:s?.bg ?? T.bgSurface,
              borderRight:i < 4 ? `1px solid ${T.border}` : "none",
              textAlign:"center",
            }}>
              <div style={{
                fontFamily:"'Outfit',sans-serif", fontWeight:800,
                fontSize:26, color:s?.color ?? T.textTertiary, lineHeight:1, marginBottom:6,
              }}>
                {loading ? "—" : s !== null ? (
                  <>
                    <Counter target={s.value} />
                    {s.extra && <span style={{fontSize:12,color:T.textTertiary,marginLeft:4}}>{s.extra}</span>}
                  </>
                ) : "—"}
              </div>
              <div style={{ fontSize:9, color:T.textTertiary, letterSpacing:".14em", fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                {s?.label ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FABLE BANNER ─────────────────────────────────────────────────
function FableBanner() {
  return (
    <div style={{ padding:"0 24px 48px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{
          padding:"16px 24px", borderRadius:12,
          background:`linear-gradient(135deg, ${T.warning}0A, ${T.accent}0A)`,
          border:`1px solid ${T.warning}30`,
          display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
        }}>
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0,
            background:`${T.warning}18`, border:`1px solid ${T.warning}40`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15,
          }}>⚡</div>
          <div style={{ flex:1, minWidth:200 }}>
            <span style={{ fontSize:13, fontWeight:700, color:T.warning, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".06em" }}>
              CLAUDE FABLE 5 JUST LAUNCHED
            </span>
            <span style={{ fontSize:13, color:T.textSecondary, marginLeft:12 }}>
              Days-long autonomous sessions. No oversight layer by default.
              That's exactly what Sovereign was built for.
            </span>
          </div>
          <a href="#how" style={{ textDecoration:"none", flexShrink:0 }}>
            <span style={{
              fontSize:12, color:T.accent, fontWeight:600,
              fontFamily:"'JetBrains Mono',monospace",
              borderBottom:`1px solid ${T.accent}40`, paddingBottom:1,
            }}>See how Sovereign governs it →</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── WITHOUT / WITH ────────────────────────────────────────────────
function ProblemSection() {
  const ref = useReveal();

  const without = [
    "Your AI works for days. You have no audit trail.",
    "A decision made autonomously can't be rolled back.",
    "No policy enforced. No blast radius calculated.",
    "Anything goes. Nobody signed off.",
  ];

  const withS = [
    "Every autonomous decision intercepted and logged.",
    "Signed execution tokens — every action traceable.",
    "Policy enforced before execution, not after.",
    "Full rollback. Complete audit chain. Zero ambiguity.",
  ];

  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            THE PROBLEM
          </div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            More powerful AI means<br />
            <span style={{ color:T.danger }}>more damage when it goes wrong.</span>
          </h2>
        </div>

        {/* compare-grid class handles responsive — no inline gridTemplateColumns */}
        <div className="compare-grid">
          {/* Without */}
          <div style={{ padding:"36px 32px", background:T.bgSurface, borderRight:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
              <div style={{ width:28, height:28, borderRadius:6, background:`${T.danger}14`, border:`1px solid ${T.danger}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:13 }}>✗</span>
              </div>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:T.danger }}>Without Sovereign</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {without.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:T.danger, opacity:.6, marginTop:6, flexShrink:0 }} />
                  <span style={{ fontSize:14, color:T.textSecondary, lineHeight:1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* With */}
          <div style={{ padding:"36px 32px", background:`${T.success}05` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
              <div style={{ width:28, height:28, borderRadius:6, background:`${T.success}14`, border:`1px solid ${T.success}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:13 }}>✓</span>
              </div>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:T.success }}>With Sovereign</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {withS.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:T.success, marginTop:6, flexShrink:0 }} />
                  <span style={{ fontSize:14, color:T.textPrimary, lineHeight:1.6, fontWeight:500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SIX LAYERS ───────────────────────────────────────────────────
const LAYERS = [
  { id:"01", name:"Policy Kernel",   color:T.danger,  desc:"Rust-native hard locks. PERMIT/DENY/ASK_HUMAN — no middle ground. The system decides, not the model." },
  { id:"02", name:"Execution Gate",  color:T.warning, desc:"JWT-signed execution tokens. 30-second TTL. No token, no execution. TOCTOU attacks impossible." },
  { id:"03", name:"Memory Engine",   color:T.success, desc:"Hot/warm/cold storage tiers. Every decision, every session — permanent. The engine never forgets." },
  { id:"04", name:"Semantic Diff",   color:T.accent,  desc:"Detects what actually changed. Not just what the AI said — what it touched. Blast radius calculated before action." },
  { id:"05", name:"Domain Adapter",  color:"#9061F9", desc:"One methodology, any codebase. ADAPTERv1 generates project-specific behavior files from your master plan." },
  { id:"06", name:"Audit Chain",     color:"#C4B5FD", desc:"RFC 8785 canonical JSON hashing. Hash-chained log entries. Every record immutable. Tamper-evident by construction." },
];

function LayersSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="section-reveal" id="how" style={{ padding:"80px 24px", background:T.bgSurface }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            ARCHITECTURE
          </div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            Six layers.<br />
            <span className="accent-text">One guarantee.</span>
          </h2>
        </div>

        <div style={{
          textAlign:"center", marginBottom:48,
          padding:"14px 24px", borderRadius:10,
          background:`${T.bgPrimary}`, border:`1px dashed ${T.border}`,
          maxWidth:680, margin:"0 auto 48px",
        }}>
          <span style={{ fontSize:14, color:T.textSecondary, fontStyle:"normal" }}>
            Every action is{" "}
            {["intercepted","scored","signed","logged"].map((w, i) => (
              <span key={w}>
                <span style={{ color:T.textPrimary, fontWeight:600 }}>{w}</span>
                {i < 3 ? <span style={{ color:T.textTertiary }}> · </span> : null}
              </span>
            ))}
            {" "}— before it touches your project.
          </span>
        </div>

        <div className="adapter-grid">
          {LAYERS.map((l, i) => (
            <div key={i} style={{
              padding:"28px 28px", background:T.bgPrimary,
              borderBottom:i < 4 ? `1px solid ${T.border}` : "none",
              borderRight:(i % 2 === 0) ? `1px solid ${T.border}` : "none",
              position:"relative", overflow:"hidden", transition:"background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgElevated}
              onMouseLeave={e => e.currentTarget.style.background = T.bgPrimary}
            >
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{
                  width:36, height:36, borderRadius:8,
                  background:`${l.color}14`, border:`1px solid ${l.color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, color:l.color, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                }}>{l.id}</div>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:17, color:T.textPrimary }}>
                  {l.name}
                </h3>
              </div>
              <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7 }}>{l.desc}</p>
              <div style={{
                position:"absolute", top:0, right:0, width:48, height:48,
                background:`radial-gradient(circle at 100% 0%, ${l.color}10, transparent 70%)`,
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ADAPTERv1 ────────────────────────────────────────────────────
function AdapterSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        {/* adapter-two-col class handles responsive */}
        <div className="adapter-two-col">

          {/* Left copy */}
          <div>
            <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
              ADAPTERv1
            </div>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(26px,3vw,40px)", color:T.textPrimary, letterSpacing:"-.01em", marginBottom:16 }}>
              Turn a Project Plan<br />
              <span className="accent-text">Into a Project Brain.</span>
            </h2>
            <p style={{ fontSize:15, color:T.textSecondary, lineHeight:1.75, marginBottom:16 }}>
              Describe your project once. Sovereign generates the decision framework,
              memory structure, and operating rules your AI will follow — permanently.
            </p>
            <p style={{ fontSize:15, color:T.textSecondary, lineHeight:1.75, marginBottom:32 }}>
              CORE.md, AI_AGENT.md, adapter.ts, decision trees — all derived from your
              master plan. Your codebase's rules, embedded once, enforced forever.
            </p>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ padding:"8px 14px", borderRadius:8, background:`${T.accent}12`, border:`1px solid ${T.accent}30` }}>
                <span style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>
                  INFINITE ADAPTER ARCHITECTURE
                </span>
              </div>
            </div>
          </div>

          {/* Right: file generation visual */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{
              padding:"16px 20px", borderRadius:10,
              background:T.bgSurface, border:`1px solid ${T.border}`,
              display:"flex", alignItems:"center", gap:12,
            }}>
              <div style={{ width:32, height:32, borderRadius:7, background:`${T.textTertiary}14`, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:14 }}>📋</span>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:T.textPrimary, marginBottom:2 }}>master_plan.md</div>
                <div style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>your project description</div>
              </div>
              <div style={{ marginLeft:"auto", fontSize:11, color:T.textTertiary }}>INPUT</div>
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"4px 0" }}>
              <div className="flow-connector" style={{ width:1, height:24, background:`linear-gradient(180deg, ${T.border}, ${T.accent}60, ${T.border})`, flex:"none" }} />
            </div>

            <div style={{ padding:"16px 20px", borderRadius:10, background:`${T.accent}08`, border:`1px solid ${T.accent}20` }}>
              <div style={{ fontSize:10, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em", marginBottom:14 }}>
                GENERATED · ADAPTERv1
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["CORE.md","AI_AGENT.md","adapter.ts","decision_tree.json","ARCHITECTURE.md","ROADMAP.md"].map((f, i) => (
                  <div key={f} style={{
                    display:"flex", alignItems:"center", gap:8,
                    animation:`fade-up .4s ${i * 0.08}s both`,
                  }}>
                    <span style={{ fontSize:11, color:T.success }}>✓</span>
                    <span style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:T.textSecondary }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── BEFORE / AFTER TIMELINE ──────────────────────────────────────
function BeforeAfterSection() {
  const ref = useReveal();

  const before = [
    { week:"Week 1",  text:"AI understands everything." },
    { week:"Week 4",  text:"AI forgets key decisions." },
    { week:"Week 8",  text:"Context becomes fragmented." },
    { week:"Week 12", text:"Nobody remembers why the system looks like this." },
  ];

  const after = [
    { week:"Week 1",  text:"AI learns project rules." },
    { week:"Week 4",  text:"Decisions preserved." },
    { week:"Week 8",  text:"Context grows." },
    { week:"Week 12", text:"AI operates with accumulated project knowledge." },
  ];

  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px", background:T.bgSurface }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            THE DIFFERENCE
          </div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            12 weeks.<br />
            <span className="accent-text">Two very different outcomes.</span>
          </h2>
        </div>

        {/* compare-grid class handles responsive */}
        <div className="compare-grid">
          {/* Before */}
          <div style={{ padding:"36px 32px", background:T.bgPrimary, borderRight:`1px solid ${T.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.danger, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".14em", marginBottom:28 }}>
              BEFORE SOVEREIGN
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {before.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:16, paddingBottom: i < before.length - 1 ? 28 : 0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:T.danger, opacity: 1 - i * 0.18, flexShrink:0 }} />
                    {i < before.length - 1 && <div style={{ width:1, flex:1, background:`${T.danger}20`, marginTop:4 }} />}
                  </div>
                  <div style={{ paddingBottom:4 }}>
                    <div style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{item.week}</div>
                    <div style={{ fontSize:14, color: i === 0 ? T.textPrimary : T.textSecondary, lineHeight:1.5, opacity: 1 - i * 0.15 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div style={{ padding:"36px 32px", background:`${T.success}04` }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.success, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".14em", marginBottom:28 }}>
              AFTER SOVEREIGN
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {after.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:16, paddingBottom: i < after.length - 1 ? 28 : 0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:T.success, flexShrink:0 }} />
                    {i < after.length - 1 && <div style={{ width:1, flex:1, background:`${T.success}30`, marginTop:4 }} />}
                  </div>
                  <div style={{ paddingBottom:4 }}>
                    <div style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{item.week}</div>
                    <div style={{ fontSize:14, color:T.textPrimary, lineHeight:1.5, fontWeight:500 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ROI CALCULATOR ───────────────────────────────────────────────
function ROISection() {
  const ref = useReveal();
  const [devs, setDevs] = useState(5);
  const hourlyRate = 100;
  const hoursPerWeek = 2;
  const totalHoursWeek = devs * hoursPerWeek;
  const totalHoursMonth = totalHoursWeek * 4;
  const costMonth = totalHoursMonth * hourlyRate;

  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            THE COST OF FORGETTING
          </div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            How much context loss<br />
            <span style={{ color:T.warning }}>costs your team.</span>
          </h2>
        </div>

        {/* compare-grid class handles responsive */}
        <div className="compare-grid">
          {/* Left: inputs */}
          <div style={{ padding:"40px 36px", background:T.bgSurface, borderRight:`1px solid ${T.border}` }}>
            <div style={{ fontSize:13, color:T.textSecondary, marginBottom:32, lineHeight:1.7 }}>
              A developer spends an average of{" "}
              <span style={{ color:T.textPrimary, fontWeight:600 }}>2 hours/week</span>{" "}
              rebuilding context that AI forgot. Adjust your team size:
            </div>

            <div style={{ marginBottom:32 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:12, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>TEAM SIZE</span>
                <span style={{ fontSize:16, fontWeight:800, color:T.textPrimary, fontFamily:"'Outfit',sans-serif" }}>{devs} developers</span>
              </div>
              <input
                id="team-size-slider"
                type="range" min={1} max={20} value={devs}
                onChange={e => setDevs(Number(e.target.value))}
                style={{ width:"100%", accentColor:T.accent, cursor:"pointer" }}
                aria-label={`Team size: ${devs} developers`}
                aria-valuemin={1} aria-valuemax={20} aria-valuenow={devs}
              />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>1</span>
                <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>20</span>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Hours lost / week", value:`${totalHoursWeek}h`, color:T.textPrimary },
                { label:"Hours lost / month", value:`${totalHoursMonth}h`, color:T.warning },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderRadius:8, background:T.bgElevated, border:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:13, color:T.textSecondary }}>{r.label}</span>
                  <span style={{ fontSize:16, fontWeight:800, color:r.color, fontFamily:"'Outfit',sans-serif" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: result */}
          <div style={{ padding:"40px 36px", background:`${T.danger}06`, display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <div style={{ fontSize:11, color:T.danger, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em", marginBottom:16 }}>
              MONTHLY COST
            </div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"clamp(40px,5vw,64px)", color:T.danger, lineHeight:1, marginBottom:8 }}>
              ${costMonth.toLocaleString()}
            </div>
            <div style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7, marginBottom:32 }}>
              wasted rebuilding context your AI should have remembered.
            </div>
            <div style={{ padding:"16px 20px", borderRadius:10, background:`${T.success}0A`, border:`1px solid ${T.success}25` }}>
              <div style={{ fontSize:12, color:T.success, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, marginBottom:6 }}>SOVEREIGN ELIMINATES THIS TAX</div>
              <div style={{ fontSize:13, color:T.textSecondary, lineHeight:1.6 }}>
                Persistent memory means your AI never asks the same question twice. Every session inherits full project context.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ─────────────────────────────────────────────────────
const FEATURES = [
  {
    tag:"01", title:"Interception Overlay",
    color:T.danger, metric:"< 8ms", metricLabel:"interception latency",
    body:"Wraps every AI action before execution. Transparent middleware — your AI doesn't know it's there, your users don't feel it, your system never exposes a raw action.",
  },
  {
    tag:"02", title:"Persistent Memory",
    color:T.accent, metric:"hot/warm/cold", metricLabel:"storage tiers",
    body:"Three memory tiers. Every decision, every context, every session — remembered permanently. The engine accumulates knowledge of your codebase over time.",
  },
  {
    tag:"03", title:"Signed Audit Chain",
    color:T.success, metric:"100%", metricLabel:"tamper-evident coverage",
    body:"Every approved change is hash-chained with RFC 8785 canonical JSON. Rejected actions logged with reasoning. Complete decision history that cannot be altered.",
  },
];

function FeaturesSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px", background:T.bgSurface }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            CAPABILITIES
          </div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            Built for operators<br />who don't accept<br />
            <span style={{ color:T.warning }}>"trust me."</span>
          </h2>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding:"36px 28px", background:T.bgPrimary,
              borderRight:i < 2 ? `1px solid ${T.border}` : "none",
              position:"relative", overflow:"hidden", transition:"background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgElevated}
              onMouseLeave={e => e.currentTarget.style.background = T.bgPrimary}
            >
              <div style={{
                fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:".2em", fontWeight:700, marginBottom:24,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <span>{f.tag}</span>
                <div style={{ padding:"4px 10px", borderRadius:6, background:`${f.color}14`, border:`1px solid ${f.color}30` }}>
                  <span style={{ fontSize:12, fontWeight:800, color:f.color, fontFamily:"'Outfit',sans-serif" }}>{f.metric}</span>
                  <span style={{ fontSize:9, color:T.textTertiary, marginLeft:4 }}>{f.metricLabel}</span>
                </div>
              </div>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:T.textPrimary, marginBottom:14 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:T.textSecondary, lineHeight:1.7 }}>{f.body}</p>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${f.color}60, ${f.color}20, transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── RISK TIERS ───────────────────────────────────────────────────
const TIERS = [
  { tier:0, range:"0–3", label:"Low Risk",      color:T.success, desc:"Auto-approved. No human required. Engine continues.", action:"AUTO_APPROVED" },
  { tier:1, range:"4–5", label:"Medium Risk",   color:T.warning, desc:"Logged with reasoning. Human review optional.",       action:"REVIEW_OPTIONAL" },
  { tier:2, range:"6–7", label:"High Risk",     color:"#F97316", desc:"Requires explicit human approval before execution.", action:"PENDING_HUMAN" },
  { tier:3, range:"8–10",label:"Critical Risk", color:T.danger,  desc:"Hard lock. Execution blocked. Immediate escalation.",action:"HARD_BLOCK" },
];

function RiskTierSection() {
  const ref = useReveal();
  const { stats } = useDecisionStats();

  const counts = stats
    ? [stats.permitted, Math.max(stats.escalated - 3, 0), Math.min(stats.escalated, 3), stats.denied]
    : [94, 4, 1, 1];

  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            RISK ARCHITECTURE
          </div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            Four tiers.<br />
            <span className="accent-text">No ambiguity.</span>
          </h2>
        </div>

        <div style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${T.border}` }}>
          <div className="tier-row" style={{ background:T.bgElevated, borderBottom:`1px solid ${T.border}`, padding:"12px 20px" }}>
            {["TIER","SCORE","DESCRIPTION","ACTION"].map(h => (
              <span key={h} style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em" }}>{h}</span>
            ))}
          </div>
          {TIERS.map((t, i) => (
            <div key={i} className="tier-row" style={{ background:T.bgSurface }}>
              <div style={{
                width:36, height:36, borderRadius:8,
                background:`${t.color}14`, border:`1px solid ${t.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:t.color,
              }}>{t.tier}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:t.color }}>{t.range}</div>
              <div className="tier-desc">
                <div style={{ fontSize:13, fontWeight:600, color:T.textPrimary, marginBottom:3 }}>{t.label}</div>
                <div style={{ fontSize:12, color:T.textSecondary }}>{t.desc}</div>
              </div>
              <div style={{
                padding:"4px 10px", borderRadius:6, background:`${t.color}12`, border:`1px solid ${t.color}25`,
                fontSize:10, fontWeight:700, color:t.color,
                fontFamily:"'JetBrains Mono',monospace", letterSpacing:".08em", whiteSpace:"nowrap",
              }}>{t.action}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:20, display:"flex", height:6, borderRadius:4, overflow:"hidden", gap:2 }}>
          {TIERS.map((t, i) => (
            <div key={t.tier} style={{ flex:counts[i], background:t.color, opacity:.7, borderRadius:2 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── WAITLIST ─────────────────────────────────────────────────────
function WaitlistSection() {
  const ref = useReveal();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [toast, setToast] = useState(null);

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setState("loading");
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method:"POST",
        headers: {
          apikey:SUPABASE_ANON_KEY,
          Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type":"application/json",
          Prefer:"return=minimal",
        },
        body:JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("idle");
      setToast({ message:"Registration failed. Please try again.", type:"error" });
    }
  };

  return (
    <section ref={ref} className="section-reveal" id="waitlist" aria-label="Early access waitlist" style={{ padding:"100px 24px 120px", position:"relative", overflow:"hidden", background:T.bgSurface }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        width:800, height:400, pointerEvents:"none",
        background:`radial-gradient(ellipse, ${T.accent}10 0%, transparent 70%)`,
      }} aria-hidden="true" />

      <div style={{ maxWidth:600, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px",
          borderRadius:20, background:T.bgPrimary, border:`1px solid ${T.border}`, marginBottom:24,
        }}>
          <div className="live-dot" style={{width:6,height:6}} aria-hidden="true" />
          <span style={{ fontSize:11, color:T.textSecondary, fontFamily:"'JetBrains Mono',monospace" }}>LIMITED EARLY ACCESS</span>
        </div>

        <h2 style={{
          fontFamily:"'Outfit',sans-serif", fontWeight:900,
          fontSize:"clamp(32px,5vw,56px)", color:T.textPrimary,
          lineHeight:1.05, letterSpacing:"-.02em", marginBottom:16,
        }}>
          Sovereign was built<br />
          <span className="accent-text">with Sovereign.</span>
        </h2>

        <p style={{ fontSize:16, color:T.textSecondary, lineHeight:1.7, marginBottom:12 }}>
          The same engine that governed every decision while building itself
          is now available to you.
        </p>
        <p style={{ fontSize:14, color:T.textTertiary, lineHeight:1.7, marginBottom:40, fontFamily:"'JetBrains Mono',monospace" }}>
          38 sessions · Phase G · production-ready
        </p>

        {state === "done" ? (
          <div style={{
            padding:"20px 28px", borderRadius:12,
            background:`${T.success}10`, border:`1px solid ${T.success}30`,
            animation:"stamp .4s cubic-bezier(.34,1.56,.64,1) both",
          }} role="status" aria-live="polite">
            <div style={{ fontSize:22, marginBottom:8 }} aria-hidden="true">✅</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:T.success, marginBottom:4 }}>You're on the list.</div>
            <div style={{ fontSize:13, color:T.textSecondary }}>We'll reach out when your access is ready.</div>
          </div>
        ) : (
          <div style={{ display:"flex", gap:10, maxWidth:440, margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
            <label htmlFor="waitlist-email" style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)" }}>
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ flex:"1 1 220px" }}
              aria-describedby="waitlist-hint"
              autoComplete="email"
            />
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={state === "loading" || !email.includes("@")}
              style={{ opacity:(!email.includes("@") || state === "loading") ? .5 : 1 }}
              aria-label="Join the early access waitlist"
            >
              {state === "loading" ? (
                <span style={{ display:"flex", alignItems:"center", gap:6 }} aria-label="Submitting…">
                  <span className="db0" style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}} aria-hidden="true"/>
                  <span className="db1" style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}} aria-hidden="true"/>
                  <span className="db2" style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}} aria-hidden="true"/>
                </span>
              ) : "Create Your Project Brain →"}
            </button>
          </div>
        )}

        <p id="waitlist-hint" style={{ fontSize:11, color:T.textTertiary, marginTop:16, fontFamily:"'JetBrains Mono',monospace" }}>
          No spam. No noise. Access when it's ready.
        </p>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop:`1px solid ${T.border}`, padding:"24px" }}>
      <div className="footer-inner" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:20, height:20, borderRadius:5,
            background:`linear-gradient(135deg,${T.accent},#9061F9)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, fontWeight:800, color:"#fff", fontFamily:"'Outfit',sans-serif",
          }}>S</div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.textTertiary }}>
            Sovereign Engine OS · v3.0 Unified
          </span>
        </div>
        <div style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
          "Control is the New Intelligence."
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div className="live-dot" style={{width:5,height:5}} />
          <span style={{ fontSize:11, color:T.success, fontFamily:"'JetBrains Mono',monospace" }}>All systems operational</span>
        </div>
      </div>
    </footer>
  );
}

// ── APP ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background:T.bgPrimary, minHeight:"100vh", position:"relative" }}>
      <GlobalStyle />
      <div className="noise-layer" />
      <Nav />
      <main style={{ position:"relative", zIndex:1 }}>
        <HeroSection />
        <StatusSection />
        <FableBanner />
        <ProblemSection />
        <AdapterSection />
        <BeforeAfterSection />
        <ROISection />
        <FeaturesSection />
        <LayersSection />
        <RiskTierSection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
}
