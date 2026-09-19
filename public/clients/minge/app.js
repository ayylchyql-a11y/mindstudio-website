const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

/* ═══════════════════════════════════════════════════════════════════════
   DATI — tutto quello che il locale può voler cambiare sta qui in alto.
   Prezzi in euro. `da_confermare` segnala i valori non ancora verificati
   con il menu cartaceo (vedi nota di consegna).
   ═══════════════════════════════════════════════════════════════════════ */
const WHATSAPP = '393513328109';

const TACOS = [
  { id: 'spicy-salmone', name: 'Spicy salmone', desc: 'Salmone, tabasco, maionese, sesamo', price: 4.5, tag: 'Più ordinato' },
  { id: 'salmone', name: 'Salmone', desc: 'Salmone, philadelphia, tobiko, sesamo', price: 4.5 },
  { id: 'spicy-tonno', name: 'Spicy tonno', desc: 'Tonno, tabasco, maionese, tobiko', price: 5 },
  { id: 'salmone-cotto', name: 'Salmone cotto', desc: 'Salmone scottato, philadelphia, salsa teriyaki', price: 4.5 },
  { id: 'pollo-piccante', name: 'Pollo piccante', desc: 'Pollo croccante, spicy mayo, cipolla croccante', price: 4.5 },
  { id: 'vegan', name: 'Vegan', desc: 'Avocado, cetriolo, insalata, sesamo', price: 4, tag: 'Vegano', veg: true },
]; // prezzi tacos: da_confermare

// Formati bowl: quanti pezzi di ogni gruppo sono inclusi nel prezzo.
const SIZES = [
  { id: 'Piccola', price: 8.9, limits: { base: 1, ingredienti: 3, proteine: 1, salse: 1, topping: 1 } },   // da_confermare
  { id: 'Media', price: 10.9, limits: { base: 1, ingredienti: 4, proteine: 2, salse: 2, topping: 1 } },   // dal menu cartaceo
  { id: 'Grande', price: 12.9, limits: { base: 1, ingredienti: 5, proteine: 3, salse: 3, topping: 2 } },  // da_confermare
];
const EXTRA = 1; // ogni aggiunta oltre gli inclusi

const GROUPS = {
  base: [
    { name: 'Riso bianco', fill: '#f7f2e8' }, { name: 'Riso venere', fill: '#3a2b31' }, { name: 'Insalata', fill: '#bcd98d' }, { name: 'Riso + insalata', fill: '#dfe3b8' },
  ],
  ingredienti: [
    { name: 'Avocado', fill: '#8cc06f' }, { name: 'Edamame', fill: '#6fae5c' }, { name: 'Cetriolo', fill: '#bfe08a' }, { name: 'Carote', fill: '#f39a3b' },
    { name: 'Mango', fill: '#ffbe3d' }, { name: 'Pomodorini', fill: '#e8503c' }, { name: 'Mais', fill: '#f5d34f' }, { name: 'Cavolo viola', fill: '#7a4c8c' },
    { name: 'Alga wakame', fill: '#1f6f5f' }, { name: 'Ananas', fill: '#f7d96b' }, { name: 'Zenzero', fill: '#f3a6c1' }, { name: 'Cipolla rossa', fill: '#b25b8a' },
  ],
  proteine: [
    { name: 'Salmone', sub: 'Crudo, a cubetti', fill: '#ff7a59', h: 14 },
    { name: 'Tonno', sub: 'Crudo, a cubetti', fill: '#e04b5a', h: 352 },
    { name: 'Gambero cotto', sub: 'Al vapore', fill: '#ffa07a', h: 24 },
    { name: 'Surimi', sub: 'Polpa di granchio', fill: '#f4b7b0', h: 6 },
    { name: 'Salmone scottato', sub: 'Con salsa teriyaki', fill: '#d9784f', h: 20 },
    { name: 'Pollo', sub: 'Croccante o teriyaki', fill: '#c98a52', h: 34 },
    { name: 'Tofu', sub: 'Al sesamo · vegano', fill: '#f0d58c', h: 48 },
  ],
  salse: [
    { name: 'Soia', fill: '#5a3a22' }, { name: 'Teriyaki', fill: '#7a4a2a' }, { name: 'Spicy mayo', fill: '#ff9a6e' }, { name: 'Maionese', fill: '#f4ecc8' },
    { name: 'Salsa mango', fill: '#ffc24a' }, { name: 'Ponzu', fill: '#c9a34a' }, { name: 'Yogurt', fill: '#f7f4ec' },
  ],
  topping: [
    { name: 'Sesamo', fill: '#e9dcc3' }, { name: 'Cipolla croccante', fill: '#c9975a' }, { name: 'Semi misti', fill: '#8b7a55' }, { name: 'Tobiko', fill: '#ff8c2a' },
    { name: 'Kataifi', fill: '#e2b96f' }, { name: 'Mandorle', fill: '#d9c39a' },
  ],
};

