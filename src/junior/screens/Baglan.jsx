import { useEffect, useState } from "react";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

const SERVICES = [
  { key: "engine", label: "Sovereign Engine", desc: "Railway'de çalışıyor" },
  { key: "memory", label: "Sovereign Memory",  desc: "pgvector + Voyage AI"  },
  { key: "mcp",    label: "MCP Sunucusu",       desc: "Claude köprüsü"        },
  { key: "github", label: "GitHub",             desc: "Repo bağlantısı"       },
];

export default function Baglan() {
  const [health, setHealth] = useState({
    engine: "checking",
    github: "checking",
    mcp:    "checking",
    memory: "checking",
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealth({ engine: "checking", github: "checking", mcp: "checking", memory: "checking" });

    // Engine
    try {
      const res = await fetch(`${ENGINE_URL}/health`);
      setHealth((h) => ({ ...h, engine: res.ok ? "ok" : "error" }));
    } catch {
      setHealth((h) => ({ ...h, engine: "error" }));
    }

    // MCP
    try {
      const res = await fetch(`${ENGINE_URL}/mcp/status`);
      setHealth((h) => ({ ...h, mcp: res.ok ? "ok" : "error" }));
    } catch {
      setHealth((h) => ({ ...h, mcp: "error" }));
    }

    // Memory
    try {
      const res = await fetch(`${ENGINE_URL}/memory/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: "health-check", query: "test", top_k: 1 }),
      });
      setHealth((h) => ({ ...h, memory: res.ok ? "ok" : "error" }));
    } catch {
      setHealth((h) => ({ ...h, memory: "error" }));
    }

    // GitHub (localStorage token kontrolü)
    const githubToken = localStorage.getItem("github_token");
    setHealth((h) => ({ ...h, github: githubToken ? "ok" : "error" }));
  };

  const DOT = {
    checking: <span className="dot-grey" />,
    ok:       <span className="dot-green" />,
    error:    <span className="dot-red" />,
  };

  const LABEL = {
    checking: "Kontrol ediliyor...",
    ok:       "✓ Bağlı",
    error:    "✗ Bağlantı yok",
  };

  return (
    <div className="screen-baglan">
      <div className="screen-header">
        <h2 className="screen-title">Bağlantılar</h2>
        <button className="btn-secondary" onClick={checkHealth}>
          ↻ Yenile
        </button>
      </div>

      <div className="service-list">
        {SERVICES.map((s) => {
          const status = health[s.key];
          return (
            <div key={s.key} className="service-row">
              <div className="service-indicator">
                {DOT[status]}
              </div>
              <div className="service-info">
                <span className="service-label">{s.label}</span>
                <span className="service-desc">{s.desc}</span>
              </div>
              <div className={`service-status service-status-${status}`}>
                {LABEL[status]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
