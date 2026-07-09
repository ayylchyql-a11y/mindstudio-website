import MsLogo from "./MsLogo";
import { apps } from "@/data/apps";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function Nav({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const other: Locale = lang === "en" ? "zh" : "en";

  return (
    <nav>
      <div className="nav-inner">
        <a className="nav-logo" href={`/${lang}#top`}>
          <MsLogo />
          Mind Studio
        </a>
        <div className="nav-links">
          {apps.map((app) => (
            <a key={app.id} href={`#${app.id}`}>
              {app.name}
            </a>
          ))}
        </div>
        <a className="nav-lang" href={`/${other}`}>
          {t.navLangSwitch}
        </a>
      </div>
    </nav>
  );
}
