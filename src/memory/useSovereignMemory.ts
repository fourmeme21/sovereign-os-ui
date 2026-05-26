import { useState, useEffect, useCallback, useMemo } from "react";
import { StorageManager } from "./StorageManager";
import { SearchEngine } from "./SearchEngine";
import type { Session, ColdEpoch, SyncLedger } from "./StorageManager";

export type { Session, ColdEpoch };

export function useSovereignMemory() {
  const [hotSessions, setHotSessions]     = useState<Session[]>([]);
  const [coldEpochs, setColdEpochs]       = useState<ColdEpoch[]>([]);
  const [searchResults, setSearchResults] = useState<Session[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSyncing, setIsSyncing]         = useState(false);

  const search = useMemo(() => new SearchEngine(), []);

  // ── Bootstrap ─────────────────────────────────────────────────
  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    try {
      await StorageManager.ensureDirectories();

      const sessions = await StorageManager.readJSON<Session[]>("hot.json") ?? [];
      setHotSessions(sessions);
      sessions.forEach((s) => search.add(s));

      const epochs = await StorageManager.readJSON<ColdEpoch[]>("cold.json") ?? [];
      setColdEpochs(epochs);
    } catch (e) {
      console.error("Memory bootstrap hatası:", e);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { bootstrap(); }, []);

  // ── Session ekle ──────────────────────────────────────────────
  const addSession = useCallback(async (
    session_num: number,
    phase: string,
    focus: string,
    content: string,
    duration_min?: number
  ) => {
    const newSession: Session = {
      meta: {
        id: `session_${session_num}`,
        session_num,
        phase,
        focus,
        date: new Date().toISOString(),
        duration_min,
        synced: false,
      },
      content,
    };

    const updated = [newSession, ...hotSessions];

    // FIFO: 10'dan fazlaysa en eskiyi warm'a gönder
    if (updated.length > 10) {
      const evicted = updated.pop()!;
      await StorageManager.archiveToWarm(evicted);
      search.remove(evicted.meta.id);
    }

    await StorageManager.writeJSON("hot.json", updated);
    await StorageManager.appendSyncQueue(newSession.meta.id);

    setHotSessions(updated);
    search.add(newSession);

    // Her 50. session'da cold trigger
    if (session_num % 50 === 0) {
      await triggerCold(session_num, updated);
    }
  }, [hotSessions, search]);

  // ── Arama ─────────────────────────────────────────────────────
  const searchSessions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    // Hot — in-memory (anında)
    const hotResults = search.query(query, hotSessions);

    // Warm — lazy dosya tarama
    const warmResults = await StorageManager.searchWarm(query);

    // Birleştir, duplicate temizle
    const seen = new Set<string>();
    const all = [...hotResults, ...warmResults].filter((s) => {
      if (seen.has(s.meta.id)) return false;
      seen.add(s.meta.id);
      return true;
    });

    setSearchResults(all);
  }, [hotSessions, search]);

  const clearSearch = useCallback(() => setSearchResults([]), []);

  // ── Engine sync ───────────────────────────────────────────────
  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const ledger = await StorageManager.readJSON<SyncLedger>("sync_ledger.json")
        ?? { pending_ids: [], last_sync: null };

      if (ledger.pending_ids.length === 0) return;

      const engineUrl = import.meta.env.VITE_ENGINE_URL;
      const succeeded: string[] = [];

      for (const id of ledger.pending_ids) {
        const session =
          hotSessions.find((s) => s.meta.id === id) ??
          await StorageManager.findInWarm(id);

        if (!session) continue;

        try {
          const res = await fetch(`${engineUrl}/mcp/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(session),
          });
          if (res.ok) succeeded.push(id);
        } catch {}
      }

      ledger.pending_ids = ledger.pending_ids.filter(
        (id) => !succeeded.includes(id)
      );
      ledger.last_sync = new Date().toISOString();
      await StorageManager.writeJSON("sync_ledger.json", ledger);
    } finally {
      setIsSyncing(false);
    }
  }, [hotSessions]);

  // ── Cold summary ──────────────────────────────────────────────
  const triggerCold = async (session_num: number, sessions: Session[]) => {
    const epoch: ColdEpoch = {
      epoch: Math.floor(session_num / 50),
      range: [session_num - 49, session_num],
      summary: sessions
        .slice(0, 50)
        .map((s) => `[${s.meta.session_num}] ${s.meta.focus}`)
        .join(" · "),
      created_at: new Date().toISOString(),
    };
    const updated = [...coldEpochs, epoch];
    await StorageManager.writeJSON("cold.json", updated);
    setColdEpochs(updated);
  };

  return {
    hotSessions,
    coldEpochs,
    searchResults,
    isLoading,
    isSyncing,
    addSession,
    searchSessions,
    clearSearch,
    triggerSync,
  };
}
