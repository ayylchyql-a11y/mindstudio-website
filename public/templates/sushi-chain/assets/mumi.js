/* Mumi Sushi — dati condivisi dalle due versioni del sito.
 * I tre ristoranti sono scritti qui, così la pagina è completa anche se l'API non risponde.
 * Stato «aperto ora» e orari di oggi arrivano dal vivo da /api/store/status di ciascun
 * ristorante (la stessa fonte di ordina.mumisushi.it e dei siti d'ordine). */
(function () {
  'use strict';
  var API = 'https://api-production-d6a9.up.railway.app/api';
  var TZ = 'Europe/Rome';
  var ORDER = 'https://ordina.mumisushi.it/';

  var STORES = [
    { slug: 'vimercate', name: 'Vimercate', city: 'Vimercate', prov: 'MB', host: 'vimercate.mumisushi.it', hue: 154, color: '#2a8a60',
      address: 'Piazzale Marconi 12', cap: '20871 Vimercate (MB)', phone: '392 416 6908',
      legal: { name: 'Mumi Vim S.R.L.', vat: '11610680966' } },
    { slug: 'cernusco', name: 'Cernusco', city: 'Cernusco sul Naviglio', prov: 'MI', host: 'cernusco.mumisushi.it', hue: 5, color: '#c8473a',
      address: 'Via Pontida 13', cap: '20063 Cernusco sul Naviglio (MI)', phone: '366 373 9346',
      legal: { name: 'Zhou Guangxu', vat: '12192460967' } },
    { slug: 'saronno', name: 'Saronno', city: 'Saronno', prov: 'VA', host: 'saronno.mumisushi.it', hue: 222, color: '#3d5fb0',
      address: 'Via Solferino 1', cap: '21047 Saronno (VA)', phone: '344 689 8916',
      legal: { name: 'Mumi Sushi Poke di Ahmad Shabeer', vat: '13887300963' } },
  ];

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tel(p) { return 'tel:+39' + p.replace(/\D/g, ''); }
  function maps(s) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Mumi Sushi ' + s.address + ', ' + s.cap); }
  function orderUrl(s) { return 'https://' + s.host + '/'; }

  function romeParts(d) {
    var p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return { day: p.weekday.toLowerCase().slice(0, 3), ymd: p.year + p.month + p.day, hm: p.hour + ':' + p.minute };
  }
  /** oggi: "11:00–14:30 · 18:00–22:30" | "closed" | null (non si sa) */
  function todayHours(x) {
    var oh = x && x.openingHours;
    if (!oh || !oh.length) return null;
    var d = romeParts(new Date()).day;
    var row = oh.filter(function (r) { return r.day === d; })[0];
    if (!row) return null;
    if (!row.open || !row.shifts || !row.shifts.length) return 'closed';
    return row.shifts.map(function (s) { return s.start + '–' + s.end; }).join(' · ');
  }
  function reopenText(iso) {
    var at = new Date(iso); if (isNaN(at)) return null;
    var now = new Date(), a = romeParts(at), n = romeParts(now), t = romeParts(new Date(now.getTime() + 864e5));
    if (a.ymd === n.ymd) return 'Apre oggi alle ' + a.hm;
    if (a.ymd === t.ymd) return 'Apre domani alle ' + a.hm;
    return 'Apre ' + new Intl.DateTimeFormat('it-IT', { timeZone: TZ, weekday: 'long' }).format(at) + ' alle ' + a.hm;
  }
  /** { kind: 'open' | 'soon' | 'shut' | 'unknown', text } */
  function stateOf(x) {
    if (!x) return { kind: 'unknown', text: 'Orari sul sito d’ordine' };
    if (x.isOpen !== false && x.openNow && x.acceptingOrders !== false) return { kind: 'open', text: 'Aperto ora' };
    if (x.openNow && x.acceptingOrders === false) return { kind: 'soon', text: 'Ordini in pausa' };
    if (x.nextOpenAt) return { kind: 'soon', text: reopenText(x.nextOpenAt) || 'Chiuso ora' };
    return { kind: 'shut', text: 'Chiuso' };
  }

  /** Chiede lo stato di tutti e tre; cb(store, status|null) per ognuno appena arriva.
   *  Si ripete ogni 2 minuti e quando si torna sulla scheda. */
  function watch(cb) {
    function load() {
      STORES.forEach(function (s) {
        var ctl = 'AbortController' in window ? new AbortController() : null;
        var t = ctl && setTimeout(function () { ctl.abort(); }, 8000);
        fetch(API + '/store/status', { headers: { 'X-Tenant-Host': s.host }, signal: ctl && ctl.signal })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (x) { if (t) clearTimeout(t); cb(s, x); });
      });
    }
    load();
    setInterval(load, 120000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  }

  /** Righe legali del footer: ogni ristorante è una società diversa */
  function legalHtml(cls) {
    return STORES.map(function (s) {
      return '<li class="' + (cls || '') + '" style="--c:' + s.hue + '"><b>Mumi Sushi ' + esc(s.name) + '</b>' +
        '<span>' + esc(s.legal.name) + ' · P.IVA ' + esc(s.legal.vat) + '</span>' +
        '<span>' + esc(s.address) + ', ' + esc(s.cap) + '</span>' +
        '<a href="' + tel(s.phone) + '">' + esc(s.phone) + '</a></li>';
    }).join('');
  }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** .reveal → .show quando entra nello schermo */
  function reveals() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('show'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  window.Mumi = { STORES: STORES, ORDER: ORDER, esc: esc, tel: tel, maps: maps, orderUrl: orderUrl,
    todayHours: todayHours, stateOf: stateOf, watch: watch, legalHtml: legalHtml, reveals: reveals, reduce: reduce,
    year: new Date().getFullYear() };
})();
