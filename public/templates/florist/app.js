const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const slice = (t, a, b) => clamp01((t - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);

/* ── Header / mobile nav / dialog ── */
const header = $('[data-header]');
addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 65), { passive: true });
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
const setMenu = (open) => {
  navBtn.setAttribute('aria-expanded', open);
  navBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  nav.classList.toggle('open', open);
  nav.setAttribute('aria-hidden', !open);
  document.body.classList.toggle('lock', open);
};
navBtn.onclick = () => setMenu(navBtn.getAttribute('aria-expanded') !== 'true');
$$('[data-nav-link]').forEach((a) => a.onclick = () => setMenu(false));
const modal = $('[data-modal]'), form = $('[data-form]'), toast = $('[data-toast]'), date = $('[data-date]');
function openModal() {
  setMenu(false);
  const d = new Date();                                        // same-day delivery: today is fine
  date.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  modal.showModal();
}
$$('[data-open]').forEach((b) => b.onclick = openModal);
$('[data-close]').onclick = () => modal.close();
modal.onclick = (e) => { const r = modal.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close(); };
form.onsubmit = (e) => { e.preventDefault(); modal.close(); form.reset(); toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 3200); };

/* ── Scroll reveal ── */
const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .08 }); items.forEach((x) => io.observe(x)); }

