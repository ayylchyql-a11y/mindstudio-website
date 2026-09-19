const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const say = (t) => { const el = $('[data-toast]'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1600); };

/* ── Catalogue: poke + tacos + the sushi categories from data.js, in the order of the printed menu ── */
const CATS = [
  { id: 'poke', name: 'Poke', thumb: '../assets/bowl-salmone.webp', items: SIZES.map((s) => ({
    id: `poke-${s.id}`, n: `Componi Poke ${s.id}`, d: `${s.limits.base} base · ${s.limits.ingredienti} ingredienti · ${s.limits.proteine} protein${s.limits.proteine > 1 ? 'e' : 'a'} · ${s.limits.salse} sals${s.limits.salse > 1 ? 'e' : 'a'} · ${s.limits.topping} topping`, p: [s.price], builder: s.id, top: s.id === 'Media' })) },
  { id: 'tacos', name: 'Tacos di nori', thumb: '../assets/taco-spicy-salmone-s.webp', taco: true, items: TACOS.map((t) => ({ id: `taco-${t.id}`, n: `Taco ${t.name}`, d: t.desc, p: [t.price], img: `../assets/taco-${t.id}-s.webp`, veg: t.veg, top: t.id === 'spicy-salmone' })) },
  ...SUSHI.map((c) => ({ id: c.id, name: c.name, sub: c.sub, cols: c.cols, thumb: `../assets/cat/${c.id}.webp`, items: c.items.map((it, k) => ({ id: `${c.id}-${k}`, n: it.n, d: it.d, p: it.p, veg: it.veg, cols: c.cols, unit: c.sub ? c.sub.split(' ·')[0] : '' })) })),
];
// a few "più venduto" flags so the badge exists like on the reference site (店里可改)
const TOP = new Set(['uramaki-0', 'uramaki-4', 'nigiri-0', 'temaki-0', 'special-0', 'tartare-0']);

/* ── Categories (left column + mobile row) ── */
const catHTML = (c) => `<a class="cat" href="#cat-${c.id}" data-cat="${c.id}"><img src="${c.thumb}" alt="" width="36" height="36" loading="lazy" /><span>${c.name}</span></a>`;
$('[data-cats]').innerHTML = CATS.map(catHTML).join('');
$('[data-cats-row]').innerHTML = CATS.map(catHTML).join('');
$$('[data-cat="poke"]').forEach((a) => a.classList.add('on'));

/* ── Sections ── */
$('[data-sections]').innerHTML = CATS.map((c) => `
  <section class="section" id="cat-${c.id}" data-section="${c.id}">
    <h2>${c.name}${c.sub ? `<small>${c.sub}</small>` : ''}</h2>
    <div class="grid">${c.items.map((it) => {
      const thumb = it.img ? `<img class="dish-thumb taco" src="${it.img}" alt="" width="80" height="80" loading="lazy" />`
        : c.id === 'poke' ? `<img class="dish-thumb" src="../assets/bowl-${it.builder === 'Grande' ? 'due' : 'salmone'}.webp" alt="" width="80" height="80" loading="lazy" />`
        : `<img class="dish-thumb" src="${c.thumb}" alt="" width="80" height="80" loading="lazy" />`;
      const top = it.top || TOP.has(it.id);
      const price = it.p.length > 1 ? '' : euro(it.p[0]);
      const actions = it.builder ? `<button class="btn primary sm" type="button" data-build="${it.builder}">Componi</button>`
        : it.p.map((p, j) => `<button class="btn primary sm" type="button" data-add="${it.id}:${j}" aria-label="Aggiungi ${it.n}${it.cols ? ' ' + it.cols[j] : ''}">${it.cols ? `<small>${it.cols[j]}</small>${euro(p)}` : 'Aggiungi'}</button>`).join('');
      return `<article class="dish" data-dish="${it.id}" data-name="${(it.n + ' ' + (it.d || '')).toLowerCase()}">
        ${thumb}
        <div class="dish-body">
          ${top ? '<span class="badge">Più venduto</span>' : it.veg ? '<span class="badge veg">Vegano</span>' : ''}
          <div class="dish-name">${it.n}</div>
          ${it.d ? `<p class="dish-desc">${it.d}</p>` : ''}
          ${price ? `<div class="dish-price">${price}</div>` : ''}
          <div class="dish-actions">${actions}</div>
        </div>
      </article>`; }).join('')}</div>
  </section>`).join('');

/* ── Active category follows the scroll ── */
{
  const links = $$('[data-cat]');
  const io = new IntersectionObserver((es) => {
    const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!vis) return;
    const id = vis.target.dataset.section;
    links.forEach((a) => a.classList.toggle('on', a.dataset.cat === id));
    const row = $('[data-cats-row] .cat.on'); row?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });
  $$('[data-section]').forEach((s) => io.observe(s));
}

