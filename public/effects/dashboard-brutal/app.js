/* Design 13 · Brutale — 3px borders, hard shadows, flat colour, and controls you feel.
   Screens: Panoramica (huge numbers, a wheel gauge for kitchen load you can drag, brutal bars,
   ranked dishes, a feed, and a slide-to-confirm to close the till), Ordini (a magnetic
   channel filter — seven chips on a hexagon — and order cards with a radial action menu:
   press, drag toward an action, let go), Menu (framed photos, a rotated ESAURITO stamp).
   Library parts: slide-to-confirm · radial-menu · wheel-gauge · magnetic-select (Bencho, MIT). */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const view = $('#view'), tabs = $('#tabs'), toast = $('#toast');
const COL = { Deliveroo: 'var(--c)', Chiosco: 'var(--l)', 'Just Eat': 'var(--o)', Sito: 'var(--v)', App: 'var(--p)', Cassa: 'var(--y)' };
const state = { module: 'panoramica', chan: 'Tutti', out: new Set(), menuCat: '', load: .7 };
const say = (t) => { toast.textContent = t; toast.classList.add('show'); clearTimeout(say._t); say._t = setTimeout(() => toast.classList.remove('show'), 1800); };
const MAIN = ['panoramica', 'ordini', 'menu'];
tabs.innerHTML = B.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}" class="${MAIN.includes(n.id) ? '' : 'dim'}">${n.label}</a>`).join('');
tabs.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); go(a.dataset.id); });
$('#ticker').innerHTML = [...B.orders, ...B.orders].map((o) => `<span>#${o.short} <b>${o.ch.toUpperCase()}</b> ${o.type.toUpperCase()} ${B.euro(o.total)} — ${B.STATUS[o.status].toUpperCase()}</span>`).join('');
$('#pauseChip').addEventListener('click', (e) => { e.currentTarget.classList.toggle('live'); say(e.currentTarget.classList.contains('live') ? 'Ordini in pausa' : 'Ordini riaperti'); });

