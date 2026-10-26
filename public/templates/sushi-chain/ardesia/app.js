/* Mumi Sushi · «Ardesia» */
(function () {
  'use strict';
  var M = window.Mumi, esc = M.esc, reduce = M.reduce;
  var live = {};
  var clamp01 = function (v) { return Math.min(1, Math.max(0, v)); };
  var slice = function (p, a, b) { return clamp01((p - a) / (b - a)); };
  var smooth = function (x) { return x * x * (3 - 2 * x); };

  /* ── header: solid once the hero has gone ── */
  var header = document.getElementById('top'), heroTrack = document.getElementById('heroTrack');

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
            for (var i = 0; i < word.length; i++) { var c = document.createElement('span'); c.className = 'c'; c.style.setProperty('--i', n++); c.textContent = word[i]; w.appendChild(c); }
            into.appendChild(w);
          });
        } else if (ch.nodeType === 1) { var clone = ch.cloneNode(false); into.appendChild(clone); walk(ch, clone); }
      });
    };
    var frag = document.createElement('span'); walk(el, frag);
    el.textContent = ''; while (frag.firstChild) el.appendChild(frag.firstChild);
    el.setAttribute('aria-label', label);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('go'); }); });
  });

  /* ── scroll: pinned hero recomposition + chef parallax + gallery columns ── */
  var stage = document.getElementById('heroStage');
  var chefImg = document.getElementById('chefImg'), chef = chefImg.closest('section');
  var cols = [].slice.call(document.querySelectorAll('.col[data-speed]'));
  var wide = matchMedia('(min-width: 720px)');
  var raf = 0;
  function frame() {
    raf = 0;
    var vh = innerHeight;
    // one number, three curves: --p frames the photo, --p1 empties the copy, --p2 brings the second line in
    var r = heroTrack.getBoundingClientRect(), max = r.height - vh;
    var p = max > 0 ? clamp01(-r.top / max) : 0;
    stage.style.setProperty('--p', smooth(slice(p, 0, 0.8)).toFixed(4));
    stage.style.setProperty('--p1', smooth(slice(p, 0, 0.4)).toFixed(4));
    stage.style.setProperty('--p2', smooth(slice(p, 0.4, 0.8)).toFixed(4));
    // on the light page the header turns solid as soon as the photo starts pulling back (its margins are paper)
    header.classList.toggle('solid', p > 0.12);
    // chef band drifts at a fraction of the scroll
    var c = chef.getBoundingClientRect();
    if (c.bottom > 0 && c.top < vh) chefImg.style.setProperty('--y', ((c.top + c.height / 2 - vh / 2) * -0.12).toFixed(1) + 'px');
    // gallery columns: each at its own speed around the centre of the screen
    cols.forEach(function (col) {
      var b = col.parentNode.getBoundingClientRect();
      if (b.bottom < -200 || b.top > vh + 200) return;
      var k = parseFloat(col.dataset.speed) * (wide.matches ? 1 : 0.5);
      col.style.setProperty('--ty', ((b.top + b.height / 2 - vh / 2) * k).toFixed(1) + 'px');
    });
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
  if (!reduce) { addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); frame(); }
  else { header.classList.add('solid'); }

  /* ── live status strip in the hero ── */
  var status = document.getElementById('status');
  status.innerHTML = M.STORES.map(function (s) {
    return '<li data-s="' + s.slug + '"><a href="' + M.orderUrl(s) + '"><b>' + esc(s.name) + (s.isNew ? '<span class="new">Nuovo</span>' : '') + '</b>' +
      '<span class="st unknown"><i></i><span>…</span></span></a></li>';
  }).join('');

  /* ── restaurant cards ── */
  var cards = document.getElementById('cards');
  function dl(s) {
    var h = M.todayHours(live[s.slug]);
    return '<dl><dt>Indirizzo</dt><dd><a href="' + M.maps(s) + '" target="_blank" rel="noopener">' + esc(s.address) + ', ' + esc(s.cap) + '</a></dd>' +
      (h ? '<dt>Oggi</dt><dd>' + (h === 'closed' ? 'Chiuso' : esc(h)) + '</dd>' : '') +
      '<dt>Telefono</dt><dd><a href="' + M.tel(s.phone) + '">' + esc(s.phone) + '</a></dd></dl>';
  }
  cards.innerHTML = M.STORES.map(function (s, i) {
    return '<li class="card reveal" style="--c:' + s.hue + '" data-s="' + s.slug + '">' +
      '<div class="top"><span><i></i>N. ' + (i + 1) + '</span>' + (s.isNew ? '<span class="new">Nuovo</span>' : '') + '</div>' +
      '<h3>' + esc(s.name) + '</h3><p class="city">' + esc(s.city) + ' (' + s.prov + ')</p>' +
      '<span class="st unknown"><i></i><span>…</span></span>' +
      '<div class="dl">' + dl(s) + '</div>' +
      '<div class="acts"><a class="btn ink press" href="' + M.orderUrl(s) + '">Ordina da ' + esc(s.name) + ' <span aria-hidden="true">→</span></a>' +
      '<a class="map" href="' + M.maps(s) + '" target="_blank" rel="noopener">Indicazioni ↗</a></div></li>';
  }).join('');

  function paint(el, st) { if (!el) return; el.className = 'st ' + st.kind; el.querySelector('span').textContent = st.text; }
  M.watch(function (s, x) {
    live[s.slug] = x;
    var st = M.stateOf(x);
    paint(status.querySelector('[data-s="' + s.slug + '"] .st'), st);
    var card = cards.querySelector('[data-s="' + s.slug + '"]');
    paint(card.querySelector('.st'), st);
    card.querySelector('.dl').innerHTML = dl(s);
  });

  /* ── footer ── */
  document.getElementById('legal').innerHTML = M.legalHtml();
  document.getElementById('year').textContent = M.year;
  M.reveals();
})();
