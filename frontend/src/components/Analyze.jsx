// // // src/components/Analyze.jsx
// // import React, { useEffect, useRef, useState } from "react";
// // import { analyze } from "../api";

// // const POSE_CONNECTIONS = [
// //   [11, 13], [13, 15], [12, 14], [14, 16],
// //   [11, 12], [23, 24], [11, 23], [12, 24],
// //   [23, 25], [25, 27], [24, 26], [26, 28],
// //   [27, 29], [29, 31], [28, 30], [30, 32],
// // ];

// // function angleABC(a, b, c) {
// //   const ba = [a.x - b.x, a.y - b.y];
// //   const bc = [c.x - b.x, c.y - b.y];
// //   const dot = ba[0] * bc[0] + ba[1] * bc[1];
// //   const nba = Math.hypot(ba[0], ba[1]);
// //   const nbc = Math.hypot(bc[0], bc[1]);
// //   const cos = Math.min(1, Math.max(-1, dot / (nba * nbc + 1e-6)));
// //   return (Math.acos(cos) * 180) / Math.PI;
// // }

// // export default function Analyze() {
// //   const [test, setTest] = useState("situps");
// //   const [athleteHeight, setAthleteHeight] = useState(165);
// //   const [feedback, setFeedback] = useState(null);

// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const fileRef = useRef(null);
// //   const poseRef = useRef(null);
// //   const rafRef = useRef(null);
// //   const busyRef = useRef(false);
// //   const [playing, setPlaying] = useState(false);

// //   const [metrics, setMetrics] = useState({
// //     situps: { reps: 0, hipAngle: 0 },
// //     vjump: { airMS: 0, heightCM: 0 },
// //     ljump: { distCM: 0, liveDXcm: 0 },
// //   });

// //   const sitState = useRef({ state: "DOWN", lastUp: -999, frame: 0, fps: 30 });
// //   const vjState = useRef({
// //     baseAnkle: null,
// //     airborne: false,
// //     aStart: -1,
// //     aEnd: -1,
// //     frame: 0,
// //     fps: 30,
// //   });
// //   const ljState = useRef({
// //     startX: null,
// //     landingX: null,
// //     airborne: false,
// //     bodyH: null,
// //     baseAnkY: null,
// //     frame: 0,
// //     fps: 30,
// //   });

// //   // Initialize MediaPipe Pose once
// //   useEffect(() => {
// //     if (!window.Pose) {
// //       console.error("Pose not found. Check that scripts are loaded in index.html");
// //       setFeedback({ level: "warn", text: "Pose runtime not loaded." });
// //       return;
// //     }

// //     // Use CDN assets for wasm/model files
// //     const pose = new window.Pose({
// //       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
// //     });

// //     pose.setOptions({
// //       modelComplexity: 0,
// //       smoothLandmarks: true,
// //       enableSegmentation: false,
// //       minDetectionConfidence: 0.5,
// //       minTrackingConfidence: 0.5,
// //     });
// //     pose.onResults(onResults);
// //     poseRef.current = pose;

