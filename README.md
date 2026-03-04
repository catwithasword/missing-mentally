# 🔍 KU Smart Lost & Found

### **Missing Mentally — KU AI Pioneers Hackathon**

An intelligent Lost & Found search system for Kasetsart University (KU), powered by AI in both Computer Vision and Semantic Text Search to help students and staff find lost items faster and more accurately.

---

## 🚀 Key Features

- **AI-Powered Matching (60% Image + 40% Text)**: Hybrid ranking system that combines visual features and textual meaning for maximum precision.
- **Multi-Modal Search**: Search using natural language (Thai/English) or by uploading an image of the item.
- **Advanced Filtering**: Narrow down results by **Location** (Building/Faculty) and **Time Range** when the item was lost or found.
- **Premium Light Mode UI**: A modern, clean, and responsive user interface designed for a seamless user experience.
- **Campus-Wide Discovery**: A centralized hub for all Lost & Found items across the university.

---

## 🧠 AI Architecture

We utilize state-of-the-art AI models to handle complex multi-modal data:

1.  **OpenCLIP**: Handles Image Matching and Image-to-Text Embedding, enabling the system to "see" and understand visual characteristics of items.
2.  **Ollama (nomic-embed-text)**: Provides deep Semantic Search capabilities, understanding the _context_ and _meaning_ of words (e.g., recognizing that "car key" and "พวงกุญแจ" are semantically related).
3.  **ChromaDB**: (Optional integration) Used for efficient vector storage and high-speed similarity retrieval.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Vanilla CSS3 (Custom Design System)
- **Backend**: FastAPI (Python 3.11+)
- **AI/ML**: OpenCLIP (torch), Ollama API
- **Utilities**: Pillow (Image processing), NumPy, HTTPX

---

## ⚙️ Installation & Setup

### 1. Backend Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Install and launch **Ollama**:
   - Download from [ollama.com](https://ollama.com)
   - Pull the text embedding model:
     ```bash
     ollama pull nomic-embed-text
     ```
3. Run the API Server:
   ```bash
   uvicorn main_api:app --reload --port 8000
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the web application (Development Mode):
   ```bash
   npm run dev
   ```
3. Access the application in your browser at `http://localhost:3000`

---

## 📂 Project Structure

- `main_api.py`: Core FastAPI backend integrating the AI pipeline and data management.
- `frontend/`: Next.js web application for the user interface.
- `uploads/`: Directory where newly reported item images are stored.

---

**Developed by KU AI Pioneers — "Missing Mentally" Team**
