import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyBox from "@/components/CopyBox";
import EffectFrame from "@/components/EffectFrame";
import EffectVideo from "@/components/EffectVideo";
import LabCta, { fullPathFor } from "@/components/lab/LabCta";
import { categories, categoryById, demoPath, effectsIn, isOpen, labCopy, posterPath, videoPath } from "@/data/effects";
import { readDemoSource } from "@/lib/effect-source";
import { ENGLISH_ONLY, altsFor, defaultLocale, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/**
 * 一个分类一页，同类效果并排展示 —— 这是这个库最主要的用法：
 * 想找一个背景效果时，把所有背景效果摆在一起看，而不是一条条点进去。
 *
 * 布局比 `.prose-page` 宽（1080 而不是 760）：样板需要横向空间才看得出效果，
 * 挤在 760 里的 hover 动效跟真实使用场景对不上。
 *
 * 两棵路由树共用（见 lib/lab-gate.ts 顶部）：公开版每张卡是录屏 + 标题 + 一句话；
 * 完整版（和 OPEN_SLUGS 那几条）是可交互样板 + 参数 + 代码/提示词。
 */
export type CategoryParams = Promise<{ lang: string; category: string }>;

export function categoryStaticParams() {
  return locales.flatMap((lang) =>
    categories.filter((c) => effectsIn(c.id).length > 0).map((c) => ({ lang, category: c.id }))
  );
}

export async function categoryMetadata(params: CategoryParams, full: boolean): Promise<Metadata> {
  const { lang, category } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const cat = categoryById(category);
  if (!cat) return {};
  return {
    title: `${pick(cat.title, locale)} · ${pick(labCopy.title, locale)} · Mind Studio`,
    description: pick(cat.intro, locale),
    // 拆解正文（anatomy / tokens / prompt / caveats）本来就只有英文。
    alternates: altsFor(`/{lang}/lab/${cat.id}`, locale, ENGLISH_ONLY),
    robots: full ? { index: false, follow: false } : undefined,
  };
}

export default async function LabCategoryPage({ params, full }: { params: CategoryParams; full: boolean }) {
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
        {items.map((e) => {
          const showFull = full || isOpen(e);
          return (
            <article className="fx-card" key={e.slug}>
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
              <div className="fx-card-body">
                <h2>
                  <a href={`/${lang}/lab/${cat.id}/${e.slug}`}>{pick(e.title, lang)}</a>
                </h2>
                <p>{pick(e.gist, lang)}</p>
                {showFull ? (
                  <>
                    <ul className="fx-chiprow">
                      {e.tokens.slice(0, 3).map((tk) => (
                        <li key={tk.label}>
                          <b>{tk.label}</b> {tk.value}
                        </li>
                      ))}
                    </ul>

                    {/*
                      原生 <details>：展开这件事不需要一行 JS，所以就算脚本没跑完
                      （或者根本没跑）这两个按钮也是能用的。站里的语言菜单是同样的做法。
                      CopyBox 里的复制按钮才需要 JS，那是纯增强。
                    */}
                    <div className="fx-actions">
                      {/* 🩸目录型成品（bundleDir）没有「那一个 html」可给：
                          它的产物是 1MB 打包 bundle，而且 readDemoSource 会 ENOENT
                          把整个构建打断（第一次就是这么红的）。这类作品只给提示词。 */}
                      {e.bundleDir ? null : (
                        <details className="fx-disclose">
                          <summary>{pick(labCopy.codeBtn, lang)}</summary>
                          <div className="fx-disclose-body">
                            <CopyBox
                              body={readDemoSource(e.slug)}
                              label={`${e.slug}.html`}
                              copyLabel={pick(labCopy.copy, lang)}
                              doneLabel={pick(labCopy.copied, lang)}
                            />
                          </div>
                        </details>
                      )}
                      <details className="fx-disclose">
                        <summary>{pick(labCopy.promptBtn, lang)}</summary>
                        <div className="fx-disclose-body">
                          <CopyBox
                            variant="prompt"
                            body={e.prompt}
                            copyLabel={pick(labCopy.copy, lang)}
                            doneLabel={pick(labCopy.copied, lang)}
                          />
                        </div>
                      </details>
                    </div>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {full ? null : <LabCta lang={lang} fullPath={fullPathFor(lang, `/${cat.id}`)} />}

      <div className="lab-wide-tail">
        <a className="eyebrow-link" href={`/${lang}/lab`}>
          {pick(labCopy.allCategories, lang)}
        </a>
      </div>
    </main>
  );
}
