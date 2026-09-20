/* Nori Express · App — catalogue with search + sticky categories, product sheet with options, pickup slots, cart with free-delivery bar. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;
const FREE = 35, BAG = .5;

const CATS = [
  ['box', 'Box', 'Pronti da portare via', [['triple-maki-box', 'Triple Maki Box', '24 pezzi · tre roll a scelta', 26, 'Best seller'], ['open-premium-box', 'Open Premium Box', '32 pezzi · nigiri, uramaki, sashimi', 38], ['small-sushi-mix', 'Small Sushi Mix', '12 pezzi · l’assaggio', 7], ['medium-sushi-mix', 'Medium Sushi Mix', '20 pezzi · per uno che ha fame', 13], ['big-sushimix', 'Big Sushi Mix', '40 pezzi · per due', 22], ['sushi-party', 'Sushi Party', '80 pezzi · per la tavolata', 55], ['small-sushi-sashimi', 'Small Sushi Sashimi', '12 pezzi + 6 fette', 12]]],
  ['burrito', 'Sushi burrito', 'Un roll grande come un pasto', [['salmon-burrito', 'Salmon burrito', 'salmone, avocado, insalata, maionese', 12], ['tuna-burrito', 'Tuna burrito', 'tonno, cetriolo, tobiko', 12], ['ebiten-burrito', 'Ebiten burrito', 'gambero in tempura, spicy', 12]]],
  ['roll', 'Roll', 'Otto pezzi', [['ura-salmone-8-pz', 'Ura salmone', 'salmone, avocado, sesamo', 9], ['ura-ebiten-8-pz', 'Ura ebiten', 'gambero in tempura, maionese', 9.5], ['special-salmon-maki-8-pz', 'Special salmon', 'salmone dentro e fuori', 12], ['dragon-maki-8-pz', 'Dragon maki', 'anguilla, avocado, teriyaki', 13], ['vegetarian-maki-8-pz', 'Vegetarian maki', 'avocado, cetriolo, mango', 9, 'Veg'], ['hoso-salmone-8-pz', 'Hoso salmone', 'il classico', 4], ['hoso-avocado-8pz', 'Hoso avocado', 'il classico verde', 4, 'Veg'], ['temaki-salmone', 'Temaki salmone', 'un cono, da mangiare subito', 4.5]]],
  ['nigiri', 'Nigiri & sashimi', 'Il pesce, il riso', [['nighiri-salmone-10-pz', 'Nigiri salmone ×10', 'dieci pezzi', 12], ['nighiri-misto-10-pz', 'Nigiri misto ×10', 'salmone, tonno, gambero, branzino', 13], ['sashimi-salmone-10-pz', 'Sashimi salmone', 'dieci fette', 12], ['gunkan-salmon-ikura', 'Gunkan ikura', 'due pezzi', 6]]],
  ['sides', 'Contorni', 'Caldo e verde', [['edamame', 'Edamame', 'al vapore, sale', 4, 'Veg'], ['chicken-gyoza-3pz', 'Gyoza di pollo', 'tre pezzi', 3.5], ['tacos-salmon-2-pz', 'Tacos salmon', 'due tacos, avocado', 6], ['zuppa-di-miso', 'Zuppa di miso', 'da portare calda', 2.5, 'Veg']]],
  ['drinks', 'Bere & dolci', 'Per finire', [['coca-cola-33cl', 'Coca-Cola 33 cl', 'fredda', 2], ['birra-giapponese-asahi-50-cl', 'Asahi 50 cl', 'birra giapponese', 4], ['mochi-mango', 'Mochi mango', 'due pezzi', 2, 'Veg'], ['salsa-di-soia-30-ml', 'Soia extra', '30 ml', .4]]],
];
const OPTS = { box: [['Salsa', ['Soia', 'Teriyaki', 'Spicy mayo'], 0], ['Bacchette', ['2 paia', '4 paia', '6 paia'], 0]], burrito: [['Piccante', ['No', 'Medio', 'Molto'], 0]], roll: [['Salsa', ['Soia', 'Teriyaki', 'Spicy mayo'], 0]] };
const cats = $('[data-cats]'), catalog = $('[data-catalog]');
cats.innerHTML = CATS.map(([id, n], i) => `<a href="#c-${id}" class="${i === 0 ? 'on' : ''}" data-cat="${id}">${n}</a>`).join('');
catalog.innerHTML = CATS.map(([id, n, sub, list]) => `<section class="group" id="c-${id}" data-group="${id}"><h2>${n}<small>${sub}</small></h2><div class="grid">${list.map(([f, name, d, p, badge], i) => `<button class="prod reveal" type="button" data-id="${f}" data-cat="${id}" data-i="${i}">${badge ? `<span class="badge">${badge}</span>` : ''}<span><h3>${name}</h3><p>${d}</p><span class="price">${euro(p)}</span></span><span class="ph"><img src="../assets/${f}.webp" alt="${name}" loading="lazy" width="200" height="200" /><span class="plus">+</span></span></button>`).join('')}</div></section>`).join('');
const find = (id) => { for (const [cid, , , list] of CATS) { const it = list.find((x) => x[0] === id); if (it) return { cat: cid, it }; } };

/* sticky rail follows scroll; clicking scrolls under the sticky headers */
{ const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) $$('a', cats).forEach((a) => a.classList.toggle('on', a.dataset.cat === e.target.dataset.group)); }), { rootMargin: '-40% 0px -55% 0px' }); $$('.group').forEach((g) => io.observe(g)); }
cats.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); const g = $(a.getAttribute('href')); scrollTo({ top: g.getBoundingClientRect().top + scrollY - 140, behavior: reduce ? 'auto' : 'smooth' }); });
/* search filters products and hides empty groups */
$('[data-search]').addEventListener('input', (e) => { const q = e.target.value.trim().toLowerCase(); let any = 0; $$('.prod').forEach((p) => { const hit = !q || p.textContent.toLowerCase().includes(q); p.classList.toggle('hide', !hit); any += hit; }); $$('.group').forEach((g) => g.hidden = !$$('.prod:not(.hide)', g).length); $('[data-empty]').hidden = any > 0; });

