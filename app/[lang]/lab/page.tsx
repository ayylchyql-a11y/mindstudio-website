import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeCategories, demoPath, effectsIn, labCopy } from "@/data/effects";
import CategoryPreview from "@/components/CategoryPreview";
import { ENGLISH_ONLY, altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

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
    title: `${pick(labCopy.title, locale)} · Mind Studio`,
    description: pick(labCopy.intro, locale),
    alternates: altsFor("/{lang}/lab", locale, ENGLISH_ONLY),
  };
}

export default async function LabIndex({ params }: { params: Promise<{ lang: string }> }) {
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
        每个模块一张卡，卡里一个在跑的预览。四个效果标题那一行去掉了 ——
        有了真在动的样板，它说的东西预览已经说了，而且更清楚。
        「N 条效果」留着：那是预览**看不出来**的信息（一屏只轮到一条）。

        🩸 预览不是链接、标题那一行才是。整张卡包成 <a> 的话，轮播的圆点
           就嵌在链接里点不了，而 demo 本身也需要能被直接碰（这个库的卖点
           就是「可以碰」）。
      */}
      <ul className="cat-list">
        {cats.map((c) => {
          const items = effectsIn(c.id);
          return (
            <li className="cat-card" key={c.id}>
              <CategoryPreview
                lang={lang}
                /* 自己会演的排最前 —— 落地那一眼卡片得是活的。
                   其余保持原顺序（sort 是稳定的）。 */
                slides={[...items]
                  .sort((a, b) => (a.plays === "self" ? 0 : 1) - (b.plays === "self" ? 0 : 1))
                  .map((e) => ({
                    slug: e.slug,
                    title: pick(e.title, lang),
                    accent: e.accent,
                    src: demoPath(e),
                    plays: e.plays,
                    poster: e.poster,
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
