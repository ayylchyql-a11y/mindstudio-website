/* Design 04 · Binario + pannello.
   The 72px rail holds one icon per module; the 240px panel next to it lists
   that module's own sections. Switching a module swaps the panel's list;
   picking a section filters the screen (orders by status, menu by category). */
const $ = (s) => document.querySelector(s);
const rail = $('#railnav'), sub = $('#sub'), ptitle = $('#ptitle'), view = $('#view'), title = $('#title'), panel = $('#panel'), scrim = $('#scrim');
rail.innerHTML = Mdesk.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}" title="${n.label}" aria-label="${n.label}">${Mdesk.icon(n.id)}</a>`).join('');
let cur = '';
function go(id) {
  cur = id;
  rail.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id));
  const items = Mdesk.SUB[id] || ['Panoramica', 'Impostazioni'];
  ptitle.textContent = Mdesk.NAV.find((n) => n.id === id).label;
  // the panel's list fades out → is replaced → fades in, so a module switch
  // reads as the panel changing, not the page reloading
  sub.classList.add('swap');
  setTimeout(() => { sub.innerHTML = items.map((s, i) => `<a href="#" data-s="${s}" class="${i === 0 ? 'on' : ''}">${s}</a>`).join(''); sub.classList.remove('swap'); }, 140);
  Mdesk.render(id, view, title);
  closePanel();
}
sub.addEventListener('click', (e) => {
  const a = e.target.closest('a'); if (!a) return; e.preventDefault();
  sub.querySelectorAll('a').forEach((x) => x.classList.toggle('on', x === a));
  const s = a.dataset.s;
  if (cur === 'ordini') Mdesk.filterBoard(view, s === 'Tutti' ? '' : s);
  if (cur === 'menu') Mdesk.filterMenu(view, s === 'Tutti' ? '' : s);
  closePanel();
});
rail.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); history.replaceState(null, '', '#' + a.dataset.id); if (a.dataset.id === cur) return openPanel(); go(a.dataset.id); });
const openPanel = () => { panel.classList.add('open'); scrim.classList.add('show'); };
const closePanel = () => { panel.classList.remove('open'); scrim.classList.remove('show'); };
$('#burger').onclick = () => { document.getElementById('rail').classList.add('open'); openPanel(); };
scrim.onclick = () => { document.getElementById('rail').classList.remove('open'); closePanel(); };
go(Mdesk.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
