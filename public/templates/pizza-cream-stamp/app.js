/* Ottofette — pizza-cream-stamp · app.js (no libraries) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mqMobile = matchMedia("(max-width: 960px)");
  var DEBUG = (window.__of = {});

  /* storage: sandboxed iframe throws on access → memory fallback */
  var mem = {};
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return k in mem ? mem[k] : null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  };

  var eur = function (n) { return n.toFixed(2).replace(".", ",") + " €"; };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var hm = function (m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------------- toast ---------------- */
  var toastEl = $("#toast"), toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 2600);
  }
  $$("[data-toast]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); toast(a.getAttribute("data-toast")); }); });

  /* ---------------- time (Europe/Rome), ?ora=YYYY-MM-DDTHH:MM to pin ---------------- */
  var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  var pinned = null, pinnedAt = Date.now();
  (function () {
    var m = /[?&]ora=(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(location.search);
    if (m) pinned = { y: +m[1], mo: +m[2], d: +m[3], min: +m[4] * 60 + +m[5] };
  })();
  function romeNow() {
    var y, mo, d, min;
    if (pinned) {
      var extra = Math.floor((Date.now() - pinnedAt) / 60000);
      var dt = new Date(Date.UTC(pinned.y, pinned.mo - 1, pinned.d) + (pinned.min + extra) * 60000);
      y = dt.getUTCFullYear(); mo = dt.getUTCMonth() + 1; d = dt.getUTCDate(); min = dt.getUTCHours() * 60 + dt.getUTCMinutes();
    } else {
      var p = {}; fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      y = +p.year; mo = +p.month; d = +p.day; min = (+p.hour % 24) * 60 + +p.minute;
    }
    var day0 = Date.UTC(y, mo - 1, d);
    return { day0: day0, wd: new Date(day0).getUTCDay(), min: min };
  }
  var GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var GG = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  var MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

  /* ---------------- data ---------------- */
  // hours: per weekday (0 = domenica) list of [open, close] minutes; close > 1440 = past midnight
  function H(spec) { var w = [[], [], [], [], [], [], []]; spec.forEach(function (s) { s[0].forEach(function (d) { w[d].push([s[1], s[2]]); }); }); w.forEach(function (l) { l.sort(function (a, b) { return a[0] - b[0]; }); }); return w; }
  var ALL = [0, 1, 2, 3, 4, 5, 6];
  var STORES = [
    { id: "centro", city: "Ravenna", area: "Centro", addr: "Via Mazzini 41, 48121 Ravenna", tel: "0544 218 840", tint: "#fde3cf", art: "arches",
      caps: ["48121", "48122", "48123", "48124"],
      hours: H([[ALL, 720, 870], [[0, 1, 2, 3, 4], 1140, 1350], [[5, 6], 1140, 1410]]),
      text: [["Pranzo", "tutti i giorni 12:00–14:30"], ["Cena", "dom–gio 19:00–22:30"], ["", "ven e sab 19:00–23:30"]] },
    { id: "darsena", city: "Ravenna", area: "Darsena", addr: "Via d'Alaggio 9, 48122 Ravenna", tel: "0544 178 6022", tint: "#d8e7ee", art: "dock",
      caps: ["48122", "48123", "48125"],
      hours: H([[[0, 6], 720, 900], [[0, 2, 3, 4], 1110, 1380], [[5, 6], 1110, 1470]]),
      text: [["Pranzo", "sab e dom 12:00–15:00"], ["Cena", "mar–gio e dom 18:30–23:00"], ["", "ven e sab 18:30–00:30"], ["", "lunedì chiuso"]] },
    { id: "faenza", city: "Faenza", area: "Corso Garibaldi", addr: "Corso Garibaldi 12, 48018 Faenza", tel: "0546 698 213", tint: "#f6e3b8", art: "awning",
      caps: ["48018"],
      hours: H([[[0, 2, 3, 4, 5, 6], 720, 870], [[0, 1, 2, 3, 4], 1140, 1350], [[5, 6], 1140, 1380]]),
      text: [["Pranzo", "mar–dom 12:00–14:30"], ["Cena", "dom–gio 19:00–22:30"], ["", "ven e sab 19:00–23:00"]] },
    { id: "forli", city: "Forlì", area: "San Mercuriale", addr: "Via delle Torri 5, 47121 Forlì", tel: "0543 371 590", tint: "#e2ead0", art: "tower",
      caps: ["47121", "47122"],
      hours: H([[ALL, 720, 870], [[0, 1, 2, 3, 4], 1140, 1350], [[5, 6], 1140, 1380]]),
      text: [["Pranzo", "tutti i giorni 12:00–14:30"], ["Cena", "dom–gio 19:00–22:30"], ["", "ven e sab 19:00–23:00"]] },
    { id: "cesena", city: "Cesena", area: "Malatestiana", addr: "Via Zeffirino Re 18, 47521 Cesena", tel: "0547 192 0334", tint: "#f8dad6", art: "shutter",
      caps: ["47521", "47522"],
      hours: H([[[1, 2, 3, 4, 5], 735, 870], [ALL, 1140, 1380]]),
      text: [["Pranzo", "lun–ven 12:15–14:30"], ["Cena", "tutti i giorni 19:00–23:00"]] },
    { id: "rimini", city: "Rimini", area: "Borgo San Giuliano", addr: "Via Marecchia 30, 47921 Rimini", tel: "0541 183 0447", tint: "#d5ece4", art: "beach",
      caps: ["47921", "47922", "47923"],
      hours: H([[ALL, 720, 900], [[0, 1, 2, 3, 4], 1140, 1440], [[5, 6], 1140, 1500]]),
      text: [["Pranzo", "tutti i giorni 12:00–15:00"], ["Cena", "dom–gio 19:00–24:00"], ["", "ven e sab 19:00–01:00"]] }
  ];
  var byId = function (id) { for (var i = 0; i < STORES.length; i++) if (STORES[i].id === id) return STORES[i]; return null; };
  var sname = function (s) { return s.city + " " + s.area; };

  var MENU = [
    { id: "pizze", n: "Pizze", note: "Già tagliate in 8 fette, per assaggiare di tutto.", items: [
      { id: "marinara", n: "Marinara", d: "Pomodoro bio, aglio di Voghiera, origano di collina, olio extravergine", p: 7, t: ["vegan"], img: "marinara" },
      { id: "margherita", n: "Margherita", d: "Fiordilatte, pomodoro bio, basilico, olio extravergine", p: 9, t: ["veg"], img: "margherita" },
      { id: "spinaci", n: "Spinaci e ricotta", d: "Spinaci saltati*, ricotta di pecora, fiordilatte, scorza di limone", p: 11, t: ["veg"], img: "ortolana" },
      { id: "diavola", n: "Diavola", d: "Salame piccante di Mora romagnola, fiordilatte, pomodoro bio, peperoncino fresco", p: 11.5, t: ["hot"], img: "diavola" },
      { id: "cotto", n: "Cotto e funghi", d: "Prosciutto cotto alla brace, champignon trifolati, fiordilatte, pomodoro bio", p: 11.5, t: [], img: "prosciutto-funghi" },
      { id: "rucola", n: "Salamino e rucola", d: "Salamino piccante, pomodorini, rucola, mais dolce, fiordilatte", p: 12, t: ["hot"], img: "salame-rucola" },
      { id: "bianca", n: "Bianca noci e miele", d: "Fiordilatte, gorgonzola dolce, noci, peperoncino in agrodolce, miele di castagno", p: 12, t: ["veg", "hot"], img: "formaggi" },
      { id: "capricciosa", n: "Capricciosa", d: "Cotto, salsiccia, olive, peperoni, funghi, carciofini, fiordilatte", p: 12.5, t: [], img: "capricciosa" }
    ] },
    { id: "speciali", n: "Speciali", note: "Cambiano con le stagioni. Solo a cena.", items: [
      { id: "squacquerone", n: "Squacquerone e fichi", d: "Squacquerone di Romagna, fichi caramellati, crudo stagionato, rucola", p: 13.5, t: [] },
      { id: "zucca", n: "Zucca e salsiccia", d: "Crema di zucca*, salsiccia di Mora, scamorza affumicata, salvia croccante", p: 13, t: [] },
      { id: "ndujamiele", n: "'Nduja e miele", d: "'Nduja calabrese, miele di castagno, fiordilatte, cipolla rossa al forno", p: 12.5, t: ["hot"] },
      { id: "ceci", n: "Orto e ceci", d: "Crema di ceci, verdure arrosto di stagione, pomodori secchi, mandorle tostate", p: 12, t: ["vegan"] },
      { id: "mare", n: "Marinara di mare", d: "Pomodoro bio, vongole e cozze dell'Adriatico, aglio, prezzemolo, limone", p: 15, t: [] }
    ] },
    { id: "sfizi", n: "Sfizi", note: "Da dividere mentre arriva la pizza.", items: [
      { id: "montanare", n: "Montanarine (4)", d: "Impasto fritto, pomodoro, parmigiano, basilico", p: 6, t: ["veg"] },
      { id: "crocchette", n: "Crocchette di patate (5)", d: "Patate di montagna, prezzemolo, panatura croccante", p: 5, t: ["veg"] },
      { id: "ascolana", n: "Olive all'ascolana (8)", d: "Olive verdi ripiene di carne, fritte al momento", p: 6.5, t: [] },
      { id: "salse", n: "Tris di salse per i bordi", d: "Miele piccante, salsa verde, maionese all'aglio nero", p: 4.5, t: ["veg", "hot"] },
      { id: "patate", n: "Patate al forno", d: "Al rosmarino, con buccia", p: 4.5, t: ["vegan"] }
    ] },
    { id: "insalate", n: "Insalate", note: "Condite al momento, olio a parte se vuoi.", items: [
      { id: "orto", n: "Insalata dell'orto", d: "Misticanza, finocchio, arancia, olive taggiasche", p: 8, t: ["vegan"] },
      { id: "radicchio", n: "Radicchio e squacquerone", d: "Radicchio, squacquerone, noci, pera", p: 9.5, t: ["veg"] },
      { id: "tonno", n: "Tonno e fagioli", d: "Tonno all'olio, cannellini, cipolla di Tropea, sedano", p: 10, t: [] }
    ] },
    { id: "dolci", n: "Dolci", note: "Fatti in casa ogni mattina.", items: [
      { id: "tiramisu", n: "Tiramisù nel barattolo", d: "Savoiardi, mascarpone, caffè della moka", p: 5.5, t: ["veg"] },
      { id: "zuppa", n: "Zuppa inglese", d: "Crema, cioccolato, alchermes, pan di Spagna", p: 5.5, t: ["veg"] },
      { id: "dolcefetta", n: "Fetta dolce", d: "Impasto della casa, crema di nocciole, granella", p: 5, t: ["veg"] },
      { id: "sorbetto", n: "Sorbetto al limone", d: "Limoni di Sicilia, senza latte", p: 4, t: ["vegan"] }
    ] },
    { id: "bevande", n: "Bevande", note: "Birra e vino di piccoli produttori romagnoli.", items: [
      { id: "acqua", n: "Acqua 75 cl", d: "Naturale o frizzante", p: 2.5, t: ["vegan"] },
      { id: "bibita", n: "Chinotto o aranciata bio", d: "Bottiglia da 27,5 cl", p: 3.5, t: ["vegan"] },
      { id: "birra", n: "Birra artigianale chiara", d: "Bionda non filtrata, 33 cl", p: 5.5, t: ["vegan"] },
      { id: "sangiovese", n: "Sangiovese di Romagna", d: "Al calice", p: 5, t: ["vegan"] },
      { id: "caffe", n: "Caffè", d: "Miscela di una torrefazione di Ravenna", p: 1.5, t: ["vegan"] }
    ] }
  ];
  var ITEMS = {}; MENU.forEach(function (c) { c.items.forEach(function (it) { it.cat = c.id; ITEMS[it.id] = it; }); });
  var FLAV = MENU[0].items; // the 8 pizzas = the 8 slices
  var isVeg = function (it) { return it.t.indexOf("veg") > -1 || it.t.indexOf("vegan") > -1; };

  var NEWS = [
    { img: "n-inverno", d: "12 novembre 2026", t: "Le pizze d'inverno sono arrivate in carta", b: ["Zucca e salsiccia, squacquerone e fichi, e una marinara di mare con le vongole dell'Adriatico: le speciali di stagione sono in tutte le pizzerie, solo a cena.", "Restano fino a fine febbraio. Se ne vuoi una fetta di ciascuna, chiedi la Mista: otto gusti, una pizza."] },
    { img: "n-box", d: "28 ottobre 2026", t: "Delivery anche a Cesena, con la scatola nuova", b: ["Da questa settimana consegniamo anche dalla pizzeria di Cesena, nei CAP 47521 e 47522.", "E cambia la scatola: cartone riciclato senza plastica, con la griglia per far respirare il cornicione. Arriva croccante come al tavolo."] },
    { img: "n-pranzo", d: "15 ottobre 2026", t: "Torna il pranzo a 12 euro", b: ["Dal lunedì al venerdì, a pranzo: una pizza classica a scelta, una bibita o un calice e il caffè. Dodici euro, in tutte le pizzerie.", "Prenotare conviene: alle 13 la sala si riempie in fretta."] },
    { img: "n-madre", d: "2 ottobre 2026", t: "Teresa compie quindici anni", b: ["La nostra madre è nata nel marzo 2011 in una cucina di via Mazzini. Quindici anni dopo nutre sei pizzerie.", "Sabato 17 la festeggiamo: chi porta un barattolo pulito torna a casa con un po' di lei e le istruzioni per non farla morire."] },
    { img: "n-impasto", d: "20 settembre 2026", t: "Cerchiamo pizzaioli (anche alle prime armi)", b: ["Sei settimane di corso pagato nella pizzeria di Ravenna Centro: impasto, staglio, forno, e come si tiene in vita un lievito madre.", "Poi un posto in una delle nostre pizzerie. Scrivici a lavoro@ottofette.it con due righe su di te."] }
  ];

  /* ---------------- open / closed ---------------- */
  function status(s, now) {
    now = now || romeNow();
    var wd = now.wd, m = now.min, i, iv;
    var today = s.hours[wd], yest = s.hours[(wd + 6) % 7];
    for (i = 0; i < yest.length; i++) { iv = yest[i]; if (iv[1] > 1440 && m < iv[1] - 1440) return { open: true, cls: "open", label: "Aperta ora · chiude alle " + hm(iv[1]), closeAt: iv[1] - 1440 }; }
    for (i = 0; i < today.length; i++) { iv = today[i]; if (m >= iv[0] && m < iv[1]) return { open: true, cls: "open", label: "Aperta ora · chiude alle " + hm(iv[1]), closeAt: iv[1] }; }
    for (i = 0; i < today.length; i++) { iv = today[i]; if (iv[0] > m) { var soon = iv[0] - m <= 60; return { open: false, cls: soon ? "soon" : "", label: (soon ? "Apre tra " + (iv[0] - m) + " min" : "Chiusa · apre alle " + hm(iv[0])) }; } }
    for (var k = 1; k <= 7; k++) {
      var l = s.hours[(wd + k) % 7];
      if (l.length) return { open: false, cls: "", label: "Chiusa · riapre " + (k === 1 ? "domani" : GIORNI[(wd + k) % 7]) + " alle " + hm(l[0][0]) };
    }
    return { open: false, cls: "", label: "Chiusa" };
  }
  DEBUG.status = function (id) { return status(byId(id)); };

  /* ---------------- header / mobile menu ---------------- */
  var burger = $(".of-burger"), mob = $("#ofMob");
  function setMob(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    if (open) { mob.hidden = false; mob.classList.remove("in"); void mob.offsetWidth; mob.classList.add("in"); document.documentElement.style.overflow = "hidden"; }
    else { mob.hidden = true; if (!openLayer) document.documentElement.style.overflow = ""; }
  }
  burger.addEventListener("click", function () { setMob(burger.getAttribute("aria-expanded") !== "true"); });
  $$("#ofMob a").forEach(function (a) { a.addEventListener("click", function () { setMob(false); }); });
  mqMobile.addEventListener("change", function (e) { if (!e.matches) setMob(false); });

  function renderMobStores() {
    var now = romeNow();
    $("#mobStores").innerHTML = STORES.map(function (s, i) {
      var st = status(s, now);
      return '<li><button type="button" data-i="' + i + '"><span>' + sname(s) + '</span><small><span class="of-dot ' + st.cls + '"></span>' + (st.open ? "aperta" : "chiusa") + " ›</small></button></li>";
    }).join("");
  }
  $("#mobStores").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    setMob(false); selectStore(+b.dataset.i, true);
    $("#pizzerie").scrollIntoView({ block: "start" });
  });

  // nav highlight
  var navLinks = $$(".of-nav a");
  var secIds = navLinks.map(function (a) { return a.getAttribute("href").slice(1); });
  function navSpy() {
    var y = innerHeight * .35, cur = "", best = -1e9;
    secIds.forEach(function (id) { var el = document.getElementById(id), t = el ? el.getBoundingClientRect().top : 1e9; if (t < y && t > best) { best = t; cur = id; } });
    if (cur === "otto") cur = "pizza";
    navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + cur); });
  }

  /* ---------------- hero status ---------------- */
  function renderHero() {
    var s = STORES[0], st = status(s);
    $("#heroDot").className = "of-dot " + st.cls;
    $("#heroStatus").textContent = sname(s) + " · " + st.label.replace("Aperta ora", "aperta ora");
  }

  /* ---------------- line drawings (drawn stroke by stroke) ---------------- */
  function prepDraw(svg) { $$(":scope > path, :scope > circle, :scope > rect, :scope > line", svg).forEach(function (p) { p.setAttribute("pathLength", "1"); }); }
  var drawIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); drawIO.unobserve(e.target); } });
  }, { threshold: .35 });
  ["#drawHand", "#drawJar", "#drawPromo"].forEach(function (s) { var el = $(s); prepDraw(el); drawIO.observe(el); });

  /* ---------------- stamp (from the receipt-print-stamp effect) ---------------- */
  function stampIn(el, rot) {
    el.classList.add("on");
    if (reduce || !el.animate) return Promise.resolve();
    rot = rot || 0;
    var a = el.animate([
      { opacity: 0, transform: "scale(1.9) rotate(" + (rot - 9) + "deg)", filter: "blur(3px)" },
      { opacity: 1, transform: "scale(.96) rotate(" + (rot - 1) + "deg)", filter: "blur(0px)", offset: .72 },
      { opacity: 1, transform: "scale(1) rotate(" + rot + "deg)", filter: "none" }
    ], { duration: 280, easing: "cubic-bezier(.5,0,.75,0)" });
    return a.finished.catch(function () {});
  }
  function jolt(el, px) {
    if (reduce || !el.animate) return;
    el.animate([{ transform: "translateY(0)" }, { transform: "translateY(" + (px || 3) + "px)", offset: .35 }, { transform: "translateY(0)" }], { duration: 200, easing: "ease-out" });
  }

  /* ---------------- why: pinned claims stamp in with scroll ---------------- */
  var why = $(".of-why"), claims = $$(".of-claim"), awards = $$(".of-award"), whyMore = $(".of-why__more");
  var stampQ = Promise.resolve();
  function whyProgress() {
    var r = why.getBoundingClientRect(), hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hh")) || 0;
    var span = r.height - (innerHeight - hh);
    return span > 0 ? Math.max(0, Math.min(1, (hh - r.top) / span)) : 1;
  }
  function whyTick() {
    var p = reduce ? 1 : whyProgress();
    DEBUG.whyP = p;
    claims.concat(awards).forEach(function (el) {
      var at = +el.dataset.at;
      if (p >= at && !el.dataset.st) {
        el.dataset.st = "1";
        stampQ = stampQ.then(function () {
          if (!el.dataset.st) return;
          return stampIn(el, 0).then(function () { jolt(el.parentNode, 3); return sleep(70); });
        });
      } else if (p < at - .05 && el.dataset.st) {
        delete el.dataset.st; el.classList.remove("on");
      }
    });
    whyMore.classList.toggle("on", p >= .6);
  }

  /* ---------------- 8 fette pizza ---------------- */
  var R = 280;
  function wedgePath(i) {
    var c = (-90 + i * 45) * Math.PI / 180, a0 = c - Math.PI / 8, a1 = c + Math.PI / 8;
    return "M0 0 L" + (R * Math.cos(a0)).toFixed(2) + " " + (R * Math.sin(a0)).toFixed(2) + " A" + R + " " + R + " 0 0 1 " + (R * Math.cos(a1)).toFixed(2) + " " + (R * Math.sin(a1)).toFixed(2) + "Z";
  }
  function buildPizza(svg, pref, imgs, names) {
    var h = '<defs>';
    for (var i = 0; i < 8; i++) h += '<clipPath id="' + pref + i + '" clipPathUnits="userSpaceOnUse"><path d="' + wedgePath(i) + '"/></clipPath>';
    h += '</defs><circle class="board" r="302"/><circle class="board-in" r="291"/><g class="rot" transform="rotate(0)">';
    for (i = 0; i < 8; i++) {
      h += '<g class="w" data-i="' + i + '" tabindex="0" role="button" aria-label="Fetta ' + (i + 1) + ': ' + names[i] + '" transform="translate(0 0)">' +
        '<title>' + names[i] + '</title>' +
        '<image href="assets/p-' + imgs[i] + '.webp" x="-280" y="-280" width="560" height="560" clip-path="url(#' + pref + i + ')" preserveAspectRatio="xMidYMid slice"/>' +
        '<path class="shade" d="' + wedgePath(i) + '"/><path class="edge" d="' + wedgePath(i) + '"/></g>';
    }
    h += '</g>';
    svg.innerHTML = h;
    var api = { rot: 0, pull: [0, 0, 0, 0, 0, 0, 0, 0], sel: -1, raf: 0, svg: svg, rotG: $(".rot", svg), w: $$(".w", svg) };
    api.apply = function () {
      api.rotG.setAttribute("transform", "rotate(" + api.rot.toFixed(2) + ")");
      api.w.forEach(function (g, i) {
        var c = (-90 + i * 45) * Math.PI / 180, d = 24 * api.pull[i];
        g.setAttribute("transform", "translate(" + (Math.cos(c) * d).toFixed(2) + " " + (Math.sin(c) * d).toFixed(2) + ")");
      });
    };
    api.go = function (sel, rotTo, dur) {
      api.sel = sel;
      api.w.forEach(function (g, i) { g.classList.toggle("on", i === sel); });
      var r0 = api.rot, p0 = api.pull.slice(), t0 = performance.now();
      var p1 = api.pull.map(function (_, i) { return i === sel ? 1 : 0; });
      cancelAnimationFrame(api.raf);
      if (reduce || !dur) { api.rot = rotTo; api.pull = p1; api.apply(); return; }
      var step = function (now) {
        var t = Math.min(1, (now - t0) / dur), e = easeOut(t);
        api.rot = r0 + (rotTo - r0) * e;
        api.pull = p0.map(function (v, i) { return v + (p1[i] - v) * e; });
        api.apply();
        if (t < 1) api.raf = requestAnimationFrame(step);
      };
      api.raf = requestAnimationFrame(step);
    };
    return api;
  }

  var pz = buildPizza($("#pz"), "ofw", FLAV.map(function (f) { return f.img; }), FLAV.map(function (f) { return f.n; }));
  pz.svg.classList.add("all");
  DEBUG.pz = pz;
  var cardSel = -1;
  function pointTo(i) {
    var target = mqMobile.matches ? 90 : 0;  // the slice faces the card: right on desktop, down on mobile
    var want = target - (-90 + i * 45), cur = pz.rot;
    var d = ((want - cur) % 360 + 540) % 360 - 180;  // shortest way round
    return cur + d;
  }
  function selectSlice(i, anim) {
    i = (i + 8) % 8;
    pz.svg.classList.remove("all");
    pz.go(i, pointTo(i), anim === false ? 0 : 620);
    if (i === cardSel) return;
    cardSel = i;
    var f = FLAV[i], card = $("#sliceCard"), parts = $$(".of-slice__t, .of-slice__d, .of-slice__tags, .of-slice__p", card);
    var fill = function () {
      $("#sliceN").textContent = "Fetta " + (i + 1) + " di 8";
      $("#sliceT").textContent = f.n;
      $("#sliceD").textContent = f.d;
      var tags = f.d.split(", ").slice(0, 4).map(function (x) { return "<li>" + x.replace(/\*$/, "") + "</li>"; });
      if (f.t.indexOf("vegan") > -1) tags.unshift('<li class="v">Vegana</li>'); else if (f.t.indexOf("veg") > -1) tags.unshift('<li class="v">Vegetariana</li>');
      if (f.t.indexOf("hot") > -1) tags.unshift('<li class="h">Piccante</li>');
      $("#sliceTags").innerHTML = tags.join("");
      $("#sliceP").textContent = eur(f.p);
      $("#sliceAdd").dataset.id = f.id;
    };
    if (reduce || anim === false) { fill(); return; }
    parts.forEach(function (p) { p.classList.add("swap", "out"); });
    setTimeout(function () { fill(); parts.forEach(function (p) { p.classList.remove("out"); }); }, 200);
  }
  DEBUG.selectSlice = selectSlice;
  pz.svg.addEventListener("click", function (e) { var g = e.target.closest(".w"); if (g) selectSlice(+g.dataset.i); });
  pz.svg.addEventListener("keydown", function (e) {
    var g = e.target.closest(".w"); if (!g) return;
    var i = +g.dataset.i;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSlice(i); }
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); selectSlice((cardSel < 0 ? i : cardSel) + 1); pz.w[cardSel].focus({ preventScroll: true }); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); selectSlice((cardSel < 0 ? i : cardSel) - 1); pz.w[cardSel].focus({ preventScroll: true }); }
  });
  $("#slicePrev").addEventListener("click", function () { selectSlice(cardSel - 1); });
  $("#sliceNext").addEventListener("click", function () { selectSlice(cardSel + 1); });
  $("#sliceAdd").addEventListener("click", function () { addItem(this.dataset.id); });
  $("#pzHint").textContent = mqMobile.matches ? "Tocca una fetta" : "Clicca una fetta · ← → per girare";
  mqMobile.addEventListener("change", function () { if (cardSel > -1) pz.go(cardSel, pointTo(cardSel), 400); $("#pzHint").textContent = mqMobile.matches ? "Tocca una fetta" : "Clicca una fetta · ← → per girare"; });
  selectSlice(0, false); pz.go(-1, 0, 0); pz.svg.classList.add("all"); cardSel = 0;
  new IntersectionObserver(function (es, io) {
    es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); setTimeout(function () { cardSel = -1; selectSlice(0); }, 250); } });
  }, { threshold: .45 }).observe(pz.svg);

  /* ---------------- lievito madre ---------------- */
  var tabA = $("#madreTabA"), tabB = $("#madreTabB");
  [tabA, tabB].forEach(function (t) {
    t.addEventListener("click", function () {
      var a = t === tabA;
      tabA.setAttribute("aria-selected", a); tabB.setAttribute("aria-selected", !a);
      var show = a ? $("#madreA") : $("#madreB"), hide = a ? $("#madreB") : $("#madreA");
      hide.hidden = true; show.hidden = false; show.classList.remove("in"); void show.offsetWidth; show.classList.add("in");
    });
    t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var o = t === tabA ? tabB : tabA; o.click(); o.focus(); } });
  });
  function fermText() {
    var m = romeNow().min, since = ((m - 1080) % 1440 + 1440) % 1440; // batches start at 18:00 for the next evening
    var p = since / 1440, h = Math.floor(since / 60), mm = since % 60;
    var dur = h + " h " + pad(mm) + " min";
    $("#fermTxt").innerHTML = m >= 1080
      ? "L'impasto di stasera è pronto. Quello di domani riposa da <b>" + dur + "</b> su 24."
      : "L'impasto che sforniamo stasera riposa da <b>" + dur + "</b> su 24.";
    return p;
  }
  var fermP = fermText();
  new IntersectionObserver(function (es, io) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); $("#fermBar").style.width = (fermP * 100).toFixed(1) + "%"; } }); }, { threshold: .6 }).observe($("#ferm"));

  /* ---------------- news: snap rail + spinning stamp ---------------- */
  var rail = $("#newsRail");
  rail.innerHTML = NEWS.map(function (n, i) {
    return '<article class="of-nc"><button type="button" data-n="' + i + '"><div class="of-nc__img"><img src="assets/' + n.img + '.webp" alt="" width="720" height="540" loading="lazy"></div>' +
      '<p class="of-nc__d">' + n.d + '</p><span class="of-nc__t">' + n.t + '</span><span class="of-nc__go" aria-hidden="true">→</span></button></article>';
  }).join("");
  $("#newsDots").innerHTML = NEWS.map(function () { return "<i></i>"; }).join("");
  var ncs = $$(".of-nc", rail), dots = $$("#newsDots i");
  function railIdx() {
    var x = rail.scrollLeft, best = 0, bd = 1e9;
    ncs.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - rail.offsetLeft - x); if (d < bd) { bd = d; best = i; } });
    if (x + rail.clientWidth >= rail.scrollWidth - 4) best = Math.max(best, ncs.length - 1);
    return best;
  }
  function railUI() {
    var i = railIdx();
    dots.forEach(function (d, k) { d.classList.toggle("on", k === i); });
    $("#newsPrev").disabled = rail.scrollLeft < 4;
    $("#newsNext").disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
  }
  rail.addEventListener("scroll", function () { requestAnimationFrame(railUI); }, { passive: true });
  function railGo(dir) {
    var i = Math.max(0, Math.min(ncs.length - 1, railIdx() + dir));
    rail.scrollTo({ left: ncs[i].offsetLeft - rail.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }
  $("#newsPrev").addEventListener("click", function () { railGo(-1); });
  $("#newsNext").addEventListener("click", function () { railGo(1); });
  rail.addEventListener("keydown", function (e) { if (e.target !== rail) return; if (e.key === "ArrowRight") { e.preventDefault(); railGo(1); } if (e.key === "ArrowLeft") { e.preventDefault(); railGo(-1); } });
  railUI();
  rail.addEventListener("click", function (e) {
    var b = e.target.closest("[data-n]"); if (!b) return;
    var n = NEWS[+b.dataset.n];
    $("#nwImg").src = "assets/" + n.img + ".webp"; $("#nwImg").alt = "";
    $("#nwDate").textContent = n.d; $("#nwT").textContent = n.t;
    $("#nwBody").innerHTML = n.b.map(function (p) { return "<p>" + p + "</p>"; }).join("");
    openLayerEl($("#nwModal"), b);
  });

  var stampEl = $("#newsStamp"), ring = $("#newsRing"), disc = $(".of-news__disc");
  var ringA = 0, ringOn = false, ringRaf = 0, lastY = scrollY, lastT = 0, vel = 0;
  stampEl.classList.add("wait");
  DEBUG.ring = function () { return ringA; };
  function ringLoop(t) {
    var dt = lastT ? Math.min(64, t - lastT) : 16; lastT = t;
    var dy = scrollY - lastY; lastY = scrollY;
    vel += (Math.min(60, Math.abs(dy)) - vel) * .12;          // smoothed scroll speed
    ringA = (ringA + dt * (0.012 + vel * 0.0022)) % 360;       // ~12°/s idle, faster while scrolling
    ring.style.transform = "rotate(" + ringA.toFixed(2) + "deg)";
    if (ringOn) ringRaf = requestAnimationFrame(ringLoop);
  }
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && stampEl.classList.contains("wait")) {
        stampEl.classList.remove("wait"); stampIn(disc, 0); stampIn(ring, 0);
      }
      ringOn = e.isIntersecting && !reduce;
      cancelAnimationFrame(ringRaf); lastT = 0; lastY = scrollY;
      if (ringOn) ringRaf = requestAnimationFrame(ringLoop);
    });
  }, { threshold: .3 }).observe(stampEl);

  /* ---------------- stores: hover-tinted list ---------------- */
  var storeSec = $("#pizzerie"), list = $("#storeList"), curStore = -1, swapT = 0;
  function renderStoreRows() {
    var now = romeNow(), nOpen = 0;
    list.innerHTML = STORES.map(function (s, i) {
      var st = status(s, now); if (st.open) nOpen++;
      return '<li class="of-srow' + (i === curStore ? " on" : "") + '" role="option" tabindex="0" aria-selected="' + (i === curStore) + '" data-i="' + i + '">' +
        '<span class="of-srow__city">' + s.city + '</span><span class="of-srow__area">' + s.area + '</span>' +
        '<span class="of-srow__st"><i class="of-dot ' + st.cls + '"></i><span>' + (st.open ? "Aperta" : "Chiusa") + "</span></span></li>";
    }).join("");
    var d = new Date(now.day0);
    $("#storesNow").textContent = "Adesso, " + GIORNI[now.wd] + " " + d.getUTCDate() + " " + MESI[d.getUTCMonth()] + " alle " + hm(now.min) + ": " + nOpen + (nOpen === 1 ? " pizzeria aperta" : " pizzerie aperte") + " su " + STORES.length + ".";
  }
  function shopArt(s) {
    var i = 0, P = function (d) { return '<path style="--i:' + (i++) + '" d="' + d + '"/>'; }, C = function (x, y, r) { return '<circle style="--i:' + (i++) + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; };
    var o = P("M8 206 L312 206");
    var sign = function (y) { return P("M100 " + y + " L220 " + y + " L220 " + (y + 26) + " L100 " + (y + 26) + "Z") + '<text style="--i:' + (i++) + '" x="160" y="' + (y + 19) + '" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="19" letter-spacing="1.5">' + s.city.toUpperCase() + '</text>'; };
    if (s.art === "arches") {
      o += P("M40 206 L40 30 L280 30 L280 206") + P("M30 30 L290 30 M34 20 L286 20");
      o += sign(40);
      o += P("M52 206 L52 130 Q52 98 86 98 Q120 98 120 130 L120 206") + P("M126 206 L126 130 Q126 98 160 98 Q194 98 194 130 L194 206") + P("M200 206 L200 130 Q200 98 234 98 Q268 98 268 130 L268 206");
      o += P("M142 206 L142 150 L178 150 L178 206") + C(172, 180, 2.5);
      o += P("M62 150 L110 150 M62 170 L110 170 M210 150 L258 150 M210 170 L258 170");
    } else if (s.art === "dock") {
      o = P("M8 170 L312 170");
      o += P("M60 170 L60 50 L200 50 L200 170") + P("M50 50 L130 14 L210 50");
      o += sign(64);
      o += P("M76 170 L76 104 L116 104 L116 170") + P("M136 104 L184 104 L184 146 L136 146Z") + P("M160 104 L160 146");
      o += P("M222 170 L222 150 Q222 142 230 142 Q238 142 238 150 L238 170");
      o += P("M8 188 q16 -10 32 0 q16 10 32 0 q16 -10 32 0 q16 10 32 0 q16 -10 32 0 q16 10 32 0 q16 -10 32 0 q16 10 32 0 q16 -10 32 0");
      o += P("M250 160 L300 160 L290 176 L260 176Z") + P("M275 160 L275 120 L296 152");
    } else if (s.art === "awning") {
      o += P("M36 206 L36 34 L284 34 L284 206") + P("M28 34 L292 34");
      o += sign(46);
      o += P("M44 92 L276 92 L286 124 L34 124Z");
      o += P("M34 124 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0 q11 12 22 0");
      o += P("M90 92 L84 124 M136 92 L134 124 M184 92 L186 124 M230 92 L236 124");
      o += P("M140 206 L140 146 L180 146 L180 206") + P("M56 146 L120 146 L120 190 L56 190Z") + P("M200 146 L264 146 L264 190 L200 190Z");
      o += P("M48 206 L52 192 L68 192 L72 206") + C(60, 182, 10) + P("M248 206 L252 192 L268 192 L272 206") + C(260, 182, 10);
    } else if (s.art === "tower") {
      o += P("M30 206 L30 70 L200 70 L200 206") + P("M22 70 L208 70");
      o += P("M220 206 L220 18 L272 18 L272 206") + P("M214 18 L246 2 L278 18") + P("M236 46 L236 30 Q246 22 256 30 L256 46Z");
      o += P("M60 80 L170 80 L170 104 L60 104Z") + '<text style="--i:' + (i++) + '" x="115" y="98" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="18" letter-spacing="1.5">' + s.city.toUpperCase() + '</text>';
      o += P("M98 206 L98 132 Q98 118 114 118 Q130 118 130 132 L130 206") + P("M44 126 L84 126 L84 176 L44 176Z M146 126 L186 126 L186 176 L146 176Z");
      o += P("M234 90 L258 90 M234 130 L258 130 M234 170 L258 170");
    } else if (s.art === "shutter") {
      o += P("M36 206 L36 40 L284 40 L284 206") + P("M28 40 L292 40");
      o += sign(52);
      o += P("M56 96 L264 96 L264 196 L56 196Z") + P("M56 108 L264 108 M56 118 L264 118 M56 128 L264 128");
      o += P("M88 150 q12 -16 24 0 q-12 16 -24 0z") + C(178, 160, 14) + C(178, 160, 6) + P("M214 172 L232 140 L250 172Z");
      o += P("M20 206 L20 180 M10 184 L30 184");
    } else {
      o += P("M40 206 L40 60 L250 60 L250 206") + P("M32 60 L258 60");
      o += sign(72);
      o += P("M54 112 L236 112 L246 134 L44 134Z") + P("M44 134 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0");
      o += P("M128 206 L128 152 L162 152 L162 206") + P("M60 152 L110 152 L110 190 L60 190Z M180 152 L230 152 L230 190 L180 190Z");
      o += P("M286 206 L286 96") + P("M252 104 Q286 64 320 104 Q286 92 252 104Z") + C(296, 30, 12);
    }
    return o;
  }
  function drawShop(s) {
    var svg = $("#drawShop");
    svg.classList.remove("on");
    svg.innerHTML = shopArt(s);
    prepDraw(svg);
    svg.classList.add("fast");
    void svg.getBoundingClientRect();
    requestAnimationFrame(function () { svg.classList.add("on"); });
  }
  function fillStore(s) {
    var st = status(s), now = romeNow();
    $("#storeSt").innerHTML = '<span class="of-dot ' + st.cls + '"></span>' + st.label;
    $("#storeName").textContent = sname(s);
    $("#storeAddr").textContent = s.addr + " · Tel. " + s.tel;
    $("#storeHours").innerHTML = s.text.map(function (r) { return "<b>" + r[0] + "</b><span>" + r[1] + "</span>"; }).join("") +
      '<b>Oggi</b><span class="today">' + (s.hours[now.wd].map(function (iv) { return hm(iv[0]) + "–" + hm(iv[1]); }).join(" · ") || "chiuso") + "</span>";
  }
  function selectStore(i, instant) {
    if (i === curStore) return;
    var dir = i > curStore ? 1 : -1, s = STORES[i];
    curStore = i;
    storeSec.style.setProperty("--tint", s.tint);
    $$(".of-srow", list).forEach(function (li, k) { li.classList.toggle("on", k === i); li.setAttribute("aria-selected", k === i); });
    var card = $("#storeCard");
    card.style.setProperty("--r", (reduce ? 0 : dir * 1.6) + "deg");
    setTimeout(function () { card.style.setProperty("--r", "0deg"); }, 60);
    drawShop(s);
    var fades = $$(".of-store__body > *", card);
    clearTimeout(swapT);
    if (reduce || instant) { fillStore(s); return; }
    fades.forEach(function (f) { f.classList.add("fade", "swap"); });
    swapT = setTimeout(function () { fillStore(s); fades.forEach(function (f) { f.classList.remove("swap"); }); }, 220);
  }
  DEBUG.selectStore = selectStore;
  renderStoreRows();
  list.addEventListener("pointerover", function (e) { var li = e.target.closest(".of-srow"); if (li && e.pointerType === "mouse") selectStore(+li.dataset.i); });
  list.addEventListener("click", function (e) {
    var li = e.target.closest(".of-srow"); if (!li) return;
    selectStore(+li.dataset.i);
    if (mqMobile.matches) $("#storeCard").scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  });
  list.addEventListener("focusin", function (e) { var li = e.target.closest(".of-srow"); if (li) selectStore(+li.dataset.i); });
  list.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault(); var n = (curStore + (e.key === "ArrowDown" ? 1 : -1) + STORES.length) % STORES.length;
    $$(".of-srow", list)[n].focus();
  });
  // the card draws once it is seen; until then the first store is filled in silently
  curStore = -1; (function () { var s = STORES[0]; curStore = 0; storeSec.style.setProperty("--tint", s.tint); fillStore(s); $$(".of-srow", list)[0].classList.add("on"); })();
  $("#drawShop").innerHTML = shopArt(STORES[0]); prepDraw($("#drawShop")); drawIO.observe($("#drawShop"));
  $("#storeBook").addEventListener("click", function () { openBooking(STORES[curStore].id, this); });
  $("#storeOrder").addEventListener("click", function () { openDelivery({ store: STORES[curStore].id }, this); });

  /* ---------------- menu with arc reflow filters ---------------- */
  var curCat = "pizze", filters = { veg: false, vegan: false, hot: false };
  var tabs = $("#menuTabs"), grid = $("#menuGrid");
  tabs.innerHTML = MENU.map(function (c) { return '<button type="button" role="tab" aria-selected="' + (c.id === curCat) + '" data-c="' + c.id + '">' + c.n + "</button>"; }).join("");
  function icons(it) {
    var s = "";
    if (it.t.indexOf("vegan") > -1) s += '<b class="of-leaf" title="Vegano"></b><b class="of-leaf" title="Vegano"></b>';
    else if (it.t.indexOf("veg") > -1) s += '<b class="of-leaf" title="Vegetariano"></b>';
    if (it.t.indexOf("hot") > -1) s += '<b class="of-chili" title="Piccante"></b>';
    return s;
  }
  function renderMenu() {
    var c = MENU.filter(function (x) { return x.id === curCat; })[0];
    $("#menuNote").textContent = c.note;
    grid.innerHTML = c.items.map(function (it) {
      return '<article class="of-mi" data-id="' + it.id + '"><h3 class="of-mi__n">' + it.n + icons(it) + '</h3><p class="of-mi__d">' + it.d + '</p>' +
        '<div class="of-mi__r"><span class="of-mi__p">' + eur(it.p).replace(",00", "") + '</span><button class="of-add" type="button" data-add="' + it.id + '" aria-label="Aggiungi ' + it.n + ' all\'ordine">+</button></div></article>';
    }).join("");
    applyFilters(false);
  }
  function passes(it) {
    if (filters.vegan && it.t.indexOf("vegan") < 0) return false;
    if (filters.veg && !isVeg(it)) return false;
    if (filters.hot && it.t.indexOf("hot") < 0) return false;
    return true;
  }
  var arcRaf = 0;
  var bez = function (t) { // cubic-bezier(.22,.9,.3,1), solved numerically (as in the arc-reflow effect)
    var lo = 0, hi = 1, x, m; for (var k = 0; k < 12; k++) { m = (lo + hi) / 2; x = 3 * .22 * m * (1 - m) * (1 - m) + 3 * .3 * m * m * (1 - m) + m * m * m; if (x < t) lo = m; else hi = m; }
    var u = (lo + hi) / 2; return 3 * .9 * u * (1 - u) * (1 - u) + 3 * u * u * (1 - u) + u * u * u;
  };
  function applyFilters(animate) {
    var els = $$(".of-mi", grid), before = {};
    if (animate) els.forEach(function (el) { if (!el.classList.contains("hide")) { var r = el.getBoundingClientRect(); before[el.dataset.id] = [r.left, r.top]; } el.style.transform = ""; });
    var shown = 0;
    els.forEach(function (el) { var ok = passes(ITEMS[el.dataset.id]); el.classList.toggle("hide", !ok); if (ok) shown++; });
    $("#menuEmpty").hidden = shown > 0;
    cancelAnimationFrame(arcRaf);
    if (!animate || reduce) return;
    var moves = [], k = 0;
    els.forEach(function (el) {
      if (el.classList.contains("hide")) return;
      var r = el.getBoundingClientRect(), b = before[el.dataset.id];
      if (b) {
        var dx = b[0] - r.left, dy = b[1] - r.top;
        if (Math.abs(dx) + Math.abs(dy) > 1) { moves.push({ el: el, dx: dx, dy: dy, i: k++ }); el.style.transform = "translate(" + dx + "px," + dy + "px)"; }
      } else if (el.animate) {
        el.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: 120, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
      }
    });
    DEBUG.arcMoves = moves.length;
    var DUR = 520, STEP = 24, t0 = performance.now();
    var samples = DEBUG.arcSamples = [];
    var tick = function (now) {
      var busy = false;
      moves.forEach(function (m) {
        var t = Math.max(0, Math.min(1, (now - t0 - m.i * STEP) / DUR)); if (t < 1) busy = true;
        var e = bez(t), cx = m.dx / 2, cy = m.dy / 2 - 40;  // control point: chord midpoint lifted 40px
        var x = (1 - e) * (1 - e) * m.dx + 2 * (1 - e) * e * cx, y = (1 - e) * (1 - e) * m.dy + 2 * (1 - e) * e * cy;
        m.el.style.transform = t >= 1 ? "" : "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
        if (m.i === 0) samples.push([Math.round(now - t0), +x.toFixed(1), +y.toFixed(1)]);
      });
      if (busy) arcRaf = requestAnimationFrame(tick);
    };
    arcRaf = requestAnimationFrame(tick);
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("[data-c]"); if (!b || b.dataset.c === curCat) return;
    curCat = b.dataset.c;
    $$("button", tabs).forEach(function (x) { x.setAttribute("aria-selected", x === b); });
    renderMenu();
    if (!reduce && grid.animate) grid.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
  });
  tabs.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var bs = $$("button", tabs), i = bs.indexOf(document.activeElement); if (i < 0) return;
    var n = bs[(i + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length]; n.focus(); n.click();
  });
  $("#menuFilters").addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]"); if (!b) return;
    var f = b.dataset.f; filters[f] = !filters[f];
    if (f === "vegan" && filters.vegan) filters.veg = false;
    if (f === "veg" && filters.veg) filters.vegan = false;
    $$("[data-f]", this).forEach(function (x) { x.setAttribute("aria-pressed", !!filters[x.dataset.f]); });
    applyFilters(true);
  });
  grid.addEventListener("click", function (e) { var b = e.target.closest("[data-add]"); if (b) addItem(b.dataset.add, b); });
  renderMenu();
  DEBUG.menu = function () { return $$(".of-mi:not(.hide)", grid).map(function (e) { return e.dataset.id; }); };

  /* ---------------- newsletter ---------------- */
  var cities = STORES.map(function (s) { return s.city; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
  $("#nlCity").innerHTML += cities.map(function (c) { return "<option>" + c + "</option>"; }).join("") + "<option>Altra città</option>";
  $("#nlForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = this, err = "", bad = [];
    $$(".bad", f).forEach(function (x) { x.classList.remove("bad"); });
    var nome = f.nome.value.trim(), mail = f.email.value.trim(), bd = f.bday.value.trim();
    if (nome.length < 2) { bad.push(f.nome); err = err || "Scrivi il tuo nome."; }
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(mail)) { bad.push(f.email); err = err || "Controlla l'indirizzo email."; }
    if (bd) { var m = /^(\d{1,2})[\/.\-](\d{1,2})$/.exec(bd), ok = false; if (m) { var dd = +m[1], mo = +m[2]; ok = mo >= 1 && mo <= 12 && dd >= 1 && dd <= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1]; } if (!ok) { bad.push(f.bday); err = err || "Il compleanno va scritto gg/mm, per esempio 14/03."; } }
    if (!f.citta.value) { bad.push(f.citta); err = err || "Scegli la tua città."; }
    if (!f.ok.checked) { err = err || "Serve il consenso per mandarti la lettera."; }
    bad.forEach(function (x) { x.classList.add("bad"); });
    $("#nlErr").textContent = err;
    if (err) { (bad[0] || f.ok).focus(); return; }
    store.set("of-nl", mail);
    toast("Fatto, " + nome + ": la prima lettera arriva a inizio mese.");
    f.reset();
  });

  /* ---------------- layers (modal / drawer) ---------------- */
  var openLayer = null, lastFocus = null;
  function openLayerEl(el, from) {
    if (openLayer && openLayer !== el) closeLayer(true);
    setMob(false);
    lastFocus = from || document.activeElement;
    el.hidden = false; openLayer = el;
    document.documentElement.style.overflow = "hidden";
    var f = $(".of-x", el); if (f) f.focus({ preventScroll: true });
  }
  function closeLayer(silent) {
    if (!openLayer) return;
    openLayer.hidden = true; openLayer = null;
    document.documentElement.style.overflow = "";
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) { closeLayer(); return; }
    var o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); if (o.dataset.open === "prenota") openBooking(null, o); else openDelivery({ mista: !!o.dataset.mista }, o); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (openLayer) closeLayer(); else if (!mob.hidden) setMob(false); }
    if (e.key === "Tab" && openLayer) { // keep focus inside the open layer
      var f = $$("button, input, select, a[href], [tabindex='0']", openLayer).filter(function (x) { return x.offsetParent !== null && !x.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------------- receipt print + stamp ---------------- */
  function stampSVG(word, ring) {
    return '<svg class="of-rc__stamp" viewBox="0 0 96 96" aria-hidden="true"><defs><path id="ofRcRing" d="M48 48 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"/></defs>' +
      '<g filter="url(#ofInk)"><circle cx="48" cy="48" r="45" stroke-width="3"/><circle cx="48" cy="48" r="31" stroke-width="1.3"/>' +
      '<text font-size="7.2" letter-spacing="1.5"><textPath href="#ofRcRing">' + ring + '</textPath></text>' +
      '<text x="48" y="54" font-size="' + (word.length > 9 ? 13 : 15.5) + '" letter-spacing=".5">' + word + "</text></g></svg>";
  }
  function printReceipt(host, html, word, ring) {
    host.innerHTML = '<div class="of-rc"><div class="of-rc__slot"></div><div class="of-rc__clip"><div class="of-rc__paper">' + html + stampSVG(word, ring) + "</div></div></div>";
    var paper = $(".of-rc__paper", host), st = $(".of-rc__stamp", host);
    if (reduce) { st.style.opacity = .92; st.style.transform = "rotate(-14deg)"; return Promise.resolve(); }
    var H = paper.offsetHeight, n = 17, k = .72, dur = 1700, t0 = performance.now();
    paper.style.transform = "translateY(" + -H + "px)";
    return new Promise(function (res) {
      var step = function (now) { // speed-modulated feed: surges and hesitates like a thermal head, never backs up
        var t = Math.min(1, (now - t0) / dur), q = t - k * Math.sin(2 * Math.PI * n * t) / (2 * Math.PI * n), p = 1 - Math.pow(1 - q, 1.25);
        paper.style.transform = "translate(" + (t < 1 ? ((Math.random() - .5) * .7).toFixed(2) : 0) + "px," + (-H * (1 - p)).toFixed(2) + "px)";
        if (t < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    }).then(function () { return sleep(140); }).then(function () {
      var a = st.animate([
        { opacity: 0, transform: "scale(2.4) rotate(-34deg)", filter: "blur(4px)" },
        { opacity: .95, transform: "scale(.94) rotate(-12deg)", filter: "blur(0px)", offset: .72 },
        { opacity: .92, transform: "scale(1) rotate(-14deg)", filter: "none" }], { duration: 280, easing: "cubic-bezier(.5,0,.75,0)" });
      setTimeout(function () { paper.animate([{ transform: "translateY(0)" }, { transform: "translateY(4px)", offset: .35 }, { transform: "translateY(0)" }], { duration: 200, easing: "ease-out" }); }, 200);
      return a.finished.then(function () { st.style.opacity = .92; st.style.transform = "rotate(-14deg)"; });
    });
  }
  var codeN = function (p) { return p + "-" + String(Math.floor(1000 + Math.random() * 9000)); };
  var dayLabel = function (day0, now) { var d = new Date(day0), diff = Math.round((day0 - now.day0) / 864e5); return (diff === 0 ? "oggi, " : diff === 1 ? "domani, " : "") + GIORNI[d.getUTCDay()] + " " + d.getUTCDate() + " " + MESI[d.getUTCMonth()]; };
  function storePicks(host, sel, onPick) {
    var now = romeNow();
    host.innerHTML = STORES.map(function (s) {
      var st = status(s, now);
      return '<button type="button" data-s="' + s.id + '" aria-pressed="' + (s.id === sel) + '"><b>' + sname(s) + '</b><small><i class="of-dot ' + st.cls + '"></i>' + st.label + "</small></button>";
    }).join("");
    host.onclick = function (e) { var b = e.target.closest("[data-s]"); if (!b) return; $$("button", host).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); onPick(b.dataset.s); };
  }

  /* ---------------- PRENOTA ---------------- */
  var bk = { step: 0, store: null, day: null, slot: null, people: 2 };
  var bkM = $("#bkModal");
  function bkDays() {
    var now = romeNow(), s = byId(bk.store), out = "";
    for (var k = 0; k < 14; k++) {
      var day0 = now.day0 + k * 864e5, d = new Date(day0), wd = d.getUTCDay();
      var open = s.hours[wd].length > 0 && (k > 0 || bkSlotsFor(day0).some(function (x) { return !x.off; }));
      out += '<button type="button" data-d="' + day0 + '" aria-pressed="' + (bk.day === day0) + '"' + (open ? "" : " disabled") + '><small>' + (k === 0 ? "oggi" : GG[wd]) + "</small><b>" + d.getUTCDate() + "</b><small>" + (open ? MESI[d.getUTCMonth()] : "chiuso") + "</small></button>";
    }
    $("#bkDays").innerHTML = out;
  }
  function bkSlotsFor(day0) {
    var s = byId(bk.store), now = romeNow(), wd = new Date(day0).getUTCDay(), out = [];
    s.hours[wd].forEach(function (iv, j) {
      for (var m = iv[0]; m <= iv[1] - 60; m += 15) {
        var past = day0 === now.day0 && m < now.min + 30;
        var seed = (day0 / 864e5 + m * 7 + s.id.length * 13) % 11;
        out.push({ m: m, g: iv[0] < 960 ? "Pranzo" : "Cena", off: past || seed === 3 || seed === 8, full: !past && (seed === 3 || seed === 8) });
      }
    });
    return out;
  }
  function bkSlots() {
    var sl = bkSlotsFor(bk.day), groups = {};
    sl.forEach(function (x) { (groups[x.g] = groups[x.g] || []).push(x); });
    $("#bkSlots").innerHTML = '<div class="of-slots">' + Object.keys(groups).map(function (g) {
      return "<h4>" + g + '</h4><div class="of-slots__g">' + groups[g].map(function (x) {
        return '<button type="button" data-m="' + x.m + '" aria-pressed="' + (bk.slot === x.m) + '"' + (x.off ? " disabled" : "") + (x.full ? ' title="Pieno"' : "") + ">" + hm(x.m) + "</button>";
      }).join("") + "</div>";
    }).join("") + '</div><p class="of-help">Gli orari barrati sono già pieni o passati.</p>';
  }
  function bkSum() {
    var p = [];
    if (bk.store) p.push(sname(byId(bk.store)));
    if (bk.day != null && bk.step > 1) p.push(dayLabel(bk.day, romeNow()));
    if (bk.slot != null && bk.step > 2) p.push(hm(bk.slot));
    if (bk.step > 3) p.push(bk.people + (bk.people === 1 ? " persona" : " persone"));
    $("#bkSum").textContent = p.join(" · ");
  }
  function bkShow(step) {
    bk.step = step;
    $$(".of-step", bkM).forEach(function (f) { var on = +f.dataset.step === step; f.hidden = !on; if (on) { f.classList.remove("in"); void f.offsetWidth; f.classList.add("in"); } });
    $$("#bkSteps li").forEach(function (li, i) { li.className = i === step ? "on" : i < step ? "done" : ""; });
    $("#bkBack").hidden = step === 0;
    $("#bkNext").textContent = step === 4 ? "Conferma" : "Avanti";
    $("#bkErr").textContent = "";
    if (step === 1) bkDays();
    if (step === 2) bkSlots();
    if (step === 3) bkPeople(0);
    bkSum();
  }
  function bkPeople(d) {
    bk.people = Math.max(1, Math.min(12, bk.people + d));
    $("#bkPeople").textContent = bk.people;
    $("#bkMinus").disabled = bk.people <= 1; $("#bkPlus").disabled = bk.people >= 12;
    $("#bkPeopleHelp").style.fontWeight = bk.people >= 12 ? "700" : "";
    $("#bkPeopleHelp").textContent = bk.people >= 12 ? "Oltre 12 persone? Chiamaci al " + byId(bk.store).tel + ": organizziamo la tavolata." : "Oltre 12 persone? Chiamaci: organizziamo la tavolata.";
  }
  function openBooking(storeId, from) {
    bk = { step: 0, store: storeId || null, day: null, slot: null, people: 2 };
    $("#bkForm").hidden = false; $("#bkDone").hidden = true; $("#bkDone").innerHTML = "";
    ["#bkName", "#bkTel", "#bkNote"].forEach(function (s) { $(s).value = ""; $(s).classList.remove("bad"); });
    $("#bkKids").checked = false;
    storePicks($("#bkStores"), bk.store, function (id) { bk.store = id; bk.day = null; bk.slot = null; $("#bkErr").textContent = ""; bkSum(); });
    openLayerEl(bkM, from);
    bkShow(storeId ? 1 : 0);
  }
  DEBUG.bk = function () { return bk; };
  $("#bkDays").addEventListener("click", function (e) { var b = e.target.closest("[data-d]"); if (!b || b.disabled) return; bk.day = +b.dataset.d; bk.slot = null; $$("button", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); $("#bkErr").textContent = ""; });
  $("#bkSlots").addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (!b || b.disabled) return; bk.slot = +b.dataset.m; $$("[data-m]", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); $("#bkErr").textContent = ""; });
  $("#bkMinus").addEventListener("click", function () { bkPeople(-1); });
  $("#bkPlus").addEventListener("click", function () { bkPeople(1); });
  $("#bkBack").addEventListener("click", function () { bkShow(bk.step - 1); });
  $("#bkForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = "";
    if (bk.step === 0 && !bk.store) err = "Scegli una pizzeria.";
    if (bk.step === 1 && bk.day == null) err = "Scegli il giorno.";
    if (bk.step === 2 && bk.slot == null) err = "Scegli un orario libero.";
    if (bk.step === 4) {
      var n = $("#bkName"), t = $("#bkTel"), digits = t.value.replace(/[^\d]/g, "").replace(/^39(?=\d{9,})/, "");
      n.classList.toggle("bad", n.value.trim().length < 3); t.classList.toggle("bad", !/^\d{9,11}$/.test(digits) || /[^\d\s+\-.\/]/.test(t.value));
      if (n.classList.contains("bad")) err = "Scrivi nome e cognome.";
      else if (t.classList.contains("bad")) err = "Il telefono non sembra giusto: servono 9–11 cifre.";
      if (err) (n.classList.contains("bad") ? n : t).focus();
    }
    if (err) { $("#bkErr").textContent = err; return; }
    if (bk.step < 4) { bkShow(bk.step + 1); return; }
    // confirmed
    var s = byId(bk.store), now = romeNow(), code = codeN("P");
    $("#bkForm").hidden = true; var done = $("#bkDone"); done.hidden = false;
    var html = "<h3>OTTOFETTE</h3><p class=\"c\">" + sname(s).toUpperCase() + "<br>" + s.addr + "</p><hr>" +
      '<div class="r"><span>PRENOTAZIONE</span><span>' + code + '</span></div>' +
      '<div class="r"><span>GIORNO</span><span>' + dayLabel(bk.day, now) + '</span></div>' +
      '<div class="r"><span>ORA</span><span>' + hm(bk.slot) + '</span></div>' +
      '<div class="r"><span>PERSONE</span><span>' + bk.people + ($("#bkKids").checked ? " + seggiolone" : "") + '</span></div>' +
      '<div class="r"><span>NOME</span><span>' + $("#bkName").value.trim().replace(/[<>&]/g, "") + "</span></div><hr><p class=\"c\">Teniamo il tavolo 15 minuti.<br>Per cambiare: " + s.tel + "</p>";
    var d = new Date(bk.day);
    printReceipt(done, html, "PRENOTATO", "TAVOLO CONFERMATO · " + d.getUTCDate() + " " + MESI[d.getUTCMonth()].toUpperCase() + " · OTTOFETTE ·").then(function () {
      var p = document.createElement("div");
      p.innerHTML = '<p class="of-done__msg">Ti abbiamo mandato un SMS di conferma. A presto!</p><button class="of-btn of-btn--solid" type="button" data-close>Fatto</button>';
      done.appendChild(p); $("button", p).focus({ preventScroll: true });
    });
    store.set("of-last-booking", code);
  });

  /* ---------------- DELIVERY ---------------- */
  var dl = { store: null, mode: "consegna", cap: "", cart: [], step: "where", pending: null, cat: "pizze", mx: FLAV.map(function (f) { return f.id; }), mxSel: 0 };
  var dlD = $("#dlDrawer");
  var MIN = 15, FEE = 2.5, FREE = 35;
  DEBUG.dl = function () { return dl; };
  function dlShow(step) {
    dl.step = step;
    $$(".of-dl", dlD).forEach(function (s) { var on = s.dataset.dl === step; s.hidden = !on; if (on) { s.classList.remove("in"); void s.offsetWidth; s.classList.add("in"); } });
    $("#dlBody").scrollTop = 0;
    if (step === "menu") dlMenu();
    if (step === "mista") mxRender();
    if (step === "checkout") coPrep();
    cartRender();
  }
  function openDelivery(opt, from) {
    opt = opt || {};
    if (opt.store) { if (dl.store !== opt.store) { dl.store = opt.store; } }
    if (opt.add) dl.pending = opt.add;
    if (opt.mista) dl.pending = "__mista";
    openLayerEl(dlD, from);
    var ready = dl.store && (dl.mode === "ritiro" || capOk(dl.cap)) && !opt.store;
    if (dl.step === "done") dl.step = "where";
    if (ready) {
      var toMista = dl.pending === "__mista";
      flushPending();
      dlShow(toMista ? "mista" : dl.step === "where" ? "menu" : dl.step);
    }
    else { whereRender(); dlShow("where"); }
  }
  function capOk(cap) { var s = byId(dl.store); return !!s && s.caps.indexOf(cap) > -1; }
  function whereRender() {
    storePicks($("#dlStores"), dl.store, function (id) { dl.store = id; $("#dlWhereErr").textContent = ""; capHelp(); });
    $$("[data-mode]", dlD).forEach(function (b) { b.setAttribute("aria-checked", b.dataset.mode === dl.mode); });
    $("#dlCapWrap").hidden = dl.mode !== "consegna";
    $("#dlCap").value = dl.cap;
    capHelp();
  }
  function capHelp() {
    var s = byId(dl.store);
    $("#dlCapHelp").textContent = dl.mode === "consegna"
      ? (s ? "Da " + sname(s) + " consegniamo nei CAP " + s.caps.join(", ") + ". Minimo " + MIN + " €, consegna " + eur(FEE) + ", gratis sopra " + FREE + " €." : "Scegli prima la pizzeria.")
      : (s ? "Ritiri in " + s.addr + ". Nessun minimo d'ordine." : "Scegli la pizzeria dove passi a ritirare.");
  }
  $$("[data-mode]", dlD).forEach(function (b) { b.addEventListener("click", function () { dl.mode = b.dataset.mode; whereRender(); $("#dlWhereErr").textContent = ""; }); });
  $("#dlCap").addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 5); dl.cap = this.value; this.classList.remove("bad"); $("#dlWhereErr").textContent = ""; });
  $("#dlGo").addEventListener("click", function () {
    var err = "";
    if (!dl.store) err = "Scegli una pizzeria.";
    else if (dl.mode === "consegna") {
      if (!/^\d{5}$/.test(dl.cap)) err = "Scrivi il CAP (5 cifre).";
      else if (!capOk(dl.cap)) err = sname(byId(dl.store)) + " non consegna al " + dl.cap + ". Prova il ritiro o un'altra pizzeria.";
      if (err) $("#dlCap").classList.add("bad");
    }
    $("#dlWhereErr").textContent = err;
    if (err) return;
    var toMista = dl.pending === "__mista";
    flushPending();
    dlShow(toMista ? "mista" : "menu");
  });
  function flushPending() {
    if (!dl.pending) return;
    var p = dl.pending; dl.pending = null;
    if (p !== "__mista") { cartAdd(ITEMS[p]); toast("Aggiunta: " + ITEMS[p].n); }
  }
  function addItem(id, from) {
    if (dl.store && (dl.mode === "ritiro" || capOk(dl.cap))) {
      cartAdd(ITEMS[id]); toast("Aggiunta all'ordine: " + ITEMS[id].n);
      if (from && from.animate && !reduce) from.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
    } else openDelivery({ add: id }, from);
  }
  $("#dlWhere").addEventListener("click", function () { whereRender(); dlShow("where"); });
  function dlMenu() {
    var s = byId(dl.store), st = status(s);
    $("#dlWhere").innerHTML = "<span><b>" + sname(s) + "</b><br>" + (dl.mode === "consegna" ? "Consegna al " + dl.cap : "Ritiro in pizzeria") + " · " + st.label + "</span><span>Cambia</span>";
    $("#dlTabs").innerHTML = MENU.map(function (c) { return '<button type="button" role="tab" aria-selected="' + (c.id === dl.cat) + '" data-c="' + c.id + '">' + c.n + "</button>"; }).join("");
    var c = MENU.filter(function (x) { return x.id === dl.cat; })[0], h = "";
    if (c.id === "pizze") h += '<div class="of-di of-di--mx"><div><b>Mista a 8 gusti</b><p>Una fetta per gusto, scegli tu quali. Da ' + eur(mxPrice(FLAV.map(function (f) { return f.id; }))) + '</p></div><div class="of-di__r"><button class="of-btn of-btn--solid" type="button" id="dlMx">Componi</button></div></div>';
    h += c.items.map(function (it) {
      var q = cartQty(it.id);
      return '<div class="of-di"><div><b>' + it.n + "</b><p>" + it.d + '</p></div><div class="of-di__r"><span>' + eur(it.p) + "</span>" +
        (q ? '<div class="of-qty"><button type="button" data-dec="' + it.id + '" aria-label="Togli ' + it.n + '">−</button><output>' + q + '</output><button type="button" data-inc="' + it.id + '" aria-label="Aggiungi ' + it.n + '">+</button></div>'
           : '<button class="of-add" type="button" data-inc="' + it.id + '" aria-label="Aggiungi ' + it.n + '">+</button>') + "</div></div>";
    }).join("");
    $("#dlList").innerHTML = h;
  }
  $("#dlTabs").addEventListener("click", function (e) { var b = e.target.closest("[data-c]"); if (!b) return; dl.cat = b.dataset.c; dlMenu(); });
  $("#dlList").addEventListener("click", function (e) {
    if (e.target.closest("#dlMx")) { dlShow("mista"); return; }
    var inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) cartAdd(ITEMS[inc.dataset.inc]);
    if (dec) cartChange(dec.dataset.dec, -1);
    if (inc || dec) dlMenu();
  });
  function cartQty(id) { var q = 0; dl.cart.forEach(function (l) { if (l.key === id) q = l.qty; }); return q; }
  function cartAdd(it, line) {
    var key = line ? line.key : it.id;
    for (var i = 0; i < dl.cart.length; i++) if (dl.cart[i].key === key) { dl.cart[i].qty++; cartRender(); return; }
    dl.cart.push(line || { key: it.id, n: it.n, sub: "", p: it.p, qty: 1 });
    cartRender();
  }
  function cartChange(key, d) {
    dl.cart = dl.cart.filter(function (l) { if (l.key === key) l.qty += d; return l.qty > 0; });
    cartRender();
  }
  function totals() {
    var sub = dl.cart.reduce(function (a, l) { return a + l.p * l.qty; }, 0);
    var fee = dl.mode === "consegna" && sub > 0 && sub < FREE ? FEE : 0;
    return { sub: sub, fee: fee, tot: sub + fee, n: dl.cart.reduce(function (a, l) { return a + l.qty; }, 0) };
  }
  DEBUG.totals = totals;
  function cartRender() {
    var t = totals(), show = dl.cart.length > 0 && dl.step !== "where" && dl.step !== "done";
    $$("[data-cartn]").forEach(function (b) { b.hidden = t.n === 0; b.textContent = t.n; });
    $("#dlCart").hidden = !show;
    if (!show) return;
    $("#cartList").innerHTML = dl.cart.map(function (l) {
      return "<li><span>" + l.n + (l.sub ? "<small>" + l.sub + "</small>" : "") + '</span><div class="of-qty"><button type="button" data-cdec="' + l.key + '" aria-label="Meno ' + l.n + '">−</button><output>' + l.qty + '</output><button type="button" data-cinc="' + l.key + '" aria-label="Più ' + l.n + '">+</button></div><span class="p">' + eur(l.p * l.qty) + "</span></li>";
    }).join("");
    $("#cartSub").textContent = eur(t.sub);
    $("#cartFeeRow").hidden = dl.mode !== "consegna";
    $("#cartFee").textContent = t.fee ? eur(t.fee) : "gratis";
    $("#cartTot").textContent = eur(t.tot);
    var msg, ok = true;
    if (dl.mode === "consegna") {
      $("#cartFreeBar").style.width = Math.min(100, t.sub / FREE * 100).toFixed(1) + "%";
      if (t.sub < MIN) { msg = "Minimo per la consegna " + MIN + " €: mancano " + eur(MIN - t.sub) + "."; ok = false; }
      else if (t.sub < FREE) msg = "Ancora " + eur(FREE - t.sub) + " e la consegna è gratis.";
      else msg = "Consegna gratis.";
    } else { $("#cartFreeBar").style.width = "0"; msg = "Ritiro in pizzeria: nessun minimo."; }
    $("#cartMsg").textContent = msg;
    $(".of-cart__free").hidden = dl.mode !== "consegna";
    var go = $("#cartGo");
    go.disabled = !ok;
    go.textContent = dl.step === "checkout" ? "Invia l'ordine · " + eur(t.tot) : "Vai alla cassa · " + eur(t.tot);
  }
  $("#cartList").addEventListener("click", function (e) {
    var a = e.target.closest("[data-cinc]"), b = e.target.closest("[data-cdec]");
    if (a) cartChange(a.dataset.cinc, 1); if (b) cartChange(b.dataset.cdec, -1);
    if (dl.step === "menu") dlMenu();
    if (!dl.cart.length && dl.step === "checkout") dlShow("menu");
  });
  $("#cartGo").addEventListener("click", function () { if (dl.step === "checkout") coSubmit(); else dlShow("checkout"); });

  // Mista builder (same wedge renderer as the showcase pizza)
  function mxPrice(ids) { var avg = ids.reduce(function (a, id) { return a + ITEMS[id].p; }, 0) / 8; return Math.ceil((avg + 1.5) * 2) / 2; }
  var mxPz = null;
  function mxRender() {
    if (!mxPz) {
      mxPz = buildPizza($("#mxPz"), "ofm", dl.mx.map(function (id) { return ITEMS[id].img; }), dl.mx.map(function (id) { return ITEMS[id].n; }));
      mxPz.svg.addEventListener("click", function (e) { var g = e.target.closest(".w"); if (g) { dl.mxSel = +g.dataset.i; mxRender(); } });
      mxPz.svg.addEventListener("keydown", function (e) { var g = e.target.closest(".w"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); dl.mxSel = +g.dataset.i; mxRender(); } });
    }
    mxPz.w.forEach(function (g, i) { var it = ITEMS[dl.mx[i]]; $("image", g).setAttribute("href", "assets/p-" + it.img + ".webp"); $("title", g).textContent = it.n; g.setAttribute("aria-label", "Fetta " + (i + 1) + ": " + it.n); });
    mxPz.go(dl.mxSel, 0, 300);
    $("#mxLab").textContent = "Fetta " + (dl.mxSel + 1) + " di 8 · " + ITEMS[dl.mx[dl.mxSel]].n;
    $("#mxFlav").innerHTML = FLAV.map(function (f) { return '<button type="button" data-f="' + f.id + '" aria-pressed="' + (dl.mx[dl.mxSel] === f.id) + '"><img src="assets/p-' + f.img + '.webp" alt="">' + f.n + "</button>"; }).join("");
    $("#mxPrice").textContent = eur(mxPrice(dl.mx));
  }
  $("#mxFlav").addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]"); if (!b) return;
    dl.mx[dl.mxSel] = b.dataset.f;
    dl.mxSel = (dl.mxSel + 1) % 8;  // move on to the next slice
    mxRender();
  });
  $("#mxFill").addEventListener("click", function () { var f = dl.mx[dl.mxSel]; dl.mx = dl.mx.map(function () { return f; }); mxRender(); });
  $("#mxBack").addEventListener("click", function () { dlShow("menu"); });
  $("#mxAdd").addEventListener("click", function () {
    var counts = {}; dl.mx.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
    var sub = Object.keys(counts).map(function (id) { return counts[id] + "× " + ITEMS[id].n; }).join(", ");
    cartAdd(null, { key: "mista:" + dl.mx.slice().sort().join(","), n: "Mista a 8 gusti", sub: sub, p: mxPrice(dl.mx), qty: 1 });
    toast("Mista aggiunta all'ordine");
    dl.cat = "pizze"; dlShow("menu");
  });

  // checkout
  function coSlots() {
    var s = byId(dl.store), now = romeNow(), lead = dl.mode === "consegna" ? 40 : 20, out = [], st = status(s, now);
    var mk = function (day0, wd, startMin, label) {
      var l = [];
      s.hours[wd].forEach(function (iv) { for (var m = Math.ceil(Math.max(iv[0] + 15, startMin) / 15) * 15; m <= iv[1] - 15; m += 15) l.push({ v: day0 + ":" + m, t: label + hm(m) }); });
      return l;
    };
    if (st.open && (st.closeAt - now.min) > lead + 10) out.push({ v: "asap", t: "Prima possibile (circa " + lead + " min)" });
    out = out.concat(mk(now.day0, now.wd, now.min + lead, "Oggi alle "));
    if (out.length < 2) out = out.concat(mk(now.day0 + 864e5, (now.wd + 1) % 7, 0, "Domani alle "));
    return out;
  }
  function coPrep() {
    $("#coAddrWrap").hidden = dl.mode !== "consegna";
    $("#coTime").innerHTML = coSlots().map(function (o) { return '<option value="' + o.v + '">' + o.t + "</option>"; }).join("");
    $("#coErr").textContent = "";
  }
  $("#coBack").addEventListener("click", function () { dlShow("menu"); });
  function coSubmit() {
    var n = $("#coName"), t = $("#coTel"), a = $("#coAddr"), err = "";
    var digits = t.value.replace(/[^\d]/g, "").replace(/^39(?=\d{9,})/, "");
    [n, t, a].forEach(function (x) { x.classList.remove("bad"); });
    if (n.value.trim().length < 2) { n.classList.add("bad"); err = "Scrivi il tuo nome."; }
    else if (!/^\d{9,11}$/.test(digits)) { t.classList.add("bad"); err = "Il telefono non sembra giusto: servono 9–11 cifre."; }
    else if (dl.mode === "consegna" && !/\d/.test(a.value) || dl.mode === "consegna" && a.value.trim().length < 6) { a.classList.add("bad"); err = "Scrivi via e numero civico."; }
    var tt = totals();
    if (!err && dl.mode === "consegna" && tt.sub < MIN) err = "Il minimo per la consegna è " + MIN + " €.";
    $("#coErr").textContent = err;
    if (err) { var b = $(".bad", dlD); if (b) b.focus(); return; }
    var s = byId(dl.store), code = codeN("D"), when = $("#coTime").selectedOptions[0].textContent;
    var html = "<h3>OTTOFETTE</h3><p class=\"c\">" + sname(s).toUpperCase() + "<br>Tel. " + s.tel + "</p><hr>" +
      '<div class="r"><span>ORDINE</span><span>' + code + "</span></div>" +
      '<div class="r"><span>' + (dl.mode === "consegna" ? "CONSEGNA" : "RITIRO") + "</span><span>" + when + "</span></div><hr>" +
      dl.cart.map(function (l) { return '<div class="r"><span>' + l.qty + "× " + l.n + "</span><span>" + eur(l.p * l.qty) + "</span></div>"; }).join("") +
      "<hr>" + (dl.mode === "consegna" ? '<div class="r"><span>CONSEGNA</span><span>' + (tt.fee ? eur(tt.fee) : "GRATIS") + "</span></div>" : "") +
      '<div class="r"><b>TOTALE</b><b>' + eur(tt.tot) + "</b></div><p class=\"c\">Paghi alla " + (dl.mode === "consegna" ? "consegna" : "cassa") + ", anche con carta.</p>";
    dl.cart = []; dlShow("done");
    printReceipt($("#dlDone"), html, "INVIATO", "ORDINE RICEVUTO · IN FORNO A BREVE · OTTOFETTE ·").then(function () {
      var p = document.createElement("div");
      p.innerHTML = '<p class="of-done__msg">' + (dl.mode === "consegna" ? "Il rider ti chiama quando è sotto casa." : "Ti aspettiamo al banco: di' il numero d'ordine.") + '</p><button class="of-btn of-btn--solid" type="button" data-close>Fatto</button>';
      $("#dlDone").appendChild(p); $("button", p).focus({ preventScroll: true });
    });
  }

  /* ---------------- scroll loop ---------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; whyTick(); navSpy(); });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  function refresh() { renderHero(); renderStoreRows(); renderMobStores(); if (curStore > -1) fillStore(STORES[curStore]); fermP = fermText(); }
  refresh(); whyTick(); navSpy();
  setInterval(refresh, 30000);
})();