// Menu sushi — trascritto dal menu cartaceo. `cols` = intestazioni dei prezzi multipli.
const SUSHI = [
  { id: 'tartare', name: 'Tartare', items: [
    { n: 'Tartare salmone', d: 'Salmone, avocado, sesamo e salsa ponzu', p: [6] },
    { n: 'Tartare tonno', d: 'Tonno, avocado, sesamo e salsa ponzu', p: [7] },
    { n: 'Tartare mango', d: 'Riso bianco, salmone, mango, salsa mango e kataifi', p: [6] },
    { n: 'Goma wakame', d: 'Alghe giapponesi piccanti', p: [3.5] },
    { n: 'Riso bianco', d: 'Riso di sushi', p: [2] },
  ] },
  { id: 'nigiri', name: 'Nigiri', cols: ['2 pz', '6 pz'], items: [
    { n: 'Salmone', p: [3, 8] }, { n: 'Tonno', p: [3, 8] }, { n: 'Surimi', p: [3, 8] }, { n: 'Gambero cotto', p: [3, 8] },
    { n: 'Sake special', d: 'Salmone scottato, maionese, salsa teriyaki e cipolla croccante', p: [3.5, 9] },
    { n: 'Sake crispy', d: 'Salmone scottato, spicy maionese, philadelphia, salsa teriyaki e cipolla croccante', p: [4, 10] },
    { n: 'Tuna special', d: 'Tonno scottato, philadelphia, salsa teriyaki e pistacchio', p: [3.5, 9] },
    { n: 'Sake mango', d: 'Salmone, philadelphia, mango e salsa mango', p: [3.5, 9] },
  ] },
  { id: 'sashimi', name: 'Sashimi', cols: ['5 pz'], items: [
    { n: 'Salmone', p: [6] }, { n: 'Tonno', p: [7] },
  ] },
  { id: 'gunkan', name: 'Gunkan', sub: '2 pz', items: [
    { n: 'Tobiko', d: 'Uova di pesce', p: [3.5] }, { n: 'Wakame', d: 'Alghe wakame', p: [3.5] },
    { n: 'Flambé', d: 'Salmone, spicy maionese', p: [4] }, { n: 'Gio phila out', d: 'Salmone e philadelphia', p: [4] },
    { n: 'Gio mango out', d: 'Salmone, philadelphia, mango e salsa mango', p: [4.5] },
    { n: 'Gio spicy sake', d: 'Salmone, tabasco, maionese e tobiko', p: [4] },
    { n: 'Gio spicy tuna', d: 'Tonno, tabasco, maionese e tobiko', p: [4.5] },
  ] },
  { id: 'temaki', name: 'Temaki', cols: ['1 pz', '2 pz'], items: [
    { n: 'Salmone', d: 'Salmone, avocado, philadelphia e sesamo', p: [3.5, 6.5] },
    { n: 'Tonno', d: 'Tonno, avocado, maionese e sesamo', p: [4, 7.5] },
    { n: 'California', d: 'Surimi di granchio, avocado, maionese, sesamo', p: [3.5, 6.5] },
    { n: 'Vegan', d: 'Cetriolo, avocado e sesamo', p: [3, 5.5], veg: true },
    { n: 'Ebi', d: 'Gambero cotto, avocado, maionese e sesamo', p: [3.5, 6.5] },
    { n: 'Ebiten', d: 'Gambero fritti, insalata, maionese, salsa teriyaki e kataifi', p: [3.5, 6.5] },
    { n: 'Spicy sake', d: 'Salmone, tabasco, maionese e tobiko', p: [4, 7] },
    { n: 'Spicy tonno', d: 'Tonno, tabasco, maionese e tobiko', p: [4.5, 8] },
  ] },
  { id: 'hosomaki', name: 'Hosomaki', sub: '8 pz', items: [
    { n: 'Salmone', p: [4] }, { n: 'Tonno', p: [4.5] }, { n: 'Avocado', p: [3.5], veg: true }, { n: 'Cetriolo', p: [3.5], veg: true },
    { n: 'Gambero cotto', p: [4] }, { n: 'Surimi di granchio', p: [4] },
    { n: 'Ebiten', d: 'Gambero fritti, maionese, salsa teriyaki e kataifi', p: [5] },
  ] },
  { id: 'uramaki', name: 'Uramaki', sub: '8 pz · riso bianco o venere', items: [
    { n: 'Salmone', d: 'Salmone, avocado e philadelphia', p: [8] },
    { n: 'Tonno', d: 'Tonno, avocado e maionese', p: [9] },
    { n: 'California', d: 'Surimi di granchio, avocado e maionese', p: [7.5] },
    { n: 'Gambero cotto', d: 'Gambero cotto, avocado e maionese', p: [7.5] },
    { n: 'Spicy salmone', d: 'Salmone, tabasco, tobiko e spicy maionese', p: [9] },
    { n: 'Spicy tonno', d: 'Tonno, tabasco, tobiko e spicy maionese', p: [9.5] },
    { n: 'Ebiten', d: 'Gambero fritti, maionese, salsa teriyaki e kataifi', p: [8.5] },
    { n: 'Miura', d: 'Salmone cotto, philadelphia, kataifi e salsa teriyaki', p: [8.5] },
    { n: 'Spicy chicken', d: 'Pollo piccante, cetriolo, spicy maionese, teriyaki e cipolla croccante', p: [8.5] },
    { n: 'Avocado', d: 'Avocado', p: [7], veg: true },
    { n: 'Crispy ebiten', d: 'Gambero fritti, spicy maionese, salsa teriyaki e cipolla croccante', p: [8.5] },
  ] },
  { id: 'special', name: 'Uramaki special', sub: '8 pz', items: [
    { n: 'Sake mango', d: 'Salmone e avocado con sopra philadelphia, mango e salsa mango', p: [10] },
    { n: 'Tiger roll', d: 'Gambero fritti, cetriolo, maionese con sopra salmone, salsa teriyaki e pistacchio', p: [10] },
    { n: 'Fresh sake', d: 'Salmone, avocado, philadelphia', p: [10] },
    { n: 'Red dragon', d: 'Gambero fritti, cetriolo, avocado con sopra tonno, salsa teriyaki e pistacchio', p: [10.5] },
    { n: 'Cheese roll', d: 'Gambero fritti, cetriolo con sopra cheddar, salsa teriyaki e cipolla croccante', p: [10] },
    { n: 'Rainbow roll', d: 'Surimi di granchio, avocado con sopra pesce misto e salsa teriyaki', p: [10] },
    { n: 'Green dragon', d: 'Gambero fritti, cetriolo, maionese con sopra avocado, salsa teriyaki e kataifi', p: [10] },
    { n: 'Wakame roll', d: 'Gambero cotto, avocado, maionese con sopra wakame e salsa teriyaki', p: [10] },
    { n: 'Flambé roll', d: 'Gambero fritti, cetriolo con sopra salmone scottato, philadelphia e salsa teriyaki', p: [10] },
    { n: 'Tuna special', d: 'Tonno, avocado con sopra tonno, maionese, salsa teriyaki e tobiko', p: [11] },
  ] },
  { id: 'futomaki', name: 'Futomaki', cols: ['5 pz', '10 pz'], items: [
    { n: 'Salmone', d: 'Salmone, avocado, philadelphia e salsa teriyaki', p: [5, 10] },
    { n: 'Gambero fritti', d: 'Gambero fritti, avocado, maionese, salsa teriyaki e kataifi', p: [5.5, 10] },
    { n: 'Misto', d: 'Pesce misto, avocado e salsa teriyaki', p: [6, 11] },
    { n: 'Vegan', d: 'Avocado, cetriolo e insalata, maionese vegana', p: [4.5, 8], veg: true },
    { n: 'California', d: 'Surimi di granchio, avocado, maionese e salsa teriyaki', p: [5, 9] },
  ] },
];

