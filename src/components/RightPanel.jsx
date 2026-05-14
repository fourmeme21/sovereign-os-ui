import { T, getRiskColor } from "../tokens";
import { LANG } from "../lang";

// ── HeartDot ──────────────────────────────────────────
export function HeartDot({ count, lang }) {
  const L = LANG[lang];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <div style={{ position:"relative", width:10, height:10 }}>
        <div className="pulse-ring" style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.success }} />
        <div className="hbeat"      style={{ position:"absolute", inset:0, borderRadius:"50%", background:T.success }} />
      </div>
      <span style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
        {count} {L.passed}
      </span>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────
export function EmptyState({ icon, title, sub, cta, onCta }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"64px 24px", gap:12,
      animation:"fade-in .3s ease",
    }}>
      <div style={{ fontSize:36, opacity:.18, lineHeight:1, marginBottom:4, filter:"grayscale(1)" }}>
        {icon}
      </div>
      <p style={{ fontSize:14, fontWeight:600, color:T.textSecondary, textAlign:"center", margin:0 }}>
        {title}
      </p>
      {sub && (
        <p style={{ fontSize:12, color:T.textTertiary, textAlign:"center", margin:0, lineHeight:1.6 }}>
          {sub}
        </p>
      )}
      {cta && (
        <button onClick={onCta} style={{
          marginTop:8, padding:"8px 20px", borderRadius:8,
          border:`1px solid ${T.border}`,
          background:"transparent", color:T.textSecondary,
          fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          transition:"background .15s, color .15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.bgElevated; e.currentTarget.style.color = T.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}
        >{cta}</button>
      )}
    </div>
  );
}

// ── MiniBtn ───────────────────────────────────────────
export function MiniBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"5px 0", borderRadius:6,
      border:`1px solid ${color}`,
      background:"transparent", color,
      fontSize:10, fontWeight:600, cursor:"pointer",
      fontFamily:"inherit", transition:"background .12s",
    }}>{children}</button>
  );
}

// ── StatRow ───────────────────────────────────────────
export function StatRow({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
      <span style={{ fontSize:11, color:T.textTertiary }}>{label}</span>
      <span style={{ fontSize:11, fontWeight:700, color: color || T.textSecondary, fontFamily:"'JetBrains Mono',monospace" }}>
        {value}
      </span>
    </div>
  );
}

// ── SideCard ──────────────────────────────────────────
export function SideCard({ card, lang, onApprove, onReject }) {
  const L  = LANG[lang];
  const rc = getRiskColor(card.riskScore);
  const sc = card.status === "APPROVED" ? T.success : card.status === "REJECTED" ? T.danger : T.warning;
  const sl = card.status === "APPROVED" ? L.approved : card.status === "REJECTED" ? L.rejected : L.pending;

  return (
    <div className="side-anim" style={{
      background:`${rc}07`, border:`1px solid ${T.border}`,
      borderLeft:`3px solid ${rc}`, borderRadius:9,
      padding:"10px 12px", marginBottom:6,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", color:sc }}>{sl}</span>
        <span style={{ fontSize:11, fontWeight:700, color:rc, fontFamily:"'JetBrains Mono',monospace" }}>
          {card.riskScore}/10
        </span>
      </div>
      <div style={{
        fontSize:11, color:T.textSecondary,
        marginBottom: card.status === "PENDING_HUMAN" ? 8 : 4,
        lineHeight:1.45, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
      }}>
        {card.affectedArea}
      </div>
      {card.status === "PENDING_HUMAN" && (
        <div style={{ display:"flex", gap:5 }}>
          <MiniBtn color={T.success} onClick={() => onApprove(card.id)}>✅ {L.approve}</MiniBtn>
          <MiniBtn color={T.danger}  onClick={() => onReject(card.id)}>❌ {L.reject}</MiniBtn>
        </div>
      )}
      <div style={{ fontSize:9, color:T.textTertiary, marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>
        {card.ago}
      </div>
    </div>
  );
}

// ── RightPanelContent ─────────────────────────────────
export function RightPanelContent({ L, autoCount, visible, cards, approved, rejected, approve, reject, lang }) {
  return (
    <>
      <div style={{
        padding:"14px 16px 12px",
        borderBottom:`1px solid ${T.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:".14em", color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
          {L.decisionFlow}
        </span>
        <HeartDot count={autoCount} lang={lang} />
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"10px 10px" }}>
        {visible.length === 0
          ? <div style={{ textAlign:"center", padding:"32px 0", fontSize:11, color:T.textTertiary }}>{L.empty}</div>
          : visible.map(c => <SideCard key={c.id} card={c} onApprove={approve} onReject={reject} lang={lang} />)
        }
      </div>

      <div style={{ borderTop:`1px solid ${T.border}`, padding:"12px 16px" }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:".12em", color:T.textTertiary, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>
          {L.session}
        </div>
        <StatRow label={L.total}        value={cards.length + autoCount} />
        <StatRow label={L.auto}         value={autoCount}  color={T.success} />
        <StatRow label={L.approvedStat} value={approved}   color={T.success} />
        <StatRow label={L.rejectedStat} value={rejected}   color={T.danger}  />
      </div>
    </>
  );
}
