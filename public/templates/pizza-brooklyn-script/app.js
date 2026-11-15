/* Bandita Pizza Club — Bergamo. Template by MindStudio. Plain JS, no libraries. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const later = (ms, fn) => setTimeout(fn, reduce ? 0 : ms);
  const euro = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const pad = (n) => String(n).padStart(2, "0");
  const fmtMin = (m) => pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* storage: in the sandboxed iframe localStorage throws on access → fall back to memory */
  const mem = {};
  const store = {
    get(k) { try { const v = window.localStorage.getItem(k); return v == null ? mem[k] : v; } catch (e) { return mem[k]; } },
    set(k, v) { mem[k] = v; try { window.localStorage.setItem(k, v); } catch (e) { /* sandbox */ } },
  };

  /* toast */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 3200);
  }

  /* ================= time in Rome ================= */
  const DOW_EN = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const DAY_IT = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAY_AB = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
  let FAKE = null; // test hook
  const romeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" });
  function romeNow() {
    const p = {}; romeFmt.formatToParts(FAKE || new Date()).forEach((x) => { p[x.type] = x.value; });
    const h = +p.hour % 24;
    return { dow: DOW_EN[p.weekday], min: h * 60 + +p.minute, date: `${p.year}-${p.month}-${p.day}` };
  }
  const addDays = (str, k) => { const [y, m, d] = str.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + k)).toISOString().slice(0, 10); };
  const dowOf = (str) => new Date(str + "T12:00:00Z").getUTCDay();
  const itDate = (str, o = { weekday: "short", day: "numeric", month: "short" }) => new Intl.DateTimeFormat("it-IT", { ...o, timeZone: "UTC" }).format(new Date(str + "T12:00:00Z"));

  /* ================= locations ================= */
  // minutes from midnight; a close > 1440 runs past midnight into the next day
  const LOCS = [
    { id: "borgo", name: "Borgo Palazzo", type: "full", addr: "Via Borgo Palazzo 118", phone: "+39 035 018 4411",
      hours: { 1: [[1110, 1410]], 2: [[1110, 1410]], 3: [[1110, 1410]], 4: [[1110, 1410]], 5: [[1110, 1500]], 6: [[720, 900], [1110, 1500]], 0: [[720, 930], [1110, 1380]] },
      note: "Il venerdì e il sabato DJ set dalle 22:00.", tabs: [["rosse", "Cena"], ["condividere", "Da condividere"], ["bere", "Da bere"]] },
    { id: "alta", name: "Città Alta", type: "full", addr: "Largo della Fara 4", phone: "+39 035 018 4422",
      hours: { 1: [], 2: [[1140, 1380]], 3: [[1140, 1380]], 4: [[1140, 1380]], 5: [[720, 900], [1140, 1440]], 6: [[720, 960], [1140, 1440]], 0: [[720, 960], [1140, 1380]] },
      note: "Brunch il sabato e la domenica fino alle 16:00.", tabs: [["bianche", "Cena"], ["dolci", "Dolci"], ["bere", "Da bere"]] },
    { id: "stazione", name: "Trancio · Stazione", type: "out", addr: "Piazzale Marconi 9", phone: "+39 035 018 4433",
      hours: { 1: [[660, 1320]], 2: [], 3: [[660, 1320]], 4: [[660, 1320]], 5: [[660, 1500]], 6: [[660, 1500]], 0: [[660, 1320]] },
      note: "Solo asporto: tranci al banco, niente prenotazioni.", tabs: [["trancio", "Menu del trancio"]] },
  ];
  const locById = (id) => LOCS.find((l) => l.id === id);

  function statusOf(loc, t = romeNow()) {
    const today = loc.hours[t.dow] || [], yest = loc.hours[(t.dow + 6) % 7] || [];
    for (const [, b] of yest) if (b > 1440 && t.min < b - 1440) return { open: true, left: b - 1440 - t.min, until: b };
    for (const [a, b] of today) if (t.min >= a && t.min < b) return { open: true, left: b - t.min, until: b };
    for (let k = 0; k < 8; k++) {
      const d = (t.dow + k) % 7;
      for (const [a] of loc.hours[d] || []) if (k > 0 || a > t.min) return { open: false, k, d, at: a };
    }
    return { open: false };
  }
  function statusText(s) {
    if (s.open) return s.left <= 30 ? `Chiude tra poco · alle ${fmtMin(s.until)}` : `Aperto ora · chiude alle ${fmtMin(s.until)}`;
    if (s.k === undefined) return "Chiuso";
    const when = s.k === 0 ? "oggi" : s.k === 1 ? "domani" : DAY_IT[s.d];
    return `Chiuso · apre ${when} alle ${fmtMin(s.at)}`;
  }
  const statusCls = (s) => (s.open ? (s.left <= 30 ? "is-soon" : "is-open") : "");

  function renderLocs() {
    const t = romeNow();
    const card = (l) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      const rows = order.map((d) => {
        const r = l.hours[d] || [];
        const txt = r.length ? r.map(([a, b]) => `${fmtMin(a)}—${fmtMin(b)}`).join(" · ") : "Chiuso";
        return `<li class="${d === t.dow ? "is-today" : ""}"><b>${DAY_AB[d]}${d === t.dow ? " · oggi" : ""}</b><span>${txt}</span></li>`;
      }).join("");
      const book = l.type === "full" ? `<button class="bd-btn bd-btn--ink bd-btn--lg bd-btn--full" type="button" data-open="book" data-loc="${l.id}">Prenota un tavolo</button>` : "";
      const small = l.tabs.map(([tab, lab]) => `<button type="button" data-tab="${tab}">${lab}</button>`).join("");
      return `<article class="bd-loc" data-loc="${l.id}">
        <div class="bd-loc-bar"><h4>${esc(l.name)}</h4><span class="bd-loc-st" data-st="${l.id}"><i></i><span></span></span></div>
        <ul class="bd-loc-rows"><li><b>Indirizzo</b><span>${esc(l.addr)}</span></li><li><b>Telefono</b><span>${esc(l.phone)}</span></li><li class="bd-gap"></li>${rows}</ul>
        <p class="bd-loc-note">${esc(l.note)}</p>
        <div class="bd-loc-acts">${book}<div class="bd-loc-small">${small}</div></div></article>`;
    };
    $("#locFull").innerHTML = LOCS.filter((l) => l.type === "full").map(card).join("");
    $("#locOut").innerHTML = LOCS.filter((l) => l.type === "out").map(card).join("") +
      `<article class="bd-loc bd-loc--info"><div class="bd-loc-bar"><h4>Forno mobile</h4></div><ul class="bd-loc-rows"><li><b>Dove</b><span>Lombardia</span></li><li><b>Da</b><span>40 persone</span></li><li><b>Prenota</b><span>con 3 giorni</span></li></ul><p class="bd-loc-note">Il nostro furgone con il forno a legna arriva in cortile, in cascina, in ufficio.</p><div class="bd-loc-acts"><button class="bd-btn bd-btn--ink bd-btn--lg bd-btn--full" type="button" data-open="catering">Chiedi un preventivo</button></div></article>`;
    paintStatus();
  }
  function paintStatus() {
    const t = romeNow();
    LOCS.forEach((l) => {
      const s = statusOf(l, t), txt = statusText(s);
      $$(`[data-st="${l.id}"]`).forEach((el) => { el.className = "bd-loc-st " + statusCls(s); el.querySelector("span").textContent = s.open ? (s.left <= 30 ? "Chiude tra poco" : "Aperto ora") : "Chiuso"; el.title = txt; });
      $$(`[data-status="${l.id}"]`).forEach((el) => {
        const span = el.querySelector("span");
        if (span) { span.textContent = `${l.name}: ${txt}`; el.className = "bd-pill " + statusCls(s); }
        else el.textContent = `${l.name} — ${txt}`;
      });
    });
  }

  /* ================= menu ================= */
  const CATS = [["rosse", "Pizze rosse"], ["bianche", "Pizze bianche"], ["condividere", "Da condividere"], ["trancio", "Al trancio"], ["dolci", "Dolci"], ["bere", "Da bere"]];
  // f: v = vegetariano, h = piccante, n = novità
  const MENU = {
    rosse: [
      ["Margherita del Borgo", "San Marzano, fiordilatte, basilico, olio del Garda", 9, "v"],
      ["Bandita", "Pomodoro, salame piccante, miele al peperoncino, pecorino", 13, "h"],
      ["Marinara notturna", "Pomodoro, aglio nero, origano di Pantelleria, capperi", 8, "v"],
      ["Bergamasca", "Pomodoro, salsiccia nostrana, cime di rapa, provola affumicata", 13, ""],
      ["Diavolo biondo", "Pomodoro giallo, 'nduja, stracciatella, scorza di limone", 14, "hn"],
      ["Funghi di Valle", "Pomodoro, funghi misti trifolati, taleggio, timo", 13, "v"],
    ],
    bianche: [
      ["Strachitunt", "Fiordilatte, strachitunt, pere cotte nel vino, noci", 14, "v"],
      ["Lardo e patate", "Fiordilatte, patate a velo, lardo, rosmarino", 12, ""],
      ["Verde", "Crema di zucchine, stracciatella, menta, pistacchio", 13, "vn"],
      ["Vongole e limone", "Vongole, aglio, prezzemolo, scorza di limone, peperoncino", 16, "hn"],
      ["Formai de mut", "Formaggi delle valli, miele di castagno, pepe nero", 13, "v"],
    ],
    condividere: [
      ["Polpette della zia Tina", "Al sugo, con pane bruciacchiato dal forno", 9, ""],
      ["Burrata e pomodori arrosto", "Pomodorini confit, basilico, pane carasau", 11, "v"],
      ["Carciofi fritti", "Maionese al limone e sale affumicato", 9, "v"],
      ["Salumi di casa", "Stagionati da noi, con gnocco fritto", 15, ""],
      ["Insalata Bandita", "Radicchio, mela, noci, grana, aceto di mele", 10, "vn"],
      ["Ali al miele piccante", "Cotte nel forno a legna, salsa allo yogurt", 10, "h"],
    ],
    trancio: [
      ["Trancio rosso", "Pomodoro e origano, alta e soffice", 3.5, "v"],
      ["Trancio margherita", "Pomodoro, fiordilatte, basilico", 4, "v"],
      ["Trancio Bandita", "Salame piccante e miele al peperoncino", 4.5, "h"],
      ["Trancio del giorno", "Chiedi al banco: cambia ogni mattina", 4.5, "n"],
      ["Due tranci + bibita", "Qualsiasi trancio e una soda di casa", 10, ""],
    ],
    dolci: [
      ["Tiramisù in barattolo", "Savoiardi, caffè della moka, mascarpone", 7, "v"],
      ["Soft serve fiordilatte", "Con olio extravergine e sale in fiocchi", 6, "v"],
      ["Torta di polenta", "Mandorle, burro nocciola, crema inglese", 7, "vn"],
      ["Cannolo al pistacchio", "Riempito al momento", 6, "v"],
    ],
    bere: [
      ["Bandita Lager 0,4", "Birra chiara di casa, prodotta in Val Seriana", 6, ""],
      ["Spritz al bitter bergamasco", "Bitter locale, prosecco, soda", 8, ""],
      ["Negroni sbagliato", "Con lo spumante della Franciacorta", 9, ""],
      ["Valcalepio rosso, calice", "Il vino rosso di casa nostra", 7, ""],
      ["Soda al limone", "Fatta in casa, poco zucchero", 4, "n"],
    ],
  };
  const mState = { cat: "rosse", f: new Set() };
  function renderTabs() {
    $("#menuTabs").innerHTML = CATS.map(([id, lab]) => `<button class="bd-tab" type="button" role="tab" id="tab-${id}" data-cat="${id}" aria-selected="${id === mState.cat}" tabindex="${id === mState.cat ? 0 : -1}">${lab}</button>`).join("");
  }
  function renderMenu() {
    $$(".bd-tab").forEach((b) => { const on = b.dataset.cat === mState.cat; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    $("#menuCard").setAttribute("aria-labelledby", "tab-" + mState.cat);
    $("#menuBar").textContent = CATS.find((c) => c[0] === mState.cat)[1];
    const want = [...mState.f].map((f) => ({ veg: "v", hot: "h", new: "n" }[f]));
    const items = MENU[mState.cat].filter((it) => want.every((w) => it[3].includes(w)));
    $("#menuList").innerHTML = items.map((it, i) => {
      const tags = (it[3].includes("v") ? `<span class="bd-tag" title="Vegetariano">V</span>` : "") + (it[3].includes("h") ? `<span class="bd-tag bd-tag--hot" title="Piccante">P</span>` : "") + (it[3].includes("n") ? `<span class="bd-tag bd-tag--new">Nuova</span>` : "");
      return `<li class="bd-mi" style="--i:${i}"><div class="bd-mi-top"><span class="bd-mi-name">${esc(it[0])}${tags}</span><span class="bd-mi-price">${euro(it[2]).replace(",00", "")}</span></div><p class="bd-mi-desc">${esc(it[1])}</p></li>`;
    }).join("");
    $("#menuEmpty").hidden = items.length > 0;
    $("#menuCount").textContent = mState.f.size ? `${items.length} di ${MENU[mState.cat].length}` : "";
  }
  function setCat(cat, focus) { mState.cat = cat; renderMenu(); if (focus) $("#tab-" + cat).focus(); }
  function bindMenu() {
    $("#menuTabs").addEventListener("click", (e) => { const b = e.target.closest(".bd-tab"); if (b) setCat(b.dataset.cat); });
    $("#menuTabs").addEventListener("keydown", (e) => {
      const i = CATS.findIndex((c) => c[0] === mState.cat);
      if (e.key === "ArrowRight") { e.preventDefault(); setCat(CATS[(i + 1) % CATS.length][0], true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setCat(CATS[(i + CATS.length - 1) % CATS.length][0], true); }
    });
    $("#menuFilters").addEventListener("click", (e) => {
      const b = e.target.closest(".bd-chip"); if (!b) return;
      const f = b.dataset.filter; mState.f.has(f) ? mState.f.delete(f) : mState.f.add(f);
      b.setAttribute("aria-pressed", mState.f.has(f)); renderMenu();
    });
  }

  /* ================= nav, header, scroll helpers ================= */
  function goTo(id) {
    const el = document.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  const head = $("#head"), hero = $(".bd-hero");
  function onScrollHead() { head.classList.toggle("is-scrolled", window.scrollY > hero.offsetHeight - 110); }

  const drawer = $("#drawer"), scrim = $("#scrim"), burger = $("#burger");
  function openDrawer() {
    scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("is-on"));
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); burger.setAttribute("aria-expanded", "true");
    setTimeout(() => $("#drawerClose").focus(), 30);
  }
  function closeDrawer(noFocus) {
    scrim.classList.remove("is-on"); drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); burger.setAttribute("aria-expanded", "false");
    setTimeout(() => { scrim.hidden = true; }, 260);
    if (!noFocus) burger.focus();
  }

  /* ================= modals ================= */
  const openStack = [];
  let lastFocus = null;
  function openModal(id) {
    const m = $("#m-" + id); if (!m || !m.hidden) return;
    if (drawer.classList.contains("is-open")) closeDrawer(true);
    lastFocus = document.activeElement;
    m.hidden = false; document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add("is-on")));
    openStack.push(id);
    setTimeout(() => { const f = m.querySelector("input:not([type=radio]), button.bd-x"); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeModal(id) {
    const m = $("#m-" + id); if (!m || m.hidden) return;
    m.classList.remove("is-on");
    const i = openStack.indexOf(id); if (i > -1) openStack.splice(i, 1);
    setTimeout(() => { m.hidden = true; if (!openStack.length && !cartOpen) document.documentElement.style.overflow = ""; }, reduce ? 0 : 230);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ================= booking ================= */
  const BOOK = { loc: "borgo", date: null, pp: 2, slot: null };
  function slotsFor(loc, dateStr) {
    const out = [];
    for (const [a, b] of loc.hours[dowOf(dateStr)] || []) {
      const last = Math.min(b - 90, 1350); // last seating 90' before close and never after 22:30
      for (let m = a; m <= last; m += 30) out.push(m);
    }
    return out;
  }
  // deterministic "already full" slots, so the grid looks lived-in but stays stable
  const isFull = (loc, d, m) => { let h = 7; for (const c of loc + d + m) h = (h * 31 + c.charCodeAt(0)) % 997; return h % 7 === 0; };
  function availableSlots(locId, dateStr) {
    const loc = locById(locId), t = romeNow();
    return slotsFor(loc, dateStr).map((m) => ({ m, ok: !(dateStr === t.date && m <= t.min + 30) && !isFull(locId, dateStr, m), full: isFull(locId, dateStr, m) }));
  }
  function firstBookableDate(locId) {
    const t = romeNow();
    for (let k = 0; k < 14; k++) { const d = addDays(t.date, k); if (availableSlots(locId, d).some((s) => s.ok)) return d; }
    return t.date;
  }
  function renderBookLoc() {
    $("#bookLoc").innerHTML = `<legend>Sede</legend>` + LOCS.filter((l) => l.type === "full").map((l) => `<label><input type="radio" name="bloc" value="${l.id}" ${l.id === BOOK.loc ? "checked" : ""}><span>${esc(l.name)}</span></label>`).join("");
  }
  function renderSlots() {
    const box = $("#bookSlots"); box.classList.remove("is-bad");
    const t = romeNow(), d = BOOK.date;
    if (!d || d < t.date) { box.innerHTML = `<p class="bd-slots-msg">Scegli un giorno da oggi in avanti.</p>`; BOOK.slot = null; return; }
    const slots = availableSlots(BOOK.loc, d);
    if (!slots.length) { box.innerHTML = `<p class="bd-slots-msg">${esc(locById(BOOK.loc).name)} è chiusa ${itDate(d, { weekday: "long" })}. Prova un altro giorno.</p>`; BOOK.slot = null; return; }
    if (!slots.some((s) => s.ok)) { box.innerHTML = `<p class="bd-slots-msg">Per oggi non ci sono più orari prenotabili. Prova domani.</p>`; BOOK.slot = null; return; }
    if (BOOK.slot != null && !slots.some((s) => s.ok && s.m === BOOK.slot)) BOOK.slot = null;
    box.innerHTML = slots.map((s) => `<button type="button" class="bd-slot-b" role="radio" data-m="${s.m}" aria-checked="${s.m === BOOK.slot}" ${s.ok ? "" : "disabled"} title="${s.full ? "Completo" : s.ok ? "" : "Non più disponibile"}">${fmtMin(s.m)}</button>`).join("");
  }
  function renderPP() {
    $("#ppOut").textContent = BOOK.pp;
    $("#ppMinus").disabled = BOOK.pp <= 1; $("#ppPlus").disabled = BOOK.pp >= 8;
    $("#ppHint").innerHTML = BOOK.pp >= 8 ? `Più di 8 persone? Per i gruppi c'è la <button type="button" class="bd-linkbtn" data-open="catering" style="text-decoration:underline;font-weight:700">festa in pizzeria</button>.` : "";
  }
  function resetBook(locId) {
    BOOK.loc = locId || BOOK.loc; BOOK.slot = null;
    const t = romeNow();
    const inp = $("#bookDate"); inp.min = t.date; inp.max = addDays(t.date, 60);
    BOOK.date = firstBookableDate(BOOK.loc); inp.value = BOOK.date;
    $("#bookForm").hidden = false; $("#bookDone").hidden = true; $("#bookErr").textContent = "";
    $$("#bookForm .is-bad").forEach((e) => e.classList.remove("is-bad"));
    renderBookLoc(); renderSlots(); renderPP();
  }
  function bindBook() {
    $("#bookLoc").addEventListener("change", (e) => { BOOK.loc = e.target.value; const cur = $("#bookDate").value; BOOK.date = cur && availableSlots(BOOK.loc, cur).some((x) => x.ok) ? cur : firstBookableDate(BOOK.loc); $("#bookDate").value = BOOK.date; renderSlots(); });
    $("#bookDate").addEventListener("change", (e) => { BOOK.date = e.target.value; renderSlots(); });
    $("#bookSlots").addEventListener("click", (e) => { const b = e.target.closest(".bd-slot-b"); if (!b || b.disabled) return; BOOK.slot = +b.dataset.m; $$(".bd-slot-b").forEach((x) => x.setAttribute("aria-checked", x === b)); $("#bookSlots").classList.remove("is-bad"); });
    $("#ppMinus").addEventListener("click", () => { BOOK.pp = Math.max(1, BOOK.pp - 1); renderPP(); });
    $("#ppPlus").addEventListener("click", () => { BOOK.pp = Math.min(8, BOOK.pp + 1); renderPP(); });
    $("#bookForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target, errs = [];
      const name = f.elements.fullname.value.trim(), phone = f.phone.value.trim();
      $$(".is-bad", f).forEach((x) => x.classList.remove("is-bad"));
      if (BOOK.slot == null) { errs.push("scegli un orario"); $("#bookSlots").classList.add("is-bad"); }
      if (name.length < 2) { errs.push("scrivi il tuo nome"); f.elements.fullname.classList.add("is-bad"); }
      if (!/^\+?[\d\s]{8,16}$/.test(phone) || phone.replace(/\D/g, "").length < 8) { errs.push("controlla il telefono"); f.phone.classList.add("is-bad"); }
      if (errs.length) { $("#bookErr").textContent = "Quasi: " + errs.join(", ") + "."; return; }
      $("#bookErr").textContent = "";
      const code = "BD-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const loc = locById(BOOK.loc);
      const done = $("#bookDone");
      done.innerHTML = `<h4>Tavolo prenotato!</h4><p>Ti abbiamo mandato un SMS di conferma. Se fai tardi più di 15 minuti, chiamaci.</p>
        <dl><dt>Codice</dt><dd class="bd-code">${code}</dd><dt>Sede</dt><dd>${esc(loc.name)}, ${esc(loc.addr)}</dd><dt>Quando</dt><dd>${itDate(BOOK.date, { weekday: "long", day: "numeric", month: "long" })}, ${fmtMin(BOOK.slot)}</dd><dt>Persone</dt><dd>${BOOK.pp}</dd><dt>Nome</dt><dd>${esc(name)}</dd></dl>
        ${stampSVG("CONFERMATO", "BANDITA PIZZA CLUB · BERGAMO · ", itDate(BOOK.date, { day: "2-digit", month: "short" }).toUpperCase(), 15)}
        <button class="bd-btn bd-btn--ink bd-btn--lg bd-btn--full" type="button" data-close="book">Fatto</button>`;
      f.hidden = true; done.hidden = false;
      f.reset(); BOOK.pp = 2;
      landStamp(done.querySelector(".bd-stamp"), done);
      done.querySelector(".bd-btn").focus({ preventScroll: true });
    });
  }

  /* ================= stamp (receipt-print-stamp) ================= */
  let stampN = 0;
  function stampSVG(word, ring, date, wordSize = 19) {
    const id = "st" + (++stampN);
    return `<svg class="bd-stamp" viewBox="0 0 96 96" aria-hidden="true">
      <defs><path id="${id}r" d="M48 48 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"/>
      <filter id="${id}f" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/><feComponentTransfer><feFuncA type="table" tableValues="0 .75 .92"/></feComponentTransfer></filter></defs>
      <g filter="url(#${id}f)" fill="none" stroke="#E3242B" color="#E3242B">
        <circle cx="48" cy="48" r="45" stroke-width="3"/><circle cx="48" cy="48" r="31" stroke-width="1.3"/>
        <text fill="currentColor" stroke="none" font-family="ui-monospace, Menlo, monospace" font-size="7" font-weight="700" letter-spacing="1.2"><textPath href="#${id}r">${ring}</textPath></text>
        <text x="48" y="51" text-anchor="middle" fill="currentColor" stroke="none" font-family="Bowlby One, Arial Black, sans-serif" font-size="${wordSize}">${word}</text>
        <text x="48" y="63" text-anchor="middle" fill="currentColor" stroke="none" font-family="ui-monospace, Menlo, monospace" font-size="6.2" letter-spacing=".6">${date}</text>
      </g></svg>`;
  }
  function tween(el, frames, o) {
    const a = el.animate(frames, { fill: "both", ...o, duration: reduce ? 1 : o.duration });
    return a.finished.then(() => { const last = frames[frames.length - 1]; for (const k in last) if (k !== "offset" && k !== "easing") el.style[k] = last[k]; a.cancel(); }).catch(() => {});
  }
  function landStamp(stamp, jolt) {
    const land = tween(stamp, [
      { opacity: 0, transform: "scale(2.4) rotate(-34deg)", filter: "blur(4px)" },
      { opacity: .95, transform: "scale(.94) rotate(-12deg)", filter: "blur(0px)", offset: .72 },
      { opacity: .92, transform: "scale(1) rotate(-14deg)", filter: "none" }], { duration: 280, delay: 260, easing: "cubic-bezier(.5,0,.75,0)" });
    if (jolt) setTimeout(() => tween(jolt, [{ transform: "translateY(0)" }, { transform: "translateY(3px)", offset: .35 }, { transform: "none" }], { duration: 200, easing: "ease-out" }), reduce ? 0 : 460);
    return land;
  }

  /* ================= delivery ================= */
  function bindDelivery() {
    $("#delForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const cap = $("#delCap").value.trim(), out = $("#delOut");
      if (!/^\d{5}$/.test(cap)) { $("#delCap").classList.add("is-bad"); out.innerHTML = `<p>Il CAP ha cinque cifre, per esempio 24125.</p>`; return; }
      $("#delCap").classList.remove("is-bad");
      const zone = { 24121: "alta", 24122: "alta", 24129: "alta", 24123: "borgo", 24124: "borgo", 24125: "borgo", 24126: "borgo", 24127: "borgo", 24128: "borgo", 24020: "borgo", 24068: "borgo" }[cap];
      if (!zone) { out.innerHTML = `<p><b>Fuori zona.</b> La pizza calda non arriva fin lì, ma le nostre surgelate sì: spediamo in tutta Italia.</p><button class="bd-btn bd-btn--ink" type="button" data-go="shop" data-close="delivery">Vai allo shop</button>`; return; }
      const loc = locById(zone), s = statusOf(loc);
      out.innerHTML = `<p>Ti consegna <b>${esc(loc.name)}</b> · 25–40 minuti · consegna 2,50 €, gratis sopra i 30 €.</p><p>${statusText(s)}.</p>` +
        (s.open ? `<button class="bd-btn bd-btn--red" type="button" id="delGo">Inizia l'ordine</button>` : `<button class="bd-btn bd-btn--red" type="button" disabled>Ordini chiusi</button>`);
      const go = $("#delGo"); if (go) go.addEventListener("click", () => { closeModal("delivery"); toast("Demo: qui si collega il tuo sistema di ordini a domicilio."); });
    });
  }

  /* ================= catering ================= */
  const CAT = { drop: { min: 10, max: 400, lo: 16, hi: 22, fix: 0, name: "Vassoi drop-off" }, forno: { min: 40, max: 400, lo: 26, hi: 34, fix: 350, name: "Forno mobile" }, sala: { min: 10, max: 60, lo: 32, hi: 40, fix: 0, name: "Festa in pizzeria" } };
  const caterForm = $("#caterForm");
  const formula = () => caterForm.formula.value;
  function caterEstimate() {
    const c = CAT[formula()], g = +caterForm.guests.value;
    const gi = $("#caterGuests"); gi.min = c.min; gi.max = c.max;
    if (!g || g < c.min || g > c.max) { $("#caterEst").innerHTML = `${c.name}: da ${c.min} a ${c.max} persone.`; return; }
    const lo = c.lo * g + c.fix, hi = c.hi * g + c.fix;
    $("#caterEst").innerHTML = `Stima indicativa per ${g} persone<br><b>${euro(lo).replace(",00", "")} – ${euro(hi).replace(",00", "")}</b>`;
  }
  function bindCatering() {
    const t = romeNow(), di = $("#caterDate");
    di.min = addDays(t.date, 3); di.max = addDays(t.date, 365); di.value = addDays(t.date, 14);
    caterForm.addEventListener("input", caterEstimate); caterForm.addEventListener("change", caterEstimate); caterEstimate();
    caterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const c = CAT[formula()], errs = [];
      $$(".is-bad", caterForm).forEach((x) => x.classList.remove("is-bad"));
      const d = caterForm.date.value, g = +caterForm.guests.value, nm = caterForm.elements.fullname.value.trim(), em = caterForm.email.value.trim();
      if (!d || d < di.min) { errs.push("la data deve essere almeno fra 3 giorni"); caterForm.date.classList.add("is-bad"); }
      if (!g || g < c.min || g > c.max) { errs.push(`per ${c.name.toLowerCase()} servono da ${c.min} a ${c.max} persone`); caterForm.guests.classList.add("is-bad"); }
      if (formula() === "sala" && d && [5, 6, 0].includes(dowOf(d))) { errs.push("la festa in pizzeria si fa dal lunedì al giovedì"); caterForm.date.classList.add("is-bad"); }
      if (nm.length < 2) { errs.push("scrivi il tuo nome"); caterForm.elements.fullname.classList.add("is-bad"); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { errs.push("controlla l'email"); caterForm.email.classList.add("is-bad"); }
      if (errs.length) { $("#caterErr").textContent = "Quasi: " + errs.join("; ") + "."; $("#caterDone").hidden = true; return; }
      $("#caterErr").textContent = "";
      const code = "CAT-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      $("#caterDone").innerHTML = `<b>Richiesta inviata · ${code}</b><br>${esc(c.name)} per ${g} persone, ${itDate(d, { weekday: "long", day: "numeric", month: "long" })}. Ti scriviamo a ${esc(em)} entro 24 ore con il menu e il preventivo.`;
      $("#caterDone").hidden = false;
      toast("Richiesta di preventivo inviata.");
    });
    $$(".bd-cat-opt").forEach((b) => b.addEventListener("click", () => {
      caterForm.formula.value = b.dataset.formula;
      if (+caterForm.guests.value < CAT[b.dataset.formula].min) caterForm.guests.value = CAT[b.dataset.formula].min;
      if (+caterForm.guests.value > CAT[b.dataset.formula].max) caterForm.guests.value = CAT[b.dataset.formula].max;
      caterEstimate(); closeModal("catering"); setTimeout(() => { goTo("catering"); setTimeout(() => caterForm.date.focus({ preventScroll: true }), reduce ? 0 : 600); }, 240);
    }));
  }

  /* ================= shop + cart ================= */
  const PRODUCTS = [
    { id: "bandita", name: "Bandita", img: "diavola-cut", desc: "Pomodoro, salame piccante, miele al peperoncino.", meta: "2 pizze · 31 cm · 7 minuti a 250 °C", price: 17, badge: "La più venduta" },
    { id: "funghi", name: "Funghi di Valle", img: "funghi-cut", desc: "Funghi trifolati, taleggio, timo.", meta: "2 pizze · 31 cm", price: 18 },
    { id: "verde", name: "Verde", img: "ortolana-cut", desc: "Spinacino, stracciatella, olio al limone.", meta: "2 pizze · 31 cm", price: 19, badge: "Novità" },
    { id: "formai", name: "Formai de mut", img: "formaggi-cut", desc: "Formaggi delle valli e miele di castagno.", meta: "2 pizze · 31 cm", price: 18 },
    { id: "banda", name: "Box della Banda", img: "salame-rucola-cut", desc: "Quattro pizze, una per gusto, più il nostro olio piccante.", meta: "4 pizze + olio piccante 100 ml", price: 32, badge: "Risparmi 4 €" },
    { id: "gift", name: "Carta regalo", gift: true, desc: "Vale in pizzeria e sullo shop. Arriva via email, subito.", meta: "Digitale · nessuna spedizione", values: [25, 50, 100] },
  ];
  const FREE = 59, SHIP = 9.9;
  const cart = { lines: {}, mode: "ship" };
  try { const s = JSON.parse(store.get("bd-cart") || "null"); if (s && s.lines) { cart.lines = s.lines; cart.mode = s.mode === "pick" ? "pick" : "ship"; } } catch (e) { /* ignore */ }
  const save = () => store.set("bd-cart", JSON.stringify(cart));
  const giftVal = {};
  function lineInfo(key) {
    if (key.startsWith("gift-")) { const v = +key.slice(5); return { key, name: `Carta regalo ${v} €`, price: v, gift: true, sub: "Via email" }; }
    const p = PRODUCTS.find((x) => x.id === key); return p ? { key, name: p.name, price: p.price, img: p.img, sub: p.meta } : null;
  }
  function totals() {
    let sub = 0, phys = 0, count = 0;
    for (const [k, q] of Object.entries(cart.lines)) { const li = lineInfo(k); if (!li) continue; sub += li.price * q; count += q; if (!li.gift) phys += li.price * q; }
    const ship = cart.mode === "pick" || phys === 0 || phys >= FREE ? 0 : SHIP;
    return { sub, phys, count, ship, tot: sub + ship };
  }
  function renderProducts() {
    $("#prodGrid").innerHTML = PRODUCTS.map((p) => {
      if (p.gift) {
        giftVal.v = giftVal.v || 50;
        return `<article class="bd-prod" data-id="gift"><div class="bd-prod-pic"><div class="bd-gc"><span>Bandita</span><em id="gcVal">${giftVal.v} €</em></div><h3>${p.name}</h3></div>
        <div class="bd-prod-body"><p>${p.desc}</p><p class="bd-prod-meta">${p.meta}</p><div class="bd-gc-vals" role="group" aria-label="Importo">${p.values.map((v) => `<button type="button" data-gv="${v}" aria-pressed="${v === giftVal.v}">${v} €</button>`).join("")}</div>
        <div class="bd-prod-foot"><div><div class="bd-prod-price" id="gcPrice">${euro(giftVal.v).replace(",00", "")}</div><div class="bd-prod-incart" data-incart="gift"></div></div>${addBtn("gift")}</div></div></article>`;
      }
      return `<article class="bd-prod" data-id="${p.id}"><div class="bd-prod-pic"><img src="assets/${p.img}.webp" alt="Pizza ${esc(p.name)} vista dall'alto" width="520" height="520" loading="lazy" draggable="false">${p.badge ? `<span class="bd-prod-badge">${p.badge}</span>` : ""}<h3>${esc(p.name)}</h3></div>
        <div class="bd-prod-body"><p>${p.desc}</p><p class="bd-prod-meta">${p.meta}</p>
        <div class="bd-prod-foot"><div><div class="bd-prod-price">${euro(p.price).replace(",00", "")}</div><div class="bd-prod-incart" data-incart="${p.id}"></div></div>${addBtn(p.id)}</div></div></article>`;
    }).join("");
  }
  const addBtn = (id) => `<button type="button" class="bd-add" data-add="${id}" aria-label="Aggiungi al carrello"><span>Aggiungi</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12.5l3.2 3.2L17 9"/></svg></button>`;

  function renderCart() {
    const T = totals();
    // fab
    const fab = $("#cartFab"); fab.hidden = T.count === 0;
    $("#cartCount").textContent = T.count; $("#cartFabTotal").textContent = euro(T.tot);
    // in-cart labels
    $$("[data-incart]").forEach((el) => {
      const id = el.dataset.incart;
      const q = id === "gift" ? Object.entries(cart.lines).filter(([k]) => k.startsWith("gift-")).reduce((s, [, v]) => s + v, 0) : cart.lines[id] || 0;
      el.textContent = q ? `Nel carrello: ${q}` : "";
    });
    // lines
    const keys = Object.keys(cart.lines).filter((k) => cart.lines[k] > 0 && lineInfo(k));
    $("#cartList").innerHTML = keys.map((k) => {
      const li = lineInfo(k), q = cart.lines[k];
      const pic = li.gift ? `<span class="bd-ci-gc">B</span>` : `<img src="assets/${li.img}.webp" alt="">`;
      return `<li class="bd-ci" data-key="${k}">${pic}<div><div class="bd-ci-name">${esc(li.name)}</div><div class="bd-ci-sub">${euro(li.price)} · ${esc(li.sub)}</div></div>
        <div class="bd-qty"><button type="button" data-q="-1" aria-label="Togli uno">−</button><output>${q}</output><button type="button" data-q="1" aria-label="Aggiungi uno">+</button></div></li>`;
    }).join("");
    $("#cartEmpty").hidden = keys.length > 0;
    // shipping meter
    const meter = $("#shipMeter"); let msg, pct;
    if (cart.mode === "pick") { msg = "Ritiro in pizzeria: niente spedizione."; pct = 100; }
    else if (T.phys === 0 && T.count > 0) { msg = "Solo carte regalo: arrivano via email, gratis."; pct = 100; }
    else if (T.phys >= FREE) { msg = "Spedizione refrigerata gratuita sbloccata!"; pct = 100; }
    else { msg = T.phys === 0 ? `Spedizione gratuita sopra i ${FREE} € di pizze.` : `Mancano ${euro(FREE - T.phys)} alla spedizione gratuita.`; pct = (T.phys / FREE) * 100; }
    $("#shipMsg").textContent = msg; $("#shipFill").style.width = pct.toFixed(1) + "%";
    meter.classList.toggle("is-free", pct >= 100);
    // mode + fields
    $$('#modeSeg input').forEach((r) => { r.checked = r.value === cart.mode; });
    $("#shipFields").hidden = cart.mode !== "ship" || (T.phys === 0 && T.count > 0);
    $("#pickFields").hidden = cart.mode !== "pick";
    $("#sumSub").textContent = euro(T.sub);
    $("#sumShipLbl").textContent = cart.mode === "pick" ? "Ritiro" : "Spedizione";
    $("#sumShip").textContent = T.count === 0 ? "—" : T.ship ? euro(T.ship) : "Gratis";
    $("#sumTot").textContent = euro(T.tot);
    $("#payBtn").textContent = T.count ? `Paga ${euro(T.tot)}` : "Paga";
    $("#payBtn").disabled = T.count === 0;
  }
  function addToCart(key, n = 1) {
    cart.lines[key] = Math.max(0, Math.min(20, (cart.lines[key] || 0) + n));
    if (!cart.lines[key]) delete cart.lines[key];
    save(); renderCart();
  }
  function fillPickup() {
    $("#pickLoc").innerHTML = LOCS.filter((l) => l.type === "full").map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
    const fillDays = () => {
      const loc = locById($("#pickLoc").value), t = romeNow(), opts = [];
      for (let k = 1; opts.length < 6 && k < 15; k++) { const d = addDays(t.date, k); if ((loc.hours[dowOf(d)] || []).some(([, b]) => b >= 1080)) opts.push(`<option value="${d}">${itDate(d)}</option>`); }
      $("#pickDay").innerHTML = opts.join("");
    };
    $("#pickLoc").addEventListener("change", fillDays); fillDays();
  }

  /* done-burst-button: squeeze → tick → particles */
  const cv = $("#burstCv"), cx = cv.getContext("2d");
  function burst(btn) {
    if (reduce) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const r = btn.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    const cols = ["#ffffff", "#ffc93c", "#2A2E35", "#E3242B"];
    const ps = Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + (Math.random() - .5) * .5, sp = 150 + Math.random() * 160;
      return { x: ox + Math.cos(a) * 8, y: oy + Math.sin(a) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, r: 3.4 + Math.random() * 4.2, c: cols[i % 4] };
    });
    const t0 = performance.now(); let last = t0;
    const step = (now) => {
      const t = (now - t0) / 900, dt = Math.min(.05, (now - last) / 1000); last = now;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      if (t >= 1) return;
      for (const q of ps) {
        q.vy += 170 * dt; q.vx *= 1 - 2.6 * dt; q.vy *= 1 - 2 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
        cx.globalAlpha = t < .45 ? 1 : 1 - (t - .45) / .55; cx.fillStyle = q.c;
        cx.beginPath(); cx.arc(q.x, q.y, q.r * (1 - t * .35), 0, Math.PI * 2); cx.fill();
        if (q.c === "#ffffff") { cx.strokeStyle = "#2A2E3533"; cx.lineWidth = 1; cx.stroke(); }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function addFx(btn) {
    const fab = $("#cartFab");
    fab.classList.remove("is-bump"); void fab.offsetWidth; fab.classList.add("is-bump");
    if (btn._busy) return;
    btn._busy = true; btn.setAttribute("aria-label", "Aggiunto al carrello");
    if (reduce) { btn.classList.add("is-round", "is-tick"); setTimeout(() => { btn.classList.remove("is-round", "is-tick"); btn._busy = false; btn.setAttribute("aria-label", "Aggiungi al carrello"); }, 900); return; }
    btn.classList.add("is-press");
    setTimeout(() => btn.classList.add("is-round"), 120);
    setTimeout(() => btn.classList.add("is-tick"), 430);
    setTimeout(() => burst(btn), 720);
    setTimeout(() => { btn.classList.remove("is-press", "is-round", "is-tick"); btn._busy = false; btn.setAttribute("aria-label", "Aggiungi al carrello"); }, 1750);
  }

  let cartOpen = false;
  function openCart() {
    if (drawer.classList.contains("is-open")) closeDrawer(true);
    cartOpen = true; lastFocus = document.activeElement;
    const c = $("#cart"); c.classList.add("is-open"); c.setAttribute("aria-hidden", "false");
    scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("is-on"));
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => c.querySelector(".bd-x").focus({ preventScroll: true }), 60);
  }
  function closeCart() {
    if (!cartOpen) return; cartOpen = false;
    const c = $("#cart"); c.classList.remove("is-open"); c.setAttribute("aria-hidden", "true");
    scrim.classList.remove("is-on"); setTimeout(() => { scrim.hidden = true; }, 260);
    if (!openStack.length) document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function bindShop() {
    $("#prodGrid").addEventListener("click", (e) => {
      const gv = e.target.closest("[data-gv]");
      if (gv) { giftVal.v = +gv.dataset.gv; $$("[data-gv]").forEach((b) => b.setAttribute("aria-pressed", b === gv)); $("#gcVal").textContent = giftVal.v + " €"; $("#gcPrice").textContent = euro(giftVal.v).replace(",00", ""); return; }
      const b = e.target.closest("[data-add]"); if (!b) return;
      const id = b.dataset.add; addToCart(id === "gift" ? "gift-" + giftVal.v : id); addFx(b);
    });
    $("#cartFab").addEventListener("click", openCart);
    $("#cartList").addEventListener("click", (e) => { const b = e.target.closest("[data-q]"); if (!b) return; addToCart(b.closest(".bd-ci").dataset.key, +b.dataset.q); });
    $("#modeSeg").addEventListener("change", (e) => { cart.mode = e.target.value; save(); renderCart(); });
    $("#checkout").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target, T = totals(), errs = [];
      $$(".is-bad", f).forEach((x) => x.classList.remove("is-bad"));
      if (!T.count) { $("#cartErr").textContent = "Il carrello è vuoto."; return; }
      const needShip = cart.mode === "ship" && T.phys > 0;
      if (needShip) {
        if (f.addr.value.trim().length < 5) { errs.push("indirizzo"); f.addr.classList.add("is-bad"); }
        if (!/^\d{5}$/.test(f.cap.value.trim())) { errs.push("CAP di 5 cifre"); f.cap.classList.add("is-bad"); }
        if (f.city.value.trim().length < 2) { errs.push("città"); f.city.classList.add("is-bad"); }
      }
      if (f.elements.fullname.value.trim().length < 2) { errs.push("nome"); f.elements.fullname.classList.add("is-bad"); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) { errs.push("email valida"); f.email.classList.add("is-bad"); }
      if (errs.length) { $("#cartErr").textContent = "Manca: " + errs.join(", ") + "."; return; }
      $("#cartErr").textContent = "";
      const order = {
        lines: Object.entries(cart.lines).map(([k, q]) => ({ ...lineInfo(k), q })), T, mode: cart.mode,
        where: cart.mode === "pick" ? `${locById(f.pickLoc.value).name} · ${itDate(f.pickDay.value)}` : needShip ? `${f.cap.value.trim()} ${f.city.value.trim()}` : "Via email",
        name: f.elements.fullname.value.trim(),
      };
      closeCart();
      printReceipt(order);
      cart.lines = {}; save(); renderCart(); f.reset(); renderCart();
    });
  }

  /* receipt-print-stamp */
  const C128 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");
  function code128(text) {
    const vals = [104, ...[...text].map((ch) => ch.charCodeAt(0) - 32)];
    const check = vals.reduce((s, v, i) => s + v * (i || 1), 0) % 103;
    let x = 0, bars = "";
    [...[...vals, check, 106].map((v) => C128[v]).join("")].forEach((w, i) => { if (i % 2 === 0) bars += `<rect x="${x}" width="${w}" height="1"/>`; x += +w; });
    return `<svg class="r-bars" viewBox="0 0 ${x} 1" preserveAspectRatio="none" fill="#141414" aria-label="Codice a barre ${text}">${bars}</svg>`;
  }
  let printing = false;
  async function printReceipt(o) {
    printing = true;
    const t = romeNow(), no = "BD-" + t.date.replace(/-/g, "").slice(2) + "-" + String(Math.floor(Math.random() * 9000) + 1000);
    const paper = $("#rcptPaper"), rc = $("#rcpt"), rig = $("#rcptRig"), close = $("#rcptClose");
    paper.innerHTML = `<div class="r-brand">Bandita</div><div class="r-kick">SHOP · PIZZE SURGELATE</div><hr>
      <div class="r-m"><span>ORDINE</span>${no}</div><div class="r-m"><span>DATA</span>${itDate(t.date, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()} · ${fmtMin(t.min)}</div><div class="r-m"><span>CLIENTE</span>${esc(o.name.toUpperCase())}</div><div class="r-m"><span>${o.mode === "pick" ? "RITIRO" : "CONSEGNA"}</span>${esc(o.where.toUpperCase())}</div><hr>
      ${o.lines.map((l) => `<div class="r-i"><span>${l.q} × ${esc(l.name)}<small>${esc(l.sub)}</small></span>${euro(l.price * l.q)}</div>`).join("")}
      <div class="r-i"><span>${o.mode === "pick" ? "Ritiro in pizzeria" : "Corriere refrigerato"}</span>${o.T.ship ? euro(o.T.ship) : "GRATIS"}</div>
      <hr class="solid"><div class="r-tot">Totale <b>${euro(o.T.tot)}</b></div><div class="r-m" style="margin-top:8px"><span>CARTA · DEMO</span>APPROVATO</div><hr>
      ${code128(no)}<div class="r-no">${no}</div><div class="r-thx">Grazie, bandito!</div>
      ${stampSVG("PAGATO", "GRAZIE · BANDITA PIZZA CLUB · ", itDate(t.date, { day: "2-digit", month: "short" }).toUpperCase(), 18)}`;
    rc.hidden = false; document.documentElement.style.overflow = "hidden";
    close.style.opacity = 0; close.style.pointerEvents = "none"; $("#rcptCap").style.opacity = 1;
    paper.style.transform = "translateY(-110%)"; paper.style.opacity = 1;
    const H = paper.offsetHeight + 48 + 110;
    const fit = () => rig.style.setProperty("--s", Math.min(1, (innerHeight - 16) / H, (innerWidth - 12) / 400).toFixed(4));
    rig.style.setProperty("--h", H + "px"); fit(); window.addEventListener("resize", fit);
    await new Promise((r) => later(380, r));
    const ph = paper.offsetHeight, n = 23, k = .72, dur = reduce ? 1 : 2200, t0 = performance.now();
    await new Promise((res) => {
      const step = (now) => {
        const tt = Math.min(1, (now - t0) / dur);
        const q = tt - k * Math.sin(2 * Math.PI * n * tt) / (2 * Math.PI * n);
        const p = 1 - Math.pow(1 - q, 1.25);
        paper.style.transform = `translate(${(tt < 1 ? (Math.random() - .5) * .7 : 0).toFixed(2)}px, ${(-ph * (1 - p)).toFixed(2)}px)`;
        $("#rcptShadow").style.height = (ph * p).toFixed(1) + "px";
        tt < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
    await tween(paper, [{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(0,5px) rotate(.9deg)", offset: .45 }, { transform: "translate(0,2px) rotate(-.3deg)", offset: .75 }, { transform: "translate(0,3px) rotate(0)" }], { duration: 520, easing: "ease-out" });
    await landStamp(paper.querySelector(".bd-stamp"), null);
    setTimeout(() => tween(paper, [{ transform: "translate(0,3px)" }, { transform: "translate(0,6px)", offset: .35 }, { transform: "translate(0,3px)" }], { duration: 200, easing: "ease-out" }), 0);
    $("#rcptCap").style.opacity = 0;
    close.style.pointerEvents = "auto";
    await tween(close, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" });
    close.focus({ preventScroll: true });
    printing = false;
    window.removeEventListener("resize", fit);
  }
  function closeReceipt() {
    if (printing) return;
    $("#rcpt").hidden = true; $("#rcptShadow").style.height = "0px";
    if (!openStack.length && !cartOpen) document.documentElement.style.overflow = "";
    toast("Ordine confermato. Ti mandiamo la ricevuta via email.");
  }

  /* ================= star band marquee ================= */
  function burstPath() {
    let d = ""; const N = 12;
    for (let i = 0; i < N * 2; i++) { const a = (i / (N * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 7 : 48; d += (i ? "L" : "M") + (Math.cos(a) * r).toFixed(2) + " " + (Math.sin(a) * r).toFixed(2); }
    $("#burst-path").setAttribute("d", d + "Z");
  }
  const marquee = { x: 0, unit: 128, set: 0, vel: 0, on: false };
  function buildMarquee() {
    const tr = $("#starTrack"); const svg = `<svg viewBox="0 0 100 100"><use href="#i-burst"/></svg>`;
    const first = tr.firstElementChild;
    const unit = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(first).marginRight) : 128;
    marquee.unit = unit || 128;
    const per = Math.ceil(innerWidth / marquee.unit) + 1;
    marquee.set = per * marquee.unit;
    tr.innerHTML = svg.repeat(per * 2);
    const f2 = tr.firstElementChild; marquee.unit = f2.getBoundingClientRect().width + parseFloat(getComputedStyle(f2).marginRight); marquee.set = per * marquee.unit;
    paintMarquee();
  }
  function paintMarquee() {
    const tr = $("#starTrack");
    tr.style.transform = `translate3d(${marquee.x.toFixed(2)}px,0,0)`;
    tr.style.setProperty("--rot", (marquee.x * .6).toFixed(1) + "deg");
  }
  let lastY = window.scrollY;

  /* ================= floating parallax field (peek pizzas) ================= */
  const fl = { px: 0, py: 0, tx: 0, ty: 0, on: false, els: [] };

  /* ================= main loop: only runs while something visible needs it ================= */
  let t0 = performance.now(), lastT = t0, loopOn = false;
  function loop(now) {
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    // marquee: base drift + scroll-speed boost
    if (marquee.on) {
      const y = window.scrollY, v = Math.abs(y - lastY) / Math.max(dt, .001); lastY = y;
      marquee.vel += (Math.min(900, v) * .35 - marquee.vel) * Math.min(1, dt * 6);
      marquee.x -= (46 + marquee.vel) * dt;
      if (marquee.x <= -marquee.set) marquee.x += marquee.set;
      paintMarquee();
    } else lastY = window.scrollY;
    // peek pizzas
    if (fl.on) {
      fl.px += (fl.tx - fl.px) * Math.min(1, dt * 4); fl.py += (fl.ty - fl.py) * Math.min(1, dt * 4);
      const r = $("#storia").getBoundingClientRect();
      const sp = Math.max(-1.5, Math.min(1.5, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
      const t = (now - t0) / 1000, k = innerWidth < 640 ? .35 : 1;
      fl.els.forEach((el, i) => {
        const z = el._z, side = el.classList.contains("bd-peek--r") ? -1 : 1;
        const dx = Math.sin(t * .35 + i * 1.7) * 6 * (.4 + z), dy = Math.cos(t * .28 + i * 2.1) * 8 * (.4 + z);
        const x = -fl.px * z * 28 + dx, y = -fl.py * z * 18 + sp * z * 110 * k + dy;
        const rot = el.classList.contains("bd-peek") ? side * sp * z * 28 + fl.px * z * 4 : sp * z * 90;
        el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rot.toFixed(2)}deg)`;
      });
    }
    if (marquee.on || fl.on) requestAnimationFrame(loop); else loopOn = false;
  }
  function kick() { if (!loopOn && !reduce) { loopOn = true; lastT = performance.now(); requestAnimationFrame(loop); } }

  /* ================= magnetic buttons ================= */
  function bindMagnets() {
    if (reduce || !fine) return;
    const els = $$(".bd-magnet"); const RADIUS = 60, PULL = .35;
    els.forEach((el) => { el._ax = 0; el._ay = 0; });
    const set = (el, x, y, tr) => { el._ax = x; el._ay = y; el.classList.toggle("is-tracking", tr); el.style.setProperty("--mx", x.toFixed(2) + "px"); el.style.setProperty("--my", y.toFixed(2) + "px"); };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) { if (el._ax || el._ay) set(el, 0, 0, false); continue; }
        const dx = e.clientX - (r.left + r.width / 2 - el._ax), dy = e.clientY - (r.top + r.height / 2 - el._ay);
        if (Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS) set(el, dx * PULL, dy * PULL, true);
        else if (el._ax || el._ay) set(el, 0, 0, false);
      }
    }, { passive: true });
    const releaseAll = () => els.forEach((el) => set(el, 0, 0, false));
    document.addEventListener("mouseout", (e) => { if (!e.relatedTarget) releaseAll(); });
    window.addEventListener("blur", releaseAll);
  }

  /* ================= wiring ================= */
  function init() {
    burstPath();
    renderLocs(); renderTabs(); renderMenu(); bindMenu();
    renderProducts(); fillPickup(); renderCart(); bindShop();
    bindBook(); bindDelivery(); bindCatering(); bindMagnets();
    setInterval(paintStatus, 30000);

    // global click delegation for open/close/go/tab shortcuts
    document.addEventListener("click", (e) => {
      const op = e.target.closest("[data-open]");
      const cl = e.target.closest("[data-close]");
      const go = e.target.closest("[data-go]");
      const tab = e.target.closest(".bd-loc-small [data-tab]");
      if (cl) { const id = cl.dataset.close; id === "cart" ? closeCart() : closeModal(id); }
      if (op) {
        const id = op.dataset.open;
        if (id === "book") resetBook(op.dataset.loc);
        if (id === "delivery") { $("#delOut").innerHTML = ""; }
        const had = openStack.length || cartOpen;
        if (cartOpen) closeCart();
        if (openStack.length) openStack.slice().forEach(closeModal);
        setTimeout(() => openModal(id), had ? 260 : 0);
      }
      if (go) { if (cartOpen) closeCart(); setTimeout(() => goTo(go.dataset.go), cl ? 240 : 0); }
      if (tab) { setCat(tab.dataset.tab); goTo("menu"); }
    });
    // in-page anchors: drawer links, wordmark
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1); if (!id || !document.getElementById(id)) return;
      e.preventDefault(); if (drawer.classList.contains("is-open")) closeDrawer(true); goTo(id);
    }));
    $$('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toast("Qui va il link al tuo profilo social."); }));

    // modals: backdrop + Esc
    $$(".bd-modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) closeModal(m.id.slice(2)); }));
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!$("#rcpt").hidden) { closeReceipt(); return; }
      if (openStack.length) { closeModal(openStack[openStack.length - 1]); return; }
      if (cartOpen) { closeCart(); return; }
      if (drawer.classList.contains("is-open")) closeDrawer();
    });
    burger.addEventListener("click", () => (drawer.classList.contains("is-open") ? closeDrawer() : openDrawer()));
    $("#drawerClose").addEventListener("click", () => closeDrawer());
    scrim.addEventListener("click", () => { if (cartOpen) closeCart(); else closeDrawer(); });
    $("#rcptClose").addEventListener("click", closeReceipt);

    // story
    $("#storyBtn").addEventListener("click", () => {
      const s = $("#story"), b = $("#storyBtn"), open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!open)); b.textContent = open ? "La nostra storia" : "Chiudi la storia";
      if (!open) { s.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add("is-open"))); }
      else { s.classList.remove("is-open"); setTimeout(() => { if (b.getAttribute("aria-expanded") === "false") s.hidden = true; }, reduce ? 0 : 420); }
    });
    // hero pause (stands in for the source's "pause video")
    $("#heroPause").addEventListener("click", (e) => {
      const p = hero.classList.toggle("is-paused"); e.currentTarget.textContent = p ? "Play" : "Pausa"; e.currentTarget.setAttribute("aria-pressed", String(p));
    });
    // newsletter
    $("#newsForm").addEventListener("submit", (e) => {
      e.preventDefault(); const i = $("#newsEmail"), v = i.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { i.classList.add("is-bad"); $("#newsErr").textContent = "Serve un'email valida."; return; }
      i.classList.remove("is-bad"); $("#newsErr").textContent = ""; i.value = ""; toast("Iscritto! Prima mail il primo del mese.");
    });

    // header state
    let ticking = false;
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScrollHead(); ticking = false; }); } kick(); }, { passive: true });
    onScrollHead();

    // marquee + parallax visibility
    buildMarquee();
    fl.els = $$("#float [data-z]"); fl.els.forEach((el) => { el._z = parseFloat(el.dataset.z); });
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.target.classList.contains("bd-stars")) marquee.on = en.isIntersecting; else fl.on = en.isIntersecting; });
      kick();
    }, { rootMargin: "100px 0px" });
    io.observe($(".bd-stars")); io.observe($("#storia"));
    $("#storia").addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; fl.tx = (e.clientX / innerWidth) * 2 - 1; fl.ty = (e.clientY / innerHeight) * 2 - 1; });
    $("#storia").addEventListener("pointerleave", () => { fl.tx = 0; fl.ty = 0; });
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { buildMarquee(); onScrollHead(); }, 150); });

    // test hook (harmless in production)
    window.__bandita = { statusOf: (id, t) => statusOf(locById(id), t), statusText, slotsFor: (id, d) => slotsFor(locById(id), d), totals, cart, setNow: (d) => { FAKE = d ? new Date(d) : null; paintStatus(); }, marquee, fl };
  }
  init();
})();
