/* Mumi Sushi · «Sera» */
(function () {
  'use strict';
  var M = window.Mumi, esc = M.esc, reduce = M.reduce;
  var live = {};

  /* ── header: solid once scrolled ── */
  var header = document.getElementById('top');
  function onScroll() { header.classList.toggle('solid', window.scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ── staggered-character-reveal (hero title) ── */
  [].forEach.call(document.querySelectorAll('[data-split]'), function (el) {
    var label = el.textContent.replace(/\s+/g, ' ').trim(), n = 0;
    var walk = function (node, into) {
      [].slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          ch.textContent.split(/(\s+)/).forEach(function (word) {
            if (!word) return;
            if (/^\s+$/.test(word)) { into.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            for (var i = 0; i < word.length; i++) {
              var c = document.createElement('span'); c.className = 'c'; c.style.setProperty('--i', n++); c.textContent = word[i]; w.appendChild(c);
            }
            into.appendChild(w);
          });
        } else if (ch.nodeType === 1) {
          var clone = ch.cloneNode(false); into.appendChild(clone); walk(ch, clone);
        }
      });
    };
    var frag = document.createElement('span'); walk(el, frag);
    el.textContent = ''; while (frag.firstChild) el.appendChild(frag.firstChild);
    el.setAttribute('aria-label', label);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('go'); }); });
  });

  /* ── magnetic-button ── */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    [].forEach.call(document.querySelectorAll('.magnet'), function (el) {
      var ax = 0, ay = 0, RADIUS = 70, PULL = 0.3;
      var set = function (x, y, t) { ax = x; ay = y; el.classList.toggle('tracking', t); el.style.setProperty('--mx', x.toFixed(2) + 'px'); el.style.setProperty('--my', y.toFixed(2) + 'px'); };
      addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2 - ax), dy = e.clientY - (r.top + r.height / 2 - ay);
        if (Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS) set(dx * PULL, dy * PULL, true);
        else if (ax || ay) set(0, 0, false);
      });
      document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) set(0, 0, false); });
      addEventListener('blur', function () { set(0, 0, false); });
    });
  }

  /* ── live status strip under the hero ── */
  var ticker = document.getElementById('ticker');
  ticker.innerHTML = M.STORES.map(function (s) {
    return '<li data-s="' + s.slug + '"><a href="' + M.orderUrl(s) + '"><b>' + esc(s.name) + (s.isNew ? '<span class="new">Nuovo</span>' : '') + '</b>' +
      '<span class="st unknown"><i></i><span>…</span></span></a></li>';
  }).join('');

  /* ── restaurants: hover-tinted list (+ inline details on phones) ──
   * Al posto della foto: la piccola mappa delle vie intorno al ristorante (assets/map.js). */
  var list = document.getElementById('storeList'), panel = document.getElementById('storePanel'), section = document.getElementById('ristoranti');
  var PIN = '<svg viewBox="0 0 34 44"><path d="M17 43S3 29.4 3 17.5a14 14 0 0 1 28 0C31 29.4 17 43 17 43z"/><circle cx="17" cy="17.5" r="5.2"/></svg>';
  function hoursRow(s) {
    var h = M.todayHours(live[s.slug]);
    if (!h) return '';
    return '<dt>Oggi</dt><dd>' + (h === 'closed' ? 'Chiuso' : esc(h)) + '</dd>';
  }
  function mapHtml(s) {
    return '<a class="det-map" data-s="' + s.slug + '" href="' + M.maps(s) + '" target="_blank" rel="noopener" aria-label="Mumi Sushi ' + esc(s.name) + ' sulla mappa: apri Google Maps">' +
      '<canvas aria-hidden="true"></canvas><span class="pin" aria-hidden="true">' + PIN + '</span>' +
      '<span class="go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11 21 3l-8 18-2-8z"/></svg>Apri la mappa</span>' +
      '<span class="attr">© OpenStreetMap</span></a>';
  }
  function info(s) {
    return '<dl><dt>Indirizzo</dt><dd><a href="' + M.maps(s) + '" target="_blank" rel="noopener">' + esc(s.address) + '<br>' + esc(s.cap) + '</a></dd>' +
      hoursRow(s) +
      '<dt>Telefono</dt><dd><a href="' + M.tel(s.phone) + '">' + esc(s.phone) + '</a></dd></dl>' +
      '<div class="acts"><a class="btn oro press" href="' + M.orderUrl(s) + '">Ordina da ' + esc(s.name) + ' <span aria-hidden="true">→</span></a>' +
      '<a class="btn ghost press" href="' + M.maps(s) + '" target="_blank" rel="noopener">Indicazioni</a></div>';
  }
  list.innerHTML = M.STORES.map(function (s, i) {
    return '<li class="row" data-s="' + s.slug + '">' +
      '<button class="row-btn" type="button" aria-expanded="false"><span class="n">0' + (i + 1) + '</span><span class="nm">' + esc(s.name) + '</span>' +
      '<span class="st unknown"><i></i><span>…</span></span></button>' +
      '<div class="det">' + mapHtml(s) + '<div class="det-info">' + info(s) + '</div></div></li>';
  }).join('');

  /* mappe: si disegnano solo quelle visibili (un canvas nascosto ha larghezza 0) */
  var FONT = getComputedStyle(document.body).fontFamily;
  function paintMap(el) {
    var cv = el.querySelector('canvas'), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H || !window.MumiMap) return;
    var lift = 18, tip = H / 2 + lift;
    var ok = MumiMap.draw(cv, el.getAttribute('data-s'), {
      lift: lift, font: FONT,
      keepOut: [[W / 2 - 24, tip - 50, W / 2 + 24, tip + 8], [0, H - 46, 160, H], [W - 112, H - 22, W, H]],
    });
    if (!ok) return;
    el.style.setProperty('--tip', tip + 'px');
    el.classList.add('ready');
  }
  function paintMaps() { [].forEach.call(section.querySelectorAll('.det-map'), paintMap); }
  var mapsWanted = false;
  function wantMaps() {
    if (mapsWanted || !window.MumiMap) return; mapsWanted = true;
    MumiMap.load(paintMaps);
    if (document.fonts && document.fonts.load) document.fonts.load('500 10.5px "DM Sans"').then(function () { if (MumiMap.ready()) paintMaps(); });
  }
  if ('IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { wantMaps(); mio.disconnect(); } }, { rootMargin: '600px 0px' });
    mio.observe(section);
  } else wantMaps();
  var rT = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (mapsWanted && MumiMap.ready()) paintMaps(); }, 120); });

  var rows = [].slice.call(list.children), cur = -1, swapT = 0;
  function select(i, fromHover) {
    if (i === cur) return;
    var dir = i > cur ? 1 : -1; cur = i;
    var s = M.STORES[i];
    section.style.setProperty('--tint', s.hue);
    rows.forEach(function (r, k) { r.classList.toggle('on', k === i); r.querySelector('.row-btn').setAttribute('aria-expanded', k === i ? 'true' : 'false'); });
    // phones: the row just opened has a map that was hidden until now
    if (mapsWanted && MumiMap.ready()) paintMap(rows[i].querySelector('.det-map'));
    // desktop panel: map leans the way the pointer travelled, map and text cross-fade
    if (getComputedStyle(panel).display === 'none') return;
    var map = panel.querySelector('.det-map');
    if (!map || reduce) { renderPanel(); return; }
    map.style.setProperty('--r', dir * 3 + 'deg');
    setTimeout(function () { map.style.setProperty('--r', '0deg'); }, 70);
    map.classList.add('swap');
    [].forEach.call(panel.querySelectorAll('.fade'), function (f) { f.classList.add('swap'); });
    clearTimeout(swapT);
    swapT = setTimeout(function () { renderPanel(true); }, 220);
  }
  function renderPanel(keepMap) {
    var s = M.STORES[Math.max(0, cur)];
    var map = panel.querySelector('.det-map');
    if (keepMap && map) {
      map.setAttribute('data-s', s.slug);
      map.setAttribute('href', M.maps(s));
      map.setAttribute('aria-label', 'Mumi Sushi ' + s.name + ' sulla mappa: apri Google Maps');
      panel.querySelector('.panel-body').innerHTML = panelBody(s);
    } else {
      panel.innerHTML = mapHtml(s) + '<div class="panel-body">' + panelBody(s) + '</div>';
      map = panel.querySelector('.det-map');
    }
    if (mapsWanted && MumiMap.ready()) paintMap(map);
    if (map.classList.contains('swap')) {
      map.classList.remove('swap', 'drop'); void map.offsetWidth; map.classList.add('drop');
    }
  }
  function panelBody(s) {
    return '<div class="fade"><h3>' + esc(s.city) + '</h3>' + info(s) + '</div>';
  }
  rows.forEach(function (r, i) {
    var b = r.querySelector('.row-btn');
    b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') select(i, true); });
    b.addEventListener('focus', function () { select(i); });
    b.addEventListener('click', function () { select(i); });
  });
  select(0); renderPanel();

  /* ── live data → ticker, rows, panel ── */
  function paintState(el, st) {
    if (!el) return;
    el.className = 'st ' + st.kind;
    el.querySelector('span').textContent = st.text;
  }
  M.watch(function (s, x) {
    live[s.slug] = x;
    var st = M.stateOf(x);
    paintState(ticker.querySelector('[data-s="' + s.slug + '"] .st'), st);
    var row = list.querySelector('[data-s="' + s.slug + '"]');
    paintState(row.querySelector('.row-btn .st'), st);
    row.querySelector('.det-info').innerHTML = info(s);
    if (M.STORES[cur] === s && panel.querySelector('.panel-body')) panel.querySelector('.panel-body').innerHTML = panelBody(s);
  });

  /* ── menu rail: dots + arrows ── */
  var rail = document.getElementById('rail'), dots = document.getElementById('dots');
  var slides = [].slice.call(rail.children);
  slides.forEach(function () { dots.appendChild(document.createElement('i')); });
  function mark() {
    var left = rail.scrollLeft + 1, best = 0, bestD = Infinity;
    slides.forEach(function (s, i) { var d = Math.abs(s.offsetLeft - rail.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft) - left); if (d < bestD) { bestD = d; best = i; } });
    [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === best); });
  }
  rail.addEventListener('scroll', mark, { passive: true }); addEventListener('resize', mark); mark();
  function step(dir) { rail.scrollBy({ left: dir * (slides[0].offsetWidth + 14), behavior: reduce ? 'auto' : 'smooth' }); }
  document.getElementById('prev').addEventListener('click', function () { step(-1); });
  document.getElementById('next').addEventListener('click', function () { step(1); });

  /* ── scroll-word-brighten (manifesto) ── */
  var track = document.getElementById('mTrack'), text = document.getElementById('mText');
  if (!reduce) {
    var words = text.textContent.split(/(\s+)/); text.textContent = '';
    var spans = [];
    words.forEach(function (w) {
      if (/^\s+$/.test(w)) { text.appendChild(document.createTextNode(w)); return; }
      var i = document.createElement('i'); i.textContent = w; text.appendChild(i); spans.push(i);
    });
    var N = spans.length, SOFT = 6, FLOOR = 0.14;
    var update = function () {
      var r = track.getBoundingClientRect(), max = r.height - innerHeight;
      var raw = max > 0 ? -r.top / max : 0;
      var prog = Math.min(1, Math.max(0, raw / 0.8));
      var head = prog * (N + SOFT) + 2;
      for (var i = 0; i < N; i++) {
        var t = Math.min(1, Math.max(0, (head - i) / SOFT));
        spans[i].style.opacity = (FLOOR + (1 - FLOOR) * t).toFixed(3);
      }
    };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
  }

  /* ── footer ── */
  document.getElementById('legal').innerHTML = M.legalHtml();
  document.getElementById('year').textContent = M.year;
  M.reveals();
})();
