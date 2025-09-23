const API = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export async function analyze(path, formData, headers = {}) {
  const res = await fetch(`${API}${path}`, { method: 'POST', body: formData, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function health() {
  try { const res = await fetch(`${API}/health`); return res.ok; } catch { return false; }
}

export async function apiLogin(username, password) {
  const fd = new FormData(); fd.append('username', username); fd.append('password', password);
  const r = await fetch(`${API}/auth/login`, { method: 'POST', body: fd }); return r.json();
}

export async function apiRegister(username, password) {
  const fd = new FormData(); fd.append('username', username); fd.append('password', password);
  const r = await fetch(`${API}/auth/register`, { method: 'POST', body: fd }); return r.json();
}

export async function apiLeaderboard() {
  const r = await fetch(`${API}/rewards/leaderboard`); return r.json();
}

export async function netCreate(name, visibility) {
  const fd = new FormData(); fd.append('name', name); fd.append('visibility', visibility);
  const r = await fetch(`${API}/network/create`, { method:'POST', body: fd }); return r.json();
}
export async function netList() {
  const r = await fetch(`${API}/network/list`); return r.json();
}
export async function netJoin(nid, key) {
  const fd = new FormData(); fd.append('nid', nid); if(key) fd.append('key', key);
  const r = await fetch(`${API}/network/join`, { method:'POST', body: fd }); return r.json();
}
export async function netPost(nid, text, file) {
  const fd = new FormData(); fd.append('nid', nid); fd.append('text', text || '');
  if(file) fd.append('file', file);
  const r = await fetch(`${API}/network/post`, { method:'POST', body: fd }); return r.json();
}
export async function netFeed(nid) {
  const r = await fetch(`${API}/network/feed?nid=${encodeURIComponent(nid)}`); return r.json();
}

