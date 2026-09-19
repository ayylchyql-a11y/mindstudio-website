/* Ming·E — versione "ordina".
   La logica prodotto/opzioni/carrello è il porting 1:1 di quella del sito d'ordinazione
   Mumi Sushi (apps/web: ProductCard.tsx · OptionDialog · ItemNote · flyToCart · burst):
   - prodotto senza opzioni → quickAdd (vola nel carrello + particelle + ✓ per 1 s)
   - prodotto con varianti / gruppi di aggiunte → OptionDialog
       · ≥2 gruppi → percorso guidato ("componibile"): un gruppo per schermata, barra di
         avanzamento, "Scegli N · n scelti", card 2 colonne, gruppo a scelta singola avanza
         da solo dopo 250 ms, Indietro/Avanti, nota solo all'ultimo passo, "Aggiungi · €"
       · altrimenti → foglio unico: varianti radio, gruppi con min/max, "Nessuno" per i
         singoli facoltativi, quantità −/+, nota, "Aggiungi · €" o "Completa le opzioni obbligatorie"
   - riga carrello: nome, variante, aggiunte unite "×N", 📝 nota, −/+ , ✏️ Modifica, ✕
   - la stessa configurazione (chiave = prodotto|variante|aggiunte|nota) si somma in una riga */
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const $ = (s, r = document) => r.querySelector(s);
const euro = (n) => `€ ${n.toFixed(2).replace('.', ',')}`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const say = (t) => { const el = $('[data-toast]'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1600); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ═══════════ Catalogo: Product = { id, name, desc, price, image, thumb, variants[], modifierGroups[] } ═══════════ */
const opt = (name, priceDelta = 0) => ({ id: name, name, priceDelta });
const pokeProduct = (s) => ({
  id: `poke-${s.id}`, cat: 'poke', name: `Componi Poke ${s.id}`, price: s.price,
  desc: `${s.limits.base} base · ${s.limits.ingredienti} ingredienti · ${s.limits.proteine} protein${s.limits.proteine > 1 ? 'e' : 'a'} · ${s.limits.salse} sals${s.limits.salse > 1 ? 'e' : 'a'} · ${s.limits.topping} topping inclusi. Oltre gli inclusi, ogni aggiunta ${euro(EXTRA)}.`,
  image: `../assets/bowl-${s.id === 'Grande' ? 'due' : 'salmone'}.webp`, thumb: `../assets/bowl-${s.id === 'Grande' ? 'due' : 'salmone'}.webp`,
  variants: [],
  // stessa struttura dei gruppi del "Componi Poke" Mumi: inclusi con max, poi gli extra a pagamento
  modifierGroups: [
    { id: 'base', name: 'Base', minSelect: 1, maxSelect: 1, allowRepeat: false, options: GROUPS.base.map((o) => opt(o.name)) },
    { id: 'proteine', name: 'Proteine', minSelect: 1, maxSelect: s.limits.proteine, allowRepeat: true, options: GROUPS.proteine.map((o) => opt(o.name)) },
    { id: 'ingredienti', name: 'Ingredienti', minSelect: 0, maxSelect: s.limits.ingredienti, allowRepeat: false, options: GROUPS.ingredienti.map((o) => opt(o.name)) },
    { id: 'salse', name: 'Salse', minSelect: 0, maxSelect: s.limits.salse, allowRepeat: false, options: GROUPS.salse.map((o) => opt(o.name)) },
    { id: 'topping', name: 'Topping', minSelect: 0, maxSelect: s.limits.topping, allowRepeat: false, options: GROUPS.topping.map((o) => opt(o.name)) },
    { id: 'extra', name: 'Ingredienti extra', minSelect: 0, maxSelect: 5, allowRepeat: true, options: [...GROUPS.proteine, ...GROUPS.ingredienti].map((o) => ({ id: `extra:${o.name}`, name: `${o.name} extra`, priceDelta: EXTRA })) },
    { id: 'salse-extra', name: 'Salse extra', minSelect: 0, maxSelect: 3, allowRepeat: false, options: [...GROUPS.salse, ...GROUPS.topping].map((o) => ({ id: `sextra:${o.name}`, name: `${o.name} extra`, priceDelta: EXTRA })) },
  ],
});
const PRODUCTS = [
  ...SIZES.map(pokeProduct),
  ...TACOS.map((t) => ({ id: `taco-${t.id}`, cat: 'tacos', name: `Taco ${t.name}`, desc: t.desc, price: t.price, image: `../assets/taco-${t.id}.webp`, thumb: `../assets/taco-${t.id}-s.webp`, taco: true, veg: t.veg, variants: [], modifierGroups: [] })),
  ...SUSHI.flatMap((c) => c.items.map((it, k) => ({
    id: `${c.id}-${k}`, cat: c.id, name: it.n.toLowerCase().startsWith(c.name.toLowerCase()) ? it.n : `${c.name} ${it.n}`, desc: it.d, price: it.p[0], thumb: `../assets/cat/${c.id}.webp`, image: `../assets/cat/${c.id}.webp`, veg: it.veg,
    // due prezzi (2 pz / 6 pz …) = varianti con scarto, come i prodotti Mumi
    variants: c.cols ? c.cols.map((col, j) => ({ id: col, name: col, priceDelta: it.p[j] - it.p[0], isDefault: j === 0 })) : [],
    // uramaki: riso bianco o venere è una scelta obbligatoria
    modifierGroups: c.id === 'uramaki' ? [{ id: 'riso', name: 'Riso', minSelect: 1, maxSelect: 1, allowRepeat: false, options: [opt('Riso bianco'), opt('Riso venere')] }] : [],
  }))),
];
const CATS = [
  { id: 'poke', name: 'Poke', thumb: '../assets/bowl-salmone.webp' },
  { id: 'tacos', name: 'Tacos di nori', thumb: '../assets/taco-spicy-salmone-s.webp' },
  ...SUSHI.map((c) => ({ id: c.id, name: c.name, sub: c.sub, thumb: `../assets/cat/${c.id}.webp` })),
];
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const TOP = new Set(['poke-Media', 'taco-spicy-salmone', 'uramaki-0', 'uramaki-4', 'nigiri-0', 'temaki-0', 'special-0', 'tartare-0']);
const hasOptions = (p) => p.variants.length > 0 || p.modifierGroups.length > 0;

/* ═══════════ Categorie + sezioni ═══════════ */
const catHTML = (c) => `<a class="cat" href="#cat-${c.id}" data-cat="${c.id}"><img src="${c.thumb}" alt="" width="36" height="36" loading="lazy" /><span>${c.name}</span></a>`;
$('[data-cats]').innerHTML = CATS.map(catHTML).join('');
$('[data-cats-row]').innerHTML = CATS.map(catHTML).join('');
$$('[data-cat="poke"]').forEach((a) => a.classList.add('on'));

$('[data-sections]').innerHTML = CATS.map((c) => `
  <section class="section" id="cat-${c.id}" data-section="${c.id}">
    <h2>${c.name}${c.sub ? `<small>${c.sub}</small>` : ''}</h2>
    <div class="grid">${PRODUCTS.filter((p) => p.cat === c.id).map((p) => `
      <article class="dish" id="prod-${p.id}" data-dish="${p.id}" data-name="${esc((p.name + ' ' + (p.desc || '')).toLowerCase())}">
        <button type="button" class="dish-thumb-btn" data-detail="${p.id}" aria-label="${esc(p.name)}"><img class="dish-thumb${p.taco ? ' taco' : ''}" src="${p.thumb}" alt="" width="80" height="80" loading="lazy" /></button>
        <div class="dish-body">
          ${TOP.has(p.id) ? '<span class="badge">Più venduto</span>' : p.veg ? '<span class="badge veg">Vegano</span>' : ''}
          <div class="dish-name">${p.name}</div>
          <div class="dish-price">${euro(p.price)}</div>
          <div class="dish-actions"><button class="btn primary sm" type="button" data-add="${p.id}">Aggiungi</button></div>
        </div>
      </article>`).join('')}</div>
  </section>`).join('');

/* ═══════════ Categoria attiva segue lo scroll · ricerca · promo · orari · tema ═══════════ */
{
  const links = $$('[data-cat]');
  const io = new IntersectionObserver((es) => {
    const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!vis) return;
    links.forEach((a) => a.classList.toggle('on', a.dataset.cat === vis.target.dataset.section));
    $('[data-cats-row] .cat.on')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });
  $$('[data-section]').forEach((s) => io.observe(s));
}
$('[data-search]').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase(); let shown = 0;
  $$('[data-dish]').forEach((d) => { const ok = !q || d.dataset.name.includes(q); d.classList.toggle('hide', !ok); if (ok) shown++; });
  $$('[data-section]').forEach((s) => s.hidden = !$$('[data-dish]:not(.hide)', s).length);
  $('[data-empty]').hidden = shown > 0;
});
{
  const slides = $$('[data-slide]'), dots = $$('[data-dot]'); let i = 0, t;
  const go = (n) => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  const arm = () => { clearInterval(t); if (!reduce) t = setInterval(() => go(i + 1), 6000); };
  dots.forEach((d) => d.onclick = () => { go(+d.dataset.dot); arm(); });
  arm();
}
{
  const now = new Date(); const m = now.getHours() * 60 + now.getMinutes();
  const open = m >= 11 * 60 + 30 && m < 23 * 60;
  $('[data-status]').classList.toggle('closed', !open);
  $('[data-status-text]').textContent = open ? 'Aperto · chiude alle 23:00' : (m < 11 * 60 + 30 ? 'Al momento siamo chiusi · apriamo alle 11:30' : 'Al momento siamo chiusi · riapriamo domani alle 11:30');
}
$('[data-theme-toggle]').onclick = (e) => { const dark = document.documentElement.classList.toggle('dark'); e.currentTarget.textContent = dark ? '🌙' : '☀️'; try { localStorage.setItem('minge-theme', dark ? 'dark' : 'light'); } catch {} };
try { if (localStorage.getItem('minge-theme') === 'dark') { document.documentElement.classList.add('dark'); $('[data-theme-toggle]').textContent = '🌙'; } } catch {}
$('[data-login]').onclick = () => say('Account in arrivo: per ora ordina su WhatsApp');

