import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyBox from "@/components/CopyBox";
import EffectFrame from "@/components/EffectFrame";
import { categoryById, demoPath, effectBySlug, effects, effectsIn, labCopy } from "@/data/effects";
import { readDemoSource } from "@/lib/effect-source";
import { defaultLocale, getDictionary, hreflangMap, isLocale, locales, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    effects.map((e) => ({ lang, category: e.category, slug: e.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, category, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const e = effectBySlug(category, slug);
  if (!e) return {};
  const url = `https://mindstudioapps.com/${locale}/lab/${category}/${slug}`;
  return {
    title: `${pick(e.title, locale)} · Mind Studio`,
    description: pick(e.gist, locale),
    alternates: { canonical: url, languages: hreflangMap(`/{lang}/lab/${category}/${slug}`) },
    openGraph: {
      title: pick(e.title, locale),
      description: pick(e.gist, locale),
      url,
      siteName: "Mind Studio",
      type: "article",
    },
  };
}

export default async function EffectPage({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}) {
  const { lang, category, slug } = await params;
  if (!isLocale(lang)) notFound();
  const e = effectBySlug(category, slug);
  const cat = categoryById(category);
  if (!e || !cat) notFound();
  const t = getDictionary(lang);

  // 源码在构建时从 public/effects/<slug>.html 读出来 —— 单一真相，不会跟 demo 漂移
  const source = readDemoSource(e.slug);
  const siblings = effectsIn(cat.id).filter((x) => x.slug !== e.slug);

  return (
    <main className="prose-page lab-detail">
      <a className="eyebrow-link" href={`/${lang}/lab/${cat.id}`}>
        {pick(cat.title, lang)}
      </a>
      <h1>{pick(e.title, lang)}</h1>
      <p className="prose-intro">{pick(e.gist, lang)}</p>

      <div className="fx-hero">
        <EffectFrame
          src={demoPath(e)}
          height={e.height}
          title={pick(e.title, lang)}
          accent={e.accent}
          replayLabel={pick(labCopy.replay, lang)}
        />
      </div>

      <h2>{pick(labCopy.howTitle, lang)}</h2>
      <ul className="note-ul">
        {e.anatomy.map((line, i) => (
          // anatomy 里的 <code>/<b> 是我自己写在 data/effects.ts 里的常量，
          // 不是用户输入 —— 跟 notes 的正文一个来路，所以这里是安全的。
          <li key={i} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </ul>

      <h2>{pick(labCopy.tokensTitle, lang)}</h2>
      <dl className="fx-tokens">
        {e.tokens.map((tk) => (
          <div key={tk.label}>
            <dt>{tk.label}</dt>
            <dd>{tk.value}</dd>
          </div>
        ))}
      </dl>

      <h2>{pick(labCopy.promptTitle, lang)}</h2>
      <p>{pick(labCopy.promptHint, lang)}</p>
      <CopyBox
        variant="prompt"
        body={e.prompt}
        copyLabel={pick(labCopy.copy, lang)}
        doneLabel={pick(labCopy.copied, lang)}
      />

      <h2>{pick(labCopy.sourceTitle, lang)}</h2>
      <p>{pick(labCopy.sourceHint, lang)}</p>
      <CopyBox
        body={source}
        label={`${e.slug}.html`}
        copyLabel={pick(labCopy.copy, lang)}
        doneLabel={pick(labCopy.copied, lang)}
      />

      {e.caveats?.length ? (
        <>
          <h2>{pick(labCopy.caveatsTitle, lang)}</h2>
          <ul className="note-ul">
            {e.caveats.map((c, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: c }} />
            ))}
          </ul>
        </>
      ) : null}

      {e.source ? (
        <>
          <h2>{pick(labCopy.fromTitle, lang)}</h2>
          <p className="fx-source">
            {e.source.url ? (
              <a href={e.source.url} rel="noopener noreferrer nofollow" target="_blank">
                {e.source.label}
              </a>
            ) : (
              e.source.label
            )}
            {e.source.at ? <span className="fx-source-at"> · {e.source.at}</span> : null}
          </p>
        </>
      ) : null}

      {siblings.length ? (
        <aside className="note-tail">
          <p>{pick(cat.title, lang)}</p>
          <div className="fx-siblings">
            {siblings.map((s) => (
              <a key={s.slug} href={`/${lang}/lab/${cat.id}/${s.slug}`}>
                {pick(s.title, lang)}
              </a>
            ))}
          </div>
        </aside>
      ) : (
        <aside className="note-tail">
          <a href={`/${lang}/lab`}>{pick(labCopy.allCategories, lang)}</a>
          <span aria-hidden="true"> · </span>
          <a href={`/${lang}`}>{t.backHome}</a>
        </aside>
      )}
    </main>
  );
}
