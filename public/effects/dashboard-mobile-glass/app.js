/* Design 14 · In tasca — the owner's phone.
   Oggi: a revenue card you pull down to refresh (goo droplets fuse at the threshold), the
   orders card with a tray of services sliding out from underneath, channels as accordion strips.
   Ordini: a summary strip you drag into a panel, a card that fills as you close orders, riders
   as an overlapping avatar row that fans out. Menu: a list with availability toggles.
   Library parts: pull-to-refresh (Bencho, MIT) · card-tray · accordion-row · progress-fill · pull-summary · overlap-row. */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const page = $('#page'), scroll = $('#scroll'), tabbar = $('#tabbar');
const state = { tab: 'oggi', range: 7, out: new Set(), done: new Set(), menuCat: '', q: '', fresh: 'adesso' };
const TABS = [['oggi', 'Oggi', 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'], ['ordini', 'Ordini', 'M9 4h6l1 2h3v14H5V6h3zM9 12l2 2 4-4'], ['menu', 'Menu', 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z']];
const CH = { Deliveroo: 'var(--blue)', Chiosco: 'var(--mint)', 'Just Eat': 'var(--orange)', Sito: 'var(--lilac)', App: 'var(--pink)', Cassa: 'var(--yellow)' };

/* fit the 390×780 shell to the frame */
const fit = () => { const s = Math.min(1, (innerHeight - 16) / 780, (innerWidth - 16) / 390); $('#wrap').style.zoom = s; };
fit(); addEventListener('resize', fit);
const tick = () => { $('#time').textContent = new Date().toLocaleTimeString('it-IT', { hour: 'numeric', minute: '2-digit' }); }; tick(); setInterval(tick, 10000);

tabbar.insertAdjacentHTML('beforeend', `<span class="lens" style="--i:0"></span>` + TABS.map(([id, l, d]) => `<a href="#${id}" data-id="${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>${l}</a>`).join(''));
tabbar.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); go(a.dataset.id); });

