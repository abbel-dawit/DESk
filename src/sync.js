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
 if (f.hash && await hashBlob(blob) !== f.hash) throw new Error('Content check failed for ' + f.name);
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