/* ── Search ── */
$('[data-search]').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  let shown = 0;
  $$('[data-dish]').forEach((d) => { const ok = !q || d.dataset.name.includes(q); d.classList.toggle('hide', !ok); if (ok) shown++; });
  $$('[data-section]').forEach((s) => s.hidden = !$$('[data-dish]:not(.hide)', s).length);
  $('[data-empty]').hidden = shown > 0;
});

/* ── Promo carousel ── */
{
  const slides = $$('[data-slide]'), dots = $$('[data-dot]'); let i = 0, t;
  const go = (n) => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  const arm = () => { clearInterval(t); if (!reduce) t = setInterval(() => go(i + 1), 6000); };
  dots.forEach((d) => d.onclick = () => { go(+d.dataset.dot); arm(); });
  arm();
}

/* ── Open / closed, from the real hours (11:30–23:00 every day) ── */
{
  const now = new Date(); const m = now.getHours() * 60 + now.getMinutes();
  const open = m >= 11 * 60 + 30 && m < 23 * 60;
  $('[data-status]').classList.toggle('closed', !open);
  $('[data-status-text]').textContent = open ? 'Aperto · chiude alle 23:00' : (m < 11 * 60 + 30 ? 'Al momento siamo chiusi · apriamo alle 11:30' : 'Al momento siamo chiusi · riapriamo domani alle 11:30');
}

/* ── Theme toggle (light / dark, like the reference) ── */
$('[data-theme-toggle]').onclick = (e) => { const dark = document.documentElement.classList.toggle('dark'); e.currentTarget.textContent = dark ? '🌙' : '☀️'; try { localStorage.setItem('minge-theme', dark ? 'dark' : 'light'); } catch {} };
try { if (localStorage.getItem('minge-theme') === 'dark') { document.documentElement.classList.add('dark'); $('[data-theme-toggle]').textContent = '🌙'; } } catch {}
$('[data-login]').onclick = () => say('Account in arrivo: per ora ordina su WhatsApp');

