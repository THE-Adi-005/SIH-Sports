# SAI Sports Assessment — Localhost POC (Vite + FastAPI)

Lightweight, offline-first prototype for **sit-ups**, **high (vertical) jump**, and **standing long jump**.

## Stack
- **Frontend:** React + Vite (localhost:5173)
- **Backend:** FastAPI + MediaPipe Pose + OpenCV (localhost:8000)

## Run backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
# open http://127.0.0.1:5173
```

## Usage tips
- Keep the **camera static** (prop it on a chair/tripod).
- Ensure **full body** is visible with **good lighting**.
- For **long jump**, entering athlete height improves distance scaling.
- Outputs are JSON with simple flags; good enough for round-one screening.