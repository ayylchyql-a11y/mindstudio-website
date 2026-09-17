import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TEMPLATES_LANGS, activeGroups, designsOf, posterPath, templatesCopy, templatesIn } from "@/data/templates";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return {
    title: `${pick(templatesCopy.title, locale)} · Mind Studio`,
    description: pick(templatesCopy.intro, locale),
    alternates: altsFor("/{lang}/templates", locale, TEMPLATES_LANGS),
  };
}

/**
 * 总览：按**行业**分组（餐饮 / 百货 / 食品供应 / 服务），每组一排卡片，
 * 一张卡 = 一个行业里的一套模版（原版海报 + 名字 + 行业·城市 + 4 种设计）。
 * 设计风格不在这一层分 —— 那是点进去以后的 4 个 tab。
 */
export default async function TemplatesIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const groups = activeGroups();

  return (
    <main className="prose-page tpl-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <h1>{pick(templatesCopy.title, lang)}</h1>
      <p className="prose-intro">{pick(templatesCopy.intro, lang)}</p>

      {/* 组内跳转：四个组一屏放不下，先给一排锚点。
          🩸 不能用 <nav>：本站 globals.css 给裸 nav 写的是顶部固定导航栏的样式，
             这一排会被钉到页面最顶上、压在 logo 那一层里。 */}
      <div className="tpl-groupnav" role="navigation" aria-label={pick(templatesCopy.allGroups, lang)}>
        {groups.map((g) => (
          <a key={g.id} href={`#${g.id}`}>
            <span className="cat-dot" style={{ background: g.accent }} aria-hidden="true" />
            {pick(g.title, lang)}
            <span className="tpl-groupnav-n">{templatesIn(g.id).length}</span>
          </a>
        ))}
      </div>

      {groups.map((g) => {
        const items = templatesIn(g.id);
        return (
          <section className="tpl-group" id={g.id} key={g.id}>
            <div className="tpl-group-head">
              <h2>
                <span className="cat-dot" style={{ background: g.accent }} aria-hidden="true" />
                {pick(g.title, lang)}
                <span className="cat-count">
                  {items.length} {pick(items.length === 1 ? templatesCopy.countOne : templatesCopy.count, lang)}
                </span>
              </h2>
              <p>{pick(g.intro, lang)}</p>
            </div>
            <ul className="tpl-grid">
              {items.map((tp) => (
                <li key={tp.slug}>
                  <a className="tpl-card" href={`/${lang}/templates/${tp.slug}`}>
                    <span className="tpl-card-shot" style={{ background: tp.accent }}>
                      <img
                        src={posterPath(tp, "original")}
                        alt={`${tp.name} — ${pick(tp.industry, lang)}`}
                        width={1200}
                        height={750}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="tpl-card-body">
                      <span className="tpl-card-name">{tp.name}</span>
                      <span className="tpl-card-meta">
                        {pick(tp.industry, lang)} · {tp.city}
                      </span>
                      <span className="tpl-card-styles">
                        {designsOf(tp).length}{" "}
                        {pick(designsOf(tp).length === 1 ? templatesCopy.design : templatesCopy.designs, lang)}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="tpl-note">{pick(templatesCopy.demoNote, lang)}</p>
    </main>
  );
}
