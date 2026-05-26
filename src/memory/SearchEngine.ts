import MiniSearch from "minisearch";
import type { Session } from "./StorageManager";

export class SearchEngine {
  private ms: MiniSearch;

  constructor() {
    this.ms = new MiniSearch({
      idField: "id",
      fields: ["focus", "phase", "content"],
      storeFields: ["id", "session_num", "date", "focus", "phase"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: { focus: 2, phase: 1.5 },
      },
    });
  }

  add(session: Session): void {
    const doc = {
      id:          session.meta.id,
      session_num: session.meta.session_num,
      date:        session.meta.date,
      phase:       session.meta.phase,
      focus:       session.meta.focus,
      content:     session.content,
    };
    if (this.ms.has(session.meta.id)) {
      this.ms.replace(doc);
    } else {
      this.ms.add(doc);
    }
  }

  query(query: string, allSessions: Session[]): Session[] {
    const results = this.ms.search(query);
    const ids = new Set(results.map((r) => r.id));
    return allSessions.filter((s) => ids.has(s.meta.id));
  }

  remove(id: string): void {
    if (this.ms.has(id)) this.ms.discard(id);
  }
}