/* ═══════════════════════════════════════════════════════════════════════ */

/* ── Header / mode / mobile nav ── */
const header = $('[data-header]');
addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 65), { passive: true });

let mode = 'Asporto';
const setMode = (value) => {
  mode = value;
  $$('[data-mode]').forEach((b) => { const on = b.dataset.mode === value; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  $('[data-mode-label]').textContent = value;
  $('[data-cart-mode]').textContent = value;
  $('[data-mode-note]').textContent = value === 'Asporto' ? 'Pronto in 15 min al banco' : 'A La Spezia · tempi e costo su WhatsApp';
};
$$('[data-mode]').forEach((b) => b.onclick = () => setMode(b.dataset.mode));
$('[data-change-mode]').onclick = () => setMode(mode === 'Asporto' ? 'Consegna' : 'Asporto');

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

/* ── Order (cart → WhatsApp) ── */
const drawer = $('[data-cart]'), scrim = $('[data-scrim]'), toast = $('[data-toast]');
let cart = [];
const say = (text) => {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
};
function whatsappLink() {
  const lines = cart.map((x) => `• ${x.name}${x.detail ? ` (${x.detail})` : ''} — ${euro(x.price)}`);
  const total = cart.reduce((s, x) => s + x.price, 0);
  const text = `Ciao Ming·E! Vorrei ordinare — ${mode.toUpperCase()}\n${lines.join('\n')}\nTotale: ${euro(total)}\n\nNome: \n${mode === 'Consegna' ? 'Indirizzo: \n' : 'Orario di ritiro: \n'}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
function render() {
  const count = cart.length, total = cart.reduce((s, x) => s + x.price, 0);
  $('[data-cart-count]').textContent = count;
  $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Apri il tuo ordine, ${count} articoli`));
  $('[data-cart-total]').textContent = euro(total);
  const go = $('[data-checkout]');
  go.setAttribute('aria-disabled', !count);
  go.href = count ? whatsappLink() : '#';
  $('[data-cart-items]').innerHTML = count
    ? cart.map((x, i) => `<div class="cart-item"><span>${x.name}${x.detail ? `<small>${x.detail}</small>` : ''}</span><b>${euro(x.price)}</b><button aria-label="Rimuovi ${x.name}" data-remove="${i}">×</button></div>`).join('')
    : '<div class="empty"><span>◯</span><h3>L\'ordine è ancora vuoto</h3><p>Aggiungi un taco, una bowl o qualche pezzo di sushi.</p></div>';
  $$('[data-remove]').forEach((b) => b.onclick = () => { cart.splice(+b.dataset.remove, 1); render(); });
}
const add = (item, msg = 'Aggiunto all\'ordine') => { cart.push(item); render(); say(msg); };
const openCart = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); document.body.classList.add('lock'); };
const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); document.body.classList.remove('lock'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart);
$('[data-close-cart]').onclick = closeCart;
scrim.onclick = closeCart;
$('[data-checkout]').onclick = (e) => { if (!cart.length) e.preventDefault(); else e.currentTarget.href = whatsappLink(); };
$('[data-privacy]').onclick = (e) => { e.preventDefault(); say('Informativa privacy in arrivo'); };

