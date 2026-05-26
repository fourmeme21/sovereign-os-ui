import { useState } from "react";
import { useSovereignMemory } from "./useSovereignMemory";

const C = {
  teal:    "#2DD4BF",
  red:     "#EF4444",
  amber:   "#F59E0B",
  violet:  "#818CF8",
  bg:      "#0A0F1A",
  surface: "#0F1729",
  border:  "#1E2D4A",
  text:    "#CBD5E1",
  muted:   "#475569",
};

function SessionCard({ session, highlight }) {
  const p = session.meta;
  const priorityColor = {
    "Faz 3": C.violet,
    "Faz 4": C.teal,
    "Phase G": C.amber,
  }[p.phase] ?? C.muted;

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: C.teal,
          fontWeight: 700,
        }}>
          #{p.session_num}
        </span>
        <span style={{
          fontSize: 10,
          color: priorityColor,
          background: priorityColor + "22",
          border: `1px solid ${priorityColor}44`,
          borderRadius: 4,
          padding: "1px 7px",
        }}>
          {p.phase}
        </span>
      </div>

      <div style={{
        fontSize: 13,
        color: C.text,
        fontWeight: 600,
        lineHeight: 1.4,
      }}>
        {highlight
          ? p.focus.replace(
              new RegExp(`(${highlight})`, "gi"),
              (m) => `【${m}】`
            )
          : p.focus}
      </div>

      <div style={{
        fontSize: 11,
        color: C.muted,
        display: "flex",
        gap: 10,
      }}>
        <span>{new Date(p.date).toLocaleDateString("tr-TR")}</span>
        {p.duration_min && <span>{p.duration_min} dk</span>}
        <span style={{ color: p.synced ? C.teal : C.amber }}>
          {p.synced ? "✓ synced" : "⏳ pending"}
        </span>
      </div>
    </div>
  );
}

export function MemoryPanel() {
  const {
    hotSessions,
    coldEpochs,
    searchResults,
    isLoading,
    isSyncing,
    searchSessions,
    clearSearch,
    triggerSync,
  } = useSovereignMemory();

  const [query, setQuery]   = useState("");
  const [tab, setTab]       = useState("hot"); // hot | cold | sync

  const handleSearch = (val) => {
    setQuery(val);
    if (val.trim()) {
      searchSessions(val);
    } else {
      clearSearch();
    }
  };

  const displaySessions = query.trim() ? searchResults : hotSessions;

  if (isLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 200, color: C.muted, fontSize: 13,
      }}>
        <span style={{ color: C.teal, marginRight: 8 }}>◌</span>
        Memory yükleniyor...
      </div>
    );
  }

  return (
    <div style={{
      background: C.bg,
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      overflow: "hidden",
      fontFamily: "system-ui, sans-serif",
    }}>

      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: C.teal,
            boxShadow: `0 0 8px ${C.teal}`,
          }} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>
            Memory
          </span>
          <span style={{
            background: C.teal + "22",
            color: C.teal,
            borderRadius: 5,
            padding: "1px 8px",
            fontSize: 11,
            fontWeight: 700,
          }}>
            {hotSessions.length}/10 hot
          </span>
        </div>

        {/* Sync butonu */}
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          style={{
            background: isSyncing ? C.border : C.teal + "22",
            border: `1px solid ${isSyncing ? C.border : C.teal + "66"}`,
            color: isSyncing ? C.muted : C.teal,
            borderRadius: 7,
            padding: "6px 14px",
            fontSize: 12,
            cursor: isSyncing ? "not-allowed" : "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          {isSyncing ? "⏳ Syncing..." : "↑ Sync Et"}
        </button>
      </div>

      {/* Arama */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Session ara... (focus, phase, içerik)"
          style={{
            width: "100%",
            background: C.surface,
            border: `1px solid ${query ? C.teal + "66" : C.border}`,
            borderRadius: 8,
            padding: "9px 14px",
            color: C.text,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 20px",
      }}>
        {[
          { key: "hot",  label: `Hot (${hotSessions.length})` },
          { key: "cold", label: `Cold (${coldEpochs.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "none",
            border: "none",
            borderBottom: tab === key
              ? `2px solid ${C.teal}`
              : "2px solid transparent",
            color: tab === key ? C.teal : C.muted,
            padding: "10px 16px",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: tab === key ? 700 : 400,
            marginBottom: -1,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <div style={{ padding: 20 }}>

        {/* Hot / Arama sonuçları */}
        {tab === "hot" && (
          <>
            {query && (
              <div style={{
                fontSize: 12, color: C.muted, marginBottom: 12,
              }}>
                {searchResults.length > 0
                  ? `${searchResults.length} sonuç — "${query}"`
                  : `"${query}" için sonuç bulunamadı`}
              </div>
            )}
            {displaySessions.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 32 }}>
                Henüz session eklenmedi
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 12,
              }}>
                {displaySessions.map((s) => (
                  <SessionCard
                    key={s.meta.id}
                    session={s}
                    highlight={query}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Cold epochs */}
        {tab === "cold" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {coldEpochs.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 32 }}>
                Henüz cold özet yok (her 50 session'da oluşur)
              </div>
            ) : (
              coldEpochs.map((e) => (
                <div key={e.epoch} style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: 8,
                  }}>
                    <span style={{ color: C.violet, fontWeight: 700, fontSize: 12 }}>
                      Epoch {e.epoch} — Session {e.range[0]}–{e.range[1]}
                    </span>
                    <span style={{ color: C.muted, fontSize: 11 }}>
                      {new Date(e.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <p style={{
                    margin: 0, color: C.text, fontSize: 12.5,
                    lineHeight: 1.6,
                  }}>
                    {e.summary}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
