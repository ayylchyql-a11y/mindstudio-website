/* M Desk demo — shared base for the whole-page dashboard designs
   (command-center, editorial, bento, ambient-ai). It renders nothing: it only
   exposes the real module list, the icons, the formatters and a seeded set of
   orders built from the live menu. The six sidebar designs use core.js instead;
   the two never load together. Reads window.MDESK (data.js). */
window.Mbase = (function () {
  const D = window.MDESK;
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
  const icon = (id, size = 20, sw = 1.7) => { const n = NAV.find((x) => x.id === id); return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${n.d}"/></svg>`; };
  const label = (id) => NAV.find((x) => x.id === id).label;

  const euro = (n) => '€ ' + n.toFixed(2).replace('.', ',');
  const euro0 = (n) => '€ ' + Math.round(n).toLocaleString('it-IT');
  const dateIt = (iso, opts = { day: 'numeric', month: 'short' }) => new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', opts);

  // channel colour + hue (the hue is for the ambient design, which paints the sky with it)
  const CH = { Sito: ['#2f6fff', 222], App: ['#5b46d9', 252], Chiosco: ['#16a37a', 162], Cassa: ['#8a6d3b', 38], Deliveroo: ['#00ccbc', 174], 'Just Eat': ['#ff8000', 30] };
  const STATUS = ['In attesa', 'Confermato', 'In preparazione', 'Pronto', 'In consegna', 'Completato'];
  const NAMES = ['Marco R.', 'Giulia B.', 'Luca F.', 'Sara M.', 'Andrea C.', 'Chiara D.', 'Davide P.', 'Elena T.', 'Matteo G.', 'Francesca L.', 'Simone V.', 'Alessia N.'];

  // seeded orders from the real menu — same LCG as core.js so both families agree on the numbers
  let seed = 9; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const MIX = ['Deliveroo', 'Chiosco', 'Just Eat', 'Deliveroo', 'Chiosco', 'Sito', 'Deliveroo', 'Just Eat', 'Chiosco', 'Deliveroo', 'Sito', 'Chiosco'];
  const orders = MIX.map((chName, i) => {
    const n = 1 + Math.floor(rnd() * 4);
    const items = Array.from({ length: n }, () => ({ q: 1 + Math.floor(rnd() * 2), p: pick(D.menu) }));
    const total = items.reduce((s, x) => s + x.q * x.p.price, 0);
    const h = 19 + Math.floor(i / 4), m = String(Math.floor(rnd() * 60)).padStart(2, '0');
    const type = chName === 'Chiosco' || chName === 'Cassa' ? pick(['Ritiro', 'Al tavolo']) : chName === 'Deliveroo' || chName === 'Just Eat' ? 'Consegna' : pick(['Consegna', 'Ritiro']);
    const status = i < 3 ? 0 : i < 7 ? 1 : i < 10 ? 2 : 3;
    const code = chName === 'Just Eat' ? String(220100000 + Math.floor(rnd() * 90000)) : chName === 'Deliveroo' ? String(1000 + Math.floor(rnd() * 9000)) : '';
    return { num: `20260920-0${40 - i}`, short: String(40 - i).padStart(3, '0'), ch: chName, col: CH[chName][0], hue: CH[chName][1], type, status, items, total, t: `${h}:${m}`, code, name: NAMES[i], minutes: 3 + Math.floor(rnd() * 14) };
  });

  // Catmull-Rom → cubic béziers; used by every line chart in this family
  const smooth = (pts) => { let d = `M${pts[0][0]} ${pts[0][1]}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`; } return d; };
  const resample = (arr, N) => Array.from({ length: N }, (_, i) => { const x = i / (N - 1) * (arr.length - 1), a = Math.floor(x), b = Math.min(arr.length - 1, a + 1); return arr[a] + (arr[b] - arr[a]) * (x - a); });

  const days = D.stats.days, today = days[days.length - 1];
  const avg7 = (key) => days.slice(-8, -1).reduce((s, d) => s + d[key], 0) / 7;
  const delta = (a, b) => (a - b) / b * 100;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  return { NAV, GROUPS, icon, label, euro, euro0, dateIt, CH, STATUS, orders, smooth, resample, days, today, avg7, delta, reduce, rnd };
})();
