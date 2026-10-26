/* Mumi Sushi · «Carta» */
(function () {
  'use strict';
  var M = window.Mumi, esc = M.esc, reduce = M.reduce;
  var live = {};

  /* ── chapter-headline-roller, on a timer instead of the scrollbar ── */
  var WORDS = ['a domicilio.', 'da asporto.', 'nell’app.', 'in tre ristoranti.'];
  var roller = document.getElementById('roller');
  var cells = WORDS.map(function (w) {
    var s = document.createElement('span'); s.className = 'roll'; s.textContent = w; s.setAttribute('aria-hidden', 'true'); roller.appendChild(s); return s;
  });
  var k = -1;
  function roll() {
    k = (k + 1) % WORDS.length;
    cells.forEach(function (c, j) {
      // the one leaving goes up and out; everything else waits below the window
      c.className = 'roll' + (j === k ? ' now' : (j === (k - 1 + WORDS.length) % WORDS.length ? ' past' : ''));
    });
  }
  roll();
  if (!reduce) {
    var timer = setInterval(roll, 2600);
    document.addEventListener('visibilitychange', function () { clearInterval(timer); if (!document.hidden) timer = setInterval(roll, 2600); });
  }

  /* ── the seal stamps itself once the photo has landed ── */
  var seal = document.getElementById('seal');
  setTimeout(function () { seal.classList.add('stamped'); }, reduce ? 0 : 900);

  /* ── restaurant tickets ── */
  var list = document.getElementById('tickets'), section = document.getElementById('ristoranti');
  function facts(s) {
    var h = M.todayHours(live[s.slug]);
    return '<dl class="facts">' +
      '<div><dt>Indirizzo</dt><dd><a href="' + M.maps(s) + '" target="_blank" rel="noopener">' + esc(s.address) + ', ' + esc(s.cap) + '</a></dd></div>' +
      (h ? '<div><dt>Oggi</dt><dd>' + (h === 'closed' ? 'Chiuso' : esc(h)) + '</dd></div>' : '') +
      '<div><dt>Telefono</dt><dd><a href="' + M.tel(s.phone) + '">' + esc(s.phone) + '</a></dd></div></dl>';
  }
  list.innerHTML = M.STORES.map(function (s, i) {
    return '<li class="ticket reveal" style="--c:' + s.hue + '" data-s="' + s.slug + '" data-h="' + s.hue + '">' +
      (s.isNew ? '<span class="tag">Nuovo</span>' : '') +
      '<div class="stub"><b>' + s.name.charAt(0) + '</b><small>N. ' + (i + 1) + '</small></div>' +
      '<div class="body"><h3>' + esc(s.name) + '</h3><p class="city">' + esc(s.city) + ' (' + s.prov + ')</p>' +
      '<span class="st unknown"><i></i><span>…</span></span>' +
      '<div class="facts-wrap">' + facts(s) + '</div>' +
      '<div class="acts"><a class="btn btn-store press" href="' + M.orderUrl(s) + '">Ordina da ' + esc(s.name) + ' <span aria-hidden="true">→</span></a>' +
      '<a class="btn btn-map" href="' + M.maps(s) + '" target="_blank" rel="noopener">Indicazioni</a></div></div></li>';
  }).join('');
  var tickets = [].slice.call(list.children);

  /* ambient-hue-follows-focus: the section's paper takes the hue of the restaurant you are on */
  function focus(t) {
    tickets.forEach(function (x) { x.classList.toggle('on', x === t); });
    section.style.setProperty('--h', t.dataset.h);
  }
  tickets.forEach(function (t) {
    t.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') focus(t); });
    t.addEventListener('focusin', function () { focus(t); });
  });
  // phones have no hover: the ticket nearest the middle of the screen wins
  if ('IntersectionObserver' in window && matchMedia('(hover: none)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) focus(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    tickets.forEach(function (t) { io.observe(t); });
  }
  focus(tickets[0]);

  M.watch(function (s, x) {
    live[s.slug] = x;
    var t = list.querySelector('[data-s="' + s.slug + '"]');
    var st = M.stateOf(x), el = t.querySelector('.st');
    el.className = 'st ' + st.kind; el.querySelector('span').textContent = st.text;
    t.querySelector('.facts-wrap').innerHTML = facts(s);
  });

  /* ── footer ── */
  document.getElementById('legal').innerHTML = M.legalHtml();
  document.getElementById('year').textContent = M.year;
  M.reveals();
})();
