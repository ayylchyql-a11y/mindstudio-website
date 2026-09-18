const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const slice = (p, a, b) => clamp01((p - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const outCubic = (x) => 1 - Math.pow(1 - x, 3);

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

const progressOf = (sec) => { const r = sec.getBoundingClientRect(), max = r.height - innerHeight; return max > 0 ? clamp01(-r.top / max) : 1; };
const sizeCanvas = (cv, host) => { const DPR = Math.min(devicePixelRatio || 1, 2); const W = host.clientWidth, H = host.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cv.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0); return [W, H]; };

/* ── Hero: ten real plates, and the scroll picks the one on the counter ──
   The same maths as a rendered frame sequence (index = round(p × (N−1)));
   the frames just happen to be photographs of the courses. */
{
  const COURSES = [
    ['sashimi-misto', 'Sashimi misto'], ['tartare-tonno', 'Tartare di tonno'], ['gunkan-ikura', 'Gunkan salmone e ikura'],
    ['nigiri-salmone', 'Nigiri di salmone'], ['nigiri-tonno', 'Nigiri di tonno'], ['nigiri-gambero-rosso', 'Nigiri di gambero rosso'],
    ['nigiri-branzino', 'Nigiri di branzino'], ['nigiri-anguilla', 'Nigiri di anguilla'], ['miso', 'Zuppa di miso'], ['dorayaki', 'Dorayaki'],
  ];
  const N = COURSES.length;
  const sec = $('[data-seq]'), stage = $('[data-seq-stage]', sec);
  const fr = $('[data-frame]'), fname = $('[data-frame-name]'), rail = $('[data-rail]');
  $('[data-frames]').textContent = N;
  const imgs = COURSES.map(([file, name], i) => { const im = document.createElement('img'); im.src = `./assets/${file}.webp`; im.alt = ''; im.decoding = 'async'; if (i > 1) im.loading = 'lazy'; stage.appendChild(im); return im; });
  let drawn = -1;
  const update = () => {
    const p = reduce ? 0 : progressOf(sec);
    const i = Math.round(p * (N - 1));
    rail.style.height = `${(p * 100).toFixed(1)}%`;
    if (i === drawn) return; drawn = i;
    // the course before the current one stays under it, slightly larger and
    // fading — a plate being taken away — so a fast scroll never flashes empty
    imgs.forEach((im, k) => { im.style.setProperty('--o', k === i ? 1 : k === i - 1 ? .35 : 0); im.style.setProperty('--s', k === i ? 1 : k < i ? 1.08 : .94); im.style.zIndex = k === i ? 2 : 1; });
    fr.textContent = i + 1; fname.textContent = COURSES[i][1];
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ── Omakase: the lit path ──
   Two strands wind around an axis; a rung every PITCH units, split in the
   middle. Scroll is one continuous dolly along the axis; yaw, pitch and
   distance are keyframed at four stations so the close-up is a place the
   scroll passes through, not a separate scene. */
{
  const sec = $('[data-helix]'), stage = $('.stage', sec), cv = $('[data-helix-canvas]', sec), ctx = cv.getContext('2d');
  const copies = $$('[data-station]', sec), sn = $('[data-station-n]', sec), cue = $('[data-helix-cue]', sec);
  const LEN = 3200, RADIUS = 78, TURN = 340, PITCH = 34, STEP = 9, START = -1400;
  const strands = [[], []];
  for (let x = START; x <= LEN; x += STEP) { const a = (x / TURN) * Math.PI * 2; strands[0].push({ x, y: Math.cos(a) * RADIUS, z: Math.sin(a) * RADIUS }); strands[1].push({ x, y: -Math.cos(a) * RADIUS, z: -Math.sin(a) * RADIUS }); }
  const rungs = [];
  for (let x = START + PITCH / 2; x < LEN; x += PITCH) { const a = (x / TURN) * Math.PI * 2, cy = Math.cos(a) * RADIUS, cz = Math.sin(a) * RADIUS; rungs.push([{ x, y: cy, z: cz }, { x, y: cy * .18, z: cz * .18 }]); rungs.push([{ x, y: -cy, z: -cz }, { x, y: -cy * .18, z: -cz * .18 }]); }
  const STATIONS = [{ at: 0, yaw: .62, pitch: .36, dist: 820, roll: 0 }, { at: .38, yaw: 1.05, pitch: .10, dist: 250, roll: .5 }, { at: .72, yaw: -.45, pitch: -.28, dist: 760, roll: -.2 }, { at: 1, yaw: -.70, pitch: -.10, dist: 900, roll: -.35 }];
  const camera = (p) => { let i = 0; while (i < STATIONS.length - 2 && p > STATIONS[i + 1].at) i++; const A = STATIONS[i], B = STATIONS[i + 1], k = smooth(slice(p, A.at, B.at)); const mix = (key) => A[key] + (B[key] - A[key]) * k; return { yaw: mix('yaw'), pitch: mix('pitch'), dist: mix('dist'), roll: mix('roll'), x: p * (LEN - 700) + 350 }; };
  let W = 0, H = 0, p = 0, drawn = -1;
  const project = (pt, cam, cy, sy, cp, sp, cr, sr) => { let x = pt.x - cam.x, y = pt.y, z = pt.z; [x, z] = [x * cy - z * sy, x * sy + z * cy]; [y, z] = [y * cp - z * sp, y * sp + z * cp]; [x, y] = [x * cr - y * sr, x * sr + y * cr]; z += cam.dist; if (z < 40) return null; const f = H * 1.1, s = f / z; return { x: W / 2 + x * s, y: H / 2 + y * s, s, z }; };
  function paint(force) {
    if (!force && Math.abs(p - drawn) < .0004) return; drawn = p;
    const cam = camera(p), cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), cr = Math.cos(cam.roll), sr = Math.sin(cam.roll);
    const P = (pt) => project(pt, cam, cy, sy, cp, sp, cr, sr);
    ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, W, H);
    const segs = [];
    for (const s of strands) for (let i = 1; i < s.length; i++) { const a = P(s[i - 1]), b = P(s[i]); if (!a || !b) continue; segs.push({ a, b, z: (a.z + b.z) / 2, rung: false }); }
    for (const r of rungs) { const a = P(r[0]), b = P(r[1]); if (!a || !b) continue; segs.push({ a, b, z: (a.z + b.z) / 2, rung: true }); }
    segs.sort((u, v) => v.z - u.z);
    ctx.lineCap = 'round';
    for (const g of segs) {
      const s = (g.a.s + g.b.s) / 2, fog = clamp01(1.25 - g.z / 1500); if (fog <= 0) continue;
      const line = () => { ctx.beginPath(); ctx.moveTo(g.a.x, g.a.y); ctx.lineTo(g.b.x, g.b.y); ctx.stroke(); };
      if (g.rung) {
        const w = 9 * s * H / 400;
        ctx.strokeStyle = `rgba(212,162,76,${(.22 * fog).toFixed(3)})`; ctx.lineWidth = w * 3.2; line();
        ctx.strokeStyle = `rgba(230,180,90,${fog.toFixed(3)})`; ctx.lineWidth = w; line();
        ctx.strokeStyle = `rgba(255,240,205,${(.9 * fog).toFixed(3)})`; ctx.lineWidth = w * .32; line();
      } else {
        const w = 13 * s * H / 400;
        ctx.strokeStyle = `rgba(60,52,48,${fog.toFixed(3)})`; ctx.lineWidth = w; line();
        ctx.strokeStyle = `rgba(160,150,140,${(.35 * fog).toFixed(3)})`; ctx.lineWidth = w * .22; ctx.beginPath(); ctx.moveTo(g.a.x - w * .15, g.a.y - w * .22); ctx.lineTo(g.b.x - w * .15, g.b.y - w * .22); ctx.stroke();
      }
    }
    const v = ctx.createRadialGradient(W * .5, H * .5, 0, W * .5, H * .5, H * .9); v.addColorStop(0, 'rgba(212,162,76,.06)'); v.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  const read = () => {
    p = reduce ? .38 : progressOf(sec);
    const s = [1 - slice(p, .24, .32), slice(p, .32, .40) * (1 - slice(p, .62, .70)), slice(p, .70, .78)];
    copies.forEach((c, i) => c.style.setProperty('--s', s[i].toFixed(3)));
    cue.style.setProperty('--cue', (.45 * (1 - slice(p, 0, .1))).toFixed(3));
    sn.textContent = p < .32 ? 1 : p < .70 ? 2 : 3;
  };
  let raf = 0;
  addEventListener('scroll', () => { read(); if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }, { passive: true });
  const size = () => { [W, H] = sizeCanvas(cv, stage); paint(true); };
  addEventListener('resize', size);
  size(); read(); paint(true);
}
