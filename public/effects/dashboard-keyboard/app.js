/* Design 11 · Tastiera — dense, neutral, keyboard-first.
   Screens: Panoramica (stats strip, open orders table, kitchen queue you reorder by dragging,
   the closing checklist), Ordini (grouped table; J/K moves, Enter opens a peek with rider
   assignment and a progress readout, C advances), Menu (table with availability; E toggles).
   ⌘K palette runs modules, actions and dishes; ? shows the shortcut sheet; G then P/O/M jumps.
   Library parts: assignees · progress-ticks · reorder-list · checklist (all Bencho, MIT). */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const view = $('#view'), nav = $('#nav'), crumb = $('#crumb'), peek = $('#peek'), pal = $('#pal'), palq = $('#palq'), palList = $('#palList'), help = $('#help'), toast = $('#toast');
const RIDERS = [['Luca', 'in giro · 2 consegne', 'linear-gradient(135deg,#4f7dff,#8ad0ff)'], ['Marta', 'libera', 'linear-gradient(135deg,#ff5b4d,#ff9a3c)'], ['Omar', 'in pausa fino alle 21', 'linear-gradient(135deg,#3ddc84,#b8f26a)'], ['Sofia', 'in giro · 1 consegna', 'linear-gradient(135deg,#ff5fb3,#b46bff)']];
const STCOL = ['#d9a52a', '#5e6ad2', '#e07a2f', '#2f9e6a', '#2f9e6a', '#a1a1aa'];
const state = { module: 'panoramica', sel: 0, open: null, out: new Set(), riders: {}, g: false, order: [0, 1, 2, 3, 4] };
const say = (t) => { toast.textContent = t; toast.classList.add('show'); clearTimeout(say._t); say._t = setTimeout(() => toast.classList.remove('show'), 1800); };

/* ── sidebar ── */
const KEYS = { panoramica: 'G P', ordini: 'G O', menu: 'G M' };
nav.innerHTML = ['sala', 'gestione', 'sistema'].map((g) => `<div class="grp">${B.GROUPS[g]}</div>` + B.NAV.filter((n) => n.group === g).map((n) => `<a href="#${n.id}" data-id="${n.id}">${B.icon(n.id, 15, 1.8)}${n.label}${KEYS[n.id] ? `<kbd>${KEYS[n.id]}</kbd>` : ''}</a>`).join('')).join('');
nav.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); go(a.dataset.id); });
$('#pause').addEventListener('click', (e) => e.currentTarget.classList.toggle('live'));

/* ── rows: what J/K walks over in the current screen ── */
const rows = () => [...view.querySelectorAll('tr.row')];
function select(i, scroll = true) { const rs = rows(); if (!rs.length) return; state.sel = Math.max(0, Math.min(rs.length - 1, i)); rs.forEach((r, k) => r.classList.toggle('sel', k === state.sel)); if (scroll) rs[state.sel].scrollIntoView({ block: 'nearest' }); if (state.open && state.module === 'ordini') openPeek(rs[state.sel].dataset.num, false); }
const selected = () => rows()[state.sel];

