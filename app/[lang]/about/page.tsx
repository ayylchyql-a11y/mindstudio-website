import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MsLogo from "@/components/MsLogo";
import { locales, isLocale, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const content = {
  title: { en: "About Mind Studio", zh: "关于 Mind Studio" },
  intro: {
    en: "Mind Studio is one person and a laptop.",
    zh: "Mind Studio 就是一个人和一台电脑。",
  },
  paragraphs: [
    {
      en: "Every app here — the design, the code, the icons, even the words on this page — is made by the same pair of hands. There is no team, no investors, and no roadmap decided in a meeting. Just ideas that wouldn't leave me alone until I built them.",
      zh: "这里的每一款 App —— 设计、代码、图标，乃至这页上的文字 —— 都出自同一双手。没有团队、没有投资人，也没有会议室里定下的路线图。只有那些不肯放过我、非做出来不可的念头。",
    },
    {
      en: "I make small, honest apps: tools I wanted for myself, polished until they felt right on my own phone. If a feature doesn't earn its place, it doesn't ship. If your data doesn't need to leave your device, it doesn't.",
      zh: "我做小而诚实的 App：都是我自己想用的工具，打磨到在我自己手机上顺手为止。一个功能配不上它的位置，就不会上线；你的数据没必要离开设备，就不会离开。",
    },
    {
      en: "From an expense tracker to a sound machine to a camera that films both sides of a moment — they don't share a category, only a maker and a way of working: quietly, carefully, one app at a time.",
      zh: "从记账工具，到助眠声音，再到同时拍下此刻两面的相机 —— 它们不属于同一个品类，只共享同一个作者和同一种做事方式：安静、细致，一次做好一件。",
    },
  ],
  closing: {
    en: "If something here resonates — or breaks — I'd love to hear from you.",
    zh: "如果这里有什么打动了你 —— 或者出了问题 —— 我很想听到你的声音。",
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
    title: `${content.title[locale]} · Mind Studio`,
    description: content.paragraphs[0][locale],
    alternates: { canonical: `https://mindstudioapps.com/${locale}/about` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <main className="prose-page about-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <div className="about-mark">
        <MsLogo label="Mind Studio logo" />
      </div>
      <h1>{content.title[lang]}</h1>
      <p className="prose-intro">{content.intro[lang]}</p>
      {content.paragraphs.map((p, i) => (
        <p key={i} className="about-para">
          {p[lang]}
        </p>
      ))}
      <p className="about-para">
        {content.closing[lang]}{" "}
        <a href="mailto:ayylchyql@gmail.com">ayylchyql@gmail.com</a>
      </p>
    </main>
  );
}
