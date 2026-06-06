// useSovereignMemory.ts
// Amaç:    Desktop lokal memory yönetimi — hot/warm/cold katmanı + Supabase sync
// Bağlı:   StorageManager.ts, SearchEngine.ts, memory_chunks tablosu
// Karar:   Karar #78 (web'de memory yok), Karar #80 (project_id izolasyon), Karar #81 (memory_type: session_summary), Session 19
// Dokunma: StorageManager + SearchEngine değiştirilmeden önce bu hook kontrol edilmeli

import { useState, useEffect, useCallback, useMemo } from "react";
import { StorageManager } from "./StorageManager";
import { SearchEngine } from "./SearchEngine";
import { supabase } from "../lib/supabaseClient";
import type { Session, ColdEpoch, SyncLedger } from "./StorageManager";

export type { Session, ColdEpoch };

// ── SessionMeta project_id eklendi (Karar #80 — proje izolasyonu) ──
declare module "./StorageManager" {
  interface SessionMeta {
    project_id?: string;
  }
}

export function useSovereignMemory() {
  const [hotSessions, setHotSessions]     = useState<Session[]>([]);
  const [coldEpochs, setColdEpochs]       = useState<ColdEpoch[]>([]);
  const [searchResults, setSearchResults] = useState<Session[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [syncError, setSyncError]         = useState<string | null>(null);

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
    duration_min?: number,
    project_id?: string,
  ) => {
    const newSession: Session = {
      meta: {
        id: `session_${session_num}`,
        session_num,
        phase,
        focus,
        date: new Date().toISOString(),
        duration_min,
        project_id,
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
      await triggerCold(session_num);
    }
  }, [hotSessions, search]);

  // ── Arama ─────────────────────────────────────────────────────
  const searchSessions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const hotResults  = search.query(query, hotSessions);
    const warmResults = await StorageManager.searchWarm(query);

    const seen = new Set<string>();
    const all  = [...hotResults, ...warmResults].filter((s) => {
      if (seen.has(s.meta.id)) return false;
      seen.add(s.meta.id);
      return true;
    });

    setSearchResults(all);
  }, [hotSessions, search]);

  const clearSearch = useCallback(() => setSearchResults([]), []);

  // ── Supabase sync ─────────────────────────────────────────────
  const syncSessionToSupabase = async (session: Session): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("memory_chunks")
      .insert({
        user_id:     user.id,
        project_id:  session.meta.project_id ?? null,
        memory_type: "session_summary",
        content:     `[${session.meta.session_num}] ${session.meta.focus}\n\n${session.content}`,
        heat_score:  1.0,
      });

    if (error) {
      console.error("Supabase sync hatası:", error.message);
      return false;
    }
    return true;
  };

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const ledger = await StorageManager.readJSON<SyncLedger>("sync_ledger.json")
        ?? { pending_ids: [], last_sync: null };

      if (ledger.pending_ids.length === 0) return;

      const succeeded: string[] = [];
      let lastError: string | null = null;

      for (const id of ledger.pending_ids) {
        const session =
          hotSessions.find((s) => s.meta.id === id) ??
          await StorageManager.findInWarm(id);

        if (!session) continue;

        const ok = await syncSessionToSupabase(session);
        if (ok) {
          succeeded.push(id);
        } else {
          lastError = `Supabase sync başarısız: ${id}`;
        }
      }

      if (lastError) setSyncError(lastError);

      // Ledger güncelle
      ledger.pending_ids = ledger.pending_ids.filter(
        (id) => !succeeded.includes(id)
      );
      ledger.last_sync = new Date().toISOString();
      await StorageManager.writeJSON("sync_ledger.json", ledger);

      // Başarılı session'ları synced:true yap
      if (succeeded.length > 0) {
        const updatedHot = hotSessions.map((s) =>
          succeeded.includes(s.meta.id)
            ? { ...s, meta: { ...s.meta, synced: true } }
            : s
        );
        await StorageManager.writeJSON("hot.json", updatedHot);
        setHotSessions(updatedHot);

        for (const id of succeeded) {
          await StorageManager.markSyncedInWarm(id);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [hotSessions]);

  // ── Cold summary ──────────────────────────────────────────────
  const triggerCold = async (session_num: number) => {
    const warmSessions = await StorageManager.readLastNFromWarm(50);
    const epoch: ColdEpoch = {
      epoch:      Math.floor(session_num / 50),
      range:      [session_num - 49, session_num],
      summary:    warmSessions
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
    syncError,
    addSession,
    searchSessions,
    clearSearch,
    triggerSync,
  };
}