/* ── Cart ── */
let mode = 'Asporto';
const cart = []; // {key, name, detail, price, qty}
const cartCol = $('.cart-col'), scrim = $('[data-scrim]');
const openCart = () => { cartCol.classList.add('open'); scrim.classList.add('show'); };
const closeCart = () => { cartCol.classList.remove('open'); scrim.classList.remove('show'); };
$$('[data-open-cart]').forEach((b) => b.onclick = () => { if (matchMedia('(max-width: 1023px)').matches) openCart(); else $('[data-cart]').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
scrim.onclick = closeCart;
$$('[data-mode]').forEach((b) => b.onclick = () => { mode = b.dataset.mode; $$('[data-mode]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); render(); });

function whatsapp() {
  const lines = cart.map((x) => `• ${x.qty > 1 ? x.qty + '× ' : ''}${x.name}${x.detail ? ` (${x.detail})` : ''} — ${euro(x.price * x.qty)}`);
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const text = `Ciao Ming·E! Vorrei ordinare — ${mode.toUpperCase()}\n${lines.join('\n')}\nTotale: ${euro(total)}\n\nNome: \n${mode === 'Consegna' ? 'Indirizzo: \n' : 'Orario di ritiro: \n'}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
function add(item) {
  const same = cart.find((x) => x.key === item.key);
  if (same) same.qty++; else cart.push({ ...item, qty: 1 });
  render(); say(`${item.name} aggiunto`);
}
function render() {
  const n = cart.reduce((s, x) => s + x.qty, 0), total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const badge = $('[data-cart-count]'); badge.textContent = n; badge.hidden = !n;
  $('[data-cart-count-2]').textContent = n; $('[data-cart-total-2]').textContent = euro(total); $('[data-cart-bar]').hidden = !n;
  $('[data-cart-total]').textContent = euro(total);
  $('[data-cart-foot]').hidden = !n;
  const go = $('[data-checkout]'); go.href = n ? whatsapp() : '#'; go.setAttribute('aria-disabled', !n);
  $('[data-cart-items]').innerHTML = n ? cart.map((x, i) => `<div class="cart-item"><span>${x.name}</span>${x.detail ? `<small>${x.detail}</small>` : ''}<b>${euro(x.price * x.qty)}</b><span class="qty"><button type="button" data-dec="${i}" aria-label="Meno">−</button>${x.qty}<button type="button" data-inc="${i}" aria-label="Più">+</button></span></div>`).join('') : '<p class="cart-empty">Il carrello è vuoto</p>';
  $$('[data-inc]').forEach((b) => b.onclick = () => { cart[+b.dataset.inc].qty++; render(); });
  $$('[data-dec]').forEach((b) => b.onclick = () => { const x = cart[+b.dataset.dec]; if (--x.qty <= 0) cart.splice(+b.dataset.dec, 1); render(); });
}
$$('[data-add]').forEach((b) => b.onclick = () => {
  const [id, j] = b.dataset.add.split(':');
  const c = CATS.find((c) => c.items.some((it) => it.id === id)), it = c.items.find((it) => it.id === id);
  const unit = it.cols ? it.cols[+j] : it.unit;
  add({ key: `${id}:${j}`, name: `${c.id === 'tacos' || c.id === 'poke' ? '' : c.name + ' '}${it.n}${unit ? ` · ${unit}` : ''}`, price: it.p[+j] });
});
render();

/* ── Poke builder (sheet) ── */
const FILL = {}; for (const g in GROUPS) GROUPS[g].forEach((o) => FILL[o.name] = o.fill);
const dlg = $('[data-builder]');
const state = { size: SIZES[1], base: GROUPS.base[0].name, ingredienti: [], proteine: [], salse: [], topping: [] };
const STEPS = [['base', 'Base'], ['ingredienti', 'Ingredienti'], ['proteine', 'Proteine'], ['salse', 'Salse'], ['topping', 'Topping']];
$('[data-sizes]').innerHTML = SIZES.map((s) => `<button type="button" class="size" role="radio" data-size="${s.id}"><b>${s.id}</b><strong>${euro(s.price)}</strong><small>${s.limits.base} base · ${s.limits.ingredienti} ingredienti · ${s.limits.proteine} protein${s.limits.proteine > 1 ? 'e' : 'a'} · ${s.limits.salse} sals${s.limits.salse > 1 ? 'e' : 'a'} · ${s.limits.topping} topping</small></button>`).join('');
$('[data-steps]').innerHTML = STEPS.map(([g, label]) => `<div class="step" data-step="${g}"><div class="step-head"><span>${label}</span><small data-limit="${g}"></small></div><div class="chips">${GROUPS[g].map((o) => `<button type="button" class="chip" data-g="${g}" data-opt="${o.name}" style="--dot:${o.fill}" aria-pressed="false">${o.name}${o.sub ? ` <em>· ${o.sub}</em>` : ''}</button>`).join('')}</div></div>`).join('');
const over = (g) => Math.max(0, state[g].length - state.size.limits[g]);
const price = () => state.size.price + ['ingredienti', 'proteine', 'salse', 'topping'].reduce((s, g) => s + over(g) * EXTRA, 0);
function paint() {
  $$('[data-size]').forEach((b) => { const on = b.dataset.size === state.size.id; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  $$('[data-opt]').forEach((b) => { const g = b.dataset.g; const on = g === 'base' ? state.base === b.dataset.opt : state[g].includes(b.dataset.opt); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  for (const [g] of STEPS) {
    const lim = state.size.limits[g];
    $(`[data-limit="${g}"]`).textContent = g === 'base' ? '1 inclusa' : `${Math.min(state[g].length, lim)} / ${lim} inclus${lim > 1 ? 'i' : 'o'}${over(g) ? ` · +${over(g)} × ${euro(EXTRA)}` : ''}`;
  }
  $('[data-builder-title]').textContent = `Poke ${state.size.id}`;
  $('[data-summary]').textContent = [state.base, ...state.proteine, ...state.ingredienti, ...state.salse, ...state.topping].join(', ') || 'Scegli base, ingredienti, proteine, salse e topping';
  $('[data-builder-price]').textContent = euro(price());
}
$$('[data-size]').forEach((b) => b.onclick = () => { state.size = SIZES.find((s) => s.id === b.dataset.size); paint(); });
$$('[data-opt]').forEach((b) => b.onclick = () => {
  const g = b.dataset.g, v = b.dataset.opt;
  if (g === 'base') state.base = v; else { const i = state[g].indexOf(v); if (i >= 0) state[g].splice(i, 1); else state[g].push(v); }
  paint();
});
$$('[data-build]').forEach((b) => b.onclick = () => {
  state.size = SIZES.find((s) => s.id === b.dataset.build);
  state.base = GROUPS.base[0].name; state.ingredienti = []; state.proteine = []; state.salse = []; state.topping = [];
  paint(); dlg.showModal();
});
$('[data-close-builder]').onclick = () => dlg.close();
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('[data-add-custom]').onclick = () => {
  if (!state.proteine.length) { say('Scegli almeno una proteina'); return; }
  const detail = [state.base, ...state.proteine, ...state.ingredienti, ...state.salse, ...state.topping].join(', ');
  add({ key: `poke:${state.size.id}:${detail}`, name: `Poke ${state.size.id}`, detail, price: price() });
  dlg.close();
};
