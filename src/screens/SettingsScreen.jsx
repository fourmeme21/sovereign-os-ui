import { useState } from "react";
import { T, getRiskColor } from "../tokens";
import { LANG } from "../lang";

export function SettingsScreen({ lang, onLangChange, onClear }) {
  const L = LANG[lang];
  const [threshold, setThreshold] = useState(7);
  const [cleared, setCleared]     = useState(false);

  const handleClear = () => {
    onClear();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:".14em", color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", marginBottom:14 }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ animation:"fade-in .25s ease" }}>
      {/* Dil */}
      <Section title={L.settingsLang}>
        <div style={{ display:"flex", background:T.bgSurface, border:`1px solid ${T.border}`, borderRadius:8, padding:3, gap:2, width:"fit-content" }}>
          {["tr","en"].map(l => (
            <button key={l} className={`lt${lang === l ? " active" : ""}`} onClick={() => onLangChange(l)}
              style={{
                padding:"7px 20px", borderRadius:6, border:"none",
                background:"transparent", cursor:"pointer",
                fontSize:12, fontWeight:600, letterSpacing:".04em",
                color: lang === l ? T.accent : T.textTertiary,
                fontFamily:"'JetBrains Mono',monospace",
              }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </Section>

      {/* Risk eşiği */}
      <Section title={L.settingsRisk}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
          <input type="range" min={1} max={10} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ flex:1, accentColor:T.accent, cursor:"pointer" }}
          />
          <span style={{
            fontSize:20, fontWeight:800, color:getRiskColor(threshold),
            fontFamily:"'Inter',sans-serif", minWidth:32, textAlign:"right",
          }}>{threshold}</span>
        </div>
        <p style={{ fontSize:11, color:T.textTertiary, lineHeight:1.6, margin:0 }}>
          {L.settingsRiskNote}
        </p>
      </Section>

      {/* Veri temizle */}
      <Section title={L.settingsClear}>
        <p style={{ fontSize:11, color:T.textTertiary, lineHeight:1.6, marginBottom:12 }}>
          {L.settingsClearNote}
        </p>
        <button onClick={handleClear} style={{
          padding:"8px 18px", borderRadius:8,
          border:`1px solid ${cleared ? T.success : T.danger}`,
          background: cleared ? `${T.success}14` : "transparent",
          color: cleared ? T.success : T.danger,
          fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          transition:"all .2s",
        }}>
          {cleared ? "✓ Temizlendi" : `⚠ ${L.settingsClearBtn}`}
        </button>
      </Section>

      {/* Versiyon */}
      <div style={{ fontSize:10, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace", paddingTop:16, borderTop:`1px solid ${T.borderSubtle}` }}>
        {L.settingsVersion} · sovereign.os v0.1.0-alpha
      </div>
    </div>
  );
}