/* cart */
const cart = $('[data-cart]'), scrim = $('[data-scrim]'), list = $('[data-cart-list]'), empty = $('[data-cart-empty]'), toast = $('[data-toast]');
const lines = [];
function paint() {
  list.innerHTML = lines.map((l, i) => `<li><img src="../assets/${l.id}.webp" alt="" /><span><b>${l.name}</b><small>${l.sub || ''}</small></span><span class="q"><button type="button" data-dec="${i}">−</button>${l.q}<button type="button" data-inc="${i}">+</button></span></li>`).join('');
  const n = lines.reduce((a, l) => a + l.q, 0), sub = lines.reduce((a, l) => a + l.q * l.price, 0);
  $$('[data-cart-count]').forEach((c) => c.textContent = n); empty.classList.toggle('hide', n > 0);
  $('[data-sub]').textContent = euro(sub); $('[data-total]').textContent = euro(sub + (n ? BAG : 0) );
  const left = Math.max(0, FREE - sub); $('[data-progress]').style.setProperty('--w', Math.min(100, sub / FREE * 100) + '%'); $('[data-progress-label]').textContent = left > 0 ? `Ancora ${euro(left)} per la consegna gratuita` : 'Consegna gratuita sbloccata 🎉'; $('.progress').classList.toggle('free', left <= 0);
  $('[data-free-left]').textContent = left > 0 ? `· mancano ${euro(left)}` : '· sbloccata';
  $$('.prod').forEach((p) => p.classList.toggle('in', lines.some((l) => l.id === p.dataset.id)));
}
const add = (id, name, price, q = 1, sub = '') => { const l = lines.find((x) => x.id === id && x.sub === sub); l ? l.q += q : lines.push({ id, name, price, q, sub }); paint(); say(`${name} aggiunto`); };
const say = (t) => { $('[data-toast-text]').textContent = t; toast.classList.add('show'); clearTimeout(say._t); say._t = setTimeout(() => toast.classList.remove('show'), 2000); };
list.addEventListener('click', (e) => { const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'); if (inc) lines[+inc.dataset.inc].q++; if (dec) { const l = lines[+dec.dataset.dec]; l.q--; if (l.q <= 0) lines.splice(+dec.dataset.dec, 1); } paint(); });
const openCart = () => { cart.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); }, closeAll = () => { cart.setAttribute('aria-hidden', 'true'); sheet.setAttribute('aria-hidden', 'true'); when.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart); $('[data-close-cart]').onclick = closeAll; scrim.onclick = closeAll;
$('[data-checkout]').onclick = () => { if (!lines.length) return; closeAll(); say(`Ordine inviato · ritiro ${whenLabel()}`); lines.length = 0; paint(); };
$('[data-add-promo]').onclick = () => add('triple-maki-box', 'Triple Maki Box · −15%', 22.1, 1, 'offerta di oggi');

/* product sheet */
const sheet = $('[data-sheet]'); let cur = null, q = 1;
catalog.addEventListener('click', (e) => { const p = e.target.closest('.prod'); if (!p) return; const { cat, it } = find(p.dataset.id); cur = { id: it[0], name: it[1], price: it[3], cat }; q = 1;
  $('[data-sheet-img]').src = `../assets/${it[0]}.webp`; $('[data-sheet-cat]').textContent = CATS.find((c) => c[0] === cat)[1]; $('[data-sheet-name]').textContent = it[1]; $('[data-sheet-desc]').textContent = it[2];
  $('[data-sheet-opts]').innerHTML = (OPTS[cat] || []).map(([label, vals], gi) => `<div><h4>${label} <small>· scegli uno</small></h4><div class="opt">${vals.map((v, i) => `<label><input type="radio" name="o${gi}" value="${v}" ${i === 0 ? 'checked' : ''} /><span>${v}</span></label>`).join('')}</div></div>`).join('');
  paintSheet(); sheet.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); });
