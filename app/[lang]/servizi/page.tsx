import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiziPlanner from "@/components/ServiziPlanner";
import { ANNUAL_DISCOUNT, CONTACT_EMAIL, SERVIZI_LANGS, addons, copy, tiers } from "@/data/servizi";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * /servizi —— 报价页，发给意大利客户的链接，导航里不放。
 * 原文意大利语；en / zh 有译文，其余语言回落英文。
 */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return {
    title: `${pick(copy.title, locale)} · Mind Studio`,
    description: pick(copy.intro, locale),
    alternates: altsFor("/{lang}/servizi", locale, SERVIZI_LANGS),
  };
}

export default async function ServiziPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = (v: Parameters<typeof pick>[0]) => pick(v, lang);

  return (
    <main className="prose-page sv-page">
      <a className="eyebrow-link" href={`/${lang}`}>{t.backHome}</a>
      <h1>{p(copy.title)}</h1>
      <p className="prose-intro">{p(copy.intro)}</p>

      <ServiziPlanner
        lang={lang}
        email={CONTACT_EMAIL}
        discount={ANNUAL_DISCOUNT}
        tiers={tiers.map((x) => ({ id: x.id, name: p(x.name), who: p(x.who), monthly: x.monthly, includes: x.includes.map(p), time: p(x.time), tint: x.tint, art: x.art }))}
        addons={addons.map((a) => ({ id: a.id, name: p(a.name), monthly: a.monthly }))}
        text={{
          eyebrow: p(copy.listinoEyebrow), title: p(copy.listinoTitle), hint: p(copy.hint), perMonth: p(copy.perMonth),
          monthlyLabel: p(copy.monthlyLabel), annualLabel: p(copy.annualLabel), annualNote: p(copy.annualNote),
          includesTitle: p(copy.includesTitle), chooseBtn: p(copy.chooseBtn),
          composeEyebrow: p(copy.composeEyebrow), composeTitle: p(copy.composeTitle), composeIntro: p(copy.composeIntro),
          planLabel: p(copy.planLabel), totalLabel: p(copy.totalLabel), sendBtn: p(copy.sendBtn), sendNote: p(copy.sendNote),
          mailSubject: p(copy.mailSubject), mailBody: p(copy.mailBody),
        }}
      />

      <h2 className="sv-h2"><span className="sv-eyebrow dark">{p(copy.howEyebrow)}</span></h2>
      <ol className="sv-steps">
        {copy.how.map((s, i) => (
          <li key={i}><b>0{i + 1}</b><h3>{p(s.t)}</h3><p>{p(s.p)}</p></li>
        ))}
      </ol>

      <h2 className="sv-h2"><span className="sv-eyebrow dark">{p(copy.casesEyebrow)}</span></h2>
      <div className="sv-cases">
        {copy.cases.map((c) => (
          <a key={c.href} className="sv-case" href={`/${lang}${c.href}`}><h3>{c.t}</h3><p>{p(c.p)}</p><span>→</span></a>
        ))}
      </div>

      <h2 className="sv-h2"><span className="sv-eyebrow dark">{p(copy.faqEyebrow)}</span></h2>
      <dl className="sv-faq">
        {copy.faq.map((f, i) => (
          <div key={i}><dt>{p(f.q)}</dt><dd>{p(f.a)}</dd></div>
        ))}
      </dl>

      <aside className="sv-cta">
        <h2>{p(copy.ctaTitle)}</h2>
        <a className="sv-send" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(p(copy.mailSubject))}`}>{CONTACT_EMAIL}</a>
      </aside>
    </main>
  );
}
