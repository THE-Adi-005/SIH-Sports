# SAI Sports Assessment — Localhost POC (Vite + FastAPI)

This is a lightweight **offline-first prototype** for assessing basic sports fitness tests including **sit-ups**, **high (vertical) jump**, and **standing long jump**. The project is built with a modern stack — **React with Vite** for the frontend, and **FastAPI with MediaPipe Pose + OpenCV** for the backend.  

It is designed for **round-one physical screening** where athletes’ performances are automatically analyzed through the camera and evaluated with simple JSON outputs.

---

## Features
- **Sit-ups detection**: Counts correct repetitions using pose estimation.
- **Vertical jump measurement**: Tracks max elevation from baseline using body posture.
- **Standing long jump estimation**: Approximates distance covered, with height adjustment for improved scaling.
- **Offline-first prototype**: No dependency on cloud inference, runs locally.
- **Simple integration**: Clean JSON outputs with flags indicating pass/fail or measurement values.

---

## Demo Screenshots
Below are example UI previews for the prototype:

### Main Dashboard
![Main Dashboard]("C:\Users\Adithya R\Downloads\first_page.png")

### Live Analysis Page
![Analyzing Page]("C:\Users\Adithya R\Downloads\Analyse_Page.png")

### Networking/Backend Connection View
![Networking Page]("C:\Users\Adithya R\Downloads\Network_page.png")

---

## Tech Stack
- **Frontend:** React + Vite (runs on `localhost:5173`)  
- **Backend:** FastAPI + MediaPipe Pose + OpenCV (runs on `localhost:8000`)  

---

## Getting Started

### Run Backend
cd backend
python -m venv .venv
Activate environment
Windows: .venv\Scripts\activate
macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload


### Run Frontend
cd frontend
npm install
npm run dev

open http://127.0.0.1:5173

---

## Usage Tips
- Keep the **camera fixed** on a tripod or stable chair for best accuracy.
- Ensure **good lighting** and a **fully visible body frame** inside the camera.
- For **long jump**, providing the athlete’s height as input will improve scaling accuracy.
- Outputs are **basic JSON objects** containing metrics and flags, sufficient for initial evaluation or trial runs.

---

## Example JSON Output
{
"exercise": "situps",
"repetitions": 15,
"valid_reps": 13,
"completed": true
}


*********
## Notes
- This is an **early stage prototype** aimed at **proof-of-concept testing**.  
- Optimized for **offline use cases**, with future improvements possible around precision, UI enhancements, and better metric scaling.


