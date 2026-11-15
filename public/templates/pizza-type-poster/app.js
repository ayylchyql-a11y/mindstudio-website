/* Panetto — manifesto tipografico. Nessuna dipendenza, nessuno storage. */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMQ = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var reduce = function () { return !!reduceMQ.matches; };
  var mobileMQ = window.matchMedia ? window.matchMedia("(max-width: 899px)") : { matches: false };
  var isMobile = function () { return !!mobileMQ.matches; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var fmtMin = function (m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); };
  var euro = function (n) { return "€ " + (Math.round(n * 10) / 10).toString().replace(".", ","); };

  /* ------------------------------------------------------------------ dati */
  var DAYS_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  var DAYS_LONG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  var MONTHS_LONG = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

  // orari in minuti dalla mezzanotte; una fine > 1440 sconfina nel giorno dopo
  var VENUES = [
    {
      name: "Navigli", addr: "Alzaia Naviglio Grande 48", cap: "20144 Milano", phone: "+39 02 8457 2210",
      email: "navigli@panettopizza.it", img: "assets/pala.webp", alt: "Pizza che entra nel forno a legna sulla pala",
      tasting: true,
      hours: { 0: [[720, 900], [1110, 1380]], 1: [], 2: [[1110, 1410]], 3: [[1110, 1410]], 4: [[1110, 1410]], 5: [[1110, 1440]], 6: [[720, 900], [1110, 1470]] },
      rules: ["Tavoli lungo l'alzaia da aprile a ottobre.", "Cani benvenuti in dehors.", "Degustazione solo qui, mar–sab a cena."]
    },
    {
      name: "Vigevano", addr: "Via Vigevano 17", cap: "20144 Milano", phone: "+39 02 8457 2211",
      email: "vigevano@panettopizza.it", img: "assets/forno.webp", alt: "Fiamma viva dentro il forno a legna",
      tasting: false,
      hours: { 0: [[1140, 1380]], 1: [], 2: [[720, 870], [1140, 1380]], 3: [[720, 870], [1140, 1380]], 4: [[720, 870], [1140, 1380]], 5: [[720, 870], [1140, 1470]], 6: [[720, 870], [1140, 1470]] },
      rules: ["Banco con dieci sgabelli davanti al forno.", "Bambini sotto i 10 anni fino alle 20:30.", "Domenica a pranzo: solo eventi privati."]
    }
  ];

  var CATS = [
    { id: "inizio", n: "Per iniziare" },
    { id: "fritti", n: "Fritti" },
    { id: "antipasti", n: "Antipasti" },
    { id: "classiche", n: "Pizze classiche", short: "Classiche" },
    { id: "casa", n: "Pizze Panetto", short: "Panetto", note: "Le nostre. Cambiano con le stagioni, qualcuna resta." },
    { id: "dolci", n: "Dolci" }
  ];

  var MENU = [
    { id: "olive", c: "inizio", n: "Olive di Gaeta", t: "Vg", p: 4, d: "in salamoia leggera, scorza d'arancia, finocchietto", ing: [["Olive di Gaeta", "Itri, Lazio"], ["Arancia", "Ribera, Sicilia"], ["Finocchietto", "Cilento"]], al: "nessuno" },
    { id: "pane", c: "inizio", n: "Pane e olio", t: "V", p: 5, d: "pane di semola del giorno, olio nuovo della Sabina, sale di Cervia", img: "pane", ing: [["Semola rimacinata", "Altamura, Puglia"], ["Olio extravergine", "Sabina DOP"], ["Sale integrale", "Saline di Cervia"]], al: "glutine" },
    { id: "burro", c: "inizio", n: "Burro e alici", t: "", p: 7, d: "pane tostato, burro di latte di bufala, alici di Cetara", ing: [["Burro di bufala", "Paestum"], ["Alici sotto sale", "Cetara"], ["Pane di semola", "fatto da noi"]], al: "glutine, latte, pesce" },
    { id: "montanarine", c: "fritti", n: "Montanarine", t: "V", p: 9, d: "tre pizzette fritte, pomodoro arrostito, basilico, parmigiano 30 mesi", ing: [["Impasto Panetto", "72 ore"], ["Pomodoro San Marzano", "Agro Sarnese-Nocerino"], ["Parmigiano 30 mesi", "Bibbiano, RE"]], al: "glutine, latte" },
    { id: "arancino", c: "fritti", n: "Arancino al ragù", t: "", p: 7, d: "riso Carnaroli, ragù della domenica, piselli, provola affumicata", img: "fritti", ing: [["Riso Carnaroli", "Lomellina, PV"], ["Ragù di manzo e maiale", "sei ore sul fuoco"], ["Provola affumicata", "Agerola"]], al: "glutine, latte, uova, sedano" },
    { id: "zeppoline", c: "fritti", n: "Zeppoline alle alghe", t: "V", p: 6, d: "pasta cresciuta, lattuga di mare, sale affumicato", ing: [["Lattuga di mare", "Golfo di Napoli"], ["Farina tipo 1", "macinata a pietra"], ["Sale affumicato", "legno di faggio"]], al: "glutine" },
    { id: "zucca", c: "antipasti", n: "Zucca, nocciole e salvia", t: "Vg", p: 11, d: "zucca mantovana arrosto e in crema, nocciole tostate, salvia fritta", ing: [["Zucca mantovana", "Sabbioneta, MN"], ["Nocciole", "Langhe, CN"], ["Salvia", "orto di Cascina Corte, Parco Sud"]], al: "frutta a guscio" },
    { id: "burrata", c: "antipasti", n: "Burrata e cachi", t: "V", p: 13, d: "burrata di Andria, cachi maturi, aceto di mele, pepe lungo", ing: [["Burrata", "Andria, Puglia"], ["Cachi", "Vignola, MO"], ["Pepe lungo", "Giava"]], al: "latte" },
    { id: "polpette", c: "antipasti", n: "Polpette al sugo", t: "", p: 12, d: "manzo e pane raffermo, sugo della domenica, basilico", ing: [["Manzo", "Fassona, Piemonte"], ["Pomodoro", "Agro Sarnese-Nocerino"], ["Pecorino", "Lazio"]], al: "glutine, latte, uova" },
    { id: "radicchio", c: "antipasti", n: "Radicchio e arance", t: "Vg", p: 9, d: "radicchio tardivo, arance tarocco, olive nere, olio agli agrumi", ing: [["Radicchio tardivo", "Treviso IGP"], ["Arance tarocco", "Lentini, SR"], ["Olive nere", "Gaeta"]], al: "nessuno" },
    { id: "marinara", c: "classiche", n: "Marinara", t: "Vg", p: 8, d: "pomodoro, aglio dell'Ufita, origano di montagna, olio extravergine", img: "marinara", ing: [["Pomodoro San Marzano", "Agro Sarnese-Nocerino"], ["Aglio", "Ufita, AV"], ["Origano", "Monti Lattari"]], al: "glutine" },
    { id: "margherita", c: "classiche", n: "Margherita", t: "V", p: 10, d: "pomodoro, fior di latte di Agerola, basilico, parmigiano, olio extravergine", img: "margherita", ing: [["Pomodoro San Marzano", "Agro Sarnese-Nocerino"], ["Fior di latte", "Agerola"], ["Basilico", "Prà, Genova"]], al: "glutine, latte" },
    { id: "bufala", c: "classiche", n: "Bufala", t: "V", p: 13, d: "pomodoro, mozzarella di bufala campana messa a crudo, basilico", ing: [["Mozzarella di bufala", "Battipaglia"], ["Pomodoro", "Agro Sarnese-Nocerino"], ["Olio extravergine", "Sabina DOP"]], al: "glutine, latte" },
    { id: "diavola", c: "classiche", n: "Diavola", t: "", p: 13, d: "pomodoro, fior di latte, salame piccante calabrese, olio al peperoncino", img: "diavola", ing: [["Salame piccante", "Spilinga, VV"], ["Fior di latte", "Agerola"], ["Peperoncino", "Diamante, CS"]], al: "glutine, latte" },
    { id: "cosacca", c: "classiche", n: "Cosacca", t: "V", p: 11, d: "pomodoro, pecorino romano grattugiato, basilico, olio extravergine", ing: [["Pecorino romano", "Lazio"], ["Pomodoro", "Agro Sarnese-Nocerino"], ["Basilico", "Prà, Genova"]], al: "glutine, latte" },
    { id: "salsiccia", c: "classiche", n: "Salsiccia e friarielli", t: "", p: 15, d: "fior di latte affumicato, friarielli saltati, salsiccia di maiale nero", ing: [["Friarielli", "Acerra, NA"], ["Salsiccia di maiale nero", "Caserta"], ["Provola", "Agerola"]], al: "glutine, latte" },
    { id: "navigli", c: "casa", n: "Navigli", t: "V", p: 16, d: "bianca, gorgonzola dolce, pere Williams, noci, miele di castagno", img: "bianca", ing: [["Gorgonzola dolce", "Novara"], ["Pere Williams", "Mantova"], ["Miele di castagno", "Valtellina"]], al: "glutine, latte, frutta a guscio" },
    { id: "ossobuco", c: "casa", n: "Ossobuco", t: "", p: 19, d: "crema allo zafferano, ragù di ossobuco, gremolata di limone e prezzemolo", ing: [["Zafferano in pistilli", "Navelli, AQ"], ["Ossobuco di vitello", "Lombardia"], ["Limone", "Amalfi"]], al: "glutine, latte, sedano" },
    { id: "verde", c: "casa", n: "Verde", t: "V", p: 16, d: "crema di zucchine, stracciatella, menta, scorza di limone, pepe", img: "verde", ing: [["Stracciatella", "Gioia del Colle"], ["Zucchine", "Cascina Corte, Parco Sud"], ["Menta", "orto di casa"]], al: "glutine, latte" },
    { id: "crudo", c: "casa", n: "Crudo e fichi", t: "", p: 17, d: "fior di latte, crudo di Parma 24 mesi, fichi caramellati, rucola", img: "crudo", ing: [["Prosciutto crudo 24 mesi", "Langhirano, PR"], ["Fichi", "Cosenza"], ["Rucola", "Parco Sud"]], al: "glutine, latte" },
    { id: "domenica", c: "casa", n: "La Domenica", t: "", p: 18, d: "ripieno al forno: ricotta di bufala, salame napoletano, pepe; pomodoro sopra", ing: [["Ricotta di bufala", "Battipaglia"], ["Salame napoletano", "Sorrento"], ["Pomodoro", "Agro Sarnese-Nocerino"]], al: "glutine, latte" },
    { id: "zuccapizza", c: "casa", n: "Zucca e castagne", t: "Vg", p: 16, d: "crema di zucca, castagne arrosto, cavolo nero croccante, olio al rosmarino", ing: [["Zucca", "Sabbioneta, MN"], ["Castagne", "Valle Camonica"], ["Cavolo nero", "Parco Sud"]], al: "glutine" },
    { id: "tiramisu", c: "dolci", n: "Tiramisù", t: "V", p: 7, d: "savoiardi, mascarpone, caffè della moka, cacao amaro", ing: [["Mascarpone", "Lodi"], ["Caffè", "torrefazione di via Tortona"], ["Cacao", "Ecuador"]], al: "glutine, latte, uova" },
    { id: "cioccolato", c: "dolci", n: "Piegata al cioccolato", t: "V", p: 8, d: "impasto ripiegato, cioccolato fondente 70%, nocciole, zucchero a velo", img: "dolce", ing: [["Cioccolato 70%", "Perù"], ["Nocciole", "Langhe, CN"], ["Impasto Panetto", "72 ore"]], al: "glutine, latte, frutta a guscio" },
    { id: "graffa", c: "dolci", n: "Graffa calda", t: "V", p: 6, d: "ciambella di patate fritta al momento, zucchero e cannella", ing: [["Patate", "Avezzano, AQ"], ["Cannella", "Ceylon"], ["Burro", "Montichiari, BS"]], al: "glutine, latte, uova" },
    { id: "fiordilatte", c: "dolci", n: "Fiordilatte e olio", t: "V", p: 6, d: "gelato al fiordilatte, olio extravergine della Sabina, sale in fiocchi", ing: [["Latte intero", "Alta Brianza"], ["Olio extravergine", "Sabina DOP"], ["Sale in fiocchi", "Trapani"]], al: "latte" }
  ];

  var TASTING = [
    ["Pane, olio e burro di bufala", "semola del giorno, burro montato al momento"],
    ["Montanarina al pomodoro", "fritta, una a testa"],
    ["Padellino cacio e pepe", "cotto in teglia, croccante sotto"],
    ["Margherita a 72 ore", "due spicchi, nient'altro"],
    ["La pizza del mese", "novembre: zucca, castagne, provola"],
    ["Ripieno al forno", "ricotta di bufala e salame napoletano"],
    ["Graffa e fiordilatte all'olio", "per chiudere"]
  ];

  /* ---------------------------------------------------- ora di Roma */
  // ?t=2026-11-14T23:50 forza l'orologio (wall clock di Roma) per le prove
  var forced = null;
  try {
    var q = new URLSearchParams(location.search).get("t");
    var mm = q && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(q);
    if (mm) forced = { y: +mm[1], m: +mm[2], d: +mm[3], min: (+mm[4]) * 60 + (+mm[5]) };
  } catch (e) { forced = null; }

  function romeNow() {
    if (forced) {
      return { y: forced.y, m: forced.m, d: forced.d, min: forced.min, dow: new Date(Date.UTC(forced.y, forced.m - 1, forced.d)).getUTCDay() };
    }
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) {
      var n = new Date(); parts = { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate(), hour: n.getHours(), minute: n.getMinutes() };
    }
    var y = +parts.year, m = +parts.month, d = +parts.day, h = (+parts.hour) % 24;
    return { y: y, m: m, d: d, min: h * 60 + (+parts.minute), dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
  }
  function dayFrom(now, k) {
    var t = new Date(Date.UTC(now.y, now.m - 1, now.d + k));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), dow: t.getUTCDay(), k: k };
  }

  function venueStatus(v, now) {
    var m = now.min, dw = now.dow, i, iv;
    var today = v.hours[dw] || [];
    for (i = 0; i < today.length; i++) { iv = today[i]; if (m >= iv[0] && m < iv[1]) return { open: true, closes: iv[1], left: iv[1] - m }; }
    var yest = v.hours[(dw + 6) % 7] || [];
    for (i = 0; i < yest.length; i++) { iv = yest[i]; if (iv[1] > 1440 && m < iv[1] - 1440) return { open: true, closes: iv[1], left: iv[1] - 1440 - m }; }
    for (var k = 0; k < 8; k++) {
      var list = v.hours[(dw + k) % 7] || [];
      for (i = 0; i < list.length; i++) {
        if (k === 0 && list[i][0] <= m) continue;
        return { open: false, k: k, opens: list[i][0], dow: (dw + k) % 7 };
      }
    }
    return { open: false, k: -1 };
  }
  function statusText(st) {
    if (st.open) return st.left <= 45 ? "Aperto · chiude tra " + st.left + " min" : "Aperto · chiude alle " + fmtMin(st.closes);
    if (st.k < 0) return "Chiuso";
    var when = st.k === 0 ? "alle " : st.k === 1 ? "domani alle " : DAYS_SHORT[st.dow] + " alle ";
    return "Chiuso · apre " + when + fmtMin(st.opens);
  }
  function renderStatus() {
    var now = romeNow();
    var html = VENUES.map(function (v) {
      var st = venueStatus(v, now);
      return '<li data-open="' + st.open + '"><i class="pt-dot' + (st.open ? " is-open" : "") + '" aria-hidden="true"></i><span>' + v.name + " — " + statusText(st) + "</span></li>";
    }).join("");
    ["railStatus", "mStatus", "heroStatus"].forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = html; });
    renderVenue(false);
    if (chapter >= 0 && CHAPTERS[chapter] && CHAPTERS[chapter].id === "sedi") renderMid(chapter, true);
  }

  /* ------------------------------------------------------- campo di lettere */
  var HERO_WIDE = [["P", 25, 35, -22], ["i", 38, 30, 13], ["z", 52, 38, 27], ["z", 67, 31, -17], ["a", 85, 37, -7],
    ["e", 11, 80, 29], ["b", 27, 77, -12], ["a", 43, 83, 17], ["s", 58, 78, -25], ["t", 73, 82, 35], ["a", 90, 77, -13]];
  var HERO_TALL = [["P", 15, 45, -18], ["i", 31, 41, 12], ["z", 48, 47, 24], ["z", 66, 42, -16], ["a", 86, 46, -8],
    ["e", 10, 67, 26], ["b", 27, 64, -12], ["a", 44, 69, 16], ["s", 60, 64, -22], ["t", 76, 68, 32], ["a", 91, 64, -12]];
  var FOOT_WIDE = [["C", 33, 40, -16], ["i", 49, 34, 14], ["a", 65, 42, -22], ["o", 84, 36, 18]];
  var FOOT_TALL = [["C", 18, 24, -16], ["i", 40, 20, 14], ["a", 62, 26, -22], ["o", 84, 21, 18]];

  function seeded(seed) {
    var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function Field(el, opts) {
    this.el = el; this.opts = opts || {}; this.glyphs = []; this.visible = false; this.rect = null;
  }
  Field.prototype.build = function (layout, fs) {
    var el = this.el;
    el.innerHTML = "";
    el.style.setProperty("--fs", fs);
    var rnd = seeded(layout.map(function (g) { return g[0]; }).join(""));
    this.glyphs = layout.map(function (g, i) {
      var o = document.createElement("span"); o.className = "pt-gl";
      o.style.setProperty("--x", g[1] + "%"); o.style.setProperty("--y", g[2] + "%");
      o.style.setProperty("--r", g[3] + "deg"); o.style.setProperty("--d", (i * 55) + "ms");
      var inn = document.createElement("span"); inn.textContent = g[0];
      o.appendChild(inn); el.appendChild(o);
      return { o: o, i: inn, k: 0.6 + rnd() * 0.8, s: rnd() > 0.5 ? 1 : -1, ph: rnd() * 6.28, cx: 0, cy: 0 };
    });
    this.measure();
  };
  Field.prototype.measure = function () {
    var r = this.el.getBoundingClientRect();
    this.glyphs.forEach(function (g) {
      var b = g.o.getBoundingClientRect();
      g.cx = b.left + b.width / 2 - r.left; g.cy = b.top + b.height / 2 - r.top;
    });
  };
  Field.prototype.enter = function () {
    var el = this.el;
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-in"); }); });
  };

  // layout automatico per le carte (nome del piatto, importo del regalo)
  function wordLayout(text, seed, box) {
    box = box || { x0: 13, x1: 87, y0: 26, y1: 66 };
    var words = text.split(/\s+/).filter(Boolean), rows = [], cur = "";
    words.forEach(function (w) {
      if (!cur) cur = w;
      else if ((cur + " " + w).length <= 8) cur += " " + w;
      else { rows.push(cur); cur = w; }
    });
    if (cur) rows.push(cur);
    while (rows.length > 3) { var last = rows.pop(); rows[rows.length - 1] += " " + last; }
    // una parola lunga si spezza in due righe, come su un manifesto
    while (rows.length < 3) {
      var li = -1, ll = 6;
      rows.forEach(function (r, i) { if (r.length > ll) { ll = r.length; li = i; } });
      if (li < 0) break;
      var r0 = rows[li], cut = r0.indexOf(" ") > 0 ? r0.indexOf(" ") : Math.ceil(r0.length / 2);
      rows.splice(li, 1, r0.slice(0, cut).trim(), r0.slice(cut).trim());
    }
    var rnd = seeded(seed), out = [], longest = 1;
    rows.forEach(function (r) { longest = Math.max(longest, r.length); });
    rows.forEach(function (row, ri) {
      var chars = row.split(""), n = chars.length;
      var y = rows.length === 1 ? (box.y0 + box.y1) / 2 : box.y0 + (box.y1 - box.y0) * ri / (rows.length - 1);
      chars.forEach(function (ch, ci) {
        if (ch === " ") return;
        var x = n === 1 ? 50 : box.x0 + (box.x1 - box.x0) * ci / (n - 1);
        out.push([ch, +(x + (rnd() - 0.5) * 4).toFixed(1), +(y + (rnd() - 0.5) * 8).toFixed(1), Math.round((rnd() - 0.5) * 56)]);
      });
    });
    var fs = Math.min(150 / longest, 46, 120 / (rows.length * 1.15));
    return { layout: out, fs: fs.toFixed(1) + "cqw" };
  }

  var heroField = new Field($("#heroField"), { push: true, blur: $("#pt-smear-hero feGaussianBlur") });
  var footField = new Field($("#footField"), { push: true, blur: $("#pt-smear-foot feGaussianBlur") });
  var heroTall = null;
  function layoutBigFields(force) {
    var tall = window.innerWidth < 700 || window.innerWidth / window.innerHeight < 0.85;
    if (!force && tall === heroTall) { heroField.measure(); footField.measure(); return; }
    heroTall = tall;
    var heroIn = heroField.el.classList.contains("is-in");
    heroField.build(tall ? HERO_TALL : HERO_WIDE, tall ? "46vw" : "min(36vw, 64vh)");
    footField.build(tall ? FOOT_TALL : FOOT_WIDE, tall ? "50vw" : "min(30vw, 58vh)");
    if (heroIn) heroField.el.classList.add("is-in");
  }

  /* ------------------------------------------- velocità di scorrimento → lettere */
  var pointer = { x: -9999, y: -9999 };
  var sv = 0, lastY = window.scrollY, lastT = performance.now(), lastSd = { hero: -1, foot: -1 }, rollerN = 0;
  var roller = $("#roller");
  window.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") { pointer.x = e.clientX; pointer.y = e.clientY; } }, { passive: true });
  document.addEventListener("pointerleave", function () { pointer.x = pointer.y = -9999; });

  function driveField(f, key, n, t) {
    if (!f.visible || !f.glyphs.length) return;
    var r = f.el.getBoundingClientRect(), R = Math.max(220, r.width * 0.2);
    var red = reduce();
    for (var j = 0; j < f.glyphs.length; j++) {
      var g = f.glyphs[j], dx = 0, dy = 0, rot = 0, sk = 0, sy = 1;
      if (!red) {
        dx = Math.sin(t * 0.41 + g.ph) * 6; dy = Math.cos(t * 0.33 + g.ph) * 5; rot = Math.sin(t * 0.27 + g.ph) * 2.4;
        var px = pointer.x - r.left - g.cx, py = pointer.y - r.top - g.cy, d = Math.sqrt(px * px + py * py);
        if (f.opts.push && d < R && d > 0.1) { var fo = Math.pow(1 - d / R, 2) * 46; dx -= px / d * fo; dy -= py / d * fo; }
        dx += n * 22 * g.s; dy += n * 80 * g.k; rot += n * 16 * g.s; sk = n * 12; sy = 1 + Math.abs(n) * 0.42;
      }
      g.i.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) rotate(" + rot.toFixed(2) + "deg) skewY(" + sk.toFixed(2) + "deg) scaleY(" + sy.toFixed(3) + ")";
    }
    var sd = red ? 0 : Math.min(14, Math.abs(sv) / 90);
    if (Math.abs(sd - lastSd[key]) > 0.05) {
      lastSd[key] = sd;
      if (f.opts.blur) f.opts.blur.setAttribute("stdDeviation", "0 " + sd.toFixed(2));
      f.el.classList.toggle("is-smear", sd > 0.4);
    }
  }

  function frame(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000)); lastT = now;
    var y = window.scrollY, v = (y - lastY) / dt; lastY = y;
    sv += (v - sv) * 0.2; if (Math.abs(sv) < 4) sv = 0;
    var n = clamp(sv / 2400, -1, 1), t = now / 1000;
    driveField(heroField, "hero", n, t);
    driveField(footField, "foot", n, t);
    if (roller && !isMobile()) {
      var rn = reduce() ? 0 : n;
      if (Math.abs(rn - rollerN) > 0.002 || (rn === 0 && rollerN !== 0)) {
        rollerN = rn;
        roller.style.transform = rn === 0 ? "" : "skewY(" + (-rn * 5).toFixed(2) + "deg) scaleY(" + (1 + Math.abs(rn) * 0.16).toFixed(3) + ")";
      }
    }
    window.__ptVel = sv;
    requestAnimationFrame(frame);
  }

  /* -------------------------------------------- rivelazione lettera per lettera */
  function splitChars(el) {
    var words = el.textContent.split(/(\s+)/), n = 0, label = el.textContent;
    el.textContent = "";
    words.forEach(function (w) {
      if (!w) return;
      if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(" ")); return; }
      var ws = document.createElement("span"); ws.className = "pt-w"; ws.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(w, function (ch) {
        var c = document.createElement("span"); c.className = "pt-c"; c.style.setProperty("--i", n++); c.textContent = ch; ws.appendChild(c);
      });
      el.appendChild(ws);
    });
    var sr = document.createElement("span"); sr.className = "pt-sr"; sr.textContent = label; el.appendChild(sr);
  }
  function initReveal() {
    var els = $$("[data-split]");
    els.forEach(splitChars);
    if (reduce() || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-go"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-go"); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* --------------------------------------------------- capitoli che rotolano */
  var CHAPTERS = $$(".pt-sec[data-chapter]").map(function (s) {
    var p = s.getAttribute("data-chapter").split("|");
    return { id: s.id, el: s, eye: p[0], l1: p[1], l2: p[2] };
  });
  var chapter = -1, rollCells = [];
  (function buildRoller() {
    var rows = [$("#rollEye"), $("#rollL1"), $("#rollL2")], keys = ["eye", "l1", "l2"];
    rollCells = rows.map(function (row, r) {
      return CHAPTERS.map(function (c) { var s = document.createElement("span"); s.className = "pt-rl"; s.textContent = c[keys[r]]; row.appendChild(s); return s; });
    });
    var pips = $("#rollPips"); CHAPTERS.forEach(function () { pips.appendChild(document.createElement("i")); });
  })();
  function showChapter(i) {
    if (i === chapter) return;
    chapter = i;
    rollCells.forEach(function (row) { row.forEach(function (el, j) { el.className = "pt-rl" + (j === i ? " is-now" : j < i ? " is-past" : ""); }); });
    $$("#rollPips i").forEach(function (p, j) { p.classList.toggle("on", j === i); });
    $$(".pt-nav-a[data-spy]").forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("data-spy") === CHAPTERS[i].id); });
    renderMid(i, false);
  }
  function updateChapter() {
    var line = window.innerHeight * 0.4, next = 0;
    for (var i = 0; i < CHAPTERS.length; i++) if (CHAPTERS[i].el.getBoundingClientRect().top <= line) next = i;
    if (next === chapter) return;
    var edgeSec = CHAPTERS[Math.max(next, chapter < 0 ? 0 : chapter)];
    if (chapter < 0 || Math.abs(edgeSec.el.getBoundingClientRect().top - line) > 24) showChapter(next);
  }

  var midIdx = $("#midIndex"), midTimer = 0;
  function renderMid(i, instant) {
    var c = CHAPTERS[i]; if (!c) return;
    var fill = function () {
      var h = "";
      if (c.id === "menu") {
        h = '<li><button type="button" data-midcat="all"' + (menuState.cat === "all" ? ' class="is-on"' : "") + ">Tutto</button></li>" + CATS.map(function (k) {
          return '<li><button type="button" data-midcat="' + k.id + '"' + (menuState.cat === k.id ? ' class="is-on"' : "") + ">" + k.n + "</button></li>";
        }).join("");
      } else if (c.id === "sedi") {
        var now = romeNow();
        h = VENUES.map(function (v, j) {
          var st = venueStatus(v, now);
          return '<li><button type="button" data-midvenue="' + j + '"' + (venueIdx === j ? ' class="is-on"' : "") + ">" + (j + 1) + "  " + v.name + "</button><small>" + (st.open ? "aperto" : "chiuso") + "</small></li>";
        }).join("");
      } else {
        var notes = { storia: "Dal 2018. Due forni a legna, tre minuti a piedi l'uno dall'altro.", degustazione: "mar–sab · 19:30 e 21:00 · solo Navigli · da 2 a 6 persone", regala: "Valida dodici mesi in tutte e due le sedi. Importo libero da € 20 a € 300.", lavora: "lavoro@panettopizza.it\nciao@panettopizza.it\neventi@panettopizza.it" };
        h = '<li class="pt-midx-note">' + (notes[c.id] || "").replace(/\n/g, "<br>") + "</li>";
      }
      midIdx.innerHTML = h;
      midIdx.classList.remove("is-off");
    };
    clearTimeout(midTimer);
    if (instant || reduce()) { fill(); return; }
    midIdx.classList.add("is-off");
    midTimer = setTimeout(fill, 180);
  }
  midIdx.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.hasAttribute("data-midcat")) { setCat(b.getAttribute("data-midcat")); scrollToEl($("#menu")); renderMid(chapter, true); }
    if (b.hasAttribute("data-midvenue")) { setVenue(+b.getAttribute("data-midvenue")); renderMid(chapter, true); }
  });

  function scrollToEl(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - (isMobile() ? 0 : 0);
    window.scrollTo({ top: top, behavior: reduce() ? "auto" : "smooth" });
  }

  /* ------------------------------------------------- colori della colonna */
  var hero = $("#hero"), foot = $("#foot");
  var railTop = document.querySelector(".pt-rail-top"), railBot = document.querySelector(".pt-rail-bot");
  function updateTone() {
    var hb = hero.getBoundingClientRect().bottom, ft = foot.getBoundingClientRect().top;
    function cream(y) { return !(hb > y || ft < y); }
    document.body.classList.toggle("in-poster", hb > window.innerHeight * 0.5 || ft < window.innerHeight * 0.5);
    if (isMobile()) { document.body.classList.toggle("on-cream", cream(26)); return; }
    // desktop: ogni blocco del rail sceglie il colore sul fondo che ha sotto il proprio centro
    var top = railTop.getBoundingClientRect(), bot = railBot.getBoundingClientRect();
    var cT = cream((top.top + top.bottom) / 2), cB = cream((bot.top + bot.bottom) / 2);
    document.body.classList.toggle("on-cream", cT);
    document.body.classList.toggle("on-cream-b", cB && !cT);
    document.body.classList.toggle("on-grad-b", !cB && cT);
  }

  /* ------------------------------------------------------------------ menu */
  var menuState = { cat: "all", v: false, vg: false };
  var tabsEl = $("#menuTabs"), listEl = $("#menuList");
  function passDiet(it) {
    if (menuState.vg) return it.t === "Vg";
    if (menuState.v) return it.t === "V" || it.t === "Vg";
    return true;
  }
  function visibleItems() {
    return MENU.filter(function (it) { return passDiet(it) && (menuState.cat === "all" || it.c === menuState.cat); });
  }
  function renderTabs() {
    var tabs = [{ id: "all", n: "Tutto" }].concat(CATS);
    tabsEl.innerHTML = tabs.map(function (t) {
      var cnt = MENU.filter(function (it) { return passDiet(it) && (t.id === "all" || it.c === t.id); }).length;
      return '<button type="button" role="tab" class="pt-tab" data-cat="' + t.id + '" aria-selected="' + (menuState.cat === t.id) + '">' + (t.short || t.n) + "<small>" + cnt + "</small></button>";
    }).join("");
  }
  function renderMenu() {
    renderTabs();
    var items = visibleItems(), html = "";
    CATS.forEach(function (c) {
      var its = items.filter(function (it) { return it.c === c.id; });
      if (!its.length) return;
      html += '<div class="pt-cat" id="cat-' + c.id + '"><h3 class="pt-cat-h">' + c.n + "</h3>" + (c.note ? '<p class="pt-cat-note">' + c.note + "</p>" : "");
      its.forEach(function (it) {
        html += '<button type="button" class="pt-item" data-id="' + it.id + '" aria-haspopup="dialog">' +
          '<span class="pt-item-n">' + it.n + (it.t ? " <em>(" + it.t + ")</em>" : "") + "</span>" +
          '<span class="pt-item-p">' + euro(it.p) + "</span>" +
          '<span class="pt-item-d">' + it.d + "</span>" +
          '<span class="pt-item-go" aria-hidden="true">' + (it.img ? '<span class="pt-sq"><img src="assets/' + it.img + '.webp" alt="" width="560" height="560" loading="lazy"></span>' : "") + "manifesto ↗</span>" +
          "</button>";
      });
      html += "</div>";
    });
    listEl.innerHTML = html;
    $("#menuEmpty").hidden = items.length > 0;
    $("#menuCount").textContent = items.length === 1 ? "1 piatto" : items.length + " piatti";
    if (chapter >= 0 && CHAPTERS[chapter].id === "menu") renderMid(chapter, true);
  }
  function setCat(id) { menuState.cat = id; renderMenu(); }
  tabsEl.addEventListener("click", function (e) { var b = e.target.closest(".pt-tab"); if (b) setCat(b.getAttribute("data-cat")); });
  tabsEl.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var tabs = $$(".pt-tab", tabsEl), i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var j = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setCat(tabs[j].getAttribute("data-cat")); $$(".pt-tab", tabsEl)[j].focus(); e.preventDefault();
  });
  $("#fV").addEventListener("change", function () { menuState.v = this.checked; renderMenu(); });
  $("#fVg").addEventListener("change", function () { menuState.vg = this.checked; renderMenu(); });
  $("#menuReset").addEventListener("click", function () { menuState = { cat: "all", v: false, vg: false }; $("#fV").checked = false; $("#fVg").checked = false; renderMenu(); });
  listEl.addEventListener("click", function (e) {
    var b = e.target.closest(".pt-item"); if (!b) return;
    var list = visibleItems(), id = b.getAttribute("data-id");
    openPoster(list, list.findIndex(function (it) { return it.id === id; }), b);
  });

  /* ------------------------------------------------ degustazione */
  $("#tastList").innerHTML = TASTING.map(function (t, i) { return "<li><span>" + pad(i + 1) + "</span><div><b>" + t[0] + "</b><small>" + t[1] + "</small></div></li>"; }).join("");

  /* ------------------------------------------------ dialoghi: apertura, focus */
  var openStack = [];
  function trapKey(e) {
    var top = openStack[openStack.length - 1]; if (!top) return;
    if (e.key === "Escape") { e.preventDefault(); top.close(); return; }
    if (top.keys && top.keys(e)) return;
    if (e.key !== "Tab") return;
    var f = $$('button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])', top.el)
      .filter(function (x) { return x.offsetParent !== null && !x.closest("[inert]") && !x.closest('[aria-hidden="true"]'); });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener("keydown", trapKey);
  function lockScroll(on) { document.documentElement.style.overflow = on ? "hidden" : ""; }
  function makeDialog(el, opts) {
    var d = { el: el, opener: null, keys: opts.keys };
    d.open = function (opener) {
      d.opener = opener || document.activeElement;
      el.hidden = false; lockScroll(true);
      openStack.push(d);
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-open"); }); });
      if (opts.onOpen) opts.onOpen();
    };
    d.close = function () {
      if (el.hidden) return;
      el.classList.remove("is-open");
      openStack = openStack.filter(function (x) { return x !== d; });
      if (!openStack.length) lockScroll(false);
      setTimeout(function () { if (!el.classList.contains("is-open")) el.hidden = true; }, reduce() ? 0 : 260);
      if (opts.onClose) opts.onClose();
      if (d.opener && d.opener.focus && document.contains(d.opener)) { try { d.opener.focus({ preventScroll: true }); } catch (e) { d.opener.focus(); } }
    };
    el.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) d.close(); });
    return d;
  }

  /* ------------------------------------------------ carta-manifesto */
  var posterEl = $("#poster"), pcStage = $("#pcStage"), pcField = new Field($("#pcField"), {});
  var poster = { list: [], i: 0, flipped: false, flipTimer: 0 };
  var posterDlg = makeDialog(posterEl, {
    keys: function (e) {
      if (e.key === "ArrowRight") { stepPoster(1); return true; }
      if (e.key === "ArrowLeft") { stepPoster(-1); return true; }
      return false;
    },
    onOpen: function () { setTimeout(function () { $("#pcFlip").focus({ preventScroll: true }); }, 30); }
  });
  function setFlip(on) {
    poster.flipped = on;
    pcStage.classList.toggle("is-flipped", on);
    clearTimeout(poster.flipTimer);
    var apply = function () {
      $("#pcFront").setAttribute("aria-hidden", String(on)); $("#pcBack").setAttribute("aria-hidden", String(!on));
      $("#pcFront").inert = on; $("#pcBack").inert = !on;
      (on ? $("#pcFlipBack") : $("#pcFlip")).focus({ preventScroll: true });
    };
    if (reduce()) apply(); else poster.flipTimer = setTimeout(apply, 190);
  }
  function fillPoster() {
    var it = poster.list[poster.i]; if (!it) return;
    var cat = CATS.filter(function (c) { return c.id === it.c; })[0];
    $("#posterN").textContent = pad(poster.i + 1) + " / " + pad(poster.list.length);
    $("#pcCat").textContent = cat ? cat.n : "";
    $("#posterTitle").textContent = it.n;
    $("#pcPrice").textContent = euro(it.p);
    $("#pcbName").textContent = it.n;
    $("#pcbTag").textContent = (it.t === "Vg" ? "(Vg) vegano · " : it.t === "V" ? "(V) vegetariano · " : "") + euro(it.p);
    $("#pcbDesc").textContent = it.d;
    $("#pcbIng").innerHTML = it.ing.map(function (g) { return "<li><span>" + g[0] + "</span><span>" + g[1] + "</span></li>"; }).join("");
    $("#pcbAll").textContent = "Allergeni: " + it.al + ".";
    var sq = $("#pcbSq");
    if (it.img) { sq.hidden = false; $("#pcbImg").src = "assets/" + it.img + ".webp"; $("#pcbImg").alt = it.n; } else sq.hidden = true;
    var lay = wordLayout(it.n, it.id);
    pcField.el.classList.remove("is-in");
    pcField.build(lay.layout, lay.fs);
    pcField.enter();
    $("#posterPrev").disabled = poster.list.length < 2; $("#posterNext").disabled = poster.list.length < 2;
  }
  function openPoster(list, i, opener) {
    poster.list = list; poster.i = Math.max(0, i);
    pcStage.classList.add("is-instant");
    setFlipSilently(false);
    requestAnimationFrame(function () { requestAnimationFrame(function () { pcStage.classList.remove("is-instant"); }); });
    fillPoster();
    posterDlg.open(opener);
  }
  function setFlipSilently(on) {
    poster.flipped = on; pcStage.classList.toggle("is-flipped", on);
    $("#pcFront").setAttribute("aria-hidden", String(on)); $("#pcBack").setAttribute("aria-hidden", String(!on));
    $("#pcFront").inert = on; $("#pcBack").inert = !on;
  }
  function stepPoster(dir) {
    if (poster.list.length < 2) return;
    poster.i = (poster.i + dir + poster.list.length) % poster.list.length;
    if (poster.flipped) {
      pcStage.classList.add("is-instant"); setFlipSilently(false);
      requestAnimationFrame(function () { requestAnimationFrame(function () { pcStage.classList.remove("is-instant"); }); });
    }
    fillPoster();
  }
  $("#pcFlip").addEventListener("click", function () { setFlip(true); });
  $("#pcFlipBack").addEventListener("click", function () { setFlip(false); });
  $("#posterPrev").addEventListener("click", function () { stepPoster(-1); });
  $("#posterNext").addEventListener("click", function () { stepPoster(1); });

  /* ------------------------------------------------------------- sedi */
  var venueIdx = 0;
  function hoursTable(v, todayDow) {
    var order = [1, 2, 3, 4, 5, 6, 0], h = "";
    order.forEach(function (d) {
      var ivs = v.hours[d] || [];
      h += '<dt class="' + (d === todayDow ? "is-today" : "") + '">' + DAYS_SHORT[d] + "</dt><dd>" + (ivs.length ? ivs.map(function (iv) { return fmtMin(iv[0]) + "–" + fmtMin(iv[1]); }).join("  ") : "chiuso") + "</dd>";
    });
    return h;
  }
  function renderVenue(animate) {
    var v = VENUES[venueIdx], now = romeNow(), st = venueStatus(v, now);
    var body = $("#venueBody"), img = $("#venueImg"), sq = img.parentNode;
    var fill = function () {
      $("#venueIdx").textContent = venueIdx + 1; $("#venueTot").textContent = VENUES.length;
      body.innerHTML = "<h3>" + v.name + "</h3><p>" + v.addr + ", " + v.cap + "</p>" +
        '<p class="pt-venue-st" data-open="' + st.open + '"><i class="pt-dot' + (st.open ? " is-open" : "") + '" aria-hidden="true"></i><span>' + statusText(st) + "</span></p>" +
        "<p>Telefono: " + v.phone + "</p><p>Email: " + v.email + "</p>" +
        '<dl class="pt-hours">' + hoursTable(v, now.dow) + "</dl>" +
        '<ul class="pt-rules">' + v.rules.map(function (r) { return "<li>" + r + "</li>"; }).join("") + "</ul>" +
        '<div class="pt-venue-act"><button type="button" class="pt-btn pt-btn-ink pt-btn-sm" data-book data-book-venue="' + venueIdx + '">Prenota a ' + v.name + "</button></div>";
      if (img.getAttribute("src") !== v.img) img.src = v.img;
      img.alt = v.alt;
      body.classList.remove("is-swap"); sq.classList.remove("is-swap");
    };
    if (!animate || reduce()) { fill(); return; }
    body.classList.add("is-swap"); sq.classList.add("is-swap");
    setTimeout(fill, 200);
  }
  function setVenue(i) { venueIdx = (i + VENUES.length) % VENUES.length; renderVenue(true); }
  $("#venuePrev").addEventListener("click", function () { setVenue(venueIdx - 1); });
  $("#venueNext").addEventListener("click", function () { setVenue(venueIdx + 1); });

  /* ------------------------------------------------------- prenotazione */
  var bookEl = $("#book");
  var bk = { formula: "carta", venue: 0, day: -1, slot: null, people: 2, days: [] };
  var bookDlg = makeDialog(bookEl, {
    onOpen: function () { setTimeout(function () { var f = $("#bFormula [aria-pressed='true']"); if (f) f.focus({ preventScroll: true }); }, 30); }
  });
  function limits() { return bk.formula === "tasting" ? [2, 6] : [1, 10]; }
  function slotsFor(v, formula, day, now) {
    var out = [];
    if (formula === "tasting") {
      if (!v.tasting || day.dow === 0 || day.dow === 1) return [];
      out = [1170, 1260];
    } else {
      (v.hours[day.dow] || []).forEach(function (iv) {
        for (var t = Math.ceil(iv[0] / 30) * 30; t <= iv[1] - 75; t += 30) out.push(t);
      });
    }
    if (day.k === 0) out = out.filter(function (t) { return t >= now.min + 30; });
    return out;
  }
  function renderBook() {
    var now = romeNow();
    if (bk.formula === "tasting" && !VENUES[bk.venue].tasting) bk.venue = 0;
    $$("#bFormula button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-formula") === bk.formula)); });
    $("#bVenue").innerHTML = VENUES.map(function (v, i) {
      var dis = bk.formula === "tasting" && !v.tasting;
      return '<button type="button" class="pt-chip" data-venue="' + i + '" aria-pressed="' + (bk.venue === i) + '"' + (dis ? " disabled" : "") + ">" + v.name + "</button>";
    }).join("");
    $("#bVenueHint").textContent = bk.formula === "tasting" ? "La degustazione si fa solo ai Navigli, mar–sab, turni delle 19:30 e delle 21:00." : "";
    var v = VENUES[bk.venue];
    bk.days = [];
    for (var k = 0; k < 14; k++) { var d = dayFrom(now, k); d.slots = slotsFor(v, bk.formula, d, now); bk.days.push(d); }
    if (bk.day < 0 || !bk.days[bk.day] || !bk.days[bk.day].slots.length) {
      bk.day = bk.days.findIndex(function (d) { return d.slots.length > 0; });
    }
    $("#bDays").innerHTML = bk.days.map(function (d, i) {
      var lbl = DAYS_LONG[d.dow] + " " + d.d + " " + MONTHS_LONG[d.m - 1] + (d.slots.length ? "" : ", non disponibile");
      return '<button type="button" class="pt-day" data-day="' + i + '" aria-pressed="' + (bk.day === i) + '" aria-label="' + lbl + '"' + (d.slots.length ? "" : " disabled") + "><span>" + (d.k === 0 ? "oggi" : DAYS_SHORT[d.dow]) + "</span><b>" + d.d + "</b><span>" + MONTHS[d.m - 1] + "</span></button>";
    }).join("");
    var day = bk.days[bk.day];
    var slots = day ? day.slots : [];
    if (bk.slot !== null && slots.indexOf(bk.slot) < 0) bk.slot = null;
    $("#bSlots").innerHTML = slots.length ? slots.map(function (t) {
      return '<button type="button" class="pt-chip" data-slot="' + t + '" aria-pressed="' + (bk.slot === t) + '">' + fmtMin(t) + "</button>";
    }).join("") : '<p class="pt-slots-empty">Nessun orario libero nei prossimi 14 giorni con questa formula.</p>';
    var lim = limits(); bk.people = clamp(bk.people, lim[0], lim[1]);
    $("#bPeople").textContent = bk.people;
    $("#bMinus").disabled = bk.people <= lim[0]; $("#bPlus").disabled = bk.people >= lim[1];
    $("#bPeopleHint").textContent = bk.formula === "tasting" ? "Da 2 a 6 persone, tutto il tavolo." : bk.people >= 10 ? "Oltre 10 persone scrivi a eventi@panettopizza.it" : "";
    var sum = "";
    if (day && bk.slot !== null) {
      sum = DAYS_SHORT[day.dow] + " " + day.d + " " + MONTHS[day.m - 1] + " · " + fmtMin(bk.slot) + " · " + bk.people + (bk.people === 1 ? " persona" : " persone") + " · " + v.name;
      if (bk.formula === "tasting") sum += " · " + euro(58 * bk.people);
    } else sum = "Scegli giorno e orario.";
    $("#bSummary").textContent = sum;
  }
  function openBook(opts, opener) {
    opts = opts || {};
    if (opts.formula) bk.formula = opts.formula;
    if (opts.venue != null && !isNaN(opts.venue)) bk.venue = +opts.venue;
    $("#bookForm").hidden = false; $("#bookDone").hidden = true; $("#bookErr").textContent = "";
    $$("#bookForm [aria-invalid]").forEach(function (x) { x.removeAttribute("aria-invalid"); });
    renderBook();
    if (!mMenuEl.hidden) closeMMenu(true);
    bookDlg.open(opener);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-book]"); if (!b) return;
    e.preventDefault();
    var opts = { formula: b.getAttribute("data-book-formula") || null, venue: b.hasAttribute("data-book-venue") ? +b.getAttribute("data-book-venue") : null };
    if (posterDlg.el.contains(b)) { posterDlg.close(); }
    openBook(opts, b);
  });
  $("#bFormula").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; bk.formula = b.getAttribute("data-formula"); renderBook(); });
  $("#bVenue").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || b.disabled) return; bk.venue = +b.getAttribute("data-venue"); bk.day = -1; renderBook(); });
  $("#bDays").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b || b.disabled) return; bk.day = +b.getAttribute("data-day"); renderBook(); });
  $("#bSlots").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; bk.slot = +b.getAttribute("data-slot"); $("#bookErr").textContent = ""; renderBook(); });
  $("#bMinus").addEventListener("click", function () { bk.people--; renderBook(); });
  $("#bPlus").addEventListener("click", function () { bk.people++; renderBook(); });
  $("#bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#bName"), phone = $("#bPhone"), errs = [];
    [name, phone].forEach(function (x) { x.removeAttribute("aria-invalid"); });
    if (bk.slot === null) errs.push("scegli un orario");
    if (name.value.trim().length < 2) { errs.push("scrivi il tuo nome"); name.setAttribute("aria-invalid", "true"); }
    var digits = phone.value.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) { errs.push("serve un telefono valido"); phone.setAttribute("aria-invalid", "true"); }
    if (errs.length) {
      $("#bookErr").textContent = "Manca qualcosa: " + errs.join(", ") + ".";
      var firstBad = $("#bookForm [aria-invalid='true']"); if (firstBad) firstBad.focus();
      return;
    }
    var day = bk.days[bk.day], v = VENUES[bk.venue];
    var code = "PNT-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $("#bookDoneTxt").textContent = name.value.trim().split(" ")[0] + ", ti aspettiamo " + DAYS_LONG[day.dow] + " " + day.d + " " + MONTHS_LONG[day.m - 1] + " alle " + fmtMin(bk.slot) + " a " + v.name + " (" + v.addr + "), " + bk.people + (bk.people === 1 ? " persona" : " persone") + (bk.formula === "tasting" ? ", degustazione in sette passaggi." : ", alla carta.") + " Ti mandiamo un SMS di conferma.";
    $("#bookCode").textContent = code;
    $("#bookForm").hidden = true; $("#bookDone").hidden = false; $("#bookDone").focus();
    name.value = ""; phone.value = ""; $("#bNote").value = ""; bk.slot = null;
  });

  /* ------------------------------------------------------------- regalo */
  var gift = { amount: 50, custom: false, when: "now" };
  var gField = new Field($("#gField"), {});
  var AMOUNTS = [30, 50, 80, 120];
  function giftAmount() {
    if (!gift.custom) return gift.amount;
    var v = parseFloat($("#gOther").value);
    return isFinite(v) ? v : NaN;
  }
  function renderGiftChips() {
    $("#gAmounts").innerHTML = AMOUNTS.map(function (a) {
      return '<button type="button" class="pt-chip" data-amt="' + a + '" aria-pressed="' + (!gift.custom && gift.amount === a) + '">€ ' + a + "</button>";
    }).join("") + '<button type="button" class="pt-chip" data-amt="other" aria-pressed="' + gift.custom + '">Altro</button>';
    $("#gOtherWrap").hidden = !gift.custom;
  }
  var lastGlyphs = "";
  function renderGiftPreview() {
    var a = giftAmount(), ok = isFinite(a) && a >= 20 && a <= 300;
    var txt = ok ? "€" + Math.round(a) : "€?";
    if (txt !== lastGlyphs) {
      lastGlyphs = txt;
      var lay = wordLayout(txt, "gift" + txt, { x0: 18, x1: 82, y0: 46, y1: 46 });
      gField.el.classList.remove("is-in");
      gField.build(lay.layout, Math.min(parseFloat(lay.fs), 40) + "cqw");
      gField.enter();
    }
    var to = $("#gName").value.trim(), from = $("#gSender").value.trim(), msg = $("#gText").value.trim();
    $("#gTo").textContent = "Per " + (to || "—");
    $("#gMsg").textContent = msg || "Una pizza, offro io.";
    $("#gFrom").textContent = "da " + (from || "—");
    $("#gMsgCount").textContent = $("#gText").value.length + "/140";
    $("#giftSubmit").textContent = ok ? "Regala " + euro(Math.round(a)) : "Regala";
  }
  $("#gAmounts").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var v = b.getAttribute("data-amt");
    if (v === "other") { gift.custom = true; renderGiftChips(); $("#gOther").focus(); }
    else { gift.custom = false; gift.amount = +v; renderGiftChips(); }
    renderGiftPreview();
  });
  ["gOther", "gName", "gSender", "gText", "gEmail"].forEach(function (id) { $("#" + id).addEventListener("input", function () { this.removeAttribute("aria-invalid"); renderGiftPreview(); }); });
  $("#gWhen").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    gift.when = b.getAttribute("data-when");
    $$("#gWhen button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    $("#gDateWrap").hidden = gift.when !== "later";
  });
  function isoDay(d) { return d.y + "-" + pad(d.m) + "-" + pad(d.d); }
  (function setGiftDateBounds() {
    var now = romeNow(); var gd = $("#gDate");
    gd.min = isoDay(dayFrom(now, 1)); gd.max = isoDay(dayFrom(now, 365));
  })();
  $("#giftForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var errs = [], a = giftAmount(), f = function (id) { return $("#" + id); };
    $$("#giftForm [aria-invalid]").forEach(function (x) { x.removeAttribute("aria-invalid"); });
    if (!(isFinite(a) && a >= 20 && a <= 300)) { errs.push("importo tra € 20 e € 300"); if (gift.custom) f("gOther").setAttribute("aria-invalid", "true"); }
    if (f("gName").value.trim().length < 2) { errs.push("nome di chi la riceve"); f("gName").setAttribute("aria-invalid", "true"); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f("gEmail").value.trim())) { errs.push("un'email valida"); f("gEmail").setAttribute("aria-invalid", "true"); }
    if (f("gSender").value.trim().length < 2) { errs.push("il tuo nome"); f("gSender").setAttribute("aria-invalid", "true"); }
    var dateTxt = "oggi, tra pochi minuti";
    if (gift.when === "later") {
      var dv = f("gDate").value;
      if (!dv || dv < f("gDate").min || dv > f("gDate").max) { errs.push("un giorno di invio da domani a un anno"); f("gDate").setAttribute("aria-invalid", "true"); }
      else { var p = dv.split("-"); dateTxt = "il " + (+p[2]) + " " + MONTHS_LONG[+p[1] - 1] + " " + p[0]; }
    }
    if (errs.length) {
      $("#giftErr").textContent = "Manca: " + errs.join(", ") + ".";
      var bad = $("#giftForm [aria-invalid='true']"); if (bad) bad.focus();
      return;
    }
    $("#giftErr").textContent = "";
    var code = "REGALO-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $("#giftDoneTxt").textContent = "Carta da " + euro(Math.round(a)) + " per " + f("gName").value.trim() + ". Arriva a " + f("gEmail").value.trim() + " " + dateTxt + ". Vale dodici mesi, in tutte e due le sedi.";
    $("#giftCode").textContent = code;
    $("#giftForm").hidden = true; $("#giftDone").hidden = false; $("#giftDone").focus({ preventScroll: true });
    toast("Carta regalo pronta: " + code);
  });
  $("#giftAgain").addEventListener("click", function () {
    $("#giftForm").reset(); gift = { amount: 50, custom: false, when: "now" };
    $$("#gWhen button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-when") === "now")); });
    $("#gDateWrap").hidden = true;
    renderGiftChips(); renderGiftPreview();
    $("#giftDone").hidden = true; $("#giftForm").hidden = false; $("#gName").focus();
  });

  /* ------------------------------------------------------------- toast */
  var toastTimer = 0;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 3200);
  }

  /* --------------------------------------------------- colonna: fisarmoniche */
  $$(".pt-acc > button").forEach(function (b) {
    b.addEventListener("click", function () {
      var sub = document.getElementById(b.getAttribute("aria-controls")), open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open)); sub.hidden = !open;
    });
  });
  $(".pt-awards-t").addEventListener("click", function () {
    var open = this.getAttribute("aria-expanded") !== "true";
    this.setAttribute("aria-expanded", String(open)); this.textContent = open ? "Premi −" : "Premi +"; $("#awards").hidden = !open;
  });
  $$("[data-cat-jump]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); setCat(a.getAttribute("data-cat-jump")); scrollToEl($("#menu")); });
  });
  $$("[data-venue-link]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); venueIdx = +a.getAttribute("data-venue-link"); renderVenue(false); scrollToEl($("#sedi")); });
  });
  var rail = $("#rail");
  rail.addEventListener("pointerenter", function () { document.body.classList.add("rail-hover"); });
  rail.addEventListener("pointerleave", function () { document.body.classList.remove("rail-hover"); });
  rail.addEventListener("focusin", function () { document.body.classList.add("rail-hover"); });
  rail.addEventListener("focusout", function () { document.body.classList.remove("rail-hover"); });

  /* ------------------------------------------------------------- menu mobile */
  var mMenuEl = $("#mMenu"), mOpen = $("#mOpen");
  function openMMenu() {
    mMenuEl.hidden = false; mOpen.setAttribute("aria-expanded", "true"); lockScroll(true);
    requestAnimationFrame(function () { requestAnimationFrame(function () { mMenuEl.classList.add("is-open"); }); });
    setTimeout(function () { $("#mClose").focus(); }, 30);
  }
  function closeMMenu(silent) {
    mMenuEl.classList.remove("is-open"); mOpen.setAttribute("aria-expanded", "false");
    if (!openStack.length) lockScroll(false);
    setTimeout(function () { if (!mMenuEl.classList.contains("is-open")) mMenuEl.hidden = true; }, reduce() || silent ? 0 : 250);
    if (!silent) mOpen.focus({ preventScroll: true });
  }
  mOpen.addEventListener("click", openMMenu);
  $("#mClose").addEventListener("click", function () { closeMMenu(false); });
  mMenuEl.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#']"); if (!a) return;
    e.preventDefault(); closeMMenu(true);
    var tgt = $(a.getAttribute("href")); setTimeout(function () { scrollToEl(tgt); }, 10);
  });
  mMenuEl.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMMenu(false); });

  /* ------------------------------------------------------------- avvio */
  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return; scrollQueued = true;
    requestAnimationFrame(function () { scrollQueued = false; updateTone(); updateChapter(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  var rzT = 0;
  window.addEventListener("resize", function () { clearTimeout(rzT); rzT = setTimeout(function () { layoutBigFields(false); updateTone(); updateChapter(); }, 120); });

  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var f = e.target === heroField.el ? heroField : footField;
        f.visible = e.isIntersecting;
        if (e.isIntersecting) { f.measure(); if (f === footField && !f.el.classList.contains("is-in")) f.enter(); }
      });
    }, { threshold: 0.05 });
    vio.observe(heroField.el); vio.observe(footField.el);
  } else { heroField.visible = footField.visible = true; footField.enter(); }

  layoutBigFields(true);
  initReveal();
  renderMenu();
  renderGiftChips(); renderGiftPreview();
  renderStatus();
  setInterval(renderStatus, 30000);
  updateTone(); updateChapter(); if (chapter < 0) showChapter(0);

  var started = false;
  function startHero() {
    if (started) return; started = true;
    heroField.enter();
    setTimeout(function () { heroField.measure(); footField.measure(); }, 1300);
  }
  try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutBigFields(false); startHero(); }); } catch (e) { /* niente */ }
  setTimeout(startHero, 700);
  requestAnimationFrame(frame);
})();