/* ── Panoramica ── */
function overview() {
  const t = B.today, s = D.stats, last30 = B.days.map((d) => d.rev), hi = Math.max(...last30);
  const dRev = B.delta(t.rev, B.avg7('rev')), dN = B.delta(t.n, B.avg7('n'));
  const open = B.orders.filter((o) => o.status < 5);
  return `<div class="strip">
    <div><small>Incasso oggi</small><b>${B.euro0(t.rev)}</b><em class="${dRev >= 0 ? 'up' : 'down'}">${dRev >= 0 ? '+' : '−'}${Math.abs(dRev).toFixed(0)}% / 7g</em><div class="spark">${last30.map((v, i) => `<i style="--h:${v / hi * 100}%" class="${i === 29 ? 'hi' : ''}"></i>`).join('')}</div></div>
    <div><small>Ordini oggi</small><b>${t.n}</b><em class="${dN >= 0 ? 'up' : 'down'}">${dN >= 0 ? '+' : '−'}${Math.abs(dN).toFixed(0)}% / 7g</em><div class="spark">${B.days.map((d, i) => `<i style="--h:${d.n / Math.max(...B.days.map((x) => x.n)) * 100}%" class="${i === 29 ? 'hi' : ''}"></i>`).join('')}</div></div>
    <div><small>Scontrino medio</small><b>${B.euro(t.rev / t.n)}</b><em>obiettivo € 28</em></div>
    <div><small>Preparazione</small><b>${s.prepMin} min</b><em>mediana 7g</em></div>
  </div>
  <div class="two">
    <div class="panel"><div class="ph">Ordini aperti <small>${open.length}</small><span class="r hintline"><kbd>J</kbd> <kbd>K</kbd> muovi · <kbd>↵</kbd> apri · <kbd>C</kbd> avanza</span></div>
      <table><thead><tr><th>N.</th><th>Ora</th><th>Canale</th><th>Cliente</th><th>Tipo</th><th>Stato</th><th class="r">Totale</th></tr></thead><tbody>${open.map((o) => trow(o)).join('')}</tbody></table></div>
    <div style="display:grid;gap:14px;align-content:start">
      <div class="panel"><div class="ph">Coda cucina <small>trascina per cambiare l’ordine</small></div><div class="queue" id="queue" style="--n:5"><div class="q-blobs" id="qblobs"></div><div class="q-rows" id="qrows"></div></div><div class="qnote">La cucina vede la lista in questo ordine.</div></div>
      <div class="panel"><div class="ph">Chiusura del turno <small id="clcount"></small></div><div class="cl" id="cl"></div></div>
    </div>
  </div>
  <p class="hintline">Dati dimostrativi: piatti, prezzi e foto sono veri; incassi e quantità ridimensionati.</p>`;
}
const trow = (o) => `<tr class="row" data-num="${o.num}"><td class="mono">${o.short}</td><td class="mono dim">${o.t}</td><td><span class="pillc" style="--c:${o.col}">${o.ch}</span></td><td>${o.name}${o.status === 0 && o.minutes > 8 ? ` <span class="late">+${o.minutes}m</span>` : ''}</td><td class="dim">${o.type}</td><td><span class="st ${o.status >= 3 ? 'full' : ''}" style="--c:${STCOL[o.status]}"><i></i>${B.STATUS[o.status]}</span></td><td class="mono r">${B.euro(o.total)}</td></tr>`;
function wireOverview(root) {
  select(0, false);
  // kitchen queue (reorder-list): orders in preparation
  const q = B.orders.filter((o) => o.status <= 2).slice(0, 5), blobs = $('#qblobs', root), qrows = $('#qrows', root), STEP = 44;
  let order = state.order.slice(0, q.length), drag = null, calm = 0;
  const blobEls = q.map(() => { const b = document.createElement('div'); b.className = 'q-blob'; b.innerHTML = '<div class="q-skin"></div>'; blobs.appendChild(b); return b; });
  const rowEls = q.map((o, id) => { const r = document.createElement('div'); r.className = 'q-row'; r.innerHTML = `<span class="n">${id + 1}</span><span><b>#${o.short}</b> · ${o.items.map((x) => `${x.q}× ${x.p.name}`).join(', ').slice(0, 42)}</span><span>${o.t}</span>`; qrows.appendChild(r);
    r.addEventListener('pointerdown', (e) => { r.setPointerCapture(e.pointerId); drag = { id, px: e.clientX, py: e.clientY, oy: order.indexOf(id) * STEP, lx: e.clientX, ly: e.clientY, lt: performance.now(), target: order.indexOf(id) }; r.classList.add('held'); blobEls[id].classList.add('held'); });
    r.addEventListener('pointermove', (e) => { if (!drag || drag.id !== id) return; move(e); });
    const up = () => { if (!drag || drag.id !== id) return; drop(); }; r.addEventListener('pointerup', up); r.addEventListener('pointercancel', up); return r; });
  function move(e) {
    const x = e.clientX - drag.px, y = drag.oy + (e.clientY - drag.py);
    drag.target = Math.max(0, Math.min(order.length - 1, Math.round(y / STEP)));
    const now = performance.now(), dt = Math.max(1, now - drag.lt), dx = e.clientX - drag.lx, dy = e.clientY - drag.ly; drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
    const wx = Math.min(.26, Math.abs(dx) / dt / 2.6), wy = Math.min(.26, Math.abs(dy) / dt / 2.6), tilt = Math.max(-7, Math.min(7, dx / dt * 2.6)); // it stretches along the axis it moves and leans the way it is thrown
    const skin = blobEls[drag.id].querySelector('.q-skin'); skin.style.transform = `rotate(${tilt.toFixed(2)}deg) scale(${(1 + wx - wy * .55).toFixed(3)}, ${(1 + wy - wx * .55).toFixed(3)})`;
    clearTimeout(calm); calm = setTimeout(() => skin.style.transform = '', 90);
    place(x, y);
  }
  const slotOf = (id) => { if (!drag) return order.indexOf(id); const rest = order.filter((x) => x !== drag.id), i = rest.indexOf(id); return i < drag.target ? i : i + 1; };
  function place(hx, hy) { q.forEach((_, id) => { const held = drag && drag.id === id; const t = held ? `translate(${hx}px, ${hy}px)` : `translateY(${slotOf(id) * STEP}px)`; blobEls[id].style.transform = t; rowEls[id].style.transform = t; rowEls[id].querySelector('.n').textContent = held ? '·' : slotOf(id) + 1; }); }
  function drop() { const { id, target } = drag; const rest = order.filter((x) => x !== id); rest.splice(target, 0, id); order = rest; state.order = order; drag = null; rowEls[id].classList.remove('held'); blobEls[id].classList.remove('held'); blobEls[id].querySelector('.q-skin').style.transform = ''; place(); }
  place();

  // closing checklist
  const cl = $('#cl', root), TASKS = [['Chiudere gli ordini online', '22:30'], ['Stampare la chiusura di cassa', '22:40'], ['Segnare gli esauriti di domani', '22:45'], ['Spegnere lo schermo cucina', '23:00']];
  const crow = [];
  TASKS.forEach(([txt, at]) => { const r = document.createElement('div'); r.className = 'crow'; r.innerHTML = `<span class="box"><i></i><svg viewBox="0 0 24 24"><path d="M6 12.4 L10.3 16.7 L18 7.6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></span><span class="word">${txt}</span><time>${at}</time>`; cl.appendChild(r); const s = { el: r, on: false, t: 0, v: 0, y: 0, vy: 0, rot: 0 }; r.addEventListener('click', () => { s.on = !s.on; wake(); }); crow.push(s); });
  const count = $('#clcount', root); let raf = 0, last = 0, fellAt = 0;
  function frame(now) {
    const dt = Math.min(.04, (now - last) / 1000); last = now; let busy = false; const k = 300, d = 2 * Math.sqrt(k) * .7;
    const fell = crow.every((s) => s.on); if (fell && !fellAt) fellAt = now; if (!fell) fellAt = 0;
    crow.forEach((s, i) => {
      s.v += (-k * (s.t - (s.on ? 1 : 0)) - d * s.v) * dt; s.t += s.v * dt; if (Math.abs(s.v) > .001 || Math.abs(s.t - (s.on ? 1 : 0)) > .001) busy = true;
      const cl1 = Math.max(0, Math.min(1, s.t)), cut = Math.max(0, Math.min(1, (s.t - .12) / .72));
      s.el.querySelector('.box i').style.setProperty('--t', s.t.toFixed(3)); s.el.querySelector('path').setAttribute('stroke-dashoffset', (1 - cl1).toFixed(3)); s.el.querySelector('.word').style.setProperty('--cut', cut.toFixed(3)); s.el.classList.toggle('dim', cut > .5);
      if (fell) { const wait = (crow.length - 1 - i) * .045, el = Math.max(0, (now - fellAt) / 1000 - wait), drop = cl.clientHeight, u = Math.min(1, el / .62); s.y = u < .66 ? drop * Math.pow(u / .66, 2) : u < .84 ? drop - 9 * Math.sin((u - .66) / .18 * Math.PI) : drop; s.rot = (i % 2 ? 1 : -1) * 4 * Math.min(1, u * 2); }
      else { const kk = 420, dd = 26; s.vy += (-kk * s.y - dd * s.vy) * dt; s.y += s.vy * dt; s.rot *= .85; if (Math.abs(s.y) > .1) busy = true; }
      s.el.style.transform = `translateY(${s.y.toFixed(2)}px) rotate(${s.rot.toFixed(2)}deg)`;
    });
    count.textContent = `${crow.filter((s) => s.on).length} / ${crow.length}`;
    if (fell) busy = true; if (fell && now - fellAt > 3000) crow.forEach((s) => s.on = false);
    if (busy && cl.isConnected) raf = requestAnimationFrame(frame); else raf = 0;
  }
  const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  wake(); if (!reduce) [0, 1].forEach((i) => setTimeout(() => { if (cl.isConnected) { crow[i].on = true; wake(); } }, 1200 + i * 700));
}