// //     return () => {
// //       cancelAnimationFrame(rafRef.current);
// //       try {
// //         pose.close();
// //       } catch {}
// //     };
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   function resetStates() {
// //     setMetrics({
// //       situps: { reps: 0, hipAngle: 0 },
// //       vjump: { airMS: 0, heightCM: 0 },
// //       ljump: { distCM: 0, liveDXcm: 0 },
// //     });
// //     setFeedback(null);
// //     sitState.current = { state: "DOWN", lastUp: -999, frame: 0, fps: 30 };
// //     vjState.current = {
// //       baseAnkle: null,
// //       airborne: false,
// //       aStart: -1,
// //       aEnd: -1,
// //       frame: 0,
// //       fps: 30,
// //     };
// //     ljState.current = {
// //       startX: null,
// //       landingX: null,
// //       airborne: false,
// //       bodyH: null,
// //       baseAnkY: null,
// //       frame: 0,
// //       fps: 30,
// //     };
// //   }

// //   function loadFile(e) {
// //     resetStates();
// //     const file = e.target.files?.[0];
// //     if (!file) return;
// //     const url = URL.createObjectURL(file);
// //     const v = videoRef.current;
// //     v.src = url;
// //     v.onloadedmetadata = () => {
// //       v.currentTime = 0;
// //       setPlaying(false);
// //       drawEmptyOverlay();
// //     };
// //   }

// //   function drawEmptyOverlay() {
// //     const v = videoRef.current,
// //       c = canvasRef.current;
// //     if (!v || !c) return;
// //     c.width = v.videoWidth;
// //     c.height = v.videoHeight;
// //     const g = c.getContext("2d");
// //     g.clearRect(0, 0, c.width, c.height);
// //   }

// //   function playPause() {
// //     const v = videoRef.current;
// //     if (!v) return;
// //     if (playing) {
// //       v.pause();
// //       setPlaying(false);
// //     } else {
// //       v.play();
// //       setPlaying(true);
// //       pump();
// //     }
// //   }

// //   function pump() {
// //     rafRef.current = requestAnimationFrame(pump);
// //     const v = videoRef.current;
// //     if (!v || v.paused || v.ended) return;

// //     const p = poseRef.current;
// //     if (!p || busyRef.current) return;

// //     busyRef.current = true;
// //     Promise.resolve(p.send({ image: v }))
// //       .catch((err) => {
// //         console.error("pose.send error:", err);
// //         cancelAnimationFrame(rafRef.current);
// //         setPlaying(false);
// //       })
// //       .finally(() => {
// //         busyRef.current = false;
// //       });
// //   }

// //   function drawPose(landmarks) {
// //     const v = videoRef.current,
// //       c = canvasRef.current;
// //     if (!v || !c) return;
// //     c.width = v.videoWidth;
// //     c.height = v.videoHeight;
// //     const g = c.getContext("2d");
// //     g.clearRect(0, 0, c.width, c.height);

// //     if (!landmarks || !landmarks.length) return;

// //     // connections
// //     g.lineWidth = 4;
// //     g.strokeStyle = "rgba(27,110,243,0.8)";
// //     for (const [a, b] of POSE_CONNECTIONS) {
// //       const pa = landmarks[a],
// //         pb = landmarks[b];
// //       if (pa && pb) {
// //         g.beginPath();
// //         g.moveTo(pa.x * c.width, pa.y * c.height);
// //         g.lineTo(pb.x * c.width, pb.y * c.height);
// //         g.stroke();
// //       }
// //     }
// //     // keypoints
// //     for (const p of landmarks) {
// //       g.beginPath();
// //       g.arc(p.x * c.width, p.y * c.height, 5, 0, 2 * Math.PI);
// //       g.fillStyle = "#1b6ef3";
// //       g.fill();
// //       g.lineWidth = 1.5;
// //       g.strokeStyle = "#fff";
// //       g.stroke();
// //     }
// //   }

// //   function onResults(results) {
// //     const v = videoRef.current;
// //     if (!v) return;
// //     const lmk = results.poseLandmarks;
// //     drawPose(lmk);
// //     if (!lmk) return;

// //     // ---- SIT-UPS ----
// //     if (test === "situps") {
// //       const RS = 12,
// //         RH = 24,
// //         RK = 26,
// //         LS = 11,
// //         LH = 23,
// //         LK = 25;
// //       const hasR = lmk[RS] && lmk[RH] && lmk[RK],
// //         hasL = lmk[LS] && lmk[LH] && lmk[LK];
// //       if (hasR || hasL) {
// //         const ang = hasR
// //           ? angleABC(lmk[RS], lmk[RH], lmk[RK])
// //           : angleABC(lmk[LS], lmk[LH], lmk[LK]);
// //         const st = sitState.current;
// //         const low = 70,
// //           high = 140;

// //         let repsNext = metrics.situps.reps;
// //         if (st.state === "DOWN" && ang < low) {
// //           st.state = "UP";
// //           st.lastUp = st.frame;
// //         } else if (st.state === "UP" && ang > high) {
// //           if (st.frame - st.lastUp > 0.15 * st.fps) {
// //             repsNext = repsNext + 1;
// //           }
// //           st.state = "DOWN";
// //         }
// //         st.frame++;

// //         setMetrics((m) => ({
// //           ...m,
// //           situps: { reps: repsNext, hipAngle: ang },
// //         }));
// //         setFeedback(
// //           repsNext >= 10
// //             ? { level: "ok", text: `Strong core! ${repsNext} clean reps.` }
// //             : repsNext >= 5
// //             ? {
// //                 level: "warn",
// //                 text: `Good start: ${repsNext} reps. Focus on rhythm & full range.`,
// //               }
// //             : {
// //                 level: "warn",
// //                 text: `Bend knees & anchor feet. Aim for 5+ reps.`,
// //               }
// //         );
// //       }
// //     }

// //     // ---- VERTICAL JUMP ----
// //     if (test === "vjump") {
// //       const LA = 27,
// //         RA = 28,
// //         LH = 29,
// //         RH = 30;
// //       if (lmk[LA] && lmk[RA] && lmk[LH] && lmk[RH]) {
// //         const ankleY = Math.min(lmk[LA].y, lmk[RA].y, lmk[LH].y, lmk[RH].y);
// //         const st = vjState.current;
// //         if (st.baseAnkle == null) st.baseAnkle = ankleY;

// //         const margin = 0.02;
// //         const airborneNow = st.baseAnkle - ankleY > margin;

// //         if (airborneNow && !st.airborne) {
// //           st.airborne = true;
// //           st.aStart = st.frame;
// //         }
// //         if (!airborneNow && st.airborne) {
// //           st.airborne = false;
// //           st.aEnd = st.frame;
// //         }

// //         let t = 0;
// //         if (st.airborne) {
// //           t = (st.frame - st.aStart + 1) / st.fps;
// //         } else if (st.aStart >= 0 && st.aEnd >= st.aStart) {
// //           t = (st.aEnd - st.aStart + 1) / st.fps;
// //         }
// //         const h = (9.81 * t * t) / 8 * 100; // cm
// //         setMetrics((m) => ({
// //           ...m,
// //           vjump: { airMS: Math.round(t * 1000), heightCM: h },
// //         }));

// //         setFeedback(
// //           h >= 45
// //             ? { level: "ok", text: `Explosive! Vertical ~${h.toFixed(1)} cm.` }
// //             : h >= 25
// //             ? {
// //                 level: "warn",
// //                 text: `Decent pop (~${h.toFixed(
// //                   1
// //                 )} cm). Deeper knee bend & arm swing.`,
// //               }
// //             : {
// //                 level: "warn",
// //                 text: `Shallow (~${h.toFixed(1)} cm). Work on countermovement.`,
// //               }
// //         );
// //         st.frame++;
// //       }
// //     }

// //     // ---- LONG JUMP ----
// //     if (test === "ljump") {
// //       const nose = 0,
// //         LA = 27,
// //         RA = 28;
// //       if (lmk[nose] && lmk[LA] && lmk[RA]) {
// //         const ank =
// //           Math.abs(lmk[LA].visibility - 0.5) <
// //           Math.abs(lmk[RA].visibility - 0.5)
// //             ? lmk[LA]
// //             : lmk[RA];

// //         const st = ljState.current;
// //         if (!st.bodyH)
// //           st.bodyH =
// //             Math.abs((lmk[LA].y + lmk[RA].y) / 2 - lmk[nose].y) || 0.45;
// //         if (st.baseAnkY == null) st.baseAnkY = Math.min(lmk[LA].y, lmk[RA].y);
// //         if (st.startX == null) st.startX = ank.x;

// //         const margin = 0.02;
// //         const currentAnkY = Math.min(lmk[LA].y, lmk[RA].y);
// //         const airborneNow = st.baseAnkY - currentAnkY > margin;

// //         if (airborneNow) st.airborne = true;

// //         if (st.airborne && !airborneNow) {
// //           st.landingX = ank.x;
// //           const cmPer = athleteHeight / st.bodyH;
// //           const dx = Math.abs((st.landingX - st.startX) * cmPer);
// //           setMetrics((m) => ({
// //             ...m,
// //             ljump: { ...m.ljump, distCM: dx, liveDXcm: dx },
// //           }));
// //           setFeedback(
// //             dx >= 200
// //               ? { level: "ok", text: `Nice distance: ~${dx.toFixed(1)} cm.` }
// //               : {
// //                   level: "warn",
// //                   text: `~${dx.toFixed(
// //                     1
// //                   )} cm. Stronger arm swing & longer push-off.`,
// //                 }
// //           );
// //         } else {
// //           const cmPer = athleteHeight / (st.bodyH || 0.45);
// //           const dxLive = Math.abs((ank.x - st.startX) * cmPer);
// //           setMetrics((m) => ({
// //             ...m,
// //             ljump: { ...m.ljump, liveDXcm: dxLive },
// //           }));
// //         }
// //         st.frame++;
// //       }
// //     }
// //   }

// //   async function analyzeWithBackend() {
// //     const f = fileRef.current?.files?.[0];
// //     if (!f) return;
// //     const fd = new FormData();
// //     fd.append("file", f);
// //     const token = localStorage.getItem("sessionToken") || "";
// //     const headers = token ? { "X-Session-Token": token } : {};

// //     if (test === "situps") {
// //       const res = await analyze("/api/analyze/situps", fd, headers);
// //       setFeedback({
// //         level: "ok",
// //         text: "Server verify OK. +" + (res.reward || 0) + " pts",
// //       });
// //     } else if (test === "vjump") {
// //       const res = await analyze("/api/analyze/vertical_jump", fd, headers);
// //       setFeedback({
// //         level: "ok",
// //         text: `Server height: ${res.result?.height_cm ?? "?"} cm (+${
// //           res.reward || 0
// //         } pts)`,
// //       });
// //     } else {
// //       fd.append("athlete_height_cm", String(athleteHeight));
// //       const res = await analyze("/api/analyze/long_jump", fd, headers);
// //       setFeedback({
// //         level: "ok",
// //         text: `Server distance: ${res.result?.distance_cm_est ?? "?"} cm (+${
// //           res.reward || 0
// //         } pts)`,
// //       });
// //     }
// //   }

// //   return (
// //     <div className="container page">
// //       <div className="an-grid">
// //         {/* LEFT: player + controls */}
// //         <div className="card">
// //           <div className="row" style={{ justifyContent: "space-between" }}>
// //             <div className="row" style={{ gap: 10 }}>
// //               <label>
// //                 Test:&nbsp;
// //                 <select
// //                   value={test}
// //                   onChange={(e) => {
// //                     setTest(e.target.value);
// //                     resetStates();
// //                   }}
// //                 >
// //                   <option value="situps">Sit-ups</option>
// //                   <option value="vjump">High / Vertical Jump</option>
// //                   <option value="ljump">Standing Long Jump</option>
// //                 </select>
// //               </label>

// //               {test === "ljump" && (
// //                 <label>
// //                   {" "}
// //                   Athlete height (cm):&nbsp;
// //                   <input
// //                     type="number"
// //                     value={athleteHeight}
// //                     min="100"
// //                     max="220"
// //                     onChange={(e) =>
// //                       setAthleteHeight(Number(e.target.value || 165))
// //                     }
// //                   />
// //                 </label>
// //               )}
// //             </div>
// //           </div>

// //           <div className="video-wrap" style={{ marginTop: 12 }}>
// //             <video
// //               ref={videoRef}
// //               playsInline
// //               controls={false}
// //               muted
// //               onPause={() => setPlaying(false)}
// //               onPlay={() => setPlaying(true)}
// //               style={{ background: "#000", width: "100%" }}
// //             />
// //             <canvas ref={canvasRef} className="overlay" />
// //           </div>

// //           <div className="controls">
// //             <input
// //               ref={fileRef}
// //               type="file"
// //               accept="video/*"
// //               onChange={loadFile}
// //             />
// //             <button className="btn" onClick={playPause}>
// //               {playing ? "Pause" : "Play"}
// //             </button>
// //             <button
// //               className="btn secondary"
// //               onClick={() => {
// //                 if (videoRef.current) videoRef.current.currentTime = 0;
// //                 resetStates();
// //               }}
// //             >
// //               Reset
// //             </button>
// //             <button className="btn secondary" onClick={analyzeWithBackend}>
// //               Analyze (server verify)
// //             </button>
// //           </div>
// //         </div>

// //         {/* RIGHT: live metrics */}
// //         <div className="card">
// //           <h3 style={{ marginTop: 0 }}>Live Metrics</h3>

// //           {test === "situps" && (
// //             <div className="metrics">
// //               <div className="metric">
// //                 <div className="k">Reps</div>
// //                 <div className="v">{metrics.situps.reps}</div>
// //               </div>
// //               <div className="metric">
// //                 <div className="k">Hip Angle (°)</div>
// //                 <div className="v">{metrics.situps.hipAngle.toFixed(1)}</div>
// //               </div>
// //             </div>
// //           )}

// //           {test === "vjump" && (
// //             <div className="metrics">
// //               <div className="metric">
// //                 <div className="k">Airtime (ms)</div>
// //                 <div className="v">{metrics.vjump.airMS}</div>
// //               </div>
// //               <div className="metric">
// //                 <div className="k">Height (cm)</div>
// //                 <div className="v">{metrics.vjump.heightCM.toFixed(1)}</div>
// //               </div>
// //             </div>
// //           )}

// //           {test === "ljump" && (
// //             <div className="metrics">
// //               <div className="metric">
// //                 <div className="k">Live Displacement (cm)</div>
// //                 <div className="v">{metrics.ljump.liveDXcm.toFixed(1)}</div>
// //               </div>
// //               <div className="metric">
// //                 <div className="k">Distance (cm)</div>
// //                 <div className="v">{metrics.ljump.distCM.toFixed(1)}</div>
// //               </div>
// //             </div>
// //           )}

// //           {feedback && (
// //             <div className={`feedback ${feedback.level === "ok" ? "ok" : "warn"}`}>
// //               {feedback.text}
// //             </div>
// //           )}
// //           {!feedback && (
// //             <div className="feedback">
// //               Upload a clip and press <b>Play</b>. Metrics update in real time.
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // src/components/Analyze.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { analyze } from "../api";

// const POSE_CONNECTIONS = [
//   [11,13],[13,15],[12,14],[14,16],
//   [11,12],[23,24],[11,23],[12,24],
//   [23,25],[25,27],[24,26],[26,28],
//   [27,29],[29,31],[28,30],[30,32],
// ];

// function angleABC(a,b,c){
//   const ba=[a.x-b.x,a.y-b.y], bc=[c.x-b.x,c.y-b.y];
//   const dot=ba[0]*bc[0]+ba[1]*bc[1];
//   const nba=Math.hypot(ba[0],ba[1]), nbc=Math.hypot(bc[0],bc[1]);
//   const cos=Math.min(1,Math.max(-1,dot/(nba*nbc+1e-6)));
//   return Math.acos(cos)*180/Math.PI;
// }

// export default function Analyze(){
//   const [test, setTest] = useState("situps");
//   const [athleteHeight, setAthleteHeight] = useState(165);
//   const [feedback, setFeedback] = useState(null);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const stageRef = useRef(null);
//   const fileRef = useRef(null);
//   const poseRef = useRef(null);
//   const rafRef = useRef(null);
//   const busyRef = useRef(false);
//   const [playing, setPlaying] = useState(false);

//   // NEW: view controls
//   const [fitMode, setFitMode] = useState("contain"); // contain | cover | fill | 1:1
//   const [aspect, setAspect]   = useState(16/9);

//   const [metrics, setMetrics] = useState({
//     situps:{ reps:0, hipAngle:0 },
//     vjump:{ airMS:0, heightCM:0 },
//     ljump:{ distCM:0, liveDXcm:0 }
//   });

//   const sitState = useRef({ state:"DOWN", lastUp:-999, frame:0, fps:30 });
//   const vjState  = useRef({ baseAnkle:null, airborne:false, aStart:-1, aEnd:-1, frame:0, fps:30 });
//   const ljState  = useRef({ startX:null, landingX:null, airborne:false, bodyH:null, baseAnkY:null, frame:0, fps:30 });

//   // Pose init (CDN runtime is loaded in index.html)
//   useEffect(()=>{
//     if(!window.Pose){
//       console.error("Pose not found. Check index.html includes pose.js");
//       setFeedback({level:"warn", text:"Pose runtime not loaded."});
//       return;
//     }
//     const pose = new window.Pose({
//       locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
//     });
//     pose.setOptions({
//       modelComplexity: 0,
//       smoothLandmarks: true,
//       enableSegmentation: false,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     });
//     pose.onResults(onResults);
//     poseRef.current = pose;

//     // keep canvas in sync with displayed size
//     const ro = new ResizeObserver(sizeCanvasToDisplay);
//     if(stageRef.current) ro.observe(stageRef.current);

//     return ()=>{
//       ro.disconnect();
//       cancelAnimationFrame(rafRef.current);
//       try{ pose.close(); }catch{}
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Ensure canvas pixels match the on-screen box (high-DPI aware)
//   function sizeCanvasToDisplay() {
//     const c = canvasRef.current;
//     const stage = stageRef.current;
//     if(!c || !stage) return;

//     const rect = stage.getBoundingClientRect();
//     const dpr = window.devicePixelRatio || 1;

//     // set pixel buffer
//     c.width  = Math.max(1, Math.floor(rect.width  * dpr));
//     c.height = Math.max(1, Math.floor(rect.height * dpr));

//     // keep CSS size exactly the displayed size
//     c.style.width  = `${rect.width}px`;
//     c.style.height = `${rect.height}px`;
//   }

//   function resetStates(){
//     setMetrics({ situps:{reps:0,hipAngle:0}, vjump:{airMS:0,heightCM:0}, ljump:{distCM:0, liveDXcm:0} });
//     setFeedback(null);
//     sitState.current = { state:"DOWN", lastUp:-999, frame:0, fps:30 };
//     vjState.current  = { baseAnkle:null, airborne:false, aStart:-1, aEnd:-1, frame:0, fps:30 };
//     ljState.current  = { startX:null, landingX:null, airborne:false, bodyH:null, baseAnkY:null, frame:0, fps:30 };
//   }

//   function loadFile(e){
//     resetStates();
//     const file = e.target.files?.[0];
//     if(!file) return;
//     const url = URL.createObjectURL(file);
//     const v = videoRef.current;
//     v.src = url;
//     v.onloadedmetadata = () => {
//       // set aspect-ratio of stage to the video’s natural AR so we see it fully
//       if(v.videoWidth && v.videoHeight){
//         setAspect(v.videoWidth / v.videoHeight);
//       }
//       sizeCanvasToDisplay();
//       v.currentTime = 0;
//       setPlaying(false);
//       drawEmptyOverlay();
//     };
//   }

//   function drawEmptyOverlay(){
//     sizeCanvasToDisplay();
//     const c = canvasRef.current;
//     if(!c) return;
//     const g = c.getContext("2d");
//     g.clearRect(0,0,c.width,c.height);
//   }

//   function playPause(){
//     const v = videoRef.current;
//     if(!v) return;
//     if(playing){ v.pause(); setPlaying(false); }
//     else { v.play(); setPlaying(true); pump(); }
//   }

//   function pump(){
//     rafRef.current = requestAnimationFrame(pump);
//     const v = videoRef.current;
//     if(!v || v.paused || v.ended) return;

//     const p = poseRef.current;
//     if(!p || busyRef.current) return;

//     busyRef.current = true;
//     Promise.resolve(p.send({ image: v }))
//       .catch(err=>{
//         console.error("pose.send error:", err);
//         cancelAnimationFrame(rafRef.current);
//         setPlaying(false);
//       })
//       .finally(()=>{ busyRef.current = false; });
//   }

//   function drawPose(landmarks){
//     sizeCanvasToDisplay(); // stay in sync if the user resizes/fullscreens
//     const c = canvasRef.current, stage = stageRef.current;
//     if(!c || !stage) return;

//     const rect = stage.getBoundingClientRect();
//     const dpr = window.devicePixelRatio || 1;

//     const g = c.getContext("2d");
//     g.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
//     g.clearRect(0,0, rect.width, rect.height);

//     if(!landmarks || !landmarks.length) return;

//     // connections
//     g.lineWidth = 4; g.strokeStyle = "rgba(27,110,243,0.8)";
//     for(const [a,b] of POSE_CONNECTIONS){
//       const pa = landmarks[a], pb = landmarks[b];
//       if(pa && pb){
//         g.beginPath();
//         g.moveTo(pa.x*rect.width, pa.y*rect.height);
//         g.lineTo(pb.x*rect.width, pb.y*rect.height);
//         g.stroke();
//       }
//     }
//     // keypoints
//     for(const p of landmarks){
//       g.beginPath();
//       g.arc(p.x*rect.width, p.y*rect.height, 5, 0, 2*Math.PI);
//       g.fillStyle = "#1b6ef3";
//       g.fill();
//       g.lineWidth = 1.5; g.strokeStyle = "#fff"; g.stroke();
//     }
//   }

//   function onResults(results){
//     const lmk = results.poseLandmarks;
//     drawPose(lmk);
//     if(!lmk) return;

//     // ---- SIT-UPS ----
//     if(test==="situps"){
//       const RS=12, RH=24, RK=26, LS=11, LH=23, LK=25;
//       const hasR=lmk[RS]&&lmk[RH]&&lmk[RK], hasL=lmk[LS]&&lmk[LH]&&lmk[LK];
//       if(hasR||hasL){
//         const ang = hasR ? angleABC(lmk[RS], lmk[RH], lmk[RK]) : angleABC(lmk[LS], lmk[LH], lmk[LK]);
//         const st = sitState.current;
//         const low=70, high=140;

//         let repsNext = metrics.situps.reps;
//         if(st.state==="DOWN" && ang<low){ st.state="UP"; st.lastUp=st.frame; }
//         else if(st.state==="UP" && ang>high){
//           if(st.frame-st.lastUp > 0.15*st.fps){ repsNext = repsNext + 1; }
//           st.state="DOWN";
//         }
//         st.frame++;

//         setMetrics(m=>({...m, situps:{ reps:repsNext, hipAngle:ang }}));
//         setFeedback(
//           repsNext>=10 ? {level:"ok", text:`Strong core! ${repsNext} clean reps.`} :
//           repsNext>=5  ? {level:"warn", text:`Good start: ${repsNext} reps. Focus on rhythm & full range.`} :
//                          {level:"warn", text:`Bend knees & anchor feet. Aim for 5+ reps.`}
//         );
//       }
//     }

//     // ---- VERTICAL JUMP ----
//     if(test==="vjump"){
//       const LA=27, RA=28, LH=29, RH=30;
//       if(lmk[LA]&&lmk[RA]&&lmk[LH]&&lmk[RH]){
//         const ankleY = Math.min(lmk[LA].y, lmk[RA].y, lmk[LH].y, lmk[RH].y);
//         const st = vjState.current;
//         if(st.baseAnkle==null) st.baseAnkle = ankleY;

//         const margin=0.02;
//         const airborneNow = (st.baseAnkle - ankleY) > margin;

//         if(airborneNow && !st.airborne){ st.airborne=true; st.aStart=st.frame; }
//         if(!airborneNow && st.airborne){ st.airborne=false; st.aEnd=st.frame; }

//         let t = 0;
//         if(st.airborne){
//           t=(st.frame-st.aStart+1)/st.fps;
//         } else if(st.aStart>=0 && st.aEnd>=st.aStart){
//           t=(st.aEnd-st.aStart+1)/st.fps;
//         }
//         const h=9.81*t*t/8*100; // cm
//         setMetrics(m=>({...m, vjump:{ airMS:Math.round(t*1000), heightCM:h }}));
//         setFeedback(
//           h>=45 ? {level:"ok", text:`Explosive! Vertical ~${h.toFixed(1)} cm.`} :
//           h>=25 ? {level:"warn", text:`Decent pop (~${h.toFixed(1)} cm). Deeper knee bend & arm swing.`} :
//                   {level:"warn", text:`Shallow (~${h.toFixed(1)} cm). Work on countermovement.`}
//         );
//         vjState.current.frame++;
//       }
//     }

//     // ---- LONG JUMP ----
//     if(test==="ljump"){
//       const nose=0, LA=27, RA=28;
//       if(lmk[nose] && lmk[LA] && lmk[RA]){
//         const ank = Math.abs(lmk[LA].visibility-0.5) < Math.abs(lmk[RA].visibility-0.5) ? lmk[LA] : lmk[RA];
//         const st = ljState.current;

//         if(!st.bodyH)       st.bodyH = Math.abs((lmk[LA].y + lmk[RA].y)/2 - lmk[nose].y) || 0.45;
//         if(st.baseAnkY==null) st.baseAnkY = Math.min(lmk[LA].y, lmk[RA].y);
//         if(st.startX==null) st.startX = ank.x;

//         const margin=0.02;
//         const currentAnkY = Math.min(lmk[LA].y, lmk[RA].y);
//         const airborneNow = (st.baseAnkY - currentAnkY) > margin;

//         if(airborneNow) st.airborne = true;

//         if(st.airborne && !airborneNow){
//           st.landingX = ank.x;
//           const cmPer = athleteHeight / st.bodyH;
//           const dx = Math.abs((st.landingX - st.startX) * cmPer);
//           setMetrics(m=>({...m, ljump:{ ...m.ljump, distCM:dx, liveDXcm:dx }}));
//           setFeedback( dx>=200 ? {level:"ok", text:`Nice distance: ~${dx.toFixed(1)} cm.`}
//                                : {level:"warn", text:`~${dx.toFixed(1)} cm. Stronger arm swing & longer push-off.`});
//         } else {
//           const cmPer = athleteHeight / (st.bodyH||0.45);
//           const dxLive = Math.abs((ank.x - st.startX) * cmPer);
//           setMetrics(m=>({...m, ljump:{ ...m.ljump, liveDXcm:dxLive }}));
//         }
//         st.frame++;
//       }
//     }
//   }

//   async function analyzeWithBackend(){
//     const f = fileRef.current?.files?.[0];
//     if(!f) return;
//     const fd = new FormData();
//     fd.append("file", f);
//     const token = localStorage.getItem("sessionToken") || "";
//     const headers = token ? { "X-Session-Token": token } : {};

//     if(test==="situps"){
//       const res = await analyze("/api/analyze/situps", fd, headers);
//       setFeedback({level:"ok", text:"Server verify OK. +"+(res.reward||0)+" pts"});
//     } else if(test==="vjump"){
//       const res = await analyze("/api/analyze/vertical_jump", fd, headers);
//       setFeedback({level:"ok", text:`Server height: ${res.result?.height_cm ?? "?"} cm (+${res.reward||0} pts)`});
//     } else {
//       fd.append("athlete_height_cm", String(athleteHeight));
//       const res = await analyze("/api/analyze/long_jump", fd, headers);
//       setFeedback({level:"ok", text:`Server distance: ${res.result?.distance_cm_est ?? "?"} cm (+${res.reward||0} pts)`});
//     }
//   }

//   function toggleFullscreen(){
//     const el = stageRef.current;
//     if(!el) return;
//     if(document.fullscreenElement){ document.exitFullscreen(); }
//     else { el.requestFullscreen?.(); }
//   }

//   // compute object-fit from fitMode
//   const objectFit =
//     fitMode === "cover" ? "cover" :
//     fitMode === "fill"  ? "fill"  :
//     fitMode === "1:1"   ? "none"  : "contain";

//   const stageStyle = {
//     "--ar": fitMode === "1:1" ? aspect : aspect, // use AR always, but 1:1 will not scale the video beyond its pixels
//   };

//   return (
//     <div className="container page">
//       <div className="an-grid">
//         {/* LEFT: player + controls */}
//         <div className="card">
//           <div className="row" style={{justifyContent:"space-between", gap:10, alignItems:"center"}}>
//             <div className="row" style={{gap:10, flexWrap:"wrap"}}>
//               <label>Test:&nbsp;
//                 <select value={test} onChange={e=>{ setTest(e.target.value); resetStates(); }}>
//                   <option value="situps">Sit-ups</option>
//                   <option value="vjump">High / Vertical Jump</option>
//                   <option value="ljump">Standing Long Jump</option>
//                 </select>
//               </label>
//               {test==="ljump" && (
//                 <label> Athlete height (cm):&nbsp;
//                   <input type="number" value={athleteHeight} min="100" max="220"
//                          onChange={e=>setAthleteHeight(Number(e.target.value||165))}/>
//                 </label>
//               )}
//               <label> View:&nbsp;
//                 <select value={fitMode} onChange={e=>setFitMode(e.target.value)}>
//                   <option value="contain">Contain (see all)</option>
//                   <option value="cover">Cover (fills box)</option>
//                   <option value="fill">Fill (stretch)</option>
//                   <option value="1:1">1:1 pixels</option>
//                 </select>
//               </label>
//               <button className="btn secondary" onClick={toggleFullscreen}>Fullscreen</button>
//             </div>
//           </div>

//           {/* Stage with proper aspect-ratio; video never gets cropped in "contain" */}
//           <div ref={stageRef} className="video-stage" style={stageStyle}>
//             <video
//               ref={videoRef}
//               playsInline
//               controls={false}
//               muted
//               onPause={()=>setPlaying(false)}
//               onPlay={()=>setPlaying(true)}
//               style={{
//                 objectFit,
//                 /* When 1:1, don't upscale beyond the file's pixels */
//                 imageRendering: fitMode==="1:1" ? "pixelated" : "auto"
//               }}
//             />
//             <canvas ref={canvasRef} className="overlay" />
//           </div>

//           <div className="controls">
//             <input ref={fileRef} type="file" accept="video/*" onChange={loadFile}/>
//             <button className="btn" onClick={playPause}>{playing ? "Pause" : "Play"}</button>
//             <button className="btn secondary" onClick={()=>{
//               if(videoRef.current) videoRef.current.currentTime=0;
//               resetStates();
//             }}>Reset</button>
//             <button className="btn secondary" onClick={analyzeWithBackend}>Analyze (server verify)</button>
//           </div>
//         </div>

//         {/* RIGHT: live metrics */}
//         <div className="card">
//           <h3 style={{marginTop:0}}>Live Metrics</h3>

//           {test==="situps" && (
//             <div className="metrics">
//               <div className="metric"><div className="k">Reps</div><div className="v">{metrics.situps.reps}</div></div>
//               <div className="metric"><div className="k">Hip Angle (°)</div><div className="v">{metrics.situps.hipAngle.toFixed(1)}</div></div>
//             </div>
//           )}

//           {test==="vjump" && (
//             <div className="metrics">
//               <div className="metric"><div className="k">Airtime (ms)</div><div className="v">{metrics.vjump.airMS}</div></div>
//               <div className="metric"><div className="k">Height (cm)</div><div className="v">{metrics.vjump.heightCM.toFixed(1)}</div></div>
//             </div>
//           )}

//           {test==="ljump" && (
//             <div className="metrics">
//               <div className="metric"><div className="k">Live Displacement (cm)</div><div className="v">{metrics.ljump.liveDXcm.toFixed(1)}</div></div>
//               <div className="metric"><div className="k">Distance (cm)</div><div className="v">{metrics.ljump.distCM.toFixed(1)}</div></div>
//             </div>
//           )}

//           {feedback ? (
//             <div className={`feedback ${feedback.level==="ok" ? "ok":"warn"}`}>{feedback.text}</div>
//           ) : (
//             <div className="feedback">Upload a clip and press <b>Play</b>. Metrics update in real time.</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// src/components/Analyze.jsx
import React, { useEffect, useRef, useState } from "react";
import { analyze } from "../api";

const POSE_CONNECTIONS = [
  [11,13],[13,15],[12,14],[14,16],
  [11,12],[23,24],[11,23],[12,24],
  [23,25],[25,27],[24,26],[26,28],
  [27,29],[29,31],[28,30],[30,32],
];

function angleABC(a,b,c){
  const ba=[a.x-b.x,a.y-b.y], bc=[c.x-b.x,c.y-b.y];
  const dot=ba[0]*bc[0]+ba[1]*bc[1];
  const nba=Math.hypot(ba[0],ba[1]), nbc=Math.hypot(bc[0],bc[1]);
  const cos=Math.min(1,Math.max(-1,dot/(nba*nbc+1e-6)));
  return Math.acos(cos)*180/Math.PI;
}

export default function Analyze(){
  const [test, setTest] = useState("situps");
  const [athleteHeight, setAthleteHeight] = useState(165);
  const [feedback, setFeedback] = useState(null);
  const [insights, setInsights] = useState(null); // two paragraphs area

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const fileRef = useRef(null);
  const poseRef = useRef(null);
  const rafRef = useRef(null);
  const busyRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  // display options
  const [fitMode, setFitMode] = useState("contain");
  const [aspect, setAspect]   = useState(16/9);

  // UI state only (never used for logic updates)
  const [metrics, setMetrics] = useState({
    situps:{ reps:0, hipAngle:0 },
    vjump:{ airMS:0, heightCM:0 },
    ljump:{ distCM:0, liveDXcm:0 }
  });

  // logic refs (authoritative counters / timers)
  const sitState = useRef({ state:"DOWN", lastUp:-999, frame:0, fps:30 });
  const vjState  = useRef({ baseAnkle:null, airborne:false, aStart:-1, aEnd:-1, frame:0, fps:30 });
  const ljState  = useRef({ startX:null, landingX:null, airborne:false, bodyH:null, baseAnkY:null, frame:0, fps:30 });
  const sitRepsRef = useRef(0);

  // authenticity stats
  const statsRef = useRef({ frames:0, visOkFrames:0, minAngle:Infinity, maxAngle:-Infinity, durationSec:0 });
  const lastTsRef = useRef(null);

  // Pose init (CDN runtime must be in index.html)
  useEffect(()=>{
    if(!window.Pose){
      console.error("Pose not found. Check index.html includes pose.js");
      setFeedback({level:"warn", text:"Pose runtime not loaded."});
      return;
    }
    const pose = new window.Pose({
      locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
    });
    pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    pose.onResults(onResults);
    poseRef.current = pose;

    const ro = new ResizeObserver(sizeCanvasToDisplay);
    if(stageRef.current) ro.observe(stageRef.current);

    return ()=>{
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      try{ pose.close(); }catch{}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // summarize on pause/end
  useEffect(()=>{
    const v = videoRef.current;
    if(!v) return;
    const summarize = ()=> buildSummary();
    v.addEventListener("pause", summarize);
    v.addEventListener("ended", summarize);
    return ()=>{
      v.removeEventListener("pause", summarize);
      v.removeEventListener("ended", summarize);
    };
  }, [test]);

  function sizeCanvasToDisplay() {
    const c = canvasRef.current;
    const stage = stageRef.current;
    if(!c || !stage) return;

    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width  = Math.max(1, Math.floor(rect.width  * dpr));
    c.height = Math.max(1, Math.floor(rect.height * dpr));
    c.style.width  = `${rect.width}px`;
    c.style.height = `${rect.height}px`;
  }

  function resetStates(){
    setMetrics({ situps:{reps:0,hipAngle:0}, vjump:{airMS:0,heightCM:0}, ljump:{distCM:0, liveDXcm:0} });
    setFeedback(null);
    setInsights(null);
    sitState.current = { state:"DOWN", lastUp:-999, frame:0, fps:30 };
    vjState.current  = { baseAnkle:null, airborne:false, aStart:-1, aEnd:-1, frame:0, fps:30 };
    ljState.current  = { startX:null, landingX:null, airborne:false, bodyH:null, baseAnkY:null, frame:0, fps:30 };
    sitRepsRef.current = 0;
    statsRef.current = { frames:0, visOkFrames:0, minAngle:Infinity, maxAngle:-Infinity, durationSec:0 };
    lastTsRef.current = null;
  }

  function loadFile(e){
    resetStates();
    const file = e.target.files?.[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    const v = videoRef.current;
    v.src = url;
    v.onloadedmetadata = () => {
      if(v.videoWidth && v.videoHeight){
        setAspect(v.videoWidth / v.videoHeight);
      }
      sizeCanvasToDisplay();
      v.currentTime = 0;
      setPlaying(false);
      drawEmptyOverlay();
    };
  }

  function drawEmptyOverlay(){
    sizeCanvasToDisplay();
    const c = canvasRef.current;
    if(!c) return;
    const g = c.getContext("2d");
    g.clearRect(0,0,c.width,c.height);
  }

  function playPause(){
    const v = videoRef.current;
    if(!v) return;
    if(playing){ v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); pump(); }
  }

  function pump(){
    rafRef.current = requestAnimationFrame(pump);
    const v = videoRef.current;
    if(!v || v.paused || v.ended) return;

    const p = poseRef.current;
    if(!p || busyRef.current) return;

    busyRef.current = true;
    Promise.resolve(p.send({ image: v }))
      .catch(err=>{
        console.error("pose.send error:", err);
        cancelAnimationFrame(rafRef.current);
        setPlaying(false);
      })
      .finally(()=>{ busyRef.current = false; });
  }

  function drawPose(landmarks){
    sizeCanvasToDisplay();
    const c = canvasRef.current, stage = stageRef.current;
    if(!c || !stage) return;

    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0,0, rect.width, rect.height);

    if(!landmarks || !landmarks.length) return;

    g.lineWidth = 4; g.strokeStyle = "rgba(27,110,243,0.8)";
    for(const [a,b] of POSE_CONNECTIONS){
      const pa = landmarks[a], pb = landmarks[b];
      if(pa && pb){
        g.beginPath();
        g.moveTo(pa.x*rect.width, pa.y*rect.height);
        g.lineTo(pb.x*rect.width, pb.y*rect.height);
        g.stroke();
      }
    }
    for(const p of landmarks){
      g.beginPath();
      g.arc(p.x*rect.width, p.y*rect.height, 5, 0, 2*Math.PI);
      g.fillStyle = "#1b6ef3";
      g.fill();
      g.lineWidth = 1.5; g.strokeStyle = "#fff"; g.stroke();
    }
  }

  function onResults(results){
    // fps + duration accounting
    const now = performance.now();
    if (lastTsRef.current != null) {
      const dt = Math.max(0, (now - lastTsRef.current)/1000);
      const fps = dt>0 ? Math.max(10, Math.min(60, 1/dt)) : 30;
      sitState.current.fps = fps;
      vjState.current.fps  = fps;
      ljState.current.fps  = fps;
      statsRef.current.durationSec += dt;
    }
    lastTsRef.current = now;

    const lmk = results.poseLandmarks;
    drawPose(lmk);
    if(!lmk) return;

    // visibility tracking (for authenticity)
    const coreIdx = [11,12,23,24,25,26,27,28,29,30];
    const vis = coreIdx.map(i=>lmk[i]?.visibility).filter(v=>typeof v==="number");
    const visAvg = vis.length ? vis.reduce((a,b)=>a+b,0)/vis.length : 0;
    statsRef.current.frames++;
    if (visAvg > 0.55) statsRef.current.visOkFrames++;

    // ---- SIT-UPS ----
    if(test==="situps"){
      const RS=12, RH=24, RK=26, LS=11, LH=23, LK=25;
      const hasR=lmk[RS]&&lmk[RH]&&lmk[RK], hasL=lmk[LS]&&lmk[LH]&&lmk[LK];
      if(hasR||hasL){
        const ang = hasR ? angleABC(lmk[RS], lmk[RH], lmk[RK]) : angleABC(lmk[LS], lmk[LH], lmk[LK]);

        // update hip angle EVERY frame
        setMetrics(m=>({...m, situps:{ ...m.situps, hipAngle: ang }}));

        // range for authenticity
        statsRef.current.minAngle = Math.min(statsRef.current.minAngle, ang);
        statsRef.current.maxAngle = Math.max(statsRef.current.maxAngle, ang);

        // robust FSM with debounce (use ref so no stale state)
        const st = sitState.current;
        const low=70, high=140;

        if(st.state==="DOWN" && ang<low){ st.state="UP"; st.lastUp=st.frame; }
        else if(st.state==="UP" && ang>high){
          if(st.frame - st.lastUp > 0.15 * st.fps){
            sitRepsRef.current += 1;
            setMetrics(m=>({...m, situps:{ reps: sitRepsRef.current, hipAngle: ang }}));
          }
          st.state="DOWN";
        }
        st.frame++;

        const r = sitRepsRef.current;
        setFeedback(
          r>=10 ? {level:"ok", text:`Strong core! ${r} clean reps.`} :
          r>=5  ? {level:"warn", text:`Good start: ${r} reps. Focus on rhythm & full range.`} :
                  {level:"warn", text:`Bend knees & anchor feet. Aim for 5+ reps.`}
        );
      }
    }

    // ---- VERTICAL JUMP ----
    if(test==="vjump"){
      const LA=27, RA=28, LH=29, RH=30;
      if(lmk[LA]&&lmk[RA]&&lmk[LH]&&lmk[RH]){
        const ankleY = Math.min(lmk[LA].y, lmk[RA].y, lmk[LH].y, lmk[RH].y);
        const st = vjState.current;
        if(st.baseAnkle==null) st.baseAnkle = ankleY;

        const airborneNow = (st.baseAnkle - ankleY) > 0.02;
        if(airborneNow && !st.airborne){ st.airborne=true; st.aStart=st.frame; }
        if(!airborneNow && st.airborne){ st.airborne=false; st.aEnd=st.frame; }

        let t = 0;
        if(st.airborne) t=(st.frame-st.aStart+1)/st.fps;
        else if(st.aStart>=0 && st.aEnd>=st.aStart) t=(st.aEnd-st.aStart+1)/st.fps;

        const h=9.81*t*t/8*100; // cm
        setMetrics(m=>({...m, vjump:{ airMS:Math.round(t*1000), heightCM:h }}));
        setFeedback(
          h>=45 ? {level:"ok", text:`Explosive! Vertical ~${h.toFixed(1)} cm.`} :
          h>=25 ? {level:"warn", text:`Decent pop (~${h.toFixed(1)} cm). Deeper knee bend & arm swing.`} :
                  {level:"warn", text:`Shallow (~${h.toFixed(1)} cm). Work on countermovement.`}
        );
        st.frame++;
      }
    }

    // ---- LONG JUMP ----
    if(test==="ljump"){
      const nose=0, LA=27, RA=28;
      if(lmk[nose] && lmk[LA] && lmk[RA]){
        const ank = Math.abs(lmk[LA].visibility-0.5) < Math.abs(lmk[RA].visibility-0.5) ? lmk[LA] : lmk[RA];
        const st = ljState.current;

        if(!st.bodyH)         st.bodyH = Math.abs((lmk[LA].y + lmk[RA].y)/2 - lmk[nose].y) || 0.45;
        if(st.baseAnkY==null) st.baseAnkY = Math.min(lmk[LA].y, lmk[RA].y);
        if(st.startX==null)   st.startX = ank.x;

        const currentAnkY = Math.min(lmk[LA].y, lmk[RA].y);
        const airborneNow = (st.baseAnkY - currentAnkY) > 0.02;

        if(airborneNow) st.airborne = true;
        if(st.airborne && !airborneNow){
          st.landingX = ank.x;
          const cmPer = athleteHeight / st.bodyH;
          const dx = Math.abs((st.landingX - st.startX) * cmPer);
          setMetrics(m=>({...m, ljump:{ ...m.ljump, distCM:dx, liveDXcm:dx }}));
          setFeedback( dx>=200 ? {level:"ok", text:`Nice distance: ~${dx.toFixed(1)} cm.`}
                               : {level:"warn", text:`~${dx.toFixed(1)} cm. Stronger arm swing & longer push-off.`});
        } else {
          const cmPer = athleteHeight / (st.bodyH||0.45);
          const dxLive = Math.abs((ank.x - st.startX) * cmPer);
          setMetrics(m=>({...m, ljump:{ ...m.ljump, liveDXcm:dxLive }}));
        }
        st.frame++;
      }
    }
  }

  function buildSummary(){
    const s = statsRef.current;
    if (s.frames === 0 || s.durationSec < 0.5) {
      setInsights({
        improve: "Not enough motion captured to judge. Try a longer, brighter clip with your full body in frame.",
        auth: "Estimated authenticity: 0%. Landmarks weren’t stable long enough to score."
      });
      return;
    }

    const vis = s.visOkFrames / s.frames; // 0..1
    let amp = 0, cadence = 0, improve = "";

    if(test==="situps"){
      const angleRange = isFinite(s.minAngle) ? (s.maxAngle - s.minAngle) : 0;
      amp = Math.min(1, Math.max(0, (angleRange - 35)/70));            // 35°–105° good
      cadence = Math.min(1, (sitRepsRef.current / s.durationSec) / 0.45); // ~27 rpm
      improve = sitRepsRef.current >= 10
        ? "Great depth and rhythm. Keep ribs down and exhale near the top; avoid pulling the neck."
        : "Get heels closer to glutes, keep elbows fixed, and control the descent. Aim for smooth, full-range reps before adding speed.";
    } else if(test==="vjump"){
      amp = Math.min(1, Math.max(0, ( (metrics.vjump.heightCM||0) - 12 )/40));
      cadence = 0.8;
      improve = (metrics.vjump.heightCM||0) >= 45
        ? "Explosive take-off—keep chest tall and land softly with hips back."
        : "Load hips back a touch more, dip a bit deeper, and whip arms upward just before take-off.";
    } else {
      const d = Math.max(metrics.ljump.distCM, metrics.ljump.liveDXcm);
      amp = Math.min(1, Math.max(0, (d - 110)/120));
      cadence = 0.8;
      improve = d >= 200
        ? "Good projection. Finish by fully extending hips and swinging arms through the landing."
        : "Use a stronger countermovement: swing arms back then forward in sync and push hips through.";
    }

    const score = Math.max(0, Math.min(1, 0.4*vis + 0.4*amp + 0.2*cadence));
    const pct = Math.round(score*100);
    setInsights({
      improve,
      auth: `Estimated authenticity: ${pct}%. (Blend of landmark visibility, movement amplitude, and cadence continuity.)`
    });
  }

  async function analyzeWithBackend(){
    const f = fileRef.current?.files?.[0];
    if(!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const token = localStorage.getItem("sessionToken") || "";
    const headers = token ? { "X-Session-Token": token } : {};

    if(test==="situps"){
      const res = await analyze("/api/analyze/situps", fd, headers);
      setFeedback({level:"ok", text:"Server verify OK. +"+(res.reward||0)+" pts"});
    } else if(test==="vjump"){
      const res = await analyze("/api/analyze/vertical_jump", fd, headers);
      setFeedback({level:"ok", text:`Server height: ${res.result?.height_cm ?? "?"} cm (+${res.reward||0} pts)`});
    } else {
      fd.append("athlete_height_cm", String(athleteHeight));
      const res = await analyze("/api/analyze/long_jump", fd, headers);
      setFeedback({level:"ok", text:`Server distance: ${res.result?.distance_cm_est ?? "?"} cm (+${res.reward||0} pts)`});
    }
  }

  function toggleFullscreen(){
    const el = stageRef.current;
    if(!el) return;
    if(document.fullscreenElement){ document.exitFullscreen(); }
    else { el.requestFullscreen?.(); }
  }

  const objectFit =
    fitMode === "cover" ? "cover" :
    fitMode === "fill"  ? "fill"  :
    fitMode === "1:1"   ? "none"  : "contain";

  const stageStyle = { "--ar": aspect };

  return (
    <div className="container page">
      <div className="an-grid">
        {/* LEFT: player + controls */}
        <div className="card">
          <div className="row" style={{justifyContent:"space-between", gap:10, alignItems:"center"}}>
            <div className="row" style={{gap:10, flexWrap:"wrap"}}>
              <label>Test:&nbsp;
                <select value={test} onChange={e=>{ setTest(e.target.value); resetStates(); }}>
                  <option value="situps">Sit-ups</option>
                  <option value="vjump">High / Vertical Jump</option>
                  <option value="ljump">Standing Long Jump</option>
                </select>
              </label>
              {test==="ljump" && (
                <label> Athlete height (cm):&nbsp;
                  <input type="number" value={athleteHeight} min="100" max="220"
                         onChange={e=>setAthleteHeight(Number(e.target.value||165))}/>
                </label>
              )}
              <label> View:&nbsp;
                <select value={fitMode} onChange={e=>setFitMode(e.target.value)}>
                  <option value="contain">Contain (see all)</option>
                  <option value="cover">Cover (fills box)</option>
                  <option value="fill">Fill (stretch)</option>
                  <option value="1:1">1:1 pixels</option>
                </select>
              </label>
              <button className="btn secondary" onClick={toggleFullscreen}>Fullscreen</button>
            </div>
          </div>

          <div ref={stageRef} className="video-stage" style={stageStyle}>
            <video
              ref={videoRef}
              playsInline
              controls={false}
              muted
              onPause={()=>setPlaying(false)}
              onPlay={()=>setPlaying(true)}
              style={{
                objectFit,
                imageRendering: fitMode==="1:1" ? "pixelated" : "auto",
                width:"100%", height:"100%"
              }}
            />
            <canvas ref={canvasRef} className="overlay" />
          </div>

          <div className="controls">
            <input ref={fileRef} type="file" accept="video/*" onChange={loadFile}/>
            <button className="btn" onClick={playPause}>{playing ? "Pause" : "Play"}</button>
            <button className="btn secondary" onClick={()=>{
              if(videoRef.current) videoRef.current.currentTime=0;
              resetStates();
            }}>Reset</button>
            <button className="btn secondary" onClick={analyzeWithBackend}>Analyze (server verify)</button>
          </div>
        </div>

        {/* RIGHT: live metrics + insights */}
        <div className="card">
          <h3 style={{marginTop:0}}>Live Metrics</h3>

          {test==="situps" && (
            <div className="metrics">
              <div className="metric"><div className="k">Reps</div><div className="v">{metrics.situps.reps}</div></div>
              <div className="metric"><div className="k">Hip Angle (°)</div><div className="v">{metrics.situps.hipAngle.toFixed(1)}</div></div>
            </div>
          )}

          {test==="vjump" && (
            <div className="metrics">
              <div className="metric"><div className="k">Airtime (ms)</div><div className="v">{metrics.vjump.airMS}</div></div>
              <div className="metric"><div className="k">Height (cm)</div><div className="v">{metrics.vjump.heightCM.toFixed(1)}</div></div>
            </div>
          )}

          {test==="ljump" && (
            <div className="metrics">
              <div className="metric"><div className="k">Live Displacement (cm)</div><div className="v">{metrics.ljump.liveDXcm.toFixed(1)}</div></div>
              <div className="metric"><div className="k">Distance (cm)</div><div className="v">{metrics.ljump.distCM.toFixed(1)}</div></div>
            </div>
          )}

          {feedback ? (
            <div className={`feedback ${feedback.level==="ok" ? "ok":"warn"}`}>{feedback.text}</div>
          ) : (
            <div className="feedback">Upload a clip and press <b>Play</b>. Metrics update in real time.</div>
          )}

          {insights && (
            <div style={{ marginTop: 14, lineHeight: 1.5 }}>
              <p><b>How to improve:</b> {insights.improve}</p>
              <p><b>{insights.auth ? "":""}</b>{insights.auth}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
