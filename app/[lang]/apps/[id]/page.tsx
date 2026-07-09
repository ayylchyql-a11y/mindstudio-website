/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailNav from "@/components/DetailNav";
import AppStoreBadge from "@/components/AppStoreBadge";
import CameraScreen from "@/components/CameraScreen";
import Effects from "@/components/Effects";
import { apps, getApp } from "@/data/apps";
import { locales, isLocale, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => apps.map((app) => ({ lang, id: app.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const app = getApp(id);
  if (!app) return {};
  const title = `${app.name} — ${app.tagline[locale]} · Mind Studio`;
  return {
    title,
    description: app.desc[locale],
    alternates: { canonical: `https://mindstudioapps.com/${locale}/apps/${id}` },
    openGraph: { title, description: app.desc[locale], images: [app.icon] },
  };
}

export default async function AppDetail({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const app = getApp(id);
  if (!app) notFound();

  const t = getDictionary(lang);

  return (
    <main className={`detail ${app.sectionClass}`}>
      <DetailNav lang={lang} />

      <section className="detail-hero">
        <img className="app-icon-lg" src={app.icon} alt={`${app.name} icon`} />
        <h1 className="rv">{app.name}</h1>
        <p className="tagline rv rv-d1">{app.tagline[lang]}</p>
        <p className="desc rv rv-d2">{app.desc[lang]}</p>
        <div className="cta-row rv rv-d2">
          {app.status === "live" && app.appStoreUrl ? (
            <AppStoreBadge href={app.appStoreUrl} lang={lang} />
          ) : (
            <span className="soon-pill" style={{ color: app.accent }}>
              {t.comingSoon}
            </span>
          )}
        </div>
        {app.status === "soon" && <p className="detail-soon-note">{t.comingSoonNote}</p>}
      </section>

      {app.gallery.length > 0 && (
        <div className="gallery-wrap">
          <p className="section-label">{t.detailGallery}</p>
          <div className="gallery">
            {app.gallery.map((shot) => (
              <div key={shot.src}>
                <div className="phone">
                  <div className="screen scr-shot">
                    <img className="shot" src={shot.src} alt={`${app.name} — ${shot.alt[lang]}`} />
                  </div>
                </div>
                <p className="cap">{shot.alt[lang]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {app.gallery.length === 0 && (
        <div className="gallery-wrap">
          <div className="gallery gallery-single">
            <div>
              <div className="phone">
                <div className="island" />
                <CameraScreen />
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="features">
        <p className="section-label">{t.detailFeatures}</p>
        <div className="feature-grid">
          {app.features.map((f, i) => (
            <div className="feature-card rv" key={i}>
              <div className="dot" style={{ background: app.gradientCss }}>
                {i + 1}
              </div>
              <h3>{f.title[lang]}</h3>
              <p>{f.desc[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-tail">
        {app.status === "live" && app.appStoreUrl ? (
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <AppStoreBadge href={app.appStoreUrl} lang={lang} />
          </div>
        ) : null}
      </section>

      <Effects />
    </main>
  );
}
