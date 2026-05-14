import { useState, useEffect } from "react";
import { getRiskColor } from "../tokens";

export function RiskScore({ target }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let cur = 0;
    const step = target / 18;
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.round(cur));
      if (cur >= target) clearInterval(iv);
    }, 50);
    return () => clearInterval(iv);
  }, [target]);

  const rc = getRiskColor(val);

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <div className="halo-anim" style={{
        position:"absolute", inset:-24, borderRadius:"50%",
        background:rc, filter:"blur(32px)", pointerEvents:"none",
      }} />
      <div style={{
        position:"relative",
        fontFamily:"'Inter',system-ui,sans-serif",
        fontSize:64, fontWeight:800, color:rc,
        lineHeight:1, letterSpacing:"-0.05em",
        transition:"color .28s ease",
      }}>
        {val}
        <span style={{ fontSize:20, fontWeight:400, opacity:.28, marginLeft:3, letterSpacing:"-.01em" }}>
          /10
        </span>
      </div>
    </div>
  );
}
