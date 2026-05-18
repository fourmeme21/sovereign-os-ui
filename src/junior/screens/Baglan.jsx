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

  const [githubToken,    setGithubToken]    = useState(() => localStorage.getItem("github_token") ?? "");
  const [githubRepo,     setGithubRepo]     = useState(() => localStorage.getItem("github_repo")  ?? ""); // TASK 0.6
  const [githubInput,    setGithubInput]    = useState("");
  const [githubRepoInput, setGithubRepoInput] = useState("");                                              // TASK 0.6
  const [githubFormOpen, setGithubFormOpen] = useState(false);
  const [githubSaved,    setGithubSaved]    = useState(false);
  const [repoError,      setRepoError]      = useState("");                                                // TASK 0.6

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

    // GitHub — token VE repo zorunlu  (TASK 0.6: repo kontrolü eklendi)
    const token = localStorage.getItem("github_token");
    const repo  = localStorage.getItem("github_repo");
    setHealth((h) => ({ ...h, github: token && repo ? "ok" : "error" }));
  };

  // TASK 0.6: saveGithubToken → saveGithubSettings (token + repo birlikte kaydedilir)
  const saveGithubSettings = () => {
    const trimmedToken = githubInput.trim();
    const trimmedRepo  = githubRepoInput.trim();

    if (!trimmedToken) return;

    // Repo girilmişse format kontrolü
    if (trimmedRepo && !trimmedRepo.includes("/")) {
      setRepoError("Repo formatı hatalı — örnek: kullanici/repo-adi");
      return;
    }

    setRepoError("");

    localStorage.setItem("github_token", trimmedToken);
    setGithubToken(trimmedToken);

    if (trimmedRepo) {
      localStorage.setItem("github_repo", trimmedRepo);
      setGithubRepo(trimmedRepo);
    }

    setHealth((h) => ({ ...h, github: "ok" }));
    setGithubInput("");
    setGithubRepoInput("");
    setGithubFormOpen(false);
    setGithubSaved(true);
    setTimeout(() => setGithubSaved(false), 2500);
  };

  const removeGithubToken = () => {
    localStorage.removeItem("github_token");
    localStorage.removeItem("github_repo"); // TASK 0.6: repo da temizlenir
    setGithubToken("");
    setGithubRepo("");
    setHealth((h) => ({ ...h, github: "error" }));
    setGithubFormOpen(false);
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
          const status  = health[s.key];
          const isGithub = s.key === "github";

          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Servis satırı */}
              <div className="service-row" style={{ borderRadius: isGithub && githubFormOpen ? "10px 10px 0 0" : 10 }}>
                <div className="service-indicator">{DOT[status]}</div>
                <div className="service-info">
                  <span className="service-label">{s.label}</span>
                  <span className="service-desc">
                    {/* TASK 0.6: token varsa masked token, repo varsa repo adı gösterilir */}
                    {isGithub && githubToken
                      ? githubRepo
                        ? githubRepo
                        : `ghp_${"•".repeat(8)}${githubToken.slice(-4)}`
                      : s.desc}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className={`service-status service-status-${status}`}>
                    {LABEL[status]}
                  </div>
                  {isGithub && (
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => {
                        setGithubInput("");
                        setGithubRepoInput("");
                        setRepoError("");
                        setGithubFormOpen((v) => !v);
                      }}
                    >
                      {githubFormOpen ? "İptal" : githubToken ? "Değiştir" : "Bağla"}
                    </button>
                  )}
                </div>
              </div>

              {/* GitHub formu — token + repo */}
              {isGithub && githubFormOpen && (
                <div style={{
                  background: "var(--bg-elevated, #1a1a1a)",
                  border: "1px solid var(--border, #2a2a2a)",
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  animation: "fade-in 0.2s ease",
                }}>
                  {/* Token alanı */}
                  <label style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
                    color: "var(--text-tertiary, #555)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    GITHUB PERSONAL ACCESS TOKEN
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveGithubSettings()}
                    autoFocus
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "9px 12px", borderRadius: 7,
                      border: "1px solid var(--border, #2a2a2a)",
                      background: "var(--bg-primary, #0a0a0a)",
                      color: "var(--text-primary, #e5e5e5)",
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      outline: "none",
                      caretColor: "var(--accent, #7C3AED)",
                    }}
                  />

                  {/* TASK 0.6 — Repo alanı */}
                  <label style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
                    color: "var(--text-tertiary, #555)",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 4,
                  }}>
                    GITHUB REPO <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsiyonel)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="kullanici/repo-adi"
                    value={githubRepoInput}
                    onChange={(e) => { setGithubRepoInput(e.target.value); setRepoError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && saveGithubSettings()}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "9px 12px", borderRadius: 7,
                      border: `1px solid ${repoError ? "var(--danger, #ef4444)" : "var(--border, #2a2a2a)"}`,
                      background: "var(--bg-primary, #0a0a0a)",
                      color: "var(--text-primary, #e5e5e5)",
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      outline: "none",
                      caretColor: "var(--accent, #7C3AED)",
                    }}
                  />
                  {repoError && (
                    <span style={{ fontSize: 11, color: "var(--danger, #ef4444)", marginTop: -4 }}>
                      {repoError}
                    </span>
                  )}

                  <div style={{ fontSize: 11, color: "var(--text-tertiary, #555)", lineHeight: 1.5 }}>
                    GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
                    <br />
                    <span style={{ color: "var(--accent, #7C3AED)" }}>repo</span> yetkisi yeterli.
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-primary"
                      disabled={!githubInput.trim()}
                      onClick={saveGithubSettings}
                      style={{ flex: 1 }}
                    >
                      Kaydet
                    </button>
                    {githubToken && (
                      <button
                        className="btn-secondary"
                        onClick={removeGithubToken}
                        style={{ color: "var(--danger, #ef4444)", borderColor: "rgba(239,68,68,.3)" }}
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Kayıt başarılı bildirimi */}
              {isGithub && githubSaved && (
                <div style={{
                  marginTop: 6, padding: "7px 12px", borderRadius: 7,
                  background: "rgba(45,212,191,.08)",
                  border: "1px solid rgba(45,212,191,.25)",
                  fontSize: 12, color: "var(--success, #2dd4bf)",
                  animation: "fade-in 0.2s ease",
                }}>
                  ✓ GitHub ayarları kaydedildi
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
