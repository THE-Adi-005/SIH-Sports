
import cv2
import numpy as np
import mediapipe as mp
import math
from dataclasses import dataclass

mp_pose = mp.solutions.pose
GRAVITY = 9.81  # m/s^2

@dataclass
class Flags:
    fps_stable: bool = True
    camera_static_hint: bool = True
    single_person_hint: bool = True
    low_confidence: bool = False
    notes: str = ""

def _angle(a, b, c):
    ba = np.array([a[0]-b[0], a[1]-b[1]])
    bc = np.array([c[0]-b[0], c[1]-b[1]])
    denom = (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosang = np.dot(ba, bc) / denom
    cosang = np.clip(cosang, -1.0, 1.0)
    return math.degrees(math.acos(cosang))

def _smooth(v, k=5):
    if len(v) < k: return v
    out = []
    for i in range(len(v)):
        s = max(0, i-k+1); e = i+1
        out.append(sum(v[s:e]) / float(e - s))
    return out

def _camera_static_quickcheck(first_gray, gray):
    diff = cv2.absdiff(first_gray, gray)
    score = float(np.mean(diff))
    return score < 6.0

def _fps_from_cap(cap):
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps != fps or fps < 5 or fps > 120:
        fps = 30.0
    return fps

def _extract_pose_timeseries(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Cannot open video")

    fps = _fps_from_cap(cap)
    first_ret, first_frame = cap.read()
    if not first_ret:
        cap.release(); raise RuntimeError("Empty video")
    first_gray = cv2.cvtColor(first_frame, cv2.COLOR_BGR2GRAY)

    xs, ys = {}, {}
    confs, static_votes, persons = [], [], []

    with mp_pose.Pose(static_image_mode=False, model_complexity=0, enable_segmentation=False,
                      min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = pose.process(rgb)
            if res.pose_landmarks:
                lmk = res.pose_landmarks.landmark
                key_ids = {
                    "nose": 0,
                    "l_shoulder": 11, "r_shoulder": 12,
                    "l_hip": 23, "r_hip": 24,
                    "l_knee": 25, "r_knee": 26,
                    "l_ankle": 27, "r_ankle": 28,
                    "l_heel": 29, "r_heel": 30,
                    "l_foot_index": 31, "r_foot_index": 32
                }
                for name, idx in key_ids.items():
                    p = lmk[idx]
                    xs.setdefault(name, []).append(p.x)
                    ys.setdefault(name, []).append(p.y)
                confs.append(np.mean([pt.visibility for pt in lmk]))
                persons.append(1)
            else:
                confs.append(0.0)
                persons.append(0)

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            static_votes.append(1.0 if _camera_static_quickcheck(first_gray, gray) else 0.0)

    cap.release()
    flags = Flags()
    flags.camera_static_hint = (np.mean(static_votes) > 0.6) if static_votes else True
    flags.single_person_hint = (np.mean(persons) > 0.6) if persons else True
    flags.low_confidence = (np.mean(confs) < 0.45) if confs else True
    flags.fps_stable = True
    return xs, ys, fps, flags

def analyze_situps(video_path):
    xs, ys, fps, flags = _extract_pose_timeseries(video_path)
    req = ["r_shoulder","r_hip","r_knee"]
    side = "r"
    if any(k not in xs for k in req) or any(k not in ys for k in req):
        req = ["l_shoulder","l_hip","l_knee"]; side = "l"
        if any(k not in xs for k in req) or any(k not in ys for k in req):
            return {"count": 0, "flags": ["pose_not_found"], "confidence": 0.0}

    sh = list(zip(xs["%s_shoulder"%side], ys["%s_shoulder"%side]))
    hp = list(zip(xs["%s_hip"%side], ys["%s_hip"%side]))
    kn = list(zip(xs["%s_knee"%side], ys["%s_knee"%side]))

    hip_angles = _smooth([_angle(a,b,c) for a,b,c in zip(sh,hp,kn)], k=5)

    low_thr, high_thr = 70.0, 140.0
    state, reps, last_up_frame = "DOWN", 0, -999
    for i, ang in enumerate(hip_angles):
        if state == "DOWN" and ang < low_thr:
            state, last_up_frame = "UP", i
        elif state == "UP" and ang > high_thr:
            if i - last_up_frame > int(0.15 * fps):
                reps += 1
            state = "DOWN"

    flags_list = [k for k,v in flags.__dict__.items() if isinstance(v,bool) and (not v)]
    if flags.low_confidence and "low_confidence" not in flags_list:
        flags_list.append("low_confidence")
    return {
        "count": int(reps),
        "avg_hip_angle_deg": float(np.nanmean(hip_angles) if hip_angles else 0.0),
        "flags": flags_list,
        "confidence": float(0.6 if flags.low_confidence else 0.9)
    }

def analyze_vertical_jump(video_path):
    xs, ys, fps, flags = _extract_pose_timeseries(video_path)
    needed = ["l_ankle","r_ankle","l_heel","r_heel","l_hip","r_hip"]
    if any(k not in ys for k in needed):
        return {"height_cm": 0.0, "air_time_ms": 0, "flags": ["pose_not_found"], "confidence": 0.0}

    n = len(ys["l_ankle"]) if ys["l_ankle"] else 0
    if n == 0:
        return {"height_cm": 0.0, "air_time_ms": 0, "flags": ["empty_series"], "confidence": 0.0}

    window = max(3, min(int(fps), n))
    base = float(np.median([min(ys["l_ankle"][:window]), min(ys["r_ankle"][:window]), min(ys["l_heel"][:window]), min(ys["r_heel"][:window])]))

    min_ankle_y = _smooth([min(yl, yr) for yl,yr in zip(ys["l_ankle"], ys["r_ankle"])], k=5)
    margin = 0.02
    airborne = [1 if (base - y) > margin else 0 for y in min_ankle_y]

    best_len, best_s, best_e = 0, -1, -1
    cur_s, cur_len = -1, 0
    for i, a in enumerate(airborne):
        if a == 1 and cur_s == -1:
            cur_s = i; cur_len = 1
        elif a == 1:
            cur_len += 1
        else:
            if cur_s != -1 and cur_len > best_len:
                best_len, best_s, best_e = cur_len, cur_s, i-1
            cur_s, cur_len = -1, 0
    if cur_s != -1 and cur_len > best_len:
        best_len, best_s, best_e = cur_len, cur_s, len(airborne)-1

    if best_len <= 0:
        return {"height_cm": 0.0, "air_time_ms": 0, "flags": ["no_jump_detected"], "confidence": 0.2}

    takeoff_f, landing_f = best_s, best_e
    air_t = (landing_f - takeoff_f + 1) / float(fps)
    height_cm = (GRAVITY * (air_t ** 2) / 8.0) * 100.0

    conf = 1.0
    if air_t < 0.15 or air_t > 1.2:
        conf = 0.5

    flags_list = [k for k,v in flags.__dict__.items() if isinstance(v,bool) and (not v)]
    if conf < 0.7 and "low_confidence" not in flags_list:
        flags_list.append("low_confidence")
    return {
        "height_cm": round(float(height_cm), 2),
        "air_time_ms": int(air_t * 1000),
        "takeoff_frame": int(takeoff_f),
        "landing_frame": int(landing_f),
        "flags": flags_list,
        "confidence": float(max(0.0, min(1.0, conf)))
    }

def analyze_long_jump(video_path, athlete_height_cm=165.0):
    xs, ys, fps, flags = _extract_pose_timeseries(video_path)
    needed = ["nose","l_ankle","r_ankle"]
    if any(k not in ys for k in needed) or any(k not in xs for k in ["l_ankle","r_ankle"]):
        return {"distance_cm_est": 0.0, "flags": ["pose_not_found"], "confidence": 0.0}

    n = len(ys["nose"])
    if n == 0:
        return {"distance_cm_est": 0.0, "flags": ["empty_series"], "confidence": 0.0}

    var_l = np.var(xs["l_ankle"]) if "l_ankle" in xs and len(xs["l_ankle"]) else 999
    var_r = np.var(xs["r_ankle"]) if "r_ankle" in xs and len(xs["r_ankle"]) else 999
    side = "l_ankle" if var_l < var_r else "r_ankle"

    base_frames = max(3, int(0.5 * fps))
    start_x = float(np.median(xs[side][:base_frames]))

    min_ankle_y = [min(yl, yr) for yl,yr in zip(ys["l_ankle"], ys["r_ankle"])]
    base_y = float(np.median(min_ankle_y[:base_frames]))
    margin = 0.02
    airborne = [1 if (base_y - y) > margin else 0 for y in min_ankle_y]

    landing_f, cur = None, 0
    for i, a in enumerate(airborne):
        if a == 1: cur = 1
        if cur == 1 and a == 0:
            landing_f = i; break
    if landing_f is None:
        landing_f = min(n-1, int(1.0 * fps))

    post = xs[side][landing_f: min(n, landing_f + int(0.3 * fps))]
    end_x = float(np.median(post)) if len(post) else xs[side][-1]

    body_h_norm = float(np.median([(a - b) for a,b in zip(ys["l_ankle"], ys["nose"])]))
    if body_h_norm < 0.1:
        body_h_norm = 0.45

    cm_per_norm = float(athlete_height_cm / body_h_norm)
    dist_norm = abs(end_x - start_x)
    distance_cm_est = float(dist_norm * cm_per_norm)

    conf = 1.0
    if distance_cm_est < 20 or distance_cm_est > 450:
        conf = 0.5

    flags_list = [k for k,v in flags.__dict__.items() if isinstance(v,bool) and (not v)]
    if conf < 0.7 and "low_confidence" not in flags_list:
        flags_list.append("low_confidence")
    return {
        "distance_cm_est": round(distance_cm_est, 1),
        "start_x_norm": round(start_x, 3),
        "end_x_norm": round(end_x, 3),
        "athlete_height_cm_used": float(athlete_height_cm),
        "flags": flags_list,
        "confidence": float(max(0.0, min(1.0, conf)))
    }
