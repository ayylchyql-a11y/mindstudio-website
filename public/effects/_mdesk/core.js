/* M Desk demo — screens shared by the six sidebar designs.
   A design's own app.js builds the sidebar, then calls Mdesk.mount(...).
   Three screens are real (Panoramica, Ordini, Menu); the other modules are
   stubs so the navigation still has the restaurant's full module list. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const D = window.MDESK;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the root page loads assets/…, the design folders ../assets/… — read it off the stylesheet link
  const BASE = document.querySelector('link[href$="core.css"]').getAttribute('href').replace(/core\.css$/, '');
  const euro = (n) => '€ ' + n.toFixed(2).replace('.', ',');
  const euro0 = (n) => '€ ' + Math.round(n).toLocaleString('it-IT');

  // The real M Desk module list (Italian, in the order the back office shows it).
  const NAV = [
    ['panoramica', 'Panoramica', 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', 'sala'],
    ['ordini', 'Ordini', 'M9 4h6l1 2h3v14H5V6h3zM9 12l2 2 4-4', 'sala'],
    ['cucina', 'Cucina', 'M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-4 0-7zM5 21h14', 'sala'],
    ['cassa', 'Cassa', 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h5', 'sala'],
    ['prenotazioni', 'Prenotazioni', 'M4 5h16v15H4zM4 10h16M8 3v4M16 3v4', 'sala'],
    ['menu', 'Menu', 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z', 'gestione'],
    ['opzioni', 'Opzioni', 'M4 7h10M18 7h2M4 12h2M10 12h10M4 17h12M20 17h0M14 5v4M6 10v4M16 15v4', 'gestione'],
    ['piattaforme', 'Piattaforme', 'M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1', 'gestione'],
    ['consegne', 'Consegne', 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a1.5 1.5 0 1 0 0-.1M18 19a1.5 1.5 0 1 0 0-.1', 'gestione'],
    ['rider', 'Rider', 'M6 17a3 3 0 1 0 0-.1M18 17a3 3 0 1 0 0-.1M6 17l4-7h5l3 7M12 10l-2-4h3', 'gestione'],
    ['fedelta', 'Fedeltà', 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'gestione'],
    ['clienti', 'Clienti', 'M16 19v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 9a3.5 3.5 0 1 0 0-.1M20 19v-2a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8', 'gestione'],
    ['report', 'Report', 'M4 20V10M10 20V4M16 20v-7M22 20H2', 'sistema'],
    ['stampa', 'Stampa', 'M7 8V3h10v5M7 17H4v-6h16v6h-3M7 14h10v7H7z', 'sistema'],
    ['impostazioni', 'Impostazioni', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3.9a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 2.5a7 7 0 0 0-1.7 1L5 5.6 3 9l2 1.5a7 7 0 0 0 0 2L3 14l2 3.4 2.3-.9a7 7 0 0 0 1.7 1l.4 2.5h5l.4-2.5a7 7 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5c.1-.3.1-.7.1-1z', 'sistema'],
  ].map(([id, label, d, group]) => ({ id, label, d, group }));
  const GROUPS = { sala: 'Sala', gestione: 'Gestione', sistema: 'Sistema' };
  const icon = (id) => { const n = NAV.find((x) => x.id === id); return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${n.d}"/></svg>`; };

  // ── seeded orders built from the real menu ──
  let seed = 9; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const CH = [['Sito', '#2f6fff'], ['App', '#5b46d9'], ['Chiosco', '#16a37a'], ['Cassa', '#8a6d3b'], ['Deliveroo', '#00ccbc'], ['Just Eat', '#ff8000']];
  const TYPES = ['Consegna', 'Ritiro', 'Al tavolo'];
  const STATUS = ['In attesa', 'Confermato', 'In preparazione', 'Pronto', 'In consegna', 'Completato'];
  // channel mix in the same proportion as the real last 30 days (Deliveroo > kiosk > Just Eat > web)
  const MIX = ['Deliveroo', 'Chiosco', 'Just Eat', 'Deliveroo', 'Chiosco', 'Sito', 'Deliveroo', 'Just Eat', 'Chiosco'];
  const orders = Array.from({ length: 9 }, (_, i) => {
    const ch = CH.find((c) => c[0] === MIX[i]), n = 1 + Math.floor(rnd() * 4);
    const items = Array.from({ length: n }, () => ({ q: 1 + Math.floor(rnd() * 2), p: pick(D.menu) }));
    const total = items.reduce((s, x) => s + x.q * x.p.price, 0);
    const h = 19 + Math.floor(i / 3), m = String(Math.floor(rnd() * 60)).padStart(2, '0');
    return { num: `20260918-0${31 - i}`, ch, type: ch[0] === 'Chiosco' || ch[0] === 'Cassa' ? pick(['Ritiro', 'Al tavolo']) : ch[0] === 'Deliveroo' || ch[0] === 'Just Eat' ? 'Consegna' : pick(['Consegna', 'Ritiro']), status: i < 2 ? 0 : i < 5 ? 1 : i < 7 ? 2 : 3, items, total, t: `${h}:${m}`, code: ch[0] === 'Just Eat' ? String(220100000 + Math.floor(rnd() * 90000)) : ch[0] === 'Deliveroo' ? String(1000 + Math.floor(rnd() * 9000)) : '' };
  });

  // ── screens ──
  function kpis() {
    const days = D.stats.days, today = days[days.length - 1], yest = days[days.length - 2];
    const d = (a, b) => ((a - b) / b * 100);
    const cell = (label, val, delta, suffix) => `<div class="card kpi"><h3>${label}</h3><b>${val}</b><small class="${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(0)}% ${suffix}</small></div>`;
    return `<div class="kpis">${cell('Incasso oggi', euro0(today.rev), d(today.rev, yest.rev), 'vs ieri')}${cell('Ordini oggi', today.n, d(today.n, yest.n), 'vs ieri')}${cell('Scontrino medio', euro(today.rev / today.n), d(today.rev / today.n, yest.rev / yest.n), 'vs ieri')}<div class="card kpi"><h3>Tempo di preparazione</h3><b>${D.stats.prepMin} min</b><small>mediana, ultimi 7 giorni</small></div></div>`;
  }
  function overview() {
    const s = D.stats;
    const peak = Math.max(...s.hours.map((x) => x[1]));
    return `${kpis()}
      <div class="r2">
        <div class="card"><h3>Incassi <span class="seg" id="rangeSeg"><button class="on" data-r="30">30 giorni</button><button data-r="7">7 giorni</button></span></h3>
          <svg class="line-chart" viewBox="0 0 600 180" preserveAspectRatio="none" id="line"><defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs><line class="gridl" x1="0" x2="600" y1="45" y2="45"/><line class="gridl" x1="0" x2="600" y1="90" y2="90"/><line class="gridl" x1="0" x2="600" y1="135" y2="135"/><path class="area" id="area"/><path class="ln" id="ln"/></svg>
          <div class="axis" id="axis"></div></div>
        <div class="card"><h3>Canali</h3><div class="donut-wrap"><svg class="donut" viewBox="0 0 130 130" id="donut"><g id="slices"></g><text x="65" y="63" id="dc1">${s.days.reduce((a, x) => a + x.n, 0)}</text><text class="sub" x="65" y="78" id="dc2">30 GIORNI</text></svg><div class="legend" id="legend"></div></div></div>
      </div>
      <div class="r3">
        <div class="card"><h3>Ordini per ora</h3><div class="hours">${s.hours.map(([h, n]) => `<i style="--h:${n / peak * 100}%" data-h="${h}" class="${n === peak ? 'peak' : ''}"></i>`).join('')}</div><div class="hours-pad"></div></div>
        <div class="card"><h3>Piatti più venduti</h3><div class="dishes">${topDishes()}</div></div>
        <div class="card"><h3>Ultimi ordini</h3><table class="recent">${orders.slice(0, 6).map((o) => `<tr><td><b>${o.num.slice(-3)}</b></td><td><span class="tag" style="--c:${o.ch[1]}">${o.ch[0]}</span></td><td>${o.type}</td><td>${o.t}</td><td>${euro(o.total)}</td></tr>`).join('')}</table></div>
      </div>
      <p class="note">Dati dimostrativi: piatti, prezzi e foto sono quelli veri del menù; gli incassi sono ridimensionati.</p>`;
  }
  function topDishes() {
    const top = D.top.map(([name, cat, img, q]) => ({ name, cat, img, q })), max = top[0].q;
    return top.map(({ name, cat, img, q }) => `<div class="dish"><img src="${BASE}${img}" alt="" loading="lazy"><div>${name}<span>${cat}</span></div><b>${q}</b><div class="bar"><i style="--w:${q / max * 100}%"></i></div></div>`).join('');
  }
  function wireOverview(root) {
    // line chart: 30 days vs last 7, morphed on the same 24 points
    const N = 30, W = 600, H = 180, PAD = 6;
    const resample = (arr) => Array.from({ length: N }, (_, i) => { const x = i / (N - 1) * (arr.length - 1), a = Math.floor(x), b = Math.min(arr.length - 1, a + 1); return arr[a] + (arr[b] - arr[a]) * (x - a); });
    const rev30 = D.stats.days.map((d) => d.rev), rev7 = D.stats.days.slice(-7).map((d) => d.rev);
    const lo = Math.min(...rev30) * .85, hi = Math.max(...rev30) * 1.05;
    const px = (i) => PAD + i * (W - 2 * PAD) / (N - 1), py = (v) => H - PAD - (v - lo) / (hi - lo) * (H - 2 * PAD);
    const path = (v) => { const p = v.map((y, i) => [px(i), py(y)]); let d = `M${p[0][0]} ${p[0][1]}`; for (let i = 0; i < p.length - 1; i++) { const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2; d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`; } return d; };
    const ln = $('#ln', root), area = $('#area', root), axis = $('#axis', root);
    let cur = resample(rev30), anim = 0;
    const paint = (v) => { const d = path(v); ln.setAttribute('d', d); area.setAttribute('d', `${d} L${px(N - 1)} ${H} L${px(0)} ${H} Z`); };
    const labels = (days) => { const pickIdx = [0, Math.floor(days.length / 3), Math.floor(days.length * 2 / 3), days.length - 1]; axis.innerHTML = pickIdx.map((i) => `<span>${new Date(days[i].d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>`).join(''); };
    paint(cur); labels(D.stats.days);
    root.querySelectorAll('#rangeSeg button').forEach((b) => b.addEventListener('click', () => {
      root.querySelectorAll('#rangeSeg button').forEach((x) => x.classList.toggle('on', x === b));
      const days = b.dataset.r === '7' ? D.stats.days.slice(-7) : D.stats.days, to = resample(days.map((d) => d.rev));
      labels(days); cancelAnimationFrame(anim);
      if (reduce) { cur = to; return paint(cur); }
      const from = cur.slice(), t0 = performance.now();
      const tick = (now) => { const t = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - t, 3); cur = from.map((a, i) => a + (to[i] - a) * e); paint(cur); if (t < 1) anim = requestAnimationFrame(tick); };
      anim = requestAnimationFrame(tick);
    }));
    // donut
    const g = $('#slices', root), legend = $('#legend', root), donut = $('#donut', root), c1 = $('#dc1', root), c2 = $('#dc2', root);
    const total = D.stats.channels.reduce((a, [, n]) => a + n, 0), R = 45, C = 2 * Math.PI * R;
    let acc = 0; const slices = D.stats.channels.map(([name, n], i) => {
      const pct = n / total * 100, col = CH.find((c) => c[0] === name)?.[1] || '#999';
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('cx', 65); el.setAttribute('cy', 65); el.setAttribute('r', R); el.setAttribute('stroke', col); el.setAttribute('transform-origin', '65 65');
      el.style.rotate = `${-90 + acc * 3.6}deg`; el.style.strokeDasharray = `${C * (pct - 1.5) / 100} ${C}`;
      const mid = (pct / 2) * 3.6 * Math.PI / 180; el.style.setProperty('--dx', `${5 * Math.cos(mid)}px`); el.style.setProperty('--dy', `${5 * Math.sin(mid)}px`);
      acc += pct; g.appendChild(el);
      const l = document.createElement('div'); l.style.setProperty('--c', col); l.innerHTML = `<i></i>${name}<b>${Math.round(pct)}%</b>`; legend.appendChild(l);
      const on = () => sel(i), off = () => sel(-1);
      el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off); l.addEventListener('pointerenter', on); l.addEventListener('pointerleave', off);
      return { el, l, name, pct };
    });
    const sel = (i) => { slices.forEach((s, k) => { s.el.classList.toggle('out', k === i); s.l.classList.toggle('on', k === i); }); donut.classList.toggle('pick', i >= 0); legend.classList.toggle('pick', i >= 0); c1.textContent = i < 0 ? total : Math.round(slices[i].pct) + '%'; c2.textContent = i < 0 ? '30 GIORNI' : slices[i].name.toUpperCase(); };
  }

  function board() {
    return `<div class="filters" id="filters"><span class="chip on" data-s="">Tutti</span>${STATUS.slice(0, 5).map((s) => `<span class="chip" data-s="${s}">${s}</span>`).join('')}</div><div class="board" id="board">${orders.map((o, i) => orderCard(o, i)).join('')}</div>`;
  }
  function filterBoard(root, status) {
    root.querySelectorAll('#filters .chip').forEach((c) => c.classList.toggle('on', c.dataset.s === (status || '')));
    root.querySelectorAll('.order').forEach((el) => { const o = orders[+el.dataset.i]; el.style.display = !status || STATUS[o.status] === status ? '' : 'none'; });
  }
  const orderCard = (o, i) => `<article class="card order ${o.status >= 5 ? 'done' : ''}" style="--c:${o.ch[1]};--i:${i}" data-i="${i}">
    <div class="head"><b>${o.num}</b><span class="tag" style="--c:${o.status === 0 ? 'var(--warn)' : o.status >= 5 ? 'var(--ok)' : 'var(--accent)'}">${STATUS[o.status]}</span><span class="tag">${o.type}</span><span class="tag" style="--c:${o.ch[1]}">${o.ch[0]}${o.code ? ' · ' + o.code : ''}</span><span class="t">${o.t}</span></div>
    <ul>${o.items.map((x) => `<li><span>${x.q}×</span>${x.p.name}</li>`).join('')}</ul>
    <div class="foot"><b>${euro(o.total)}</b>${o.status < 5 ? `<button class="btn primary" data-next>${STATUS[Math.min(5, o.status + 1)]}</button><button class="btn" data-print title="Ristampa">⎙</button>` : ''}</div></article>`;
  function wireBoard(root) {
    $('#filters', root).addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) filterBoard(root, c.dataset.s); });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-next]'); if (!b) return;
      const card = b.closest('.order'), o = orders[+card.dataset.i];
      o.status = Math.min(5, o.status + 1);
      if (o.status === 4 && o.type !== 'Consegna') o.status = 5;
      const fresh = document.createElement('div'); fresh.innerHTML = orderCard(o, +card.dataset.i); fresh.firstElementChild.style.animation = 'none';
      card.replaceWith(fresh.firstElementChild);
    });
  }

  function menu() {
    const cats = [...new Set(D.menu.map((p) => p.cat))];
    return `<div class="menu-top"><input class="search" id="q" placeholder="Cerca un piatto…"><div class="cats" id="cats"><span class="chip on" data-c="">Tutti</span>${cats.map((c) => `<span class="chip" data-c="${c}">${c}</span>`).join('')}</div></div><div class="grid" id="grid">${D.menu.map((p, i) => prodCard(p, i)).join('')}</div><p class="note">Piatti, prezzi e foto dal menù reale di Mumi Sushi Vimercate. «Esaurito» è cliccabile: in M Desk ferma la vendita su tutti i canali, Deliveroo e Just Eat compresi.</p>`;
  }
  const prodCard = (p, i) => `<article class="card prod" data-i="${i}" data-c="${p.cat}"><img src="${BASE}${p.img}" alt="${p.name}" loading="lazy"><div class="pb"><small>${p.code ? p.code + ' · ' : ''}${p.cat}</small><h4>${p.name}</h4><div class="pr"><b>${euro(p.price)}</b><button data-out>Esaurito</button></div></div></article>`;
  function wireMenu(root) {
    const grid = $('#grid', root);
    grid.addEventListener('click', (e) => { const b = e.target.closest('[data-out]'); if (!b) return; const c = b.closest('.prod'); c.classList.toggle('out'); b.textContent = c.classList.contains('out') ? 'Esaurito ✓' : 'Esaurito'; });
    const apply = () => { const q = $('#q', root).value.toLowerCase(), c = $('#cats .on', root).dataset.c; grid.querySelectorAll('.prod').forEach((el) => { const p = D.menu[+el.dataset.i]; el.style.display = (!c || p.cat === c) && p.name.toLowerCase().includes(q) ? '' : 'none'; }); };
    $('#q', root).addEventListener('input', apply);
    $('#cats', root).addEventListener('click', (e) => { const ch = e.target.closest('.chip'); if (!ch) return; root.querySelectorAll('#cats .chip').forEach((x) => x.classList.toggle('on', x === ch)); apply(); });
  }
  function filterMenu(root, cat) { const ch = [...root.querySelectorAll('#cats .chip')].find((c) => c.dataset.c === (cat || '')); if (ch) ch.click(); }
  // second-level items per module — used by the rail + panel design
  const SUB = { panoramica: ['Oggi', 'Settimana', 'Mese'], ordini: ['Tutti', ...STATUS.slice(0, 5)], cucina: ['Sushi', 'Cucina calda', 'Fritti', 'Esauriti'], cassa: ['Nuovo conto', 'Conti aperti', 'Chiusura'], menu: ['Tutti', ...new Set(D.menu.map((p) => p.cat))], report: ['Incassi', 'Piatti', 'Canali', 'Esporta'], piattaforme: ['Deliveroo', 'Just Eat', 'Stato'], impostazioni: ['Orari', 'Pausa ordini', 'Lingue', 'Utenti'] };

  const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli con conferma automatica e promemoria.', opzioni: 'Libreria di varianti e aggiunte riutilizzabili tra i piatti.', piattaforme: 'Deliveroo e Just Eat sullo stesso tabellone, con il codice di ritiro della piattaforma.', consegne: 'Zone di consegna, costi e tempi.', rider: 'Assegnazione rider, percorso, chiusura cassa a fine turno.', fedelta: 'Punti, livelli e buoni sconto.', clienti: 'Anagrafica e storico ordini.', report: 'Incassi, chiusura di giornata, esportazioni.', stampa: 'Stampanti per postazione e prova di stampa.', impostazioni: 'Orari, pausa ordini, lingue, utenti.' };
  const stub = (id) => `<div class="card stub"><div><b>${NAV.find((n) => n.id === id).label}</b>${STUBS[id] || ''}<br><small>In questa demo sono attive Panoramica, Ordini e Menu.</small></div></div>`;

  const SCREENS = { panoramica: [overview, wireOverview], ordini: [board, wireBoard], menu: [menu, wireMenu] };
  function render(id, view, title) {
    const [html, wire] = SCREENS[id] || [() => stub(id), () => {}];
    view.innerHTML = html(); wire(view);
    if (title) title.textContent = NAV.find((n) => n.id === id).label;
    view.scrollTop = 0;
  }

  window.Mdesk = { NAV, GROUPS, SUB, STATUS, icon, render, orders, filterBoard, filterMenu };
})();
