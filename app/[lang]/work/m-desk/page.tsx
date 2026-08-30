/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailNav from "@/components/DetailNav";
import Effects from "@/components/Effects";
import JsonLd from "@/components/JsonLd";
import { mdesk } from "@/data/mdesk";
import { defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * M Desk 专页。静态段 `m-desk` 优先于同级的 `[id]`，所以不会和 work 案例页打架。
 * 结构：hero → 事实条 → 两段 intro → 12 个模块段（图文交替）→ 三条设计取向 → 技术栈 → 回链案例 → 招揽。
 */

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const title = `M Desk — ${pick(mdesk.tagline, locale)} · Mind Studio`;
  const description = pick(mdesk.intro[0], locale);
  return {
    title,
    description,
    alternates: { canonical: `https://mindstudioapps.com/${locale}/work/m-desk` },
    openGraph: { title, description },
  };
}

function Shot({ mod, lang }: { mod: (typeof mdesk.modules)[number]; lang: Locale }) {
  // 浏览器窗框：三颗点 + 内容。没截图时画占位，模块名居中——不留空白，也不假装有图
  return (
    <div className="browser">
      <div className="browser-bar"><span /><span /><span /></div>
      {mod.shot ? (
        <img className="browser-shot" src={pick(mod.shot.src, lang)} alt={pick(mod.shot.alt, lang)} loading="lazy" />
      ) : (
        <div className="browser-empty">
          <span className="browser-empty-name">{pick(mod.name, lang)}</span>
          <span className="browser-empty-soon">{pick(mdesk.shotSoon, lang)}</span>
        </div>
      )}
    </div>
  );
}

export default async function MDeskPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "M Desk",
    description: pick(mdesk.intro[0], lang),
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    url: `https://mindstudioapps.com/${lang}/work/m-desk`,
    creator: { "@type": "Organization", name: "Mind Studio" },
  };

  return (
    <main className="detail sect-light work-page desk-page">
      <JsonLd data={ld} />
      <DetailNav lang={lang} label={t.backHome} />

      <section className="detail-hero">
        <img className="app-icon-lg" src={mdesk.icon} alt="M Desk icon" />
        <h1 className="rv">M Desk</h1>
        <p className="tagline rv rv-d1">{pick(mdesk.tagline, lang)}</p>
        <ul className="desk-facts rv rv-d2">
          {mdesk.facts.map((f, i) => (
            <li key={i}>{pick(f, lang)}</li>
          ))}
        </ul>
      </section>

      <section className="work-intro">
        {mdesk.intro.map((p, i) => (
          <p className="work-para rv" key={i}>{pick(p, lang)}</p>
        ))}
      </section>

      <section className="desk-modules">
        <p className="section-label">{pick(mdesk.modulesLabel, lang)}</p>
        {mdesk.modules.map((mod, i) => (
          <article className={`desk-module rv${i % 2 ? " flip" : ""}`} id={mod.id} key={mod.id}>
            <div className="desk-module-copy">
              <span className="desk-module-n" style={{ background: mdesk.gradientCss }}>{String(i + 1).padStart(2, "0")}</span>
              <h2>{pick(mod.name, lang)}</h2>
              <p className="lead">{pick(mod.lead, lang)}</p>
              <ul>
                {mod.bullets.map((b, k) => (
                  <li key={k}>{pick(b, lang)}</li>
                ))}
              </ul>
            </div>
            <div className="desk-module-shot">
              <Shot mod={mod} lang={lang} />
            </div>
          </article>
        ))}
      </section>

      <section className="desk-principles">
        <p className="section-label">{pick(mdesk.principlesLabel, lang)}</p>
        <div className="desk-principle-grid">
          {mdesk.principles.map((p, i) => (
            <div className="desk-principle rv" key={i}>
              <h3>{pick(p.title, lang)}</h3>
              <p>{pick(p.body, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="work-stack">
        <p className="section-label">{pick(mdesk.stackLabel, lang)}</p>
        <div className="stack-row">
          {mdesk.stack.map((s) => (
            <span className="stack-chip" key={s}>{s}</span>
          ))}
        </div>
      </section>

      <section className="desk-tail">
        <div className="desk-case">
          <img src="/icons/mumisushi.png" alt="Mumi Sushi icon" />
          <div>
            <p className="desk-case-label">{pick(mdesk.caseLabel, lang)}</p>
            <a href={`/${lang}/work/mumi-sushi`} className="desk-case-link" style={{ color: mdesk.accent }}>{pick(mdesk.caseCta, lang)} ›</a>
          </div>
        </div>
        <div className="desk-contact">
          <h2>{pick(mdesk.contactTitle, lang)}</h2>
          <p>{pick(mdesk.contactBody, lang)}</p>
          <a className="desk-contact-btn" href={`mailto:${mdesk.contactEmail}?subject=M%20Desk`} style={{ background: mdesk.gradientCss }}>
            {pick(mdesk.contactCta, lang)}
          </a>
        </div>
      </section>

      <Effects />
    </main>
  );
}
