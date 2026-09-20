/* Design 12 · Terminale — the back office as a phosphor terminal.
   Everything is text: sparklines from block glyphs, bars from ░█, a streaming log,
   and a command line that runs the place: help · ordini [stato] · conferma <n|tutti> ·
   esaurito <piatto> · disponibile <piatto> · pausa [min|off] · top · canali · clear.
   Tab completes, ↑↓ walks the history. Library parts: progress-ticks · notify-me (Bencho, MIT). */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const screen = $('#screen'), out = $('#out'), cmd = $('#cmd'), cur = $('#cur'), tabs = $('#tabs'), mod = $('#mod'), pauseFlag = $('#pauseFlag');
const state = { module: 'panoramica', out: new Set(), paused: false, hist: [], hi: -1, bell: false };
const GLYPH = '▁▂▃▄▅▆▇█';
const spark = (vals) => { const lo = Math.min(...vals), hi = Math.max(...vals); return vals.map((v) => GLYPH[Math.round((v - lo) / (hi - lo || 1) * 7)]).join(''); };
const hbar = (p, w = 20) => '█'.repeat(Math.round(p * w)) + '░'.repeat(w - Math.round(p * w));
const pad = (s, n, right) => { s = String(s); return right ? s.padStart(n) : s.padEnd(n); };
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const now = () => new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
setInterval(() => { $('#clock').textContent = now(); }, 1000); $('#clock').textContent = now();

/* ── tabs ── */
const MAIN = { panoramica: 'P', ordini: 'O', menu: 'M' };
tabs.innerHTML = B.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}">${MAIN[n.id] ? `<kbd>${MAIN[n.id]}</kbd>` : ''}${n.label.toLowerCase()}</a>`).join('');
tabs.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); go(a.dataset.id); });

