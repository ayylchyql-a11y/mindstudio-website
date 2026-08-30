/* eslint-disable @next/next/no-img-element */
import { mdesk } from "@/data/mdesk";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";

/**
 * 首页旗舰段：Hero 之后、所有 App 之前。深色底把它和浅色的 App 段拉开——
 * 这是往下滑第一眼看到的东西，M Desk 是工作室最难的项目，位置要配得上。
 */
export default function DeskFeature({ lang }: { lang: Locale }) {
  const href = `/${lang}/work/m-desk`;
  const hero = mdesk.modules.find((m) => m.id === "orders");
  return (
    <section className="desk-feature" id="m-desk">
      <div className="desk-feature-inner">
        <div className="desk-feature-copy">
          <p className="eyebrow rv">{pick(mdesk.home.eyebrow, lang)}</p>
          <h2 className="rv rv-d1">
            <span className="grad" style={{ backgroundImage: mdesk.gradientCss }}>{pick(mdesk.home.title, lang)}</span>
          </h2>
          <p className="desc rv rv-d2">{pick(mdesk.home.body, lang)}</p>
          <ul className="desk-facts rv rv-d2">
            {mdesk.facts.map((f, i) => (
              <li key={i}>{pick(f, lang)}</li>
            ))}
          </ul>
          <div className="cta-row rv rv-d2">
            <a className="desk-feature-btn" href={href} style={{ background: mdesk.gradientCss }}>{pick(mdesk.home.cta, lang)} ›</a>
          </div>
        </div>
        <div className="desk-feature-stage rv rv-d1">
          <a href={`${href}#orders`} className="browser browser-dark" aria-label={pick(mdesk.home.cta, lang)}>
            <div className="browser-bar"><span /><span /><span /></div>
            {hero?.shot ? (
              <img className="browser-shot" src={pick(hero.shot.src, lang)} alt={pick(hero.shot.alt, lang)} />
            ) : (
              <div className="browser-empty">
                <span className="browser-empty-name">M Desk</span>
                <span className="browser-empty-soon">{pick(mdesk.shotSoon, lang)}</span>
              </div>
            )}
          </a>
          <div className="desk-tiles">
            {mdesk.home.tiles.map((tile) => (
              <a className="desk-tile" href={`${href}#${tile.id}`} key={tile.id}>
                <span className="desk-tile-t">{pick(tile.title, lang)}</span>
                <span className="desk-tile-d">{pick(tile.desc, lang)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
