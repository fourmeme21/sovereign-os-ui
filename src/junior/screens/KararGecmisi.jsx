import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useJuniorStore } from "../stores/juniorStore";
import { timeAgo } from "../utils/timeAgo";

const STATUS_ICONS = {
  AUTO_APPROVED: "🟢",
  PENDING_HUMAN: "🟡",
  APPROVED:      "✅",
  REJECTED:      "❌",
  BLOCKED:       "🔴",
};

export default function KararGecmisi() {
  const { t } = useTranslation("history");
  const decisions = useJuniorStore((s) => s.decisions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const STATUS_LABELS = {
    AUTO_APPROVED: t("status.auto_approved"),
    PENDING_HUMAN: t("status.pending"),
    APPROVED:      t("status.approved"),
    REJECTED:      t("status.rejected"),
    BLOCKED:       t("status.blocked"),
  };

  const filtered = decisions.filter((d) => {
    const matchFilter =
      filter === "all" ||
      (filter === "approved" && (d.status === "AUTO_APPROVED" || d.status === "APPROVED")) ||
      (filter === "pending"  && d.status === "PENDING_HUMAN") ||
      (filter === "blocked"  && d.status === "BLOCKED");

    const matchSearch =
      !search ||
      (d.affectedArea || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.humanLabel   || "").toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  const filters = [
    { key: "all",      label: t("filter.all")      },
    { key: "approved", label: t("filter.approved")  },
    { key: "pending",  label: t("filter.pending")   },
    { key: "blocked",  label: t("filter.blocked")   },
  ];

  return (
    <div className="screen-gecmis">
      <div className="screen-header">
        <h2 className="screen-title">{t("title")}</h2>
        <span className="header-count">{decisions.length} {t("count_suffix")}</span>
      </div>

      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        className="search-input"
        placeholder={t("search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="gecmis-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            {decisions.length === 0 ? t("empty.no_decisions") : t("empty.no_results")}
          </div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="gecmis-row">
              <span className="gecmis-icon">{STATUS_ICONS[d.status] || "⚪"}</span>
              <div className="gecmis-info">
                <span className="gecmis-area">{d.affectedArea}</span>
                <span className="gecmis-label">{d.humanLabel}</span>
              </div>
              <div className="gecmis-meta">
                <span className="gecmis-score">{t("risk_prefix")}: {d.riskScore}/10</span>
                <span className="gecmis-status">{STATUS_LABELS[d.status] || d.status}</span>
                <span className="gecmis-time">{d.timestamp ? timeAgo(d.timestamp) : d.ago || ""}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
