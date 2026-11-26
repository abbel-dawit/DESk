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
