"use client";
import { useState, FormEvent } from "react";
import ImageDropZone from "@/components/ImageDropZone";

const API = "http://localhost:8000";

interface Result {
  id: string;
  type: string;
  name: string;
  description: string;
  location: string;
  report_time: string;
  image_path: string | null;
  score: number;
  image_score: number;
  text_score: number;
}

export default function SearchPage() {
  const [query, setQuery]   = useState("");
  const [image, setImage]   = useState<File | null>(null);
  const [tab, setTab]       = useState<"all" | "lost" | "found">("all");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]   = useState("");

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim() && !image) return;
    setLoading(true);
    setSearched(true);
    setError("");

    const fd = new FormData();
    fd.append("query", query);
    fd.append("target_type", tab);
    fd.append("n_results", "20");
    if (image) fd.append("image", image);

    try {
      const res = await fetch(`${API}/search`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err: any) {
      setError(err.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => {
    if (s >= 0.7) return "#22c55e";
    if (s >= 0.4) return "#c9a227";
    return "#8fa895";
  };

  return (
    <main className="page">
      <h1 className="section-title">🔍 ค้นหาสิ่งของ</h1>
      <p className="section-sub">ค้นหาด้วยข้อความภาษาไทย/อังกฤษ หรืออัปโหลดรูปภาพ AI จะหาสิ่งที่คล้ายที่สุดให้</p>

      {/* ── Search controls ── */}
      <form onSubmit={handleSearch} style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>
        {/* Text */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            id="search-query"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์คำค้นหา เช่น กระเป๋าสีดำ, กุญแจรถ..."
            style={{ flex: 1 }}
          />
          <button
            id="search-btn"
            className="btn btn-primary"
            type="submit"
            disabled={loading || (!query.trim() && !image)}
          >
            {loading ? "กำลังค้น..." : "ค้นหา"}
          </button>
        </div>

        {/* Image (optional) */}
        <details style={{ fontSize: "0.85rem" }}>
          <summary style={{ cursor: "pointer", color: "var(--text-secondary)", userSelect: "none", marginBottom: "0.8rem" }}>
            📸 ค้นหาด้วยรูปภาพ (ไม่บังคับ)
          </summary>
          <ImageDropZone value={image} onChange={setImage} />
        </details>

        {/* Filter tabs */}
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[
            { key: "all", label: "ทั้งหมด" },
            { key: "lost", label: "😟 รายการหาย" },
            { key: "found", label: "🎉 รายการเจอ" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              className={`tab-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key as typeof tab)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {/* ── Error ── */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Loading ── */}
      {loading && (
        <div className="spinner-wrap" style={{ flexDirection: "column", gap: "0.75rem" }}>
          <div className="spinner" />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>AI กำลังวิเคราะห์...</span>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && searched && results.length > 0 && (
        <>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            พบ <strong style={{ color: "var(--text-primary)" }}>{results.length}</strong> รายการที่ตรงกัน
          </p>
          <div className="results-grid">
            {results.map((item, i) => (
              <div
                key={item.id}
                className="result-card fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {item.image_path ? (
                  <img
                    className="result-card-img"
                    src={`${API}${item.image_path}`}
                    alt={item.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="result-card-img-placeholder">🖼️</div>
                )}
                <div className="result-card-body">
                  <div className="result-card-meta">
                    <span className={`badge badge-${item.type}`}>
                      {item.type === "lost" ? "😟 หาย" : "🎉 เจอ"}
                    </span>
                    <span className="badge badge-score">
                      {(item.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <div className="result-card-title">{item.name}</div>
                  {item.description && (
                    <div className="result-card-desc">{item.description}</div>
                  )}
                  {item.location && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      📍 {item.location}
                    </div>
                  )}
                  {/* Score breakdown */}
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    gap: "0.75rem",
                  }}>
                    <span>🖼 Image: <strong style={{ color: scoreColor(item.image_score) }}>{(item.image_score * 100).toFixed(0)}%</strong></span>
                    <span>📝 Text: <strong style={{ color: scoreColor(item.text_score) }}>{(item.text_score * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── No results ── */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="empty fade-in">
          <div className="empty-icon">🔍</div>
          <h3>ไม่พบรายการที่ตรงกัน</h3>
          <p>ลองเปลี่ยนคำค้นหา หรือตรวจสอบว่าเปิด Backend ไว้แล้ว</p>
        </div>
      )}

      {/* ── Initial state ── */}
      {!searched && (
        <div className="empty">
          <div className="empty-icon">✨</div>
          <h3>พร้อมค้นหา</h3>
          <p>พิมพ์คำค้นหาด้านบนเพื่อให้ AI ช่วยหาของที่ตรงกัน</p>
        </div>
      )}
    </main>
  );
}
