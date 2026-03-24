"use client";
import { useState } from "react";
import Link from "next/link";
import ImageDropZone from "@/components/ImageDropZone";

const API = "http://localhost:8000";

export default function ReportFoundPage() {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours(),
    )}:${pad(d.getMinutes())}`;
  };

  const nowLocal = toDateTimeLocal(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("loading");

    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("location", location);
    fd.append("report_time", time);
    if (image) fd.append("image", image);

    try {
      const res = await fetch(`${API}/report/found`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message ?? "เกิดข้อผิดพลาด");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="page page-sm">
        <div style={{ textAlign: "center", paddingTop: "3rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h1 className="section-title" style={{ marginBottom: "0.6rem" }}>
            ขอบคุณที่ช่วยเหลือ!
          </h1>
          <p className="section-sub">
            ระบบจะแจ้งเตือนเจ้าของสิ่งของโดยอัตโนมัติ
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "1.5rem",
            }}
          >
            <Link href="/search" className="btn btn-primary">
              🔍 ดูรายการทั้งหมด
            </Link>
            <button
              className="btn btn-outline"
              onClick={() => {
                setStatus("idle");
                setName("");
                setDescription("");
                setLocation("");
                setTime("");
                setImage(null);
              }}
            >
              แจ้งอีกรายการ
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-sm">
      <div style={{ marginBottom: "0.4rem" }}>
        <span className="badge badge-found">🎉 รายการเจอ</span>
      </div>
      <h1 className="section-title">แจ้งของเจอ</h1>
      <p className="section-sub">
        พบสิ่งของที่ไม่มีเจ้าของ? แจ้งระบบเพื่อให้ AI ช่วยหาเจ้าของกลับ
      </p>

      {status === "error" && (
        <div className="alert alert-error">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">รูปภาพสิ่งของ (แนะนำ)</label>
          <ImageDropZone value={image} onChange={setImage} />
        </div>

        <div className="form-group">
          <label className="form-label">ชื่อสิ่งของ *</label>
          <input
            className="form-input"
            placeholder="เช่น กุญแจรถ, หูฟัง AirPods"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">รายละเอียด</label>
          <textarea
            className="form-textarea"
            placeholder="อธิบายสิ่งของ สี แบรนด์ ลักษณะพิเศษ สภาพ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">สถานที่ที่พบ</label>
            <input
              className="form-input"
              placeholder="เช่น ห้องสมุด, อาคาร 6"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">วันที่/เวลา</label>
            <input
              aria-label="set-found-date"
              className="form-input"
              type="datetime-local"
              value={time}
              max={nowLocal}
              onChange={(e) => {
                if (new Date(e.target.value).getTime() > Date.now()) {
                  setErrorMsg("โปรดเลือกวันที่และเวลาที่ถูกต้อง");
                } else {
                  setErrorMsg("");
                  setTime(e.target.value);
                }
              }}
            />
          </div>
        </div>

        <button
          className="btn btn-gold"
          type="submit"
          disabled={status === "loading" || !name.trim()}
          style={{ width: "100%", marginTop: "0.5rem" }}
        >
          {status === "loading" ? "กำลังส่ง..." : "📨 ส่งรายการแจ้งของเจอ"}
        </button>
      </form>
    </main>
  );
}
