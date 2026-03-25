"use client";
import { useState, useEffect, FormEvent } from "react";
import ImageDropZone from "@/components/ImageDropZone";

const API = "http://localhost:8000";

/* ── KU campus places (always available as suggestions) ── */
const KU_PLACES = [
  "อาคารเรียนรวม",
  "ตึกวิศวกรรม",
  "คณะวิทยาศาสตร์",
  "คณะมนุษยศาสตร์",
  "คณะเศรษฐศาสตร์",
  "คณะบริหารธุรกิจ",
  "คณะสังคมศาสตร์",
  "คณะเกษตร",
  "สำนักหอสมุด",
  "โรงอาหารกลาง 1",
  "โรงอาหารกลาง 2",
  "ศาลาหกเหลี่ยม",
  "อาคารจอดรถ",
  "สนามกีฬา",
  "หอพักนิสิต",
  "KU Happy Place",
  "ศูนย์เรียนรวม",
];

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
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [tab, setTab] = useState<"all" | "lost" | "found">("all");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const toDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  };

  const nowLocal = toDateTimeLocal(new Date());

  /* Fetch available locations from backend + merge with KU defaults */
  useEffect(() => {
    fetch(`${API}/locations`)
      .then((r) => r.json())
      .then((data) => {
        const backend: string[] = data.locations ?? [];
        const merged = Array.from(new Set([...KU_PLACES, ...backend])).sort(
          (a, b) => a.localeCompare(b, "th"),
        );
        setLocations(merged);
      })
      .catch(() =>
        setLocations([...KU_PLACES].sort((a, b) => a.localeCompare(b, "th"))),
      );
    handleSearch(undefined, undefined, true);
  }, []);

  const handleSearch = async (
    e?: FormEvent,
    imageOverride?: File | null,
    forceSearch = false,
  ) => {
    e?.preventDefault();
    const effectiveImage = imageOverride ?? image;
    const hasActiveFilter =
      query.trim() || effectiveImage || location || startTime || endTime;
    if (!hasActiveFilter && !forceSearch) return;

    setLoading(true);
    setSearched(true);
    setError("");

    const fd = new FormData();
    fd.append("query", query);
    fd.append("target_type", tab);
    fd.append("n_results", "20");
    if (location) fd.append("location", location);
    if (startTime) fd.append("start_time", startTime);
    if (endTime) fd.append("end_time", endTime);
    if (effectiveImage) fd.append("image", effectiveImage);

    try {
      const res = await fetch(`${API}/search`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results ?? []);
      console.log("success", data);
    } catch (err: any) {
      setError(err.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSearch = async (file: File | null) => {
    setImage(file);
    if (!file) return;
    await handleSearch(undefined, file);
  };

  const scoreColor = (s: number) => {
    if (s >= 0.7) return "#22c55e";
    if (s >= 0.4) return "#c9a227";
    return "#8fa895";
  };

  return (
    <main className="page">
      <h1 className="section-title">🔍 ค้นหาสิ่งของ</h1>
      <p className="section-sub">
        ค้นหาด้วยข้อความภาษาไทย/อังกฤษ หรืออัปโหลดรูปภาพ AI
        จะหาสิ่งที่คล้ายที่สุดให้
      </p>

      {/* ── Search controls ── */}
      <form
        onSubmit={handleSearch}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          padding: "1.5rem",
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
        }}
      >
        {/* Text */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            id="search-query"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="สิ่งของที่ต้องการค้นหา เช่น กระเป๋าสีดำ, กุญแจรถ..."
            style={{ flex: 1 }}
          />
          <button
            id="search-btn"
            className="btn btn-primary"
            type="submit"
            disabled={
              loading ||
              !(query.trim() || image || location || startTime || endTime)
            }
          >
            {loading ? "กำลังค้น..." : "ค้นหา"}
          </button>
        </div>

        {/* Image (optional) */}
        <details style={{ fontSize: "0.85rem" }}>
          <summary style={{ cursor: "pointer", color: "var(--text-secondary)", userSelect: "none", marginBottom: "0.8rem" }}>
            📸 ค้นหาสิ่งของด้วยรูปภาพ (ไม่บังคับ)
          </summary>
          <ImageDropZone value={image} onChange={handleImageSearch} />
        </details>

        {/* ── Additional Filters row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Type filter tabs */}
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.4rem",
              }}
            >
              ประเภท
            </div>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {[
                { key: "all", label: "ทั้งหมด" },
                { key: "lost", label: "😟 หาย" },
                { key: "found", label: "🎉 พบ" },
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
          </div>

          {/* Location filter */}
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.4rem",
              }}
            >
              📍 สถานที่
            </div>
            <div style={{ position: "relative" }}>
              <select
                aria-label="select-location"
                id="search-location"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  fontSize: "0.85rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "999px",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="">ทุกสถานที่</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: "absolute",
                  right: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  fontSize: "0.6rem",
                  color: "var(--text-muted)",
                }}
              >
                ▼
              </div>
            </div>
          </div>

          {/* Time range row */}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              marginTop: "0.5rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.3rem",
                }}
              >
                ตั้งแต่เวลา
              </div>
              <input
                aria-label="set-start-time"
                type="datetime-local"
                className="form-input"
                style={{
                  fontSize: "0.8rem",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "var(--radius-sm)",
                }}
                value={startTime}
                onChange={(e) => {
                  if (e.target.value && e.target.value <= nowLocal) {
                    if (!endTime) {
                      setEndTime(e.target.value);
                    } else if (endTime && e.target.value <= endTime) {
                      setStartTime(e.target.value);
                    } else {
                      setStartTime("");
                      setError("เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");
                    }
                  } else {
                    setStartTime("");
                    setError(
                      "เวลาเริ่มต้นต้องน้อยกว่าเวลาหรือเท่ากับเวลาปัจจุบัน",
                    );
                  }
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.3rem",
                }}
              >
                ถึงเวลา
              </div>
              <input
                aria-label="set-end-time"
                type="datetime-local"
                className="form-input"
                style={{
                  fontSize: "0.8rem",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "var(--radius-sm)",
                }}
                max={nowLocal}
                value={endTime}
                onChange={(e) => {
                  if (
                    e.target.value &&
                    e.target.value >= startTime &&
                    e.target.value <= nowLocal
                  ) {
                    setEndTime(e.target.value);
                  } else {
                    setEndTime("");
                    setError(
                      "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น และไม่เกินเวลาปัจจุบัน",
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {(location || startTime || endTime) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
              paddingTop: "0.4rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              ตัวกรองที่ใช้งาน:
            </span>
            {location && (
              <span className="filter-chip">
                📍 {location}
                <button type="button" onClick={() => setLocation("")}>
                  ×
                </button>
              </span>
            )}
            {startTime && (
              <span className="filter-chip">
                🕒 ตั้งแต่: {startTime.replace("T", " ")}
                <button type="button" onClick={() => setStartTime("")}>
                  ×
                </button>
              </span>
            )}
            {endTime && (
              <span className="filter-chip">
                📅 จนถึง: {endTime.replace("T", " ")}
                <button type="button" onClick={() => setEndTime("")}>
                  ×
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setLocation("");
                setStartTime("");
                setEndTime("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--ku-gold)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                marginLeft: "auto",
              }}
            >
              ล้างทั้งหมด
            </button>
          </div>
        )}
      </form>

      {/* ── Error ── */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Loading ── */}
      {loading && (
        <div
          className="spinner-wrap"
          style={{ flexDirection: "column", gap: "0.75rem" }}
        >
          <div className="spinner" />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            AI กำลังวิเคราะห์...
          </span>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && searched && results.length > 0 && (
        <>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            พบ{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {results.length}
            </strong>{" "}
            รายการที่ตรงกัน
            {location && (
              <span style={{ color: "var(--text-muted)" }}>
                {" "}
                — สถานที่: {location}
              </span>
            )}
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
                      {item.type === "lost" ? "😟 หาย" : "🎉 พบ"}
                    </span>
                    <span className="badge badge-score">
                      {item.score ? (item.score * 100).toFixed(0) : "0"}% match
                    </span>
                  </div>
                  <div className="result-card-title">{item.name}</div>
                  {item.description && (
                    <div className="result-card-desc">{item.description}</div>
                  )}
                  {item.location && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginTop: "0.2rem",
                      }}
                    >
                      📍 {item.location}
                    </div>
                  )}
                  {/* Score breakdown */}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      gap: "0.75rem",
                    }}
                  >
                    <span>
                      🖼 Image:{" "}
                      <strong style={{ color: scoreColor(item.image_score) }}>
                        {(item.image_score * 100).toFixed(0)}%
                      </strong>
                    </span>
                    <span>
                      📝 Text:{" "}
                      <strong style={{ color: scoreColor(item.text_score) }}>
                        {(item.text_score * 100).toFixed(0)}%
                      </strong>
                    </span>
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
          <p>
            ลองเปลี่ยนคำค้นหา{location ? " หรือลองเปลี่ยนสถานที่" : ""}{" "}
            หรือตรวจสอบว่าเปิด Backend ไว้แล้ว
          </p>
        </div>
      )}

      {/* ── Initial state ── */}
      {!searched && (
        <div className="empty">
          <div className="empty-icon">✨</div>
          <h3>พร้อมค้นหา</h3>
          <p>พิมพ์ชื่อสิ่งของหรือแนบรูปภาพสิ่งของที่ต้องการค้นหาไว้ด้านบนเพื่อให้ AI ช่วยหาของที่ตรงกัน</p>
        </div>
      )}
    </main>
  );
}