/* ── Ordini ── */
function board() {
  const groups = [[0, 'Da confermare'], [1, 'Confermati'], [2, 'In preparazione'], [3, 'Pronti'], [4, 'In consegna'], [5, 'Completati']];
  return `<div class="panel"><div class="ph">Ordini <small>${B.orders.length} nel turno</small><span class="r hintline"><kbd>J</kbd> <kbd>K</kbd> muovi · <kbd>↵</kbd> dettaglio · <kbd>C</kbd> avanza · <kbd>esc</kbd> chiudi</span></div>
  <table><thead><tr><th>N.</th><th>Ora</th><th>Canale</th><th>Cliente</th><th>Tipo</th><th>Piatti</th><th class="r">Totale</th><th></th></tr></thead><tbody>
  ${groups.map(([s, label]) => { const list = B.orders.filter((o) => o.status === s); return list.length ? `<tr class="grp"><td colspan="8"><span class="st" style="--c:${STCOL[s]}"><i></i>${label} · ${list.length}</span></td></tr>` + list.map((o) => `<tr class="row" data-num="${o.num}"><td class="mono">${o.short}</td><td class="mono dim">${o.t}</td><td><span class="pillc" style="--c:${o.col}">${o.ch}</span>${o.code ? ` <span class="mono dim" style="font-size:11px">${o.code}</span>` : ''}</td><td>${o.name}${o.status === 0 && o.minutes > 8 ? ` <span class="late">+${o.minutes}m</span>` : ''}</td><td class="dim">${o.type}</td><td class="items">${o.items.map((x) => `${x.q}× ${x.p.name}`).join(', ')}</td><td class="mono r">${B.euro(o.total)}</td><td class="r">${o.status < 5 ? `<button class="btn" data-next type="button">${B.STATUS[o.status + 1]} <kbd>C</kbd></button>` : ''}</td></tr>`).join('') : ''; }).join('')}
  </tbody></table></div>`;
}
function advance(o) { if (o.status >= 5) return; o.status++; if (o.status === 4 && o.type !== 'Consegna') o.status = 5; say(`#${o.short} → ${B.STATUS[o.status]}`); }
function wireBoard(root) {
  select(state.sel, false);
  root.addEventListener('click', (e) => { const r = e.target.closest('tr.row'); if (!r) return; select(rows().indexOf(r), false); if (e.target.closest('[data-next]')) { advance(B.orders.find((o) => o.num === r.dataset.num)); render(); } else openPeek(r.dataset.num); });
}
function openPeek(num, focus = true) {
  const o = B.orders.find((x) => x.num === num); if (!o) return; state.open = num; peek.hidden = false; document.querySelector('.shell').classList.add('peeking');
  const steps = o.type === 'Consegna' ? 5 : 4, done = Math.min(steps, o.status + (o.status >= 5 ? 0 : 0)), pct = Math.min(1, (o.status >= 5 ? steps : o.status) / steps);
  peek.innerHTML = `<div class="pk-h"><b>#${o.short}</b><span class="pillc" style="--c:${o.col}">${o.ch}</span><button class="btn x" data-close type="button">esc</button></div>
  <div class="kv"><span>Cliente</span><div>${o.name}</div><span>Tipo</span><div>${o.type}</div><span>Ora</span><div class="mono">${o.t}</div>${o.code ? `<span>Codice</span><div class="mono">${o.code}</div>` : ''}<span>Stato</span><div><span class="st ${o.status >= 3 ? 'full' : ''}" style="--c:${STCOL[o.status]}"><i></i>${B.STATUS[o.status]}</span></div></div>
  <ul>${o.items.map((x) => `<li>${x.q}× ${x.p.name}<span>${B.euro(x.q * x.p.price)}</span></li>`).join('')}<li><b>Totale</b><span><b>${B.euro(o.total)}</b></span></li></ul>
  <h4>Avanzamento</h4><div class="pt"><div class="n"><span id="ptn">${Math.round(pct * 100)}</span><small>%</small></div><div class="bars" id="ptbars"></div><small class="s">${B.STATUS.slice(0, steps + 1).slice(-1)[0] === 'In consegna' ? '' : ''}${o.status >= 5 ? 'Completato' : `Prossimo passo: ${B.STATUS[o.status + 1]}`} · passa sopra per scorrere</small></div>
  ${o.type === 'Consegna' ? `<h4>Rider</h4><div class="pik" id="pik"><div class="pik-pill" id="pikPill"><span class="pik-rail" id="pikRail"></span><span class="pik-empty" id="pikEmpty">Assegna un rider</span><span class="chev">⌃</span></div><div class="pik-list" id="pikList"></div></div>` : ''}
  <div class="acts">${o.status < 5 ? `<button class="btn pri" data-next type="button">${B.STATUS[o.status + 1]} <kbd>C</kbd></button>` : ''}<button class="btn" type="button" data-print>Ristampa</button></div>`;
  peek.querySelector('[data-close]').onclick = closePeek;
  peek.querySelector('[data-next]')?.addEventListener('click', () => { advance(o); render(); openPeek(num, false); });
  peek.querySelector('[data-print]').onclick = () => say('Ricevuta in stampa');
  // progress ticks: a spring chases hover ?? target; lit bars carry a travelling wave
  const bars = $('#ptbars', peek), nEl = $('#ptn', peek), N = 32, els = Array.from({ length: N }, () => { const i = document.createElement('i'); bars.appendChild(i); return i; });
  let target = pct, shown = 0, hover = null, vel = 0, t0 = performance.now();
  (function frame(now) { if (!bars.isConnected) return; const goal = hover ?? target; vel += (-180 * (shown - goal) - 2 * Math.sqrt(180) * .85 * vel) / 60; shown += vel / 60; const lit = shown * N, ph = (now - t0) / 1000 * 3; els.forEach((b, i) => { const on = i < lit; b.classList.toggle('lit', on); const wave = .5 + .5 * Math.sin(ph - i * .45) * (.6 + .4 * Math.sin(i * .9)); b.style.height = on ? (45 + wave * 55).toFixed(1) + '%' : (26 + 14 * Math.sin(i * .9)).toFixed(1) + '%'; }); nEl.textContent = Math.round(shown * 100); requestAnimationFrame(frame); })(t0);
  const at = (e) => Math.max(0, Math.min(1, (e.clientX - bars.getBoundingClientRect().left) / bars.clientWidth));
  bars.addEventListener('pointermove', (e) => { hover = at(e); }); bars.addEventListener('pointerleave', () => { hover = null; });
  // assignees: faces are absolutely placed in a rail whose width is the only thing that changes
  if (o.type === 'Consegna') {
    const pik = $('#pik', peek), pill = $('#pikPill', peek), rail = $('#pikRail', peek), empty = $('#pikEmpty', peek), list = $('#pikList', peek), FACE = 26, OVER = 8;
    const picked = state.riders[num] || (state.riders[num] = []);
    const faces = RIDERS.map(([n, , g]) => { const f = document.createElement('span'); f.className = 'pik-face'; f.style.setProperty('--g', g); f.textContent = n[0]; rail.appendChild(f); return f; });
    RIDERS.forEach(([n, r, g], i) => { const row = document.createElement('div'); row.className = 'prow'; row.innerHTML = `<span class="av" style="--g:${g}"></span><span><b>${n}</b><small>${r}</small></span><span class="bx">✓</span>`; row.addEventListener('click', () => { const k = picked.indexOf(i); k >= 0 ? picked.splice(k, 1) : picked.push(i); layout(); }); list.appendChild(row); });
    function layout() { const n = picked.length; rail.style.setProperty('--w', (n ? FACE + (n - 1) * (FACE - OVER) : 0) + 'px'); faces.forEach((f, id) => { const k = picked.indexOf(id); f.classList.toggle('off', k < 0); if (k < 0) return; f.style.setProperty('--x', (k * (FACE - OVER)) + 'px'); f.style.zIndex = 10 + k; }); empty.style.display = n ? 'none' : ''; empty.textContent = 'Assegna un rider'; list.querySelectorAll('.prow').forEach((r, i) => r.classList.toggle('on', picked.includes(i))); }
    pill.addEventListener('click', () => pik.classList.toggle('open'));
    document.addEventListener('pointerdown', (e) => { if (!pik.contains(e.target)) pik.classList.remove('open'); });
    layout();
  }
  if (focus) peek.scrollTop = 0;
}
function closePeek() { state.open = null; peek.hidden = true; peek.innerHTML = ''; document.querySelector('.shell').classList.remove('peeking'); }

