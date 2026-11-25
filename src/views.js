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
