import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <>
      <section className="future">
        <h2 className="rv">{t.futureTitle}</h2>
        <p className="rv rv-d1">{t.futureBody}</p>
        <div className="ghost rv rv-d2" aria-hidden="true">
          +
        </div>
      </section>
      <footer>
        <div className="foot-inner">
          <span>{t.footerRights}</span>
          <div className="foot-links">
            <a href={`/${lang}/about`}>{t.aboutLabel}</a>
            <a href={`/${lang}/privacy`}>{t.footerPrivacy}</a>
            <a href={`/${lang}/support`}>{t.footerSupport}</a>
            <a href="mailto:ayylchyql@gmail.com">{t.footerContact}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