/* ── Panoramica ── */
function overview() {
  const t = B.today, s = D.stats, dRev = B.delta(t.rev, B.avg7('rev')), dN = B.delta(t.n, B.avg7('n')), peak = Math.max(...s.hours.map((x) => x[1]));
  return `
  <div class="box card y s4 press"><h3>Incasso oggi</h3><div class="huge">${B.euro0(t.rev)}</div><span class="delta ${dRev >= 0 ? '' : 'down'}">${dRev >= 0 ? '▲' : '▼'} ${Math.abs(dRev).toFixed(0)}% VS 7 GG</span></div>
  <div class="box card c s4 press"><h3>Ordini oggi</h3><div class="huge">${t.n}</div><span class="delta ${dN >= 0 ? '' : 'down'}">${dN >= 0 ? '▲' : '▼'} ${Math.abs(dN).toFixed(0)}% VS 7 GG</span></div>
  <div class="box card w s4"><h3>Carico cucina <span class="r lbl">trascina</span></h3><div class="gcard" id="gcard" data-showcase><div class="band" id="band"></div><div class="read"><span id="gval">0</span><small>%</small></div></div><div class="gsub">${B.orders.filter((o) => o.status <= 2).length} ordini in lavorazione · ${s.prepMin} min di preparazione</div></div>
  <div class="box card w s8"><h3>Ordini per ora</h3><div class="hours">${s.hours.map(([h, n]) => `<i style="--h:${n / peak * 100}%" data-h="${h}" class="${n === peak ? 'peak' : ''}"></i>`).join('')}</div><div class="hours-pad"></div><div class="sub">DUE PICCHI: PRANZO 12–13, CENA 19–20. IL ${Math.round(s.hours.filter(([h]) => h >= 18).reduce((a, x) => a + x[1], 0) / s.hours.reduce((a, x) => a + x[1], 0) * 100)}% DEGLI ORDINI ARRIVA LA SERA.</div></div>
  <div class="box card p s4 press"><h3>Scontrino medio</h3><div class="big">${B.euro(t.rev / t.n)}</div><div class="sub">OBIETTIVO € 28</div><h3 style="margin-top:14px">Preparazione</h3><div class="big">${s.prepMin} MIN</div><div class="sub">MEDIANA 7 GIORNI</div></div>
  <div class="box card w s6"><h3>Canali · 30 giorni</h3><div class="stack">${s.channels.map(([n, v], i) => `<i style="--w:${v}%;--c2:${COL[n]};--d:${i * 110}ms">${v >= 10 ? v + '%' : ''}</i>`).join('')}</div><div class="leg">${s.channels.map(([n, v]) => `<span style="--c2:${COL[n]}">${n} ${v}%</span>`).join('')}</div></div>
  <div class="box card w s6"><h3>Top 5 · 30 giorni</h3><div class="dishes">${D.top.map(([n, c, img, q], i) => `<div class="dish"><img src="../_mdesk/${img}" alt="" style="--r:${[-3, 2, -2, 3, -1][i]}deg"><div><b>${n}</b><small>${c.toUpperCase()}</small></div><span class="n">${q}</span><div class="bar"><i style="--w:${q / D.top[0][3] * 100}%"></i></div></div>`).join('')}</div></div>
  <div class="box card w s7"><h3>Ultimi ordini</h3><table class="feed">${B.orders.slice(0, 7).map((o) => `<tr><td class="m">${o.t}</td><td class="m">#${o.short}</td><td><span class="chtag" style="--c2:${COL[o.ch]}">${o.ch}</span></td><td>${o.name}</td><td>${o.type.toUpperCase()}</td><td class="r">${B.euro(o.total)}</td></tr>`).join('')}</table></div>
  <div class="box card k s5"><h3>Chiusura di cassa</h3><div class="big">${B.euro0(t.rev)}</div><div class="sub" style="opacity:.8">${t.n} ORDINI · CONTANTI ${B.euro0(t.rev * .04)} · CARTA ${B.euro0(t.rev * .36)} · PIATTAFORME ${B.euro0(t.rev * .6)}</div><div class="slide" id="slide"><div class="label">Scorri per chiudere la cassa</div><div class="done">✓ Cassa chiusa · stampa in corso</div><div class="grip" id="grip"><span>→</span></div></div></div>`;
}
function wireOverview(root) {
  // wheel gauge
  const gcard = $('#gcard', root), band = $('#band', root), val = $('#gval', root), N = 48, SWEEP = 300, start = 90 + (360 - SWEEP) / 2;
  band.style.setProperty('--start', start + 'deg'); band.style.setProperty('--step', (SWEEP / (N - 1)) + 'deg');
  const ticks = Array.from({ length: N }, (_, i) => { const t = document.createElement('i'); t.className = 'tick'; t.style.setProperty('--i', i); band.appendChild(t); return t; });
  let reading = 0, t0 = performance.now(), dragging = false;
  (function frame(now) { if (!band.isConnected) return; if (!dragging && !reduce) reading += (state.load - reading) * .06; else if (reduce) reading = state.load; const lit = Math.round(reading * (N - 1)); val.textContent = Math.round(reading * 100); const amp = (1 + reading * 2.6) * 1.6, ph = (now - t0) / 1000 * 2.2; ticks.forEach((t, i) => { const on = i <= lit; t.classList.toggle('lit', on); t.style.setProperty('--len', (on ? 16 + amp * (.5 + .5 * Math.sin(ph - i * .35)) : 16).toFixed(1) + 'px'); }); requestAnimationFrame(frame); })(t0);
  const setFrom = (e) => { const r = gcard.getBoundingClientRect(); const a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI + 360 - 90 + 180) % 360; state.load = reading = Math.max(0, Math.min(1, (a - (360 - SWEEP) / 2) / SWEEP)); };
  gcard.addEventListener('pointerdown', (e) => { dragging = true; gcard.setPointerCapture(e.pointerId); setFrom(e); });
  gcard.addEventListener('pointermove', (e) => { if (dragging) setFrom(e); });
  const up = () => { dragging = false; }; gcard.addEventListener('pointerup', up); gcard.addEventListener('pointercancel', up);
  // slide to confirm
  const slide = $('#slide', root), grip = $('#grip', root), PAD = 4, GRIP = 52; let x = 0, vel = 0, target = 0, drag2 = false, grab = null, done = false, w = 0;
  const W = () => slide.clientWidth - 6, travel = () => W() - PAD * 2 - GRIP;
  const paint = () => { grip.style.transform = `translateX(${x.toFixed(2)}px)`; if (done) { w = w + (W() - PAD * 2 - w) * .18; grip.style.width = w.toFixed(1) + 'px'; grip.style.transform = `translateX(${(W() - PAD * 2 - w).toFixed(2)}px)`; } slide.querySelector('.label').style.opacity = done ? 0 : (1 - x / travel() * 1.4).toFixed(2); };
  let last = performance.now();
  (function frame(now) { if (!slide.isConnected) return; const dt = Math.min(.04, (now - last) / 1000); last = now; if (!drag2) { const k = 310, d = 2 * Math.sqrt(k) * .95; vel += (-k * (x - target) - d * vel) * dt; x += vel * dt; if (Math.abs(vel) < .01 && Math.abs(x - target) < .05) { x = target; vel = 0; } } paint(); requestAnimationFrame(frame); })(last);
  grip.addEventListener('pointerdown', (e) => { if (done) return; drag2 = true; grab = null; grip.setPointerCapture(e.pointerId); });
  grip.addEventListener('pointermove', (e) => { if (!drag2) return; const at = e.clientX - slide.getBoundingClientRect().left; if (grab === null) { grab = at - x; return; } x = Math.max(0, Math.min(travel(), at - grab)); });
  const lift = () => { if (!drag2) return; drag2 = false; if (x > travel() * .72) commit(); else target = 0; };
  grip.addEventListener('pointerup', lift); grip.addEventListener('pointercancel', lift);
  function commit() { target = travel(); done = true; w = GRIP; slide.classList.add('is-done'); say('Chiusura di cassa stampata'); setTimeout(reset, 2600); }
  function reset() { done = false; slide.classList.remove('is-done'); grip.style.width = GRIP + 'px'; x = travel(); target = 0; }
}

/* ── Ordini ── */
function board() {
  const list = state.chan === 'Tutti' ? B.orders : B.orders.filter((o) => o.ch === state.chan);
  const byS = [0, 1, 2, 3].map((s) => B.orders.filter((o) => o.status === s).length);
  return `<div class="box card w s4"><h3>Filtra per canale <span class="r lbl">clicca</span></h3><div class="cluster" id="cluster"></div><div class="csub" id="csub"></div></div>
  <div class="box card w s8"><h3>Stato del turno</h3><div style="display:flex;flex-wrap:wrap;gap:14px 18px;margin-top:14px">${[['In attesa', byS[0], 'o'], ['Confermati', byS[1], 'c'], ['In preparazione', byS[2], 'p'], ['Pronti', byS[3], 'l']].map(([l, n, c]) => `<div><span class="sticker ${c}">${l}</span><div class="huge" style="font-size:44px">${n}</div></div>`).join('')}</div><div class="sub" style="margin-top:10px">PREMI IL <b>+</b> SU UNA SCHEDA, TRASCINA VERSO L’AZIONE E LASCIA.</div></div>
  <div class="orders" id="orders">${list.filter((o) => o.status < 5).map((o) => `<div class="box card w order" data-num="${o.num}"><span class="sticker stamp" style="background:${COL[o.ch]}">${o.ch}${o.code ? ' · ' + o.code : ''}</span><div class="head"><b>#${o.short}</b><span class="lbl">${B.STATUS[o.status]}</span><span class="t">${o.t}</span></div><div class="who">${o.name.toUpperCase()} · ${o.type.toUpperCase()}${o.status === 0 && o.minutes > 8 ? ` <span class="late">+${o.minutes} MIN</span>` : ''}</div><ul>${o.items.map((x) => `<li><span>${x.q}×</span>${x.p.name}</li>`).join('')}</ul><div class="foot"><b>${B.euro(o.total)}</b><span class="fan-hint">azioni →</span><div class="fan" data-fan style="--n:4;--spread:150deg;--radius:64px"><div class="opts"><div class="fan-opt" style="--i:0" data-act="next">✓<small>${o.status === 0 ? 'Conferma' : B.STATUS[o.status + 1]}</small></div><div class="fan-opt" style="--i:1" data-act="print">⎙<small>Stampa</small></div><div class="fan-opt" style="--i:2" data-act="call">☎<small>Chiama</small></div><div class="fan-opt" style="--i:3" data-act="cancel">✕<small>Annulla</small></div></div><div class="fan-core">+</div></div></div></div>`).join('') || '<div class="box card w s12"><b>NESSUN ORDINE APERTO SU QUESTO CANALE.</b></div>'}</div>`;
}
function wireBoard(root) {
  // magnetic select: TUTTI in the middle, six channels on a hexagon
  const cluster = $('#cluster', root), csub = $('#csub', root), CHIP = 52, PITCH = CHIP + 14;
  const NAMES = ['Tutti', ...D.stats.channels.map(([n]) => n)];
  const pts = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3 - Math.PI / 2) * PITCH, Math.sin(i * Math.PI / 3 - Math.PI / 2) * PITCH])];
  const mk = (v) => ({ v, t: v, vel: 0, k: 260, d: 24, wait: 0 });
  const step = (s, dt) => { if (s.wait > 0) { s.wait -= dt; return; } const f = -s.k * (s.v - s.t) - s.d * s.vel; s.vel += f * dt; s.v += s.vel * dt; if (Math.abs(s.vel) < .001 && Math.abs(s.v - s.t) < .001) { s.v = s.t; s.vel = 0; } };
  const chips = pts.map(([x, y], i) => { const el = document.createElement('div'); el.className = 'chip'; el.innerHTML = `<div class="face">${NAMES[i].replace(' ', '<br>')}</div>`; cluster.appendChild(el); el.addEventListener('click', () => { select(i); state.chan = NAMES[i]; refreshOrders(root); }); return { el, x, y, sx: mk(0), sy: mk(0), scx: mk(1), scy: mk(1), rot: mk(0) }; });
  let sel = NAMES.indexOf(state.chan);
  function select(i, quiet) {
    sel = i; chips.forEach((c, k) => c.el.classList.toggle('on', k === i));
    const pull = .55, bounce = .55, give = .5, grow = 1.16 + .22 * pull, room = CHIP * (grow - 1) / 2, aura = 3 + 9 * pull;
    const k = 200 + 160 * (1 - bounce) + 60, damp = (b) => 2 * Math.sqrt(k * b) * (1 - .72 * bounce), swing = (kk) => ({ k: kk, d: damp(kk / k) });
    const s = chips[i];
    chips.forEach((c, j) => {
      if (j === i) { c.sx.t = 0; c.sy.t = 0; c.scx.t = grow; c.scy.t = grow; c.rot.t = 0; Object.assign(c.sx, swing(k)); Object.assign(c.sy, swing(k)); Object.assign(c.scx, swing(k * 1.24)); Object.assign(c.scy, swing(k * .86)); return; }
      const dx = c.x - s.x, dy = c.y - s.y, gap = Math.hypot(dx, dy), far = gap / PITCH, fall = Math.exp(-(far - 1) / 1.8), push = room + aura * fall;   // the shove is a vector; the aura decays with real distance
      c.sx.t = dx / gap * push; c.sy.t = dy / gap * push; c.scx.t = 1; c.scy.t = 1; c.rot.t = dx / gap * 10 * give * fall;
      for (const sp of [c.sx, c.sy, c.scx, c.scy, c.rot]) sp.wait = quiet ? 0 : far * .022;   // the far chips are 22ms late per step: a force travelling outward
      Object.assign(c.sx, swing(k)); Object.assign(c.sy, swing(k)); Object.assign(c.scx, swing(k * 1.24)); Object.assign(c.scy, swing(k * .86)); Object.assign(c.rot, swing(k));
    });
    csub.textContent = i === 0 ? 'TUTTI I CANALI' : `SOLO ${NAMES[i].toUpperCase()}`;
  }
  let last = performance.now();
  (function frame(now) { if (!cluster.isConnected) return; const dt = Math.min(.05, (now - last) / 1000); last = now; for (const c of chips) { for (const sp of [c.sx, c.sy, c.scx, c.scy, c.rot]) step(sp, dt); c.el.style.transform = `translate(${(c.x + c.sx.v).toFixed(2)}px, ${(c.y + c.sy.v).toFixed(2)}px) rotate(${c.rot.v.toFixed(2)}deg) scale(${c.scx.v.toFixed(3)}, ${c.scy.v.toFixed(3)})`; } requestAnimationFrame(frame); })(last);
  select(sel, true);
  wireFans(root);
}
function refreshOrders(root) { const tmp = document.createElement('div'); tmp.innerHTML = board(); $('#orders', root).replaceWith(tmp.querySelector('#orders')); wireFans(root); }
/* radial menu: opening, aiming and committing are one gesture */
function wireFans(root) {
  root.querySelectorAll('[data-fan]').forEach((fan) => {
    const core = fan.querySelector('.fan-core'), els = [...fan.querySelectorAll('.fan-opt')], n = els.length, arc = 150, R = 64;
    let aim = -1, origin = null, moved = false, open = false;
    const angleOf = (i) => (-90 - arc / 2 + arc / (n - 1) * i) * Math.PI / 180;
    const nearest = (dx, dy) => { const a = Math.atan2(dy, dx); let best = -1, bd = 1e9; els.forEach((_, i) => { const d = Math.abs(Math.atan2(Math.sin(a - angleOf(i)), Math.cos(a - angleOf(i)))); if (d < bd) { bd = d; best = i; } }); return bd < Math.PI / 3 ? best : -1; };
    const setAim = (i) => { aim = i; els.forEach((el, k) => el.classList.toggle('aim', k === i)); };
    const setOpen = (v) => { open = v; if (v) fan.dataset.open = ''; else delete fan.dataset.open; if (!v) setAim(-1); };
    const commit = (i) => { setOpen(false); act(els[i].dataset.act, fan.closest('.order'), root); };
    core.addEventListener('pointerdown', (e) => { origin = { x: e.clientX, y: e.clientY }; moved = false; setOpen(true); core.setPointerCapture(e.pointerId); });
    core.addEventListener('pointermove', (e) => { if (!origin) return; const dx = e.clientX - origin.x, dy = e.clientY - origin.y; if (Math.hypot(dx, dy) < 14) return setAim(-1); moved = true; setAim(nearest(dx, dy)); });
    const end = () => { if (!origin) return; if (moved && aim >= 0) commit(aim); else if (moved) setOpen(false); origin = null; };
    core.addEventListener('pointerup', end); core.addEventListener('pointercancel', end);
    els.forEach((el, i) => el.addEventListener('click', () => commit(i)));
    document.addEventListener('pointerdown', (e) => { if (!fan.contains(e.target) && open) setOpen(false); });
  });
}
function act(kind, card, root) {
  const o = B.orders.find((x) => x.num === card.dataset.num);
  if (kind === 'next') { o.status = Math.min(5, o.status + 1); if (o.status === 4 && o.type !== 'Consegna') o.status = 5; say(`#${o.short} → ${B.STATUS[o.status]}`); }
  if (kind === 'cancel') { o.status = 5; say(`#${o.short} annullato`); }
  if (kind === 'print') return say(`Ricevuta #${o.short} in stampa`);
  if (kind === 'call') return say(`Chiamo ${o.name}…`);
  card.style.transition = 'transform 160ms, opacity 160ms'; card.style.transform = 'rotate(-2deg) scale(.96)'; card.style.opacity = '0';
  setTimeout(() => { view.innerHTML = board(); wireBoard(view); }, reduce ? 0 : 160);
}

