import { useState, useEffect } from "react";
import { T, getRiskColor, getRiskLabel } from "../tokens";
import { LANG } from "../lang";
import { RiskScore } from "./RiskScore";
import { WhyPanel } from "./WhyPanel";
import { Typewriter } from "./Typewriter";

export function ActionBtn({ color, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button className="action-btn" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding:"9px 20px", borderRadius:8,
        border:`1px solid ${color}`,
        background: hov ? color : "transparent",
        color: hov ? (color === T.success ? "#000" : "#fff") : color,
        fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
      }}
    >{children}</button>
  );
}

export function RiskCard({ decision, onApprove, onReject, lang }) {
  const [showWhy, setShowWhy] = useState(false);
  const [state, setState]     = useState("idle");
  const [showSweep, setShowSweep] = useState(true);
  const L  = LANG[lang];
  const rc = getRiskColor(decision.riskScore);
  const isPending = decision.status === "PENDING_HUMAN" && state === "idle";

  useEffect(() => {
    const t = setTimeout(() => setShowSweep(false), 800);
    return () => clearTimeout(t);
  }, []);

  const doApprove = () => {
    setState("approving");
    setTimeout(() => { setState("approved"); onApprove(decision.id); }, 380);
  };
  const doReject = () => {
    setState("rejecting");
    setTimeout(() => { setState("rejected"); onReject(decision.id); }, 440);
  };

  const cardBg = state === "approved" ? `${T.success}0E`
               : state === "rejected" ? `${T.danger}09`
               : T.bgSurface;

  return (
    <div className="card-anim" style={{ marginTop:16, position:"relative", overflow:"hidden" }}>
      {showSweep && (
        <div className="sweep-line" style={{
          position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
          background:`linear-gradient(90deg, transparent, ${rc}30, ${rc}18, transparent)`,
        }} />
      )}

      <div style={{
        border:`1px solid ${T.border}`,
        borderLeft:`4px solid ${rc}`,
        borderRadius:12, padding:24,
        position:"relative",
        background:cardBg,
        transition:"background .45s ease",
      }}>
        {state === "approving" && (
          <div className="wave-approve" style={{
            position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
            background:`linear-gradient(90deg, transparent, ${T.success}1A, ${T.success}32, ${T.success}1A, transparent)`,
          }} />
        )}

        <div className={state === "rejecting" ? "shake-wrap" : ""}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:24, marginBottom:20 }}>
            <RiskScore target={decision.riskScore} />
            <div style={{ paddingTop:10, flex:1, minWidth:0 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:".16em", color:rc, marginBottom:6 }}>
                {getRiskLabel(decision.riskScore, lang)}
              </div>
              <div style={{
                fontSize:11, color:T.textSecondary, lineHeight:1.6,
                fontFamily:"'JetBrains Mono',monospace",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                {decision.affectedArea}
              </div>
            </div>
          </div>

          <p style={{
            fontSize:13, color:T.textSecondary, lineHeight:1.72,
            marginBottom: isPending ? 20 : 0,
            paddingBottom: isPending ? 20 : 0,
            borderBottom: isPending ? `1px solid ${T.borderSubtle}` : "none",
          }}>
            {decision.reason}
          </p>

          {isPending && (
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <ActionBtn color={T.success} onClick={doApprove}>✅ {L.approve}</ActionBtn>
              <ActionBtn color={T.danger}  onClick={doReject}>❌ {L.reject}</ActionBtn>
              <button onClick={() => setShowWhy(v => !v)} style={{
                padding:"8px 14px", borderRadius:8,
                border:`1px solid ${T.border}`,
                background: showWhy ? T.bgElevated : "transparent",
                color:T.textSecondary, fontSize:12, cursor:"pointer",
                fontFamily:"inherit", transition:"background .15s",
                marginLeft:"auto",
              }}>{showWhy ? L.whyClose : L.whyBtn}</button>
            </div>
          )}

          <WhyPanel visible={showWhy} lang={lang} />

          <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${T.borderSubtle}` }}>
            <Typewriter text={`trace_id: ${decision.traceId}`} delay={480} />
          </div>
        </div>

        {(state === "approved" || state === "rejected") && (
          <div className="decision-overlay" style={{
            position:"absolute", inset:0, borderRadius:12, pointerEvents:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
            background: state === "approved" ? `${T.success}09` : `${T.danger}09`,
          }}>
            <span style={{
              fontSize:12, fontWeight:700, letterSpacing:".12em",
              color: state === "approved" ? T.success : T.danger,
              fontFamily:"'JetBrains Mono',monospace",
            }}>
              {state === "approved" ? `✅ ${L.approved}` : `❌ ${L.rejected}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
