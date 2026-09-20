/* Mumi Sushi · Yoru — rain canvas, signs that drift with the pointer, the vending machine + ticket cart, the hours strip. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

/* rain: thin streaks falling on a fixed canvas, sized to the viewport, paused when hidden */
{
  const c = $('[data-rain]'), ctx = c.getContext('2d'); let drops = [], W = 0, H = 0;
  const size = () => { W = c.width = innerWidth; H = c.height = innerHeight; drops = Array.from({ length: Math.round(W / 9) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 10 + Math.random() * 18, v: 6 + Math.random() * 8 })); };
  size(); addEventListener('resize', size);
  if (!reduce) (function frame() { if (!document.hidden) { ctx.clearRect(0, 0, W, H); ctx.strokeStyle = '#a9c8ff33'; ctx.lineWidth = 1; ctx.beginPath(); for (const d of drops) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 1.5, d.y + d.l); d.y += d.v; d.x -= .3; if (d.y > H) { d.y = -20; d.x = Math.random() * W; } } ctx.stroke(); } requestAnimationFrame(frame); })();
}
/* the signs hang at depths: the pointer moves them by depth × 6px */
{
  const alley = $('[data-alley]'), signs = $$('[data-depth]');
  if (!reduce && matchMedia('(pointer: fine)').matches) alley.addEventListener('pointermove', (e) => { const r = alley.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; signs.forEach((s) => { const d = +s.dataset.depth; s.style.transform = `translate(${(-nx * d * 6).toFixed(1)}px, ${(-ny * d * 4).toFixed(1)}px)`; }); });
}

/* the vending machine */
const KEYS = [
  ['nigiri-salmone', 'Nigiri salmone', '2 pz', 3.5, 'nigiri'], ['nigiri-tonno', 'Nigiri tonno', '2 pz', 4.5, 'nigiri'], ['nigiri-gambero-rosso', 'Nigiri gambero rosso', '2 pz · Mazara', 5, 'nigiri'], ['nigiri-anguilla', 'Nigiri anguilla', '2 pz', 5, 'nigiri'], ['nigiri-tartufo', 'Nigiri al tartufo', '4 pz', 8, 'nigiri'], ['nigiri-misto', 'Nigiri misto', '10 pz', 13, 'nigiri'],
  ['ura-salmone', 'Ura salmone', '8 pz', 9, 'maki'], ['dragon-maki', 'Dragon maki', '8 pz · anguilla', 13, 'maki'], ['rainbow-maki-8-pz', 'Rainbow maki', '8 pz', 13, 'maki'], ['tiger-maki-8-pz', 'Tiger maki', '8 pz · tempura', 13, 'maki'], ['ura-crispy-tuna-8-pz', 'Ura crispy tuna', '8 pz', 11, 'maki'], ['hoso-cetriolo', 'Hoso cetriolo', '8 pz', 4, 'maki'],
  ['sashimi-salmone', 'Sashimi salmone', '10 fette', 12, 'crudo'], ['sashimi-tonno-10-pz', 'Sashimi tonno', '10 fette', 15, 'crudo'], ['tartare-tonno', 'Tartare di tonno', 'tobiko, sesamo', 10, 'crudo'], ['gunkan-ikura', 'Gunkan ikura', '2 pz', 6, 'crudo'], ['gunkan-misto-6-pz', 'Gunkan misto', '6 pz', 15, 'crudo', true],
  ['ramen-gamberi', 'Ramen di gamberi', 'dopo mezzanotte', 13, 'caldo'], ['gyoza', 'Gyoza', '3 pz', 3.5, 'caldo'], ['ebi-kataifi', 'Ebi kataifi', 'gamberi croccanti', 6, 'caldo'], ['miso', 'Zuppa di miso', '', 2.5, 'caldo'], ['edamame', 'Edamame', 'sale nero', 4, 'caldo'],
  ['mochi', 'Mochi', 'gusto a scelta', 2, 'bere'], ['dorayaki', 'Dorayaki', 'cioccolato', 3.5, 'bere'],
];
const DRINKS = [['Sapporo 50 cl', 4], ['Asahi 50 cl', 4], ['Sake caldo 18 cl', 6], ['Tè verde', 2]];
const vending = $('[data-vending]');
vending.innerHTML = KEYS.map(([f, n, d, p, c, sold], i) => `<button class="key ${sold ? 'sold' : ''}" type="button" data-i="${i}" data-category="${c}" ${sold ? 'disabled' : ''}><span class="led"></span><span class="ph"><img src="../assets/${f}.webp" alt="" loading="lazy" width="200" height="200" /></span><span><h3>${n}</h3>${d ? `<small>${d}</small>` : ''}<span class="price">${euro(p)}</span></span></button>`).join('')
  + DRINKS.map(([n, p], i) => `<button class="key" type="button" data-drink="${i}" data-category="bere"><span class="led"></span><span class="ph" style="display:grid;place-items:center;font-family:var(--display);font-size:26px;color:var(--yellow)">酒</span><span><h3>${n}</h3><small>alla spina · freddo</small><span class="price">${euro(p)}</span></span></button>`).join('');
