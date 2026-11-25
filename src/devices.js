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
