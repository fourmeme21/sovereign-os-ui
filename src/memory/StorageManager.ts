import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
  readDir,
  remove,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

const BASE = BaseDirectory.AppData;
const ROOT = "sovereign-engine/memory";

// ── Write Mutex — async çakışma önleyici ──────────────────────────
class WriteQueue {
  private queue: Promise<void> = Promise.resolve();
  run<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task);
    this.queue = next.then(() => {}, () => {});
    return next;
  }
}
const wq = new WriteQueue();

// ── Tipler ────────────────────────────────────────────────────────
export interface SessionMeta {
  id: string;
  session_num: number;
  date: string;
  phase: string;
  focus: string;
  duration_min?: number;
  synced: boolean;
}

export interface Session {
  meta: SessionMeta;
  content: string;
}

export interface ColdEpoch {
  epoch: number;
  range: [number, number];
  summary: string;
  created_at: string;
}

export interface SyncLedger {
  pending_ids: string[];
  last_sync: string | null;
}

// ── StorageManager ────────────────────────────────────────────────
export const StorageManager = {

  async ensureDirectories(): Promise<void> {
    for (const path of [ROOT, `${ROOT}/warm`]) {
      if (!await exists(path, { baseDir: BASE })) {
        await mkdir(path, { baseDir: BASE, recursive: true });
      }
    }
    for (const file of ["hot.json", "cold.json"]) {
      const p = `${ROOT}/${file}`;
      if (!await exists(p, { baseDir: BASE })) {
        await writeTextFile(p, "[]", { baseDir: BASE });
      }
    }
    const ledger = `${ROOT}/sync_ledger.json`;
    if (!await exists(ledger, { baseDir: BASE })) {
      await writeTextFile(
        ledger,
        JSON.stringify({ pending_ids: [], last_sync: null }, null, 2),
        { baseDir: BASE }
      );
    }
  },

  async readJSON<T>(file: string): Promise<T | null> {
    try {
      const raw = await readTextFile(`${ROOT}/${file}`, { baseDir: BASE });
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async writeJSON<T>(file: string, data: T): Promise<void> {
    return wq.run(async () => {
      const path = `${ROOT}/${file}`;
      const tmp  = `${path}.tmp`;
      const content = JSON.stringify(data, null, 2);
      await writeTextFile(tmp, content, { baseDir: BASE });
      // Atomic: tmp → asıl dosya
      await writeTextFile(path, content, { baseDir: BASE });
      try { await remove(tmp, { baseDir: BASE }); } catch {}
    });
  },

  async archiveToWarm(session: Session): Promise<void> {
    const ym  = session.meta.date.substring(0, 7);
    const dir = `${ROOT}/warm/${ym}`;
    if (!await exists(dir, { baseDir: BASE })) {
      await mkdir(dir, { baseDir: BASE, recursive: true });
    }
    await wq.run(() =>
      writeTextFile(
        `${dir}/${session.meta.id}.json`,
        JSON.stringify(session, null, 2),
        { baseDir: BASE }
      )
    );
  },

  async searchWarm(query: string): Promise<Session[]> {
    const results: Session[] = [];
    const q = query.toLowerCase();
    try {
      const months = await readDir(`${ROOT}/warm`, { baseDir: BASE });
      for (const month of months) {
        if (!month.isDirectory) continue;
        const files = await readDir(
          `${ROOT}/warm/${month.name}`,
          { baseDir: BASE }
        );
        for (const f of files) {
          if (!f.name?.endsWith(".json")) continue;
          const raw = await readTextFile(
            `${ROOT}/warm/${month.name}/${f.name}`,
            { baseDir: BASE }
          );
          const session: Session = JSON.parse(raw);
          const hay = (session.meta.focus + " " + session.content).toLowerCase();
          if (hay.includes(q)) results.push(session);
        }
      }
    } catch {}
    return results;
  },

  async findInWarm(id: string): Promise<Session | null> {
    try {
      const months = await readDir(`${ROOT}/warm`, { baseDir: BASE });
      for (const month of months) {
        if (!month.isDirectory) continue;
        const file = `${ROOT}/warm/${month.name}/${id}.json`;
        if (await exists(file, { baseDir: BASE })) {
          const raw = await readTextFile(file, { baseDir: BASE });
          return JSON.parse(raw);
        }
      }
    } catch {}
    return null;
  },

  async appendSyncQueue(id: string): Promise<void> {
    const ledger = await this.readJSON<SyncLedger>("sync_ledger.json")
      ?? { pending_ids: [], last_sync: null };
    if (!ledger.pending_ids.includes(id)) {
      ledger.pending_ids.push(id);
      await this.writeJSON("sync_ledger.json", ledger);
    }
  },

  // ── TB-9 FIX — Warm'daki session'ı synced:true olarak işaretle ──
  async markSyncedInWarm(id: string): Promise<void> {
    try {
      const months = await readDir(`${ROOT}/warm`, { baseDir: BASE });
      for (const month of months) {
        if (!month.isDirectory) continue;
        const file = `${ROOT}/warm/${month.name}/${id}.json`;
        if (await exists(file, { baseDir: BASE })) {
          const raw = await readTextFile(file, { baseDir: BASE });
          const session: Session = JSON.parse(raw);
          session.meta.synced = true;
          await wq.run(() =>
            writeTextFile(
              file,
              JSON.stringify(session, null, 2),
              { baseDir: BASE }
            )
          );
          return;
        }
      }
    } catch {}
  },

  // ── TB-10 FIX — Warm'dan en son N session'ı session_num sırasıyla getir ──
  async readLastNFromWarm(n: number): Promise<Session[]> {
    const all: Session[] = [];
    try {
      const months = await readDir(`${ROOT}/warm`, { baseDir: BASE });
      // En yeni aydan başla (azalan sıra)
      const sorted = months
        .filter((m) => m.isDirectory)
        .sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));

      for (const month of sorted) {
        const files = await readDir(
          `${ROOT}/warm/${month.name}`,
          { baseDir: BASE }
        );
        const sortedFiles = files
          .filter((f) => f.name?.endsWith(".json"))
          .sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));

        for (const f of sortedFiles) {
          const raw = await readTextFile(
            `${ROOT}/warm/${month.name}/${f.name}`,
            { baseDir: BASE }
          );
          all.push(JSON.parse(raw));
          if (all.length >= n) {
            // session_num artan sırayla döndür
            return all.sort((a, b) => a.meta.session_num - b.meta.session_num);
          }
        }
      }
    } catch {}
    return all.sort((a, b) => a.meta.session_num - b.meta.session_num);
  },
};
