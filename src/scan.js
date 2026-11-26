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
 // How sure are we this is a page? brightness inside vs outside, corners on the frame edge, shape
 const q = best.q, inQ = (px, py) => { let c = false; for (let i = 0, j = 3; i < 4; j = i++) { const [xi, yi] = q[i], [xj, yj] = q[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c } return c };
 let si = 0, ni = 0, so = 0, no = 0; for (let y = 1; y < h; y += 3) for (let x0 = 1; x0 < w; x0 += 3) { const v = gr[y * w + x0]; if (inQ(x0, y)) { si += v; ni++ } else { so += v; no++ } }
 const contrast = ni && no > N / 60 ? Math.abs(si / ni - so / no) : 0;
 const m = Math.max(2, Math.min(w, h) * .025), edge = q.filter(p => p[0] < m || p[1] < m || p[0] > w - m || p[1] > h - m).length;
 const sides = q.map((p, i) => Math.hypot(q[(i + 1) % 4][0] - p[0], q[(i + 1) % 4][1] - p[1])), shape = Math.min(...sides) / Math.max(...sides);
 const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
 const out = q.map(p => [(p[0] + (cx - p[0]) * .012) / s, (p[1] + (cy - p[1]) * .012) / s]);
 Object.assign(out, { area: qArea(q) / N, contrast, edge, shape, score: best.score });
 return out;
}
// Auto-capture only fires for something that really looks like a page in view
function autoOK(q) { return !!q && q.area > .12 && q.area < .9 && q.edge < 2 && q.contrast >= 22 && q.shape > .3 }
function quadMoved(a, b) {
 if (!a || !b) return true;
 const c = z => [z.reduce((t, p) => t + p[0], 0) / 4, z.reduce((t, p) => t + p[1], 0) / 4], ca = c(a), cb = c(b);
 const span = Math.max(...a.map(p => p[0])) - Math.min(...a.map(p => p[0])) || 1;
 return Math.hypot(ca[0] - cb[0], ca[1] - cb[1]) / span > .25 || Math.abs((a.area || 0) - (b.area || 0)) > .08;
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
 SC = Object.assign({ armed: true, lostSince: 0, lastQ: null, pages: [], cur: 0, auto: true, stream: null, timer: 0, smooth: null, stable: 0, cool: 0, editingId: null, name: '', nameTouched: false, kind: null, fmt: 'pdf' }, opts, { m: null });
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
  const q = detectQuad(v, vw, vh); if (q) SC.lastRaw = q;
  const dpr = devicePixelRatio || 1, cw = ov.clientWidth, ch = ov.clientHeight;
  if (ov.width !== Math.round(cw * dpr)) { ov.width = Math.round(cw * dpr); ov.height = Math.round(ch * dpr) }
  const x = ov.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, cw, ch);
  const sc = Math.min(cw / vw, ch / vh), ox = (cw - vw * sc) / 2, oy = (ch - vh * sc) / 2;
  const msg = $('#scMsg', SC.m); const now = performance.now();
  // re-arm auto-capture only once the last page has been taken away or moved
  if (!q) { if (!SC.lostSince) SC.lostSince = now; if (now - SC.lostSince > 700) SC.armed = true }
  else { SC.lostSince = 0; if (!SC.armed && quadMoved(q, SC.lastQ)) SC.armed = true }
  if (q) {
   let move = 1;
   if (SC.smooth) { move = Math.max(...q.map((p, i) => Math.hypot(p[0] - SC.smooth[i][0], p[1] - SC.smooth[i][1]))) / Math.max(vw, vh); SC.smooth = SC.smooth.map((p, i) => [p[0] * .45 + q[i][0] * .55, p[1] * .45 + q[i][1] * .55]) }
   else SC.smooth = q;
   const good = autoOK(q);
   if (move < .02 && good) { if (!SC.stable) SC.stable = now } else SC.stable = 0;
   const held = SC.stable ? (now - SC.stable) / 1300 : 0;
   x.beginPath(); SC.smooth.forEach((p, i) => { const X = ox + p[0] * sc, Y = oy + p[1] * sc; i ? x.lineTo(X, Y) : x.moveTo(X, Y) }); x.closePath();
   x.setLineDash(good ? [] : [10, 8]); x.fillStyle = good ? 'rgba(26,92,255,.22)' : 'rgba(233,161,0,.12)'; x.fill(); x.lineWidth = 3; x.strokeStyle = good ? '#4d82ff' : '#e9a100'; x.stroke(); x.setLineDash([]);
   if (good) SC.smooth.forEach(p => { x.beginPath(); x.arc(ox + p[0] * sc, oy + p[1] * sc, 7, 0, 7); x.fillStyle = '#fff'; x.fill() });
   const hint = q.area <= .12 ? 'Move closer to the page' : (q.area >= .9 || q.edge >= 2) ? 'Move back so the whole page is in view' : q.contrast < 22 ? 'Put the page on a darker surface' : q.shape <= .3 ? 'Hold the phone straight over the page' : '';
   if (!SC.armed) { msg.textContent = `Page ${SC.pages.length} saved — move to the next page`; msg.className = 'scmsg go' }
   else if (!good) { msg.textContent = hint || 'Looking for a document…'; msg.className = 'scmsg warn' }
   else if (SC.auto && held >= 1 && now >= SC.cool) { msg.textContent = 'Capturing…'; capture() }
   else { msg.textContent = SC.auto ? (held > .15 ? 'Hold steady…' : 'Document found') : 'Document found — tap to capture'; msg.className = 'scmsg' + (held > .15 ? ' go' : '') }
  } else { SC.smooth = null; SC.stable = 0; if (msg) { msg.textContent = !SC.armed ? `Page ${SC.pages.length} saved — next page?` : 'Looking for a document…'; msg.className = 'scmsg' } }
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
  SC.pages.push(p); SC.cur = SC.pages.length - 1; SC.cool = performance.now() + 1500; SC.stable = 0; SC.armed = false; SC.lastQ = SC.smooth ? Object.assign(SC.smooth.map(a => [...a]), { area: (SC.lastRaw || {}).area }) : null;
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
