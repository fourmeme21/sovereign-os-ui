import { useState, useEffect } from "react";
import { T } from "../tokens";

export function Typewriter({ text, delay = 0 }) {
  const [shown, setShown] = useState("");
  const [done, setDone]   = useState(false);

  useEffect(() => {
    setShown(""); setDone(false);
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, 18);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);

  return (
    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:T.textTertiary, letterSpacing:"0.02em" }}>
      {shown}{!done && <span style={{ animation:"blink .8s infinite" }}>_</span>}
    </span>
  );
}
