import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeCategories, effectsIn, labCopy } from "@/data/effects";
import { defaultLocale, getDictionary, hreflangMap, isLocale, locales, pick, type Locale } from "@/lib/i18n";

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
    alternates: {
      canonical: `https://mindstudioapps.com/${locale}/lab`,
      languages: hreflangMap("/{lang}/lab"),
    },
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

      <ul className="cat-list">
        {cats.map((c) => {
          const items = effectsIn(c.id);
          return (
            <li key={c.id}>
              <a className="cat-row" href={`/${lang}/lab/${c.id}`}>
                <span className="cat-head">
                  <span className="cat-dot" style={{ background: c.accent }} aria-hidden="true" />
                  <span className="cat-name">{pick(c.title, lang)}</span>
                  <span className="cat-count">
                    {items.length} {pick(labCopy.count, lang)}
                  </span>
                </span>
                <span className="cat-intro">{pick(c.intro, lang)}</span>
                <span className="cat-peek">
                  {items.slice(0, 4).map((e) => (
                    <span key={e.slug}>{pick(e.title, lang)}</span>
                  ))}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
