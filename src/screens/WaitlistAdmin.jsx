import { useState, useEffect } from "react";

const ENGINE_URL    = import.meta.env.VITE_ENGINE_URL;
const ADMIN_PASS    = import.meta.env.VITE_ADMIN_PASSWORD ?? "sovereign";
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

const T = {
  bgPrimary:    "#0F0F0F",
  bgSurface:    "#1A1A1A",
  bgElevated:   "#242424",
  border:       "#2A2A2A",
  borderSubtle: "#1E1E1E",
  success:      "#2DD4BF",
  warning:      "#F59E0B",
  danger:       "#EF4444",
  textPrimary:  "#EDEDEC",
  textSecondary:"#888884",
  textTertiary: "#555550",
  accent:       "#7C3AED",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

async function fetchWaitlist() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    }
  );
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

export default function WaitlistAdmin() {
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [copied,        setCopied]        = useState(false);
  const [inviting,      setInviting]      = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWaitlist();
      setRows(data);
    } catch {
      setError("Supabase'den veri alınamadı. RLS policy'yi ve anon key'i kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const copyAll = () => {
    const text = filtered.map(r => r.email).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Engine /admin/invite → invited_at DB'ye yazılır
  const sendInvite = async (email) => {
    if (inviting) return;
    setInviting(email);
    try {
      const res = await fetch(`${ENGINE_URL}/admin/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": ADMIN_PASS,
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      // Reload → DB'den güncel invited_at gelir
      await load();
    } catch (e) {
      alert(`❌ Gönderilemedi: ${e.message}`);
    } finally {
      setInviting(null);
    }
  };

  const now   = Date.now();
  const today = rows.filter(r => now - new Date(r.created_at) < 86400000).length;
  const week  = rows.filter(r => now - new Date(r.created_at) < 604800000).length;
  const totalInvited = rows.filter(r => !!r.invited_at).length;

  return (
    <div style={{
      minHeight:"100vh", background:T.bgPrimary,
      color:T.textPrimary, fontFamily:"'Inter',system-ui,sans-serif",
      padding:"40px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:2px; }
        @keyframes fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .row-hover:hover { background:${T.bgElevated} !important; }
        .invite-btn:hover:not(:disabled) { opacity:.85; }
      `}</style>

      <div style={{ maxWidth:980, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{
            fontSize:11, color:T.accent, fontFamily:"'JetBrains Mono',monospace",
            letterSpacing:".18em", fontWeight:700, marginBottom:8,
          }}>
            SOVEREIGN ENGINE OS · ADMIN
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:T.textPrimary }}>
            Waitlist
          </h1>
        </div>

        {/* Stats row */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:1, borderRadius:12, overflow:"hidden",
          border:`1px solid ${T.border}`, marginBottom:24,
        }}>
          {[
            { label:"TOTAL",    value:rows.length,  color:T.textPrimary },
            { label:"TODAY",    value:today,         color:T.success },
            { label:"THIS WEEK",value:week,          color:T.accent },
            { label:"INVITED",  value:totalInvited,  color:T.warning },
          ].map((s, i) => (
            <div key={i} style={{
              padding:"18px 20px", background:T.bgSurface,
              borderRight: i < 3 ? `1px solid ${T.border}` : "none",
              textAlign:"center",
            }}>
              <div style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:30, color:s.color, lineHeight:1, marginBottom:4,
              }}>{s.value}</div>
              <div style={{
                fontSize:9, color:T.textTertiary, letterSpacing:".14em",
                fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
          <input
            type="text"
            placeholder="Email ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex:1, background:T.bgSurface, border:`1px solid ${T.border}`,
              borderRadius:8, padding:"10px 14px", color:T.textPrimary,
              fontSize:13, fontFamily:"inherit", outline:"none",
              caretColor:T.accent,
            }}
            onFocus={e => e.target.style.borderColor = T.accent}
            onBlur={e  => e.target.style.borderColor = T.border}
          />
          <button onClick={copyAll} style={{
            padding:"10px 16px", borderRadius:8,
            background: copied ? `${T.success}18` : T.bgSurface,
            border:`1px solid ${copied ? T.success : T.border}`,
            color: copied ? T.success : T.textSecondary,
            fontSize:12, fontWeight:600, cursor:"pointer",
            fontFamily:"inherit", transition:"all .15s", whiteSpace:"nowrap",
          }}>
            {copied ? "✅ Kopyalandı" : "📋 Tümünü Kopyala"}
          </button>
          <button onClick={load} style={{
            padding:"10px 14px", borderRadius:8,
            background:T.bgSurface, border:`1px solid ${T.border}`,
            color:T.accent, fontSize:13, cursor:"pointer",
            fontFamily:"'JetBrains Mono',monospace", transition:"all .15s",
          }}>
            {loading ? "..." : "↻"}
          </button>
        </div>

        {/* Table */}
        <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${T.border}` }}>

          {/* Header */}
          <div style={{
            display:"grid", gridTemplateColumns:"40px 1fr 160px 80px 130px",
            padding:"10px 20px", background:T.bgElevated,
            borderBottom:`1px solid ${T.border}`,
          }}>
            {["#","EMAIL","KAYIT TARİHİ","NE ZAMAN","AKSİYON"].map(h => (
              <span key={h} style={{
                fontSize:9, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace",
                fontWeight:700, letterSpacing:".14em",
              }}>{h}</span>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ padding:"48px 20px", textAlign:"center" }}>
              <div style={{
                width:20, height:20, border:`2px solid ${T.border}`,
                borderTopColor:T.accent, borderRadius:"50%",
                animation:"spin 1s linear infinite", margin:"0 auto 12px",
              }} />
              <span style={{ fontSize:13, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                Yükleniyor...
              </span>
            </div>
          ) : error ? (
            <div style={{ padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:13, color:T.danger, marginBottom:8 }}>⚠ {error}</div>
              <button onClick={load} style={{
                padding:"8px 16px", borderRadius:7,
                background:"transparent", border:`1px solid ${T.border}`,
                color:T.textSecondary, fontSize:12, cursor:"pointer", fontFamily:"inherit",
              }}>Tekrar Dene</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:13, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                {search ? "Sonuç bulunamadı." : "Henüz kayıt yok."}
              </div>
            </div>
          ) : (
            filtered.map((r, i) => {
              const alreadyInvited = !!r.invited_at;
              const isSending      = inviting === r.email;

              return (
                <div
                  key={r.id}
                  className="row-hover"
                  style={{
                    display:"grid", gridTemplateColumns:"40px 1fr 160px 80px 130px",
                    padding:"12px 20px", background:T.bgSurface,
                    borderBottom: i < filtered.length - 1 ? `1px solid ${T.borderSubtle}` : "none",
                    animation:`fade-in .2s ${i * 0.02}s both`,
                    transition:"background .15s", alignItems:"center",
                  }}
                >
                  <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                    {rows.length - rows.findIndex(x => x.id === r.id)}
                  </span>
                  <span style={{ fontSize:13, color:T.textPrimary, fontWeight:500 }}>
                    {r.email}
                  </span>
                  <span style={{ fontSize:11, color:T.textSecondary, fontFamily:"'JetBrains Mono',monospace" }}>
                    {new Date(r.created_at).toLocaleDateString("tr-TR", {
                      day:"2-digit", month:"short", year:"numeric",
                      hour:"2-digit", minute:"2-digit",
                    })}
                  </span>
                  <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
                    {timeAgo(r.created_at)}
                  </span>

                  <button
                    className="invite-btn"
                    onClick={() => sendInvite(r.email)}
                    disabled={alreadyInvited || !!inviting}
                    style={{
                      padding:"5px 10px", borderRadius:6, border:"none",
                      background: alreadyInvited
                        ? `${T.success}18`
                        : isSending
                          ? T.bgElevated
                          : `${T.accent}22`,
                      color: alreadyInvited ? T.success : isSending ? T.textTertiary : T.accent,
                      fontSize:11, fontWeight:600,
                      fontFamily:"'JetBrains Mono',monospace",
                      cursor: alreadyInvited || !!inviting ? "default" : "pointer",
                      transition:"all .15s", whiteSpace:"nowrap",
                      border:`1px solid ${alreadyInvited ? T.success+"44" : T.accent+"33"}`,
                    }}
                  >
                    {alreadyInvited
                      ? `✅ ${new Date(r.invited_at).toLocaleDateString("tr-TR", { day:"2-digit", month:"short" })}`
                      : isSending ? "..." : "Davet Gönder →"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
              {totalInvited > 0 && `${totalInvited} davet gönderildi`}
            </span>
            <span style={{ fontSize:11, color:T.textTertiary, fontFamily:"'JetBrains Mono',monospace" }}>
              {filtered.length} / {rows.length} kayıt gösteriliyor
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