/* ── Tacos: stack of cut-out photos driven by the name list, and by a slow clock ── */
{
  const stack = $('[data-taco-stack]'), list = $('[data-taco-names]');
  stack.innerHTML = TACOS.map((t, i) => `<img src="./assets/taco-${t.id}.webp" alt="Taco di alga nori: ${t.name}, ${t.desc.toLowerCase()}" data-taco="${t.id}" width="1400" height="1050" ${i ? 'loading="lazy"' : ''} />`).join('');
  list.innerHTML = TACOS.map((t) => `
    <li data-pick="${t.id}">
      <div class="taco-row"><span>${t.name}</span><b>${euro(t.price)}</b></div>
      <small>${t.desc}${t.tag ? ` · <i class="${t.veg ? 'veg' : ''}">${t.tag}</i>` : ''}</small>
      <button type="button" data-add-taco="${t.id}" aria-label="Aggiungi taco ${t.name}">Aggiungi <span>＋</span></button>
    </li>`).join('');
  const imgs = $$('[data-taco]'), names = $$('[data-pick]');
  let cur = 0, timer;
  const show = (i) => {
    cur = (i + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('on', k === cur));
    names.forEach((li, k) => li.classList.toggle('on', k === cur));
  };
  const arm = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(cur + 1), 3600); };
  names.forEach((li, i) => {
    li.addEventListener('pointerenter', () => { show(i); arm(); });
    li.addEventListener('click', () => { show(i); arm(); });
  });
  show(0);
  // only tick while the section is on screen
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? arm() : clearInterval(timer)), { threshold: .2 });
  io.observe(stack);
  $$('[data-add-taco]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const t = TACOS.find((x) => x.id === b.dataset.addTaco); add({ name: `Taco ${t.name}`, price: t.price }); });
}

