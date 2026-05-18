// src/junior/hooks/useGithubBridge.js
// Task 0.6 — fetchFile: GET query string → POST body
// Token artık URL'de görünmüyor (Railway logları dahil)

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

export function useGithubBridge() {
  const getCredentials = () => ({
    token: localStorage.getItem("github_token"),
    repo:  localStorage.getItem("github_repo"),
  });

  // Dosya commit et — zaten POST body'de, değişiklik yok
  const commitFile = async ({ path, content, message }) => {
    const { token, repo } = getCredentials();
    if (!token || !repo) {
      throw new Error("GitHub token veya repo eksik. Ayarlar > Bağlan ekranını kontrol et.");
    }

    const res = await fetch(`${ENGINE_URL}/github/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, repo, path, content, message }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Commit başarısız");
    }

    return await res.json(); // { success, sha, url }
  };

  // Dosya çek — TASK 0.6: GET → POST (token query string'den body'e taşındı)
  const fetchFile = async (path) => {
    const { token, repo } = getCredentials();
    if (!token || !repo) {
      throw new Error("GitHub token veya repo eksik.");
    }

    // ÖNCE: fetch(`${ENGINE_URL}/github/file?token=${token}&repo=${repo}&path=${path}`)
    // SONRA: token body'de — Railway loglarında görünmez
    const res = await fetch(`${ENGINE_URL}/github/file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, repo, path }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Dosya çekilemedi");
    }

    return await res.json(); // { content, sha, path }
  };

  return { commitFile, fetchFile };
}
