'use strict';
/* ================= CORE ================= */
const APP_VERSION = '2.5.0';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ALNUM = 'abcdefghijkmnpqrstuvwxyz23456789';
const uid = (n = 14) => [...crypto.getRandomValues(new Uint8Array(n))].map(x => ALNUM[x % 32]).join('');
const code6 = () => [...crypto.getRandomValues(new Uint8Array(6))].map(x => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 32]).join('');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmtB = b => { if (b == null || isNaN(b)) return '—'; const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (b >= 1024 && i < 4) { b /= 1024; i++ } return (i ? b.toFixed(b < 10 ? 1 : 0) : b) + ' ' + u[i] };
const fmtD = t => t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtDT = t => t ? new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const ago = t => { if (!t) return 'never'; const s = (Date.now() - t) / 1000; if (s < 45) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; if (s < 86400 * 30) return Math.round(s / 86400) + ' d ago'; return fmtD(t) };
const extOf = n => (String(n).includes('.') ? String(n).split('.').pop() : '').toLowerCase().slice(0, 8);
const te = new TextEncoder(), td = new TextDecoder();
const b64 = buf => { let s = ''; const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s) };
const unb64 = s => { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u };

/* ---------- icons (stroke, 24 grid) ---------- */
const IC = {
 home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
 scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 9h8M8 12h8M8 15h5"/>',
 key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.7-8.7M17 6l2.5 2.5M14.5 8.5 17 11"/>',
 lock: '<rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
 unlock: '<rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 7.7-1.5"/>',
 devices: '<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M6 18h6M9 14v4"/><rect x="16" y="8" width="6" height="12" rx="1.5"/>',
 chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 broom: '<path d="m16 22-1-4"/><path d="M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1"/><path d="M5 14h14l2 6.8a1 1 0 0 1-1 1.2H4a1 1 0 0 1-1-1.2z"/><path d="m8 22 1-4"/>',
 gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
 download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
 search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
 share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
 link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
 trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5A1.5 1.5 0 0 0 8 21h8a1.5 1.5 0 0 0 1.5-1.5l1-12.5M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
 eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.3M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
 plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
 tag: '<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
 move: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/><path d="M10 14h6M13.5 11.5 16 14l-2.5 2.5"/>',
 rotate: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
 crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/>',
 camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
 image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
 file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
 video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
 music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
 archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
 code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
 book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/>',
 sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
 slides: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/>',
 app: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12h6M12 9v6"/>',
 font: '<path d="M5 20 11 4h2l6 16M8 14h8"/>',
 pen: '<path d="m12 19 7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
 refresh: '<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5M3 21v-5h5"/>',
 qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h3v3h-3"/>',
 wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
 battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/>',
 cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
 star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
 shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
 back: '<path d="M15 5 8 12l7 7"/>', chev: '<path d="m9 6 6 6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
 phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
 laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
 tablet: '<rect x="4" y="2" width="16" height="20" rx="2.5"/><path d="M11 18h2"/>',
 cloud: '<path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
 clouddown: '<path d="M7 17a5 5 0 0 1-.6-10A6 6 0 0 1 18 8a4.5 4.5 0 0 1 .5 9M12 12v9M9 18l3 3 3-3"/>',
 card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
 note: '<path d="M5 3h10l4 4v14H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
 id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M14 10h4M14 14h3"/>',
 bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
 warn: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
 dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/>',
 hdd: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M5.5 13 8 5h8l2.5 8M7 16.5h.01"/>',
 wand: '<path d="m21.6 3.6-1.3-1.3a1.2 1.2 0 0 0-1.7 0L2.4 18.6a1.2 1.2 0 0 0 0 1.7l1.3 1.3a1.2 1.2 0 0 0 1.7 0L21.6 5.4a1.2 1.2 0 0 0 0-1.8"/><path d="m14 7 3 3M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/>', restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
 sort: '<path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/>', filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
 left: '<path d="M19 12H5M11 6l-6 6 6 6"/>', right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
 launch: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
 sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
 monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'
};
const ic = (n, s = 20, extra = '') => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${IC[n] || IC.file}</svg>`;
const LOGO = (s = 40) => `<svg class="logo" width="${s}" height="${s}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#1A5CFF"/><g transform="translate(8.38 6.74) scale(1.3920)" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></g></svg>`;

/* ---------- storage (IndexedDB, with in-memory fallback) ---------- */
const STORES = ['files', 'blobs', 'scans', 'hidden', 'kv'];
let _db = null, MEM = null;
function idb() {
 if (_db) return _db;
 _db = new Promise((res, rej) => {
  try {
   const r = indexedDB.open('desk', 1);
   r.onupgradeneeded = () => { const d = r.result; STORES.forEach(s => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s) }) };
   r.onsuccess = () => res(r.result);
   r.onerror = () => rej(r.error);
   r.onblocked = () => rej(new Error('blocked'));
  } catch (e) { rej(e) }
 }).catch(e => { console.warn('IndexedDB unavailable, using memory', e); MEM = Object.fromEntries(STORES.map(s => [s, new Map()])); return null });
 return _db;
}
async function tx(store, mode, fn) {
 const d = await idb();
 if (!d) return fn(null);
 return new Promise((res, rej) => {
  const t = d.transaction(store, mode); const out = fn(t.objectStore(store));
  t.oncomplete = () => res(out instanceof IDBRequest ? out.result : out);
  t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('Storage aborted (device may be full)'));
 });
}
const dbGet = (s, k) => tx(s, 'readonly', st => !st ? MEM[s].get(k) : st.get(k));
const dbPut = (s, k, v) => tx(s, 'readwrite', st => !st ? (MEM[s].set(k, v), k) : st.put(v, k));
const dbDel = (s, k) => tx(s, 'readwrite', st => !st ? MEM[s].delete(k) : st.delete(k));
const dbAll = s => tx(s, 'readonly', st => !st ? [...MEM[s].values()] : st.getAll());
const dbKeys = s => tx(s, 'readonly', st => !st ? [...MEM[s].keys()] : st.getAllKeys());
const dbClear = s => tx(s, 'readwrite', st => !st ? MEM[s].clear() : st.clear());
async function dbPutMany(items) {
 const d = await idb();
 if (!d) { items.forEach(([s, k, v]) => MEM[s].set(k, v)); return }
 return new Promise((res, rej) => { const t = d.transaction([...new Set(items.map(i => i[0]))], 'readwrite'); items.forEach(([s, k, v]) => t.objectStore(s).put(v, k)); t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new DOMException('Storage is full', 'QuotaExceededError')) });
}
async function storageRoom() {
 try { if (!navigator.storage || !navigator.storage.estimate) return null; const e = await navigator.storage.estimate(); if (!e.quota) return null; return { usage: e.usage || 0, quota: e.quota, free: Math.max(0, e.quota - (e.usage || 0)) } } catch { return null }
}
const isQuota = e => e && (e.name === 'QuotaExceededError' || /quota|storage is full|disk/i.test(e.message || ''));
const kvGet = (k, d = null) => dbGet('kv', k).then(v => v === undefined ? d : v).catch(() => d);
const kvSet = (k, v) => dbPut('kv', k, v);

/* ---------- crypto ---------- */
async function deriveKey(pass, salt, iter = 310000) {
 const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
 return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function aesEnc(key, data) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data); return { iv, ct } }
const aesDec = (key, iv, ct) => crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
async function encJSON(key, obj) { const { iv, ct } = await aesEnc(key, te.encode(JSON.stringify(obj))); return { iv: b64(iv), ct: b64(ct) } }
async function decJSON(key, o) { return JSON.parse(td.decode(await aesDec(key, unb64(o.iv), unb64(o.ct)))) }
async function sha256hex(buf) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map(b => b.toString(16).padStart(2, '0')).join('') }
// File fingerprints. Small files: full SHA-256. Big files: SHA-256 of samples (start, 6 spread-out
// slices, end) plus the exact size — reads ~5 MB instead of the whole file, so multi-GB videos fingerprint
// in milliseconds. Older fingerprints ('q' prefix / full hashes of 16–64 MB files) are still understood.
const HASH_FULL_MAX = 16 * 1048576;
async function hashOld(f) {
 const MB = 1048576;
 if (f.size <= 64 * MB) return sha256hex(await f.arrayBuffer());
 const a = new Uint8Array(await f.slice(0, 4 * MB).arrayBuffer()), b = new Uint8Array(await f.slice(f.size - 4 * MB).arrayBuffer());
 const m = new Uint8Array(a.length + b.length + 8); m.set(a); m.set(b, a.length); new DataView(m.buffer).setFloat64(m.length - 8, f.size);
 return 'q' + await sha256hex(m);
}
async function hashBlob(f) {
 if (f.size <= HASH_FULL_MAX) return sha256hex(await f.arrayBuffer());
 const MB = 1048576, parts = [f.slice(0, 2 * MB)];
 for (let k = 1; k <= 6; k++) { const at = Math.floor(f.size * k / 7); parts.push(f.slice(at, at + 256 * 1024)) }
 parts.push(f.slice(f.size - 2 * MB));
 const buf = new Uint8Array(await new Blob(parts).arrayBuffer()), m = new Uint8Array(buf.length + 8);
 m.set(buf); new DataView(m.buffer).setFloat64(buf.length, f.size);
 return 'q2' + await sha256hex(m);
}
const hashScheme = h => !h ? 'none' : h.startsWith('q2') ? 'q2' : h.startsWith('q') ? 'q' : 'full';
// Fingerprint a file the same way an existing fingerprint was made (for duplicate checks & sync verification)
async function hashLike(f, h) { const s = hashScheme(h); if (s === 'q2') return hashBlob(f); if (s === 'q') return hashOld(f); return f.size <= 512 * 1048576 ? sha256hex(await f.arrayBuffer()) : null }

/* ---------- zip (store) writer & reader ---------- */
const CRCT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })();
function crc32(u) { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRCT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 }
async function makeZip(entries) {
 const parts = [], central = []; let off = 0; const used = new Set();
 for (const e of entries) {
  let name = e.name.replace(/[\\:*?"<>|]/g, '_'); let k = 1; while (used.has(name)) { name = e.name.replace(/(\.[^.]*)?$/, m => ` (${k})` + m); k++ } used.add(name);
  const data = new Uint8Array(await e.blob.arrayBuffer()), nm = te.encode(name), crc = crc32(data);
  const h = new DataView(new ArrayBuffer(30));
  h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 0x21, true);
  h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true);
  parts.push(h.buffer, nm, data);
  const c = new DataView(new ArrayBuffer(46));
  c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
  c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
  central.push(c.buffer, nm);
  off += 30 + nm.length + data.length;
 }
 const csize = central.reduce((a, b) => a + b.byteLength, 0);
 const end = new DataView(new ArrayBuffer(22));
 end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, csize, true); end.setUint32(16, off, true);
 return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}
async function readZip(blob) {
 const u = new Uint8Array(await blob.arrayBuffer()), dv = new DataView(u.buffer);
 let e = u.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
 if (e < 0) throw new Error('Not a zip file');
 const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const out = [];
 for (let i = 0; i < n; i++) {
  const method = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
  const name = td.decode(u.subarray(p + 46, p + 46 + nl));
  const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
  let data = u.slice(start, start + csz);
  if (method === 8) data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  if (!name.endsWith('/')) out.push({ name, data });
  p += 46 + nl + xl + cl;
 }
 return out;
}

/* ---------- minimal PDF writer (JPEG pages) ---------- */
function makePdf(pages) {
 const chunks = []; let len = 0; const offs = [];
 const push = x => { const b = typeof x === 'string' ? te.encode(x) : x; chunks.push(b); len += b.length };
 const obj = (id, body) => { offs[id] = len; push(id + ' 0 obj\n'); (Array.isArray(body) ? body : [body]).forEach(push); push('\nendobj\n') };
 push('%PDF-1.4\n%âã\n');
 const N = pages.length, total = 2 + 3 * N;
 obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
 obj(2, `<< /Type /Pages /Kids [${pages.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ')}] /Count ${N} >>`);
 pages.forEach((p, i) => {
  const pw = 595, ph = Math.round(595 * p.h / p.w * 100) / 100, id = 3 + 3 * i;
  obj(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im${i} ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`);
  obj(id + 1, [`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`, p.jpeg, '\nendstream']);
  const cs = `q ${pw} 0 0 ${ph} 0 0 cm /Im${i} Do Q`;
  obj(id + 2, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
 });
 const xref = len; let x = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
 for (let i = 1; i <= total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
 push(x + `trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
 return new Blob(chunks, { type: 'application/pdf' });
}

/* ---------- UI helpers ---------- */
function toast(msg, type = '') {
 const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg;
 $('#toasts').appendChild(t); setTimeout(() => t.remove(), type === 'err' ? 5200 : 3200);
}
function modal(html, { cls = '', onClose } = {}) {
 const w = document.createElement('div'); w.className = 'mwrap' + (/\bfull\b/.test(cls) ? ' mfull' : '');
 w.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
 $('#modal-root').appendChild(w);
 let closed = false;
 const close = () => { if (closed) return; closed = true; w.remove(); onClose && onClose() };
 w.close = close;
 w.addEventListener('mousedown', e => { if (e.target === w) w._down = true });
 w.addEventListener('click', e => { if ((e.target === w && w._down) || e.target.closest('[data-close]')) close(); w._down = false });
 setTimeout(() => { const f = w.querySelector('[autofocus],input:not([type=checkbox]):not([type=range]),textarea'); f && f.focus() }, 40);
 return w;
}
const topModal = () => { const a = $$('#modal-root .mwrap'); return a[a.length - 1] };
function ask(title, { body = '', ok = 'OK', danger = false, input = null, type = 'text', value = '', placeholder = '' } = {}) {
 return new Promise(res => {
  let done = false;
  const m = modal(`<h3>${esc(title)}</h3>${body ? `<p class="muted" style="margin-bottom:14px">${body}</p>` : ''}
   <form>${input !== null ? `<label class="fld"><span>${esc(input)}</span><input id="askIn" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off"></label>` : ''}
   <div class="row end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'pri'}" autofocus>${esc(ok)}</button></div></form>`, { onClose: () => { if (!done) res(null) } });
  m.querySelector('form').onsubmit = e => { e.preventDefault(); done = true; const v = input !== null ? m.querySelector('#askIn').value : true; m.close(); res(v) };
 });
}
async function copyText(t, label = 'Copied') {
 try { await navigator.clipboard.writeText(t); toast(label); return true }
 catch {
  const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy') } catch { } ta.remove();
  toast(ok ? label : 'Copy blocked — select and copy manually', ok ? '' : 'err'); return ok;
 }
}

/* ---------- local downloads & native share ---------- */
const ONLINE_APP = () => /^https?:/.test(location.protocol);
async function saveBlob(blob, name) {
 try {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 8000);
  toast('Downloading ' + name); return true;
 } catch (e) { toast('Download didn’t start', 'err'); return false }
}
async function nativeShareFile(blob, name, type) {
 try { const f = new File([blob], name, { type: type || blob.type }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return true } } catch (e) { if (e && e.name === 'AbortError') return true }
 return false;
}
