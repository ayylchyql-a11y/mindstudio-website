/* shio famiglia — app.js
   Plain script, no libraries. Runs inside a sandboxed iframe without
   allow-same-origin, so nothing here touches storage, cookies, alert or popups. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ───────────────────────── data ───────────────────────── */
  const BRANDS = [
    { id: "shio", suf: "", kanji: "潮", icon: "fish", bi: "#2e6468", bid: "#8cc5c0",
      kind: "banco sushi · omakase", lastSeat: 90,
      fly: "Il banco da cui è partito tutto: nigiri tagliati al momento, omakase di dodici portate, pesce dell'Adriatico che cambia con il mercato.",
      p1: "shio è il banco da cui è partito tutto: dodici, al massimo sedici posti davanti alle mani dei cuochi. Nigiri tagliati al momento, riso condito con aceto rosso, pesce dell'Adriatico che cambia con il mercato del mattino.",
      hours: [[[750, 870], [1140, 1410]], [], [[1140, 1410]], [[1140, 1410]], [[1140, 1410]], [[1140, 1410]], [[750, 870], [1140, 1410]]],
      hoursLbl: [["mar – ven", [2, 3, 4, 5], "19:00 – 23:30"], ["sab – dom", [6, 0], "12:30 – 14:30 · 19:00 – 23:30"], ["lunedì", [1], "chiuso"]] },
    { id: "shioya", suf: "ya", kanji: "屋", icon: "lantern", bi: "#b8653d", bid: "#eaa67c",
      kind: "izakaya · brace e sake", lastSeat: 60,
      fly: "La cucina della sera tardi: spiedini sulla brace di binchōtan, piatti caldi da dividere, sake e highball fino all'una.",
      p1: "shioya è la figlia irrequieta di shio: il fuoco al posto del coltello. Spiedini sulla brace di binchōtan, piatti caldi da dividere al centro del tavolo, una lista di sake che cambia ogni mese e la cucina aperta fino a tardi.",
      hours: [[[1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[1080, 1500]], [[1080, 1560]], [[1080, 1560]]],
      hoursLbl: [["dom – gio", [0, 1, 2, 3, 4], "18:00 – 01:00"], ["ven – sab", [5, 6], "18:00 – 02:00"]] },
    { id: "shiocha", suf: "chà", kanji: "茶", icon: "bowl", bi: "#66753a", bid: "#c3d08a",
      kind: "sala da tè · dolci", lastSeat: 45,
      fly: "Il pomeriggio della famiglia: tè verdi e tostati preparati al banco, mochi e dorayaki fatti ogni mattina.",
      p1: "shiochà è la casa del pomeriggio. Tè verdi e tostati preparati davanti a te, dolci di riso e fagioli rossi fatti ogni mattina, qualche onigiri per chi arriva a pranzo tardi. Qui si parla piano.",
      hours: [[[570, 1170]], [[600, 1140]], [], [[600, 1140]], [[600, 1140]], [[600, 1140]], [[570, 1170]]],
      hoursLbl: [["lun, mer – ven", [1, 3, 4, 5], "10:00 – 19:00"], ["sab – dom", [6, 0], "9:30 – 19:30"], ["martedì", [2], "chiuso"]] },
    { id: "shiobune", suf: "bune", kanji: "舟", icon: "boat", bi: "#36507d", bid: "#9fb3dd",
      kind: "temaki bar · sul molo", lastSeat: 30,
      fly: "Un bancone di temaki sul molo: alga ancora croccante, riso tiepido, si mangia in piedi in dieci minuti.",
      p1: "shiobune è la barca della famiglia: un bancone lungo dove i temaki passano di mano in mano, alga ancora croccante e riso tiepido. Si mangia in piedi o sugli sgabelli, si paga al banco, si torna al lavoro.",
      hours: [[[720, 900], [1110, 1350]], [[1110, 1350]], [[720, 900], [1110, 1350]], [[720, 900], [1110, 1350]], [[720, 900], [1110, 1350]], [[720, 900], [1110, 1350]], [[720, 900], [1110, 1350]]],
      hoursLbl: [["mar – dom", [2, 3, 4, 5, 6, 0], "12:00 – 15:00 · 18:30 – 22:30"], ["lunedì", [1], "solo 18:30 – 22:30"]] },
  ];
  const B = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

  const CITIES = [
    { id: "trieste", name: "Trieste", code: "TS", note: "casa madre", brands: ["shio", "shioya", "shiocha", "shiobune"],
      foot: "Trieste è la casa madre: tutte e quattro le case a dieci minuti a piedi l'una dall'altra, tra le Rive e Cavana." },
    { id: "udine", name: "Udine", code: "UD", brands: ["shio", "shioya"],
      foot: "A Udine dal 2016: il banco sotto i portici e la izakaya nel cortile di Largo dei Pecile." },
    { id: "venezia", name: "Venezia", code: "VE", brands: ["shio", "shiocha"],
      foot: "A Venezia dal 2019: il banco a Cannaregio, la sala da tè in Campo Santa Margherita." },
    { id: "lubiana", name: "Lubiana", code: "LJ", brands: ["shioya", "shiobune"],
      foot: "Lubiana è la prima casa oltre confine, aperta nel 2023 lungo la Ljubljanica." },
  ];
  const C = Object.fromEntries(CITIES.map((c) => [c.id, c]));

  const LOC = {
    shio: {
      trieste: { addr: "Riva del Mandracchio 4, 34124 Trieste", tel: "+39 040 000 0412",
        line: "Il banco originale, in un ex magazzino del sale sulle Rive, a due passi dal molo.",
        p2: "A Trieste ci si siede al banco di larice dove Aiko ha tagliato il primo nigiri nel 2009. Chiedi il posto davanti al tagliere: è quello che vale il viaggio." },
      udine: { addr: "Via Mercatovecchio 18, 33100 Udine", tel: "+39 0432 000 118",
        line: "Dodici posti sotto i portici, con il pesce che arriva ogni mattina da Marano Lagunare.",
        p2: "La casa udinese è la più raccolta: un solo banco, un solo turno per sera nel fine settimana, e sake di una piccola cantina di Cividale accanto a quelli giapponesi." },
      venezia: { addr: "Fondamenta della Misericordia 33, 30121 Venezia", tel: "+39 041 000 0933",
        line: "A Cannaregio, il banco guarda il canale e il pesce arriva in barca da Rialto.",
        p2: "Il pesce del giorno arriva in barca dal mercato di Rialto; il percorso omakase cambia ogni settimana con quello che porta la laguna." },
    },
    shioya: {
      trieste: { addr: "Via della Cavana 11, 34124 Trieste", tel: "+39 040 000 1111",
        line: "In Cavana, tra le osterie del centro vecchio: brace accesa, bancone lungo, cucina aperta fino all'una.",
        p2: "Il bancone corre lungo tutta la sala e guarda la brace. Venerdì e sabato si resta fino alle due; l'ultimo ordine in cucina è a mezzanotte e mezza." },
      udine: { addr: "Largo dei Pecile 6, 33100 Udine", tel: "+39 0432 000 606",
        line: "Un cortile interno con le lanterne: highball, spiedini e la musica un po' più alta.",
        p2: "D'estate si mangia nel cortile, sotto le lanterne. È la casa dove si viene in tanti: i tavoli lunghi si uniscono fino a otto persone." },
      lubiana: { addr: "Trubarjeva cesta 15, 1000 Lubiana", tel: "+386 1 000 1515",
        line: "Vicino al Triplo Ponte: la nostra prima casa oltre confine, aperta fino a tardi.",
        p2: "Un'ora e mezza di strada dal molo di Trieste, lo stesso menu, la stessa brace. La birra di riso arriva da un piccolo birrificio della Gorenjska." },
    },
    shiocha: {
      trieste: { addr: "Via della Torre 9, 34121 Trieste", tel: "+39 040 000 0909",
        line: "Una stanza bianca al primo piano, sopra una bottega di ceramiche: tè al banco e mochi del giorno.",
        p2: "Dodici tavolini e un banco dove Kenji prepara il matcha con la frusta di bambù. Le tazze sono di un laboratorio di Muggia: se una ti piace, si può comprare." },
      venezia: { addr: "Campo Santa Margherita 12, 30123 Venezia", tel: "+39 041 000 1212",
        line: "Le sedie in campo finché c'è sole: dorayaki, hōjicha e nessuna fretta.",
        p2: "Le sedie fuori ci sono finché c'è sole. D'inverno ci si stringe dentro, intorno al bollitore di ghisa, con un hōjicha e il libro che avevi in borsa." },
    },
    shiobune: {
      trieste: { addr: "Molo dei Pescatori 3, 34123 Trieste", tel: "+39 040 000 0303",
        line: "Un container di legno aperto sul golfo: temaki al volo a pranzo, don e birra di riso la sera.",
        p2: "Il bancone è un vecchio container rivestito di larice, aperto sul golfo. A pranzo c'è coda, ma gira in fretta: dieci minuti e sei di nuovo in strada." },
      lubiana: { addr: "Breg 8, 1000 Lubiana", tel: "+386 1 000 0808",
        line: "Lungo la Ljubljanica, sotto gli alberi del Breg: temaki e birra di riso guardando il fiume.",
        p2: "D'estate il bancone si allunga sulla banchina, sotto gli alberi. D'inverno i temaki si mangiano dentro, al caldo, con una zuppa di miso." },
    },
  };

  const FAVS = {
    shio: [["shio-nigiri", "nigiri di salmone scottato", "salmone, sale di Pirano, scorza di yuzu"],
           ["shio-sashimi-box", "sashimi del mercato", "nove tagli, wasabi fresco, foglia di shiso"],
           ["shio-gambero", "nigiri di gambero", "gambero al vapore, lime, olio di sesamo"],
           ["nigiri-tartufo", "nigiri al tartufo", "ricciola, tartufo nero dei Colli, soia invecchiata"]],
    shioya: [["shioya-tempura", "tempura del mercato", "gamberi, zucca, shiso, sale verde al tè"],
             ["gyoza", "gyoza alla piastra", "maiale, verza, aceto nero e peperoncino"],
             ["ramen-gamberi", "ramen ai gamberi", "brodo di teste tostate, uovo marinato"],
             ["ebi-kataifi", "ebi kataifi", "gambero in pasta kataifi, maionese al yuzu"]],
    shiocha: [["mochi", "mochi del giorno", "riso glutinoso, anko, matcha o sesamo nero"],
              ["dorayaki", "dorayaki", "due pancake di miele, crema di fagioli rossi"],
              ["miso", "zuppa di miso", "dashi di alghe, tofu setoso, cipollotto"],
              ["hoso-cetriolo", "hosomaki del pomeriggio", "cetriolo, sesamo, umeboshi"]],
    shiobune: [["temaki-salmone", "temaki di salmone", "alga croccante, riso tiepido, avocado"],
               ["shiobune-uramaki", "uramaki del molo", "tonno scottato, cetriolo, tobiko"],
               ["shiobune-gunkan", "gunkan di ikura", "uova di salmone marinate nella soia"],
               ["ura-crispy-tuna-8-pz", "crispy tuna", "tonno piccante, tempura croccante, erba cipollina"]],
  };

  const MENUS = {
    shio: [
      ["omakase", [["percorso del banco", "dodici portate, dal crudo al brodo, decise dal cuoco", "95", "sashimi-misto"],
                   ["percorso breve", "otto portate, al banco a pranzo nel fine settimana", "68", "nigiri-misto"],
                   ["abbinamento sake", "cinque calici per il percorso del banco", "42"]]],
      ["nigiri", [["branzino dell'Adriatico", "yuzu e sale di Pirano · 2 pz", "9", "nigiri-branzino"],
                  ["tonno", "soia invecchiata due anni · 2 pz", "11", "nigiri-tonno"],
                  ["salmone al tartufo", "scottato al cannello · 2 pz", "12", "nigiri-tartufo"],
                  ["anguilla laccata", "salsa kabayaki, pepe sansho · 2 pz", "10", "nigiri-anguilla"],
                  ["gambero rosso", "crudo, lime, sale affumicato · 2 pz", "14", "gambero-cotto"]]],
      ["sashimi e crudi", [["sashimi del giorno", "nove fette dal mercato del mattino", "26", "sashimi-salmone"],
                           ["tartare di tonno", "avocado, ponzu, chips di riso", "18", "tartare-tonno"],
                           ["tataki di salmone", "sesamo tostato, salsa di cipolla dolce", "19", "tataki-salmone-10-pz"]]],
      ["maki", [["dragon maki", "anguilla, avocado, gambero in tempura · 8 pz", "16", "dragon-maki"],
                ["rainbow", "cinque pesci sopra, granchio dentro · 8 pz", "17", "rainbow-maki-8-pz"],
                ["hosomaki di cetriolo", "cetriolo e shiso · 6 pz", "7", "hoso-cetriolo"]]],
    ],
    shioya: [
      ["dalla brace", [["tsukune", "polpetta di pollo, tuorlo, salsa tare · 2 spiedini", "7"],
                       ["pancia di maiale", "senape al miso, cipollotto · 2 spiedini", "8"],
                       ["gyoza alla piastra", "maiale e verza · 5 pz", "8", "gyoza"],
                       ["shishito", "peperoncini dolci, sale affumicato", "5"],
                       ["ebi kataifi", "gambero, kataifi, maionese al yuzu · 3 pz", "11", "ebi-kataifi"]]],
      ["piatti caldi", [["tempura del mercato", "gamberi e verdure, sale verde", "14", "shioya-tempura"],
                        ["ramen ai gamberi", "brodo di teste tostate, uovo marinato", "16", "ramen-gamberi"],
                        ["ravioli in brodo", "maiale e zenzero al vapore · 6 pz", "9", "xiao-long-bao"],
                        ["zuppa di miso", "tofu, alghe wakame, cipollotto", "4", "miso"]]],
      ["dal bancone", [["edamame", "al sale grosso di Trieste", "5", "edamame"],
                       ["tataki di salmone", "sesamo, cipolla dolce", "17", "tataki-salmone-10-pz"],
                       ["nigiri misti", "sei pezzi scelti dal banco", "15", "nigiri-misto"]]],
      ["da bere", [["sake del mese", "al calice, freddo o tiepido", "9"],
                   ["highball", "whisky giapponese, soda, scorza di limone", "11"],
                   ["birra di riso", "alla spina, 0,4 l", "6"],
                   ["umeshu tonic", "liquore di prugna, acqua tonica", "9"]]],
    ],
    shiocha: [
      ["tè", [["sencha di primavera", "tè verde al vapore, seconda infusione inclusa", "6"],
              ["matcha al banco", "preparato con la frusta davanti a te", "8"],
              ["hōjicha", "tè tostato, morbido, poca teina", "5"],
              ["genmaicha", "tè verde e riso tostato", "5"]]],
      ["dolci", [["mochi", "tre pezzi: matcha, sesamo nero, fragola", "7", "mochi"],
                 ["dorayaki", "con anko fatto in casa", "6", "dorayaki"],
                 ["cheesecake al matcha", "base di biscotto al sesamo", "8"],
                 ["parfait al sesamo nero", "gelato, mochi, salsa kuromitsu", "9"]]],
      ["salato leggero", [["zuppa di miso", "tofu setoso e cipollotto", "4", "miso"],
                          ["hosomaki di cetriolo", "con umeboshi · 6 pz", "7", "hoso-cetriolo"],
                          ["edamame", "al sale grosso", "5", "edamame"]]],
    ],
    shiobune: [
      ["temaki", [["salmone e avocado", "alga croccante, riso tiepido", "7", "temaki-salmone"],
                  ["tonno piccante", "maionese al peperoncino, erba cipollina", "8"],
                  ["gambero cotto", "maionese al wasabi, lattuga", "7", "gambero-cotto"],
                  ["anguilla", "salsa kabayaki, cetriolo", "8"],
                  ["cetriolo e umeboshi", "vegetariano", "5"]]],
      ["don", [["salmone e ikura", "riso, salmone, uova di salmone marinate", "21", "gunkan-salmon-ikura"],
               ["chirashi del molo", "pesce del giorno a cubetti su riso", "19", "sashimi-misto"],
               ["tekka don", "tonno marinato nella soia", "22", "tartare-tonno"]]],
      ["dal molo", [["gunkan di ikura", "2 pz", "10", "shiobune-gunkan"],
                    ["crispy tuna", "uramaki croccante · 8 pz", "14", "ura-crispy-tuna-8-pz"],
                    ["special salmon", "salmone fuori e dentro · 8 pz", "15", "special-salmon-maki"],
                    ["uramaki del molo", "tonno scottato e tobiko · 8 pz", "13", "shiobune-uramaki"]]],
    ],
  };

  const ICONS = {
    fish: '<path d="M5 24c6-8 18-11 28-5l8-6v22l-8-6C23 35 11 32 5 24z"/><path d="M19 17.5c2.4 4 2.4 9 0 13"/><path d="M25 21c1.2 2 1.2 4 0 6"/><circle cx="12.5" cy="22.5" r="1.3"/>',
    lantern: '<path d="M17 11h14c5.5 7 5.5 19 0 26H17c-5.5-7-5.5-19 0-26z"/><path d="M12.6 19h22.8M11.6 24h24.8M12.6 29h22.8"/><path d="M19 7h10v4H19zM19 37h10v4H19zM24 3v4M24 41v4"/>',
    bowl: '<path d="M7 25h34c0 9-7.5 15-17 15S7 34 7 25z"/><path d="M18 40v3h12v-3"/><path d="M18 20c-2.2-3 2.2-5 0-9M24 20c-2.2-3 2.2-5 0-9M30 20c-2.2-3 2.2-5 0-9"/>',
    boat: '<path d="M5 30h38l-6 8H11z"/><path d="M24 30V6"/><path d="M24 8l12 17H24"/><path d="M22 12 13 25h9"/><path d="M5 43c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0 5-2 6-1"/>',
  };

  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAYS_S = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

  /* ───────────────────────── helpers ───────────────────────── */
  const wm = (b) => `<span class="sh-wm"><b>shio</b>${B[b].suf}</span>`;
  const name = (b) => "shio" + B[b].suf;
  const hm = (m) => { m = ((m % 1440) + 1440) % 1440; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`.replace(/^(\d):/, "0$1:"); };
  const hmShort = (m) => hm(m).replace(/^0(\d)/, "$1");
  const bi = (b) => `--bi:${B[b].bi};--bi-d:${B[b].bid}`;

  // Rome clock. window.__shioNow (a Date) lets the checks pin the time.
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function romeNow() {
    const d = window.__shioNow instanceof Date ? window.__shioNow : new Date();
    const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
    const h = +p.hour % 24;
    return { dow: WD[p.weekday], min: h * 60 + +p.minute, iso: `${p.year}-${p.month}-${p.day}` };
  }
  const isoToDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const isoDow = (iso) => isoToDate(iso).getUTCDay();
  const addDays = (iso, n) => { const d = isoToDate(iso); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const niceDate = (iso, long) => { const d = isoToDate(iso); return `${(long ? DAYS : DAYS_S)[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };

  function statusOf(bid) {
    const H = B[bid].hours, { dow, min } = romeNow();
    for (const [o, c] of H[dow]) if (min >= o && min < c) return { open: true, until: c };
    const y = (dow + 6) % 7;
    for (const [o, c] of H[y]) if (c > 1440 && min < c - 1440) return { open: true, until: c - 1440 };
    for (let k = 0; k < 8; k++) {
      const d = (dow + k) % 7;
      for (const [o] of H[d]) if (k > 0 || o > min) return { open: false, k, d, o };
    }
    return { open: false };
  }
  function statusHTML(bid) {
    const s = statusOf(bid);
    if (s.open) return `<i></i><span><b>aperto ora</b> · chiude alle ${hmShort(s.until)}</span>`;
    const when = s.k === 0 ? `alle ${hmShort(s.o)}` : s.k === 1 ? `domani alle ${hmShort(s.o)}` : `${DAYS[s.d]} alle ${hmShort(s.o)}`;
    return `<i></i><span><b>chiuso</b> · apre ${when}</span>`;
  }
  function paintStatus(el, bid) { const s = statusOf(bid); el.classList.add("sh-status"); el.classList.toggle("is-open", !!s.open); el.innerHTML = statusHTML(bid); el.dataset.status = s.open ? "open" : "closed"; }

  let toastT = 0;
  function toast(msg) { const t = $("#sh-toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3200); }

  const go = (sel) => { const el = $(sel); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };

  /* ───────────────────────── state + tint ───────────────────────── */
  const state = { inCasa: false, brand: null, preview: null, city: "trieste", casa: "shio", casaCity: "trieste" };
  function applyTint() { document.body.dataset.tint = state.bookTint || state.preview || (state.inCasa ? state.casa : state.brand) || "fam"; }

  /* ─────────────────── line drawing (stroke-dashoffset) ─────────────────── */
  const SVGNS = "http://www.w3.org/2000/svg";
  function mk(tag, attrs, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function prepDraw(el, dl, dur) {
    const len = Math.ceil(el.getTotalLength ? el.getTotalLength() : 200) + 2;
    el.classList.add("sh-draw"); el.style.setProperty("--len", len); el.style.setProperty("--dl", dl + "ms"); el.style.setProperty("--dur", dur + "ms");
  }
  function redraw(svg) {
    const parts = $$(".sh-draw", svg), fills = $$(".o-fill", svg);
    parts.forEach((p) => p.classList.remove("on"));
    fills.forEach((f) => { f.style.transition = "none"; f.style.opacity = "0"; });
    void svg.getBoundingClientRect();
    requestAnimationFrame(() => {
      parts.forEach((p) => p.classList.add("on"));
      fills.forEach((f) => { f.style.transition = ""; f.style.transitionDelay = (reduce ? 0 : +f.dataset.dl || 0) + "ms"; f.style.opacity = "1"; });
    });
  }

  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
  function catmull(pts, n) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  const P = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;

  function buildOcto(svg) {
    const R = rng(7);
    // back-to-front; each tentacle = spine points + base width
    const TENT = [
      [[[740, 540], [860, 560], [950, 520], [1010, 440], [1040, 380]], 38],
      [[[720, 600], [730, 700], [790, 790], [880, 830], [935, 800], [925, 765]], 30],
      [[[690, 590], [790, 680], [900, 720], [985, 700], [1030, 640]], 42],
      [[[600, 600], [545, 700], [535, 820], [585, 905], [645, 930], [665, 897], [640, 880]], 34],
      [[[630, 600], [625, 720], [665, 840], [745, 915], [830, 930], [870, 890], [845, 865]], 46],
      [[[580, 590], [500, 680], [390, 755], [265, 795], [160, 785], [118, 738], [148, 708], [176, 722]], 44],
      [[[560, 560], [440, 590], [320, 568], [225, 498], [178, 410], [196, 350], [236, 342], [250, 372]], 46],
      [[[570, 520], [470, 470], [402, 382], [392, 282], [432, 202], [500, 170], [542, 198], [528, 236], [498, 230]], 44],
    ];
    const g = mk("g", {}, svg);
    TENT.forEach(([spine, w0], ti) => {
      const pts = catmull(spine, 14);
      const L = [0];
      for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const tot = L[L.length - 1];
      const left = [], right = [], meta = [];
      pts.forEach((p, i) => {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const u = L[i] / tot, w = w0 * Math.pow(1 - u, 0.9) + 1.6;
        const nx = -ty, ny = tx;
        left.push([p[0] + nx * w / 2, p[1] + ny * w / 2]); right.push([p[0] - nx * w / 2, p[1] - ny * w / 2]);
        meta.push({ p, nx, ny, tx, ty, w, u, s: L[i] });
      });
      const tg = mk("g", {}, g);
      const d = "M" + left.map((q) => P(q[0], q[1])).join("L") + "L" + right.reverse().map((q) => P(q[0], q[1])).join("L");
      const dl = 260 + ti * 110;
      const fill = mk("path", { d: d + "Z", class: "o-fill" }, tg); fill.style.fill = "var(--bg)"; fill.dataset.dl = dl + 600;
      const out = mk("path", { d }, tg); prepDraw(out, dl, 1300);
      // a skin fold along the upper side
      const fold = meta.filter((m) => m.u > 0.04 && m.u < 0.62).map((m) => [m.p[0] + m.nx * m.w * 0.2, m.p[1] + m.ny * m.w * 0.2]);
      if (fold.length > 2) { const f = mk("path", { d: "M" + fold.map((q) => P(q[0], q[1])).join("L"), class: "o-sk" }, tg); prepDraw(f, dl + 300, 900); }
      // engraving hatch on the upper edge, thinning out towards the tip
      let hn = 18;
      meta.forEach((m) => {
        if (m.s < hn || m.u > 0.55 || m.w < 9) return;
        hn = m.s + 11 + m.u * 20;
        const ex = m.p[0] + m.nx * m.w * 0.5, ey = m.p[1] + m.ny * m.w * 0.5, k = m.w * (0.28 - m.u * 0.2);
        const h = mk("path", { d: `M${P(ex - m.nx * 1.5, ey - m.ny * 1.5)}L${P(ex - m.nx * k + m.tx * 3, ey - m.ny * k + m.ty * 3)}`, class: "o-sk" }, tg);
        prepDraw(h, dl + 380 + m.u * 700, 200);
      });
      // suckers: little rotated ellipses walking down the underside
      let next = 26;
      meta.forEach((m) => {
        if (m.s < next || m.u > 0.93 || m.w < 5) return;
        next = m.s + m.w * 0.62 + 5;
        const rx = m.w * 0.2, ry = m.w * 0.13, cx = m.p[0] - m.nx * m.w * 0.2, cy = m.p[1] - m.ny * m.w * 0.2;
        const rot = Math.atan2(m.ty, m.tx), ax = Math.cos(rot) * rx, ay = Math.sin(rot) * rx, deg = (rot * 180 / Math.PI).toFixed(1);
        const e = mk("path", { d: `M${P(cx + ax, cy + ay)}A${rx.toFixed(1)} ${ry.toFixed(1)} ${deg} 1 0 ${P(cx - ax, cy - ay)}A${rx.toFixed(1)} ${ry.toFixed(1)} ${deg} 1 0 ${P(cx + ax, cy + ay)}`, class: "o-sk" }, tg);
        prepDraw(e, dl + 500 + m.u * 900, 320);
      });
    });
    // mantle, in front of the tentacle roots
    const mg = mk("g", {}, svg);
    const mantle = "M572 506C520 426 536 292 612 222C688 154 812 148 862 226C908 298 882 402 804 462C784 478 772 494 772 514C762 540 728 552 700 542C676 560 638 562 610 548C586 556 562 536 572 506";
    const mf = mk("path", { d: mantle + "Z", class: "o-fill" }, mg); mf.style.fill = "var(--bg)"; mf.dataset.dl = 500;
    const mo = mk("path", { d: mantle }, mg); prepDraw(mo, 0, 1100);
    ["M630 258C680 222 760 214 816 250", "M604 316C664 272 770 268 844 310", "M594 378C652 338 754 338 836 376", "M612 436C662 408 740 410 790 432"].forEach((d, i) => {
      const s = mk("path", { d, class: "o-sk" }, mg); prepDraw(s, 520 + i * 90, 700);
    });
    // engraving hatch along the shaded right edge of the mantle
    for (let a = -70, i = 0; a <= 70; a += 4.5, i++) {
      const t = a * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      const ox = 712 + c * 150, oy = 345 + sn * 176, len = 14 + 16 * Math.cos(t * 1.4);
      const h = mk("path", { d: `M${P(ox - c * 4, oy - sn * 4)}L${P(ox - c * (4 + len), oy - sn * (4 + len) + 3)}`, class: "o-sk" }, mg);
      prepDraw(h, 760 + i * 18, 220);
    }
    // freckles: rings and dots, seeded so every load is the same octopus
    for (let i = 0; i < 46; i++) {
      const a = R() * Math.PI * 2, r = Math.sqrt(R());
      const cx = 712 + Math.cos(a) * r * 112, cy = 335 + Math.sin(a) * r * 130;
      const rr = 2 + R() * 6;
      const c = mk("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: rr.toFixed(1), class: "o-sk" }, mg); prepDraw(c, 900 + i * 18, 260);
      if (rr < 3.6) { const dot = mk("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (rr * 0.5).toFixed(1), class: "o-fill" }, mg); dot.dataset.dl = 1100 + i * 18; }
    }
    // eyes: brow bulge, almond, ring, slit pupil
    const brow = mk("path", { d: "M580 494C590 466 636 458 656 486" }, mg); prepDraw(brow, 640, 500);
    const eye = mk("path", { d: "M588 500c10-14 36-18 52-6c-8 14-34 18-52 6z" }, mg); prepDraw(eye, 760, 500);
    const ring = mk("circle", { cx: 614, cy: 497, r: 8, class: "o-sk" }, mg); prepDraw(ring, 980, 300);
    const pup = mk("path", { d: "M604 497h20" }, mg); prepDraw(pup, 1150, 260);
    const brow2 = mk("path", { d: "M718 516C726 498 756 494 768 512", class: "o-sk" }, mg); prepDraw(brow2, 820, 400);
    const eye2 = mk("path", { d: "M722 520c8-9 26-11 38-3c-6 10-24 12-38 3z", class: "o-sk" }, mg); prepDraw(eye2, 900, 400);
  }

  function drawIcon(svg, icon, base = 0) {
    svg.innerHTML = ICONS[icon];
    [...svg.children].forEach((c, i) => prepDraw(c, base + i * 140, 700));
    redraw(svg);
  }

  /* ───────────────────────── hero stack ───────────────────────── */
  const stack = $("#sh-stack"), fly = $("#sh-fly");
  stack.innerHTML = BRANDS.map((b) => `<li><button type="button" class="sh-row" data-b="${b.id}" aria-label="${name(b.id)} — ${b.kind}">${wm(b.id)}</button></li>`).join("");
  let flyFor = "init", flyT = 0;
  function setFly(bid) {
    if (bid === flyFor) return;
    flyFor = bid;
    const write = () => {
      if (!bid) {
        $("#sh-fly-kind").textContent = "quattro case · quattro città";
        $("#sh-fly-txt").textContent = "Un banco di sushi, una izakaya che fa tardi, una sala da tè, un bancone di temaki sul molo. Stessa cucina di casa, quattro caratteri diversi.";
        $("#sh-fly-links").innerHTML = `<a href="#citta">scegli la città</a><button type="button" data-book>prenota</button>`;
      } else {
        const b = B[bid], n = CITIES.filter((c) => c.brands.includes(bid)).map((c) => c.name);
        $("#sh-fly-kind").textContent = b.kind;
        $("#sh-fly-txt").textContent = b.fly;
        $("#sh-fly-links").innerHTML = `<a href="#casa" data-visit="${bid}">visita ${name(bid)}</a><button type="button" data-book data-b="${bid}">prenota</button><a href="#citta">${n.join(" · ").toLowerCase()}</a>`;
      }
    };
    clearTimeout(flyT);
    if (reduce || flyFor === "init") { write(); return; }
    fly.classList.add("swap");
    flyT = setTimeout(() => { write(); fly.classList.remove("swap"); }, 200);
  }
  function markStack() {
    const cur = state.preview || state.brand;
    stack.classList.toggle("is-hot", !!cur);
    $$(".sh-row", stack).forEach((r) => r.classList.toggle("on", r.dataset.b === cur));
  }
  function preview(bid) { state.preview = bid; applyTint(); markStack(); setFly(bid || state.brand); }
  $$(".sh-row", stack).forEach((r) => {
    r.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") preview(r.dataset.b); });
    r.addEventListener("focus", () => preview(r.dataset.b));
    r.addEventListener("blur", () => preview(null));
    r.addEventListener("click", () => selectBrand(r.dataset.b, { from: "hero" }));
  });
  stack.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") preview(null); });

  /* ───────────────────────── locations (FLIP) ───────────────────────── */
  const cardsBox = $("#sh-cards"), frame = $("#sh-frame");
  function cardHTML(bid, cid) {
    const b = B[bid], l = LOC[bid][cid];
    return `<div class="sh-bc-head"><span class="sh-badge"><svg viewBox="0 0 48 48" aria-hidden="true">${ICONS[b.icon]}</svg><em>${b.kanji}</em></span>${wm(bid)}</div>
      <p class="sh-bc-kind">${b.kind}</p>
      <p class="sh-bc-txt">${l.line}</p>
      <p class="sh-st" data-st="${bid}"></p>
      <div class="sh-bc-links"><a href="#casa" data-visit="${bid}" data-city="${cid}">visita ${name(bid)} ${C[cid].name.toLowerCase()}</a><button type="button" data-book data-b="${bid}" data-city="${cid}">prenota</button></div>`;
  }
  function makeCard(bid, cid) {
    const el = document.createElement("article");
    el.className = "sh-bc sh-bi"; el.dataset.b = bid; el.setAttribute("style", bi(bid));
    el.setAttribute("aria-label", `${name(bid)} ${C[cid].name}`);
    el.innerHTML = cardHTML(bid, cid);
    paintStatus($(".sh-st", el), bid);
    el.addEventListener("pointerenter", () => frameHue(bid));
    el.addEventListener("pointerleave", () => frameHue(null));
    el.addEventListener("focusin", () => frameHue(bid));
    el.addEventListener("focusout", () => frameHue(null));
    return el;
  }
  // ambient hue: the focused card hands its hue to the frame — one registered colour, tweened
  function frameHue(bid) { frame.style.setProperty("--fx", bid ? (document.body.dataset.tint === "shioya" ? B[bid].bid + "1f" : B[bid].bi + "14") : "rgba(255,255,255,0)"); }

  function renderCities() {
    $("#sh-cities").innerHTML = CITIES.map((c, i) => `${i ? '<i aria-hidden="true">°</i>' : ""}<button type="button" role="tab" class="sh-city" data-city="${c.id}" aria-selected="${c.id === state.city}">${c.name.toLowerCase()}${c.note ? `<small>${c.note}</small>` : ""}</button>`).join("");
    $("#sh-citysel").innerHTML = CITIES.map((c) => `<option value="${c.id}"${c.id === state.city ? " selected" : ""}>${c.name.toLowerCase()}${c.note ? " · " + c.note : ""}</option>`).join("");
  }
  const EASE_ARC = "cubic-bezier(.22,.9,.3,1)";
  let flipTok = 0;
  function renderCards(animate) {
    const cid = state.city, ids = C[cid].brands, tok = ++flipTok;
    $$("[data-leaving]", cardsBox).forEach((e) => e.remove());
    const old = new Map($$(".sh-bc", cardsBox).map((e) => [e.dataset.b, e]));
    old.forEach((e) => e.getAnimations().forEach((a) => a.cancel()));
    $("#sh-loc-note").textContent = C[cid].foot;
    const n = Math.min(ids.length, 4);
    if (!animate || reduce || !old.size) {
      cardsBox.innerHTML = ""; ids.forEach((id) => cardsBox.appendChild(makeCard(id, cid))); cardsBox.style.setProperty("--n", n); return;
    }
    const first = new Map(); old.forEach((e, id) => first.set(id, e.getBoundingClientRect()));
    const leaving = [...old.keys()].filter((id) => !ids.includes(id));
    leaving.forEach((id) => old.get(id).setAttribute("data-leaving", ""));
    const outs = leaving.map((id) => old.get(id).animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-10px)" }], { duration: 170, easing: "ease-in", fill: "forwards" }).finished.catch(() => {}));
    Promise.all(outs).then(() => {
      if (tok !== flipTok) return;
      leaving.forEach((id) => old.get(id).remove());
      const fresh = new Set();
      ids.forEach((id) => {
        let el = old.get(id);
        if (el) { el.setAttribute("aria-label", `${name(id)} ${C[cid].name}`); el.innerHTML = cardHTML(id, cid); paintStatus($(".sh-st", el), id); }
        else { el = makeCard(id, cid); fresh.add(id); }
        cardsBox.appendChild(el);
      });
      cardsBox.style.setProperty("--n", n);
      ids.forEach((id, i) => {
        const el = $(`.sh-bc[data-b="${id}"]`, cardsBox);
        if (fresh.has(id)) {
          el.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 140 + i * 50, easing: EASE_ARC, fill: "backwards" });
          return;
        }
        const f = first.get(id), l = el.getBoundingClientRect();
        const dx = f.left - l.left, dy = f.top - l.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        // quadratic arc from the old spot to the new one, control point = chord midpoint lifted 40px
        const cx = dx / 2, cy = dy / 2 - 40, frames = [];
        for (let k = 0; k <= 16; k++) {
          const t = k / 16, a = (1 - t) * (1 - t), b2 = 2 * (1 - t) * t;
          frames.push({ transform: `translate(${(a * dx + b2 * cx).toFixed(2)}px, ${(a * dy + b2 * cy).toFixed(2)}px)` });
        }
        el.animate(frames, { duration: 560, delay: i * 40, easing: EASE_ARC, fill: "backwards" });
      });
    });
  }
  function setCity(cid, animate = true) {
    if (!C[cid] || cid === state.city) return;
    state.city = cid; renderCities(); renderCards(animate);
  }
  $("#sh-cities").addEventListener("click", (e) => { const b = e.target.closest("[data-city]"); if (b) setCity(b.dataset.city); });
  $("#sh-cities").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = CITIES.findIndex((c) => c.id === state.city), j = (i + (e.key === "ArrowRight" ? 1 : -1) + CITIES.length) % CITIES.length;
    setCity(CITIES[j].id); $(`.sh-city[data-city="${CITIES[j].id}"]`).focus();
  });
  $("#sh-citysel").addEventListener("change", (e) => setCity(e.target.value));

  /* ───────────────────────── la casa ───────────────────────── */
  const rollWm = $("#sh-roll-wm"), rollCity = $("#sh-roll-city");
  function roll(win, html) {
    const olds = $$(":scope > span", win);
    if (olds.length && olds[olds.length - 1].innerHTML === html) return;
    const s = document.createElement("span"); s.innerHTML = html; win.appendChild(s);
    if (reduce || !olds.length) { olds.forEach((o) => o.remove()); s.classList.add("now"); return; }
    void s.offsetWidth;
    olds.forEach((o) => { o.classList.remove("now"); o.classList.add("past"); o.setAttribute("aria-hidden", "true"); setTimeout(() => o.remove(), 760); });
    requestAnimationFrame(() => s.classList.add("now"));
  }
  function citiesOf(bid) { return CITIES.filter((c) => c.brands.includes(bid)); }

  function renderCasa() {
    const bid = state.casa, cid = state.casaCity, b = B[bid], l = LOC[bid][cid];
    $$(".sh-ctab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.b === bid)));
    roll(rollWm, wm(bid));
    roll(rollCity, C[cid].name.toLowerCase());
    $("#sh-casa-cities").innerHTML = `<span>${name(bid)} è a</span>` + citiesOf(bid).map((c, i) => `${i ? '<i aria-hidden="true">°</i>' : ""}<button type="button" data-cc="${c.id}" aria-pressed="${c.id === cid}">${c.name.toLowerCase()}</button>`).join("");
    $("#sh-info-kind").textContent = b.kind;
    $("#sh-info-p1").textContent = b.p1;
    $("#sh-info-p2").textContent = l.p2;
    const today = romeNow().dow;
    $("#sh-hours").innerHTML = b.hoursLbl.map(([d, days, h]) => { const t = days.includes(today) ? ' class="is-today"' : ""; return `<dt${t}>${d}</dt><dd${t}>${h}</dd>`; }).join("");
    $("#sh-addr").textContent = l.addr;
    $("#sh-phone").innerHTML = `<a href="#contatti">${l.tel}</a>`;
    paintStatus($("#sh-casa-status"), bid);
    $("#sh-book-h").innerHTML = `prenota un tavolo da <b>${name(bid)}</b> ${C[cid].name.toLowerCase()}`;
    $("#sh-book-call").textContent = `Per gruppi oltre 8 persone o richieste particolari chiamaci al ${l.tel}.`;
    // favourites
    const tr = $("#sh-fav-track");
    tr.innerHTML = FAVS[bid].map(([img, n, ing], i) => `<li class="sh-fv"><figure><img src="assets/${img}.webp" alt="${n}" loading="lazy" draggable="false" width="600" height="450"></figure><div><h4>${n}</h4><p>${ing}</p></div></li>`).join("");
    tr.scrollLeft = 0; favCount();
    // menu
    $("#sh-menu-of").textContent = name(bid);
    menuCat = 0; renderMenuTabs(); renderMenu(false);
    // siblings in the same city
    const sibs = C[cid].brands.filter((x) => x !== bid);
    $("#sh-sibs").innerHTML = `<div><h3>le altre case della famiglia<br>a ${C[cid].name}</h3></div><ul>${sibs.length ? sibs.map((s) => `<li class="sh-sib sh-bi" style="${bi(s)}">${wm(s)}<button type="button" data-visit="${s}" data-city="${cid}">visita ${name(s)} →</button></li>`).join("") : `<li class="sh-sib-empty">A ${C[cid].name} c'è solo ${name(bid)}. Le altre case sono a ${CITIES.filter((c) => c.id !== cid).map((c) => c.name).join(", ")}.</li>`}</ul>`;
  }
  let casaDrawn = null;
  function drawCreature() { if (casaDrawn === state.casa) return; casaDrawn = state.casa; drawIcon($("#sh-creature"), B[state.casa].icon); }

  function selectBrand(bid, opt = {}) {
    const changed = state.brand !== bid;
    state.brand = bid; state.preview = null; applyTint(); markStack(); setFly(bid);
    if (opt.city && LOC[bid][opt.city]) state.casaCity = opt.city;
    else if (!LOC[bid][state.casaCity]) state.casaCity = LOC[bid][state.city] ? state.city : citiesOf(bid)[0].id;
    state.casa = bid; renderCasa(); drawCreature();
    if (changed) redraw($("#sh-octo"));
    frameHue(null);
  }
  function resetFamily() { state.brand = null; state.preview = null; applyTint(); markStack(); setFly(null); redraw($("#sh-octo")); }

  $("#sh-casa-tabs").innerHTML = BRANDS.map((b) => `<button type="button" role="tab" class="sh-ctab" data-b="${b.id}" aria-selected="false">${wm(b.id)}</button>`).join("");
  $("#sh-casa-tabs").addEventListener("click", (e) => { const t = e.target.closest(".sh-ctab"); if (t) selectBrand(t.dataset.b); });
  $("#sh-casa-tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = BRANDS.findIndex((b) => b.id === state.casa), j = (i + (e.key === "ArrowRight" ? 1 : -1) + 4) % 4;
    selectBrand(BRANDS[j].id); $(`.sh-ctab[data-b="${BRANDS[j].id}"]`).focus();
  });
  $("#sh-casa-cities").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cc]"); if (!b || b.dataset.cc === state.casaCity) return;
    state.casaCity = b.dataset.cc; renderCasa();
  });

  // favourites carousel
  const track = $("#sh-fav-track");
  function favIndex() { const w = track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width : 1; return Math.round(track.scrollLeft / w); }
  function favCount() {
    const n = track.children.length, i = Math.min(n - 1, favIndex());
    $("#sh-fav-count").textContent = `${i + 1} di ${n}`;
    $("#sh-fav-prev").disabled = track.scrollLeft < 4;
    $("#sh-fav-next").disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
  }
  function favGo(dir) { const w = track.firstElementChild.getBoundingClientRect().width; track.scrollTo({ left: (favIndex() + dir) * w, behavior: reduce ? "auto" : "smooth" }); }
  $("#sh-fav-prev").addEventListener("click", () => favGo(-1));
  $("#sh-fav-next").addEventListener("click", () => favGo(1));
  track.addEventListener("scroll", () => requestAnimationFrame(favCount), { passive: true });
  addEventListener("resize", favCount);

  // menu tabs
  let menuCat = 0;
  function renderMenuTabs() {
    $("#sh-mtabs").innerHTML = MENUS[state.casa].map(([c], i) => `<button type="button" role="tab" class="sh-mtab" data-i="${i}" aria-selected="${i === menuCat}" id="sh-mt-${i}">${c}</button>`).join("");
    $("#sh-mlist").setAttribute("aria-labelledby", "sh-mt-" + menuCat);
  }
  function renderMenu(anim) {
    const list = $("#sh-mlist"), [, items] = MENUS[state.casa][menuCat], k = B[state.casa].kanji;
    list.classList.remove("is-in");
    list.innerHTML = items.map(([n, d, p, img], i) => `<li class="sh-mi" style="--i:${i}">${img ? `<img src="assets/${img}.webp" alt="" loading="lazy" draggable="false" width="64" height="64">` : `<span class="sh-mi-ph" aria-hidden="true">${k}</span>`}<div><h4>${n}</h4><p>${d}</p></div><span class="sh-price">€ ${p}</span></li>`).join("");
    if (anim && !reduce) { void list.offsetWidth; list.classList.add("is-in"); }
  }
  $("#sh-mtabs").addEventListener("click", (e) => {
    const t = e.target.closest(".sh-mtab"); if (!t) return;
    menuCat = +t.dataset.i; $$(".sh-mtab").forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    $("#sh-mlist").setAttribute("aria-labelledby", t.id); renderMenu(true);
  });

  /* ───────────────────────── global clicks ───────────────────────── */
  document.addEventListener("click", (e) => {
    const v = e.target.closest("[data-visit]");
    if (v) { e.preventDefault(); selectBrand(v.dataset.visit, { city: v.dataset.city }); closeNav(); go("#casa"); return; }
    const bk = e.target.closest("[data-book]");
    if (bk) { e.preventDefault(); closeNav(); openBook({ brand: bk.dataset.b || state.brand, city: bk.dataset.city || null }, bk); return; }
    const bc = e.target.closest("[data-book-casa]");
    if (bc) { e.preventDefault(); openBook({ brand: state.casa, city: state.casaCity }, bc); return; }
    const h = e.target.closest("[data-home]");
    if (h) { e.preventDefault(); closeNav(); resetFamily(); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); return; }
    const mb = e.target.closest("[data-mb]");
    if (mb) { selectBrand(mb.dataset.mb); closeNav(); go("#casa"); }
  });

  /* ───────────────────────── header + mobile nav ───────────────────────── */
  const head = $("#sh-head"), burger = $("#sh-burger"), mnav = $("#sh-mnav");
  const onScroll = () => head.classList.toggle("is-solid", scrollY > 30 || mnav.classList.contains("is-open"));
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("#sh-mnav-brands").innerHTML = BRANDS.map((b) => `<li><button type="button" data-mb="${b.id}">${wm(b.id)}</button></li>`).join("");
  let navT = 0;
  function openNav() { clearTimeout(navT); mnav.hidden = false; void mnav.offsetWidth; mnav.classList.add("is-open"); burger.setAttribute("aria-expanded", "true"); onScroll(); }
  function closeNav() {
    if (mnav.hidden) return;
    mnav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); onScroll();
    navT = setTimeout(() => { mnav.hidden = true; }, reduce ? 0 : 230);
  }
  burger.addEventListener("click", () => (burger.getAttribute("aria-expanded") === "true" ? closeNav() : openNav()));
  $$("#sh-mnav nav a").forEach((a) => a.addEventListener("click", closeNav));

  /* ───────────────────────── booking ───────────────────────── */
  const modal = $("#sh-book"), form = $("#sh-bk-form"), done = $("#sh-done");
  const bk = { city: "trieste", brand: null, date: "", slot: null, party: 2 };
  let opener = null, closeT = 0;

  function slotsFor(bid, iso) {
    if (!bid || !iso) return [];
    const b = B[bid], now = romeNow(), out = [];
    for (const [o, c] of b.hours[isoDow(iso)]) {
      const last = Math.min(c - b.lastSeat, 23 * 60 + 30);
      for (let m = o; m <= last; m += 30) {
        if (iso === now.iso && m < now.min + 30) continue;
        out.push(m);
      }
    }
    return out;
  }
  function firstDateWithSlots(bid) {
    const t = romeNow().iso;
    if (!bid) return t;
    for (let i = 0; i < 14; i++) { const d = addDays(t, i); if (slotsFor(bid, d).length) return d; }
    return t;
  }
  function renderBkCity() {
    $("#bk-city").innerHTML = CITIES.map((c) => `<button type="button" role="radio" class="sh-chip" data-c="${c.id}" aria-checked="${c.id === bk.city}" tabindex="${c.id === bk.city ? 0 : -1}">${c.name}</button>`).join("");
  }
  function renderBkBrand() {
    $("#bk-brand").innerHTML = C[bk.city].brands.map((id) => `<button type="button" role="radio" class="sh-bkb sh-bi" style="${bi(id)}" data-b="${id}" aria-checked="${id === bk.brand}">${wm(id)}<small>${B[id].kind.split(" · ")[0]}</small></button>`).join("");
  }
  function renderSlots() {
    const box = $("#bk-slots"), s = slotsFor(bk.brand, bk.date);
    if (!s.includes(bk.slot)) bk.slot = null;
    if (!bk.brand) { box.innerHTML = `<p class="sh-slots-empty">Scegli prima la casa: gli orari dipendono da lei.</p>`; return; }
    if (!s.length) {
      const closed = !B[bk.brand].hours[isoDow(bk.date)].length;
      box.innerHTML = `<p class="sh-slots-empty">${closed ? `${name(bk.brand)} il ${DAYS[isoDow(bk.date)]} è chiuso.` : "Per oggi non ci sono più orari prenotabili."} Prova un altro giorno.</p>`;
      return;
    }
    let html = "", prevSvc = null;
    s.forEach((m) => {
      const svc = m < 900 ? "pranzo" : m < 1080 ? "pomeriggio" : "sera";
      if (svc !== prevSvc && B[bk.brand].hours[isoDow(bk.date)].length > 1) html += `<span class="sh-slots-label">${svc}</span>`;
      prevSvc = svc;
      html += `<button type="button" class="sh-slot" data-m="${m}" aria-pressed="${m === bk.slot}">${hm(m)}</button>`;
    });
    box.innerHTML = html;
  }
  function renderParty() {
    $("#bk-party").textContent = bk.party;
    $("#bk-minus").disabled = bk.party <= 1;
    $("#bk-party-note").textContent = bk.party >= 8 ? `Per 9 o più persone chiamaci: ${bk.brand ? LOC[bk.brand][bk.city].tel : "+39 040 000 0412"}.` : "";
  }
  function renderSum() {
    const parts = [];
    if (bk.brand) parts.push(name(bk.brand)); parts.push(C[bk.city].name);
    if (bk.date) parts.push(niceDate(bk.date)); if (bk.slot != null) parts.push(hm(bk.slot));
    parts.push(`${bk.party} ${bk.party === 1 ? "persona" : "persone"}`);
    $("#bk-sum").textContent = parts.join(" · ");
  }
  function renderBk() { state.bookTint = bk.brand; applyTint(); renderBkCity(); renderBkBrand(); renderSlots(); renderParty(); renderSum(); }
  function clearErr() { $$(".sh-err", form).forEach((e) => (e.textContent = "")); $$("[aria-invalid]", form).forEach((e) => e.removeAttribute("aria-invalid")); }

  function openBook(ctx = {}, from) {
    opener = from || document.activeElement;
    clearTimeout(closeT);
    let city = ctx.city || state.city, brand = ctx.brand || null;
    if (brand && !C[city].brands.includes(brand)) city = LOC[brand][state.city] ? state.city : citiesOf(brand)[0].id;
    Object.assign(bk, { city, brand, slot: null, party: 2 });
    bk.date = firstDateWithSlots(brand);
    const t = romeNow().iso, di = $("#bk-date");
    di.min = t; di.max = addDays(t, 60); di.value = bk.date;
    form.hidden = false; done.hidden = true; form.reset(); di.value = bk.date; clearErr();
    renderBk();
    modal.hidden = false; void modal.offsetWidth; modal.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
    const first = $('#bk-brand [aria-checked="true"]') || $('#bk-city [aria-checked="true"]');
    setTimeout(() => (first || $(".sh-x", modal)).focus({ preventScroll: true }), 30);
  }
  function closeBook() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    state.bookTint = null; applyTint();
    closeT = setTimeout(() => { modal.hidden = true; }, reduce ? 0 : 300);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeBook(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!modal.hidden) closeBook(); else closeNav(); }
    if (e.key === "Tab" && !modal.hidden) {
      const f = $$('button:not([disabled]), input, [tabindex="0"]', $(".sh-sheet")).filter((x) => x.offsetParent !== null && x.tabIndex >= 0);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  $("#bk-city").addEventListener("click", (e) => {
    const c = e.target.closest("[data-c]"); if (!c) return;
    bk.city = c.dataset.c;
    if (bk.brand && !C[bk.city].brands.includes(bk.brand)) bk.brand = null;
    $("#bk-err-brand").textContent = "";
    renderBk();
  });
  $("#bk-city").addEventListener("keydown", (e) => {
    if (!/Arrow(Left|Right|Up|Down)/.test(e.key)) return; e.preventDefault();
    const i = CITIES.findIndex((c) => c.id === bk.city), j = (i + (/Right|Down/.test(e.key) ? 1 : -1) + 4) % 4;
    bk.city = CITIES[j].id; if (bk.brand && !C[bk.city].brands.includes(bk.brand)) bk.brand = null; renderBk(); $(`#bk-city [data-c="${bk.city}"]`).focus();
  });
  $("#bk-brand").addEventListener("click", (e) => {
    const b = e.target.closest("[data-b]"); if (!b) return;
    bk.brand = b.dataset.b; $("#bk-err-brand").textContent = ""; state.bookTint = bk.brand; applyTint();
    if (!slotsFor(bk.brand, bk.date).length) { bk.date = firstDateWithSlots(bk.brand); $("#bk-date").value = bk.date; }
    renderBkBrand(); renderSlots(); renderParty(); renderSum();
  });
  $("#bk-date").addEventListener("change", (e) => { bk.date = e.target.value; e.target.removeAttribute("aria-invalid"); $("#bk-err-when").textContent = ""; renderSlots(); renderSum(); });
  $("#bk-slots").addEventListener("click", (e) => {
    const s = e.target.closest("[data-m]"); if (!s) return;
    bk.slot = +s.dataset.m; $("#bk-err-when").textContent = "";
    $$(".sh-slot").forEach((x) => x.setAttribute("aria-pressed", String(x === s))); renderSum();
  });
  $("#bk-minus").addEventListener("click", () => { if (bk.party > 1) bk.party--; renderParty(); renderSum(); });
  $("#bk-plus").addEventListener("click", () => { if (bk.party < 8) bk.party++; renderParty(); renderSum(); });
  ["#bk-name", "#bk-tel"].forEach((s) => $(s).addEventListener("input", (e) => { e.target.removeAttribute("aria-invalid"); $("#bk-err-who").textContent = ""; }));

  form.addEventListener("submit", (e) => {
    e.preventDefault(); clearErr();
    let bad = null;
    const flag = (el, box, msg) => { if (el) el.setAttribute("aria-invalid", "true"); if (!box.textContent) box.textContent = msg; bad = bad || el || box; };
    const t = romeNow().iso, di = $("#bk-date"), nm = $("#bk-name"), tel = $("#bk-tel");
    if (!bk.brand) flag(null, $("#bk-err-brand"), "Scegli una delle case di " + C[bk.city].name + ".");
    if (!bk.date || !/^\d{4}-\d{2}-\d{2}$/.test(bk.date)) flag(di, $("#bk-err-when"), "Scegli una data.");
    else if (bk.date < t) flag(di, $("#bk-err-when"), "La data è già passata.");
    else if (bk.date > addDays(t, 60)) flag(di, $("#bk-err-when"), "Prenotiamo fino a 60 giorni in anticipo.");
    else if (bk.brand && bk.slot == null) flag(null, $("#bk-err-when"), slotsFor(bk.brand, bk.date).length ? "Scegli un orario." : "In questa data non ci sono orari: scegli un altro giorno.");
    if (nm.value.trim().length < 2) flag(nm, $("#bk-err-who"), "Scrivi nome e cognome.");
    if ((tel.value.match(/\d/g) || []).length < 6) flag(tel, $("#bk-err-who"), "Serve un numero di telefono valido per confermarti il tavolo.");
    if (bad) {
      const target = bad.matches && bad.matches("input") ? bad : bad === $("#bk-err-brand") ? $("#bk-brand button") : $(".sh-slot") || di;
      if (target) target.focus();
      return;
    }
    const code = `SH-${C[bk.city].code}-${String(1000 + Math.floor(Math.random() * 9000))}`;
    $("#sh-done-txt").textContent = `${name(bk.brand)} · ${LOC[bk.brand][bk.city].addr}. ${niceDate(bk.date, true)[0].toUpperCase() + niceDate(bk.date, true).slice(1)} alle ${hm(bk.slot)}, ${bk.party} ${bk.party === 1 ? "persona" : "persone"}, a nome di ${nm.value.trim()}. Ti mandiamo un SMS di conferma al ${tel.value.trim()}.`;
    $("#sh-done-code").textContent = code;
    form.hidden = true; done.hidden = false; done.focus({ preventScroll: true });
    if (!reduce) { const m = $(".sh-done-mark", done); [...m.children].forEach((c, i) => prepDraw(c, i * 260, 520)); redraw(m); }
  });

  /* ───────────────────────── newsletter ───────────────────────── */
  $("#sh-news").addEventListener("submit", (e) => {
    e.preventDefault();
    const i = $("#sh-news-mail"), err = $("#sh-news-err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim())) { err.textContent = "Controlla l'indirizzo email."; i.setAttribute("aria-invalid", "true"); i.focus(); return; }
    err.textContent = ""; i.removeAttribute("aria-invalid"); i.value = "";
    toast("Grazie! Ti scriviamo a inizio mese, niente di più.");
  });

  /* ───────────────────────── boot ───────────────────────── */
  buildOcto($("#sh-octo"));
  const fishSvg = $("#sh-foot-fish");
  fishSvg.innerHTML = `<g transform="translate(6 -4) scale(2.3)">${ICONS.fish}</g>`;
  renderCities(); renderCards(false);
  setFly(null);
  state.casa = "shio"; state.casaCity = "trieste"; renderCasa();
  redraw($("#sh-octo"));
  // the casa creature draws when the section first comes into view
  const io = new IntersectionObserver((ents) => { if (ents.some((x) => x.isIntersecting)) { drawCreature(); io.disconnect(); } }, { threshold: 0.2 });
  io.observe($(".sh-casa-hero"));
  // ambient hue: walking into a house repaints the room in its colour; walking out gives it back
  const casaEl = $("#casa");
  const inView = () => {
    const r = casaEl.getBoundingClientRect(), vh = innerHeight;
    const v = r.top < vh * 0.45 && r.bottom > vh * 0.55;
    if (v !== state.inCasa) { state.inCasa = v; if (!state.preview) applyTint(); frameHue(null); }
  };
  addEventListener("scroll", () => requestAnimationFrame(inView), { passive: true }); addEventListener("resize", inView); inView();
  setInterval(() => {
    $$("[data-st]").forEach((el) => paintStatus(el, el.dataset.st));
    paintStatus($("#sh-casa-status"), state.casa);
  }, 60000);

  window.__shio = { state, statusOf, romeNow, slotsFor, selectBrand, setCity, openBook, refresh: () => { $$("[data-st]").forEach((el) => paintStatus(el, el.dataset.st)); paintStatus($("#sh-casa-status"), state.casa); } };
})();
