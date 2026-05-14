import { useState } from "react";
import { T, getRiskColor } from "../tokens";
import { LANG } from "../lang";
import { EmptyState, MiniBtn } from "../components/RightPanel";

function DecisionSkeleton() {
  return (
    <div style={{
      padding:"12px 14px", marginBottom:8, borderRadius:10,
      border:`1px solid ${T.border}`, background:T.bgSurface,
    }}>
      {[160, 100, 80].map((w, i) => (
        <div key={i} style={{
          height:10, width:w, borderRadius:4,
          background:T.bgElevated, marginBottom: i < 2 ? 8 : 0,
          animation:"pulse 1.4s ease-in-out infinite",
          animationDelay:`${i * 0.12}s`,
        }} />
      ))}
    </div>
  );
}

export function DecisionsScreen({ cards, lang, onGoPrompt, approve, reject, loadingCards, onRefresh }) {
  const L = LANG[lang];
  const [filter, setFilter] = useState("all");

  const filtered = cards.filter(c => {
    if (filter === "approved") return c.status === "APPROVED";
    if (filter === "rejected") return c.status === "REJECTED";
    if (filter === "pending")  return c.status === "PENDING_HUMAN";
    return true;
  });

  const filters = [
    { key:"all",      label:L.filterAll      },
    { key:"pending",  label:L.filterPending  },
    { key:"approved", label:L.filterApproved },
    { key:"rejected", label:L.filterRejected },
  ];

  return (
    <div style={{ animation:"fade-in .25s ease" }}>
      {/* Filtre + refresh */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, gap:8 }}>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding:"5px 12px", borderRadius:6,
              border:`1px solid ${filter === f.key ? T.accent : T.border}`,
              background: filter === f.key ? `${T.accent}14` : "transparent",
              color: filter === f.key ? T.accent : T.textTertiary,
              fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              transition:"all .15s",
            }}>{f.label}</button>
          ))}
        </div>
        <button onClick={onRefresh} disabled={loadingCards} style={{
          background:"transparent", border:`1px solid ${T.border}`,
          borderRadius:6, padding:"3px 10px", flexShrink:0,
          fontSize:9, fontWeight:600, cursor: loadingCards ? "not-allowed" : "pointer",
          color: loadingCards ? T.textTertiary : T.accent,
          fontFamily:"'JetBrains Mono',monospace", letterSpacing:".06em",
          opacity: loadingCards ? 0.5 : 1, transition:"opacity .15s",
        }}>
          {loadingCards ? "..." : "↻"}
        </button>
      </div>

      {loadingCards ? (
        Array.from({ length: 4 }).map((_, i) => <DecisionSkeleton key={i} />)
      ) : cards.length === 0 ? (
        <EmptyState icon="⚖" title={L.noDecisions} sub={L.noDecisionsSub} cta={L.goPrompt} onCta={onGoPrompt} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="◈" title={L.emptyDec} />
      ) : (
        filtered.map(c => {
          const rc = getRiskColor(c.riskScore);
          const sc = c.status === "APPROVED" ? T.success : c.status === "REJECTED" ? T.danger : T.warning;
          const sl = c.status === "APPROVED" ? L.approved : c.status === "REJECTED" ? L.rejected : L.pending;
          return (
            <div key={c.id} style={{
              padding:"12px 14px", marginBottom:8, borderRadius:10,
              border:`1px solid ${T.border}`, borderLeft:`3px solid ${rc}`,
              background:T.bgSurface, animation:"card-in .3s ease both",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <span style={{
                  fontSize:11, fontFamily:"'JetBrains Mono',monospace",
                  color:T.textSecondary, flex:1, marginRight:8,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>{c.affectedArea}</span>
                <span style={{ fontSize:11, fontWeight:700, color:rc, flexShrink:0, fontFamily:"'JetBrains Mono',monospace" }}>
                  {c.riskScore}/10
                </span>
              </div>
              {c.reason && (
                <p style={{ fontSize:11, color:T.textTertiary, lineHeight:1.55, margin:"0 0 8px" }}>
                  {c.reason.slice(0, 90)}{c.reason.length > 90 ? "…" : ""}
                </p>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:9, fontWeight:700, color:sc, letterSpacing:".08em" }}>{sl}</span>
                {c.status === "PENDING_HUMAN" && (
                  <div style={{ display:"flex", gap:5 }}>
                    <MiniBtn color={T.success} onClick={() => approve(c.id)}>✅</MiniBtn>
                    <MiniBtn color={T.danger}  onClick={() => reject(c.id)}>❌</MiniBtn>
                  </div>
                )}
                <span style={{ fontSize:9, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>{c.ago}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
