/* DESk — built from src/ by build.py. Edit src/, not this file. */
(() => {
'use strict';
/* ================= CORE ================= */
const APP_VERSION = '2.3.0';
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
 const w = document.createElement('div'); w.className = 'mwrap';
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

// Tiny QR code maker (byte mode, error correction M), drawn as an SVG.
// Self-contained so the app needs no extra download. Based on the QR Code spec (ISO/IEC 18004).
const ECC_PER_BLOCK_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
const BLOCKS_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];
const FORMAT_M = 0;

function rawModules(ver) {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) { const n = Math.floor(ver / 7) + 2; r -= (25 * n - 10) * n - 55; if (ver >= 7) r -= 36; }
  return r;
}
const dataCodewords = ver => Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK_M[ver] * BLOCKS_M[ver];

function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
  return z & 0xFF;
}
function rsDivisor(deg) {
  const r = new Array(deg).fill(0); r[deg - 1] = 1;
  let root = 1;
  for (let i = 0; i < deg; i++) {
    for (let j = 0; j < deg; j++) { r[j] = gfMul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; }
    root = gfMul(root, 0x02);
  }
  return r;
}
function rsRemainder(data, div) {
  const r = div.map(() => 0);
  for (const b of data) {
    const f = b ^ r.shift(); r.push(0);
    div.forEach((c, i) => { r[i] ^= gfMul(c, f); });
  }
  return r;
}
function alignPositions(ver, size) {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
  const out = [6];
  for (let pos = size - 7; out.length < n; pos -= step) out.splice(1, 0, pos);
  return out;
}

function qrMatrix(text) {
  const bytes = [...new TextEncoder().encode(text)];
  let ver = 1;
  for (; ver <= 40; ver++) {
    const cc = ver < 10 ? 8 : 16;
    if (4 + cc + bytes.length * 8 <= dataCodewords(ver) * 8) break;
  }
  if (ver > 40) throw new Error('Too long for a QR code');
  const cap = dataCodewords(ver) * 8;
  // bit stream
  const bits = [];
  const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
  put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap - bits.length));
  put(0, (8 - bits.length % 8) % 8);
  for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  // error correction + interleave
  const nBlocks = BLOCKS_M[ver], eccLen = ECC_PER_BLOCK_M[ver], raw = Math.floor(rawModules(ver) / 8);
  const nShort = nBlocks - raw % nBlocks, shortLen = Math.floor(raw / nBlocks);
  const div = rsDivisor(eccLen), blocks = [];
  for (let i = 0, k = 0; i < nBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1)); k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < nShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const all = [];
  for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - eccLen || j >= nShort) all.push(b[i]); });

  // modules
  const size = ver * 4 + 17;
  const M = Array.from({ length: size }, () => new Array(size).fill(false));
  const F = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = (x, y, dark) => { M[y][x] = dark; F[y][x] = true; };
  for (let i = 0; i < size; i++) { fn(6, i, i % 2 === 0); fn(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]])
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) fn(x, y, d !== 2 && d !== 4);
    }
  const al = alignPositions(ver, size), last = al.length - 1;
  al.forEach((ax, i) => al.forEach((ay, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) fn(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const drawFormat = mask => {
    const d = FORMAT_M << 3 | mask;
    let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412, bit = i => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) fn(8, i, bit(i));
    fn(8, 7, bit(6)); fn(8, 8, bit(7)); fn(7, 8, bit(8));
    for (let i = 9; i < 15; i++) fn(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) fn(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) fn(8, size - 15 + i, bit(i));
    fn(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7) {
    let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
    const b = ver << 12 | r;
    for (let i = 0; i < 18; i++) { const bit = ((b >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i / 3); fn(a, c, bit); fn(c, a, bit); }
  }
  // data, zig-zag
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) {
      const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - v : v;
      if (!F[y][x] && i < all.length * 8) { M[y][x] = ((all[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
    }
  }
  // pick the mask that's easiest to scan
  const maskFn = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
    (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
  const apply = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && maskFn[m](x, y)) M[y][x] = !M[y][x]; };
  const penalty = () => {
    let p = 0, dark = 0;
    for (let y = 0; y < size; y++) for (const horiz of [true, false]) {
      let run = 0, prev = null;
      for (let x = 0; x < size; x++) {
        const c = horiz ? M[y][x] : M[x][y];
        if (c === prev) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else { run = 1; prev = c; }
      }
    }
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
    for (const row of M) for (const c of row) if (c) dark++;
    return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  };
  let best = 0, bestP = Infinity;
  for (let m = 0; m < 8; m++) { apply(m); drawFormat(m); const p = penalty(); if (p < bestP) { bestP = p; best = m; } apply(m); }
  apply(best); drawFormat(best);
  return M;
}

function qrSVG(text, { dark = '#000', light = '#fff', quiet = 4 } = {}) {
  const M = qrMatrix(text), n = M.length + quiet * 2;
  let d = '';
  M.forEach((row, y) => row.forEach((c, x) => { if (c) d += `M${x + quiet} ${y + quiet}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${n}" height="${n}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}

/* ================= STATE ================= */
const S = {
 files: [], scans: [], view: 'home', q: '', folder: 'All', tag: null, sort: 'new', layout: 'grid', selMode: false, sel: new Set(),
 settings: {}, deviceId: null, deviceName: '', hiddenDK: null, hiddenItems: null, vaultKey: null, vault: null, lastAct: Date.now()
};
const ACT = {};      // click actions: data-act="name"
const VIEWS = {};    // view renderers -> html
const AFTER = {};    // after-render hooks
const FORMS = {};    // form submit handlers: data-form="name"
const DEF_SETTINGS = { skipDupes: true, autoDownloadMB: 10, autoEmptyDays: 30, lockMin: 5, stealth: false, vaultSync: true };
const setting = k => (S.settings[k] === undefined ? DEF_SETTINGS[k] : S.settings[k]);
async function setSetting(k, v) { S.settings[k] = v; S.settingsTs = S.settingsTs || {}; S.settingsTs[k] = Date.now(); await kvSet('settings', S.settings); await kvSet('settingsTs', S.settingsTs); if (typeof syncSoon === 'function') syncSoon() }
const saveRec = rec => dbPut('files', rec.id, rec);
const live = () => S.files.filter(f => !f.trashed);
const byId = id => S.files.find(f => f.id === id);
const safeThumb = t => (typeof t === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(t)) ? t : null;

/* ================= AUTO-SORT ================= */
const CATS = {
 Images: { ic: 'image', c: '#1A5CFF' }, Videos: { ic: 'video', c: '#7a3cff' }, Audio: { ic: 'music', c: '#e5489a' }, Documents: { ic: 'file', c: '#0f9d8a' },
 Scans: { ic: 'scan', c: '#0a96c4' }, Spreadsheets: { ic: 'sheet', c: '#12a150' }, Presentations: { ic: 'slides', c: '#f08c00' }, Archives: { ic: 'archive', c: '#9c6b30' },
 Code: { ic: 'code', c: '#4c5a75' }, Ebooks: { ic: 'book', c: '#b4479b' }, Design: { ic: 'pen', c: '#d9480f' }, Apps: { ic: 'app', c: '#364fc7' }, Fonts: { ic: 'font', c: '#495057' }, Other: { ic: 'file', c: '#868e96' }
};
const EXT = {
 Images: 'jpg jpeg png gif webp bmp tif tiff heic heif avif svg ico raw cr2 nef arw dng jfif', Videos: 'mp4 mov m4v webm mkv avi wmv flv 3gp mpeg mpg ts',
 Audio: 'mp3 wav m4a aac flac ogg oga opus wma aiff amr mid midi', Documents: 'pdf doc docx odt rtf txt md pages tex log',
 Spreadsheets: 'xls xlsx xlsm csv tsv ods numbers', Presentations: 'ppt pptx odp key', Archives: 'zip rar 7z tar gz tgz bz2 xz iso',
 Code: 'js mjs ts jsx tsx py java c cpp h cs go rs rb php html htm css scss json xml yml yaml sh bat ps1 sql swift kt dart vue ipynb',
 Ebooks: 'epub mobi azw azw3 fb2 djvu', Design: 'psd ai xd fig sketch indd eps afdesign afphoto blend obj fbx stl', Apps: 'apk aab exe msi dmg pkg deb rpm appimage ipa', Fonts: 'ttf otf woff woff2'
};
const EXTMAP = {}; for (const [k, v] of Object.entries(EXT)) v.split(' ').forEach(e => EXTMAP[e] = k);
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', heic: 'image/heic', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg', pdf: 'application/pdf', txt: 'text/plain', md: 'text/markdown', csv: 'text/csv', json: 'application/json', html: 'text/html', zip: 'application/zip', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2' };
const guessMime = n => MIME[extOf(n)] || 'application/octet-stream';
const RULES = [
 [/invoice|receipt|bill\b|statement|tax|payslip|pay ?stub|salary|bank|budget|expense|quotation|quote/i, 'Finance'],
 [/contract|agreement|nda\b|proposal|report|meeting|minutes|memo|resume|\bcv\b|offer|policy|invoice/i, 'Work'],
 [/ticket|boarding|itinerary|booking|reservation|visa|passport|hotel|flight/i, 'Travel'],
 [/medical|prescription|\blab\b|health|insurance|vaccin|clinic|hospital/i, 'Health'],
 [/lecture|notes|assignment|thesis|syllabus|homework|exam|course|transcript|certificate|diploma/i, 'Study'],
 [/\bid\b|licen[cs]e|birth|marriage|deed|warranty|manual|lease|rental/i, 'Personal']
];
function classify(name, mime = '', size = 0, extra = {}) {
 const ext = extOf(name), base = name.replace(/\.[^.]+$/, '');
 let cat = extra.scan ? 'Scans' : EXTMAP[ext] || (mime.startsWith('image/') ? 'Images' : mime.startsWith('video/') ? 'Videos' : mime.startsWith('audio/') ? 'Audio' : (mime.startsWith('text/') || mime.includes('pdf')) ? 'Documents' : 'Other');
 const tags = new Set(); if (ext) tags.add(ext); let sub = '';
 if (cat === 'Images') {
  if (/screen ?shot|screenshot|scr_|capture|snip/i.test(base)) { sub = 'Screenshots'; tags.add('screenshot') }
  else if (/whatsapp|telegram|signal|messenger/i.test(base)) { sub = 'Messaging'; tags.add('chat') }
  else if (/^(img|dsc|pxl|dcim|photo|pic|mvimg|dji)[_-]?\d/i.test(base) || ['heic', 'heif', 'jpg', 'jpeg', 'jfif', 'dng', 'raw', 'cr2', 'nef', 'arw'].includes(ext)) { sub = 'Photos'; tags.add('photo') }
  else sub = 'Graphics';
 } else if (cat === 'Videos') sub = /screen|record/i.test(base) ? 'Screen recordings' : /whatsapp|telegram/i.test(base) ? 'Messaging' : 'Clips';
 else if (cat === 'Audio') sub = /voice|record|memo|ptt|aud-|note/i.test(base) ? 'Voice notes' : 'Music';
 const docLike = ['Documents', 'Scans', 'Spreadsheets', 'Presentations'].includes(cat);
 if (docLike || cat === 'Images') {
  for (const [re, f] of RULES) { const m = base.match(re); if (m) { tags.add(m[0].toLowerCase().trim()); tags.add(f.toLowerCase()); if (docLike && !sub) sub = f } }
 }
 if (cat === 'Scans' && !sub) sub = extra.kind || 'Documents';
 if (docLike && !sub) sub = 'General';
 if (extra.kind) tags.add(extra.kind.toLowerCase());
 if (extra.scan) tags.add('scan');
 if (size > 100 * 1048576) tags.add('large');
 tags.add(String(new Date(extra.modified || Date.now()).getFullYear()));
 if (extra.path) { const parts = extra.path.split('/'); if (parts.length > 1) tags.add(parts[parts.length - 2].toLowerCase().slice(0, 24)) }
 return { cat, folder: sub ? cat + '/' + sub : cat, tags: [...tags].filter(Boolean) };
}

/* ================= THUMBNAILS ================= */
function loadImg(blob) {
 return new Promise((res, rej) => { const u = URL.createObjectURL(blob), im = new Image(); im.onload = () => { res(im); setTimeout(() => URL.revokeObjectURL(u), 2000) }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Image could not be read')) }; im.src = u });
}
function drawThumb(src, w, h, max = 320) {
 const s = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
 c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
 const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0, c.width, c.height);
 return c.toDataURL('image/jpeg', .72);
}
function videoThumb(blob) {
 return new Promise(res => {
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata';
  const u = URL.createObjectURL(blob); const done = x => { URL.revokeObjectURL(u); res(x) };
  const t = setTimeout(() => done(null), 7000);
  v.onloadeddata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 3) };
  v.onseeked = () => { clearTimeout(t); try { done(drawThumb(v, v.videoWidth, v.videoHeight)) } catch { done(null) } };
  v.onerror = () => { clearTimeout(t); done(null) }; v.src = u;
 });
}
async function makeThumb(blob, mime) {
 try {
  if (mime.startsWith('image/') && !/heic|heif|tiff/.test(mime)) { const im = await loadImg(blob); return drawThumb(im, im.naturalWidth || 300, im.naturalHeight || 300) }
  if (mime.startsWith('video/') && blob.size < 1.5e9) return await videoThumb(blob);
 } catch { }
 return null;
}
async function miniOf(dataUrl) { if (!dataUrl) return null; try { const im = new Image(); im.src = dataUrl; await im.decode(); const s = 72 / Math.max(im.width, im.height), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * s)); c.height = Math.max(1, Math.round(im.height * s)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .6) } catch { return null } }
const thumbHTML = (f, size = 34) => { const t = safeThumb(f.thumb); if (t) return `<img src="${t}" alt="" loading="lazy">`; const c = CATS[f.cat] || CATS.Other; return `<span style="color:${c.c}">${ic(c.ic, size)}</span>` };

/* ================= INGEST (fast path) =================
 • checks free storage first and tells you exactly how much too big an upload is
 • fingerprints and stores 4 files at a time (big files are sampled, not read in full)
 • one storage transaction per file; thumbnails are made afterwards in the background
 • live speed / time left, Cancel, and a clear report if storage fills up part-way */
async function addFile(blob, o) {
 const name = o.name || blob.name || 'file';
 const mime = o.type || blob.type || guessMime(name);
 const hash = o.hash || await hashBlob(blob);
 const c = classify(name, mime, blob.size, { path: o.path, modified: o.modified, scan: !!o.scan, kind: o.kind });
 const now = Date.now();
 const rec = { id: uid(), name, type: mime, size: blob.size, cat: c.cat, folder: c.folder, tags: c.tags, added: now, modified: o.modified || now, opened: 0, hash, origin: o.origin || 'upload', device: S.deviceId, scanId: o.scan || null, thumb: o.thumb || null, trashed: 0, fav: false, mt: now, dirty: false, offloaded: false, sent: 0 };
 if (o.thumb) rec.mini = await miniOf(o.thumb);
 await dbPutMany([['blobs', rec.id, blob], ['files', rec.id, rec]]);
 S.files.push(rec);
 if (!rec.thumb && thumbable(mime, blob.size)) queueThumb(rec);
 return rec;
}
/* background thumbnails */
const thumbable = (mime, size) => (mime.startsWith('image/') && !/heic|heif|tiff/.test(mime) && size < 80 * 1048576) || (mime.startsWith('video/') && size < 4e9);
const TQ = []; let tqRunning = 0;
function queueThumb(rec) { TQ.push(rec.id); pumpThumbs() }
function pumpThumbs() {
 while (tqRunning < 2 && TQ.length) {
  const id = TQ.shift(); tqRunning++;
  (async () => {
   try {
    const r = byId(id); if (!r || r.thumb) return;
    const b = await dbGet('blobs', id); if (!b) return;
    r.thumb = await fastThumb(b, r.type); if (!r.thumb) return;
    r.mini = await miniOf(r.thumb); await saveRec(r); thumbRender();
   } catch { } finally { tqRunning--; pumpThumbs() }
  })();
 }
}
let thumbT = 0; const thumbRender = () => { if (thumbT) return; thumbT = setTimeout(() => { thumbT = 0; if (['files', 'home', 'scan'].includes(S.view) && !document.querySelector('#modal-root .mwrap')) renderSoon() }, 700) };
async function fastThumb(blob, mime) {
 if (mime.startsWith('image/') && 'createImageBitmap' in window) {
  try { const bm = await createImageBitmap(blob, { resizeWidth: 320, resizeQuality: 'medium' }); const c = document.createElement('canvas'); c.width = bm.width; c.height = bm.height; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bm, 0, 0); bm.close && bm.close(); return c.toDataURL('image/jpeg', .72) } catch { }
 }
 return makeThumb(blob, mime);
}
/* progress panel */
function upPanel(total, totalBytes = 0) {
 const el = $('#upq'), t0 = performance.now(); let cancelled = false, doneB = 0, doneN = 0;
 el.onclick = null;
 el.innerHTML = `<div class="upq"><div class="row between" style="flex-wrap:nowrap"><b id="upT">Adding ${total} item${total > 1 ? 's' : ''}…</b><button class="btn sm ghost" id="upX">Cancel</button></div>
  <div class="bar" style="margin:10px 0 6px"><i id="upB" style="width:0"></i></div>
  <div class="row between small muted" style="flex-wrap:nowrap;gap:8px"><span id="upN">0 / ${total}</span><span id="upS"></span></div>
  <div class="small muted" id="upF" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px"></div></div>`;
 $('#upX').onclick = () => { cancelled = true; $('#upX').textContent = 'Stopping…'; $('#upX').disabled = true };
 let last = 0;
 const paint = name => {
  const now = performance.now(); if (now - last < 120 && doneN < total) return; last = now;
  const pct = totalBytes ? doneB / totalBytes : doneN / total, secs = (now - t0) / 1000, rate = doneB / Math.max(.2, secs);
  const B = $('#upB'); if (!B) return; B.style.width = Math.min(100, pct * 100) + '%';
  $('#upN').textContent = `${doneN} / ${total}${totalBytes ? ` · ${fmtB(doneB)} of ${fmtB(totalBytes)}` : ''}`;
  if (secs > 1.2 && rate > 0 && totalBytes) { const left = (totalBytes - doneB) / rate; $('#upS').textContent = `${fmtB(rate)}/s · ${left < 60 ? Math.max(1, Math.round(left)) + ' s' : Math.round(left / 60) + ' min'} left` }
  if (name) $('#upF').textContent = name;
 };
 return {
  get cancelled() { return cancelled },
  step(i, n) { doneN = i; paint(n) },
  progress(bytes, name) { doneB += bytes; doneN++; paint(name) },
  done(title, detail) { const X = $('#upX'); if (X) X.remove(); $('#upT').textContent = title; $('#upB').style.width = '100%'; $('#upS').textContent = `${((performance.now() - t0) / 1000).toFixed(1)} s`; $('#upF').textContent = detail; setTimeout(() => { if (!ingesting) el.innerHTML = '' }, 7000); el.onclick = e => { if (!e.target.closest('button')) el.innerHTML = '' } }
 };
}
/* "not enough space" — quantified */
function spaceBar(room, incoming) {
 const cap = Math.max(room.quota, room.usage + incoming), w = v => Math.max(.6, v / cap * 100);
 const over = Math.max(0, room.usage + incoming - room.quota);
 return `<div class="spbar" aria-hidden="true"><i class="u" style="width:${w(room.usage)}%"></i><i class="n" style="width:${w(Math.min(incoming, room.free))}%"></i>${over ? `<i class="o" style="width:${w(over)}%"></i>` : ''}</div>
  <div class="splegend small"><span><i class="u"></i>Used ${fmtB(room.usage)}</span><span><i class="n"></i>Free ${fmtB(room.free)}</span>${over ? `<span><i class="o"></i>Doesn’t fit ${fmtB(over)}</span>` : ''}</div>`;
}
function fitPlan(files, free) { let used = 0; const fit = []; for (const f of files) if (used + f.size <= free) { fit.push(f); used += f.size } return { fit, used } }
function spaceDialog(files, room, totalBytes) {
 const over = totalBytes - room.free, plan = fitPlan(files, room.free * .97), big = files.reduce((a, f) => f.size > a.size ? f : a, files[0]);
 return new Promise(res => {
  const m = modal(`<div class="mhead"><span class="ib" style="width:44px;height:44px;border-radius:12px;background:var(--rsoft);color:var(--red);display:grid;place-items:center">${ic('hdd', 22)}</span><h3>Not enough space on this device</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div>
   <div class="spnums"><div><b>${fmtB(totalBytes)}</b><span>You’re adding (${files.length} item${files.length > 1 ? 's' : ''})</span></div><div><b>${fmtB(room.free)}</b><span>Free for DESk here</span></div><div class="bad"><b>${fmtB(over)}</b><span>Too much — ${Math.round(over / totalBytes * 100)}% won’t fit</span></div></div>
   ${spaceBar(room, totalBytes)}
   ${big.size > room.free ? `<p class="small" style="color:var(--red);margin-top:10px">${ic('warn', 14, 'style="display:inline;vertical-align:-2px"')} The largest item, <b>${esc(big.name)}</b> (${fmtB(big.size)}), is bigger than all your free space by ${fmtB(big.size - room.free)}.</p>` : ''}
   <p class="small muted" style="margin:10px 0 14px">Your browser lets DESk use part of your device’s free space. Freeing space on the device (or in DESk) raises this limit. Duplicates you already have don’t take extra space.</p>
   <div style="display:grid;gap:8px">
    ${plan.fit.length ? `<button class="btn pri wrap" data-act="spPick" data-v="fit"><span><b>Add what fits — ${plan.fit.length} of ${files.length} items (${fmtB(plan.used)})</b><br><span class="small" style="opacity:.85">${files.length - plan.fit.length} item${files.length - plan.fit.length === 1 ? '' : 's'} (${fmtB(totalBytes - plan.used)}) will be left out</span></span></button>` : ''}
    ${typeof fsaOK === 'function' && (fsaOK() || DR.list.length) ? `<button class="btn wrap" data-act="spPick" data-v="drive">${ic('hdd', 18)}<span><b>Save them to an SD card or USB drive instead</b></span></button>` : ''}
    <button class="btn wrap" data-act="spPick" data-v="clean">${ic('broom', 18)}<span><b>Free up space in DESk first</b><br><span class="small muted">Duplicates, large and old files</span></span></button>
    <button class="btn wrap" data-act="spPick" data-v="all">${ic('upload', 18)}<span><b>Try adding everything anyway</b><br><span class="small muted">DESk stops cleanly when space runs out</span></span></button>
   </div>`, { cls: 'mid', onClose: () => res(m._v || 'cancel') });
  m._plan = plan;
 });
}
ACT.spPick = (d, el) => { const w = el.closest('.mwrap'); w._v = d.v; w.close() };
async function rawToDrive(files) {
 const d = await pickDrive('Save to which drive?'); if (!d || !await drivePerm(d)) return;
 const total = files.reduce((a, f) => a + f.size, 0), q = upPanel(files.length, total); let n = 0;
 for (const f of files) { if (q.cancelled) break; try { await writeFile(d.handle, 'DESk/Incoming/' + (f.webkitRelativePath || f.name), f); n++ } catch (e) { if (/NotFound|NotReadable/.test(e.name)) { toast(`${d.name} was disconnected`, 'err'); break } if (e.name === 'QuotaExceededError') { toast(`${d.name} is full`, 'err'); break } } q.progress(f.size, f.name) }
 q.done(`Saved ${n} item${n === 1 ? '' : 's'} to ${d.name}`, 'In the DESk/Incoming folder on the drive');
}
let ingesting = false;
async function ingest(list, opts = {}) {
 let files = [...list].filter(f => f && f.name !== '.DS_Store' && f.name !== 'Thumbs.db' && f.name !== 'desktop.ini');
 if (!files.length) return [];
 let totalBytes = files.reduce((a, f) => a + f.size, 0);
 const room = await storageRoom();
 if (room && totalBytes > room.free * .97) {
  const v = await spaceDialog(files, room, totalBytes);
  if (v === 'cancel') return [];
  if (v === 'clean') { go('clean'); toast(`Free up at least ${fmtB(totalBytes - room.free)} and try again`); return [] }
  if (v === 'drive') { rawToDrive(files); return [] }
  if (v === 'fit') { files = fitPlan(files, room.free * .97).fit; totalBytes = files.reduce((a, f) => a + f.size, 0) }
 }
 if (totalBytes > 200 * 1048576 && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
 ingesting = true;
 const q = upPanel(files.length, totalBytes); let dupes = 0, failed = 0, full = false; const added = [], cats = {}, leftOut = [];
 const known = new Map(), bySize = new Map();
 live().forEach(f => { if (f.hash) known.set(f.hash, f); if (!bySize.has(f.size)) bySize.set(f.size, []); bySize.get(f.size).push(f) });
 let next = 0, lastRender = 0;
 const isDupe = async (f, hash) => {
  if (known.has(hash)) return true;
  for (const o of bySize.get(f.size) || []) { if (hashScheme(o.hash) !== hashScheme(hash)) { const h2 = await hashLike(f, o.hash); if (h2 && h2 === o.hash) return true } }
  return false;
 };
 const worker = async () => {
  for (; ;) {
   if (full || q.cancelled) return;
   const i = next++; if (i >= files.length) return;
   const f = files[i];
   try {
    const hash = await hashBlob(f);
    if (setting('skipDupes') && !opts.force && await isDupe(f, hash)) { dupes++; q.progress(f.size, f.webkitRelativePath || f.name); continue }
    known.set(hash, true);
    const rec = await addFile(f, { name: f.name, hash, path: f.webkitRelativePath || '', modified: f.lastModified });
    if (!bySize.has(f.size)) bySize.set(f.size, []); bySize.get(f.size).push(rec);
    added.push(rec); cats[rec.cat] = (cats[rec.cat] || 0) + 1;
   } catch (e) {
    if (isQuota(e)) { full = true; leftOut.push(...files.slice(i)); break }
    console.error(e); failed++;
   }
   q.progress(f.size, f.webkitRelativePath || f.name);
   if (performance.now() - lastRender > 900) { lastRender = performance.now(); renderSoon() }
  }
 };
 await Promise.all(Array.from({ length: Math.min(4, files.length) }, worker));
 ingesting = false;
 if (q.cancelled && !full) leftOut.push(...files.slice(next));
 const parts = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`);
 const roomAfter = await storageRoom();
 q.done(full ? 'Storage filled up' : q.cancelled ? `Stopped — added ${added.length}` : added.length ? `Sorted ${added.length} item${added.length > 1 ? 's' : ''}` : 'Nothing new added',
  [parts.join(' · '), dupes ? `${dupes} duplicate${dupes > 1 ? 's' : ''} skipped` : '', failed ? `${failed} failed` : '', roomAfter ? `${fmtB(roomAfter.free)} free` : ''].filter(Boolean).join(' — '));
 render(); syncSoon(); if (typeof autoCopy === 'function') autoCopy();
 if (full) {
  const need = leftOut.reduce((a, f) => a + f.size, 0), r2 = roomAfter || { usage: 0, quota: 0, free: 0 };
  const trusty = roomAfter && roomAfter.free < need; // some browsers over-report free space; then the size left out is the honest figure
  const more = trusty ? need - r2.free : need;
  modal(`<div class="mhead"><span class="ib" style="width:44px;height:44px;border-radius:12px;background:var(--rsoft);color:var(--red);display:grid;place-items:center">${ic('hdd', 22)}</span><h3>Storage filled up</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div>
   <div class="spnums"><div><b>${added.length}</b><span>Added</span></div><div class="bad"><b>${leftOut.length}</b><span>Not added</span></div><div class="bad"><b>${fmtB(more)}</b><span>More space needed</span></div></div>
   ${trusty ? spaceBar(r2, need) : `<p class="small muted">This browser reported more free space than it allowed DESk to use.</p>`}
   <p class="small muted" style="margin:10px 0 14px">${leftOut.length} item${leftOut.length === 1 ? '' : 's'} (${fmtB(need)}) didn’t fit, starting with <b>${esc(leftOut[0].name)}</b>. Free up space, then add them again.</p>
   <div class="row end"><button class="btn" data-act="spClean">${ic('broom', 18)}Free up space</button><button class="btn pri" data-close>OK</button></div>`, { cls: 'mid' });
 }
 return added;
}
ACT.spClean = () => { topModal().close(); go('clean') };
async function filesFromDrop(dt) {
 const items = [...(dt.items || [])].filter(i => i.kind === 'file');
 const entries = items.map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
 if (!entries.some(e => e.isDirectory)) return [...dt.files];
 const out = [];
 async function walk(e, p) {
  if (e.isFile) { const f = await new Promise((r, j) => e.file(r, j)); try { Object.defineProperty(f, 'webkitRelativePath', { value: p + f.name }) } catch { } out.push(f) }
  else if (e.isDirectory) { const rd = e.createReader(); let batch; do { batch = await new Promise((r, j) => rd.readEntries(r, j)); for (const c of batch) await walk(c, p + e.name + '/') } while (batch.length) }
 }
 for (const e of entries) await walk(e, '');
 return out;
}

/* ================= FILE OPS ================= */
async function getBlob(rec, { wait = false } = {}) {
 let b = await dbGet('blobs', rec.id);
 if (b || !rec.offloaded || !wait || typeof requestContent !== 'function') return b || null;
 if (!await requestContent(rec)) return null;
 return new Promise(res => {
  const t = setTimeout(() => { document.removeEventListener('desk-content', on); res(null) }, 90000);
  const on = async e => { if (e.detail !== rec.id) return; clearTimeout(t); document.removeEventListener('desk-content', on); res(await dbGet('blobs', rec.id)) };
  document.addEventListener('desk-content', on);
 });
}
async function touch(rec, fields) { Object.assign(rec, fields, { mt: Date.now(), dirty: true }); await saveRec(rec); syncSoon() }
const whereIs = f => { const h = typeof holdersOf === 'function' ? holdersOf(f.id) : []; return h.length ? h.map(deviceLabel).join(', ') : 'another device' };
async function renameFile(id) {
 const f = byId(id); if (!f) return;
 const v = await ask('Rename', { input: 'File name', value: f.name, ok: 'Rename' });
 if (!v || v === f.name) return;
 const keepFolder = f.folder, c = classify(v, f.type, f.size, { modified: f.modified, scan: !!f.scanId });
 const tags = [...new Set([...f.tags, ...c.tags])];
 await touch(f, { name: v.trim(), tags, folder: f.userFolder ? keepFolder : c.folder }); render(); refreshPreview(id);
}
function allFolders() { const s = new Set(Object.keys(CATS)); live().forEach(f => { s.add(f.folder); s.add(f.folder.split('/')[0]) }); return [...s].sort() }
async function moveFiles(ids) {
 const opts = allFolders().map(f => `<option>${esc(f)}</option>`).join('');
 const m = modal(`<h3>Move ${ids.length} item${ids.length > 1 ? 's' : ''}</h3><form>
  <label class="fld"><span>Folder</span><select id="mvSel">${opts}</select></label>
  <label class="fld"><span>…or a new folder (use / for subfolders)</span><input id="mvNew" placeholder="e.g. Documents/Tax 2026"></label>
  <div class="row end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn pri">Move</button></div></form>`);
 const cur = byId(ids[0]); if (cur) m.querySelector('#mvSel').value = cur.folder;
 m.querySelector('form').onsubmit = async e => {
  e.preventDefault(); const dest = (m.querySelector('#mvNew').value.trim() || m.querySelector('#mvSel').value).replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/').slice(0, 80);
  if (!dest) return;
  for (const id of ids) { const f = byId(id); if (f) await touch(f, { folder: dest, userFolder: true }) }
  m.close(); toast(`Moved to ${dest}`); S.sel.clear(); render(); refreshPreview(ids[0]);
 };
}
async function tagFiles(ids) {
 const f0 = byId(ids[0]);
 const v = await ask(ids.length > 1 ? `Add tags to ${ids.length} items` : 'Edit tags', { input: 'Tags, separated by commas', value: ids.length > 1 ? '' : f0.tags.join(', '), ok: 'Save' });
 if (v === null) return;
 const list = v.split(',').map(t => t.trim().toLowerCase().slice(0, 30)).filter(Boolean);
 for (const id of ids) { const f = byId(id); if (f) await touch(f, { tags: ids.length > 1 ? [...new Set([...f.tags, ...list])] : [...new Set(list)] }) }
 render(); refreshPreview(ids[0]);
}
async function trashFiles(ids) {
 for (const id of ids) { const f = byId(id); if (f && !f.trashed) await touch(f, { trashed: Date.now() }) }
 S.sel.clear(); toast(`${ids.length} moved to Trash`); render(); syncSoon();
}
async function restoreFiles(ids) {
 for (const id of ids) { const f = byId(id); if (f) await touch(f, { trashed: 0 }) }
 S.sel.clear(); toast('Restored'); render();
}
async function purgeFiles(ids, silent) {
 for (const id of ids) {
  const f = byId(id); if (!f) continue;
  if (typeof tombstone === 'function') await tombstone(id);
  await dbDel('blobs', id); await dbDel('files', id);
  if (f.scanId && !S.files.some(x => x.id !== id && x.scanId === f.scanId)) { await dbDel('scans', f.scanId); S.scans = S.scans.filter(s => s.id !== f.scanId) }
  S.files = S.files.filter(x => x.id !== id);
 }
 S.sel.clear(); if (!silent) toast(`${ids.length} permanently deleted`); render();
}
async function downloadFiles(ids) {
 const recs = ids.map(byId).filter(Boolean);
 if (recs.length === 1) { if (recs[0].offloaded) toast('Getting it from ' + whereIs(recs[0]) + '…'); const b = await getBlob(recs[0], { wait: true }); if (!b) return toast('File isn’t on this device — open DESk on ' + whereIs(recs[0]) + ' to send it', 'err'); return saveBlob(b, recs[0].name) }
 toast(`Packing ${recs.length} files…`);
 const entries = [];
 for (const r of recs) { const b = await getBlob(r); if (!b) continue; entries.push({ name: r.folder.replace(/\//g, ' - ') + '/' + r.name, blob: b }) }
 if (!entries.length) return toast('Those files aren’t on this device yet', 'err');
 saveBlob(await makeZip(entries), `DESk-${new Date().toISOString().slice(0, 10)}.zip`);
}
async function toggleFav(id) { const f = byId(id); if (!f) return; await touch(f, { fav: !f.fav }); render(); refreshPreview(id) }

/* ================= FILES VIEW ================= */
function viewFiles() {
 let a;
 if (S.folder === 'Trash') a = S.files.filter(f => f.trashed);
 else {
  a = live();
  if (S.folder === 'Favorites') a = a.filter(f => f.fav);
  else if (S.folder === 'Recent') a = a.filter(f => Date.now() - Math.max(f.added, f.opened || 0) < 7 * 864e5);
  else if (S.folder === 'Shared') a = a.filter(f => f.share);
  else if (S.folder === 'Elsewhere') a = a.filter(f => f.offloaded);
  else if (S.folder !== 'All') a = a.filter(f => f.folder === S.folder || f.folder.startsWith(S.folder + '/'));
 }
 if (S.tag) a = a.filter(f => f.tags.includes(S.tag));
 if (S.q) { const ws = S.q.toLowerCase().split(/\s+/).filter(Boolean); a = a.filter(f => { const h = (f.name + ' ' + f.folder + ' ' + f.tags.join(' ') + ' ' + f.type).toLowerCase(); return ws.every(w => h.includes(w)) }) }
 const srt = { new: (x, y) => y.added - x.added, old: (x, y) => x.added - y.added, name: (x, y) => x.name.localeCompare(y.name, undefined, { numeric: true }), size: (x, y) => y.size - x.size, type: (x, y) => x.cat.localeCompare(y.cat) || x.name.localeCompare(y.name) }[S.sort];
 return a.slice().sort(srt);
}
function treeHTML() {
 const L = live(), counts = {};
 L.forEach(f => { const top = f.folder.split('/')[0]; counts[top] = (counts[top] || 0) + 1; if (f.folder.includes('/')) counts[f.folder] = (counts[f.folder] || 0) + 1 });
 const tops = Object.keys(counts).filter(k => !k.includes('/')).sort((a, b) => (Object.keys(CATS).indexOf(a) + 99 * !CATS[a]) - (Object.keys(CATS).indexOf(b) + 99 * !CATS[b]) || a.localeCompare(b));
 const btn = (key, label, icon, n, cls = '') => `<button class="${cls} ${S.folder === key ? 'on' : ''}" data-act="folder" data-f="${esc(key)}">${icon}<span>${esc(label)}</span>${n != null ? `<span class="n">${n}</span>` : ''}</button>`;
 let h = btn('All', 'All files', ic('folder', 18), L.length) + btn('Recent', 'Recent', ic('clock', 18)) + btn('Favorites', 'Favorites', ic('star', 18), L.filter(f => f.fav).length || null) + btn('Shared', 'Shared links', ic('link', 18), L.filter(f => f.share).length || null);
 if (L.some(f => f.offloaded)) h += btn('Elsewhere', 'On other devices', ic('devices', 18), L.filter(f => f.offloaded).length);
 h += `<div class="lbl">Sorted folders</div>`;
 for (const t of tops) {
  const c = CATS[t] || { ic: 'folder', c: '#5a6479' };
  h += btn(t, t, `<span style="color:${S.folder === t ? 'inherit' : c.c}">${ic(c.ic, 18)}</span>`, counts[t]);
  const subs = Object.keys(counts).filter(k => k.startsWith(t + '/')).sort();
  if (S.folder === t || S.folder.startsWith(t + '/')) subs.forEach(s => h += btn(s, s.slice(t.length + 1), ic('chev', 14), counts[s], 'sub on-parent'));
  else subs.forEach(s => h += btn(s, s.slice(t.length + 1), ic('chev', 14), counts[s], 'sub'));
 }
 const tr = S.files.filter(f => f.trashed).length;
 h += `<div class="lbl">Bin</div>` + btn('Trash', 'Trash', ic('trash', 18), tr || null);
 return h;
}
function cardHTML(f) {
 const sel = S.sel.has(f.id);
 const flags = [f.fav ? ic('star', 14) : '', f.share ? ic('link', 14) : '', f.offloaded ? ic('clouddown', 14) : ''].filter(Boolean).map(x => `<span>${x}</span>`).join('');
 if (S.layout === 'list') return `<div class="fl ${sel ? 'sel' : ''}" data-act="card" data-id="${f.id}" role="button" tabindex="0">
  <span class="ckw"><input type="checkbox" class="ck" data-act="ck" data-id="${f.id}" ${sel ? 'checked' : ''} aria-label="Select"></span>
  <span class="th">${thumbHTML(f, 22)}</span>
  <span><div class="nm">${esc(f.name)}</div><div class="small muted">${esc(f.folder)}</div></span>
  <span class="r d">${fmtD(f.added)}</span><span class="r">${fmtB(f.size)}</span></div>`;
 return `<div class="fc ${sel ? 'sel' : ''}" data-act="card" data-id="${f.id}" role="button" tabindex="0">
  <div class="th">${thumbHTML(f, 40)}${extOf(f.name) ? `<span class="ext">${esc(extOf(f.name))}</span>` : ''}</div>
  <span class="ckw"><input type="checkbox" class="ck" data-act="ck" data-id="${f.id}" ${sel ? 'checked' : ''} aria-label="Select"></span>
  ${flags ? `<div class="flags">${flags}</div>` : ''}
  <div class="meta"><div class="nm" title="${esc(f.name)}">${esc(f.name)}</div><div class="sub">${fmtB(f.size)} · ${esc(S.folder === 'All' || !f.folder.includes('/') ? f.folder.split('/')[0] : f.folder.split('/').slice(1).join('/'))}</div></div></div>`;
}
VIEWS.files = () => {
 const list = viewFiles(), trash = S.folder === 'Trash';
 const tagCount = {}; list.forEach(f => f.tags.forEach(t => tagCount[t] = (tagCount[t] || 0) + 1));
 const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 16);
 if (S.tag && !tags.some(t => t[0] === S.tag)) tags.unshift([S.tag, 0]);
 const n = S.sel.size;
 const bulk = n ? `<div class="bulk"><b>${n} selected</b><span class="grow"></span>
   ${trash ? `<button class="btn sm" data-act="bRestore">${ic('restore', 18)}Restore</button><button class="btn sm" data-act="bPurge">${ic('trash', 18)}Delete forever</button>` :
   `<button class="btn sm" data-act="bDl">${ic('download', 18)}<span class="hide-s">Download</span></button><button class="btn sm" data-act="bMove">${ic('move', 18)}Move</button><button class="btn sm" data-act="bTag">${ic('tag', 18)}Tag</button><button class="btn sm" data-act="bDrive">${ic('hdd', 18)}Save to drive</button><button class="btn sm" data-act="bHide">${ic('lock', 18)}Hide</button><button class="btn sm" data-act="bTrash">${ic('trash', 18)}Delete</button>`}
   <button class="btn sm icon" data-act="bClear" aria-label="Clear selection">${ic('x', 18)}</button></div>` : '';
 const title = { All: 'All files', Trash: 'Trash', Favorites: 'Favorites', Recent: 'Recent', Shared: 'Shared links', Elsewhere: 'On other devices' }[S.folder] || S.folder.replace(/\//g, ' › ');
 return `<div class="fwrap"><nav class="tree" aria-label="Folders">${treeHTML()}</nav><section>
  ${trash ? `<div class="card" style="margin-bottom:14px"><div class="row between"><span class="muted">Items in Trash are removed after ${setting('autoEmptyDays')} days.</span>${list.length ? `<button class="btn sm danger" data-act="emptyTrash">Empty Trash</button>` : ''}</div></div>` :
   `<div class="drop"><span class="ib">${ic('upload', 24)}</span><div class="grow"><b>Drop files or whole folders here</b><div class="small muted">DESk hashes, sorts and tags every item automatically. Duplicates are skipped.</div></div>
   <div class="row"><button class="btn pri" data-act="upFiles">${ic('upload', 18)}Upload files</button><button class="btn" data-act="upDir">${ic('folder', 18)}Upload folder</button></div></div>`}
  <div class="tool"><h2 class="grow">${esc(title)} <span class="muted" style="font-weight:600;font-size:15px">${list.length}</span></h2>
   <select data-in="sort" aria-label="Sort">${[['new', 'Newest'], ['old', 'Oldest'], ['name', 'Name'], ['size', 'Largest'], ['type', 'Type']].map(([k, l]) => `<option value="${k}" ${S.sort === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
   <button class="btn sm ${S.selMode ? 'soft' : ''}" data-act="selMode">${ic('check', 18)}Select</button>
   <button class="btn sm icon" data-act="layout" aria-label="Toggle layout">${ic(S.layout === 'grid' ? 'list' : 'grid', 18)}</button></div>
  ${tags.length ? `<div class="chips" style="margin-bottom:12px">${tags.map(([t, c]) => `<button class="chip ${S.tag === t ? 'on' : ''}" data-act="tagf" data-t="${esc(t)}">#${esc(t)}${c ? ` <span style="opacity:.6">${c}</span>` : ''}</button>`).join('')}</div>` : ''}
  ${bulk}
  ${list.length ? `<div class="${S.layout === 'grid' ? 'fgrid' : 'flist'} ${S.selMode ? 'selmode' : ''}">${list.slice(0, S.limit || 300).map(cardHTML).join('')}</div>${list.length > (S.limit || 300) ? `<div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-act="more">Show more (${list.length - (S.limit || 300)})</button></div>` : ''}`
   : `<div class="empty">${ic(trash ? 'trash' : S.q ? 'search' : 'folder', 44)}<h3>${trash ? 'Trash is empty' : S.q ? 'No matches' : 'Nothing here yet'}</h3><p>${trash ? 'Deleted items wait here before they’re removed for good.' : S.q ? 'Try another word, tag or file type.' : 'Upload or scan something and DESk will file it in the right place.'}</p></div>`}
 </section></div>`;
};
Object.assign(ACT, {
 folder: d => { S.folder = d.f; S.tag = null; S.sel.clear(); S.limit = 0; go('files') },
 tagf: d => { S.tag = S.tag === d.t ? null : d.t; render() },
 card: (d, el, e) => { if (e.target.closest('[data-act=ck]')) return; if (S.selMode) { S.sel.has(d.id) ? S.sel.delete(d.id) : S.sel.add(d.id); render() } else openFile(d.id) },
 ck: (d, el, e) => { e.stopPropagation(); el.checked ? S.sel.add(d.id) : S.sel.delete(d.id); S.selMode = true; render() },
 selMode: () => { S.selMode = !S.selMode; if (!S.selMode) S.sel.clear(); render() },
 layout: () => { S.layout = S.layout === 'grid' ? 'list' : 'grid'; kvSet('layout', S.layout); render() },
 more: () => { S.limit = (S.limit || 300) + 300; render() },
 upFiles: () => $('#fileIn').click(), upDir: () => $('#dirIn').click(),
 bClear: () => { S.sel.clear(); S.selMode = false; render() },
 bDl: () => downloadFiles([...S.sel]), bMove: () => moveFiles([...S.sel]), bTag: () => tagFiles([...S.sel]),
 bTrash: () => trashFiles([...S.sel]), bRestore: () => restoreFiles([...S.sel]),
 bHide: () => hideFiles([...S.sel]),
 bPurge: async () => { if (await ask('Delete forever?', { body: `${S.sel.size} item(s) will be removed from this device and your linked devices.`, ok: 'Delete', danger: true })) purgeFiles([...S.sel]) },
 emptyTrash: async () => { const ids = S.files.filter(f => f.trashed).map(f => f.id); if (await ask('Empty Trash?', { body: `${ids.length} item(s) will be permanently deleted.`, ok: 'Empty Trash', danger: true })) purgeFiles(ids) }
});

/* ================= PREVIEW ================= */
let pvState = null;
const TEXTY = /^(text\/|application\/(json|xml|javascript))/;
async function openFile(id) {
 const f = byId(id); if (!f) return;
 f.opened = Date.now(); saveRec(f);
 const urls = [];
 const m = modal(`<div class="mhead"><h3>${esc(f.name)}</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><div class="pv"><div class="pvm" id="pvm"><span class="muted">Loading…</span></div><aside id="pvi"></aside></div>`, { cls: 'wide', onClose: () => { urls.forEach(u => URL.revokeObjectURL(u)); pvState = null } });
 pvState = { id, m };
 refreshPreview(id);
 const box = m.querySelector('#pvm');
 if (f.offloaded) box.innerHTML = `<div class="empty">${ic('clouddown', 40)}<h3>Getting it from ${esc(whereIs(f))}…</h3><p>Keep DESk open on that device for a moment. Files arrive encrypted through your sync relay.</p></div>`;
 const blob = await getBlob(f, { wait: true });
 if (!pvState || pvState.id !== id) return;
 if (!blob) { box.innerHTML = `<div class="empty">${ic('devices', 40)}<h3>Not on this device yet</h3><p>${f.size > (typeof RELAY_MAX === 'function' ? RELAY_MAX() : 1e9) ? 'This file is too big to send through the sync relay. Download it on ' + esc(whereIs(f)) + ' and share it directly.' : 'Open DESk on ' + esc(whereIs(f)) + ' and it will be sent here automatically.'}</p></div>`; return }
 const u = URL.createObjectURL(blob); urls.push(u);
 const t = f.type || '';
 if (f.scanId) {
  const sc = S.scans.find(s => s.id === f.scanId) || await dbGet('scans', f.scanId);
  if (sc && sc.pages) { box.innerHTML = '<div class="pages"></div>'; const pg = box.firstChild; sc.pages.forEach(p => { if (p.out) { const pu = URL.createObjectURL(p.out); urls.push(pu); const im = new Image(); im.src = pu; im.alt = 'Scanned page'; pg.appendChild(im) } }); return }
 }
 if (t.startsWith('image/')) { box.innerHTML = ''; const im = new Image(); im.alt = f.name; im.src = u; im.onerror = () => box.innerHTML = `<div class="empty">${ic('image', 40)}<h3>This image format can’t be shown here</h3><p>Download it to open it in another app.</p></div>`; box.appendChild(im) }
 else if (t.startsWith('video/')) { box.innerHTML = ''; const v = document.createElement('video'); v.controls = true; v.playsInline = true; v.src = u; box.appendChild(v) }
 else if (t.startsWith('audio/')) { box.innerHTML = `<div style="padding:30px;width:100%;text-align:center"><span style="color:${CATS.Audio.c}">${ic('music', 56)}</span><p class="b" style="margin:12px 0"></p></div>`; box.querySelector('p').textContent = f.name; const a = document.createElement('audio'); a.controls = true; a.src = u; a.style.width = '100%'; box.firstChild.appendChild(a) }
 else if (t === 'application/pdf') { box.innerHTML = ''; const fr = document.createElement('iframe'); fr.src = u; fr.title = f.name; box.appendChild(fr); const n = document.createElement('p'); n.className = 'small muted'; n.style.padding = '8px'; n.textContent = 'If the PDF doesn’t appear, use Download to open it in your PDF app.'; box.parentNode.insertBefore(n, box.nextSibling) }
 else if ((TEXTY.test(t) || EXTMAP[extOf(f.name)] === 'Code' || ['md', 'txt', 'csv', 'log', 'tsv'].includes(extOf(f.name))) && blob.size < 3e6) { const txt = await blob.text(); box.innerHTML = '<pre></pre>'; box.firstChild.textContent = txt }
 else { const c = CATS[f.cat] || CATS.Other; box.innerHTML = `<div class="empty"><span style="color:${c.c}">${ic(c.ic, 56)}</span><h3>No preview for .${esc(extOf(f.name) || 'file')}</h3><p>Download it to open in the right app.</p><button class="btn pri" data-act="pvDl" style="margin-top:14px">${ic('download', 18)}Download</button></div>` }
}
function refreshPreview(id) {
 if (!pvState || pvState.id !== id) return;
 const f = byId(id), el = pvState.m.querySelector('#pvi'); if (!f || !el) return;
 pvState.m.querySelector('.mhead h3').textContent = f.name;
 const dev = !f.device || f.device === S.deviceId ? 'This device' : deviceLabel(f.device);
 el.innerHTML = `<div class="row" style="margin-bottom:14px">
   <button class="btn sm" data-act="pvDl">${ic('download', 18)}Download</button><button class="btn sm pri" data-act="pvShare">${ic('share', 18)}Share</button></div>
  <div class="row" style="margin-bottom:16px;gap:6px">
   <button class="btn sm icon ${f.fav ? 'soft' : ''}" data-act="pvFav" aria-label="Favorite" title="Favorite">${ic('star', 18)}</button>
   <button class="btn sm icon" data-act="pvRen" aria-label="Rename" title="Rename">${ic('edit', 18)}</button>
   <button class="btn sm icon" data-act="pvMove" aria-label="Move" title="Move">${ic('move', 18)}</button>
   <button class="btn sm icon" data-act="pvTag" aria-label="Edit tags" title="Edit tags">${ic('tag', 18)}</button>
   <button class="btn sm icon" data-act="pvDrive" aria-label="Save to SD card or USB drive" title="Save to SD card / USB drive">${ic('hdd', 18)}</button>
   <button class="btn sm icon" data-act="pvHide" aria-label="Move to Hidden" title="Move to Hidden">${ic('lock', 18)}</button>
   ${f.scanId ? `<button class="btn sm icon" data-act="pvEditScan" aria-label="Edit scan" title="Edit scan">${ic('crop', 18)}</button>` : ''}
   <button class="btn sm icon" data-act="pvDel" aria-label="Delete" title="Delete">${ic('trash', 18)}</button></div>
  <dl class="kv"><dt>Folder</dt><dd>${esc(f.folder)}</dd><dt>Type</dt><dd>${esc(f.cat)} · .${esc(extOf(f.name) || '—')}</dd><dt>Size</dt><dd>${fmtB(f.size)}</dd>
   <dt>Added</dt><dd>${fmtDT(f.added)}</dd><dt>Modified</dt><dd>${fmtD(f.modified)}</dd><dt>From</dt><dd>${esc(dev)}</dd>
   <dt>Stored</dt><dd>${f.offloaded ? 'On ' + esc(whereIs(f)) : linked() ? (f.size > RELAY_MAX() ? 'Here (too big to sync)' : 'Here · synced') : 'This device'}</dd>
   <dt>Fingerprint</dt><dd class="mono small">${esc((f.hash || '').slice(0, 12))}</dd></dl>
  <hr><div class="small b muted" style="margin-bottom:8px">Tags</div><div class="tagl">${f.tags.map(t => `<button class="chip" data-act="pvTagGo" data-t="${esc(t)}">#${esc(t)}</button>`).join('') || '<span class="muted small">No tags</span>'}</div>`;
}
Object.assign(ACT, {
 pvDl: () => pvState && downloadFiles([pvState.id]),
 pvShare: () => pvState && openShare(pvState.id),
 pvFav: () => pvState && toggleFav(pvState.id),
 pvRen: () => pvState && renameFile(pvState.id),
 pvMove: () => pvState && moveFiles([pvState.id]),
 pvTag: () => pvState && tagFiles([pvState.id]),
 pvHide: () => { if (!pvState) return; const id = pvState.id; pvState.m.close(); hideFiles([id]) },
 pvEditScan: () => { if (!pvState) return; const f = byId(pvState.id); pvState.m.close(); editScan(f.scanId) },
 pvDel: () => { if (!pvState) return; const id = pvState.id, f = byId(id); pvState.m.close(); f && f.trashed ? purgeFiles([id]) : trashFiles([id]) },
 pvTagGo: d => { if (pvState) pvState.m.close(); S.folder = 'All'; S.tag = d.t; go('files') }
});

/* ================= DOCUMENT SCANNER ================= */
/* --- image analysis: find the page --- */
function boxBlur(src, w, h, r) {
 const tmp = new Float32Array(w * h), out = new Float32Array(w * h), d = 2 * r + 1;
 for (let y = 0; y < h; y++) { const o = y * w; let acc = 0; for (let x = -r; x <= r; x++) acc += src[o + clamp(x, 0, w - 1)]; for (let x = 0; x < w; x++) { tmp[o + x] = acc / d; acc += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)] } }
 for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { out[y * w + x] = acc / d; acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x] } }
 return out;
}
function otsu(a) {
 const hist = new Float64Array(256); for (let i = 0; i < a.length; i++) hist[clamp(a[i] | 0, 0, 255)]++;
 const N = a.length; let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
 let sB = 0, wB = 0, best = 0, t = 128;
 for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += i * hist[i]; const v = wB * wF * ((sB / wB) - ((sum - sB) / wF)) ** 2; if (v > best) { best = v; t = i } }
 return t;
}
function largestBlob(mask, w, h) {
 const lab = new Int32Array(w * h), stack = new Int32Array(w * h); let best = null, cur = 0;
 for (let i = 0; i < w * h; i++) {
  if (!mask[i] || lab[i]) continue;
  cur++; let sp = 0; stack[sp++] = i; lab[i] = cur; let cnt = 0, touch = 0; const pts = [];
  while (sp) {
   const p = stack[--sp]; cnt++; const x = p % w, y = (p / w) | 0; let edge = false;
   if (x === 0 || y === 0 || x === w - 1 || y === h - 1) { edge = true; touch++ }
   if (x > 0) { const q = p - 1; if (mask[q]) { if (!lab[q]) { lab[q] = cur; stack[sp++] = q } } else edge = true }
   if (x < w - 1) { const q = p + 1; if (mask[q]) { if (!lab[q]) { lab[q] = cur; stack[sp++] = q } } else edge = true }
   if (y > 0) { const q = p - w; if (mask[q]) { if (!lab[q]) { lab[q] = cur; stack[sp++] = q } } else edge = true }
   if (y < h - 1) { const q = p + w; if (mask[q]) { if (!lab[q]) { lab[q] = cur; stack[sp++] = q } } else edge = true }
   if (edge) pts.push([x, y]);
  }
  if (!best || cnt > best.count) best = { count: cnt, pts, touch };
 }
 return best;
}
function hull(P) {
 P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
 if (P.length < 3) return P;
 const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
 const lo = [], up = [];
 for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p) }
 for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p) }
 return lo.slice(0, -1).concat(up.slice(0, -1));
}
const qArea = q => { let a = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4]; a += p[0] * n[1] - n[0] * p[1] } return Math.abs(a) / 2 };
function isConvex(q) { let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4]; const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (Math.abs(z) < 1e-6) return false; const sg = Math.sign(z); if (!s) s = sg; else if (sg !== s) return false } return true }
function orderQuad(q) {
 const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
 const s = q.slice().sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
 let k = 0; s.forEach((p, i) => { if (p[0] + p[1] < s[k][0] + s[k][1]) k = i });
 return [...s.slice(k), ...s.slice(0, k)];
}
function quadFromHull(H) {
 if (H.length < 4) return null;
 const id = [0, 0, 0, 0];
 H.forEach((p, i) => { const s = p[0] + p[1], d = p[0] - p[1]; if (s < H[id[0]][0] + H[id[0]][1]) id[0] = i; if (d > H[id[1]][0] - H[id[1]][1]) id[1] = i; if (s > H[id[2]][0] + H[id[2]][1]) id[2] = i; if (d < H[id[3]][0] - H[id[3]][1]) id[3] = i });
 let q = id.map(i => H[i]);
 if (new Set(id).size < 4) return null;
 const step = Math.max(1, Math.floor(H.length / 160));
 for (let it = 0; it < 3; it++) for (let c = 0; c < 4; c++) {
  let bestA = qArea(q), bp = q[c];
  for (let j = 0; j < H.length; j += step) { const t = q.slice(); t[c] = H[j]; if (!isConvex(t)) continue; const a = qArea(t); if (a > bestA) { bestA = a; bp = H[j] } }
  q[c] = bp;
 }
 return isConvex(q) ? orderQuad(q) : null;
}
const _dc = document.createElement('canvas');
function detectQuad(src, sw, sh) {
 const M = 300, s = Math.min(1, M / Math.max(sw, sh)), w = Math.max(16, Math.round(sw * s)), h = Math.max(16, Math.round(sh * s));
 _dc.width = w; _dc.height = h;
 const x = _dc.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0, w, h);
 const d = x.getImageData(0, 0, w, h).data, N = w * h, wh = new Float32Array(N), gr = new Float32Array(N);
 for (let i = 0; i < N; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; const l = r * .299 + g * .587 + b * .114; gr[i] = l; wh[i] = l - (Math.max(r, g, b) - Math.min(r, g, b)) * .6 }
 let best = null;
 for (const [map, inv] of [[boxBlur(wh, w, h, 2), false], [boxBlur(gr, w, h, 2), true]]) {
  const t = otsu(map), mask = new Uint8Array(N);
  for (let i = 0; i < N; i++) mask[i] = inv ? (map[i] < t ? 1 : 0) : (map[i] > t ? 1 : 0);
  const blob = largestBlob(mask, w, h);
  if (!blob || blob.count < N * .1 || blob.count > N * .985) continue;
  const q = quadFromHull(hull(blob.pts)); if (!q) continue;
  const A = qArea(q), fill = blob.count / Math.max(1, A);
  if (A < N * .1 || fill < .8) continue;
  const score = fill * (blob.touch > blob.pts.length * .3 ? .55 : 1) * (inv ? .9 : 1) * Math.sqrt(A / N);
  if (!best || score > best.score) best = { q, score };
 }
 if (!best) return null;
 const cx = best.q.reduce((a, p) => a + p[0], 0) / 4, cy = best.q.reduce((a, p) => a + p[1], 0) / 4;
 return best.q.map(p => [(p[0] + (cx - p[0]) * .012) / s, (p[1] + (cy - p[1]) * .012) / s]);
}
/* --- perspective correction --- */
function solve8(A, b) {
 const n = 8;
 for (let i = 0; i < n; i++) {
  let mx = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[mx][i])) mx = r;
  [A[i], A[mx]] = [A[mx], A[i]];[b[i], b[mx]] = [b[mx], b[i]];
  const p = A[i][i] || 1e-12;
  for (let r = i + 1; r < n; r++) { const f = A[r][i] / p; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i] }
 }
 const x = new Array(n);
 for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / (A[i][i] || 1e-12) }
 return x;
}
function homog(from, to) { const A = [], b = []; for (let i = 0; i < 4; i++) { const [x, y] = from[i], [u, v] = to[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v) } return solve8(A, b) }
function warpQuad(src, quad, maxSide = 2400) {
 const [tl, tr, br, bl] = quad, dst = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
 let W = Math.max(dst(tl, tr), dst(bl, br)), H = Math.max(dst(tl, bl), dst(tr, br));
 const s = Math.min(1, maxSide / Math.max(W, H)); W = Math.max(10, Math.round(W * s)); H = Math.max(10, Math.round(H * s));
 const h = homog([[0, 0], [W, 0], [W, H], [0, H]], quad);
 const sw = src.width, sh = src.height, sd = src.getContext('2d').getImageData(0, 0, sw, sh).data;
 const out = new ImageData(W, H), od = out.data;
 for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const den = h[6] * x + h[7] * y + 1;
  const u = clamp((h[0] * x + h[1] * y + h[2]) / den, 0, sw - 1.001), v = clamp((h[3] * x + h[4] * y + h[5]) / den, 0, sh - 1.001);
  const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4, o = (y * W + x) * 4;
  for (let c = 0; c < 3; c++) od[o + c] = (sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx) * (1 - fy) + (sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx) * fy;
  od[o + 3] = 255;
 }
 const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').putImageData(out, 0, 0); return c;
}
/* --- clean-up filters --- */
const FILTERS = [['auto', 'Auto'], ['original', 'Original'], ['gray', 'Grayscale'], ['bw', 'Black & white'], ['photo', 'Photo']];
function applyFilter(cv, f) {
 if (f === 'original') return cv;
 const W = cv.width, H = cv.height, ctx = cv.getContext('2d'), img = ctx.getImageData(0, 0, W, H), d = img.data;
 if (f === 'photo') {
  for (let o = 0; o < d.length; o += 4) { const l = d[o] * .299 + d[o + 1] * .587 + d[o + 2] * .114; for (let c = 0; c < 3; c++) { let v = l + (d[o + c] - l) * 1.18; v = (v - 128) * 1.1 + 132; d[o + c] = clamp(v, 0, 255) } }
 } else {
  const bw = Math.max(8, Math.round(W / 20)), bh = Math.max(8, Math.round(H / 20));
  const sc = document.createElement('canvas'); sc.width = bw; sc.height = bh; const sx = sc.getContext('2d'); sx.drawImage(cv, 0, 0, bw, bh);
  const sd = sx.getImageData(0, 0, bw, bh); let L = new Float32Array(bw * bh);
  for (let i = 0; i < L.length; i++) L[i] = sd.data[i * 4] * .299 + sd.data[i * 4 + 1] * .587 + sd.data[i * 4 + 2] * .114;
  for (let pass = 0; pass < 2; pass++) { const M = new Float32Array(L.length); for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { let m = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = clamp(y + dy, 0, bh - 1), xx = clamp(x + dx, 0, bw - 1); m = Math.max(m, L[yy * bw + xx]) } M[y * bw + x] = m } L = M }
  for (let i = 0; i < L.length; i++) { sd.data[i * 4] = sd.data[i * 4 + 1] = sd.data[i * 4 + 2] = L[i] }
  sx.putImageData(sd, 0, 0);
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H; const bx = bg.getContext('2d'); bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = 'high'; bx.drawImage(sc, 0, 0, W, H);
  const bd = bx.getImageData(0, 0, W, H).data;
  for (let o = 0; o < d.length; o += 4) {
   const b = Math.max(bd[o], 50), k = 255 / b;
   if (f === 'auto') { for (let c = 0; c < 3; c++) d[o + c] = clamp((d[o + c] * k - 28) * 1.17, 0, 255) }
   else {
    const l = (d[o] * .299 + d[o + 1] * .587 + d[o + 2] * .114) * k;
    const v = f === 'gray' ? clamp((l - 24) * 1.16, 0, 255) : (l < 178 ? 0 : l > 214 ? 255 : (l - 178) / 36 * 255);
    d[o] = d[o + 1] = d[o + 2] = v;
   }
  }
 }
 ctx.putImageData(img, 0, 0); return cv;
}
function rotateCanvas(cv, rot) {
 rot = ((rot % 4) + 4) % 4; if (!rot) return cv;
 const c = document.createElement('canvas'); c.width = rot % 2 ? cv.height : cv.width; c.height = rot % 2 ? cv.width : cv.height;
 const x = c.getContext('2d'); x.translate(c.width / 2, c.height / 2); x.rotate(rot * Math.PI / 2); x.drawImage(cv, -cv.width / 2, -cv.height / 2); return c;
}
const toBlob = (cv, type = 'image/jpeg', q = .88) => new Promise(r => cv.toBlob(r, type, q));
async function srcCanvas(page) {
 if (page._src) return page._src;
 const im = await loadImg(page.src); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0);
 return page._src = c;
}
async function processPage(p) {
 const src = await srcCanvas(p);
 let cv = warpQuad(src, p.quad); cv = applyFilter(cv, p.filter); cv = rotateCanvas(cv, p.rot);
 p.out = await toBlob(cv); p.w = cv.width; p.h = cv.height; p.thumb = drawThumb(cv, cv.width, cv.height, 260);
 return p;
}
async function pageFromCanvas(cv) {
 const MAX = 3000; let c = cv;
 if (Math.max(cv.width, cv.height) > MAX) { const s = MAX / Math.max(cv.width, cv.height); c = document.createElement('canvas'); c.width = Math.round(cv.width * s); c.height = Math.round(cv.height * s); c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height) }
 const q = detectQuad(c, c.width, c.height);
 const full = [[0, 0], [c.width, 0], [c.width, c.height], [0, c.height]];
 const p = { id: uid(8), src: await toBlob(c, 'image/jpeg', .92), quad: q || full, detected: !!q, filter: 'auto', rot: 0, _src: c };
 await processPage(p); return p;
}
async function pageFromFile(file) {
 const im = await loadImg(file); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0);
 return pageFromCanvas(c);
}
function guessKind(p) {
 const r = p.h / p.w;
 if (r > 2.05) return 'Receipts';
 if (r < 1 && 1 / r > 1.42 && 1 / r < 1.78 && p.w < 1800) return 'IDs & Cards';
 if (r < .9) return 'Whiteboards';
 return 'Documents';
}
const KINDS = ['Documents', 'Receipts', 'IDs & Cards', 'Whiteboards', 'Books', 'Forms', 'Notes'];
const defaultScanName = k => `${k === 'Receipts' ? 'Receipt' : k === 'IDs & Cards' ? 'ID card' : k === 'Whiteboards' ? 'Whiteboard' : 'Scan'} ${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} ${new Date().toTimeString().slice(0, 5).replace(':', '.')}`;

/* --- scanner session UI --- */
let SC = null;
function openScanner(opts = {}) {
 if (SC && SC.m) return;
 SC = Object.assign({ pages: [], cur: 0, auto: true, stream: null, timer: 0, smooth: null, stable: 0, cool: 0, editingId: null, name: '', nameTouched: false, kind: null, fmt: 'pdf' }, opts, { m: null });
 const m = modal('<div id="scBody" class="dark" style="display:flex;flex-direction:column;height:100%"></div>', { cls: 'full', onClose: stopCamera });
 SC.m = m;
 if (opts.review) return showReview();
 showCapture();
}
function stopCamera() {
 if (!SC) return;
 clearTimeout(SC.timer); SC.timer = 0;
 if (SC.stream) { SC.stream.getTracks().forEach(t => t.stop()); SC.stream = null }
}
function closeScanner() { if (!SC) return; const m = SC.m; stopCamera(); SC = null; m && m.close() }
async function showCapture() {
 const b = $('#scBody', SC.m);
 b.innerHTML = `<div class="scbar topb"><button class="btn icon" data-act="scClose" aria-label="Close scanner">${ic('x')}</button><b>Scan document</b>
   <button class="chip ${SC.auto ? 'on' : ''}" data-act="scAuto">${ic('bolt', 16)}Auto capture</button></div>
  <div class="scn" id="scn"><div class="scmsg" id="scMsg">Starting camera…</div><div class="flash" id="scFlash"></div></div>
  <div class="scbar"><button class="btn" data-act="scImport">${ic('image', 18)}<span>Import</span></button>
   <button class="shutter" data-act="scShoot" aria-label="Capture page"></button>
   <button class="btn ${SC.pages.length ? 'pri' : ''}" data-act="scReview" ${SC.pages.length ? '' : 'disabled'}>${SC.pages.length ? `<span class="strip"><img src="${SC.pages[SC.pages.length - 1].thumb}" alt=""></span>` : ''}Done${SC.pages.length ? ` (${SC.pages.length})` : ''}</button></div>`;
 const box = $('#scn', SC.m);
 let stream = null;
 try {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no camera api');
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1440 } }, audio: false });
 } catch (e) { return noCamera(box) }
 if (!SC) { stream.getTracks().forEach(t => t.stop()); return }
 SC.stream = stream;
 const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.autoplay = true; v.srcObject = stream;
 const ov = document.createElement('canvas'); ov.className = 'ov';
 box.prepend(v, ov);
 try { await v.play() } catch { }
 SC.video = v; SC.ov = ov; loop();
}
function noCamera(box) {
 $('#scMsg', SC.m)?.remove();
 box.innerHTML = `<div class="nocam"><span class="ib">${ic('camera', 36)}</span><h2>Take a photo of your document</h2>
  <p style="color:#aab4cc">The live camera isn’t available in this view, so DESk will use your device camera app. Lay the page on a darker surface — DESk finds the edges, straightens and cleans it automatically.</p>
  <div class="row" style="justify-content:center"><button class="btn pri" data-act="scCamIn">${ic('camera', 18)}Take photo</button><button class="btn" data-act="scImport">${ic('image', 18)}Choose images</button></div>
  ${SC.pages.length ? `<button class="btn" data-act="scReview">Review ${SC.pages.length} page${SC.pages.length > 1 ? 's' : ''}</button>` : ''}</div><div class="flash" id="scFlash"></div>`;
 SC.nocam = true;
}
function loop() {
 if (!SC || !SC.video) return;
 const v = SC.video, ov = SC.ov;
 if (v.videoWidth) {
  const vw = v.videoWidth, vh = v.videoHeight;
  const q = detectQuad(v, vw, vh);
  const dpr = devicePixelRatio || 1, cw = ov.clientWidth, ch = ov.clientHeight;
  if (ov.width !== Math.round(cw * dpr)) { ov.width = Math.round(cw * dpr); ov.height = Math.round(ch * dpr) }
  const x = ov.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, cw, ch);
  const sc = Math.min(cw / vw, ch / vh), ox = (cw - vw * sc) / 2, oy = (ch - vh * sc) / 2;
  const msg = $('#scMsg', SC.m); const now = performance.now();
  if (q) {
   let move = 1;
   if (SC.smooth) { move = Math.max(...q.map((p, i) => Math.hypot(p[0] - SC.smooth[i][0], p[1] - SC.smooth[i][1]))) / Math.max(vw, vh); SC.smooth = SC.smooth.map((p, i) => [p[0] * .45 + q[i][0] * .55, p[1] * .45 + q[i][1] * .55]) }
   else SC.smooth = q;
   if (move < .02) { if (!SC.stable) SC.stable = now } else SC.stable = 0;
   const held = SC.stable ? (now - SC.stable) / 1300 : 0;
   x.beginPath(); SC.smooth.forEach((p, i) => { const X = ox + p[0] * sc, Y = oy + p[1] * sc; i ? x.lineTo(X, Y) : x.moveTo(X, Y) }); x.closePath();
   x.fillStyle = 'rgba(26,92,255,.22)'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#4d82ff'; x.stroke();
   SC.smooth.forEach(p => { x.beginPath(); x.arc(ox + p[0] * sc, oy + p[1] * sc, 7, 0, 7); x.fillStyle = '#fff'; x.fill() });
   if (now < SC.cool) { msg.textContent = `Page ${SC.pages.length} saved — move to the next page`; msg.className = 'scmsg go' }
   else if (SC.auto && held >= 1) { msg.textContent = 'Capturing…'; capture() }
   else { msg.textContent = SC.auto ? (held > .15 ? 'Hold steady…' : 'Document found') : 'Document found — tap to capture'; msg.className = 'scmsg' + (held > .15 ? ' go' : '') }
  } else { SC.smooth = null; SC.stable = 0; if (msg) { msg.textContent = now < SC.cool ? `Page ${SC.pages.length} saved — next page?` : 'Looking for a document…'; msg.className = 'scmsg' } }
 }
 SC.timer = setTimeout(loop, 110);
}
let capturing = false;
async function capture() {
 if (!SC || capturing) return;
 capturing = true;
 try {
  const fl = $('#scFlash', SC.m); fl && (fl.classList.remove('on'), void fl.offsetWidth, fl.classList.add('on'));
  if (!SC.video) { $('#camIn').click(); return }
  const v = SC.video, c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
  const quad = SC.smooth ? SC.smooth.map(p => [p[0], p[1]]) : null;
  const p = await pageFromCanvas(c);
  if (quad) { const s = p._src.width / c.width; p.quad = quad.map(q => [q[0] * s, q[1] * s]); p.detected = true; await processPage(p) }
  SC.pages.push(p); SC.cur = SC.pages.length - 1; SC.cool = performance.now() + 2600; SC.stable = 0;
  const btn = SC.m.querySelector('[data-act=scReview]');
  if (btn) { btn.disabled = false; btn.className = 'btn pri'; btn.innerHTML = `<span class="strip"><img src="${p.thumb}" alt=""></span>Done (${SC.pages.length})` }
 } catch (e) { console.error(e); toast('Capture failed', 'err') }
 finally { capturing = false }
}
async function addImagePages(files) {
 if (!SC) openScanner();
 const list = [...files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name));
 if (!list.length) return toast('Choose image files to scan', 'err');
 const msg = $('#scMsg', SC.m); msg && (msg.textContent = 'Finding page edges…');
 let missed = 0;
 for (const f of list) { try { const p = await pageFromFile(f); if (!p.detected) missed++; SC.pages.push(p) } catch { toast(f.name + ' couldn’t be read', 'err') } }
 SC.cur = Math.max(0, SC.pages.length - 1);
 if (missed) toast(missed === 1 ? 'Couldn’t find the page edges on one photo — adjust the corners with Crop' : `${missed} photos need their corners adjusted with Crop`);
 stopCamera(); showReview();
}
/* --- review & edit: the page is always shown whole, fitted to the space --- */
function showReview() {
 if (!SC) return;
 stopCamera(); SC.video = null; SC.cropping = false;
 if (!SC.pages.length) return showCapture();
 if (!SC.kind) SC.kind = guessKind(SC.pages[0]);
 if (!SC.name) SC.name = defaultScanName(SC.kind);
 SC.cur = clamp(SC.cur, 0, SC.pages.length - 1);
 const b = $('#scBody', SC.m), p = SC.pages[SC.cur], n = SC.pages.length;
 const tool = (act, icon, label, dis = false) => `<button class="rtool" data-act="${act}" ${dis ? 'disabled' : ''}>${ic(icon, 22)}<span>${label}</span></button>`;
 b.innerHTML = `<div class="scbar topb"><button class="btn icon" data-act="scClose" aria-label="Close">${ic('x')}</button><b>${SC.editingId ? 'Edit scan' : 'Review'} · page ${SC.cur + 1} of ${n}</b>
   <button class="btn pri" data-act="scSave">${ic('check', 18)}Save</button></div>
  <div class="rev">
   <div class="revmain" id="rvMain"><div class="rvpage" id="rvPage"></div>
    ${n > 1 ? `<button class="rvnav l" data-act="scPrev" aria-label="Previous page" ${SC.cur ? '' : 'disabled'}>${ic('back', 22)}</button><button class="rvnav r" data-act="scNext" aria-label="Next page" ${SC.cur < n - 1 ? '' : 'disabled'}>${ic('chev', 22)}</button>` : ''}
    ${p.detected ? '' : `<button class="rvwarn" data-act="scCrop">${ic('warn', 16)}Page edges not found — tap to adjust</button>`}</div>
   <div class="revside">
    <div class="rtools">${tool('scCrop', 'crop', 'Crop')}${tool('scRot', 'rotate', 'Rotate')}${tool('scLeft', 'left', 'Earlier', !SC.cur)}${tool('scRight', 'right', 'Later', SC.cur >= n - 1)}${tool('scDelPage', 'trash', 'Delete')}${tool('scAdd', 'plus', 'Add')}</div>
    <div class="rfilters" role="group" aria-label="Clean-up">${FILTERS.map(([k, l]) => `<button class="chip ${p.filter === k ? 'on' : ''}" data-act="scFilter" data-f="${k}">${l}</button>`).join('')}</div>
    <p class="small rinfo">${p.w}×${p.h}px · ${FILTERS.find(f => f[0] === p.filter)[1]} clean-up</p>
   </div></div>
  <div class="pthumbs">${SC.pages.map((pg, i) => `<button class="${i === SC.cur ? 'on' : ''}" data-act="scPick" data-i="${i}" aria-label="Page ${i + 1}"><img src="${pg.thumb}" alt=""><span>${i + 1}</span></button>`).join('')}
   <button class="padd" data-act="scAdd" aria-label="Add pages">${ic('plus', 22)}</button></div>`;
 drawReviewPage();
 const t = SC.m.querySelector('.pthumbs .on'); t && t.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function drawReviewPage() {
 const host = $('#rvPage', SC.m), p = SC.pages[SC.cur]; if (!host || !p) return;
 const im = new Image(); im.alt = 'Scanned page ' + (SC.cur + 1);
 const u = URL.createObjectURL(p.out); im.onload = () => setTimeout(() => URL.revokeObjectURL(u), 500); im.src = u;
 host.innerHTML = ''; host.appendChild(im);
}
async function reprocess() { const p = SC.pages[SC.cur], host = $('#rvPage', SC.m); host && host.classList.add('busy'); await processPage(p); showReview() }
function saveSheet() {
 const m = modal(`<h3>Save scan</h3><form data-form="scSaveGo">
  <label class="fld"><span>Name</span><input id="scName" value="${esc(SC.name)}" data-in="scName" maxlength="90"></label>
  <label class="fld"><span>Type — decides the folder it’s filed in</span><select id="scKind" data-in="scKind">${KINDS.map(k => `<option ${k === SC.kind ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
  <div class="fld"><span>Save as</span><div class="row" style="gap:8px"><button type="button" class="chip ${SC.fmt === 'pdf' ? 'on' : ''}" data-act="scFmt" data-f="pdf">${ic('file', 15)}One PDF (${SC.pages.length} page${SC.pages.length > 1 ? 's' : ''})</button><button type="button" class="chip ${SC.fmt === 'jpg' ? 'on' : ''}" data-act="scFmt" data-f="jpg">${ic('image', 15)}Separate images</button></div></div>
  <div class="row end"><button type="button" class="btn ghost" data-close>Back</button><button class="btn pri">${ic('check', 18)}Save</button></div></form>`, { cls: 'mid' });
 SC.sheet = m;
}

/* --- crop editor: big handles, edge handles, magnifier, live straightened preview --- */
function cropMode() {
 const p = SC.pages[SC.cur]; SC.cropping = true;
 const b = $('#scBody', SC.m);
 b.innerHTML = `<div class="scbar topb"><button class="btn" data-act="crCancel">Cancel</button><b>Crop page</b><button class="btn pri" data-act="crApply">${ic('check', 18)}Done</button></div>
  <div class="crwrap" id="crWrap"><canvas id="crC" aria-label="Crop area. Drag the corner circles to the page corners."></canvas><canvas class="crloupe" id="crL" width="280" height="280"></canvas>
   <div class="crhint" id="crHint">Drag the circles onto the page corners · drag an edge to move it</div></div>
  <div class="crbar"><button class="rtool" data-act="crAuto">${ic('wand', 22)}<span>Auto-detect</span></button><button class="rtool" data-act="crFull">${ic('image', 22)}<span>Whole photo</span></button><button class="rtool" data-act="crReset">${ic('restore', 22)}<span>Reset</span></button>
   <div class="crprev"><img id="crP" alt="Straightened preview"><span>Preview</span></div></div>`;
 srcCanvas(p).then(src => {
  const wrap = $('#crWrap', SC.m), cv = $('#crC', SC.m), lp = $('#crL', SC.m), x = cv.getContext('2d');
  const small = (() => { const s = Math.min(1, 700 / Math.max(src.width, src.height)), c = document.createElement('canvas'); c.width = Math.round(src.width * s); c.height = Math.round(src.height * s); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); c._s = s; return c })();
  const start = p.quad.map(a => [...a]); let q = p.quad.map(a => [...a]);
  let drag = null, sel = 0, geo = null, pv = 0;
  const layout = () => {
   const dpr = devicePixelRatio || 1, W = wrap.clientWidth, H = wrap.clientHeight, pad = Math.min(34, W * .07);
   cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
   const s = Math.min((W - pad * 2) / src.width, (H - pad * 2) / src.height);
   geo = { dpr, W, H, s, ox: (W - src.width * s) / 2, oy: (H - src.height * s) / 2 }; draw();
  };
  const toS = a => [geo.ox + a[0] * geo.s, geo.oy + a[1] * geo.s];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const draw = () => {
   if (!geo) return;
   const { dpr, W, H, s, ox, oy } = geo; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
   x.drawImage(src, ox, oy, src.width * s, src.height * s);
   const Q = q.map(toS);
   x.beginPath(); x.rect(0, 0, W, H); Q.forEach((a, i) => i ? x.lineTo(...a) : x.moveTo(...a)); x.closePath(); x.fillStyle = 'rgba(3,6,15,.62)'; x.fill('evenodd');
   x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 1;
   for (const t of [1 / 3, 2 / 3]) { x.beginPath(); x.moveTo(...lerp(Q[0], Q[1], t)); x.lineTo(...lerp(Q[3], Q[2], t)); x.moveTo(...lerp(Q[0], Q[3], t)); x.lineTo(...lerp(Q[1], Q[2], t)); x.stroke() }
   x.beginPath(); Q.forEach((a, i) => i ? x.lineTo(...a) : x.moveTo(...a)); x.closePath(); x.lineWidth = 5; x.strokeStyle = 'rgba(255,255,255,.9)'; x.stroke(); x.lineWidth = 2.5; x.strokeStyle = '#1A5CFF'; x.stroke();
   for (let i = 0; i < 4; i++) { const m = lerp(Q[i], Q[(i + 1) % 4], .5), ang = Math.atan2(Q[(i + 1) % 4][1] - Q[i][1], Q[(i + 1) % 4][0] - Q[i][0]); x.save(); x.translate(...m); x.rotate(ang); x.beginPath(); x.roundRect(-14, -5, 28, 10, 5); x.fillStyle = drag && drag.e === i ? '#1A5CFF' : '#fff'; x.fill(); x.lineWidth = 2; x.strokeStyle = '#1A5CFF'; x.stroke(); x.restore() }
   Q.forEach((a, i) => { const on = drag && drag.c === i, r = on ? 17 : 14; x.beginPath(); x.arc(a[0], a[1], r + 6, 0, 7); x.fillStyle = 'rgba(26,92,255,.25)'; x.fill(); x.beginPath(); x.arc(a[0], a[1], r, 0, 7); x.fillStyle = on || sel === i ? '#1A5CFF' : '#fff'; x.fill(); x.lineWidth = 3; x.strokeStyle = on || sel === i ? '#fff' : '#1A5CFF'; x.stroke() });
  };
  const preview = () => { clearTimeout(pv); pv = setTimeout(() => { if (!isConvex(q)) return; const c = warpQuad(small, q.map(a => [a[0] * small._s, a[1] * small._s]), 320), im = $('#crP', SC.m); if (im) im.src = c.toDataURL('image/jpeg', .8) }, 60) };
  const loupe = (sx, sy, px, py) => {
   const L = lp.getContext('2d'), Z = 3, R = 140, reg = R * 2 / (geo.s * Z);
   lp.style.display = 'block'; const left = px < geo.W / 2 ? geo.W - 150 : 10; lp.style.left = left + 'px'; lp.style.top = '10px';
   L.save(); L.clearRect(0, 0, 280, 280); L.beginPath(); L.arc(R, R, R - 2, 0, 7); L.clip(); L.fillStyle = '#000'; L.fillRect(0, 0, 280, 280);
   L.drawImage(src, sx - reg / 2, sy - reg / 2, reg, reg, 0, 0, 280, 280);
   const k = 280 / reg, Q = q.map(a => [(a[0] - (sx - reg / 2)) * k, (a[1] - (sy - reg / 2)) * k]);
   L.beginPath(); Q.forEach((a, i) => i ? L.lineTo(...a) : L.moveTo(...a)); L.closePath(); L.lineWidth = 4; L.strokeStyle = '#1A5CFF'; L.stroke();
   L.strokeStyle = '#fff'; L.lineWidth = 3; L.beginPath(); L.moveTo(R, R - 26); L.lineTo(R, R + 26); L.moveTo(R - 26, R); L.lineTo(R + 26, R); L.stroke(); L.restore();
  };
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] };
  const toImg = (px, py) => [clamp((px - geo.ox) / geo.s, 0, src.width), clamp((py - geo.oy) / geo.s, 0, src.height)];
  const inside = (pt, Q) => { let c = false; for (let i = 0, j = 3; i < 4; j = i++) { const [xi, yi] = Q[i], [xj, yj] = Q[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c } return c };
  cv.onpointerdown = e => {
   const P = pos(e), Q = q.map(toS); let best = null, bd = 1e9;
   Q.forEach((a, i) => { const d = Math.hypot(a[0] - P[0], a[1] - P[1]); if (d < bd) { bd = d; best = { c: i } } });
   if (bd > 40) { best = null; bd = 1e9; for (let i = 0; i < 4; i++) { const m = lerp(Q[i], Q[(i + 1) % 4], .5), d = Math.hypot(m[0] - P[0], m[1] - P[1]); if (d < bd && d < 32) { bd = d; best = { e: i } } } }
   if (!best && inside(P, Q)) best = { all: true };
   if (!best) return;
   drag = { ...best, from: toImg(...P), q0: q.map(a => [...a]) }; if (best.c != null) sel = best.c;
   cv.setPointerCapture(e.pointerId); $('#crHint', SC.m).style.opacity = 0; draw();
  };
  cv.onpointermove = e => {
   if (!drag) { const P = pos(e), Q = q.map(toS); cv.style.cursor = Q.some(a => Math.hypot(a[0] - P[0], a[1] - P[1]) < 40) ? 'grab' : inside(P, Q) ? 'move' : 'default'; return }
   const P = pos(e), I = toImg(...P), dx = I[0] - drag.from[0], dy = I[1] - drag.from[1], n = drag.q0.map(a => [...a]);
   if (drag.c != null) n[drag.c] = I;
   else if (drag.e != null) { for (const k of [drag.e, (drag.e + 1) % 4]) n[k] = [clamp(drag.q0[k][0] + dx, 0, src.width), clamp(drag.q0[k][1] + dy, 0, src.height)] }
   else { const mx = clamp(dx, -Math.min(...drag.q0.map(a => a[0])), src.width - Math.max(...drag.q0.map(a => a[0]))), my = clamp(dy, -Math.min(...drag.q0.map(a => a[1])), src.height - Math.max(...drag.q0.map(a => a[1]))); n.forEach((a, k) => { a[0] = drag.q0[k][0] + mx; a[1] = drag.q0[k][1] + my }) }
   if (!isConvex(n)) return;
   q = n; draw();
   const focus = drag.c != null ? q[drag.c] : drag.e != null ? lerp(q[drag.e], q[(drag.e + 1) % 4], .5) : I;
   loupe(focus[0], focus[1], P[0], P[1]);
  };
  cv.onpointerup = cv.onpointercancel = () => { if (!drag) return; drag = null; lp.style.display = 'none'; draw(); preview() };
  SC.crop = { get: () => q, set: nq => { q = nq.map(a => [...a]); draw(); preview() }, reset: () => { q = start.map(a => [...a]); draw(); preview() }, src, nudge: (dx, dy) => { const n = q.map(a => [...a]); n[sel] = [clamp(n[sel][0] + dx / geo.s, 0, src.width), clamp(n[sel][1] + dy / geo.s, 0, src.height)]; if (isConvex(n)) { q = n; draw(); preview() } }, next: () => { sel = (sel + 1) % 4; draw() } };
  const ro = new ResizeObserver(() => { if (!SC || !SC.cropping) return ro.disconnect(); layout() }); ro.observe(wrap);
  layout(); preview();
 });
}
async function finishScan() {
 if (!SC || !SC.pages.length) return;
 if (SC.sheet) { SC.sheet.close(); SC.sheet = null }
 const btn = SC.m.querySelector('[data-act=scSave]'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…' }
 try {
  const name = (SC.name || defaultScanName(SC.kind)).trim().replace(/[\\/:*?"<>|]/g, '-').slice(0, 90);
  const pages = [];
  for (const p of SC.pages) { if (!p.out) await processPage(p); pages.push({ id: p.id, src: p.src, quad: p.quad, filter: p.filter, rot: p.rot, out: p.out, w: p.w, h: p.h, thumb: p.thumb, detected: p.detected }) }
  let saved = [];
  if (SC.fmt === 'jpg') {
   for (let i = 0; i < pages.length; i++) saved.push(await addFile(pages[i].out, { name: `${name}${pages.length > 1 ? ` p${i + 1}` : ''}.jpg`, type: 'image/jpeg', scan: null, kind: SC.kind, origin: 'scan', thumb: pages[i].thumb }));
   saved.forEach(r => { r.cat = 'Scans'; r.folder = classify(name, 'image/jpeg', r.size, { scan: true, kind: SC.kind }).folder; r.tags = [...new Set([...r.tags, 'scan'])]; saveRec(r) });
  } else {
   const pdf = makePdf(await Promise.all(pages.map(async p => ({ jpeg: new Uint8Array(await p.out.arrayBuffer()), w: p.w, h: p.h }))));
   const scanId = SC.editingId || uid();
   const old = SC.editingId ? S.files.find(f => f.scanId === scanId) : null;
   if (old) {
    const c = classify(name + '.pdf', 'application/pdf', pdf.size, { scan: true, kind: SC.kind });
    await dbPut('blobs', old.id, pdf);
    Object.assign(old, { name: name + '.pdf', size: pdf.size, hash: await hashBlob(pdf), thumb: pages[0].thumb, mini: await miniOf(pages[0].thumb), sent: 0, folder: old.userFolder ? old.folder : c.folder, tags: [...new Set([...old.tags, ...c.tags])], modified: Date.now(), mt: Date.now(), dirty: true, contentChanged: true, offloaded: false });
    await saveRec(old); saved.push(old);
   } else saved.push(await addFile(pdf, { name: name + '.pdf', type: 'application/pdf', scan: scanId, kind: SC.kind, origin: 'scan', thumb: pages[0].thumb }));
   const doc = { id: scanId, name, kind: SC.kind, pages, n: pages.length, mini: await miniOf(pages[0].thumb), created: old ? (S.scans.find(s => s.id === scanId) || {}).created || Date.now() : Date.now(), updated: Date.now(), fileId: saved[0].id };
   await dbPut('scans', scanId, doc); S.scans = S.scans.filter(s => s.id !== scanId).concat(doc);
  }
  closeScanner(); syncSoon(); render();
  const r = saved[0];
  const m = modal(`<div style="text-align:center;display:grid;gap:12px;justify-items:center"><span class="ib" style="width:64px;height:64px;border-radius:18px;background:var(--gsoft);color:var(--green);display:grid;place-items:center">${ic('check', 32)}</span>
   <h3 style="margin:0">Scan saved</h3><p class="muted">${saved.length > 1 ? saved.length + ' images' : esc(r.name)} filed in <b>${esc(r.folder)}</b></p>
   <div class="row" style="justify-content:center"><button class="btn" data-act="svOpen" data-id="${r.id}">${ic('eye', 18)}View</button><button class="btn" data-act="svShare" data-id="${r.id}">${ic('share', 18)}Share</button><button class="btn" data-act="svDl" data-id="${r.id}">${ic('download', 18)}Download</button></div>
   <div class="row" style="justify-content:center"><button class="btn ghost" data-act="svFolder" data-f="${esc(r.folder)}">Open folder</button><button class="btn pri" data-act="svAgain">${ic('scan', 18)}Scan another</button></div></div>`);
  SC_SAVED = m;
 } catch (e) { console.error(e); toast('Couldn’t save the scan: ' + (e.message || e), 'err'); if (btn) { btn.disabled = false; btn.textContent = 'Save' } }
}
let SC_SAVED = null;
async function editScan(id) {
 const doc = S.scans.find(s => s.id === id) || await dbGet('scans', id);
 if (!doc) return toast('Scan data not found on this device', 'err');
 if (!doc.pages) return toast('This scan was made on another device — edit it there, or view its PDF here', 'err');
 openScanner({ pages: doc.pages.map(p => ({ ...p })), editingId: id, name: doc.name, nameTouched: true, kind: doc.kind, review: true });
}
Object.assign(ACT, {
 scan: () => openScanner(),
 scClose: async () => { if (SC && SC.pages.length && !SC.editingId) { if (!await ask('Discard this scan?', { body: `${SC.pages.length} page(s) haven’t been saved.`, ok: 'Discard', danger: true })) return } closeScanner() },
 scAuto: (d, el) => { SC.auto = !SC.auto; el.classList.toggle('on', SC.auto) },
 scShoot: () => SC && (SC.video ? capture() : $('#camIn').click()),
 scImport: () => $('#imgIn').click(), scCamIn: () => $('#camIn').click(),
 scReview: () => showReview(),
 scAdd: () => showCapture(),
 scPick: d => { SC.cur = +d.i; showReview() },
 scFilter: async d => { SC.pages[SC.cur].filter = d.f; await reprocess() },
 scRot: async () => { const p = SC.pages[SC.cur]; p.rot = (p.rot + 1) % 4; await reprocess() },
 scLeft: () => { const i = SC.cur; if (i > 0) { [SC.pages[i - 1], SC.pages[i]] = [SC.pages[i], SC.pages[i - 1]]; SC.cur--; showReview() } },
 scRight: () => { const i = SC.cur; if (i < SC.pages.length - 1) { [SC.pages[i + 1], SC.pages[i]] = [SC.pages[i], SC.pages[i + 1]]; SC.cur++; showReview() } },
 scDelPage: () => { SC.pages.splice(SC.cur, 1); SC.cur = Math.max(0, SC.cur - 1); SC.pages.length ? showReview() : showCapture() },
 scFmt: (d, el) => { SC.fmt = d.f; const w = el.closest('.modal'); if (w) w.querySelectorAll('[data-act=scFmt]').forEach(c => c.classList.toggle('on', c.dataset.f === d.f)) },
 scPrev: () => { if (SC.cur > 0) { SC.cur--; showReview() } }, scNext: () => { if (SC.cur < SC.pages.length - 1) { SC.cur++; showReview() } },
 crReset: () => SC.crop && SC.crop.reset(),
 scCrop: () => cropMode(),
 crAuto: () => { const p = SC.pages[SC.cur], q = detectQuad(SC.crop.src, SC.crop.src.width, SC.crop.src.height); q ? SC.crop.set(q) : toast('No clear page edges found — drag the corners', 'err'); if (q) p.detected = true },
 crFull: () => { const s = SC.crop.src; SC.crop.set([[0, 0], [s.width, 0], [s.width, s.height], [0, s.height]]) },
 crCancel: () => showReview(),
 crApply: async () => { const q = SC.crop.get(); if (!isConvex(q)) return toast('Corners cross over — fix them first', 'err'); SC.pages[SC.cur].quad = orderQuad(q); await reprocess() },
 scSave: () => saveSheet(),
 svOpen: d => { SC_SAVED && SC_SAVED.close(); openFile(d.id) }, svShare: d => { SC_SAVED && SC_SAVED.close(); openShare(d.id) },
 svDl: d => downloadFiles([d.id]), svFolder: d => { SC_SAVED && SC_SAVED.close(); S.folder = d.f; go('files') }, svAgain: () => { SC_SAVED && SC_SAVED.close(); openScanner() },
 scView: d => { const f = S.files.find(x => x.scanId === d.id); f ? openFile(f.id) : toast('File not found', 'err') },
 scEdit: d => editScan(d.id),
 scShare: d => { const f = S.files.find(x => x.scanId === d.id); f && openShare(f.id) },
 scDl: d => { const f = S.files.find(x => x.scanId === d.id); f && downloadFiles([f.id]) },
 scDel: async d => { const f = S.files.find(x => x.scanId === d.id); if (await ask('Delete this scan?', { body: 'It moves to Trash with its PDF.', ok: 'Delete', danger: true })) { if (f) trashFiles([f.id]); else { await dbDel('scans', d.id); S.scans = S.scans.filter(s => s.id !== d.id); render() } } }
});
VIEWS.scan = () => {
 const scans = S.scans.map(s => ({ s, f: S.files.find(x => x.scanId === s.id) })).filter(o => o.f && !o.f.trashed).sort((a, b) => b.s.updated - a.s.updated);
 const imgScans = live().filter(f => f.cat === 'Scans' && !f.scanId);
 return `<div class="card" style="background:var(--blue);color:#fff;border:0;padding:clamp(20px,3vw,32px);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center">
  <div><h1 style="color:#fff">Scan documents</h1><p style="opacity:.9;margin:8px 0 18px;max-width:560px">Point at a page — DESk spots the edges, captures it when you hold steady, straightens and cleans it, then files the PDF in the right folder. Keep going to add more pages to the same file.</p>
  <div class="row"><button class="btn" style="background:#fff;color:#1446d6;border:0" data-act="scan">${ic('camera', 18)}Start scanning</button><button class="btn" style="background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.3)" data-act="scImportNew">${ic('image', 18)}Scan from photos</button></div>
</div>
  <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true" class="hide-s"><rect x="28" y="16" width="94" height="122" rx="8" fill="#fff" transform="rotate(-6 75 77)"/><g stroke="#1A5CFF" stroke-width="5" stroke-linecap="round" opacity=".35" transform="rotate(-6 75 77)"><path d="M44 44h62M44 60h62M44 76h62M44 92h40"/></g><path d="M18 40V22a6 6 0 0 1 6-6h18M108 16h18a6 6 0 0 1 6 6v18M132 112v18a6 6 0 0 1-6 6h-18M42 136H24a6 6 0 0 1-6-6v-18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/></svg></div>
  <div class="sect"><h2>My scans <span class="muted" style="font-size:15px;font-weight:600">${scans.length}</span></h2></div>
  ${scans.length ? `<div class="scans">${scans.map(({ s, f }) => `<div class="sc"><div class="th" data-act="scView" data-id="${s.id}" role="button" tabindex="0" aria-label="View ${esc(s.name)}">${(() => { const t = safeThumb(s.pages && s.pages[0] && s.pages[0].thumb) || safeThumb(s.mini) || safeThumb(f.thumb); return t ? `<img src="${t}" alt="">` : ic('scan', 40) })()}<span class="badge">${s.pages ? s.pages.length : (s.n || 1)} page${(s.pages ? s.pages.length : (s.n || 1)) > 1 ? 's' : ''}</span></div>
   <div class="meta"><div class="b" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.name)}</div><div class="small muted">${esc(f.folder.replace('Scans/', ''))} · ${fmtD(s.updated)}</div></div>
   <div class="acts"><button class="btn sm icon ghost" data-act="scEdit" data-id="${s.id}" aria-label="Edit" title="Edit">${ic('edit', 18)}</button><button class="btn sm icon ghost" data-act="scShare" data-id="${s.id}" aria-label="Share" title="Share">${ic('share', 18)}</button><button class="btn sm icon ghost" data-act="scDl" data-id="${s.id}" aria-label="Download" title="Download">${ic('download', 18)}</button><button class="btn sm icon ghost" data-act="scDel" data-id="${s.id}" aria-label="Delete" title="Delete">${ic('trash', 18)}</button></div></div>`).join('')}</div>`
   : `<div class="card empty">${ic('scan', 44)}<h3>No scans yet</h3><p>Receipts, contracts, IDs, notes — scan them and DESk files them under Scans by type.</p></div>`}
  ${imgScans.length ? `<div class="sect"><h2>Scanned images</h2></div><div class="fgrid">${imgScans.map(cardHTML).join('')}</div>` : ''}`;
};
ACT.scImportNew = () => { openScanner(); setTimeout(() => $('#imgIn').click(), 50) };

FORMS.scSaveGo = () => finishScan();

/* ================= PASSWORD VAULT ================= */
const WORDS = 'able acid aged also area army away baby back ball band bank base bath bear beat bell belt best bird blue boat body bone book boot born boss both bowl bulk burn bush busy cake calm camp card care cart case cash cast cell chat chef city clay clip club coal coat code coin cold cone cook cool cope copy cord core corn cost crew crop cube cult cure dark data date dawn deal dear deck deep deer desk dial dice diet dish dock dome door dose dove draw drum duck dune dust duty each earn ease east echo edge else epic even ever exam face fact fair fall farm fast fern film fire firm fish flag flat flow foam fold folk font food foot ford fork form fort fuel full fund gain game gate gear gift glad glow glue goal gold golf good gown grid grin grip gulf hail half hall halo hand harp hawk heat herb hero hike hill hint hive hold home hood hook hope horn host hour huge hunt idea inch iron isle item jade jazz jean joke jump jury keen kite knee knot lace lady lake lamp land lane lava lawn leaf lens life lift lily lime line lion list loaf lock loft logo loop lord loud luck lump lung main mall malt maple mask meal melt menu mild milk mill mind mint mist mode mole moon moss moth much mule nail navy neat neck nest news node noon nose note oak oath oval oven pace pack page palm park path peak pear pine pink pipe plan plot plum poem pole pond pony pool port pose pull pump pure quiz race rack raft rail rain ramp rank rare reef rice ride ring rise road robe rock roof room root rope rose ruby rule sage sail salt sand seal seed ship shoe silk sing site size skin sled slow snow soap sock sofa soil song soup spin star stem step stir suit sun surf swan tail tale tank tape task team tent test tide tile time tone tool toss tour town tram tree trip tube tuna tune twin unit vase vast verb vest view vine visa volt vote wage wall wand warm wave wax weed well west whip wide wild wind wing wire wise wolf wood wool word yard yarn year yoga zero zinc zone'.split(' ');
const VT = {
 login: { l: 'Login', ic: 'key', c: '#1A5CFF', f: [['title', 'Name'], ['user', 'Username or email'], ['pass', 'Password', 'pw'], ['url', 'Website'], ['totp', '2FA secret key (TOTP)', 'secret'], ['notes', 'Notes', 'area']] },
 card: { l: 'Payment card', ic: 'card', c: '#7a3cff', f: [['title', 'Name'], ['holder', 'Cardholder'], ['number', 'Card number', 'secret'], ['exp', 'Expiry (MM/YY)'], ['cvv', 'Security code', 'secret'], ['pin', 'PIN', 'secret'], ['notes', 'Notes', 'area']] },
 wifi: { l: 'Wi-Fi', ic: 'wifi', c: '#0f9d8a', f: [['title', 'Network name (SSID)'], ['pass', 'Password', 'pw'], ['sec', 'Security (WPA2, WPA3, WEP, none)'], ['notes', 'Notes', 'area']] },
 note: { l: 'Secure note', ic: 'note', c: '#f08c00', f: [['title', 'Title'], ['notes', 'Note', 'area']] },
 identity: { l: 'Identity', ic: 'id', c: '#e5489a', f: [['title', 'Name'], ['full', 'Full name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address', 'area'], ['idno', 'ID / passport number', 'secret'], ['notes', 'Notes', 'area']] }
};
const COMMON = ['password', '123456', '12345678', 'qwerty', 'abc123', '111111', 'letmein', 'welcome', 'admin', 'iloveyou', 'monkey', 'dragon', 'football', 'baseball', 'master', 'sunshine', 'princess', 'login', 'passw0rd', 'starwars', 'trustno1', '000000', '123123', '654321', 'superman', 'qazwsx', 'shadow', 'freedom'];
function pwScore(p) {
 if (!p) return { s: 0, bits: 0, l: 'Empty' };
 let pool = 0; if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^A-Za-z0-9]/.test(p)) pool += 33;
 let bits = p.length * Math.log2(pool || 1); const low = p.toLowerCase();
 if (COMMON.some(c => low.includes(c))) bits *= .4;
 if (/(.)\1{2,}/.test(p)) bits *= .8;
 if (/(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf|zxcv)/i.test(p)) bits *= .75;
 const words = p.split(/[-_ .]/); if (words.length >= 4 && words.every(w => w.length >= 3)) bits = Math.max(bits, words.length * 11);
 const s = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
 return { s, bits: Math.round(bits), l: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][s] };
}
const meterHTML = p => { const r = pwScore(p), col = ['#e5484d', '#e5484d', '#e9a100', '#12a150', '#12a150'][r.s]; return `<div class="meter">${[0, 1, 2, 3].map(i => `<i style="${i < Math.max(1, r.s) && p ? 'background:' + col : ''}"></i>`).join('')}</div><div class="small" style="color:${p ? col : 'var(--muted)'};margin-top:4px;font-weight:700">${p ? r.l + ' · ~' + r.bits + ' bits' : ' '}</div>` };
const rnd = n => { const m = Math.floor(2 ** 32 / n) * n; let x; do { x = crypto.getRandomValues(new Uint32Array(1))[0] } while (x >= m); return x % n };
function genPassword(o) {
 const L = 'abcdefghijkmnopqrstuvwxyz' + (o.ambig ? '' : 'l'), U = 'ABCDEFGHJKLMNPQRSTUVWXYZ' + (o.ambig ? '' : 'IO'), D = '23456789' + (o.ambig ? '' : '01'), Y = '!@#$%^&*()-_=+[]{};:,.?/~';
 let sets = []; if (o.lower) sets.push(L); if (o.upper) sets.push(U); if (o.digits) sets.push(D); if (o.symbols) sets.push(Y); if (!sets.length) sets = [L];
 const all = sets.join(''), out = sets.map(s => s[rnd(s.length)]);
 while (out.length < o.len) out.push(all[rnd(all.length)]);
 for (let i = out.length - 1; i > 0; i--) { const j = rnd(i + 1);[out[i], out[j]] = [out[j], out[i]] }
 return out.slice(0, o.len).join('');
}
function genPhrase(n) { const w = Array.from({ length: n }, () => WORDS[rnd(WORDS.length)]); const k = rnd(n); w[k] = w[k][0].toUpperCase() + w[k].slice(1); return w.join('-') + '-' + (10 + rnd(90)) }
function b32(s) { const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; s = s.replace(/[\s=-]/g, '').toUpperCase(); let bits = ''; for (const c of s) { const v = a.indexOf(c); if (v < 0) throw new Error('bad'); bits += v.toString(2).padStart(5, '0') } const out = new Uint8Array(bits.length / 8 | 0); for (let i = 0; i < out.length; i++) out[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2); return out }
function totpSecret(v) { v = String(v || '').trim(); if (/^otpauth:/i.test(v)) { try { return new URL(v).searchParams.get('secret') || '' } catch { return '' } } return v }
async function totp(secret, period = 30, digits = 6) {
 const key = await crypto.subtle.importKey('raw', b32(totpSecret(secret)), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
 const ctr = Math.floor(Date.now() / 1000 / period), buf = new ArrayBuffer(8), dv = new DataView(buf);
 dv.setUint32(0, Math.floor(ctr / 2 ** 32)); dv.setUint32(4, ctr >>> 0);
 const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf)), o = h[h.length - 1] & 15;
 return String((((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 10 ** digits).padStart(digits, '0');
}
/* --- vault storage --- */
async function saveVault() {
 const rec = S.vaultRec; rec.data = await encJSON(S.vaultKey, S.vault); rec.mt = Date.now();
 await kvSet('vault', rec);
 if (typeof syncSoon === 'function') syncSoon();
}
async function createVault(pass, hint) {
 const salt = crypto.getRandomValues(new Uint8Array(16));
 S.vaultRec = { vid: uid(), salt: b64(salt), iter: 310000, hint: hint || '', created: Date.now() };
 S.vaultKey = await deriveKey(pass, salt, 310000); S.vault = { entries: [] };
 await saveVault();
}
async function unlockVault(pass) {
 const r = S.vaultRec, key = await deriveKey(pass, unb64(r.salt), r.iter);
 S.vault = await decJSON(key, r.data); S.vaultKey = key; S.vault.entries = S.vault.entries || [];
}
function lockVault() { S.vaultKey = null; S.vault = null; if (S.view === 'vault') render() }
const VS = { q: '', filter: 'all', fail: 0, until: 0 };
function vaultHealth() {
 const E = S.vault ? S.vault.entries : [], pw = E.filter(e => e.pass);
 const counts = {}; pw.forEach(e => counts[e.pass] = (counts[e.pass] || 0) + 1);
 const weak = pw.filter(e => pwScore(e.pass).s < 2), reused = pw.filter(e => counts[e.pass] > 1), old = pw.filter(e => Date.now() - (e.pwAt || e.created) > 365 * 864e5);
 const logins = E.filter(e => e.type === 'login'), tfa = logins.filter(e => e.totp);
 const bad = new Set([...weak, ...reused, ...old].map(e => e.id));
 return { weak, reused, old, tfa, logins, score: pw.length ? Math.round((1 - bad.size / pw.length) * 100) : 100 };
}
const avatar = e => { const t = VT[e.type] || VT.login; const ch = (e.title || '?').trim()[0] || '?'; return `<span class="av" style="background:${t.c}">${e.type === 'login' ? esc(ch.toUpperCase()) : ic(t.ic, 20)}</span>` };
const subline = e => e.type === 'login' ? (e.user || e.url || '') : e.type === 'card' ? (e.number ? '•••• ' + String(e.number).replace(/\s/g, '').slice(-4) : '') : e.type === 'wifi' ? (e.sec || 'Wi-Fi network') : e.type === 'identity' ? (e.full || e.email || '') : (e.notes || '').slice(0, 60);
VIEWS.vault = () => {
 if (!S.vaultRec) return `<div class="lockbox"><span class="ib">${ic('shield', 38)}</span><h1>Set up your password vault</h1>
  <p class="muted">Everything is encrypted on this device with AES-256 using a key derived from your master password (PBKDF2, 310,000 rounds). DESk never stores the master password — if you forget it, the vault can’t be recovered.</p>
  <form data-form="vaultCreate"><label class="fld"><span>Master password</span><input type="password" id="vp1" autocomplete="new-password" data-in="vpMeter" required minlength="8"></label><div id="vpM">${meterHTML('')}</div>
  <label class="fld"><span>Confirm master password</span><input type="password" id="vp2" autocomplete="new-password" required></label>
  <label class="fld"><span>Hint (optional, stored unencrypted)</span><input id="vph" maxlength="80"></label>
  <button class="btn pri">${ic('lock', 18)}Create vault</button></form><button class="btn ghost sm" data-act="vRestore">${ic('upload', 16)}Restore from a backup file</button><div id="vRemote"></div></div>`;
 if (!S.vault) return `<div class="lockbox"><span class="ib">${ic('lock', 38)}</span><h1>Vault locked</h1><p class="muted">${(S.vaultRec.data && S.vaultRec.data.ct) ? 'Enter your master password to unlock.' : ''}</p>
  <form data-form="vaultUnlock"><label class="fld"><span>Master password</span><input type="password" id="vpu" autocomplete="current-password" required autofocus></label>
  ${S.vaultRec.hint ? `<p class="small muted">Hint: ${esc(S.vaultRec.hint)}</p>` : ''}<p class="small" id="vErr" style="color:var(--red)"></p>
  <button class="btn pri">${ic('unlock', 18)}Unlock</button></form></div>`;
 const H = vaultHealth(), E = S.vault.entries;
 let list = E.slice();
 const f = VS.filter;
 if (f === 'fav') list = list.filter(e => e.fav); else if (VT[f]) list = list.filter(e => e.type === f); else if (f === 'weak') list = H.weak; else if (f === 'reused') list = H.reused; else if (f === 'old') list = H.old;
 if (VS.q) { const q = VS.q.toLowerCase(); list = list.filter(e => [e.title, e.user, e.url, e.notes, e.email, e.full].some(v => v && String(v).toLowerCase().includes(q))) }
 list.sort((a, b) => (b.fav - a.fav) || (a.title || '').localeCompare(b.title || ''));
 const chip = (k, l, n) => `<button class="chip ${f === k ? 'on' : ''}" data-act="vFilter" data-f="${k}">${l}${n != null ? ` <span style="opacity:.65">${n}</span>` : ''}</button>`;
 return `<div class="sect" style="margin-top:6px"><h1>Passwords</h1><div class="row"><button class="btn" data-act="vGen">${ic('dice', 18)}Generator</button><button class="btn" data-act="vMore">${ic('more', 18)}<span class="hide-s">More</span></button><button class="btn" data-act="vLock">${ic('lock', 18)}Lock</button><button class="btn pri" data-act="vAdd">${ic('plus', 18)}Add</button></div></div>
 <div class="grid g4" style="margin-bottom:16px">
  <div class="card stat"><span>Security score</span><b style="color:${H.score >= 80 ? 'var(--green)' : H.score >= 50 ? '#a06d00' : 'var(--red)'}">${H.score}%</b><div class="bar"><i style="width:${H.score}%;background:${H.score >= 80 ? 'var(--green)' : H.score >= 50 ? 'var(--amber)' : 'var(--red)'}"></i></div></div>
  <button class="card stat" style="text-align:left" data-act="vFilter" data-f="weak"><span>Weak passwords</span><b>${H.weak.length}</b><span>${H.weak.length ? 'Tap to review' : 'All good'}</span></button>
  <button class="card stat" style="text-align:left" data-act="vFilter" data-f="reused"><span>Reused passwords</span><b>${H.reused.length}</b><span>${H.reused.length ? 'Same password on several sites' : 'None reused'}</span></button>
  <div class="card stat"><span>Two-factor codes</span><b>${H.tfa.length}<span style="font-size:15px;color:var(--muted)"> / ${H.logins.length}</span></b><span>${H.old.length} password${H.old.length === 1 ? '' : 's'} older than a year</span></div></div>
 <div class="row" style="margin-bottom:12px"><label class="search" style="max-width:none"><span>${ic('search', 18)}</span><input type="search" placeholder="Search vault…" value="${esc(VS.q)}" data-in="vq" aria-label="Search vault"></label></div>
 <div class="chips" style="margin-bottom:14px">${chip('all', 'All', E.length)}${chip('fav', 'Favorites')}${Object.entries(VT).map(([k, t]) => chip(k, ({ login: 'Logins', card: 'Cards', wifi: 'Wi-Fi', note: 'Notes', identity: 'Identities' })[k], E.filter(e => e.type === k).length || null)).join('')}${chip('weak', 'Weak', H.weak.length || null)}${chip('reused', 'Reused', H.reused.length || null)}${chip('old', 'Old', H.old.length || null)}</div>
 ${list.length ? `<div class="vlist">${list.map(e => `<button class="vi" data-act="vOpen" data-id="${e.id}">${avatar(e)}<span><div class="t">${esc(e.title || 'Untitled')} ${e.fav ? `<span style="color:var(--amber)">★</span>` : ''}</div><div class="s">${esc(subline(e))}</div></span>
   <span class="row" style="gap:4px">${e.pass ? `<span class="btn sm icon ghost" data-act="vCopyPw" data-id="${e.id}" role="button" aria-label="Copy password" title="Copy password">${ic('copy', 18)}</span>` : ''}${ic('chev', 18)}</span></button>`).join('')}</div>`
  : `<div class="card empty">${ic('key', 44)}<h3>${E.length ? 'Nothing matches' : 'Your vault is empty'}</h3><p>${E.length ? 'Try another search or filter.' : 'Add logins, cards, Wi-Fi networks, IDs and secure notes — or import a CSV from your browser or another password manager.'}</p>${E.length ? '' : `<div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri" data-act="vAdd">${ic('plus', 18)}Add first item</button><button class="btn" data-act="vImport">${ic('upload', 18)}Import CSV</button></div>`}</div>`}`;
};
function entryModal(id) {
 const e = S.vault.entries.find(x => x.id === id); if (!e) return;
 const t = VT[e.type] || VT.login; let timer = 0;
 const m = modal(`<div class="mhead">${avatar(e).replace('class="av"', 'class="av" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:800;background:' + t.c + '"')}<h3>${esc(e.title || 'Untitled')}</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div>
  <div id="eBody"></div>`, { cls: 'mid', onClose: () => clearInterval(timer) });
 const body = m.querySelector('#eBody');
 const rows = t.f.filter(([k]) => k !== 'title' && e[k]).map(([k, l, kind]) => {
  if (k === 'totp') return `<div class="fieldv"><span class="v"><span class="l">One-time code</span><span class="totp mono" id="totpC">······</span></span><svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" stroke-width="4"/><circle id="totpR" cx="18" cy="18" r="15" fill="none" stroke="var(--blue)" stroke-width="4" stroke-dasharray="94.2" transform="rotate(-90 18 18)"/></svg><button class="btn sm icon ghost" data-act="vCopyTotp" aria-label="Copy code">${ic('copy', 18)}</button></div>`;
  const secret = kind === 'pw' || kind === 'secret';
  const val = k === 'url' && /^https?:\/\//i.test(e.url) ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.url)}</a>` : `<span data-sec="${secret ? 1 : 0}" data-v="${esc(e[k])}">${secret ? '••••••••••' : esc(e[k]).replace(/\n/g, '<br>')}</span>`;
  return `<div class="fieldv"><span class="v ${secret ? 'mono' : ''}"><span class="l">${esc(l)}</span>${val}${kind === 'pw' ? meterHTML(e[k]) : ''}</span>${secret ? `<button class="btn sm icon ghost" data-act="vReveal" aria-label="Show">${ic('eye', 18)}</button>` : ''}<button class="btn sm icon ghost" data-act="vCopyF" data-k="${k}" aria-label="Copy ${esc(l)}">${ic('copy', 18)}</button></div>`;
 }).join('');
 const reusedN = e.pass ? S.vault.entries.filter(x => x.pass === e.pass).length : 0;
 body.innerHTML = `${reusedN > 1 ? `<div class="badge red" style="margin-bottom:10px">${ic('warn', 14)} Used on ${reusedN} items — change it here</div>` : ''}${rows || '<p class="muted">No details saved.</p>'}
  ${e.type === 'wifi' && e.title ? `<details style="margin:6px 0 12px"><summary class="b" style="cursor:pointer;min-height:36px">Show join QR code</summary><div class="qrbox" style="margin-top:10px">${qrSvg(`WIFI:T:${/wep/i.test(e.sec) ? 'WEP' : /none|open/i.test(e.sec) ? 'nopass' : 'WPA'};S:${wifiEsc(e.title)};P:${wifiEsc(e.pass || '')};;`)}</div><p class="small muted" style="text-align:center;margin-top:6px">Scan with a phone camera to join</p></details>` : ''}
  <p class="small muted" style="margin:8px 0 16px">${t.l} · created ${fmtD(e.created)} · updated ${fmtD(e.updated)}${e.history && e.history.length ? ` · ${e.history.length} earlier password${e.history.length > 1 ? 's' : ''}` : ''}</p>
  ${e.history && e.history.length ? `<details style="margin-bottom:14px"><summary class="b" style="cursor:pointer;min-height:36px">Password history</summary>${e.history.map(h => `<div class="fieldv"><span class="v mono"><span class="l">Until ${fmtD(h.at)}</span><span data-sec="1" data-v="${esc(h.p)}">••••••••</span></span><button class="btn sm icon ghost" data-act="vReveal" aria-label="Show">${ic('eye', 18)}</button></div>`).join('')}</details>` : ''}
  <div class="row between"><button class="btn danger" data-act="vDel" data-id="${e.id}">${ic('trash', 18)}Delete</button><div class="row"><button class="btn" data-act="vFav" data-id="${e.id}">${ic('star', 18)}${e.fav ? 'Unfavorite' : 'Favorite'}</button><button class="btn pri" data-act="vEdit" data-id="${e.id}">${ic('edit', 18)}Edit</button></div></div>`;
 m.dataset.eid = e.id;
 if (e.totp) {
  const tick = async () => { try { const c = await totp(e.totp); const el = m.querySelector('#totpC'); if (!el) return; el.textContent = c.slice(0, 3) + ' ' + c.slice(3); m.dataset.code = c; const left = 30 - (Math.floor(Date.now() / 1000) % 30); m.querySelector('#totpR').setAttribute('stroke-dashoffset', String(94.2 * (1 - left / 30))) } catch { const el = m.querySelector('#totpC'); if (el) el.textContent = 'Invalid key' } };
  tick(); timer = setInterval(tick, 1000);
 }
}
const wifiEsc = s => String(s).replace(/([\\;,:"])/g, '\\$1');
function editEntry(id, type) {
 const e = id ? { ...S.vault.entries.find(x => x.id === id) } : { type: type || 'login' };
 const t = VT[e.type];
 const m = modal(`<h3>${id ? 'Edit' : 'New'} ${t.l.toLowerCase()}</h3>
  ${id ? '' : `<div class="chips" style="margin-bottom:14px">${Object.entries(VT).map(([k, v]) => `<button type="button" class="chip ${k === e.type ? 'on' : ''}" data-act="vType" data-t="${k}">${ic(v.ic, 16)}${v.l}</button>`).join('')}</div>`}
  <form data-form="vSave">${t.f.map(([k, l, kind]) => `<label class="fld"><span>${esc(l)}</span>${kind === 'area' ? `<textarea name="${k}">${esc(e[k] || '')}</textarea>` :
   kind === 'pw' ? `<div class="row" style="flex-wrap:nowrap"><input name="${k}" type="password" value="${esc(e[k] || '')}" autocomplete="new-password" data-in="pwLive" class="mono"><button type="button" class="btn icon" data-act="pwShow" aria-label="Show">${ic('eye', 18)}</button><button type="button" class="btn icon" data-act="pwGen" aria-label="Generate">${ic('dice', 18)}</button></div><div class="pwm">${meterHTML(e[k] || '')}</div>` :
   `<input name="${k}" type="${kind === 'secret' ? 'password' : 'text'}" ${k === 'url' ? 'inputmode="url"' : k === 'email' ? 'inputmode="email"' : ''} value="${esc(e[k] || '')}" ${k === 'title' ? 'required autofocus' : ''} autocomplete="off" ${kind === 'secret' ? 'class="mono"' : ''} ${k === 'url' ? 'placeholder="https://"' : ''}>`}</label>`).join('')}
  <div class="row end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn pri">${ic('check', 18)}Save</button></div></form>`, { cls: 'mid' });
 m._entry = e;
}
async function saveEntry(form, m) {
 const e = m._entry, fd = new FormData(form), now = Date.now();
 const old = e.id ? S.vault.entries.find(x => x.id === e.id) : null;
 VT[e.type].f.forEach(([k]) => { e[k] = String(fd.get(k) || '').trim() });
 if (e.url && !/^[a-z]+:\/\//i.test(e.url)) e.url = 'https://' + e.url;
 if (e.totp) { try { b32(totpSecret(e.totp)) } catch { return toast('That 2FA secret isn’t a valid key', 'err') } }
 if (old) {
  if (old.pass && old.pass !== e.pass) { e.history = [{ p: old.pass, at: now }, ...(old.history || [])].slice(0, 5); e.pwAt = now }
  e.updated = now; Object.assign(old, e);
 } else { Object.assign(e, { id: uid(), created: now, updated: now, pwAt: now, fav: false }); S.vault.entries.push(e) }
 await saveVault(); m.close(); toast('Saved to vault'); render();
}
function genModal(onUse) {
 const st = Object.assign({ mode: 'pw', len: 20, upper: true, lower: true, digits: true, symbols: true, ambig: true, words: 5 }, S.genPrefs || {});
 const m = modal(`<h3>Password generator</h3><div class="genout" id="gOut"></div><div id="gM"></div>
  <div class="chips" style="margin:14px 0"><button class="chip" data-act="gMode" data-m="pw">Random</button><button class="chip" data-act="gMode" data-m="ph">Passphrase</button></div>
  <div id="gOpt"></div>
  <div class="row end" style="margin-top:14px"><button class="btn" data-act="gNew">${ic('refresh', 18)}New</button><button class="btn" data-act="gCopy">${ic('copy', 18)}Copy</button>${onUse ? `<button class="btn pri" data-act="gUse">${ic('check', 18)}Use</button>` : ''}</div>`, { cls: 'mid' });
 const draw = () => {
  S.genPrefs = st;
  m.querySelectorAll('[data-act=gMode]').forEach(b => b.classList.toggle('on', b.dataset.m === st.mode));
  m.querySelector('#gOpt').innerHTML = st.mode === 'pw' ? `<label class="fld"><span>Length: <b id="gL">${st.len}</b></span><input type="range" min="8" max="64" value="${st.len}" data-g="len"></label>
   <div class="grid g2" style="gap:4px">${[['upper', 'A–Z'], ['lower', 'a–z'], ['digits', '0–9'], ['symbols', '!@#$'], ['ambig', 'Avoid look-alikes (l, 1, O, 0)']].map(([k, l]) => `<label class="sw"><input type="checkbox" data-g="${k}" ${st[k] ? 'checked' : ''}>${l}</label>`).join('')}</div>`
   : `<label class="fld"><span>Words: <b id="gL">${st.words}</b></span><input type="range" min="3" max="10" value="${st.words}" data-g="words"></label>`;
  gen();
 };
 const gen = () => { const v = st.mode === 'pw' ? genPassword(st) : genPhrase(st.words); m.querySelector('#gOut').textContent = v; m.querySelector('#gM').innerHTML = meterHTML(v); m._val = v };
 m.addEventListener('input', e => { const k = e.target.dataset.g; if (!k) return; st[k] = e.target.type === 'checkbox' ? e.target.checked : +e.target.value; const l = m.querySelector('#gL'); if (l && e.target.type === 'range') l.textContent = e.target.value; gen() });
 m._draw = draw; m._gen = gen; m._st = st; m._use = onUse; draw();
}
function parseCSV(text) {
 const rows = []; let row = [], cur = '', q = false;
 for (let i = 0; i < text.length; i++) {
  const c = text[i];
  if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
  else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = '' } else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = '' } else cur += c;
 }
 if (cur || row.length) { row.push(cur); rows.push(row) }
 return rows.filter(r => r.some(x => x.trim()));
}
async function importCSV(file) {
 const rows = parseCSV(await file.text()); if (rows.length < 2) return toast('No rows found in that CSV', 'err');
 const h = rows[0].map(x => x.trim().toLowerCase());
 const col = (...names) => h.findIndex(x => names.includes(x));
 const ci = { title: col('name', 'title', 'account'), url: col('url', 'login_uri', 'website', 'uri'), user: col('username', 'login_username', 'user', 'email', 'login'), pass: col('password', 'login_password'), notes: col('note', 'notes', 'extra'), totp: col('totp', 'login_totp', 'otpauth', 'otp') };
 if (ci.pass < 0) return toast('Couldn’t find a password column in that CSV', 'err');
 let n = 0, skip = 0; const now = Date.now();
 for (const r of rows.slice(1)) {
  const g = k => ci[k] >= 0 ? (r[ci[k]] || '').trim() : '';
  if (!g('pass') && !g('user')) continue;
  if (S.vault.entries.some(e => e.type === 'login' && e.user === g('user') && e.pass === g('pass') && (e.url || '') === g('url'))) { skip++; continue }
  let title = g('title'); if (!title && g('url')) { try { title = new URL(g('url')).hostname.replace(/^www\./, '') } catch { title = g('url') } }
  S.vault.entries.push({ id: uid(), type: 'login', title: title || 'Imported login', url: g('url'), user: g('user'), pass: g('pass'), notes: g('notes'), totp: g('totp'), created: now, updated: now, pwAt: now, fav: false }); n++;
 }
 await saveVault(); render(); toast(`Imported ${n} login${n === 1 ? '' : 's'}${skip ? ` · ${skip} duplicates skipped` : ''}`);
}
let importTarget = null;
Object.assign(ACT, {
 vFilter: d => { VS.filter = VS.filter === d.f && d.f !== 'all' ? 'all' : d.f; render() },
 vLock: () => lockVault(),
 vAdd: () => editEntry(null, 'login'),
 vType: d => { const m = topModal(); m.close(); editEntry(null, d.t) },
 vOpen: (d, el, e) => { if (e.target.closest('[data-act=vCopyPw]')) return; entryModal(d.id) },
 vCopyPw: (d, el, e) => { e.stopPropagation(); const x = S.vault.entries.find(v => v.id === d.id); x && copySecret(x.pass, 'Password copied') },
 vReveal: (d, el) => { const s = el.parentNode.querySelector('[data-sec="1"]'); if (!s) return; const shown = s.dataset.shown === '1'; s.textContent = shown ? '••••••••••' : s.dataset.v; s.dataset.shown = shown ? '0' : '1'; el.innerHTML = ic(shown ? 'eye' : 'eyeoff', 18) },
 vCopyF: (d, el) => { const m = el.closest('.modal').parentNode, x = S.vault.entries.find(v => v.id === m.dataset.eid); if (x) copySecret(x[d.k], 'Copied') },
 vCopyTotp: (d, el) => { const m = el.closest('.mwrap'); m.dataset.code && copyText(m.dataset.code, 'Code copied') },
 vEdit: d => { topModal().close(); editEntry(d.id) },
 vFav: async d => { const x = S.vault.entries.find(v => v.id === d.id); x.fav = !x.fav; await saveVault(); topModal().close(); render(); entryModal(d.id) },
 vDel: async d => { const m = topModal(); if (!await ask('Delete this item?', { body: 'It will be removed from your vault for good.', ok: 'Delete', danger: true })) return; S.vault.entries = S.vault.entries.filter(v => v.id !== d.id); await saveVault(); m.close(); render(); toast('Deleted') },
 vGen: () => genModal(null),
 gMode: d => { const m = topModal(); m._st.mode = d.m; m._draw() },
 gNew: () => topModal()._gen(), gCopy: () => copyText(topModal()._val, 'Password copied'),
 gUse: () => { const m = topModal(), v = m._val, cb = m._use; m.close(); cb && cb(v) },
 pwShow: (d, el) => { const i = el.parentNode.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; el.innerHTML = ic(i.type === 'password' ? 'eye' : 'eyeoff', 18) },
 pwGen: (d, el) => { const i = el.parentNode.querySelector('input'), box = el.closest('.fld').querySelector('.pwm'); genModal(v => { i.value = v; i.type = 'text'; box.innerHTML = meterHTML(v) }) },
 vImport: () => { importTarget = 'csv'; $('#anyIn').accept = '.csv,text/csv'; $('#anyIn').click() },
 vMore: () => {
  const m = modal(`<h3>Vault options</h3><div style="display:grid;gap:8px">
   <button class="btn wrap" data-act="vImport">${ic('upload', 18)}Import from CSV (Chrome, Edge, Safari, Bitwarden, 1Password…)</button>
   <button class="btn wrap" data-act="vExportEnc">${ic('download', 18)}Download encrypted backup</button>
   <button class="btn wrap" data-act="vExportCsv">${ic('warn', 18)}Export as plain CSV</button>
   <button class="btn wrap" data-act="vChange">${ic('key', 18)}Change master password</button>
   <label class="sw" style="padding:4px 2px"><input type="checkbox" data-set="vaultSync" ${setting('vaultSync') ? 'checked' : ''}>Sync the encrypted vault to my linked devices</label>
   <label class="fld" style="margin-top:6px"><span>Also lock vault and Hidden after (they always lock when you leave DESk)</span><select data-set="lockMin">${[1, 2, 5, 10, 15, 30, 60].map(n => `<option value="${n}" ${setting('lockMin') == n ? 'selected' : ''}>${n} minute${n > 1 ? 's' : ''} idle</option>`).join('')}</select></label>
   <button class="btn danger wrap" data-act="vReset">${ic('trash', 18)}Erase vault on this device</button></div>
   <div class="row end" style="margin-top:14px"><button class="btn ghost" data-close>Done</button></div>`);
 },
 vExportEnc: () => saveBlob(new Blob([JSON.stringify({ desk: 'vault', v: 1, ...S.vaultRec })], { type: 'application/json' }), `DESk-vault-backup-${new Date().toISOString().slice(0, 10)}.json`),
 vExportCsv: async () => {
  if (!await ask('Export unencrypted?', { body: 'Anyone who opens this CSV can read every password. Delete it after you use it.', ok: 'Export', danger: true })) return;
  const q = v => '"' + String(v || '').replace(/"/g, '""') + '"';
  const csv = ['name,url,username,password,totp,note', ...S.vault.entries.filter(e => e.type === 'login' || e.type === 'wifi').map(e => [e.title, e.url, e.user, e.pass, e.totp, e.notes].map(q).join(','))].join('\n');
  saveBlob(new Blob([csv], { type: 'text/csv' }), 'DESk-passwords.csv');
 },
 vChange: () => {
  const m = modal(`<h3>Change master password</h3><form data-form="vChange"><label class="fld"><span>Current password</span><input type="password" name="o" required autocomplete="current-password"></label>
   <label class="fld"><span>New password</span><input type="password" name="n" required minlength="8" autocomplete="new-password"></label><label class="fld"><span>Confirm new password</span><input type="password" name="c" required autocomplete="new-password"></label>
   <div class="row end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn pri">Change</button></div></form>`);
 },
 vReset: async () => { if (!await ask('Erase the vault?', { body: 'All saved passwords on this device will be deleted. This can’t be undone.', input: 'Type ERASE to confirm', ok: 'Erase', danger: true }) === 'ERASE') return; await dbDel('kv', 'vault'); S.vaultRec = null; lockVault(); $$('#modal-root .mwrap').forEach(w => w.close()); render(); toast('Vault erased') }
});
async function copySecret(v, label) { if (await copyText(v, label + ' · clears in 30 s')) setTimeout(() => { try { navigator.clipboard.writeText('').catch(() => { }) } catch { } }, 30000) }

Object.assign(FORMS, {
 vaultCreate: async f => {
  const a = $('#vp1').value, b = $('#vp2').value;
  if (a.length < 8) return toast('Use at least 8 characters', 'err');
  if (a !== b) return toast('Passwords don’t match', 'err');
  if (pwScore(a).s < 2 && !await ask('That master password is weak', { body: 'A longer passphrase is much harder to guess. Use it anyway?', ok: 'Use anyway' })) return;
  await createVault(a, $('#vph').value.trim()); toast('Vault created'); render();
 },
 vaultUnlock: async () => {
  const err = $('#vErr');
  if (Date.now() < VS.until) { err.textContent = `Too many attempts — wait ${Math.ceil((VS.until - Date.now()) / 1000)} s`; return }
  try { err.textContent = 'Unlocking…'; await unlockVault($('#vpu').value); VS.fail = 0; render() }
  catch { VS.fail++; if (VS.fail >= 5) VS.until = Date.now() + 30000 * 2 ** (VS.fail - 5); err.textContent = 'Wrong master password' + (VS.fail >= 3 ? ` (${VS.fail} attempts)` : '') }
 },
 vSave: (f, m) => saveEntry(f, m),
 vChange: async (f, m) => {
  const fd = new FormData(f); if (fd.get('n') !== fd.get('c')) return toast('New passwords don’t match', 'err');
  try { await decJSON(await deriveKey(fd.get('o'), unb64(S.vaultRec.salt), S.vaultRec.iter), S.vaultRec.data) } catch { return toast('Current password is wrong', 'err') }
  const salt = crypto.getRandomValues(new Uint8Array(16)); S.vaultRec.salt = b64(salt); S.vaultRec.iter = 310000; S.vaultKey = await deriveKey(fd.get('n'), salt, 310000);
  await saveVault(); m.close(); toast('Master password changed');
 }
});

/* ================= HIDDEN FOLDER ================= */
const HS = { buf: '', stage: '', first: '', fail: 0, until: 0, kind: 'pin', pending: null };
async function hiddenCfg() { return S.hiddenCfgCache !== undefined ? S.hiddenCfgCache : (S.hiddenCfgCache = await kvGet('hiddenCfg')) }
async function setupHidden(kind, secret) {
 const dk = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
 const raw = new Uint8Array(await crypto.subtle.exportKey('raw', dk)), salt = crypto.getRandomValues(new Uint8Array(16));
 const kek = await deriveKey(secret, salt, 310000), w = await aesEnc(kek, raw);
 const cfg = { kind, pinLen: kind === 'pin' ? secret.length : 0, salt: b64(salt), iter: 310000, wrapped: { iv: b64(w.iv), ct: b64(w.ct) }, created: Date.now() };
 await kvSet('hiddenCfg', cfg); S.hiddenCfgCache = cfg;
 await openHidden(raw);
}
async function openHidden(raw) {
 S.hiddenRaw = raw; S.hiddenDK = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
 const recs = await dbAll('hidden'); S.hiddenItems = [];
 for (const r of recs) { try { S.hiddenItems.push({ id: r.id, size: r.size, at: r.at, meta: await decJSON(S.hiddenDK, r.m) }) } catch { } }
 if (HS.pending) { const ids = HS.pending; HS.pending = null; await hideFiles(ids) }
}
async function unlockHidden(secret) {
 const c = await hiddenCfg(), kek = await deriveKey(secret, unb64(c.salt), c.iter);
 const raw = new Uint8Array(await aesDec(kek, unb64(c.wrapped.iv), unb64(c.wrapped.ct)));
 await openHidden(raw);
}
function lockHidden() { S.hiddenDK = null; S.hiddenRaw = null; S.hiddenItems = null; HS.buf = ''; if (S.view === 'hidden') render() }
async function hideBlob(blob, meta) {
 const id = uid(), m = await encJSON(S.hiddenDK, meta), b = await aesEnc(S.hiddenDK, await blob.arrayBuffer());
 await dbPut('hidden', id, { id, m, b: { iv: b.iv, ct: b.ct }, size: blob.size, at: Date.now() });
 S.hiddenItems.push({ id, size: blob.size, at: Date.now(), meta });
}
async function hideFiles(ids) {
 const cfg = await hiddenCfg();
 if (!cfg || !S.hiddenDK) { HS.pending = ids; toast(cfg ? 'Unlock Hidden to move these files' : 'Set up a PIN or password for Hidden first'); go('hidden'); return }
 let n = 0;
 for (const id of ids) {
  const f = byId(id); if (!f) continue;
  const blob = await getBlob(f); if (!blob) { toast(f.name + ' isn’t on this device', 'err'); continue }
  await hideBlob(blob, { name: f.name, type: f.type, size: f.size, cat: f.cat, folder: f.folder, tags: f.tags, added: f.added, modified: f.modified, thumb: f.thumb, hash: f.hash, scanId: f.scanId });
  if (typeof tombstone === 'function') await tombstone(id);
  await dbDel('blobs', id); await dbDel('files', id); S.files = S.files.filter(x => x.id !== id); n++;
 }
 S.sel.clear(); if (n) toast(`${n} item${n > 1 ? 's' : ''} moved to Hidden and encrypted`); render();
}
async function hiddenBlob(id) { const r = await dbGet('hidden', id), it = S.hiddenItems.find(x => x.id === id); return new Blob([await aesDec(S.hiddenDK, r.b.iv, r.b.ct)], { type: it.meta.type || '' }) }
async function unhide(id) {
 const it = S.hiddenItems.find(x => x.id === id); if (!it) return;
 const blob = await hiddenBlob(id), mt = it.meta;
 const rec = await addFile(blob, { name: mt.name, type: mt.type, modified: mt.modified, thumb: mt.thumb, hash: mt.hash, scan: mt.scanId });
 if (mt.folder) rec.folder = mt.folder; if (mt.tags) rec.tags = mt.tags; await saveRec(rec);
 await dbDel('hidden', id); S.hiddenItems = S.hiddenItems.filter(x => x.id !== id);
 toast(`Restored to ${rec.folder}`); render(); syncSoon();
}
function pinPad() { return `<div class="pins">${Array.from({ length: Math.max(4, HS.buf.length) }, (_, i) => `<i class="${i < HS.buf.length ? 'f' : ''}"></i>`).join('')}</div>
 <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-act="pin" data-k="${n}">${n}</button>`).join('')}<button data-act="pin" data-k="del" aria-label="Delete">${ic('back', 24)}</button><button data-act="pin" data-k="0">0</button><button data-act="pin" data-k="ok" aria-label="Enter" style="background:var(--blue);color:#fff;border-color:var(--blue)">${ic('check', 24)}</button></div>`
}
VIEWS.hidden = () => {
 const cfg = S.hiddenCfgCache;
 if (!cfg) {
  if (!HS.stage) HS.stage = 'set1';
  return `<div class="lockbox"><span class="ib">${ic('eyeoff', 38)}</span><h1>Hidden folder</h1><p class="muted">Files you hide are encrypted (AES-256) and removed from the normal file list, search and stats. Choose how you’ll unlock it.</p>
  <div class="chips" style="justify-content:center"><button class="chip ${HS.kind === 'pin' ? 'on' : ''}" data-act="hKind" data-k="pin">PIN code</button><button class="chip ${HS.kind === 'pass' ? 'on' : ''}" data-act="hKind" data-k="pass">Password</button></div>
  ${HS.kind === 'pin' ? `<p class="b">${HS.stage === 'set2' ? 'Confirm your PIN' : 'Choose a 4–8 digit PIN'}</p>${pinPad()}` :
   `<form data-form="hSetPass"><label class="fld"><span>Password</span><input type="password" name="a" required minlength="6" autocomplete="new-password"></label><label class="fld"><span>Confirm password</span><input type="password" name="b" required autocomplete="new-password"></label><button class="btn pri">${ic('lock', 18)}Create Hidden folder</button></form>`}
  <p class="small muted">There’s no reset without the PIN or password — forgetting it means the hidden files are lost.</p></div>`;
 }
 if (!S.hiddenDK) {
  HS.stage = 'unlock';
  return `<div class="lockbox"><span class="ib">${ic('lock', 38)}</span><h1>Hidden is locked</h1>
  ${cfg.kind === 'pin' ? `<p class="muted">Enter your PIN</p>${pinPad()}` : `<form data-form="hUnlock"><label class="fld"><span>Password</span><input type="password" name="p" required autofocus autocomplete="current-password"></label><button class="btn pri">${ic('unlock', 18)}Unlock</button></form>`}
  <p class="small" id="hErr" style="color:var(--red);min-height:20px"></p><button class="btn ghost sm" data-act="hForgot">Forgot it?</button></div>`;
 }
 const items = S.hiddenItems.slice().sort((a, b) => b.at - a.at);
 return `<div class="sect" style="margin-top:6px"><div><h1>Hidden</h1><p class="muted">${items.length} encrypted item${items.length === 1 ? '' : 's'} · ${fmtB(items.reduce((a, b) => a + b.size, 0))}</p></div>
  <div class="row"><button class="btn" data-act="hChange">${ic('key', 18)}<span class="hide-s">Change ${cfg.kind === 'pin' ? 'PIN' : 'password'}</span></button><button class="btn" data-act="hLock">${ic('lock', 18)}Lock</button><button class="btn pri" data-act="hAdd">${ic('plus', 18)}Add files</button></div></div>
  <div class="card" style="margin-bottom:16px;display:flex;gap:12px;align-items:center"><span style="color:var(--blue2)">${ic('shield', 22)}</span><p class="small muted grow">Hidden files never sync or appear in search. Locks after ${setting('lockMin')} min idle. ${setting('stealth') ? 'Stealth mode is on: open Hidden by tapping the DESk logo 5 times.' : 'Tip: turn on stealth mode in Settings to remove Hidden from the menu.'}</p></div>
  ${items.length ? `<div class="fgrid">${items.map(it => { const f = { ...it.meta, thumb: it.meta.thumb }; return `<div class="fc" data-act="hOpen" data-id="${it.id}" role="button" tabindex="0"><div class="th">${thumbHTML(f, 40)}</div><div class="meta"><div class="nm">${esc(it.meta.name)}</div><div class="sub">${fmtB(it.size)} · hidden ${fmtD(it.at)}</div></div></div>` }).join('')}</div>`
   : `<div class="card empty">${ic('eyeoff', 44)}<h3>Nothing hidden yet</h3><p>Add files here directly, or pick files in the file manager and choose Hide.</p></div>`}`;
};
async function pinEnter() {
 const p = HS.buf, err = $('#hErr');
 if (HS.stage === 'unlock') {
  if (Date.now() < HS.until) { err && (err.textContent = `Too many attempts — wait ${Math.ceil((HS.until - Date.now()) / 1000)} s`); HS.buf = ''; return }
  try { await unlockHidden(p); HS.fail = 0; HS.buf = ''; render() }
  catch { HS.fail++; if (HS.fail >= 5) HS.until = Date.now() + 30000 * 2 ** (HS.fail - 5); HS.buf = ''; render(); const e2 = $('#hErr'); e2 && (e2.textContent = 'Wrong PIN' + (HS.fail >= 3 ? ` · ${HS.fail} attempts` : '')) }
 } else if (HS.stage === 'set1') { if (p.length < 4) return toast('Use at least 4 digits', 'err'); HS.first = p; HS.buf = ''; HS.stage = 'set2'; render() }
 else if (HS.stage === 'set2') { if (p !== HS.first) { toast('PINs don’t match — start again', 'err'); HS.stage = 'set1'; HS.buf = ''; return render() } HS.buf = ''; await setupHidden('pin', p); HS.stage = ''; toast('Hidden folder ready'); render() }
 else if (HS.stage === 'change1') { if (p.length < 4) return toast('Use at least 4 digits', 'err'); HS.first = p; HS.buf = ''; HS.stage = 'change2'; drawChangePad() }
 else if (HS.stage === 'change2') { if (p !== HS.first) { toast('PINs don’t match', 'err'); HS.stage = 'change1'; HS.buf = ''; return drawChangePad() } await rewrapHidden('pin', p); topModal() && topModal().close(); HS.stage = ''; HS.buf = ''; toast('PIN changed') }
}
async function rewrapHidden(kind, secret) {
 const salt = crypto.getRandomValues(new Uint8Array(16)), kek = await deriveKey(secret, salt, 310000), w = await aesEnc(kek, S.hiddenRaw);
 const cfg = { kind, pinLen: kind === 'pin' ? secret.length : 0, salt: b64(salt), iter: 310000, wrapped: { iv: b64(w.iv), ct: b64(w.ct) }, created: Date.now() };
 await kvSet('hiddenCfg', cfg); S.hiddenCfgCache = cfg;
}
function drawChangePad() { const m = topModal(); if (!m || !m.querySelector('#chPad')) return; m.querySelector('#chT').textContent = HS.stage === 'change2' ? 'Confirm new PIN' : 'Choose a new 4–8 digit PIN'; m.querySelector('#chPad').innerHTML = pinPad() }
function hiddenItemModal(id) {
 const it = S.hiddenItems.find(x => x.id === id); if (!it) return; let url = null;
 const m = modal(`<div class="mhead"><h3>${esc(it.meta.name)}</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><div class="pvm" id="hpv"><span class="muted">Decrypting…</span></div>
  <div class="row" style="margin-top:14px"><button class="btn" data-act="hUnhide" data-id="${id}">${ic('eye', 18)}Unhide</button><button class="btn" data-act="hDl" data-id="${id}">${ic('download', 18)}Download</button><span class="grow"></span><button class="btn danger" data-act="hDel" data-id="${id}">${ic('trash', 18)}Delete</button></div>`, { cls: 'mid', onClose: () => url && URL.revokeObjectURL(url) });
 hiddenBlob(id).then(async b => {
  const box = m.querySelector('#hpv'), t = it.meta.type || ''; url = URL.createObjectURL(b);
  if (t.startsWith('image/')) { box.innerHTML = ''; const im = new Image(); im.src = url; im.alt = ''; box.appendChild(im) }
  else if (t.startsWith('video/')) { box.innerHTML = ''; const v = document.createElement('video'); v.controls = true; v.src = url; box.appendChild(v) }
  else if (t.startsWith('audio/')) { box.innerHTML = ''; const a = document.createElement('audio'); a.controls = true; a.src = url; box.appendChild(a) }
  else if (TEXTY.test(t) && b.size < 2e6) { box.innerHTML = '<pre></pre>'; box.firstChild.textContent = await b.text() }
  else box.innerHTML = `<div class="empty">${ic('file', 44)}<h3>${fmtB(b.size)}</h3><p>Download or unhide to open this file.</p></div>`;
 }).catch(() => m.querySelector('#hpv').innerHTML = '<p class="muted">Couldn’t decrypt this item.</p>');
}
Object.assign(ACT, {
 hKind: d => { HS.kind = d.k; HS.buf = ''; HS.stage = 'set1'; render() },
 pin: d => {
  if (d.k === 'del') HS.buf = HS.buf.slice(0, -1); else if (d.k === 'ok') return pinEnter(); else if (HS.buf.length < 8) HS.buf += d.k;
  const pad = $('.pins', topModal() && topModal().querySelector('#chPad') ? topModal() : document);
  if (pad) pad.outerHTML = `<div class="pins">${Array.from({ length: Math.max(4, HS.buf.length) }, (_, i) => `<i class="${i < HS.buf.length ? 'f' : ''}"></i>`).join('')}</div>`;
  const cfg = S.hiddenCfgCache; if (HS.stage === 'unlock' && cfg && HS.buf.length >= 4 && cfg.pinLen === HS.buf.length) pinEnter();
 },
 hLock: () => lockHidden(),
 hAdd: () => $('#hidIn').click(),
 hOpen: d => hiddenItemModal(d.id),
 hUnhide: async d => { topModal().close(); await unhide(d.id) },
 hDl: async d => { const it = S.hiddenItems.find(x => x.id === d.id); saveBlob(await hiddenBlob(d.id), it.meta.name) },
 hDel: async d => { if (!await ask('Delete permanently?', { body: 'This hidden file will be destroyed.', ok: 'Delete', danger: true })) return; await dbDel('hidden', d.id); S.hiddenItems = S.hiddenItems.filter(x => x.id !== d.id); $$('#modal-root .mwrap').forEach(w => w.close()); render() },
 hChange: () => {
  const cfg = S.hiddenCfgCache;
  if (cfg.kind === 'pin') { HS.stage = 'change1'; HS.buf = ''; modal(`<h3 id="chT" style="text-align:center">Choose a new 4–8 digit PIN</h3><div id="chPad" style="display:grid;gap:16px">${pinPad()}</div><div class="row" style="margin-top:18px;justify-content:center"><button class="btn sm" data-act="hSwitchPass">Use a password instead</button><button class="btn ghost" data-close>Cancel</button></div>`, { onClose: () => { HS.stage = ''; HS.buf = '' } }) }
  else ACT.hSwitchPass();
 },
 hSwitchPass: () => { const t = topModal(); t && t.close(); modal(`<h3>New Hidden password</h3><form data-form="hChangePass"><label class="fld"><span>Password</span><input type="password" name="a" required minlength="6" autocomplete="new-password"></label><label class="fld"><span>Confirm</span><input type="password" name="b" required autocomplete="new-password"></label><div class="row end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn pri">Save</button></div></form>`) },
 hForgot: async () => {
  if (await ask('Reset Hidden?', { body: 'Without the PIN or password the encrypted files can’t be opened. Resetting deletes every hidden file on this device.', input: 'Type DELETE to confirm', ok: 'Reset', danger: true }) !== 'DELETE') return;
  await dbClear('hidden'); await dbDel('kv', 'hiddenCfg'); S.hiddenCfgCache = null; HS.stage = 'set1'; render(); toast('Hidden folder reset');
 }
});
Object.assign(FORMS, {
 hSetPass: async f => { const fd = new FormData(f); if (fd.get('a') !== fd.get('b')) return toast('Passwords don’t match', 'err'); await setupHidden('pass', fd.get('a')); toast('Hidden folder ready'); render() },
 hUnlock: async f => { const err = $('#hErr'); if (Date.now() < HS.until) { err.textContent = `Too many attempts — wait ${Math.ceil((HS.until - Date.now()) / 1000)} s`; return } try { await unlockHidden(new FormData(f).get('p')); HS.fail = 0; render() } catch { HS.fail++; if (HS.fail >= 5) HS.until = Date.now() + 30000 * 2 ** (HS.fail - 5); err.textContent = 'Wrong password' } },
 hChangePass: async (f, m) => { const fd = new FormData(f); if (fd.get('a') !== fd.get('b')) return toast('Passwords don’t match', 'err'); await rewrapHidden('pass', fd.get('a')); m.close(); toast('Password changed'); render() }
});

/* ================= DEVICE SYNC (no account, no server of our own) =================
 Modelled on BAZINGA!'s sync. A "sync key" (a long random secret made on the first device) is the only
 thing that ties devices together. Other devices join by scanning a QR code, opening a link, or typing
 a short code that works once for 15 minutes.
 Transport: the free public ntfy.sh relay (or your own ntfy server: window.DESK_CONFIG.syncRelay).
 Everything is compressed and ENCRYPTED on the device (AES-GCM, key derived from the sync key) and
 posted to a topic whose name is a one-way hash of that key — the relay only sees unreadable bytes.
 • The library (file list, folders, tags, scans list, settings, profile, encrypted vault, devices) goes
   out as a full copy every ~2 h and as small "delta" messages within seconds of a change.
 • File contents travel separately, in encrypted parts: new files are offered right away; a device
   that is missing a file asks for it ("want") and any linked device that has it answers.
 • Copies on ntfy.sh last about 3 hours; every device keeps its own full copy. Hidden files never sync. */
const SY = { status: 'off', error: '', lastSync: 0, link: null, keys: null, running: null, again: false, started: false, devices: {}, haves: {}, devicesDirty: false, mine: new Set(), es: null, avail: {}, wantSent: {}, pushedAt: {}, pushQ: new Set(), abort: null, cancelled: false, tomb: {} };
const RELAY = () => ((window.DESK_CONFIG || {}).syncRelay || 'https://ntfy.sh').replace(/\/$/, '');
const syncAvailable = () => !!(window.crypto && crypto.subtle) && ONLINE_APP();
const linked = () => !!(SY.link && SY.link.secret);
const DEVID = () => S.deviceId;
const SYNC_SETTINGS = ['skipDupes', 'autoEmptyDays', 'lockMin', 'stealth', 'vaultSync'];
const RELAY_MAX = () => (window.DESK_CONFIG && DESK_CONFIG.relayMaxMB || 15) * 1048576;   // largest file sent through the relay
let PART = 1536 * 1024; const MIN_PART = 64 * 1024;                                          // ntfy.sh free tier: files up to ~2 MB
const sig = () => SY.abort && SY.abort.signal;
const isAbort = e => e && (e.name === 'AbortError' || /abort/i.test(e.message || ''));
let progressCb = null; const step = (label, pct) => progressCb && progressCb(label, pct);

/* ---------- device naming ---------- */
function deviceInfo() {
 const ua = navigator.userAgent;
 const os = /iPhone|iPod/.test(ua) ? 'iPhone' : /iPad/.test(ua) || (/Mac OS X/.test(ua) && navigator.maxTouchPoints > 1) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'device';
 const br = /EdgA?\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Firefox\/|FxiOS/.test(ua) ? 'Firefox' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
 const type = os === 'iPad' || /Tablet/.test(ua) || (os === 'Android' && !/Mobile/.test(ua)) ? 'tablet' : /Mobi|iPhone|Android/.test(ua) ? 'phone' : 'desktop';
 return { os, br, type };
}
const autoName = () => { const i = deviceInfo(); return `${i.br} on ${i.os}` };
const devIcon = t => t === 'phone' ? 'phone' : t === 'tablet' ? 'tablet' : 'laptop';
function deviceLabel(id) { const d = SY.devices[id]; return d ? d.name : 'another device' }

/* ---------- devices list (names, paused, removed) — newest change wins, like BAZINGA! ---------- */
const saveDevices = () => { kvSet('syncDevices', SY.devices); kvSet('syncHaves', SY.haves) };
function ensureMe() {
 const me = SY.devices[DEVID()], i = deviceInfo();
 if (!me || (me.removed && (me.ts || 0) <= (SY.link && SY.link.since || 0))) { SY.devices[DEVID()] = { name: S.deviceName || autoName(), autoName: autoName(), auto: !S.deviceNameSet, type: i.type, os: i.os, br: i.br, ts: Date.now(), lastSeen: Date.now() }; SY.devicesDirty = true; saveDevices() }
}
function mergeDevices(L = {}, R = {}) {
 const out = { ...L };
 for (const [id, r] of Object.entries(R || {})) { const l = out[id]; if (!l) { out[id] = { ...r }; continue } const win = (r.ts || 0) > (l.ts || 0) ? r : l; out[id] = { ...win, lastSeen: Math.max(l.lastSeen || 0, r.lastSeen || 0) } }
 return out;
}
function mergeHaves(L = {}, R = {}) { const out = { ...L }; for (const [id, r] of Object.entries(R || {})) if (!out[id] || (r.ts || 0) > (out[id].ts || 0)) out[id] = r; return out }
function myHave() { return live().filter(f => !f.offloaded).map(f => f.id).sort() }
function refreshHave(force) {
 const ids = myHave(), cur = SY.haves[DEVID()];
 if (force || !cur || cur.ids.join() !== ids.join()) { SY.haves[DEVID()] = { ts: Date.now(), ids }; saveDevices(); return true }
 return false;
}
const isPaused = () => !!(SY.devices[DEVID()] && SY.devices[DEVID()].paused);
function listDevices() { return Object.entries(SY.devices).filter(([, d]) => !d.removed).map(([id, d]) => ({ id, ...d, me: id === DEVID() })).sort((a, b) => (b.me - a.me) || ((b.lastSeen || 0) - (a.lastSeen || 0))) }
function holdersOf(fid) { return Object.entries(SY.haves).filter(([id, h]) => id !== DEVID() && SY.devices[id] && !SY.devices[id].removed && h.ids && h.ids.includes(fid)).map(([id]) => id) }
let devT = 0;
function editDevice(id, patch) { if (!SY.devices[id]) return; SY.devices[id] = { ...SY.devices[id], ...patch, ts: Date.now() }; SY.devicesDirty = true; saveDevices(); renderIf('devices'); clearTimeout(devT); devT = setTimeout(() => syncNow(), 600) }

/* ---------- keys ---------- */
const b64url = bytes => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = s => unb64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
const hexOf = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const shaS = s => crypto.subtle.digest('SHA-256', te.encode(s));
async function derive(secret) { return { id: hexOf(await shaS('desk-sync-id:' + secret)), key: await crypto.subtle.importKey('raw', await shaS('desk-sync-key:' + secret), 'AES-GCM', false, ['encrypt', 'decrypt']) } }
const newSecret = () => b64url(crypto.getRandomValues(new Uint8Array(16)));
const cleanSecret = s => String(s || '').trim().replace(/[^A-Za-z0-9_-]/g, '');
const cleanCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
const appBase = () => location.origin + location.pathname;
const linkURL = () => SY.link ? `${appBase()}#/link/${SY.link.secret}` : '';
const codeURL = code => `${appBase()}#/c/${code}`;
const prettyCode = c => c.length === 8 ? c.slice(0, 4) + '-' + c.slice(4) : c;
const topicOf = id => 'dk' + id.slice(0, 40);

/* ---------- format: gzip → AES-GCM (JSON) · raw AES-GCM (file parts) ---------- */
async function gz(bytes) { if ('CompressionStream' in window) { try { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()) } catch { } } return bytes }
async function gunz(u8) { if (u8[0] === 0x1f && u8[1] === 0x8b) { if (!('DecompressionStream' in window)) throw new Error('Update this browser to open synced data.'); return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()) } return u8 }
async function sealBytes(key, bytes, kind = 2) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes)); const out = new Uint8Array(13 + ct.length); out[0] = kind; out.set(iv, 1); out.set(ct, 13); return out }
async function openBytes(key, u) { if (u[0] !== 1 && u[0] !== 2) throw new Error('Made by a newer DESk — refresh to update.'); const p = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(1, 13) }, key, u.subarray(13))); return u[0] === 1 ? JSON.parse(td.decode(await gunz(p))) : p }
const seal = async (obj, key = SY.keys.key) => sealBytes(key, await gz(te.encode(JSON.stringify(obj))), 1);
const openJ = (u, key = SY.keys.key) => openBytes(key, u);

/* ---------- the relay (ntfy) — only "simple" requests, so no CORS pre-checks ---------- */
async function relayList(topic, since = 'all') {
 const r = await fetch(`${RELAY()}/${topic}/json?poll=1&since=${since}`, { cache: 'no-store', signal: sig() });
 if (!r.ok) throw new Error(r.status === 429 ? 'Sync is busy — will try again shortly.' : `Sync relay error (${r.status})`);
 return (await r.text()).split('\n').filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(m => m && m.event === 'message').sort((a, b) => a.time - b.time);
}
async function relayPost(topic, body, params = {}) {
 const r = await fetch(`${RELAY()}/${topic}?${new URLSearchParams({ firebase: 'no', ...params })}`, { method: 'POST', body, signal: sig() });
 if (!r.ok) { const e = new Error(r.status === 413 ? 'Too big for the free sync relay.' : r.status === 429 ? 'Sync is busy — will try again shortly.' : `Sync relay error (${r.status})`); e.tooBig = r.status === 413; e.busy = r.status === 429; throw e }
 const res = await r.json(); if (res && res.id) { SY.mine.add(res.id); if (SY.mine.size > 400) SY.mine.delete(SY.mine.values().next().value) } return res;
}
const liveFile = m => m.attachment && m.attachment.url && (!m.attachment.expires || m.attachment.expires * 1000 > Date.now() + 30e3);
async function fetchBytes(url, onProg) {
 const r = await fetch(url, { cache: 'no-store', signal: sig() }); if (!r.ok) throw new Error('Couldn’t download from the sync relay — will try again.');
 const total = +r.headers.get('content-length') || 0;
 if (!r.body || !total || !onProg) return new Uint8Array(await r.arrayBuffer());
 const rd = r.body.getReader(), chunks = []; let got = 0;
 for (; ;) { const { done, value } = await rd.read(); if (done) break; chunks.push(value); got += value.length; onProg(got / total) }
 const out = new Uint8Array(got); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length } return out;
}
// Big payloads go in parts named <prefix>.<set>.<i>of<n>.bz; parts shrink automatically if the relay says "too big"
async function postParts(topic, prefix, bytesList, title) {
 const set = uid(6); let res = null;
 for (let i = 0; i < bytesList.length; i++) { res = await relayPost(topic, new Blob([bytesList[i]]), { filename: `${prefix}.${set}.${i + 1}of${bytesList.length}.bz`, title: title || S.deviceName }) }
 return res;
}
async function postLibrary(topic, sealed) {
 for (; ;) {
  try {
   if (sealed.length <= PART) return await relayPost(topic, new Blob([sealed]), { filename: 'library.bz', title: S.deviceName });
   const parts = []; for (let i = 0; i < sealed.length; i += PART) parts.push(sealed.subarray(i, i + PART));
   step(`Sending your library in ${parts.length} parts…`, 92);
   return await postParts(topic, 'library', parts);
  } catch (e) {
   if (!e.tooBig) throw e;
   if (PART > MIN_PART) { PART = Math.max(MIN_PART, Math.floor(Math.min(PART, sealed.length) / 2)); continue }
   const err = new Error('The free sync relay is full for the moment. Your devices will catch up automatically within a few hours.'); err.later = true; throw err;
  }
 }
}
const partOf = m => { const x = /^(library|c\.[a-z0-9]+|p)\.(\w+)\.(\d+)of(\d+)\.bz$/.exec(m && m.attachment && m.attachment.name || ''); return x ? { prefix: x[1], set: x[2], i: +x[3], n: +x[4] } : null };
async function fetchLibrary(topic, latest) {
 if (latest.attachment.name === 'library.bz') return fetchBytes(latest.attachment.url, p => step('Downloading your library…', 15 + 50 * p));
 const all = (await relayList(topic, 'all')).filter(liveFile), sets = new Map();
 for (const m of all) { const q = partOf(m); if (!q || q.prefix !== 'library') continue; const g = sets.get(q.set) || { n: q.n, parts: new Map(), time: 0 }; g.parts.set(q.i, m); g.time = Math.max(g.time, m.time); sets.set(q.set, g) }
 const done = [...sets.values()].filter(g => g.parts.size === g.n).sort((a, b) => b.time - a.time)[0];
 if (!done || done.time < latest.time - 120) return null;
 let got = 0;
 const bufs = await Promise.all([...Array(done.n).keys()].map(async k => { const b = await fetchBytes(done.parts.get(k + 1).attachment.url); got++; step(`Downloading your library… part ${got} of ${done.n}`, 15 + 50 * got / done.n); return b }));
 const out = new Uint8Array(bufs.reduce((a, b) => a + b.length, 0)); let o = 0; for (const b of bufs) { out.set(b, o); o += b.length } return out;
}

/* ---------- snapshot, deltas, merge ---------- */
const metaOf = r => ({ id: r.id, name: r.name, type: r.type, size: r.size, cat: r.cat, folder: r.folder, tags: r.tags, added: r.added, modified: r.modified, hash: r.hash, fav: !!r.fav, scanId: r.scanId || null, mini: r.mini || null, mt: r.mt || r.added, trashed: r.trashed || 0, userFolder: !!r.userFolder, src: r.device || null });
const scanMeta = s => ({ id: s.id, name: s.name, kind: s.kind, created: s.created, updated: s.updated, fileId: s.fileId, n: s.pages ? s.pages.length : (s.n || 0), mini: s.mini || null });
function localSnap() {
 const vals = {}, ts = {};
 for (const k of SYNC_SETTINGS) if (S.settings[k] !== undefined) { vals[k] = S.settings[k]; ts[k] = (S.settingsTs || {})[k] || 1 }
 return {
  app: 'DESk', v: 1,
  files: S.files.map(metaOf).sort((a, b) => a.id < b.id ? -1 : 1),
  scans: S.scans.map(scanMeta).sort((a, b) => a.id < b.id ? -1 : 1),
  tomb: { ...SY.tomb },
  profile: S.profile ? { username: S.profile.username || '', picture: S.profile.picture || '', updatedAt: S.profile.updatedAt || 0 } : null,
  settings: { values: vals, ts },
  vault: setting('vaultSync') && S.vaultRec && S.vaultRec.data ? { ...S.vaultRec } : null,
  devices: SY.devices, haves: SY.haves
 };
}
function snapHash(s) { const x = JSON.stringify([s.files, s.scans, s.tomb, s.profile, s.settings, s.vault && s.vault.mt]); let h = 2166136261; for (let i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(36) + ':' + x.length }
function changesSince(s, t) {
 const after = x => (x || 0) > t;
 const d = { t: 'delta', dev: DEVID(), files: s.files.filter(f => after(f.mt)), scans: s.scans.filter(x => after(x.updated)), tomb: Object.fromEntries(Object.entries(s.tomb).filter(([, v]) => after(v))), profile: s.profile && after(s.profile.updatedAt) ? s.profile : null, settings: null, vault: s.vault && after(s.vault.mt) ? s.vault : null };
 const sk = Object.keys(s.settings.ts).filter(k => after(s.settings.ts[k])); if (sk.length) d.settings = { values: Object.fromEntries(sk.map(k => [k, s.settings.values[k]])), ts: Object.fromEntries(sk.map(k => [k, s.settings.ts[k]])) };
 const empty = !d.files.length && !d.scans.length && !Object.keys(d.tomb).length && !d.profile && !d.settings && !d.vault;
 return empty ? null : d;
}
function mergeSettings(L, R) { if (!R) return L; if (!L) return R; const values = { ...L.values }, ts = { ...L.ts }; for (const [k, v] of Object.entries(R.values || {})) { const rt = (R.ts || {})[k] || 0; if (!(k in values) || rt > (ts[k] || 0)) { values[k] = v; ts[k] = rt } } return { values, ts } }
function mergeVault(L, R) { if (!R) return L; if (!L) return R; if (L.vid !== R.vid) return L; return (R.mt || 0) > (L.mt || 0) ? R : L }
function merge(L, R) {
 const tomb = { ...(L.tomb || {}) }; for (const [id, t] of Object.entries(R.tomb || {})) tomb[id] = Math.max(tomb[id] || 0, t);
 const unite = (a, b, stamp, combine) => { const A = new Map((a || []).map(x => [x.id, x])), B = new Map((b || []).map(x => [x.id, x])), out = []; for (const id of new Set([...A.keys(), ...B.keys()])) { const x = A.get(id) && B.get(id) ? combine(A.get(id), B.get(id)) : (A.get(id) || B.get(id)); if (tomb[id] && tomb[id] >= stamp(x)) continue; out.push(x) } return out.sort((p, q) => p.id < q.id ? -1 : 1) };
 const files = unite(L.files, R.files, x => x.mt || 0, (a, b) => { const n = (a.mt || 0) >= (b.mt || 0) ? a : b, o = n === a ? b : a; return { ...n, mini: n.mini || o.mini } });
 const ids = new Set(files.map(f => f.id));
 const scans = unite(L.scans, R.scans, x => x.updated || 0, (a, b) => (a.updated || 0) >= (b.updated || 0) ? a : b).filter(s => ids.has(s.fileId));
 const lp = L.profile, rp = R.profile;
 return { app: 'DESk', v: 1, files, scans, tomb, profile: lp && rp ? ((rp.updatedAt || 0) > (lp.updatedAt || 0) ? rp : lp) : (lp || rp || null), settings: mergeSettings(L.settings, R.settings), vault: mergeVault(L.vault, R.vault), devices: mergeDevices(L.devices, R.devices), haves: mergeHaves(L.haves, R.haves) };
}
async function applyLocal(m) {
 SY.tomb = m.tomb || {}; await kvSet('syncTomb', SY.tomb);
 // permanent deletes / hides from other devices
 for (const f of S.files.slice()) { const t = SY.tomb[f.id]; if (t && t >= (f.mt || 0)) { await dbDel('blobs', f.id); await dbDel('files', f.id); S.files = S.files.filter(x => x.id !== f.id) } }
 for (const r of m.files) {
  const l = byId(r.id);
  if (l) {
   if ((r.mt || 0) > (l.mt || 0)) { Object.assign(l, { name: String(r.name), folder: String(r.folder), cat: CATS[r.cat] ? r.cat : l.cat, tags: Array.isArray(r.tags) ? r.tags.map(String) : l.tags, fav: !!r.fav, trashed: +r.trashed || 0, userFolder: !!r.userFolder, mt: r.mt, dirty: false }); if (!l.thumb && safeThumb(r.mini)) l.thumb = r.mini; if (r.hash && l.hash && r.hash !== l.hash) { l.hash = String(r.hash); l.size = +r.size || l.size; l.thumb = safeThumb(r.mini) || l.thumb; l.mini = safeThumb(r.mini) || l.mini; await dbDel('blobs', l.id); l.offloaded = true; l.sent = 0 } await saveRec(l) }
   continue;
  }
  const rec = { id: String(r.id), name: String(r.name || 'file'), type: String(r.type || ''), size: +r.size || 0, cat: CATS[r.cat] ? r.cat : 'Other', folder: String(r.folder || 'Other'), tags: Array.isArray(r.tags) ? r.tags.map(String) : [], added: +r.added || Date.now(), modified: +r.modified || Date.now(), opened: 0, hash: String(r.hash || ''), origin: 'sync', device: r.src ? String(r.src) : null, scanId: r.scanId || null, thumb: safeThumb(r.mini), mini: safeThumb(r.mini), trashed: +r.trashed || 0, fav: !!r.fav, mt: r.mt || Date.now(), userFolder: !!r.userFolder, dirty: false, offloaded: true };
  S.files.push(rec); await saveRec(rec);
 }
 for (const s of m.scans || []) {
  const l = S.scans.find(x => x.id === s.id);
  if (!l) { const doc = { ...s, pages: null }; S.scans.push(doc); await dbPut('scans', s.id, doc) }
  else if ((s.updated || 0) > (l.updated || 0)) { Object.assign(l, { name: s.name, kind: s.kind, updated: s.updated, n: s.n, mini: s.mini || l.mini }); if (l.pages) l.stale = true; await dbPut('scans', l.id, l) }
 }
 if (m.profile && (!S.profile || (m.profile.updatedAt || 0) > (S.profile.updatedAt || 0))) { S.profile = { ...(S.profile || {}), username: String(m.profile.username || (S.profile || {}).username || 'Me'), picture: safeThumb(m.profile.picture) || '', updatedAt: m.profile.updatedAt }; await kvSet('profile', S.profile) }
 if (m.settings) { let ch = false; S.settingsTs = S.settingsTs || {}; for (const [k, v] of Object.entries(m.settings.values)) { if (!SYNC_SETTINGS.includes(k)) continue; const rt = m.settings.ts[k] || 0; if (rt > (S.settingsTs[k] || 0)) { S.settings[k] = v; S.settingsTs[k] = rt; ch = true } } if (ch) { await kvSet('settings', S.settings); await kvSet('settingsTs', S.settingsTs) } }
 if (m.vault && (!S.vaultRec || (m.vault.vid === S.vaultRec.vid && (m.vault.mt || 0) > (S.vaultRec.mt || 0)))) {
  const prev = S.vaultRec; S.vaultRec = { ...m.vault }; await kvSet('vault', S.vaultRec);
  if (S.vault && S.vaultKey) { try { if (prev && prev.salt !== S.vaultRec.salt) throw 0; S.vault = await decJSON(S.vaultKey, S.vaultRec.data) } catch { lockVault(); toast('Your vault changed on another device — unlock it again') } }
 }
 renderSoon();
}

/* ---------- the sync run ---------- */
function setStatus(st, err = '') { SY.status = st; SY.error = err; if (st === 'synced') SY.lastSync = Date.now(); updateSyncDot(); renderIf('devices') }
async function saveLink() { if (SY.link) await kvSet('syncLink', SY.link); else await dbDel('kv', 'syncLink') }
async function syncNow({ interactive = false } = {}) {
 if (!linked() || !syncAvailable()) return;
 if (!navigator.onLine) { setStatus('offline'); return }
 if (SY.running) { if (!interactive) { SY.again = true; return SY.running } await SY.running.catch(() => { }) }
 if (interactive) SY.abort = new AbortController();
 SY.cancelled = false;
 SY.running = (async () => {
  setStatus('syncing');
  try {
   do { SY.again = false; await once() } while (SY.again && linked());
   if (linked() && !isPaused()) { setStatus('synced'); step('Done', 100) }
   pumpContent();
  } catch (e) {
   if (isAbort(e)) { SY.cancelled = true; setStatus(SY.link && SY.link.lastId ? 'synced' : 'off'); return }
   console.warn('sync failed', e);
   setStatus('error', /Failed to fetch|NetworkError|Load failed/.test(e.message) ? 'Couldn’t reach the sync relay.' : e.message);
   if (e.later) setTimeout(() => linked() && syncNow(), 30 * 60e3);
  } finally { SY.running = null; if (interactive) SY.abort = null }
 })();
 return SY.running;
}
async function once() {
 const link = SY.link; SY.keys = SY.keys || await derive(link.secret);
 const topic = topicOf(SY.keys.id), startedAt = Date.now();
 step('Checking for changes…', 6);
 const msgs = (await relayList(topic, link.lastTs ? Math.max(0, link.lastTs - 5) : 'all')).filter(m => m.id !== link.lastId && !SY.mine.has(m.id) && !(link.seen || []).includes(m.id));
 const deltas = [], wants = [];
 for (const m of msgs) {
  if (m.attachment) {
   const q = partOf(m);
   if (q && q.prefix.startsWith('c.') && liveFile(m)) { const fid = q.prefix.slice(2), a = SY.avail[fid] || (SY.avail[fid] = {}), g = a[q.set] || (a[q.set] = { n: q.n, parts: {}, time: 0 }); g.parts[q.i] = m.attachment.url; g.time = Math.max(g.time, m.time) }
   else if (m.attachment.name === 'delta.bz' && liveFile(m)) deltas.push({ m });
   continue;
  }
  if (!m.message || m.time * 1000 <= (link.since || 0) - 60e3) continue;
  try {
   const note = await openJ(unb64(m.message));
   if (note && note.t === 'off' && m.time * 1000 > (link.since || 0)) { await leaveSync(); toast('Sync was turned off on another device. Your files stay here.'); return }
   if (note && note.t === 'delta' && note.dev !== DEVID()) deltas.push({ m, data: note });
   if (note && note.t === 'want' && note.dev !== DEVID()) wants.push(note);
  } catch { }
 }
 const latest = [...msgs].reverse().find(m => liveFile(m) && /^library(\.|$)/.test(m.attachment.name) && (m.attachment.name === 'library.bz' || (partOf(m) || {}).i === (partOf(m) || {}).n));
 ensureMe(); refreshHave();
 const wasPaused = isPaused();
 const local = localSnap();
 const pending = link.deltaFrom ? changesSince(local, link.deltaFrom) : null;
 let base = local, replaced = false;
 if (latest) {
  step('Downloading your library…', 15);
  const bytes = await fetchLibrary(topic, latest);
  if (!bytes) { setTimeout(() => linked() && syncNow(), 20e3); return }
  const remote = await openJ(bytes);
  if (sig() && sig().aborted) throw new DOMException('cancelled', 'AbortError');
  step('Merging with this device…', 72);
  if (link.replace) { replaced = true; local.files = []; local.scans = []; local.tomb = {}; for (const f of S.files) { await dbDel('blobs', f.id); await dbDel('files', f.id) } S.files = []; S.scans = []; await dbClear('scans'); delete link.replace }
  base = merge(local, remote);
  link.lastId = latest.id; link.pubTs = Math.max(link.pubTs || 0, latest.time);
 }
 for (const d of deltas.sort((a, b) => a.m.time - b.m.time)) { try { const data = d.data || await openJ(await fetchBytes(d.m.attachment.url)); if (data.dev !== DEVID()) base = merge(base, data) } catch (e) { if (isAbort(e)) throw e } }
 const before = JSON.stringify(SY.devices);
 SY.devices = mergeDevices(SY.devices, base.devices); SY.haves = mergeHaves(SY.haves, base.haves);
 if (JSON.stringify(SY.devices) !== before) saveDevices();
 const me = SY.devices[DEVID()];
 if (me && me.removed && (me.ts || 0) > (link.since || 0)) { await leaveSync(); toast('This device was removed from sync on another device. Your files stay here.'); return }
 if (me && me.name && !me.auto && me.name !== S.deviceName) { S.deviceName = me.name; S.deviceNameSet = true; kvSet('deviceName', S.deviceName) }
 if (isPaused()) {
  if (SY.devicesDirty) { await relayPost(topic, b64(await seal({ t: 'delta', dev: DEVID(), files: [], scans: [], tomb: {}, devices: { [DEVID()]: { ...SY.devices[DEVID()], lastSeen: Date.now() } } }))); SY.devicesDirty = false }
  await saveLink(); setStatus('paused'); return;
 }
 if (wasPaused && !isPaused()) { link.lastTs = 0; link.seen = []; link.hash = ''; SY.again = true }
 if (replaced || snapHash(base) !== snapHash(local)) { step('Saving to this device…', 84); await applyLocal(base) }
 for (const w of wants) for (const id of (w.ids || [])) { const f = byId(id); if (f && !f.offloaded && !f.trashed && f.size <= RELAY_MAX()) SY.pushQ.add(id) }
 if (msgs.length) { link.seen = msgs.slice(-40).map(m => m.id); link.lastTs = Math.max(link.lastTs || 0, msgs[msgs.length - 1].time) }
 link.deltaFrom = startedAt; await saveLink();
 // ---- send ----
 const now = Date.now() / 1000, stale = !link.pubTs || now - link.pubTs > 140 * 60 || !link.hash;
 SY.devices[DEVID()] = { ...SY.devices[DEVID()], lastSeen: Date.now() };
 const haveChanged = refreshHave();
 if (stale) {
  step('Sending your library to your other devices…', 92);
  const snap = { ...localSnap(), devices: SY.devices, haves: SY.haves };
  const res = await postLibrary(topic, await seal(snap));
  link.hash = snapHash(snap); link.lastId = res.id; link.lastTs = res.time; link.pubTs = res.time; SY.devicesDirty = false;
 } else if (pending || SY.devicesDirty || haveChanged) {
  step('Sending your changes…', 94);
  const d = pending || { t: 'delta', dev: DEVID(), files: [], scans: [], tomb: {} };
  d.devices = Object.fromEntries(Object.entries(SY.devices).filter(([id, x]) => id === DEVID() || (x.ts || 0) > (link.deltaFrom || 0) - 60e3 || SY.devicesDirty));
  d.haves = { [DEVID()]: SY.haves[DEVID()] };
  SY.devicesDirty = false;
  const sealed = await seal(d), s64 = b64(sealed);
  const res = s64.length <= 3900 ? await relayPost(topic, s64) : await relayPost(topic, new Blob([sealed]), { filename: 'delta.bz', title: S.deviceName });
  if (res && res.time) link.lastTs = Math.max(link.lastTs || 0, res.time);
 }
 await saveLink();
}

/* ---------- file contents: offer new files, ask for missing ones, answer requests ---------- */
let pumping = false;
const others = () => listDevices().filter(d => !d.me && !d.paused).length;
async function pumpContent() {
 if (pumping || !linked() || isPaused() || !navigator.onLine) return;
 pumping = true;
 try {
  const topic = topicOf(SY.keys.id), now = Date.now();
  // 1) download anything that has fully arrived and that this device wants
  for (const [fid, sets] of Object.entries(SY.avail)) {
   const f = byId(fid); if (!f || !f.offloaded) { delete SY.avail[fid]; continue }
   const done = Object.values(sets).filter(g => Object.keys(g.parts).length === g.n).sort((a, b) => b.time - a.time)[0];
   if (done && (f.size <= setting('autoDownloadMB') * 1048576 || SY.wantSent[fid])) await receiveContent(f, done).catch(e => console.warn('content', e));
  }
  if (!others()) return;
  // 2) ask for missing files (auto-download size, or opened by you)
  const need = live().filter(f => f.offloaded && f.size <= RELAY_MAX() && (f.size <= setting('autoDownloadMB') * 1048576 || SY.wantSent[f.id] === -1) && !(SY.wantSent[f.id] > now - 20 * 60e3) && !SY.avail[f.id]).slice(0, 120);
  if (need.length) { await relayPost(topic, b64(await seal({ t: 'want', dev: DEVID(), ids: need.map(f => f.id) }))); need.forEach(f => SY.wantSent[f.id] = now) }
  // 3) send contents: freshly added files once, plus anything another device asked for
  for (const f of live()) if (!f.offloaded && !f.sent && f.size <= Math.min(RELAY_MAX(), setting('autoDownloadMB') * 1048576) && f.origin !== 'sync') SY.pushQ.add(f.id);
  let budget = 24; // relay parts per run (the free relay allows a few hundred messages a day)
  for (const id of [...SY.pushQ]) {
   const f = byId(id); SY.pushQ.delete(id);
   if (!f || f.offloaded || f.trashed || (SY.pushedAt[id] > now - 30 * 60e3)) continue;
   const missing = listDevices().filter(d => !d.me && !d.paused && !((SY.haves[d.id] || {}).ids || []).includes(id));
   if (!missing.length) { if (!f.sent) { f.sent = now; saveRec(f) } continue }
   const blob = await dbGet('blobs', id); if (!blob) continue;
   const n = Math.max(1, Math.ceil(blob.size / PART)); if (n > budget) { SY.pushQ.add(id); break }
   const parts = []; for (let i = 0; i < n; i++) parts.push(await sealBytes(SY.keys.key, new Uint8Array(await blob.slice(i * PART, (i + 1) * PART).arrayBuffer())));
   try { await postParts(topic, 'c.' + id, parts); budget -= n; SY.pushedAt[id] = now; f.sent = now; await saveRec(f) }
   catch (e) { if (e.tooBig && PART > MIN_PART) { PART = Math.max(MIN_PART, PART / 2); SY.pushQ.add(id) } else if (e.busy) break; else throw e }
  }
 } catch (e) { console.warn('content sync', e) }
 finally { pumping = false }
}
async function receiveContent(f, g) {
 const bufs = [];
 for (let i = 1; i <= g.n; i++) bufs.push(await openBytes(SY.keys.key, await fetchBytes(g.parts[i])));
 const blob = new Blob(bufs, { type: f.type || '' });
 if (f.hash) { const h = await hashLike(blob, f.hash); if (h && h !== f.hash) throw new Error('Content check failed for ' + f.name) }
 await dbPut('blobs', f.id, blob); f.offloaded = false; f.sent = Date.now();
 if (!f.thumb || f.thumb === f.mini) f.thumb = await makeThumb(blob, f.type) || f.thumb;
 await saveRec(f); delete SY.avail[f.id]; delete SY.wantSent[f.id];
 document.dispatchEvent(new CustomEvent('desk-content', { detail: f.id }));
 renderSoon(); refreshHave(); syncSoon();
}
async function requestContent(f) {
 if (!linked()) return false;
 if (f.size > RELAY_MAX()) return false;
 SY.wantSent[f.id] = -1; await pumpContent(); return true;
}

/* ---------- live updates (hear other devices within seconds) ---------- */
function listen() {
 try { SY.es && SY.es.close() } catch { } SY.es = null;
 if (!linked() || !window.EventSource) return;
 (SY.keys ? Promise.resolve(SY.keys) : derive(SY.link.secret)).then(k => {
  SY.keys = SY.keys || k; if (!linked()) return;
  SY.es = new EventSource(`${RELAY()}/${topicOf(SY.keys.id)}/sse`); let t = 0;
  SY.es.onmessage = e => { let m = null; try { m = JSON.parse(e.data) } catch { } if (!m || m.event !== 'message' || SY.mine.has(m.id)) return; clearTimeout(t); t = setTimeout(() => linked() && syncNow(), 800) };
 }).catch(() => { });
}

/* ---------- start / join / leave / codes ---------- */
async function createSync() {
 if (!syncAvailable()) throw new Error('Device sync needs DESk opened from its web address (GitHub Pages), not as a local file.');
 SY.link = { secret: newSecret(), since: Date.now() }; SY.keys = null; await saveLink();
 await syncNow({ interactive: true });
 if (SY.cancelled) { SY.link = null; await saveLink(); setStatus('off'); const e = new Error('Cancelled'); e.cancelled = true; throw e }
 if (SY.status === 'error') { const err = SY.error; SY.link = null; await saveLink(); setStatus('off'); throw new Error(err) }
 startSync(); return SY.link;
}
async function peekSync(secret) { const k = await derive(secret); const m = [...await relayList(topicOf(k.id))].reverse().find(m => liveFile(m) && /^library/.test(m.attachment.name)); return m ? { device: m.title || '', updatedAt: m.time * 1000 } : null }
async function joinSync(secret, mode = 'merge') {
 secret = cleanSecret(secret);
 if (secret.length < 16) throw new Error('That sync link isn’t complete — copy the whole link and try again.');
 SY.abort = new AbortController(); step('Looking for your files…', 3);
 const found = await peekSync(secret).catch(e => { if (isAbort(e)) throw e; return null });
 SY.link = { secret, since: Date.now(), replace: mode === 'replace' && !!found }; SY.keys = null; SY.devices = {}; SY.haves = {}; await saveLink();
 await syncNow({ interactive: true });
 if (SY.cancelled) { await leaveSync(); const e = new Error('Cancelled'); e.cancelled = true; throw e }
 startSync(); return found;
}
const CODE_ABC = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
async function codeKeys(code) { return { topic: 'dkc' + hexOf(await shaS('desk-code-id:' + code)).slice(0, 40), key: await crypto.subtle.importKey('raw', await shaS('desk-code-key:' + code), 'AES-GCM', false, ['encrypt', 'decrypt']) } }
async function makeCode() {
 if (!linked()) await createSync();
 const code = [...crypto.getRandomValues(new Uint8Array(8))].map(b => CODE_ABC[b % 32]).join(''), k = await codeKeys(code);
 await relayPost(k.topic, b64(await seal({ s: SY.link.secret, exp: Date.now() + 15 * 60e3 }, k.key)));
 return code;
}
async function redeemCode(code) {
 const c = cleanCode(code); if (c.length !== 8) throw new Error('Codes have 8 letters and numbers, like K7M2-Q9XA.');
 const k = await codeKeys(c);
 for (const m of (await relayList(k.topic, '20m')).reverse()) { try { const d = await openJ(unb64(m.message), k.key); if (d && d.s && d.exp > Date.now()) return d.s } catch { } }
 throw new Error('That code didn’t work — check it, or make a new one on your other device (codes last 15 minutes).');
}
async function leaveSync() { SY.link = null; SY.keys = null; try { SY.es && SY.es.close() } catch { } SY.es = null; SY.devices = {}; SY.haves = {}; SY.avail = {}; await dbDel('kv', 'syncDevices'); await dbDel('kv', 'syncHaves'); await saveLink(); setStatus('off'); renderSoon() }
async function offEverywhere() { if (!linked()) return; SY.keys = SY.keys || await derive(SY.link.secret); await relayPost(topicOf(SY.keys.id), b64(await seal({ t: 'off', at: Date.now() }))); await leaveSync() }
let syncTimer = 0, lastPush = 0;
function syncSoon() { if (!linked()) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => { const wait = Math.max(0, lastPush + 8e3 - Date.now()); setTimeout(() => { lastPush = Date.now(); syncNow() }, wait) }, 2500) }
async function restoreSync() {
 SY.link = await kvGet('syncLink'); SY.devices = await kvGet('syncDevices', {}) || {}; SY.haves = await kvGet('syncHaves', {}) || {}; SY.tomb = await kvGet('syncTomb', {}) || {};
 if (SY.link && SY.link.secret && syncAvailable()) startSync(); else setStatus('off');
}
function startSync() {
 if (!linked()) { setStatus('off'); return }
 syncNow(); listen();
 if (SY.started) return; SY.started = true;
 document.addEventListener('visibilitychange', () => { if (!linked()) return; if (document.visibilityState === 'visible') { if (Date.now() - SY.lastSync > 5e3) syncNow(); if (!SY.es || SY.es.readyState === 2) listen() } else syncNow() });
 window.addEventListener('online', () => { if (linked()) { syncNow(); listen() } });
 setInterval(() => { if (document.visibilityState === 'visible' && linked()) syncNow() }, 90e3);
}
// a permanent delete or hide here: remember it so other devices remove their copy too
async function tombstone(id) { SY.tomb[id] = Date.now(); await kvSet('syncTomb', SY.tomb); syncSoon() }
function updateSyncDot() {
 const el = $('#syncState'); if (!el) return;
 const map = { off: ['', 'This device only'], syncing: ['busy', 'Syncing…'], synced: ['ok', `Synced · ${listDevices().length} device${listDevices().length === 1 ? '' : 's'}`], error: ['err', 'Sync issue'], offline: ['', 'Offline'], paused: ['', 'Sync paused'] };
 const [c, t] = map[SY.status] || map.off; el.innerHTML = `<span class="dot ${c}"></span><span>${esc(t)}</span>`;
}

/* ================= SHORT SHARE LINKS (encrypted, through the relay) ================= */
// The link holds a random topic id and the decryption key (after #, never sent to any server).
// The relay keeps the encrypted file for about 3 hours.
async function createShareLink(f) {
 if (!syncAvailable()) throw new Error('Share links need DESk opened from its web address (GitHub Pages).');
 const blob = await getBlob(f); if (!blob) throw new Error('This file isn’t on this device yet.');
 if (blob.size > RELAY_MAX()) throw new Error(`Share links carry files up to ${fmtB(RELAY_MAX())}. Use “Share via apps” or Download for bigger files.`);
 const id = uid(12), raw = crypto.getRandomValues(new Uint8Array(16)), key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
 const topic = 'dks' + id, n = Math.max(1, Math.ceil(blob.size / PART));
 const old = SY.abort; SY.abort = null;
 try {
  await relayPost(topic, b64(await seal({ t: 'share', name: f.name, type: f.type, size: f.size, n, hash: f.hash, cat: f.cat, mini: f.mini || null, at: Date.now() }, key)));
  const parts = []; for (let i = 0; i < n; i++) parts.push(await sealBytes(key, new Uint8Array(await blob.slice(i * PART, (i + 1) * PART).arrayBuffer())));
  await postParts(topic, 'p', parts, 'DESk');
 } finally { SY.abort = old }
 const url = `${appBase()}#/s/${id}/${b64url(raw)}`;
 f.share = { url, exp: Date.now() + 3 * 3600e3 }; await saveRec(f);
 return url;
}
async function openShareLink(id, k) {
 const key = await crypto.subtle.importKey('raw', unb64url(k), 'AES-GCM', false, ['encrypt', 'decrypt']), topic = 'dks' + id;
 const msgs = await relayList(topic, 'all'); let meta = null;
 for (const m of msgs) if (m.message && !m.attachment) { try { const d = await openJ(unb64(m.message), key); if (d && d.t === 'share') meta = d } catch { } }
 if (!meta) return null;
 const sets = {}; for (const m of msgs) { const q = partOf(m); if (q && q.prefix === 'p' && liveFile(m)) (sets[q.set] = sets[q.set] || { n: q.n, parts: {} }).parts[q.i] = m.attachment.url }
 const g = Object.values(sets).find(s => Object.keys(s.parts).length === s.n);
 return { meta, ready: !!g, get: async () => { const bufs = []; for (let i = 1; i <= g.n; i++) bufs.push(await openBytes(key, await fetchBytes(g.parts[i]))); return new Blob(bufs, { type: meta.type || '' }) } };
}

/* ================= QR (make & scan) ================= */
let jsqrLoading = null;
function loadJsQR() { if (typeof jsQR === 'function') return Promise.resolve(); return jsqrLoading || (jsqrLoading = new Promise(res => { const s = document.createElement('script'); s.src = 'js/jsQR.js'; s.onload = res; s.onerror = res; document.head.appendChild(s) })) }
async function decodeQR(src, w, h, c) {
 c = c || document.createElement('canvas'); const s = Math.min(1, 900 / Math.max(w, h)); c.width = Math.max(1, w * s | 0); c.height = Math.max(1, h * s | 0);
 const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0, c.width, c.height);
 if ('BarcodeDetector' in window) { try { const r = await new BarcodeDetector({ formats: ['qr_code'] }).detect(c); if (r[0]) return r[0].rawValue } catch { } }
 await loadJsQR();
 if (typeof jsQR === 'function') { const d = x.getImageData(0, 0, c.width, c.height), r = jsQR(d.data, c.width, c.height, { inversionAttempts: 'attemptBoth' }); if (r) return r.data }
 return null;
}
let QRM = null;
function scanQR() {
 return new Promise(resolve => {
  let stream = null, timer = 0, done = false;
  const finish = v => { if (done) return; done = true; clearTimeout(timer); stream && stream.getTracks().forEach(t => t.stop()); QRM = null; m.close(); resolve(v) };
  const m = modal(`<div class="mhead"><h3>Scan the QR code</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div>
   <div id="qrv" class="qrcam">Starting camera…</div>
   <div class="row" style="margin-top:14px"><button class="btn" data-act="qrPhoto">${ic('camera', 18)}Use a photo</button></div>
   <form data-form="qrCode" class="row" style="margin-top:10px;flex-wrap:nowrap"><input name="c" placeholder="Or type the code / paste the link" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn pri">Link</button></form>`, { onClose: () => finish(null) });
  QRM = { m, finish };
  (async () => {
   try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    if (done) return stream.getTracks().forEach(t => t.stop());
    const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.srcObject = stream;
    const box = m.querySelector('#qrv'); box.innerHTML = ''; box.appendChild(v); await v.play(); loadJsQR();
    const c = document.createElement('canvas');
    const tick = async () => { if (done) return; if (v.videoWidth) { const val = await decodeQR(v, v.videoWidth, v.videoHeight, c); if (val) return finish(val) } timer = setTimeout(tick, 220) };
    tick();
   } catch { const box = m.querySelector('#qrv'); if (box) box.innerHTML = '<p style="padding:24px;text-align:center">Camera isn’t available. Tap “Use a photo” to photograph the QR code, or type the code shown under it.</p>' }
  })();
 });
}
function parseJoin(v) {
 v = String(v || '').trim(); const m = v.match(/#\/(link|c)\/([A-Za-z0-9_-]+)/);
 if (m) return m[1] === 'link' ? { secret: m[2] } : { code: m[2] };
 if (cleanSecret(v).length >= 20) return { secret: v };
 if (cleanCode(v).length === 8) return { code: v };
 return null;
}

/* ================= BUNDLES (offline transfer & backup) ================= */
async function exportBundle() {
 const L = live(); if (!L.length) return toast('No files to export', 'err');
 toast(`Packing ${L.length} files…`);
 const entries = [], meta = [];
 for (const f of L) { const b = await dbGet('blobs', f.id); if (!b) continue; entries.push({ name: 'files/' + f.id + '-' + f.name, blob: b }); meta.push({ ...f, share: null, offloaded: false, sent: 0 }) }
 entries.unshift({ name: 'desk-manifest.json', blob: new Blob([JSON.stringify({ desk: 'bundle', v: 1, from: S.deviceName, at: Date.now(), files: meta })]) });
 saveBlob(await makeZip(entries), `DESk-backup-${new Date().toISOString().slice(0, 10)}.zip`);
}
async function importBundle(file) {
 try {
  const ents = await readZip(file), man = ents.find(e => e.name === 'desk-manifest.json');
  if (!man) { toast('Not a DESk backup — importing the files inside instead'); return ingest(ents.map(e => new File([e.data], e.name.split('/').pop()))) }
  const j = JSON.parse(td.decode(man.data)), have = new Set(live().map(f => f.hash)); let n = 0;
  for (const m of j.files || []) {
   if (have.has(m.hash)) continue; const e = ents.find(x => x.name === 'files/' + m.id + '-' + m.name); if (!e) continue;
   const r = await addFile(new Blob([e.data], { type: m.type }), { name: String(m.name), type: String(m.type || ''), modified: m.modified, hash: m.hash, thumb: safeThumb(m.thumb), origin: 'bundle' });
   r.folder = String(m.folder || r.folder); r.tags = Array.isArray(m.tags) ? m.tags.map(String) : r.tags; r.fav = !!m.fav; await saveRec(r); n++;
  }
  toast(`Imported ${n} file${n === 1 ? '' : 's'}`); render(); syncSoon(); return true;
 } catch (e) { toast('Couldn’t read that backup: ' + e.message, 'err'); return false }
}

/* ================= SYNC UI: link, join, manage devices ================= */
// Progress popup with Cancel for syncs you start yourself (turning sync on, linking, Sync now)
async function withProgress(title, task) {
 const m = modal(`<h3>${esc(title)}</h3><p class="muted small" id="prL">Starting…</p><div class="bar" style="margin:12px 0 18px"><i id="prB" style="width:3%"></i></div><div class="row end"><button class="btn ghost" data-act="prCancel">Cancel</button></div>`);
 progressCb = (l, p) => { const L = m.querySelector('#prL'), B = m.querySelector('#prB'); if (L) L.textContent = l; if (B) B.style.width = Math.max(3, Math.min(100, p)) + '%' };
 try { return await task() } finally { progressCb = null; setTimeout(() => m.close(), 300) }
}
ACT.prCancel = () => { if (SY.abort) SY.abort.abort() };
const hasLocalStuff = () => live().length > 0 || S.scans.length > 0;
async function joinFlow(req) {
 if (!syncAvailable()) return toast('Device sync needs DESk opened from its web address, not as a local file.', 'err');
 try {
  let secret = req.secret;
  if (!secret) { toast('Checking your code…'); secret = await redeemCode(req.code) }
  secret = cleanSecret(secret);
  if (linked() && SY.link.secret === secret) return toast('This device is already linked ✓');
  const found = await peekSync(secret).catch(() => null);
  let mode = req.mode || 'merge';
  if (hasLocalStuff() && !req.mode) {
   mode = await new Promise(res => {
    const m = modal(`<h3>Link this device</h3><p class="muted" style="margin-bottom:14px">Linking to the files from <b>${esc(found ? found.device : 'your other device')}</b>. This device already has files. What should happen to them?</p>
     <div style="display:grid;gap:10px"><button class="btn wrap" data-act="joinMode" data-m="merge"><span><b>Combine both</b><br><span class="small muted">Keep this device’s files and add the other device’s (recommended)</span></span></button>
     <button class="btn wrap" data-act="joinMode" data-m="replace"><span><b>Use only the linked files</b><br><span class="small muted">Remove the files on this device and use the other device’s</span></span></button></div>
     <div class="row end" style="margin-top:14px"><button class="btn ghost" data-close>Cancel</button></div>`, { onClose: () => res(m._mode || null) });
   });
   if (!mode) return;
  }
  if (linked()) await leaveSync();
  await withProgress('Linking this device', () => joinSync(secret, mode));
  if (SY.status === 'error') throw new Error(SY.error);
  toast(found ? `Linked ✓ — ${live().length} files on this device` : 'Linked ✓ — files arrive the next time DESk is open on your other device');
  go('devices');
 } catch (e) { toast(e.cancelled ? 'Linking cancelled — nothing changed on this device' : e.message, e.cancelled ? '' : 'err') }
}
ACT.joinMode = (d, el) => { const w = el.closest('.mwrap'); w._mode = d.m; w.close() };
async function enterCodeDialog() {
 const v = await ask('Link this device', { body: 'On the device that has your files open <b>Devices → Link a device</b>. Scan its QR code with this device’s camera, open the link, or type the short code here.', input: 'Short code or sync link', placeholder: 'K7M2-Q9XA', ok: 'Link' });
 if (!v) return null;
 const r = parseJoin(v); if (!r) toast('That isn’t a DESk code or link', 'err'); return r;
}
async function linkDeviceDialog() {
 if (!syncAvailable()) return toast('Device sync needs DESk opened from its web address (e.g. GitHub Pages), not as a local file.', 'err');
 if (!linked()) { try { await withProgress('Turning on sync', () => createSync()) } catch (e) { return toast(e.cancelled ? 'Cancelled' : e.message, e.cancelled ? '' : 'err') } }
 const url = linkURL(); let timer = 0;
 modal(`<div class="mhead"><h3>Link another device</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div>
  <div style="display:grid;gap:14px;justify-items:center;text-align:center">
   <p class="muted small">Scan with the other phone’s camera, or open the link in any browser — another browser on this device works too. It then stays in sync automatically.</p>
   <div class="qrbox">${qrSVG(url, { dark: '#0e1526' })}</div>
   <div class="row" style="justify-content:center"><button class="btn pri" data-act="copyLink">${ic('link', 18)}Copy link</button>${navigator.share ? `<button class="btn" data-act="shareLink">${ic('share', 18)}Share</button>` : ''}</div>
   <div class="card" style="width:100%;box-shadow:none;background:var(--panel2)"><div class="small b muted">Typing it in instead?</div><div id="codeOut" hidden><div class="code" id="codeBig"></div><div class="small muted" id="codeLeft"></div></div><button class="btn ghost" data-act="makeCode" style="margin-top:6px">Get a short code</button></div>
   <p class="small muted">Anyone with this link or code can see and change your files — only use it on your own devices.</p></div>`, { onClose: () => { clearInterval(timer); renderIf('devices') } });
 ACT.makeCode = async (d, el) => {
  el.disabled = true; el.textContent = 'Making a code…';
  try {
   const code = await makeCode(), until = Date.now() + 15 * 60e3, w = el.closest('.mwrap');
   w.querySelector('#codeOut').hidden = false; w.querySelector('#codeBig').textContent = prettyCode(code);
   const tick = () => { const s = Math.max(0, Math.round((until - Date.now()) / 1000)), L = w.querySelector('#codeLeft'); if (!L) return clearInterval(timer); L.textContent = s ? `Works once, for ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} · or open ${codeURL(code).replace(/^https?:\/\//, '')}` : 'Expired — get a new code'; if (!s) clearInterval(timer) };
   tick(); clearInterval(timer); timer = setInterval(tick, 1000); el.textContent = 'Get a new code';
  } catch (e) { toast(e.message, 'err'); el.textContent = 'Get a short code' }
  el.disabled = false;
 };
}
Object.assign(ACT, {
 copyLink: () => copyText(linkURL(), 'Link copied'),
 shareLink: () => navigator.share({ title: 'DESk sync link', text: 'Open this to link your DESk:', url: linkURL() }).catch(() => { }),
 devLink: () => linkDeviceDialog(),
 devJoin: async () => { const r = await enterCodeDialog(); if (r) joinFlow(r) },
 devScan: async () => { const v = await scanQR(); if (!v) return; const r = parseJoin(v); r ? joinFlow(r) : toast('That QR code isn’t a DESk link', 'err') },
 devSync: () => withProgress('Syncing', () => syncNow({ interactive: true })),
 devRename: async d => { const cur = SY.devices[d.id]; const v = await ask('Rename device', { input: 'Device name', value: cur ? cur.name : S.deviceName, ok: 'Save' }); if (!v) return; if (d.id === DEVID()) { S.deviceName = v.trim().slice(0, 40); S.deviceNameSet = true; kvSet('deviceName', S.deviceName) } editDevice(d.id, { name: v.trim().slice(0, 40), auto: false }) },
 devAuto: d => { const c = SY.devices[d.id]; if (d.id === DEVID()) { S.deviceName = autoName(); S.deviceNameSet = false; kvSet('deviceName', S.deviceName) } editDevice(d.id, { name: d.id === DEVID() ? autoName() : (c.autoName || c.name), auto: true }) },
 devPause: d => { const c = SY.devices[d.id]; editDevice(d.id, { paused: !c.paused }); if (d.id === DEVID() && c.paused) { SY.link.lastTs = 0; SY.link.seen = []; SY.link.hash = '' } },
 devRemove: async d => { const c = SY.devices[d.id]; if (await ask(`Remove ${c ? c.name : 'this device'}?`, { body: 'It stops syncing and keeps the files it already has.', ok: 'Remove', danger: true })) editDevice(d.id, { removed: true, paused: false }) },
 devLeave: async () => { if (await ask('Stop syncing this device?', { body: 'Files stay on this device. Your other devices keep syncing with each other.', ok: 'Stop syncing', danger: true })) { editDevice(DEVID(), { removed: true }); await syncNow().catch(() => { }); await leaveSync(); toast('This device stopped syncing') } },
 devOff: async () => { if (await ask('Turn off sync everywhere?', { body: 'Every linked device stops syncing. Each keeps the files it has.', ok: 'Turn off everywhere', danger: true })) { await offEverywhere(); toast('Sync turned off on all devices') } },
 bundleOut: () => exportBundle(), bundleIn: () => { importTarget = 'bundle'; $('#anyIn').accept = '.zip,application/zip'; $('#anyIn').click() },
 qrPhoto: () => { importTarget = 'qr'; $('#anyIn').accept = 'image/*'; $('#anyIn').setAttribute('capture', 'environment'); $('#anyIn').click() }
});
Object.assign(FORMS, { qrCode: f => { const v = new FormData(f).get('c'); if (QRM) QRM.finish(v) } });
const agoTxt = ts => { if (!ts) return 'not seen yet'; const m = Math.round((Date.now() - ts) / 60e3); return m < 2 ? 'active now' : m < 60 ? `active ${m} min ago` : m < 2880 ? `active ${Math.round(m / 60)} h ago` : `active ${Math.round(m / 1440)} days ago` };
VIEWS.devices = () => {
 const i = deviceInfo(), on = linked();
 const status = { off: 'Sync is off — files stay on this device', syncing: 'Syncing…', synced: `Up to date · ${ago(SY.lastSync)}`, error: SY.error || 'Sync issue', offline: 'Offline — will sync when you’re back online', paused: 'Sync is paused on this device' }[SY.status] || '';
 let main;
 if (!syncAvailable()) main = `<div class="card"><h3>Open DESk from its web address to sync</h3><p class="muted">Sync works when DESk runs from its hosted address (for example GitHub Pages). This copy is running as a local file, so files stay here — use a backup file below to move them.</p></div>`;
 else if (!on) main = `<div class="card linkhero"><div class="lh-art" aria-hidden="true">${ic('phone', 34)}<span class="lh-dots"><i></i><i></i><i></i></span>${ic('laptop', 40)}</div>
  <h2>Sync your devices — no account</h2><p class="muted">Link your phone, tablet and computers with a QR code, a link or a short code. Files, folders, tags, scans and your encrypted vault stay in step automatically. Everything is encrypted on the device first.</p>
  <div class="row" style="justify-content:center"><button class="btn pri" data-act="devLink">${ic('qr', 18)}Link a device</button><button class="btn" data-act="devScan">${ic('camera', 18)}Scan a code</button><button class="btn" data-act="devJoin">${ic('link', 18)}Enter code or link</button></div></div>`;
 else main = `<div class="card"><div class="row between" style="margin-bottom:6px"><h3 style="margin:0">Your devices · ${listDevices().length}</h3><div class="row"><button class="btn sm" data-act="devSync">${ic('refresh', 16)}Sync now</button><button class="btn sm pri" data-act="devLink">${ic('qr', 16)}Link a device</button></div></div>
  ${listDevices().map(d => `<div class="dev"><span class="ib">${ic(devIcon(d.type), 26)}</span><div><div class="b">${esc(d.name || 'Device')} ${d.me ? '<span class="badge">This device</span>' : ''} ${d.paused ? '<span class="badge amber">Paused</span>' : ''}</div>
   <div class="small muted">${esc(d.br || '')}${d.os ? ' on ' + esc(d.os) : ''} · ${d.me ? 'active now' : agoTxt(d.lastSeen)} · ${((SY.haves[d.id] || {}).ids || []).length} files stored</div></div>
   <div class="row" style="gap:4px"><button class="btn sm icon ghost" data-act="devRename" data-id="${esc(d.id)}" aria-label="Rename" title="Rename">${ic('edit', 18)}</button>${d.auto ? '' : `<button class="btn sm icon ghost" data-act="devAuto" data-id="${esc(d.id)}" aria-label="Use automatic name" title="Automatic name">${ic('restore', 18)}</button>`}
   <button class="btn sm icon ghost" data-act="devPause" data-id="${esc(d.id)}" aria-label="${d.paused ? 'Resume' : 'Pause'} syncing" title="${d.paused ? 'Resume' : 'Pause'}">${ic(d.paused ? 'refresh' : 'clock', 18)}</button>${d.me ? '' : `<button class="btn sm icon ghost" data-act="devRemove" data-id="${esc(d.id)}" aria-label="Remove device" title="Remove">${ic('x', 18)}</button>`}</div></div>`).join('')}
  <hr><div class="row"><button class="btn sm" data-act="devLeave">Stop syncing this device</button><button class="btn sm danger" data-act="devOff">Turn off sync everywhere</button></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>What syncs</h3><p class="small muted">File list, folders, tags, favorites and Trash; scans; settings; your name and photo; the encrypted password vault (if on). File contents up to <b>${fmtB(RELAY_MAX())}</b> are sent automatically to devices that need them; bigger files stay where they were added. <b>Hidden files never leave this device.</b></p></div>
   <div class="card"><h3>This device downloads</h3><label class="fld"><span>Files automatically, up to</span><select data-set="autoDownloadMB">${[0, 2, 5, 10, 15].map(n => `<option value="${n}" ${setting('autoDownloadMB') == n ? 'selected' : ''}>${n ? fmtB(n * 1048576) : 'None — only when I open them'}</option>`).join('')}</select></label>
   <label class="sw"><input type="checkbox" data-set="vaultSync" ${setting('vaultSync') ? 'checked' : ''}>Sync my encrypted password vault</label></div></div>`;
 return `<div class="sect" style="margin-top:6px"><div><h1>Devices</h1><p class="muted"><span class="dot ${SY.status === 'synced' ? 'ok' : SY.status === 'error' ? 'err' : SY.status === 'syncing' ? 'busy' : ''}" style="display:inline-block;margin-right:6px"></span>${esc(status)}</p></div></div>
 ${main}
 <div class="grid g2" style="margin-top:16px"><div class="card"><h3>This device</h3><dl class="kv"><dt>Name</dt><dd>${esc(S.deviceName)}</dd><dt>Type</dt><dd>${esc(i.type[0].toUpperCase() + i.type.slice(1))}</dd><dt>System</dt><dd>${esc(i.os)} · ${esc(i.br)}</dd><dt>Files stored here</dt><dd>${live().filter(f => !f.offloaded).length}</dd></dl>
  <button class="btn sm" data-act="devRename" data-id="${esc(DEVID())}" style="margin-top:12px">${ic('edit', 16)}Rename</button></div>
  <div class="card"><h3>Backup file</h3><p class="small muted" style="margin-bottom:12px">Works anywhere, even offline: save one .zip with all files, folders and tags, then restore it on any device.</p>
  <div class="row"><button class="btn" data-act="bundleOut">${ic('download', 18)}Save backup</button><button class="btn" data-act="bundleIn">${ic('upload', 18)}Restore backup</button></div></div></div>`;
};

/* ================= SHARE ================= */
async function openShare(id) {
 const f = byId(id); if (!f) return;
 const m = modal(`<div class="mhead"><h3>Share</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><p class="b" style="margin:-6px 0 14px;overflow-wrap:anywhere">${esc(f.name)} <span class="muted" style="font-weight:600">· ${fmtB(f.size)}</span></p><div id="shBody"></div>`, { cls: 'mid' });
 m._fid = id; drawShare(m);
}
function drawShare(m) {
 const f = byId(m._fid), body = m.querySelector('#shBody'); if (!f || !body) return;
 const fresh = f.share && f.share.exp > Date.now(); let h = '';
 if (fresh) h += `<div class="sharegrid"><div><label class="fld"><span>Short link</span><div class="row" style="flex-wrap:nowrap"><input readonly value="${esc(f.share.url)}" id="shUrl" class="mono" style="font-size:14px"><button class="btn pri icon" data-act="shCopy" aria-label="Copy link">${ic('copy', 18)}</button></div></label>
  <p class="small muted">Works until about ${new Date(f.share.exp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. The file is encrypted and the key is only inside the link.</p>
  ${navigator.share ? `<button class="btn sm" data-act="shSys" style="margin-top:10px">${ic('share', 16)}Send link</button>` : ''}</div><div class="qrbox" style="width:170px;padding:10px">${qrSVG(f.share.url, { dark: '#0e1526' })}</div></div>`;
 else h += `<div class="card" style="box-shadow:none;background:var(--panel2)"><h3>Short link + QR code</h3><p class="small muted" style="margin-bottom:12px">Encrypts the file on this device and makes a link anyone can open to view and download it. Links work for about 3 hours (free relay) and carry files up to ${fmtB(RELAY_MAX())}.</p>
  <button class="btn pri" data-act="shCreate" ${syncAvailable() ? '' : 'disabled'}>${ic('link', 18)}Create link</button>${syncAvailable() ? '' : '<p class="small muted" style="margin-top:8px">Needs DESk opened from its web address.</p>'}</div>`;
 h += `<div class="row" style="margin-top:14px"><button class="btn" data-act="pvDlId" data-id="${f.id}">${ic('download', 18)}Download</button>${navigator.canShare ? `<button class="btn" data-act="shNative">${ic('share', 18)}Share via apps</button>` : ''}</div>`;
 body.innerHTML = h;
}
Object.assign(ACT, {
 shCopy: () => copyText($('#shUrl').value, 'Link copied'),
 shSys: () => { const f = byId(topModal()._fid); navigator.share({ title: f.name, url: f.share.url }).catch(() => { }) },
 shCreate: async (d, el) => { const m = el.closest('.mwrap'); el.disabled = true; el.textContent = 'Encrypting & uploading…'; try { await createShareLink(byId(m._fid)); drawShare(m); render(); toast('Short link ready') } catch (e) { toast(e.message || 'Couldn’t create link', 'err'); el.disabled = false; el.innerHTML = ic('link', 18) + 'Create link' } },
 shNative: async (d, el) => { const f = byId(el.closest('.mwrap')._fid), b = await getBlob(f, { wait: true }); if (!b) return toast('File isn’t on this device yet', 'err'); if (!await nativeShareFile(b, f.name, f.type)) toast('This browser can’t share files — use Download or a short link', 'err') },
 pvDlId: d => downloadFiles([d.id])
});
// Landing page for a share link (#/s/<id>/<key>)
let shareGot = null;
VIEWS.share = () => `<div class="share-land" id="shLand">${LOGO(64)}<h1>Opening shared file…</h1><p class="muted">Decrypting on this device</p></div>`;
AFTER.share = async () => {
 const el = $('#shLand'); if (!el) return;
 try {
  const r = await openShareLink(S.share.id, S.share.key); shareGot = r;
  if (!r) { el.innerHTML = `${LOGO(64)}<h1>This link has expired</h1><p class="muted">Share links last about 3 hours. Ask the sender for a new one.</p><button class="btn" data-act="goHome">Open DESk</button>`; return }
  const c = CATS[r.meta.cat] || CATS.Other, t = safeThumb(r.meta.mini);
  el.innerHTML = `${t ? `<img class="pv" src="${t}" alt="">` : `<span style="color:${c.c}">${ic(c.ic, 72)}</span>`}<h1 style="overflow-wrap:anywhere"></h1><p class="muted">${fmtB(r.meta.size)} · ${esc(r.meta.cat || 'File')} · shared with DESk</p>
   ${r.ready ? `<div class="row" style="justify-content:center"><button class="btn pri" data-act="shGet">${ic('download', 18)}Download</button>${S.profile ? `<button class="btn" data-act="shSave">${ic('plus', 18)}Save to my DESk</button>` : ''}</div>` : '<p class="muted">The file is still uploading — try again in a moment.</p>'}
   <button class="btn ghost sm" data-act="goHome">${S.profile ? 'Open DESk' : 'What is DESk?'}</button>`;
  el.querySelector('h1').textContent = String(r.meta.name || 'Shared file');
 } catch { el.innerHTML = `${LOGO(64)}<h1>Couldn’t open this link</h1><p class="muted">Check your connection, or make sure you copied the whole link.</p><button class="btn" data-act="goHome">Open DESk</button>` }
};
Object.assign(ACT, {
 shGet: async (d, el) => { el.disabled = true; try { saveBlob(await shareGot.get(), shareGot.meta.name) } catch { toast('The file couldn’t be fetched', 'err') } el.disabled = false },
 shSave: async (d, el) => { el.disabled = true; try { const b = await shareGot.get(); const r = await addFile(b, { name: shareGot.meta.name, type: shareGot.meta.type, origin: 'share' }); toast('Saved to ' + r.folder); syncSoon() } catch { toast('The file couldn’t be fetched', 'err') } el.disabled = false },
 goHome: () => { S.share = null; if (S.profile) go('home'); else { location.hash = '#/'; showLanding() } }
});

/* ================= HOME ================= */
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' };
function catStats(list) { const o = {}; list.forEach(f => { const c = o[f.cat] || (o[f.cat] = { n: 0, b: 0 }); c.n++; c.b += f.size }); return o }
function dupGroups() { const m = {}; live().forEach(f => { if (f.hash) (m[f.hash] = m[f.hash] || []).push(f) }); return Object.values(m).filter(g => g.length > 1).map(g => g.sort((a, b) => (b.fav - a.fav) || a.added - b.added)) }
VIEWS.home = () => {
 const L = live(), bytes = L.reduce((a, f) => a + f.size, 0), cs = catStats(L), recent = L.slice().sort((a, b) => Math.max(b.added, b.opened || 0) - Math.max(a.added, a.opened || 0)).slice(0, 6);
 const dups = dupGroups(), dupBytes = dups.reduce((a, g) => a + g.slice(1).reduce((x, f) => x + f.size, 0), 0), tr = S.files.filter(f => f.trashed);
 const tips = [];
 if (dups.length) tips.push(['broom', `${dups.length} duplicate set${dups.length > 1 ? 's' : ''} · ${fmtB(dupBytes)} to reclaim`, 'Review in Clean up', 'clean']);
 if (tr.length) tips.push(['trash', `${tr.length} item${tr.length > 1 ? 's' : ''} in Trash · ${fmtB(tr.reduce((a, f) => a + f.size, 0))}`, 'Open Trash', 'trash']);
 if (S.vault) { const H = vaultHealth(); if (H.weak.length || H.reused.length) tips.push(['shield', `${H.weak.length} weak and ${H.reused.length} reused passwords`, 'Fix in Passwords', 'vault']) }
 else if (!S.vaultRec) tips.push(['key', 'Keep logins, cards and Wi-Fi keys encrypted in one place', 'Set up the vault', 'vault']);
 if (!isStandalone() && ONLINE_APP()) tips.push(['phone', 'Add DESk to your home screen — it opens like an app and works offline', 'Install DESk', 'install']);
 if (syncAvailable() && !linked()) tips.push(['devices', 'Link your phone and computer to see files everywhere', 'Link devices', 'devices']);
 return `<div class="sect" style="margin-top:4px"><div><h1>${greet()}</h1><p class="muted">${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · ${L.length} item${L.length === 1 ? '' : 's'} sorted on ${esc(S.deviceName)}</p></div></div>
 <div class="hero"><div class="card ringcard"><div class="ring" id="ring">${ringSVG(0)}<div class="lab"><b>${fmtB(bytes)}</b><span class="small muted">in DESk</span></div></div>
   <div class="grow" style="display:grid;gap:10px;width:100%"><h3 style="margin:0">Storage on this device</h3><p class="small muted" id="ringTxt">Checking available space…</p>
   <div class="grid g2" style="gap:10px"><div class="stat"><b>${L.length}</b><span>Files</span></div><div class="stat"><b>${S.scans.length}</b><span>Scans</span></div><div class="stat"><b>${S.vault ? S.vault.entries.length : (S.vaultRec ? '—' : 0)}</b><span>Passwords${S.vaultRec && !S.vault ? ' (locked)' : ''}</span></div><div class="stat"><b>${linked() ? listDevices().length : 1}</b><span>Device${linked() && listDevices().length > 1 ? 's' : ''}</span></div></div></div></div>
  <div class="card"><h3>Quick actions</h3><div class="qa">
   <button data-act="upFiles"><span class="ib">${ic('upload')}</span>Upload files</button><button data-act="upDir"><span class="ib">${ic('folder')}</span>Upload folder</button>
   <button data-act="scan"><span class="ib">${ic('scan')}</span>Scan document</button><button data-act="vNewQuick"><span class="ib">${ic('key')}</span>New password</button>
   ${setting('stealth') ? '' : `<button data-act="nav" data-v="hidden"><span class="ib">${ic('eyeoff')}</span>Hidden files</button>`}<button data-act="nav" data-v="devices"><span class="ib">${ic('qr')}</span>Link a device</button></div></div></div>
 ${tips.length ? `<div class="grid g2" style="margin-top:16px">${tips.slice(0, 4).map(([i, t, a, v]) => `<button class="card row" style="text-align:left;flex-wrap:nowrap" data-act="${v === 'trash' ? 'folder' : v === 'install' ? 'install' : 'nav'}" data-v="${v}" data-f="Trash"><span class="ib" style="width:42px;height:42px;border-radius:12px;background:var(--bsoft);color:var(--blue2);display:grid;place-items:center;flex:none">${ic(i)}</span><span class="grow"><b style="display:block">${esc(t)}</b><span class="small" style="color:var(--blue2);font-weight:700">${a} →</span></span></button>`).join('')}</div>` : ''}
 <div class="sect"><h2>Sorted for you</h2><button class="btn ghost sm" data-act="nav" data-v="files">All files ${ic('chev', 16)}</button></div>
 ${L.length ? `<div class="cats">${Object.entries(cs).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => { const c = CATS[k] || CATS.Other; return `<button class="cat" data-act="folder" data-f="${esc(k)}"><span class="ib" style="background:${c.c}">${ic(c.ic, 20)}</span><b>${esc(k)}</b><span class="small muted">${v.n} item${v.n > 1 ? 's' : ''} · ${fmtB(v.b)}</span></button>` }).join('')}</div>`
  : `<div class="card empty">${ic('upload', 44)}<h3>Drop anything here to start</h3><p>Photos, PDFs, videos, music, zips, apps — DESk files each one into the right folder and tags it.</p><div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri" data-act="upFiles">${ic('upload', 18)}Upload files</button><button class="btn" data-act="scan">${ic('scan', 18)}Scan a document</button></div></div>`}
 ${recent.length ? `<div class="sect"><h2>Recent</h2></div><div class="fgrid">${recent.map(cardHTML).join('')}</div>` : ''}`;
};
function ringSVG(p) { const C = 2 * Math.PI * 42; return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--blue)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.max(.02, Math.min(1, p)))}"/></svg>` }
AFTER.home = async () => {
 const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate().catch(() => null) : null;
 const el = $('#ringTxt'); if (!el) return;
 if (est && est.quota) { const p = est.usage / est.quota; $('#ring svg').outerHTML = ringSVG(p); el.textContent = `${fmtB(est.usage)} of ${fmtB(est.quota)} browser storage used · ${fmtB(Math.max(0, est.quota - est.usage))} free for DESk` }
 else el.textContent = 'Your browser doesn’t report storage space.';
};
ACT.vNewQuick = () => { if (S.vault) editEntry(null, 'login'); else { go('vault'); toast(S.vaultRec ? 'Unlock the vault first' : 'Create your vault first') } };

/* ================= INSIGHTS ================= */
const T0 = Date.now(); let fps = 0, fpsRaf = 0, fpsN = 0, fpsT = 0, liveTimer = 0, battery = null, gpu = null;
function gpuName() { if (gpu !== null) return gpu; try { const c = document.createElement('canvas'), g = c.getContext('webgl') || c.getContext('experimental-webgl'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); gpu = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g ? g.getParameter(g.RENDERER) : 'Not available' } catch { gpu = 'Not available' } return gpu }
function fpsLoop(t) { fpsN++; if (t - fpsT >= 1000) { fps = Math.round(fpsN * 1000 / (t - fpsT)); fpsN = 0; fpsT = t } if (S.view === 'insights') fpsRaf = requestAnimationFrame(fpsLoop); else fpsRaf = 0 }
function liveHTML() {
 const c = navigator.connection || {}, mem = performance.memory, up = Math.round((Date.now() - T0) / 1000);
 const tile = (ico, label, val, sub = '') => `<div class="card stat"><span class="row" style="gap:6px;color:var(--muted)">${ic(ico, 16)}${label}</span><b>${val}</b><span>${sub}</span></div>`;
 return `<div class="grid g4">
  ${tile('cpu', 'Processor', navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' cores' : '—', 'Logical threads')}
  ${tile('hdd', 'Device memory', navigator.deviceMemory ? '≥ ' + navigator.deviceMemory + ' GB' : 'Not reported', mem ? `App heap ${fmtB(mem.usedJSHeapSize)} of ${fmtB(mem.jsHeapSizeLimit)}` : 'RAM (rounded by browser)')}
  ${tile('battery', 'Battery', battery ? Math.round(battery.level * 100) + '%' : 'Not reported', battery ? (battery.charging ? 'Charging' + (isFinite(battery.chargingTime) && battery.chargingTime ? ` · full in ${Math.round(battery.chargingTime / 60)} min` : '') : (isFinite(battery.dischargingTime) ? `About ${Math.round(battery.dischargingTime / 3600)} h left` : 'On battery')) : 'This browser hides battery info')}
  ${tile('wifi', 'Network', navigator.onLine ? (c.effectiveType ? c.effectiveType.toUpperCase() : 'Online') : 'Offline', c.downlink ? `${c.downlink} Mb/s · ${c.rtt} ms latency${c.saveData ? ' · data saver' : ''}` : (navigator.onLine ? 'Connected' : 'No connection'))}
  ${tile('bolt', 'Smoothness', fps ? fps + ' fps' : '…', 'Live frame rate')}
  ${tile('clock', 'Session', up < 3600 ? Math.floor(up / 60) + 'm ' + (up % 60) + 's' : Math.floor(up / 3600) + 'h ' + Math.floor(up % 3600 / 60) + 'm', new Date().toLocaleTimeString())}
  ${tile('image', 'Screen', `${screen.width}×${screen.height}`, `${devicePixelRatio}× density · ${innerWidth}×${innerHeight} window`)}
  ${tile('globe', 'Region', Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' '), navigator.language)}</div>`;
}
VIEWS.insights = () => {
 const L = live(), cs = catStats(L), tot = L.reduce((a, f) => a + f.size, 0) || 1, i = deviceInfo();
 const months = []; for (let k = 11; k >= 0; k--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - k); months.push({ y: d.getFullYear(), m: d.getMonth(), n: 0 }) }
 L.forEach(f => { const d = new Date(f.added); const mo = months.find(x => x.y === d.getFullYear() && x.m === d.getMonth()); if (mo) mo.n++ });
 const mx = Math.max(1, ...months.map(m => m.n));
 const folders = {}; L.forEach(f => folders[f.folder] = (folders[f.folder] || 0) + 1);
 const tags = {}; L.forEach(f => f.tags.forEach(t => tags[t] = (tags[t] || 0) + 1));
 const dups = dupGroups(), dupB = dups.reduce((a, g) => a + g.slice(1).reduce((x, f) => x + f.size, 0), 0);
 const tr = S.files.filter(f => f.trashed), big = L.slice().sort((a, b) => b.size - a.size).slice(0, 6);
 const exts = {}; L.forEach(f => { const e = extOf(f.name) || 'none'; exts[e] = (exts[e] || 0) + 1 });
 const feat = [['Live camera', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)], ['QR detection', true], ['Folder cleaning', 'showDirectoryPicker' in window], ['Native share', !!navigator.share], ['Encryption', !!(crypto && crypto.subtle)], ['Offline storage', !MEM], ['Device sync', syncAvailable()], ['Works offline', 'serviceWorker' in navigator]];
 return `<div class="sect" style="margin-top:6px"><div><h1>Device insights</h1><p class="muted livep"><span class="live" aria-label="Live"><i></i>Live</span>Readings from ${esc(S.deviceName)} · updates every 2 seconds</p></div><button class="btn" data-act="persist">${ic('shield', 18)}Protect storage</button></div>
 <div id="live">${liveHTML()}</div>
 <div class="grid g2" style="margin-top:16px">
  <div class="card"><h3>Content by type</h3><div id="stEst" class="small muted" style="margin:-4px 0 10px">${L.length} items · ${fmtB(tot === 1 ? 0 : tot)}</div>
   ${Object.entries(cs).sort((a, b) => b[1].b - a[1].b).map(([k, v]) => `<div class="hrow"><span class="row" style="gap:8px;flex-wrap:nowrap"><span style="color:${(CATS[k] || CATS.Other).c}">${ic((CATS[k] || CATS.Other).ic, 16)}</span>${esc(k)}</span><div class="bar"><i style="width:${Math.max(2, v.b / tot * 100)}%;background:${(CATS[k] || CATS.Other).c}"></i></div><span class="r">${v.n} · ${fmtB(v.b)}</span></div>`).join('') || '<p class="muted">No files yet.</p>'}</div>
  <div class="card"><h3>Added per month</h3><div class="months">${months.map(m => `<div title="${m.n} items"><span>${m.n || ''}</span><i style="height:${m.n / mx * 85}%"></i><span>${new Date(m.y, m.m).toLocaleDateString(undefined, { month: 'narrow' })}</span></div>`).join('')}</div>
   <hr><div class="grid g2" style="gap:10px"><div class="stat"><b>${L.filter(f => Date.now() - f.added < 7 * 864e5).length}</b><span>Added this week</span></div><div class="stat"><b>${L.length ? fmtB(tot / L.length) : '—'}</b><span>Average size</span></div></div></div>
  <div class="card"><h3>Health & housekeeping</h3><dl class="kv">
   <dt>Duplicates</dt><dd>${dups.length} set${dups.length === 1 ? '' : 's'} · ${fmtB(dupB)}</dd><dt>Trash</dt><dd>${tr.length} · ${fmtB(tr.reduce((a, f) => a + f.size, 0))}</dd>
   <dt>Linked devices</dt><dd>${linked() ? listDevices().length : 'Not linked'}</dd><dt>Kept on other devices</dt><dd>${L.filter(f => f.offloaded).length} · ${fmtB(L.filter(f => f.offloaded).reduce((a, f) => a + f.size, 0))}</dd>
   <dt>Shared links</dt><dd>${L.filter(f => f.share).length}</dd><dt>Scans</dt><dd>${S.scans.length} · ${S.scans.reduce((a, s) => a + (s.pages ? s.pages.length : 0), 0)} pages</dd>
   <dt>Favorites</dt><dd>${L.filter(f => f.fav).length}</dd><dt>Hidden</dt><dd>${S.hiddenItems ? S.hiddenItems.length + ' items' : S.hiddenCfgCache ? 'Locked' : 'Not set up'}</dd>
   <dt>Passwords</dt><dd>${S.vault ? S.vault.entries.length + ' · score ' + vaultHealth().score + '%' : S.vaultRec ? 'Locked' : 'Not set up'}</dd></dl>
   <button class="btn sm" data-act="nav" data-v="clean" style="margin-top:12px">${ic('broom', 16)}Open Clean up</button></div>
  <div class="card"><h3>Largest files</h3>${big.length ? big.map(f => `<div class="cl" style="grid-template-columns:40px minmax(0,1fr) auto" data-act="card" data-id="${f.id}" role="button" tabindex="0"><span class="th">${thumbHTML(f, 20)}</span><span class="nm">${esc(f.name)}</span><span class="small muted" style="white-space:nowrap">${fmtB(f.size)}</span></div>`).join('') : '<p class="muted">No files yet.</p>'}</div>
  <div class="card"><h3>Top folders & tags</h3><div class="tagl" style="margin-bottom:12px">${Object.entries(folders).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `<button class="chip" data-act="folder" data-f="${esc(k)}">${ic('folder', 14)}${esc(k)} <span style="opacity:.6">${v}</span></button>`).join('') || '<span class="muted small">—</span>'}</div>
   <div class="tagl">${Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `<button class="chip" data-act="pvTagGo" data-t="${esc(k)}">#${esc(k)} <span style="opacity:.6">${v}</span></button>`).join('') || ''}</div>
   <hr><div class="small muted b" style="margin-bottom:6px">File extensions</div><div class="tagl">${Object.entries(exts).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `<span class="badge">.${esc(k)} · ${v}</span>`).join('')}</div></div>
  <div class="card"><h3>Device details</h3><dl class="kv" id="devKV">
   <dt>Device</dt><dd>${esc(i.type[0].toUpperCase() + i.type.slice(1))} · ${esc(i.os)}</dd><dt>Browser</dt><dd>${esc(i.br)}</dd><dt>Graphics</dt><dd>${esc(gpuName())}</dd>
   <dt>Colour depth</dt><dd>${screen.colorDepth}-bit${matchMedia('(dynamic-range: high)').matches ? ' · HDR' : ''}</dd><dt>Orientation</dt><dd>${esc((screen.orientation && screen.orientation.type || (innerWidth > innerHeight ? 'landscape' : 'portrait')).replace('-primary', ''))}</dd>
   <dt>Touch points</dt><dd>${navigator.maxTouchPoints || 0}</dd><dt>Theme</dt><dd>${matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}${matchMedia('(prefers-reduced-motion: reduce)').matches ? ' · reduced motion' : ''}</dd>
   <dt>Languages</dt><dd>${esc((navigator.languages || [navigator.language]).slice(0, 3).join(', '))}</dd><dt>Storage</dt><dd id="stQ">…</dd><dt>Persistent</dt><dd id="stP">…</dd></dl></div>
  <div class="card"><h3>What this device supports</h3><div class="grid g2" style="gap:8px">${feat.map(([k, v]) => `<span class="row" style="gap:8px;flex-wrap:nowrap"><span style="color:${v ? 'var(--green)' : 'var(--muted)'}">${ic(v ? 'check' : 'x', 18)}</span><span class="${v ? '' : 'muted'}">${k}</span></span>`).join('')}</div>
   ${!('showDirectoryPicker' in window) ? '<p class="small muted" style="margin-top:12px">Deleting files in folders outside DESk needs Chrome or Edge on a computer.</p>' : ''}</div></div>`;
};
AFTER.insights = async () => {
 clearInterval(liveTimer); liveTimer = setInterval(() => { if (S.view !== 'insights') return clearInterval(liveTimer); const el = $('#live'); if (el) el.innerHTML = liveHTML() }, 2000);
 if (!fpsRaf) { fpsT = performance.now(); fpsN = 0; fpsRaf = requestAnimationFrame(fpsLoop) }
 if (!battery && navigator.getBattery) navigator.getBattery().then(b => { battery = b }).catch(() => { });
 const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate().catch(() => null) : null;
 const p = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted().catch(() => null) : null;
 const q = $('#stQ'); if (q) q.textContent = est && est.quota ? `${fmtB(est.usage)} used of ${fmtB(est.quota)}` : 'Not reported';
 const pp = $('#stP'); if (pp) pp.textContent = p === null ? 'Unknown' : p ? 'Yes — won’t be auto-cleared' : 'No — browser may clear it when low on space';
};
ACT.persist = async () => { if (!navigator.storage || !navigator.storage.persist) return toast('This browser can’t protect storage', 'err'); const ok = await navigator.storage.persist().catch(() => false); toast(ok ? 'Storage protected — the browser won’t clear DESk automatically' : 'The browser declined. Installing DESk or using it more often usually helps.', ok ? '' : 'err'); render() };

/* ================= CLEAN UP ================= */
const CL = { sel: new Set(), largeMB: 50, oldDays: 180 };
const JUNK = /\.(tmp|temp|crdownload|part|partial|download|bak|old|dmp)$|^~\$|^\._|^\.DS_Store$|^Thumbs\.db$|^desktop\.ini$/i;
function cleanSets() {
 const L = live(), dups = dupGroups();
 return {
  dups: dups.flatMap(g => g.slice(1)), dupGroups: dups,
  large: L.filter(f => f.size >= CL.largeMB * 1048576 && !f.offloaded).sort((a, b) => b.size - a.size),
  old: L.filter(f => Date.now() - Math.max(f.added, f.opened || 0, f.modified || 0) > CL.oldDays * 864e5 && !f.fav),
  junk: L.filter(f => f.size === 0 || JUNK.test(f.name)),
  shots: L.filter(f => f.folder === 'Images/Screenshots' && Date.now() - f.added > 30 * 864e5),
  offload: L.filter(f => !f.offloaded && holdersOf(f.id).length),
  trash: S.files.filter(f => f.trashed)
 };
}
function clRow(f, note = '') { return `<label class="cl"><input type="checkbox" class="ck" data-act="clCk" data-id="${f.id}" ${CL.sel.has(f.id) ? 'checked' : ''}><span class="th">${thumbHTML(f, 20)}</span><span><div class="nm">${esc(f.name)}</div><div class="small muted">${esc(f.folder)}${note ? ' · ' + note : ''}</div></span><span class="small muted" style="white-space:nowrap">${fmtB(f.size)}</span></label>` }
function clSection(key, icon, title, desc, items, extra = '', rowNote) {
 const b = items.reduce((a, f) => a + f.size, 0), all = items.length && items.every(f => CL.sel.has(f.id));
 return `<details class="card" ${items.length ? 'open' : ''} style="margin-bottom:14px"><summary class="row" style="cursor:pointer;list-style:none;flex-wrap:nowrap"><span class="ib" style="width:42px;height:42px;border-radius:12px;background:${items.length ? 'var(--bsoft)' : 'var(--gsoft)'};color:${items.length ? 'var(--blue2)' : 'var(--green)'};display:grid;place-items:center;flex:none">${ic(items.length ? icon : 'check')}</span>
  <span class="grow"><b style="display:block">${title}</b><span class="small muted">${items.length ? `${items.length} item${items.length > 1 ? 's' : ''} · ${fmtB(b)}` : 'Nothing to clean'} — ${desc}</span></span>${items.length ? `<button class="btn sm" data-act="clAll" data-k="${key}">${all ? 'Clear' : 'Select all'}</button>` : ''}</summary>
  ${extra}${items.length ? `<div style="margin-top:10px;max-height:340px;overflow:auto">${items.slice(0, 200).map(f => clRow(f, rowNote ? rowNote(f) : '')).join('')}</div>` : ''}</details>`;
}
VIEWS.clean = () => {
 const s = cleanSets(); CL.sets = s;
 const selFiles = [...CL.sel].map(byId).filter(Boolean), selB = selFiles.reduce((a, f) => a + f.size, 0);
 const reclaim = [...new Set([...s.dups, ...s.junk, ...s.trash])].reduce((a, f) => a + f.size, 0);
 return `<div class="sect" style="margin-top:6px"><div><h1>Clean up</h1><p class="muted">${fmtB(reclaim)} can be reclaimed safely right now (duplicates, junk and Trash).</p></div><button class="btn pri" data-act="clSmart">${ic('wand', 18)}Smart select</button></div>
 ${selFiles.length ? `<div class="bulk"><b>${selFiles.length} selected · ${fmtB(selB)}</b><span class="grow"></span><button class="btn sm" data-act="clMoveDrive">${ic('hdd', 18)}Move to drive</button><button class="btn sm" data-act="clOffload">${ic('devices', 18)}Keep on other devices only</button><button class="btn sm" data-act="clTrash">${ic('trash', 18)}Move to Trash</button><button class="btn sm" data-act="clPurge">${ic('x', 18)}Delete forever</button><button class="btn sm icon" data-act="clNone" aria-label="Clear selection">${ic('x', 18)}</button></div>` : ''}
 ${clSection('dups', 'copy', 'Duplicates', 'identical content (matched by fingerprint); the oldest copy is kept', s.dups, '', f => { const g = s.dupGroups.find(g => g.includes(f)); return 'copy of ' + esc(g[0].name) })}
 ${clSection('junk', 'warn', 'Junk & empty files', 'temporary downloads, system files and 0-byte files', s.junk)}
 ${clSection('large', 'hdd', 'Large files', 'biggest space users', s.large, `<div class="row" style="margin-top:10px"><span class="small muted">Larger than</span>${[25, 50, 100, 500].map(n => `<button class="chip ${CL.largeMB === n ? 'on' : ''}" data-act="clLarge" data-n="${n}">${n} MB</button>`).join('')}</div>`)}
 ${clSection('old', 'clock', 'Old & untouched', 'not opened in a long time (favorites excluded)', s.old, `<div class="row" style="margin-top:10px"><span class="small muted">Untouched for</span>${[90, 180, 365, 730].map(n => `<button class="chip ${CL.oldDays === n ? 'on' : ''}" data-act="clOld" data-n="${n}">${n < 365 ? n + ' days' : n / 365 + ' year' + (n > 365 ? 's' : '')}</button>`).join('')}</div>`, f => 'last used ' + ago(Math.max(f.added, f.opened || 0)))}
 ${clSection('shots', 'image', 'Old screenshots', 'screenshots older than 30 days', s.shots)}
 ${clSection('offload', 'devices', 'Free up space on this device', 'these files are also on your other linked devices — remove the copy here and fetch it again when needed', s.offload)}
 ${clSection('trash', 'trash', 'Trash', `items auto-delete after ${setting('autoEmptyDays')} days`, s.trash, s.trash.length ? `<div class="row" style="margin-top:10px"><button class="btn sm" data-act="clRestoreAll">${ic('restore', 16)}Restore all</button><button class="btn sm danger" data-act="emptyTrash">Empty Trash</button></div>` : '')}
 <div class="card"><div class="row" style="margin-bottom:10px"><span class="ib" style="width:42px;height:42px;border-radius:12px;background:var(--bsoft);color:var(--blue2);display:grid;place-items:center;flex:none">${ic('hdd')}</span><span style="flex:1 1 220px"><b style="display:block">Clean a folder on this device</b><span class="small muted">Find duplicates, junk and large files in any folder outside DESk — Downloads is a great place to start.</span></span><button class="btn pri" data-act="lcPick">${ic('folder', 18)}Choose folder</button></div>
  <div id="lcOut">${lcHTML()}</div></div>`;
};
const LCS = { mode: null, files: null, report: null, sel: new Set(), dir: null, busy: false };
function lcHTML() {
 if (LCS.busy) return `<p class="muted">Scanning ${LCS.count || 0} files…</p>`;
 const r = LCS.report; if (!r) return ('showDirectoryPicker' in window) ? '<p class="small muted">DESk asks for permission to the folder you choose and only deletes what you select.</p>' : `<p class="small muted">This browser can analyze a folder but not delete from it. Chrome or Edge on a computer can do both.</p>`;
 const row = (x, note) => `<label class="cl"><input type="checkbox" class="ck" data-act="lcCk" data-p="${esc(x.path)}" ${LCS.sel.has(x.path) ? 'checked' : ''} ${LCS.mode === 'fsa' ? '' : 'disabled'}><span class="th">${ic('file', 18)}</span><span><div class="nm">${esc(x.name)}</div><div class="small muted">${esc(x.path)}${note ? ' · ' + note : ''}</div></span><span class="small muted" style="white-space:nowrap">${fmtB(x.size)}</span></label>`;
 const sel = r.all.filter(x => LCS.sel.has(x.path)), selB = sel.reduce((a, x) => a + x.size, 0);
 return `<div class="grid g4" style="margin:6px 0 14px"><div class="stat"><b>${r.total}</b><span>Files scanned</span></div><div class="stat"><b>${fmtB(r.bytes)}</b><span>Folder size</span></div><div class="stat"><b>${fmtB(r.dupB)}</b><span>In duplicates</span></div><div class="stat"><b>${fmtB(r.junkB)}</b><span>Junk</span></div></div>
  ${LCS.mode === 'fsa' ? `<div class="row" style="margin-bottom:10px"><button class="btn sm" data-act="lcSmart">${ic('wand', 16)}Select duplicates & junk</button><span class="grow"></span>${sel.length ? `<button class="btn sm danger" data-act="lcDelete">${ic('trash', 16)}Delete ${sel.length} from device · ${fmtB(selB)}</button>` : ''}</div>` : `<p class="small" style="color:#a06d00;margin-bottom:10px">${ic('info', 14, 'style="display:inline;vertical-align:-2px"')} Read-only scan in this browser: delete these yourself, or use DESk in Chrome/Edge on a computer to delete from here.</p>`}
  ${r.dups.length ? `<h4 style="margin:12px 0 4px">Duplicates</h4>${r.dups.map(x => row(x, 'same as ' + esc(x.orig))).join('')}` : ''}
  ${r.junk.length ? `<h4 style="margin:12px 0 4px">Junk & empty</h4>${r.junk.map(x => row(x)).join('')}` : ''}
  ${r.large.length ? `<h4 style="margin:12px 0 4px">Large (over 100 MB)</h4>${r.large.map(x => row(x)).join('')}` : ''}
  ${r.old.length ? `<h4 style="margin:12px 0 4px">Not modified in 2+ years</h4>${r.old.slice(0, 50).map(x => row(x, fmtD(x.mod))).join('')}` : ''}
  ${!r.dups.length && !r.junk.length && !r.large.length ? '<p class="muted">This folder looks tidy.</p>' : ''}`;
}
async function lcAnalyze() {
 const F = LCS.files; LCS.busy = true; LCS.count = F.length; renderIf('clean');
 const bySize = {}; F.forEach(x => { if (x.size > 0) (bySize[x.size] = bySize[x.size] || []).push(x) });
 const dups = [];
 for (const g of Object.values(bySize)) {
  if (g.length < 2) continue;
  const byH = {};
  for (const x of g) { try { const h = await hashBlob(x.file || await x.handle.getFile()); (byH[h] = byH[h] || []).push(x) } catch { } }
  Object.values(byH).forEach(h => { if (h.length > 1) { h.sort((a, b) => a.mod - b.mod); h.slice(1).forEach(x => { x.orig = h[0].path; dups.push(x) }) } });
 }
 const junk = F.filter(x => x.size === 0 || JUNK.test(x.name)), large = F.filter(x => x.size > 100 * 1048576).sort((a, b) => b.size - a.size), old = F.filter(x => Date.now() - x.mod > 730 * 864e5).sort((a, b) => a.mod - b.mod);
 const all = [...new Set([...dups, ...junk, ...large, ...old])];
 LCS.report = { total: F.length, bytes: F.reduce((a, x) => a + x.size, 0), dups, junk, large, old, all, dupB: dups.reduce((a, x) => a + x.size, 0), junkB: junk.reduce((a, x) => a + x.size, 0) };
 LCS.busy = false; LCS.sel.clear(); renderIf('clean');
}
async function lcPick() {
 if ('showDirectoryPicker' in window) {
  try {
   const dir = await window.showDirectoryPicker({ mode: 'readwrite' }); LCS.dir = dir; LCS.mode = 'fsa'; LCS.busy = true; LCS.count = 0; renderIf('clean');
   const out = [];
   const walk = async (h, path) => { for await (const [name, e] of h.entries()) { if (out.length >= 30000) return; if (e.kind === 'file') { try { const f = await e.getFile(); out.push({ name, path: path + name, size: f.size, mod: f.lastModified, parent: h, file: f }); LCS.count = out.length } catch { } } else if (!/^(node_modules|\.git)$/.test(name)) await walk(e, path + name + '/') } };
   await walk(dir, ''); LCS.files = out; return lcAnalyze();
  } catch (e) { LCS.busy = false; if (e && e.name === 'AbortError') return renderIf('clean'); }
 }
 const inp = document.createElement('input'); inp.type = 'file'; inp.webkitdirectory = true; inp.multiple = true;
 inp.onchange = () => { LCS.mode = 'ro'; LCS.files = [...inp.files].map(f => ({ name: f.name, path: f.webkitRelativePath || f.name, size: f.size, mod: f.lastModified, file: f })); lcAnalyze() };
 inp.click();
}
Object.assign(ACT, {
 clCk: (d, el) => { el.checked ? CL.sel.add(d.id) : CL.sel.delete(d.id); render() },
 clAll: (d, el, e) => { e.preventDefault(); const it = CL.sets[d.k]; const all = it.every(f => CL.sel.has(f.id)); it.forEach(f => all ? CL.sel.delete(f.id) : CL.sel.add(f.id)); render() },
 clNone: () => { CL.sel.clear(); render() },
 clSmart: () => { const s = CL.sets; [...s.dups, ...s.junk].forEach(f => CL.sel.add(f.id)); render(); toast(CL.sel.size ? `Selected ${CL.sel.size} duplicates and junk files` : 'Nothing obvious to clean — nice!') },
 clLarge: d => { CL.largeMB = +d.n; render() }, clOld: d => { CL.oldDays = +d.n; render() },
 clTrash: () => { const ids = [...CL.sel].filter(id => { const f = byId(id); return f && !f.trashed }); CL.sel.clear(); trashFiles(ids) },
 clPurge: async () => { const ids = [...CL.sel]; if (!await ask('Delete forever?', { body: `${ids.length} item(s) will be permanently removed from this device${linked() ? ' and your linked devices' : ''}.`, ok: 'Delete', danger: true })) return; CL.sel.clear(); purgeFiles(ids) },
 clOffload: () => { const ids = [...CL.sel]; CL.sel.clear(); offloadFiles(ids) },
 clRestoreAll: () => restoreFiles(S.files.filter(f => f.trashed).map(f => f.id)),
 lcPick: () => lcPick(),
 lcCk: (d, el) => { el.checked ? LCS.sel.add(d.p) : LCS.sel.delete(d.p); $('#lcOut').innerHTML = lcHTML() },
 lcSmart: () => { [...LCS.report.dups, ...LCS.report.junk].forEach(x => LCS.sel.add(x.path)); $('#lcOut').innerHTML = lcHTML() },
 lcDelete: async () => {
  const sel = LCS.report.all.filter(x => LCS.sel.has(x.path));
  if (!await ask(`Delete ${sel.length} file${sel.length > 1 ? 's' : ''} from this device?`, { body: `${fmtB(sel.reduce((a, x) => a + x.size, 0))} will be removed from the folder you chose. This skips the system Recycle Bin.`, ok: 'Delete from device', danger: true })) return;
  let n = 0, fail = 0;
  try { if (LCS.dir.requestPermission && await LCS.dir.requestPermission({ mode: 'readwrite' }) !== 'granted') return toast('Permission to change that folder was not given', 'err') } catch { }
  for (const x of sel) { try { await x.parent.removeEntry(x.name); n++ } catch { fail++ } }
  LCS.files = LCS.files.filter(x => !sel.includes(x) || fail); toast(`Deleted ${n} file${n === 1 ? '' : 's'} from your device${fail ? ` · ${fail} couldn’t be removed` : ''}`);
  LCS.files = LCS.files.filter(x => !LCS.sel.has(x.path)); lcAnalyze();
 }
});


async function offloadFiles(ids) {
 let n = 0, bytes = 0;
 for (const id of ids) { const f = byId(id); if (f && !f.offloaded && holdersOf(id).length) { await dbDel('blobs', id); f.offloaded = true; await saveRec(f); n++; bytes += f.size } }
 refreshHave(); syncSoon();
 toast(n ? `Freed ${fmtB(bytes)} — ${n} file${n === 1 ? '' : 's'} kept on your other devices` : 'Those files aren’t on another device yet', n ? '' : 'err'); render();
}

/* ================= EXTERNAL STORAGE: SD cards, USB flash drives, external disks =================
 Where the browser supports it (Chrome / Edge / Opera on computers and Chromebooks), you pick a folder
 on the drive once; DESk remembers it and can save, move, back up and import files there whenever the
 drive is plugged in. Everywhere else DESk hands files to the system "Save" / share sheet, where you can
 choose the SD card or USB drive (Android: Files › SD card; iPhone/iPad: Save to Files › your drive). */
const DR = { list: [], state: {} };
const fsaOK = () => 'showDirectoryPicker' in window;
const safeName = n => String(n).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/^\.+/, '_').slice(0, 180) || 'file';
async function loadDrives() { try { DR.list = (await kvGet('drives', [])) || [] } catch { DR.list = [] } }
const saveDrives = () => kvSet('drives', DR.list);
async function driveState(d) {
 try { const p = await d.handle.queryPermission({ mode: 'readwrite' }); if (p !== 'granted') return DR.state[d.id] = 'ask'; for await (const _ of d.handle.keys()) break; return DR.state[d.id] = 'ok' }
 catch (e) { return DR.state[d.id] = 'missing' }
}
async function drivePerm(d) {
 try { if (await d.handle.queryPermission({ mode: 'readwrite' }) === 'granted' || await d.handle.requestPermission({ mode: 'readwrite' }) === 'granted') { for await (const _ of d.handle.keys()) break; DR.state[d.id] = 'ok'; return true } }
 catch (e) { DR.state[d.id] = 'missing'; toast(`${d.name} isn’t connected — plug it in and try again`, 'err'); return false }
 toast('Permission to use that drive wasn’t given', 'err'); return false;
}
async function addDrive() {
 if (!fsaOK()) return driveHelp();
 try {
  const h = await window.showDirectoryPicker({ id: 'desk-drive', mode: 'readwrite' });
  if (DR.list.some(d => d.name === h.name) && !await ask('Add this folder again?', { body: `A location called <b>${esc(h.name)}</b> is already saved.`, ok: 'Add' })) return;
  const label = await ask('Name this location', { input: 'Shown in DESk', value: h.name, ok: 'Save' });
  const d = { id: uid(8), name: (label || h.name).slice(0, 40), folder: h.name, handle: h, added: Date.now(), auto: false, done: {} };
  DR.list.push(d); await saveDrives(); DR.state[d.id] = 'ok'; toast(`${d.name} added — DESk can now save files there`); render();
 } catch (e) { if (e && e.name !== 'AbortError') toast('That folder can’t be used: ' + (e.message || e.name), 'err') }
}
async function writeFile(dir, relPath, blob) {
 const parts = relPath.split('/').filter(Boolean).map(safeName); let h = dir;
 for (const p of parts.slice(0, -1)) h = await h.getDirectoryHandle(p, { create: true });
 let name = parts[parts.length - 1];
 try { const ex = await (await h.getFileHandle(name)).getFile(); if (ex.size === blob.size) return { skipped: true, name }; const dot = name.lastIndexOf('.'), base = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : ''; for (let k = 2; k < 999; k++) { const t = `${base} (${k})${ext}`; try { await h.getFileHandle(t) } catch { name = t; break } } } catch { }
 const fh = await h.getFileHandle(name, { create: true }), w = await fh.createWritable(); await w.write(blob); await w.close();
 return { name };
}
async function pickDrive(title) {
 const ok = DR.list;
 if (!ok.length) { await addDrive(); return DR.list[DR.list.length - 1] || null }
 if (ok.length === 1) return ok[0];
 return new Promise(res => {
  const m = modal(`<h3>${esc(title)}</h3><div style="display:grid;gap:8px">${ok.map(d => `<button class="btn wrap" data-act="drPick" data-id="${d.id}">${ic('hdd', 20)}<span><b>${esc(d.name)}</b><br><span class="small muted">${DR.state[d.id] === 'missing' ? 'Not connected' : 'Folder: ' + esc(d.folder)}</span></span></button>`).join('')}
   <button class="btn ghost" data-act="drPick" data-id="new">${ic('plus', 18)}Another drive or folder…</button></div><div class="row end" style="margin-top:12px"><button class="btn ghost" data-close>Cancel</button></div>`, { onClose: () => res(m._d || null) });
  m._list = ok;
 }).then(async d => d === 'new' ? (await addDrive(), DR.list[DR.list.length - 1]) : d);
}
ACT.drPick = (d, el) => { const w = el.closest('.mwrap'); w._d = d.id === 'new' ? 'new' : DR.list.find(x => x.id === d.id); w.close() };
async function saveToDrive(ids, { move = false } = {}) {
 const recs = ids.map(byId).filter(Boolean); if (!recs.length) return;
 if (!fsaOK()) return saveViaSystem(recs);
 const d = await pickDrive(move ? 'Move to which drive?' : 'Save to which drive?'); if (!d || !await drivePerm(d)) return;
 if (move && !await ask(`Move ${recs.length} item${recs.length > 1 ? 's' : ''} to ${d.name}?`, { body: 'They’re copied to the drive, then removed from DESk on this device to free up space.', ok: 'Move' })) return;
 const q = upPanel(recs.length); let n = 0, skip = 0, fail = 0, bytes = 0; const moved = [];
 for (let i = 0; i < recs.length; i++) {
  const f = recs[i]; q.step(i, f.name);
  try { const b = await getBlob(f, { wait: true }); if (!b) { fail++; continue } const r = await writeFile(d.handle, 'DESk/' + f.folder + '/' + f.name, b); r.skipped ? skip++ : n++; bytes += f.size; d.done[f.id] = 1; moved.push(f.id) }
  catch (e) { console.warn(e); fail++; if (e.name === 'NotFoundError' || e.name === 'NotReadableError') { toast(`${d.name} was disconnected`, 'err'); break } if (e.name === 'QuotaExceededError') { toast(`${d.name} is full`, 'err'); break } }
 }
 d.lastUsed = Date.now(); await saveDrives();
 if (move && moved.length) await purgeFiles(moved, true);
 q.done(`${move ? 'Moved' : 'Saved'} ${n + skip} item${n + skip === 1 ? '' : 's'} to ${d.name}`, [`${fmtB(bytes)} in DESk/…`, skip ? `${skip} already there` : '', fail ? `${fail} failed` : ''].filter(Boolean).join(' · '));
 S.sel.clear(); render();
}
async function saveViaSystem(recs) {
 // Phones & browsers without folder access: the system save / share sheet lets you pick the SD card or USB drive
 const blobs = []; for (const f of recs) { const b = await getBlob(f, { wait: true }); if (b) blobs.push(new File([b], f.name, { type: f.type || b.type })) }
 if (!blobs.length) return toast('Those files aren’t on this device yet', 'err');
 try { if (navigator.canShare && navigator.canShare({ files: blobs })) { await navigator.share({ files: blobs, title: 'Save to drive' }); return } } catch (e) { if (e.name === 'AbortError') return }
 if (blobs.length === 1) return saveBlob(blobs[0], blobs[0].name);
 saveBlob(await makeZip(recs.map((f, i) => ({ name: f.folder.replace(/\//g, ' - ') + '/' + f.name, blob: blobs[i] })).filter(e => e.blob)), `DESk-${new Date().toISOString().slice(0, 10)}.zip`);
 toast('Choose your SD card or USB drive in the save dialog');
}
async function backupToDrive(d) {
 if (!await drivePerm(d)) return;
 const L = live().filter(f => !f.offloaded); const q = upPanel(L.length); let n = 0, skip = 0, fail = 0;
 for (let i = 0; i < L.length; i++) { const f = L[i]; q.step(i, f.name); try { const b = await dbGet('blobs', f.id); if (!b) continue; const r = await writeFile(d.handle, 'DESk/' + f.folder + '/' + f.name, b); r.skipped ? skip++ : n++; d.done[f.id] = 1 } catch (e) { fail++; if (/NotFound|NotReadable|Quota/.test(e.name)) break } }
 d.lastBackup = Date.now(); await saveDrives();
 q.done(`Backed up to ${d.name}`, [`${n} copied`, skip ? `${skip} already there` : '', fail ? `${fail} failed` : ''].filter(Boolean).join(' · ')); render();
}
async function importFromDrive(d) {
 if (!await drivePerm(d)) return;
 let dir = d.handle; try { dir = await d.handle.getDirectoryHandle('DESk') } catch { }
 const out = [];
 const walk = async (h, p) => { for await (const [name, e] of h.entries()) { if (out.length >= 5000) return; if (e.kind === 'file') { try { const f = await e.getFile(); try { Object.defineProperty(f, 'webkitRelativePath', { value: p + name }) } catch { } out.push(f) } catch { } } else if (!name.startsWith('.')) await walk(e, p + name + '/') } };
 toast('Reading ' + d.name + '…'); await walk(dir, '');
 if (!out.length) return toast('No files found there', 'err');
 ingest(out);
}
async function autoCopy() {
 for (const d of DR.list.filter(x => x.auto)) {
  if (await driveState(d) !== 'ok') continue;
  const todo = live().filter(f => !f.offloaded && !d.done[f.id]); if (!todo.length) continue;
  let n = 0; for (const f of todo) { try { const b = await dbGet('blobs', f.id); if (!b) continue; await writeFile(d.handle, 'DESk/' + f.folder + '/' + f.name, b); d.done[f.id] = 1; n++ } catch { break } }
  await saveDrives(); if (n) toast(`Copied ${n} new file${n === 1 ? '' : 's'} to ${d.name}`);
 }
}
function driveHelp() {
 const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua);
 modal(`<div class="mhead"><h3>Save to an SD card or USB drive</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div>
  <p class="muted" style="margin-bottom:12px">This browser can’t keep a drive connected to DESk, but you can still save any file to it:</p>
  <ol class="steps">${ios ? '<li>Select files in DESk and choose <b>Save to drive</b>.</li><li>In the share sheet tap <b>Save to Files</b>.</li><li>Pick your USB drive or SD card under <b>Locations</b>.</li>' : android ? '<li>Select files in DESk and choose <b>Save to drive</b>.</li><li>Pick <b>Files</b> (or <b>My Files</b>) in the share sheet, or allow the download.</li><li>Choose <b>SD card</b> or your USB drive as the destination.</li><li>Tip: in Chrome settings → Downloads you can turn on <b>Ask where to save files</b>.</li>' : '<li>Select files and choose <b>Save to drive</b>.</li><li>When your browser asks where to save, pick the drive.</li><li>For drives that stay linked to DESk, open DESk in Chrome or Edge on a computer.</li>'}</ol>
  <div class="row end" style="margin-top:14px"><button class="btn pri" data-close>Got it</button></div>`, { cls: 'mid' });
}
function drivesCardHTML() {
 const rows = DR.list.map(d => { const st = DR.state[d.id]; return `<div class="dev drv"><span class="ib">${ic('hdd', 24)}</span><div><div class="b">${esc(d.name)} <span class="badge ${st === 'ok' ? 'green' : st === 'missing' ? 'red' : ''}">${st === 'ok' ? 'Connected' : st === 'missing' ? 'Not connected' : 'Tap to allow'}</span></div>
  <div class="small muted">Folder “${esc(d.folder)}” · ${d.lastBackup ? 'backed up ' + ago(d.lastBackup) : d.lastUsed ? 'used ' + ago(d.lastUsed) : 'not used yet'}</div>
  <label class="sw small" style="min-height:34px"><input type="checkbox" data-drauto="${d.id}" ${d.auto ? 'checked' : ''}>Copy new files automatically when connected</label></div>
  <div class="row drv-acts" style="gap:6px"><button class="btn sm" data-act="drBackup" data-id="${d.id}">${ic('upload', 16)}Back up</button><button class="btn sm" data-act="drImport" data-id="${d.id}">${ic('download', 16)}Import</button><button class="btn sm ghost" data-act="drForget" data-id="${d.id}">${ic('x', 16)}Forget</button></div></div>` }).join('');
 return `<div class="card"><h3>External storage</h3><p class="small muted" style="margin-bottom:10px">Save, move and back up files to an SD card, USB flash drive or external disk.${fsaOK() ? ' Add a folder on the drive once — DESk remembers it whenever the drive is plugged in.' : ''}</p>
  ${rows || ''}${fsaOK() ? `<div class="row" style="margin-top:10px"><button class="btn sm pri" data-act="drAdd">${ic('plus', 16)}Add a drive or folder</button></div>` : `<div class="row"><button class="btn sm" data-act="drHelp">${ic('info', 16)}How to save to a drive on this device</button></div>`}</div>`;
}
Object.assign(ACT, {
 drAdd: () => addDrive(), drHelp: () => driveHelp(),
 drBackup: d => backupToDrive(DR.list.find(x => x.id === d.id)),
 drImport: d => importFromDrive(DR.list.find(x => x.id === d.id)),
 drForget: async d => { const x = DR.list.find(y => y.id === d.id); if (await ask(`Forget ${x.name}?`, { body: 'Files already on the drive stay there.', ok: 'Forget' })) { DR.list = DR.list.filter(y => y.id !== d.id); await saveDrives(); render() } },
 bDrive: () => saveToDrive([...S.sel]),
 pvDrive: () => pvState && saveToDrive([pvState.id]),
 clMoveDrive: () => { const ids = [...CL.sel]; CL.sel.clear(); saveToDrive(ids, { move: true }) }
});
document.addEventListener('change', async e => { const id = e.target.dataset && e.target.dataset.drauto; if (!id) return; const d = DR.list.find(x => x.id === id); if (!d) return; if (e.target.checked && !await drivePerm(d)) { e.target.checked = false; return } d.auto = e.target.checked; await saveDrives(); toast(d.auto ? `New files will be copied to ${d.name}` : 'Automatic copying off'); if (d.auto) autoCopy() });
async function refreshDriveStates() { for (const d of DR.list) await driveState(d); renderIf('prefs') }

/* ================= SPLASH ================= */
const SPLASH_T0 = performance.now();
function hideSplash() {
 const sp = document.getElementById('splash'); if (!sp || sp.classList.contains('out')) return;
 const wait = Math.max(0, 1500 - (performance.now() - SPLASH_T0));
 setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 700) }, wait);
}

/* ================= LANDING PAGE ================= */
const FLOAT = [['image', '#1A5CFF', 'IMG_2214.jpg', 'Photos'], ['file', '#0f9d8a', 'Invoice_March.pdf', 'Finance'], ['scan', '#0a96c4', 'Receipt.pdf', 'Scans'], ['music', '#e5489a', 'voice-note.m4a', 'Voice notes'], ['sheet', '#12a150', 'budget.xlsx', 'Finance'], ['video', '#7a3cff', 'trip.mp4', 'Clips'], ['archive', '#9c6b30', 'backup.zip', 'Archives'], ['key', '#f08c00', 'GitHub', 'Passwords']];
// Files in the sorting demo — each goes to the folder DESk's real rules pick for it
const SORT_TRAYS = [['photos', 'Photos', 'image', '#1A5CFF', 'Images › Photos'], ['shots', 'Screenshots', 'image', '#3b7bff', 'Images › Screenshots'], ['finance', 'Finance', 'file', '#0f9d8a', 'Documents · Sheets'], ['travel', 'Travel', 'globe', '#f08c00', 'Documents › Travel'], ['work', 'Work', 'note', '#4c5a75', 'Documents › Work'], ['voice', 'Voice notes', 'music', '#e5489a', 'Audio › Voice notes'], ['clips', 'Clips', 'video', '#7a3cff', 'Videos › Clips']];
const SORT_ITEMS = [['IMG_2214.jpg', 'image', '#1A5CFF', 'photos', 'Images/Photos', ['photo', '2026']], ['Invoice_March_2026.pdf', 'file', '#0f9d8a', 'finance', 'Documents/Finance', ['invoice', 'finance']], ['Screenshot 10.45.png', 'image', '#3b7bff', 'shots', 'Images/Screenshots', ['screenshot']], ['boarding-pass-ADD.pdf', 'file', '#f08c00', 'travel', 'Documents/Travel', ['boarding', 'travel']], ['voice-memo-04.m4a', 'music', '#e5489a', 'voice', 'Audio/Voice notes', ['m4a']], ['budget 2026.xlsx', 'sheet', '#12a150', 'finance', 'Spreadsheets/Finance', ['budget', 'finance']], ['contract_NDA.docx', 'note', '#4c5a75', 'work', 'Documents/Work', ['contract', 'work']], ['trip-lalibela.mp4', 'video', '#7a3cff', 'clips', 'Videos/Clips', ['mp4', '2026']], ['IMG_2215.jpg', 'image', '#1A5CFF', 'photos', 'Images/Photos', ['photo']], ['tax-statement.pdf', 'file', '#0f9d8a', 'finance', 'Documents/Finance', ['tax', 'statement']]];
const WFILES = [['ph', 'IMG_2214.jpg', '2.4 MB'], ['pdf', 'Invoice_March.pdf', '214 KB'], ['vid', 'trip-lalibela.mp4', '48 MB'], ['xls', 'budget 2026.xlsx', '36 KB'], ['scan', 'Receipt_Nov.pdf', '1 page'], ['ph2', 'IMG_2215.jpg', '3.1 MB'], ['shot', 'Screenshot 10.45.png', '820 KB'], ['doc', 'contract_NDA.docx', '58 KB']];
const thumbArt = k => ({
 ph: '<svg viewBox="0 0 40 30" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cb7ff"/><stop offset="1" stop-color="#d6e9ff"/></linearGradient></defs><rect width="40" height="30" fill="url(#sk)"/><circle cx="31" cy="8" r="3.4" fill="#ffd96a"/><path d="M0 30 13 13l8 9 6-6 13 14z" fill="#3c8a5b"/><path d="M0 30 9 20l7 10z" fill="#2c6e47"/></svg>',
 ph2: '<svg viewBox="0 0 40 30" preserveAspectRatio="xMidYMid slice"><rect width="40" height="30" fill="#f6b38a"/><circle cx="20" cy="17" r="8" fill="#ffdf9e"/><path d="M0 22h40v8H0z" fill="#3a6fb0"/><path d="M0 24h40" stroke="#9fc4ff" stroke-width=".8"/></svg>',
 pdf: '<span class="tdoc"><i class="tag" style="background:#e5484d">PDF</i><b></b><b></b><b class="s"></b><b></b></span>',
 scan: '<span class="tdoc rc"><i class="tag" style="background:#0a96c4">SCAN</i><b></b><b class="s"></b><b></b><b class="s"></b></span>',
 doc: '<span class="tdoc"><i class="tag" style="background:#2f6fe8">DOC</i><b></b><b></b><b class="s"></b></span>',
 xls: '<span class="tgrid">' + Array.from({ length: 12 }, (_, i) => `<i${i < 3 ? ' class="h"' : ''}></i>`).join('') + '</span>',
 vid: '<span class="tvid"><svg viewBox="0 0 24 24" width="40%" height="40%"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,.2)"/><path d="M10 8l6 4-6 4z" fill="#fff"/></svg></span>',
 shot: '<span class="tshot"><i></i><i></i><i></i></span>'
})[k];
let sorterRun = 0;
async function runSorter(root) {
 const run = ++sorterRun, stack = root.querySelector('.so-stack'), core = root.querySelector('.so-logo'), now = root.querySelector('.so-now');
 const alive = () => run === sorterRun && root.isConnected;
 const rel = el => { const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 } };
 const chip = ([n, i, c]) => `<div class="so-file" style="--c:${c}"><span>${ic(i, 16)}</span><b>${esc(n)}</b></div>`;
 const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tr = (p, s, o = 1) => ({ transform: `translate(-50%,-50%) translate(${p.x}px,${p.y}px) scale(${s})`, opacity: o });
 if (reduce) { root.querySelectorAll('.so-tray').forEach(t => { t.querySelector('em').textContent = SORT_ITEMS.filter(x => x[3] === t.dataset.k).length }); now.textContent = 'All sorted ✓'; return }
 while (alive()) {
  root.querySelectorAll('.so-tray em').forEach(e => e.textContent = '0'); root.querySelectorAll('.so-tray').forEach(t => t.classList.remove('hit'));
  stack.innerHTML = SORT_ITEMS.map(chip).join(''); now.innerHTML = 'Waiting for files…';
  for (let i = 0; i < SORT_ITEMS.length && alive(); i++) {
   while (alive() && !root._inView) await sleep(400);
   const [name, , , k, path, tags] = SORT_ITEMS[i], src = stack.firstElementChild, tray = root.querySelector(`.so-tray[data-k="${k}"]`);
   if (!src || !tray) break;
   const p0 = rel(src), pc = rel(core), fly = src.cloneNode(true); fly.classList.add('so-fly'); root.appendChild(fly);
   src.classList.add('gone'); setTimeout(() => src.remove(), 260);
   await fly.animate([tr(p0, 1), tr(pc, .92)], { duration: 620, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }).finished;
   core.classList.add('pulse'); now.innerHTML = `<b>${esc(name)}</b><span class="so-arrow">→ ${esc(path.replace('/', ' › '))}</span><span class="so-tags">${tags.map(t => `<i>#${esc(t)}</i>`).join('')}</span>`;
   await sleep(560); core.classList.remove('pulse');
   const pt = rel(tray.querySelector('.ti'));
   await fly.animate([tr(pc, .92), tr(pt, .32, .15)], { duration: 640, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }).finished;
   fly.remove(); const em = tray.querySelector('em'); em.textContent = String(+em.textContent + 1); tray.classList.remove('hit'); void tray.offsetWidth; tray.classList.add('hit');
   await sleep(140);
  }
  if (!alive()) return;
  now.innerHTML = `<b>All ${SORT_ITEMS.length} files sorted ✓</b><span class="so-arrow">7 folders · tagged · duplicates skipped</span>`;
  await sleep(2600);
 }
}
let scrambleRun = 0;
function runScramble(root) {
 const run = ++scrambleRun, el = root.querySelector('.pv-cipher'), H = '0123456789abcdef';
 const tick = () => { if (run !== scrambleRun || !el.isConnected) return; if (root._inView) el.textContent = Array.from({ length: 64 }, (_, i) => (i && i % 8 === 0 ? ' ' : '') + H[Math.random() * 16 | 0]).join(''); setTimeout(tick, 110) };
 tick();
}
function showLanding() {
 $('#app').hidden = true; const ob = $('#onboarding'); ob.hidden = true; hideInstallBar();
 const L = $('#landing'); L.hidden = false; document.body.classList.add('on-landing');
 const canInstall = !isStandalone();
 L.innerHTML = `
 <header class="lnav"><a class="lbrand" href="#/" aria-label="DESk">${LOGO(36)}<span>DESk</span></a>
  <nav class="llinks"><a href="#features">Features</a><a href="#scanner">Scanner</a><a href="#sync">Sync</a><a href="#privacy">Privacy</a><a href="#install">Install</a></nav>
  <button class="lbtn icon" data-act="lStart" aria-label="Launch DESk" title="Launch DESk">${ic('launch', 21)}</button></header>
 <section class="lhero" id="top">
  <div class="lgrid" aria-hidden="true"></div><div class="lglow" aria-hidden="true"></div>
  <div class="lfloat" aria-hidden="true">${FLOAT.map(([i, c, n, t], k) => `<div class="fcard f${k}" style="--c:${c}"><span>${ic(i, 22)}</span><div><b>${n}</b><small>→ ${t}</small></div></div>`).join('')}</div>
  <div class="lhero-in">
   <span class="lpill">${ic('shield', 15)} Free · No account · Works offline</span>
   <h1>Everything on your desk.<br><em>Sorted.</em></h1>
   <p>Drop in anything and DESk files it in the right folder. Scan paper into clean PDFs. Lock your passwords. Keep your phone and computer in sync — encrypted, with no sign-up and no server of ours.</p>
   <div class="lcta"><button class="lbtn big" data-act="lStart">${ic('launch', 20)}Open DESk</button><a class="lbtn ghost big" href="#features">See what it does</a></div>
  </div>
  <div class="lmock" aria-hidden="true">
   <div class="lap"><div class="lap-lid"><span class="lap-cam"></span><div class="lap-scr">
    <div class="w-bar"><i></i><i></i><i></i><span class="w-url">${ic('lock', 9)} desk.app/#/files</span><span class="w-bar-r"></span></div>
    <div class="win">
     <aside class="w-side"><div class="w-logo">${LOGO(16)}<b>DESk</b></div>
      ${[['home', 'Home'], ['folder', 'Files', 1, '24'], ['scan', 'Scan'], ['key', 'Passwords', 0, '18'], ['eyeoff', 'Hidden'], ['devices', 'Devices'], ['chart', 'Insights'], ['broom', 'Clean up']].map(([i, l, on, n]) => `<div class="w-nav ${on ? 'on' : ''}">${ic(i, 10)}<span>${l}</span>${n ? `<em>${n}</em>` : ''}</div>`).join('')}
      <div class="w-me"><span>A</span><div><b>Abebe</b><small><i></i>Synced · 2 devices</small></div></div></aside>
     <main class="w-main">
      <div class="w-top"><div class="w-search">${ic('search', 9)}<span>Search files, tags, folders…</span></div><div class="w-btn">${ic('scan', 9)}Scan</div><div class="w-btn pri">${ic('upload', 9)}Upload</div></div>
      <div class="w-head"><b>All files</b><span>24</span><div class="w-chips"><i class="on">#finance</i><i>#travel</i><i>#photo</i><i>#2026</i></div></div>
      <div class="w-grid">${WFILES.map(([k, n, s], i) => `<div class="w-card" style="--d:${i * .09}s"><div class="w-th">${thumbArt(k)}</div><b>${n}</b><small>${s}</small></div>`).join('')}</div>
     </main>
     <aside class="w-panel"><div class="w-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#e2e7f1" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="#1A5CFF" stroke-width="4" stroke-dasharray="94" stroke-dashoffset="58" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg><b>2.1 GB</b></div>
      <div class="w-bars">${[['Images', 62, '#1A5CFF'], ['Videos', 44, '#7a3cff'], ['Docs', 30, '#0f9d8a'], ['Audio', 14, '#e5489a']].map(([l, w, c]) => `<div><span>${l}</span><i><u style="width:${w}%;background:${c}"></u></i></div>`).join('')}</div></aside>
     <div class="w-toast">${ic('check', 9)} Sorted 12 items into 4 folders</div>
     <div class="w-drag"><div class="w-chip">${ic('file', 9)}tax-statement.pdf</div><svg class="w-cur" viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.6L10 19z" fill="#0e1526" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg></div>
    </div></div></div><div class="lap-base"><i></i></div></div>
   <div class="phn"><span class="phn-notch"></span><div class="phn-scr"><div class="pdoc"><i></i><i></i><i></i><i></i><i></i></div><div class="pcorners"><i></i><i></i><i></i><i></i></div><span class="ptag">Edges found</span><div class="pshut"></div></div></div>
  </div></section>
 <section class="lsec fm" id="features"><div class="lwrap">
  <div class="lhead reveal center"><span class="lkick">File manager</span><h2>Upload a hundred things. Find each one in a second.</h2><p>Batch uploads, whole folders, drag-and-drop or paste. DESk reads every name and type, then files and tags it automatically — invoices to Finance, screenshots to Screenshots, boarding passes to Travel. Duplicates are caught by fingerprint.</p></div>
  <div class="sorter reveal" id="sorter">
   <div class="so-col so-in"><div class="so-label">${ic('upload', 15)} Incoming</div><div class="so-stack"></div></div>
   <div class="so-col so-core"><div class="so-logo">${LOGO(64)}<span class="so-ring"></span><span class="so-ring r2"></span></div><div class="so-now">Waiting for files…</div></div>
   <div class="so-col so-out"><div class="so-label">${ic('folder', 15)} Sorted folders</div><div class="so-trays">${SORT_TRAYS.map(([k, l, i, c, p]) => `<div class="so-tray" data-k="${k}" style="--c:${c}"><span class="ti">${ic(i, 18)}</span><div><b>${l}</b><small>${p}</small></div><em>0</em></div>`).join('')}</div></div>
  </div>
  <div class="lfeat">${[['search', 'Search everything', 'By name, tag, folder or type — results as you type.'], ['tag', 'Smart tags', 'Keywords, years and file types tagged for you.'], ['link', 'Short links & QR', 'Share any file with an encrypted link and QR code.'], ['hdd', 'SD cards & USB drives', 'Save, move and back up to external storage.'], ['chart', 'Live device insights', 'Memory, storage, battery, network, content by type.'], ['broom', 'Clean up', 'Duplicates, junk and large files — in DESk and on your computer.']].map(([i, t, d]) => `<div class="lf reveal"><span>${ic(i, 22)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
 <section class="lsec dark" id="scanner"><div class="lwrap split">
  <div class="reveal"><span class="lkick">Document scanner</span><h2>Point. Hold steady. Done.</h2><p>DESk spots the page edges live, captures when you hold still, straightens the perspective and cleans the paper to crisp black on white. Keep going to put many pages into one PDF — then reorder, crop, rotate or re-edit anytime. Saved scans land in the right folder: Receipts, IDs & Cards, Documents.</p>
   <ul class="lchecks"><li>${ic('check', 18)}Live edge detection & auto-capture</li><li>${ic('check', 18)}Auto, grayscale, black & white and photo clean-up</li><li>${ic('check', 18)}Multi-page PDFs, editable later</li></ul></div>
  <div class="scandemo reveal" aria-hidden="true"><div class="sd-phone"><div class="sd-page"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="sd-box"></div><div class="sd-beam"></div><span class="sd-tag">Edges found</span></div></div></div></section>
 <section class="lsec"><div class="lwrap split rev">
  <div class="vaultdemo reveal" aria-hidden="true"><div class="vd-card"><div class="vd-row"><span style="background:#1A5CFF">G</span><div><b>GitHub</b><small>me@example.com</small></div><em>482 913</em></div><div class="vd-row"><span style="background:#7a3cff">${ic('card', 16)}</span><div><b>Visa ••4421</b><small>Expires 08/29</small></div></div><div class="vd-row"><span style="background:#0f9d8a">${ic('wifi', 16)}</span><div><b>Home Wi-Fi</b><small>WPA3 · share by QR</small></div></div><div class="vd-meter"><i></i><i></i><i></i><i></i></div><small class="vd-s">Security score 96%</small></div><div class="vd-lock">${ic('lock', 30)}</div></div>
  <div class="reveal"><span class="lkick">Passwords & Hidden</span><h2>Your secrets, locked on your device.</h2><p>A full password manager: logins, cards, Wi-Fi, IDs and notes, a generator, 2-factor codes, weak and reused password alerts, imports from your browser. Plus a Hidden folder behind a PIN or password for files nobody else should see. Both lock the moment you leave DESk.</p></div></div></section>
 <section class="lsec tint" id="sync"><div class="lwrap split">
  <div class="reveal"><span class="lkick">Sync — no account</span><h2>Scan a code. Your devices are linked.</h2><p>Open <b>Devices → Link a device</b> and scan the QR code with your other phone, open the link, or type a short code like <b class="mono">K7M2-Q9XA</b>. From then on, files, folders, tags, scans and your vault stay in step — encrypted on the device before anything leaves it.</p>
   <ul class="lchecks"><li>${ic('check', 18)}No email, no password, no sign-up</li><li>${ic('check', 18)}End-to-end encrypted through a free relay</li><li>${ic('check', 18)}Rename, pause or remove devices anytime</li></ul></div>
  <div class="syncdemo reveal" aria-hidden="true"><div class="sy-dev">${ic('phone', 40)}<small>Phone</small></div><div class="sy-path"><i></i><i></i><i></i><b>${ic('lock', 14)}</b></div><div class="sy-dev">${ic('laptop', 46)}<small>Laptop</small></div><div class="sy-code">K7M2-Q9XA</div></div></div></section>
 <section class="lsec lpv" id="privacy"><div class="pv-glow" aria-hidden="true"></div><div class="lwrap">
  <div class="lhead reveal center"><span class="lkick">Private by design</span><h2>Your files live on your devices. Full stop.</h2><p>There is no DESk server and no DESk account. When something has to travel — a sync or a share link — it’s scrambled on your device first, with a key only your devices hold.</p></div>
  <div class="pv-stage reveal" id="pvStage">
   <div class="pv-dev">${ic('phone', 30)}<b>Your device</b><div class="pv-plain"><span>${ic('file', 14)} Invoice_March.pdf</span><span>${ic('key', 14)} GitHub · ••••••••</span><span>${ic('image', 14)} IMG_2214.jpg</span></div></div>
   <div class="pv-lock"><span>${ic('lock', 26)}</span><small>AES-256<br>on device</small></div>
   <div class="pv-relay">${ic('globe', 26)}<b>What the relay sees</b><code class="pv-cipher">a8f3c91e 7b20d4aa 19ce0f53 e2b7a6c4</code><small>Unreadable · expires in ~3 hours</small></div>
  </div>
  <div class="pv-never reveal"><b>DESk never asks for</b>${['Email', 'Phone number', 'Password to an account', 'Payment details', 'Tracking cookies', 'Your location'].map(t => `<span>${ic('x', 14)}${t}</span>`).join('')}</div>
  <div class="lfeat three">${[['devices', 'Stored on your device', 'Files, scans and passwords live in your browser’s private storage — not on anyone’s server.'], ['shield', 'Encrypted before it moves', 'Sync and share links are encrypted on the device; the relay only ever sees unreadable bytes.'], ['globe', 'Works offline', 'Install it like an app. It opens and works with no internet at all.']].map(([i, t, d]) => `<div class="lf pvf reveal"><span>${ic(i, 22)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
 <section class="lsec inst" id="install"><div class="lwrap">
  <div class="lhead reveal center"><span class="lkick">Install</span><h2>📲 Put DESk on your home screen</h2><p>It opens full-screen like a normal app, works offline and updates itself. Takes about 10 seconds.</p>
   ${canInstall ? `<button class="lbtn big inst-go" data-act="install">${ic('download', 20)}Install DESk — one tap</button><small class="inst-note">Chrome, Edge and Android install in one tap. iPhone and iPad: follow the 3 steps below.</small>` : `<span class="lpill dark">${ic('check', 15)} DESk is installed on this device</span>`}</div>
  <div class="inst-grid">
   <div class="inst-card reveal"><div class="inst-emo">📱</div><h3>iPhone & iPad</h3><ol>
    <li><span class="inst-n">1</span>Open DESk in <b>Safari</b> <span class="kchip">🧭 Safari</span></li>
    <li><span class="inst-n">2</span>Tap <b>Share</b> <span class="kchip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></span></li>
    <li><span class="inst-n">3</span>Tap <b>Add to Home Screen</b> <span class="kchip">➕</span></li></ol></div>
   <div class="inst-card reveal"><div class="inst-emo">🤖</div><h3>Android</h3><ol>
    <li><span class="inst-n">1</span>Open DESk in <b>Chrome</b> <span class="kchip">🌐 Chrome</span></li>
    <li><span class="inst-n">2</span>Tap <b>Install DESk</b> above — or menu <span class="kchip">⋮</span></li>
    <li><span class="inst-n">3</span>Tap <b>Install</b> <span class="kchip">✅</span></li></ol></div>
   <div class="inst-card reveal"><div class="inst-emo">💻</div><h3>Computer</h3><ol>
    <li><span class="inst-n">1</span>Open DESk in <b>Chrome</b> or <b>Edge</b></li>
    <li><span class="inst-n">2</span>Click <b>Install DESk</b> above — or the icon <span class="kchip">${ic('download', 13)}</span> in the address bar</li>
    <li><span class="inst-n">3</span>Pin it to your dock or taskbar <span class="kchip">📌</span></li></ol></div>
   <div class="inst-phone reveal" aria-hidden="true"><div class="ip-scr"><div class="ip-time">9:41</div><div class="ip-grid">${['#ff6b6b', '#ffd43b', '#51cf66', '#339af0', '#845ef7', '#ff922b', '#20c997', '#f06595', '#5c7cfa', '#94d82d', '#fab005'].map(c => `<i style="background:${c}"></i>`).join('')}<span class="ip-desk"><img src="icons/icon-192.png" alt=""><small>DESk</small></span></div></div></div>
  </div>
  <div class="inst-perks">${[['⚡', 'Opens instantly'], ['✈️', 'Works offline'], ['🔒', 'Private & encrypted'], ['🔄', 'Updates itself'], ['🪶', 'Under 1 MB']].map(([e, t]) => `<div class="reveal"><span>${e}</span>${t}</div>`).join('')}</div></div></section>
 <section class="lfinal"><div class="lf-aurora" aria-hidden="true"></div><div class="lwrap">
  <div class="lf-orbit reveal" aria-hidden="true"><div class="lf-center">${LOGO(88)}</div><div class="lf-ring">${[['image', '#1A5CFF'], ['file', '#0f9d8a'], ['scan', '#0a96c4'], ['key', '#f08c00'], ['music', '#e5489a'], ['video', '#7a3cff'], ['sheet', '#12a150'], ['lock', '#0e1526']].map(([i, c], k) => `<span style="--a:${k * 45}deg;--c:${c}"><i>${ic(i, 18)}</i></span>`).join('')}</div></div>
  <h2 class="reveal">Clear your desk.</h2><p class="reveal">Free, private and ready in one tap.</p>
  <div class="lcta reveal"><button class="lbtn big" data-act="lStart">${ic('launch', 20)}Open DESk</button>${canInstall ? `<button class="lbtn ghost big" data-act="install">${ic('download', 20)}Install</button>` : ''}</div>
  <div class="lf-chips reveal"><span>✓ Free</span><span>✓ No sign-up</span><span>✓ Works offline</span><span>✓ Encrypted sync</span></div></div></section>
 <footer class="lfoot"><span class="lf-brand">${LOGO(22)} DESk ${APP_VERSION}</span><span class="lf-sep">·</span><span>© ${new Date().getFullYear()} DESk. All rights reserved.</span><span class="lf-sep">·</span><a href="#" data-act="showTerms">Privacy & Terms</a></footer>`;
 const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
 L.querySelectorAll('.reveal').forEach(el => io.observe(el));
 const watch = (el, fn) => { const o = new IntersectionObserver(es => es.forEach(e => { el._inView = e.isIntersecting; if (e.isIntersecting && !el._started) { el._started = true; fn(el) } }), { threshold: .2 }); o.observe(el) };
 watch($('#sorter', L), runSorter); watch($('#pvStage', L), runScramble);
 const hero = L.querySelector('.lhero');
 hero.onpointermove = e => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; hero.style.setProperty('--px', x.toFixed(3)); hero.style.setProperty('--py', y.toFixed(3)) };
 L.querySelectorAll('a[href^="#"]:not([href="#/"])').forEach(a => a.onclick = e => { const t = L.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }) } });
 L.scrollTop = 0; window.scrollTo(0, 0); setThemeColor();
 hideSplash();
}
ACT.lStart = () => { if (S.profile) { $('#landing').hidden = true; document.body.classList.remove('on-landing'); showApp() } else welcome() };

/* ================= WELCOME (no sign-up, no login — like BAZINGA!) ================= */
const TERMS_VERSION = 1;
const TERMS_HTML = `<h4>Privacy</h4><p>DESk has no accounts and no server of its own. Your files, scans, passwords and settings are stored in this browser on this device. If you turn on device sync or create a share link, the data is encrypted on your device first and passed through the free public relay ntfy.sh (or a relay the site owner configured); the relay only sees unreadable bytes, and copies there expire after about 3 hours. DESk loads its font from Google Fonts. Nothing else is sent anywhere.</p>
<h4>Terms</h4><p>DESk is free software provided “as is”, without warranty of any kind. You are responsible for your files and for keeping backups (Devices → Save backup). If you forget your vault master password or Hidden PIN, the encrypted data cannot be recovered. Erasing browser data deletes DESk’s data on that device.</p>`;
const showTerms = () => modal(`<div class="mhead"><h3>Privacy & Terms</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><div class="legal">${TERMS_HTML}</div><div class="row end" style="margin-top:14px"><button class="btn pri" data-close>OK</button></div>`, { cls: 'mid' });
ACT.showTerms = (d, el, e) => { e && e.preventDefault(); showTerms() };
let obPic = '';
function welcome(joinReq = null) {
 $('#app').hidden = true; $('#landing').hidden = true; document.body.classList.remove('on-landing');
 const ob = $('#onboarding'); ob.hidden = false; S.joinReq = joinReq;
 ob.innerHTML = `<div class="ob-bg" aria-hidden="true"></div><div class="ob-card">
  <div class="ob-brand">${LOGO(72)}<h1>DESk</h1></div>
  <p class="muted ob-sub">${joinReq ? 'Almost there! This browser will link with your files on your other device.' : 'Your files, scans and passwords — sorted and private, on your device. No sign up, no login.'}</p>
  ${joinReq ? '' : `<form data-form="obGo" class="ob-form" novalidate>
   <label class="ob-pic" title="Add a profile picture (optional)"><input type="file" accept="image/*" id="obFile" hidden><span class="avatar xl" id="obAv">${ic('id', 30)}</span><span class="small b">Add photo</span></label>
   <label class="fld"><span>Your name</span><input id="obName" maxlength="30" autocomplete="nickname" placeholder="e.g. Abebe" enterkeyhint="go"></label></form>`}
  <label class="agree" id="obTermsL"><input type="checkbox" class="ck" id="obTerms"><span>I agree to the <a href="#" data-act="showTerms">Privacy Policy & Terms</a>. DESk is provided as-is.</span></label>
  <button class="btn pri big" data-act="obGo">${joinReq ? `${ic('link', 18)}Link this browser` : `Let’s go ${ic('right', 18)}`}</button>
  ${joinReq ? '' : `<button class="btn" data-act="obLink">${ic('qr', 18)}I use DESk on another device</button><button class="btn ghost" data-act="obRestore">${ic('restore', 18)}Restore from a backup file</button>`}
  <p class="small muted">No email, no password — your name and files are saved on this device.</p>
  <button class="btn ghost sm" data-act="obBack">${ic('back', 16)}Back to the DESk tour</button></div>`;
 const fi = $('#obFile'); if (fi) fi.onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const im = await loadImg(f); obPic = drawThumb(im, im.naturalWidth, im.naturalHeight, 256); $('#obAv').innerHTML = `<img src="${obPic}" alt="">` } catch { toast('That picture couldn’t be read', 'err') } };
 hideSplash();
}
function termsOk() { if ($('#obTerms').checked) return true; const l = $('#obTermsL'); l.classList.remove('shake'); void l.offsetWidth; l.classList.add('shake'); toast('Please accept the Privacy Policy & Terms first', 'err'); return false }
async function startProfile(name) {
 S.profile = { username: name || 'Me', picture: name ? obPic : '', createdAt: Date.now(), updatedAt: name ? Date.now() : 0, termsAccepted: TERMS_VERSION };
 await kvSet('profile', S.profile);
 $('#onboarding').hidden = true;
 location.hash = '#/home';
 await restoreSync(); showApp();
}
Object.assign(ACT, {
 obGo: async () => {
  const req = S.joinReq, n = $('#obName');
  if (!req && n && !n.value.trim()) { n.focus(); const f = n.closest('.fld'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); return toast('Add your name first', 'err') }
  if (!termsOk()) return;
  await startProfile(req ? '' : n.value.trim().slice(0, 30));
  if (req) joinFlow({ ...req, mode: 'replace' }); else toast(`Welcome, ${S.profile.username}!`);
 },
 obLink: async () => { if (!termsOk()) return; const choice = await new Promise(res => { const m = modal(`<h3>Link to your other device</h3><p class="muted small" style="margin-bottom:14px">On the device that has your files: <b>Devices → Link a device</b>.</p><div style="display:grid;gap:10px"><button class="btn" data-act="obPick" data-v="scan">${ic('camera', 18)}Scan its QR code</button><button class="btn" data-act="obPick" data-v="code">${ic('link', 18)}Type the code or paste the link</button></div><div class="row end" style="margin-top:14px"><button class="btn ghost" data-close>Cancel</button></div>`, { onClose: () => res(m._v || null) }) }); if (!choice) return; let req = null; if (choice === 'scan') { const v = await scanQR(); req = v && parseJoin(v) } else req = await enterCodeDialog(); if (!req) return; await startProfile(''); joinFlow({ ...req, mode: 'replace' }) },
 obPick: (d, el) => { const w = el.closest('.mwrap'); w._v = d.v; w.close() },
 obRestore: () => { if (!termsOk()) return; importTarget = 'restoreNew'; $('#anyIn').accept = '.zip,application/zip'; $('#anyIn').click() },
 obBack: () => { location.hash = '#/'; showLanding() }
});
FORMS.obGo = () => ACT.obGo();

/* ================= SETTINGS ================= */
VIEWS.prefs = () => `<div class="sect" style="margin-top:6px"><h1>Settings</h1></div>
 <div class="grid g2">
  <div class="card"><h3>You</h3><div class="row" style="flex-wrap:nowrap;gap:16px;margin-bottom:14px"><label class="ob-pic" style="cursor:pointer"><input type="file" accept="image/*" id="meFile" hidden><span class="avatar xl">${avatarHTML(30)}</span></label>
   <div class="grow"><label class="fld" style="margin:0"><span>Your name</span><div class="row" style="flex-wrap:nowrap"><input id="meName" value="${esc(S.profile ? S.profile.username : '')}" maxlength="30"><button class="btn" data-act="saveMe">Save</button></div></label></div></div>
   <p class="small muted">Shown on this device${linked() ? ' and your linked devices' : ''}. Tap the picture to change it.${S.profile && S.profile.picture ? ' <a href="#" data-act="clearPic">Remove picture</a>' : ''}</p></div>
  <div class="card"><h3>This device</h3><label class="fld"><span>Device name</span><div class="row" style="flex-wrap:nowrap"><input value="${esc(S.deviceName)}" id="devName" maxlength="40"><button class="btn" data-act="saveDevName">Save</button></div></label>
   ${setRow('copy', 'Skip duplicates', `<label class="sw" aria-label="Skip duplicates"><input type="checkbox" data-set="skipDupes" ${setting('skipDupes') ? 'checked' : ''}></label>`, 'dupInfo')}
   <label class="fld" style="margin-top:12px"><span>Empty Trash automatically after</span><select data-set="autoEmptyDays">${[7, 14, 30, 60, 90, 0].map(n => `<option value="${n}" ${setting('autoEmptyDays') == n ? 'selected' : ''}>${n ? n + ' days' : 'Never'}</option>`).join('')}</select></label></div>
  <div class="card"><h3>Appearance</h3><div class="seg" role="radiogroup" aria-label="Theme">${[['system', 'System', 'monitor'], ['light', 'Light', 'sun'], ['dark', 'Dark', 'moon']].map(([k, l, i]) => `<button role="radio" aria-checked="${themePref() === k}" class="${themePref() === k ? 'on' : ''}" data-act="theme" data-v="${k}">${ic(i, 17)}${l}</button>`).join('')}</div><p class="small muted" style="margin-top:10px">${themePref() === 'system' ? 'Follows your device’s light or dark setting.' : 'Always ' + themePref() + ' on this device.'}</p></div>
  <div class="card"><h3>Privacy & locks</h3>
   <label class="fld"><span>Lock vault and Hidden after</span><select data-set="lockMin">${[1, 2, 5, 10, 15, 30, 60].map(n => `<option value="${n}" ${setting('lockMin') == n ? 'selected' : ''}>${n} minute${n > 1 ? 's' : ''} idle</option>`).join('')}</select></label>
   ${setRow('eyeoff', 'Stealth mode', `<label class="sw" aria-label="Stealth mode"><input type="checkbox" data-set="stealth" ${setting('stealth') ? 'checked' : ''}></label>`, 'stealthInfo')}
   <p class="small muted" style="margin-top:8px">${ic('lock', 14, 'style="display:inline;vertical-align:-2px"')} Vault and Hidden also lock the moment you leave DESk.</p>
   <div class="row" style="margin-top:12px"><button class="btn sm" data-act="lockAll">${ic('lock', 16)}Lock everything now</button></div></div>
  ${drivesCardHTML()}
  <div class="card"><h3>Sync your devices</h3><p class="small muted" style="margin-bottom:12px">${linked() ? `Linked with ${listDevices().length - 1} other device${listDevices().length === 2 ? '' : 's'}.` : 'Link your phone and computer with a QR code — no account.'}</p><button class="btn sm pri" data-act="nav" data-v="devices">${ic('devices', 16)}Open Devices</button></div>
  <div class="card"><h3>Backup & data</h3><p class="small muted" style="margin-bottom:12px">Everything is stored on this device in your browser’s private storage${linked() ? ' and synced (encrypted) to your linked devices' : ''}.</p>
   <div class="row"><button class="btn sm" data-act="bundleOut">${ic('download', 16)}Save backup</button><button class="btn sm" data-act="bundleIn">${ic('upload', 16)}Restore backup</button><button class="btn sm" data-act="persist">${ic('shield', 16)}Protect storage</button></div>
   <hr><button class="btn sm danger" data-act="eraseAll">${ic('trash', 16)}Erase this device</button></div>
  <div class="card"><h3>About DESk</h3><div class="row" style="flex-wrap:nowrap;gap:14px">${LOGO(52)}<div><b>DESk ${APP_VERSION}</b><p class="small muted">File manager · document scanner · password vault. Works offline; your files never leave your devices unless you sync or share them, and then only encrypted.</p></div></div>
   <div class="row" style="margin-top:12px"><button class="btn sm" data-act="tour">${ic('info', 16)}Take the tour</button><button class="btn sm ghost" data-act="showTerms">Privacy & Terms</button>${isStandalone() ? '' : `<button class="btn sm pri" data-act="install">${ic('download', 16)}Add to home screen</button>`}</div>
   <p class="small muted" style="margin-top:12px">${MEM ? 'This browser blocks offline storage — data is kept only until you close the tab.' : 'Offline storage ready.'}</p></div></div>`;
function setRow(icon, label, control, info) { return `<div class="setrow"><span class="ib">${ic(icon, 18)}</span><b>${label}</b>${info ? `<button class="btn icon sm ghost info" data-act="${info}" aria-label="About ${label}" title="About ${label}">${ic('info', 18)}</button>` : ''}<span class="grow"></span>${control}</div>` }
const themePref = () => { try { return localStorage.getItem('desk-theme') || 'system' } catch { return 'system' } };
function applyTheme(v) { const r = document.documentElement; if (v === 'light' || v === 'dark') r.dataset.theme = v; else delete r.dataset.theme; setThemeColor() }
function setThemeColor() { const m = document.querySelector('meta[name=theme-color]'); if (!m) return; requestAnimationFrame(() => { m.content = document.body.classList.contains('on-landing') ? '#06102e' : getComputedStyle(document.body).backgroundColor || '#f3f5fb' }) }
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { setThemeColor(); renderIf('insights') });
function infoModal(title, html) { modal(`<div class="mhead"><span class="ib" style="width:40px;height:40px;border-radius:12px;background:var(--bsoft);color:var(--blue2);display:grid;place-items:center">${ic('info', 20)}</span><h3>${title}</h3><button class="btn icon ghost" data-close aria-label="Close">${ic('x')}</button></div><div class="legal">${html}</div><div class="row end" style="margin-top:14px"><button class="btn pri" data-close>Got it</button></div>`, { cls: 'mid' }) }
function avatarHTML(sz = 20) { const p = S.profile; if (p && safeThumb(p.picture)) return `<img src="${p.picture}" alt="">`; const ch = p && p.username ? p.username.trim()[0].toUpperCase() : ''; return ch ? `<b style="font-size:${sz * .8}px">${esc(ch)}</b>` : ic('id', sz) }
Object.assign(ACT, {
 saveMe: async () => { const v = $('#meName').value.trim().slice(0, 30); if (!v) return; S.profile = { ...S.profile, username: v, updatedAt: Date.now() }; await kvSet('profile', S.profile); syncSoon(); toast('Saved'); render() },
 clearPic: async (d, el, e) => { e.preventDefault(); S.profile = { ...S.profile, picture: '', updatedAt: Date.now() }; await kvSet('profile', S.profile); syncSoon(); render() },
 tour: () => { location.hash = '#/about'; showLanding() },
 theme: d => { try { d.v === 'system' ? localStorage.removeItem('desk-theme') : localStorage.setItem('desk-theme', d.v) } catch { } applyTheme(d.v); render() },
 stealthInfo: () => infoModal('Stealth mode', '<p>Stealth mode removes <b>Hidden</b> from the menus, the Home screen and the More menu, so someone glancing at your screen won’t know it exists.</p><h4>How to open Hidden</h4><p>Tap the <b>DESk logo 5 times quickly</b> — top-left on a computer, or in the top bar on a phone. You’ll still need your PIN or password.</p><h4>Good to know</h4><p>Your hidden files stay encrypted whether stealth mode is on or off, and they never sync to other devices.</p>'),
 dupInfo: () => infoModal('Skip duplicates', '<p>DESk fingerprints every file you add. When this is on, a file whose contents exactly match one you already have is skipped — even if it has a different name.</p><p>Turn it off if you want to keep intentional copies. You can always find duplicates later in <b>Clean up</b>.</p>'),
 install: () => installApp()
});
Object.assign(ACT, {
 saveDevName: async () => { const v = $('#devName').value.trim(); if (!v) return; S.deviceName = v.slice(0, 40); S.deviceNameSet = true; await kvSet('deviceName', S.deviceName); if (SY.devices[DEVID()]) editDevice(DEVID(), { name: S.deviceName, auto: false }); toast('Saved'); render() },
 lockAll: () => { lockVault(); lockHidden(); toast('Vault and Hidden locked') },
 eraseAll: async () => {
  if (await ask('Erase this device?', { body: 'Files, scans, hidden items, the password vault, your profile and settings will be deleted from this device. Linked devices keep their copies.', input: 'Type ERASE to confirm', ok: 'Erase everything', danger: true }) !== 'ERASE') return;
  if (linked()) { editDevice(DEVID(), { removed: true }); await syncNow().catch(() => { }) }
  for (const s of STORES) await dbClear(s);
  try { localStorage.clear() } catch { }
  location.hash = '#/'; location.reload();
 }
});

/* ================= SHELL, ROUTER, EVENTS ================= */
const NAV = [['home', 'Home', 'home'], ['files', 'Files', 'folder'], ['scan', 'Scan', 'scan'], ['vault', 'Passwords', 'key'], ['hidden', 'Hidden', 'eyeoff'], ['devices', 'Devices', 'devices'], ['insights', 'Insights', 'chart'], ['clean', 'Clean up', 'broom'], ['prefs', 'Settings', 'gear']];
function paintNav() {
 const nav = NAV.filter(n => !(n[0] === 'hidden' && setting('stealth')));
 const cnt = { files: live().length || '', vault: S.vault ? S.vault.entries.length : '' };
 $('#side').innerHTML = `<button class="brand" data-act="logo" aria-label="DESk home">${LOGO(40)}DESk</button>
  ${nav.map(([v, l, i], k) => `${k === 5 ? '<div class="sep"></div>' : ''}<button class="nav ${S.view === v ? 'on' : ''}" data-act="nav" data-v="${v}">${ic(i)}<span>${l}</span>${cnt[v] ? `<span class="ct">${cnt[v]}</span>` : ''}</button>`).join('')}
  <button class="me" data-act="nav" data-v="prefs"><span class="avatar">${avatarHTML(16)}</span><span class="grow"><b>${esc(S.profile ? S.profile.username : '')}</b><span class="foot" id="syncState"></span></span></button>`;
 const tabs = [['home', 'Home', 'home'], ['files', 'Files', 'folder'], ['scan', 'Scan', 'scan'], ['vault', 'Vault', 'key'], ['more', 'More', 'more']];
 const moreOn = ['hidden', 'devices', 'insights', 'clean', 'prefs'].includes(S.view);
 $('#tabs').innerHTML = tabs.map(([v, l, i]) => v === 'scan' ? `<button class="scanb" data-act="scan" aria-label="Scan"><span class="c">${ic('scan', 26)}</span></button>` : `<button class="${S.view === v || (v === 'more' && moreOn) ? 'on' : ''}" data-act="${v === 'more' ? 'moreSheet' : 'nav'}" data-v="${v}">${ic(i, 22)}<span>${l}</span></button>`).join('');
 updateSyncDot();
}
function render() {
 if (!VIEWS[S.view]) S.view = 'home';
 try { $('#view').innerHTML = VIEWS[S.view](); } catch (e) { console.error(e); $('#view').innerHTML = `<div class="card empty">${ic('warn', 40)}<h3>Something went wrong</h3><p>${esc(e.message)}</p></div>` }
 paintNav();
 const a = AFTER[S.view]; if (a) Promise.resolve().then(a).catch(e => console.warn(e));
}
let rq = 0; function renderSoon() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; render() }) }
function renderIf(v) { if (S.view === v) renderSoon() }
function go(v) {
 S.view = v; if (v !== 'files') { S.selMode = false; S.sel.clear() }
 const h = '#/' + (v === 'prefs' ? 'settings' : v); try { if (location.hash !== h && v !== 'share') history.pushState(null, '', h) } catch { }
 render(); window.scrollTo({ top: 0 });
}
let logoTaps = [];
document.addEventListener('desk-content', () => renderIf('files'));
Object.assign(ACT, {
 nav: d => { if (d.v === 'trash') { S.folder = 'Trash'; return go('files') } if (d.v === 'files' && S.view !== 'files') { S.folder = S.folder || 'All' } go(d.v) },
 logo: () => { const now = Date.now(); logoTaps = logoTaps.filter(t => now - t < 2000).concat(now); if (logoTaps.length >= 5) { logoTaps = []; go('hidden') } else if (logoTaps.length === 1) go('home') },
 moreSheet: () => {
  const m = modal(`<h3>More</h3><div style="display:grid;gap:8px">${NAV.filter(n => ['hidden', 'devices', 'insights', 'clean', 'prefs'].includes(n[0]) && !(n[0] === 'hidden' && setting('stealth'))).map(([v, l, i]) => `<button class="btn" style="justify-content:flex-start" data-act="navClose" data-v="${v}">${ic(i)}${l}</button>`).join('')}</div>`);
 },
 navClose: d => { topModal().close(); go(d.v) }
});
function routeFromHash() {
 const h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), parts = h.split('/'); let m;
 if (parts[0] === 's' && parts[1] && parts[2]) { S.share = { id: parts[1], key: parts[2] }; return 'share' }
 if ((parts[0] === 'link' || parts[0] === 'c') && parts[1]) { S.pendingJoin = parts[0] === 'link' ? { secret: parts[1] } : { code: parts[1] }; return 'join' }
 if (parts[0] === 'about' || parts[0] === '') return parts[0] === 'about' ? 'about' : '';
 const v = parts[0] === 'settings' ? 'prefs' : parts[0];
 if (VIEWS[v] && v !== 'share') { S.view = v; return 'view' }
 return '';
}
document.addEventListener('click', e => {
 const el = e.target.closest('[data-act]'); if (!el) return;
 const fn = ACT[el.dataset.act]; if (!fn) return;
 if (el.tagName === 'A') e.preventDefault();
 Promise.resolve(fn(el.dataset, el, e)).catch(err => { console.error(err); toast(err.message || 'Something went wrong', 'err') });
});
document.addEventListener('keydown', e => {
 S.lastAct = Date.now();
 if (e.key === 'Escape') { const m = topModal(); if (m) { if (SC && SC.m === m) ACT.scClose(); else m.close() } return }
 if (SC && SC.cropping && SC.crop && topModal() === SC.m) { const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (k) { e.preventDefault(); SC.crop.nudge(k[0] * (e.shiftKey ? 10 : 2), k[1] * (e.shiftKey ? 10 : 2)); return } if (e.key === 'Tab') { e.preventDefault(); SC.crop.next(); return } if (e.key === 'Enter') { ACT.crApply(); return } }
 if (SC && !SC.cropping && topModal() === SC.m && SC.pages.length > 1 && !/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) { if (e.key === 'ArrowLeft') return ACT.scPrev(); if (e.key === 'ArrowRight') return ACT.scNext() }
 const t = e.target, typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
 if ((e.key === 'Enter' || e.key === ' ') && t.matches('[role=button][data-act]')) { e.preventDefault(); t.click(); return }
 if (e.key === '/' && !typing && !topModal()) { e.preventDefault(); $('#q').focus(); return }
 const padHost = topModal() && topModal().querySelector('#chPad') ? topModal() : (!topModal() && S.view === 'hidden' ? document : null);
 if (!typing && padHost && $('.pad', padHost)) { if (/^\d$/.test(e.key)) ACT.pin({ k: e.key }); else if (e.key === 'Backspace') ACT.pin({ k: 'del' }); else if (e.key === 'Enter') ACT.pin({ k: 'ok' }) }
});
document.addEventListener('input', e => {
 const k = e.target.dataset.in; if (!k) return; const v = e.target.value;
 if (k === 'sort') { S.sort = v; render() }
 else if (k === 'scName') { SC.name = v; SC.nameTouched = true }
 else if (k === 'scKind') { const old = SC.kind; SC.kind = v; if (!SC.nameTouched || SC.name === defaultScanName(old)) { SC.name = defaultScanName(v); const n = $('#scName'); if (n) n.value = SC.name } }
 else if (k === 'vq') { VS.q = v; clearTimeout(e.target._t); e.target._t = setTimeout(() => { render(); const i = $('[data-in=vq]'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length) } }, 180) }
 else if (k === 'vpMeter') { $('#vpM').innerHTML = meterHTML(v) }
 else if (k === 'pwLive') { const box = e.target.closest('.fld').querySelector('.pwm'); if (box) box.innerHTML = meterHTML(v) }
});
document.addEventListener('change', async e => {
 const k = e.target.dataset.set; if (!k) return;
 const v = e.target.type === 'checkbox' ? e.target.checked : (isNaN(+e.target.value) ? e.target.value : +e.target.value);
 await setSetting(k, v); toast('Saved');
 if (k === 'stealth' || k === 'lockMin') render();
});
document.addEventListener('submit', e => {
 const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
 const fn = FORMS[f.dataset.form]; if (fn) Promise.resolve(fn(f, f.closest('.mwrap'))).catch(err => { console.error(err); toast(err.message || 'Something went wrong', 'err') });
});
let qT = 0;
$('#q').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value.trim(); if (S.view !== 'files') { S.folder = 'All'; S.tag = null; go('files'); $('#q').focus() } else render() }, 160) });
$('#fileIn').addEventListener('change', e => { ingest(e.target.files); e.target.value = '' });
$('#dirIn').addEventListener('change', e => { ingest(e.target.files); e.target.value = '' });
$('#camIn').addEventListener('change', e => { const f = [...e.target.files]; e.target.value = ''; if (f.length) addImagePages(f) });
$('#imgIn').addEventListener('change', e => { const f = [...e.target.files]; e.target.value = ''; if (f.length) addImagePages(f) });
$('#hidIn').addEventListener('change', async e => {
 const list = [...e.target.files]; e.target.value = ''; if (!S.hiddenDK) return;
 const need = list.reduce((a, f) => a + f.size, 0), room = await storageRoom();
 if (room && need > room.free * .97) { modal(`<h3>Not enough space for Hidden</h3><div class="spnums"><div><b>${fmtB(need)}</b><span>Adding</span></div><div><b>${fmtB(room.free)}</b><span>Free</span></div><div class="bad"><b>${fmtB(need - room.free)}</b><span>Too much</span></div></div>${spaceBar(room, need)}<div class="row end" style="margin-top:14px"><button class="btn pri" data-close>OK</button></div>`, { cls: 'mid' }); return }
 for (const f of list) { const mime = f.type || guessMime(f.name), c = classify(f.name, mime, f.size, { modified: f.lastModified }); await hideBlob(f, { name: f.name, type: mime, size: f.size, cat: c.cat, folder: c.folder, tags: c.tags, added: Date.now(), modified: f.lastModified, thumb: await makeThumb(f, mime), hash: await hashBlob(f) }) }
 toast(`${list.length} item${list.length > 1 ? 's' : ''} added to Hidden`); render();
});
$('#anyIn').addEventListener('change', async e => {
 const f = e.target.files[0]; const tgt = importTarget; importTarget = null; e.target.value = ''; e.target.removeAttribute('capture'); if (!f) return;
 if (tgt === 'csv') importCSV(f);
 else if (tgt === 'bundle') importBundle(f);
 else if (tgt === 'restoreNew') { await startProfile(''); await importBundle(f) }
 else if (tgt === 'vaultjson') { try { const j = JSON.parse(await f.text()); if (j.desk !== 'vault' || !j.salt || !j.data) throw 0; delete j.desk; delete j.v; S.vaultRec = j; await kvSet('vault', j); render(); toast('Backup loaded — unlock with its master password') } catch { toast('That isn’t a DESk vault backup', 'err') } }
 else if (tgt === 'qr') { try { const im = await loadImg(f); const v = await decodeQR(im, im.naturalWidth, im.naturalHeight); if (!v) return toast('No QR code found in that photo', 'err'); if (QRM) QRM.finish(v) } catch { toast('Couldn’t read that photo', 'err') } }
});
ACT.vRestore = () => { importTarget = 'vaultjson'; $('#anyIn').accept = '.json,application/json'; $('#anyIn').click() };
document.addEventListener('change', async e => { if (e.target.id !== 'meFile') return; const f = e.target.files[0]; if (!f) return; try { const im = await loadImg(f); S.profile = { ...S.profile, picture: drawThumb(im, im.naturalWidth, im.naturalHeight, 256), updatedAt: Date.now() }; await kvSet('profile', S.profile); syncSoon(); render() } catch { toast('That picture couldn’t be read', 'err') } });
let dragN = 0;
window.addEventListener('dragenter', e => { if (![...(e.dataTransfer.types || [])].includes('Files')) return; e.preventDefault(); dragN++; document.body.classList.add('dragover') });
window.addEventListener('dragover', e => { if ([...(e.dataTransfer.types || [])].includes('Files')) e.preventDefault() });
window.addEventListener('dragleave', () => { dragN = Math.max(0, dragN - 1); if (!dragN) document.body.classList.remove('dragover') });
window.addEventListener('drop', async e => {
 if (!e.dataTransfer || !e.dataTransfer.files.length) return; e.preventDefault(); dragN = 0; document.body.classList.remove('dragover');
 const files = await filesFromDrop(e.dataTransfer);
 if (SC && SC.m) return addImagePages(files);
 if (S.view === 'hidden' && S.hiddenDK) { const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); $('#hidIn').files = dt.files; $('#hidIn').dispatchEvent(new Event('change')); return }
 ingest(files);
});
document.addEventListener('paste', e => { if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return; const f = [...(e.clipboardData && e.clipboardData.files || [])]; if (f.length) { e.preventDefault(); ingest(f.map(x => x.name && x.name !== 'image.png' ? x : new File([x], `Pasted ${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.${extOf(x.type.replace('/', '.')) || 'png'}`, { type: x.type }))) } });
['pointerdown', 'touchstart', 'wheel'].forEach(ev => document.addEventListener(ev, () => { S.lastAct = Date.now() }, { passive: true }));
let hiddenAt = 0;
// Vault & Hidden lock the moment you leave the tab or app (not while a file picker or camera you opened is showing)
let pickerUntil = 0, lockedOnLeave = false;
document.addEventListener('click', e => { if (e.target && e.target.type === 'file') pickerUntil = Date.now() + 120000 }, true);
document.addEventListener('change', e => { if (e.target && e.target.type === 'file') setTimeout(() => { pickerUntil = 0 }, 1500) }, true);
window.addEventListener('focus', () => { if (pickerUntil) setTimeout(() => { pickerUntil = 0 }, 1500) });
function lockOnLeave() { if (Date.now() < pickerUntil || (SC && SC.m)) return; if (S.vault || S.hiddenDK) { if (S.vault) lockVault(); if (S.hiddenDK) lockHidden(); lockedOnLeave = true } }
document.addEventListener('visibilitychange', () => { if (document.hidden) { hiddenAt = Date.now(); lockOnLeave() } else { if (lockedOnLeave) { lockedOnLeave = false; toast('Vault and Hidden locked while you were away') } } });
window.addEventListener('pagehide', lockOnLeave);
function autoLock() { const had = S.vault || S.hiddenDK; if (S.vault) lockVault(); if (S.hiddenDK) lockHidden(); if (had) toast('Locked after inactivity') }
setInterval(() => { if ((S.vault || S.hiddenDK) && Date.now() - S.lastAct > setting('lockMin') * 60000) autoLock() }, 15000);
window.addEventListener('hashchange', () => handleRoute());
window.addEventListener('popstate', () => handleRoute());
function handleRoute() {
 const r = routeFromHash();
 if (r === 'share') { $('#landing').hidden = true; $('#onboarding').hidden = true; $('#app').hidden = false; document.body.classList.remove('on-landing'); S.view = 'share'; render(); return }
 if (r === 'join') { const j = S.pendingJoin; S.pendingJoin = null; if (!S.profile) return welcome(j); try { history.replaceState(null, '', '#/devices') } catch { } showApp(); go('devices'); joinFlow(j); return }
 if (r === 'about') return showLanding();
 if (!S.profile) return showLanding();
 if (r === 'view') { if ($('#app').hidden) showApp(); else render() }
 else if (!r && $('#app').hidden === false && S.view !== 'home') go('home');
}
function showApp() {
 setTimeout(() => { maybeInstallBar(); setThemeColor() }, 1200);
 $('#landing').hidden = true; $('#onboarding').hidden = true; document.body.classList.remove('on-landing'); $('#app').hidden = false;
 if (S.view === 'share' || !VIEWS[S.view]) S.view = 'home';
 render(); hideSplash();
}
async function autoEmptyTrash() {
 const d = setting('autoEmptyDays'); if (!d) return;
 const old = S.files.filter(f => f.trashed && Date.now() - f.trashed > d * 864e5).map(f => f.id);
 if (old.length) await purgeFiles(old, true);
}
let installEvt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
async function installApp() {
 hideInstallBar();
 if (installEvt) { installEvt.prompt(); try { const c = await installEvt.userChoice; if (c && c.outcome === 'accepted') toast('DESk is being added to your home screen') } catch { } installEvt = null; renderSoon(); return }
 const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua), safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
 const shareIc = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
 const steps = ios ? (safari || /CriOS|EdgiOS/.test(ua) ? `<li>Tap the <b>Share</b> button ${shareIc} ${/CriOS|EdgiOS/.test(ua) ? 'in the address bar' : 'at the bottom of Safari'}.</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b> — DESk appears with its blue paperclip icon.</li>` : '<li>Open this page in <b>Safari</b>.</li><li>Tap <b>Share</b> → <b>Add to Home Screen</b>.</li>')
  : android ? `<li>Tap the browser menu <b>⋮</b>.</li><li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li><li>Confirm — DESk opens full-screen like a normal app.</li>`
  : `<li>Click the install icon at the right of the address bar (Chrome / Edge), or open the browser menu.</li><li>Choose <b>Install DESk</b>.</li>`;
 modal(`<div style="text-align:center;display:grid;gap:12px;justify-items:center"><img src="icons/icon-192.png" width="84" height="84" alt="" style="border-radius:20px;box-shadow:0 10px 30px rgba(26,92,255,.35)"><h3 style="margin:0">Add DESk to your home screen</h3><p class="muted small">It opens full-screen, works offline and keeps your files on this device.</p></div>
  <ol class="steps">${steps}</ol><div class="row end" style="margin-top:12px"><button class="btn pri" data-close>Got it</button></div>`, { cls: 'mid' });
}
window.addEventListener('appinstalled', () => { installEvt = null; hideInstallBar(); toast('DESk was added to your home screen'); renderSoon() });
// One-tap install bar: uses the browser's own install prompt where available (Chrome, Edge, Samsung Internet, Android);
// iPhone/iPad Safari has no install API, so the bar opens the 3-step guide instead.
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
function maybeInstallBar() {
 if (isStandalone() || !ONLINE_APP() || $('#app').hidden || !(installEvt || isIOS())) return;
 try { if (Date.now() - (+localStorage.getItem('desk-inst-later') || 0) < 5 * 864e5) return } catch { }
 let bar = $('#installBar'); if (bar) return;
 bar = document.createElement('div'); bar.id = 'installBar'; bar.className = 'instbar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Install DESk');
 bar.innerHTML = `<img src="icons/icon-192.png" alt="" width="44" height="44"><div class="grow"><b>Install DESk</b><span>${installEvt ? 'One tap — opens like an app, works offline' : 'Add it to your home screen in 3 taps'}</span></div><button class="btn pri sm" data-act="install">${installEvt ? 'Install' : 'Show me'}</button><button class="btn icon sm ghost" data-act="instLater" aria-label="Not now">${ic('x', 18)}</button>`;
 document.body.appendChild(bar); document.body.classList.add('has-ibar');
}
function hideInstallBar() { const b = document.getElementById('installBar'); if (b) b.remove(); document.body.classList.remove('has-ibar') }
ACT.instLater = () => { try { localStorage.setItem('desk-inst-later', Date.now()) } catch { } hideInstallBar() };
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; renderIf('prefs'); renderIf('home'); maybeInstallBar() });
async function init() {
 $('#sIc').innerHTML = ic('search', 18);
 $('.mlogo').innerHTML = LOGO(36);
 $('#topActs').innerHTML = `<button class="btn hide-m" data-act="scan">${ic('scan', 18)}Scan</button><button class="btn pri" data-act="upFiles">${ic('upload', 18)}<span class="hide-s">Upload</span></button>`;
 S.settings = await kvGet('settings', {}) || {}; S.settingsTs = await kvGet('settingsTs', {}) || {};
 S.layout = await kvGet('layout', 'grid');
 S.deviceId = await kvGet('deviceId'); if (!S.deviceId) { S.deviceId = uid(12); await kvSet('deviceId', S.deviceId) }
 S.deviceName = await kvGet('deviceName'); S.deviceNameSet = !!S.deviceName; if (!S.deviceName) S.deviceName = autoName();
 S.files = (await dbAll('files').catch(() => [])) || []; S.scans = (await dbAll('scans').catch(() => [])) || [];
 await loadDrives(); S.vaultRec = await kvGet('vault'); S.hiddenCfgCache = await kvGet('hiddenCfg'); S.profile = await kvGet('profile');
 autoEmptyTrash(); setTimeout(() => autoCopy().catch(() => { }), 3000);
 if (S.profile) await restoreSync();
 const r = routeFromHash();
 if (r === 'share' || r === 'join' || r === 'about') handleRoute();
 else if (!S.profile) showLanding();
 else showApp();
 if ('serviceWorker' in navigator && ONLINE_APP()) {
  navigator.serviceWorker.register('sw.js').then(reg => { reg.update().catch(() => { }); setInterval(() => reg.update().catch(() => { }), 30 * 60e3) }).catch(() => { });
  let reloaded = false; const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadController || reloaded || SC) return; reloaded = true; if (!document.querySelector('#modal-root .mwrap')) location.reload(); else toast('DESk was updated — it’ll use the new version next time you open it') });
 }
}
init().catch(e => { console.error(e); hideSplash(); $('#app').hidden = false; $('#view').innerHTML = `<div class="card empty"><h3>DESk couldn’t start</h3><p>${esc(e.message)}</p></div>` });

let drSig = '';
AFTER.prefs = async () => { await Promise.all(DR.list.map(driveState)); const sig = JSON.stringify(DR.state); if (sig !== drSig) { drSig = sig; renderIf('prefs') } };

})();
