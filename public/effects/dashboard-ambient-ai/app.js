/* Design 10 · Cielo — the interface is a sky; the assistant proposes, you confirm.
   One number (--h on <body>) is the whole ambience: the module sets it, hovering a channel
   or an order drifts it toward that channel, leaving drifts it back. The prompt bar at the
   bottom never acts on its own: every request becomes a proposal card with Conferma / Annulla,
   the way M Desk's real AI layer works (propose → confirm → the same service as a click).
   Library parts: ambient-hue-follows-focus · mind-space-ai-os · liquid-orb (CSS stand-in) · inline-confirm. */
const $ = (s, r = document) => r.querySelector(s);
const D = window.MDESK, B = window.Mbase, reduce = B.reduce;
const view = $('#view'), mods = $('#mods'), ai = $('#ai'), q = $('#q'), prompt = $('#prompt'), orb = $('#orb'), sugg = $('#sugg'), toast = $('#toast'), pauseChip = $('#pauseChip');
const HUE = { panoramica: 228, ordini: 22, menu: 152 };
const MAIN = ['panoramica', 'ordini', 'menu'];
const state = { module: 'panoramica', paused: false, out: new Set(), menuCat: '' };

const setHue = (h) => document.body.style.setProperty('--h', h);
const moduleHue = () => setHue(HUE[state.module] ?? 265);
mods.innerHTML = B.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}" class="${MAIN.includes(n.id) ? '' : 'dim'}">${n.label}</a>`).join('') + `<a href="#" data-more class="more">+ ${B.NAV.length - 3} moduli</a>`;
pauseChip.addEventListener('click', () => setPaused(!state.paused));
function setPaused(v) { state.paused = v; pauseChip.classList.toggle('live', v); }
function say(t) { toast.textContent = t; toast.classList.add('show'); clearTimeout(say._t); say._t = setTimeout(() => toast.classList.remove('show'), 2200); }

