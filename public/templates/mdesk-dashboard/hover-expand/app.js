/* Design 05 · Espansione al passaggio.
   The rail rests at 72px and opens to 240 on hover; on touch a tap on the
   burger toggles it. Labels are always in the DOM — they just fade in 80ms
   after the width starts moving, so the text never overlaps the icons. */
const $ = (s) => document.querySelector(s);
const nav = $('#nav'), view = $('#view'), title = $('#title'), side = $('#side'), scrim = $('#scrim');
nav.innerHTML = Mdesk.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}" title="${n.label}">${Mdesk.icon(n.id)}<span class="lbl">${n.label}</span></a>`).join('');
function go(id) { nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === id)); Mdesk.render(id, view, title); close(); }
nav.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); history.replaceState(null, '', '#' + a.dataset.id); go(a.dataset.id); });
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fine) { side.addEventListener('pointerenter', () => side.classList.add('open')); side.addEventListener('pointerleave', () => side.classList.remove('open')); }
const open = () => { side.classList.add('open', 'pinned'); scrim.classList.add('show'); };
const close = () => { side.classList.remove('open', 'pinned'); scrim.classList.remove('show'); };
$('#burger').onclick = open; scrim.onclick = close;
go(Mdesk.NAV.some((n) => '#' + n.id === location.hash) ? location.hash.slice(1) : 'panoramica');