/* ═══════════ Effetti: vola nel carrello + particelle (porting di flyToCart / burst) ═══════════ */
const cartIconEl = () => (matchMedia('(max-width: 1023px)').matches && !$('[data-cart-bar]').hidden ? $('[data-cart-bar]') : $('#cart-icon'));
function fly(origin, img) {
  if (reduce) return;
  const target = cartIconEl(); if (!target) return;
  const s = origin.getBoundingClientRect(), t = target.getBoundingClientRect();
  const el = document.createElement('div'); el.className = 'flyer';
  if (img) { const im = document.createElement('img'); im.src = img; im.alt = ''; el.appendChild(im); }
  el.style.transform = `translate(${s.left + s.width / 2}px, ${s.top + s.height / 2}px) scale(1)`;
  document.body.appendChild(el);
  // doppio rAF: prima disegna il punto di partenza, poi cambia destinazione per far partire la transizione
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = `translate(${t.left + t.width / 2}px, ${t.top + t.height / 2}px) scale(.25)`; el.style.opacity = '.2'; }));
  setTimeout(() => { el.remove(); target.classList.remove('bounce'); void target.offsetWidth; target.classList.add('bounce'); }, 620);
}
function burst(target) {
  if (reduce) return;
  const r = target.getBoundingClientRect();
  const wrap = document.createElement('div'); wrap.className = 'burst';
  wrap.style.left = `${r.left + r.width / 2}px`; wrap.style.top = `${r.top + r.height / 2}px`;
  wrap.style.setProperty('--burst-c', getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '95 122 60');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('i'); const ang = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5; const dist = 26 + Math.random() * 28;
    p.style.setProperty('--tx', `${Math.cos(ang) * dist}px`); p.style.setProperty('--ty', `${Math.sin(ang) * dist}px`); p.style.animationDelay = `${Math.random() * 40}ms`;
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap); setTimeout(() => wrap.remove(), 750);
}

