import { T, getRiskColor } from "../tokens";
import { LANG } from "../lang";
import { EmptyState } from "../components/RightPanel";

function CardSkeleton() {
  return (
    <div style={{ padding:"10px 0", borderBottom:`1px solid ${T.borderSubtle}` }}>
      {[120, 80, 100].map((w, i) => (
        <div key={i} style={{
          height:10, width:w, borderRadius:4,
          background:T.bgElevated, marginBottom: i < 2 ? 6 : 0,
          animation:"pulse 1.4s ease-in-out infinite",
          animationDelay:`${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

export function DashboardScreen({ cards, autoCount, lang, onGoPrompt, loadingCards, onRefresh }) {
  const L = LANG[lang];
  const safe    = cards.filter(c => c.riskScore <= 3).length + autoCount;
  const pending = cards.filter(c => c.status === "PENDING_HUMAN").length;
  const blocked = cards.filter(c => c.riskScore >= 7).length;
  const recent  = [...cards].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10);

  const chips = [
    { icon:"🟢", count:safe,    label:L.safe,        color:T.success },
    { icon:"🟡", count:pending, label:L.pendingChip, color:T.warning },
    { icon:"🔴", count:blocked, label:L.blocked,     color:T.danger  },
  ];

  return (
    <div style={{ animation:"fade-in .25s ease" }}>
      {/* Özet chips */}
      <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
        {chips.map(ch => (
          <div key={ch.label} style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 14px",
            background:T.bgSurface, border:`1px solid ${T.border}`,
            borderBottom:`2px solid ${ch.color}30`,
            borderRadius:10, flex:"1 1 auto", minWidth:90,
          }}>
            <span style={{ fontSize:16 }}>{ch.icon}</span>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:ch.color, lineHeight:1, fontFamily:"'Inter',sans-serif" }}>
                {ch.count}
              </div>
              <div style={{ fontSize:9, color:T.textTertiary, marginTop:2, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".06em" }}>
                {ch.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header + refresh */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:".14em", color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
          {L.recentChanges}
        </div>
        <button onClick={onRefresh} disabled={loadingCards} style={{
          background:"transparent", border:`1px solid ${T.border}`,
          borderRadius:6, padding:"3px 10px",
          fontSize:9, fontWeight:600, cursor: loadingCards ? "not-allowed" : "pointer",
          color: loadingCards ? T.textTertiary : T.accent,
          fontFamily:"'JetBrains Mono',monospace", letterSpacing:".06em",
          opacity: loadingCards ? 0.5 : 1, transition:"opacity .15s",
        }}>
          {loadingCards ? "..." : "↻ SYNC"}
        </button>
      </div>

      {loadingCards ? (
        Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
      ) : recent.length === 0 ? (
        <EmptyState icon="◈" title={L.emptyDash} sub={L.emptyDashSub} cta={L.goPrompt} onCta={onGoPrompt} />
      ) : (
        recent.map(c => {
          const rc = getRiskColor(c.riskScore);
          const sc = c.status === "APPROVED" ? T.success : c.status === "REJECTED" ? T.danger : T.warning;
          const sl = c.status === "APPROVED" ? L.approved
                   : c.status === "REJECTED" ? L.rejected
                   : c.status === "AUTO_APPROVED" ? L.auto : L.pending;
          return (
            <div key={c.id} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 0", borderBottom:`1px solid ${T.borderSubtle}`,
              animation:"fade-in .2s ease",
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:rc, flexShrink:0 }} />
              <span style={{
                fontSize:11, color:T.textSecondary, flex:1,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                fontFamily:"'JetBrains Mono',monospace",
              }}>{c.affectedArea}</span>
              <span style={{ fontSize:10, fontWeight:700, color:rc, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>
                {c.riskScore}/10
              </span>
              <span style={{ fontSize:9, fontWeight:700, color:sc, flexShrink:0, letterSpacing:".06em" }}>
                {sl}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
