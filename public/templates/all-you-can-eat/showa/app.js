/* Mizu · Shōwa — flip digits, the showcase with a card, the price lever, the stamp card, booking. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

/* flip digits: build tiles from a string like "18.90"; setDigits flips only the tiles that change */
function buildDigits(el, s) { el.innerHTML = [...s].map((c) => c === '.' ? `<span class="digit dot">,</span>` : `<span class="digit" data-v="${c}"><span class="top"><span>${c}</span></span><span class="bot"><span>${c}</span></span></span>`).join(''); }
function setDigits(el, s) { const tiles = $$('.digit:not(.dot)', el); [...s.replace('.', '')].forEach((c, i) => { const t = tiles[i]; if (!t || t.dataset.v === c) return; t.dataset.v = c; if (reduce) { $$('span span', t).forEach((x) => x.textContent = c); return; } t.classList.add('flipping'); setTimeout(() => { $$('span span', t).forEach((x) => x.textContent = c); t.classList.remove('flipping'); }, 240); }); }
$$('[data-digits]').forEach((el) => buildDigits(el, el.dataset.digits));
$$('.lever button').forEach((b) => b.onclick = () => { $$('.lever button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const p = b.dataset.period; $$('.prices [data-pranzo]').forEach((d) => setDigits(d, d.dataset[p])); $('[data-note]').textContent = p === 'cena' ? 'Tutti i giorni · 19:00–23:30' : 'Lun–Ven · 12:00–15:00'; });

/* showcase */
const ITEMS = [
  ['nighiri-salmone-2-pz', 'Nigiri salmone', 'nigiri', 'Nigiri', 'Salmone norvegese sul riso tiepido.'], ['nighiri-tonno-2-pz', 'Nigiri tonno', 'nigiri', 'Nigiri', 'Tonno pinna gialla, un velo di wasabi.'], ['nighiri-gambero-rosso-2-pz', 'Nigiri gambero rosso', 'nigiri', 'Nigiri', 'Gambero di Mazara crudo, sale di Trapani.', 'top'], ['nighiri-anguilla-2-pz', 'Nigiri anguilla', 'nigiri', 'Nigiri', 'Anguilla laccata alla piastra.'],
  ['ura-salmone-8-pz', 'Uramaki salmone', 'roll', 'Roll', 'Salmone, avocado, sesamo.'], ['dragon-maki-8-pz', 'Dragon maki', 'roll', 'Roll', 'Anguilla, avocado, teriyaki.', 'top'], ['rainbow-maki-8-pz', 'Rainbow maki', 'roll', 'Roll', 'Quattro pesci sopra, gambero dentro.'], ['tiger-maki-8-pz', 'Tiger maki', 'roll', 'Roll', 'Gambero in tempura, salmone, spicy.'], ['ura-crispy-tuna-8-pz', 'Crispy tuna', 'roll', 'Roll', 'Tonno, cipolla croccante.'], ['hoso-salmone-8-pz', 'Hosomaki salmone', 'roll', 'Roll', 'Il classico, otto pezzi.'],
  ['sashimi-misto-10-pz', 'Sashimi misto', 'crudo', 'Crudo', 'Salmone, tonno, branzino: dieci fette.'], ['sashimi-salmone-10-pz', 'Sashimi salmone', 'crudo', 'Crudo', 'Solo il centro del filetto.'], ['tataki-salmone-10-pz', 'Tataki salmone', 'crudo', 'Crudo', 'Scottato, ponzu, cipollotto.'], ['tartare-salmone', 'Tartare salmone', 'crudo', 'Crudo', 'Salmone, avocado, sesamo.'], ['gunkan-salmon-ikura', 'Gunkan ikura', 'crudo', 'Crudo', 'Uova di salmone sul riso.'], ['gunkan-misto-6-pz', 'Gunkan misto', 'crudo', 'Crudo', 'Sei barchette, sei ripieni.'],
  ['chicken-gyoza-3pz', 'Gyoza', 'caldo', 'Caldo', 'Pollo e cavolo, alla piastra.'], ['ebi-fry', 'Ebi fry', 'caldo', 'Caldo', 'Gamberi impanati, salsa tonkatsu.'], ['ebi-kataifi', 'Ebi kataifi', 'caldo', 'Caldo', 'Gamberi in pasta kataifi.', 'top'], ['ramen-di-gamberi', 'Ramen di gamberi', 'caldo', 'Caldo', 'Brodo di crostacei, gamberi.'], ['yaki-udon', 'Yaki udon', 'caldo', 'Caldo', 'Udon saltati con verdure.'], ['bao-charsiu', 'Bao charsiu', 'caldo', 'Caldo', 'Maiale laccato nel panino al vapore.'], ['tacos-salmon-2-pz', 'Tacos salmon', 'caldo', 'Fusion', 'Salmone, avocado, maionese spicy.'], ['edamame', 'Edamame', 'caldo', 'Verde', 'Al vapore, sale marino.'],
  ['mochi-mango', 'Mochi mango', 'dolci', 'Dolce', 'Gelato al mango nel riso.'], ['dorayaki-al-cioccolato', 'Dorayaki', 'dolci', 'Dolce', 'Due pancake, crema al cioccolato.'],
];
const shelf = $('[data-shelf]'), scheda = $('[data-scheda]');
shelf.innerHTML = ITEMS.map(([f, n, c, cat, d, top], i) => `<button class="sample" type="button" data-i="${i}" data-category="${c}"><span class="ph"><img src="../assets/${f}.webp" alt="${n}" loading="lazy" width="240" height="240" /></span><h3>${n}</h3><small>${cat}</small>${top ? '<br><span class="tag">consigliato</span>' : ''}</button>`).join('');
$$('.tab').forEach((b) => b.onclick = () => { $$('.tab').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const f = b.dataset.filter; $$('.sample').forEach((el) => el.classList.toggle('hide', f !== 'tutti' && el.dataset.category !== f)); });
shelf.addEventListener('click', (e) => { const s = e.target.closest('.sample'); if (!s) return; const [f, n, , cat, d] = ITEMS[+s.dataset.i]; $('img', scheda).src = `../assets/${f}.webp`; $('[data-s-cat]', scheda).textContent = cat; $('[data-s-name]', scheda).textContent = n; $('[data-s-desc]', scheda).textContent = d; scheda.hidden = false; });
$('[data-s-close]').onclick = () => scheda.hidden = true;

/* stamp card: each tap is a round; the fifth stamp changes the footer */
{
  const grid = $('[data-sc-grid]'), foot = $('[data-sc-foot]'), card = $('[data-stampcard]'); let n = 0;
  grid.innerHTML = Array.from({ length: 10 }, () => '<i><span>済</span></i>').join('');
  const MSG = ['Giro 1: ordina fino a 5 piatti a persona. Arrivano freschi, poi si ricomincia.', 'Giro 2: la cucina è già sul pezzo. Nigiri e roll arrivano in 8 minuti.', 'Giro 3: prova la cucina calda, i gyoza si fanno aspettare volentieri.', 'Giro 4: sashimi. Il taglio è lo stesso della carta.', 'Giro 5: cinque giri in un’ora e mezza. La media del sabato.', 'Giro 6: il dolce lo metti nel giro o lo tieni per la fine?', 'Giro 7: nessuno arriva a sette. Tu sì.', 'Giro 8: mancano ancora venti minuti.', 'Giro 9: la tessera è quasi piena.', 'Giro 10: tessera piena. Il caffè lo offriamo noi.'];
  card.addEventListener('click', () => { n = n >= 10 ? 0 : n + 1; $$('i', grid).forEach((i, k) => i.classList.toggle('on', k < n)); foot.textContent = n ? MSG[n - 1] : MSG[0]; });
  if (!reduce) new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { [1, 2].forEach((k) => setTimeout(() => card.click(), 600 * k)); } }), { threshold: .5 }).observe(card);
}

const dlg = $('[data-booking]'), toast = $('[data-toast]');
$$('[data-open-booking]').forEach((b) => b.onclick = () => { if (nav.getAttribute('aria-hidden') === 'false') navBtn.click(); dlg.showModal(); });
$('[data-close-booking]').onclick = () => dlg.close(); dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('[data-booking-form]').onsubmit = (e) => { e.preventDefault(); dlg.close(); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); e.target.reset(); };
const day = $('input[name=day]'); { const d = new Date(); d.setDate(d.getDate() + 1); day.min = d.toISOString().slice(0, 10); }
const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }
