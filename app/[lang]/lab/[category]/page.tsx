import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EffectFrame from "@/components/EffectFrame";
import { categories, categoryById, demoPath, effectsIn, labCopy } from "@/data/effects";
import { defaultLocale, hreflangMap, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * 一个分类一页，同类效果并排展示 —— 这是这个库最主要的用法：
 * 想找一个背景效果时，把所有背景效果摆在一起看，而不是一条条点进去。
 *
 * 布局比 `.prose-page` 宽（1080 而不是 760）：样板需要横向空间才看得出效果，
 * 挤在 760 里的 hover 动效跟真实使用场景对不上。
 */
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    categories.filter((c) => effectsIn(c.id).length > 0).map((c) => ({ lang, category: c.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const cat = categoryById(category);
  if (!cat) return {};
  return {
    title: `${pick(cat.title, locale)} · ${pick(labCopy.title, locale)} · Mind Studio`,
    description: pick(cat.intro, locale),
    alternates: {
      canonical: `https://mindstudioapps.com/${locale}/lab/${cat.id}`,
      languages: hreflangMap(`/{lang}/lab/${cat.id}`),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  const cat = categoryById(category);
  if (!cat) notFound();
  const items = effectsIn(cat.id);
  if (items.length === 0) notFound();

  return (
    <main className="lab-wide">
      <div className="lab-wide-head">
        <a className="eyebrow-link" href={`/${lang}/lab`}>
          {pick(labCopy.title, lang)}
        </a>
        <h1>
          <span className="cat-dot" style={{ background: cat.accent }} aria-hidden="true" />
          {pick(cat.title, lang)}
        </h1>
        <p className="lab-wide-intro">{pick(cat.intro, lang)}</p>
      </div>

      <div className="fx-grid">
        {items.map((e) => (
          <article className="fx-card" key={e.slug}>
            <EffectFrame
              src={demoPath(e)}
              height={e.height}
              title={pick(e.title, lang)}
              accent={e.accent}
              replayLabel={pick(labCopy.replay, lang)}
            />
            <div className="fx-card-body">
              <h2>
                <a href={`/${lang}/lab/${cat.id}/${e.slug}`}>{pick(e.title, lang)}</a>
              </h2>
              <p>{pick(e.gist, lang)}</p>
              <ul className="fx-chiprow">
                {e.tokens.slice(0, 3).map((tk) => (
                  <li key={tk.label}>
                    <b>{tk.label}</b> {tk.value}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="lab-wide-tail">
        <a className="eyebrow-link" href={`/${lang}/lab`}>
          {pick(labCopy.allCategories, lang)}
        </a>
      </div>
    </main>
  );
}
