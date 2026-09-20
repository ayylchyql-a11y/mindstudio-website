/* Design 09 · Bento — the back office as a grid of instruments.
   Screens: Panoramica (activity rings for today's targets, score gauge, a draggable revenue
   goal over the last 7 days, top dishes as a bubble chart, a liquid toggle for auto-confirm,
   a drag stepper for the quoted waiting time, channels, hours, feed), Ordini (orders as tiles
   sized by urgency), Menu (photo tiles with sold-out). Every tile sinks under the pointer.
   Library parts: activity-rings · score-gauge · draggable-goal-line · bubble-chart-nudge ·
   liquid-toggle · drag-stepper · tilt-card · oklch-palette. */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const view = $('#view'), tabs = $('#tabs'), moreMenu = $('#moreMenu'), more = $('#more');
const MAIN = ['panoramica', 'ordini', 'menu'];
const HUE = { Deliveroo: 174, Chiosco: 162, 'Just Eat': 30, Sito: 222, App: 252, Cassa: 38 };
let autoConfirm = true, wait = 25, menuCat = '';

tabs.innerHTML = MAIN.map((id) => `<a href="#${id}" data-id="${id}">${B.label(id)}</a>`).join('');
moreMenu.innerHTML = B.NAV.filter((n) => !MAIN.includes(n.id)).map((n) => `<a href="#${n.id}" data-id="${n.id}">${B.icon(n.id, 16)}${n.label}</a>`).join('');
$('#pauseChip').addEventListener('click', (e) => e.currentTarget.classList.toggle('live'));

const tile = (cls, h, inner, extra = '') => `<div class="tile ${cls}" style="--h:${h}" ${extra}>${inner}<div class="shade"></div></div>`;

