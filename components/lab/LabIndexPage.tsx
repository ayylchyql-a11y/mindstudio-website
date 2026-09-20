import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeCategories, effectsIn, labCopy, posterPath, videoPath } from "@/data/effects";
import CategoryPreview from "@/components/CategoryPreview";
import { ENGLISH_ONLY, altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * /lab 总览 —— 两棵路由树共用（lib/lab-gate.ts）。轮播放的是录屏，公开版和完整版
 * 长得一样；`full` 只影响 metadata（完整版 noindex）。
 */
export type IndexParams = Promise<{ lang: string }>;

export function indexStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function indexMetadata(params: IndexParams, full: boolean): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return {
    title: `${pick(labCopy.title, locale)} · Mind Studio`,
    description: pick(labCopy.intro, locale),
    alternates: altsFor("/{lang}/lab", locale, ENGLISH_ONLY),
    robots: full ? { index: false, follow: false } : undefined,
  };
}

export default async function LabIndexPage({ params }: { params: IndexParams }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const cats = activeCategories();

  return (
    <main className="prose-page lab-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <h1>{pick(labCopy.title, lang)}</h1>
      <p className="prose-intro">{pick(labCopy.intro, lang)}</p>
      {pick(labCopy.englishOnly, lang) ? (
        <p className="notes-lang-hint">{pick(labCopy.englishOnly, lang)}</p>
      ) : null}

      {/*
        每个模块一张卡，卡里一段在播的录屏。「N 条效果」留着：那是预览**看不出来**的信息
        （一屏只轮到一条）。
      */}
      <ul className="cat-list">
        {cats.map((c) => {
          const items = effectsIn(c.id);
          return (
            <li className="cat-card" key={c.id}>
              <CategoryPreview
                lang={lang}
                slides={items.map((e) => ({
                  slug: e.slug,
                  title: pick(e.title, lang),
                  accent: e.accent,
                  video: videoPath(e),
                  poster: posterPath(e),
                  href: `/${lang}/lab/${c.id}/${e.slug}`,
                }))}
              />
              <a className="cat-row" href={`/${lang}/lab/${c.id}`}>
                <span className="cat-head">
                  <span className="cat-dot" style={{ background: c.accent }} aria-hidden="true" />
                  <span className="cat-name">{pick(c.title, lang)}</span>
                  <span className="cat-count">
                    {items.length} {pick(labCopy.count, lang)}
                  </span>
                </span>
                <span className="cat-intro">{pick(c.intro, lang)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
