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
  backToApps: string;
  detailFeatures: string;
  detailGallery: string;
  comingSoonNote: string;
  privacyLabel: string;
  supportLabel: string;
  privacyIndexTitle: string;
  privacyIndexIntro: string;
  supportTitle: string;
  supportIntro: string;
  supportContactHeading: string;
  supportContactBody: string;
  supportPrivacyHeading: string;
  viewPrivacy: string;
  backHome: string;
  aboutLabel: string;
  notesLabel: string;
  workEyebrow: string;
  workTitle: string;
  workBody: string;
  workCta: string;
  workSystemLabel: string;
  workStackLabel: string;
  workLinksLabel: string;
  workFeaturesLabel: string;
  workAndroidPending: string;
  badgePlaySmall: string;
  badgePlayStore: string;
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
    backToApps: "All apps",
    detailFeatures: "Features",
    detailGallery: "A closer look",
    comingSoonNote: "In the workshop now — coming to the App Store soon.",
    privacyLabel: "Privacy Policy",
    supportLabel: "Support",
    privacyIndexTitle: "Privacy",
    privacyIndexIntro:
      "Every Mind Studio app is built to respect your privacy. Choose an app to read its full policy.",
    supportTitle: "Support",
    supportIntro:
      "Questions, feedback, or a bug to report? Mind Studio is a one-person workshop, and every message reaches the maker directly.",
    supportContactHeading: "Get in touch",
    supportContactBody:
      "Email ayylchyql@gmail.com — I read every message and reply as soon as I can.",
    supportPrivacyHeading: "Privacy policies",
    viewPrivacy: "Read policy",
    backHome: "Home",
    aboutLabel: "About",
    notesLabel: "Notes",
    workEyebrow: "Beyond the app family",
    workTitle: "One more thing built here.",
    workBody:
      "Not everything from this workshop sits on a shelf as an app. A sushi restaurant near Milan runs its whole ordering operation on a system built here — customer apps, ordering site, back office, rider app, backend.",
    workCta: "See the case study",
    workSystemLabel: "What's in it",
    workStackLabel: "Built with",
    workLinksLabel: "Links",
    workFeaturesLabel: "In the customer app",
    workAndroidPending: "Android in review",
    badgePlaySmall: "Get it on",
    badgePlayStore: "Google Play",
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
    backToApps: "全部作品",
    detailFeatures: "功能亮点",
    detailGallery: "细节一览",
    comingSoonNote: "正在工作室打磨中 —— 即将登陆 App Store。",
    privacyLabel: "隐私政策",
    supportLabel: "支持",
    privacyIndexTitle: "隐私政策",
    privacyIndexIntro: "Mind Studio 的每一款 App 都尊重你的隐私。选择一款查看它的完整政策。",
    supportTitle: "支持",
    supportIntro:
      "有疑问、建议，或想反馈问题？Mind Studio 是一个人的工作室，每一条消息都会直接到达作者本人。",
    supportContactHeading: "联系方式",
    supportContactBody: "发邮件到 ayylchyql@gmail.com —— 我会读每一封，并尽快回复。",
    supportPrivacyHeading: "各 App 隐私政策",
    viewPrivacy: "查看政策",
    backHome: "首页",
    aboutLabel: "关于",
    notesLabel: "笔记",
    workEyebrow: "App 家族之外",
    workTitle: "这里还做出过一件更大的东西。",
    workBody:
      "工作室的产出并不都是货架上的一款 App。米兰近郊的一家寿司餐厅，整套点单生意就跑在这里做的系统上 —— 顾客 App、点单网站、店内后台、骑手 App、后端。",
    workCta: "查看案例",
    workSystemLabel: "系统构成",
    workStackLabel: "技术栈",
    workLinksLabel: "相关链接",
    workFeaturesLabel: "顾客 App 亮点",
    workAndroidPending: "安卓审核中",
    badgePlaySmall: "下载于",
    badgePlayStore: "Google Play",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
