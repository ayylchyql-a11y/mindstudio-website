/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailNav from "@/components/DetailNav";
import AppStoreBadge from "@/components/AppStoreBadge";
import PlayStoreBadge from "@/components/PlayStoreBadge";
import Effects from "@/components/Effects";
import JsonLd from "@/components/JsonLd";
import { work, getWork } from "@/data/work";
import { locales, isLocale, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => work.map((w) => ({ lang, id: w.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const item = getWork(id);
  if (!item) return {};
  const title = `${item.name} — ${item.tagline[locale]} · Mind Studio`;
  return {
    title,
    description: item.intro[0][locale],
    alternates: { canonical: `https://mindstudioapps.com/${locale}/work/${id}` },
    openGraph: { title, description: item.intro[0][locale] },
  };
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const item = getWork(id);
  if (!item) notFound();

  const t = getDictionary(lang);

  // 案例的作者是 Mind Studio，发行方是餐厅公司 —— 结构化数据里如实分开写
  const caseLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.storeName ?? item.name,
    description: item.intro[0][lang],
    operatingSystem: "iOS, Android, Web",
    applicationCategory: "FoodEstablishmentReservation",
    url: `https://mindstudioapps.com/${lang}/work/${item.id}`,
    creator: { "@type": "Organization", name: "Mind Studio" },
    publisher: { "@type": "Organization", name: "L & Z SRL SEMPLIFICATA" },
    ...(item.appStoreUrl ? { installUrl: item.appStoreUrl } : {}),
  };

  return (
    <main className="detail sect-light work-page">
      <JsonLd data={caseLd} />
      <DetailNav lang={lang} label={t.backHome} />

      <section className="detail-hero">
        <img className="app-icon-lg" src={item.icon} alt={`${item.name} icon`} />
        <h1 className="rv">{item.name}</h1>
        <p className="tagline rv rv-d1">{item.tagline[lang]}</p>
        <p className="work-credit rv rv-d2">
          <span>{item.builtBy[lang]}</span>
          <span className="work-credit-sep" aria-hidden="true">
            ·
          </span>
          <span>{item.publishedBy[lang]}</span>
        </p>
        <div className="cta-row rv rv-d2">
          {item.appStoreUrl && <AppStoreBadge href={item.appStoreUrl} lang={lang} />}
          {item.playStoreUrl ? (
            <PlayStoreBadge href={item.playStoreUrl} lang={lang} />
          ) : item.androidPending ? (
            <span className="soon-pill" style={{ color: item.accent }}>
              {t.workAndroidPending}
            </span>
          ) : null}
        </div>
      </section>

      <section className="work-intro">
        {item.intro.map((p, i) => (
          <p className="work-para rv" key={i}>
            {p[lang]}
          </p>
        ))}
      </section>

      {item.gallery.length > 0 && (
        <div className="gallery-wrap">
          <p className="section-label">{t.detailGallery}</p>
          <div className="gallery">
            {item.gallery.map((shot) => (
              <div key={shot.src[lang]}>
                <div className="phone">
                  <div className="screen scr-shot">
                    <img
                      className="shot"
                      src={shot.src[lang]}
                      alt={`${item.name} — ${shot.alt[lang]}`}
                    />
                  </div>
                </div>
                <p className="cap">{shot.alt[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="features">
        <p className="section-label">{t.workFeaturesLabel}</p>
        <div className="feature-grid">
          {item.features.map((f, i) => (
            <div className="feature-card rv" key={i}>
              <div className="dot" style={{ background: item.gradientCss }}>
                {i + 1}
              </div>
              <h3>{f.title[lang]}</h3>
              <p>{f.desc[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features work-system">
        <p className="section-label">{t.workSystemLabel}</p>
        <div className="piece-grid">
          {item.pieces.map((piece, i) => (
            <div className="piece-card rv" key={i}>
              <div className="piece-bar" style={{ background: item.gradientCss }} />
              <h3>{piece.name[lang]}</h3>
              <p>{piece.desc[lang]}</p>
              <p className="piece-tech">{piece.tech}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="work-stack">
        <p className="section-label">{t.workStackLabel}</p>
        <div className="stack-row">
          {item.stack.map((s) => (
            <span className="stack-chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-tail">
        <div className="cta-row" style={{ justifyContent: "center" }}>
          {item.appStoreUrl && <AppStoreBadge href={item.appStoreUrl} lang={lang} />}
          {item.playStoreUrl && <PlayStoreBadge href={item.playStoreUrl} lang={lang} />}
        </div>
        <p className="section-label" style={{ marginTop: 40 }}>
          {t.workLinksLabel}
        </p>
        <div className="detail-legal-links">
          {item.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener">
              {l.label[lang]}
            </a>
          ))}
        </div>
      </section>

      <Effects />
    </main>
  );
}
