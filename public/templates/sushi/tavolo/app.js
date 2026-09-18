const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const slice = (p, a, b) => clamp01((p - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);

/* ── Header / nav / dialog / reveal ── */
const header = $('[data-header]');
addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 40), { passive: true });
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
const setMenu = (open) => { navBtn.setAttribute('aria-expanded', open); navBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu'); nav.classList.toggle('open', open); nav.setAttribute('aria-hidden', !open); document.body.classList.toggle('lock', open); };
navBtn.onclick = () => setMenu(navBtn.getAttribute('aria-expanded') !== 'true');
$$('[data-nav-link]').forEach((a) => a.onclick = () => setMenu(false));
const modal = $('[data-modal]'), form = $('[data-form]'), toast = $('[data-toast]'), date = $('[data-date]');
function openModal() { setMenu(false); const d = new Date(); date.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]; modal.showModal(); }
$$('[data-open]').forEach((b) => b.onclick = openModal);
$('[data-close]').onclick = () => modal.close();
modal.onclick = (e) => { const r = modal.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close(); };
form.onsubmit = (e) => { e.preventDefault(); modal.close(); form.reset(); toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 3200); };
const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .08 }); items.forEach((x) => io.observe(x)); }

/* ── Staggered character reveal on the section titles ── */
{
  const split = (el) => { const text = el.textContent, words = text.split(/(\s+)/); el.textContent = ''; let n = 0; for (const w of words) { if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); continue; } const s = document.createElement('span'); s.className = 'w'; s.setAttribute('aria-hidden', 'true'); for (const ch of w) { const c = document.createElement('span'); c.className = 'c'; c.style.setProperty('--i', n++); c.textContent = ch; s.appendChild(c); } el.appendChild(s); } el.setAttribute('aria-label', text); return el; };
  const targets = $$('[data-split]').map(split);
  if (reduce) targets.forEach((t) => t.classList.add('go'));
  else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } }), { threshold: .4 }); targets.forEach((t) => io.observe(t)); }
}

/* ── Hero: the vortex ──
   RINGS cloud bands stacked in depth, each a handful of arcs whose start,
   length and tint were decided once at load. Scroll moves the camera
   forward; radius = focal / depth is the whole trick — near bands balloon
   past the edges, far bands crowd into the eye. */
{
  const sec = $('[data-vortex]'), stage = $('.stage', sec), cv = $('[data-vortex-canvas]', sec), ctx = cv.getContext('2d');
  const RINGS = 42, SEGS = 9, TWIST = 1.9;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const bands = Array.from({ length: RINGS }, () => Array.from({ length: SEGS }, () => ({ a0: rnd() * Math.PI * 2, len: .8 + rnd() * 2.2, w: .5 + rnd() * .9, warm: rnd() < .34, al: .22 + rnd() * .4 })));
  let W = 0, H = 0, p = 0, drawn = -1, t0 = performance.now();
  const size = () => { const DPR = Math.min(devicePixelRatio || 1, 2); W = stage.clientWidth; H = stage.clientHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); paint(true); };
  function paint(force) {
    const drift = reduce ? 0 : (performance.now() - t0) * .00004;
    if (!force && Math.abs(p - drawn) < .0005 && reduce) return;
    drawn = p;
    const cx = W * .52, cy = H * .46, focal = Math.min(W, H) * .58;
    const cam = smooth(slice(p, .08, .86)) * 6, eye = slice(p, .62, .9);
    ctx.fillStyle = '#0b0d12'; ctx.fillRect(0, 0, W, H);
    const diag = Math.hypot(W, H), inner = Math.min(W, H) * .5;
    const order = bands.map((_, i) => ({ i, z: ((i - cam) % RINGS + RINGS) % RINGS })).sort((a, b) => b.z - a.z);
    for (const { i, z } of order) {
      const depth = .25 + z * .22, r = focal / depth;
      if (r > diag * .75) continue;
      const ox = cx + Math.sin(z * .42 + .6) * focal * .10, oy = cy + Math.cos(z * .37) * focal * .07;
      let fade = clamp01(1 - z / RINGS) * clamp01(depth - .25) * 1.2;
      fade *= 1 - .95 * clamp01((r - inner) / (diag * .75 - inner));
      if (fade <= .01) continue;
      const rot = z * TWIST * .25 + drift + i * .11;
      for (const b of bands[i]) {
        const a = Math.min(.9, b.al * fade), col = b.warm ? '224,110,84' : '150,140,170';
        for (const [k, m] of [[1, .22], [.62, .3], [.3, .42]]) { ctx.beginPath(); ctx.arc(ox, oy, r, b.a0 + rot, b.a0 + rot + b.len); ctx.lineWidth = r * .17 * b.w * k; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(${col},${(a * m).toFixed(3)})`; ctx.stroke(); }
      }
    }
    const core = 10 + eye * eye * Math.hypot(W, H) * .6;
    const g = ctx.createRadialGradient(cx, cy, core * .6, cx, cy, core * 1.35); g.addColorStop(0, '#0b0d12'); g.addColorStop(1, 'rgba(11,13,18,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(cx, cy, Math.min(W, H) * .35, cx, cy, Math.hypot(W, H) * .62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(5,6,10,.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  const read = () => {
    const r = sec.getBoundingClientRect(), max = r.height - innerHeight;
    p = reduce ? 0 : (max > 0 ? clamp01(-r.top / max) : 1);
    stage.style.setProperty('--p1', smooth(slice(p, 0, .3)).toFixed(4));
    stage.style.setProperty('--p3', smooth(slice(p, .86, 1)).toFixed(4));
  };
  let raf = 0;
  addEventListener('scroll', () => { read(); if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }, { passive: true });
  addEventListener('resize', size);
  size(); read();
  if (!reduce) (function loop() { if (sec.getBoundingClientRect().bottom > 0) paint(); requestAnimationFrame(loop); })();
}

/* ── Menu: the hue follows the category ──
   The page never picks a colour. It asks the focused card what hue it
   carries and writes that one number; the gradient does the rest. */
{
  const sec = $('[data-hue]'), cats = $$('.cat', sec), lists = $$('[data-cat-list]', sec);
  const focus = (card) => {
    cats.forEach((c) => c.classList.toggle('on', c === card));
    sec.style.setProperty('--h', card.dataset.h);
    lists.forEach((l) => l.hidden = l.dataset.catList !== card.dataset.cat);
  };
  cats.forEach((c) => { c.addEventListener('pointerenter', () => sec.style.setProperty('--h', c.dataset.h)); c.addEventListener('click', () => focus(c)); });
  sec.addEventListener('pointerleave', () => sec.style.setProperty('--h', $('.cat.on', sec).dataset.h));
}

/* ── A QR that looks like one (deterministic noise + finder patterns) ── */
{
  const grid = $('[data-qr]'); let seed = 21; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const N = 21, cells = [];
  const finder = (x, y) => { for (const [ox, oy] of [[0, 0], [N - 7, 0], [0, N - 7]]) { const lx = x - ox, ly = y - oy; if (lx >= 0 && lx < 7 && ly >= 0 && ly < 7) { const ring = Math.min(lx, ly, 6 - lx, 6 - ly); return ring === 0 || ring >= 2 ? 1 : 0; } } return null; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const f = finder(x, y); const on = f !== null ? f : rnd() < .45; cells.push(`<i class="${on ? '' : 'off'}"></i>`); }
  grid.innerHTML = cells.join('');
}