$$('.chip').forEach((b) => b.onclick = () => { $$('.chip').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const f = b.dataset.filter; $$('.key').forEach((k) => k.classList.toggle('hide', f !== 'tutti' && k.dataset.category !== f)); });

/* the ticket */
const cart = $('[data-cart]'), scrim = $('[data-scrim]'), list = $('[data-cart-list]'), empty = $('[data-cart-empty]'), total = $('[data-cart-total]'), count = $('[data-cart-count]'), toast = $('[data-toast]');
const lines = new Map();
const nameOf = (k) => k.dataset.drink !== undefined ? DRINKS[+k.dataset.drink] : [KEYS[+k.dataset.i][1], KEYS[+k.dataset.i][3]];
function paint() {
  list.innerHTML = [...lines.entries()].map(([id, l]) => `<li data-id="${id}"><span>${l.name}</span><span class="q"><button type="button" data-dec aria-label="Meno">−</button><b>${l.q}</b><button type="button" data-inc aria-label="Più">+</button></span><span>${euro(l.q * l.price)}</span></li>`).join('');
  const n = [...lines.values()].reduce((a, l) => a + l.q, 0);
  empty.classList.toggle('hide', n > 0); count.textContent = n; total.textContent = euro([...lines.values()].reduce((a, l) => a + l.q * l.price, 0));
  $$('.key').forEach((k) => k.classList.toggle('lit', lines.has(k.dataset.i !== undefined ? 'k' + k.dataset.i : 'd' + k.dataset.drink)));
}
vending.addEventListener('click', (e) => { const k = e.target.closest('.key'); if (!k || k.disabled) return; const id = k.dataset.i !== undefined ? 'k' + k.dataset.i : 'd' + k.dataset.drink; const [name, price] = nameOf(k); const l = lines.get(id) || { name, price, q: 0 }; l.q++; lines.set(id, l); paint(); });
list.addEventListener('click', (e) => { const li = e.target.closest('li'); if (!li) return; const l = lines.get(li.dataset.id); if (e.target.closest('[data-inc]')) l.q++; if (e.target.closest('[data-dec]')) { l.q--; if (l.q <= 0) lines.delete(li.dataset.id); } paint(); });
const openCart = () => { cart.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); }, closeCart = () => { cart.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart); $('[data-close-cart]').onclick = closeCart; scrim.onclick = closeCart;
$('[data-checkout]').onclick = () => { if (!lines.size) { openCart(); return; } closeCart(); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); lines.clear(); paint(); };

/* hours strip */
{
  const strip = $('[data-strip]'), h = new Date().getHours();
  strip.innerHTML = Array.from({ length: 24 }, (_, i) => { const on = (i >= 12 && i < 15) || (i >= 18 && i < 24) || i < 2; const late = i >= 22 || i < 2; return `<i class="${on ? 'on' : ''} ${late && on ? 'late' : ''} ${i === h ? 'now' : ''}">${String(i).padStart(2, '0')}</i>`; }).join('');
}
/* ticker */
$('[data-ticker]').innerHTML = ['Ultimo giro di sashimi alle 02:00', 'Ramen dopo mezzanotte', 'Sapporo alla spina', 'Lunedì chiusi', 'Nigiri gambero rosso di Mazara', 'Biglietto alla macchina, pesce al banco'].concat(['Ultimo giro di sashimi alle 02:00', 'Ramen dopo mezzanotte', 'Sapporo alla spina', 'Lunedì chiusi', 'Nigiri gambero rosso di Mazara', 'Biglietto alla macchina, pesce al banco']).map((t) => `<span>${t} ✦</span>`).join('');

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }
paint();