/* ── screens ── */
function overview() {
  const t = B.today, s = D.stats, dRev = B.delta(t.rev, B.avg7('rev')), dN = B.delta(t.n, B.avg7('n'));
  const last7 = B.days.slice(-7), peak = Math.max(...s.hours.map((x) => x[1])), tot = s.hours.reduce((a, x) => a + x[1], 0);
  const closed = B.orders.filter((o) => o.status >= 5).length;
  return `<div class="kv">
    <div class="pane"><h3>incasso oggi</h3><div class="big">${B.euro0(t.rev)}</div><small>${spark(last7.map((d) => d.rev))} <span class="${dRev >= 0 ? '' : 'red'}">${dRev >= 0 ? '+' : '−'}${Math.abs(dRev).toFixed(0)}% vs 7g</span></small></div>
    <div class="pane"><h3>ordini oggi</h3><div class="big">${t.n}</div><small>${spark(last7.map((d) => d.n))} <span class="${dN >= 0 ? '' : 'red'}">${dN >= 0 ? '+' : '−'}${Math.abs(dN).toFixed(0)}% vs 7g</span></small></div>
    <div class="pane"><h3>scontrino medio</h3><div class="big">${B.euro(t.rev / t.n)}</div><small>obiettivo € 28,00</small></div>
    <div class="pane"><h3>preparazione</h3><div class="big">${s.prepMin} min</div><small>mediana 7 giorni</small></div>
  </div>
  <div class="row2">
    <div class="pane"><h3>incassi · 30 giorni</h3><pre>${bigchart(B.days.map((d) => d.rev))}</pre><div class="dim" style="display:flex;justify-content:space-between;font-size:11px"><span>${B.dateIt(B.days[0].d)}</span><span>max ${B.euro0(Math.max(...B.days.map((d) => d.rev)))}</span><span>${B.dateIt(B.days[29].d)}</span></div></div>
    <div class="pane"><h3>canali · 30 giorni</h3>${s.channels.map(([n, v], i) => `<div class="ln"><span>${pad(n, 10)}</span><span class="bar-wrap"><i style="--w:${v}%;--d:${i * 90}ms" class="${i === 0 ? '' : ''}"></i></span><span class="r">${pad(v + '%', 4, true)}</span></div>`).join('')}<div class="dim" style="margin-top:8px;font-size:11px">consegna ${s.types[0][1]}% · ritiro ${s.types[1][1]}% · tavolo ${s.types[2][1]}%</div></div>
  </div>
  <div class="row3">
    <div class="pane"><h3>ordini per ora</h3>${s.hours.map(([h, n], i) => `<div class="ln"><span>${pad(h + 'h', 3)}</span><span class="bar-wrap"><i style="--w:${n / peak * 100}%;--d:${i * 50}ms" class="${n === peak ? 'amber' : ''}"></i></span><span class="r">${pad(n, 3, true)}</span></div>`).join('')}<div class="dim" style="margin-top:6px;font-size:11px">${Math.round(s.hours.filter(([h]) => h >= 18).reduce((a, x) => a + x[1], 0) / tot * 100)}% la sera</div></div>
    <div class="pane"><h3>top 5 · 30 giorni</h3><pre>${D.top.map(([n, , , q], i) => `${i + 1}. ${pad(n.length > 24 ? n.slice(0, 23) + '…' : n, 25)} ${pad(q, 4, true)}\n   ${hbar(q / D.top[0][3], 22)}`).join('\n')}</pre></div>
    <div class="pane"><h3>servizio</h3><div class="big"><span id="ptn">0</span>%</div><small class="dim">${closed} di ${B.orders.length} ordini chiusi · passa sopra per scorrere</small><div class="ticks" id="ticks"></div><div style="margin-top:12px;display:flex;align-items:center;gap:10px"><button class="bell-btn" id="bell" type="button" data-on="${state.bell}"><svg class="bell" id="bellIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg><span class="bell-say" id="say"><span>avvisa la cucina</span><span>cucina avvisata ✓</span></span></button></div></div>
  </div>
  <div class="dim" style="font-size:11px">dati dimostrativi: piatti, prezzi e foto sono veri; incassi e quantità ridimensionati.</div>`;
}
/* a 30-column block chart with 3 rows of vertical resolution: each column is 3 glyphs stacked, 24 levels */
function bigchart(vals) {
  const lo = Math.min(...vals) * .85, hi = Math.max(...vals), ROWS = 3, lv = vals.map((v) => Math.round((v - lo) / (hi - lo) * (ROWS * 8)));
  const lines = [];
  for (let r = ROWS - 1; r >= 0; r--) lines.push(lv.map((l) => { const k = l - r * 8; return k <= 0 ? ' ' : k >= 8 ? '█' : GLYPH[k - 1]; }).join(' '));
  return lines.join('\n');
}
function wireOverview(root) {
  const ticks = $('#ticks', root), nEl = $('#ptn', root), N = 36, els = Array.from({ length: N }, () => { const i = document.createElement('i'); ticks.appendChild(i); return i; });
  const target = B.orders.filter((o) => o.status >= 5).length / B.orders.length + .02; let shown = 0, hover = null, vel = 0, t0 = performance.now();
  (function frame(now) { if (!ticks.isConnected) return; const goal = hover ?? target; vel += (-180 * (shown - goal) - 2 * Math.sqrt(180) * .85 * vel) / 60; shown += vel / 60; const lit = shown * N, ph = (now - t0) / 1000 * 3; els.forEach((b, i) => { const on = i < lit; b.classList.toggle('lit', on); const wave = .5 + .5 * Math.sin(ph - i * .45) * (.6 + .4 * Math.sin(i * .9)); b.style.height = on ? (45 + wave * 55).toFixed(1) + '%' : (26 + 14 * Math.sin(i * .9)).toFixed(1) + '%'; }); nEl.textContent = Math.round(shown * 100); requestAnimationFrame(frame); })(t0);
  const at = (e) => Math.max(0, Math.min(1, (e.clientX - ticks.getBoundingClientRect().left) / ticks.clientWidth));
  ticks.addEventListener('pointermove', (e) => { hover = at(e); }); ticks.addEventListener('pointerleave', () => { hover = null; });
  const btn = $('#bell', root), bell = $('#bellIcon', root), say = $('#say', root);
  const ring = () => bell.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-17deg)', offset: .11 }, { transform: 'rotate(14deg)', offset: .27 }, { transform: 'rotate(-9deg)', offset: .44 }, { transform: 'rotate(6deg)', offset: .61 }, { transform: 'rotate(-3deg)', offset: .78 }, { transform: 'rotate(0deg)' }], { duration: 900, easing: 'ease-out' });
  const fit = () => { const spans = say.querySelectorAll('span'); spans.forEach((s, i) => s.dataset.show = String((i === 1) === state.bell)); say.style.setProperty('--w', say.querySelector('[data-show="true"]').offsetWidth + 'px'); };
  btn.addEventListener('click', () => { state.bell = !state.bell; btn.dataset.on = state.bell; if (state.bell) { ring(); log(`<b>cucina</b> avvisata: ${B.orders.filter((o) => o.status < 3).length} ordini in coda`, 'log'); } fit(); });
  fit();
}
function board(filter) {
  const list = filter ? B.orders.filter((o) => B.STATUS[o.status].toLowerCase().startsWith(filter)) : B.orders;
  return `<div class="pane"><h3>ordini${filter ? ' · ' + filter : ''} · ${list.length}</h3><table><thead><tr><th>n.</th><th>ora</th><th>canale</th><th>cliente</th><th>tipo</th><th>piatti</th><th class="r">totale</th><th>stato</th></tr></thead><tbody>${list.map((o) => `<tr class="${o.status >= 5 ? 'done' : ''}" data-num="${o.short}"><td>${o.short}</td><td>${o.t}</td><td><span class="tag">${o.ch.toLowerCase()}</span>${o.code ? ' ' + o.code : ''}</td><td>${o.name}${o.status === 0 && o.minutes > 8 ? ` <span class="red">+${o.minutes}m</span>` : ''}</td><td class="dim">${o.type.toLowerCase()}</td><td class="items">${o.items.map((x) => `${x.q}× ${x.p.name}`).join(', ')}</td><td class="r">${B.euro(o.total)}</td><td>${o.status === 0 ? '<span class="amber">' : o.status >= 5 ? '<span class="dim">' : '<span>'}${B.STATUS[o.status].toLowerCase()}</span></td></tr>`).join('')}</tbody></table><div class="dim" style="margin-top:8px;font-size:11px">conferma &lt;n&gt; · conferma tutti · ordini attesa|confermato|pronto</div></div>`;
}
function menu() {
  const cats = [...new Set(D.menu.map((p) => p.cat))];
  return `<div class="pane"><h3>menu · ${D.menu.length} piatti · ${state.out.size} esauriti</h3><div class="menu-grid">${cats.map((c) => `<div class="cat"><h4>${c.toLowerCase()}</h4>${D.menu.filter((p) => p.cat === c).map((p) => `<div class="it ${state.out.has(p.name) ? 'out' : ''}" data-name="${esc(p.name)}"><span class="dim">${p.code || '—'}</span><span>${p.name}</span><span class="p">${B.euro(p.price)}</span></div>`).join('')}</div>`).join('')}</div><div class="dim" style="margin-top:8px;font-size:11px">click su un piatto o: esaurito &lt;piatto&gt; · disponibile &lt;piatto&gt;</div></div>`;
}
const STUBS = { cucina: 'schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'zone di consegna, costi, tempi stimati.', rider: 'rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'punti, premi, coupon.', clienti: 'rubrica clienti con storico ordini.', report: 'chiusure giornaliere, export contabile.', stampa: 'stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'orari, pausa ordini, auto-conferma, integrazioni.' };
function render(arg) {
  const m = state.module;
  screen.innerHTML = m === 'panoramica' ? overview() : m === 'ordini' ? board(arg) : m === 'menu' ? menu() : `<div class="pane"><h3>${m}</h3><pre>${STUBS[m] || ''}\n<span class="dim">in questa demo sono attivi panoramica, ordini e menu.</span></pre></div>`;
  if (m === 'panoramica') wireOverview(screen);
  if (m === 'menu') screen.querySelectorAll('.it').forEach((el) => el.addEventListener('click', () => toggleDish(el.dataset.name)));
}
function go(id, arg) { state.module = id; mod.textContent = id; tabs.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id)); try { history.replaceState(null, '', '#' + id); } catch (_) {} render(arg); }

