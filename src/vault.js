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
   <label class="fld" style="margin-top:6px"><span>Auto-lock vault and Hidden after</span><select data-set="lockMin">${[1, 2, 5, 10, 15, 30, 60].map(n => `<option value="${n}" ${setting('lockMin') == n ? 'selected' : ''}>${n} minute${n > 1 ? 's' : ''} idle</option>`).join('')}</select></label>
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
