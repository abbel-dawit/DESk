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
