const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

/* ── Header / mobile nav ── */
const header = $('[data-header]');
addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 40), { passive: true });
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => {
  const open = navBtn.getAttribute('aria-expanded') !== 'true';
  navBtn.setAttribute('aria-expanded', open);
  navBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  nav.classList.toggle('open', open);
  nav.setAttribute('aria-hidden', !open);
  document.body.classList.toggle('lock', open);
};
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

/* ── Cart ── */
const drawer = $('[data-cart]'), scrim = $('[data-scrim]'), toast = $('[data-toast]');
let cart = [];
const say = (text) => { toast.textContent = text; toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 1800); };
function render() {
  const count = cart.length, total = cart.reduce((s, x) => s + x.price, 0);
  $('[data-cart-count]').textContent = count;
  $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Apri carrello, ${count} articoli`));
  $('[data-cart-total]').textContent = euro(total);
  $('[data-checkout]').disabled = !count;
  $('[data-cart-items]').innerHTML = count
    ? cart.map((x, i) => `<div class="cart-item"><span>${x.name}</span><b>${euro(x.price)}</b><button aria-label="Rimuovi ${x.name}" data-remove="${i}">×</button></div>`).join('')
    : '<div class="empty"><span>◯</span><h3>Ancora vuoto</h3><p>Scorri per comporre la bowl del giorno o scegli una signature.</p></div>';
  $$('[data-remove]').forEach((b) => b.onclick = () => { cart.splice(+b.dataset.remove, 1); render(); });
}
$$('[data-add]').forEach((b) => b.onclick = () => { cart.push({ name: b.dataset.name, price: +b.dataset.price }); render(); say('Aggiunto al carrello'); });
const openCart = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); document.body.classList.add('lock'); };
const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); document.body.classList.remove('lock'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart);
$('[data-close-cart]').onclick = closeCart;
scrim.onclick = closeCart;
$('[data-checkout]').onclick = () => say('✓ Demo: ordine confermato');
render();

/* ── Bowl drawing ──
   Same recipe grammar as the original design, but every ingredient family
   is its own <g> so the hero can slide layers by depth and the build stage
   can drop them in one at a time. */
const FILL = {
  base: { 'Riso sushi': '#efe6d6', 'Riso venere': '#2a1e26', 'Quinoa': '#d9c69a', 'Insalata mista': '#9fc774' },
  protein: { 'Salmone': '#ff7a59', 'Tonno': '#e04b5a', 'Gamberi': '#ffa07a', 'Pollo teriyaki': '#c98a52', 'Tofu': '#f0d58c' },
  topping: { 'Avocado': '#8cc06f', 'Edamame': '#6fae5c', 'Mango': '#ffbe3d', 'Cetriolo': '#bfe08a', 'Alga wakame': '#2f9c86', 'Mais': '#f5d34f', 'Pomodorini': '#e8503c', 'Ravanello': '#f3a6c1', 'Cipolla croccante': '#c9975a', 'Sesamo': '#e9dcc3' },
  sauce: { 'Soia': '#3b2416', 'Teriyaki': '#5a2f19', 'Spicy mayo': '#ff9a6e', 'Ponzu': '#c9a34a', 'Sesamo': '#e6d3a8' },
};
const CUBES = [[104, 118, -8], [140, 104, 6], [118, 154, 12], [152, 140, -4], [96, 160, 4], [134, 176, -10]];
const SLOTS = [[236, 104], [256, 160], [232, 214], [170, 236], [108, 226], [88, 92], [166, 84], [204, 190]];
const SEEDS = [[92, 70], [150, 62], [210, 78], [248, 120], [252, 200], [200, 244], [130, 250], [78, 210], [70, 140]];
const el = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

function drawBowl(svg, r, opts = {}) {
  const oy = opts.offsetY || 0; // the build stage's viewBox is taller so ingredients can start above the rim
  svg.replaceChildren();
  const g = (name, extra = {}) => { const n = el('g', { 'data-layer': name, ...extra }); n.setAttribute('transform', `translate(0 ${oy})`); svg.appendChild(n); return n; };
  const bowl = g('bowl');
  bowl.append(
    el('circle', { cx: 160, cy: 160, r: 152, fill: '#0e2f3d' }),
    el('circle', { cx: 160, cy: 160, r: 152, fill: 'none', stroke: 'rgba(232,241,244,.28)', 'stroke-width': 2 }),
    el('circle', { cx: 160, cy: 160, r: 140, fill: 'none', stroke: 'rgba(232,241,244,.08)' })
  );
  const base = g('base', opts.drop ? { 'data-drop': 'base' } : {});
  base.append(el('circle', { cx: 160, cy: 160, r: 126, fill: FILL.base[r.base] || '#efe6d6' }));
  const dark = r.base === 'Riso venere';
  SEEDS.forEach(([x, y]) => base.append(el('circle', { cx: x, cy: y, r: 3, fill: dark ? 'rgba(255,255,255,.18)' : 'rgba(20,37,43,.1)' })));
  const protein = g('protein', opts.drop ? { 'data-drop': 'protein' } : {});
  const pf = FILL.protein[r.protein] || '#ff7a59';
  CUBES.forEach(([x, y, a]) => protein.append(
    el('rect', { x, y, width: 34, height: 34, rx: 8, fill: pf, transform: `rotate(${a} ${x + 17} ${y + 17})` }),
    el('rect', { x: x + 6, y: y + 5, width: 14, height: 6, rx: 3, fill: 'rgba(255,255,255,.45)', transform: `rotate(${a} ${x + 17} ${y + 17})` })
  ));
  const tops = (r.toppings || []).filter((t) => t !== 'Sesamo');
  const topG = g('toppings');
  tops.forEach((t, i) => {
    const [x, y] = SLOTS[i % SLOTS.length];
    const f = FILL.topping[t] || '#8cc06f';
    const one = el('g', opts.drop ? { 'data-drop': `top-${i}` } : {});
    [[0, 0, 12], [15, -11, 9], [-9, 14, 9]].forEach(([dx, dy, rr]) => one.append(el('circle', { cx: x + dx, cy: y + dy, r: rr, fill: f, stroke: 'rgba(20,37,43,.18)' })));
    topG.appendChild(one);
  });
  if ((r.toppings || []).includes('Sesamo')) {
    const s = el('g', opts.drop ? { 'data-drop': `top-${tops.length}` } : {});
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996, d = 40 + (i * 37) % 80;
      s.append(el('ellipse', { cx: 160 + Math.cos(a) * d, cy: 160 + Math.sin(a) * d, rx: 2.4, ry: 1.4, fill: '#f4ead2', stroke: 'rgba(20,37,43,.3)', 'stroke-width': .5 }));
    }
    topG.appendChild(s);
  }
  if (r.sauce) {
    const sauce = g('sauce', opts.drop ? { 'data-drop': 'sauce' } : {});
    const sf = FILL.sauce[r.sauce] || '#3b2416';
    sauce.append(
      el('path', { d: 'M78 150 C110 120, 130 190, 165 160 S215 130, 244 168', fill: 'none', stroke: sf, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: .9 }),
      el('path', { d: 'M96 196 C130 176, 150 214, 190 196 S230 178, 232 206', fill: 'none', stroke: sf, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .65 })
    );
  }
}

drawBowl($('[data-bowl="hero"]'), { base: 'Riso sushi', protein: 'Salmone', toppings: ['Avocado', 'Edamame', 'Mango', 'Sesamo'], sauce: 'Soia' });
$$('[data-bowl="sig"]').forEach((svg) => {
  const [base, protein, tops, sauce] = svg.dataset.recipe.split('|');
  drawBowl(svg, { base, protein, toppings: tops.split(','), sauce });
});

/* ── Hero parallax ──
   Two numbers, --x and --y in −1…1, eased 10% per frame; every layer
   multiplies them by its own --d in CSS. */
{
  const scene = $('#scene');
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.1; y += (ty - y) * 0.1;
    scene.style.setProperty('--x', x.toFixed(4)); scene.style.setProperty('--y', y.toFixed(4));
    raf = (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) ? requestAnimationFrame(tick) : 0;
  };
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); } });
  }
}

/* ── Chapter stacking ──
   --k on each chapter = how far the next one has climbed over it (0 → 1). */
const secs = $$('[data-sec]');
function stack() {
  const h = innerHeight;
  secs.forEach((sec, i) => {
    const next = secs[i + 1];
    const k = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / h)) : 0;
    sec.style.setProperty('--k', k.toFixed(3));
  });
}

/* ── Scroll-built bowl ──
   The stage is pinned for three screens; scroll position — not a clock —
   decides which ingredient has landed. Order: base · protein · four toppings
   · sauce. Each element gets its own window of the progress so they arrive
   one after another rather than all at once. */
const build = $('[data-build]'), space = $('[data-build-space]');
const buildSvg = $('[data-bowl="build"]');
const RECIPE = { base: 'Riso venere', protein: 'Tonno', toppings: ['Avocado', 'Mango', 'Edamame', 'Alga wakame'], sauce: 'Ponzu' };
buildSvg.setAttribute('viewBox', '0 -100 320 420');
drawBowl(buildSvg, RECIPE, { drop: true });
const drops = $$('[data-drop]', buildSvg);
const ORDER = ['base', 'protein', 'top-0', 'top-1', 'top-2', 'top-3', 'sauce'];
const STEP_OF = { base: 0, protein: 1, 'top-0': 2, 'top-1': 2, 'top-2': 2, 'top-3': 2, sauce: 3 };
const steps = $$('[data-step]');
const done = $('[data-build-done]');
const bar = $('[data-build-bar]');
function assemble() {
  if (reduce) { drops.forEach((d) => d.style.setProperty('--p', 1)); steps.forEach((s) => s.classList.add('on')); done.classList.add('on'); return; }
  // 🩸 Measure against the spacer, never the chapter: a pinned sticky element
  //    reports its shifted position (offsetTop and getBoundingClientRect alike),
  //    so anything read off it sits at 0 for the whole pinned stretch.
  //    The spacer is plain flow; the chapter pins exactly one chapter-height
  //    above it.
  const start = space.offsetTop - build.offsetHeight;
  const p = Math.min(1, Math.max(0, (scrollY - start) / space.offsetHeight));
  const usable = p / 0.9;                       // last 10% is a rest so the finished bowl is seen
  const n = ORDER.length, win = 1 / n;
  const lit = new Set();
  drops.forEach((d) => {
    const i = ORDER.indexOf(d.dataset.drop);
    const t = Math.min(1, Math.max(0, (usable - i * win) / win));
    // ease-out on the way in: the fall decelerates into the bowl
    d.style.setProperty('--p', (1 - Math.pow(1 - t, 3)).toFixed(3));
    if (t > 0.5) lit.add(STEP_OF[d.dataset.drop]);
  });
  steps.forEach((s) => s.classList.toggle('on', lit.has(+s.dataset.step)));
  done.classList.toggle('on', p > 0.92);
  bar.style.width = `${(p * 100).toFixed(1)}%`;
}
const onScroll = () => { stack(); assemble(); };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();
