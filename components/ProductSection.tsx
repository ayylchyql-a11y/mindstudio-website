/* eslint-disable @next/next/no-img-element */
import type { AppEntry } from "@/data/apps";
import type { Locale } from "@/lib/i18n";
import { getDictionary, pick } from "@/lib/i18n";
import AppStoreBadge from "./AppStoreBadge";
import CameraScreen from "./CameraScreen";

export default function ProductSection({ app, lang }: { app: AppEntry; lang: Locale }) {
  const t = getDictionary(lang);

  return (
    <section className={`product ${app.sectionClass}${app.flip ? " flip" : ""}`} id={app.id}>
      <div className="product-inner">
        <div className="copy">
          <p className="eyebrow rv">{app.name}</p>
          <h2 className="rv rv-d1">
            {pick(app.headlinePre, lang)}
            <span className="grad" style={{ backgroundImage: app.gradientCss }}>
              {pick(app.headlineGrad, lang)}
            </span>
            {pick(app.headlinePost, lang)}
          </h2>
          <p className="desc rv rv-d2">{pick(app.desc, lang)}</p>
          <div className="cta-row rv rv-d2">
            {app.status === "live" && app.appStoreUrl ? (
              <>
                <AppStoreBadge href={app.appStoreUrl} lang={lang} />
                <a className="learn" href={`/${lang}/apps/${app.id}`} style={{ color: app.accent }}>
                  {t.learnMore}
                </a>
              </>
            ) : (
              <a className="soon-pill" href={`/${lang}/apps/${app.id}`} style={{ color: app.accent }}>
                {t.comingSoon}
              </a>
            )}
          </div>
        </div>
        <div className="stage rv rv-d1">
          <div className="phone">
            {app.shot ? (
              <div className="screen scr-shot">
                <img
                  className="shot"
                  src={pick(app.shot, lang)}
                  alt={app.shotAlt ? pick(app.shotAlt, lang) : `${app.name} screenshot`}
                />
              </div>
            ) : (
              <>
                <div className="island" />
                <CameraScreen />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
