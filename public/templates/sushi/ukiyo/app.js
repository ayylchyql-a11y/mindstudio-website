/* Mumi Sushi · Ukiyo — header, mobile nav, reveal, the counter (real photos, filtered), tickets → booking, seal stamp. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); navBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu'); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

/* the counter: the restaurant's real dishes, one card each, the kanji is the category's own */
const DISHES = [
  ['nigiri-salmone', 'Nigiri salmone', '2 pezzi · salmone norvegese, riso a 36°', 3.5, 'nigiri', '鮭'],
  ['nigiri-tonno', 'Nigiri tonno', '2 pezzi · tonno pinna gialla', 4.5, 'nigiri', '鮪'],
  ['nigiri-gambero-rosso', 'Nigiri gambero rosso', '2 pezzi · gambero di Mazara crudo', 5, 'nigiri', '海老', 'Mazara'],
  ['nigiri-anguilla', 'Nigiri anguilla', '2 pezzi · anguilla laccata, sesamo', 5, 'nigiri', '鰻'],
  ['nigiri-tartufo', 'Nigiri al tartufo', '4 pezzi · salmone scottato, tartufo nero', 8, 'nigiri', '松露', 'Stagione'],
  ['nigiri-branzino', 'Nigiri branzino', '2 pezzi · branzino, yuzu, sale', 4, 'nigiri', '鱸'],
  ['ura-salmone', 'Uramaki salmone', '8 pezzi · salmone, avocado, sesamo', 9, 'uramaki', '巻'],
  ['dragon-maki', 'Dragon maki', '8 pezzi · anguilla, avocado, teriyaki', 13, 'uramaki', '龍', 'Firma'],
  ['rainbow-maki-8-pz', 'Rainbow maki', '8 pezzi · salmone, tonno, branzino, avocado', 13, 'uramaki', '虹'],
  ['tiger-maki-8-pz', 'Tiger maki', '8 pezzi · gambero in tempura, salmone, salsa spicy', 13, 'uramaki', '虎'],
  ['special-salmon-maki', 'Special salmon', '8 pezzi · salmone dentro e fuori, philadelphia', 12, 'uramaki', '特'],
  ['sashimi-salmone', 'Sashimi salmone', '10 fette · solo il centro del filetto', 12, 'sashimi', '刺'],
  ['sashimi-tonno-10-pz', 'Sashimi tonno', '10 fette · tonno pinna gialla', 15, 'sashimi', '刺'],
  ['tartare-tonno', 'Tartare di tonno', 'tonno, cipollotto, olio al sesamo, tobiko', 10, 'sashimi', '叩'],
  ['gunkan-ikura', 'Gunkan ikura', '2 pezzi · uova di salmone, nori', 6, 'sashimi', '軍艦'],
  ['tataki-salmone-10-pz', 'Tataki di salmone', '10 fette scottate · ponzu, cipollotto', 13, 'sashimi', '炙'],
  ['ebi-kataifi', 'Ebi kataifi', 'gamberi in pasta kataifi, maionese al lime', 6, 'caldo', '揚'],
  ['gyoza', 'Gyoza di pollo', '3 pezzi · alla piastra, salsa ponzu', 3.5, 'caldo', '餃'],
  ['miso', 'Zuppa di miso', 'dashi, tofu, wakame, cipollotto', 2.5, 'caldo', '汁'],
  ['xiao-long-bao', 'Xiao long bao', '3 pezzi · ravioli al vapore con brodo dentro', 4, 'caldo', '包'],
];
const plates = $('[data-plates]');
plates.innerHTML = DISHES.map(([f, n, d, p, c, k, tag]) => `<article class="plate reveal" data-category="${c}">${tag ? `<span class="tag">${tag}</span>` : ''}<div class="ph"><img src="../assets/${f}.webp" alt="${n}" loading="lazy" width="600" height="600" /></div><h3>${n}</h3><p>${d}</p><div class="row"><span class="kj">${k}</span><strong>${euro(p)}</strong></div></article>`).join('');
$$('.chip').forEach((b) => b.onclick = () => { $$('.chip').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const f = b.dataset.filter; $$('.plate').forEach((el) => el.classList.toggle('hide', f !== 'tutti' && el.dataset.category !== f)); });

/* reveal on scroll */
const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }

/* the seal stamps itself */
setTimeout(() => $('[data-seal]').classList.add('stamped'), reduce ? 0 : 900);

/* booking: any "Scegli" remembers its tier */
const dlg = $('[data-booking]'), tierSel = $('[data-tier-select]'), toast = $('[data-toast]');
$$('[data-open-booking]').forEach((b) => b.onclick = () => { const t = b.closest('[data-tier]')?.dataset.tier; if (t) tierSel.value = t; if (nav.getAttribute('aria-hidden') === 'false') navBtn.click(); dlg.showModal(); });
$('[data-close-booking]').onclick = () => dlg.close();
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('[data-booking-form]').onsubmit = (e) => { e.preventDefault(); dlg.close(); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); e.target.reset(); };
const day = $('input[name=day]'); if (day) { const d = new Date(); d.setDate(d.getDate() + 1); day.min = d.toISOString().slice(0, 10); }
