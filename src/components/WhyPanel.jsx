import { useState, useEffect } from "react";
import { T } from "../tokens";
import { LANG } from "../lang";

export function WhyPanel({ visible, lang, factors = [] }) {
  const L = LANG[lang];
  const [barsOn, setBarsOn] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setBarsOn(true), 60);
      return () => clearTimeout(t);
    } else {
      setBarsOn(false);
    }
  }, [visible]);

  return (
    <div style={{
      maxHeight: visible ? 540 : 0,
      opacity:   visible ? 1 : 0,
      overflow:"hidden",
      transition:"max-height .28s cubic-bezier(.4,0,.2,1), opacity .24s",
    }}>
      <div style={{ paddingTop:20, marginTop:20, borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:".14em", color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
            {L.riskBreak}
          </span>
          <div className={visible ? "stamp-badge" : ""} style={{
            background:`${T.accent}14`, border:`1px solid ${T.accent}35`,
            borderRadius:4, padding:"3px 10px",
            fontSize:9, color:T.accent,
            fontFamily:"'JetBrains Mono',monospace", letterSpacing:".07em",
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span style={{ fontSize:8 }}>🔒</span> POL-DIFF-004
          </div>
        </div>

        {factors.map((f, i) => {
          const fc = f.s > 6 ? T.danger : f.s > 3.5 ? T.warning : T.success;
          return (
            <div key={i} className={visible ? "factor-anim" : ""} style={{ marginBottom:14, animationDelay:`${i * 0.05}s` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:T.textSecondary, fontWeight:500 }}>{L.factors[i]}</span>
                  <span style={{
                    fontSize:9, color:T.textTertiary,
                    background:T.bgElevated, border:`1px solid ${T.border}`,
                    borderRadius:3, padding:"1px 6px", fontFamily:"'JetBrains Mono',monospace",
                  }}>{f.w}%</span>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:fc, fontFamily:"'JetBrains Mono',monospace" }}>
                  {f.s.toFixed(1)}
                </span>
              </div>
              <div style={{ height:3, background:T.border, borderRadius:2, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:2, background:fc,
                  width: barsOn ? `${f.s * 10}%` : 0,
                  transition:`width .44s ease ${i * 0.05 + 0.08}s`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
