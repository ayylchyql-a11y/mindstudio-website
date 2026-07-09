/* eslint-disable @next/next/no-img-element */
import type { AppEntry } from "@/data/apps";
import AppStoreBadge from "./AppStoreBadge";
import CameraScreen from "./CameraScreen";

export default function ProductSection({ app }: { app: AppEntry }) {
  return (
    <section className={`product ${app.sectionClass}${app.flip ? " flip" : ""}`} id={app.id}>
      <div className="product-inner">
        <div className="copy">
          <p className="eyebrow rv">{app.eyebrow}</p>
          <h2 className="rv rv-d1">
            {app.headlinePre}
            <span className="grad" style={{ backgroundImage: app.gradientCss }}>
              {app.headlineGrad}
            </span>
            {app.headlinePost}
          </h2>
          <p className="desc rv rv-d2">{app.desc}</p>
          <div className="cta-row rv rv-d2">
            {app.status === "live" && app.appStoreUrl ? (
              <>
                <AppStoreBadge href={app.appStoreUrl} />
                <a className="learn" href={app.appStoreUrl} style={{ color: app.accent }}>
                  Learn more
                </a>
              </>
            ) : (
              <span className="soon-pill" style={{ color: app.accent }}>
                Coming soon
              </span>
            )}
          </div>
        </div>
        <div className="stage rv rv-d1">
          <div className="phone">
            {app.shot ? (
              <div className="screen scr-shot">
                <img className="shot" src={app.shot} alt={app.shotAlt ?? `${app.name} screenshot`} />
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
