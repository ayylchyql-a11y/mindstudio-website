/* Nori Express · Kraft — the boxes, the order slip (a table of rows you tick, quantities, live total), the carta, stamps. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());
$$('[data-scroll]').forEach((b) => b.onclick = () => $(b.dataset.scroll).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));

const BOXES = [['triple-maki-box', 'Triple Maki Box', '24 pz · tre roll a scelta, una salsa', 26, '24 pezzi'], ['open-premium-box', 'Open Premium Box', '32 pz · nigiri, uramaki, sashimi, gunkan', 38, '32 pezzi'], ['big-sushimix', 'Big Sushi Mix', '40 pz · la scatola per due', 22, '40 pezzi'], ['sushi-party', 'Sushi Party', '80 pz · la scatola da tavolata', 55, '80 pezzi']];
const CARTA = { 'Roll': [['ura-salmone-8-pz', 'Ura salmone', '8 pz', 9], ['ura-ebiten-8-pz', 'Ura ebiten', '8 pz', 9.5], ['special-salmon-maki-8-pz', 'Special salmon', '8 pz', 12], ['dragon-maki-8-pz', 'Dragon maki', '8 pz', 13], ['vegetarian-maki-8-pz', 'Vegetarian maki', '8 pz · veg', 9], ['hoso-salmone-8-pz', 'Hoso salmone', '8 pz', 4], ['hoso-avocado-8pz', 'Hoso avocado', '8 pz · veg', 4]], 'Burrito & nigiri': [['salmon-burrito', 'Salmon burrito', 'uno', 12], ['tuna-burrito', 'Tuna burrito', 'uno', 12], ['nighiri-salmone-10-pz', 'Nigiri salmone', '10 pz', 12], ['nighiri-misto-10-pz', 'Nigiri misto', '10 pz', 13], ['sashimi-salmone-10-pz', 'Sashimi salmone', '10 fette', 12], ['gunkan-salmon-ikura', 'Gunkan ikura', '2 pz', 6], ['temaki-salmone', 'Temaki salmone', 'uno', 4.5]], 'Contorni & altro': [['edamame', 'Edamame', 'veg', 4], ['chicken-gyoza-3pz', 'Gyoza di pollo', '3 pz', 3.5], ['tacos-salmon-2-pz', 'Tacos salmon', '2 pz', 6], ['zuppa-di-miso', 'Zuppa di miso', 'calda', 2.5], ['mochi-mango', 'Mochi mango', '2 pz', 2], ['coca-cola-33cl', 'Coca-Cola', '33 cl', 2], ['birra-giapponese-asahi-50-cl', 'Asahi', '50 cl', 4]] };
const ALL = [...BOXES.map(([id, n, , p]) => ({ id, n, p })), ...Object.values(CARTA).flat().map(([id, n, , p]) => ({ id, n, p }))];
$('[data-boxes]').innerHTML = BOXES.map(([id, n, d, p, pcs]) => `<article class="kbox reveal" data-id="${id}"><span class="tag">${euro(p)}</span><div class="win"><img src="../assets/${id}.webp" alt="${n}" loading="lazy" width="400" height="300" /></div><span class="pcs">${pcs}</span><h3>${n}</h3><p>${d}</p><button class="add press" type="button" data-add="${id}">+ nel foglio</button></article>`).join('');
$('[data-carta]').innerHTML = Object.entries(CARTA).map(([cat, list]) => `<div class="cat"><h3>${cat}</h3>${list.map(([id, n, d, p]) => `<div class="cline" data-add="${id}" data-id="${id}"><span>${n}<small>${d}</small></span><b>${euro(p)}</b><span class="plus">+</span></div>`).join('')}</div>`).join('');

/* the slip: every item is a row; ticking sets q=1; the +/- buttons change it; the total is the sum */
const table = $('[data-slip-table]'), total = $('[data-slip-total]'), count = $('[data-cart-count]');
const q = new Map();
table.innerHTML = ALL.map((it) => `<tr data-id="${it.id}"><td><span class="tick"></span>${it.n}</td><td class="q"><span class="qty"><button type="button" data-d="-1" aria-label="Meno">−</button><b data-q>0</b><button type="button" data-d="1" aria-label="Più">+</button></span></td><td class="p">${euro(it.p)}</td></tr>`).join('');
function paint() {
  let sum = 0, n = 0;
  $$('tr', table).forEach((tr) => { const k = q.get(tr.dataset.id) || 0; tr.classList.toggle('on', k > 0); $('[data-q]', tr).textContent = k; const it = ALL.find((x) => x.id === tr.dataset.id); sum += k * it.p; n += k; });
  total.textContent = euro(sum); count.textContent = n;
  $$('[data-id]').forEach((el) => { if (el.tagName !== 'TR') el.classList.toggle('in', (q.get(el.dataset.id) || 0) > 0); });
}
const setQ = (id, k) => { q.set(id, Math.max(0, k)); paint(); };
table.addEventListener('click', (e) => { const tr = e.target.closest('tr'); if (!tr) return; const b = e.target.closest('[data-d]'); const k = q.get(tr.dataset.id) || 0; if (b) setQ(tr.dataset.id, k + +b.dataset.d); else setQ(tr.dataset.id, k > 0 ? 0 : 1); });
document.addEventListener('click', (e) => { const b = e.target.closest('[data-add]'); if (!b || b.closest('table')) return; setQ(b.dataset.add, (q.get(b.dataset.add) || 0) + 1); if (b.classList.contains('add')) { b.textContent = '✓ nel foglio'; setTimeout(() => b.textContent = '+ nel foglio', 1200); } });

/* stamps hit on load; the slip stamp hits on submit */
setTimeout(() => $$('[data-stamp]').forEach((s, i) => setTimeout(() => s.classList.add('hit'), i * 260)), reduce ? 0 : 700);
const toast = $('[data-toast]');
$('[data-slip]').onsubmit = (e) => { e.preventDefault(); const n = [...q.values()].reduce((a, b) => a + b, 0); if (!n) { $('.slip-table tr').scrollIntoView({ block: 'center' }); return; } const when = $('[data-slip-when]').value; $('[data-stamp-time]').textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); const st = $('[data-slip-stamp]'); st.classList.remove('hit'); void st.offsetWidth; st.classList.add('hit'); $('[data-toast-p]').textContent = when === 'il prima possibile' ? 'Pronto tra 20 minuti.' : `Pronto alle ${when}.`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); setTimeout(() => { q.clear(); paint(); st.classList.remove('hit'); e.target.reset(); $('[data-slip-n]').textContent = 'N. ' + String(418 + Math.floor(Math.random() * 30)).padStart(4, '0'); }, 3600); };

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -30px' }); items.forEach((x) => io.observe(x)); }
paint();