/* ── Menu ── */
function menu() {
  return `<div class="panel"><div class="ph">Menu <small>${D.menu.length} piatti</small><span class="r hintline"><kbd>J</kbd> <kbd>K</kbd> muovi · <kbd>E</kbd> esaurito</span></div>
  <table><thead><tr><th class="mono">Cod.</th><th>Piatto</th><th>Categoria</th><th class="r">Prezzo</th><th>Disponibile</th></tr></thead><tbody>${D.menu.map((p, i) => `<tr class="row" data-i="${i}"><td class="mono dim">${p.code || '—'}</td><td>${p.name}</td><td class="dim">${p.cat}</td><td class="mono r">${B.euro(p.price)}</td><td><span class="tog ${state.out.has(p.name) ? '' : 'on'}" data-tog></span></td></tr>`).join('')}</tbody></table></div>`;
}
function toggleDish(tr) { const p = D.menu[+tr.dataset.i]; state.out.has(p.name) ? state.out.delete(p.name) : state.out.add(p.name); tr.querySelector('.tog').classList.toggle('on', !state.out.has(p.name)); say(`${p.name}: ${state.out.has(p.name) ? 'esaurito' : 'disponibile'}`); }
function wireMenu(root) { select(state.sel, false); root.addEventListener('click', (e) => { const r = e.target.closest('tr.row'); if (!r) return; select(rows().indexOf(r), false); if (e.target.closest('[data-tog]')) toggleDish(r); }); }

