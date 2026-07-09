export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export type Localized = Record<Locale, string>;

export interface Dictionary {
  htmlLang: string;
  metaTitle: string;
  metaDescription: string;
  navLangSwitch: string;
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSub: string;
  scroll: string;
  learnMore: string;
  comingSoon: string;
  badgeSmall: string;
  badgeStore: string;
  futureTitle: string;
  futureBody: string;
  footerRights: string;
  footerPrivacy: string;
  footerSupport: string;
  footerPress: string;
  footerContact: string;
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    htmlLang: "en",
    metaTitle: "Mind Studio — Apps by Ming",
    metaDescription:
      "Mind Studio is a one-person app workshop. Small, honest apps for iPhone — M Budget, M Alpha Relax, M Card Wallet, M Double Camera, HelloSecret — each designed, built and polished by the same pair of hands.",
    navLangSwitch: "中文",
    heroEyebrow: "Mind Studio · Independent App Workshop",
    heroTitleLine1: "One maker.",
    heroTitleLine2: "A family of apps.",
    heroSub:
      "Small, honest apps for iPhone, crafted at Mind Studio — a one-person workshop where every app is designed, built and polished by the same pair of hands.",
    scroll: "Scroll",
    learnMore: "Learn more",
    comingSoon: "Coming soon",
    badgeSmall: "Download on the",
    badgeStore: "App Store",
    futureTitle: "The family keeps growing.",
    futureBody:
      "New ideas are always in the workshop. Every app that ships will live here — same care, same craft.",
    footerRights: "© 2026 Mind Studio. All rights reserved.",
    footerPrivacy: "Privacy",
    footerSupport: "Support",
    footerPress: "Press Kit",
    footerContact: "Contact",
  },
  zh: {
    htmlLang: "zh-CN",
    metaTitle: "Mind Studio — 独立开发者的 App 家族",
    metaDescription:
      "Mind Studio 是一个人的 App 工作室。为 iPhone 打造小而美的 App —— M Budget、M Alpha Relax、M Card Wallet、M Double Camera、HelloSecret —— 每一款都由同一双手设计、开发、打磨。",
    navLangSwitch: "EN",
    heroEyebrow: "Mind Studio · 独立 App 工作室",
    heroTitleLine1: "一个人，",
    heroTitleLine2: "一个 App 家族。",
    heroSub:
      "Mind Studio 出品的 iPhone 小而美 App —— 一个人的工作室，每一款都由同一双手设计、开发、打磨。",
    scroll: "向下滚动",
    learnMore: "了解更多",
    comingSoon: "即将推出",
    badgeSmall: "下载于",
    badgeStore: "App Store",
    futureTitle: "这个家族，仍在生长。",
    futureBody:
      "工作室里总有新的想法。每一款上架的 App 都会出现在这里 —— 同样的用心，同样的手艺。",
    footerRights: "© 2026 Mind Studio. 保留所有权利。",
    footerPrivacy: "隐私政策",
    footerSupport: "支持",
    footerPress: "媒体资源",
    footerContact: "联系",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
