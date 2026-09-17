import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TemplateViewer from "@/components/TemplateViewer";
import { TEMPLATES_LANGS, brandOf, groupById, pagePath, posterPath, styles, templateBySlug, templates, templatesCopy, templatesIn } from "@/data/templates";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => templates.map((t) => ({ lang, slug: t.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const tp = templateBySlug(slug);
  if (!tp) return {};
  const alternates = altsFor(`/{lang}/templates/${slug}`, locale, TEMPLATES_LANGS);
  const title = `${tp.name} — ${pick(tp.industry, locale)}`;
  return {
    title: `${title} · ${pick(templatesCopy.title, locale)} · Mind Studio`,
    description: pick(tp.gist, locale),
    alternates,
    openGraph: {
      title,
      description: pick(tp.gist, locale),
      url: alternates.canonical,
      siteName: "Mind Studio",
      type: "website",
      images: [{ url: `https://mindstudioapps.com${posterPath(tp, "original")}`, width: 1200, height: 750 }],
    },
  };
}

/**
 * 一套模版一页：四种设计放在同一个取景框里切换（TemplateViewer），
 * 下面是这套里做了什么、以及同一行业的其它模版。
 * 走 .prose-page 的 760 阅读栏，但取景框跟 /lab 的陈列区一样挣脱到 1080 ——
 * 一个网站的桌面布局在 760 里看是平板视图，不是它该有的样子。
 */
export default async function TemplatePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const tp = templateBySlug(slug);
  const group = tp ? groupById(tp.group) : undefined;
  if (!tp || !group) notFound();
  const t = getDictionary(lang);
  const siblings = templatesIn(group.id).filter((x) => x.slug !== tp.slug);

  const designs = styles.map((s) => ({
    id: s.id,
    brand: brandOf(tp, s.id),
    style: pick(s.title, lang),
    gist: pick(s.gist, lang),
    src: pagePath(tp, s.id),
    poster: posterPath(tp, s.id),
  }));

  return (
    <main className="prose-page tpl-page tpl-detail" style={{ ["--accent-line" as string]: tp.accent }}>
      <a className="eyebrow-link" href={`/${lang}/templates#${group.id}`}>
        {pick(group.title, lang)}
      </a>
      <h1>{tp.name}</h1>
      <p className="updated">
        {pick(tp.industry, lang)} · {tp.city}
      </p>
      <p className="prose-intro">{pick(tp.gist, lang)}</p>

      <div className="tpl-stage">
        <TemplateViewer designs={designs} openLabel={pick(templatesCopy.openFull, lang)} />
      </div>

      <h2>{pick(templatesCopy.featuresTitle, lang)}</h2>
      <ul className="note-ul">
        {tp.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <p className="tpl-note">{pick(templatesCopy.demoNote, lang)}</p>

      <p className="tpl-cta">
        {pick(templatesCopy.cta, lang)} <a href={`mailto:ayylchyql@gmail.com?subject=${encodeURIComponent(tp.name)}`}>ayylchyql@gmail.com</a>
      </p>

      <aside className="note-tail">
        {siblings.length ? (
          <>
            <p>{pick(group.title, lang)}</p>
            <div className="fx-siblings">
              {siblings.map((s) => (
                <a key={s.slug} href={`/${lang}/templates/${s.slug}`}>
                  {s.name} · {pick(s.industry, lang)}
                </a>
              ))}
            </div>
          </>
        ) : null}
        <p className="tpl-tail-links">
          <a href={`/${lang}/templates`}>{pick(templatesCopy.allGroups, lang)}</a>
          <span aria-hidden="true"> · </span>
          <a href={`/${lang}`}>{t.backHome}</a>
        </p>
      </aside>
    </main>
  );
}