/* ── Panoramica ── */
function overview() {
  const t = B.today, s = D.stats, peak = Math.max(...s.hours.map((x) => x[1]));
  const dRev = B.delta(t.rev, B.avg7('rev')), dN = B.delta(t.n, B.avg7('n'));
  const kpi = (label, val, d, sub) => `<h3>${label}</h3><div class="big">${val}</div><small class="d ${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}% ${sub}</small>`;
  return [
    tile('w2 h2', 40, `<h3>Obiettivi di oggi</h3><div class="rings"><svg viewBox="0 0 150 150"><g class="g"><circle class="track" cx="75" cy="75" r="62"/><circle class="track" cx="75" cy="75" r="47"/><circle class="track" cx="75" cy="75" r="32"/><circle id="r0" cx="75" cy="75" r="62" stroke="#e07a2f"/><circle id="r0x" cx="75" cy="75" r="62" stroke="#a8501a"/><circle id="r1" cx="75" cy="75" r="47" stroke="#2f9e6a"/><circle id="r2" cx="75" cy="75" r="32" stroke="#3a6fd8"/></g><text class="c" x="75" y="78" id="rc">0</text><text class="cs" x="75" y="90">ORDINI</text></svg>
      <div><div class="stat" style="--c:#e07a2f"><div class="n"><i></i>Incasso</div><div class="p" id="p0">0%</div><div class="pill2" id="over">obiettivo superato</div><div class="s">${B.euro0(t.rev)} / € 700</div></div>
      <div class="stat" style="--c:#2f9e6a"><div class="n"><i></i>Ordini</div><div class="p" id="p1">0%</div><div class="s">${t.n} / 32</div></div>
      <div class="stat" style="--c:#3a6fd8"><div class="n"><i></i>Scontrino medio</div><div class="p" id="p2">0%</div><div class="s">${B.euro(t.rev / t.n)} / € 28</div></div></div></div>`),
    tile('', 45, kpi('Incasso oggi', B.euro0(t.rev), dRev, 'vs 7 gg')),
    tile('', 150, kpi('Ordini oggi', t.n, dN, 'vs 7 gg')),
    tile('w2 h2', 222, `<h3>Obiettivo incasso · 7 giorni</h3><div class="gkpi"><b id="gdays">0</b><small>giorni su 7 sopra l'obiettivo</small></div><div class="gchart" id="gchart"><div class="goal" id="goal"><span class="tag" id="gtag"></span><span class="knob"></span></div></div><div class="gx" id="gx"></div>`, 'data-showcase'),
    tile('', 90, `<h3>Auto-conferma</h3><div class="liq on" id="liq"><svg viewBox="0 0 88 44"><g filter="url(#goo)"><circle id="drop" cx="66" cy="22" r="14"/><circle id="thumb" cx="66" cy="22" r="17"/></g></svg></div><div class="tstate" id="tstate">Attiva · gli ordini si confermano da soli</div>`),
    tile('', 200, `<h3>Attesa dichiarata</h3><div class="stp" id="stp"><button type="button" data-d="-1" aria-label="Meno">−</button><div class="val"><span id="wv">${wait}</span><small>min</small></div><button type="button" data-d="1" aria-label="Più">+</button></div><small class="d">tieni premuto e trascina</small>`),
    tile('w2 h2', 340, `<h3>Piatti più venduti · 30 gg <span class="r">tocca una bolla</span></h3><div class="field" id="field"></div>`),
    tile('w2', 280, `<h3>Punteggio servizio</h3><div class="gauge"><svg viewBox="0 0 300 175"><path class="seg" id="s0" stroke="#c9c5bb"/><path class="seg" id="s1" stroke="#e0b64a"/><path class="seg" id="s2" stroke="#2f9e6a"/><g id="needle"><line x1="150" y1="140" x2="150" y2="52" stroke="#1c1b18" stroke-width="3" stroke-linecap="round"/><circle cx="150" cy="140" r="7" fill="#1c1b18"/><circle cx="150" cy="140" r="3" fill="#fff"/></g><text class="num" x="150" y="128" id="gnum">0</text></svg><div><div class="verdict" id="verdict"></div><p>Tempo di preparazione ${s.prepMin} min, ${Math.round(s.types[0][1])}% consegne, scontrino sopra la media.</p><button class="replay" id="replay" type="button">Rifai</button></div></div>`),
    tile('w2 h2 white', 0, `<h3>Ultimi ordini</h3><ul class="feed">${B.orders.slice(0, 8).map((o) => `<li><span class="t">${o.t}</span><span class="tag" style="--c:${o.col}">${o.ch}</span><span>${o.name} · ${o.type}</span><span class="e">${B.euro(o.total)}</span></li>`).join('')}</ul>`),
    tile('w2', 20, `<h3>Canali · 30 gg</h3><div class="stack">${s.channels.map(([n, v], i) => `<i style="--w:calc(${v}% - 3px);--c:oklch(70% .14 ${HUE[n]});--d:${i * 110}ms"></i>`).join('')}</div><div class="leg">${s.channels.slice(0, 4).map(([n, v]) => `<span><i style="--c:oklch(70% .14 ${HUE[n]})"></i>${n} <b>${v}%</b></span>`).join('')}</div>`),
    tile('w2 white', 0, `<h3>Ordini per ora</h3><div class="hours">${s.hours.map(([h, n]) => `<i style="--h:${n / peak * 100}%" data-h="${h}" class="${n === peak ? 'peak' : ''}"></i>`).join('')}</div>`),
  ].join('');
}
function wireOverview(root) {
  // rings — one clock for the three arcs, the three numbers and the centre count
  const t = B.today, TARGET = [t.rev / 700, t.n / 32, (t.rev / t.n) / 28];
  const rings = [0, 1, 2].map((i) => $('#r' + i, root)), extra = $('#r0x', root), pcts = [0, 1, 2].map((i) => $('#p' + i, root)), rc = $('#rc', root), over = $('#over', root);
  const setup = (c) => { const L = 2 * Math.PI * c.r.baseVal.value; c.style.strokeDasharray = L; c.style.strokeDashoffset = L; return L; };
  const LEN = rings.map(setup), LENX = setup(extra);
  const draw = (k) => { TARGET.forEach((goal, i) => { const v = goal * k, first = Math.min(v, 1); rings[i].style.strokeDashoffset = LEN[i] * (1 - first); pcts[i].textContent = Math.round(v * 100) + '%'; if (i === 0) { const o = Math.max(0, v - 1); extra.style.strokeDashoffset = LENX * (1 - o); over.classList.toggle('show', o > 0); } }); rc.textContent = Math.round(t.n * k); };
  if (reduce) draw(1); else { const t0 = performance.now(); const tick = (now) => { const k = Math.min(1, (now - t0) / 1400); draw(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

  // goal line over the last 7 days
  const last7 = B.days.slice(-7), MAX = Math.max(...last7.map((d) => d.rev)) * 1.15;
  const chart = $('#gchart', root), goal = $('#goal', root), tag = $('#gtag', root), gdays = $('#gdays', root);
  const bars = last7.map((d, i) => { const b = document.createElement('div'); b.className = 'b'; b.style.setProperty('--h', (d.rev / MAX * 100) + '%'); b.style.setProperty('--i', i); chart.insertBefore(b, goal); return b; });
  $('#gx', root).innerHTML = last7.map((d) => `<span>${B.dateIt(d.d, { weekday: 'short' })}</span>`).join('');
  let g = 600;
  const apply = () => { goal.style.setProperty('--y', (g / MAX * 100) + '%'); tag.textContent = `obiettivo ${B.euro0(g)}`; let n = 0; bars.forEach((b, i) => { const hit = last7[i].rev >= g; b.classList.toggle('hit', hit); n += hit; }); gdays.textContent = n; };
  let dragging = false;
  const fromY = (y) => { const r = chart.getBoundingClientRect(); return Math.max(100, Math.min(MAX * .95, Math.round((r.bottom - y) / r.height * MAX / 10) * 10)); };
  goal.addEventListener('pointerdown', (e) => { dragging = true; goal.classList.add('drag'); goal.setPointerCapture(e.pointerId); });
  goal.addEventListener('pointermove', (e) => { if (!dragging) return; g = fromY(e.clientY); apply(); });
  const stop = () => { dragging = false; goal.classList.remove('drag'); };
  goal.addEventListener('pointerup', stop); goal.addEventListener('pointercancel', stop);
  apply();
  if (!reduce) { const t0 = performance.now(), from = 600, to = 420; const tick = (now) => { const k = Math.min(1, (now - t0 - 1200) / 900); if (k < 0) return requestAnimationFrame(tick); const e = .5 - Math.cos(k * Math.PI) / 2; g = Math.round((from + (to - from) * Math.sin(e * Math.PI)) / 10) * 10; apply(); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

  // bubbles: area ∝ quantity, hand-placed centres, the grown one pushes only what it overlaps
  const field = $('#field', root);
  const rest = D.top.reduce((a, x) => a + x[3], 0);
  const ITEMS = [...D.top.map(([name, cat, img, n], i) => [name, n, img, [30, 66, 16, 44, 62][i], [48, 28, 84, 86, 84][i]]), ['Altri piatti', Math.round(rest * .45), null, 82, 66]];
  const K = 6, GROW = 1.3, PAD = 8;
  const bubs = ITEMS.map(([name, n, img, x, y], i) => { const b = document.createElement('div'); b.className = 'bub'; b.style.cssText = `--x:${x}%;--y:${y}%;--d:${Math.max(46, Math.sqrt(n) * K)}px;--c:oklch(88% .07 ${[45, 45, 45, 150, 90, 260][i]});--delay:${i * 60}ms;--f:${n < 40 ? 9 : 11}px`; b.innerHTML = `${img ? `<img src="../_mdesk/${img}" alt="">` : ''}<b>${name.replace('Componi ', '').replace('Ravioli artigianali di carne 3 pz', 'Ravioli carne')}</b><small>${n} porzioni</small>`; b.addEventListener('click', () => pickB(i)); field.appendChild(b); return b; });
  let cur = -1;
  function pickB(i) { cur = cur === i ? -1 : i; applyB(); }
  function applyB() {
    field.classList.toggle('pick', cur >= 0); const W = field.clientWidth, H = field.clientHeight;
    bubs.forEach((b, k) => { b.classList.toggle('on', k === cur); b.style.setProperty('--s', k === cur ? GROW : 1); if (cur < 0 || k === cur) { b.style.setProperty('--dx', '0px'); b.style.setProperty('--dy', '0px'); return; } const p = ITEMS[cur], q = ITEMS[k]; const dx = (q[3] - p[3]) / 100 * W, dy = (q[4] - p[4]) / 100 * H, dist = Math.hypot(dx, dy) || 1; const rp = Math.sqrt(p[1]) * K / 2 * GROW, rq = Math.sqrt(q[1]) * K / 2; const push = Math.max(0, rp + rq + PAD - dist); b.style.setProperty('--dx', (dx / dist * push) + 'px'); b.style.setProperty('--dy', (dy / dist * push) + 'px'); });
  }
  setTimeout(() => pickB(0), reduce ? 0 : 900);

  // gauge: three bands, a sweep with a small overshoot, number and verdict written by the same clock
  const CX = 150, CY = 140, R = 110, GAP = 2.5, BANDS = [[0, 40, 'Da migliorare', '#8a867c'], [40, 70, 'Buono', '#b58a1a'], [70, 100, 'Ottimo', '#2f9e6a']];
  const ang = (v) => Math.PI * (1 - v / 100), pt = (a) => [CX + R * Math.cos(a), CY - R * Math.sin(a)];
  const arc = (a, b) => { const [x1, y1] = pt(ang(a)), [x2, y2] = pt(ang(b)); return `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`; };
  BANDS.forEach(([a, b], i) => $('#s' + i, root).setAttribute('d', arc(a + (i ? GAP : 0), b - (i < 2 ? GAP : 0))));
  const needle = $('#needle', root), num = $('#gnum', root), verdict = $('#verdict', root), VALUE = 82;
  const show = (v) => { needle.style.transform = `rotate(${-90 + v * 1.8}deg)`; num.textContent = Math.round(v); const [, , name, col] = BANDS.find(([a, b]) => v >= a && v <= b) || BANDS[2]; verdict.textContent = name; verdict.style.color = col; };
  const sweep = () => { if (reduce) return show(VALUE); const t0 = performance.now(); const tick = (now) => { const k = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - k, 3), o = Math.sin(k * Math.PI * 2.2) * Math.pow(1 - k, 2.2) * 9; show(Math.max(0, VALUE * e + o)); if (k < 1) requestAnimationFrame(tick); else show(VALUE); }; requestAnimationFrame(tick); };
  sweep(); $('#replay', root).addEventListener('click', () => { show(0); sweep(); });

  // liquid toggle: two springs — the thumb lands, the drop chases it and stretches into a neck
  const liq = $('#liq', root), thumb = $('#thumb', root), drop = $('#drop', root), tstate = $('#tstate', root);
  const X0 = 22, X1 = 66, th = { v: autoConfirm ? X1 : X0, t: autoConfirm ? X1 : X0, vel: 0 }, ch = { v: th.v, vel: 0 };
  liq.classList.toggle('on', autoConfirm);
  let last = performance.now(), dragL = false, grab = null, alive = true;
  const step = (dt) => { const kT = 280, dT = 2 * Math.sqrt(kT) * .92; th.vel += (-kT * (th.v - th.t) - dT * th.vel) * dt; th.v += th.vel * dt; const kC = 280, dC = 22; ch.vel += (-kC * (ch.v - th.v) - dC * ch.vel) * dt; ch.v += ch.vel * dt; thumb.setAttribute('cx', th.v.toFixed(2)); drop.setAttribute('cx', ch.v.toFixed(2)); drop.setAttribute('r', (12 + 3 * Math.min(1, Math.abs(th.v - ch.v) / 12)).toFixed(2)); };
  const frame = (now) => { if (!alive || !liq.isConnected) return; const dt = Math.min(.04, (now - last) / 1000); last = now; step(dt); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  const setT = (v) => { autoConfirm = v; liq.classList.toggle('on', v); th.t = v ? X1 : X0; tstate.textContent = v ? 'Attiva · gli ordini si confermano da soli' : 'Spenta · ogni ordine va confermato a mano'; };
  liq.addEventListener('pointerdown', (e) => { dragL = true; grab = null; liq.setPointerCapture(e.pointerId); });
  liq.addEventListener('pointermove', (e) => { if (!dragL) return; const at = e.clientX - liq.getBoundingClientRect().left; if (grab === null) { grab = at - th.v; return; } th.v = Math.max(X0, Math.min(X1, at - grab)); th.t = th.v; th.vel = 0; });
  const up = () => { if (!dragL) return; dragL = false; if (grab === null) setT(!autoConfirm); else setT(th.v > (X0 + X1) / 2); };
  liq.addEventListener('pointerup', up); liq.addEventListener('pointercancel', up);

  // stepper: tap for one, hold 260ms and drag to sweep
  const stp = $('#stp', root), wv = $('#wv', root);
  let timer = 0, sweeping = false, origin = null, dir = 0, btn = null;
  stp.addEventListener('pointerdown', (e) => { btn = e.target.closest('button'); if (!btn) return; dir = +btn.dataset.d; origin = { x: e.clientX, v: wait }; btn.classList.add('hold'); stp.setPointerCapture(e.pointerId); timer = setTimeout(() => { sweeping = true; stp.classList.add('sweeping'); }, 260); });
  stp.addEventListener('pointermove', (e) => { if (!sweeping) return; wait = Math.round(Math.max(5, Math.min(90, origin.v + ((e.clientX - origin.x) / stp.clientWidth) * 60))); wv.textContent = wait; });
  const lift = () => { if (!btn) return; clearTimeout(timer); if (!sweeping) { wait = Math.max(5, Math.min(90, wait + dir)); wv.textContent = wait; } sweeping = false; stp.classList.remove('sweeping'); btn.classList.remove('hold'); btn = null; };
  stp.addEventListener('pointerup', lift); stp.addEventListener('pointercancel', lift);
}

/* ── Ordini: tiles sized by urgency — waiting orders are 2×2, working ones 2×1, ready ones 1×1 ── */
function board() {
  const open = B.orders.filter((o) => o.status < 5);
  return open.map((o) => { const size = o.status === 0 ? 'w2 h2' : o.status < 3 ? 'w2' : ''; const hue = o.status === 0 ? 40 : o.status < 3 ? 200 : 150;
    return tile(`otile ${size}`, hue, `<div class="head"><b>#${o.short}</b><span class="tag" style="--c:${o.col}">${o.ch}${o.code ? ' · ' + o.code : ''}</span><span class="t">${o.t}</span></div><div class="who">${o.name} · ${o.type}${o.status === 0 && o.minutes > 8 ? ` · <span class="late">da ${o.minutes} min</span>` : ''}</div>${size ? `<ul>${o.items.slice(0, size === 'w2 h2' ? 6 : 1).map((x) => `<li><span>${x.q}×</span>${x.p.name}${size === 'w2' && o.items.length > 1 ? ` <em style="font-style:normal;color:var(--muted)">+${o.items.length - 1} altri</em>` : ''}</li>`).join('')}</ul>` : ''}<div class="foot"><b>${B.euro(o.total)}</b><button class="btn ${o.status === 0 ? '' : 'soft'}" data-next type="button">${o.status === 0 ? 'Conferma' : '→ ' + B.STATUS[o.status + 1]}</button></div>`, `data-num="${o.num}"`); }).join('')
    + tile('w2 white', 0, `<h3>Turno</h3><div class="big">${open.length}</div><small class="d">ordini aperti · ${B.orders.length - open.length} chiusi. Le schede grandi aspettano una conferma; quelle piccole sono pronte.</small>`);
}
function wireBoard(root) {
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-next]'); if (!b) return; const t = b.closest('.tile'), o = B.orders.find((x) => x.num === t.dataset.num); o.status = Math.min(5, o.status + 1); if (o.status === 4 && o.type !== 'Consegna') o.status = 5; t.style.transition = 'opacity 180ms, transform 180ms'; t.style.opacity = '0'; t.style.transform = 'scale(.96)'; setTimeout(() => { view.innerHTML = board(); wireBoard(view); tiltAll(view); }, reduce ? 0 : 180); });
}

/* ── Menu ── */
function menu() {
  const cats = [...new Set(D.menu.map((p) => p.cat))];
  return `<div class="cats" id="cats"><span class="${menuCat ? '' : 'on'}" data-c="">Tutti</span>${cats.map((c) => `<span class="${menuCat === c ? 'on' : ''}" data-c="${c}">${c}</span>`).join('')}</div>` + D.menu.map((p, i) => tile('ptile', 0, `<img src="../_mdesk/${p.img}" alt="${p.name}" loading="lazy"><div class="lab"><h4>${p.name}</h4><div><span>${B.euro(p.price)}</span><button type="button" data-out>Esaurito</button></div></div>`, `data-i="${i}" data-c="${p.cat}"`)).join('');
}
function wireMenu(root) {
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-out]'); if (b) { const t = b.closest('.tile'); t.classList.toggle('out'); b.textContent = t.classList.contains('out') ? 'Esaurito ✓' : 'Esaurito'; return; } const c = e.target.closest('#cats span'); if (c) { menuCat = c.dataset.c; root.querySelectorAll('#cats span').forEach((x) => x.classList.toggle('on', x === c)); root.querySelectorAll('.ptile').forEach((t) => { t.style.display = !menuCat || t.dataset.c === menuCat ? '' : 'none'; }); } });
}

/* ── tilt: every tile sinks toward the pointer. Two springs per tile hold where the pointer is (−1..1);
      rotation, the dent gradient and the shadow are all read off them, so nothing can disagree. ── */
const tilts = new Map();
function tiltAll(root) {
  tilts.clear();
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  root.querySelectorAll('.tile').forEach((t) => {
    const st = { nx: 0, ny: 0, sx: 0, sy: 0, vx: 0, vy: 0, on: false, shade: t.querySelector('.shade') };
    t.addEventListener('pointermove', (e) => { const r = t.getBoundingClientRect(); st.nx = ((e.clientX - r.left) / r.width) * 2 - 1; st.ny = ((e.clientY - r.top) / r.height) * 2 - 1; st.on = true; });
    t.addEventListener('pointerleave', () => { st.on = false; });
    tilts.set(t, st);
  });
}
(function loop() {
  tilts.forEach((st, t) => {
    if (!st.on && Math.abs(st.sx) < .002 && Math.abs(st.sy) < .002 && Math.abs(st.vx) < .002 && Math.abs(st.vy) < .002) return;
    const k = 120, d = 2 * Math.sqrt(k) * .8, tx = st.on ? st.nx : 0, ty = st.on ? st.ny : 0;
    st.vx += (-k * (st.sx - tx) - d * st.vx) / 60; st.sx += st.vx / 60; st.vy += (-k * (st.sy - ty) - d * st.vy) / 60; st.sy += st.vy / 60;
    t.style.transform = `rotateX(${(-st.sy * 4).toFixed(2)}deg) rotateY(${(st.sx * 4).toFixed(2)}deg)`;   // cursor at the top → top goes back
    const m = Math.min(1, Math.hypot(st.sx, st.sy) + .3);
    if (st.shade) { st.shade.style.setProperty('--x', (50 + st.sx * 50).toFixed(1) + '%'); st.shade.style.setProperty('--y', (50 + st.sy * 50).toFixed(1) + '%'); st.shade.style.setProperty('--dark', (.12 * m).toFixed(3)); st.shade.style.setProperty('--lite', (.35 * m).toFixed(3)); }
    const l = Math.min(1, Math.hypot(st.sx, st.sy) * 1.4);
    t.style.boxShadow = `0 1px 2px #0000000a, 0 ${18 - 9 * l}px ${40 - 16 * l}px -26px #00000033`;   // the shadow tightens: a pressed thing has less air under it
  });
  requestAnimationFrame(loop);
})();

const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'Gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'Zone di consegna, costi, tempi stimati.', rider: 'Rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'Punti, premi, coupon.', clienti: 'Rubrica clienti con storico ordini.', report: 'Chiusure giornaliere, export contabile.', stampa: 'Stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'Orari, pausa ordini, auto-conferma, integrazioni.' };
const stub = (id) => `<div class="tile stub white"><div><b>${B.label(id)}</b>${STUBS[id] || ''}<br><small>In questa demo sono attive Panoramica, Ordini e Menu.</small></div></div>`;
const SCREENS = { panoramica: [overview, wireOverview], ordini: [board, wireBoard], menu: [menu, wireMenu] };
function go(id) {
  document.querySelectorAll('#tabs a, #moreMenu a').forEach((a) => a.classList.toggle('on', a.dataset.id === id));
  const [html, wire] = SCREENS[id] || [() => stub(id), () => {}];
  view.className = 'view ' + id; view.innerHTML = html(); wire(view); tiltAll(view);
  more.open = false; window.scrollTo(0, 0);
}
document.addEventListener('click', (e) => { const a = e.target.closest('#tabs a, #moreMenu a, .brand'); if (!a) return; e.preventDefault(); const id = a.dataset.id || 'panoramica'; try { history.replaceState(null, '', '#' + id); } catch (_) {} go(id); });
go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
