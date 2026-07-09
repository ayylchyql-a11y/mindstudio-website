/* eslint-disable @next/next/no-img-element */
import MsLogo from "./MsLogo";
import { apps } from "@/data/apps";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function Hero({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);

  return (
    <header className="hero" id="top">
      <div className="brand-mark rv">
        <MsLogo label="Mind Studio logo" />
      </div>
      <p className="eyebrow rv">{t.heroEyebrow}</p>
      <h1 className="rv rv-d1">
        {t.heroTitleLine1}
        <br />
        <span className="shimmer">{t.heroTitleLine2}</span>
      </h1>
      <p className="sub rv rv-d2">{t.heroSub}</p>
      <div className="icon-row rv rv-d2">
        {apps.map((app) => (
          <a key={app.id} className="app-icon" href={`#${app.id}`} aria-label={app.name}>
            <img src={app.icon} alt={`${app.name} icon`} />
          </a>
        ))}
      </div>
      <span className="scroll-hint">{t.scroll}</span>
    </header>
  );
}
