/* Kumo Ramen · Manga — nav, reveal, the menu pages with filter, booking dialog. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n % 1 ? n.toFixed(2).replace('.', ',') : n}`;
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

const MENU = [
  ['ramen-di-carne', 'Tonkotsu ramen', 'brodo di maiale 18 ore, chashu, ajitama, nori', 13, 'ramen', 'ZURU ZURU', '●●○'], ['ramen-di-gamberi', 'Ramen di gamberi', 'brodo di crostacei, gamberi, cipollotto, mais', 13, 'ramen', 'SLURP'], ['yaki-udon', 'Yaki udon', 'udon spessi saltati, verdure, salsa yakisoba', 7, 'noodles', 'JUU JUU'], ['yaki-soba', 'Yaki soba', 'soba saltati, maiale, cavolo, zenzero rosso', 7, 'noodles', 'JUU JUU'], ['pad-thai', 'Pad thai', 'noodles di riso, arachidi, lime, uovo', 6, 'noodles', 'KARI KARI'], ['banmian-piccante', 'Banmian piccante', 'noodles larghi, olio al peperoncino', 6, 'noodles', 'HII!', '●●●'],
  ['chicken-gyoza-3pz', 'Gyoza', '3 pezzi alla piastra, salsa ponzu', 3.5, 'piccoli', 'PARI PARI'], ['bao-charsiu', 'Bao charsiu', 'maiale laccato, cetriolo, hoisin', 3.5, 'piccoli', 'FUWA FUWA'], ['xiao-long-bao', 'Xiao long bao', '3 pezzi al vapore, brodo dentro', 4, 'piccoli', 'ACHI ACHI'], ['edamame', 'Edamame', 'al vapore, sale marino', 4, 'piccoli', 'PURI PURI'], ['ebi-fry', 'Ebi fry', 'gamberi impanati, salsa tonkatsu', 6.5, 'piccoli', 'SAKU SAKU'], ['shumai-3-pz', 'Shumai', '3 pezzi, gamberi e maiale', 5, 'piccoli', 'MOGU MOGU'],
  ['mochi-cioccolato', 'Mochi al cioccolato', '2 pezzi, ripieno morbido', 2, 'dolci', 'MOCHI MOCHI'], ['dorayaki-al-cioccolato', 'Dorayaki', 'due pancake, crema al cioccolato', 3.5, 'dolci', 'PAKU PAKU'],
];
$('[data-grid]').innerHTML = MENU.map(([f, n, d, p, c, sfx, heat]) => `<article class="panel dish reveal" data-category="${c}"><div class="ph"><img src="../assets/${f}.webp" alt="${n}" loading="lazy" width="400" height="300" /><div class="halftone"></div><span class="sfx">${sfx}</span></div><span class="price">${euro(p)}</span><div class="body"><h3>${n}</h3><p>${d}</p>${heat ? `<span class="heat">${heat} PICCANTE</span>` : ''}</div></article>`).join('');
$$('.chip').forEach((b) => b.onclick = () => { $$('.chip').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const f = b.dataset.filter; $$('.dish').forEach((el) => el.classList.toggle('hide', f !== 'tutti' && el.dataset.category !== f)); });

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }

const dlg = $('[data-booking]'), toast = $('[data-toast]');
$$('[data-open-booking]').forEach((b) => b.onclick = () => { if (nav.getAttribute('aria-hidden') === 'false') navBtn.click(); dlg.showModal(); });
$('[data-close-booking]').onclick = () => dlg.close(); dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('[data-booking-form]').onsubmit = (e) => { e.preventDefault(); dlg.close(); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); e.target.reset(); };
const day = $('input[name=day]'); { const d = new Date(); d.setDate(d.getDate() + 1); day.min = d.toISOString().slice(0, 10); }