/* ── palette ── */
const ACTIONS = [['Conferma tutti gli ordini in attesa', () => { const w = B.orders.filter((o) => o.status === 0); w.forEach((o) => { o.status = 1; }); say(`${w.length} ordini confermati`); render(); }], ['Metti in pausa gli ordini', () => { $('#pause').classList.add('live'); say('Ordini in pausa'); }], ['Riapri gli ordini', () => { $('#pause').classList.remove('live'); say('Ordini riaperti'); }], ['Ristampa la chiusura di cassa', () => say('Chiusura in stampa')]];
function openPal() { pal.hidden = false; palq.value = ''; fillPal(); palq.focus(); }
function closePal() { pal.hidden = true; }
function fillPal() {
  const qq = palq.value.trim().toLowerCase();
  const mods = B.NAV.filter((n) => !qq || n.label.toLowerCase().includes(qq)).slice(0, qq ? 4 : 3);
  const acts = ACTIONS.filter(([l]) => !qq || l.toLowerCase().includes(qq)).slice(0, 4);
  const dishes = qq ? D.menu.filter((p) => p.name.toLowerCase().includes(qq)).slice(0, 5) : [];
  palList.innerHTML = (mods.length ? `<div class="ph2">Vai a</div>${mods.map((n) => `<a href="#" data-mod="${n.id}">${B.icon(n.id, 15, 1.8)}${n.label}<small>${KEYS[n.id] || ''}</small></a>`).join('')}` : '') + (acts.length ? `<div class="ph2">Azioni</div>${acts.map(([l], i) => `<a href="#" data-act="${ACTIONS.indexOf(ACTIONS.find((a) => a[0] === l))}">${l}</a>`).join('')}` : '') + (dishes.length ? `<div class="ph2">Piatti</div>${dishes.map((p) => `<a href="#" data-dish="${p.name}"><img src="../_mdesk/${p.img}" alt="">${p.name}<small>${state.out.has(p.name) ? 'esaurito' : B.euro(p.price)}</small></a>`).join('')}` : '');
  palList.querySelector('a')?.classList.add('hot');
}
function runPal(a) { if (!a) return; closePal(); if (a.dataset.mod) go(a.dataset.mod); else if (a.dataset.act) ACTIONS[+a.dataset.act][1](); else if (a.dataset.dish) { go('menu'); const i = D.menu.findIndex((p) => p.name === a.dataset.dish); select(i); } }
palq.addEventListener('input', fillPal);
palList.addEventListener('click', (e) => { const a = e.target.closest('a'); if (a) { e.preventDefault(); runPal(a); } });
pal.addEventListener('pointerdown', (e) => { if (e.target === pal) closePal(); });
$('#findBtn').onclick = openPal; $('#helpBtn').onclick = () => help.hidden = !help.hidden; help.addEventListener('pointerdown', (e) => { if (e.target === help) help.hidden = true; });

