import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyBox from "@/components/CopyBox";
import EffectFrame from "@/components/EffectFrame";
import EffectVideo from "@/components/EffectVideo";
import LabCta, { fullPathFor } from "@/components/lab/LabCta";
import { blurbOf } from "@/data/effect-blurbs";
import { categoryById, demoPath, effectBySlug, effects, effectsIn, isOpen, labCopy, posterPath, videoPath } from "@/data/effects";
import { readDemoSource } from "@/lib/effect-source";
import { ENGLISH_ONLY, altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * 一条效果的详情页 —— 两棵路由树共用（见 lib/lab-gate.ts 顶部）：
 *   `full = false`  公开橱窗版：标题、一句话、录屏、介绍、招揽 → /servizi
 *   `full = true`   完整版：可交互样板、拆解、参数、提示词、源码
 * OPEN_SLUGS 里那几条在公开树上也是完整版。
 */
export type EffectParams = Promise<{ lang: string; category: string; slug: string }>;

export function effectStaticParams() {
  return locales.flatMap((lang) =>
    effects.map((e) => ({ lang, category: e.category, slug: e.slug }))
  );
}

export async function effectMetadata(params: EffectParams, full: boolean): Promise<Metadata> {
  const { lang, category, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const e = effectBySlug(category, slug);
  if (!e) return {};
  // 完整版树 noindex、canonical 仍指公开地址：Google 眼里只有一份。
  const alternates = altsFor(`/{lang}/lab/${category}/${slug}`, locale, ENGLISH_ONLY);
  return {
    title: `${pick(e.title, locale)} · Mind Studio`,
    description: pick(e.gist, locale),
    alternates,
    robots: full ? { index: false, follow: false } : undefined,
    openGraph: {
      title: pick(e.title, locale),
      description: pick(e.gist, locale),
      url: alternates.canonical,
      siteName: "Mind Studio",
      type: "article",
    },
  };
}

export default async function LabEffectPage({ params, full }: { params: EffectParams; full: boolean }) {
  const { lang, category, slug } = await params;
  if (!isLocale(lang)) notFound();
  const e = effectBySlug(category, slug);
  const cat = categoryById(category);
  if (!e || !cat) notFound();
  const t = getDictionary(lang);
  const showFull = full || isOpen(e);

  // 源码在构建时从 public/effects/<slug>.html 读出来 —— 单一真相，不会跟 demo 漂移。
  // 🩸目录型的成品作品（bundleDir）没有「那一个文件」：它的产物是 1MB 打包 bundle，
  //   贴出来对读的人没有任何意义，而且 readDemoSource 会直接 ENOENT 把构建打断。
  // 🩸公开版**不读**：读了就算不渲染，也没必要让构建多做 84 次无用功。
  const source = showFull && !e.bundleDir ? readDemoSource(e.slug) : null;
  const siblings = effectsIn(cat.id).filter((x) => x.slug !== e.slug);

  return (
    <main className="prose-page lab-detail">
      <a className="eyebrow-link" href={`/${lang}/lab/${cat.id}`}>
        {pick(cat.title, lang)}
      </a>
      <h1>{pick(e.title, lang)}</h1>
      <p className="prose-intro">{pick(e.gist, lang)}</p>

      <div className="fx-hero">
        {showFull ? (
          <EffectFrame
            src={demoPath(e)}
            height={e.height}
            title={pick(e.title, lang)}
            accent={e.accent}
            lang={lang}
          />
        ) : (
          <EffectVideo
            src={videoPath(e)}
            poster={posterPath(e)}
            height={e.height}
            title={pick(e.title, lang)}
            accent={e.accent}
          />
        )}
      </div>

      {showFull ? (
        <>
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

          {source !== null ? (
            <>
              <h2>{pick(labCopy.sourceTitle, lang)}</h2>
              <p>{pick(labCopy.sourceHint, lang)}</p>
              <CopyBox
                body={source}
                label={`${e.slug}.html`}
                copyLabel={pick(labCopy.copy, lang)}
                doneLabel={pick(labCopy.copied, lang)}
              />
            </>
          ) : null}

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
        </>
      ) : (
        <>
          <h2>{pick(labCopy.aboutTitle, lang)}</h2>
          <p>{blurbOf(e.slug)}</p>
          <LabCta lang={lang} fullPath={fullPathFor(lang, `/${cat.id}/${e.slug}`)} />
        </>
      )}

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
