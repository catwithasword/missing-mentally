"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://localhost:8000";

export default function LandingPage() {
  const [stats, setStats] = useState({ lost_items: 0, found_items: 0, total_items: 0 });

  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <main className="page" style={{ padding: "3rem 1.5rem 5rem" }}>
      {/* ── Hero ── */}
      <section style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ marginBottom: "1.2rem" }}>
          <span style={{
            display: "inline-block",
            padding: "0.3rem 1rem",
            borderRadius: 999,
            fontSize: "0.8rem",
            fontWeight: 600,
            background: "rgba(201,162,39,0.1)",
            color: "var(--ku-gold)",
            border: "1px solid rgba(201,162,39,0.2)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            KU AI Pioneers — Missing Mentally
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.15,
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #1a5c38 40%, #c9a227)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          KU Smart Lost &amp; Found
        </h1>

        <p style={{
          fontSize: "1.1rem",
          color: "var(--text-secondary)",
          maxWidth: 520,
          margin: "0 auto 2rem",
          lineHeight: 1.7,
        }}>
          ระบบค้นหาของหายด้วย AI สำหรับมหาวิทยาลัยเกษตรศาสตร์ — หาของหายด้วย Image Matching และ Semantic Search
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/report/lost" className="btn btn-primary btn-lg">
            😟 ทำของหาย
          </Link>
          <Link href="/report/found" className="btn btn-gold btn-lg">
            🎉 เจอของ
          </Link>
          <Link href="/search" className="btn btn-outline btn-lg">
            🔍 ค้นหาสิ่งของ
          </Link>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem",
        maxWidth: 600,
        margin: "0 auto 4rem",
      }}>
        {[
          { label: "รายการหาย", value: stats.lost_items, color: "var(--lost-color)" },
          { label: "รายการเจอ", value: stats.found_items, color: "var(--found-color)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: 860, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          วิธีการทำงาน
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
          ระบบ AI ของเราจะจับคู่ของหายอัตโนมัติด้วย 2 เทคโนโลยี
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem" }}>
          {[
            {
              num: "01",
              emoji: "📸",
              title: "แจ้งรายการ",
              desc: "ถ่ายรูปสิ่งของและกรอกรายละเอียด เช่น สถานที่และเวลาที่พบ/หาย",
            },
            {
              num: "02",
              emoji: "🤖",
              title: "AI วิเคราะห์",
              desc: "CLIP Image Matching + LLM Semantic Search สแกนฐานข้อมูลเพื่อหาคู่ที่ตรงกัน",
            },
            {
              num: "03",
              emoji: "✅",
              title: "จับคู่สำเร็จ",
              desc: "ระบบแสดงผลลัพธ์จากคะแนน AI รวมทั้งภาพและข้อความที่คล้ายกันมากที่สุด",
            },
          ].map((step) => (
            <div key={step.num} className="card" style={{ padding: "1.5rem" }}>
              <div style={{
                display: "inline-block",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--ku-green)",
                background: "rgba(26,92,56,0.12)",
                padding: "0.2rem 0.6rem",
                borderRadius: 999,
                marginBottom: "0.8rem",
                letterSpacing: "0.08em",
              }}>
                STEP {step.num}
              </div>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{step.emoji}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{step.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Tech badge ── */}
      <section style={{ textAlign: "center", marginTop: "3.5rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>Powered by</p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
          {["OpenCLIP", "nomic-embed-text (Ollama)", "FastAPI", "ChromaDB"].map((t) => (
            <span key={t} style={{
              padding: "0.3rem 0.8rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "1px solid var(--border-subtle)",
              borderRadius: 999,
              color: "var(--text-secondary)",
            }}>{t}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
