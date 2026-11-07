/*
 * Spatial glass dashboard — visionOS-style finance window in a room.
 *
 * The one idea worth stealing is the page switch:
 *   0 ms     old content is dropped at once; the glass panel itself never moves
 *   40 ms    the new page's cards fade in as EMPTY glass, staggered 65 ms each (skeleton)
 *   280 ms   card contents fade in (280 ms) and every value grows from zero together:
 *            numbers count with ease-out-quart over 1100 ms, bars/rings/progress over
 *            900–1000 ms, lines draw over 1000 ms, the donut sweeps over 700 ms
 *   ≈ 1.3 s  the page is settled; only then do cards get the 5 px hover lift
 * Timings were measured frame by frame from the reference recording (15 fps).
 */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── icons (lucide-style, 24 grid) ───────────────────────────
  const I = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9v12h13V9"/><path d="M10 21v-6h4v6"/>',
    sparkles: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V6"/><path d="M5 12v6c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v-6"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    pie: '<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5V13.5z"/><path d="M14 3a8 8 0 0 1 7 7h-7z"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10.5h18"/><path d="M6 6l9-3 1.5 3"/><circle cx="16.5" cy="15" r="1.1"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    swap: '<path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/>',
    down: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 19.5h20"/>',
    plane: '<path d="M3 13.5 21 5l-4.5 15-4-6.5z"/><path d="m12.5 13.5 8.5-8.5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    car: '<path d="M5 12l2-5h10l2 5"/><rect x="3" y="12" width="18" height="5.5" rx="2"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M12 8S10.5 3.5 8 4.5 9 8 12 8zM12 8s1.5-4.5 4-3.5S15 8 12 8z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>',
    upr: '<path d="M7 17 17 7M8 7h9v9"/>',
    dnl: '<path d="M17 7 7 17M16 17H7V8"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    goggles: '<rect x="2" y="8" width="20" height="9" rx="4.5"/><path d="M10 13h4"/>',
    home2: '<path d="M4 20V10l8-6 8 6v10z"/><path d="M9 20v-6h6v6"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h3l2.5 12h11l2-8H6.5"/>',
    bolt: '<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    bank: '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
  };
  const ic = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ""}</svg>`;

  // ── fit the 1280 × 760 stage into whatever frame we are in ──
  const fit = () => $("stage").style.setProperty("--s", Math.min(1, (innerWidth - 16) / 1280, (innerHeight - 16) / 760).toFixed(4));
  addEventListener("resize", fit); fit();

  // ── number formats + one rAF loop for every count ───────────
  const grp = (v, d) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const FMT = {
    m2: (v, done, to, el) => (el.dataset.sym || "$") + grp(v, 2),
    m0: (v, done, to, el) => (el.dataset.sym || "$") + grp(Math.round(v), 0),
    k: (v, done, to) => "$" + (done && Number.isInteger(to) ? Math.round(v) : v.toFixed(1)) + "k",
    M: (v) => "$" + v.toFixed(2) + "M",
    p1: (v) => v.toFixed(1) + "%",
    p0: (v) => Math.round(v) + "%",
    int: (v) => grp(Math.round(v), 0),
  };
  const num = (to, fmt, o = {}) =>
    `<span class="n${o.money ? " money" : ""}" data-to="${to}" data-fmt="${fmt}"${o.k ? ` data-k="${o.k}"` : ""}${o.sym ? ` data-sym="${o.sym}"` : ""}>${FMT[fmt](reduce ? to : 0, reduce, to, { dataset: { sym: o.sym } })}</span>`;
  const tweens = new Set();
  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  function tick(now) {
    raf = 0;
    for (const el of tweens) {
      const t = el._t;
      let p = (now - t.start) / t.dur;
      if (p < 0) continue;
      if (p >= 1) { p = 1; tweens.delete(el); }
      const v = t.from + (t.to - t.from) * (1 - Math.pow(1 - p, 4)); // ease-out-quart
      el._v = v;
      el.textContent = FMT[el.dataset.fmt](v, p === 1, t.to, el);
    }
    if (tweens.size) kick();
  }
  function tween(el, to, delay = 0, dur = 1100, from) {
    const f = from ?? el._v ?? 0;
    if (reduce) { el._v = to; el.textContent = FMT[el.dataset.fmt](to, true, to, el); return; }
    el._t = { from: f, to, dur, start: performance.now() + delay };
    tweens.add(el); kick();
  }
  function countAll(root, carry = {}) {
    root.querySelectorAll(".n[data-to]").forEach((el) => {
      const card = el.closest(".card");
      const i = card ? +getComputedStyle(card).getPropertyValue("--i") || 0 : 0;
      const from = el.dataset.k && el.dataset.k in carry ? carry[el.dataset.k] : 0;
      tween(el, +el.dataset.to, i * 30, 1100, from);
    });
  }

  // ── state (everything the controls can change) ──────────────
  const jit = () => 1 + (Math.random() - 0.5) * 0.06; // the original re-rolls its demo data on every visit
  const S = {
    cur: "USD",
    balance: 233041.19,
    saved: 18527.44,
    goals: [
      { name: "New MacBook Pro", icon: "laptop", tint: "#e9e4df", fg: "#6b625b", due: "Jun 2026", saved: 1850, target: 2499 },
      { name: "Trip to Bali", icon: "plane", tint: "#dcebfb", fg: "#3b78c9", due: "Aug 2026", saved: 3200, target: 5000 },
      { name: "Emergency fund", icon: "shield", tint: "#d8f3e4", fg: "#1d9a6c", due: "Dec 2026", saved: 9450, target: 15000 },
      { name: "New car", icon: "car", tint: "#e6e0fb", fg: "#6c55d6", due: "Mar 2027", saved: 6200, target: 24000 },
      { name: "Mum's birthday gift", icon: "gift", tint: "#fbe0ea", fg: "#d0457a", due: "May 2026", saved: 400, target: 500 },
    ],
    auto: [true, true, false],
    range: "month",
    q: "", status: null, checked: new Set(),
    card: 0,
    cards: [
      { kind: "k", name: "Everyday", no: "4821", exp: "08/29", frozen: false, online: true, contactless: true, atm: false, limit: 5500 },
      { kind: "gr", name: "Travel", no: "1937", exp: "02/28", frozen: false, online: true, contactless: false, atm: true, limit: 3000 },
    ],
    txf: "all", drafts: [],
    points: 24860, offers: [false, true, false, false],
    sec: { face: true, twofa: true, alerts: true, priv: false },
    note: { pay: true, goals: true, weekly: false, news: false },
    out: new Set(),
  };
  const RATE = { USD: [1, "$", "#3b6fe0"], EUR: [0.92, "€", "#f2b31d"], GBP: [0.79, "£", "#c8402a"] };
  const SPENT = 1450.2;

  // ── pages ───────────────────────────────────────────────────
  const hd = (t, p, act = "") => `<div class="hd"><div><h1>${t}</h1><p>${p}</p></div>${act ? `<div class="act">${act}</div>` : ""}</div>`;
  const ring = (pct, inner = "") => `<div class="ring"><svg viewBox="0 0 36 36"><circle class="t" cx="18" cy="18" r="15.9155" fill="none" stroke-width="3.4"/><circle class="v" cx="18" cy="18" r="15.9155" fill="none" stroke-width="3.4" pathLength="100" style="--off:${(100 - Math.min(100, pct)).toFixed(2)}"/></svg><div class="c">${inner}</div></div>`;
  const toggle = (on, key, g) => `<button class="toggle${g ? " g" : ""}${on ? " on" : ""}" data-tg="${key}" role="switch" aria-checked="${on}" aria-label="Toggle"></button>`;
  const bars = (vals, labels, accLast, h) => `<div class="bars" style="height:${h}px">${vals.map((v, k) => `<div class="b${accLast && k === vals.length - 1 ? " acc" : ""}" style="--k:${k}"><i style="--h:${v}%"></i>${labels ? `<small>${labels[k]}</small>` : ""}</div>`).join("")}</div>`;
  const chip = (v, neg) => `<span class="chip${neg ? " neg" : ""}">${v > 0 ? "+" : "−"} ${Math.abs(v)}%</span>`;

  function rOverview() {
    const [r, sym] = RATE[S.cur];
    const c0 = S.cards[0];
    const pl = [[16, 20], [24, 17], [22, 11], [19, 18], [24, 14], [16, 25], [13, 17], [8, 10]];
    const rows = [
      ["INV_000076", "Mobile App Purchase", "#3b6fe0", "phone", 25500, "Completed", "17 Apr, 2026 08:45 PM"],
      ["INV_000075", "Hotel Booking", "#1d1b1a", "home2", 32750, "Pending", "15 Apr, 2026 11:30 AM"],
      ["INV_000074", "Flight Ticket Booking", "#ef5a2a", "plane", 40200, "Completed", "15 Apr, 2026 12:00 PM"],
      ["INV_000073", "Grocery Purchase", "#1d9a6c", "cart", 50200, "In Progress", "14 Apr, 2026 06:15 PM"],
      ["INV_000072", "Software License", "#c8402a", "file", 15900, "Completed", "10 Apr, 2026 06:00 AM"],
      ["INV_000071", "Coffee Subscription", "#a2700c", "coffee", 1290, "Completed", "08 Apr, 2026 09:10 AM"],
    ];
    const stCls = { Completed: "ok", Pending: "pend", "In Progress": "ip" };
    const q = S.q.toLowerCase();
    const shown = rows.filter((x) => (!q || (x[0] + x[1]).toLowerCase().includes(q)) && (!S.status || x[5] === S.status));
    return hd("Good morning, Code XR", "Stay on top of your balance, wallets and everything that moved this week.") + `
    <div class="grid ov">
      <section class="card lift bal">
        <div class="row"><span class="lbl">Total Balance</span><span class="sp"></span><button class="cur" data-act="cur"><i class="flag" style="background:${RATE[S.cur][2]}"></i>${S.cur} ${ic("chev")}</button></div>
        <div class="big">${num(+(S.balance * r).toFixed(2), "m2", { money: 1, k: "bal", sym })}</div>
        <div class="row" style="margin-top:5px"><span class="chip">+ 1.3%</span><span class="sub">than last month</span></div>
        <div class="two"><button class="btn-dark" data-act="transfer">${ic("swap")} Transfer</button><button class="btn-lite" data-act="request">${ic("swap")} Request</button></div>
        <div class="wallets"><span class="lbl"><b style="color:var(--ink)">Wallets</b> &nbsp;|&nbsp; Total 3 wallets</span>
          <div class="ws">
            <div class="w"><span class="sub"><i class="flag" style="background:#3b6fe0"></i>USD</span><b class="money">${num(30970.24, "m2", { sym: "$" })}</b><span class="sub">$10k / mo limit</span></div>
            <div class="w"><span class="sub"><i class="flag" style="background:#f2b31d"></i>EUR</span><b class="money">${num(18003.29, "m2", { sym: "€" })}</b><span class="sub">€8k / mo limit</span></div>
            <div class="w"><span class="sub"><i class="flag" style="background:#c8402a"></i>GBP</span><b class="money">${num(12592.0, "m2", { sym: "£" })}</b><span class="sub">£5k / mo limit</span></div>
          </div></div>
      </section>
      <section class="card quad">
        <div class="tile earn"><span class="lbl">Total Earnings</span><span class="dot">${ic("upr")}</span><div class="mid money">${num(Math.round(806 * jit()), "m0")}</div><div class="mini"><span class="chip">+ 7%</span>This month</div></div>
        <div class="tile"><span class="lbl">Total Spending</span><span class="dot">${ic("dnl")}</span><div class="mid money">${num(Math.round(645 * jit()), "m0")}</div><div class="mini"><span class="chip neg">− 5%</span>This month</div></div>
        <div class="tile"><span class="lbl">Total Income</span><span class="dot">${ic("upr")}</span><div class="mid money">${num(Math.round(920 * jit()), "m0")}</div><div class="mini"><span class="chip">+ 1%</span>This month</div></div>
        <div class="tile"><span class="lbl">Total Revenue</span><span class="dot">${ic("zap")}</span><div class="mid money">${num(Math.round(691 * jit()), "m0")}</div><div class="mini"><span class="chip">+ 3%</span>This month</div></div>
      </section>
      <section class="card lift inc">
        <h3>Total Income</h3><span class="sub">Profit is income after spending, loss is what went out</span>
        <div class="pl"><div class="row"><b style="font-size:10.5px">Profit and Loss</b><span class="sp"></span><span class="legend"><span><i style="background:#2fa983"></i>Profit</span><span><i style="background:#1d1b1a"></i>Loss</span></span></div>
          ${`<div class="bars">${pl.map(([p, l], k) => `<div class="b" style="--k:${k}"><i style="--h:${((p + l) / 45) * 100}%;--p:${p};--l:${l}"><span class="p"></span><span class="l"></span></i><small>${"Jan Feb Mar Apr May Jun Jul Aug".split(" ")[k]}</small></div>`).join("")}</div>`}
        </div>
      </section>
      <div class="grid stackL">
      <section class="card lift limit">
        <h3>Monthly Spending Limit</h3>
        <div class="prog" style="margin-top:14px"><i style="--w:${Math.min(100, (SPENT / c0.limit) * 100).toFixed(1)}%"></i></div>
        <div class="row" style="margin-top:8px"><b style="font-size:11px" class="money">$${grp(SPENT, 2)}</b><span class="sub">spent out of</span><span class="sp"></span><b style="font-size:11px">$${grp(c0.limit, 2)}</b></div>
      </section>
      <section class="card lift cards">
        <div class="row"><span class="ico" style="width:24px;height:24px">${ic("card")}</span><h3>My Cards</h3><span class="sp"></span><button class="btn-lite" data-go="manage" style="height:26px">${ic("plus")} Add new</button></div>
        <div class="minicards">${S.cards.slice(0, 2).map((c) => `<div class="mc ${c.kind}"><span class="chip">${c.frozen ? "Frozen" : "Active"}</span><span class="mco"></span><span class="mcn">•••• ${c.no}</span></div>`).join("")}</div>
      </section>
      </div>
      <section class="card act-list">
        <div class="row"><h3>Recent Activities</h3><span class="sp"></span>
          <label class="search">${ic("search")}<input id="q" placeholder="Search" value="${S.q}"></label>
          <button class="btn-lite" data-act="status" style="background:rgba(255,255,255,.45)">${S.status || "Filter"} ${ic("filter")}</button></div>
        <table style="margin-top:12px"><thead><tr><td></td><td>Order ID</td><td>Activity</td><td>Price</td><td>Status</td><td>Date</td></tr></thead>
        <tbody>${shown.map((x) => `<tr><td><span class="cb${S.checked.has(x[0]) ? " on" : ""}" data-cb="${x[0]}">${ic("check")}</span></td><td>${x[0]}</td><td><span class="appi" style="background:${x[2]}">${ic(x[3])}</span>${x[1]}</td><td class="money">$${grp(x[4], 0)}</td><td><span class="st ${stCls[x[5]]}">${x[5]}</span></td><td style="color:var(--mut)">${x[6]}</td></tr>`).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:24px">Nothing matches “${S.q}”</td></tr>`}</tbody></table>
      </section>
    </div>`;
  }

  function rSavings() {
    const contrib = [45, 63, 50, 73, 90, 96];
    const pct = (S.saved / 40000) * 100;
    return hd("Savings &amp; Goals", "Set money aside for the things that matter — every goal moves on its own.", `<button class="btn-dark" data-act="newgoal">${ic("plus")} New goal</button>`) + `
    <div class="grid sv-top">
      <section class="card lift"><div class="saved">
        <div style="display:flex;flex-direction:column">
          <span class="lbl">Total saved</span>
          <div class="big money">${num(+(S.saved * jit()).toFixed(2), "m2", { k: "saved" })}</div>
          <div class="row" style="margin-top:5px"><span class="chip">+ 12%</span><span class="sub">more than last quarter</span></div>
          <div style="margin-top:auto"><div class="prog"><i style="--w:${pct.toFixed(1)}%"></i></div><div class="sub" style="margin-top:7px">${Math.round(pct)}% of $40,000 annual savings goal</div></div>
        </div>
        <div><span class="lbl">Monthly contributions</span>${bars(contrib, "Nov Dec Jan Feb Mar Apr".split(" "), true, 140)}</div>
      </div></section>
      <section class="card lift auto">
        <div class="row"><h3>Auto-save</h3><span class="sp"></span><span class="chip" id="autoN">${S.auto.filter(Boolean).length} on</span></div>
        ${[["refresh", "Round-ups", "Round every card purchase up to the next dollar"], ["zap", "Payday boost", "Move 10% of every salary into your goals automatically"], ["calendar", "Weekly $50", "A small transfer every Monday morning"]]
          .map(([i, t, d], k) => `<div class="item"><span class="ico">${ic(i)}</span><div style="flex:1"><b>${t}</b><span class="sub">${d}</span></div>${toggle(S.auto[k], "auto." + k)}</div>`).join("")}
      </section>
    </div>
    <div class="grid goals">
      ${S.goals.map((g, k) => {
        const p = Math.min(100, (g.saved / g.target) * 100);
        return `<section class="card lift goal" data-goal="${k}">
          <div class="row"><span class="ico" style="background:${g.tint};color:${g.fg};width:26px;height:26px">${ic(g.icon)}</span><span class="sp"></span><span class="tag">${g.due}</span></div>
          ${ring(p, `<b>${num(Math.round(p), "p0", { k: "g" + k })}</b><small>${p >= 100 ? "done" : "saved"}</small>`)}
          <h4>${g.name}</h4><span class="sub money">$${grp(g.saved, 0)} of $${grp(g.target, 0)}</span>
          <button class="btn-lite" data-act="add" data-i="${k}" style="margin-top:10px">${ic("plus")} Add money</button>
        </section>`;
      }).join("")}
      <section class="card dash" data-act="newgoal"><div><div class="pl">${ic("plus")}</div><b style="font-size:11px">New goal</b><div class="sub">Name it, set a date</div></div></section>
    </div>`;
  }

  const RANGES = {
    week: { lbl: "This week", fmt: "k", inc: 98.4, exp: 71.2, net: 27.2, rate: 27.6, ch: [4, 2, 9, 1.2], x: "Mon Tue Wed Thu Fri Sat Sun".split(" "), a: [12, 18, 9, 22, 16, 8, 13], b: [8, 11, 10, 9, 14, 12, 7], max: 25, spent: 48.3, cats: [31, 27, 18, 15, 9] },
    month: { lbl: "This month", fmt: "k", inc: 425, exp: 314, net: 111, rate: 26.1, ch: [9, 8, 14, 2.1], x: ["Apr 1", "Apr 5", "Apr 9", "Apr 13", "Apr 17", "Apr 21", "Apr 25", "Apr 30"], a: [20, 52, 83, 31, 61, 47, 70, 60], b: [20, 31, 45, 52, 46, 40, 45, 32], max: 100, spent: 209.7, cats: [35, 26, 20, 13, 6] },
    year: { lbl: "This year", fmt: "M", inc: 4.87, exp: 3.62, net: 1.25, rate: 25.7, ch: [18, 11, 41, 3.4], x: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "), a: [380, 410, 395, 440, 420, 455, 470, 430, 400, 445, 390, 435], b: [300, 290, 320, 310, 330, 305, 340, 300, 290, 310, 280, 345], max: 500, spent: 2.41, cats: [33, 25, 22, 12, 8] },
  };
  const CATS = [["Travel", "#ef5a2a"], ["Shopping", "#1d1b1a"], ["Software", "#f2b31d"], ["Bills", "#3b6fe0"], ["Food", "#1d9a6c"]];
  function smooth(p) {
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)},${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)},${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
    }
    return d;
  }
  function rReports() {
    const R = RANGES[S.range];
    const W = 600, H = 210, L = 30, B = 22, T = 6;
    const X = (i) => L + (i * (W - L - 6)) / (R.a.length - 1);
    const Y = (v) => T + (1 - v / R.max) * (H - B - T);
    const pa = R.a.map((v, i) => [X(i), Y(v)]), pb = R.b.map((v, i) => [X(i), Y(v)]);
    const unit = R.fmt === "M" ? "k" : "k";
    const yl = [0, 0.25, 0.5, 0.75, 1].map((f) => [Y(R.max * f), f === 0 ? "0" : Math.round(R.max * f) + unit]);
    const xs = R.a.length > 8 ? R.x.filter((_, i) => i % 2 === 0) : R.x;
    const step = R.a.length > 8 ? 2 : 1;
    let acc = 0;
    const segs = R.cats.map((len, k) => { const s = { len: len - 1.2, start: acc, k }; acc += len; return s; });
    const kfmt = R.fmt;
    return hd("Reports", "See where your money comes from and where it goes.", `<div class="seg" id="seg"><i class="knob"></i>${Object.entries(RANGES).map(([k, v]) => `<button data-range="${k}" class="${k === S.range ? "on" : ""}">${v.lbl}</button>`).join("")}</div><button class="btn-dark" data-act="csv">${ic("down")} Export CSV</button>`) + `
    <div class="grid kpis">
      ${[["dnl", "Income", R.inc, R.ch[0], false, "#d8f3e4", "#128153"], ["upr", "Expenses", R.exp, R.ch[1], true, "#fde0dc", "#c8402a"], ["swap", "Net profit", R.net, R.ch[2], false, "#e6e0fb", "#6c55d6"], ["pie", "Savings rate", R.rate, R.ch[3], false, "#dcebfb", "#3b6fe0"]]
        .map(([i, t, v, c, neg, bg, fg], k) => `<section class="card lift"><div class="row"><span class="ico" style="background:${bg};color:${fg};width:26px;height:26px;border-radius:50%">${ic(i)}</span><span class="lbl">${t}</span></div>
        <div class="mid money" style="margin-top:12px">${num(v, k === 3 ? "p1" : kfmt, { k: "kpi" + k })}</div>
        <div class="row" style="margin-top:6px">${k === 3 ? `<span class="sub">of income kept</span>` : `${chip(c, neg)}<span class="sub">vs last period</span>`}</div></section>`).join("")}
    </div>
    <div class="grid rp-mid">
      <section class="card">
        <div class="row"><h3>Income vs expenses</h3><span class="sp"></span><span class="legend"><span><i style="background:#ef5a2a"></i>Income</span><span><i style="background:#1d1b1a"></i>Expenses</span></span></div>
        <span class="sub">Hover the chart to compare any point.</span>
        <div class="chart" id="chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
          <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef5a2a" stop-opacity=".22"/><stop offset="1" stop-color="#ef5a2a" stop-opacity="0"/></linearGradient></defs>
          ${yl.map(([y, t]) => `<line class="grid-l" x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text x="0" y="${y + 3}">${t}</text>`).join("")}
          ${xs.map((t, i) => `<text x="${X(i * step) - 8}" y="${H - 4}">${t}</text>`).join("")}
          <path class="area" d="${smooth(pa)} L${X(R.a.length - 1)},${H - B} L${L},${H - B} Z" fill="url(#ga)"/>
          <path class="line-draw" pathLength="1" d="${smooth(pb)}" fill="none" stroke="#1d1b1a" stroke-width="2.2" stroke-linecap="round"/>
          <path class="line-draw" pathLength="1" d="${smooth(pa)}" fill="none" stroke="#ef5a2a" stroke-width="2.2" stroke-linecap="round"/>
          <line class="guide" id="guide" y1="${T}" y2="${H - B}" x1="0" x2="0"/>
          <circle class="dotp" id="da" r="4" fill="#ef5a2a" stroke="#fff" stroke-width="2"/><circle class="dotp" id="db" r="4" fill="#1d1b1a" stroke="#fff" stroke-width="2"/>
        </svg><div class="tipbox" id="tip"></div></div>
      </section>
      <section class="card spend">
        <h3>Spending by category</h3>
        <div class="donut" id="donut"><svg viewBox="0 0 42 42">${segs.map((s) => `<circle class="s" data-c="${s.k}" cx="21" cy="21" r="15.9155" fill="none" stroke="${CATS[s.k][1]}" stroke-width="5.4" pathLength="100" stroke-dashoffset="${-s.start}" style="--len:${s.len};--dl:${(s.start / 100) * 700 + 150}ms;--dur:${(s.len / 100) * 700}ms"/>`).join("")}</svg>
          <div class="c"><span class="sub">Total spent</span><b class="money">${num(R.spent, kfmt, { k: "spent" })}</b><span class="sub">${R.lbl.replace("This ", "this ")}</span></div></div>
        <div class="cats" id="cats">${CATS.map(([n, c], k) => `<div class="c-row" data-c="${k}"><span><i class="flag" style="background:${c};width:8px;height:8px;border-radius:2px"></i>${n}</span><div class="prog"><i style="--w:${(R.cats[k] / R.cats[0]) * 100}%;background:${c}"></i></div><span>${R.cats[k]}%</span></div>`).join("")}</div>
      </section>
    </div>
    <section class="card stmts">
      <div class="row"><h3>Statements</h3><span class="sp"></span><span class="sub">PDF ready to download</span></div>
      ${[["April 2026 statement", "Generated 17 Apr · 18 transactions"], ["March 2026 statement", "Generated 31 Mar · 42 transactions"], ["February 2026 statement", "Generated 28 Feb · 37 transactions"]]
        .map(([t, s]) => `<div class="stmt"><span class="pdf">${ic("file")}</span><div style="flex:1"><b style="font-size:11.5px">${t}</b><div class="sub">${s}</div></div><span class="tag">PDF</span><button class="btn-lite" data-act="pdf" data-t="${t}">${ic("down")} Download</button></div>`).join("")}
    </section>`;
  }

  const TX = [
    ["Today", "Apple Store", "bag", "Shopping", "out", 129.0, "09:41"],
    ["Today", "Salary · Studio North", "bank", "Income", "in", 3450.0, "08:00"],
    ["Today", "Blue Bottle Coffee", "coffee", "Food", "out", 6.8, "07:52"],
    ["Yesterday", "Booking.com · Ubud", "home2", "Travel", "out", 420.0, "21:15"],
    ["Yesterday", "To Jenny Wilson", "swap", "Transfer", "tr", 250.0, "18:30"],
    ["Yesterday", "Spotify", "music", "Bills", "out", 10.99, "06:00"],
    ["15 Apr", "Whole Foods", "cart", "Food", "out", 86.42, "19:02"],
    ["15 Apr", "From Savings · Trip to Bali", "swap", "Transfer", "tr", 200.0, "12:10"],
    ["15 Apr", "Figma", "file", "Software", "out", 45.0, "10:00"],
  ];
  function rActivity() {
    const list = [...S.drafts.map((d) => ["Today", d.who, "swap", "Pending", "tr", d.amt, "now"]), ...TX];
    const keep = (t) => S.txf === "all" || (S.txf === "in" && t[4] === "in") || (S.txf === "out" && t[4] === "out") || (S.txf === "tr" && t[4] === "tr");
    let lastDay = "";
    return hd("Activity", "Every payment in and out, newest first.", `<div class="seg" id="seg">${[["all", "All"], ["in", "Income"], ["out", "Expenses"], ["tr", "Transfers"]].map(([k, v]) => `<button data-txf="${k}" class="${k === S.txf ? "on" : ""}">${v}</button>`).join("")}<i class="knob"></i></div>`) + `
    <div class="grid ac-top">
      <section class="card lift"><span class="lbl">Spent this week</span><div class="mid money" style="margin-top:12px">${num(1284.6, "m2")}</div><div class="row" style="margin-top:6px"><span class="chip">− 6%</span><span class="sub">less than last week</span></div></section>
      <section class="card lift"><span class="lbl">Received</span><div class="mid money" style="margin-top:12px">${num(3450, "m2")}</div><div class="row" style="margin-top:6px">${chip(12)}<span class="sub">vs last week</span></div></section>
      <section class="card lift"><span class="lbl">Transactions</span><div class="mid" style="margin-top:12px">${num(38 + S.drafts.length, "int")}</div><div class="row" style="margin-top:6px"><span class="chip gray">9 pending review</span></div></section>
      <section class="card lift"><div class="row"><span class="lbl">Daily spend</span><span class="sp"></span><span class="sub">Mon – Sun</span></div>${bars([40, 62, 35, 80, 55, 92, 48], "M T W T F S S".split(" "), false, 74).replace('class="bars"', 'class="bars spark"').replace('<div class="b" style="--k:5">', '<div class="b acc" style="--k:5">')}</section>
    </div>
    <div class="grid ac-main">
      <section class="card">
        <div class="row"><h3>Transactions</h3><span class="sp"></span><span class="sub">${list.filter(keep).length} shown</span></div>
        ${list.map((t) => {
          const day = t[0] !== lastDay ? `<div class="day">${t[0]}</div>` : "";
          lastDay = t[0];
          const sign = t[4] === "in" ? "+" : t[4] === "tr" ? "↔ " : "−";
          return (keep(t) ? day : "") + `<div class="tx${keep(t) ? "" : " gone"}"><span class="ico">${ic(t[2])}</span><div><b>${t[1]}</b><span class="sub">${t[6]}</span></div><span class="chip ${t[3] === "Pending" ? "amber" : "gray"}">${t[3]}</span><span class="amt money${t[4] === "in" ? " in" : ""}">${sign}$${grp(t[5], 2)}</span></div>`;
        }).join("")}
      </section>
      <div class="grid">
        <section class="card lift merch"><h3>Top merchants</h3>
          ${[["Booking.com", "home2", 420, 100], ["Apple Store", "bag", 129, 31], ["Whole Foods", "cart", 86.42, 21], ["Figma", "file", 45, 11]].map(([n, i, v, w]) => `<div class="m"><span class="ico" style="width:26px;height:26px">${ic(i)}</span><div><b style="font-size:11px">${n}</b><div class="prog"><i style="--w:${w}%"></i></div></div><b class="money" style="font-size:11px">$${grp(v, 2)}</b></div>`).join("")}
        </section>
        <section class="card lift"><h3>By category</h3><span class="sub">This week</span>
          <div class="stackbar">${[36, 24, 18, 14, 8].map((w, k) => `<i style="--w:${w}%;background:${CATS[k][1]}"></i>`).join("")}</div>
          <div class="legend" style="margin-top:10px;flex-wrap:wrap">${CATS.map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("")}</div>
        </section>
      </div>
    </div>`;
  }

  function rManage() {
    const c = S.cards[S.card];
    return hd("Manage", "Cards, limits and the accounts they draw from.", `<button class="btn-dark" data-act="addcard">${ic("plus")} Add card</button>`) + `
    <div class="grid mg-main">
      <section class="card">
        <div class="row"><h3>My cards</h3><span class="sp"></span><span class="sub">Tap a card to manage it</span></div>
        <div class="wallet-cards" style="grid-template-columns:repeat(${S.cards.length},1fr)">${S.cards.map((x, k) => `<div class="bc ${x.kind}${k === S.card ? " sel" : ""}${x.frozen ? " frozen" : ""}" data-card="${k}"><b style="font-size:12px">${x.name}</b><span class="mco"></span><span class="no">•••• ${x.no}</span><div class="meta"><span>Code XR</span><span>${x.exp}</span></div></div>`).join("")}</div>
        <div class="ctl">
          ${[["frozen", "lock", "Freeze card", "Stops every payment instantly"], ["online", "globe", "Online payments", "Shops, apps and subscriptions"], ["contactless", "bolt", "Contactless", "Tap to pay up to $100"], ["atm", "bank", "ATM withdrawals", "Cash from any machine"]]
            .map(([k, i, t, d]) => `<div class="item" data-tgc="${k}"><span class="ico">${ic(i)}</span><div style="flex:1"><b>${t}</b><span class="sub">${d}</span></div><span class="toggle${c[k] ? " on" : ""}${k === "frozen" ? "" : " g"}"></span></div>`).join("")}
        </div>
      </section>
      <div class="grid">
        <section class="card lift">
          <div class="row"><h3>Monthly spending limit</h3><span class="sp"></span><span class="tag">${c.name}</span></div>
          <div class="big money" id="limN">${num(c.limit, "m0", { k: "lim" })}</div>
          <input class="range" id="lim" type="range" min="500" max="10000" step="100" value="${c.limit}" style="--p:${((c.limit - 500) / 9500) * 100}%" aria-label="Monthly limit">
          <div class="row" style="margin-top:8px"><span class="sub">$${grp(SPENT, 2)} spent this month</span><span class="sp"></span><span class="sub" id="limL">${Math.round((SPENT / c.limit) * 100)}% used</span></div>
        </section>
        <section class="card lift"><h3>Linked accounts</h3>
          ${[["bank", "Chase Checking", "•••• 0412", "$12,480.10"], ["globe", "Wise · EUR", "•••• 7781", "€4,210.55"], ["coins", "Savings vault", "Auto-save target", "$18,527.44"]].map(([i, n, s, v]) => `<div class="acct"><span class="ico">${ic(i)}</span><div><b style="font-size:11.5px">${n}</b><div class="sub"><i class="live-dot"></i>${s}</div></div><b class="money" style="font-size:11.5px">${v}</b></div>`).join("")}
        </section>
      </div>
    </div>
    <section class="card lift" style="margin-top:15px">
      <div class="row"><h3>Upcoming charges</h3><span class="sp"></span><span class="sub">next 30 days · on ${c.name}</span></div>
      <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px">
        ${[["music", "Spotify", "2 May", 10.99], ["file", "Figma", "15 May", 45], ["globe", "iCloud+", "18 May", 2.99], ["coffee", "Blue Bottle", "20 May", 24]].map(([i, n, d, v]) => `<div class="row" style="background:rgba(255,255,255,.4);border-radius:14px;padding:10px"><span class="ico">${ic(i)}</span><div style="flex:1"><b style="font-size:11.5px">${n}</b><div class="sub">${d}</div></div><b class="money" style="font-size:11.5px">$${grp(v, 2)}</b></div>`).join("")}
      </div>
    </section>`;
  }

  function rProgram() {
    const offers = [["Booking.com", "home2", "8% back", "Hotels worldwide · ends 30 Apr"], ["Apple", "bag", "3% back", "Every Apple Store purchase"], ["Uber", "car", "5% back", "Rides and Eats · weekends"], ["Spotify", "music", "1 month free", "Premium Family"]];
    return hd("Program", "Cashback, tiers and partner perks — all paid into your wallet.", `<span class="chip amber" style="height:24px;padding:0 10px;font-size:11px">${ic("star")}&nbsp;Gold member</span>`) + `
    <div class="grid pg-top">
      <section class="card lift"><span class="lbl">Reward points</span><div class="big">${num(S.points, "int", { k: "pts" })} <span style="font-size:13px;color:var(--mut);font-weight:600">pts</span></div>
        <div class="sub" style="margin-top:4px">≈ $${grp(S.points / 100, 2)} in cashback</div>
        <div class="two" style="grid-template-columns:auto auto;justify-content:start"><button class="btn-dark" data-act="redeem" ${S.points ? "" : "disabled style=\"opacity:.4\""}>${ic("swap")} Redeem to wallet</button></div></section>
      <section class="card lift"><span class="lbl">Tier</span><div class="tier">${ring(72, `<b style="font-size:17px">${num(72, "p0")}</b>`)}<div><b style="font-size:14px">Gold → Platinum</b><div class="sub" style="margin-top:4px">7,140 pts to go · resets 1 Jan</div><div class="sub" style="margin-top:8px">Platinum adds 2× points on travel and free FX.</div></div></div></section>
      <section class="card lift"><div class="row"><span class="lbl">Points earned</span><span class="sp"></span><span class="sub">last 6 months</span></div>${bars([38, 52, 44, 70, 64, 88], "Nov Dec Jan Feb Mar Apr".split(" "), true, 96)}</section>
    </div>
    <div class="grid offers">
      ${offers.map(([n, i, p, d], k) => `<section class="card lift offer"><div class="row"><span class="ico">${ic(i)}</span><b style="font-size:12px">${n}</b></div><div class="pct">${p}</div><span class="sub" style="margin:4px 0 14px">${d}</span><button class="btn-lite${S.offers[k] ? " on" : ""}" data-offer="${k}">${S.offers[k] ? ic("check") + " Activated" : "Activate"}</button></section>`).join("")}
    </div>
    <section class="card perks"><h3>Perks</h3>
      ${[["plane", "Lounge access", "2 visits a year at 1,300 airports", "Gold"], ["shield", "Purchase protection", "Up to $2,500 per item for 90 days", "Gold"], ["globe", "Free FX", "Spend abroad at the interbank rate", "Platinum"]].map(([i, t, d, tier]) => `<div class="perk"><span class="ico">${ic(i)}</span><div><b style="font-size:11.5px">${t}</b><div class="sub">${d}</div></div><span class="chip ${tier === "Gold" ? "amber" : "gray"}">${tier}</span></div>`).join("")}
    </section>`;
  }

  function rAccount() {
    const devs = [["goggles", "Vision Pro", "This device · Milan"], ["phone", "iPhone 17 Pro", "Active 2 h ago · Milan"], ["laptop", "MacBook Pro", "Active yesterday · Monza"]];
    return hd("Account", "Profile, security and the devices signed in to it.") + `
    <div class="grid acc-top">
      <section class="card lift prof"><span class="avatar"></span><h3>Code XR</h3><span class="sub">code.xr@example.com</span><div class="row" style="margin-top:10px"><span class="chip amber">Premium</span><span class="chip gray">Since 2023</span></div><button class="btn-lite" data-act="edit" style="margin-top:auto;width:100%">Edit profile</button></section>
      <section class="card lift set"><h3>Security</h3>
        ${[["face", "user", "Face ID unlock", "Ask every time the app opens"], ["twofa", "lock", "Two-factor sign-in", "Code on a trusted device"], ["alerts", "bell", "Login alerts", "When a new device signs in"], ["priv", "shield", "Hide balances", "Blur every amount on screen"]]
          .map(([k, i, t, d]) => `<div class="item" data-tgs="sec.${k}"><span class="ico">${ic(i)}</span><div style="flex:1"><b>${t}</b><span class="sub">${d}</span></div><span class="toggle g${S.sec[k] ? " on" : ""}"></span></div>`).join("")}
      </section>
      <section class="card lift set"><h3>Notifications</h3>
        ${[["pay", "card", "Payments", "Every card payment and transfer"], ["goals", "coins", "Goals", "When a goal hits 25 / 50 / 100 %"], ["weekly", "calendar", "Weekly report", "Monday, 8:00"], ["news", "sparkles", "Product news", "New features, rarely"]]
          .map(([k, i, t, d]) => `<div class="item" data-tgs="note.${k}"><span class="ico">${ic(i)}</span><div style="flex:1"><b>${t}</b><span class="sub">${d}</span></div><span class="toggle g${S.note[k] ? " on" : ""}"></span></div>`).join("")}
      </section>
    </div>
    <div class="grid acc-bot">
      <section class="card"><div class="row"><h3>Devices</h3><span class="sp"></span><span class="sub">${3 - S.out.size} signed in</span></div>
        ${devs.map(([i, n, s], k) => `<div class="dev${S.out.has(k) ? " out" : ""}"><span class="ico">${ic(i)}</span><div><b style="font-size:11.5px">${n}</b><div class="sub">${S.out.has(k) ? "Signed out" : s}</div></div>${k === 0 ? `<span class="chip">This device</span>` : `<button class="btn-lite" data-out="${k}" ${S.out.has(k) ? "disabled" : ""}>${S.out.has(k) ? "Signed out" : "Sign out"}</button>`}</div>`).join("")}
      </section>
      <section class="card lift"><span class="lbl">Plan</span><div class="mid" style="margin-top:10px">Premium</div><div class="sub" style="margin-top:4px">$9.99 / month · renews 12 May 2026</div><button class="btn-dark" data-act="plan" style="margin-top:16px">Manage plan</button></section>
    </div>`;
  }

  const PAGES = {
    overview: { label: "Overview", render: rOverview },
    activity: { label: "Activity", render: rActivity },
    manage: { label: "Manage", render: rManage },
    program: { label: "Program", render: rProgram },
    account: { label: "Account", render: rAccount },
    reports: { label: "Reports", render: rReports },
    savings: { label: "Savings", render: rSavings },
  };
  const RAIL = [["overview", "home", "Home"], ["program", "sparkles", "Program"], ["savings", "coins", "Savings"], ["activity", "bell", "Activity"], ["reports", "pie", "Reports"], ["manage", "wallet", "Manage"], ["account", "gear", "Account"]];
  const TABS = ["overview", "activity", "manage", "program", "account", "reports"];

  // ── chrome: rail, dock, quick menu ──────────────────────────
  $("rail").innerHTML = RAIL.map(([id, i, t]) => `<button data-go="${id}" aria-label="${t}">${ic(i)}<span class="tip">${t}</span></button>`).join("") + `<button class="more" data-act="rail" aria-label="Show labels">${ic("chev")}</button>`;
  $("dock").insertAdjacentHTML("beforeend", TABS.map((id) => `<button class="tab" data-go="${id}">${PAGES[id].label}</button>`).join("") + `<button class="plus" id="plus" aria-label="Quick actions">${ic("plus")}</button>`);
  $("bell").innerHTML = ic("bell");
  $("quick").innerHTML = [["transfer", "swap", "New transfer"], ["newgoal", "coins", "New goal"], ["addcard", "card", "Add a card"], ["csv", "down", "Export report"]].map(([a, i, t]) => `<button data-act="${a}">${ic(i)} ${t}</button>`).join("");

  function setNav(id, instant) {
    document.querySelectorAll("#rail [data-go]").forEach((b) => b.classList.toggle("on", b.dataset.go === id));
    const tab = document.querySelector(`#dock .tab[data-go="${id}"]`);
    document.querySelectorAll("#dock .tab").forEach((b) => b.classList.toggle("on", b === tab));
    const pill = $("pill");
    if (tab) {
      if (instant) pill.style.transition = "none";
      pill.style.left = tab.offsetLeft + "px";
      pill.style.width = tab.offsetWidth + "px";
      pill.classList.add("on");
      if (instant) { pill.offsetWidth; pill.style.transition = ""; }
    } else pill.classList.remove("on"); // Savings lives only in the rail: the pill fades where it is
  }

  // ── typewriter in the top bar (restarts on every page, like the original) ──
  const ASK = "Can you send $250 to Jenny Wilson...";
  let typeT = 0;
  function retype() {
    clearTimeout(typeT);
    const el = $("typed");
    if (reduce) { el.textContent = ASK; return; }
    el.textContent = "";
    let i = 0;
    const step = () => { el.textContent = ASK.slice(0, i++); if (i <= ASK.length) typeT = setTimeout(step, 34); };
    typeT = setTimeout(step, 450);
  }

  // ── the page switch ─────────────────────────────────────────
  let cur = null, token = 0;
  const T_LIVE = 280, STAGGER = 65;
  function go(id, opt = {}) {
    if (id === cur && !opt.force) return;
    cur = id;
    const my = ++token;
    closeQuick();
    setNav(id, opt.instant || opt.navInstant);
    if (!opt.keepType) retype();
    const v = $("view");
    const carry = {};
    if (opt.soft) v.querySelectorAll(".n[data-k]").forEach((el) => (carry[el.dataset.k] = el._v ?? +el.dataset.to));
    tweens.clear();
    v.className = "view" + (opt.soft ? " in settled" : "");
    v.innerHTML = PAGES[id].render();
    if (!opt.soft) $("scroll").scrollTop = 0;
    const cards = v.querySelectorAll(".card");
    cards.forEach((c, i) => c.style.setProperty("--i", i));
    wire(id, v);
    if (reduce) { v.classList.add("in", "live", "settled"); countAll(v, carry); return; }
    v.offsetWidth; // commit the hidden state before animating out of it
    requestAnimationFrame(() => {
      if (my !== token) return;
      v.classList.add("in");
      setTimeout(() => { if (my !== token) return; v.classList.add("live"); countAll(v, carry); }, opt.soft ? 30 : T_LIVE);
      setTimeout(() => { if (my === token) v.classList.add("settled"); }, opt.soft ? 0 : cards.length * STAGGER + 420);
    });
  }

  // per-page wiring that needs live elements
  function wire(id, v) {
    const seg = v.querySelector("#seg");
    if (seg) requestAnimationFrame(() => placeKnob(seg));
    if (id === "reports") wireChart(v);
    if (id === "overview") {
      const q = v.querySelector("#q");
      q.addEventListener("input", () => { S.q = q.value; patchTable(); });
    }
    if (id === "manage") {
      const r = v.querySelector("#lim");
      r.addEventListener("input", () => {
        const c = S.cards[S.card]; c.limit = +r.value;
        r.style.setProperty("--p", ((c.limit - 500) / 9500) * 100 + "%");
        const n = v.querySelector("#limN .n"); n._v = c.limit; n.textContent = FMT.m0(c.limit, true, c.limit, n);
        v.querySelector("#limL").textContent = Math.round((SPENT / c.limit) * 100) + "% used";
      });
    }
  }
  function placeKnob(seg) {
    const k = seg.querySelector(".knob"), on = seg.querySelector("button.on");
    if (!k || !on) return;
    k.style.left = on.offsetLeft + "px"; k.style.width = on.offsetWidth + "px";
  }
  function patchTable() {
    // re-render only the table body so the search box keeps focus
    const tmp = document.createElement("div"); tmp.innerHTML = rOverview();
    const nb = tmp.querySelector("tbody"), ob = $("view").querySelector("tbody");
    if (nb && ob) ob.replaceWith(nb);
  }

  function wireChart(v) {
    const R = RANGES[S.range];
    const box = v.querySelector("#chart"), svg = box.querySelector("svg"), tip = v.querySelector("#tip");
    const W = 600, H = 210, L = 30, B = 22, T = 6;
    const X = (i) => L + (i * (W - L - 6)) / (R.a.length - 1);
    const Y = (val) => T + (1 - val / R.max) * (H - B - T);
    const unit = R.fmt === "M" ? "k" : "k";
    box.addEventListener("pointermove", (e) => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const i = Math.max(0, Math.min(R.a.length - 1, Math.round(((x - L) / (W - L - 6)) * (R.a.length - 1))));
      const g = v.querySelector("#guide"); g.setAttribute("x1", X(i)); g.setAttribute("x2", X(i));
      v.querySelector("#da").setAttribute("cx", X(i)); v.querySelector("#da").setAttribute("cy", Y(R.a[i]));
      v.querySelector("#db").setAttribute("cx", X(i)); v.querySelector("#db").setAttribute("cy", Y(R.b[i]));
      tip.innerHTML = `<b>${R.x[i]}</b><br><span style="color:#ef5a2a">●</span> Income $${R.a[i]}${unit} &nbsp; <span>●</span> Expenses $${R.b[i]}${unit}`;
      const px = (X(i) / W) * r.width;
      tip.style.left = Math.min(r.width - 150, Math.max(0, px + 10)) + "px";
      box.classList.add("hov");
    });
    box.addEventListener("pointerleave", () => box.classList.remove("hov"));
    const cats = v.querySelector("#cats"), donut = v.querySelector("#donut");
    const hi = (k) => {
      cats.classList.toggle("hov", k != null);
      cats.querySelectorAll(".c-row").forEach((r) => r.classList.toggle("on", +r.dataset.c === k));
      donut.querySelectorAll(".s").forEach((s) => { s.classList.toggle("dim", k != null && +s.dataset.c !== k); s.style.strokeWidth = +s.dataset.c === k ? 6.6 : ""; });
    };
    [cats, donut].forEach((el) => {
      el.addEventListener("pointerover", (e) => { const t = e.target.closest("[data-c]"); if (t) hi(+t.dataset.c); });
      el.addEventListener("pointerleave", () => hi(null));
    });
  }

  // ── toasts + quick menu ─────────────────────────────────────
  let toastT = 0;
  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }
  const closeQuick = () => { $("quick").classList.remove("open"); $("plus") && $("plus").classList.remove("open"); };

  // ── every click in one place ────────────────────────────────
  document.addEventListener("click", (e) => {
    const t = e.target;
    const goBtn = t.closest("[data-go]");
    if (goBtn) { go(goBtn.dataset.go); return; }
    if (t.closest("#plus")) { const open = !$("quick").classList.contains("open"); $("quick").classList.toggle("open", open); $("plus").classList.toggle("open", open); return; }
    if (!t.closest("#quick")) closeQuick();
    if (t.closest("#bell")) { go("activity"); return; }

    const a = t.closest("[data-act]");
    if (a) { if (a.closest("#quick")) closeQuick(); return act(a.dataset.act, a); }

    const tg = t.closest("[data-tg]");
    if (tg) {
      const [k, i] = tg.dataset.tg.split(".");
      S[k][i] = !S[k][i]; tg.classList.toggle("on", S[k][i]); tg.setAttribute("aria-checked", S[k][i]);
      if (k === "auto") { $("autoN").textContent = S.auto.filter(Boolean).length + " on"; toast(`${["Round-ups", "Payday boost", "Weekly $50"][i]} ${S.auto[i] ? "on" : "off"}`); }
      return;
    }
    const tgs = t.closest("[data-tgs]");
    if (tgs) {
      const [k, i] = tgs.dataset.tgs.split(".");
      S[k][i] = !S[k][i]; tgs.querySelector(".toggle").classList.toggle("on", S[k][i]);
      if (k === "sec" && i === "priv") document.body.classList.toggle("private", S.sec.priv);
      return;
    }
    const tgc = t.closest("[data-tgc]");
    if (tgc) {
      const c = S.cards[S.card], k = tgc.dataset.tgc;
      c[k] = !c[k]; tgc.querySelector(".toggle").classList.toggle("on", c[k]);
      if (k === "frozen") { document.querySelector(`.bc[data-card="${S.card}"]`).classList.toggle("frozen", c.frozen); toast(c.frozen ? `${c.name} card frozen` : `${c.name} card unfrozen`); }
      return;
    }
    const card = t.closest("[data-card]");
    if (card) { S.card = +card.dataset.card; go("manage", { force: true, soft: true, keepType: true }); return; }
    const rng = t.closest("[data-range]");
    if (rng && rng.dataset.range !== S.range) { S.range = rng.dataset.range; go("reports", { force: true, soft: true, keepType: true }); return; }
    const txf = t.closest("[data-txf]");
    if (txf && txf.dataset.txf !== S.txf) { S.txf = txf.dataset.txf; go("activity", { force: true, soft: true, keepType: true }); return; }
    const cb = t.closest("[data-cb]");
    if (cb) { const id = cb.dataset.cb; S.checked.has(id) ? S.checked.delete(id) : S.checked.add(id); cb.classList.toggle("on"); return; }
    const off = t.closest("[data-offer]");
    if (off) { const k = +off.dataset.offer; S.offers[k] = !S.offers[k]; off.classList.toggle("on", S.offers[k]); off.innerHTML = S.offers[k] ? ic("check") + " Activated" : "Activate"; return; }
    const out = t.closest("[data-out]");
    if (out) { S.out.add(+out.dataset.out); go("account", { force: true, soft: true, keepType: true }); toast("Signed out of that device"); }
  });

  function act(name, el) {
    switch (name) {
      case "cur": {
        const order = ["USD", "EUR", "GBP"];
        S.cur = order[(order.indexOf(S.cur) + 1) % 3];
        const [r, sym, col] = RATE[S.cur];
        el.innerHTML = `<i class="flag" style="background:${col}"></i>${S.cur} ${ic("chev")}`;
        const n = document.querySelector('.n[data-k="bal"]');
        n.dataset.sym = sym; tween(n, +(S.balance * r).toFixed(2), 0, 700);
        return;
      }
      case "transfer": return toast("Transfer: pick someone, or ask the assistant above");
      case "request": return toast("Request link copied — share it with anyone");
      case "status": {
        const order = [null, "Completed", "Pending", "In Progress"];
        S.status = order[(order.indexOf(S.status) + 1) % order.length];
        el.innerHTML = `${S.status || "Filter"} ${ic("filter")}`;
        return patchTable();
      }
      case "add": {
        const k = +el.dataset.i, g = S.goals[k];
        const stepAmt = Math.max(50, Math.round(g.target / 20 / 50) * 50);
        g.saved = Math.min(g.target, g.saved + stepAmt); S.saved += stepAmt;
        const p = Math.min(100, (g.saved / g.target) * 100);
        const card = el.closest(".goal");
        card.querySelector(".ring .v").style.setProperty("--off", (100 - p).toFixed(2));
        tween(card.querySelector('.n[data-k="g' + k + '"]'), Math.round(p), 0, 700);
        card.querySelector(".sub").textContent = `$${grp(g.saved, 0)} of $${grp(g.target, 0)}`;
        if (p >= 100) card.querySelector(".ring small").textContent = "done";
        const tot = document.querySelector('.n[data-k="saved"]');
        if (tot) tween(tot, +((tot._v ?? 0) + stepAmt).toFixed(2), 0, 700);
        return toast(p >= 100 ? `${g.name} — goal reached` : `+$${grp(stepAmt, 0)} to ${g.name}`);
      }
      case "newgoal": {
        if (cur !== "savings") go("savings");
        if (S.goals.length >= 11) return toast("That's plenty of goals for one demo");
        S.goals.push({ name: "New goal " + (S.goals.length - 4), icon: "star", tint: "#fdf0d2", fg: "#a2700c", due: "Dec 2026", saved: 0, target: 1000 });
        setTimeout(() => go("savings", { force: true, soft: true, keepType: true }), cur === "savings" ? 0 : 900);
        return toast("Goal added — use Add money to fill it");
      }
      case "csv": {
        const R = RANGES[S.range];
        const csv = "point,income,expenses\n" + R.x.map((x, i) => `${x},${R.a[i]},${R.b[i]}`).join("\n");
        try { const u = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const l = document.createElement("a"); l.href = u; l.download = `report-${S.range}.csv`; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch (_) { /* sandboxed frames may block downloads */ }
        return toast(`report-${S.range}.csv — ${R.x.length} rows`);
      }
      case "pdf": return toast(`${el.dataset.t} — downloading`);
      case "addcard": {
        if (cur !== "manage") go("manage");
        if (S.cards.length >= 3) return toast("Three cards is the limit on this plan");
        S.cards.push({ kind: "k", name: "Virtual", no: String(1000 + Math.floor(Math.random() * 8999)), exp: "11/30", frozen: false, online: true, contactless: false, atm: false, limit: 1000 });
        S.card = S.cards.length - 1;
        setTimeout(() => go("manage", { force: true, soft: true, keepType: true }), cur === "manage" ? 0 : 900);
        return toast("Virtual card issued");
      }
      case "redeem": {
        if (!S.points) return;
        const cash = S.points / 100; S.balance += cash; S.points = 0;
        tween(document.querySelector('.n[data-k="pts"]'), 0, 0, 800);
        el.disabled = true; el.style.opacity = ".4";
        return toast(`$${grp(cash, 2)} moved to your USD wallet`);
      }
      case "rail": return $("rail").classList.toggle("wide");
      case "edit": return toast("Profile editing is out of scope for this demo");
      case "plan": return toast("Plan: Premium · next charge 12 May");
    }
  }

  // ── assistant bar: type into it, Enter drafts the transfer ──
  const ask = $("ask"), wrap = $("askWrap");
  wrap.addEventListener("click", () => { wrap.classList.add("on"); ask.placeholder = ASK.replace("...", ""); ask.focus(); });
  ask.addEventListener("blur", () => { if (!ask.value) wrap.classList.remove("on"); });
  ask.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const text = ask.value || ask.placeholder;
    const m = text.match(/\$?\s?([\d,.]+)\s*(?:to)\s+([A-Z][\w'-]*(?:\s+[A-Z][\w'-]*)?)/i);
    if (m) {
      const amt = parseFloat(m[1].replace(/,/g, "")), who = m[2];
      S.drafts.unshift({ who: "To " + who, amt });
      S.txf = "all";
      toast(`Drafted $${grp(amt, 2)} to ${who} — waiting for you in Activity`);
      const here = cur === "activity";
      go("activity", { force: here, soft: here, keepType: here });
    } else toast("Try “send $40 to Alex”");
    ask.value = ""; ask.blur(); wrap.classList.remove("on");
  });

  // ── self-running demo (same order as the recording) until a real input ──
  let demo = !reduce, demoT = 0;
  const SEQ = ["reports", "overview", "savings"];
  let di = 0;
  function demoStep() {
    if (!demo) return;
    const id = SEQ[di++ % SEQ.length];
    const b = document.querySelector(`#rail [data-go="${id}"]`);
    b.classList.add("hint");
    setTimeout(() => { b.classList.remove("hint"); if (demo) go(id); }, 520);
    demoT = setTimeout(demoStep, 2700);
  }
  const stop = (e) => { if (e.isTrusted && demo) { demo = false; clearTimeout(demoT); document.querySelectorAll("#rail .hint").forEach((b) => b.classList.remove("hint")); } };
  ["pointerdown", "wheel", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, stop, { passive: true, capture: true }));

  // the recording opens on Savings; the pill waits (hidden) under Overview, so the first
  // tab it lights slides in from the left — exactly what the recording shows
  const parkPill = () => { const t = document.querySelector('#dock .tab[data-go="overview"]'), p = $("pill"); p.style.transition = "none"; p.style.left = t.offsetLeft + "px"; p.style.width = t.offsetWidth + "px"; p.offsetWidth; p.style.transition = ""; };
  parkPill();
  document.fonts && document.fonts.ready.then(() => { if (TABS.includes(cur)) setNav(cur, true); else parkPill(); });
  go("savings", { navInstant: true });
  if (demo) demoT = setTimeout(demoStep, 2200);
})();
