/* eslint-disable @next/next/no-img-element */
import { work } from "@/data/work";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function WorkStrip({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  if (work.length === 0) return null;

  return (
    <section className="work-strip" id="work">
      <div className="work-strip-inner">
        <p className="eyebrow rv">{t.workEyebrow}</p>
        <h2 className="rv rv-d1">{t.workTitle}</h2>
        <p className="work-strip-body rv rv-d2">{t.workBody}</p>
        <div className="work-cards rv rv-d2">
          {work.map((item) => (
            <a className="work-card" key={item.id} href={`/${lang}/work/${item.id}`}>
              <img src={item.icon} alt={`${item.name} icon`} />
              <span className="grow">
                <span className="nm">{item.name}</span>
                <span className="tl">{item.tagline[lang]}</span>
              </span>
              <span className="go" style={{ color: item.accent }}>
                {t.workCta}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
