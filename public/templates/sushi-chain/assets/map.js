/* Mumi Sushi — piccole mappe stradali dei ristoranti, disegnate su <canvas>.
 * Stesso disegno delle mappe di ordina.mumisushi.it (strade OpenStreetMap entro ~650 m),
 * qui in versione scura per il sito «Sera». Dati: assets/maps.json — © OpenStreetMap contributors (ODbL). */
(function () {
  'use strict';

  var STYLE = {
    land: '#17130f', green: '#1b1f15', water: '#15242d', rail: '#403830', foot: '#251f19',
    casing: '#0e0b09', minor: '#342c25', road: '#463b31', primary: '#5c4830', motorway: '#76592c', mCasing: '#2a1f12',
    roadText: '#b5a899', halo: '#17130f',
  };

  var data = null, waiting = [], cache = {};
  function load(cb) {
    if (data) { cb(data); return; }
    waiting.push(cb);
    if (waiting.length > 1) return;
    fetch('assets/maps.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (j) { data = j || {}; var w = waiting; waiting = []; w.forEach(function (f) { f(data); }); });
  }

  function decode(ways) {
    return ways.map(function (r) {
      var flat = r[2], pts = new Float32Array(flat.length), x = 0, y = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (var i = 0; i < flat.length; i += 2) {
        x += flat[i]; y += flat[i + 1]; pts[i] = x; pts[i + 1] = y;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      return { c: r[0], name: r[1], pts: pts, bb: [x0, y0, x1, y1] };
    });
  }

  function haloText(ctx, text, x, y, color, halo, hw) {
    ctx.lineWidth = hw * 2; ctx.strokeStyle = halo; ctx.lineJoin = 'round'; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }

  /** Disegna la mappa del ristorante `slug` nel canvas; il ristorante sta in (W/2, tipY).
   *  Restituisce false se il canvas non ha dimensioni (nascosto) o mancano i dati. */
  function draw(canvas, slug, o) {
    var W = canvas.clientWidth, H = canvas.clientHeight;
    var raw = data && data[slug];
    if (!W || !H || !raw) return false;
    var ways = cache[slug] || (cache[slug] = decode(raw.ways));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    var ctx = canvas.getContext('2d'); if (!ctx) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var mpp = Math.min(1.6, Math.max(1.0, 420 / W)), s = 1 / mpp;
    var lift = o.lift || 0, cx = 0, cy = -lift * mpp;
    var X = function (m) { return W / 2 + (m - cx) * s; }, Y = function (m) { return H / 2 + (m - cy) * s; };
    var wx0 = cx - (W / 2 + 40) / s, wx1 = cx + (W / 2 + 40) / s, wy0 = cy - (H / 2 + 40) / s, wy1 = cy + (H / 2 + 40) / s;
    var vis = function (w) { return w.bb[2] >= wx0 && w.bb[0] <= wx1 && w.bb[3] >= wy0 && w.bb[1] <= wy1; };
    var pathOf = function (cls, close) {
      var p = new Path2D();
      ways.forEach(function (w) {
        if (w.c !== cls || !vis(w)) return;
        var a = w.pts; p.moveTo(X(a[0]), Y(a[1]));
        for (var i = 2; i < a.length; i += 2) p.lineTo(X(a[i]), Y(a[i + 1]));
        if (close) p.closePath();
      });
      return p;
    };
    var f = 3 / mpp;

    ctx.fillStyle = STYLE.land; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = STYLE.green; ctx.fill(pathOf('g', true));
    ctx.fillStyle = STYLE.water; ctx.fill(pathOf('a', true));
    ctx.strokeStyle = STYLE.water; ctx.lineWidth = Math.max(2, 10 * s); ctx.stroke(pathOf('v', false));
    ctx.strokeStyle = STYLE.rail; ctx.lineWidth = Math.max(1, f * 0.7); ctx.setLineDash([4, 3]); ctx.stroke(pathOf('x', false)); ctx.setLineDash([]);
    ctx.strokeStyle = STYLE.foot; ctx.lineWidth = Math.max(0.6, f * 0.5); ctx.stroke(pathOf('w', false));
    var minor = pathOf('r', false);
    ctx.strokeStyle = STYLE.casing; ctx.lineWidth = f * 1.5 + 1.4; ctx.stroke(minor);
    ctx.strokeStyle = STYLE.minor; ctx.lineWidth = f * 1.5; ctx.stroke(minor);
    var major = [['t', 2.1], ['s', 2.6], ['p', 3.1], ['m', 3.6]].map(function (x) { return [x[0], x[1] * f, pathOf(x[0], false)]; });
    major.forEach(function (m) { ctx.strokeStyle = m[0] === 'm' ? STYLE.mCasing : STYLE.casing; ctx.lineWidth = m[1] + 1.8; ctx.stroke(m[2]); });
    major.forEach(function (m) { ctx.strokeStyle = m[0] === 'm' ? STYLE.motorway : m[0] === 'p' ? STYLE.primary : STYLE.road; ctx.lineWidth = m[1]; ctx.stroke(m[2]); });

    // nomi delle vie: senza sovrapporsi tra loro, al pin e alle etichette negli angoli
    var boxes = (o.keepOut || []).slice();
    var hits = function (b) {
      if (b[0] < 0 || b[1] < 0 || b[2] > W || b[3] > H) return true;
      return boxes.some(function (q) { return b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]; });
    };
    var done = {}, rank = { p: 0, s: 1, t: 2, r: 3 };
    ctx.font = '500 10.5px ' + (o.font || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ways.filter(function (w) { return w.name && w.c in rank && vis(w); })
      .sort(function (a, b) { return rank[a.c] - rank[b.c]; })
      .forEach(function (w) {
        if (done[w.name]) return;
        var a = w.pts, tw = ctx.measureText(w.name).width, cands = [];
        for (var i = 0; i + 3 < a.length; i += 2) {
          var x0 = X(a[i]), y0 = Y(a[i + 1]), x1 = X(a[i + 2]), y1 = Y(a[i + 3]);
          var l = Math.hypot(x1 - x0, y1 - y0); if (l < tw + 14) continue;
          [0.5, 0.3, 0.7].forEach(function (t) { cands.push([l, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, Math.atan2(y1 - y0, x1 - x0)]); });
        }
        cands.sort(function (p, q) { return q[0] - p[0]; });
        for (var k = 0; k < cands.length; k++) {
          var mx = cands[k][1], my = cands[k][2], ang = cands[k][3];
          if (mx < 30 || mx > W - 30 || my < 14 || my > H - 14) continue;
          if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
          var hw = Math.abs(Math.cos(ang)) * tw / 2 + 5, hh = Math.abs(Math.sin(ang)) * tw / 2 + 6;
          var b = [mx - hw, my - hh, mx + hw, my + hh];
          if (hits(b)) continue;
          boxes.push(b); done[w.name] = 1;
          ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); haloText(ctx, w.name, 0, 0, STYLE.roadText, STYLE.halo, 1.8); ctx.restore();
          break;
        }
      });
    return true;
  }

  window.MumiMap = { load: load, draw: draw, ready: function () { return !!data; } };
})();