/* ═══════════ Carrello (porting di useCart: righe per chiave, inc/dec/remove/setNote/updateItem) ═══════════ */
let mode = 'Asporto';
const items = []; // { key, productId, name, variantId, variantName, modifiers:[{id,name}], unitPrice, notes, quantity }
const lineKey = (productId, variantId, modIds, notes) => [productId, variantId || '', [...modIds].sort().join('+'), notes || ''].join('|');
function addLine(item, qty = 1) { const same = items.find((x) => x.key === item.key); if (same) same.quantity += qty; else items.push({ ...item, quantity: qty }); render(); }
function updateItem(oldKey, item, qty) {
  const i = items.findIndex((x) => x.key === oldKey); if (i < 0) return addLine(item, qty);
  const dup = items.findIndex((x, k) => x.key === item.key && k !== i);
  if (dup >= 0) { items[dup].quantity += qty; items.splice(i, 1); } else items[i] = { ...item, quantity: qty };
  render();
}
const inc = (key) => { const x = items.find((x) => x.key === key); if (x) x.quantity++; render(); };
const dec = (key) => { const i = items.findIndex((x) => x.key === key); if (i >= 0 && --items[i].quantity <= 0) items.splice(i, 1); render(); };
const remove = (key) => { const i = items.findIndex((x) => x.key === key); if (i >= 0) items.splice(i, 1); render(); };
function setLineNote(key, notes) {
  const x = items.find((x) => x.key === key); if (!x) return;
  const modIds = x.modifiers.map((m) => m.id); const nk = lineKey(x.productId, x.variantId, modIds, notes.trim() || undefined);
  updateItem(key, { ...x, key: nk, notes: notes.trim() || undefined }, x.quantity);
}
const total = () => items.reduce((s, x) => s + x.unitPrice * x.quantity, 0);
const modsLabel = (mods) => { const seen = new Map(); for (const m of mods) { const e = seen.get(m.id); if (e) e.n++; else seen.set(m.id, { name: m.name, n: 1 }); } return [...seen.values()].map((e) => (e.n > 1 ? `${e.name} ×${e.n}` : e.name)).join(', '); };

