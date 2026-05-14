import { T } from "../tokens";

export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&family=Inter:wght@400;500;600;800&display=swap');
      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
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
      @keyframes wave-left {
        from { transform:translateX(-105%); }
        to   { transform:translateX(105%); }
      }
      @keyframes shake {
        0%,100% { transform:translateX(0); }
        12%  { transform:translateX(-9px); }
        25%  { transform:translateX(9px); }
        37%  { transform:translateX(-7px); }
        50%  { transform:translateX(7px); }
        62%  { transform:translateX(-3px); }
        75%  { transform:translateX(3px); }
      }
      @keyframes side-in {
        from { opacity:0; transform:translateX(20px); }
        to   { opacity:1; transform:translateX(0); }
      }
      @keyframes factor-in {
        from { opacity:0; transform:translateX(-10px); }
        to   { opacity:1; transform:translateX(0); }
      }
      @keyframes stamp {
        from { transform:scale(1.3) rotate(-2deg); opacity:0; }
        to   { transform:scale(1) rotate(0deg); opacity:1; }
      }
      @keyframes halo-pulse {
        0%,100% { opacity:.06; transform:scale(1); }
        50%     { opacity:.13; transform:scale(1.08); }
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
      @keyframes sk-pulse {
        0%,100% { opacity:.04; }
        50%     { opacity:.09; }
      }
      @keyframes pulse-ring {
        0%   { transform:scale(1); opacity:.5; }
        100% { transform:scale(2.6); opacity:0; }
      }
      @keyframes fade-in {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes head-in {
        from { opacity:0; transform:translateY(-12px); }
        to   { opacity:1; transform:translateY(0); }
      }

      .sv {
        background:${T.bgPrimary}; color:${T.textPrimary};
        font-family:'Inter',system-ui,sans-serif;
        min-height:100vh; display:flex;
        position:relative; overflow:hidden;
      }
      .sv::before {
        content:''; position:fixed; inset:-20%; width:140%; height:140%;
        background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        opacity:.014; pointer-events:none; z-index:0;
        animation:noise-drift 18s ease-in-out infinite;
      }
      .z { position:relative; z-index:1; }

      .pw:focus-within {
        border-color:${T.accent}!important;
        box-shadow:0 0 0 2px ${T.accent}26, 0 0 32px ${T.accent}0C!important;
      }
      .nb { transition:all .15s ease; }
      .nb:hover { color:${T.textSecondary}!important; background:${T.bgElevated}!important; }
      .nb.on { color:${T.accent}!important; background:${T.accent}12!important; border-left-color:${T.accent}!important; }
      .lt { transition:all .18s ease; }
      .lt:hover { background:${T.bgElevated}!important; }
      .lt.active { background:${T.accent}18!important; color:${T.accent}!important; }
      textarea { caret-color:${T.accent}; }
      .logo { transition:transform .15s ease; cursor:pointer; }
      .logo:hover { transform:scale(1.06) rotate(3deg); }
      .analyze-btn { transition:background .2s, color .2s, box-shadow .2s, transform .12s; }
      .analyze-btn:not(:disabled):hover { transform:scale(1.008); }
      .analyze-btn:not(:disabled):active { transform:scale(.985); }
      .action-btn { transition:background .15s, color .15s; }
      .action-btn:active { transform:scale(.96); }
      .accent-dot { animation:accent-cycle 5s linear infinite; }
      .card-anim  { animation:card-in .5s cubic-bezier(.16,1,.3,1) both; }
      .sweep-line { animation:sweep .72s ease forwards; }
      .wave-approve { animation:wave-left .42s cubic-bezier(.4,0,.6,1) forwards; }
      .shake-wrap { animation:shake .44s ease-out; }
      .side-anim  { animation:side-in .3s cubic-bezier(.16,1,.3,1) both; }
      .factor-anim { animation:factor-in .22s ease-out both; }
      .stamp-badge { animation:stamp .3s cubic-bezier(.34,1.56,.64,1) .1s both; }
      .halo-anim  { animation:halo-pulse 3s ease-in-out infinite; }
      .sk-block   { animation:sk-pulse 1.7s ease-in-out infinite; }
      .scan       { animation:scan-line 1.6s linear infinite; }
      .db0 { animation:dot-bounce .85s ease-in-out infinite 0s; }
      .db1 { animation:dot-bounce .85s ease-in-out infinite .2s; }
      .db2 { animation:dot-bounce .85s ease-in-out infinite .4s; }
      .pulse-ring { animation:pulse-ring 2.4s ease-out infinite; }
      .hbeat      { animation:heartbeat 2.4s ease-in-out infinite; }
      .decision-overlay { animation:fade-in .22s ease both; }
      .head-anim  { animation:head-in .44s cubic-bezier(.16,1,.3,1) both; }

      /* ── RESPONSIVE ── */
      .sidebar-desktop { display:flex; }
      .bottom-nav      { display:none; }

      @media (max-width:1023px) {
        .sidebar-desktop { display:none !important; }
      }
      @media (max-width:639px) {
        .bottom-nav { display:flex !important; }
        .right-panel-desktop { display:none !important; }
      }

      .bottom-nav {
        position:fixed; bottom:0; left:0; right:0; z-index:100;
        background:${T.bgPrimary}; border-top:1px solid ${T.border};
        justify-content:space-around; align-items:center;
        padding:8px 0 max(8px, env(safe-area-inset-bottom));
      }
      .bnav-item {
        flex:1; display:flex; flex-direction:column;
        align-items:center; gap:3; background:transparent;
        border:none; cursor:pointer; padding:4px 0;
        color:${T.textTertiary}; font-family:'JetBrains Mono',monospace;
        transition:color .15s;
      }
      .bnav-item.on { color:${T.accent}; }
      .bnav-item:hover { color:${T.textSecondary}; }
      .bnav-icon { font-size:16px; line-height:1; }
      .bnav-label { font-size:9px; font-weight:600; letter-spacing:.06em; }

      .right-panel-drawer {
        position:fixed; top:0; right:0; bottom:0; z-index:90;
        width:min(300px, 88vw);
        transform:translateX(100%);
        transition:transform .3s cubic-bezier(.4,0,.2,1);
        box-shadow:-8px 0 32px rgba(0,0,0,.5);
      }
      .right-panel-drawer.open { transform:translateX(0); }
      .drawer-backdrop {
        position:fixed; inset:0; z-index:89;
        background:rgba(0,0,0,.5);
        animation:fade-in .2s ease;
      }
      .drawer-toggle {
        position:fixed; bottom:72px; right:16px; z-index:88;
        width:40px; height:40px; border-radius:12px;
        background:${T.bgSurface}; border:1px solid ${T.border};
        color:${T.textSecondary}; font-size:16px;
        display:flex; align-items:center; justify-content:center;
        cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,.4);
        transition:background .15s, color .15s;
      }
      .drawer-toggle:hover { background:${T.bgElevated}; color:${T.textPrimary}; }

      @media (min-width:900px) {
        .drawer-toggle { display:none !important; }
        .right-panel-drawer { display:none !important; }
      }
      @media (max-width:899px) {
        .right-panel-desktop { display:none !important; }
      }
    `}</style>
  );
}