/* ── Bowl illustration ──
   One drawing routine for the builder preview. Colours come from the
   option data, so the picture and the option list can never disagree. */
const FILL = {};
for (const g in GROUPS) GROUPS[g].forEach((o) => FILL[o.name] = o.fill);
const CUBES = [[104, 118, -8], [140, 104, 6], [118, 154, 12], [152, 140, -4], [96, 160, 4], [134, 176, -10]];
const SLOTS = [[236, 104], [256, 160], [232, 214], [170, 236], [108, 226], [88, 92], [166, 84], [204, 190]];
const SEEDS = [[92, 70], [150, 62], [210, 78], [248, 120], [252, 200], [200, 244], [130, 250], [78, 210], [70, 140]];

function drawBowl(svg, r) {
  const el = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  svg.replaceChildren();
  svg.append(
    el('circle', { cx: 160, cy: 160, r: 152, fill: '#fff' }),
    el('circle', { cx: 160, cy: 160, r: 146, fill: 'none', stroke: 'rgba(29,37,26,.12)' }),
    el('circle', { cx: 160, cy: 160, r: 128, fill: FILL[r.base] || '#f7f2e8' }),
    el('circle', { cx: 160, cy: 160, r: 128, fill: 'none', stroke: 'rgba(29,37,26,.08)', 'stroke-width': 6 })
  );
  const dark = r.base === 'Riso venere';
  SEEDS.forEach(([x, y]) => svg.append(el('circle', { cx: x, cy: y, r: 3, fill: dark ? 'rgba(255,255,255,.18)' : 'rgba(29,37,26,.08)' })));
  // proteins share the cube slots: two proteins → three cubes each
  const prots = r.proteine.length ? r.proteine : [];
  CUBES.forEach(([x, y, a], i) => {
    if (!prots.length) return;
    const pf = FILL[prots[i % prots.length]] || '#ff7a59';
    svg.append(
      el('rect', { x, y, width: 34, height: 34, rx: 8, fill: pf, transform: `rotate(${a} ${x + 17} ${y + 17})` }),
      el('rect', { x: x + 6, y: y + 5, width: 14, height: 6, rx: 3, fill: 'rgba(255,255,255,.45)', transform: `rotate(${a} ${x + 17} ${y + 17})` })
    );
  });
  r.ingredienti.forEach((t, i) => {
    const [x, y] = SLOTS[i % SLOTS.length];
    const f = FILL[t] || '#8cc06f';
    [[0, 0, 12], [15, -11, 9], [-9, 14, 9]].forEach(([dx, dy, rr]) => svg.append(el('circle', { cx: x + dx, cy: y + dy, r: rr, fill: f, stroke: 'rgba(29,37,26,.12)' })));
  });
  r.salse.forEach((s, i) => {
    const sf = FILL[s] || '#5a3a22';
    const d = i === 0 ? 'M78 150 C110 120, 130 190, 165 160 S215 130, 244 168' : i === 1 ? 'M96 196 C130 176, 150 214, 190 196 S230 178, 232 206' : 'M90 110 C120 96, 150 130, 190 112 S230 96, 240 120';
    svg.append(el('path', { d, fill: 'none', stroke: sf, 'stroke-width': i ? 4 : 6, 'stroke-linecap': 'round', opacity: i ? .6 : .85 }));
  });
  r.topping.forEach((t, k) => {
    const f = FILL[t] || '#e9dcc3';
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39996 + k, d = 40 + (i * 37 + k * 11) % 80; // golden-angle scatter, deterministic
      const cx = 160 + Math.cos(a) * d, cy = 160 + Math.sin(a) * d;
      svg.append(el('ellipse', { cx, cy, rx: 2.6, ry: 1.6, fill: f, stroke: 'rgba(29,37,26,.25)', 'stroke-width': .5, transform: `rotate(${(i * 47) % 180} ${cx} ${cy})` }));
    }
  });
}

