/* Design 07 · Sala di comando — dark glass over one ambient light.
   Screens: Panoramica (KPIs with sparklines, 30-day heatmap, channel share ring,
   orders per hour, live feed, top dishes), Ordini (a kanban you advance column by
   column, magnetic buttons), Menu (search from the command bar, chips, sold-out).
   Library parts: streak-heatmap · share-ring · magnetic-button · command-bar (goo) · aurora-drift. */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const nav = $('#rail nav'), view = $('#view'), title = $('#title'), rail = $('#rail'), scrim = $('#scrim');
const q = $('#q'), cmd = $('#cmd'), res = $('#res');
let current = 'panoramica', menuQuery = '', menuCat = '', hit = '';

nav.innerHTML = B.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}">${B.icon(n.id, 19)}<span>${n.label}</span></a>`).join('');

/* ── clock: real time, so two people looking at the demo see it move ── */
const clock = $('#clock');
const tickClock = () => { clock.textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); };
tickClock(); setInterval(tickClock, 10000);
$('#pause').addEventListener('click', (e) => e.currentTarget.classList.toggle('live'));

/* ── screens ── */
function spark(vals, i) {
  const W = 84, H = 30, lo = Math.min(...vals), hi = Math.max(...vals) || 1;
  const pts = vals.map((v, k) => [k * W / (vals.length - 1), H - 2 - (v - lo) / (hi - lo || 1) * (H - 4)]);
  const last = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}"><path d="${B.smooth(pts)}" style="--d:${i * 120}ms"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5"/></svg>`;
}
function kpis() {
  const t = B.today, last7 = B.days.slice(-7);
  const cell = (label, val, delta, vals, i, sub = 'vs media 7 gg') => `<div class="card kpi"><h3>${label}</h3><div><b>${val}</b><small class="${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(0)}% ${sub}</small></div>${spark(vals, i)}</div>`;
  return `<div class="kpis">
    ${cell('Incasso oggi', B.euro0(t.rev), B.delta(t.rev, B.avg7('rev')), last7.map((d) => d.rev), 0)}
    ${cell('Ordini oggi', t.n, B.delta(t.n, B.avg7('n')), last7.map((d) => d.n), 1)}
    ${cell('Scontrino medio', B.euro(t.rev / t.n), B.delta(t.rev / t.n, B.avg7('rev') / B.avg7('n')), last7.map((d) => d.rev / d.n), 2)}
    <div class="card kpi"><h3>Tempo di preparazione</h3><div><b>${D.stats.prepMin} min</b><small>mediana, ultimi 7 giorni</small></div>${spark([19, 18, 17, 18, 16, 17, 17], 3)}</div>
  </div>`;
}
const LEVELS = ['#1c2530', '#1f4d4e', '#237a72', '#28a894', '#2fd3b8'];
function overview() {
  const s = D.stats, peak = Math.max(...s.hours.map((x) => x[1]));
  const total = B.days.reduce((a, d) => a + d.n, 0);
  return `${kpis()}
  <div class="r3">
    <div class="card" data-showcase><h3>Ordini · 30 giorni <span class="note">tocca un giorno</span></h3>
      <div class="heat" style="--cell:27px"><div class="dow"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div><div class="grid" id="heat"></div></div>
      <div class="heat-foot"><div class="legend-s">Meno ${LEVELS.map((c) => `<i style="background:${c}"></i>`).join('')} Più</div><div class="best" id="best"></div></div>
      <div class="pop" id="pop"><div class="d" id="pd"></div><div class="n"><b id="pn"></b><span>ordini</span></div><div class="e" id="pe"></div><div class="bars" id="pb"></div></div>
    </div>
    <div class="card"><h3>Canali</h3>
      <div class="ring-wrap"><svg class="ring" viewBox="0 0 150 150" id="ring"><g id="slices"></g><g class="centre" id="centre"><text class="c1" x="75" y="73" id="c1">${total}</text><text class="c2" x="75" y="87" id="c2">ordini · 30 gg</text></g></svg><div class="legend" id="legend"></div></div>
    </div>
    <div class="card"><h3>Ordini per ora</h3>
      <div class="hours">${s.hours.map(([h, n], i) => `<i style="--h:${n / peak * 100}%;--i:${i}" data-h="${h}" class="${n === peak ? 'peak' : ''}"></i>`).join('')}</div><div class="hours-pad"></div>
      <p class="hours-note">Due picchi: pranzo 12–13, cena 19–20. Il ${Math.round(s.hours.filter(([h]) => h >= 18).reduce((a, x) => a + x[1], 0) / s.hours.reduce((a, x) => a + x[1], 0) * 100)}% degli ordini arriva la sera.</p>
    </div>
  </div>
  <div class="r2">
    <div class="card"><h3>Ultimi ordini <span class="note">in diretta</span></h3>
      <table class="feed">${B.orders.slice(0, 7).map((o) => `<tr><td class="t">${o.t}</td><td class="n">#${o.short}</td><td><span class="tag" style="--c:${o.col}">${o.ch}</span></td><td>${o.type}</td><td>${o.name}</td><td class="e">${B.euro(o.total)}</td></tr>`).join('')}</table>
    </div>
    <div class="card"><h3>Piatti più venduti</h3><div class="dishes">${D.top.map(([name, cat, img, n]) => `<div class="dish"><img src="../_mdesk/${img}" alt="" loading="lazy"><div>${name}<span>${cat}</span></div><b>${n}</b><div class="bar"><i style="--w:${n / D.top[0][3] * 100}%"></i></div></div>`).join('')}</div></div>
  </div>
  <p class="note">Dati dimostrativi: piatti, prezzi e foto sono quelli veri del menù; incassi e quantità sono ridimensionati.</p>`;
}
function wireOverview(root) {
  // heatmap — a calendar of the 30 days: columns are weeks, rows Monday→Sunday
  const grid = $('#heat', root), pop = $('#pop', root), card = grid.closest('.card');
  const max = Math.max(...B.days.map((d) => d.n));
  const first = new Date(B.days[0].d + 'T12:00:00'), lead = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) { const e = document.createElement('i'); e.className = 'cell empty'; e.style.setProperty('--col', 0); grid.appendChild(e); }
  let best = B.days[0];
  B.days.forEach((d, i) => {
    if (d.n > best.n) best = d;
    const lvl = Math.min(4, Math.floor(d.n / max * 4.999));
    const e = document.createElement('i'); e.className = 'cell'; e.style.setProperty('--c', LEVELS[lvl]); e.style.setProperty('--col', Math.floor((i + lead) / 7));
    e.dataset.i = i; e.addEventListener('click', () => open(e)); grid.appendChild(e); cells.push(e);
  });
  $('#best', root).innerHTML = `<small>giorno migliore</small><b>${B.dateIt(best.d)} · ${best.n} ordini</b>`;
  let cur = null;
  function open(cell) {
    if (cur === cell) { cur.classList.remove('on'); cur = null; pop.classList.remove('show'); return; }
    cur && cur.classList.remove('on'); cur = cell; cell.classList.add('on');
    const d = B.days[+cell.dataset.i];
    $('#pd', root).textContent = B.dateIt(d.d, { weekday: 'short', day: 'numeric', month: 'short' });
    $('#pn', root).textContent = d.n; $('#pe', root).textContent = B.euro0(d.rev);
    const lvl = Math.min(4, Math.floor(d.n / max * 4.999));
    $('#pb', root).innerHTML = [0, 1, 2, 3].map((k) => `<i class="${k < lvl ? '' : 'off'}"></i>`).join('');
    const r = cell.getBoundingClientRect(), c = card.getBoundingClientRect();
    const left = r.left - c.left + r.width / 2 < c.width / 2 ? r.right - c.left + 10 : r.left - c.left - 10 - 140;
    pop.style.left = left + 'px'; pop.style.top = (r.top - c.top + r.height / 2 - 30) + 'px';
    pop.classList.add('show');
  }
  setTimeout(() => open(cells[B.days.indexOf(best)]), reduce ? 0 : 1400);

  // share ring
  const g = $('#slices', root), legend = $('#legend', root), ring = $('#ring', root), centre = $('#centre', root), c1 = $('#c1', root), c2 = $('#c2', root);
  const parts = D.stats.channels, tot = parts.reduce((a, [, n]) => a + n, 0), R = 52, C = 2 * Math.PI * R, GAP = 2.5;
  let acc = 0, delay = 0;
  const slices = parts.map(([name, n], i) => {
    const pct = n / tot * 100, col = B.CH[name][0];
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.setAttribute('cx', 75); el.setAttribute('cy', 75); el.setAttribute('r', R); el.setAttribute('stroke', col); el.setAttribute('class', 'slice'); el.setAttribute('transform-origin', '75 75');
    const len = Math.max(0, C * (pct - GAP) / 100);
    el.style.rotate = `${-90 + acc * 3.6}deg`; el.style.strokeDasharray = `${len} ${C}`; el.style.strokeDashoffset = reduce ? 0 : len;
    const local = (pct / 2) * 3.6 * Math.PI / 180;   // push direction in the slice's own rotated frame
    el.style.setProperty('--dx', `${6 * Math.cos(local)}px`); el.style.setProperty('--dy', `${6 * Math.sin(local)}px`);
    acc += pct; g.appendChild(el);
    setTimeout(() => el.style.strokeDashoffset = 0, delay); delay += 600 * pct / 100 + 60;
    const l = document.createElement('div'); l.style.setProperty('--c', col); l.innerHTML = `<i></i>${name}<b>${Math.round(pct)}%</b>`; legend.appendChild(l);
    el.addEventListener('pointerenter', () => pick(i)); el.addEventListener('pointerleave', () => pick(-1));
    l.addEventListener('pointerenter', () => pick(i)); l.addEventListener('pointerleave', () => pick(-1));
    return { el, l, name, pct };
  });
  let timer = 0;
  function pick(i) {
    slices.forEach((s, k) => { s.el.classList.toggle('out', k === i); s.l.classList.toggle('on', k === i); });
    ring.classList.toggle('pick', i >= 0); legend.classList.toggle('pick', i >= 0);
    clearTimeout(timer); centre.classList.add('swap');
    timer = setTimeout(() => { c1.textContent = i < 0 ? tot : Math.round(slices[i].pct) + '%'; c2.textContent = i < 0 ? 'ordini · 30 gg' : slices[i].name; centre.classList.remove('swap'); }, reduce ? 0 : 160);
  }
}

/* ── board: four columns, a card advances one column per click ── */
const COLS = [[0, '#f2b63b'], [1, '#2fd3b8'], [2, '#e07a2f'], [3, '#3ccf8e']];
const orderCard = (o) => `<article class="card order" style="--c:${o.col}" data-num="${o.num}">
  <div class="head"><b>#${o.short}</b><span class="tag" style="--c:${o.col}">${o.ch}${o.code ? ' · ' + o.code : ''}</span><span class="t">${o.t}</span></div>
  <div class="who">${o.name} · ${o.type}${o.status === 0 && o.minutes > 8 ? ` · <span class="late">in attesa da ${o.minutes} min</span>` : ''}</div>
  <ul>${o.items.map((x) => `<li><span>${x.q}×</span>${x.p.name}</li>`).join('')}</ul>
  <div class="foot"><b>${B.euro(o.total)}</b>${o.status < 4 ? `<button class="btn primary magnet" data-next type="button">→ ${B.STATUS[o.status + 1]}</button>` : ''}</div></article>`;
function board() {
  const closed = B.orders.filter((o) => o.status >= 4).length;
  return `<div class="kan">${COLS.map(([s, c]) => `<div class="col" data-s="${s}"><h3><i style="--c:${c}"></i>${B.STATUS[s]}<b>${B.orders.filter((o) => o.status === s).length}</b></h3>${B.orders.filter((o) => o.status === s).map(orderCard).join('')}</div>`).join('')}</div>
  <p class="note" style="margin-top:12px">${closed} ${closed === 1 ? 'ordine chiuso' : 'ordini chiusi'} in questo turno · ogni click porta la scheda alla colonna successiva.</p>`;
}
function wireBoard(root) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-next]'); if (!b) return;
    const card = b.closest('.order'), o = B.orders.find((x) => x.num === card.dataset.num);
    o.status = Math.min(5, o.status + 1);
    if (o.status === 4 && o.type !== 'Consegna') o.status = 5;
    card.style.transition = 'opacity 180ms, transform 180ms'; card.style.opacity = '0'; card.style.transform = 'translateX(16px)';
    setTimeout(() => { view.innerHTML = board(); wireBoard(view); magnetize(view); }, reduce ? 0 : 180);
  });
}
/* magnetic buttons: one listener on the root, every .magnet inside a 40px catchment follows the pointer by 30% */
function magnetize(root) {
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  const RADIUS = 40, PULL = .3, applied = new Map();
  const set = (el, x, y, on) => { applied.set(el, [x, y]); el.classList.toggle('tracking', on); el.style.setProperty('--mx', x.toFixed(2) + 'px'); el.style.setProperty('--my', y.toFixed(2) + 'px'); };
  root.addEventListener('pointermove', (e) => {
    root.querySelectorAll('.magnet').forEach((el) => {
      const [ax, ay] = applied.get(el) || [0, 0], r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2 - ax), dy = e.clientY - (r.top + r.height / 2 - ay);
      const inside = Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS;
      if (inside) set(el, dx * PULL, dy * PULL, true); else if (ax || ay) set(el, 0, 0, false);
    });
  });
  root.addEventListener('pointerleave', () => root.querySelectorAll('.magnet').forEach((el) => set(el, 0, 0, false)));
}

/* ── menu ── */
function menu() {
  const cats = [...new Set(D.menu.map((p) => p.cat))];
  return `<div class="menu-top"><div class="cats" id="cats"><span class="chip ${menuCat ? '' : 'on'}" data-c="">Tutti</span>${cats.map((c) => `<span class="chip ${menuCat === c ? 'on' : ''}" data-c="${c}">${c}</span>`).join('')}</div><span class="note" id="mcount"></span></div>
  <div class="mgrid" id="grid">${D.menu.map((p, i) => `<article class="card prod ${hit === p.name ? 'hit' : ''}" data-i="${i}"><img src="../_mdesk/${p.img}" alt="${p.name}" loading="lazy"><div class="pb"><small>${p.code ? p.code + ' · ' : ''}${p.cat}</small><h4>${p.name}</h4><div class="pf"><b>${B.euro(p.price)}</b><button type="button" data-out>Esaurito</button></div></div></article>`).join('')}</div>`;
}
function wireMenu(root) {
  const grid = $('#grid', root);
  grid.addEventListener('click', (e) => { const b = e.target.closest('[data-out]'); if (!b) return; const c = b.closest('.prod'); c.classList.toggle('out'); b.textContent = c.classList.contains('out') ? 'Esaurito ✓' : 'Esaurito'; });
  $('#cats', root).addEventListener('click', (e) => { const ch = e.target.closest('.chip'); if (!ch) return; menuCat = ch.dataset.c; root.querySelectorAll('#cats .chip').forEach((x) => x.classList.toggle('on', x === ch)); applyMenu(root); });
  applyMenu(root);
}
function applyMenu(root) {
  let n = 0; const qq = menuQuery.toLowerCase();
  root.querySelectorAll('.prod').forEach((el) => { const p = D.menu[+el.dataset.i]; const show = (!menuCat || p.cat === menuCat) && (!qq || p.name.toLowerCase().includes(qq)); el.style.display = show ? '' : 'none'; n += show; });
  $('#mcount', root).textContent = `${n} piatti`;
}

const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'Gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'Zone di consegna, costi, tempi stimati.', rider: 'Rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'Punti, premi, coupon.', clienti: 'Rubrica clienti con storico ordini.', report: 'Chiusure giornaliere, export contabile.', stampa: 'Stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'Orari, pausa ordini, auto-conferma, integrazioni.' };
const stub = (id) => `<div class="card stub"><div><b>${B.label(id)}</b>${STUBS[id] || ''}<br><small>In questa demo sono attive Panoramica, Ordini e Menu.</small></div></div>`;
const SCREENS = { panoramica: [overview, wireOverview], ordini: [board, (r) => { wireBoard(r); magnetize(r); }], menu: [menu, wireMenu] };

function go(id) {
  current = id;
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id));
  const [html, wire] = SCREENS[id] || [() => stub(id), () => {}];
  view.innerHTML = html(); wire(view);
  title.textContent = B.label(id);
  closeRail(); view.scrollTop = 0;
}
nav.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); try { history.replaceState(null, '', '#' + a.dataset.id); } catch (_) {} go(a.dataset.id); });
const openRail = () => { rail.classList.add('open'); scrim.classList.add('show'); };
const closeRail = () => { rail.classList.remove('open'); scrim.classList.remove('show'); };
$('#burger').onclick = openRail; scrim.onclick = closeRail;

/* ── command bar: goo morph on text, results = modules + dishes, Enter takes the first ── */
function updateCmd() {
  const has = !!q.value.trim();
  cmd.style.setProperty('--bx', has ? '0px' : '-44px'); cmd.style.setProperty('--bo', has ? 1 : 0);
  if (!has) { res.hidden = true; res.innerHTML = ''; if (current === 'menu') { menuQuery = ''; applyMenu(view); } return; }
  const qq = q.value.trim().toLowerCase();
  const mods = B.NAV.filter((n) => n.label.toLowerCase().includes(qq)).slice(0, 4);
  const dishes = D.menu.filter((p) => p.name.toLowerCase().includes(qq) || (p.code && p.code === qq)).slice(0, 5);
  res.innerHTML = (mods.length ? `<div class="h">Moduli</div>${mods.map((n) => `<a href="#${n.id}" data-mod="${n.id}">${B.icon(n.id, 16)}${n.label}<small>↵</small></a>`).join('')}` : '')
    + (dishes.length ? `<div class="h">Piatti</div>${dishes.map((p) => `<a href="#menu" data-dish="${p.name}"><img src="../_mdesk/${p.img}" alt="">${p.name}<small>${B.euro(p.price)}</small></a>`).join('')}` : '')
    + (!mods.length && !dishes.length ? '<div class="none">Nessun risultato</div>' : '');
  const firstA = res.querySelector('a'); if (firstA) firstA.classList.add('hot');
  res.hidden = false;
  if (current === 'menu') { menuQuery = q.value.trim(); applyMenu(view); }
}
function take(a) {
  if (!a) return;
  if (a.dataset.mod) { go(a.dataset.mod); hit = ''; }
  else { hit = a.dataset.dish; menuQuery = ''; menuCat = ''; go('menu'); }
  q.value = ''; updateCmd(); q.blur();
}
q.addEventListener('input', updateCmd);
q.addEventListener('keydown', (e) => { if (e.key === 'Enter') take(res.querySelector('a.hot')); if (e.key === 'Escape') { q.value = ''; updateCmd(); q.blur(); } if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const as = [...res.querySelectorAll('a')], i = as.findIndex((x) => x.classList.contains('hot')); as.forEach((x) => x.classList.remove('hot')); as[(i + (e.key === 'ArrowDown' ? 1 : as.length - 1)) % as.length]?.classList.add('hot'); } });
res.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); take(a); });
$('#send').addEventListener('click', () => take(res.querySelector('a.hot')));
document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); } });
document.addEventListener('pointerdown', (e) => { if (!cmd.contains(e.target)) res.hidden = true; });
q.addEventListener('focus', () => { if (q.value.trim()) res.hidden = false; });

go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
