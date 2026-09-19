/* Design 06 · Navigazione a gruppi — the list is grouped by area (Sala / Gestione / Sistema); the user area stays pinned at the bottom. */
const $ = (s) => document.querySelector(s);
const nav = $("#nav"), view = $("#view"), title = $("#title"), side = $("#side"), scrim = $("#scrim");
nav.innerHTML = true
  ? Object.entries(Mdesk.GROUPS).map(([g, label]) => `<div class="group"><span class="glabel">${label}</span>${Mdesk.NAV.filter((n) => n.group === g).map((n) => `<a href="#${n.id}" data-id="${n.id}">${Mdesk.icon(n.id)}${n.label}</a>`).join("")}</div>`).join("")
  : Mdesk.NAV.map((n) => `<a href="#${n.id}" data-id="${n.id}">${Mdesk.icon(n.id)}${n.label}</a>`).join("");
function go(id) { nav.querySelectorAll("a").forEach((a) => a.classList.toggle("on", a.dataset.id === id)); Mdesk.render(id, view, title); close(); }
nav.addEventListener("click", (e) => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); history.replaceState(null, "", "#" + a.dataset.id); go(a.dataset.id); });
const open = () => { side.classList.add("open"); scrim.classList.add("show"); };
const close = () => { side.classList.remove("open"); scrim.classList.remove("show"); };
$("#burger").onclick = open; scrim.onclick = close;
go(Mdesk.NAV.some((n) => "#" + n.id === location.hash) ? location.hash.slice(1) : "panoramica");
