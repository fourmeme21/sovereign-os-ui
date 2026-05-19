import { useState } from "react";
import { apiCall } from "../../lib/apiClient";

const DEFAULT_PROJECT = "my-saas";

export default function ProjHafizasi() {
  const [fileName, setFileName]       = useState("");
  const [content, setContent]         = useState("");
  const [query, setQuery]             = useState("");
  const [queryResult, setQueryResult] = useState([]);
  const [uploads, setUploads]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleUpload = async () => {
    if (!fileName || !content) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiCall("/memory/upload", {
        method: "POST",
        body: JSON.stringify({
          project_id: DEFAULT_PROJECT,
          file_name:  fileName,
          content,
        }),
      });
      setUploads(prev => [
        { file_name: fileName, chunks_saved: data.chunks_saved ?? data.chunks_created ?? 1 },
        ...prev,
      ]);
      setFileName("");
      setContent("");
    } catch (e) {
      // feature_locked → Phase E'ye kadar göster; quota → apiCall yönlendiriyor
      if (!e.message.startsWith("feature_locked") && e.message !== "quota_exceeded") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiCall("/memory/query", {
        method: "POST",
        body: JSON.stringify({
          project_id: DEFAULT_PROJECT,
          query,
          top_k: 3,
        }),
      });
      setQueryResult(data.results || []);
    } catch (e) {
      if (!e.message.startsWith("feature_locked") && e.message !== "quota_exceeded") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-hafiza">
      <div className="screen-header">
        <h2 className="screen-title">Proje Hafızası</h2>
      </div>

      {error && (
        <div className="hafiza-error">⚠ {error}</div>
      )}

      {/* Upload */}
      <section className="hafiza-section">
        <h3 className="section-title">Doküman Ekle</h3>
        <input
          className="hafiza-input"
          placeholder="Dosya adı (ör: PRD.md)"
          value={fileName}
          onChange={e => setFileName(e.target.value)}
        />
        <textarea
          className="hafiza-textarea"
          placeholder="Doküman içeriği..."
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={loading || !fileName || !content}
        >
          {loading ? "Yükleniyor..." : "+ Hafızaya Ekle"}
        </button>

        {uploads.length > 0 && (
          <div className="upload-list">
            {uploads.slice(0, 5).map((u, i) => (
              <div key={i} className="upload-row">
                <span>📄 {u.file_name}</span>
                <span className="upload-count">{u.chunks_saved} bölüm</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Query */}
      <section className="hafiza-section">
        <h3 className="section-title">Hafızayı Sorgula</h3>
        <div className="query-row">
          <input
            className="hafiza-input"
            placeholder="Ne öğrenmek istiyorsun?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleQuery()}
          />
          <button className="btn-primary" onClick={handleQuery} disabled={loading || !query}>
            Sor
          </button>
        </div>

        {queryResult.length > 0 && (
          <div className="query-results">
            {queryResult.map((r, i) => (
              <div key={i} className="query-result-row">
                <div className="result-source">
                  📄 {r.source_file || r.source_path || "Bilinmiyor"}
                  <span className="result-score">
                    %{Math.round((r.score ?? r.similarity ?? 0) * 100)}
                  </span>
                </div>
                <p className="result-content">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
