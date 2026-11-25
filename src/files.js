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

/* ================= INGEST ================= */
async function addFile(blob, o) {
 const name = o.name || blob.name || 'file';
 const mime = o.type || blob.type || guessMime(name);
 const hash = o.hash || await hashBlob(blob);
 const c = classify(name, mime, blob.size, { path: o.path, modified: o.modified, scan: !!o.scan, kind: o.kind });
 const now = Date.now();
 const rec = { id: uid(), name, type: mime, size: blob.size, cat: c.cat, folder: c.folder, tags: c.tags, added: now, modified: o.modified || now, opened: 0, hash, origin: o.origin || 'upload', device: S.deviceId, scanId: o.scan || null, thumb: o.thumb || await makeThumb(blob, mime), trashed: 0, fav: false, mt: now, dirty: false, offloaded: false, sent: 0 };
 rec.mini = await miniOf(rec.thumb);
 await dbPut('blobs', rec.id, blob);
 await saveRec(rec);
 S.files.push(rec);
 return rec;
}
function upPanel(total) {
 const el = $('#upq');
 el.innerHTML = `<div class="upq"><div class="row between"><b id="upT">Sorting ${total} item${total > 1 ? 's' : ''}…</b><span class="small muted" id="upN">0 / ${total}</span></div><div class="bar" style="margin:10px 0 6px"><i id="upB" style="width:0"></i></div><div class="small muted" id="upF" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div></div>`;
 return {
  step(i, n) { $('#upN').textContent = `${i} / ${total}`; $('#upB').style.width = (i / total * 100) + '%'; $('#upF').textContent = n },
  done(title, detail) { $('#upT').textContent = title; $('#upN').textContent = ''; $('#upB').style.width = '100%'; $('#upF').textContent = detail; el.innerHTML += ''; setTimeout(() => { el.innerHTML = '' }, 6000); el.onclick = () => el.innerHTML = '' }
 };
}
let ingesting = false;
async function ingest(list, opts = {}) {
 const files = [...list].filter(f => f && f.name !== '.DS_Store' && f.name !== 'Thumbs.db' && f.name !== 'desktop.ini');
 if (!files.length) return [];
 ingesting = true;
 const q = upPanel(files.length); let dupes = 0, failed = 0; const added = [], cats = {};
 const known = new Map(live().map(f => [f.hash, f]));
 for (let i = 0; i < files.length; i++) {
  const f = files[i]; q.step(i, f.webkitRelativePath || f.name);
  try {
   const hash = await hashBlob(f);
   if (setting('skipDupes') && known.has(hash) && !opts.force) { dupes++; continue }
   const rec = await addFile(f, { name: f.name, hash, path: f.webkitRelativePath || '', modified: f.lastModified });
   known.set(hash, rec); added.push(rec); cats[rec.cat] = (cats[rec.cat] || 0) + 1;
  } catch (e) { console.error(e); failed++ }
  if (i % 8 === 7) renderSoon();
 }
 ingesting = false;
 const parts = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`);
 q.done(added.length ? `Sorted ${added.length} item${added.length > 1 ? 's' : ''}` : 'Nothing new added',
  [parts.join(' · '), dupes ? `${dupes} duplicate${dupes > 1 ? 's' : ''} skipped` : '', failed ? `${failed} failed (device storage may be full)` : ''].filter(Boolean).join(' — '));
 render(); syncSoon(); if (typeof autoCopy === 'function') autoCopy();
 return added;
}
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
