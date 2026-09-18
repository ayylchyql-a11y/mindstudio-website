const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const slice = (p, a, b) => clamp01((p - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);

/* ── Header: fixed after the hero; light ink over the light sections ── */
const header = $('[data-header]');
const lightSections = ['#tessera', '#cucina', '#dove'].map((s) => $(s));
const headerTone = () => {
  header.classList.toggle('fixed', scrollY > 40);
  const y = 40;
  const onLight = lightSections.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  header.classList.toggle('on-light', onLight);
};
addEventListener('scroll', headerTone, { passive: true });
headerTone();

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
  // next Thursday: tastings only run on Thursdays
  const d = new Date(); d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
  const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  date.min = iso; date.value = iso;
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

/* ── Hero recomposition ──
   Three progress numbers off one scroll: --p (0…0.85) moves the glass, the
   bottle and the ring; --p1 (0…0.45) empties the centre; --p2 (0.35…0.8)
   fills the corners. The overlap is deliberate: the hero is never empty. */
{
  const sec = $('[data-hero]'), stage = $('.stage', sec);
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = sec.getBoundingClientRect(), max = r.height - innerHeight;
    const p = max > 0 ? clamp01(-r.top / max) : 1;
    stage.style.setProperty('--p', smooth(slice(p, 0, .85)).toFixed(4));
    stage.style.setProperty('--p1', smooth(slice(p, 0, .45)).toFixed(4));
    stage.style.setProperty('--p2', smooth(slice(p, .35, .8)).toFixed(4));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ── Cellar door: layers slide by depth ──
   Two numbers, --px/--py in −1…1, eased 8% per frame; every layer multiplies
   them by its own --d in CSS, so a new layer is one custom property. */
{
  const gate = $('#gate');
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * .08; y += (ty - y) * .08;
    gate.style.setProperty('--px', x.toFixed(4)); gate.style.setProperty('--py', y.toFixed(4));
    raf = (Math.abs(tx - x) > .001 || Math.abs(ty - y) > .001) ? requestAnimationFrame(tick) : 0;
  };
  if (!reduce && fine) {
    const sec = $('#cantina');
    sec.addEventListener('pointermove', (e) => { const r = sec.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1; if (!raf) raf = requestAnimationFrame(tick); });
    sec.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
  }
}

/* ── The list: liquid band ── */
{
  const stage = $('#lensStage'), lens = $('#lens'), edgeL = $('#edgeL'), edgeR = $('#edgeR');
  const HALF = 46, MAX_TILT = 34, EASE = .12;
  let targetX = 0, x = 0, tilt = 0, raf = 0;
  const place = () => {
    lens.style.setProperty('--x', x.toFixed(1) + 'px');
    lens.style.setProperty('--tilt', tilt.toFixed(1) + 'px');
    lens.style.setProperty('--half', HALF + 'px');
    const deg = Math.atan2(tilt * 2, stage.clientHeight) * 180 / Math.PI;
    for (const [el, side] of [[edgeL, -1], [edgeR, 1]]) { el.style.left = (x + side * HALF) + 'px'; el.style.transform = `rotate(${-deg}deg)`; }
  };
  const tick = () => {
    const prev = x;
    x += (targetX - x) * EASE;
    const v = x - prev;
    tilt += (Math.max(-MAX_TILT, Math.min(MAX_TILT, v * 3.2)) - tilt) * .1;
    place();
    raf = Math.abs(targetX - x) > .05 || Math.abs(tilt) > .05 ? requestAnimationFrame(tick) : 0;
  };
  targetX = x = stage.clientWidth * .62; place();
  if (reduce) { tilt = 18; place(); }
  else {
    stage.addEventListener('pointermove', (e) => { targetX = e.clientX - stage.getBoundingClientRect().left; if (!raf) raf = requestAnimationFrame(tick); });
    addEventListener('resize', () => place());
  }
}

/* ── The card: the foil's phase follows the viewing angle ── */
{
  const stage = $('#cardStage'), card = $('#card');
  if (!reduce && fine) {
    stage.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientX - r.left) / r.width) * 2 - 1, ry = ((e.clientY - r.top) / r.height) * 2 - 1;
      card.classList.add('tracking');
      card.style.setProperty('--rx', Math.max(-1.2, Math.min(1.2, rx)).toFixed(3));
      card.style.setProperty('--ry', Math.max(-1.2, Math.min(1.2, ry)).toFixed(3));
    });
    stage.addEventListener('pointerleave', () => { card.classList.remove('tracking'); card.style.setProperty('--rx', 0); card.style.setProperty('--ry', 0); });
  } else { card.style.setProperty('--rx', .35); card.style.setProperty('--ry', -.2); }
}