/* ── screens ── */
function overview() {
  const t = B.today, s = D.stats, dRev = B.delta(t.rev, B.avg7('rev')), dN = B.delta(t.n, B.avg7('n')), peak = Math.max(...s.hours.map((x) => x[1]));
  const waiting = B.orders.filter((o) => o.status === 0);
  return `<div class="hero">
    <div class="card first"><h3>Oggi</h3><b class="big">${B.euro0(t.rev)}</b><p>${t.n} ordini, ${dRev >= 0 ? '+' : '−'}${Math.abs(dRev).toFixed(0)}% sulla media della settimana. ${waiting.length ? `<b>${waiting.length} ${waiting.length === 1 ? 'ordine aspetta' : 'ordini aspettano'} una conferma.</b>` : 'Nessun ordine in attesa.'}</p></div>
    <div class="card"><h3>Ordini</h3><b class="big">${t.n}</b><small>${dN >= 0 ? '▲' : '▼'} ${Math.abs(dN).toFixed(0)}% vs 7 gg</small></div>
    <div class="card"><h3>Scontrino medio</h3><b class="big">${B.euro(t.rev / t.n)}</b><small>obiettivo € 28</small></div>
    <div class="card"><h3>Preparazione</h3><b class="big">${s.prepMin} min</b><small>mediana, 7 giorni</small></div>
  </div>
  <div class="r2">
    <div class="card"><h3>Incassi · 30 giorni</h3><svg class="line" viewBox="0 0 600 160" preserveAspectRatio="none"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17151f" stop-opacity=".18"/><stop offset="1" stop-color="#17151f" stop-opacity="0"/></linearGradient></defs><path class="ar" id="ar"/><path class="ln" id="ln"/><circle class="dot" id="dot" r="4"/></svg><div class="axis" id="axis"></div></div>
    <div class="card"><h3>Canali <span class="r">passa sopra: il cielo segue</span></h3><div class="chs">${s.channels.map(([n, v], i) => `<div class="ch" data-hue="${B.CH[n][1]}"><span>${n}</span><div class="bar"><i style="--w:${v}%;--c:${B.CH[n][1]};--d:${i * 90}ms"></i></div><b>${v}%</b></div>`).join('')}</div></div>
  </div>
  <div class="card"><h3>Piatti più venduti · 30 giorni</h3><div class="inset">${D.top.map(([name, cat, img, n]) => `<div class="w"><img src="../_mdesk/${img}" alt="" loading="lazy"><b>${name}</b><small>${cat}</small><div class="n">${n}</div></div>`).join('')}</div></div>
  <div class="r3">
    <div class="card"><h3>Ultimi ordini</h3><ul class="feed">${B.orders.slice(0, 7).map((o) => `<li data-hue="${o.hue}"><span class="t">${o.t}</span><span class="tag" style="--c:${o.hue}">${o.ch}</span><span>#${o.short} · ${o.name} · ${o.type}</span><span class="e">${B.euro(o.total)}</span></li>`).join('')}</ul></div>
    <div class="card"><h3>Ordini per ora</h3><div class="hours">${s.hours.map(([h, n]) => `<i style="--h:${n / peak * 100}%" data-h="${h}" class="${n === peak ? 'peak' : ''}"></i>`).join('')}</div><div class="hours-pad"></div><p class="note" style="margin-top:8px">Dati dimostrativi: piatti, prezzi e foto sono veri; incassi e quantità ridimensionati.</p></div>
  </div>`;
}
function wireOverview(root) {
  const N = 30, W = 600, H = 160, PAD = 8, rev = B.days.map((d) => d.rev), lo = Math.min(...rev) * .8, hi = Math.max(...rev) * 1.05;
  const px = (i) => PAD + i * (W - 2 * PAD) / (N - 1), py = (v) => H - PAD - (v - lo) / (hi - lo) * (H - 2 * PAD);
  const v = B.resample(rev, N), d = B.smooth(v.map((y, i) => [px(i), py(y)]));
  $('#ln', root).setAttribute('d', d); $('#ar', root).setAttribute('d', `${d} L${px(N - 1)} ${H} L${px(0)} ${H} Z`); $('#dot', root).setAttribute('cx', px(N - 1)); $('#dot', root).setAttribute('cy', py(v[N - 1]));
  $('#axis', root).innerHTML = [0, 10, 20, 29].map((i) => `<span>${B.dateIt(B.days[i].d)}</span>`).join('');
  hueFollow(root);
}
/* anything carrying data-hue steers the sky while hovered */
function hueFollow(root) {
  root.querySelectorAll('[data-hue]').forEach((el) => { el.addEventListener('pointerenter', () => setHue(el.dataset.hue)); el.addEventListener('pointerleave', moduleHue); });
}

const GROUPS = [[[0], 'Da confermare', 'hot'], [[1, 2], 'In lavorazione', ''], [[3, 4], 'Pronti e in consegna', 'low']];
function board() {
  return `<div class="cols">${GROUPS.map(([sts, label, cls]) => { const list = B.orders.filter((o) => sts.includes(o.status)); return `<div class="col ${cls}"><h3>${label}<b>${list.length}</b></h3>${list.map((o) => `<div class="card order" data-hue="${o.hue}" data-num="${o.num}"><div class="head"><b>#${o.short}</b><span class="tag" style="--c:${o.hue}">${o.ch}${o.code ? ' · ' + o.code : ''}</span><span class="t">${o.t}</span></div><div class="who">${o.name} · ${o.type} · ${B.STATUS[o.status]}${o.status === 0 && o.minutes > 8 ? ` · <span class="late">da ${o.minutes} min</span>` : ''}</div><ul>${o.items.map((x) => `<li><span>${x.q}×</span>${x.p.name}</li>`).join('')}</ul><div class="foot"><b>${B.euro(o.total)}</b>${o.status < 4 ? `<button class="btn" data-next type="button">${o.status === 0 ? 'Conferma' : '→ ' + B.STATUS[o.status + 1]}</button>` : ''}</div></div>`).join('') || '<p class="note" style="padding:6px">Niente qui.</p>'}</div>`; }).join('')}</div>`;
}
function advance(o) { o.status = Math.min(5, o.status + 1); if (o.status === 4 && o.type !== 'Consegna') o.status = 5; }
function wireBoard(root) {
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-next]'); if (!b) return; advance(B.orders.find((x) => x.num === b.closest('.order').dataset.num)); render(); });
  hueFollow(root);
}
function menu() {
  const cats = [...new Set(D.menu.map((p) => p.cat))];
  return `<div class="cats" id="cats"><span class="${state.menuCat ? '' : 'on'}" data-c="">Tutti</span>${cats.map((c) => `<span class="${state.menuCat === c ? 'on' : ''}" data-c="${c}">${c}</span>`).join('')}</div>
  <div class="mgrid">${D.menu.map((p, i) => `<div class="card prod ${state.out.has(p.name) ? 'out' : ''}" data-i="${i}" style="${state.menuCat && p.cat !== state.menuCat ? 'display:none' : ''}"><img src="../_mdesk/${p.img}" alt="${p.name}" loading="lazy"><h4>${p.name}</h4><small>${p.code ? p.code + ' · ' : ''}${p.cat}</small><div class="pf"><b>${B.euro(p.price)}</b><button type="button" data-out>${state.out.has(p.name) ? 'Esaurito ✓' : 'Esaurito'}</button></div></div>`).join('')}</div>`;
}
function wireMenu(root) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-out]'); if (b) { const p = D.menu[+b.closest('.prod').dataset.i]; state.out.has(p.name) ? state.out.delete(p.name) : state.out.add(p.name); render(); return; }
    const c = e.target.closest('#cats span'); if (c) { state.menuCat = c.dataset.c; render(); }
  });
}
const STUBS = { cucina: 'Schermo cucina: una scheda per ordine, timer di attesa, pannello esauriti.', cassa: 'Cassa touch: griglia piatti, conto aperto, incasso in contanti o carta.', prenotazioni: 'Prenotazioni tavoli: agenda del giorno, turni, conferme via WhatsApp.', opzioni: 'Gruppi di opzioni e supplementi collegati ai piatti.', piattaforme: 'Deliveroo e Just Eat: menù sincronizzato, ordini importati in automatico.', consegne: 'Zone di consegna, costi, tempi stimati.', rider: 'Rider attivi, assegnazioni, posizione in tempo reale.', fedelta: 'Punti, premi, coupon.', clienti: 'Rubrica clienti con storico ordini.', report: 'Chiusure giornaliere, export contabile.', stampa: 'Stampanti termiche di sala e cucina, agente di stampa.', impostazioni: 'Orari, pausa ordini, auto-conferma, integrazioni.' };
const SCREENS = { panoramica: [overview, wireOverview], ordini: [board, wireBoard], menu: [menu, wireMenu] };
function render() {
  const [html, wire] = SCREENS[state.module] || [() => `<div class="card stub"><div><b>${B.label(state.module)}</b>${STUBS[state.module] || ''}<br><small>In questa demo sono attive Panoramica, Ordini e Menu.</small></div></div>`, () => {}];
  view.innerHTML = html(); wire(view);
}
function go(id) {
  state.module = id; moduleHue();
  mods.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id));
  render(); suggestions(); window.scrollTo(0, 0);
}
mods.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); if (a.dataset.more !== undefined) { mods.querySelectorAll('.dim').forEach((x) => x.classList.remove('dim')); a.remove(); return; } try { history.replaceState(null, '', '#' + a.dataset.id); } catch (_) {} go(a.dataset.id); });

