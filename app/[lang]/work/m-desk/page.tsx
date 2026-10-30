/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailNav from "@/components/DetailNav";
import Effects from "@/components/Effects";
import JsonLd from "@/components/JsonLd";
import { mdesk } from "@/data/mdesk";
import { SERVIZI_LANGS } from "@/data/servizi";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * M Desk 专页。静态段 `m-desk` 优先于同级的 `[id]`，所以不会和 work 案例页打架。
 * 结构：hero → 事实条 → 两段 intro → 16 个模块段（图文交替）→ 「为什么换成 M Desk」三张卡 → 回链案例 → 招揽。
 */

/** data/mdesk.ts 写了 en / zh / it 三份原文，其余九种语言读到的是英文。 */
export const MDESK_LOCALES = ["en", "zh", "it"] as const satisfies readonly Locale[];

/** 报价页只有 it / en / zh 三种语言，其余语言链到英文版 */
function pricingLang(lang: Locale): Locale {
  return (SERVIZI_LANGS as readonly Locale[]).includes(lang) ? lang : "en";
}

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
    alternates: altsFor("/{lang}/work/m-desk", locale, MDESK_LOCALES),
    openGraph: { title, description },
  };
}

function Shot({ mod, lang }: { mod: (typeof mdesk.modules)[number]; lang: Locale }) {
  // 后台是网页，用浏览器窗框；骑手端 / 顾客点单站是手机网页，用手机框。
  // 🩸没有截图的模块**不画占位框** —— 与其摆一个空窗户，不如把那一块压成一栏文字。
  const phones = mod.phones ?? [];
  return (
    <>
      {mod.shot && (
        <div className="browser">
          <div className="browser-bar"><span /><span /><span /></div>
          <img className="browser-shot" src={pick(mod.shot.src, lang)} alt={pick(mod.shot.alt, lang)} loading="lazy" />
        </div>
      )}
      {phones.length > 0 && (
        <div className="desk-phones">
          {phones.map((ph) => (
            <div className="phone desk-phone" key={pick(ph.src, lang)}>
              <div className="screen scr-shot">
                <img className="shot" src={pick(ph.src, lang)} alt={pick(ph.alt, lang)} loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
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
    offers: {
      "@type": "Offer",
      price: String(mdesk.fromMonthly),
      priceCurrency: "EUR",
      url: `https://mindstudioapps.com/${pricingLang(lang)}/servizi`,
      priceSpecification: { "@type": "UnitPriceSpecification", price: String(mdesk.fromMonthly), priceCurrency: "EUR", unitCode: "MON" },
    },
  };

  return (
    <main className="detail sect-light work-page desk-page" style={{ position: "relative" }}>
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
        {mdesk.modules.map((mod, i) => {
          const hasShot = !!mod.shot || !!mod.phones?.length;
          const shotCls = mod.shot && mod.phones?.length ? " with-phones" : !mod.shot && mod.phones?.length ? " phones-only" : "";
          return (
            <article className={`desk-module rv${hasShot ? (i % 2 ? " flip" : "") : " no-shot"}`} id={mod.id} key={mod.id}>
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
              {hasShot && (
                <div className={`desk-module-shot${shotCls}`}>
                  <Shot mod={mod} lang={lang} />
                </div>
              )}
            </article>
          );
        })}
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
          <div className="desk-contact-row">
            <a className="desk-contact-btn" href={`/${pricingLang(lang)}/servizi`} style={{ background: mdesk.gradientCss }}>
              {pick(mdesk.pricingCta, lang)} ›
            </a>
            <a className="desk-contact-ghost" href={`mailto:${mdesk.contactEmail}?subject=M%20Desk`}>
              {pick(mdesk.contactCta, lang)}
            </a>
          </div>
        </div>
      </section>

      <Effects />
    </main>
  );
}
