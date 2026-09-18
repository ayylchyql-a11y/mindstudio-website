const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const d = new Date(); d.setDate(d.getDate() + 2);            // cakes need two days
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

/* ── Mascot: eyes follow the cursor ──
   Each eye works out its own vector to the pointer, normalised against a
   reach of 260px and clamped to the unit disc so the pupil never leaves the
   socket. Two custom properties per eye; CSS does the translate and easing. */
{
  const mascot = $('#mascot');
  const eyes = $$('.eye', mascot), brows = $$('.brow', mascot);
  const REACH = 260;
  const look = (x, y) => {
    eyes.forEach((eye, i) => {
      const r = eye.getBoundingClientRect();
      let dx = (x - (r.left + r.width / 2)) / REACH, dy = (y - (r.top + r.height / 2)) / REACH;
      const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
      eye.style.setProperty('--px', dx.toFixed(3)); eye.style.setProperty('--py', dy.toFixed(3));
      brows[i].style.setProperty('--px', dx.toFixed(3)); brows[i].style.setProperty('--py', dy.toFixed(3));
    });
    mascot.style.setProperty('--tx', ((x / innerWidth) * 2 - 1).toFixed(3));
  };
  addEventListener('pointermove', (e) => look(e.clientX, e.clientY), { passive: true });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) look(innerWidth / 2, innerHeight * .45); });
  look(innerWidth / 2, innerHeight * .45);
  if (!reduce) (function blink() {
    setTimeout(() => { eyes.forEach((e) => { e.classList.remove('blink'); void e.offsetWidth; e.classList.add('blink'); }); blink(); }, 3000 + Math.random() * 3000);
  })();
}

/* ── Pinned sections: one progress number each ──
   The section is plain flow (never sticky), so its rect is trustworthy:
   p = how far its top has travelled above the viewport, over the scroll it
   owns (its height minus one screen). */
const progressOf = (sec) => {
  const r = sec.getBoundingClientRect();
  const max = r.height - innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 1;
};

/* ── Flavour ring ── */
const FLAVOURS = [
  ['Pistacchio di Bronte', 'frutta secca', '#9ccc8a'],
  ['Fior di latte', 'latte', '#fff3e0'],
  ['Fragola di Verona', 'frutta · vegano', '#ff8fa3', 'vegano'],
  ['Cioccolato 72%', 'cacao · vegano', '#4a2c20', 'vegano'],
  ['Nocciola Piemonte', 'frutta secca', '#c9a27c'],
  ['Limone di Sorrento', 'frutta · vegano', '#ffe08a', 'vegano'],
  ['Crema di Nuvola', 'uova · latte', '#ffe9b3'],
  ['Mirtillo', 'frutta · vegano', '#8f8fdc', 'vegano'],
  ['Caffè', 'latte', '#6b4a3a'],
  ['Stracciatella', 'latte · cacao', '#f7f1e6'],
  ['Mango Alphonso', 'frutta · vegano', '#ffb347', 'vegano'],
  ['Zabaione', 'uova · marsala', '#f2c76a'],
];
{
  const sec = $('[data-ring-section]'), ring = $('[data-ring]'), caption = $('[data-caption]');
  const N = FLAVOURS.length, STEP = 360 / N;
  // radius from the panel width so neighbours sit edge to edge: r = (w/2) / tan(step/2)
  const radiusFor = (w) => (w / 2) / Math.tan((STEP / 2) * Math.PI / 180) * 1.12;
  const cells = FLAVOURS.map(([name, sub, c, badge]) => {
    const el = document.createElement('div'); el.className = 'cell'; el.style.setProperty('--c', c);
    el.innerHTML = `<div class="tub"></div>${badge ? `<span class="badge">${badge}</span>` : ''}<div class="name"><b>${name}</b><small>${sub}</small></div><div class="veil"></div>`;
    ring.appendChild(el);
    const cap = document.createElement('span'); cap.innerHTML = '<b></b><i></i>';
    cap.querySelector('b').textContent = name; cap.querySelector('i').textContent = sub;
    caption.appendChild(cap);
    return el;
  });
  const caps = [...caption.children];
  const layout = () => {
    const r = radiusFor(ring.clientWidth);
    ring.style.setProperty('--r', r.toFixed(1));                // CSS pushes the ring back by this much
    cells.forEach((el, i) => el.style.transform = `rotateY(${i * STEP}deg) translateZ(${r}px)`);
  };
  const update = () => {
    const pos = progressOf(sec) * (N - 1);                  // continuous index
    ring.style.setProperty('--ring', (-pos * STEP).toFixed(3) + 'deg');
    cells.forEach((el, i) => { el.querySelector('.veil').style.opacity = Math.min(.8, Math.abs(i - pos) * .42).toFixed(3); });
    caps.forEach((el, i) => { const k = Math.min(1, Math.abs(i - pos)); el.style.opacity = (1 - k).toFixed(3); el.style.transform = `translateY(${(i - pos) * 12}px)`; });
  };
  layout(); update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { layout(); update(); });
}

/* ── Lab: fullscreen expansion — JS only writes --p, CSS does the rest ── */
{
  const sec = $('[data-expand-section]'), stage = $('.stage', sec);
  const update = () => stage.style.setProperty('--p', progressOf(sec).toFixed(4));
  update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
}

/* ── Seasons: scene transition ── */
{
  const sec = $('[data-scenes-section]'), panels = $$('.panel', sec), caption = $('[data-scene-caption]');
  const TITLES = [['Fragola di Verona', 'primavera · aprile – giugno'], ['Anguria e menta', 'estate · luglio – agosto'], ['Castagna e miele', 'autunno · ottobre – novembre'], ['Cioccolato fondente 72%', 'inverno · tutto l’anno, ma d’inverno di più']];
  TITLES.forEach(([t, s]) => { const el = document.createElement('span'); el.innerHTML = '<b></b><i></i>'; el.querySelector('b').textContent = t; el.querySelector('i').textContent = s; caption.appendChild(el); });
  const caps = [...caption.children];
  const update = () => {
    const pos = progressOf(sec) * (panels.length - 1);      // the fractional part IS the transition
    panels.forEach((el, i) => {
      const d = i - pos, k = Math.min(1, Math.abs(d));
      el.style.transform = `translateX(${d * 68}%) rotateY(${d * -26}deg) translateZ(${-k * 190}px)`;
      el.style.zIndex = String(100 - Math.round(k * 100));
      el.querySelector('.veil').style.opacity = (k * .68).toFixed(3);
      el.style.visibility = Math.abs(d) > 1.6 ? 'hidden' : 'visible';
    });
    caps.forEach((el, i) => { const k = Math.min(1, Math.abs(i - pos)); el.style.opacity = (1 - k).toFixed(3); el.style.transform = `translateY(${(i - pos) * 14}px)`; });
  };
  update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
}
