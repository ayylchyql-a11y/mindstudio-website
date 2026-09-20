/* Mizu Infinity · Loop — marquees, counters, the price flip, the belts and your round. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

/* marquees: the text repeated until it is at least twice the viewport, then the track slides by half */
$$('[data-marquee]').forEach((t) => { const w = t.dataset.marquee; let s = ''; while (s.length < 120) s += w + ' '; t.innerHTML = `<span>${s}</span><span>${s}</span>`; });
/* counters count up when they enter */
{ const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target); const b = e.target, to = +b.dataset.count, suf = b.dataset.suffix || ''; if (reduce) { b.textContent = to + suf; return; } const t0 = performance.now(); (function tick(now) { const t = Math.min(1, (now - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - t, 3))); b.textContent = v + suf; if (t < 1) requestAnimationFrame(tick); })(t0); }), { threshold: .5 }); $$('[data-count]').forEach((b) => io.observe(b)); }
/* price switch */
$$('.switch button').forEach((b) => b.onclick = () => { $$('.switch button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); const cena = b.dataset.period === 'cena'; $('.switch').classList.toggle('cena', cena); $('[data-flip]').classList.toggle('cena', cena); });

/* belts: the real menu, three rows */
const PLATES = [
  [['nighiri-salmone-2-pz', 'Nigiri salmone', 'Nigiri'], ['nighiri-tonno-2-pz', 'Nigiri tonno', 'Nigiri'], ['nighiri-gambero-rosso-2-pz', 'Nigiri gambero rosso', 'Nigiri'], ['nighiri-anguilla-2-pz', 'Nigiri anguilla', 'Nigiri'], ['gunkan-salmon-ikura', 'Gunkan ikura', 'Gunkan'], ['gunkan-misto-6-pz', 'Gunkan misto', 'Gunkan'], ['temaki-salmone', 'Temaki salmone', 'Temaki'], ['hoso-salmone-8-pz', 'Hosomaki salmone', 'Hosomaki']],
  [['ura-salmone-8-pz', 'Uramaki salmone', 'Uramaki'], ['dragon-maki-8-pz', 'Dragon maki', 'Special'], ['rainbow-maki-8-pz', 'Rainbow maki', 'Special'], ['tiger-maki-8-pz', 'Tiger maki', 'Special'], ['ura-crispy-tuna-8-pz', 'Crispy tuna', 'Uramaki'], ['sashimi-misto-10-pz', 'Sashimi misto', 'Sashimi'], ['sashimi-salmone-10-pz', 'Sashimi salmone', 'Sashimi'], ['tataki-salmone-10-pz', 'Tataki salmone', 'Sashimi'], ['tartare-salmone', 'Tartare salmone', 'Tartare']],
  [['chicken-gyoza-3pz', 'Gyoza', 'Caldo'], ['ebi-fry', 'Ebi fry', 'Caldo'], ['ebi-kataifi', 'Ebi kataifi', 'Caldo'], ['ramen-di-gamberi', 'Ramen di gamberi', 'Caldo'], ['yaki-udon', 'Yaki udon', 'Caldo'], ['bao-charsiu', 'Bao charsiu', 'Caldo'], ['tacos-salmon-2-pz', 'Tacos salmon', 'Fusion'], ['edamame', 'Edamame', 'Verde'], ['zuppa-di-miso', 'Zuppa di miso', 'Caldo'], ['mochi-mango', 'Mochi mango', 'Dolce'], ['dorayaki-al-cioccolato', 'Dorayaki', 'Dolce']],
];
const rows = $('[data-rows]');
rows.innerHTML = PLATES.map((row, r) => { const html = row.map(([f, n, c]) => `<button class="plate" type="button" data-id="${f}" data-name="${n}"><span class="n"></span><span class="add">+</span><span class="ph"><img src="../assets/${f}.webp" alt="${n}" loading="lazy" width="300" height="300" /></span><h3>${n}</h3><small>${c}</small></button>`).join(''); return `<div class="row"><div class="track" style="--d:${[64, 72, 68][r]}s">${html}${html}</div></div>`; }).join('');

/* your round: the same plate may appear twice on a belt (the loop copy) — both mirror one count */
const drawer = $('[data-round]'), scrim = $('[data-scrim]'), list = $('[data-round-list]'), empty = $('[data-round-empty]'), tot = $('[data-round-tot]'), count = $('[data-round-count]'), roundN = $('[data-round-n]'), toast = $('[data-toast]');
const picks = new Map(); let round = 1;
function paint() {
  list.innerHTML = [...picks.entries()].map(([id, p]) => `<li data-id="${id}"><img src="../assets/${id}.webp" alt="" /><span>${p.name}</span><span class="q"><button type="button" data-dec>−</button><b>${p.q}</b><button type="button" data-inc>+</button></span></li>`).join('');
  const n = [...picks.values()].reduce((a, p) => a + p.q, 0);
  count.textContent = n; tot.textContent = `${n} ${n === 1 ? 'piatto' : 'piatti'}`; empty.classList.toggle('hide', n > 0);
  $$('.plate').forEach((pl) => { const p = picks.get(pl.dataset.id); pl.classList.toggle('picked', !!p); $('.n', pl).textContent = p ? p.q : ''; });
}
rows.addEventListener('click', (e) => { const pl = e.target.closest('.plate'); if (!pl) return; const p = picks.get(pl.dataset.id) || { name: pl.dataset.name, q: 0 }; p.q++; picks.set(pl.dataset.id, p); paint(); });
list.addEventListener('click', (e) => { const li = e.target.closest('li'); if (!li) return; const p = picks.get(li.dataset.id); if (e.target.closest('[data-inc]')) p.q++; if (e.target.closest('[data-dec]')) { p.q--; if (p.q <= 0) picks.delete(li.dataset.id); } paint(); });
const open = () => { drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); }, close = () => { drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); };
$$('[data-open-round]').forEach((b) => b.onclick = open); $('[data-close-round]').onclick = close; scrim.onclick = close;
const say = (t, b) => { $('[data-toast-title]').textContent = t; $('[data-toast-body]').textContent = b; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3200); };
$('[data-send-round]').onclick = () => { const n = [...picks.values()].reduce((a, p) => a + p.q, 0); if (!n) return; close(); say(`Giro ${round} in cucina`, `${n} piatti in arrivo. Il giro ${round + 1} quando vuoi.`); round++; roundN.textContent = round; picks.clear(); paint(); };

/* accordion */
$$('[data-acc] article').forEach((a) => { const b = $('button', a), ans = $('.ans', a); b.onclick = () => { const open = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', !open); ans.hidden = open; $('i', b).textContent = open ? '+' : '−'; }; });
/* booking */
const dlg = $('[data-booking]');
$$('[data-open-booking]').forEach((b) => b.onclick = () => { if (nav.getAttribute('aria-hidden') === 'false') navBtn.click(); dlg.showModal(); });
$('[data-close-booking]').onclick = () => dlg.close(); dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('[data-booking-form]').onsubmit = (e) => { e.preventDefault(); dlg.close(); say('Tavolo richiesto', 'Confermiamo via email entro un’ora.'); e.target.reset(); };
const day = $('input[name=day]'); { const d = new Date(); d.setDate(d.getDate() + 1); day.min = d.toISOString().slice(0, 10); }

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }
paint();
