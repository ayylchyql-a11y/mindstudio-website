/* Kaede · template script. No libraries. Runs inside a sandboxed iframe:
   no storage, no alert/confirm, no popups — everything is in memory. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ───────── Data ─────────
     hours[dow] (0 = domenica) = list of [from, to] in minutes; `to` > 1440 runs past midnight. */
  const H = (h, m = 0) => h * 60 + m;
  const every = (list) => [list, list, list, list, list, list, list];
  const STORES = [
    { id: "roma", name: "Kaede Roma", city: "Roma", country: "Italia", area: "Via Veneto", region: "roma", tz: "Europe/Rome", addr: "Via Ludovisi 21, 00187 Roma", tel: "+39 06 4201 2121", mail: "roma@kaede-ristoranti.it", img: "s-roma", res: true, flag: true,
      hours: (() => { const d = [[H(12, 30), H(15)], [H(19), H(23, 30)]], late = [[H(12, 30), H(15)], [H(19), H(24, 30)]]; return [d, d, d, d, d, late, late]; })(),
      only: [["Tonno, bottarga e ponzu al bergamotto", "€ 28"], ["Carciofo alla giudia in tempura", "€ 16"], ["Maritozzo al matcha", "€ 12"]] },
    { id: "terrazza", name: "Terrazza Kaede", city: "Roma · Terrazza", country: "Italia", area: "Ultimo piano, Via Ludovisi", region: "roma", tz: "Europe/Rome", addr: "Via Ludovisi 21 (ultimo piano), 00187 Roma", tel: "+39 06 4201 2122", mail: "terrazza@kaede-ristoranti.it", img: "s-terrazza", kind: "Rooftop bar",
      hours: [[[H(18), H(25)]], [], [[H(18), H(25)]], [[H(18), H(25)]], [[H(18), H(25)]], [[H(18), H(26)]], [[H(18), H(26)]]],
      only: [["Highball al tè affumicato", "€ 16"], ["Gyoza di coda alla vaccinara", "€ 14"], ["Edamame al sale di Cervia", "€ 7"]] },
    { id: "milano", name: "Kaede Milano", city: "Milano", country: "Italia", area: "Brera", region: "italia", tz: "Europe/Rome", addr: "Via Fiori Chiari 14, 20121 Milano", tel: "+39 02 8726 0414", mail: "milano@kaede-ristoranti.it", img: "s-milano",
      hours: (() => { const l = [H(12, 30), H(14, 45)], d = [H(19), H(23, 30)]; return [[l, d], [d], [l, d], [l, d], [l, d], [l, d], [l, d]]; })(),
      only: [["Risotto allo zafferano e uni", "€ 34"], ["Cotoletta di wagyu katsu", "€ 42"], ["Gelato al sesamo nero", "€ 10"]] },
    { id: "firenze", name: "Kaede Firenze", city: "Firenze", country: "Italia", area: "Lungarno", region: "italia", tz: "Europe/Rome", addr: "Lungarno Corsini 8, 50123 Firenze", tel: "+39 055 018 3388", mail: "firenze@kaede-ristoranti.it", img: "s-firenze",
      hours: (() => { const l = [H(12, 30), H(14, 30)], d = [H(19), H(23)]; return [[l, d], [], [d], [d], [d], [d], [l, d]]; })(),
      only: [["Tataki di Chianina, salsa al pepe sansho", "€ 36"], ["Pici in brodo dashi", "€ 22"], ["Schiacciata al miso", "€ 9"]] },
    { id: "venezia", name: "Kaede Venezia", city: "Venezia", country: "Italia", area: "Giudecca", region: "italia", tz: "Europe/Rome", addr: "Fondamenta delle Zitelle 33, 30133 Venezia", tel: "+39 041 520 7781", mail: "venezia@kaede-ristoranti.it", img: "s-venezia", res: true,
      hours: every([[H(19), H(23)]]),
      only: [["Moeche in tempura", "€ 26"], ["Sarde in saor, aceto di riso", "€ 18"], ["Baicoli e matcha", "€ 11"]] },
    { id: "portocervo", name: "Kaede Porto Cervo", city: "Porto Cervo", country: "Italia", area: "Costa Smeralda", region: "stagionali", tz: "Europe/Rome", addr: "Promenade du Port, 07021 Porto Cervo", tel: "+39 0789 166 020", mail: "portocervo@kaede-ristoranti.it", img: "s-portocervo",
      season: { from: 601, to: 920, label: "giugno – 20 settembre" }, hours: every([[H(19, 30), H(24, 30)]]),
      only: [["Aragosta, burro di miso e mirto", "€ 68"], ["Bottarga di Cabras, nigiri", "€ 16"], ["Seadas al miele di yuzu", "€ 12"]] },
    { id: "cortina", name: "Kaede Cortina", city: "Cortina d'Ampezzo", country: "Italia", area: "Dolomiti", region: "stagionali", tz: "Europe/Rome", addr: "Corso Italia 61, 32043 Cortina d'Ampezzo", tel: "+39 0436 860 212", mail: "cortina@kaede-ristoranti.it", img: "s-cortina",
      season: { from: 1205, to: 406, label: "5 dicembre – 6 aprile" }, hours: every([[H(12, 30), H(15, 30)], [H(19, 30), H(23)]]),
      only: [["Nabe di cervo e funghi", "€ 39"], ["Casunziei al burro di miso", "€ 24"], ["Strudel al matcha", "€ 12"]] },
    { id: "parigi", name: "Kaede Paris", city: "Parigi", country: "Francia", area: "Madeleine", region: "europa", tz: "Europe/Paris", addr: "12 rue Boissy d'Anglas, 75008 Paris", tel: "+33 1 84 60 21 21", mail: "paris@kaede-ristoranti.it", img: "s-parigi", res: true,
      hours: every([[H(12), H(14, 30)], [H(19), H(23, 30)]]),
      only: [["Saint-Jacques, beurre blanc al yuzu", "€ 34"], ["Uovo parfait e dashi", "€ 19"], ["Millefoglie al sesamo", "€ 14"]] },
    { id: "londra", name: "Kaede London", city: "Londra", country: "Regno Unito", area: "Mayfair", region: "europa", tz: "Europe/London", addr: "21 Mount Row, London W1K 3SL", tel: "+44 20 3808 2121", mail: "london@kaede-ristoranti.it", img: "s-londra",
      hours: (() => { const l = [H(12), H(14, 30)], d = [H(18), H(23)]; return [[[H(18), H(22, 30)]], [l, d], [l, d], [l, d], [l, d], [l, d], [l, d]]; })(),
      only: [["Granchio di Cornovaglia, temaki", "£ 24"], ["Agnello al miso rosso", "£ 38"], ["Trifle al tè hojicha", "£ 12"]] },
    { id: "vienna", name: "Kaede Wien", city: "Vienna", country: "Austria", area: "Kohlmarkt", region: "europa", tz: "Europe/Vienna", addr: "Kohlmarkt 9, 1010 Wien", tel: "+43 1 890 21 21", mail: "wien@kaede-ristoranti.it", img: "s-vienna", isNew: true,
      hours: (() => { const l = [H(12), H(14, 30)], d = [H(18), H(24)]; return [[], [], [d], [d], [l, d], [l, d], [l, d]]; })(),
      only: [["Wiener Schnitzel katsu", "€ 32"], ["Tafelspitz in brodo dashi", "€ 29"], ["Sachertorte al matcha", "€ 12"]] },
    { id: "barcellona", name: "Kaede Barcelona", city: "Barcellona", country: "Spagna", area: "Eixample", region: "europa", tz: "Europe/Madrid", addr: "Passeig de Gràcia 74, 08008 Barcelona", tel: "+34 932 72 21 21", mail: "barcelona@kaede-ristoranti.it", img: "s-barcellona",
      hours: every([[H(13), H(16)], [H(20), H(24, 30)]]),
      only: [["Gamba di Palamós, nigiri", "€ 18"], ["Pan con tomate e toro", "€ 21"], ["Crema catalana al miso", "€ 11"]] },
  ];
  const BY = Object.fromEntries(STORES.map((s) => [s.id, s]));
  const REGIONS = [["roma", "Roma"], ["italia", "Italia"], ["europa", "Europa"], ["stagionali", "Stagionali"]];

  const DISHES = [
    ["d-nigiri-salmone-2", "Nigiri di salmone scottato", "Salmone norvegese scottato al cannello, tartufo nero di Norcia grattugiato al momento. Due pezzi.", "€ 14"],
    ["d-sashimi-vetro", "Sashimi della casa", "Tonno, ricciola e gambero rosso su ghiaccio di yuzu, con ponzu agli agrumi di Sorrento.", "€ 32"],
    ["d-tartare-ardesia", "Assaggi crudi su ardesia", "Sei bocconi dal banco: tartare, carpaccio e scampo, ognuno col suo condimento.", "€ 38"],
    ["d-tempura", "Tempura di gamberi", "Gamberi di Mazara in pastella leggerissima, sale al limone di Amalfi e salsa tentsuyu.", "€ 24"],
    ["d-gunkan-ikura", "Gunkan salmone e ikura", "Riso tiepido avvolto nel salmone, uova di salmone marinate in soia e sake.", "€ 16"],
    ["d-uramaki", "Uramaki Ludovisi", "Il roll della casa madre: salmone, avocado, mela verde e salmone scottato sopra.", "€ 19"],
    ["d-nigiri-gambero", "Nigiri di gambero rosso", "Gambero rosso di Mazara del Vallo, crudo, con un velo di olio al bergamotto.", "€ 18"],
    ["d-sashimi-piatto", "Branzino al kombu", "Branzino di lenza riposato una notte tra due fogli di alga kombu, olio al bergamotto e sale affumicato.", "€ 29"],
  ];

  const MENU = {
    pranzo: { label: "Pranzo", secs: [
      ["Pranzo Kaede", "Tre portate · servito in un'ora · € 48", [
        ["Antipasto dal banco", "Due crudi del giorno scelti dallo chef.", "", ["crudo"]],
        ["Piatto caldo", "A scelta: pescatrice al miso, pollo teriyaki o tofu agedashi.", "", []],
        ["Sushi", "Cinque nigiri e un hosomaki, oppure chirashi.", "", ["crudo"]],
      ]],
      ["Bento", "Solo dal lunedì al venerdì", [
        ["Bento del mare", "Sashimi, tempura di gamberi, riso, zuppa di miso.", "€ 36", ["crudo"]],
        ["Bento dell'orto", "Verdure in tempura, tofu, onigiri al sesamo, miso.", "€ 28", ["veg"]],
      ]],
    ] },
    cena: { label: "Cena", secs: [
      ["Piatti freddi", "", [
        ["Branzino al kombu", "Una notte nell'alga, olio al bergamotto, sale affumicato.", "€ 29", ["firma", "crudo"]],
        ["Ricciola, finocchio e ponzu al cedro", "Fettine sottili, finocchietto selvatico, sesamo tostato.", "€ 27", ["firma", "crudo"]],
        ["Tartare di tonno, caviale Oscietra", "Salsa wasabi, crostini di riso soffiato.", "€ 42", ["crudo"]],
        ["Insalata di alghe e cetriolo", "Sunomono all'aceto di riso.", "€ 12", ["veg"]],
      ]],
      ["Piatti caldi", "", [
        ["Rana pescatrice al saikyo miso", "Marinata due giorni, cotta alla brace di binchotan.", "€ 42", ["firma"]],
        ["Tempura di gamberi", "Sale al limone di Amalfi, tentsuyu.", "€ 24", ["firma"]],
        ["Wagyu A5 sulla pietra", "Cotto al tavolo, salsa al pepe sansho.", "€ 68", []],
        ["Melanzana al miso dolce", "Glassata e passata al cannello.", "€ 16", ["veg"]],
      ]],
    ] },
    sushi: { label: "Sushi bar", secs: [
      ["Nigiri", "Prezzo al pezzo", [
        ["Tonno", "Akami.", "€ 7", ["crudo"]], ["Ventresca di tonno", "Otoro, quando c'è.", "€ 14", ["crudo"]],
        ["Salmone scottato al tartufo", "", "€ 7", ["firma"]], ["Gambero rosso di Mazara", "", "€ 9", ["firma", "crudo"]],
        ["Ricciola", "", "€ 7", ["crudo"]], ["Anguilla", "Glassata al tare.", "€ 8", []],
      ]],
      ["Maki", "Sei od otto pezzi", [
        ["Uramaki Ludovisi", "Salmone, avocado, mela verde.", "€ 19", ["firma", "crudo"]],
        ["Spicy tuna", "Tonno, maionese al shichimi, cipollotto.", "€ 18", ["crudo"]],
        ["Avocado e cetriolo", "", "€ 12", ["veg"]],
      ]],
      ["Omakase al banco", "Solo su prenotazione", [["Omakase", "Diciotto passaggi, novanta minuti, dodici posti.", "€ 140", ["crudo"]]]],
    ] },
    dolci: { label: "Dolci", secs: [
      ["Dolci", "", [
        ["Tortino al miso caramellato", "Cuore caldo di cioccolato fondente, gelato al tè verde.", "€ 14", ["firma", "veg"]],
        ["Mochi della casa", "Tre gusti: yuzu, sesamo nero, fragola.", "€ 11", ["veg"]],
        ["Tiramisù al matcha", "Savoiardi bagnati nell'hojicha.", "€ 12", ["veg"]],
      ]],
      ["Dopo cena", "", [
        ["Sake della casa", "Junmai ginjo, 90 ml.", "€ 12", []], ["Tè gyokuro", "Servito in tre infusioni.", "€ 9", []],
      ]],
    ] },
  };

  const XP = [
    { name: "Omakase al banco", cat: "Sushi bar", dur: "90 min", price: "€ 140", tint: "#6e5d3b", art: "d-sashimi-box", where: "Roma · Milano · Parigi", text: "Dodici posti davanti allo chef, diciotto passaggi decisi dal mercato del mattino. Si prenota per persona, fino a 4 ospiti.", act: { store: "roma", part: "cena", note: "Omakase al banco" } },
    { name: "Pranzo Kaede", cat: "Mezzogiorno", dur: "60 min", price: "€ 48", tint: "#8e3b2e", art: "d-tartare-coppe", where: "Tutte le sedi aperte a pranzo", text: "Tre portate servite in un'ora, pensato per chi lavora in centro. Dal lunedì al venerdì anche il bento.", act: { store: "roma", part: "pranzo" } },
    { name: "Ora Tanoshi", cat: "Aperitivo", dur: "18 – 20", price: "€ 22", tint: "#4f5d4a", art: "s-terrazza", where: "Terrazza Kaede, Roma", text: "Un highball e tre piccoli piatti caldi sulla terrazza, prima di cena. Senza prenotazione fino a 4 persone.", act: { store: "terrazza", part: "cena" } },
    { name: "Sala privata", cat: "Eventi", dur: "8 – 20 ospiti", price: "da € 95", tint: "#3d4a5c", art: "s-privata", where: "Roma · Venezia · Londra", text: "Il tavolo di marmo per otto o la sala intera per venti: menu concordato con lo chef, sake in abbinamento.", act: { store: "roma", group: true, note: "Sala privata" } },
    { name: "Carta regalo", cat: "Da regalare", dur: "valida 12 mesi", price: "da € 100", tint: "#2b2622", art: "s-visione", where: "Spendibile in tutte le sedi", text: "Una cena da Kaede, in qualsiasi città della famiglia. Si ritira in sede o arriva per email in cinque minuti.", act: { gift: true } },
  ];

  /* ───────── Time ───────── */
  let NOW_OVERRIDE = null;
  try { const m = /[?&]now=([^&]+)/.exec(location.search); if (m) NOW_OVERRIDE = new Date(decodeURIComponent(m[1])); } catch (e) { /* ignore */ }
  const now = () => (NOW_OVERRIDE && !isNaN(NOW_OVERRIDE) ? new Date(NOW_OVERRIDE) : new Date());
  const DOW = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DOW_S = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const MON = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const MON_S = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const fmtCache = {};
  function local(tz, d = now()) {
    const f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23" }));
    const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
    const hh = +p.hour % 24;
    return { y: +p.year, m: +p.month, d: +p.day, dow: WD[p.weekday], min: hh * 60 + +p.minute };
  }
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  // calendar day helper (UTC date used purely as a calendar)
  const dayAt = (y, m, d, add = 0) => { const t = new Date(Date.UTC(y, m - 1, d + add)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), dow: t.getUTCDay() }; };
  const inSeason = (s, day) => { if (!s.season) return true; const md = day.m * 100 + day.d, { from, to } = s.season; return from <= to ? md >= from && md <= to : md >= from || md <= to; };
  const intervals = (s, day) => (inSeason(s, day) ? s.hours[day.dow] || [] : []);

  function status(s, d = now()) {
    const L = local(s.tz, d), t = L.min, today = dayAt(L.y, L.m, L.d), yest = dayAt(L.y, L.m, L.d, -1);
    let closeAt = null;
    for (const [a, b] of intervals(s, today)) if (t >= a && t < b) closeAt = b;
    if (closeAt === null) for (const [, b] of intervals(s, yest)) if (b > 1440 && t < b - 1440) closeAt = b - 1440;
    if (closeAt !== null) {
      const left = closeAt - t;
      return left <= 45
        ? { s: "closing", text: `Chiude tra poco · alle ${hhmm(closeAt)}`, short: "Chiude tra poco" }
        : { s: "open", text: `Aperto ora · chiude alle ${hhmm(closeAt)}`, short: "Aperto ora" };
    }
    for (let i = 0; i < 400; i++) {
      const day = dayAt(L.y, L.m, L.d, i);
      const list = intervals(s, day).map((x) => x[0]).filter((a) => i > 0 || a > t).sort((a, b) => a - b);
      if (!list.length) continue;
      const at = hhmm(list[0]);
      if (i === 0) return { s: "closed", text: `Chiuso · apre alle ${at}`, short: "Chiuso" };
      if (i === 1) return { s: "closed", text: `Chiuso · apre domani alle ${at}`, short: "Chiuso" };
      if (i < 7) return { s: "closed", text: `Chiuso · apre ${DOW[day.dow]} alle ${at}`, short: "Chiuso" };
      return { s: "season", text: `Fuori stagione · riapre il ${day.d} ${MON[day.m - 1]}`, short: "Fuori stagione", opens: day };
    }
    return { s: "closed", text: "Chiuso", short: "Chiuso" };
  }

  function paintStatuses() {
    STORES.forEach((s) => {
      const st = status(s);
      s._st = st;
      $$(`[data-status-dot="${s.id}"]`).forEach((el) => (el.dataset.s = st.s));
      $$(`[data-status-text="${s.id}"]`).forEach((el) => (el.textContent = st.text));
    });
    const c = BY.cortina, L = local(c.tz), st = c._st, el = $("#cortinaCount");
    if (el) {
      if (st.s === "season" && st.opens) {
        const days = Math.round((Date.UTC(st.opens.y, st.opens.m - 1, st.opens.d) - Date.UTC(L.y, L.m - 1, L.d)) / 864e5);
        el.textContent = days === 1 ? "Manca un giorno." : `Mancano ${days} giorni.`;
      } else el.textContent = "La stagione è aperta.";
    }
  }

  /* ───────── Toast ───────── */
  let toastT = 0;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3200); }

  /* ───────── Topbar + nav overlay ───────── */
  const tb = $("#tb"), hero = $(".hero");
  function onScrollTop() { tb.classList.toggle("solid", hero.getBoundingClientRect().bottom < 70); }

  const nav = $("#nav"), navBtn = $("#navOpen");
  let lastFocus = null;
  function openLayer(el, cls = "on") { lastFocus = document.activeElement; el.hidden = false; document.body.classList.add("k-lock"); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add(cls))); }
  function closeLayer(el, cb) {
    el.classList.remove("on");
    const done = () => { el.hidden = true; if (!$$(".nav:not([hidden]), .dr:not([hidden]), .bk:not([hidden])").length) document.body.classList.remove("k-lock"); cb && cb(); };
    reduce ? done() : setTimeout(done, 320);
  }
  navBtn.addEventListener("click", () => { openLayer(nav); navBtn.setAttribute("aria-expanded", "true"); setTimeout(() => $(".nav-x").focus(), 60); });
  function closeNav(refocus = true) { if (nav.hidden) return; navBtn.setAttribute("aria-expanded", "false"); closeLayer(nav); if (refocus) navBtn.focus(); }
  nav.addEventListener("click", (e) => {
    const c = e.target.closest("[data-nav-close]");
    if (c) closeNav(!c.matches("a, [data-book]"));
  });

  function dirHTML(btnCls = "") {
    return REGIONS.map(([r, label]) => `<div><h3>${label}</h3><ul>${STORES.filter((s) => s.region === r).map((s) => `<li><button type="button" class="${btnCls}" data-detail="${s.id}">${esc(s.city)}${s.res ? ' <i class="ft-r" title="Con Residenza">R</i>' : ""}${s.season ? ` <small>${esc(s.season.label)}</small>` : ""}</button></li>`).join("")}</ul></div>`).join("");
  }
  $("#navDir").innerHTML = dirHTML();
  $("#ftDir").innerHTML = dirHTML();

  /* ───────── News slider (3 dots, like the source) ───────── */
  (() => {
    const box = $("#nwSlides"), imgs = $$("img", box), dots = $(".nw-dots", box);
    let i = 0, t = 0;
    imgs.forEach((_, k) => dots.insertAdjacentHTML("beforeend", `<button type="button" role="tab" aria-label="Foto ${k + 1}" aria-selected="${k === 0}"></button>`));
    const bs = $$("button", dots);
    const go = (k) => { i = (k + imgs.length) % imgs.length; imgs.forEach((im, n) => im.classList.toggle("on", n === i)); bs.forEach((b, n) => b.setAttribute("aria-selected", n === i)); };
    const auto = () => { clearInterval(t); if (!reduce) t = setInterval(() => go(i + 1), 5000); };
    bs.forEach((b, k) => b.addEventListener("click", () => { go(k); auto(); }));
    auto();
  })();

  /* ───────── Fullscreen expansion — progress is the only thing JS computes ───────── */
  const kxStage = $("#kxStage"), kxTrack = $(".kx-track");
  let kxP = -1;
  function kxUpdate() {
    if (reduce) { kxStage.classList.add("ready"); return; }
    const r = kxTrack.getBoundingClientRect(), span = r.height - innerHeight;
    const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    if (Math.abs(p - kxP) < 0.0005) return;
    kxP = p;
    kxStage.style.setProperty("--p", p.toFixed(4));
    kxStage.classList.toggle("ready", p > 0.7);
  }

  /* ───────── Locations explorer: chips + search + open-now, FLIP reflow ───────── */
  const grid = $("#stGrid");
  grid.innerHTML = STORES.map((s) => `
    <article class="st-card" data-id="${s.id}" data-region="${s.region}">
      <button class="st-media" type="button" data-detail="${s.id}" aria-label="Scheda di ${esc(s.name)}">
        <img src="assets/${s.img}.webp" alt="" loading="lazy" width="640" height="800">
        <span class="st-badges">${s.flag ? '<span class="st-badge">Casa madre</span>' : ""}${s.isNew ? '<span class="st-badge st-badge--new">Nuovo</span>' : ""}${s.season ? '<span class="st-badge">Stagionale</span>' : ""}${s.res ? '<span class="st-badge st-badge--r">Residenza</span>' : ""}</span>
      </button>
      <div class="st-body">
        <p class="st-country">${esc(s.country)} · ${esc(s.area)}</p>
        <h3>${esc(s.city)}</h3>
        <p class="st-addr">${esc(s.kind ? s.kind + " · " : "")}${esc(s.addr.split(",")[0])}</p>
        <p class="st-status"><span class="k-dot" data-status-dot="${s.id}"></span><span data-status-text="${s.id}"></span></p>
        <div class="st-actions"><button class="k-btn k-btn--solid" type="button" data-book="${s.id}">Prenota</button><button class="k-btn" type="button" data-detail="${s.id}">Scheda</button></div>
      </div>
    </article>`).join("");
  const cards = $$(".st-card", grid);
  const chips = $$("#stChips button"), pill = $(".st-pill"), q = $("#stQ"), openOnly = $("#stOpen");
  let region = "all";

  function placePill(btn, animate) {
    const L = btn.offsetLeft, R = btn.parentElement.clientWidth - (btn.offsetLeft + btn.offsetWidth);
    const right = L > pill.offsetLeft;
    // leading edge leaves first, trailing edge follows → the highlight stretches on the way
    pill.style.transition = !animate || reduce ? "none" : right
      ? "right .22s cubic-bezier(.3,.7,.4,1), left .3s cubic-bezier(.5,0,.3,1) .04s"
      : "left .22s cubic-bezier(.3,.7,.4,1), right .3s cubic-bezier(.5,0,.3,1) .04s";
    pill.style.left = L + "px"; pill.style.right = R + "px";
  }
  const norm = (x) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function matches(s) {
    const t = norm(q.value.trim());
    if (region !== "all" && s.region !== region) return false;
    if (openOnly.checked && !(s._st && (s._st.s === "open" || s._st.s === "closing"))) return false;
    if (t && !norm(`${s.city} ${s.name} ${s.country} ${s.area}`).includes(t)) return false;
    return true;
  }
  function applyFilter(animate = true) {
    const gridR = grid.getBoundingClientRect();
    const before = new Map();
    cards.forEach((c) => {
      // finish whatever was running: a leaving card that is still mid-fade is hidden now
      if (c.classList.contains("is-leaving")) { c.getAnimations().forEach((a) => a.cancel()); finishLeave(c); }
      if (!c.hidden) before.set(c, c.getBoundingClientRect());
      c.getAnimations().forEach((a) => a.cancel());
    });
    const keep = cards.filter((c) => matches(BY[c.dataset.id]));
    const leaving = [...before.keys()].filter((c) => !keep.includes(c));
    const entering = keep.filter((c) => c.hidden);
    const doAnim = animate && !reduce;
    leaving.forEach((c) => {
      if (!doAnim) { c.hidden = true; return; }
      const r = before.get(c);
      Object.assign(c.style, { left: r.left - gridR.left + "px", top: r.top - gridR.top + "px", width: r.width + "px", height: r.height + "px" });
      c.classList.add("is-leaving");
    });
    entering.forEach((c) => (c.hidden = false));
    if (doAnim) {
      keep.forEach((c) => {
        const a = before.get(c), b = c.getBoundingClientRect();
        if (a) {
          const dx = a.left - b.left, dy = a.top - b.top;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 460, easing: "cubic-bezier(.2,.7,.2,1)" });
        }
      });
      entering.forEach((c, i) => c.animate([{ opacity: 0, filter: "blur(6px)", transform: "translateY(8px)" }, { opacity: 1, filter: "blur(0)", transform: "none" }], { duration: 320, delay: 120 + i * 60, easing: "ease-out", fill: "backwards" }));
      leaving.forEach((c) => { const an = c.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }], { duration: 220, easing: "ease-in" }); an.onfinish = () => finishLeave(c); });
    }
    const n = keep.length;
    $("#stCount").textContent = n === 1 ? "1 sede" : `${n} sedi`;
    $("#stEmpty").hidden = n > 0;
  }
  function finishLeave(c) { c.classList.remove("is-leaving"); c.hidden = true; c.style.left = c.style.top = c.style.width = c.style.height = ""; }
  function pickRegion(btn) {
    if (btn.dataset.r === region) return;
    chips.forEach((c) => c.setAttribute("aria-pressed", c === btn ? "true" : "false"));
    placePill(btn, true); region = btn.dataset.r; applyFilter();
  }
  chips.forEach((c) => c.addEventListener("click", () => pickRegion(c)));
  let qT = 0;
  q.addEventListener("input", () => { clearTimeout(qT); qT = setTimeout(() => applyFilter(), 200); });
  openOnly.addEventListener("change", () => applyFilter());
  $("#stReset").addEventListener("click", () => { q.value = ""; openOnly.checked = false; region = "x"; pickRegion(chips[0]); });

  /* ───────── Chef: show more ───────── */
  $("#chToggle").addEventListener("click", (e) => {
    const more = $("#chMore"), open = more.hidden;
    more.hidden = !open; e.currentTarget.setAttribute("aria-expanded", String(open));
    e.currentTarget.textContent = open ? "Mostra di meno" : "Mostra di più";
  });

  /* ───────── Ring carousel — logic after Bencho «Carousel» (MIT © 2026 Lorenzo Cabra).
     A ring, not a row: the slot carries the ring, the floater the drift, the card the tilt. ───────── */
  (() => {
    const ring = $("#rgRing"), n = DISHES.length, PULL = 110;
    const P = { spread: 250, depth: 100, settle: 55, sink: 45 };
    let turn = 0, vel = 0, turn0 = 0, x0 = 0, dragging = false, moved = 0, lastX = 0, lastT = 0, raf = 0, target = null, front = -1;
    const slots = DISHES.map(([img, name], i) => {
      const s = document.createElement("div");
      s.className = "rg-slot";
      s.innerHTML = `<div class="rg-float" style="--dl:${-i * 1.3}s"><div class="rg-card" role="option" aria-label="${esc(name)}" style="background-image:url(assets/${img}.webp)"><b>${esc(name)}</b></div></div>`;
      ring.appendChild(s);
      const card = s.querySelector(".rg-card");
      card.addEventListener("pointermove", (e) => {
        if (dragging || e.pointerType !== "mouse") return;
        const r = card.getBoundingClientRect(), nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1, max = (P.sink / 100) * 14;
        card.style.setProperty("--rx", -ny * max + "deg"); card.style.setProperty("--ry", nx * max + "deg");
      });
      card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
      card.addEventListener("click", () => { if (moved > 6) return; const cur = Math.round(turn), idx = ((cur % n) + n) % n; let d = i - idx; if (d > n / 2) d -= n; if (d < -n / 2) d += n; if (d) goTo(cur + d); });
      return s;
    });
    const spread = () => (innerWidth <= 640 ? Math.min(150, innerWidth * 0.36) : innerWidth <= 900 ? 220 : P.spread);
    function paint() {
      const orbit = spread(), backScale = 1 - (P.depth / 100) * 0.5;
      slots.forEach((s, i) => {
        const th = (i - turn) * ((Math.PI * 2) / n), f = (Math.cos(th) + 1) / 2;
        const x = Math.sin(th) * orbit, sc = backScale + (1 - backScale) * f, y = -(1 - f) * 40;
        s.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        s.style.zIndex = Math.round(f * 100);
        s.firstChild.firstChild.style.setProperty("--veil", ((1 - f) * 0.55).toFixed(3));
      });
      const k = ((Math.round(turn) % n) + n) % n;
      if (k !== front) caption(k);
    }
    const cap = $("#rgCap");
    let capT = 0;
    function caption(k) {
      const first = front < 0; front = k;
      slots.forEach((s, i) => s.firstChild.firstChild.setAttribute("aria-selected", String(i === k)));
      const fill = () => { const [, name, desc, price] = DISHES[k]; $("#rgN").textContent = `${String(k + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`; $("#rgName").textContent = name; $("#rgDesc").textContent = desc; $("#rgPrice").textContent = price; };
      clearTimeout(capT);
      if (first || reduce) { fill(); return; }
      cap.classList.add("swap");
      capT = setTimeout(() => { fill(); cap.classList.remove("swap"); }, 220);
    }
    function loop() {
      if (!dragging) {
        if (target !== null) {
          turn += (target - turn) * 0.14;
          if (Math.abs(target - turn) < 0.001) { turn = target; target = null; paint(); raf = 0; return; }
        } else {
          turn += vel; vel *= 0.86 + (1 - P.settle / 100) * 0.1;
          const near = Math.round(turn); turn += (near - turn) * (0.04 + (P.settle / 100) * 0.12);
          if (Math.abs(vel) < 0.0005 && Math.abs(near - turn) < 0.0005) { turn = near; vel = 0; paint(); raf = 0; return; }
        }
      }
      paint(); raf = requestAnimationFrame(loop);
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };
    function goTo(t) { vel = 0; if (reduce) { turn = t; paint(); return; } target = t; wake(); }
    ring.addEventListener("pointerdown", (e) => { if (e.button > 0) return; dragging = true; target = null; moved = 0; x0 = e.clientX; turn0 = turn; lastX = e.clientX; lastT = performance.now(); wake(); });
    ring.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moved = Math.max(moved, Math.abs(e.clientX - x0));
      if (moved > 6 && !ring.hasPointerCapture(e.pointerId)) { try { ring.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } }
      turn = turn0 - (e.clientX - x0) / PULL;
      const t = performance.now(); vel = -(e.clientX - lastX) / PULL / Math.max(1, (t - lastT) / 16.7); lastX = e.clientX; lastT = t;
    });
    const up = () => { if (!dragging) return; dragging = false; if (reduce) { turn = Math.round(turn); vel = 0; paint(); return; } wake(); };
    ring.addEventListener("pointerup", up); ring.addEventListener("pointercancel", up);
    // a card hands its implicit touch capture over to the ring mid-drag: only the ring losing it ends the drag
    ring.addEventListener("lostpointercapture", (e) => { if (e.target === ring) up(); });
    $("#rgPrev").addEventListener("click", () => goTo(Math.round(target ?? turn) - 1));
    $("#rgNext").addEventListener("click", () => goTo(Math.round(target ?? turn) + 1));
    ring.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.round(target ?? turn) + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.round(target ?? turn) - 1); }
    });
    addEventListener("resize", paint);
    paint();
    // one gentle half-turn the first time the ring scrolls into view, so it reads as a ring
    if (!reduce && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); setTimeout(() => { if (!dragging && target === null) { vel = -0.1; wake(); } }, 500); } }, { threshold: 0.5 });
      io.observe(ring);
    }
    window.__kdRing = { get turn() { return turn; }, get front() { return front; }, goTo };
  })();

  /* ───────── Menu tabs ───────── */
  (() => {
    const tabs = $("#mnTabs"), body = $("#mnBody"), keys = Object.keys(MENU);
    tabs.innerHTML = keys.map((k, i) => `<button type="button" role="tab" id="mn-tab-${k}" aria-controls="mnBody" aria-selected="${i === 1}" tabindex="${i === 1 ? 0 : -1}" data-k="${k}">${MENU[k].label}</button>`).join("");
    const TAG = { firma: '<i class="mn-tag mn-tag--firma">Firma</i>', crudo: '<i class="mn-tag">Crudo</i>', veg: '<i class="mn-tag mn-tag--veg">Veg</i>' };
    function show(k, focus) {
      $$("button", tabs).forEach((b) => { const on = b.dataset.k === k; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      body.setAttribute("aria-labelledby", "mn-tab-" + k);
      body.innerHTML = MENU[k].secs.map(([t, sub, items]) => `<div class="mn-sec"><h3>${esc(t)}</h3>${sub ? `<p class="mn-sub">${esc(sub)}</p>` : ""}${items.map(([nm, d, p, tags]) => `<div class="mn-item"><h4>${esc(nm)} ${tags.map((x) => TAG[x]).join("")}</h4>${p ? `<span class="mn-p">${esc(p)}</span>` : ""}${d ? `<p>${esc(d)}</p>` : ""}</div>`).join("")}</div>`).join("") + `<p class="mn-note">Prezzi della sede di Roma. Pesce crudo abbattuto a norma di legge. Allergeni: chiedi al personale.</p>`;
      body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
    }
    tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(b.dataset.k); });
    tabs.addEventListener("keydown", (e) => {
      const i = keys.indexOf($('[aria-selected="true"]', tabs).dataset.k);
      if (e.key === "ArrowRight") show(keys[(i + 1) % keys.length], true);
      if (e.key === "ArrowLeft") show(keys[(i - 1 + keys.length) % keys.length], true);
    });
    show("cena");
  })();

  /* ───────── Experiences: the section IS the swatch ───────── */
  (() => {
    const list = $("#xpList"), sec = $("#esperienze"), price = $("#xpPrice"), blurb = $("#xpBlurb"), where = $("#xpWhere"), card = $("#xpCard"), cta = $("#xpCta");
    let cur = -1, swapT = 0;
    XP.forEach((x, i) => {
      const li = document.createElement("li");
      li.className = "xp-row"; li.tabIndex = 0; li.setAttribute("role", "button");
      li.innerHTML = `<b>${esc(x.name)}</b><small>${esc(x.cat)}</small><span class="xp-dur">${esc(x.dur)}</span>`;
      li.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") select(i); });
      li.addEventListener("focus", () => select(i));
      li.addEventListener("click", () => select(i));
      li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      list.appendChild(li);
    });
    function select(i, first) {
      if (i === cur) return;
      const dir = i > cur ? 1 : -1; cur = i;
      const x = XP[i];
      sec.style.setProperty("--tint", x.tint);
      $$(".xp-row", list).forEach((li, k) => li.classList.toggle("on", k === i));
      card.style.setProperty("--art", `url(assets/${x.art}.webp)`);
      cta.textContent = x.act.gift ? "Regala" : x.act.group ? "Richiedi la sala" : "Prenota";
      if (!first && !reduce) { card.style.setProperty("--r", dir * 4 + "deg"); setTimeout(() => card.style.setProperty("--r", "-2deg"), 60); }
      clearTimeout(swapT);
      const fill = () => { price.textContent = x.price; blurb.textContent = x.text; where.textContent = x.where; };
      if (first || reduce) { fill(); return; }
      [price, blurb, where].forEach((el) => el.classList.add("swap"));
      swapT = setTimeout(() => { fill(); [price, blurb, where].forEach((el) => el.classList.remove("swap")); }, 220);
    }
    function act() {
      const a = XP[cur].act;
      if (a.gift) { toast("Carte regalo: chiama +39 06 4201 2121 o passa in sede. Arriva per email in cinque minuti."); return; }
      openBooking({ store: a.store, part: a.part, note: a.note, group: a.group });
    }
    cta.addEventListener("click", act);
    card.style.setProperty("--r", "-2deg");
    select(0, true);
  })();

  /* ───────── Store drawer = single-location page ───────── */
  const dr = $("#dr");
  let drStore = null, drTab = "info";
  function hoursRows(s) {
    const L = local(s.tz), order = [1, 2, 3, 4, 5, 6, 0];
    return order.map((d) => {
      const list = s.hours[d];
      const txt = list.length ? list.map(([a, b]) => `${hhmm(a)} – ${hhmm(b)}`).join(" · ") : "Chiuso";
      return `<tr class="${d === L.dow ? "today" : ""}"><th scope="row">${DOW[d]}</th><td>${txt}</td></tr>`;
    }).join("");
  }
  function drRender() {
    const s = drStore, b = $("#drBody");
    $$(".dr-tabs button").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === drTab)));
    b.setAttribute("aria-labelledby", { info: "drTabInfo", menu: "drTabMenu", rules: "drTabRules" }[drTab]);
    if (drTab === "info") {
      b.innerHTML = `<h4>Orari</h4>${s.season ? `<p>Aperto da ${esc(s.season.label)}.</p>` : ""}<table class="dr-hours"><tbody>${hoursRows(s)}</tbody></table>
        <h4>Indirizzo</h4><p>${esc(s.addr)}</p>
        <h4>Contatti</h4><p class="dr-contact">Tel. <a href="#">${esc(s.tel)}</a><br>${esc(s.mail)}</p>
        <p style="margin-top:10px;font-size:12.5px">Orari nell'ora locale di ${esc({ "Europe/Rome": "Roma", "Europe/Paris": "Parigi", "Europe/London": "Londra", "Europe/Vienna": "Vienna", "Europe/Madrid": "Madrid" }[s.tz])}.</p>`;
    } else if (drTab === "menu") {
      b.innerHTML = `<h4>Solo a ${esc(s.city.split(" ·")[0])}</h4>${s.only.map(([n, p]) => `<div class="dr-dish"><b>${esc(n)}</b><em>${esc(p)}</em><span>Piatto della sede</span></div>`).join("")}
        <h4>Dalla carta di famiglia</h4>${DISHES.slice(0, 4).map(([, n, , p]) => `<div class="dr-dish"><b>${esc(n)}</b><em>${esc(p)}</em></div>`).join("")}
        <button class="dr-link" type="button" data-goto-menu>Vedi la carta completa</button>`;
    } else {
      b.innerHTML = `<div class="dr-rules">
        <div><b>Fino a due mesi prima</b><p>Le prenotazioni aprono 60 giorni prima della data.</p></div>
        <div><b>Fino a 6 ospiti online</b><p>Chiediamo una carta a garanzia, senza addebito. Mancata presentazione o disdetta tardiva: € 50 a persona.</p></div>
        <div><b>7 o più ospiti</b><p>Mandaci una richiesta: la sede ti richiama entro 24 ore con le proposte per la sala privata.</p></div>
        <div><b>Disdette</b><p>Gratuite fino a 24 ore prima, dal link nell'email di conferma o al ${esc(s.tel)}.</p></div></div>`;
    }
  }
  function openDrawer(id) {
    const s = BY[id]; if (!s) return;
    drStore = s; drTab = "info";
    $("#drImg").src = `assets/${s.img}.webp`; $("#drImg").alt = `La sala di ${s.name}`;
    $("#drCountry").textContent = `${s.country} · ${s.area}`;
    $("#dr-t").textContent = s.name;
    $("#drDot").dataset.s = s._st.s; $("#drStatus").textContent = s._st.text;
    $("#drBook").textContent = `Prenota a ${s.city.split(" ·")[0]}`;
    drRender();
    if (!dr.hidden) return;
    openLayer(dr); setTimeout(() => $(".dr-x").focus(), 60);
  }
  function closeDrawer(refocus = true) { if (dr.hidden) return; const f = lastFocus; closeLayer(dr); if (refocus && f && f.focus) f.focus(); }
  $$(".dr-tabs button").forEach((t) => t.addEventListener("click", () => { drTab = t.dataset.tab; drRender(); }));
  dr.addEventListener("click", (e) => {
    if (e.target.closest("[data-dr-close]")) closeDrawer();
    if (e.target.closest("[data-goto-menu]")) { closeDrawer(false); setTimeout(() => $("#menu").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }), 60); }
  });
  $("#drBook").addEventListener("click", () => { const id = drStore.id; closeDrawer(false); openBooking({ store: id }); });

  /* ───────── Booking modal ───────── */
  const bk = $("#bk"), form = $("#bkForm"), selStore = $("#bkStore");
  selStore.innerHTML = REGIONS.map(([r, label]) => `<optgroup label="${label}">${STORES.filter((s) => s.region === r).map((s) => `<option value="${s.id}">${esc(s.name)}${s.kind ? " · " + s.kind : ""} — ${esc(s.city.split(" ·")[0])}</option>`).join("")}</optgroup>`).join("");
  const G = $("#bkGuests");
  G.setAttribute("role", "radiogroup"); G.setAttribute("aria-label", "Numero di ospiti");
  G.innerHTML = ["1", "2", "3", "4", "5", "6", "7+"].map((g) => `<button type="button" role="radio" aria-checked="false" data-g="${g}">${g}</button>`).join("");
  const B = { store: "roma", guests: "2", date: null, slot: null, part: null };
  const days60 = (s) => { const L = local(s.tz); return Array.from({ length: 61 }, (_, i) => dayAt(L.y, L.m, L.d, i)); };
  const dkey = (d) => `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function slotsFor(s, day) {
    const L = local(s.tz), isToday = day.y === L.y && day.m === L.m && day.d === L.d;
    return intervals(s, day).map(([a, b]) => {
      const list = [];
      for (let x = a; x <= b - 75; x += 30) {
        if (isToday && x < L.min + 30) continue;
        list.push({ x, full: hash(s.id + dkey(day) + x) % 7 === 0 });
      }
      return { part: a < H(17) ? "pranzo" : "cena", label: a < H(17) ? "Pranzo" : s.id === "terrazza" ? "Sera" : "Cena", list };
    }).filter((g) => g.list.length);
  }
  const dayOpen = (s, day) => slotsFor(s, day).some((g) => g.list.some((x) => !x.full));

  function renderStore() {
    const s = BY[B.store];
    selStore.value = s.id;
    $("#bkImg").src = `assets/${s.img}.webp`;
    $("#bkDot").dataset.s = s._st.s; $("#bkStatus").textContent = `${s._st.text} · ${s.addr.split(",")[0]}`;
  }
  function renderGuests() {
    $$("button", G).forEach((b) => { const on = b.dataset.g === B.guests; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
    const group = B.guests === "7+";
    $("#bkGroup").hidden = !group;
    $("#bkPolicyRow").hidden = group;
    $("#bkErrPolicy").textContent = "";
    $("#bkSubmit").textContent = group ? "Invia richiesta" : "Conferma";
  }
  function renderDays(keepScroll) {
    const s = BY[B.store], list = days60(s), wrap = $("#bkDays");
    const avail = list.filter((d) => dayOpen(s, d));
    if (B.date && !avail.some((d) => dkey(d) === B.date)) B.date = null;
    if (!B.date && avail.length) B.date = dkey(avail[0]);
    const sl = wrap.scrollLeft;
    wrap.innerHTML = list.map((d) => { const ok = dayOpen(s, d), k = dkey(d); return `<button type="button" class="bk-day" data-d="${k}" aria-pressed="${k === B.date}" ${ok ? "" : "disabled"} aria-label="${DOW[d.dow]} ${d.d} ${MON[d.m - 1]}${ok ? "" : ", non disponibile"}"><small>${DOW_S[d.dow]}</small><b>${d.d}</b><small>${MON_S[d.m - 1]}</small></button>`; }).join("");
    const none = !avail.length;
    $("#bkNoDays").hidden = !none;
    if (none) {
      const st = s._st;
      $("#bkNoDays").textContent = st.opens ? `${s.name} riapre il ${st.opens.d} ${MON[st.opens.m - 1]}. Le prenotazioni si aprono 60 giorni prima: torna da ${(() => { const o = dayAt(st.opens.y, st.opens.m, st.opens.d, -60); return `${o.d} ${MON[o.m - 1]}`; })()}.` : "Nessuna data disponibile nei prossimi 60 giorni.";
    }
    $("#bkSubmit").disabled = none;
    const sel = B.date && list.find((d) => dkey(d) === B.date);
    $("#bkMonth").textContent = sel ? `${DOW[sel.dow]} ${sel.d} ${MON[sel.m - 1]}` : "";
    if (keepScroll) wrap.scrollLeft = sl;
    else { const on = $('[aria-pressed="true"]', wrap); wrap.scrollLeft = on ? Math.max(0, on.offsetLeft - wrap.offsetLeft - 4) : 0; }
  }
  function renderSlots() {
    const s = BY[B.store], box = $("#bkSlots");
    if (!B.date) { box.innerHTML = `<p class="bk-empty">Scegli prima una data.</p>`; B.slot = null; return; }
    const [y, m, d] = B.date.split("-").map(Number), day = dayAt(y, m, d), groups = slotsFor(s, day);
    const all = groups.flatMap((g) => g.list.filter((x) => !x.full).map((x) => ({ ...x, part: g.part })));
    if (B.slot !== null && !all.some((x) => x.x === B.slot)) B.slot = null;
    if (B.slot === null && B.part) { const p = all.find((x) => x.part === B.part); if (p) B.slot = p.x; }
    box.innerHTML = groups.map((g) => `<div class="bk-sg"><p>${g.label}</p><div>${g.list.map((x) => `<button type="button" data-x="${x.x}" aria-pressed="${x.x === B.slot}" ${x.full ? 'disabled aria-label="' + hhmm(x.x) + ', completo"' : ""}>${hhmm(x.x)}</button>`).join("")}</div></div>`).join("") || `<p class="bk-empty">Nessun orario libero in questa data.</p>`;
  }
  function summary() {
    const s = BY[B.store];
    let t = `<b>${esc(s.name)}</b>`;
    if (B.date) { const [y, m, d] = B.date.split("-").map(Number), day = dayAt(y, m, d); t += ` · ${DOW_S[day.dow]} ${d} ${MON_S[m - 1]}`; }
    if (B.slot !== null) t += ` · ${hhmm(B.slot)}`;
    t += ` · ${B.guests === "7+" ? "7 o più ospiti" : B.guests === "1" ? "1 ospite" : B.guests + " ospiti"}`;
    $("#bkSum").innerHTML = t;
  }
  function renderAll(keepScroll) { renderStore(); renderGuests(); renderDays(keepScroll); renderSlots(); summary(); }

  function clearErrors() { $$(".bk-ferr", bk).forEach((e) => (e.textContent = "")); $$("[aria-invalid]", bk).forEach((e) => e.removeAttribute("aria-invalid")); $("#bkPolicyRow").classList.remove("err"); }
  function openBooking(o = {}) {
    if (!nav.hidden) closeNav(false);
    B.store = BY[o.store] ? o.store : B.store || "roma";
    B.part = o.part || null; B.slot = null; B.date = null;
    B.guests = o.group ? "7+" : (B.guests === "7+" ? "2" : B.guests);
    $("#bkNoteIn").value = o.note || "";
    $("#bkPolicy").checked = false;
    form.hidden = false; $("#bkDone").hidden = true;
    clearErrors(); renderAll();
    if (bk.hidden) { openLayer(bk); }
    setTimeout(() => selStore.focus({ preventScroll: true }), 80);
  }
  function closeBooking() { if (bk.hidden) return; const f = lastFocus; closeLayer(bk); if (f && f.focus && document.contains(f)) f.focus({ preventScroll: true }); }
  bk.addEventListener("click", (e) => { if (e.target.closest("[data-bk-close]")) closeBooking(); });
  selStore.addEventListener("change", () => { B.store = selStore.value; B.slot = null; renderAll(); });
  G.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; B.guests = b.dataset.g; renderGuests(); summary(); });
  G.addEventListener("keydown", (e) => {
    const bs = $$("button", G), i = bs.findIndex((b) => b.dataset.g === B.guests);
    const k = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!k) return; e.preventDefault(); const nb = bs[(i + k + bs.length) % bs.length]; B.guests = nb.dataset.g; renderGuests(); summary(); nb.focus();
  });
  $("#bkDays").addEventListener("click", (e) => { const b = e.target.closest(".bk-day"); if (!b || b.disabled) return; B.date = b.dataset.d; $("#bkErrDate").textContent = ""; renderDays(true); renderSlots(); summary(); });
  $("#bkDPrev").addEventListener("click", () => $("#bkDays").scrollBy({ left: -260, behavior: reduce ? "auto" : "smooth" }));
  $("#bkDNext").addEventListener("click", () => $("#bkDays").scrollBy({ left: 260, behavior: reduce ? "auto" : "smooth" }));
  $("#bkSlots").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b || b.disabled) return; B.slot = +b.dataset.x; $("#bkErrSlot").textContent = ""; $$("button", $("#bkSlots")).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); summary(); });
  ["bkName", "bkPhone", "bkEmail"].forEach((id) => $("#" + id).addEventListener("input", (e) => { e.target.removeAttribute("aria-invalid"); $("#bkErr" + id.slice(2)).textContent = ""; }));
  $("#bkPolicy").addEventListener("change", () => { $("#bkPolicyRow").classList.remove("err"); $("#bkErrPolicy").textContent = ""; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    const group = B.guests === "7+", errs = [];
    const name = $("#bkName").value.trim(), phone = $("#bkPhone").value.trim(), email = $("#bkEmail").value.trim();
    if (!B.date) errs.push(["bkErrDate", "Scegli una data.", null]);
    if (B.slot === null) errs.push(["bkErrSlot", "Scegli un orario.", null]);
    if (name.length < 2 || !/\s/.test(name)) errs.push(["bkErrName", "Scrivi nome e cognome.", "bkName"]);
    if (!/^\+?[\d\s().-]{8,18}$/.test(phone) || phone.replace(/\D/g, "").length < 8) errs.push(["bkErrPhone", "Numero non valido: almeno 8 cifre.", "bkPhone"]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.push(["bkErrEmail", "Controlla l'indirizzo email.", "bkEmail"]);
    if (!group && !$("#bkPolicy").checked) { errs.push(["bkErrPolicy", "Per confermare accetta le condizioni di garanzia.", null]); $("#bkPolicyRow").classList.add("err"); }
    if (errs.length) {
      errs.forEach(([id, msg, field]) => { $("#" + id).textContent = msg; if (field) $("#" + field).setAttribute("aria-invalid", "true"); });
      const firstEl = errs[0][2] ? $("#" + errs[0][2]) : $("#" + errs[0][0]);
      firstEl.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      if (errs[0][2]) firstEl.focus({ preventScroll: true });
      return;
    }
    const s = BY[B.store], [y, m, d] = B.date.split("-").map(Number), day = dayAt(y, m, d);
    const code = "KD-" + s.id.slice(0, 3).toUpperCase() + "-" + String(hash(name + email + B.date + B.slot) % 9000 + 1000);
    $("#bkDoneLabel").textContent = group ? "Richiesta inviata" : "Prenotazione confermata";
    $("#bkDoneT").textContent = group ? `Ti richiamiamo entro 24 ore, ${name.split(" ")[0]}` : `A presto, ${name.split(" ")[0]}`;
    $("#bkDoneDl").innerHTML = [["Codice", code], ["Sede", `${s.name}${s.kind ? " · " + s.kind : ""}`], ["Indirizzo", s.addr], ["Quando", `${DOW[day.dow]} ${d} ${MON[m - 1]} ${y}, ore ${hhmm(B.slot)}`], ["Ospiti", group ? "7 o più" : B.guests]].concat($("#bkNoteIn").value.trim() ? [["Note", $("#bkNoteIn").value.trim()]] : []).map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join("");
    $("#bkDoneP").textContent = group ? `La sede ti contatta al ${phone} con le proposte per la sala. Nessuna garanzia richiesta finché non confermi.` : `Ti abbiamo scritto a ${email}. Il tavolo resta tuo per 15 minuti dall'orario; per disdire gratis hai tempo fino a 24 ore prima.`;
    form.hidden = true; $("#bkDone").hidden = false; $("#bkDone").focus();
  });
  $("#bkAgain").addEventListener("click", () => { $("#bkName").value = $("#bkPhone").value = $("#bkEmail").value = ""; openBooking({ store: B.store }); });

  /* ───────── Global delegation: every [data-book] / [data-detail] ───────── */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-book]");
    if (b && !b.closest(".bk")) {
      e.preventDefault();
      if (!dr.hidden) closeDrawer(false);
      openBooking({ store: b.dataset.book, part: b.dataset.part, note: b.dataset.note });
      return;
    }
    const d = e.target.closest("[data-detail]");
    if (d) { e.preventDefault(); if (!nav.hidden) closeNav(false); openDrawer(d.dataset.detail); }
  });

  /* keyboard: Escape closes the topmost layer; Tab stays inside it */
  document.addEventListener("keydown", (e) => {
    const layer = !bk.hidden ? bk : !dr.hidden ? dr : !nav.hidden ? nav : null;
    if (!layer) return;
    if (e.key === "Escape") { e.preventDefault(); layer === bk ? closeBooking() : layer === dr ? closeDrawer() : closeNav(); return; }
    if (e.key === "Tab") {
      const f = $$('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]', layer).filter((x) => x.offsetParent !== null && !x.closest("[hidden]"));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ───────── Scroll loop (passive, one rAF) ───────── */
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; onScrollTop(); kxUpdate(); }); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { kxP = -1; onScroll(); placePill($('#stChips [aria-pressed="true"]'), false); });

  /* ───────── Boot ───────── */
  paintStatuses();
  applyFilter(false);
  placePill(chips[0], false);
  onScrollTop(); kxUpdate();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placePill($('#stChips [aria-pressed="true"]'), false));
  setInterval(() => { paintStatuses(); if (openOnly.checked) applyFilter(); }, 30000);

  // test hooks (used by the acceptance scripts)
  window.__kd = { status: (id, iso) => status(BY[id], iso ? new Date(iso) : now()), setNow: (iso) => { NOW_OVERRIDE = new Date(iso); paintStatuses(); }, openBooking, openDrawer, B, slotsFor: (id, y, m, d) => slotsFor(BY[id], dayAt(y, m, d)) };
})();
