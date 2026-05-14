import { T } from "../tokens";

export function Skeleton() {
  return (
    <div style={{
      marginTop:16, background:T.bgSurface,
      border:`1px solid ${T.border}`, borderRadius:12,
      padding:24, position:"relative", overflow:"hidden",
      animation:"fade-in .2s ease",
    }}>
      <div className="scan" style={{
        position:"absolute", left:0, right:0, height:52,
        background:`linear-gradient(180deg, transparent, ${T.accent}08, transparent)`,
        pointerEvents:"none",
      }} />
      {[{ w:"68%", h:60 },{ w:"45%", h:11 },{ w:"85%", h:11 },{ w:"35%", h:11 }].map((r, i) => (
        <div key={i} className="sk-block" style={{
          width:r.w, height:r.h, background:T.textPrimary,
          borderRadius:5, marginBottom: i === 0 ? 22 : 11,
          animationDelay:`${i * .2}s`,
        }} />
      ))}
    </div>
  );
}
