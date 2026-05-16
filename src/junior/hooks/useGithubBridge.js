// src/junior/hooks/useGithubBridge.js
const ENGINE_URL = import.meta.env.VITE_ENGINE_URL;

export function useGithubBridge() {
  const getCredentials = () => ({
    token: localStorage.getItem("github_token"),
    repo: localStorage.getItem("github_repo"),
  });

  // Dosya commit et
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

  // Dosya çek
  const fetchFile = async (path) => {
    const { token, repo } = getCredentials();
    if (!token || !repo) {
      throw new Error("GitHub token veya repo eksik.");
    }

    const params = new URLSearchParams({ token, repo, path });
    const res = await fetch(`${ENGINE_URL}/github/file?${params}`);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Dosya çekilemedi");
    }

    return await res.json(); // { content, sha, path }
  };

  return { commitFile, fetchFile };
}
