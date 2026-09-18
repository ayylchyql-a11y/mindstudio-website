const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;

/* ── Mobile nav ── */
const nav = $('[data-mobile-nav]'), navBtn = $('[data-menu-button]');
navBtn.onclick = () => {
  const open = navBtn.getAttribute('aria-expanded') !== 'true';
  navBtn.setAttribute('aria-expanded', open);
  navBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  nav.classList.toggle('open', open);
  nav.setAttribute('aria-hidden', !open);
  document.body.classList.toggle('lock', open);
};
$$('[data-nav-link]').forEach((a) => a.onclick = () => navBtn.click());

// today's date on the ticket, Italian format
$('[data-today]').textContent = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).replace('.', '');

/* ── Chapter strip ──
   One element per chapter per row, all stacked; only the current one is
   readable. Rewriting a single element's text would leave nothing to cross
   with — the old line has to still be on screen, on its way out. */
{
  const chapters = $$('[data-chapter]');
  const rows = [$('[data-roll="0"]'), $('[data-roll="1"]')];
  const cells = rows.map((row, r) => chapters.map((c) => {
    const el = document.createElement('span');
    el.className = 'roll';
    el.textContent = r === 0 ? c.dataset.n : c.dataset.chapter;
    row.appendChild(el);
    return el;
  }));
  const dots = $('[data-dots]');
  chapters.forEach(() => dots.appendChild(document.createElement('i')));
  const pips = [...dots.children];
  let chapter = -1;
  const show = (i) => {
    if (i === chapter) return;
    chapter = i;
    cells.forEach((row) => row.forEach((el, j) => { el.className = 'roll' + (j === i ? ' now' : j < i ? ' past' : ''); }));
    pips.forEach((p, j) => p.classList.toggle('on', j === i));
  };
  // The chapter is whichever section's top has crossed the strip's bottom
  // edge. Hysteresis of 40px: resting on a boundary (trackpad inertia does
  // this constantly) must not flip the headline back and forth.
  const HYST = 40;
  const update = () => {
    const line = 72 + 52;
    let next = 0;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top <= line + (i > chapter ? HYST : -HYST)) next = i; });
    if (chapter < 0 || next !== chapter) show(next);
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ── Cart ── */
const drawer = $('[data-cart]'), scrim = $('[data-scrim]'), toast = $('[data-toast]');
let cart = [];
const say = (text) => { toast.textContent = text; toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 1800); };
const BIN = `<svg viewBox="0 0 26 30" aria-hidden="true"><g class="lid"><rect x="1" y="4" width="24" height="3.2" rx="1.6" fill="currentColor"/><rect x="9.5" y="0.6" width="7" height="3" rx="1.5" fill="currentColor"/></g><g><clipPath><path d="M4.2 9.6h17.6l-1.7 18.2a2 2 0 0 1-2 1.8H7.9a2 2 0 0 1-2-1.8Z"/></clipPath><path d="M4.2 9.6h17.6l-1.7 18.2a2 2 0 0 1-2 1.8H7.9a2 2 0 0 1-2-1.8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect class="fill" x="4" y="9" width="18" height="21" fill="currentColor"/></g></svg>`;
const WORD = 'Rimuovi';
// lid opens 150 · first glyph leaves at 180 · one every 125 · flight 300 ·
// then a beat, then the pill collapses to a circle and the row goes
const LID = 150, LEAD = LID + 30, STAGGER = 125, FLIGHT = 300, SETTLE = 180, COLLAPSE = 330;
const EAT_TOTAL = LEAD + STAGGER * (WORD.length - 1) + FLIGHT;

function eatButton(onDone) {
  const slot = document.createElement('span'); slot.className = 'slot';
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'del'; btn.setAttribute('aria-label', 'Rimuovi');
  const bin = document.createElement('span'); bin.className = 'bin'; bin.innerHTML = BIN;
  // each button needs its own clipPath id or the second one silently inherits the first's
  const uid = 'c' + Math.random().toString(36).slice(2, 8);
  bin.querySelector('clipPath').id = uid;
  bin.querySelector('.fill').setAttribute('clip-path', `url(#${uid})`);
  const label = document.createElement('span'); label.className = 'label'; label.setAttribute('aria-hidden', 'true');
  [...WORD].forEach((ch) => { const s = document.createElement('span'); s.textContent = ch; label.appendChild(s); });
  btn.append(bin, label); slot.appendChild(btn);
  const glyphs = [...label.children], fill = bin.querySelector('.fill');
  let running = false;
  btn.addEventListener('click', () => {
    if (running) return; running = true;
    if (reduce) { onDone(); return; }
    // per-glyph flight distance: from where it sits now to the bin's mouth, read once at click time
    const mouth = bin.getBoundingClientRect();
    glyphs.forEach((g, i) => {
      const r = g.getBoundingClientRect();
      g.style.setProperty('--fly', `${mouth.left + mouth.width / 2 - (r.left + r.width / 2)}px`);
      g.style.setProperty('--spin', `${(i % 2 ? -1 : 1) * (170 + i * 26)}deg`);
      const start = LEAD + i * STAGGER;
      g.style.transitionDelay = `${start}ms, ${start + 180}ms`;
      setTimeout(() => { fill.style.transform = `scaleY(${(i + 1) / glyphs.length * 0.62})`; }, start + FLIGHT * 0.75);
    });
    btn.classList.add('eating');
    setTimeout(() => btn.classList.add('collapsed'), EAT_TOTAL + SETTLE);
    setTimeout(onDone, EAT_TOTAL + SETTLE + COLLAPSE + 120);
  });
  return slot;
}