/* ── Builder ── */
// a suggested bowl to start from, so the preview is never an empty disc
const state = { size: SIZES[1], base: GROUPS.base[0].name, ingredienti: ['Avocado', 'Edamame', 'Mango', 'Cetriolo'], proteine: ['Salmone'], salse: ['Soia'], topping: ['Sesamo'] };
const builder = $('.builder');
const setHue = (h) => builder.style.setProperty('--h', h);

$('[data-sizes]').innerHTML = SIZES.map((s) => `
  <button type="button" class="size${s === state.size ? ' on' : ''}" role="radio" aria-checked="${s === state.size}" data-size="${s.id}">
    <b>${s.id}</b><strong>${euro(s.price)}</strong>
    <small>${s.limits.base} base · ${s.limits.ingredienti} ingredienti · ${s.limits.proteine} protein${s.limits.proteine > 1 ? 'e' : 'a'} · ${s.limits.salse} sals${s.limits.salse > 1 ? 'e' : 'a'} · ${s.limits.topping} topping</small>
  </button>`).join('');
$$('[data-size]').forEach((b) => b.onclick = () => {
  $$('[data-size]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
  state.size = SIZES.find((s) => s.id === b.dataset.size);
  update();
});

for (const g of ['base', 'ingredienti', 'salse', 'topping']) {
  const box = $(`[data-group="${g}"]`);
  box.innerHTML = GROUPS[g].map((o) => `<button type="button" class="chip" data-opt="${o.name}" style="--dot:${o.fill}" aria-pressed="false">${o.name}</button>`).join('');
  $$('[data-opt]', box).forEach((b) => b.onclick = () => {
    const v = b.dataset.opt;
    if (g === 'base') { state.base = v; $$('[data-opt]', box).forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); }
    else { const i = state[g].indexOf(v); if (i >= 0) state[g].splice(i, 1); else state[g].push(v); const on = i < 0; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
    update();
  });
  $$('[data-opt]', box).forEach((b) => { const on = g === 'base' ? b.dataset.opt === state.base : state[g].includes(b.dataset.opt); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}

// Protein rows: hovering previews the hue, choosing commits it (multi-select).
const plist = $('[data-group="proteine"]');
plist.innerHTML = GROUPS.proteine.map((p) => `<li class="row" tabindex="0" role="checkbox" aria-checked="false" data-protein="${p.name}" data-h="${p.h}"><span>${p.name}</span><small>${p.sub}</small><em>incluso</em></li>`).join('');
const rows = $$('[data-protein]');
rows.forEach((r) => { const on = state.proteine.includes(r.dataset.protein); r.classList.toggle('on', on); r.setAttribute('aria-checked', on); });
// before the first choice the first screen stays in brand green; afterwards the ambience follows the chosen protein
let touched = false;
const restHue = () => { const on = touched && rows.find((r) => r.classList.contains('on')); setHue(on ? on.dataset.h : 92); };
const choose = (row) => {
  touched = true;
  const v = row.dataset.protein, i = state.proteine.indexOf(v);
  if (i >= 0) state.proteine.splice(i, 1); else state.proteine.push(v);
  const on = i < 0; row.classList.toggle('on', on); row.setAttribute('aria-checked', on);
  restHue(); update();
};
rows.forEach((row) => {
  row.addEventListener('pointerenter', () => setHue(row.dataset.h));
  row.addEventListener('focus', () => setHue(row.dataset.h));
  row.addEventListener('click', () => choose(row));
  row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(row); } });
});
plist.addEventListener('pointerleave', restHue);
restHue();