const cartCol = $('.cart-col'), scrim = $('[data-scrim]');
const openCart = () => { cartCol.classList.add('open'); scrim.classList.add('show'); };
const closeCart = () => { cartCol.classList.remove('open'); scrim.classList.remove('show'); };
$$('[data-open-cart]').forEach((b) => b.onclick = () => { if (matchMedia('(max-width: 1023px)').matches) openCart(); else $('[data-cart]').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
scrim.onclick = closeCart;
$$('[data-mode]').forEach((b) => b.onclick = () => { mode = b.dataset.mode; $$('[data-mode]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); render(); });

function whatsapp() {
  const lines = items.map((x) => `• ${x.quantity > 1 ? x.quantity + '× ' : ''}${x.name}${x.variantName ? ` · ${x.variantName}` : ''}${x.modifiers.length ? ` (${modsLabel(x.modifiers)})` : ''}${x.notes ? ` — nota: ${x.notes}` : ''} — ${euro(x.unitPrice * x.quantity)}`);
  const text = `Ciao Ming·E! Vorrei ordinare — ${mode.toUpperCase()}\n${lines.join('\n')}\nTotale: ${euro(total())}\n\nNome: \n${mode === 'Consegna' ? 'Indirizzo: \n' : 'Orario di ritiro: \n'}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
function render() {
  const n = items.reduce((s, x) => s + x.quantity, 0), tot = total();
  const badge = $('[data-cart-count]'); badge.textContent = n; badge.hidden = !n;
  $('[data-cart-count-2]').textContent = n; $('[data-cart-total-2]').textContent = euro(tot); $('[data-cart-bar]').hidden = !n;
  $('[data-cart-total]').textContent = euro(tot); $('[data-cart-foot]').hidden = !n;
  const go = $('[data-checkout]'); go.href = n ? whatsapp() : '#'; go.setAttribute('aria-disabled', !n);
  $('[data-cart-items]').innerHTML = n ? items.map((x) => `
    <div class="line">
      <div class="line-top"><strong>${esc(x.name)}</strong><span>${euro(x.unitPrice * x.quantity)}</span></div>
      ${x.variantName ? `<div class="line-sub">${esc(x.variantName)}</div>` : ''}
      ${x.modifiers.length ? `<div class="line-sub">${esc(modsLabel(x.modifiers))}</div>` : ''}
      ${x.notes ? `<div class="line-note">📝 ${esc(x.notes)}</div>` : ''}
      <div class="line-tools">
        <button type="button" data-dec="${esc(x.key)}" aria-label="Meno">−</button><span>${x.quantity}</span><button type="button" data-inc="${esc(x.key)}" aria-label="Più">+</button>
        <button type="button" class="tool" data-note="${esc(x.key)}" aria-label="Nota">📝</button>
        ${(x.variantId || x.modifiers.length) ? `<button type="button" class="tool" data-edit="${esc(x.key)}">✏️ Modifica</button>` : ''}
        <button type="button" class="x" data-remove="${esc(x.key)}" aria-label="Rimuovi">✕</button>
      </div>
    </div>`).join('') : '<p class="cart-empty">Il carrello è vuoto</p>';
  $$('[data-inc]').forEach((b) => b.onclick = () => inc(b.dataset.inc));
  $$('[data-dec]').forEach((b) => b.onclick = () => dec(b.dataset.dec));
  $$('[data-remove]').forEach((b) => b.onclick = () => remove(b.dataset.remove));
  $$('[data-note]').forEach((b) => b.onclick = () => { const x = items.find((x) => x.key === b.dataset.note); openNoteDialog(x.notes || '', (v) => setLineNote(x.key, v)); });
  $$('[data-edit]').forEach((b) => b.onclick = () => { const x = items.find((x) => x.key === b.dataset.edit); openOptionDialog(byId(x.productId), { variantId: x.variantId, modIds: x.modifiers.map((m) => m.id), qty: x.quantity, notes: x.notes }, x.key); });
}

/* ═══════════ Aggiungi: quickAdd o OptionDialog (porting di ProductCard) ═══════════ */
function quickAdd(p, btn) {
  addLine({ key: p.id, productId: p.id, name: p.name, variantId: undefined, variantName: undefined, modifiers: [], unitPrice: p.price, notes: undefined });
  fly(btn, p.thumb); burst(btn);
  btn.classList.add('added'); btn.textContent = '✓ Aggiungi'; setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'Aggiungi'; }, 1000);
}
$$('[data-add]').forEach((b) => b.onclick = () => { const p = byId(b.dataset.add); hasOptions(p) ? openOptionDialog(p) : quickAdd(p, b); });
$$('[data-detail]').forEach((b) => b.onclick = () => openDetailDialog(byId(b.dataset.detail)));

/* ── Foglio generico (dialog) ── */
const dlg = $('[data-dialog]');
function openSheet(html, cls = '') { dlg.className = `sheet ${cls}`; dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); }
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

/* ── Dettaglio prodotto (foto grande + descrizione), come ProductDetailDialog ── */
function openDetailDialog(p) {
  openSheet(`
    <div class="sheet-scroll">
      <img class="detail-img${p.taco ? ' taco' : ''}" src="${p.image}" alt="${esc(p.name)}" />
      <div class="detail-body">
        ${TOP.has(p.id) ? '<span class="badge">Più venduto</span>' : ''}
        <div class="detail-head"><h3>${esc(p.name)}</h3><span>${euro(p.price)}</span></div>
        ${p.desc ? `<p class="detail-desc">${esc(p.desc)}</p>` : ''}
      </div>
    </div>
    <div class="sheet-foot col">
      <button class="btn primary wide" type="button" data-detail-add>${hasOptions(p) ? 'Aggiungi' : `Aggiungi · ${euro(p.price)}`}</button>
      <button class="link-x" type="button" data-x>✕</button>
    </div>`, 'detail');
  $('[data-x]', dlg).onclick = () => dlg.close();
  $('[data-detail-add]', dlg).onclick = (e) => { if (hasOptions(p)) openOptionDialog(p); else { quickAdd(p, e.currentTarget); dlg.close(); } };
}

/* ── Nota per la cucina (porting di NoteField): chip rapide + testo libero, max 60 ── */
const NOTE_MAX = 60;
const NOTE_CHIPS = ['senza cipolla', 'poco piccante', 'senza wasabi', 'senza salsa'];
const noteSplit = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);
function noteFieldHTML(value) {
  const parts = noteSplit(value);
  return `<div class="note-field" data-note-field>
    <div class="note-head"><span>📝 Nota per la cucina</span><span data-note-count>${value.length}/${NOTE_MAX}</span></div>
    <div class="note-chips">${NOTE_CHIPS.map((c) => `<button type="button" class="note-chip${parts.includes(c) ? ' on' : ''}" data-chip="${c}">${c}</button>`).join('')}</div>
    <input class="note-input" data-note-input placeholder="es. senza cipolla, salsa a parte" maxlength="${NOTE_MAX}" value="${esc(value)}" />
  </div>`;
}
function bindNoteField(root, get, set) {
  const paint = () => { const v = get(); const parts = noteSplit(v); $$('[data-chip]', root).forEach((b) => b.classList.toggle('on', parts.includes(b.dataset.chip))); $('[data-note-input]', root).value = v; $('[data-note-count]', root).textContent = `${v.length}/${NOTE_MAX}`; };
  $$('[data-chip]', root).forEach((b) => b.onclick = () => { const parts = noteSplit(get()); const c = b.dataset.chip; set((parts.includes(c) ? parts.filter((p) => p !== c) : [...parts, c]).join(', ').slice(0, NOTE_MAX)); paint(); });
  $('[data-note-input]', root).oninput = (e) => { set(e.target.value.replace(/[\r\n\t]/g, ' ').slice(0, NOTE_MAX)); $('[data-note-count]', root).textContent = `${get().length}/${NOTE_MAX}`; $$('[data-chip]', root).forEach((b) => b.classList.toggle('on', noteSplit(get()).includes(b.dataset.chip))); };
}
function openNoteDialog(initial, onSave) {
  let v = initial;
  openSheet(`<div class="sheet-scroll pad"><h3 class="sheet-title">Nota</h3>${noteFieldHTML(v)}</div>
    <div class="sheet-foot"><button class="btn ghost" type="button" data-x>Annulla</button><button class="btn primary grow1" type="button" data-save>Salva</button></div>`, 'small');
  bindNoteField(dlg, () => v, (nv) => { v = nv; });
  $('[data-x]', dlg).onclick = () => dlg.close();
  $('[data-save]', dlg).onclick = () => { onSave(v); dlg.close(); };
}

/* ── OptionDialog: porting fedele (percorso guidato con ≥2 gruppi, altrimenti foglio unico) ── */
function openOptionDialog(product, initial, editKey) {
  const groups = product.modifierGroups;
  let variantId = initial?.variantId ?? product.variants.find((v) => v.isDefault)?.id ?? product.variants[0]?.id;
  let modIds = [...(initial?.modIds ?? [])];
  let qty = initial?.qty ?? 1;
  let note = initial?.notes ?? '';
  let stepIdx = 0;
  let advTimer = null;
  const allOpts = groups.flatMap((g) => g.options);
  const findOpt = (id) => allOpts.find((o) => o.id === id);
  const variant = () => product.variants.find((v) => v.id === variantId);
  const countIn = (g) => modIds.filter((id) => g.options.some((o) => o.id === id)).length;
  const countOf = (id) => modIds.filter((x) => x === id).length;
  const canAdd = () => groups.every((g) => countIn(g) >= g.minSelect);
  const unitPrice = () => product.price + (variant()?.priceDelta || 0) + modIds.reduce((s, id) => s + (findOpt(id)?.priceDelta || 0), 0);
  const priceTag = (delta) => (delta ? `<span class="delta">${delta > 0 ? '+' : ''}${euro(delta)}</span>` : '');
  const rangeLabel = (g) => (g.minSelect === (g.maxSelect ?? -1) ? `${g.minSelect}` : g.maxSelect == null ? `≥${g.minSelect}` : `${g.minSelect}-${g.maxSelect}`);

  // gruppo singolo: pulisce il gruppo e mette id (null = «nessuno»)
  const setGroupRadio = (g, id) => { modIds = modIds.filter((x) => !g.options.some((o) => o.id === x)); if (id) modIds.push(id); };
  const toggleMod = (g, id, checked) => { if (!checked) { modIds = modIds.filter((x) => x !== id); return; } if (g.maxSelect != null && countIn(g) >= g.maxSelect) return; modIds.push(id); };
  const incMod = (g, id) => { if (g.maxSelect != null && countIn(g) >= g.maxSelect) return; modIds.push(id); };
  const decMod = (id) => { const i = modIds.lastIndexOf(id); if (i >= 0) modIds.splice(i, 1); };

  const steps = [...(product.variants.length ? [{ kind: 'variant' }] : []), ...groups.map((g) => ({ kind: 'group', group: g }))];
  const useWizard = groups.length >= 2;

  // il gruppo a scelta singola (max 1, non ripetibile) avanza da solo 250 ms dopo la scelta — mai all'ultimo passo, mai quando si deseleziona
  function autoAdvance(g) {
    if (g && !(g.maxSelect === 1 && !g.allowRepeat)) return;
    clearTimeout(advTimer);
    advTimer = setTimeout(() => { if (stepIdx < steps.length - 1) { stepIdx++; paint(); } }, 250);
  }

  function confirm(btn) {
    const notes = note.trim() || undefined;
    const v = variant();
    const item = { key: lineKey(product.id, variantId, modIds, notes), productId: product.id, name: product.name, variantId, variantName: v?.name, modifiers: modIds.map((id) => ({ id, name: findOpt(id)?.name || id })), unitPrice: unitPrice(), notes };
    if (editKey) updateItem(editKey, item, qty);
    else { addLine(item, qty); fly(btn, product.thumb); burst(btn); }
    dlg.close();
  }

  function paint() {
    if (useWizard) {
      const step = steps[stepIdx], isLast = stepIdx === steps.length - 1;
      const stepValid = step.kind === 'variant' ? !!variantId : countIn(step.group) >= step.group.minSelect;
      let body;
      if (step.kind === 'variant') {
        body = `<h2>Quantità</h2><p class="muted">Scegli 1 · ${variantId ? 1 : 0} scelti</p><div class="opt-grid">${product.variants.map((v) => `<button type="button" class="opt${variantId === v.id ? ' on' : ''}" data-var="${esc(v.id)}"><span>${esc(v.name)}</span>${priceTag(v.priceDelta)}</button>`).join('')}</div>`;
      } else {
        const g = step.group, single = g.maxSelect === 1, repeat = !single && !!g.allowRepeat, sel = countIn(g), groupFull = g.maxSelect != null && sel >= g.maxSelect;
        body = `<h2>${esc(g.name)}</h2><p class="muted">Scegli ${rangeLabel(g)} · ${sel} scelti</p><div class="opt-grid">${g.options.map((m) => {
          const c = countOf(m.id);
          if (repeat) return `<div class="opt${c > 0 ? ' on' : ''}"><span class="grow1">${esc(m.name)} ${priceTag(m.priceDelta)}</span><span class="stepper"><button type="button" data-dec-mod="${esc(m.id)}" ${c === 0 ? 'disabled' : ''} aria-label="−">−</button><b>${c}</b><button type="button" data-inc-mod="${esc(m.id)}" ${groupFull ? 'disabled' : ''} aria-label="+">+</button></span></div>`;
          const on = modIds.includes(m.id), atMax = !single && g.maxSelect != null && sel >= g.maxSelect && !on;
          return `<button type="button" class="opt${on ? ' on' : ''}${atMax ? ' dim' : ''}" ${atMax ? 'disabled' : ''} data-opt="${esc(m.id)}"><span>${esc(m.name)}</span>${priceTag(m.priceDelta)}</button>`;
        }).join('')}</div>`;
      }
      openSheet(`
        <div class="sheet-head"><div><h3>${esc(product.name)}</h3><span class="live-price">${euro(unitPrice())}</span></div><button class="round-x" type="button" aria-label="Chiudi" data-x>✕</button></div>
        <div class="progress">${steps.map((_, i) => `<i class="${i <= stepIdx ? 'on' : ''}"></i>`).join('')}</div>
        <div class="sheet-scroll pad">${body}${isLast ? `<div class="mt">${noteFieldHTML(note)}</div>` : ''}</div>
        <div class="sheet-foot">
          ${stepIdx > 0 ? '<button class="btn ghost" type="button" data-back>← Indietro</button>' : ''}
          ${isLast ? `<button class="btn primary grow1" type="button" data-confirm ${canAdd() ? '' : 'disabled'}>${editKey ? 'Salva modifiche' : `Aggiungi · ${euro(unitPrice())}`}</button>`
                   : `<button class="btn primary grow1" type="button" data-next ${stepValid ? '' : 'disabled'}>Avanti →</button>`}
        </div>`, 'wizard');
      $$('[data-var]', dlg).forEach((b) => b.onclick = () => { variantId = b.dataset.var; paint(); autoAdvance(null); });
      if (step.kind === 'group') {
        const g = step.group, single = g.maxSelect === 1;
        $$('[data-opt]', dlg).forEach((b) => b.onclick = () => {
          const id = b.dataset.opt, on = modIds.includes(id);
          if (!single) { toggleMod(g, id, !on); paint(); return; }
          const next = on && g.minSelect === 0 ? null : id;
          setGroupRadio(g, next); paint();
          if (next) autoAdvance(g);
        });
        $$('[data-inc-mod]', dlg).forEach((b) => b.onclick = () => { incMod(g, b.dataset.incMod); paint(); });
        $$('[data-dec-mod]', dlg).forEach((b) => b.onclick = () => { decMod(b.dataset.decMod); paint(); });
      }
      if (isLast) bindNoteField(dlg, () => note, (v) => { note = v; });
      $('[data-x]', dlg).onclick = () => dlg.close();
      $('[data-back]', dlg)?.addEventListener('click', () => { stepIdx--; paint(); });
      $('[data-next]', dlg)?.addEventListener('click', () => { stepIdx++; paint(); });
      $('[data-confirm]', dlg)?.addEventListener('click', (e) => confirm(e.currentTarget));
      return;
    }

    // ── foglio unico ──
    openSheet(`
      <div class="sheet-scroll pad">
        <h3 class="sheet-title">${esc(product.name)}</h3>
        ${product.variants.length ? `<fieldset class="fs"><legend>Quantità</legend>${product.variants.map((v) => `<label class="row-opt"><input type="radio" name="variant" value="${esc(v.id)}" ${variantId === v.id ? 'checked' : ''} />${esc(v.name)}${v.priceDelta ? `<span class="muted">(+${euro(v.priceDelta)})</span>` : ''}</label>`).join('')}</fieldset>` : ''}
        ${groups.map((g) => {
          const single = g.maxSelect === 1, repeat = !single && !!g.allowRepeat, sel = countIn(g), req = g.minSelect >= 1, groupFull = g.maxSelect != null && sel >= g.maxSelect;
          return `<fieldset class="fs${req && sel < g.minSelect ? ' need' : ''}"><legend>${esc(g.name)}${req ? '<span class="req"> · Obbligatorio</span>' : ''}${g.maxSelect != null && g.maxSelect > 1 ? ` · max ${g.maxSelect}` : ''}</legend>
            ${single && g.minSelect === 0 ? `<label class="row-opt"><input type="radio" name="g-${esc(g.id)}" data-none="${esc(g.id)}" ${sel === 0 ? 'checked' : ''} />Nessuno</label>` : ''}
            ${g.options.map((m) => {
              if (repeat) { const c = countOf(m.id); return `<div class="row-opt"><span class="grow1">${esc(m.name)} ${m.priceDelta ? `<span class="muted">(+${euro(m.priceDelta)})</span>` : ''}</span><span class="stepper"><button type="button" data-dec-mod="${esc(m.id)}" ${c === 0 ? 'disabled' : ''}>−</button><b>${c}</b><button type="button" data-inc-mod="${esc(m.id)}" ${groupFull ? 'disabled' : ''}>+</button></span></div>`; }
              const on = modIds.includes(m.id), atMax = !single && g.maxSelect != null && sel >= g.maxSelect && !on;
              return `<label class="row-opt${atMax ? ' dim' : ''}"><input type="${single ? 'radio' : 'checkbox'}" ${single ? `name="g-${esc(g.id)}"` : ''} data-mod="${esc(m.id)}" data-g="${esc(g.id)}" ${on ? 'checked' : ''} ${atMax ? 'disabled' : ''} />${esc(m.name)}${m.priceDelta ? `<span class="muted">(+${euro(m.priceDelta)})</span>` : ''}</label>`;
            }).join('')}
          </fieldset>`; }).join('')}
        <div class="fs">${noteFieldHTML(note)}</div>
      </div>
      <div class="sheet-foot col">
        <div class="qty-row"><button type="button" data-qdec aria-label="Meno">−</button><span>${qty}</span><button type="button" data-qinc aria-label="Più">+</button></div>
        <button class="btn primary wide" type="button" data-confirm ${canAdd() ? '' : 'disabled'}>${!canAdd() ? 'Completa le opzioni obbligatorie' : editKey ? 'Salva modifiche' : `Aggiungi · ${euro(unitPrice() * qty)}`}</button>
        <button class="link-x" type="button" data-x>✕</button>
      </div>`, 'simple');
    $$('input[name="variant"]', dlg).forEach((r) => r.onchange = () => { variantId = r.value; paint(); });
    $$('[data-none]', dlg).forEach((r) => r.onchange = () => { setGroupRadio(groups.find((g) => g.id === r.dataset.none), null); paint(); });
    $$('[data-mod]', dlg).forEach((r) => r.onchange = () => { const g = groups.find((g) => g.id === r.dataset.g); if (g.maxSelect === 1) setGroupRadio(g, r.dataset.mod); else toggleMod(g, r.dataset.mod, r.checked); paint(); });
    $$('[data-inc-mod]', dlg).forEach((b) => b.onclick = () => { const g = groups.find((g) => g.options.some((o) => o.id === b.dataset.incMod)); incMod(g, b.dataset.incMod); paint(); });
    $$('[data-dec-mod]', dlg).forEach((b) => b.onclick = () => { decMod(b.dataset.decMod); paint(); });
    bindNoteField(dlg, () => note, (v) => { note = v; });
    $('[data-qdec]', dlg).onclick = () => { qty = Math.max(1, qty - 1); paint(); };
    $('[data-qinc]', dlg).onclick = () => { qty++; paint(); };
    $('[data-x]', dlg).onclick = () => dlg.close();
    $('[data-confirm]', dlg).onclick = (e) => confirm(e.currentTarget);
  }
  paint();
}

render();
