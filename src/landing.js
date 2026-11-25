/* ================= SPLASH ================= */
const SPLASH_T0 = performance.now();
function hideSplash() {
 const sp = document.getElementById('splash'); if (!sp || sp.classList.contains('out')) return;
 const wait = Math.max(0, 1500 - (performance.now() - SPLASH_T0));
 setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 700) }, wait);
}

/* ================= LANDING PAGE ================= */
const FLOAT = [['image', '#1A5CFF', 'IMG_2214.jpg', 'Photos'], ['file', '#0f9d8a', 'Invoice_March.pdf', 'Finance'], ['scan', '#0a96c4', 'Receipt.pdf', 'Scans'], ['music', '#e5489a', 'voice-note.m4a', 'Voice notes'], ['sheet', '#12a150', 'budget.xlsx', 'Finance'], ['video', '#7a3cff', 'trip.mp4', 'Clips'], ['archive', '#9c6b30', 'backup.zip', 'Archives'], ['key', '#f08c00', 'GitHub', 'Vault']];
function showLanding() {
 $('#app').hidden = true; const ob = $('#onboarding'); ob.hidden = true;
 const L = $('#landing'); L.hidden = false; document.body.classList.add('on-landing');
 const tray = (n, c, k) => `<div class="tray" style="--c:${c}"><span>${ic(k, 18)}</span><b>${n}</b><i class="cnt"></i></div>`;
 L.innerHTML = `
 <header class="lnav"><a class="lbrand" href="#/" aria-label="DESk">${LOGO(36)}<span>DESk</span></a>
  <nav class="llinks"><a href="#features">Features</a><a href="#scanner">Scanner</a><a href="#sync">Sync</a><a href="#privacy">Privacy</a></nav>
  <button class="lbtn" data-act="lStart">Open DESk</button></header>
 <section class="lhero" id="top">
  <div class="lgrid" aria-hidden="true"></div><div class="lglow" aria-hidden="true"></div>
  <div class="lfloat" aria-hidden="true">${FLOAT.map(([i, c, n, t], k) => `<div class="fcard f${k}" style="--c:${c}"><span>${ic(i, 18)}</span><div><b>${n}</b><small>→ ${t}</small></div></div>`).join('')}</div>
  <div class="lhero-in">
   <span class="lpill">${ic('shield', 15)} Free · No account · Works offline</span>
   <h1>Everything on your desk.<br><em>Sorted.</em></h1>
   <p>Drop in anything and DESk files it in the right folder. Scan paper into clean PDFs. Lock your passwords. Keep your phone and computer in sync — encrypted, with no sign-up and no server of ours.</p>
   <div class="lcta"><button class="lbtn big" data-act="lStart">${ic('right', 20)}Open DESk</button><a class="lbtn ghost big" href="#features">See what it does</a></div>
   <div class="lmock" aria-hidden="true"><div class="lap"><div class="lap-scr"><aside><i class="lg"></i><i></i><i></i><i class="on"></i><i></i><i></i></aside><main><div class="mrow"><b></b><b></b><b></b></div><div class="mgrid">${Array.from({ length: 8 }, (_, k) => `<span style="--d:${k * .12}s;--c:${FLOAT[k][1]}"></span>`).join('')}</div></main></div><div class="lap-base"></div></div>
    <div class="phn"><div class="phn-scr"><div class="pdoc"><i></i><i></i><i></i><i></i><i></i></div><div class="pcorners"><i></i><i></i><i></i><i></i></div><div class="pshut"></div></div></div></div>
  </div></section>
 <section class="lsec" id="features"><div class="lwrap">
  <div class="lhead reveal"><span class="lkick">File manager</span><h2>Upload a hundred things. Find each one in a second.</h2><p>Batch uploads, whole folders, drag-and-drop or paste. DESk reads every name and type, then files and tags it automatically — invoices to Finance, screenshots to Screenshots, boarding passes to Travel. Duplicates are caught by fingerprint.</p></div>
  <div class="sortdemo reveal"><div class="sd-drop">${ic('upload', 26)}<b>Drop</b></div><div class="sd-flow">${FLOAT.slice(0, 6).map(([i, c], k) => `<span class="sd-f" style="--c:${c};--k:${k}">${ic(i, 16)}</span>`).join('')}</div>
   <div class="sd-trays">${tray('Photos', '#1A5CFF', 'image')}${tray('Finance', '#0f9d8a', 'file')}${tray('Scans', '#0a96c4', 'scan')}${tray('Voice notes', '#e5489a', 'music')}${tray('Spreadsheets', '#12a150', 'sheet')}${tray('Clips', '#7a3cff', 'video')}</div></div>
  <div class="lfeat">${[['search', 'Search everything', 'By name, tag, folder or type — results as you type.'], ['tag', 'Smart tags', 'Keywords, years and file types tagged for you.'], ['link', 'Short links & QR', 'Share any file with an encrypted link and QR code.'], ['download', 'Download anywhere', 'One file or a whole selection as a zip.'], ['chart', 'Live device insights', 'Memory, storage, battery, network, content by type.'], ['broom', 'Clean up', 'Duplicates, junk and large files — in DESk and on your computer.']].map(([i, t, d]) => `<div class="lf reveal"><span>${ic(i, 22)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
 <section class="lsec dark" id="scanner"><div class="lwrap split">
  <div class="reveal"><span class="lkick">Document scanner</span><h2>Point. Hold steady. Done.</h2><p>DESk spots the page edges live, captures when you hold still, straightens the perspective and cleans the paper to crisp black on white. Keep going to put many pages into one PDF — then reorder, crop, rotate or re-edit anytime. Saved scans land in the right folder: Receipts, IDs & Cards, Documents.</p>
   <ul class="lchecks"><li>${ic('check', 18)}Live edge detection & auto-capture</li><li>${ic('check', 18)}Auto, grayscale, black & white and photo clean-up</li><li>${ic('check', 18)}Multi-page PDFs, editable later</li></ul></div>
  <div class="scandemo reveal" aria-hidden="true"><div class="sd-phone"><div class="sd-page"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="sd-box"></div><div class="sd-beam"></div><span class="sd-tag">Edges found</span></div></div></div></section>
 <section class="lsec"><div class="lwrap split rev">
  <div class="vaultdemo reveal" aria-hidden="true"><div class="vd-card"><div class="vd-row"><span style="background:#1A5CFF">G</span><div><b>GitHub</b><small>me@example.com</small></div><em>482 913</em></div><div class="vd-row"><span style="background:#7a3cff">${ic('card', 16)}</span><div><b>Visa ••4421</b><small>Expires 08/29</small></div></div><div class="vd-row"><span style="background:#0f9d8a">${ic('wifi', 16)}</span><div><b>Home Wi-Fi</b><small>WPA3 · share by QR</small></div></div><div class="vd-meter"><i></i><i></i><i></i><i></i></div><small class="vd-s">Security score 96%</small></div><div class="vd-lock">${ic('lock', 30)}</div></div>
  <div class="reveal"><span class="lkick">Passwords & Hidden</span><h2>Your secrets, locked on your device.</h2><p>A full password manager: logins, cards, Wi-Fi, IDs and notes, a generator, 2-factor codes, weak and reused password alerts, imports from your browser. Plus a Hidden folder behind a PIN or password for files nobody else should see. All encrypted with AES-256 before it’s stored.</p></div></div></section>
 <section class="lsec tint" id="sync"><div class="lwrap split">
  <div class="reveal"><span class="lkick">Sync — no account</span><h2>Scan a code. Your devices are linked.</h2><p>Open <b>Devices → Link a device</b> and scan the QR code with your other phone, open the link, or type a short code like <b class="mono">K7M2-Q9XA</b>. From then on, files, folders, tags, scans and your vault stay in step — encrypted on the device before anything leaves it.</p>
   <ul class="lchecks"><li>${ic('check', 18)}No email, no password, no sign-up</li><li>${ic('check', 18)}End-to-end encrypted through a free relay</li><li>${ic('check', 18)}Rename, pause or remove devices anytime</li></ul></div>
  <div class="syncdemo reveal" aria-hidden="true"><div class="sy-dev">${ic('phone', 40)}<small>Phone</small></div><div class="sy-path"><i></i><i></i><i></i><b>${ic('lock', 14)}</b></div><div class="sy-dev">${ic('laptop', 46)}<small>Laptop</small></div><div class="sy-code">K7M2-Q9XA</div></div></div></section>
 <section class="lsec" id="privacy"><div class="lwrap"><div class="lhead reveal center"><span class="lkick">Private by design</span><h2>Your files live on your devices. Full stop.</h2></div>
  <div class="lfeat three">${[['devices', 'On your device', 'Files, scans and passwords are stored in your browser’s private storage. There’s no DESk server.'], ['shield', 'Encrypted before it moves', 'Sync and share links are encrypted on the device; the relay only ever sees unreadable bytes.'], ['globe', 'Works offline', 'Install it like an app. It opens and works with no internet at all.']].map(([i, t, d]) => `<div class="lf reveal"><span>${ic(i, 22)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
 <section class="lsec tint"><div class="lwrap"><div class="lhead reveal center"><span class="lkick">Install</span><h2>Put DESk on your home screen</h2></div>
  <div class="lfeat three">${[['phone', 'iPhone & iPad', 'Open in Safari → Share → Add to Home Screen.'], ['phone', 'Android', 'Open in Chrome → menu ⋮ → Install app.'], ['laptop', 'Computer', 'Chrome or Edge → install icon in the address bar.']].map(([i, t, d]) => `<div class="lf reveal"><span>${ic(i, 22)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
 <section class="lfinal"><div class="lwrap reveal">${LOGO(72)}<h2>Clear your desk.</h2><p>Free, private and ready in one tap.</p><button class="lbtn big" data-act="lStart">${ic('right', 20)}Open DESk</button></div></section>
 <footer class="lfoot"><span>${LOGO(22)} DESk ${APP_VERSION}</span><span><a href="#" data-act="showTerms">Privacy & Terms</a> · Hosted on GitHub Pages</span></footer>`;
 const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 });
 L.querySelectorAll('.reveal').forEach(el => io.observe(el));
 const hero = L.querySelector('.lhero');
 hero.onpointermove = e => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; hero.style.setProperty('--px', x.toFixed(3)); hero.style.setProperty('--py', y.toFixed(3)) };
 L.querySelectorAll('a[href^="#"]:not([href="#/"])').forEach(a => a.onclick = e => { const t = L.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }) } });
 L.scrollTop = 0; window.scrollTo(0, 0);
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
