"use client";
import { useState } from "react";
import Link from "next/link";
import ImageDropZone from "@/components/ImageDropZone";

const API = "http://localhost:8000";

export default function ReportLostPage() {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
      const res = await fetch(`${API}/report/lost`, { method: "POST", body: fd });
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
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h1 className="section-title" style={{ marginBottom: "0.6rem" }}>แจ้งรายการสำเร็จ!</h1>
          <p className="section-sub">ระบบ AI จะช่วยค้นหาของท่านโดยอัตโนมัติ</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <Link href="/search" className="btn btn-primary">🔍 ค้นหาของฉัน</Link>
            <button className="btn btn-outline" onClick={() => {
              setStatus("idle"); setName(""); setDescription(""); setLocation(""); setTime(""); setImage(null);
            }}>แจ้งอีกรายการ</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-sm">
      <div style={{ marginBottom: "0.4rem" }}>
        <span className="badge badge-lost">😟 รายการของหาย</span>
      </div>
      <h1 className="section-title">แจ้งของหาย</h1>
      <p className="section-sub">กรอกรายละเอียดสิ่งของที่หายไป AI จะค้นหารายการที่ตรงกันให้อัตโนมัติ</p>

      {status === "error" && (
        <div className="alert alert-error">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">รูปภาพของสิ่งของ (ไม่บังคับ)</label>
          <ImageDropZone value={image} onChange={setImage} />
        </div>

        <div className="form-group">
          <label className="form-label">สิ่งของ *</label>
          <input
            className="form-input"
            placeholder="เช่น กระเป๋าสตางค์สีน้ำเงิน, กุญแจรถ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">รายละเอียด</label>
          <textarea
            className="form-textarea"
            placeholder="อธิบายลักษณะของสิ่งของ เช่น สี แบรนด์ ลักษณะพิเศษ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">สถานที่ที่พบเห็นล่าสุด</label>
            <input
              className="form-input"
              placeholder="เช่น ตึกวิศวกรรม, โรงอาหารกลาง 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">วันที่/เวลา</label>
            <input
              className="form-input"
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={status === "loading" || !name.trim()}
          style={{ width: "100%", marginTop: "0.5rem" }}
        >
          {status === "loading" ? "กำลังส่ง..." : "📨 ส่งรายการแจ้งของหาย"}
        </button>
      </form>
    </main>
  );
}
