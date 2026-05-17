import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS (from tokens.js) ─────────────────────────────
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

const getRiskColor = (s) => s <= 3 ? T.success : s <= 6 ? T.warning : T.danger;

// ── GLOBAL CSS ─────────────────────────────────────────────────
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;800&display=swap');

      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      html { scroll-behavior: smooth; }
      body { background:${T.bgPrimary}; color:${T.textPrimary}; font-family:'Inter',system-ui,sans-serif; overflow-x:hidden; }
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
      @keyframes accent-cycle {
        0%,100% { color:#7C3AED; }
        33%     { color:#9061F9; }
        66%     { color:#C4B5FD; }
      }
      @keyframes dot-bounce {
        0%,100% { transform:scale(1); opacity:.35; }
        50%     { transform:scale(1.6); opacity:1; }
      }
      @keyframes pulse-ring {
        0%   { transform:scale(1); opacity:.5; }
        100% { transform:scale(2.6); opacity:0; }
      }
      @keyframes fade-in {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes fade-up {
        from { opacity:0; transform:translateY(24px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes stamp {
        from { transform:scale(1.3) rotate(-2deg); opacity:0; }
        to   { transform:scale(1) rotate(0deg); opacity:1; }
      }
      @keyframes flow-line {
        0%   { stroke-dashoffset: 200; opacity:0; }
        20%  { opacity:1; }
        100% { stroke-dashoffset: 0; opacity:1; }
      }
      @keyframes node-pop {
        from { transform:scale(0.5); opacity:0; }
        to   { transform:scale(1); opacity:1; }
      }
      @keyframes number-tick {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes glow-pulse {
        0%,100% { box-shadow: 0 0 20px ${T.accent}22; }
        50%     { box-shadow: 0 0 40px ${T.accent}44, 0 0 80px ${T.accent}18; }
      }
      @keyframes risk-fill {
        from { width:0%; }
        to   { width:var(--target-w); }
      }
      @keyframes counter-up {
        from { opacity:0; transform:translateY(12px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes wave-approve {
        from { transform:translateX(-110%); }
        to   { transform:translateX(110%); }
      }
      @keyframes float {
        0%,100% { transform:translateY(0px); }
        50%     { transform:translateY(-6px); }
      }
      @keyframes grid-reveal {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes text-shimmer {
        0%   { background-position:0% 50%; }
        100% { background-position:200% 50%; }
      }

      .noise-layer {
        content:''; position:fixed; inset:-20%; width:140%; height:140%;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        opacity:.018; pointer-events:none; z-index:0;
        animation:noise-drift 18s ease-in-out infinite;
      }

      .section-reveal {
        opacity:0;
        transform:translateY(32px);
        transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
      }
      .section-reveal.visible {
        opacity:1;
        transform:translateY(0);
      }

      .hero-grid {
        background-image:
          linear-gradient(${T.border}40 1px, transparent 1px),
          linear-gradient(90deg, ${T.border}40 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
      }

      .accent-text {
        background: linear-gradient(135deg, #7C3AED 0%, #9061F9 40%, #C4B5FD 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .live-dot {
        width:8px; height:8px; border-radius:50%; background:${T.success};
        animation:heartbeat 2.4s ease-in-out infinite;
        position:relative;
      }
      .live-dot::after {
        content:''; position:absolute; inset:-4px; border-radius:50%;
        background:${T.success};
        animation:pulse-ring 2.4s ease-out infinite;
      }

      .db0 { animation:dot-bounce .85s ease-in-out infinite 0s; }
      .db1 { animation:dot-bounce .85s ease-in-out infinite .2s; }
      .db2 { animation:dot-bounce .85s ease-in-out infinite .4s; }

      .scan-active::after {
        content:''; position:absolute; left:0; right:0; height:2px;
        background:linear-gradient(90deg,transparent,${T.accent}60,transparent);
        animation:scan-line 1.8s linear infinite;
        pointer-events:none;
      }

      .btn-primary {
        background:${T.accent};
        color:#fff;
        border:none;
        padding:14px 28px;
        border-radius:10px;
        font-size:14px;
        font-weight:700;
        cursor:pointer;
        font-family:'Inter',sans-serif;
        letter-spacing:.02em;
        transition: transform .12s, box-shadow .2s;
        animation:glow-pulse 3s ease-in-out infinite;
      }
      .btn-primary:hover { transform:scale(1.025); }
      .btn-primary:active { transform:scale(.98); }

      .btn-ghost {
        background:transparent;
        color:${T.textSecondary};
        border:1px solid ${T.border};
        padding:13px 24px;
        border-radius:10px;
        font-size:14px;
        font-weight:600;
        cursor:pointer;
        font-family:'Inter',sans-serif;
        transition: background .15s, color .15s, border-color .15s;
      }
      .btn-ghost:hover { background:${T.bgElevated}; color:${T.textPrimary}; border-color:${T.textTertiary}; }

      .risk-card-demo {
        border-radius:14px;
        border:1px solid ${T.border};
        background:${T.bgSurface};
        padding:24px;
        position:relative;
        overflow:hidden;
        animation:card-in .6s cubic-bezier(.16,1,.3,1) both;
      }

      .tier-row {
        display:grid;
        grid-template-columns: 64px 80px 1fr 120px;
        align-items:center;
        gap:16px;
        padding:16px 20px;
        border-bottom:1px solid ${T.borderSubtle};
        transition:background .15s;
      }
      .tier-row:hover { background:${T.bgElevated}; }
      .tier-row:last-child { border-bottom:none; }

      @media (max-width:640px) {
        .tier-row { grid-template-columns:48px 1fr 90px; }
        .tier-row .tier-desc { display:none; }
      }

      /* ── MOBILE RESPONSIVE ─────────────────────────────────── */

      /* Nav */
      .nav-inner {
        max-width:1120px; margin:0 auto;
        height:60px; display:flex; align-items:center; justify-content:space-between;
        gap:8px;
      }
      .nav-status { display:flex; }
      .nav-cta { white-space:nowrap; flex-shrink:0; }
      @media (max-width:540px) {
        .nav-status { display:none; }
      }

      /* Hero text overflow fix */
      @media (max-width:640px) {
        .hero-h1 { font-size: clamp(28px,8vw,48px) !important; }
        .hero-desc { font-size:14px !important; max-width:100% !important; }
        .hero-quote { max-width:100% !important; overflow:hidden; word-break:break-word; }
        .hero-section { overflow:hidden; }
      }

      /* Hero layout */
      .hero-layout {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:64px;
        align-items:center;
      }
      .hero-card-col { display:flex; flex-direction:column; gap:16px; animation:fade-up .8s .4s both; }
      @media (max-width:768px) {
        .hero-layout { grid-template-columns:1fr; gap:40px; }
        .hero-card-col { display:none; }
      }

      /* Status grid */
      .status-grid {
        display:flex; gap:1px;
        border-radius:14px; overflow:hidden;
        border:1px solid ${T.border};
      }
      @media (max-width:768px) {
        .status-grid { display:grid; grid-template-columns:1fr 1fr; }
        .status-grid > div { border-right:none !important; border-bottom:1px solid ${T.border}; }
      }
      @media (max-width:420px) {
        .status-grid { grid-template-columns:1fr; }
      }

      /* Problem grid */
      .problem-grid {
        display:grid; grid-template-columns:repeat(3,1fr);
        gap:1px; border-radius:14px; overflow:hidden;
        border:1px solid ${T.border};
      }
      @media (max-width:768px) {
        .problem-grid { grid-template-columns:1fr; }
        .problem-grid > div { border-right:none !important; border-bottom:1px solid ${T.border}; }
        .problem-grid > div:last-child { border-bottom:none; }
      }

      /* Features grid */
      .features-grid {
        display:grid; grid-template-columns:repeat(3,1fr);
        gap:1px; border-radius:16px; overflow:hidden;
        border:1px solid ${T.border};
      }
      @media (max-width:768px) {
        .features-grid { grid-template-columns:1fr; }
        .features-grid > div { border-right:none !important; border-bottom:1px solid ${T.border}; }
        .features-grid > div:last-child { border-bottom:none; }
      }

      /* Hero stats */
      .hero-stats { display:flex; gap:32px; margin-top:40px; flex-wrap:wrap; }
      @media (max-width:480px) { .hero-stats { gap:20px; } }

      /* Section padding */
      @media (max-width:640px) {
        .section-pad { padding-left:16px !important; padding-right:16px !important; }
      }

      /* Footer */
      @media (max-width:540px) {
        .footer-inner { flex-direction:column; align-items:flex-start; gap:12px; }
      }

      .flow-node {
        display:flex; flex-direction:column; align-items:center; gap:8px;
        position:relative;
      }
      .flow-connector {
        flex:1; height:1px; background:linear-gradient(90deg, ${T.border}, ${T.accent}60, ${T.border});
        position:relative; overflow:hidden;
      }
      .flow-connector::after {
        content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
        background:linear-gradient(90deg, transparent, ${T.accent}, transparent);
        animation:wave-approve 1.6s ease-in-out infinite;
      }

      input[type="email"] {
        background:${T.bgSurface};
        border:1px solid ${T.border};
        border-radius:10px;
        padding:14px 18px;
        color:${T.textPrimary};
        font-size:14px;
        font-family:'Inter',sans-serif;
        outline:none;
        transition:border-color .15s, box-shadow .15s;
        caret-color:${T.accent};
      }
      input[type="email"]:focus {
        border-color:${T.accent};
        box-shadow:0 0 0 3px ${T.accent}22;
      }
      input[type="email"]::placeholder { color:${T.textTertiary}; }
    `}</style>
  );
}

// ── USE INTERSECTION OBSERVER ──────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── ANIMATED COUNTER ──────────────────────────────────────────
function Counter({ target, suffix = "" }) {
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
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── LIVE DECISION CARD (Hero) ──────────────────────────────────
const DEMO_DECISIONS = [
  { score: 7, area: "auth/session.ts · JWT rotation", reason: "Security layer touched. Token refresh logic modified across 3 modules.", status: "pending" },
  { score: 3, area: "ui/Button.tsx · style update", reason: "Low blast radius. No logic change, presentation only.", status: "auto" },
  { score: 9, area: "payments/stripe.ts · webhook handler", reason: "Critical path. New dependency on external API with no prior validation.", status: "pending" },
  { score: 5, area: "api/users.ts · rate limit config", reason: "Medium risk. Configuration change affecting all API consumers.", status: "pending" },
];

function LiveDecisionCard() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("show"); // show | deciding | done
  const [decision, setDecision] = useState(null);
  const [sweep, setSweep] = useState(true);
  const d = DEMO_DECISIONS[idx];
  const rc = getRiskColor(d.score);

  useEffect(() => {
    setSweep(true);
    const st = setTimeout(() => setSweep(false), 900);
    return () => clearTimeout(st);
  }, [idx]);

  useEffect(() => {
    if (d.status === "auto") {
      const t1 = setTimeout(() => setPhase("deciding"), 1800);
      const t2 = setTimeout(() => { setDecision("approved"); setPhase("done"); }, 2400);
      const t3 = setTimeout(() => {
        setPhase("show"); setDecision(null);
        setIdx(i => (i + 1) % DEMO_DECISIONS.length);
      }, 4200);
      return () => [t1,t2,t3].forEach(clearTimeout);
    } else {
      const t1 = setTimeout(() => setPhase("deciding"), 2200);
      const t2 = setTimeout(() => { setDecision(Math.random() > .3 ? "approved" : "rejected"); setPhase("done"); }, 3000);
      const t3 = setTimeout(() => {
        setPhase("show"); setDecision(null);
        setIdx(i => (i + 1) % DEMO_DECISIONS.length);
      }, 5000);
      return () => [t1,t2,t3].forEach(clearTimeout);
    }
  }, [idx, d.status]);

  const cardBg = decision === "approved" ? `${T.success}0D`
               : decision === "rejected" ? `${T.danger}09`
               : T.bgSurface;

  return (
    <div className="risk-card-demo" style={{
      borderLeft:`4px solid ${rc}`,
      background: cardBg,
      transition:"background .5s ease",
      maxWidth:480, width:"100%",
    }}>
      {/* Scan line */}
      {phase === "deciding" && (
        <div style={{
          position:"absolute", left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${rc}60,transparent)`,
          animation:"scan-line 1.2s linear infinite", pointerEvents:"none", top:0
        }} />
      )}

      {/* Sweep */}
      {sweep && (
        <div style={{
          position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
          background:`linear-gradient(90deg, transparent, ${rc}28, ${rc}14, transparent)`,
          animation:"sweep .8s ease forwards",
        }} />
      )}

      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Risk circle */}
          <div style={{
            width:48, height:48, borderRadius:"50%",
            border:`2px solid ${rc}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:`${rc}12`, flexShrink:0, position:"relative",
          }}>
            <div style={{
              position:"absolute", inset:-6, borderRadius:"50%",
              background:rc, opacity:.06,
              animation:"halo-pulse 3s ease-in-out infinite",
            }} />
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:rc, position:"relative" }}>
              {d.score}
            </span>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".18em", color:rc, marginBottom:4 }}>
              {d.score <= 3 ? "LOW RISK" : d.score <= 6 ? "MEDIUM RISK" : "HIGH RISK"}
            </div>
            <div style={{
              fontSize:11, color:T.textSecondary,
              fontFamily:"'JetBrains Mono',monospace",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200,
            }}>{d.area}</div>
          </div>
        </div>
        <div style={{
          fontSize:9, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace",
          display:"flex", alignItems:"center", gap:4
        }}>
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

      {/* Reason */}
      <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7, marginBottom:16 }}>
        {d.reason}
      </p>

      {/* Actions or result */}
      {phase === "show" && d.status !== "auto" && (
        <div style={{ display:"flex", gap:8 }}>
          <button style={{
            padding:"8px 16px", borderRadius:7, border:`1px solid ${T.success}`,
            background:"transparent", color:T.success, fontSize:12, fontWeight:600,
            cursor:"pointer", fontFamily:"inherit",
          }}>✅ Approve</button>
          <button style={{
            padding:"8px 16px", borderRadius:7, border:`1px solid ${T.danger}`,
            background:"transparent", color:T.danger, fontSize:12, fontWeight:600,
            cursor:"pointer", fontFamily:"inherit",
          }}>❌ Reject</button>
          <button style={{
            padding:"7px 12px", borderRadius:7, border:`1px solid ${T.border}`,
            background:"transparent", color:T.textSecondary, fontSize:11,
            cursor:"pointer", fontFamily:"inherit", marginLeft:"auto",
          }}>? Why</button>
        </div>
      )}

      {phase === "show" && d.status === "auto" && (
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
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          animation:"stamp .3s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          <div style={{
            padding:"8px 16px", borderRadius:7,
            background: decision === "approved" ? `${T.success}14` : `${T.danger}12`,
            border: `1px solid ${decision === "approved" ? T.success : T.danger}40`,
          }}>
            <span style={{
              fontSize:12, fontWeight:700, letterSpacing:".1em",
              color: decision === "approved" ? T.success : T.danger,
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

// ── NAV ────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 24px",
      background: scrolled ? `${T.bgPrimary}E8` : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "none",
      transition:"all .25s ease",
    }}>
      <div className="nav-inner">
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:28, height:28, borderRadius:7,
            background:`linear-gradient(135deg,${T.accent},#9061F9)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:"#fff",
            fontFamily:"'Syne',sans-serif",
          }}>S</div>
          <span style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:15, color:T.textPrimary, letterSpacing:".02em",
          }}>SOVEREIGN<span className="accent-text"> ENGINE</span></span>
        </div>

        {/* Status pill */}
        <div className="nav-status" style={{
          alignItems:"center", gap:7,
          padding:"5px 12px", borderRadius:20,
          background:T.bgSurface, border:`1px solid ${T.border}`,
        }}>
          <div className="live-dot" />
          <span style={{ fontSize:11, color:T.success, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
            OPERATIONAL
          </span>
        </div>

        {/* CTA — CHANGED: href="#waitlist" → href="/junior", "Get Access →" → "Open App →" */}
        <a href="/junior" style={{ textDecoration:"none" }}>
          <button className="btn-primary nav-cta" style={{ padding:"9px 18px", fontSize:13, animation:"none" }}>
            Open App →
          </button>
        </a>
      </div>
    </nav>
  );
}

// ── SECTION 1: HERO ────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero-section" style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      position:"relative", overflow:"hidden",
      padding:"80px 24px 60px",
    }}>
      {/* Grid bg */}
      <div className="hero-grid" style={{
        position:"absolute", inset:0, pointerEvents:"none",
      }} />

      {/* Radial glow */}
      <div style={{
        position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)",
        width:600, height:600, borderRadius:"50%",
        background:`radial-gradient(ellipse, ${T.accent}12 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />

      <div style={{ maxWidth:1120, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
        <div className="hero-layout">

          {/* Left: Copy */}
          <div>
            {/* Pre-badge */}
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"6px 14px", borderRadius:20,
              background:T.bgSurface, border:`1px solid ${T.border}`,
              marginBottom:28, animation:"fade-up .6s .1s both",
            }}>
              <div className="live-dot" style={{width:6,height:6}} />
              <span style={{ fontSize:11, color:T.textSecondary, fontFamily:"'JetBrains Mono',monospace", fontWeight:500 }}>
                AI DECISION CONTROL LAYER · v3.0
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-h1" style={{
              fontFamily:"'Syne',sans-serif", fontWeight:900,
              fontSize:"clamp(40px,5vw,68px)", lineHeight:1.0,
              color:T.textPrimary, marginBottom:12,
              animation:"fade-up .7s .2s both",
              letterSpacing:"-.02em",
            }}>
              Control is the<br />
              <span className="accent-text">New Intelligence.</span>
            </h1>

            <p className="hero-desc" style={{
              fontSize:"clamp(15px,1.6vw,18px)", color:T.textSecondary,
              lineHeight:1.7, maxWidth:440,
              marginBottom:36, animation:"fade-up .7s .35s both",
            }}>
              Every AI action intercepted. Every risk scored. Low-risk auto-approved. 
              High-risk escalated to you. Permanent memory. Zero context loss.
            </p>

            {/* Single question */}
            <div className="hero-quote" style={{
              padding:"14px 20px", borderRadius:10,
              background:`${T.accent}10`, border:`1px solid ${T.accent}30`,
              marginBottom:36, animation:"fade-up .7s .45s both",
            }}>
              <span style={{ fontSize:13, color:T.textSecondary }}>The only question that matters: </span>
              <span style={{ fontSize:13, color:T.textPrimary, fontWeight:600 }}>
                "Can I ship this to production?"
              </span>
            </div>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap", animation:"fade-up .7s .55s both" }}>
              <a href="#waitlist" style={{ textDecoration:"none" }}>
                <button className="btn-primary">Reclaim Authority →</button>
              </a>
              <a href="#how" style={{ textDecoration:"none" }}>
                <button className="btn-ghost">See How It Works</button>
              </a>
            </div>

            {/* Stats row */}
            <div className="hero-stats" style={{ animation:"fade-up .7s .65s both" }}>
              {[
                { num:1422, label:"decisions guarded" },
                { num:94, label:"% auto-approved", suffix:"%" },
                { num:0, label:"context gaps", suffix:"" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:T.textPrimary }}>
                    {s.label === "context gaps" ? "Zero" : <Counter target={s.num} suffix={s.suffix||""} />}
                  </div>
                  <div style={{ fontSize:11, color:T.textTertiary, marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live demo card */}
          <div className="hero-card-col">
            {/* Terminal header */}
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"10px 16px",
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

            {/* Engine hint */}
            <div style={{
              padding:"12px 16px",
              background:T.bgSurface, border:`1px solid ${T.borderSubtle}`,
              borderRadius:10, display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                engine://memory+semantic_diff+policy
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

// ── SECTION 2: STATUS BADGE ────────────────────────────────────
function StatusSection() {
  const ref = useReveal();
  return (
    <div ref={ref} className="section-reveal" style={{ padding:"0 24px 80px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div className="status-grid">
          {[
            { label:"DECISIONS GUARDED", value:<Counter target={1422} />, color:T.textPrimary, bg:T.bgSurface },
            { label:"AUTO-APPROVED", value:<><Counter target={1339} /> <span style={{fontSize:12,color:T.textTertiary}}>(94.1%)</span></>, color:T.success, bg:`${T.success}08` },
            { label:"ESCALATED", value:<Counter target={83} />, color:T.warning, bg:`${T.warning}08` },
            { label:"REJECTED", value:<Counter target={0} />, color:T.danger, bg:`${T.danger}08` },
            { label:"MEMORY SNAPSHOTS", value:<Counter target={247} />, color:T.accent, bg:`${T.accent}08` },
          ].map((s,i) => (
            <div key={i} style={{
              flex:1, padding:"20px 16px", background:s.bg,
              borderRight: i < 4 ? `1px solid ${T.border}` : "none",
              textAlign:"center",
            }}>
              <div style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:26, color:s.color, lineHeight:1, marginBottom:6,
              }}>{s.value}</div>
              <div style={{
                fontSize:9, color:T.textTertiary, letterSpacing:".14em",
                fontFamily:"'JetBrains Mono',monospace", fontWeight:600,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SECTION 3: PROBLEM ────────────────────────────────────────
const PROBLEMS = [
  {
    icon: "◼",
    title: "The Black Box",
    color: T.danger,
    body: "Your AI makes hundreds of decisions. You see zero of them. When something breaks at 2AM, you have no audit trail, no memory, no context. Just broken production.",
    stat: "0%",
    statLabel: "visibility into AI actions",
  },
  {
    icon: "◈",
    title: "Token Hemorrhage",
    color: T.warning,
    body: "Every new conversation, the AI starts blind. No memory of last week's failed deploy. No context of the codebase patterns. Same mistakes. Different day.",
    stat: "∞",
    statLabel: "repeated context re-loading",
  },
  {
    icon: "◉",
    title: "Context Void",
    color: T.accent,
    body: "The gap between what your AI knows and what it needs to know keeps growing. Without persistent memory, every action is a shot in the dark.",
    stat: "100%",
    statLabel: "of context lost between sessions",
  },
];

function ProblemSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="section-reveal" id="problems" style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            THE PROBLEM
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            AI without control is<br />
            <span style={{ color:T.danger }}>a liability.</span>
          </h2>
        </div>

        <div className="problem-grid">
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              padding:"32px 28px",
              background:T.bgSurface,
              borderRight: i < 2 ? `1px solid ${T.border}` : "none",
              position:"relative", overflow:"hidden",
              transition:"background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgElevated}
              onMouseLeave={e => e.currentTarget.style.background = T.bgSurface}
            >
              {/* Icon */}
              <div style={{
                fontSize:28, color:p.color, marginBottom:20,
                fontFamily:"'JetBrains Mono',monospace",
              }}>{p.icon}</div>

              {/* Stat */}
              <div style={{
                fontFamily:"'Syne',sans-serif", fontWeight:900,
                fontSize:42, color:p.color, lineHeight:1, marginBottom:4,
                opacity:.9,
              }}>{p.stat}</div>
              <div style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".1em", marginBottom:20 }}>
                {p.statLabel}
              </div>

              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:T.textPrimary, marginBottom:12 }}>
                {p.title}
              </h3>
              <p style={{ fontSize:14, color:T.textSecondary, lineHeight:1.7 }}>{p.body}</p>

              {/* Corner accent */}
              <div style={{
                position:"absolute", top:0, right:0, width:60, height:60,
                background:`radial-gradient(circle at 100% 0%, ${p.color}14, transparent 70%)`,
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SECTION 4: CORE FLOW ──────────────────────────────────────
function FlowSection() {
  const ref = useReveal();
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % 5;
      setStep(stepRef.current);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { id:0, icon:"✍", label:"Prompt", sub:"User intent" },
    { id:1, icon:"⚙", label:"Engine", sub:"Hidden layer", hidden:true },
    { id:2, icon:"◈", label:"Risk Score", sub:"0–10" },
    { id:3, icon:"⚡", label:"Decision", sub:"Route" },
    { id:4, icon:"✅", label:"Action", sub:"Or escalate" },
  ];

  return (
    <section ref={ref} className="section-reveal" id="how" style={{ padding:"80px 24px", background:T.bgSurface }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            CORE FLOW
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            Explain less.<br />
            <span className="accent-text">Decide more.</span>
          </h2>
          <p style={{ fontSize:16, color:T.textSecondary, maxWidth:460, margin:"16px auto 0", lineHeight:1.6 }}>
            The engine runs invisibly between your AI and production. You only see what matters.
          </p>
        </div>

        {/* Flow visualization */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:0,
          padding:"40px 24px", borderRadius:16,
          background:T.bgPrimary, border:`1px solid ${T.border}`,
          overflowX:"auto",
        }}>
          {nodes.map((n, i) => (
            <>
              <div key={n.id} className="flow-node" style={{
                opacity: step >= n.id ? 1 : .25,
                transition:"opacity .4s ease",
                minWidth:80,
              }}>
                <div style={{
                  width:52, height:52, borderRadius:12,
                  background: step >= n.id
                    ? n.hidden ? `${T.textTertiary}14` : `${T.accent}18`
                    : T.bgSurface,
                  border:`2px solid ${step >= n.id ? (n.hidden ? T.textTertiary : T.accent) : T.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:20, transition:"all .4s ease",
                  position:"relative",
                }}>
                  {n.hidden ? (
                    <span style={{ fontSize:13, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>???</span>
                  ) : (
                    <span>{n.icon}</span>
                  )}
                  {step === n.id && (
                    <div style={{
                      position:"absolute", inset:-6, borderRadius:16,
                      border:`1px solid ${T.accent}40`,
                      animation:"halo-pulse 1.2s ease-in-out infinite",
                    }} />
                  )}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:step >= n.id ? T.textPrimary : T.textTertiary, transition:"color .4s" }}>
                  {n.label}
                </span>
                <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                  {n.sub}
                </span>
              </div>
              {i < nodes.length - 1 && (
                <div key={`c-${i}`} className="flow-connector" style={{
                  width:40, flexShrink:0,
                  opacity: step > i ? 1 : .15,
                  transition:"opacity .4s ease",
                }} />
              )}
            </>
          ))}
        </div>

        {/* Hidden engine callout */}
        <div style={{
          marginTop:24, padding:"16px 20px", borderRadius:10,
          background:`${T.bgPrimary}`, border:`1px dashed ${T.border}`,
          display:"flex", alignItems:"center", gap:12,
        }}>
          <span style={{ fontSize:13, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>engine://</span>
          <span style={{ fontSize:13, color:T.textSecondary }}>
            Memory retrieval + semantic diff + policy engine — all invisible to the user.
          </span>
          <div style={{
            marginLeft:"auto", padding:"4px 10px", borderRadius:6,
            background:T.bgSurface, border:`1px solid ${T.border}`,
            fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace",
          }}>HIDDEN</div>
        </div>
      </div>
    </section>
  );
}

// ── SECTION 5: FEATURES ───────────────────────────────────────
const FEATURES = [
  {
    tag:"01",
    title:"Interception Overlay",
    body:"Wraps every AI action before execution. No changes to your existing workflow. Runs as a transparent middleware layer — your AI doesn't even know it's there.",
    color:T.danger,
    metric:"< 8ms", metricLabel:"interception latency",
  },
  {
    tag:"02",
    title:"Persistent Memory",
    body:"Hot, warm, cold memory tiers. Every decision, every context, every pattern — remembered permanently. The engine knows your codebase better than your team does.",
    color:T.accent,
    metric:"247", metricLabel:"memory snapshots",
  },
  {
    tag:"03",
    title:"GitHub Auto-Commit",
    body:"Every approved change is automatically committed with full audit trail. Rejected actions are logged with reasoning. Complete decision history, zero manual work.",
    color:T.success,
    metric:"100%", metricLabel:"audit coverage",
  },
];

function FeaturesSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            CAPABILITIES
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            Built for operators<br />who don't accept<br />
            <span style={{ color:T.warning }}>"trust me."</span>
          </h2>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding:"36px 28px",
              background:T.bgSurface,
              borderRight: i < 2 ? `1px solid ${T.border}` : "none",
              position:"relative", overflow:"hidden",
              transition:"background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgElevated}
              onMouseLeave={e => e.currentTarget.style.background = T.bgSurface}
            >
              {/* Tag */}
              <div style={{
                fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:".2em", fontWeight:700, marginBottom:24,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <span>{f.tag}</span>
                <div style={{
                  padding:"4px 10px", borderRadius:6,
                  background:`${f.color}14`, border:`1px solid ${f.color}30`,
                }}>
                  <span style={{ fontSize:12, fontWeight:800, color:f.color, fontFamily:"'Syne',sans-serif" }}>
                    {f.metric}
                  </span>
                  <span style={{ fontSize:9, color:T.textTertiary, marginLeft:4 }}>
                    {f.metricLabel}
                  </span>
                </div>
              </div>

              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:T.textPrimary, marginBottom:14 }}>
                {f.title}
              </h3>
              <p style={{ fontSize:14, color:T.textSecondary, lineHeight:1.7 }}>{f.body}</p>

              {/* Bottom border accent */}
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, height:3,
                background:`linear-gradient(90deg, ${f.color}60, ${f.color}20, transparent)`,
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SECTION 6: RISK TIER TABLE ────────────────────────────────
const TIERS = [
  {
    tier:0, range:"0–3", label:"Low Risk", color:T.success,
    desc:"Auto-approved. No human required. Engine continues.",
    action:"AUTO_APPROVED", count:1339,
  },
  {
    tier:1, range:"4–5", label:"Medium Risk", color:T.warning,
    desc:"Logged with reasoning. Human review optional.",
    action:"REVIEW_OPTIONAL", count:62,
  },
  {
    tier:2, range:"6–7", label:"High Risk", color:"#F97316",
    desc:"Requires explicit human approval before execution.",
    action:"PENDING_HUMAN", count:18,
  },
  {
    tier:3, range:"8–10", label:"Critical Risk", color:T.danger,
    desc:"Hard lock. Execution blocked. Immediate escalation.",
    action:"HARD_BLOCK", count:3,
  },
];

function RiskTierSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="section-reveal" style={{ padding:"80px 24px", background:T.bgSurface }}>
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".18em", marginBottom:12 }}>
            RISK ARCHITECTURE
          </div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(28px,3.5vw,44px)", color:T.textPrimary, letterSpacing:"-.01em" }}>
            Four tiers.<br />
            <span className="accent-text">No ambiguity.</span>
          </h2>
        </div>

        <div style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${T.border}` }}>
          {/* Header */}
          <div className="tier-row" style={{
            background:T.bgElevated, borderBottom:`1px solid ${T.border}`,
            padding:"12px 20px",
          }}>
            <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em" }}>TIER</span>
            <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em" }}>SCORE</span>
            <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em" }}>DESCRIPTION</span>
            <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:".14em" }}>ACTION</span>
          </div>

          {TIERS.map((t, i) => (
            <div key={i} className="tier-row" style={{ background:T.bgSurface }}>
              {/* Tier badge */}
              <div style={{
                width:36, height:36, borderRadius:8,
                background:`${t.color}14`, border:`1px solid ${t.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:t.color,
              }}>{t.tier}</div>

              {/* Range */}
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:t.color }}>
                {t.range}
              </div>

              {/* Desc */}
              <div className="tier-desc">
                <div style={{ fontSize:13, fontWeight:600, color:T.textPrimary, marginBottom:3 }}>{t.label}</div>
                <div style={{ fontSize:12, color:T.textSecondary }}>{t.desc}</div>
              </div>

              {/* Action */}
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{
                  padding:"4px 10px", borderRadius:6,
                  background:`${t.color}12`, border:`1px solid ${t.color}25`,
                  fontSize:10, fontWeight:700, color:t.color,
                  fontFamily:"'JetBrains Mono',monospace", letterSpacing:".08em",
                  whiteSpace:"nowrap",
                }}>{t.action}</div>
                <div style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", paddingLeft:2 }}>
                  {t.count} decisions
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual bar */}
        <div style={{ marginTop:20, display:"flex", height:6, borderRadius:4, overflow:"hidden", gap:2 }}>
          {TIERS.map(t => (
            <div key={t.tier} style={{
              flex:t.count, background:t.color,
              opacity:.7, borderRadius:2,
              transition:"flex .6s ease",
            }} />
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          {TIERS.map(t => (
            <span key={t.tier} style={{ fontSize:9, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
              {t.count}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SECTION 7: CTA / WAITLIST ─────────────────────────────────
function WaitlistSection() {
  const ref = useReveal();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done

  const handleSubmit = () => {
    if (!email.includes("@")) return;
    setState("loading");
    setTimeout(() => setState("done"), 1400);
  };

  return (
    <section ref={ref} className="section-reveal" id="waitlist" style={{ padding:"100px 24px 120px", position:"relative", overflow:"hidden" }}>
      {/* Background glow */}
      <div style={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        width:800, height:400, pointerEvents:"none",
        background:`radial-gradient(ellipse, ${T.accent}10 0%, transparent 70%)`,
      }} />

      <div style={{ maxWidth:600, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"6px 14px", borderRadius:20,
          background:T.bgSurface, border:`1px solid ${T.border}`,
          marginBottom:24,
        }}>
          <div className="live-dot" style={{width:6,height:6}} />
          <span style={{ fontSize:11, color:T.textSecondary, fontFamily:"'JetBrains Mono',monospace" }}>
            LIMITED EARLY ACCESS
          </span>
        </div>

        <h2 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:900,
          fontSize:"clamp(32px,5vw,56px)", color:T.textPrimary,
          lineHeight:1.05, letterSpacing:"-.02em", marginBottom:16,
        }}>
          Your AI should work<br />
          <span className="accent-text">for you.</span><br />
          Not around you.
        </h2>

        <p style={{ fontSize:16, color:T.textSecondary, lineHeight:1.7, marginBottom:40 }}>
          Join operators who've taken back control. Sovereign Engine OS guards every AI decision — so you can ship with confidence.
        </p>

        {state === "done" ? (
          <div style={{
            padding:"20px 28px", borderRadius:12,
            background:`${T.success}10`, border:`1px solid ${T.success}30`,
            animation:"stamp .4s cubic-bezier(.34,1.56,.64,1) both",
          }}>
            <div style={{ fontSize:22, marginBottom:8 }}>✅</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:T.success, marginBottom:4 }}>
              You're on the list.
            </div>
            <div style={{ fontSize:13, color:T.textSecondary }}>
              We'll reach out when your access is ready.
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", gap:10, maxWidth:440, margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ flex:"1 1 220px" }}
            />
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={state === "loading" || !email.includes("@")}
              style={{ opacity: !email.includes("@") ? .5 : 1 }}
            >
              {state === "loading" ? (
                <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span className="db0" style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
                  <span className="db1" style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
                  <span className="db2" style={{width:5,height:5,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
                </span>
              ) : "Reclaim Authority →"}
            </button>
          </div>
        )}

        <p style={{ fontSize:11, color:T.textTertiary, marginTop:16, fontFamily:"'JetBrains Mono',monospace" }}>
          No spam. No noise. Access when it's ready.
        </p>
      </div>
    </section>
  );
}

// ── FOOTER ─────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop:`1px solid ${T.border}`,
      padding:"24px",
    }}>
      <div className="footer-inner" style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:12,
      }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{
          width:20, height:20, borderRadius:5,
          background:`linear-gradient(135deg,${T.accent},#9061F9)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:10, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif",
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
        <span style={{ fontSize:11, color:T.success, fontFamily:"'JetBrains Mono',monospace" }}>
          All systems operational
        </span>
      </div>
      </div>
    </footer>
  );
}

// ── ROOT APP ───────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background:T.bgPrimary, minHeight:"100vh", position:"relative" }}>
      <GlobalStyle />
      <div className="noise-layer" />
      <Nav />
      <main style={{ position:"relative", zIndex:1 }}>
        <HeroSection />
        <StatusSection />
        <ProblemSection />
        <FlowSection />
        <FeaturesSection />
        <RiskTierSection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
}
