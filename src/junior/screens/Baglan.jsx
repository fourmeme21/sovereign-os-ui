import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabaseClient";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

async function verifyGithubToken(token) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function Baglan() {
  const { t } = useTranslation("connect");

  const SERVICES = [
    { key: "engine", label: t("services.engine.label"), desc: t("services.engine.desc") },
    { key: "memory", label: t("services.memory.label"), desc: t("services.memory.desc") },
    { key: "mcp",    label: t("services.mcp.label"),    desc: t("services.mcp.desc")    },
    { key: "github", label: t("services.github.label"), desc: t("services.github.desc") },
  ];

  const LABEL = {
    checking: t("status.checking"),
    ok:       t("status.ok"),
    error:    t("status.error"),
  };

  const [health, setHealth] = useState({
    engine: "checking", github: "checking", memory: "checking",
  });

  // SEC-01: token artık localStorage'da tutulmuyor — bağlantı durumu backend'den okunuyor
  const [githubToken,     setGithubToken]     = useState(false);   // true = bağlı
  const [githubRepo,      setGithubRepo]      = useState(() => localStorage.getItem("github_repo") ?? "");
  const [githubInput,     setGithubInput]     = useState("");
  const [githubRepoInput, setGithubRepoInput] = useState("");
  const [githubFormOpen,  setGithubFormOpen]  = useState(false);
  const [githubSaved,     setGithubSaved]     = useState(false);
  const [githubVerifying, setGithubVerifying] = useState(false);
  const [repoError,       setRepoError]       = useState("");
  const [tokenError,      setTokenError]      = useState("");

  useEffect(() => { checkHealth(); }, []);

  const checkHealth = async () => {
    setHealth({ engine: "checking", github: "checking", memory: "checking" });

    try {
      const res = await fetch(`${ENGINE_URL}/health`);
      setHealth((h) => ({ ...h, engine: res.ok ? "ok" : "error" }));
    } catch { setHealth((h) => ({ ...h, engine: "error" })); }

    try {
      const res = await fetch(`${ENGINE_URL}/memory/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: "health-check", query: "test", top_k: 1 }),
      });
      setHealth((h) => ({ ...h, memory: res.ok ? "ok" : "error" }));
    } catch { setHealth((h) => ({ ...h, memory: "error" })); }

    // SEC-01: token localStorage'da yok — backend /status endpoint'inden kontrol et
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session?.access_token ? `Bearer ${session.access_token}` : null;
      const statusRes = await fetch(`${ENGINE_URL}/api/user/github-token/status`, {
        headers: authHeader ? { Authorization: authHeader } : {},
      });
      if (statusRes.ok) {
        const { connected } = await statusRes.json()
        setGithubToken(connected)
        const repo = localStorage.getItem("github_repo")
        setHealth((h) => ({ ...h, github: connected && !!repo ? "ok" : "error" }))
      } else {
        setHealth((h) => ({ ...h, github: "error" }))
      }
    } catch { setHealth((h) => ({ ...h, github: "error" })) }
  };

  const saveGithubSettings = async () => {
    const trimmedToken = githubInput.trim();
    const trimmedRepo  = githubRepoInput.trim();
    if (!trimmedToken) return;

    if (trimmedRepo && !trimmedRepo.includes("/")) {
      setRepoError(t("github.repo_format_error"));
      return;
    }

    setRepoError("");
    setTokenError("");
    setGithubVerifying(true);

    try {
      // Adım 1: Token'ı önce GitHub'da doğrula
      const valid = await verifyGithubToken(trimmedToken);
      if (!valid) {
        setTokenError(t("github.token_invalid"));
        setGithubVerifying(false);
        return;
      }

      // Adım 2: SEC-01 — token localStorage'a yazılmıyor, backend'e gönderiliyor
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session?.access_token ? `Bearer ${session.access_token}` : null;

      if (!authHeader) {
        setTokenError("Oturum bulunamadı. Lütfen yeniden giriş yapın.");
        setGithubVerifying(false);
        return;
      }

      const saveRes = await fetch(`${ENGINE_URL}/api/user/github-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ token: trimmedToken }),
      });

      if (!saveRes.ok) {
        setTokenError(t("github.token_invalid"));
        setGithubVerifying(false);
        return;
      }

      // Adım 3: repo localStorage'da kalabilir — hassas veri değil
      if (trimmedRepo) {
        localStorage.setItem("github_repo", trimmedRepo);
        setGithubRepo(trimmedRepo);
      }

      setGithubToken(true); // bağlı
      setHealth((h) => ({ ...h, github: "ok" }));
      setGithubInput("");
      setGithubRepoInput("");
      setGithubFormOpen(false);
      setGithubSaved(true);
      setTimeout(() => setGithubSaved(false), 2500);
    } catch {
      setTokenError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setGithubVerifying(false);
    }
  };

  const removeGithubToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session?.access_token ? `Bearer ${session.access_token}` : null;
      if (authHeader) {
        await fetch(`${ENGINE_URL}/api/user/github-token`, {
          method: "DELETE",
          headers: { Authorization: authHeader },
        });
      }
    } catch { /* sessiz fail — UI yine de sıfırlanır */ }

    // SEC-01: localStorage'da token zaten yok, repo temizlenir
    localStorage.removeItem("github_repo");
    setGithubToken(false);
    setGithubRepo("");
    setHealth((h) => ({ ...h, github: "error" }));
    setGithubFormOpen(false);
  };

  const DOT = {
    checking: <span className="dot-grey" />,
    ok:       <span className="dot-green" />,
    error:    <span className="dot-red" />,
  };

  return (
    <div className="screen-baglan">
      <div className="screen-header">
        <h2 className="screen-title">{t("title")}</h2>
        <button className="btn-secondary" onClick={checkHealth}>↻ {t("refresh")}</button>
      </div>

      <div className="service-list">
        {SERVICES.map((s) => {
          const status   = health[s.key];
          const isGithub = s.key === "github";
          const isMcp    = s.key === "mcp";

          return (
            <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div className="service-row" style={{ borderRadius: isGithub && githubFormOpen ? "10px 10px 0 0" : 10 }}>
                <div className="service-indicator">
                  {isMcp ? <span className="dot-grey" /> : DOT[status]}
                </div>
                <div className="service-info">
                  <span className="service-label">{s.label}</span>
                  <span className="service-desc">
                    {isGithub && githubToken
                      ? githubRepo || `ghp_${"•".repeat(8)}${githubToken.slice(-4)}`
                      : s.desc}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isMcp ? (
                    <span style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 5,
                      background: "rgba(129,140,248,.12)", border: "1px solid rgba(129,140,248,.25)",
                      color: "#818cf8", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em",
                    }}>
                      {t("services.mcp.coming_soon")}
                    </span>
                  ) : (
                    <>
                      <div className={`service-status service-status-${status}`}>{LABEL[status]}</div>
                      {isGithub && (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: 11, padding: "4px 10px" }}
                          onClick={() => {
                            setGithubInput(""); setGithubRepoInput("");
                            setRepoError(""); setTokenError("");
                            setGithubFormOpen((v) => !v);
                          }}
                        >
                          {githubFormOpen ? t("github.cancel") : githubToken ? t("github.change") : t("github.connect")}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {isGithub && githubFormOpen && (
                <div style={{
                  background: "var(--bg-elevated, #1a1a1a)", border: "1px solid var(--border, #2a2a2a)",
                  borderTop: "none", borderRadius: "0 0 10px 10px",
                  padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
                  animation: "fade-in 0.2s ease",
                }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "var(--text-tertiary, #555)", fontFamily: "'JetBrains Mono', monospace" }}>
                    GITHUB PERSONAL ACCESS TOKEN
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={githubInput}
                    onChange={(e) => { setGithubInput(e.target.value); setTokenError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && saveGithubSettings()}
                    autoFocus
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 7,
                      border: `1px solid ${tokenError ? "var(--danger, #ef4444)" : "var(--border, #2a2a2a)"}`,
                      background: "var(--bg-primary, #0a0a0a)", color: "var(--text-primary, #e5e5e5)",
                      fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none",
                    }}
                  />
                  {tokenError && <span style={{ fontSize: 11, color: "var(--danger, #ef4444)", marginTop: -4 }}>{tokenError}</span>}

                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "var(--text-tertiary, #555)", fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    GITHUB REPO <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>({t("github.optional")})</span>
                  </label>
                  <input
                    type="text"
                    placeholder="username/repo-name"
                    value={githubRepoInput}
                    onChange={(e) => { setGithubRepoInput(e.target.value); setRepoError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && saveGithubSettings()}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 7,
                      border: `1px solid ${repoError ? "var(--danger, #ef4444)" : "var(--border, #2a2a2a)"}`,
                      background: "var(--bg-primary, #0a0a0a)", color: "var(--text-primary, #e5e5e5)",
                      fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none",
                    }}
                  />
                  {repoError && <span style={{ fontSize: 11, color: "var(--danger, #ef4444)", marginTop: -4 }}>{repoError}</span>}

                  <div style={{ fontSize: 11, color: "var(--text-tertiary, #555)", lineHeight: 1.5 }}>
                    {t("github.help")}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" disabled={!githubInput.trim() || githubVerifying} onClick={saveGithubSettings} style={{ flex: 1 }}>
                      {githubVerifying ? t("github.verifying") : t("github.save")}
                    </button>
                    {githubToken && (
                      <button className="btn-secondary" onClick={removeGithubToken} style={{ color: "var(--danger, #ef4444)", borderColor: "rgba(239,68,68,.3)" }}>
                        {t("github.remove")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isGithub && githubSaved && (
                <div style={{
                  marginTop: 6, padding: "7px 12px", borderRadius: 7,
                  background: "rgba(45,212,191,.08)", border: "1px solid rgba(45,212,191,.25)",
                  fontSize: 12, color: "var(--success, #2dd4bf)", animation: "fade-in 0.2s ease",
                }}>
                  {t("github.saved_success")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