/* ── log ── */
function log(html, cls = '') { const d = document.createElement('div'); d.className = cls + ' new'; d.innerHTML = html; out.appendChild(d); while (out.children.length > 60) out.firstChild.remove(); out.scrollTop = out.scrollHeight; return d; }
const feedLine = (o) => `<b>${now().slice(0, 5)}</b> ORD #${o.short} ${pad(o.ch.toLowerCase(), 9)} ${pad(o.type.toLowerCase(), 9)} ${pad(B.euro(o.total), 8, true)} · ${B.STATUS[o.status].toLowerCase()}`;
async function boot() {
  const lines = ['M DESK v2.4 · avvio del back office…', 'connesso a mumi-vimercate (eu-central) · latenza 41 ms', `menù caricato: ${D.menu.length} piatti · ${D.stats.days.length} giorni di statistiche`, `${B.orders.length} ordini nel turno · ${B.orders.filter((o) => o.status === 0).length} in attesa di conferma`, 'digita <b>help</b> per i comandi · tab completa'];
  for (const l of lines) { log(l, 'log'); await new Promise((r) => setTimeout(r, reduce ? 0 : 160)); }
}
boot();
let feedI = 0; setInterval(() => { if (document.hidden) return; log(feedLine(B.orders[feedI++ % B.orders.length]), 'log'); }, 7000);

