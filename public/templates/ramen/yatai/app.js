/* Kumo Ramen · Yatai — steam canvas, broth clock, the board, the bowl builder with a live drawing, the tray. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

/* steam: soft discs born at the bowl's rim, rising, swaying, fading — drawn with radial gradients */
{
  const c = $('[data-steam]'), ctx = c.getContext('2d'); let W = 0, H = 0, ps = [];
  const size = () => { const r = c.getBoundingClientRect(); W = c.width = r.width; H = c.height = r.height; };
  size(); addEventListener('resize', size);
  const spawn = () => ({ x: W * (.32 + Math.random() * .36), y: H * .82, r: 16 + Math.random() * 26, a: 0, v: .35 + Math.random() * .5, s: Math.random() * Math.PI * 2, life: 0 });
  if (!reduce) (function frame() { if (!document.hidden) { ctx.clearRect(0, 0, W, H); if (ps.length < 26 && Math.random() < .3) ps.push(spawn()); ps.forEach((p) => { p.life += 1; p.y -= p.v; p.x += Math.sin(p.s + p.life / 40) * .35; p.r += .12; p.a = Math.min(.5, p.life / 60) * Math.max(0, 1 - p.life / 260); const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, `rgba(255,240,220,${p.a})`); g.addColorStop(1, 'rgba(255,240,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }); ps = ps.filter((p) => p.life < 260); } requestAnimationFrame(frame); })();
}
/* the broth clock: the pot went on at 06:00 today */
{ const h = $('[data-hours]'), m = $('[data-mins]'); const tick = () => { const now = new Date(), start = new Date(now); start.setHours(6, 0, 0, 0); let d = (now - start) / 60000; if (d < 0) d += 24 * 60; h.textContent = String(Math.floor(d / 60)).padStart(2, '0'); m.textContent = String(Math.floor(d % 60)).padStart(2, '0'); }; tick(); setInterval(tick, 20000); }

/* the board */
const MENU = [
  ['ramen-di-gamberi', 'Ramen di gamberi', 'brodo di crostacei, gamberi, cipollotto', 13, 'ramen'], ['ramen-di-carne', 'Ramen di carne', 'tonkotsu 18 ore, chashu, ajitama', 13, 'ramen', '●●○'], ['yaki-udon', 'Yaki udon', 'udon saltati, verdure, salsa yakisoba', 7, 'noodles'], ['yaki-soba', 'Yaki soba', 'soba saltati, maiale, cavolo', 7, 'noodles'], ['pad-thai', 'Pad thai', 'noodles di riso, arachidi, lime', 6, 'noodles'], ['banmian-piccante', 'Banmian piccante', 'noodles larghi, olio al peperoncino', 6, 'noodles', '●●●'],
  ['chicken-gyoza-3pz', 'Gyoza di pollo', '3 pezzi alla piastra', 3.5, 'piccoli'], ['bao-charsiu', 'Bao charsiu', 'maiale laccato, cetriolo', 3.5, 'piccoli'], ['bao-anatra-curry', 'Bao anatra al curry', 'anatra, curry giallo', 3.5, 'piccoli'], ['xiao-long-bao', 'Xiao long bao', '3 pezzi, brodo dentro', 4, 'piccoli'], ['edamame', 'Edamame', 'sale marino', 4, 'piccoli'], ['ebi-fry', 'Ebi fry', 'gamberi impanati', 6.5, 'piccoli'], ['harumaki-2-pz', 'Harumaki', '2 involtini, verdure', 3, 'piccoli'], ['zuppa-di-miso', 'Zuppa di miso', 'wakame, tofu', 2.5, 'piccoli'],
  ['mochi-cioccolato', 'Mochi al cioccolato', '2 pezzi', 2, 'dolci'], ['dorayaki-al-cioccolato', 'Dorayaki', 'pancake giapponese', 3.5, 'dolci'],
];
$('[data-cards]').innerHTML = MENU.map(([f, n, d, p, c, heat], i) => `<article class="card reveal" data-category="${c}"><div class="ph"><img src="../assets/${f}.webp" alt="${n}" loading="lazy" width="200" height="200" /></div><div><h3>${n}</h3><p>${d}${heat ? ` <span class="heat">${heat}</span>` : ''}</p><div class="row"><b>${euro(p)}</b><button class="add press" type="button" data-add="${i}">+ vassoio</button></div></div></article>`).join('');
$$('.chip').forEach((b) => b.onclick = () => { $$('.chip').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const f = b.dataset.filter; $$('.card').forEach((el) => el.classList.toggle('hide', f !== 'tutti' && el.dataset.category !== f)); });

/* tray */
const cart = $('[data-cart]'), scrim = $('[data-scrim]'), list = $('[data-cart-list]'), empty = $('[data-cart-empty]'), total = $('[data-cart-total]'), count = $('[data-cart-count]'), toast = $('[data-toast]');
const lines = [];
function paint() { list.innerHTML = lines.map((l, i) => `<li><span>${l.name}${l.sub ? `<small>${l.sub}</small>` : ''}</span><span class="q"><button type="button" data-dec="${i}">−</button><b>${l.q}</b><button type="button" data-inc="${i}">+</button></span><b>${euro(l.q * l.price)}</b></li>`).join(''); const n = lines.reduce((a, l) => a + l.q, 0); count.textContent = n; empty.classList.toggle('hide', n > 0); total.textContent = euro(lines.reduce((a, l) => a + l.q * l.price, 0)); }
const add = (name, price, sub) => { const l = lines.find((x) => x.name === name && x.sub === sub); l ? l.q++ : lines.push({ name, price, sub, q: 1 }); paint(); };
$('[data-cards]').addEventListener('click', (e) => { const b = e.target.closest('[data-add]'); if (!b) return; const m = MENU[+b.dataset.add]; add(m[1], m[3]); b.classList.add('done'); b.textContent = '✓ aggiunto'; setTimeout(() => { b.classList.remove('done'); b.textContent = '+ vassoio'; }, 1200); });
list.addEventListener('click', (e) => { const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'); if (inc) lines[+inc.dataset.inc].q++; if (dec) { const l = lines[+dec.dataset.dec]; l.q--; if (l.q <= 0) lines.splice(+dec.dataset.dec, 1); } paint(); });
const openCart = () => { cart.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); }, closeCart = () => { cart.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart); $('[data-close-cart]').onclick = closeCart; scrim.onclick = closeCart;
$('[data-checkout]').onclick = () => { if (!lines.length) return; closeCart(); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); lines.length = 0; paint(); };

/* build a bowl: price and drawing recompute from the form on every change */
{
  const form = $('[data-build]'), price = $('[data-build-price]'), sum = $('[data-build-summary]'), svg = $('.bowl-draw svg'), stop = $('[data-broth-stop]');
  const calc = () => { const fd = new FormData(form); const broth = form.querySelector('input[name=broth]:checked'), noodles = fd.get('noodles'), tops = $$('input[name=tops]:checked', form); let p = +broth.dataset.price + tops.reduce((a, t) => a + +t.dataset.price, 0); price.textContent = euro(p); stop.setAttribute('stop-color', broth.dataset.color); $$('[data-top]', svg).forEach((g) => g.classList.toggle('off', !tops.some((t) => t.value === g.dataset.top))); $('[data-noodles]', svg).setAttribute('stroke-width', noodles === 'Al dente' ? 4 : noodles === 'Morbidi' ? 6.5 : 5); sum.textContent = `${broth.value} · ${noodles.toLowerCase()}${tops.length ? ' · ' + tops.map((t) => t.value.toLowerCase()).join(', ') : ''}`; return { p, name: `Ramen ${broth.value}`, sub: `${noodles.toLowerCase()} · ${tops.map((t) => t.value.toLowerCase()).join(', ') || 'liscio'}` }; };
  form.addEventListener('change', calc); calc();
  form.onsubmit = (e) => { e.preventDefault(); const r = calc(); add(r.name, r.p, r.sub); openCart(); };
}
/* timeline fills when it comes into view */
const tl = $('[data-timeline]'); new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { tl.querySelector('.tl-bar i').style.setProperty('--w', '100%'); } }), { threshold: .3 }).observe(tl);

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }
paint();
