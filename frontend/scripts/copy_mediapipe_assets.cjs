// CommonJS version so it runs under Node without "type":"module"
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', '@mediapipe', 'pose');
const dest = path.join(__dirname, '..', 'public', 'mediapipe', 'pose');

try {
  fs.mkdirSync(dest, { recursive: true });
} catch {}

const candidates = [
  // Primary assets
  'pose_solution_packed_assets.data',
  'pose_solution_simd_wasm_bin.wasm',
  'pose_solution_packed_assets_loader.js',
  'pose_solution_simd_wasm_bin.js',
  'pose_web.binarypb',
  'pose_binary.graph',
  // Fallback names in some builds
  'pose_solution_wasm_bin.wasm',
  'pose_solution_wasm_bin.js'
];

let copied = 0;
for (const f of candidates) {
  const s = path.join(src, f);
  const d = path.join(dest, f);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d);
    copied++;
  }
}

if (!copied) {
  console.warn('[mediapipe-copy] No files copied. Is @mediapipe/pose installed?');
  process.exit(0); // do not fail install, just warn
} else {
  console.log(`[mediapipe-copy] Copied ${copied} file(s) to /public/mediapipe/pose`);
}