function render() {
  const count = cart.length, total = cart.reduce((s, x) => s + x.price, 0);
  $('[data-cart-count]').textContent = count;
  $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Apri carrello, ${count} articoli`));
  $('[data-cart-total]').textContent = euro(total);
  $('[data-checkout]').disabled = !count;
  const box = $('[data-cart-items]');
  box.replaceChildren();
  if (!count) { box.innerHTML = '<div class="empty"><h3>Carrello vuoto</h3><p>Prendi qualcosa dal banco o componi la tua bowl.</p></div>'; return; }
  cart.forEach((x, i) => {
    const row = document.createElement('div'); row.className = 'cart-item';
    row.innerHTML = `<span>${x.name}${x.detail ? `<small>${x.detail}</small>` : ''}</span><b>${euro(x.price)}</b>`;
    row.appendChild(eatButton(() => { cart.splice(i, 1); render(); }));
    box.appendChild(row);
  });
}
$$('[data-add]').forEach((b) => b.onclick = () => { cart.push({ name: b.dataset.name, price: +b.dataset.price }); render(); say('Aggiunto al carrello'); });
const openCart = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show'); document.body.classList.add('lock'); };
const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show'); document.body.classList.remove('lock'); };
$$('[data-open-cart]').forEach((b) => b.onclick = openCart);
$('[data-close-cart]').onclick = closeCart;
scrim.onclick = closeCart;
$('[data-checkout]').onclick = () => say('✓ Demo: ordine confermato');
render();

/* ── The board: filter tabs re-sort the cards with FLIP ──
   First: measure where every card is. Last: move the DOM to the new order.
   Invert: transform each card back to where it was. Play: drop the transform
   and let the transition carry it home. The DOM order is the truth. */
{
  const board = $('[data-board]'), tabs = $('[data-tabs]');
  const cards = $$('.card', board);
  const byPrice = (a, b) => +a.dataset.price - +b.dataset.price;
  const TABS = [
    ['Tutte', (c) => c],
    ['Pesce', (c) => c.filter((x) => x.dataset.tags.includes('pesce')).concat(c.filter((x) => !x.dataset.tags.includes('pesce')))],
    ['Veg', (c) => c.filter((x) => x.dataset.tags.includes('veg')).concat(c.filter((x) => !x.dataset.tags.includes('veg')))],
    ['Piccanti', (c) => c.filter((x) => x.dataset.tags.includes('piccante')).concat(c.filter((x) => !x.dataset.tags.includes('piccante')))],
    ['Prezzo ↑', (c) => [...c].sort(byPrice)],
  ];
  const buttons = TABS.map(([name], i) => {
    const b = document.createElement('button'); b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = name;
    b.onclick = () => setTab(i); tabs.appendChild(b); return b;
  });
  function setTab(i) {
    buttons.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    const order = TABS[i][1](cards);
    const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));         // First
    order.forEach((c) => board.appendChild(c));                                       // Last
    order.forEach((c, k) => {
      c.classList.toggle('dark', k === 0);
      $('.card-n', c).textContent = String(k + 1).padStart(2, '0');
      const now = c.getBoundingClientRect(), was = first.get(c);                       // Invert
      const dx = was.left - now.left, dy = was.top - now.top;
      if (reduce || (!dx && !dy)) return;
      c.classList.add('moving'); c.style.transform = `translate(${dx}px, ${dy}px)`;
      c.getBoundingClientRect();                                                       // flush
      c.classList.remove('moving'); c.style.transform = '';                             // Play
    });
  }
  setTab(0);
}

/* ── Compose: chips write the receipt ── */
{
  const state = { base: 'Riso sushi', proteina: 'Salmone', extra: 0, topping: [], salsa: 'Soia', formato: 'Regular', prezzo: 11.9 };
  const groups = $$('[data-group]');
  groups.forEach((g) => {
    const multi = g.hasAttribute('data-multi'), key = g.dataset.group;
    $$('button', g).forEach((b) => b.onclick = () => {
      if (multi) {
        const v = b.dataset.pick, i = state.topping.indexOf(v);
        if (i >= 0) state.topping.splice(i, 1); else state.topping.push(v);
        const on = i < 0; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      } else {
        $$('button', g).forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
        state[key] = b.dataset.pick;
        if (key === 'proteina') state.extra = +b.dataset.extra;
        if (key === 'formato') state.prezzo = +b.dataset.base;
      }
      print();
    });
  });
  const total = () => state.prezzo + state.extra + Math.max(0, state.topping.length - 4);
  function print() {
    const rows = [
      [`Bowl ${state.formato.toLowerCase()}`, euro(state.prezzo)],
      [`Base · ${state.base}`, 'incl.'],
      [`Proteina · ${state.proteina}`, state.extra ? '+ ' + euro(state.extra) : 'incl.'],
      ...state.topping.map((t, i) => [`Topping · ${t}`, i < 4 ? 'incl.' : '+ € 1,00', i >= 4]),
      [`Salsa · ${state.salsa}`, 'incl.'],
    ];
    $('[data-receipt]').innerHTML = rows.map(([n, p, x]) => `<li${x ? ' class="extra"' : ''}><span>${n}</span><i></i><b>${p}</b></li>`).join('');
    const extra = Math.max(0, state.topping.length - 4);
    $('[data-topping-count]').textContent = `${Math.min(4, state.topping.length)} / 4${extra ? ` · +${extra}` : ''}`;
    $('[data-total]').textContent = euro(total());
  }
  $('[data-add-custom]').onclick = () => {
    cart.push({ name: `Bowl ${state.formato.toLowerCase()} a modo tuo`, detail: [state.base, state.proteina, ...state.topping, state.salsa].join(', '), price: total() });
    render(); say('La tua bowl è nel carrello');
  };
  print();
}
