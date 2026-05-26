import { useState, useEffect } from "react";
import { StorageManager } from "./StorageManager";

const C = {
  teal:    "#2DD4BF",
  amber:   "#F59E0B",
  red:     "#EF4444",
  surface: "#0F1729",
  border:  "#1E2D4A",
  text:    "#CBD5E1",
  muted:   "#475569",
};

export function SyncStatus({ isSyncing, onSync }) {
  const [ledger, setLedger] = useState(null);

  // Ledger durumunu oku
  const loadLedger = async () => {
    const data = await StorageManager.readJSON("sync_ledger.json");
    setLedger(data);
  };

  useEffect(() => {
    loadLedger();
  }, [isSyncing]); // sync bitince yenile

  const pending = ledger?.pending_ids?.length ?? 0;
  const lastSync = ledger?.last_sync
    ? new Date(ledger.last_sync).toLocaleString("tr-TR")
    : null;

  const statusColor = isSyncing
    ? C.amber
    : pending > 0
    ? C.amber
    : C.teal;

  const statusLabel = isSyncing
    ? "Senkronize ediliyor..."
    : pending > 0
    ? `${pending} session bekliyor`
    : "Güncel";

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>

      {/* Sol: durum */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Pulse dot */}
        <div style={{ position: "relative", width: 10, height: 10 }}>
          <div style={{
            width: 10, height: 10,
            borderRadius: "50%",
            background: statusColor,
            boxShadow: isSyncing ? `0 0 12px ${statusColor}` : "none",
          }} />
        </div>

        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: statusColor,
          }}>
            Engine Sync — {statusLabel}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {lastSync
              ? `Son sync: ${lastSync}`
              : "Henüz sync yapılmadı"}
          </div>
        </div>
      </div>

      {/* Sağ: buton + pending badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {pending > 0 && !isSyncing && (
          <span style={{
            background: C.amber + "22",
            color: C.amber,
            border: `1px solid ${C.amber}44`,
            borderRadius: 5,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 700,
          }}>
            {pending} bekliyor
          </span>
        )}

        <button
          onClick={async () => {
            await onSync();
            await loadLedger();
          }}
          disabled={isSyncing}
          style={{
            background: isSyncing ? C.border : C.teal + "22",
            border: `1px solid ${isSyncing ? C.border : C.teal + "55"}`,
            color: isSyncing ? C.muted : C.teal,
            borderRadius: 7,
            padding: "7px 16px",
            fontSize: 12,
            fontWeight: 600,
            cursor: isSyncing ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {isSyncing ? "⏳ Syncing..." : "↑ Sync Et"}
        </button>
      </div>
    </div>
  );
    }
