"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface PlanTier { id: string; name: string; who: string; monthly: number; includes: string[]; time: string; tint: string; art: string }
export interface PlanAddon { id: string; name: string; monthly: number }
export interface PlanText {
  eyebrow: string; title: string; hint: string; perMonth: string; monthlyLabel: string; annualLabel: string; annualNote: string;
  includesTitle: string; chooseBtn: string; composeEyebrow: string; composeTitle: string; composeIntro: string;
  planLabel: string; totalLabel: string; sendBtn: string; sendNote: string; mailSubject: string; mailBody: string;
}

const euro = (n: number) => `€ ${Math.round(n)}`;

/**
 * 报价页的两段：「Listino」（hover-tinted-service-list 那条效果）和「Il tuo preventivo」
 * （勾选加总）。共用一个 state（选中的档 / 年付 / 加项），所以做成一个客户端组件。
 *
 * 效果原样照搬库里的数值：整段背景是一个 --tint、600ms 换色；行悬停 300ms 前进 6px；
 * 右侧文字 220ms 淡出 → 换 → 淡入（一次淡化会把两个价格叠成一个）；预览卡朝指针
 * 来的方向倾 4°、60ms 后回正。pointerenter 而不是 mousemove：一行一次事件，不是一像素一次。
 */
export default function ServiziPlanner({ tiers, addons, text, email, discount, lang }: {
  tiers: PlanTier[]; addons: PlanAddon[]; text: PlanText; email: string; discount: number; lang: string;
}) {
  const [cur, setCur] = useState(0);            // the tier on show (hover / focus)
  const [chosen, setChosen] = useState(0);      // the tier in the quote
  const [annual, setAnnual] = useState(false);
  const [extras, setExtras] = useState<string[]>([]);
  const [shown, setShown] = useState(0);        // what the right column is displaying (lags cur by 220ms)
  const [swap, setSwap] = useState(false);
  const [lean, setLean] = useState(0);
  const reduce = useRef(false);
  const timer = useRef<number>(0);
  useEffect(() => { reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);

  const select = (i: number) => {
    if (i === cur) return;
    const dir = i > cur ? 1 : -1;
    setCur(i);
    setLean(dir * 4);
    window.setTimeout(() => setLean(0), 60);
    window.clearTimeout(timer.current);
    if (reduce.current) { setShown(i); return; }
    setSwap(true);
    timer.current = window.setTimeout(() => { setShown(i); setSwap(false); }, 220);
  };

  const price = (m: number) => Math.round(annual ? m * (1 - discount) : m); // 每项先取整再加总，明细和合计才对得上
  const tier = tiers[shown], picked = tiers[chosen];
  const total = useMemo(() => price(picked.monthly) + addons.filter((a) => extras.includes(a.id)).reduce((s, a) => s + price(a.monthly), 0), [picked, extras, annual]); // eslint-disable-line react-hooks/exhaustive-deps

  const mailto = useMemo(() => {
    const lines = [`· ${picked.name} — ${euro(price(picked.monthly))}${text.perMonth}${annual ? ` (${text.annualLabel})` : ""}`]
      .concat(addons.filter((a) => extras.includes(a.id)).map((a) => `· ${a.name} — ${euro(price(a.monthly))}${text.perMonth}`));
    const body = text.mailBody.replace("{items}", lines.join("\n")).replace("{total}", `${euro(total)}${text.perMonth}`);
    return `mailto:${email}?subject=${encodeURIComponent(`${text.mailSubject} · ${picked.name}`)}&body=${encodeURIComponent(body)}`;
  }, [picked, extras, annual, total]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <section className="sv-listino" style={{ ["--tint" as string]: tiers[cur].tint }} lang={lang}>
        <div className="sv-listino-head">
          <div>
            <p className="sv-eyebrow">{text.eyebrow}</p>
            <h2>{text.title.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</h2>
          </div>
          <div className="sv-billing" role="group" aria-label={`${text.monthlyLabel} / ${text.annualLabel}`}>
            <button type="button" className={annual ? "" : "on"} aria-pressed={!annual} onClick={() => setAnnual(false)}>{text.monthlyLabel}</button>
            <button type="button" className={annual ? "on" : ""} aria-pressed={annual} onClick={() => setAnnual(true)}>{text.annualLabel}</button>
          </div>
        </div>
        <div className="sv-grid">
          <ul className="sv-rows" role="listbox" aria-label={text.eyebrow}>
            {tiers.map((t, i) => (
              <li
                key={t.id}
                role="option"
                aria-selected={i === chosen}
                tabIndex={0}
                className={"sv-row" + (i === cur ? " on" : "") + (i === chosen ? " chosen" : "")}
                onPointerEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => { select(i); setChosen(i); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setChosen(i); } }}
              >
                <span className="sv-row-n">0{i + 1}</span>
                <span className="sv-row-name">{t.name}</span>
                <small>{t.who}</small>
                <em>{euro(price(t.monthly))}<i>{text.perMonth}</i></em>
              </li>
            ))}
          </ul>
          <aside className="sv-side">
            <div className={"sv-price sv-fade" + (swap ? " swap" : "")}>
              {euro(price(tier.monthly))}<span>{text.perMonth}</span>
              {annual ? <small>{text.annualNote}</small> : null}
            </div>
            <div className={"sv-fade" + (swap ? " swap" : "")}>
              <p className="sv-side-title">{text.includesTitle}</p>
              <ul className="sv-includes">{tier.includes.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="sv-time">{tier.time}</p>
            </div>
            <button type="button" className="sv-choose" onClick={() => setChosen(shown)} aria-pressed={chosen === shown}>
              {chosen === shown ? "✓ " : ""}{text.chooseBtn}
            </button>
            <div className="sv-card" style={{ ["--art" as string]: tier.art, transform: `rotate(${lean}deg)` }} aria-hidden="true"><i /><b>{tier.name}</b></div>
            <p className="sv-hint">{text.hint}</p>
          </aside>
        </div>
      </section>

      <section className="sv-compose" id="preventivo" lang={lang}>
        <div className="sv-compose-head">
          <p className="sv-eyebrow dark">{text.composeEyebrow}</p>
          <h2>{text.composeTitle}</h2>
          <p>{text.composeIntro}</p>
        </div>
        <div className="sv-compose-grid">
          <div className="sv-pick">
            <p className="sv-label">{text.planLabel}</p>
            <div className="sv-plan-row"><b style={{ color: picked.tint }}>0{chosen + 1} · {picked.name}</b><span>{euro(price(picked.monthly))}{text.perMonth}</span></div>
            <ul className="sv-addons">
              {addons.map((a) => {
                const on = extras.includes(a.id);
                return (
                  <li key={a.id}>
                    <label>
                      <input type="checkbox" checked={on} onChange={() => setExtras(on ? extras.filter((x) => x !== a.id) : [...extras, a.id])} />
                      <span>{a.name}</span>
                      <em>+ {euro(price(a.monthly))}{text.perMonth}</em>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          <aside className="sv-total">
            <span>{text.totalLabel}</span>
            <b>{euro(total)}<i>{text.perMonth}</i></b>
            {annual ? <small>{text.annualNote}</small> : null}
            <a className="sv-send" href={mailto}>{text.sendBtn}</a>
            <p>{text.sendNote}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
