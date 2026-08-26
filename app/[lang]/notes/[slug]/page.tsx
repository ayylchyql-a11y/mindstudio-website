import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { notes, noteBySlug, formatNoteDate, type Block } from "@/data/notes";
import { defaultLocale, getDictionary, hreflangMap, isLocale, locales, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => notes.map((n) => ({ lang, slug: n.slug })));
}

const copy = {
  back: { en: "Notes", zh: "笔记" },
  tail: {
    en: "I build iPhone apps on my own, and run the software for a sushi restaurant in a small Italian town. Notes like this one come out of both.",
    zh: "我一个人做 iPhone app，同时给意大利一个小城的寿司店做整套系统。这类笔记是这两条线的副产品。",
  },
  tailLink: { en: "See what I've shipped", zh: "看看我做过什么" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const note = noteBySlug(slug);
  if (!note) return {};
  const url = `https://mindstudioapps.com/${locale}/notes/${slug}`;
  return {
    title: `${note.title[locale]} · Mind Studio`,
    description: note.summary[locale],
    alternates: {
      canonical: url,
      languages: hreflangMap(`/{lang}/notes/${slug}`),
    },
    openGraph: {
      title: note.title[locale],
      description: note.summary[locale],
      url,
      siteName: "Mind Studio",
      type: "article",
      publishedTime: note.date,
    },
  };
}

/**
 * 正文渲染。
 * `en` 字段里允许出现 <b> / <code> / <a>，是我自己写的常量，不是用户输入 —— 
 * 所以 dangerouslySetInnerHTML 在这里是安全的。数据全部来自 data/notes.ts。
 */
function renderBlock(b: Block, i: number, lang: Locale) {
  switch (b.t) {
    case "h2":
      return <h2 key={i} dangerouslySetInnerHTML={{ __html: b.en }} />;
    case "p":
      return <p key={i} dangerouslySetInnerHTML={{ __html: b.en }} />;
    case "note":
      return <p key={i} className="note-callout" dangerouslySetInnerHTML={{ __html: b.en }} />;
    case "ul":
      return (
        <ul key={i} className="note-ul">
          {b.items.map((it, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      );
    case "img":
      return (
        <figure key={i} className="note-fig">
          {/* 这些图是我自己截的、放在 public/notes/ 下的静态资源，尺寸固定，
              用 <img> 就够了 —— 引 next/image 只是为了一个 CDN 转码，不值得。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} loading="lazy" />
          {b.caption ? <figcaption>{pick(b.caption, lang)}</figcaption> : null}
        </figure>
      );
    case "code":
      return (
        <figure key={i} className="note-code">
          <pre>
            <code>{b.body}</code>
          </pre>
          {b.caption ? <figcaption>{pick(b.caption, lang)}</figcaption> : null}
        </figure>
      );
  }
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const note = noteBySlug(slug);
  if (!note) notFound();
  const t = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: note.title.en,
    description: note.summary.en,
    datePublished: note.date,
    dateModified: note.date,
    inLanguage: "en",
    author: { "@type": "Organization", name: "Mind Studio", url: "https://mindstudioapps.com" },
    publisher: { "@type": "Organization", name: "Mind Studio", url: "https://mindstudioapps.com" },
    mainEntityOfPage: `https://mindstudioapps.com/${lang}/notes/${slug}`,
  };

  return (
    <main className="prose-page note-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="eyebrow-link" href={`/${lang}/notes`}>
        {pick(copy.back, lang)}
      </a>
      <h1>{pick(note.title, lang)}</h1>
      <p className="updated">
        <time dateTime={note.date}>{formatNoteDate(note.date, lang)}</time>
      </p>
      <article className="note-body">{note.body.map((b, i) => renderBlock(b, i, lang))}</article>
      <aside className="note-tail">
        <p>{pick(copy.tail, lang)}</p>
        <a href={`/${lang}`}>{pick(copy.tailLink, lang)}</a>
        <span aria-hidden="true"> · </span>
        <a href={`/${lang}/about`}>{t.aboutLabel}</a>
      </aside>
    </main>
  );
}
