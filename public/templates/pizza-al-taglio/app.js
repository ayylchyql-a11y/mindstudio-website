/* Mollica · pizza al taglio — modello di fantasia. Tutto in memoria: niente storage (iframe sandbox). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const eur = (n) => "€ " + n.toFixed(2).replace(".", ",");
  const pad2 = (n) => String(n).padStart(2, "0");
  const hhmm = (m) => pad2(Math.floor((m % 1440) / 60)) + ":" + pad2(m % 60);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // lo storage nel sandbox lancia SecurityError: lo proviamo una volta e poi restiamo in memoria
  const mem = {};
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
  };

  /* ---------------- dati ---------------- */
  const MENU = [
    { id: "pomodorini", cat: "rosse", name: "Pomodorini e basilico", desc: "San Marzano, pomodorini gialli e rossi, basilico a crudo.", kg: 19, img: "s-pomodorini" },
    { id: "ciliegino", cat: "rosse", name: "Ciliegino e pecorino", desc: "Ciliegino confit, pecorino romano grattugiato al momento.", kg: 21, img: "s-ciliegino" },
    { id: "salamino", cat: "rosse", name: "Salamino piccante", desc: "Fette sottili che si arricciano in forno, cime di rapa, grana.", kg: 23, img: "s-salamino" },
    { id: "spianata", cat: "rosse", name: "Margherita in teglia", desc: "Pomodoro a fette, fiordilatte, basilico fresco a crudo.", kg: 20, img: "s-margherita", out: "Esaurita · ore 19:20" },
    { id: "broccoletti", cat: "bianche", name: "Broccoletti e stracciatella", desc: "Broccoletti ripassati, stracciatella, semi di zucca tostati.", kg: 22, img: "s-broccoli" },
    { id: "friarielli", cat: "bianche", name: "Friarielli e provola", desc: "Friarielli all’aglio, provola, peperoncino dolce.", kg: 22, img: "s-friarielli" },
    { id: "cipolla", cat: "bianche", name: "Cipolla e cardoncelli", desc: "Cipolla rossa stufata, funghi cardoncelli, fiordilatte.", kg: 21, img: "s-patate-funghi" },
    { id: "burrata", cat: "speciali", name: "Pomodoro e burrata", desc: "Base rossa, burrata a pezzi aggiunta a freddo, basilico.", kg: 28, img: "s-burrata", tag: "Novità" },
    { id: "mortadella", cat: "speciali", name: "Mortadella e pistacchio", desc: "Bianca croccante, mortadella sottile, burrata e granella.", kg: 29, img: "s-mortadella" },
    { id: "radicchio", cat: "speciali", name: "Radicchio e funghi", desc: "Radicchio tardivo, champignon arrosto, cipolla rossa.", kg: 24, img: "s-radicchio" },
  ];
  const FRY = [
    { id: "suppli", name: "Supplì al telefono", desc: "Riso al sugo, cuore di mozzarella che fila.", pz: 2.5, icon: "suppli" },
    { id: "cacio", name: "Supplì cacio e pepe", desc: "Riso mantecato al pecorino, pepe nero tostato.", pz: 2.8, icon: "suppli" },
    { id: "crocchetta", name: "Crocchetta di patate", desc: "Patate, parmigiano, prezzemolo, panatura fine.", pz: 2, icon: "croc" },
    { id: "fiore", name: "Fiore di zucca", desc: "Con mozzarella e alice, in pastella leggera.", pz: 3, icon: "fiore" },
  ];
  const SHOP = [
    { id: "farina1", name: "Farina tipo 1 a pietra", meta: "sacco da 1 kg", price: 4.5, art: "sack", bg: "#e9dccb", label: "TIPO 1" },
    { id: "farinaint", name: "Farina integrale", meta: "sacco da 1 kg", price: 4.8, art: "sack", bg: "#dcc6a6", label: "INTEGRALE" },
    { id: "lievito", name: "Lievito madre essiccato", meta: "50 g · per 10 teglie", price: 6.9, art: "jar", bg: "#efe3d3" },
    { id: "teglia", name: "Teglia in ferro blu", meta: "40 × 30 cm", price: 32, art: "pan", bg: "#d8dde0" },
    { id: "grembiule", name: "Grembiule di lino", meta: "taglia unica", price: 28, art: "apron", bg: "#e7d2c6" },
    { id: "gift", name: "Carta regalo", meta: "si spende al banco e in bottega", price: 25, amounts: [25, 50, 100], art: "gift", bg: "#c4532f" },
  ];
  const MIN_ORDER = 6, G_MIN = 100, G_MAX = 500, G_STEP = 10, DEPTH_CM = 10, G_PER_CM = 13, TRAY_CM = 40;
  // orari: minuti dalla mezzanotte; oltre 1440 = dopo mezzanotte (ven/sab fino alle 00:30)
  const HOURS = { 0: [[720, 1320]], 1: [], 2: [[660, 1350]], 3: [[660, 1350]], 4: [[660, 1350]], 5: [[660, 1470]], 6: [[660, 1470]] };
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

  /* ---------------- icone a linea ---------------- */
  const IC = {
    wheat: '<path d="M15 27V9"/><path d="M15 12c-3-1-4-4-4-6 3 1 4 3 4 6Zm0 0c3-1 4-4 4-6-3 1-4 3-4 6Zm0 6c-3-1-4-4-4-6 3 1 4 3 4 6Zm0 0c3-1 4-4 4-6-3 1-4 3-4 6Zm0 6c-3-1-4-4-4-6 3 1 4 3 4 6Zm0 0c3-1 4-4 4-6-3 1-4 3-4 6Z"/>',
    clock: '<circle cx="15" cy="15" r="10"/><path d="M15 9v6l4 3"/>',
    flame: '<path d="M15 26c-5 0-8-3-8-7 0-5 5-7 5-12 3 2 4 5 4 7 1-1 2-3 2-4 3 3 5 6 5 9 0 4-3 7-8 7Z"/><path d="M15 26c-2 0-3-1.5-3-3 0-2 2-3 3-5 1 2 3 3 3 5 0 1.5-1 3-3 3Z"/>',
    scissors: '<circle cx="9" cy="21" r="3.5"/><circle cx="21" cy="21" r="3.5"/><path d="M11.5 18.5 22 5M18.5 18.5 8 5"/>',
    scale: '<path d="M6 24h18l-2-9H8l-2 9Z"/><path d="M15 15V7M10 7h10"/>',
    hand: '<path d="M10 25v-9l-3-4a1.6 1.6 0 0 1 2.6-2l2.4 3V6.5a1.5 1.5 0 0 1 3 0V13V5a1.5 1.5 0 0 1 3 0v8-6a1.5 1.5 0 0 1 3 0v10c0 5-3 8-7 8"/>',
    suppli: '<ellipse cx="30" cy="30" rx="22" ry="13" transform="rotate(-18 30 30)"/><path d="M14 33c4 3 12 4 20 1M20 22l1 2M28 20l1 2M36 21l1 2M26 28l1 2M34 27l1 2M42 26l1 2"/><path d="M48 18c3-1 6 0 8 2"/>',
    croc: '<rect x="10" y="20" width="40" height="18" rx="9" transform="rotate(-8 30 29)"/><path d="M18 26l1 2M26 25l1 2M34 24l1 2M42 23l1 2M22 32l1 2M30 31l1 2M38 30l1 2"/>',
    fiore: '<path d="M12 40c6-8 16-12 30-10 4 1 8 3 10 6-6 4-14 6-24 6-6 0-12-1-16-2Z"/><path d="M42 30c2-6 6-10 12-12M46 32c4-4 8-6 12-6M40 29c0-6 2-10 6-14"/><path d="M18 38c6-3 14-4 22-3"/>',
  };
  const ic = (k, vb = "0 0 30 30") => `<svg viewBox="${vb}" aria-hidden="true">${IC[k]}</svg>`;

  /* ---------------- la mascotte: panetto di pasta a linea sola ---------------- */
  // ogni occhio: bianco + pupilla (spostata con l'attributo transform, mai CSS) + palpebra per l'ammiccare
  const eye = (cx, cy, r) =>
    `<g class="eye" data-cx="${cx}" data-cy="${cy}" data-r="${(r * 0.42).toFixed(2)}">` +
    `<circle class="eyew" cx="${cx}" cy="${cy}" r="${r}"/>` +
    `<circle class="pup" cx="${cx}" cy="${cy}" r="${(r * 0.5).toFixed(2)}"/>` +
    `<path class="lid" d="M${cx - r} ${cy} h${2 * r}"/></g>`;
  const smile = (x, y, w) => `<path class="ln" d="M${x} ${y} q${w / 2} ${w * 0.45} ${w} 0"/>`;
  const hand = (x, y, dir) => { // tre dita aperte
    const s = dir;
    return `<path class="ln" d="M${x} ${y} l${-7 * s} 3 M${x} ${y} l${-6 * s} -4 M${x} ${y} l${-1 * s} -8 M${x} ${y} l${-8 * s} 9"/>`;
  };
  const BODY = "M28 176 C24 128 44 96 72 86 C64 76 64 56 78 46 C92 36 116 38 124 54 C130 66 126 80 118 87 C148 98 170 128 168 176";
  const MASCOT = {
    head: () => `<svg viewBox="0 0 44 26"><path class="ln body" d="M3 27 C3 12 11 2 22 2 C33 2 41 12 41 27"/>${eye(16.5, 14, 3.6)}${eye(27.5, 14, 3.6)}${smile(19.5, 20, 5)}</svg>`,
    peek: () => `<svg viewBox="0 0 200 170"><path class="ln body" d="${BODY}"/>` +
      `<path class="ln" d="M52 116 C36 128 22 140 12 150"/>${hand(12, 150, -1)}` +
      `<path class="ln" d="M150 114 C164 122 178 132 188 140"/>${hand(188, 140, 1)}` +
      `${eye(90, 62, 6)}${eye(110, 62, 6)}${smile(94, 74, 12)}</svg>`,
    wheat: () => `<svg viewBox="0 0 210 210"><g transform="translate(14 18)"><path class="ln body" d="${BODY} C140 186 56 186 28 176Z"/>` +
      `${eye(90, 62, 6)}${eye(110, 62, 6)}${smile(94, 74, 12)}</g>` +
      `<g class="ln"><path d="M150 40 L84 170"/><path d="M146 48c-8-2-10-10-9-16 7 3 10 9 9 16Zm0 0c6-6 14-6 18-3-5 5-12 6-18 3Z"/>` +
      `<path d="M139 62c-8-2-10-10-9-16 7 3 10 9 9 16Zm0 0c6-6 14-6 18-3-5 5-12 6-18 3Z"/>` +
      `<path d="M132 76c-8-2-10-10-9-16 7 3 10 9 9 16Zm0 0c6-6 14-6 18-3-5 5-12 6-18 3Z"/>` +
      `<path d="M58 150 C80 142 96 132 112 126"/><path d="M172 150 C150 140 134 132 120 124"/></g></svg>`,
    zen: () => `<svg viewBox="0 0 120 120"><path class="ln body" d="M30 96 C24 72 34 56 46 50 C40 42 42 26 52 20 C62 14 76 18 80 28 C84 38 80 46 76 50 C88 56 98 72 92 96 Z"/>` +
      `<path class="ln body" d="M14 104 C18 90 40 88 60 96 C80 88 102 90 106 104 C100 112 20 112 14 104 Z"/>` +
      `<path class="ln" d="M36 74 C40 86 50 92 60 92 C70 92 80 86 84 74"/><circle class="ln" cx="60" cy="92" r="3"/>` +
      `${eye(54, 34, 4)}${eye(68, 34, 4)}${smile(57, 42, 8)}</svg>`,
  };
  const mountMascots = (root = document) =>
    $$("[data-mascot]", root).forEach((el) => { if (!el.firstChild) el.innerHTML = (MASCOT[el.dataset.mascot] || MASCOT.peek)(); });

  // sguardo: ogni occhio calcola il proprio vettore verso il puntatore, raggio 260 px, bloccato nel disco
  const gaze = { x: innerWidth / 2, y: innerHeight * 0.45, raf: 0 };
  const REACH = 260;
  function lookAll() {
    gaze.raf = 0;
    let busy = false;
    $$(".eye").forEach((g) => {
      const w = g.firstChild, r = w.getBoundingClientRect();
      if (!r.width || r.bottom < -40 || r.top > innerHeight + 40) return;
      let dx = (gaze.x - (r.left + r.width / 2)) / REACH, dy = (gaze.y - (r.top + r.height / 2)) / REACH;
      const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
      const R = +g.dataset.r, tx = dx * R, ty = dy * R;
      const cur = g._p || { x: 0, y: 0 };
      const k = reduce() ? 1 : 0.22;
      cur.x += (tx - cur.x) * k; cur.y += (ty - cur.y) * k;
      if (Math.abs(tx - cur.x) > 0.02 || Math.abs(ty - cur.y) > 0.02) busy = true; else { cur.x = tx; cur.y = ty; }
      g._p = cur;
      g.children[1].setAttribute("transform", `translate(${cur.x.toFixed(2)} ${cur.y.toFixed(2)})`);
    });
    if (busy) gaze.raf = requestAnimationFrame(lookAll);
  }
  const kickGaze = () => { if (!gaze.raf) gaze.raf = requestAnimationFrame(lookAll); };
  addEventListener("pointermove", (e) => { gaze.x = e.clientX; gaze.y = e.clientY; kickGaze(); }, { passive: true });
  addEventListener("pointerdown", (e) => { gaze.x = e.clientX; gaze.y = e.clientY; kickGaze(); }, { passive: true });
  addEventListener("scroll", kickGaze, { passive: true });
  document.addEventListener("mouseout", (e) => { if (!e.relatedTarget) { gaze.x = innerWidth / 2; gaze.y = innerHeight * 0.45; kickGaze(); } });
  function blinkLoop() {
    setTimeout(() => {
      if (!reduce() && !document.hidden) {
        const all = $$("[data-mascot]");
        all.forEach((m) => m.classList.add("is-blink"));
        setTimeout(() => all.forEach((m) => m.classList.remove("is-blink")), 140);
      }
      blinkLoop();
    }, 3000 + Math.random() * 3000);
  }

  /* ---------------- nastro sotto il primo piano ---------------- */
  const RIBBON = [["wheat", "Grano del Lazio macinato a pietra"], ["clock", "48 ore di lievitazione"], ["flame", "Teglia nuova ogni 40 minuti"],
    ["scale", "Si paga a peso, al grammo"], ["scissors", "Tagliata con le forbici"], ["hand", "Si mangia in piedi, al vicolo"]];
  function mountRibbon() {
    const one = RIBBON.map(([k, t]) => `<span>${ic(k)}${esc(t)}</span>`).join("");
    const two = RIBBON.map(([k, t]) => `<span aria-hidden="true">${ic(k)}${esc(t)}</span>`).join("");
    $("#ribbon").innerHTML = one + two;
  }

  /* ---------------- orari: sempre ora di Roma, anche dopo mezzanotte ---------------- */
  // ?t=2026-11-14T00:15 forza un'ora di Roma (solo per le prove)
  function romeNow() {
    let q = null;
    try { q = new URLSearchParams(location.search).get("t"); } catch (e) { /* niente */ }
    const m = q && q.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (m) {
      const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      return { y: +m[1], mo: +m[2], d: +m[3], dow: d.getUTCDay(), min: +m[4] * 60 + +m[5] };
    }
    const parts = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" })
      .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
    return { y: +parts.year, mo: +parts.month, d: +parts.day, dow, min: (+parts.hour % 24) * 60 + +parts.minute };
  }
  // intervalli in minuti assoluti, con 0 = mezzanotte di oggi (ieri = negativi, domani = +1440…)
  function spans(now, fromDay = -1, toDay = 7) {
    const out = [];
    for (let k = fromDay; k <= toDay; k++) {
      const dow = (now.dow + k + 7) % 7;
      (HOURS[dow] || []).forEach(([a, b]) => out.push({ a: a + k * 1440, b: b + k * 1440, day: k, dow }));
    }
    return out;
  }
  const dayWord = (k, dow) => (k === 0 ? "oggi" : k === 1 ? "domani" : DAYS[dow]);
  function status(now = romeNow()) {
    const t = now.min, all = spans(now);
    const cur = all.find((s) => t >= s.a && t < s.b);
    if (cur) {
      const left = cur.b - t;
      return { open: true, soon: left <= 30, closeAt: cur.b, left,
        line: left <= 30 ? `Aperto · chiude tra ${left} min (${hhmm(cur.b)})` : `Aperto ora · chiude alle ${hhmm(cur.b)}`,
        short: left <= 30 ? `Chiude alle ${hhmm(cur.b)}` : `Aperto fino alle ${hhmm(cur.b)}` };
    }
    const next = all.filter((s) => s.a > t).sort((x, y) => x.a - y.a)[0];
    const wait = next.a - t, when = dayWord(next.day, next.dow);
    return { open: false, soon: wait <= 60, next,
      line: wait <= 60 ? `Chiuso · apre tra ${wait} min (${hhmm(next.a)})` : `Chiuso · riapre ${when} alle ${hhmm(next.a)}`,
      short: wait <= 60 ? `Apre ${hhmm(next.a)}` : `Chiuso` };
  }
  function paintStatus() {
    const now = romeNow(), s = status(now);
    const cls = s.open ? (s.soon ? "is-soon" : "is-open") : (s.soon ? "is-soon" : "is-closed");
    $$("[data-status-dot]").forEach((d) => { d.classList.remove("is-open", "is-soon", "is-closed"); d.classList.add(cls); });
    $$("[data-status-line]").forEach((el) => { el.textContent = s.line; });
    $$("[data-status-short]").forEach((el) => { el.textContent = s.short; });
    // ultima teglia: ogni 40 minuti dall'apertura
    const fresh = $("#freshLine");
    if (fresh) {
      const cur = spans(now).find((x) => now.min >= x.a && now.min < x.b);
      if (cur) { const last = cur.a + Math.floor((now.min - cur.a) / 40) * 40; fresh.textContent = `Ultima teglia sfornata alle ${hhmm(last)} · prossima alle ${hhmm(last + 40)}`; }
      else fresh.textContent = "Teglie sfornate ogni 40 minuti, dall’apertura";
    }
    const tb = $("#hours");
    if (tb && !tb.dataset.done) {
      tb.dataset.done = "1";
      tb.innerHTML = "<tbody>" + [1, 2, 3, 4, 5, 6, 0].map((d) => {
        const h = HOURS[d];
        const txt = h.length ? h.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(", ") : "chiuso";
        return `<tr data-dow="${d}"><td>${DAYS[d][0].toUpperCase() + DAYS[d].slice(1)}</td><td>${txt}</td></tr>`;
      }).join("") + "</tbody>";
    }
    // dopo mezzanotte (ven/sab) il «giorno» del banco è ancora quello di ieri
    const serviceDow = spans(now, -1, -1).some((x) => now.min < x.b) ? (now.dow + 6) % 7 : now.dow;
    $$("#hours tr").forEach((tr) => tr.classList.toggle("is-today", +tr.dataset.dow === serviceDow));
    return s;
  }
  // fasce di ritiro: ogni 15 min, almeno 20 min da adesso, fino a 15 min prima della chiusura
  function pickupSlots(max = 12) {
    const now = romeNow(), t0 = now.min + 20, out = [];
    spans(now, -1, 7).sort((x, y) => x.a - y.a).forEach((s) => {
      for (let m = Math.max(s.a, Math.ceil(t0 / 15) * 15); m <= s.b - 15 && out.length < max; m += 15) {
        const k = Math.floor(m / 1440);
        out.push({ m, label: hhmm(((m % 1440) + 1440) % 1440), day: k === 0 ? "" : dayWord(k, (now.dow + k + 7) % 7) });
      }
    });
    return out;
  }

  /* ---------------- toast + fogli (scrim, Esc, focus) ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 2600);
  }
  const stack = [];
  function openSheet(el) {
    if (stack.includes(el)) return;
    closeDrawer();
    el._back = document.activeElement;
    const scrim = $("#scrim");
    scrim.hidden = false; el.hidden = false;
    void el.offsetWidth;
    scrim.classList.add("is-on"); el.classList.add("is-open");
    stack.push(el); document.body.classList.add("mo-lock");
    const f = el.querySelector(".mo-x");
    setTimeout(() => { (el.querySelector("[data-autofocus]") || f || el).focus({ preventScroll: true }); }, 60);
  }
  function closeSheet(el = stack[stack.length - 1]) {
    if (!el) return;
    stack.splice(stack.indexOf(el), 1);
    el.classList.remove("is-open");
    const scrim = $("#scrim");
    if (!stack.length) { scrim.classList.remove("is-on"); document.body.classList.remove("mo-lock"); }
    const done = () => { if (!el.classList.contains("is-open")) el.hidden = true; if (!stack.length && !scrim.classList.contains("is-on")) scrim.hidden = true; };
    setTimeout(done, reduce() ? 20 : 520);
    if (el._back && el._back.focus) el._back.focus({ preventScroll: true });
    if (el.onclosed) el.onclosed();
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-close]");
    if (c) { const sh = c.closest(".mo-sheet"); if (sh) closeSheet(sh); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (stack.length) closeSheet(); else closeDrawer(); }
    if (e.key === "Tab" && stack.length) { // tieni il focus dentro al foglio aperto
      const sh = stack[stack.length - 1];
      const f = $$("button:not([disabled]), input, [tabindex='0'], a[href]", sh).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------------- menu mobile ---------------- */
  function closeDrawer() {
    const d = $("#drawer"), b = $("#burger");
    if (!d.classList.contains("is-open")) return;
    d.classList.remove("is-open"); d.setAttribute("aria-hidden", "true");
    b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Apri il menu");
    if (!stack.length) document.body.classList.remove("mo-lock");
    paintHead();
  }
  function initDrawer() {
    const d = $("#drawer"), b = $("#burger");
    b.addEventListener("click", () => {
      if (d.classList.contains("is-open")) { closeDrawer(); return; }
      d.classList.add("is-open"); d.setAttribute("aria-hidden", "false");
      b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-label", "Chiudi il menu");
      document.body.classList.add("mo-lock");
    });
    $$("a", d).forEach((a) => a.addEventListener("click", closeDrawer));
    addEventListener("resize", () => { if (innerWidth > 900) closeDrawer(); });
  }

  /* ---------------- il banco: schede per categoria ---------------- */
  let cat = "tutte";
  const sliceCard = (p, i) => `<article class="mo-slice" style="animation-delay:${Math.min(i, 8) * 30}ms">
      <div class="mo-slice-img"><img src="assets/${p.img}.webp" alt="Teglia ${esc(p.name.toLowerCase())}" loading="lazy" width="600" height="600">
      ${p.out ? `<span class="mo-tag is-out">${esc(p.out)}</span>` : p.tag ? `<span class="mo-tag">${esc(p.tag)}</span>` : ""}</div>
      <div class="mo-slice-bd"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
      <div class="mo-slice-ft"><span class="mo-price">${eur(p.kg)} <small>/ kg</small></span>
      <button type="button" class="mo-cutbtn" data-cut="${p.id}" ${p.out ? "disabled" : ""}>${ic("scissors")}${p.out ? "Esaurita" : "Taglia"}</button></div></div></article>`;
  const fryCard = (p, i) => `<article class="mo-slice mo-fry" style="animation-delay:${Math.min(i, 8) * 30}ms">
      <div class="mo-slice-img">${ic(p.icon, "0 0 60 60")}</div>
      <div class="mo-slice-bd"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
      <div class="mo-slice-ft"><span class="mo-price">${eur(p.pz)} <small>al pezzo</small></span>
      <button type="button" class="mo-cutbtn" data-fry="${p.id}">+ Aggiungi</button></div></div></article>`;
  function renderGrid() {
    const sl = MENU.filter((p) => cat === "tutte" || p.cat === cat);
    const fr = cat === "tutte" || cat === "fritti" ? FRY : [];
    const sub = sl.length && fr.length ? `<p class="mo-grid-sub"><span>Fritti</span> al pezzo, appena scolati</p>` : "";
    $("#grid").innerHTML = sl.map(sliceCard).join("") + sub + fr.map((p, i) => fryCard(p, i + sl.length)).join("");
    $("#grid").dataset.cat = cat;
  }
  function initBanco() {
    const tabs = $$("#tabs [role=tab]");
    tabs.forEach((b) => b.addEventListener("click", () => {
      cat = b.dataset.cat;
      tabs.forEach((x) => { x.setAttribute("aria-selected", String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      renderGrid();
    }));
    $("#tabs").addEventListener("keydown", (e) => {
      const i = tabs.findIndex((x) => x.getAttribute("aria-selected") === "true");
      const j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -9;
      if (j === -9) return;
      const n = tabs[(j + tabs.length) % tabs.length]; n.focus(); n.click();
    });
    tabs.forEach((x, i) => { x.tabIndex = i === 0 ? 0 : -1; });
    $("#grid").addEventListener("click", (e) => {
      const c = e.target.closest("[data-cut]"); if (c) { openCut(c.dataset.cut); return; }
      const f = e.target.closest("[data-fry]");
      if (f) { const p = FRY.find((x) => x.id === f.dataset.fry); addLine({ key: p.id, kind: "fry", name: p.name, unit: p.pz, qty: 1, icon: p.icon }); toast(`${p.name} · aggiunto al vassoio`); }
    });
    renderGrid();
  }

  /* ---------------- taglia a peso: righello da trascinare ---------------- */
  const TK = 12; // px per 10 g
  const cut = { p: null, g: 200, drag: null };
  const gToX = (g) => -((g - G_MIN) / G_STEP) * TK;
  function buildRuler() {
    let h = "";
    for (let g = G_MIN; g <= G_MAX; g += G_STEP) h += `<span class="mo-tk${g % 50 ? "" : " l"}" data-g="${g}">${g % 100 ? "" : `<em>${g}</em>`}</span>`;
    $("#rulerScale").innerHTML = h;
    $("#ruler").setAttribute("aria-valuemin", G_MIN); $("#ruler").setAttribute("aria-valuemax", G_MAX);
  }
  function paintCut(gLive, snap) {
    const g = Math.round(gLive / G_STEP) * G_STEP;
    const sc = $("#rulerScale");
    sc.style.transition = snap && !reduce() ? "transform .2s cubic-bezier(.22,.61,.36,1)" : "none";
    sc.style.setProperty("--x", gToX(snap ? g : gLive) + "px");
    if (g === cut.g && !snap && cut.painted) return;
    cut.g = g; cut.painted = true;
    $$(".mo-tk", sc).forEach((t) => t.classList.toggle("on", +t.dataset.g <= g));
    const cm = g / G_PER_CM, price = (cut.p.kg * g) / 1000;
    $("#cutG").textContent = g;
    $("#cutEur").textContent = eur(price);
    $("#cutAdd").textContent = `Aggiungi · ${eur(price)}`;
    $("#cutCm").textContent = `${Math.round(cm)} cm`;
    $("#cutW").textContent = `≈ ${Math.round(cm)} cm × ${DEPTH_CM} cm`;
    $("#cutTeglia").style.setProperty("--w", Math.min(100, (cm / TRAY_CM) * 100).toFixed(2) + "%");
    const r = $("#ruler");
    r.setAttribute("aria-valuenow", g); r.setAttribute("aria-valuetext", `${g} grammi, ${eur(price)}`);
    $("#gMinus").disabled = g <= G_MIN; $("#gPlus").disabled = g >= G_MAX;
  }
  const clampG = (g) => Math.max(G_MIN, Math.min(G_MAX, g));
  function openCut(id) {
    const p = MENU.find((x) => x.id === id); if (!p || p.out) return;
    cut.p = p; cut.painted = false;
    $("#cutCat").textContent = ({ rosse: "Rossa", bianche: "Bianca", speciali: "Speciale" })[p.cat] + " · " + eur(p.kg) + " al kg";
    $("#cutName").textContent = p.name;
    $("#cutKg").textContent = eur(p.kg);
    const url = `url("assets/${p.img}.webp")`;
    $("#cutTeglia").style.setProperty("--img", url);
    $("#cutImg").style.backgroundImage = url;
    paintCut(200, true);
    openSheet($("#cutSheet"));
  }
  function initCut() {
    buildRuler();
    const r = $("#ruler");
    r.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      cut.drag = { x: e.clientX, g: cut.g, id: e.pointerId, moved: false };
      r.setPointerCapture(e.pointerId); r.classList.add("is-drag");
    });
    r.addEventListener("pointermove", (e) => {
      const d = cut.drag; if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x; if (Math.abs(dx) > 3) d.moved = true;
      // trascini il righello: verso sinistra = più grammi
      let g = d.g - (dx / TK) * G_STEP;
      if (g < G_MIN) g = G_MIN - (G_MIN - g) * 0.25; else if (g > G_MAX) g = G_MAX + (g - G_MAX) * 0.25; // resistenza ai bordi
      cut.live = g; paintCut(clampG(g), false);
      $("#rulerScale").style.setProperty("--x", gToX(g) + "px");
    });
    const end = (e) => {
      const d = cut.drag; if (!d || e.pointerId !== d.id) return;
      cut.drag = null; r.classList.remove("is-drag");
      if (!d.moved) { // tocco senza trascinare: salta al punto toccato
        const b = r.getBoundingClientRect();
        cut.live = cut.g + ((e.clientX - (b.left + b.width / 2)) / TK) * G_STEP;
      }
      paintCut(clampG(cut.live ?? cut.g), true); cut.live = null;
    };
    r.addEventListener("pointerup", end); r.addEventListener("pointercancel", end);
    r.addEventListener("keydown", (e) => {
      const m = { ArrowRight: G_STEP, ArrowUp: G_STEP, ArrowLeft: -G_STEP, ArrowDown: -G_STEP, PageUp: 50, PageDown: -50 };
      if (e.key in m) { e.preventDefault(); paintCut(clampG(cut.g + m[e.key]), true); }
      else if (e.key === "Home") { e.preventDefault(); paintCut(G_MIN, true); }
      else if (e.key === "End") { e.preventDefault(); paintCut(G_MAX, true); }
    });
    $("#gMinus").addEventListener("click", () => paintCut(clampG(cut.g - G_STEP), true));
    $("#gPlus").addEventListener("click", () => paintCut(clampG(cut.g + G_STEP), true));
    $("#cutAdd").addEventListener("click", () => {
      const p = cut.p;
      addLine({ key: p.id, kind: "slice", name: p.name, kg: p.kg, g: cut.g, img: p.img });
      closeSheet($("#cutSheet"));
      toast(`${p.name} · ${cut.g} g nel vassoio`);
    });
  }

  /* ---------------- vassoio: righe, minimo d'ordine, fascia di ritiro ---------------- */
  const tray = [];
  let slot = null;
  const lineTotal = (l) => (l.kind === "slice" ? (l.kg * l.g) / 1000 : l.unit * l.qty);
  const subtotal = () => tray.reduce((a, l) => a + lineTotal(l), 0);
  function addLine(n) {
    const old = tray.find((l) => l.key === n.key);
    if (old) { if (n.kind === "slice") old.g += n.g; else old.qty += n.qty; } else tray.push(n);
    renderTray(); bumpBadge();
  }
  function bumpBadge() {
    const b = $("#trayCount"), n = tray.length;
    b.textContent = n; b.classList.toggle("is-on", n > 0);
    b.classList.remove("is-bump"); void b.offsetWidth; if (n) b.classList.add("is-bump");
    $("#trayBtn").setAttribute("aria-label", `Apri il vassoio, ${n} ${n === 1 ? "articolo" : "articoli"}`);
  }
  function lineHtml(l, i) {
    const th = l.kind === "slice" ? `<span class="mo-line-th" style="background-image:url('assets/${l.img}.webp')"></span>`
      : l.kind === "fry" ? `<span class="mo-line-th">${ic(l.icon, "0 0 60 60")}</span>`
      : `<span class="mo-line-th" style="background:${l.bg}"></span>`;
    const meta = l.kind === "slice" ? `${eur(l.kg)} al kg · ≈ ${Math.round(l.g / G_PER_CM)} cm` : `${eur(l.unit)} cad.`;
    const q = l.kind === "slice" ? `${l.g} g` : `${l.qty}`;
    const what = l.kind === "slice" ? "50 grammi" : "un pezzo";
    return `<div class="mo-line" data-i="${i}">${th}<div><b>${esc(l.name)}</b><small>${meta}</small></div>
      <div class="mo-line-r"><strong>${eur(lineTotal(l))}</strong><span class="mo-step">
      <button type="button" data-dec aria-label="${esc(l.name)}: ${what} in meno">−</button><output>${q}</output>
      <button type="button" data-inc aria-label="${esc(l.name)}: ${what} in più">+</button></span></div></div>`;
  }
  function renderSlots() {
    const box = $("#slotChips"); if (!box) return;
    const list = pickupSlots();
    if (slot && !list.some((s) => s.m === slot)) slot = null;
    const first = list[0];
    const head = first && first.day ? `Ritiro · ${first.day}` : "Ritiro oggi";
    box.innerHTML = `<legend>${head} <small>(min. 20 minuti da adesso)</small></legend>` + list.map((s) =>
      `<button type="button" data-slot="${s.m}" aria-pressed="${s.m === slot}">${s.day && s.day !== (first && first.day) ? s.day.slice(0, 3) + " " : ""}${s.label}</button>`).join("");
  }
  function renderTray() {
    const body = $("#trayBody"); if (!body.firstChild) buildTray();
    const list = $("#trayList"), form = $("#trayForm");
    if (!tray.length) {
      list.innerHTML = `<div class="mo-empty"><span class="mo-critter" data-mascot="zen" aria-hidden="true"></span><p>Il vassoio è vuoto.<br>Scegli una teglia al banco e dicci quanti grammi.</p><a class="mo-btn" href="#banco" data-close>Vai al banco</a></div>`;
      mountMascots(list); kickGaze();
      $("#traySum").hidden = true; form.hidden = true; return;
    }
    list.innerHTML = tray.map(lineHtml).join("");
    const sub = subtotal(), miss = Math.max(0, MIN_ORDER - sub);
    $("#traySum").hidden = false; form.hidden = false;
    $("#traySum").innerHTML = `<div class="mo-sumrow"><span>Articoli</span><span>${tray.length}</span></div>
      <div class="mo-sumrow"><span>Pagamento</span><span>al banco, carta o contanti</span></div>
      <div class="mo-sumrow is-tot"><span>Totale</span><span id="trayTot">${eur(sub)}</span></div>
      <div class="mo-min"><i style="width:${Math.min(100, (sub / MIN_ORDER) * 100)}%"></i></div>
      <p class="mo-minline">${miss > 0 ? `Mancano ${eur(miss)} al minimo di ${eur(MIN_ORDER)} per prenotare il ritiro` : `Minimo raggiunto · peso esatto alla bilancia, ± 10 g`}</p>`;
    $("#trayDone").disabled = miss > 0;
  }
  function buildTray() {
    $("#trayBody").innerHTML = `<div class="mo-tray-list" id="trayList"></div><div class="mo-sum" id="traySum"></div>
      <form id="trayForm" novalidate><fieldset class="mo-chips" id="slotChips"></fieldset>
      <div class="mo-row2"><label class="mo-lab">Nome per il ritiro<input name="nome" autocomplete="given-name" placeholder="Es. Giulia"></label>
      <label class="mo-lab">Telefono<input name="tel" type="tel" autocomplete="tel" placeholder="333 123 4567"></label></div>
      <p class="mo-formmsg" id="trayMsg" role="status"></p>
      <button type="submit" class="mo-done" id="trayDone"><span>Conferma il ritiro</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button></form>`;
    $("#trayList").addEventListener("click", (e) => {
      const row = e.target.closest(".mo-line"); if (!row) return;
      const l = tray[+row.dataset.i], inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
      if (!inc && !dec) return;
      if (l.kind === "slice") l.g = inc ? Math.min(l.g + 50, 2000) : l.g - 50; else l.qty += inc ? 1 : -1;
      if ((l.kind === "slice" && l.g < G_MIN) || (l.kind !== "slice" && l.qty < 1)) { tray.splice(tray.indexOf(l), 1); toast(`${l.name} tolto dal vassoio`); }
      renderTray(); bumpBadge();
    });
    $("#slotChips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-slot]"); if (!b) return;
      slot = +b.dataset.slot; $("#slotChips").classList.remove("is-err");
      $$("[data-slot]", $("#slotChips")).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    });
    $("#trayForm").addEventListener("submit", submitTray);
  }

  /* conferma: la pillola si stringe, spunta, coriandoli di farina e pomodoro */
  function burst(x, y) {
    if (reduce()) return Promise.resolve();
    const c = document.createElement("canvas"); c.className = "mo-burst";
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; document.body.appendChild(c);
    const ctx = c.getContext("2d"); ctx.scale(dpr, dpr);
    const cols = ["#c4532f", "#3f7d4e", "#e8b04a", "#4a2a1f", "#f1e7db"];
    const P = Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2 + Math.random() * 0.3, v = 3.2 + Math.random() * 4.2;
      return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, r: 2 + Math.random() * 2.6, c: cols[i % cols.length], sq: i % 3 === 0 };
    });
    return new Promise((res) => {
      const t0 = performance.now();
      (function f(t) {
        const k = (t - t0) / 900;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        P.forEach((p) => {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy = p.vy * 0.94 + 0.22;
          ctx.globalAlpha = Math.max(0, 1 - k); ctx.fillStyle = p.c;
          if (p.sq) ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
        });
        if (k < 1) requestAnimationFrame(f); else { c.remove(); res(); }
      })(t0);
    });
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce() ? 0 : ms));
  async function submitTray(e) {
    e.preventDefault();
    const f = e.currentTarget, msg = $("#trayMsg"), btn = $("#trayDone");
    const nome = f.nome.value.trim(), tel = f.tel.value.replace(/[\s.-]/g, "");
    [f.nome, f.tel].forEach((x) => x.classList.remove("is-err"));
    let err = "";
    if (subtotal() < MIN_ORDER) err = `Il minimo per prenotare è ${eur(MIN_ORDER)}.`;
    else if (!slot) { err = "Scegli a che ora passi a ritirare."; $("#slotChips").classList.add("is-err"); }
    else if (nome.length < 2) { err = "Scrivi un nome: lo chiamiamo al banco."; f.nome.classList.add("is-err"); f.nome.focus(); }
    else if (!/^\+?\d{8,13}$/.test(tel)) { err = "Il numero di telefono non sembra giusto."; f.tel.classList.add("is-err"); f.tel.focus(); }
    msg.textContent = err; msg.className = "mo-formmsg" + (err ? " is-err" : "");
    if (err || btn.dataset.busy) return;
    btn.dataset.busy = "1";
    const s = pickupSlots(40).find((x) => x.m === slot);
    const code = "M-" + String(100 + Math.floor(Math.random() * 900));
    btn.classList.add("is-press"); await wait(120);
    btn.classList.add("is-round"); await wait(380);
    btn.classList.add("is-tick"); await wait(260);
    const r = btn.getBoundingClientRect(); await burst(r.left + r.width / 2, r.top + r.height / 2);
    const tot = subtotal();
    tray.length = 0; slot = null; bumpBadge();
    $("#trayBody").innerHTML = `<div class="mo-okcard" id="trayOk"><span class="mo-critter" data-mascot="zen" aria-hidden="true" style="position:relative;width:110px;height:110px"></span>
      <p class="mo-kicker">Prenotato · ${esc(nome)}</p><b>${code}</b>
      <p>Ritiro ${s && s.day ? s.day + " " : "oggi "}alle ${s ? s.label : ""} · ${eur(tot)} da pagare al banco.<br>Il peso esatto lo vedi sulla bilancia.</p>
      <button type="button" class="mo-btn" data-close>Perfetto</button></div>`;
    mountMascots($("#trayBody")); kickGaze();
    $("#tray").onclosed = () => { $("#tray").onclosed = null; $("#trayBody").innerHTML = ""; renderTray(); };
  }
  function openTray() { renderTray(); renderSlots(); openSheet($("#tray")); }

  /* ---------------- bottega: scaffale a scatti + barra ---------------- */
  const ART = {
    sack: (p) => `<svg viewBox="0 0 120 140"><path d="M30 30 q30 -14 60 0 l8 92 q-38 12 -76 0Z" fill="#fbf6ef" stroke="#4a2a1f" stroke-width="1.6"/><path d="M30 30 q30 10 60 0" fill="none" stroke="#4a2a1f" stroke-width="1.6"/><path d="M44 22 q16 -10 32 0" fill="none" stroke="#4a2a1f" stroke-width="1.6"/><text x="60" y="78" text-anchor="middle" font-family="Fredoka" font-size="14" fill="#4a2a1f">mollica</text><text x="60" y="96" text-anchor="middle" font-family="Quicksand" font-weight="700" font-size="8.5" letter-spacing="1.5" fill="#c4532f">${p.label}</text></svg>`,
    jar: () => `<svg viewBox="0 0 120 140"><rect x="34" y="34" width="52" height="16" rx="4" fill="#c4532f" stroke="#4a2a1f" stroke-width="1.6"/><path d="M30 54 h60 v62 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10Z" fill="#fbf6ef" stroke="#4a2a1f" stroke-width="1.6"/><path d="M36 92 q24 -14 48 0 v26 h-48Z" fill="#e8d3b4"/><text x="60" y="80" text-anchor="middle" font-family="Fredoka" font-size="11" fill="#4a2a1f">madre</text></svg>`,
    pan: () => `<svg viewBox="0 0 120 140"><g transform="rotate(-8 60 70)"><rect x="14" y="44" width="92" height="56" rx="5" fill="#3e5566" stroke="#26343f" stroke-width="1.6"/><rect x="22" y="52" width="76" height="40" rx="3" fill="#536f82"/><path d="M28 60 h64 M28 70 h64 M28 80 h64" stroke="#6d889b" stroke-width="1"/></g></svg>`,
    apron: () => `<svg viewBox="0 0 120 140"><path d="M42 20 q18 12 36 0 M42 20 l2 26 h32 l2 -26" fill="none" stroke="#4a2a1f" stroke-width="1.6"/><path d="M44 46 h32 l14 16 q-4 40 0 62 h-74 q4 -22 0 -62Z" fill="#fbf6ef" stroke="#4a2a1f" stroke-width="1.6"/><rect x="48" y="78" width="24" height="18" rx="3" fill="none" stroke="#c4532f" stroke-width="1.4"/><path d="M30 62 l-14 6 M90 62 l14 6" stroke="#4a2a1f" stroke-width="1.6"/></svg>`,
    gift: () => `<svg viewBox="0 0 120 140"><rect x="14" y="40" width="92" height="60" rx="8" fill="#fbf6ef" stroke="#4a2a1f" stroke-width="1.6"/><text x="26" y="62" font-family="Fredoka" font-size="13" fill="#4a2a1f">mollica</text><text x="26" y="88" font-family="Quicksand" font-weight="600" font-size="9" letter-spacing="1" fill="#c4532f">CARTA REGALO</text><circle cx="90" cy="84" r="8" fill="none" stroke="#4a2a1f" stroke-width="1.4"/></svg>`,
  };
  function initShop() {
    $("#shopItems").innerHTML = SHOP.map((p) => `<article class="mo-prod" data-id="${p.id}">
      <div class="mo-prod-art" style="background:${p.bg}">${ART[p.art](p)}</div>
      <h3>${esc(p.name)}</h3><p class="mo-pp">${p.amounts ? "da " : ""}<span data-pp>${eur(p.price)}</span> · ${esc(p.meta)}</p>
      ${p.amounts ? `<div class="mo-prod-row" role="group" aria-label="Importo">${p.amounts.map((a, i) => `<button type="button" class="mo-amt" data-amt="${a}" aria-pressed="${i === 0}">€${a}</button>`).join("")}</div>` : ""}
      <button type="button" class="mo-cutbtn" data-buy="${p.id}">+ Nel vassoio</button></article>`).join("");
    const shelf = $("#shelf");
    shelf.addEventListener("click", (e) => {
      const a = e.target.closest("[data-amt]");
      if (a) {
        const card = a.closest(".mo-prod");
        $$("[data-amt]", card).forEach((x) => x.setAttribute("aria-pressed", String(x === a)));
        card.querySelector("[data-pp]").textContent = eur(+a.dataset.amt);
        return;
      }
      const b = e.target.closest("[data-buy]"); if (!b) return;
      const p = SHOP.find((x) => x.id === b.dataset.buy);
      const sel = b.closest(".mo-prod").querySelector('[data-amt][aria-pressed="true"]');
      const price = sel ? +sel.dataset.amt : p.price;
      const name = sel ? `${p.name} ${eur(price)}` : p.name;
      addLine({ key: p.id + (sel ? "-" + price : ""), kind: "shop", name, unit: price, qty: 1, bg: p.bg });
      toast(`${name} · nel vassoio`);
    });
    const prog = $("#shelfProg"), prev = $("#shopPrev"), next = $("#shopNext");
    const paint = () => {
      const max = shelf.scrollWidth - shelf.clientWidth, w = shelf.clientWidth / shelf.scrollWidth;
      const k = max > 0 ? shelf.scrollLeft / max : 0;
      prog.style.width = (w * 100).toFixed(2) + "%";
      prog.style.transform = `translateX(${((k * (1 - w)) / w * 100).toFixed(2)}%)`;
      prev.disabled = shelf.scrollLeft <= 2; next.disabled = shelf.scrollLeft >= max - 2;
    };
    const step = () => (shelf.querySelector(".mo-prod")?.offsetWidth || 260) + 20;
    prev.addEventListener("click", () => shelf.scrollBy({ left: -step(), behavior: reduce() ? "auto" : "smooth" }));
    next.addEventListener("click", () => shelf.scrollBy({ left: step(), behavior: reduce() ? "auto" : "smooth" }));
    shelf.addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint);
    shelf.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") next.click(); if (e.key === "ArrowLeft") prev.click(); });
    paint();
  }

  /* ---------------- laboratorio: la card si apre a tutto schermo ---------------- */
  function initCorsi() {
    const sec = $("#corsi"), stage = $("#corsiStage");
    let raf = 0;
    const paint = () => {
      raf = 0;
      if (reduce()) { stage.style.setProperty("--p", "1"); return; }
      const r = sec.getBoundingClientRect(), travel = r.height - stage.offsetHeight;
      const headh = stage.offsetTop >= 0 ? parseFloat(getComputedStyle(stage).top) || 0 : 0;
      // si apre nel primo 55% del percorso, poi resta a schermo pieno
      const p = Math.max(0, Math.min(1, (headh - r.top + innerHeight * 0.35) / (travel * 0.55 + innerHeight * 0.35)));
      stage.style.setProperty("--p", p.toFixed(4));
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener("scroll", kick, { passive: true }); addEventListener("resize", kick);
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change", kick);
    paint();
  }

  /* ---------------- prenotazione laboratorio ---------------- */
  const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const corso = { date: null, seats: 0, n: 2 };
  function initCorso() {
    const now = romeNow(), toSat = (6 - now.dow + 7) % 7 || 7, SEATS = [3, 8, 0, 6];
    const box = $("#corsoDates");
    box.innerHTML = "<legend>Sabato, dalle 15:00 alle 18:00</legend>" + SEATS.map((s, i) => {
      const d = new Date(Date.UTC(now.y, now.mo - 1, now.d + toSat + i * 7));
      const lab = `${d.getUTCDate()} ${MESI[d.getUTCMonth()]}`;
      return `<button type="button" data-seats="${s}" data-lab="sabato ${lab}" aria-pressed="false" ${s ? "" : "disabled"}>${lab} · ${s ? (s < 4 ? `${s} posti` : "libero") : "completo"}</button>`;
    }).join("");
    const out = $("#pOut"), sub = $("#corsoSubmit"), msg = $("#corsoMsg");
    const paint = () => {
      out.textContent = corso.n;
      sub.textContent = `Prenota · ${eur(65 * corso.n).replace(",00", "")}`;
      $("#pMinus").disabled = corso.n <= 1;
      $("#pPlus").disabled = corso.n >= (corso.date ? corso.seats : 8);
    };
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-seats]"); if (!b || b.disabled) return;
      corso.date = b.dataset.lab; corso.seats = +b.dataset.seats; box.classList.remove("is-err");
      if (corso.n > corso.seats) { corso.n = corso.seats; msg.textContent = `Per questa data restano ${corso.seats} posti.`; msg.className = "mo-formmsg"; }
      $$("[data-seats]", box).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      paint();
    });
    $("#pMinus").addEventListener("click", () => { corso.n = Math.max(1, corso.n - 1); paint(); });
    $("#pPlus").addEventListener("click", () => { corso.n = Math.min(corso.date ? corso.seats : 8, corso.n + 1); paint(); });
    $("#corsoOpen").addEventListener("click", () => openSheet($("#corsoSheet")));
    $("#corsoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const em = e.currentTarget.email, ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em.value.trim());
      em.classList.remove("is-err");
      let err = "";
      if (!corso.date) { err = "Scegli un sabato."; box.classList.add("is-err"); }
      else if (!ok) { err = "Serve un’email valida per mandarti la conferma."; em.classList.add("is-err"); em.focus(); }
      msg.textContent = err; msg.className = "mo-formmsg" + (err ? " is-err" : "");
      if (err) return;
      msg.textContent = `Fatto: ${corso.n} ${corso.n === 1 ? "posto" : "posti"} per ${corso.date}. Ti scriviamo a ${em.value.trim()}.`;
      msg.className = "mo-formmsg is-ok";
      toast(`Laboratorio prenotato · ${corso.date}`);
      const b = $(`[data-lab="${corso.date}"]`, box), left = corso.seats - corso.n;
      b.dataset.seats = left; corso.seats = left;
      b.textContent = `${corso.date.replace("sabato ", "")} · ${left ? `${left} posti` : "completo"}`;
      if (!left) { b.disabled = true; b.setAttribute("aria-pressed", "false"); corso.date = null; }
      corso.n = Math.min(corso.n, Math.max(1, left)); paint();
      setTimeout(() => { if (stack.includes($("#corsoSheet"))) closeSheet($("#corsoSheet")); }, reduce() ? 1200 : 1800);
    });
    $("#corsoSheet").onclosed = () => { msg.textContent = ""; msg.className = "mo-formmsg"; };
    paint();
  }

  /* ---------------- newsletter ---------------- */
  function initNews() {
    const f = $("#newsForm"), msg = $("#newsMsg"), field = $(".mo-field", f);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.value.trim());
      field.classList.toggle("is-err", !ok);
      let err = !ok ? "Controlla l’indirizzo email." : !f.ok.checked ? "Spunta la casella della privacy per iscriverti." : "";
      msg.textContent = err || "Iscritto. La prima mail arriva con la teglia di stagione.";
      msg.className = "mo-formmsg " + (err ? "is-err" : "is-ok");
      if (!err) f.reset();
    });
  }

  /* testata: trasparente finché c'è sotto la foto del primo piano */
  function paintHead() {
    const head = $("#head"), hero = $(".mo-hero");
    const over = hero.getBoundingClientRect().bottom > head.offsetHeight + 8 && !$("#drawer").classList.contains("is-open");
    head.classList.toggle("is-over", over);
  }

  /* ---------------- avvio ---------------- */
  function init() {
    mountMascots(); mountRibbon(); initDrawer(); initBanco(); initCut(); initShop(); initCorsi(); initCorso(); initNews();
    paintHead(); addEventListener("scroll", paintHead, { passive: true }); addEventListener("resize", paintHead);
    $("#burger").addEventListener("click", paintHead);
    $("#trayBtn").addEventListener("click", openTray);
    $("#scrim").addEventListener("click", () => closeSheet());
    bumpBadge(); paintStatus(); lookAll(); blinkLoop();
    setInterval(() => { paintStatus(); if (stack.includes($("#tray"))) renderSlots(); }, 30000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
