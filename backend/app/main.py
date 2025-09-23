from fastapi import FastAPI, UploadFile, File, Form, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict
import os, uuid, json, hashlib

from .processing import analyze_situps, analyze_vertical_jump, analyze_long_jump

# ----------------- Paths & storage -----------------
APP_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE = os.path.join(APP_DIR, "storage")
os.makedirs(STORAGE, exist_ok=True)

USERS_PATH = os.path.join(STORAGE, "users.json")

NET_PATH = os.path.join(STORAGE, "networks.json")
NET_MEDIA = os.path.join(STORAGE, "net_media")
os.makedirs(NET_MEDIA, exist_ok=True)

# ----------------- App & CORS -----------------
app = FastAPI(title="SAI Sports POC API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media for network posts (images)
app.mount("/media", StaticFiles(directory=NET_MEDIA), name="media")

# ----------------- Auth / Rewards helpers -----------------
SESSIONS: Dict[str, str] = {}  # token -> username

def _load_users():
    if not os.path.exists(USERS_PATH):
        with open(USERS_PATH, "w") as f: json.dump({}, f)
    with open(USERS_PATH, "r") as f: return json.load(f)

def _save_users(data):
    with open(USERS_PATH, "w") as f: json.dump(data, f)

def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def _get_user_from_token(token: str | None):
    if not token: return None
    return SESSIONS.get(token)

def _reward(username: str, points: int) -> int:
    data = _load_users()
    if username in data:
        data[username]["points"] = int(data[username].get("points", 0)) + int(points)
        _save_users(data)
        return data[username]["points"]
    return 0

# ----------------- Network helpers -----------------
def _load_nets():
    if not os.path.exists(NET_PATH):
        with open(NET_PATH, "w") as f: json.dump({"nets": []}, f)
    with open(NET_PATH, "r") as f: return json.load(f)

def _save_nets(d):
    with open(NET_PATH, "w") as f: json.dump(d, f)

# ----------------- Health -----------------
@app.get("/health")
async def health():
    return {"ok": True}

# ----------------- Auth / Rewards routes -----------------
@app.post("/auth/register")
async def register(username: str = Form(...), password: str = Form(...)):
    data = _load_users()
    if username in data:
        return {"ok": False, "error": "user_exists"}
    data[username] = {"password": _hash(password), "points": 0}
    _save_users(data)
    return {"ok": True}

@app.post("/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    data = _load_users()
    if username not in data or data[username]["password"] != _hash(password):
        return {"ok": False, "error": "invalid_credentials"}
    token = str(uuid.uuid4())
    SESSIONS[token] = username
    return {"ok": True, "token": token, "points": data[username]["points"]}

@app.get("/rewards/leaderboard")
async def leaderboard():
    data = _load_users()
    lb = [{"username": u, "points": v.get("points",0)} for u,v in data.items()]
    lb.sort(key=lambda x: -x["points"])
    return {"ok": True, "leaders": lb[:20]}

# ----------------- Analyze routes -----------------
@app.post("/api/analyze/situps")
async def api_situps(file: UploadFile = File(...), x_session_token: str | None = Header(default=None)):
    vid_id = str(uuid.uuid4())
    save_path = os.path.join(STORAGE, f"{vid_id}_{file.filename}")
    with open(save_path, "wb") as fobj:
        fobj.write(await file.read())

    result = analyze_situps(save_path)

    reward = 0
    user = _get_user_from_token(x_session_token)
    if user:
        reward = 10 if (result.get("count", 0) > 0) else 2
        _reward(user, reward)

    return JSONResponse({"ok": True, "type": "situps", "video": os.path.basename(save_path), "result": result, "reward": reward})

@app.post("/api/analyze/vertical_jump")
async def api_vjump(file: UploadFile = File(...), x_session_token: str | None = Header(default=None)):
    vid_id = str(uuid.uuid4())
    save_path = os.path.join(STORAGE, f"{vid_id}_{file.filename}")
    with open(save_path, "wb") as fobj:
        fobj.write(await file.read())

    result = analyze_vertical_jump(save_path)

    reward = 0
    user = _get_user_from_token(x_session_token)
    if user:
        reward = 10 if (result.get("height_cm", 0) > 0) else 2
        _reward(user, reward)

    return JSONResponse({"ok": True, "type": "vertical_jump", "video": os.path.basename(save_path), "result": result, "reward": reward})

@app.post("/api/analyze/long_jump")
async def api_ljump(file: UploadFile = File(...), athlete_height_cm: float = Form(165.0), x_session_token: str | None = Header(default=None)):
    vid_id = str(uuid.uuid4())
    save_path = os.path.join(STORAGE, f"{vid_id}_{file.filename}")
    with open(save_path, "wb") as fobj:
        fobj.write(await file.read())

    result = analyze_long_jump(save_path, athlete_height_cm=athlete_height_cm)

    reward = 0
    user = _get_user_from_token(x_session_token)
    if user:
        reward = 10 if (result.get("distance_cm_est", 0) > 0) else 2
        _reward(user, reward)

    return JSONResponse({"ok": True, "type": "long_jump", "video": os.path.basename(save_path), "result": result, "reward": reward})

# ----------------- Network routes -----------------
@app.post("/network/create")
async def net_create(name: str = Form(...), visibility: str = Form("public")):
    nets = _load_nets()
    key = None
    if visibility == "private":
        key = uuid.uuid4().hex[:8]
    nid = uuid.uuid4().hex[:6]
    nets["nets"].append({"id": nid, "name": name, "visibility": visibility, "key": key, "posts":[]})
    _save_nets(nets)
    return {"ok": True, "id": nid, "key": key}

@app.get("/network/list")
async def net_list():
    return _load_nets()

@app.post("/network/join")
async def net_join(nid: str = Form(...), key: str | None = Form(default=None)):
    nets = _load_nets()
    match = next((n for n in nets["nets"] if n["id"]==nid), None)
    if not match: return {"ok": False, "error":"not_found"}
    if match["visibility"]=="private" and match["key"]!=key:
        return {"ok": False, "error":"bad_key"}
    return {"ok": True}

@app.post("/network/post")
async def net_post(nid: str = Form(...), text: str = Form(""), file: UploadFile | None = File(default=None)):
    nets = _load_nets()
    match = next((n for n in nets["nets"] if n["id"]==nid), None)
    if not match: return {"ok": False, "error":"not_found"}
    media_url = None
    if file:
        fname = f"{uuid.uuid4().hex}_{file.filename}"
        fpath = os.path.join(NET_MEDIA, fname)
        with open(fpath, "wb") as f: f.write(await file.read())
        media_url = f"/media/{fname}"
    post = {"id": uuid.uuid4().hex[:6], "text": text, "media": media_url}
    match["posts"].append(post)
    _save_nets(nets)
    return {"ok": True, "post": post}

@app.get("/network/feed")
async def net_feed(nid: str):
    nets = _load_nets()
    match = next((n for n in nets["nets"] if n["id"]==nid), None)
    if not match: return {"ok": False, "error":"not_found"}
    return {"ok": True, "posts": match["posts"]}
