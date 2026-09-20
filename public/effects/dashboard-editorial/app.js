/* Design 08 · Edizione — the shift as a newspaper page.
   Screens: Panoramica (the number of the day + a 30↔7-day line that morphs, channels as a
   stacked share bar, orders per hour, latest orders as a hover-tinted list, ranked dishes),
   Ordini (a ledger; the status button is its own confirm dialog), Menu (a printed carta
   with dotted leaders; click a line to mark it sold out).
   Library parts: range-line-morph · stacked-share-bar · hover-tinted-service-list · inline-confirm. */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const nav = $('#nav'), view = $('#view'), title = $('#title');
const PAL = { Deliveroo: '#1b1713', Chiosco: '#9c2f26', 'Just Eat': '#6f655a', Sito: '#b9a37c', App: '#8a9a7b', Cassa: '#cdbfa4' };

$('#date').textContent = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
nav.innerHTML = B.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}">${n.label}</a>`).join('');

/* ── Panoramica ── */
function overview() {
  const t = B.today, a7 = B.avg7('rev'), dRev = B.delta(t.rev, a7), dN = B.delta(t.n, B.avg7('n'));
  const s = D.stats, peak = Math.max(...s.hours.map((x) => x[1]));
  const evening = Math.round(s.hours.filter(([h]) => h >= 18).reduce((a, x) => a + x[1], 0) / s.hours.reduce((a, x) => a + x[1], 0) * 100);
  return `
  <section class="sec lead">
    <div>
      <div class="big">${B.euro0(t.rev)}<small>oggi</small></div>
      <p class="deck">Incasso <b class="${dRev >= 0 ? 'up' : 'down'}">${dRev >= 0 ? '+' : '−'}${Math.abs(dRev).toFixed(0)}%</b> sulla media degli ultimi sette giorni, con <b>${t.n} ordini</b> (${dN >= 0 ? '+' : '−'}${Math.abs(dN).toFixed(0)}%) e uno scontrino medio di <b>${B.euro(t.rev / t.n)}</b>. La cucina ha tenuto i <b>${s.prepMin} minuti</b>.</p>
      <div class="facts"><div>Ordini<b>${t.n}</b></div><div>Scontrino medio<b>${B.euro(t.rev / t.n)}</b></div><div>Preparazione<b>${s.prepMin} min</b></div><div>Sera<b>${evening}%</b></div></div>
    </div>
    <div class="chart" id="chart">
      <h2 style="margin-bottom:4px">Incassi<span class="seg" id="rangeSeg"><button class="on" data-r="30" type="button">30 giorni</button><button data-r="7" type="button">7 giorni</button></span></h2>
      <svg viewBox="0 0 600 190" preserveAspectRatio="none"><line class="base" x1="0" x2="600" y1="184" y2="184"/><line class="avg" id="avg" x1="0" x2="600"/><text class="avgl" id="avgl" x="4" text-anchor="start">media</text><path class="ln" id="ln"/><circle class="dot" id="dot" r="4"/></svg>
      <div class="axis" id="axis"></div>
    </div>
  </section>
  <section class="sec two">
    <div><h2>Canali · 30 giorni</h2>
      <div class="stack" id="stack"><div class="tip" id="tip"></div></div><div class="leg" id="leg"></div></div>
    <div><h2>Ordini per ora</h2>
      <div class="hours">${s.hours.map(([h, n], i) => `<i style="--h:${n / peak * 100}%;--i:${i}" data-h="${h}" class="${n === peak ? 'peak' : ''}"></i>`).join('')}</div><div class="hours-pad"></div>
      <p class="small">Due servizi netti: pranzo 12–13 e cena 19–20. Il ${evening}% degli ordini arriva la sera.</p></div>
  </section>
  <section class="sec tinted" id="tinted" data-showcase><h2>Ultimi ordini <span class="hint" style="margin:0">passa sulle righe</span></h2>
    <div class="orders">
      <ul class="rows" id="rows"></ul>
      <div class="detail"><div class="price fade" id="price"></div><div class="meta fade" id="meta"></div><ul class="fade" id="items"></ul><button class="print" type="button">Ristampa ricevuta</button><div class="stamp" id="stamp"><i></i></div></div>
    </div>
  </section>
  <section class="sec"><h2>Piatti più venduti · 30 giorni</h2>
    <ol class="ranked">${D.top.map(([name, cat, img, n]) => `<li><img src="../_mdesk/${img}" alt=""><div class="n">${name}<span>${cat}</span></div><b>${n}</b></li>`).join('')}</ol>
  </section>`;
}
function wireOverview(root) {
  // line: 30 and 7 days resampled to the same 30 points, so switching morphs the path
  const N = 30, W = 600, H = 190, PAD = 8;
  const rev30 = B.days.map((d) => d.rev), rev7 = B.days.slice(-7).map((d) => d.rev);
  const lo = Math.min(...rev30) * .8, hi = Math.max(...rev30) * 1.05;
  const px = (i) => PAD + i * (W - 2 * PAD) / (N - 1), py = (v) => H - PAD - (v - lo) / (hi - lo) * (H - 2 * PAD);
  const ln = $('#ln', root), dot = $('#dot', root), axis = $('#axis', root), avg = $('#avg', root), avgl = $('#avgl', root);
  let cur = B.resample(rev30, N), anim = 0;
  const paint = (v) => { ln.setAttribute('d', B.smooth(v.map((y, i) => [px(i), py(y)]))); dot.setAttribute('cx', px(N - 1)); dot.setAttribute('cy', py(v[N - 1])); };
  const meta = (days) => { const m = days.reduce((a, d) => a + d.rev, 0) / days.length; avg.setAttribute('y1', py(m)); avg.setAttribute('y2', py(m)); avgl.setAttribute('y', py(m) - 4); avgl.textContent = `media ${B.euro0(m)}`; const idx = [0, Math.floor(days.length / 3), Math.floor(days.length * 2 / 3), days.length - 1]; axis.innerHTML = idx.map((i) => `<span>${B.dateIt(days[i].d)}</span>`).join(''); };
  paint(cur); meta(B.days);
  root.querySelectorAll('#rangeSeg button').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('#rangeSeg button').forEach((x) => x.classList.toggle('on', x === b));
    const days = b.dataset.r === '7' ? B.days.slice(-7) : B.days, to = B.resample(days.map((d) => d.rev), N);
    meta(days); cancelAnimationFrame(anim);
    if (reduce) { cur = to; return paint(cur); }
    const from = cur.slice(), t0 = performance.now();
    const tick = (now) => { const t = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - t, 3); cur = from.map((a, i) => a + (to[i] - a) * e); paint(cur); if (t < 1) anim = requestAnimationFrame(tick); };
    anim = requestAnimationFrame(tick);
  }));

  // stacked share bar
  const stack = $('#stack', root), tip = $('#tip', root), leg = $('#leg', root), parts = D.stats.channels, tot = parts.reduce((a, [, n]) => a + n, 0);
  const segs = parts.map(([name, n], i) => {
    const pct = n / tot * 100, c = PAL[name];
    const s = document.createElement('div'); s.className = 's'; s.style.cssText = `--w:calc(${pct}% - ${3 * (parts.length - 1) / parts.length}px);--c:${c};--d:${i * 110}ms`;
    s.addEventListener('click', () => pick(i)); stack.insertBefore(s, tip);
    const l = document.createElement('div'); l.style.setProperty('--c', c); l.innerHTML = `<i></i>${name}<b>${Math.round(pct)}%</b>`; l.addEventListener('click', () => pick(i)); leg.appendChild(l);
    return { s, name, pct };
  });
  let curSeg = -1;
  function pick(i) {
    curSeg = curSeg === i ? -1 : i;
    segs.forEach((x, k) => x.s.classList.toggle('on', k === curSeg)); stack.classList.toggle('pick', curSeg >= 0);
    if (curSeg < 0) return tip.classList.remove('show');
    const s = segs[curSeg].s; tip.textContent = `${segs[curSeg].name} · ${Math.round(segs[curSeg].pct)}%`; tip.style.left = (s.offsetLeft + s.offsetWidth / 2) + 'px'; tip.classList.add('show');
  }
  setTimeout(() => pick(0), reduce ? 0 : 1000);

  // hover-tinted list: one property on the section, rewritten per row
  const rows = $('#rows', root), sec = $('#tinted', root), price = $('#price', root), metaEl = $('#meta', root), items = $('#items', root), stamp = $('#stamp', root);
  const list = B.orders.slice(0, 7);
  list.forEach((o, i) => { const li = document.createElement('li'); li.className = 'row'; li.tabIndex = 0; li.innerHTML = `<span class="n">#${o.short} · ${o.name}</span><small style="color:${o.col}">${o.ch}</small><small>${o.type}</small><span class="t">${o.t}</span>`; li.addEventListener('pointerenter', () => select(i)); li.addEventListener('focus', () => select(i)); rows.appendChild(li); });
  let cur2 = -1, swap = 0;
  function select(i) {
    if (i === cur2) return; const dir = i > cur2 ? 1 : -1; cur2 = i; const o = list[i];
    sec.style.setProperty('--tint', `color-mix(in srgb, ${o.col} 13%, var(--paper))`);
    [...rows.children].forEach((li, k) => li.classList.toggle('on', k === i));
    stamp.style.setProperty('--r', dir * 4 + 'deg'); stamp.style.setProperty('--art', `url(../_mdesk/${o.items[0].p.img})`); setTimeout(() => stamp.style.setProperty('--r', '0deg'), 60);
    const fill = () => { price.textContent = B.euro(o.total); metaEl.textContent = `${o.ch}${o.code ? ' · ' + o.code : ''} · ${o.type} · ${B.STATUS[o.status]}`; items.innerHTML = o.items.map((x) => `<li><span>${x.q}×</span>${x.p.name}</li>`).join(''); };
    clearTimeout(swap); if (reduce) return fill();
    [price, metaEl, items].forEach((e) => e.classList.add('swap'));
    swap = setTimeout(() => { fill(); [price, metaEl, items].forEach((e) => e.classList.remove('swap')); }, 220);
  }
  select(0);
}

