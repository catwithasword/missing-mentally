"""
KU Smart Lost & Found — FastAPI Backend
Proposal: Missing Mentally | KU AI Pioneers Hackathon

AI Pipeline:
  - CLIP (OpenCLIP) for image similarity
  - Ollama nomic-embed-text for semantic Thai/English text similarity
  - Combined ranking: 60% image + 40% text score
"""

from __future__ import annotations

import io
import time
import uuid
import base64
import asyncio
from typing import Optional, List
from pathlib import Path

import numpy as np
import httpx
from PIL import Image
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction

# ──────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────
UPLOADS_DIR = Path("./uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

OLLAMA_URL = "http://localhost:11434/api/embeddings"
OLLAMA_MODEL = "nomic-embed-text"
OLLAMA_TIMEOUT = 10.0


# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────
app = FastAPI(title="KU Smart Lost & Found API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ──────────────────────────────────────────────
# CLIP setup
# ──────────────────────────────────────────────
embedding_fn = OpenCLIPEmbeddingFunction()


def clip_embed_image_array(img_array: np.ndarray) -> np.ndarray:
    """Get CLIP embedding for a numpy image array."""
    result = embedding_fn._encode_image(img_array)
    return np.array(result, dtype=np.float32)


def clip_embed_text(text: str) -> np.ndarray:
    """Get CLIP embedding for a text string."""
    result = embedding_fn._encode_text(text)
    return np.array(result, dtype=np.float32)


# ──────────────────────────────────────────────
# LLM (Ollama) text embedding
# ──────────────────────────────────────────────
async def llm_embed_text(text: str) -> Optional[np.ndarray]:
    """Get nomic-embed-text embedding via Ollama. Returns None on failure."""
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            resp = await client.post(
                OLLAMA_URL,
                json={"model": OLLAMA_MODEL, "prompt": text},
            )
            resp.raise_for_status()
            data = resp.json()
            return np.array(data["embedding"], dtype=np.float32)
    except Exception:
        return None


def keyword_similarity(query: str, text: str) -> float:
    """Fallback keyword overlap similarity when Ollama is unavailable."""
    q_words = set(query.lower().split())
    t_words = set(text.lower().split())
    if not q_words or not t_words:
        return 0.0
    return len(q_words & t_words) / len(q_words | t_words)


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


# ──────────────────────────────────────────────
# In-memory store
# ──────────────────────────────────────────────
# Each item: { id, type, name, description, location, report_time,
#              image_path, clip_image_emb, clip_text_emb, llm_text_emb }
ITEMS: List[dict] = []


def _to_response(item: dict) -> dict:
    """Strip numpy arrays before returning to client."""
    return {
        k: v
        for k, v in item.items()
        if k not in ("clip_image_emb", "clip_text_emb", "llm_text_emb")
    }


# ──────────────────────────────────────────────
# Helper: process uploaded image
# ──────────────────────────────────────────────
async def process_image(file: UploadFile) -> tuple[str, np.ndarray]:
    """Save image to disk, return (public_path, numpy_array)."""
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img_array = np.array(img)
    filename = f"{uuid.uuid4().hex}.jpg"
    save_path = UPLOADS_DIR / filename
    img.save(save_path, "JPEG", quality=85)
    return f"/uploads/{filename}", img_array


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────


@app.get("/health")
async def health():
    lost_count = sum(1 for i in ITEMS if i["type"] == "lost")
    found_count = sum(1 for i in ITEMS if i["type"] == "found")
    return {
        "status": "ok",
        "lost_items": lost_count,
        "found_items": found_count,
        "total_items": len(ITEMS),
    }


@app.post("/report/lost")
async def report_lost(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(""),
    report_time: str = Form(""),
    image: Optional[UploadFile] = File(None),
):
    return await _create_report("lost", name, description, location, report_time, image)


@app.post("/report/found")
async def report_found(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(""),
    report_time: str = Form(""),
    image: Optional[UploadFile] = File(None),
):
    return await _create_report(
        "found", name, description, location, report_time, image
    )


async def _create_report(
    item_type: str,
    name: str,
    description: str,
    location: str,
    report_time: str,
    image: Optional[UploadFile],
):
    item = {
        "id": uuid.uuid4().hex,
        "type": item_type,
        "name": name,
        "description": description,
        "location": location,
        "report_time": (
            report_time.replace("T", " ")
            if report_time
            else time.strftime("%Y-%m-%d %H:%M")
        ),
        "image_path": None,
        "clip_image_emb": None,
        "clip_text_emb": None,
        "llm_text_emb": None,
    }

    # Image embedding
    if image and image.filename:
        path, img_array = await process_image(image)
        item["image_path"] = path
        try:
            item["clip_image_emb"] = clip_embed_image_array(img_array)
        except Exception:
            pass

    # Text embeddings
    full_text = f"{name} {description} {location}"
    try:
        item["clip_text_emb"] = clip_embed_text(full_text)
    except Exception:
        pass

    llm_emb = await llm_embed_text(full_text)
    item["llm_text_emb"] = llm_emb  # may be None if Ollama unavailable

    ITEMS.append(item)
    return {"status": "created", "item": _to_response(item)}


@app.get("/items/{item_type}")
async def list_items(item_type: str):
    if item_type not in ("lost", "found", "all"):
        raise HTTPException(400, "item_type must be lost, found, or all")
    items = (
        ITEMS if item_type == "all" else [i for i in ITEMS if i["type"] == item_type]
    )
    return {"items": [_to_response(i) for i in items]}


@app.get("/locations")
async def list_locations():
    """Return all unique non-empty locations from reported items."""
    locs = sorted({i["location"] for i in ITEMS if i.get("location")})
    return {"locations": locs}


@app.post("/search")
async def search(
    query: str = Form(""),
    target_type: str = Form("all"),  # "lost", "found", or "all"
    location: str = Form(""),  # filter by location (substring match)
    start_time: str = Form(""),  # "YYYY-MM-DD HH:MM" or "YYYY-MM-DDTHH:MM"
    end_time: str = Form(""),  # "YYYY-MM-DD HH:MM" or "YYYY-MM-DDTHH:MM"
    image: Optional[UploadFile] = File(None),
    n_results: int = Form(12),
):
    # Return all items if no search criteria provided
    if (
        not query
        and (not image or not image.filename)
        and not location
        and not start_time
        and not end_time
    ):
        pool = (
            ITEMS
            if target_type == "all"
            else [i for i in ITEMS if i["type"] == target_type]
        )
        print("Items", ITEMS)
        print("pool", pool)
        return {"results": [_to_response(i) for i in pool]}

    if not query and (not image or not image.filename):
        raise HTTPException(400, "Provide at least a text query or an image.")

    pool = (
        ITEMS
        if target_type == "all"
        else [i for i in ITEMS if i["type"] == target_type]
    )

    # Filter by location if specified
    if location:
        pool = [i for i in pool if location.lower() in i.get("location", "").lower()]

    # Filter by time if specified
    if start_time or end_time:
        s = start_time.replace("T", " ")
        e = end_time.replace("T", " ")
        filtered = []
        for item in pool:
            t = item.get("report_time", "")
            if s and t < s:
                continue
            if e and t > e:
                continue
            filtered.append(item)
        pool = filtered

    if not pool:
        return {"results": []}

    # ── Query embeddings ──
    query_clip_img_emb: Optional[np.ndarray] = None
    query_clip_txt_emb: Optional[np.ndarray] = None
    query_llm_emb: Optional[np.ndarray] = None

    if image and image.filename:
        _, img_array = await process_image(image)
        try:
            query_clip_img_emb = clip_embed_image_array(img_array)
        except Exception:
            pass

    if query:
        try:
            query_clip_txt_emb = clip_embed_text(query)
        except Exception:
            pass
        query_llm_emb = await llm_embed_text(query)

    # ── Score each item ──
    scored = []
    for item in pool:
        img_score = 0.0
        text_score = 0.0
        has_img_signal = False
        has_txt_signal = False

        # Image-to-image similarity
        if query_clip_img_emb is not None and item.get("clip_image_emb") is not None:
            img_score = max(
                img_score, cosine_sim(query_clip_img_emb, item["clip_image_emb"])
            )
            has_img_signal = True

        # Text query → CLIP text embedding vs item CLIP image embedding
        if query_clip_txt_emb is not None and item.get("clip_image_emb") is not None:
            s = cosine_sim(query_clip_txt_emb, item["clip_image_emb"])
            img_score = max(img_score, s)
            has_img_signal = True

        # Text query → CLIP text vs item CLIP text
        if query_clip_txt_emb is not None and item.get("clip_text_emb") is not None:
            s = cosine_sim(query_clip_txt_emb, item["clip_text_emb"])
            text_score = max(text_score, s)
            has_txt_signal = True

        # LLM semantic text similarity
        if query_llm_emb is not None and item.get("llm_text_emb") is not None:
            s = cosine_sim(query_llm_emb, item["llm_text_emb"])
            text_score = max(text_score, s)
            has_txt_signal = True
        elif query and not has_txt_signal:
            # Keyword fallback
            text_score = keyword_similarity(
                query, f"{item['name']} {item['description']}"
            )

        # Weighted combination
        combined = 0.0
        if has_img_signal and has_txt_signal:
            combined = 0.6 * img_score + 0.4 * text_score
        elif has_img_signal:
            combined = img_score
        elif has_txt_signal:
            combined = text_score
        else:
            combined = text_score  # keyword fallback only

        scored.append(
            {
                **_to_response(item),
                "image_score": round(img_score, 4),
                "text_score": round(text_score, 4),
                "score": round(combined, 4),
            }
        )

    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"results": scored[:n_results]}