/* ── the command line ── */
const CMDS = ['help', 'panoramica', 'ordini', 'menu', 'conferma', 'esaurito', 'disponibile', 'pausa', 'top', 'canali', 'clear', 'stampa', 'whoami', 'p', 'o', 'm'];
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const findDish = (t) => { t = norm(t.trim()); if (!t) return null; return D.menu.find((p) => norm(p.name) === t) || D.menu.filter((p) => norm(p.name).includes(t)).sort((a, b) => a.name.length - b.name.length)[0] || null; };
function toggleDish(name, force) { const p = D.menu.find((x) => x.name === name); if (!p) return; const out = force === undefined ? !state.out.has(p.name) : force; out ? state.out.add(p.name) : state.out.delete(p.name); log(`<b>${p.name}</b> → ${out ? '<span class="red">esaurito</span> · rimosso dal sito e dalle piattaforme' : 'disponibile · di nuovo in vendita'}`, 'log'); if (state.module === 'menu') render(); }
function run(line) {
  const [c, ...rest] = line.trim().split(/\s+/), arg = rest.join(' ');
  log(`<b>mumi@desk:~$</b> ${esc(line)}`, 'cmdline');
  switch (c) {
    case '': return;
    case 'help': return log(`comandi disponibili:\n  <b>panoramica</b> | <b>ordini</b> [attesa|confermato|preparazione|pronto] | <b>menu</b>   (anche p / o / m)\n  <b>conferma</b> &lt;n|tutti&gt;      avanza un ordine (o tutti quelli in attesa)\n  <b>esaurito</b> &lt;piatto&gt;       toglie un piatto dalla vendita · <b>disponibile</b> &lt;piatto&gt; lo rimette\n  <b>pausa</b> [minuti|off]      ferma gli ordini online\n  <b>top</b> · <b>canali</b> · <b>stampa</b> &lt;n&gt; · <b>clear</b>`, 'log');
    case 'p': case 'panoramica': return go('panoramica');
    case 'o': case 'ordini': { const f = arg ? norm(arg) : ''; const known = ['attesa', 'confermato', 'preparazione', 'pronto', 'consegna', 'completato']; const st = known.find((k) => k.startsWith(f.replace('in ', ''))); if (f && !st) return log(`stato sconosciuto: ${esc(arg)} · usa ${known.join('|')}`, 'err'); go('ordini', st === 'attesa' ? 'in attesa' : st === 'preparazione' ? 'in preparazione' : st === 'consegna' ? 'in consegna' : st); return; }
    case 'm': case 'menu': return go('menu');
    case 'conferma': {
      if (!arg) return log('conferma &lt;n&gt; oppure conferma tutti', 'err');
      const list = /^tutt/.test(arg) ? B.orders.filter((o) => o.status === 0) : B.orders.filter((o) => o.short === arg.padStart(3, '0') || o.short.endsWith(arg));
      if (!list.length) return log(`nessun ordine ${/^tutt/.test(arg) ? 'in attesa' : '#' + esc(arg)}`, 'warn');
      list.forEach((o) => { o.status = Math.min(5, o.status + 1); if (o.status === 4 && o.type !== 'Consegna') o.status = 5; log(`ORD #${o.short} → <b>${B.STATUS[o.status].toLowerCase()}</b>${o.status === 1 ? ' · comanda in cucina · cliente avvisato' : ''}`, 'log'); });
      if (state.module === 'ordini') render(); return;
    }
    case 'esaurito': case 'disponibile': { if (!arg) return log(`${c} &lt;piatto&gt;`, 'err'); const p = findDish(arg); if (!p) return log(`piatto non trovato: ${esc(arg)}`, 'err'); return toggleDish(p.name, c === 'esaurito'); }
    case 'pausa': { if (arg === 'off') { state.paused = false; pauseFlag.textContent = 'pausa: off'; pauseFlag.classList.remove('live'); return log('ordini online riaperti', 'log'); } const min = parseInt(arg) || 20; state.paused = true; pauseFlag.textContent = `pausa: ${min} min`; pauseFlag.classList.add('live'); return log(`ordini online <span class="red">in pausa</span> per ${min} minuti · sito, app e piattaforme mostrano «non accettiamo ordini»`, 'log'); }
    case 'top': return log(D.top.map(([n, , , q], i) => `${i + 1}. ${pad(n, 34)} ${pad(q, 4, true)}  ${hbar(q / D.top[0][3], 16)}`).join('\n'), 'log');
    case 'canali': return log(D.stats.channels.map(([n, v]) => `${pad(n, 10)} ${hbar(v / 100, 24)} ${pad(v + '%', 4, true)}`).join('\n'), 'log');
    case 'stampa': return log(`ricevuta #${esc(arg || '—')} inviata alla stampante di cassa`, 'log');
    case 'whoami': return log('admin · turno serale · mumi-vimercate', 'log');
    case 'clear': out.innerHTML = ''; return;
    default: { const n = B.NAV.find((x) => x.id === c); if (n) return go(n.id); return log(`comando non trovato: ${esc(c)} · prova <b>help</b>`, 'err'); }
  }
}
$('#cli').addEventListener('submit', (e) => { e.preventDefault(); const line = cmd.value; if (line.trim()) { state.hist.push(line); state.hi = state.hist.length; } run(line); cmd.value = ''; caret(); });
cmd.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') { e.preventDefault(); const v = cmd.value, parts = v.split(/\s+/); if (parts.length <= 1) { const m = CMDS.filter((x) => x.startsWith(v.toLowerCase()) && x.length > 1); if (m.length === 1) cmd.value = m[0] + ' '; else if (m.length > 1) log(m.join('  '), 'log'); } else if (/^(esaurito|disponibile)$/.test(parts[0])) { const q = norm(parts.slice(1).join(' ')); const m = D.menu.filter((p) => norm(p.name).startsWith(q)); if (m.length === 1) cmd.value = `${parts[0]} ${m[0].name}`; else if (m.length > 1) log(m.map((p) => p.name).join('  ·  '), 'log'); } caret(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); if (state.hi > 0) { state.hi--; cmd.value = state.hist[state.hi]; caret(); } }
  if (e.key === 'ArrowDown') { e.preventDefault(); state.hi = Math.min(state.hist.length, state.hi + 1); cmd.value = state.hist[state.hi] || ''; caret(); }
});
/* the block cursor sits after the typed text: measure the text in the input's own font */
const ctx = document.createElement('canvas').getContext('2d');
function caret() { ctx.font = getComputedStyle(cmd).font; const w = ctx.measureText(cmd.value).width; const r = cmd.getBoundingClientRect(), f = $('#cli').getBoundingClientRect(); cur.style.left = (r.left - f.left + w + 1) + 'px'; cur.style.top = (r.top - f.top + 2) + 'px'; }
$('#cli').style.position = 'relative'; cmd.addEventListener('input', caret); addEventListener('resize', caret);
document.addEventListener('keydown', (e) => { if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1 && document.activeElement !== cmd) cmd.focus({ preventScroll: true }); });
document.addEventListener('click', (e) => { if (!e.target.closest('a, button, .it, .ticks')) cmd.focus({ preventScroll: true }); });

go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
setTimeout(caret, 50);   // no focus on load: inside the library page an autofocused iframe input scrolls the parent