/* ── Menu ── */
function menu() {
  const cats = [...new Set(D.menu.map((p) => p.cat))];
  return `<div class="cats" id="cats"><button type="button" class="${state.menuCat ? '' : 'on'}" data-c="">Tutti</button>${cats.map((c) => `<button type="button" class="${state.menuCat === c ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
  <div class="mgrid">${D.menu.map((p, i) => `<div class="box card w prod ${state.out.has(p.name) ? 'out' : ''}" data-i="${i}" style="${state.menuCat && p.cat !== state.menuCat ? 'display:none' : ''}"><img src="../_mdesk/${p.img}" alt="${p.name}" loading="lazy"><span class="sticker stamp" style="background:#ff3b3b;color:#fff">Esaurito</span><h4>${p.name}</h4><small>${p.code ? p.code + ' · ' : ''}${p.cat.toUpperCase()}</small><div class="pf"><b>${B.euro(p.price)}</b><button type="button" data-out>${state.out.has(p.name) ? 'Rimetti' : 'Esaurito'}</button></div></div>`).join('')}</div>`;
}
function wireMenu(root) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-out]'); if (b) { const p = D.menu[+b.closest('.prod').dataset.i]; state.out.has(p.name) ? state.out.delete(p.name) : state.out.add(p.name); say(`${p.name}: ${state.out.has(p.name) ? 'esaurito' : 'in vendita'}`); view.innerHTML = menu(); wireMenu(view); return; }
    const c = e.target.closest('#cats button'); if (c) { state.menuCat = c.dataset.c; view.innerHTML = menu(); wireMenu(view); }
  });
}

const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'Gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'Zone di consegna, costi, tempi stimati.', rider: 'Rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'Punti, premi, coupon.', clienti: 'Rubrica clienti con storico ordini.', report: 'Chiusure giornaliere, export contabile.', stampa: 'Stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'Orari, pausa ordini, auto-conferma, integrazioni.' };
const SCREENS = { panoramica: [overview, wireOverview], ordini: [board, wireBoard], menu: [menu, wireMenu] };
function go(id) {
  state.module = id; tabs.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id));
  const [html, wire] = SCREENS[id] || [() => `<div class="box card w stub"><b>${B.label(id)}</b>${STUBS[id] || ''}<br><small>IN QUESTA DEMO SONO ATTIVE PANORAMICA, ORDINI E MENU.</small></div>`, () => {}];
  view.innerHTML = html(); wire(view); try { history.replaceState(null, '', '#' + id); } catch (_) {} window.scrollTo(0, 0);
}
document.querySelector('.brand').addEventListener('click', (e) => { e.preventDefault(); go('panoramica'); });
go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