/* ── Hero: the wrap opens and flowers pour out ──
   One progress number t in 0…1 moving at ±1/DUR per ms. Leaving mid-way
   rewinds from where it is — it never snaps back to 0. Every bloom reads its
   own slice [a, b] of t and eases with an overshoot. */
{
  const DUR = 1500;
  const scene = $('#wrap'), wrap = $('#blooms');
  const BLOOMS = [
    [-38, -28, 1.9, 0, ['#f5a6bd', '#e26d8f'], '', .30, .70],
    [22, -54, 1.6, 0, ['#ffd8a8', '#f0955b'], '', .36, .78],
    [-68, -6, 1.4, 0, ['#fff', '#e7e0d2'], '', .40, .80],
    [6, -78, 1.3, 0, ['#f5a6bd', '#e26d8f'], '', .44, .86],
    [62, -30, 1.2, 0, ['#ffd8a8', '#f0955b'], '', .48, .90],
    [-30, -96, 1.1, 0, ['#fff', '#e7e0d2'], '', .50, .92],
    [-94, -44, .9, 0, ['#f5a6bd', '#e26d8f'], '', .56, .96],
    [44, -100, .9, 0, ['#ffd8a8', '#f0955b'], '', .60, 1],
    [-50, -62, 1.3, 40, null, 'leaf', .34, .74],
    [40, -70, 1.2, -25, null, 'leaf', .46, .88],
    [-10, -40, 1.1, 70, null, 'leaf', .38, .80],
    [80, -60, 1.0, 15, null, 'leaf', .58, .98],
    [-84, -80, .9, -60, null, 'leaf', .52, .94],
  ];
  const nodes = BLOOMS.map(([dx, dy, s, r, c, kind, a, b]) => {
    const el = document.createElement('i'); el.className = 'b ' + kind;
    el.style.setProperty('--dx', dx + 'px'); el.style.setProperty('--dy', dy + 'px'); el.style.setProperty('--s', s); el.style.setProperty('--r', r + 'deg');
    if (c) { el.style.setProperty('--c1', c[0]); el.style.setProperty('--c2', c[1]); }
    wrap.appendChild(el);
    return { el, a, b };
  });
  const outCubic = (x) => 1 - Math.pow(1 - x, 3);
  const outBack = (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const render = (t) => {
    scene.style.setProperty('--door', outCubic(slice(t, 0, .45)).toFixed(4));
    for (const n of nodes) n.el.style.setProperty('--k', outBack(slice(t, n.a, n.b)).toFixed(4));
  };
  let t = 0, dir = 0, last = 0, raf = 0;
  const tick = (now) => {
    const dt = last ? now - last : 0; last = now;
    t = clamp01(t + dir * dt / DUR);
    render(t);
    if ((dir > 0 && t < 1) || (dir < 0 && t > 0)) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
  };
  const go = (d) => { dir = d; if (reduce) { t = d > 0 ? 1 : 0; render(t); return; } if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
  if (matchMedia('(hover: hover)').matches) {
    scene.addEventListener('pointerenter', () => go(1));
    scene.addEventListener('pointerleave', () => go(-1));
  } else {
    scene.addEventListener('click', () => go(dir > 0 ? -1 : 1));
    $('.hint', scene).textContent = 'tocca · si apre';
  }
  render(0);
  scene._go = go;
}

/* ── Orbit: scroll walks the camera around the bouquet ──
   The turntable is linear — no easing on p. Notes get a window each,
   smoothed in and out, so the copy arrives with the side it belongs to. */
{
  const sec = $('[data-orbit-section]'), stage = $('.stage', sec);
  const notes = $$('[data-note]', sec).map((el) => ({ el, win: el.dataset.note.split(',').map(Number) }));
  const end = $('[data-end]', sec);
  const window_ = (p, a, b, e = .06) => smooth(slice(p, a, a + e)) * (1 - smooth(slice(p, b - e, b)));
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = sec.getBoundingClientRect(), max = r.height - innerHeight;
    const p = max > 0 ? clamp01(-r.top / max) : 1;
    stage.style.setProperty('--p', p.toFixed(4));
    stage.style.setProperty('--p1', smooth(slice(p, 0, .16)).toFixed(4));
    for (const n of notes) n.el.style.setProperty('--o', window_(p, n.win[0], n.win[1]).toFixed(3));
    end.style.setProperty('--o', smooth(slice(p, .86, .96)).toFixed(3));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ── Seed: click, drop, overgrow ──
   A hill drawn as one cubic Bézier stroked wide with round caps; three
   strokes of the same path (shadow, body, highlight) make it a tube. The
   seed floats, falls under gravity, squashes on impact, and from the contact
   point a green front spreads: inside it the hill goes dark, sprouts stand
   up along the rim, one in twelve becomes a flower. */
{
  const host = $('[data-seme]'), cv = $('[data-canvas]', host), hint = $('[data-seme-hint]');
  const ctx = cv.getContext('2d');
  const P = [{ x: -0.08, y: 0.92 }, { x: 0.30, y: 0.10 }, { x: 0.50, y: 1.30 }, { x: 1.08, y: 0.52 }];
  const TUBE = 0.30;
  const bez = (t) => { const u = 1 - t; return { x: u*u*u*P[0].x + 3*u*u*t*P[1].x + 3*u*t*t*P[2].x + t*t*t*P[3].x, y: u*u*u*P[0].y + 3*u*u*t*P[1].y + 3*u*t*t*P[2].y + t*t*t*P[3].y }; };
  let W = 0, H = 0, S = 1, samples = [], hairs = [], contact = null, restY = 0, seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const RAD = () => S * 0.06;
  let phase = 'float', y = 0, vy = 0, tImpact = 0, squash = 0, last = 0, raf = 0;
  const G = 3.2, FRONT = 0.30;
  function build() {
    const DPR = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight; S = H;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    samples = [];
    for (let i = 0; i <= 240; i++) {
      const t = i / 240, a = bez(t), b = bez(Math.min(1, t + .002));
      const dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
      samples.push({ x: a.x * W, y: a.y * S, nx: -dy / m, ny: dx / m });
    }
    seed = 11; hairs = [];
    for (const s of samples) {
      const r = TUBE * S * .5;
      if (rnd() < .3) continue;
      hairs.push({ x: s.x - s.nx * r, y: s.y - s.ny * r, nx: -s.nx, ny: -s.ny, len: (.03 + rnd() * .06) * S, tilt: (rnd() - .5) * 1.2, flower: rnd() < .08, hue: rnd() < .5 ? '#f5a6bd' : (rnd() < .5 ? '#ffd8a8' : '#fff') });
    }
    const sx = W * .52;
    let best = samples[0];
    for (const s of samples) if (Math.abs(s.x - sx) < Math.abs(best.x - sx)) best = s;
    contact = { x: sx, y: best.y - TUBE * S * .5 };
    restY = contact.y - RAD();
    if (phase === 'float') y = S * .18;
  }
  const reset = () => { phase = 'float'; y = S * .18; vy = 0; squash = 0; hint.classList.remove('off'); };
  host.addEventListener('pointerdown', () => {
    if (phase === 'float') { phase = 'drop'; hint.classList.add('off'); if (reduce) { phase = 'settle'; y = restY; tImpact = performance.now() - 20000; } }
    else reset();
    if (!raf) raf = requestAnimationFrame(frame);
  });
  const tube = (color, hi, lo, k) => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const path = () => { ctx.beginPath(); ctx.moveTo(P[0].x * W, P[0].y * S); ctx.bezierCurveTo(P[1].x * W, P[1].y * S, P[2].x * W, P[2].y * S, P[3].x * W, P[3].y * S); };
    const w = TUBE * S * k;
    ctx.save(); ctx.translate(0, w * .10); ctx.strokeStyle = lo; ctx.lineWidth = w; path(); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = color; ctx.lineWidth = w; path(); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .5; ctx.translate(-w * .04, -w * .12); ctx.strokeStyle = hi; ctx.lineWidth = w * .58; path(); ctx.stroke(); ctx.restore();
  };
  function frame(now) {
    const dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now;
    const R = RAD();
    if (phase === 'float') y = S * .18 + Math.sin(now / 900) * S * .012;
    if (phase === 'drop') { vy += G * S * dt; y += vy * dt; if (y >= restY) { y = restY; phase = 'settle'; tImpact = now; squash = 1; } }
    if (phase === 'settle') squash = Math.max(0, squash - dt * 4.5);
    const grown = phase === 'settle' ? (now - tImpact) / 1000 * FRONT * S : 0;
    // sky
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#26382a'); bg.addColorStop(1, '#141f16');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // bare hill: dry earth
    tube('#8a6a4a', '#b08a63', '#4d3823', 1);
    if (grown > 0) {
      ctx.save(); ctx.beginPath(); ctx.arc(contact.x, contact.y, grown, 0, Math.PI * 2); ctx.clip();
      tube('#4f7a48', '#8fb885', '#2b4a28', 1.04);
      ctx.restore();
      for (const h of hairs) {
        const d = Math.hypot(h.x - contact.x, h.y - contact.y);
        if (d > grown) continue;
        const k = Math.min(1, (grown - d) / (S * .12)), L = h.len * k;
        const ex = h.x + (h.nx * Math.cos(h.tilt) - h.ny * Math.sin(h.tilt)) * L, ey = h.y + (h.ny * Math.cos(h.tilt) + h.nx * Math.sin(h.tilt)) * L;
        ctx.strokeStyle = '#9dc48f'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(ex, ey); ctx.stroke();
        if (h.flower && k > .6) { ctx.fillStyle = h.hue; ctx.beginPath(); ctx.arc(ex, ey, 3.2 * k, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(ex, ey, 1.2 * k, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    // the seed
    ctx.save(); ctx.translate(contact.x, y);
    ctx.scale(1 + squash * .35, 1 - squash * .3);
    const g = ctx.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R);
    g.addColorStop(0, '#d9b48c'); g.addColorStop(1, '#6b4a2e');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, R * .85, R, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (phase === 'settle' && grown > Math.hypot(W, H)) { raf = 0; last = 0; return; }   // fully grown: stop drawing
    raf = requestAnimationFrame(frame);
  }
  const start = () => { build(); if (!raf) raf = requestAnimationFrame(frame); };
  new ResizeObserver(() => build()).observe(host);
  if (reduce) { build(); phase = 'settle'; y = restY; tImpact = performance.now() - 20000; frame(performance.now()); }
  else {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { start(); io.disconnect(); } }, { threshold: .2 });
    io.observe(host);
  }
}