/* ── Oggi ── */
function oggi() {
  const t = B.today, dRev = B.delta(t.rev, B.avg7('rev')), s = D.stats, peakH = Math.max(...s.hours.map((x) => x[1]));
  const lunch = s.hours.filter(([h]) => h >= 11 && h <= 14).reduce((a, x) => a + x[1], 0), dinner = s.hours.filter(([h]) => h >= 18).reduce((a, x) => a + x[1], 0), tot = s.hours.reduce((a, x) => a + x[1], 0);
  const chans = s.channels.slice(0, 4), totC = s.channels.reduce((a, [, v]) => a + v, 0), n30 = B.days.reduce((a, d) => a + d.n, 0);
  return `<h1>Oggi<small>Mumi Sushi · Vimercate · ${B.dateIt(t.d, { weekday: 'long', day: 'numeric', month: 'long' })}</small></h1>
  <div class="ptr" id="ptr"><div class="bal" id="bal"><div class="bal-goo" id="goo"></div></div>
    <div class="card" id="pcard"><div class="eyebrow"><span>Incasso</span><span class="fresh" id="fresh">aggiornato ${state.fresh}</span></div><div class="big" id="pbig"></div><div class="delta" id="pdelta"></div><svg class="plot" id="plot" viewBox="0 0 326 76" preserveAspectRatio="none"><path id="line"/><circle id="dot" r="4"/></svg><div class="tabs" id="rtabs"><button class="${state.range === 7 ? 'on' : ''}" data-r="7" type="button">7 giorni</button><button class="${state.range === 30 ? 'on' : ''}" data-r="30" type="button">30 giorni</button></div></div></div>
  <div class="card tray-card"><div class="main"><div class="eyebrow"><span>Ordini oggi</span><span class="pill">● ${dRev >= 0 ? 'sopra' : 'sotto'} la media</span></div><div class="big">${t.n}<i>ordini</i></div><div class="sub">scontrino medio ${B.euro(t.rev / t.n)} · ${s.prepMin} min in cucina</div><div class="bars">${s.hours.map(([, n]) => `<i style="--h:${n / peakH * 100}%"></i>`).join('')}</div></div>
    <div class="tray" id="tray" data-showcase><div class="head"><span>2 servizi · tocca</span><b>⌄</b></div><ul><li style="--i:0"><b>Pranzo</b><i style="--w:${lunch / tot * 100}%"></i><span>${Math.round(lunch / tot * 100)}%</span></li><li style="--i:1"><b>Cena</b><i style="--w:${dinner / tot * 100}%"></i><span>${Math.round(dinner / tot * 100)}%</span></li><li style="--i:2"><b>Fuori orario</b><i style="--w:${(tot - lunch - dinner) / tot * 100}%"></i><span>${Math.round((tot - lunch - dinner) / tot * 100)}%</span></li></ul></div>
    <div class="stats"><div class="stat" style="--c:var(--mint)"><small>Picco</small><b>19–20<i>h</i></b><em>${peakH} ordini/h</em></div><div class="stat" style="--c:var(--blue)"><small>Consegne</small><b>${s.types[0][1]}<i>%</i></b><em>del totale</em></div><div class="stat"><small>Aperti</small><b>${B.orders.filter((o) => o.status < 5).length}</b><em>adesso</em></div></div></div>
  <div class="card"><div class="eyebrow"><span>Canali · 30 giorni</span><span class="pill">${n30} ordini</span></div><div class="strips" id="strips">${chans.map(([n, v], i) => `<div class="strip" style="--c:${CH[n]}"><span class="ic">${n[0]}</span><span class="vt"><b>${v}%</b>${n}</span><div class="detail"><small>${n}</small><div class="n">${Math.round(n30 * v / totC)}<i>ordini</i></div><ul><li>Quota<span>${v}%</span></li><li>Al giorno<span>≈ ${(n30 * v / totC / 30).toFixed(1)}</span></li><li>Tipo<span>${n === 'Chiosco' || n === 'Cassa' ? 'ritiro / tavolo' : 'consegna'}</span></li></ul><div class="chart">${B.days.slice(-7).map((d) => `<i style="--h:${d.n / Math.max(...B.days.slice(-7).map((x) => x.n)) * 100}%"></i>`).join('')}</div></div></div>`).join('')}</div><div class="foot"><span>Tocca una striscia</span><span class="dots" id="dots">${chans.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</span></div></div>
  <p style="font-size:10px;color:#7a7872;padding:0 6px">Dati dimostrativi: piatti, prezzi e foto sono veri; incassi e quantità ridimensionati.</p>`;
}
function wireOggi(root) {
  // revenue card + pull to refresh
  const big = $('#pbig', root), delta = $('#pdelta', root), line = $('#line', root), dot = $('#dot', root), plot = $('#plot', root);
  let series = [], scrub = null;
  const load = () => { series = B.days.slice(-state.range).map((d) => d.rev); };
  const paint = () => { const i = scrub ?? series.length - 1, v = series[i], lo = Math.min(...series), hi = Math.max(...series); const px = (k) => k / (series.length - 1) * 326, py = (y) => 70 - (y - lo) / (hi - lo || 1) * 62; line.setAttribute('d', series.map((y, k) => (k ? 'L' : 'M') + px(k).toFixed(1) + ' ' + py(y).toFixed(1)).join(' ')); dot.setAttribute('cx', px(i)); dot.setAttribute('cy', py(v)); big.innerHTML = `${B.euro0(v)}<i>${scrub === null ? 'oggi' : B.dateIt(B.days.slice(-state.range)[i].d)}</i>`; const m = series.reduce((a, x) => a + x, 0) / series.length, d = (v - m) / m * 100; delta.innerHTML = `<b class="${d >= 0 ? '' : 'down'}">${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(0)}%</b> sulla media di ${state.range} giorni · ${B.today.n} ordini`; };
  load(); paint();
  plot.addEventListener('pointermove', (e) => { const r = plot.getBoundingClientRect(); scrub = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (series.length - 1)); paint(); });
  plot.addEventListener('pointerleave', () => { scrub = null; paint(); });
  $('#rtabs', root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.range = +b.dataset.r; root.querySelectorAll('#rtabs button').forEach((x) => x.classList.toggle('on', x === b)); load(); scrub = null; paint(); });
  const ptr = $('#ptr', root), bal = $('#bal', root), goo = $('#goo', root), card = $('#pcard', root), THRESHOLD = 64, DOTS = 6;
  const drops = Array.from({ length: DOTS }, (_, i) => { const d = document.createElement('i'); d.className = 'drop'; d.style.setProperty('--a', (i / DOTS * 360) + 'deg'); goo.appendChild(d); return d; });
  let phase = 'idle', y0 = 0, dragging = false;
  const setPull = (raw) => { const R = 510, drawn = raw <= 0 ? 0 : (R * raw) / (R + raw), p = Math.max(0, Math.min(1, drawn / THRESHOLD)); card.style.setProperty('--pull', drawn.toFixed(1) + 'px'); bal.style.setProperty('--vis', Math.min(1, p * 1.6).toFixed(2)); drops.forEach((d) => d.style.setProperty('--spread', (20 - p * 17.5).toFixed(2))); if (p >= 1 && phase === 'idle') phase = 'armed'; if (p < 1 && phase === 'armed') phase = 'idle'; };
  ptr.addEventListener('pointerdown', (e) => { if (phase === 'work' || e.target.closest('.plot, .tabs')) return; dragging = true; y0 = e.clientY; card.classList.remove('snap'); ptr.setPointerCapture(e.pointerId); });
  ptr.addEventListener('pointermove', (e) => { if (!dragging) return; setPull((e.clientY - y0) / (parseFloat($('#wrap').style.zoom) || 1)); });
  const release = () => { if (!dragging) return; dragging = false; card.classList.add('snap'); if (phase === 'armed') { phase = 'work'; bal.dataset.phase = 'work'; card.style.setProperty('--pull', '44px'); setTimeout(() => { state.fresh = 'alle ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); $('#fresh', root).textContent = 'aggiornato ' + state.fresh; load(); scrub = null; paint(); bal.dataset.phase = ''; phase = 'idle'; setPull(0); }, 1400); } else { phase = 'idle'; setPull(0); } };
  ptr.addEventListener('pointerup', release); ptr.addEventListener('pointercancel', release);
  if (!reduce) setTimeout(() => { if (!ptr.isConnected) return; dragging = true; y0 = 0; card.classList.remove('snap'); const t0 = performance.now(); const tk = (now) => { const t = Math.min(1, (now - t0) / 700); setPull(150 * t); if (t < 1) requestAnimationFrame(tk); else release(); }; requestAnimationFrame(tk); }, 1000);
  // tray
  const tray = $('#tray', root); tray.addEventListener('click', () => tray.classList.toggle('open'));
  if (!reduce) { setTimeout(() => tray.classList.add('open'), 3200); setTimeout(() => tray.classList.remove('open'), 6200); }
  // strips
  const strips = [...root.querySelectorAll('.strip')], dots = [...root.querySelectorAll('#dots i')]; let cur = -1;
  const pick = (i) => { cur = cur === i ? -1 : i; strips.forEach((s, k) => s.classList.toggle('on', k === cur)); dots.forEach((d, k) => d.classList.toggle('on', k === (cur < 0 ? 0 : cur))); };
  strips.forEach((s, i) => s.addEventListener('click', () => pick(i)));
  if (!reduce) setTimeout(() => pick(0), 1600);
}

/* ── Ordini ── */
function ordini() {
  const open = B.orders.filter((o) => o.status < 5 && !state.done.has(o.num)), waiting = open.filter((o) => o.status === 0), working = open.filter((o) => o.status > 0 && o.status < 3), ready = open.filter((o) => o.status >= 3);
  const closed = B.orders.length - open.length, pct = Math.round(closed / B.orders.length * 100);
  const riders = [['L', 'Luca', 'var(--blue)'], ['M', 'Marta', 'var(--mint)'], ['O', 'Omar', 'var(--pink)'], ['S', 'Sofia', 'var(--yellow)']];
  return `<h1>Ordini<small>${open.length} aperti · ${closed} chiusi</small></h1>
  <div class="card sum-card"><div class="sum" id="sum" style="--h:40px"><div class="strip2"><span><i style="--c:var(--orange)">●</i><b>${waiting.length}</b>in attesa</span><span><i style="--c:var(--mint)">●</i><b>${working.length}</b>in lavorazione</span><span><i style="--c:var(--lilac)">●</i><b>${ready.length}</b>pronti</span></div>
    <div class="panel"><div class="eyebrow"><span>Turno · riepilogo</span><span class="pill">● in corso</span></div><div class="bigrow"><b>${pct}<i>%</i></b><div class="bars">${[0, 1, 2, 3, 4, 5].map((s) => `<i style="--h:${Math.max(12, B.orders.filter((o) => o.status === s).length / B.orders.length * 300)}%"></i>`).join('')}</div></div><div class="sub">${closed} ordini chiusi su ${B.orders.length} · incasso ${B.euro0(B.today.rev)}</div><div class="stats"><div class="stat"><small>Attesa</small><b>${waiting.length}</b></div><div class="stat"><small>Cucina</small><b>${working.length}</b></div><div class="stat"><small>Pronti</small><b>${ready.length}</b></div></div><span class="grip"></span></div></div>
    <div class="agenda"><div class="eyebrow"><span>Da fare adesso</span><span class="pill">● ${waiting.length} da confermare</span></div><ul>${waiting.map((o) => `<li><i style="--c:${CH[o.ch]}">${o.ch[0]}</i><div>#${o.short} · ${o.name}<small>${o.type} · ${o.items.length} piatti${o.minutes > 8 ? ` · da ${o.minutes} min` : ''}</small></div><time>${o.t}</time></li>`).join('') || '<li><i style="--c:var(--mint)">✓</i><div>Niente in attesa</div></li>'}</ul></div></div>
  <div class="card fill-card ${pct === 100 ? 'done' : ''}" id="fillCard"><div class="fill" id="fill" style="--p:${pct}%"></div><div class="in"><div class="eyebrow"><span>Turno</span><span class="pill" id="fcount">${closed} / ${B.orders.length} chiusi</span></div><div class="big"><span id="fpct">${pct}</span><i>%</i></div><div class="delta">spunta un ordine quando esce</div>
    <ul class="olist" id="olist">${open.slice(0, 7).map((o) => `<li data-num="${o.num}"><i>✓</i><span>#${o.short} · ${o.name}<span class="ch">${o.ch}</span><small>${o.items.map((x) => `${x.q}× ${x.p.name}`).join(', ').slice(0, 48)}</small></span><time>${o.t}</time></li>`).join('')}</ul></div></div>
  <div class="card"><div class="eyebrow"><span>Consegne in corso</span><span class="pill">● ${B.orders.filter((o) => o.status === 4).length + 2} in giro</span></div><h2 style="font-size:19px;font-weight:700;letter-spacing:-.02em;margin-top:10px">Rider stasera</h2><div class="sub" style="font-size:10px;color:var(--muted);margin-top:3px">Vimercate e dintorni · turno 19–23</div>
    <div class="row"><div class="avs" id="avs">${riders.map(([k, n, c], i) => `<div class="av" style="--i:${i};--c:${c}">${k}<span>${n}</span></div>`).join('')}</div><button class="join" type="button" id="callRider">Chiama</button></div>
    <div class="people"><div><small>Consegne</small><b>${B.orders.filter((o) => o.type === 'Consegna').length}<i>stasera</i></b><em>${B.orders.filter((o) => o.type === 'Consegna' && o.status >= 4).length} in giro · ${B.orders.filter((o) => o.type === 'Consegna' && o.status < 4).length} da partire</em></div><div class="bars">${[40, 60, 35, 80, 100, 55, 70].map((h) => `<i style="--h:${h}%"></i>`).join('')}</div></div></div>`;
}
function wireOrdini(root) {
  // pull summary
  const sum = $('#sum', root), MIN = 40, MAX = 190, SNAP = 90; let open = false, y0 = 0, h0 = MIN, dragging = false;
  const set = (h) => sum.style.setProperty('--h', h + 'px');
  const settle = (h) => { open = h > SNAP; sum.classList.toggle('open', open); set(open ? MAX : MIN); };
  sum.addEventListener('pointerdown', (e) => { dragging = true; y0 = e.clientY; h0 = open ? MAX : MIN; sum.classList.add('drag'); sum.setPointerCapture(e.pointerId); });
  sum.addEventListener('pointermove', (e) => { if (!dragging) return; const h = Math.max(MIN, Math.min(MAX + 24, h0 + (e.clientY - y0) / (parseFloat($('#wrap').style.zoom) || 1))); set(h); sum.classList.toggle('open', h > SNAP); });
  const up = (e) => { if (!dragging) return; dragging = false; sum.classList.remove('drag'); const moved = Math.abs(e.clientY - y0) > 6; settle(moved ? parseFloat(getComputedStyle(sum).height) : (open ? MIN : MAX)); };
  sum.addEventListener('pointerup', up); sum.addEventListener('pointercancel', up);
  if (!reduce) { setTimeout(() => { if (sum.isConnected) settle(MAX); }, 1100); setTimeout(() => { if (sum.isConnected) settle(MIN); }, 3800); }
  // progress fill: ticking an order closes it; the fill and the number arrive together on 600ms
  const items = [...root.querySelectorAll('#olist li')], fill = $('#fill', root), fpct = $('#fpct', root), fcount = $('#fcount', root), fcard = $('#fillCard', root);
  let shown = parseInt(fpct.textContent), anim = 0;
  const apply = () => { const closed = B.orders.length - B.orders.filter((o) => o.status < 5 && !state.done.has(o.num)).length, target = Math.round(closed / B.orders.length * 100); fill.style.setProperty('--p', target + '%'); fcount.textContent = `${closed} / ${B.orders.length} chiusi`; cancelAnimationFrame(anim); const from = shown, t0 = performance.now(); const tk = (now) => { const t = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - t, 3); shown = Math.round(from + (target - from) * e); fpct.textContent = shown; if (t < 1) anim = requestAnimationFrame(tk); }; if (reduce) { shown = target; fpct.textContent = target; } else anim = requestAnimationFrame(tk); fcard.classList.toggle('done', target === 100); };
  items.forEach((l) => l.addEventListener('click', () => { const on = l.classList.toggle('on'); on ? state.done.add(l.dataset.num) : state.done.delete(l.dataset.num); apply(); }));
  // overlap row
  const avs = $('#avs', root); avs.addEventListener('click', () => avs.classList.toggle('open'));
  $('#callRider', root).addEventListener('click', () => { avs.classList.add('open'); });
  if (!reduce) { setTimeout(() => avs.classList.add('open'), 2000); setTimeout(() => avs.classList.remove('open'), 4600); }
}

/* ── Menu ── */
function menu() {
  const cats = [...new Set(D.menu.map((p) => p.cat))], qq = state.q.toLowerCase();
  const list = D.menu.filter((p) => (!state.menuCat || p.cat === state.menuCat) && (!qq || p.name.toLowerCase().includes(qq)));
  return `<h1>Menu<small>${D.menu.length} piatti · ${state.out.size} esauriti</small></h1>
  <div class="search">🔍<input id="q" placeholder="Cerca un piatto" value="${state.q}"></div>
  <div class="cats" id="cats"><span class="${state.menuCat ? '' : 'on'}" data-c="">Tutti</span>${cats.map((c) => `<span class="${state.menuCat === c ? 'on' : ''}" data-c="${c}">${c}</span>`).join('')}</div>
  <ul class="mlist" id="mlist">${list.map((p) => `<li class="${state.out.has(p.name) ? 'out' : ''}" data-name="${p.name}"><img src="../_mdesk/${p.img}" alt="" loading="lazy"><div><b>${p.name}</b><small>${p.cat} · ${B.euro(p.price)}</small></div><span class="tog ${state.out.has(p.name) ? '' : 'on'}"></span></li>`).join('') || '<li><div><b>Nessun piatto</b></div></li>'}</ul>`;
}
function wireMenu(root) {
  $('#q', root).addEventListener('input', (e) => { state.q = e.target.value; const keep = e.target.selectionStart; render(); const q = $('#q', page); q.focus({ preventScroll: true }); q.setSelectionRange(keep, keep); });
  $('#cats', root).addEventListener('click', (e) => { const c = e.target.closest('span'); if (!c) return; state.menuCat = c.dataset.c; render(); });
  $('#mlist', root).addEventListener('click', (e) => { const li = e.target.closest('li[data-name]'); if (!li) return; const n = li.dataset.name; state.out.has(n) ? state.out.delete(n) : state.out.add(n); li.classList.toggle('out', state.out.has(n)); li.querySelector('.tog').classList.toggle('on', !state.out.has(n)); $('h1 small', root).textContent = `${D.menu.length} piatti · ${state.out.size} esauriti`; });
}

const SCREENS = { oggi: [oggi, wireOggi], ordini: [ordini, wireOrdini], menu: [menu, wireMenu] };
function render() { const [html, wire] = SCREENS[state.tab]; page.innerHTML = html(); wire(page); }
function go(id) { state.tab = id; tabbar.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id)); $('.lens').style.setProperty('--i', TABS.findIndex((t) => t[0] === id)); render(); scroll.scrollTop = 0; try { history.replaceState(null, '', '#' + id); } catch (_) {} }
go(TABS.some((t) => '#' + t[0] === location.hash) ? location.hash.slice(1) : 'oggi');