const paintSheet = () => { $('[data-sheet-q]').textContent = q; $('[data-sheet-price]').textContent = euro(cur.price * q); };
$$('[data-q]').forEach((b) => b.onclick = () => { q = Math.max(1, q + +b.dataset.q); paintSheet(); });
$('[data-sheet-add]').onclick = () => { const sub = $$('[data-sheet-opts] input:checked').map((i) => i.value).join(' · '); add(cur.id, cur.name, cur.price, q, sub); closeAll(); };
$('[data-close-sheet]').onclick = closeAll;

/* pickup time */
const when = $('[data-when]'), slots = $('[data-slots]'); let slot = 'asap';
{ const now = new Date(); const start = new Date(now); start.setMinutes(Math.ceil((now.getMinutes() + 25) / 15) * 15, 0, 0); const list = ['asap']; for (let i = 0; i < 8; i++) { const d = new Date(start.getTime() + i * 15 * 60000); if (d.getHours() >= 22 && d.getMinutes() > 15) break; if (d.getHours() < 11) continue; list.push(d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })); } slots.innerHTML = list.map((s) => `<button type="button" data-slot="${s}" class="${s === 'asap' ? 'asap on' : ''}">${s === 'asap' ? 'Il prima possibile · ~20 min' : s}</button>`).join(''); }
const whenLabel = () => slot === 'asap' ? 'il prima possibile · ~20 min' : `alle ${slot}`;
slots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; slot = b.dataset.slot; $$('button', slots).forEach((x) => x.classList.toggle('on', x === b)); });
$$('[data-open-when]').forEach((b) => b.onclick = () => { when.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); });
$('[data-when-ok]').onclick = () => { $('[data-when-label]').textContent = whenLabel(); $('[data-checkout-when]').textContent = '· ' + whenLabel(); closeAll(); };
$('[data-close-when]').onclick = closeAll;

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .05, rootMargin: '0px 0px -20px' }); items.forEach((x) => io.observe(x)); }
paint();
