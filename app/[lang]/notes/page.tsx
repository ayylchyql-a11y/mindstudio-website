import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { notes, formatNoteDate } from "@/data/notes";
import { locales, isLocale, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const copy = {
  title: { en: "Notes", zh: "笔记" },
  intro: {
    en: "Things that broke, and what they turned out to be. Written down mostly so the next person searching the same error message finds something better than a forum thread with no replies.",
    zh: "出过的问题，以及最后查明是什么。写下来主要是为了让下一个搜同一条报错的人，能找到比一个没人回复的论坛帖更有用的东西。",
  },
  englishOnly: {
    en: "",
    zh: "正文是英文的 —— 这些查询本来就只有英文有搜索量。",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return {
    title: `${copy.title[locale]} · Mind Studio`,
    description: copy.intro[locale],
    alternates: {
      canonical: `https://mindstudioapps.com/${locale}/notes`,
      languages: { en: "/en/notes", "zh-CN": "/zh/notes" },
    },
  };
}

export default async function NotesIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const sorted = [...notes].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="prose-page notes-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <h1>{copy.title[lang]}</h1>
      <p className="prose-intro">{copy.intro[lang]}</p>
      {copy.englishOnly[lang] ? <p className="notes-lang-hint">{copy.englishOnly[lang]}</p> : null}

      <ol className="note-list">
        {sorted.map((n) => (
          <li key={n.slug}>
            <a className="note-row" href={`/${lang}/notes/${n.slug}`}>
              <time dateTime={n.date}>{formatNoteDate(n.date, lang)}</time>
              <span className="nt">{n.title[lang]}</span>
              <span className="ns">{n.summary[lang]}</span>
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