/* ── Ordini: the ledger ── */
function ledger() {
  return `<section class="sec"><table class="ledger"><thead><tr><th>N.</th><th>Ora</th><th>Canale</th><th>Cliente</th><th>Tipo</th><th>Piatti</th><th style="text-align:right">Totale</th><th>Stato</th><th></th></tr></thead><tbody>
  ${B.orders.map((o) => `<tr class="${o.status >= 5 ? 'done' : ''}" data-num="${o.num}"><td class="n">${o.short}</td><td class="t">${o.t}</td><td><span class="ch" style="--c:${o.col}">${o.ch}</span>${o.code ? `<div class="code">${o.code}</div>` : ''}</td><td>${o.name}</td><td>${o.type}</td><td class="items">${o.items.map((x) => `${x.q}× ${x.p.name}`).join(', ')}</td><td class="e">${B.euro(o.total)}</td><td class="stato" data-stato>${B.STATUS[o.status]}</td><td>${o.status < 5 ? shell(o) : ''}</td></tr>`).join('')}
  </tbody></table><p class="small">Ogni riga avanza di uno stato: il pulsante chiede conferma nello stesso spazio e lascia 3 secondi per annullare.</p></section>`;
}
const shell = (o) => `<div class="shell" data-phase="idle"><div class="ph ph-idle"><button type="button" data-ask>→ ${B.STATUS[Math.min(5, o.status + 1)]}</button></div><div class="ph ph-ask"><span>Confermare?</span><button type="button" class="hot" data-yes>Sì</button><button type="button" class="soft" data-no>No</button></div><div class="ph ph-done"><span>Fatto</span><button type="button" class="soft" data-undo>Annulla</button><span class="burn"></span></div></div>`;
function wireLedger(root) {
  root.addEventListener('click', (e) => {
    const sh = e.target.closest('.shell'); if (!sh) return;
    const tr = sh.closest('tr'), o = B.orders.find((x) => x.num === tr.dataset.num);
    const phase = (p) => { sh.dataset.phase = p; clearTimeout(sh._t); if (p === 'done') sh._t = setTimeout(() => finish(), 3200); };
    const finish = () => { sh.dataset.phase = 'idle'; if (o.status >= 5) { tr.classList.add('done'); sh.remove(); } else sh.querySelector('[data-ask]').textContent = `→ ${B.STATUS[Math.min(5, o.status + 1)]}`; };
    if (e.target.closest('[data-ask]')) phase('asking');
    else if (e.target.closest('[data-no]')) phase('idle');
    else if (e.target.closest('[data-yes]')) { o.prev = o.status; o.status = Math.min(5, o.status + 1); if (o.status === 4 && o.type !== 'Consegna') o.status = 5; tr.querySelector('[data-stato]').textContent = B.STATUS[o.status]; phase('done'); }
    else if (e.target.closest('[data-undo]')) { o.status = o.prev; tr.querySelector('[data-stato]').textContent = B.STATUS[o.status]; clearTimeout(sh._t); sh.dataset.phase = 'idle'; }
  });
}