/* ── keys ── */
document.addEventListener('keydown', (e) => {
  const inPal = !pal.hidden;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inPal ? closePal() : openPal(); return; }
  if (inPal) { const as = [...palList.querySelectorAll('a')], i = as.findIndex((x) => x.classList.contains('hot')); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); as.forEach((x) => x.classList.remove('hot')); as[(i + (e.key === 'ArrowDown' ? 1 : as.length - 1)) % as.length]?.classList.add('hot'); } if (e.key === 'Enter') runPal(as[i]); if (e.key === 'Escape') closePal(); return; }
  if (e.target.matches('input, textarea')) return;
  if (e.key === '?') { help.hidden = !help.hidden; return; }
  if (e.key === 'Escape') { if (!help.hidden) help.hidden = true; else if (state.open) closePeek(); return; }
  if (state.g) { state.g = false; const m = { p: 'panoramica', o: 'ordini', m: 'menu' }[e.key.toLowerCase()]; if (m) { go(m); return; } }
  if (e.key.toLowerCase() === 'g') { state.g = true; setTimeout(() => state.g = false, 900); return; }
  if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); select(state.sel + 1); }
  if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); select(state.sel - 1); }
  if (e.key === 'Enter') { const r = selected(); if (r && r.dataset.num) openPeek(r.dataset.num); }
  if (e.key.toLowerCase() === 'c') { const r = selected(); if (r && r.dataset.num) { advance(B.orders.find((o) => o.num === r.dataset.num)); render(); if (state.open) openPeek(state.open, false); } }
  if (e.key.toLowerCase() === 'e' && state.module === 'menu') { const r = selected(); if (r) toggleDish(r); }
});

const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'Gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'Zone di consegna, costi, tempi stimati.', rider: 'Rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'Punti, premi, coupon.', clienti: 'Rubrica clienti con storico ordini.', report: 'Chiusure giornaliere, export contabile.', stampa: 'Stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'Orari, pausa ordini, auto-conferma, integrazioni.' };
const SCREENS = { panoramica: [overview, wireOverview], ordini: [board, wireBoard], menu: [menu, wireMenu] };
function render() {
  const [html, wire] = SCREENS[state.module] || [() => `<div class="panel stub"><b>${B.label(state.module)}</b>${STUBS[state.module] || ''}<br><small>In questa demo sono attive Panoramica, Ordini e Menu.</small></div>`, () => {}];
  view.innerHTML = html(); wire(view);
  if (state.open && state.module !== 'ordini' && state.module !== 'panoramica') closePeek();
}
function go(id) { state.module = id; state.sel = 0; closePeek(); nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id)); crumb.innerHTML = `Mumi Sushi<span>/</span><b>${B.label(id)}</b>`; try { history.replaceState(null, '', '#' + id); } catch (_) {} render(); window.scrollTo(0, 0); }
go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
