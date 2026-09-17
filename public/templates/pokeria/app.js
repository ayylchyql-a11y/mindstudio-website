const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

/* ── Header / mode / mobile nav (same behaviour as the other templates) ── */
const header = $('[data-header]');
addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 65), { passive: true });

let mode = 'Consegna';
const setMode = (value) => {
  mode = value;
  $$('[data-mode]').forEach((b) => { const on = b.dataset.mode === value; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  $('[data-mode-label]').textContent = value;
  $('[data-cart-mode]').textContent = value;
  $('[data-mode-note]').textContent = value === 'Consegna' ? '20–30 min · da € 2,00' : 'Pronta in 15 min · gratuito';
};
$$('[data-mode]').forEach((b) => b.onclick = () => setMode(b.dataset.mode));
$('[data-mode-direct]').onclick = () => { setMode('Ritiro'); location.hash = 'componi'; };
$('[data-change-mode]').onclick = () => setMode(mode === 'Consegna' ? 'Ritiro' : 'Consegna');

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
const say = (text) => {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
};
function render() {
  const count = cart.length, total = cart.reduce((s, x) => s + x.price, 0);
  $('[data-cart-count]').textContent = count;
  $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Apri carrello, ${count} articoli`));
  $('[data-cart-total]').textContent = euro(total);
  $('[data-checkout]').disabled = !count;
  $('[data-cart-items]').innerHTML = count
    ? cart.map((x, i) => `<div class="cart-item"><span>${x.name}${x.detail ? `<small>${x.detail}</small>` : ''}</span><b>${euro(x.price)}</b><button aria-label="Rimuovi ${x.name}" data-remove="${i}">×</button></div>`).join('')
    : '<div class="empty"><span>◯</span><h3>La bowl è ancora vuota</h3><p>Componi la tua o scegli una signature.</p></div>';
  $$('[data-remove]').forEach((b) => b.onclick = () => { cart.splice(+b.dataset.remove, 1); render(); });
}
$$('[data-add]').forEach((b) => b.onclick = () => { cart.push({ name: b.dataset.name, price: +b.dataset.price }); render(); say('Aggiunto al carrello'); });
const openCart = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); document.body.classList.add('lock'); };
const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); document.body.classList.remove('lock'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart);
$('[data-close-cart]').onclick = closeCart;
scrim.onclick = closeCart;
$('[data-checkout]').onclick = () => say('✓ Demo: ordine confermato');

/* ── Bowl illustration ──
   One drawing routine for the hero, the builder preview and the six
   signature cards. Colours come from the chips' data-fill, so the picture
   and the option list can never disagree. */
const FILL = { base: {}, protein: {}, topping: {}, sauce: {} };
$$('[data-base]').forEach((b) => FILL.base[b.dataset.base] = b.dataset.fill);
$$('[data-protein]').forEach((b) => FILL.protein[b.dataset.protein] = b.dataset.fill);
$$('[data-topping]').forEach((b) => FILL.topping[b.dataset.topping] = b.dataset.fill);
$$('[data-sauce]').forEach((b) => FILL.sauce[b.dataset.sauce] = b.dataset.fill);

// protein cubes sit centre-left; toppings take the eight slots around them
const CUBES = [[104, 118, -8], [140, 104, 6], [118, 154, 12], [152, 140, -4], [96, 160, 4], [134, 176, -10]];
const SLOTS = [[236, 104], [256, 160], [232, 214], [170, 236], [108, 226], [88, 92], [166, 84], [204, 190]];
const SEEDS = [[92, 70], [150, 62], [210, 78], [248, 120], [252, 200], [200, 244], [130, 250], [78, 210], [70, 140]];

function drawBowl(svg, r) {
  const el = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  svg.replaceChildren();
  svg.append(
    el('circle', { cx: 160, cy: 160, r: 152, fill: '#fff' }),
    el('circle', { cx: 160, cy: 160, r: 146, fill: 'none', stroke: 'rgba(20,37,43,.12)' }),
    el('circle', { cx: 160, cy: 160, r: 128, fill: FILL.base[r.base] || '#f7f2e8' }),
    el('circle', { cx: 160, cy: 160, r: 128, fill: 'none', stroke: 'rgba(20,37,43,.08)', 'stroke-width': 6 })
  );
  // grains on the base so it reads as rice / quinoa rather than a flat disc
  const dark = r.base === 'Riso venere';
  SEEDS.forEach(([x, y]) => svg.append(el('circle', { cx: x, cy: y, r: 3, fill: dark ? 'rgba(255,255,255,.18)' : 'rgba(20,37,43,.08)' })));
  const pf = FILL.protein[r.protein] || '#ff7a59';
  CUBES.forEach(([x, y, a]) => svg.append(
    el('rect', { x, y, width: 34, height: 34, rx: 8, fill: pf, transform: `rotate(${a} ${x + 17} ${y + 17})` }),
    el('rect', { x: x + 6, y: y + 5, width: 14, height: 6, rx: 3, fill: 'rgba(255,255,255,.45)', transform: `rotate(${a} ${x + 17} ${y + 17})` })
  ));
  const tops = (r.toppings || []).filter((t) => t !== 'Sesamo');
  tops.forEach((t, i) => {
    const [x, y] = SLOTS[i % SLOTS.length];
    const f = FILL.topping[t] || '#8cc06f';
    [[0, 0, 12], [15, -11, 9], [-9, 14, 9]].forEach(([dx, dy, rr]) => svg.append(el('circle', { cx: x + dx, cy: y + dy, r: rr, fill: f, stroke: 'rgba(20,37,43,.12)' })));
  });
  if ((r.toppings || []).includes('Sesamo')) {
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996, d = 40 + (i * 37) % 80; // golden-angle scatter, deterministic
      svg.append(el('ellipse', { cx: 160 + Math.cos(a) * d, cy: 160 + Math.sin(a) * d, rx: 2.4, ry: 1.4, fill: '#f4ead2', stroke: 'rgba(20,37,43,.25)', 'stroke-width': .5, transform: `rotate(${(i * 47) % 180} ${160 + Math.cos(a) * d} ${160 + Math.sin(a) * d})` }));
    }
  }
  if (r.sauce) {
    const sf = FILL.sauce[r.sauce] || '#5a3a22';
    svg.append(
      el('path', { d: 'M78 150 C110 120, 130 190, 165 160 S215 130, 244 168', fill: 'none', stroke: sf, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: .85 }),
      el('path', { d: 'M96 196 C130 176, 150 214, 190 196 S230 178, 232 206', fill: 'none', stroke: sf, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .6 })
    );
  }
}

/* ── Builder state ── */
const state = { size: 'Regular', sizePrice: 11.9, base: 'Riso sushi', protein: 'Salmone', proteinExtra: 0, toppings: [], sauce: 'Soia' };
const builder = $('.builder');
const setHue = (h) => builder.style.setProperty('--h', h);

function pick(group, attr, btn) {
  $$(`[${attr}]`, group).forEach((b) => { const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
$$('[data-size]').forEach((b) => b.onclick = () => { pick(b.parentElement, 'data-size', b); state.size = b.dataset.size; state.sizePrice = +b.dataset.price; update(); });
$$('[data-base]').forEach((b) => b.onclick = () => { pick(b.parentElement, 'data-base', b); state.base = b.dataset.base; update(); });
$$('[data-sauce]').forEach((b) => b.onclick = () => { pick(b.parentElement, 'data-sauce', b); state.sauce = b.dataset.sauce; update(); });
$$('[data-topping]').forEach((b) => {
  b.style.setProperty('--dot', b.dataset.fill);
  b.onclick = () => {
    const t = b.dataset.topping, i = state.toppings.indexOf(t);
    if (i >= 0) state.toppings.splice(i, 1); else state.toppings.push(t);
    const on = i < 0;
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    update();
  };
});
$$('[data-base],[data-sauce]').forEach((b) => b.style.setProperty('--dot', b.dataset.fill));

// Protein rows: hovering previews the hue, choosing commits it.
const rows = $$('[data-protein]');
const choose = (row) => {
  rows.forEach((r) => { const on = r === row; r.classList.toggle('on', on); r.setAttribute('aria-checked', on); });
  state.protein = row.dataset.protein; state.proteinExtra = +row.dataset.extra;
  setHue(row.dataset.h);
  update();
};
rows.forEach((row) => {
  row.addEventListener('pointerenter', () => setHue(row.dataset.h));
  row.addEventListener('focus', () => setHue(row.dataset.h));
  row.addEventListener('click', () => choose(row));
  row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(row); } });
});
$('.protein-list').addEventListener('pointerleave', () => setHue($('[data-protein].on').dataset.h));

function price() { return state.sizePrice + state.proteinExtra + Math.max(0, state.toppings.length - 4) * 1; }
function update() {
  const extra = Math.max(0, state.toppings.length - 4);
  $('[data-topping-count]').textContent = `${Math.min(state.toppings.length, 4)} / 4 inclusi${extra ? ` · +${extra} extra` : ''}`;
  $('[data-summary]').textContent = [state.size, state.base, state.protein, ...state.toppings, state.sauce].join(' · ');
  $('[data-builder-price]').textContent = euro(price());
  drawBowl($('[data-bowl="builder"]'), state);
}
$('[data-add-custom]').onclick = () => {
  cart.push({ name: `Bowl ${state.size.toLowerCase()} personalizzata`, detail: [state.base, state.protein, ...state.toppings, state.sauce].join(', '), price: price() });
  render(); say('La tua bowl è nel carrello');
};

// hero + signature bowls are drawn from the recipe written in the markup
drawBowl($('[data-bowl="hero"]'), { base: 'Riso sushi', protein: 'Salmone', toppings: ['Avocado', 'Edamame', 'Mango', 'Sesamo'], sauce: 'Soia' });
$$('[data-bowl="sig"]').forEach((svg) => {
  const [base, protein, tops, sauce] = svg.dataset.recipe.split('|');
  drawBowl(svg, { base, protein, toppings: tops.split(','), sauce });
});
update();
render();

/* ── Staggered character reveal ──
   Words are the masks, characters the pieces, so the copy still wraps.
   One aria-label on the parent keeps it a single sentence for screen readers. */
function split(el) {
  const text = el.textContent;
  const words = text.split(/(\s+)/);
  el.textContent = '';
  let n = 0;
  for (const word of words) {
    if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(word)); continue; }
    const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
    for (const ch of word) { const c = document.createElement('span'); c.className = 'c'; c.style.setProperty('--i', n++); c.textContent = ch; w.appendChild(c); }
    el.appendChild(w);
  }
  el.setAttribute('aria-label', text);
  return el;
}
const splits = $$('[data-split]').map(split);
if (reduce) splits.forEach((t) => t.classList.add('go'));
else {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } }), { threshold: 0.4 });
  splits.forEach((t) => io.observe(t));
}

/* ── Scroll reveal ── */
const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .08 });
  items.forEach((x) => io.observe(x));
}

/* ── Manifesto: words brighten as the sticky stage is scrolled through ──
   Split on words, never characters. Full brightness is the resting state;
   dimming is applied here, so if this script never runs the paragraph is
   simply readable. */
{
  const p = $('[data-brighten]'), track = $('.fresh-track');
  const words = p.textContent.split(/(\s+)/);
  p.textContent = '';
  const spans = [];
  for (const w of words) {
    if (/^\s+$/.test(w)) { p.appendChild(document.createTextNode(w)); continue; }
    const i = document.createElement('i'); i.textContent = w; p.appendChild(i); spans.push(i);
  }
  const N = spans.length, SOFT = 6, FLOOR = 0.16;
  const update = () => {
    if (reduce) return;
    const rect = track.getBoundingClientRect();
    const max = rect.height - innerHeight;
    const raw = max > 0 ? -rect.top / max : 1;
    const prog = Math.min(1, Math.max(0, raw / 0.82));
    const head = prog * (N + SOFT) + 2;
    for (let i = 0; i < N; i++) {
      const t = Math.min(1, Math.max(0, (head - i) / SOFT));
      spans[i].style.opacity = (FLOOR + (1 - FLOOR) * t).toFixed(3);
    }
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ── Magnetic CTA ── */
$$('[data-magnet]').forEach((el) => {
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  const RADIUS = 60, PULL = 0.35;
  let ax = 0, ay = 0;
  const set = (x, y, tracking) => { ax = x; ay = y; el.classList.toggle('tracking', tracking); el.style.setProperty('--mx', x.toFixed(2) + 'px'); el.style.setProperty('--my', y.toFixed(2) + 'px'); };
  const release = () => set(0, 0, false);
  addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2 - ax), dy = e.clientY - (r.top + r.height / 2 - ay);
    if (Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS) set(dx * PULL, dy * PULL, true); else release();
  });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) release(); });
  addEventListener('blur', release);
});
