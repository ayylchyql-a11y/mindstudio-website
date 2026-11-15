/* UMIMARÉ — cucina nikkei, Genova. Static template, no dependencies. */
(function () {
  "use strict";

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (reduce) { try { var mapSvg = document.querySelector(".ct-map svg"); if (mapSvg && mapSvg.pauseAnimations) { mapSvg.pauseAnimations(); mapSvg.setCurrentTime(0); } } catch (e) {} }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
  var hhmm = function (m) { m = ((m % 1440) + 1440) % 1440; return pad2(Math.floor(m / 60)) + ":" + pad2(m % 60); };

  /* ---------------- toast ---------------- */
  var toastEl = $("#toast"), toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("on"); }, 2800);
  }

  /* ---------------- time in Rome ---------------- */
  // ?now=2026-11-18T00:30 forces a Rome wall-clock time (used by the checks).
  var forced = null;
  try {
    var q = /[?&]now=([0-9T:\-]+)/.exec(location.search);
    if (q) { var mm = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(q[1]); if (mm) forced = { y: +mm[1], mo: +mm[2], d: +mm[3], h: +mm[4], mi: +mm[5] }; }
  } catch (e) {}
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function romeNow() {
    if (forced) {
      var dt = new Date(Date.UTC(forced.y, forced.mo - 1, forced.d));
      return { y: forced.y, mo: forced.mo, d: forced.d, wd: dt.getUTCDay(), min: forced.h * 60 + forced.mi };
    }
    var o = {};
    try {
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) {
      var n = new Date(); return { y: n.getFullYear(), mo: n.getMonth() + 1, d: n.getDate(), wd: n.getDay(), min: n.getHours() * 60 + n.getMinutes() };
    }
    return { y: +o.year, mo: +o.month, d: +o.day, wd: WD[o.weekday], min: (+o.hour % 24) * 60 + (+o.minute) };
  }

  // Opening hours, by weekday (0 = Sunday). End > 1440 means after midnight.
  var HOURS = {
    0: [[750, 990], [1140, 1440]],
    1: [],
    2: [[1140, 1500]],
    3: [[1140, 1500]],
    4: [[1080, 1560]],
    5: [[1080, 1560]],
    6: [[750, 990], [1080, 1560]]
  };
  var DAY_IT = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var DAY_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  var MONTH_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  var endLabel = function (e) { return e === 1440 ? "24:00" : hhmm(e); };

  function openState(now) {
    var d = now.wd, m = now.min, i, iv;
    var today = HOURS[d];
    for (i = 0; i < today.length; i++) { iv = today[i]; if (m >= iv[0] && m < iv[1]) return { open: true, until: iv[1], service: d, left: iv[1] - m }; }
    var yd = (d + 6) % 7, yest = HOURS[yd];
    for (i = 0; i < yest.length; i++) { iv = yest[i]; if (iv[1] > 1440 && m < iv[1] - 1440) return { open: true, until: iv[1], service: yd, left: iv[1] - 1440 - m }; }
    for (var k = 0; k < 8; k++) {
      var dd = (d + k) % 7, list = HOURS[dd];
      for (i = 0; i < list.length; i++) {
        if (k > 0 || list[i][0] > m) return { open: false, nextDay: k, nextWd: dd, at: list[i][0], service: d };
      }
    }
    return { open: false };
  }
  function statusText(st) {
    if (st.open) {
      if (st.left <= 45) return "Aperto · chiude tra " + st.left + " min";
      return "Aperto ora · fino alle " + endLabel(st.until);
    }
    if (st.nextDay === undefined) return "Chiuso";
    var when = st.nextDay === 0 ? "oggi" : st.nextDay === 1 ? "domani" : DAY_IT[st.nextWd];
    return "Chiuso · apre " + when + " alle " + hhmm(st.at);
  }
  function paintStatus() {
    var now = romeNow(), st = openState(now), txt = statusText(st);
    $$("[data-status]").forEach(function (el) {
      el.classList.toggle("open", !!st.open);
      el.classList.toggle("closed", !st.open);
      el.querySelector("span").textContent = txt;
    });
    // hours table
    var dl = $("#hours");
    if (dl) {
      var order = [1, 2, 3, 4, 5, 6, 0], html = "";
      order.forEach(function (wd) {
        var list = HOURS[wd];
        var t = list.length ? list.map(function (iv) { return hhmm(iv[0]) + " – " + endLabel(iv[1]); }).join(" · ") : "chiuso";
        var cls = wd === st.service ? ' class="today"' : "";
        html += "<dt" + cls + ">" + DAY_IT[wd].charAt(0).toUpperCase() + DAY_IT[wd].slice(1) + "</dt><dd" + cls + ">" + t + "</dd>";
      });
      dl.innerHTML = html;
    }
    return st;
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ---------------- header ---------------- */
  var hd = $("#hd"), hero = $("#hero");
  function onScrollHeader() {
    var b = hero.getBoundingClientRect().bottom;
    hd.classList.toggle("solid", b < 80);
  }

  /* ---------------- drawers ---------------- */
  var scrim = $("#scrim"), navDrawer = $("#navDrawer"), bookDrawer = $("#bookDrawer"), openBtn = $("#openNav");
  var current = null, lastFocus = null, scrimT = 0;
  function openDrawer(d) {
    if (current && current !== d) closeDrawer(true);
    current = d; lastFocus = document.activeElement;
    clearTimeout(scrimT);
    scrim.hidden = false;
    d.removeAttribute("inert"); d.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () { scrim.classList.add("on"); d.classList.add("on"); });
    document.body.classList.add("locked");
    if (d === navDrawer) openBtn.setAttribute("aria-expanded", "true");
    setTimeout(function () { var f = d.querySelector("[data-close]"); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeDrawer(silent) {
    if (!current) return;
    var d = current; current = null;
    d.classList.remove("on"); d.setAttribute("aria-hidden", "true"); d.setAttribute("inert", "");
    openBtn.setAttribute("aria-expanded", "false");
    if (!silent) {
      scrim.classList.remove("on");
      scrimT = setTimeout(function () { scrim.hidden = true; }, reduce ? 0 : 300);
      document.body.classList.remove("locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
  }
  openBtn.addEventListener("click", function () { openDrawer(navDrawer); });
  scrim.addEventListener("click", function () { closeDrawer(); });
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", function () { closeDrawer(); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && current) closeDrawer(); });
  $$(".dnav a").forEach(function (a) { a.addEventListener("click", function () { closeDrawer(); }); });

  /* ---------------- staggered character reveal ---------------- */
  function splitChars(el) {
    var text = el.textContent;
    var words = text.split(/(\s+)/), n = 0;
    el.textContent = "";
    words.forEach(function (w) {
      if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); return; }
      if (!w) return;
      var ws = document.createElement("span"); ws.className = "cw"; ws.setAttribute("aria-hidden", "true");
      Array.from(w).forEach(function (ch) {
        var c = document.createElement("span"); c.className = "cc"; c.style.setProperty("--i", n++); c.textContent = ch; ws.appendChild(c);
      });
      el.appendChild(ws);
    });
    if (!el.closest(".hero-mark")) el.setAttribute("aria-label", text);
  }
  var charEls = $$("[data-chars]");
  charEls.forEach(splitChars);
  if (reduce || !("IntersectionObserver" in window)) charEls.forEach(function (el) { el.classList.add("go"); });
  else {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("go"); cio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    charEls.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------- floating parallax field ---------------- */
  var field = $("#pxField"), story = $("#storia");
  var pxItems = $$(".px-item", field);
  var pxZ = pxItems.map(function (el) { return parseFloat(el.style.getPropertyValue("--z")) || 0.5; });
  var pxVisible = false, pxRaf = 0, t0 = performance.now();
  function setP(x, y) { field.style.setProperty("--px", x.toFixed(3)); field.style.setProperty("--py", y.toFixed(3)); }
  story.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var r = field.getBoundingClientRect();
    setP(Math.max(-1.4, Math.min(1.4, (e.clientX - r.left) / r.width * 2 - 1)), Math.max(-1.4, Math.min(1.4, (e.clientY - r.top) / r.height * 2 - 1)));
  });
  story.addEventListener("pointerleave", function () { setP(0, 0); });
  function pxTick(now) {
    pxRaf = 0;
    var t = (now - t0) / 1000;
    var r = field.getBoundingClientRect();
    var off = (r.top + r.height / 2) - innerHeight / 2;
    pxItems.forEach(function (el, i) {
      var z = pxZ[i];
      el.style.setProperty("--dx", (Math.sin(t * 0.35 + i * 1.7) * 6 * (0.4 + z)).toFixed(2) + "px");
      el.style.setProperty("--dy", (Math.cos(t * 0.28 + i * 2.1) * 8 * (0.4 + z)).toFixed(2) + "px");
      el.style.setProperty("--sy", (-off * (z - 0.45) * 0.16).toFixed(2) + "px");
    });
    if (pxVisible) pxRaf = requestAnimationFrame(pxTick);
  }
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      pxVisible = es[0].isIntersecting;
      if (pxVisible && !pxRaf) pxRaf = requestAnimationFrame(pxTick);
    }).observe(field);
  }

  /* ---------------- tre culture: hover-tinted list ---------------- */
  var CULT = [
    { key: "jp", name: "Giappone", tint: "#d8362a", tags: "Sushi · robata · tempura", img: "cult-giappone", alt: "Nigiri di salmone su foglia di bambù",
      blurb: "Il riso condito come a Tokyo, il pesce tagliato al banco davanti a te, la robata a carbone binchotan.", dishes: "Nigiri · uramaki · black cod al miso" },
    { key: "pe", name: "Perù", tint: "#c9560a", tags: "Seviche · tiradito · anticuchos", img: "cult-peru", alt: "Seviche di tonno con mango e lime",
      blurb: "Leche de tigre fatta al momento, ají amarillo e rocoto, anticuchos marinati una notte intera.", dishes: "Seviche · tiradito · pisco sour" },
    { key: "br", name: "Brasile", tint: "#128a55", tags: "Churrasco · moqueca · pão de queijo", img: "cult-brasile", alt: "Pão de queijo appena sfornati",
      blurb: "La brace del churrasco, il latte di cocco della moqueca, il pão de queijo che arriva caldo appena ti siedi.", dishes: "Picanha · moqueca · caipirinha" },
    { key: "li", name: "Liguria", tint: "#1d5f8f", tags: "Pescato del giorno", img: "cult-liguria", alt: "Sashimi di pesce del giorno",
      blurb: "Il pescato del Mar Ligure, ogni mattina: ricciola, gambero rosso di Sanremo, acciughe. Lo trattiamo come gli altri tre.", dishes: "Sashimi del giorno · seviche di gambero rosso" }
  ];
  var tlSec = $("#culture"), tlList = $("#tlList"), tlImg = $("#tlImg"), tlCard = $("#tlCard"), tlBlurb = $("#tlBlurb"), tlDishes = $("#tlDishes");
  var tlCur = -1, tlT = 0, tlT2 = 0;
  CULT.forEach(function (c, i) {
    var li = document.createElement("li"); li.className = "tl-row";
    li.innerHTML = '<button class="tl-btn" role="tab" id="tl-' + c.key + '" aria-selected="false"><span class="tl-n">0' + (i + 1) + '</span><span class="tl-name">' + c.name + '</span><span class="tl-tags">' + c.tags + "</span></button>";
    var b = li.firstChild;
    b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") tlSelect(i); });
    b.addEventListener("focus", function () { tlSelect(i); });
    b.addEventListener("click", function () { tlSelect(i); });
    tlList.appendChild(li);
  });
  function tlSelect(i, instant) {
    if (i === tlCur) return;
    var dir = i > tlCur ? 1 : -1; tlCur = i;
    var c = CULT[i];
    tlSec.style.setProperty("--tl-tint", c.tint);
    $$(".tl-btn", tlList).forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    tlCard.style.setProperty("--r", (dir * 3) + "deg");
    clearTimeout(tlT2); tlT2 = setTimeout(function () { tlCard.style.setProperty("--r", (i % 2 ? 1.2 : -1.2) + "deg"); }, 80);
    clearTimeout(tlT);
    var apply = function () {
      tlImg.src = "assets/" + c.img + ".webp"; tlImg.alt = c.alt;
      tlBlurb.textContent = c.blurb; tlDishes.textContent = c.dishes;
      tlBlurb.classList.remove("swap"); tlDishes.classList.remove("swap"); tlImg.classList.remove("swap");
    };
    if (reduce || instant) { apply(); return; }
    tlBlurb.classList.add("swap"); tlDishes.classList.add("swap"); tlImg.classList.add("swap");
    tlT = setTimeout(apply, 220);
  }
  tlSelect(0, true);
  $("#tlGo").addEventListener("click", function (e) {
    e.preventDefault();
    setMenu({ tab: "allday", cult: CULT[tlCur].key });
    $("#menu").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
  $$(".hero-links a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      tlSelect(+a.getAttribute("data-cult"), true);
      tlSec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------------- piatti firma: scroll-snap gallery ---------------- */
  var CC = { jp: ["Giappone", "var(--aka)"], pe: ["Perù", "var(--aji)"], br: ["Brasile", "var(--verde)"], li: ["Liguria", "var(--mare)"] };
  var FIRMA = [
    ["dish-uramaki", "Uramaki Kasato", "Salmone scottato, mango, ají amarillo, crema di avocado", 17, "jp"],
    ["dish-ceviche", "Seviche di branzino", "Leche de tigre, mais cancha, patata dolce, cipolla rossa", 19, "pe"],
    ["dish-anticucho", "Anticuchos alla brace", "Cuore di manzo marinato all'ají panca, patate alla huancaína", 14, "pe"],
    ["dish-sashimi", "Sashimi del Mar Ligure", "Tonno, ricciola e gambero rosso del giorno, ponzu agli agrumi", 26, "li"],
    ["dish-picanha", "Picanha al taglio", "Copertina di manzo, farofa, vinagrete e chimichurri", 34, "br"],
    ["dish-tempura", "Tempura nel cesto", "Gamberi e verdure di stagione, salsa tentsuyu al lime", 22, "jp"],
    ["dish-moqueca", "Moqueca di pesce bianco", "Latte di cocco, olio di dendê, peperoni, riso al cocco", 28, "br"],
    ["dish-tartare", "Ardesia di tartare", "Salmone, tonno e ricciola in tre condimenti nikkei", 24, "pe"],
    ["dish-gunkan", "Gunkan ikura e yuzu", "Uova di salmone marinate, scorza di yuzu, riso tiepido", 12, "jp"],
    ["dish-pisco", "Pisco sour della casa", "Pisco quebranta, lime, albume, gocce di amargo", 12, "pe"],
    ["dish-churros", "Churros e doce de leite", "Con cioccolato fondente al rocoto", 10, "br"]
  ];
  var rail = $("#sgRail");
  rail.innerHTML = FIRMA.map(function (f, i) {
    var c = CC[f[4]];
    return '<article class="sg-slide" style="--c:' + c[1] + '"><div class="sg-pic"><img src="assets/' + f[0] + '.webp" alt="' + f[1] + '" loading="lazy" draggable="false"><span class="sg-tag">' + c[0] + "</span><h3>" + f[1] + '</h3></div><div class="sg-meta"><p>' + f[2] + "</p><em>" + f[3] + " €</em></div></article>";
  }).join("");
  var slides = $$(".sg-slide", rail), sgPrev = $("#sgPrev"), sgNext = $("#sgNext"), sgCount = $("#sgCount"), sgBar = $("#sgBar");
  function sgIndex() {
    var start = rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).scrollPaddingLeft || 0);
    var best = 0, bd = Infinity;
    slides.forEach(function (s, i) { var d = Math.abs(s.getBoundingClientRect().left - start); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function sgMark() {
    var i = sgIndex(), max = rail.scrollWidth - rail.clientWidth;
    var atEnd = rail.scrollLeft >= max - 4;
    if (atEnd) i = Math.max(i, slides.length - 1 - 0);
    sgCount.textContent = pad2(atEnd ? slides.length : i + 1) + " / " + pad2(slides.length);
    sgPrev.disabled = rail.scrollLeft <= 4;
    sgNext.disabled = atEnd;
    sgBar.style.setProperty("--p", ((rail.scrollLeft + rail.clientWidth) / rail.scrollWidth).toFixed(4));
  }
  function sgGo(dir) {
    var i = sgIndex() + dir;
    i = Math.max(0, Math.min(slides.length - 1, i));
    var start = rail.getBoundingClientRect().left + parseFloat(getComputedStyle(rail).scrollPaddingLeft || 0);
    rail.scrollBy({ left: slides[i].getBoundingClientRect().left - start, behavior: reduce ? "auto" : "smooth" });
  }
  sgPrev.addEventListener("click", function () { sgGo(-1); });
  sgNext.addEventListener("click", function () { sgGo(1); });
  rail.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); sgGo(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); sgGo(-1); }
  });
  var sgRaf = 0;
  rail.addEventListener("scroll", function () { if (!sgRaf) sgRaf = requestAnimationFrame(function () { sgRaf = 0; sgMark(); }); }, { passive: true });
  window.addEventListener("resize", sgMark);
  sgMark();

  /* ---------------- menu ---------------- */
  // [name, description, price, culture, flags]   flags: v = vegetariano, g = senza glutine
  var MENU = {
    allday: { label: "Tutto il giorno", cats: [
      ["Aperitivi", "", [
        ["Edamame", "Sale marino, yukari e lime, oppure piccanti", 7, "jp", "vg"],
        ["Pão de queijo", "Panini caldi al formaggio, burro al miele di castagno", 8, "br", "vg"],
        ["Guacamole nikkei", "Avocado, ají amarillo, cipolla, chips di mais", 12, "pe", "vg"],
        ["Gyoza di wagyu", "Crema di zucca kabocha, soia dolce", 16, "jp", ""],
        ["Tartare croccante", "Riso croccante, salmone, tonno, ricciola, rocoto", 15, "pe", ""],
        ["Acciughe in tempura", "Acciughe di Monterosso, maionese al lime e shichimi", 11, "li", ""]
      ]],
      ["Crudi e seviche", "Il pesce crudo arriva ogni mattina dal mercato ittico di Genova.", [
        ["Seviche di branzino", "Leche de tigre, mais cancha, patata dolce, cipolla rossa", 19, "pe", "g"],
        ["Seviche di gambero rosso", "Gambero rosso di Sanremo, ají amarillo, mango, coriandolo", 24, "li", "g"],
        ["Seviche di tofu", "Leche de tigre di patata dolce, scalogno in agrodolce", 13, "pe", "vg"],
        ["Tiradito di ricciola", "Ponzu all'arancia, quinoa soffiata, wasabi fresco", 20, "pe", ""],
        ["Ostriche (3 pz)", "Con leche de tigre, ponzu e granita di yuzu", 21, "li", "g"],
        ["Sashimi del giorno (9 pz)", "Tonno, ricciola e gambero rosso, ponzu agli agrumi", 26, "li", ""]
      ]],
      ["Sushi e roll", "", [
        ["Uramaki Kasato", "Salmone scottato, mango, ají amarillo, crema di avocado", 17, "jp", ""],
        ["Roll Callao", "Gambero in tempura, avocado, salsa al rocoto", 18, "pe", ""],
        ["Roll Copacabana", "Granchio, cocco tostato, mango, maionese al lime", 18, "br", ""],
        ["Roll di verdure alla brace", "Asparagi, zucchine, peperone, salsa al miso", 13, "jp", "v"],
        ["Nigiri di ricciola (2 pz)", "Con chimichurri e sale affumicato", 9, "jp", ""],
        ["Gunkan ikura e yuzu (2 pz)", "Uova di salmone marinate, scorza di yuzu", 12, "jp", ""]
      ]],
      ["Piatti caldi", "", [
        ["Tempura nel cesto", "Gamberi e verdure di stagione, tentsuyu al lime", 22, "jp", ""],
        ["Polpo croccante", "Crema di miso e kabocha, insalata di finocchio, chimichurri", 26, "jp", ""],
        ["Moqueca di pesce bianco", "Latte di cocco, olio di dendê, peperoni, riso al cocco", 28, "br", "g"],
        ["Arroz chaufa", "Riso saltato al wok, uovo, verdure, soia e zenzero", 14, "pe", "v"],
        ["Empanadas (3 pz)", "Pollo, peperoncino rosso, cipolla, salsa verde", 14, "pe", ""],
        ["Feijoada leggera", "Fagioli neri, guanciale affumicato, farofa, arancia", 19, "br", "g"]
      ]]
    ]},
    brace: { label: "Robata e churrasco", cats: [
      ["Dalla robata", "Spiedi cotti sul carbone binchotan, due per porzione.", [
        ["Anticuchos di cuore", "Cuore di manzo all'ají panca, patate alla huancaína", 14, "pe", "g"],
        ["Anticuchos di salmone", "Glassa al miso bianco e lime", 15, "pe", ""],
        ["Pannocchia alla brace", "Burro al miso, formaggio fresco, peperoncino", 9, "pe", "vg"],
        ["Melanzana alla brace", "Miso dolce, sesamo, cipollotto", 10, "jp", "v"],
        ["Pollo yakitori", "Coscia di pollo, salsa tare, shichimi", 12, "jp", ""],
        ["Gamberoni al lime", "Burro al rocoto, coriandolo", 18, "li", "g"]
      ]],
      ["Churrasco", "Tagli serviti per due, con farofa, vinagrete e riso.", [
        ["Picanha (400 g)", "Copertina di manzo, sale grosso, chimichurri", 34, "br", "g"],
        ["Costine di maiale", "Glassa di tamarindo e miso, cavolo marinato", 26, "br", ""],
        ["Black cod al miso", "Merluzzo nero marinato tre giorni, zenzero in salamoia", 38, "jp", ""],
        ["Wagyu A5 (100 g)", "Cotto sulla pietra al tavolo, sale di Maldon e wasabi", 58, "jp", "g"]
      ]]
    ]},
    dolci: { label: "Dolci", cats: [
      ["Dolci", "", [
        ["Churros e doce de leite", "Con cioccolato fondente al rocoto", 10, "br", "v"],
        ["Mochi gelato (3 pz)", "Matcha, frutto della passione, cocco", 9, "jp", "vg"],
        ["Brigadeiro", "Cioccolato 70% e sesamo nero", 8, "br", "vg"],
        ["Tres leches all'hojicha", "Pan di Spagna, tre latti, tè tostato", 11, "pe", "v"],
        ["Suspiro limeño", "Crema di latte, meringa al porto, cannella", 10, "pe", "vg"],
        ["Sorbetto al chinotto di Savona", "Con zest di yuzu", 7, "li", "vg"]
      ]]
    ]},
    cocktail: { label: "Cocktail", cats: [
      ["Classici e della casa", "", [
        ["Pisco sour", "Pisco quebranta, lime, albume, amargo", 12, "pe", "vg"],
        ["Caipirinha", "Cachaça, lime, zucchero di canna", 11, "br", "vg"],
        ["Yuzu highball", "Whisky giapponese, soda allo yuzu", 13, "jp", "vg"],
        ["Chilcano al basilico", "Pisco, ginger beer, basilico di Pra'", 12, "li", "vg"],
        ["Maracujá spritz", "Frutto della passione, vino frizzante, cachaça", 11, "br", "vg"],
        ["Batida di cocco (analcolico)", "Cocco, lime, latte di riso", 8, "br", "vg"]
      ]]
    ]},
    brunch: { label: "Brunch (sab–dom)", cats: [
      ["Brunch Carioca · 55 € a persona", "Sabato e domenica dalle 12:30. Tutto il tavolo, un cocktail incluso.", [
        ["Per cominciare", "Pão de queijo, edamame, guacamole nikkei", 0, "br", "v"],
        ["Dal banco", "Seviche di branzino, uramaki Kasato, nigiri del giorno", 0, "pe", ""],
        ["Dalla brace", "Anticuchos, pannocchia al miso, picanha al taglio", 0, "br", ""],
        ["Per finire", "Churros e mochi gelato", 0, "jp", "v"]
      ]]
    ]}
  };
  var mnState = { tab: "allday", cult: "all", v: false, gf: false };
  var mnTabs = $("#mnTabs"), mnBody = $("#mnBody"), mnCount = $("#mnCount");
  Object.keys(MENU).forEach(function (k) {
    var b = document.createElement("button");
    b.className = "mn-tab"; b.setAttribute("role", "tab"); b.setAttribute("data-tab", k); b.textContent = MENU[k].label;
    b.addEventListener("click", function () { setMenu({ tab: k }); });
    mnTabs.appendChild(b);
  });
  $$("#mnFilters [data-cult]").forEach(function (b) { b.addEventListener("click", function () { setMenu({ cult: b.getAttribute("data-cult") }); }); });
  $$("#mnFilters [data-diet]").forEach(function (b) {
    b.addEventListener("click", function () { var o = {}; var k = b.getAttribute("data-diet"); o[k] = !mnState[k]; setMenu(o); });
  });
  function setMenu(o) {
    Object.keys(o).forEach(function (k) { mnState[k] = o[k]; });
    $$(".mn-tab", mnTabs).forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-tab") === mnState.tab ? "true" : "false"); });
    $$("#mnFilters [data-cult]").forEach(function (b) { var on = b.getAttribute("data-cult") === mnState.cult; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    $$("#mnFilters [data-diet]").forEach(function (b) { b.setAttribute("aria-pressed", mnState[b.getAttribute("data-diet")] ? "true" : "false"); });
    renderMenu();
  }
  function renderMenu() {
    var tab = MENU[mnState.tab], total = 0, k = 0, html = "";
    tab.cats.forEach(function (cat) {
      var items = cat[2].filter(function (it) {
        if (mnState.cult !== "all" && it[3] !== mnState.cult) return false;
        if (mnState.v && it[4].indexOf("v") < 0) return false;
        if (mnState.gf && it[4].indexOf("g") < 0) return false;
        return true;
      });
      if (!items.length) return;
      total += items.length;
      html += '<div class="mn-cat"><h3>' + cat[0] + "</h3>" + (cat[1] ? "<p>" + cat[1] + "</p>" : "") + '<div class="mn-grid">';
      items.forEach(function (it) {
        var flags = [];
        if (it[4].indexOf("v") >= 0) flags.push("V");
        if (it[4].indexOf("g") >= 0) flags.push("GF");
        html += '<div class="mn-item" style="--c:' + CC[it[3]][1] + ";--k:" + (k++) + '"><h4><i title="' + CC[it[3]][0] + '"></i>' + it[0] + "</h4><p>" + it[1] + '</p><div class="mn-p"><span>' + flags.join(" · ") + "</span>" + (it[2] ? "<em>" + it[2] + "</em>" : "<em>incluso</em>") + "</div></div>";
      });
      html += "</div></div>";
    });
    if (!total) html = '<div class="mn-empty"><p>Nessun piatto con questi filtri in questa sezione.</p><button class="btn-line dark" type="button" id="mnReset">Togli i filtri</button></div>';
    mnBody.innerHTML = html;
    mnCount.textContent = total === 1 ? "1 piatto" : total + " piatti";
    var r = $("#mnReset"); if (r) r.addEventListener("click", function () { setMenu({ cult: "all", v: false, gf: false }); });
  }
  setMenu({});

  /* ---------------- l'esperienza: chapter roller ---------------- */
  var CH = [
    ["18:00 — Aperitivo", "Hora", "nikkei", "Pisco sour, caipirinha e bocconi dalla brace al banco. La sala si riempie piano, la musica è ancora bassa."],
    ["20:00 — Cena", "Crudo, brace", "e fuoco lento", "Piatti piccoli che arrivano quando sono pronti, da dividere. Al banco i cuochi ti consigliano il pesce del giorno."],
    ["22:30 — Sala Maré", "Il ritmo", "sale piano", "Si apre la sala dietro la cucina: luci rosse, bossa e cumbia, un cocktail bar tutto per lei."],
    ["01:00 — Fino a tardi", "L'ultimo giro", "è al banco", "Il venerdì e il sabato chiudiamo alle due. La robata resta accesa fino all'una."]
  ];
  var crSec = $("#esperienza"), crRows = [$("#crEye"), $("#crL1"), $("#crL2")], crBgs = $$(".cr-bg", crSec), crBox = $("#crBox"), crTxt = $("#crTxt"), crPips = $("#crPips");
  var crCells = crRows.map(function (row, r) {
    return CH.map(function (c) { var s = document.createElement("span"); s.className = "cr-roll"; s.textContent = c[r]; row.appendChild(s); return s; });
  });
  CH.forEach(function () { crPips.appendChild(document.createElement("i")); });
  var pips = $$("i", crPips), crCur = -1, crBoxT = 0;
  function crShow(i) {
    if (i === crCur) return;
    crCur = i;
    crCells.forEach(function (row) { row.forEach(function (el, j) { el.className = "cr-roll" + (j === i ? " now" : j < i ? " past" : ""); el.setAttribute("aria-hidden", j === i ? "false" : "true"); }); });
    pips.forEach(function (p, j) { p.classList.toggle("on", j === i); });
    crBgs.forEach(function (b, j) { b.classList.toggle("on", j === i); });
    clearTimeout(crBoxT);
    if (reduce) { crTxt.textContent = CH[i][3]; return; }
    crBox.classList.add("swap");
    crBoxT = setTimeout(function () { crTxt.textContent = CH[i][3]; crBox.classList.remove("swap"); }, 260);
  }
  function crUpdate() {
    var r = crSec.getBoundingClientRect(), max = r.height - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 0;
    var next = Math.min(CH.length - 1, Math.floor(p * CH.length));
    if (next === crCur) return;
    var edge = Math.max(next, crCur) / CH.length;
    if (crCur < 0 || Math.abs(p - edge) > 0.02) crShow(next);
  }
  crSec.setAttribute("data-progress", "0");

  /* ---------------- scroll loop ---------------- */
  var sRaf = 0;
  function onScroll() {
    if (sRaf) return;
    sRaf = requestAnimationFrame(function () { sRaf = 0; onScrollHeader(); crUpdate(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScrollHeader(); crUpdate();

  /* ---------------- booking drawer ---------------- */
  var bk = { date: null, slot: null, persons: 2, area: "sala", step: 1 };
  var bkDates = $("#bkDates"), bkSlots = $("#bkSlots"), pOut = $("#pOut"), pUnit = $("#pUnit"), err1 = $("#err1");
  var dateList = [];
  function buildDates() {
    var now = romeNow();
    var base = Date.UTC(now.y, now.mo - 1, now.d);
    dateList = [];
    for (var i = 0; i < 21; i++) {
      var dt = new Date(base + i * 864e5);
      dateList.push({ key: dt.toISOString().slice(0, 10), wd: dt.getUTCDay(), d: dt.getUTCDate(), m: dt.getUTCMonth(), today: i === 0, idx: i });
    }
    bkDates.innerHTML = dateList.map(function (o, i) {
      var closed = !HOURS[o.wd].length;
      return '<button type="button" class="bk-date" role="radio" aria-checked="false" data-i="' + i + '"' + (closed ? " disabled" : "") + ' aria-label="' + DAY_IT[o.wd] + " " + o.d + " " + MONTH_SHORT[o.m] + (closed ? ", chiuso" : "") + '">' + (o.today ? "oggi" : DAY_SHORT[o.wd]) + "<b>" + o.d + "</b>" + MONTH_SHORT[o.m] + "</button>";
    }).join("");
    $$(".bk-date", bkDates).forEach(function (b) { b.addEventListener("click", function () { pickDate(+b.getAttribute("data-i")); }); });
  }
  function slotsFor(o) {
    var out = [], now = romeNow();
    HOURS[o.wd].forEach(function (iv) {
      var lunch = iv[0] < 900;
      var last = lunch ? iv[1] - 90 : Math.min(iv[1] - 90, 1410);
      var group = { label: lunch ? "Pranzo" : "Cena", list: [] };
      for (var t = iv[0]; t <= last; t += 30) {
        var past = o.today && t < now.min + 30;
        var mareBlock = bk.area === "mare" && t < 1260;
        group.list.push({ t: t, off: past || mareBlock, why: past ? "passato" : mareBlock ? "Sala Maré dalle 21" : "" });
      }
      out.push(group);
    });
    return out;
  }
  function renderSlots() {
    var o = dateList[bk.date];
    if (!o) { bkSlots.innerHTML = '<p class="bk-none">Scegli prima una data.</p>'; return; }
    var groups = slotsFor(o), any = false;
    bkSlots.innerHTML = groups.map(function (g) {
      return "<div><h4>" + g.label + '</h4><div class="slot-row">' + g.list.map(function (s) {
        if (!s.off) any = true;
        return '<button type="button" class="bk-slot" role="radio" data-t="' + s.t + '" aria-checked="' + (bk.slot === s.t && !s.off ? "true" : "false") + '"' + (s.off ? ' disabled title="' + s.why + '"' : "") + ">" + hhmm(s.t) + "</button>";
      }).join("") + "</div></div>";
    }).join("");
    if (!any) bkSlots.innerHTML += '<p class="bk-none">Per questa data non ci sono più orari disponibili.</p>';
    // drop a selection that is no longer valid
    var sel = bkSlots.querySelector('.bk-slot[data-t="' + bk.slot + '"]');
    if (bk.slot !== null && (!sel || sel.disabled)) bk.slot = null;
    $$(".bk-slot", bkSlots).forEach(function (b) {
      b.addEventListener("click", function () {
        bk.slot = +b.getAttribute("data-t");
        $$(".bk-slot", bkSlots).forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
        err1.textContent = "";
      });
    });
  }
  function pickDate(i) {
    bk.date = i;
    $$(".bk-date", bkDates).forEach(function (b, k) { b.setAttribute("aria-checked", k === i ? "true" : "false"); });
    renderSlots(); err1.textContent = "";
  }
  function renderPersons() {
    pOut.textContent = bk.persons > 10 ? "10+" : bk.persons;
    pUnit.textContent = bk.persons === 1 ? "persona" : "persone";
    $("#pMinus").disabled = bk.persons <= 1;
    $("#pPlus").disabled = bk.persons > 10;
    $("#bigGroup").hidden = bk.persons <= 10;
    var banco = $('#bkAreas input[value="banco"]');
    var tooMany = bk.persons > 4;
    banco.disabled = tooMany;
    banco.closest(".area").classList.toggle("off", tooMany);
    if (tooMany && bk.area === "banco") {
      bk.area = "sala"; $('#bkAreas input[value="sala"]').checked = true;
      toast("Il banco sushi accoglie al massimo 4 persone: ti abbiamo spostato in sala.");
      renderSlots();
    }
  }
  $("#pMinus").addEventListener("click", function () { bk.persons = Math.max(1, bk.persons - 1); renderPersons(); err1.textContent = ""; });
  $("#pPlus").addEventListener("click", function () { bk.persons = Math.min(11, bk.persons + 1); renderPersons(); });
  $$('#bkAreas input[name="area"]').forEach(function (r) {
    r.addEventListener("change", function () { bk.area = r.value; renderSlots(); err1.textContent = ""; });
  });
  $("#toPrivate").addEventListener("click", function () {
    closeDrawer();
    var g = $("#eGuests"); g.value = 12;
    setTimeout(function () { $("#private").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 60);
  });
  var panes = $$(".bk-pane", bookDrawer), stepLis = $$(".bk-steps li", bookDrawer);
  function goStep(n) {
    bk.step = n;
    panes.forEach(function (p) { p.hidden = +p.getAttribute("data-pane") !== n; });
    stepLis.forEach(function (li, i) { li.classList.toggle("on", i < n); });
    bookDrawer.scrollTop = 0;
  }
  function areaName(a) { return a === "banco" ? "banco sushi" : a === "mare" ? "Sala Maré" : "sala principale"; }
  function dateLabel(o) { return DAY_IT[o.wd] + " " + o.d + " " + MONTH_SHORT[o.m]; }
  $("#toStep2").addEventListener("click", function () {
    if (bk.date === null) { err1.textContent = "Scegli una data."; return; }
    if (bk.persons > 10) { err1.textContent = "Per più di 10 persone usa il modulo private dining."; return; }
    if (bk.slot === null) { err1.textContent = "Scegli un orario."; return; }
    var o = dateList[bk.date];
    $("#bkSum").innerHTML = "<b>" + dateLabel(o) + "</b> alle <b>" + hhmm(bk.slot) + "</b> · " + bk.persons + (bk.persons === 1 ? " persona" : " persone") + " · " + areaName(bk.area);
    goStep(2);
    setTimeout(function () { $("#bName").focus({ preventScroll: true }); }, 50);
  });
  $("#back1").addEventListener("click", function () { goStep(1); });

  function setErr(input, msg) {
    var f = input.closest(".fld"); if (!f) return !msg;
    f.classList.toggle("bad", !!msg);
    var s = f.querySelector(".fe"); if (s) s.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  var reMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function phoneOk(v) { var d = v.replace(/[\s.\-()]/g, ""); return /^\+?\d{8,15}$/.test(d); }
  $("#bkForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (bk.step !== 2) return;
    var n = $("#bName"), p = $("#bPhone"), m = $("#bMail"), ok = true;
    ok = setErr(n, n.value.trim().length < 3 ? "Scrivi nome e cognome." : "") && ok;
    ok = setErr(p, !phoneOk(p.value) ? "Inserisci un numero valido (8–15 cifre)." : "") && ok;
    ok = setErr(m, !reMail.test(m.value.trim()) ? "Inserisci un'email valida." : "") && ok;
    var c = $("#bOk");
    $("#bOkErr").textContent = c.checked ? "" : "Serve il consenso per confermare.";
    ok = c.checked && ok;
    if (!ok) { var bad = bookDrawer.querySelector(".fld.bad input"); if (bad) bad.focus(); return; }
    var o = dateList[bk.date];
    var code = "UM-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $("#bkCode").textContent = code;
    $("#bkDoneTxt").innerHTML = n.value.trim().split(" ")[0] + ", ti aspettiamo <b>" + dateLabel(o) + "</b> alle <b>" + hhmm(bk.slot) + "</b>, " + bk.persons + (bk.persons === 1 ? " persona" : " persone") + ", " + areaName(bk.area) + ".";
    goStep(3);
  });
  ["#bName", "#bPhone", "#bMail"].forEach(function (s) { $(s).addEventListener("input", function () { setErr($(s), ""); }); });
  $("#bOk").addEventListener("change", function () { $("#bOkErr").textContent = ""; });
  function resetBooking() {
    $("#bkForm").reset();
    $$(".fld", bookDrawer).forEach(function (f) { f.classList.remove("bad"); var s = f.querySelector(".fe"); if (s) s.textContent = ""; });
    $("#bOkErr").textContent = "";
    bk = { date: null, slot: null, persons: 2, area: "sala", step: 1 };
    buildDates();
    // first date that still has a free slot
    for (var i = 0; i < dateList.length; i++) {
      if (!HOURS[dateList[i].wd].length) continue;
      var free = slotsFor(dateList[i]).some(function (g) { return g.list.some(function (s) { return !s.off; }); });
      if (free) { pickDate(i); break; }
    }
    renderPersons(); err1.textContent = ""; goStep(1);
  }
  $("#bkAgain").addEventListener("click", resetBooking);
  function applyHint(h) {
    var want = h === "brunch" ? [6, 0] : h === "aperitivo" ? [4, 5] : h === "notte" ? [5, 6] : null;
    if (!want) return;
    if (h === "aperitivo") { bk.area = "banco"; bk.persons = Math.min(bk.persons, 4); }
    if (h === "notte") bk.area = "mare";
    $('#bkAreas input[value="' + bk.area + '"]').checked = true;
    renderPersons();
    var target = h === "brunch" ? 750 : h === "aperitivo" ? 1080 : 1290;
    for (var i = 0; i < dateList.length; i++) {
      if (want.indexOf(dateList[i].wd) < 0) continue;
      pickDate(i);
      var b = bkSlots.querySelector('.bk-slot[data-t="' + target + '"]');
      if (b && !b.disabled) { b.click(); break; }
    }
  }
  $$("[data-open-book]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      if (bk.step === 3 || bk.date === null || b.hasAttribute("data-book-hint")) resetBooking();
      if (b.hasAttribute("data-book-hint")) applyHint(b.getAttribute("data-book-hint"));
      openDrawer(bookDrawer);
    });
  });
  resetBooking();

  /* ---------------- private dining form ---------------- */
  var pd = $("#pdForm"), eDate = $("#eDate"), eRoom = $("#eRoom"), eGuests = $("#eGuests");
  (function () {
    var n = romeNow(), d = new Date(Date.UTC(n.y, n.mo - 1, n.d) + 3 * 864e5);
    eDate.min = d.toISOString().slice(0, 10);
  })();
  function roomRange() { var o = eRoom.options[eRoom.selectedIndex]; return [+o.getAttribute("data-min"), +o.getAttribute("data-max"), o.textContent.split(" (")[0]]; }
  function checkGuests() {
    var r = roomRange(), g = parseInt(eGuests.value, 10);
    if (!g) return setErr(eGuests, "Quanti ospiti?");
    if (g < r[0] || g > r[1]) return setErr(eGuests, r[2] + ": da " + r[0] + " a " + r[1] + " ospiti.");
    return setErr(eGuests, "");
  }
  eRoom.addEventListener("change", function () { if (eGuests.value) checkGuests(); });
  pd.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, t = $("#eType"), nm = $("#eName"), em = $("#eMail"), ph = $("#ePhone");
    ok = setErr(t, t.value ? "" : "Scegli il tipo di evento.") && ok;
    var dv = eDate.value;
    ok = setErr(eDate, !dv ? "Scegli una data." : dv < eDate.min ? "Servono almeno 3 giorni di preavviso." : "") && ok;
    ok = checkGuests() && ok;
    ok = setErr(nm, nm.value.trim().length < 3 ? "Scrivi nome e cognome." : "") && ok;
    ok = setErr(em, reMail.test(em.value.trim()) ? "" : "Inserisci un'email valida.") && ok;
    ok = setErr(ph, phoneOk(ph.value) ? "" : "Inserisci un numero valido.") && ok;
    var c = $("#eOk");
    $("#eOkErr").textContent = c.checked ? "" : "Serve il consenso per inviare la richiesta.";
    ok = c.checked && ok;
    if (!ok) { var bad = pd.querySelector(".fld.bad input, .fld.bad select"); if (bad) bad.focus(); return; }
    var p = dv.split("-");
    var code = "EV-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $("#pdDoneTxt").innerHTML = "Grazie " + nm.value.trim().split(" ")[0] + ". " + t.value + " per <b>" + parseInt(eGuests.value, 10) + " ospiti</b> in " + roomRange()[2] + ", il <b>" + (+p[2]) + "/" + (+p[1]) + "/" + p[0] + "</b>. Ti scriviamo entro 24 ore lavorative con una proposta di menu. Riferimento <b>" + code + "</b>.";
    pd.hidden = true; $("#pdDone").hidden = false;
    $("#pdDone").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });
  $$("input, select", pd).forEach(function (el) {
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", function () { if (el !== eGuests) setErr(el, ""); else checkGuests(); });
  });
  $("#eOk").addEventListener("change", function () { $("#eOkErr").textContent = ""; });
  $("#pdAgain").addEventListener("click", function () {
    pd.reset(); $$(".fld", pd).forEach(function (f) { f.classList.remove("bad"); var s = f.querySelector(".fe"); if (s) s.textContent = ""; });
    pd.hidden = false; $("#pdDone").hidden = true;
  });

  /* social / placeholder links */
  $$('a[href="#"]').forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); toast("Link di esempio: in questo modello non porta da nessuna parte."); }); });
})();
