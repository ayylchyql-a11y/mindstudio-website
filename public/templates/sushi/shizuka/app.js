/* Mumi Sushi · Shizuka — enso, scroll progress, the twelve courses (slow crossfade), the carta with a ghost photo, a quiet form. */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => { const open = navBtn.getAttribute('aria-expanded') !== 'true'; navBtn.setAttribute('aria-expanded', open); nav.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; };
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());
requestAnimationFrame(() => $('[data-enso]').classList.add('draw'));
const prog = $('[data-progress]'); addEventListener('scroll', () => { const h = document.documentElement; prog.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight)})`; }, { passive: true });

/* the courses: real plates; one at a time, 5s each, a hairline that fills; the next image is preloaded into the second layer */
const COURSES = [
  ['hd-nigiri-salmone-2', 'Nigiri di salmone', 'Salmone norvegese, riso a temperatura del corpo, un filo di soia stagionata.'],
  ['hd-sashimi-vetro', 'Sashimi sul vetro', 'Tonno, branzino e ricciola tagliati al momento, con wasabi grattugiato.'],
  ['hd-tartare-ardesia', 'Tartare sull’ardesia', 'Tonno rosso, olio al sesamo, cipollotto, un tuorlo marinato.'],
  ['hd-gunkan-ikura', 'Gunkan ikura', 'Uova di salmone sul riso, nori tostata al momento.'],
  ['hd-nigiri-gambero', 'Nigiri di gambero', 'Gambero rosso di Mazara appena scottato, sale di Trapani.'],
  ['hd-tempura', 'Tempura', 'Gambero e verdure di stagione in pastella leggera, sale e limone.'],
  ['hd-uramaki', 'Uramaki', 'Salmone e avocado, riso fuori, sesamo nero.'],
  ['hd-sashimi-box', 'La scatola', 'Il sashimi nella scatola di legno: quello che è arrivato stamattina.'],
  ['hd-tartare-coppe', 'Le coppe', 'Due tartare, due temperature, un cucchiaio.'],
  ['hd-sashimi-piatto', 'Il piatto grande', 'Per due: il taglio del giorno, servito insieme.'],
  ['hd-nigiri-salmone', 'Nigiri, di nuovo', 'Il salmone che chiude il percorso, scottato e con un filo di tartufo.'],
  ['hd-uramaki', 'Il dolce', 'Mochi al tè verde, fatto in casa, con una fetta di pera.'],
];
{
  const img = $('[data-course-img]'), next = $('[data-course-img-next]'), frame = $('.course-frame'), num = $('[data-course-num]'), line = $('[data-course-line]'), name = $('[data-course-name]'), desc = $('[data-course-desc]'), dots = $('[data-course-dots]');
  $('[data-course-tot]').textContent = String(COURSES.length).padStart(2, '0');
  dots.innerHTML = COURSES.map((_, i) => `<button type="button" role="tab" aria-label="Portata ${i + 1}" class="${i === 0 ? 'on' : ''}"></button>`).join('');
  let cur = 0, timer = 0;
  const go = (i) => {
    cur = (i + COURSES.length) % COURSES.length; const [f, n, d] = COURSES[cur];
    next.src = `../assets/${f}-s.jpg`; frame.classList.add('swap');
    setTimeout(() => { img.src = next.src; frame.classList.remove('swap'); }, reduce ? 0 : 1400);
    num.textContent = String(cur + 1).padStart(2, '0'); name.textContent = n; desc.textContent = d;
    $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === cur));
    line.classList.add('reset'); line.style.setProperty('--p', '0%'); void line.offsetWidth; line.classList.remove('reset'); line.style.setProperty('--p', '100%');
    clearTimeout(timer); if (!reduce) timer = setTimeout(() => go(cur + 1), 5000);
  };
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go($$('button', dots).indexOf(b)); });
  line.style.setProperty('--p', '100%'); if (!reduce) timer = setTimeout(() => go(1), 5000);
}

/* the carta */
const CARTA = {
  'Nigiri': [['nigiri-salmone', 'Salmone', '2 pezzi', 3.5], ['nigiri-tonno', 'Tonno', '2 pezzi', 4.5], ['nigiri-gambero-rosso', 'Gambero rosso', '2 pezzi · Mazara', 5], ['nigiri-anguilla', 'Anguilla', '2 pezzi, laccata', 5], ['nigiri-branzino', 'Branzino', '2 pezzi, yuzu', 4], ['nigiri-tartufo', 'Salmone e tartufo', '4 pezzi', 8]],
  'Crudo': [['sashimi-salmone', 'Sashimi di salmone', '10 fette', 12], ['sashimi-tonno-10-pz', 'Sashimi di tonno', '10 fette', 15], ['tataki-salmone-10-pz', 'Tataki di salmone', 'scottato, ponzu', 13], ['tartare-tonno', 'Tartare di tonno', 'tobiko, sesamo', 10], ['gunkan-ikura', 'Gunkan ikura', '2 pezzi', 6], ['gunkan-misto-6-pz', 'Gunkan misto', '6 pezzi', 15]],
  'Rotoli': [['ura-salmone', 'Uramaki salmone', '8 pezzi', 9], ['dragon-maki', 'Dragon', 'anguilla, avocado', 13], ['rainbow-maki-8-pz', 'Rainbow', 'quattro pesci', 13], ['hoso-cetriolo', 'Hosomaki cetriolo', '8 pezzi', 4], ['temaki-salmone', 'Temaki salmone', 'un cono', 4.5]],
  'Caldo e dolce': [['miso', 'Zuppa di miso', 'dashi, tofu', 2.5], ['ebi-kataifi', 'Ebi kataifi', 'gamberi croccanti', 6], ['gyoza', 'Gyoza', '3 pezzi', 3.5], ['xiao-long-bao', 'Xiao long bao', '3 pezzi', 4], ['mochi', 'Mochi', 'gusto del giorno', 2], ['dorayaki', 'Dorayaki', 'cioccolato', 3.5]],
};
const carta = $('[data-carta]'), ghost = $('[data-ghost]'), ghostImg = $('img', ghost);
carta.innerHTML = Object.entries(CARTA).map(([cat, list]) => `<div class="cat"><h3>${cat}</h3>${list.map(([f, n, d, p]) => `<div class="line" data-img="${f}"><span>${n}<small>${d}</small></span><b>${euro(p)}</b></div>`).join('')}</div>`).join('');
{
  let gx = 0, gy = 0, tx = 0, ty = 0, on = false;
  $$('.line', carta).forEach((l) => { l.addEventListener('pointerenter', () => { ghostImg.src = `../assets/${l.dataset.img}.webp`; ghost.classList.add('on'); on = true; }); l.addEventListener('pointerleave', () => { ghost.classList.remove('on'); on = false; }); });
  addEventListener('pointermove', (e) => { tx = e.clientX + 120; ty = e.clientY; if (!on) { gx = tx; gy = ty; } });
  (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; ghost.style.left = gx + 'px'; ghost.style.top = gy + 'px'; requestAnimationFrame(loop); })();
}

const items = $$('.reveal');
if (reduce) items.forEach((x) => x.classList.add('show'));
else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -40px' }); items.forEach((x) => io.observe(x)); }
$('[data-form]').onsubmit = (e) => { e.preventDefault(); $('[data-sent]').classList.add('show'); e.target.reset(); setTimeout(() => $('[data-sent]').classList.remove('show'), 5000); };
const day = $('input[name=day]'); { const d = new Date(); d.setDate(d.getDate() + 1); day.min = d.toISOString().slice(0, 10); }