/* ── the assistant ── */
const SUGG = { panoramica: ['Come va oggi?', 'Conferma tutti gli ordini in attesa', 'Metti in pausa gli ordini 20 minuti'], ordini: ['Conferma tutti gli ordini in attesa', 'Rispondi al cliente dell’ultimo ordine', 'Quanti ordini stasera?'], menu: ['Segna esaurito l\u2019Edamame', 'Rimetti in vendita tutto', 'Qual è il piatto più venduto?'] };
function suggestions() { sugg.innerHTML = (SUGG[state.module] || SUGG.panoramica).map((s) => `<button type="button">${s}</button>`).join(''); }
sugg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; q.value = b.textContent; prompt.classList.add('has'); ask(); });
q.addEventListener('input', () => prompt.classList.toggle('has', !!q.value.trim()));
prompt.addEventListener('submit', (e) => { e.preventDefault(); ask(); });

let thinking = 0;
function ask() {
  const text = q.value.trim(); if (!text) return;
  q.value = ''; prompt.classList.remove('has');
  orb.classList.add('think'); clearTimeout(thinking);
  thinking = setTimeout(() => { orb.classList.remove('think'); propose(intent(text)); }, reduce ? 0 : 700);
}
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function findDish(text) { const t = norm(text); return D.menu.filter((p) => { const w = norm(p.name).split(/\s+/).filter((x) => x.length > 3); return w.length && w.every((x) => t.includes(x)); }).sort((a, b) => b.name.length - a.name.length)[0] || D.menu.find((p) => norm(p.name).split(/\s+/).some((x) => x.length > 4 && t.includes(x))); }
/* intent → a proposal. Rules, not a model: this is the confirm-card pattern, the wording is the demo's. */
function intent(text) {
  const t = norm(text);
  if (/paus|pause|stop|ferma|chiud/.test(t) && !/rimett|riapri|resume|togli/.test(t)) { const m = t.match(/(\d+)\s*(min|minut)/); const min = m ? +m[1] : 20; return { kind: 'pause', min, title: 'Pausa ordini', body: `Metto in pausa i nuovi ordini online per <b>${min} minuti</b>: sito, app e piattaforme mostrano «al momento non accettiamo ordini». Gli ordini già in coda restano.`, go: () => { setPaused(true); say(`Ordini in pausa per ${min} minuti`); }, ok: 'Metti in pausa' }; }
  if (/rimett|riapri|resume|togli.*paus/.test(t) && /paus|ordin/.test(t) && !/vendit|esaur/.test(t)) return { kind: 'unpause', title: 'Riapri gli ordini', body: 'Riapro gli ordini online su tutti i canali.', go: () => { setPaused(false); say('Ordini riaperti'); }, ok: 'Riapri' };
  if (/esaur|sold|finit|terminat|non c.e piu|out of/.test(t)) { const p = findDish(text); if (!p) return { kind: 'ask', title: 'Quale piatto?', body: 'Dimmi il nome del piatto da segnare esaurito, per esempio <b>«segna esaurito il Pad Thai»</b>.', none: true }; return { kind: 'out', title: 'Segna esaurito', body: `Segno <b>${p.name}</b> (${B.euro(p.price)}) come esaurito: sparisce dal sito e dalle piattaforme finché non lo rimetti in vendita.`, go: () => { state.out.add(p.name); if (state.module === 'menu') render(); say(`${p.name} segnato esaurito`); }, ok: 'Segna esaurito' }; }
  if (/rimett|riapri|disponib|torna|back on|restore/.test(t) && /vendit|tutt|menu|piatt/.test(t)) return { kind: 'restore', title: 'Rimetti in vendita', body: state.out.size ? `Rimetto in vendita ${state.out.size === 1 ? 'il piatto esaurito' : `i ${state.out.size} piatti esauriti`}: ${[...state.out].join(', ')}.` : 'Non c’è nessun piatto segnato esaurito.', go: state.out.size ? () => { state.out.clear(); if (state.module === 'menu') render(); say('Tutto di nuovo in vendita'); } : null, ok: 'Rimetti in vendita', none: !state.out.size };
  if (/conferm|confirm|accett/.test(t)) { const w = B.orders.filter((o) => o.status === 0); return { kind: 'confirm', title: 'Conferma in blocco', body: w.length ? `Confermo <b>${w.length} ${w.length === 1 ? 'ordine' : 'ordini'}</b> in attesa (${w.map((o) => '#' + o.short).join(', ')}), stampo le comande in cucina e avviso i clienti.` : 'Non c’è nessun ordine in attesa.', go: w.length ? () => { w.forEach(advance); if (state.module === 'ordini') render(); say(`${w.length} ordini confermati`); } : null, ok: 'Conferma tutti', none: !w.length }; }
  if (/rispond|reply|draft|messagg|whatsapp|scriv/.test(t)) { const o = B.orders[0]; return { kind: 'reply', title: `Messaggio a ${o.name}`, body: `Bozza per l’ordine #${o.short} (${o.ch}, ${o.type}). Parte solo se premi Invia.`, msg: `Ciao ${o.name.split(' ')[0]}! Il tuo ordine #${o.short} è confermato: ${o.items.map((x) => `${x.q}× ${x.p.name}`).join(', ')}. ${o.type === 'Consegna' ? 'Arriva tra circa 30 minuti.' : 'Sarà pronto tra circa 20 minuti.'} Grazie, Mumi Sushi 🍣`, go: () => say('Messaggio inviato'), ok: 'Invia' }; }
  if (/piu vendut|best|top|most sold/.test(t)) { const [n, c, , qn] = D.top[0]; return { kind: 'info', title: 'Piatto più venduto', body: `<b>${n}</b> (${c}): ${qn} porzioni negli ultimi 30 giorni, più del doppio del secondo (${D.top[1][0]}, ${D.top[1][3]}).`, none: true }; }
  if (/quant|how many|stasera|sera|evening/.test(t) && /ordin|order/.test(t)) { const ev = D.stats.hours.filter(([h]) => h >= 18).reduce((a, x) => a + x[1], 0), tot = D.stats.hours.reduce((a, x) => a + x[1], 0); return { kind: 'info', title: 'Ordini della sera', body: `Il <b>${Math.round(ev / tot * 100)}%</b> degli ordini arriva dopo le 18, con il picco tra le 19 e le 20. Stasera per ora ${B.orders.filter((o) => o.status < 5).length} ordini aperti.`, none: true }; }
  if (/come va|riepilog|summar|report|oggi|today|how.*going/.test(t)) { const d = B.today, dRev = B.delta(d.rev, B.avg7('rev')), w = B.orders.filter((o) => o.status === 0).length; return { kind: 'info', title: 'Come va oggi', body: `<b>${B.euro0(d.rev)}</b> con ${d.n} ordini, ${dRev >= 0 ? '+' : '−'}${Math.abs(dRev).toFixed(0)}% sulla media della settimana; scontrino medio ${B.euro(d.rev / d.n)}, preparazione ${D.stats.prepMin} min. ${w ? `<b>${w} ${w === 1 ? 'ordine aspetta' : 'ordini aspettano'} una conferma.</b>` : 'Nessun ordine in attesa.'}${state.paused ? ' Gli ordini online sono in pausa.' : ''}`, none: true }; }
  return { kind: 'help', title: 'Non ho capito', body: 'Posso <b>mettere in pausa</b> gli ordini, <b>segnare esaurito</b> un piatto, <b>confermare</b> gli ordini in attesa, <b>rispondere</b> a un cliente o fare un <b>riepilogo</b>.', none: true };
}
function propose(p) {
  const el = document.createElement('div'); el.className = 'prop';
  el.innerHTML = `<div class="k"><b>Assistente</b> · ${p.none ? 'risposta' : 'proposta · non ancora applicata'}</div><div><div class="body"><b>${p.title}.</b> ${p.body}</div>${p.msg ? `<div class="msg">${p.msg}</div>` : ''}</div><div class="acts">${p.none ? '<button type="button" data-close>Ok</button>' : `<button type="button" class="go" data-go>${p.ok}</button><button type="button" data-close>Annulla</button>`}</div><span class="burn"></span>`;
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-go]')) { p.go && p.go(); el.classList.add('done'); el.querySelector('.k').innerHTML = '<b>Assistente</b> · <span class="done-note">applicato</span>'; setTimeout(() => el.remove(), 3200); }
    if (e.target.closest('[data-close]')) el.remove();
  });
  ai.prepend(el); while (ai.children.length > 3) ai.lastElementChild.remove();
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

go(B.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
// the first thing the assistant says, unprompted: what needs a decision right now
const w0 = B.orders.filter((o) => o.status === 0 && o.minutes > 8);
if (w0.length) setTimeout(() => propose({ kind: 'confirm', title: 'Ordini in attesa', body: `<b>${w0.length} ordini</b> aspettano da più di 8 minuti (${w0.map((o) => '#' + o.short).join(', ')}). Li confermo tutti?`, go: () => { w0.forEach(advance); if (state.module === 'ordini') render(); say(`${w0.length} ordini confermati`); }, ok: 'Conferma tutti' }), reduce ? 0 : 1600);