/* ── Menu: the printed carta ── */
let qMenu = '';
function carta() {
  const cats = [...new Set(D.menu.map((p) => p.cat))];
  return `<section class="sec"><div class="menu-head"><h2 style="margin:0">La carta · ${D.menu.length} piatti</h2><input id="q" placeholder="cerca un piatto…" value="${qMenu}"></div>
  <div class="carta" id="carta">${cats.map((c) => `<div class="cat" data-cat="${c}"><h3>${c}</h3>${D.menu.map((p, i) => p.cat === c ? `<div class="item" data-i="${i}"><span class="code">${p.code || ''}</span><span class="n">${p.name}</span><span class="x">esaurito</span><span class="l"></span><span class="p">${B.euro(p.price)}</span></div>` : '').join('')}</div>`).join('')}</div>
  <p class="small">Tocca una riga per segnarla esaurita: viene barrata sulla carta e sparisce dal sito.</p></section>`;
}
function wireCarta(root) {
  root.addEventListener('click', (e) => { const it = e.target.closest('.item'); if (it) it.classList.toggle('out'); });
  const apply = () => { const qq = $('#q', root).value.trim().toLowerCase(); qMenu = qq; root.querySelectorAll('.item').forEach((el) => { el.style.display = !qq || D.menu[+el.dataset.i].name.toLowerCase().includes(qq) ? '' : 'none'; }); root.querySelectorAll('.cat').forEach((c) => { c.style.display = [...c.querySelectorAll('.item')].some((x) => x.style.display !== 'none') ? '' : 'none'; }); };
  $('#q', root).addEventListener('input', apply); apply();
}

const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'Gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'Zone di consegna, costi, tempi stimati.', rider: 'Rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'Punti, premi, coupon.', clienti: 'Rubrica clienti con storico ordini.', report: 'Chiusure giornaliere, export contabile.', stampa: 'Stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'Orari, pausa ordini, auto-conferma, integrazioni.' };
const stub = (id) => `<div class="stub"><b>${B.label(id)}</b>${STUBS[id] || ''}<br><small>In questa demo sono attive Panoramica, Ordini e Menu.</small></div>`;
const SCREENS = { panoramica: [overview, wireOverview], ordini: [ledger, wireLedger], menu: [carta, wireCarta] };
function go(id) {
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id));
  const [html, wire] = SCREENS[id] || [() => stub(id), () => {}];
  view.innerHTML = html(); wire(view);
  title.innerHTML = id === 'panoramica' ? 'Il turno di <em>oggi</em>' : B.label(id);
  window.scrollTo(0, 0);
}
nav.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); try { history.replaceState(null, '', '#' + a.dataset.id); } catch (_) {} go(a.dataset.id); });
go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
