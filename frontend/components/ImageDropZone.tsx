"use client";
import { useRef, useState, DragEvent, ChangeEvent } from "react";

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function ImageDropZone({ value, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value ? URL.createObjectURL(value) : null;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onChange(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  };

  return (
    <div
      className={`drop-zone ${dragging ? "drag-over" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {preview ? (
        <>
          <img src={preview} alt="preview" />
          <p className="dz-hint" style={{ marginTop: "0.75rem" }}>
            คลิกเพื่อเปลี่ยนรูป
          </p>
        </>
      ) : (
        <>
          <div className="dz-icon">📷</div>
          <p className="dz-text">คลิกหรือลากรูปภาพมาวางที่นี่</p>
          <p className="dz-hint">รองรับ JPG, PNG, WEBP</p>
        </>
      )}
    </div>
  );
}
