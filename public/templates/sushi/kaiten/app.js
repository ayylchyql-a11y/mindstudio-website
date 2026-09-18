const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

/* ── Header / nav / reveal ── */
const header = $('[data-header]');
addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 65), { passive: true });
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); navBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu'); nav.classList.toggle('open', open); nav.setAttribute('aria-hidden', !open); document.body.classList.toggle('lock', open); };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());
const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .08 }); items.forEach((x) => io.observe(x)); }

/* ── The belt: one track, duplicated, so the loop seam is invisible ── */
{
  const track = $('[data-belt]');
  const plates = [['#3b9d6e', 'hoso-cetriolo'], ['#2f6fb3', 'nigiri-salmone'], ['#c93b3b', 'nigiri-tonno'], ['#3b9d6e', 'edamame'], ['#c9922e', 'nigiri-gambero-rosso'], ['#2f6fb3', 'ura-salmone'], ['#3b9d6e', 'gyoza'], ['#c93b3b', 'special-salmon-maki'], ['#2f6fb3', 'gambero-cotto'], ['#c9922e', 'nigiri-anguilla'], ['#c93b3b', 'dragon-maki'], ['#2f6fb3', 'gunkan-ikura']];
  const html = plates.map(([c, f]) => `<i class="plate" style="--c:${c}"><img src="../assets/${f}.webp" alt="" /></i>`).join('');
  track.innerHTML = html + html;     // second copy = the wrap; translateX(-50%) lands exactly on it
}

/* ── The colours: hover a tier and the section repaints ──
   The section IS the swatch: one custom property, transitioned; every row
   hover just rewrites it. Text swaps out (220ms) → replace → in, so half of
   one price never morphs into half of another. */
{
  const sec = $('#colori'), rows = $$('.row', sec);
  const price = $('[data-tier-price]'), name = $('[data-tier-name]'), blurb = $('[data-tier-blurb]'), img = $('[data-tier-img]');
  let cur = 0, timer = 0;
  const select = (i) => {
    if (i === cur) return; cur = i;
    const r = rows[i];
    sec.style.setProperty('--tint', r.dataset.tint);
    rows.forEach((x, k) => x.classList.toggle('on', k === i));
    clearTimeout(timer);
    const apply = () => { price.textContent = r.dataset.price; name.textContent = r.dataset.name; blurb.textContent = r.dataset.blurb; img.src = `../assets/${r.dataset.img}.webp`; };
    if (reduce) { apply(); return; }
    [price, name, blurb].forEach((el) => el.classList.add('swap'));
    timer = setTimeout(() => { apply(); [price, name, blurb].forEach((el) => el.classList.remove('swap')); }, 220);
  };
  rows.forEach((r, i) => { r.addEventListener('pointerenter', () => select(i)); r.addEventListener('focus', () => select(i)); r.addEventListener('click', () => select(i)); });
}

/* ── The pile ── */
const drawer = $('[data-cart]'), scrim = $('[data-scrim]'), toast = $('[data-toast]'), stack = $('[data-stack]');
const TINT = { Verde: '#3b9d6e', Blu: '#2f6fb3', Rosso: '#c93b3b', Oro: '#c9922e' };
let cart = [];
const say = (t) => { toast.textContent = t; toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 1600); };
function render() {
  const count = cart.length, total = cart.reduce((s, x) => s + x.price, 0);
  $('[data-cart-count]').textContent = count;
  $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Apri la pila, ${count} piatti`));
  $('[data-cart-total]').textContent = euro(total);
  $('[data-checkout]').disabled = !count;
  // the pile: newest plate on top, at most 8 drawn
  stack.innerHTML = cart.slice(-8).map((x, i) => `<i style="--c:${TINT[x.tier]}; bottom:${8 + i * 11}px"></i>`).join('');
  $('[data-cart-items]').innerHTML = count
    ? cart.map((x, i) => `<div class="cart-item"><i style="--c:${TINT[x.tier]}"></i><span>${x.name}</span><b>${euro(x.price)}</b><button aria-label="Togli ${x.name}" data-remove="${i}">×</button></div>`).join('')
    : '<div class="empty"><h3>Pila vuota</h3><p>Prendi un piatto dal nastro.</p></div>';
  $$('[data-remove]').forEach((b) => b.onclick = () => { cart.splice(+b.dataset.remove, 1); render(); });
}
$$('[data-add]').forEach((b) => b.onclick = () => { cart.push({ name: b.dataset.name, price: +b.dataset.price, tier: b.dataset.tier }); render(); say(`${b.dataset.name} · piatto ${b.dataset.tier.toLowerCase()}`); });
const openCart = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); document.body.classList.add('lock'); };
const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); document.body.classList.remove('lock'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart);
$('[data-close-cart]').onclick = closeCart;
scrim.onclick = closeCart;
$('[data-checkout]').onclick = () => say('✓ Demo: pila ordinata');
render();

/* ── Magnetic CTA ── */
$$('[data-magnet]').forEach((el) => {
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  const RADIUS = 60, PULL = .35; let ax = 0, ay = 0;
  const set = (x, y, tracking) => { ax = x; ay = y; el.classList.toggle('tracking', tracking); el.style.setProperty('--mx', x.toFixed(2) + 'px'); el.style.setProperty('--my', y.toFixed(2) + 'px'); };
  const release = () => set(0, 0, false);
  addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2 - ax), dy = e.clientY - (r.top + r.height / 2 - ay); if (Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS) set(dx * PULL, dy * PULL, true); else release(); });
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) release(); });
  addEventListener('blur', release);
});
