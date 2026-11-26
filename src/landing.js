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
 await restoreSync(); showApp(); setTimeout(takeShared, 800);
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