const over = (g) => Math.max(0, state[g].length - state.size.limits[g]);
function price() { return state.size.price + ['ingredienti', 'proteine', 'salse', 'topping'].reduce((s, g) => s + over(g) * EXTRA, 0); }
function update() {
  for (const g of ['ingredienti', 'proteine', 'salse', 'topping']) {
    const lim = state.size.limits[g], n = state[g].length, x = over(g);
    $(`[data-limit="${g}"]`).textContent = `${Math.min(n, lim)} / ${lim} inclus${lim > 1 ? 'i' : 'o'}${x ? ` · +${x} extra` : ''}`;
  }
  $('[data-limit="base"]').textContent = '1 inclusa';
  const parts = [state.size.id, state.base, ...state.proteine, ...state.ingredienti, ...state.salse, ...state.topping];
  $('[data-summary]').textContent = parts.join(' · ');
  $('[data-builder-price]').textContent = euro(price());
  $$('.row em').forEach((em, i) => {
    const n = state.proteine.indexOf(rows[i].dataset.protein);
    em.textContent = n >= state.size.limits.proteine ? `+ ${euro(EXTRA)}` : 'incluso';
  });
  drawBowl($('[data-bowl="builder"]'), state);
}
$('[data-add-custom]').onclick = () => {
  add({ name: `Poke ${state.size.id.toLowerCase()}`, detail: [state.base, ...state.proteine, ...state.ingredienti, ...state.salse, ...state.topping].join(', '), price: price() }, 'La tua bowl è nell\'ordine');
};
update();

/* ── Sushi menu ── */
{
  const tabs = $('[data-tabs]'), panels = $('[data-panels]');
  tabs.innerHTML = SUSHI.map((c, i) => `<button type="button" class="tab" role="tab" id="tab-${c.id}" aria-selected="${i === 0}" aria-controls="panel-${c.id}" data-tab="${c.id}">${c.name}</button>`).join('');
  panels.innerHTML = SUSHI.map((c, i) => `
    <div class="menu-panel${i === 0 ? ' on' : ''}" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" data-panel="${c.id}">
      <div class="panel-head"><h3>${c.name}${c.sub ? `<small>${c.sub}</small>` : ''}</h3>${c.cols ? `<p class="panel-cols">${c.cols.join(' · ')}</p>` : ''}</div>
      <ul class="menu-list">${c.items.map((it, k) => `
        <li class="menu-row"><div><h4>${it.n}${it.veg ? ' <span aria-label="vegano">🌱</span>' : ''}</h4>${it.d ? `<p>${it.d}</p>` : ''}</div>
        <div class="prices">${it.p.map((p, j) => `<button type="button" data-add-sushi="${c.id}:${k}:${j}" aria-label="Aggiungi ${it.n}${c.cols ? ' ' + c.cols[j] : ''}">${c.cols ? `<small>${c.cols[j]}</small>` : ''}${euro(p)}</button>`).join('')}</div></li>`).join('')}
      </ul>
    </div>`).join('');
  $$('[data-tab]').forEach((t) => t.onclick = () => {
    $$('[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === t));
    $$('[data-panel]').forEach((p) => p.classList.toggle('on', p.dataset.panel === t.dataset.tab));
  });
  $$('[data-add-sushi]').forEach((b) => b.onclick = () => {
    const [cid, k, j] = b.dataset.addSushi.split(':'); const c = SUSHI.find((x) => x.id === cid), it = c.items[+k];
    add({ name: `${it.n.toLowerCase().startsWith(c.name.toLowerCase()) ? it.n : `${c.name} ${it.n}`}${c.cols ? ` · ${c.cols[+j]}` : c.sub ? ` · ${c.sub.split(' ·')[0]}` : ''}`, price: it.p[+j] });
  });
}

render();

/* ── Staggered character reveal ── */
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

/* ── Manifesto: words brighten as the sticky stage is scrolled through ── */
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
  const upd = () => {
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
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
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
