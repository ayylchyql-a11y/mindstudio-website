import type { Localized } from "@/lib/i18n";

export type AppStatus = "live" | "soon";

export interface AppEntry {
  id: string;
  name: string;
  headlinePre: Localized;
  headlineGrad: Localized;
  headlinePost: Localized;
  gradientCss: string;
  desc: Localized;
  status: AppStatus;
  appStoreUrl?: string;
  accent: string;
  sectionClass: "sect-light" | "sect-dark" | "sect-relax" | "sect-secret";
  flip: boolean;
  icon: string;
  shot?: string;
  shotAlt?: Localized;
}

export const apps: AppEntry[] = [
  {
    id: "budget",
    name: "M Budget",
    headlinePre: { en: "Money, made ", zh: "记账，" },
    headlineGrad: { en: "mindful", zh: "更走心" },
    headlinePost: { en: ".", zh: "。" },
    gradientCss: "linear-gradient(100deg, #00c2a8, #2563c9)",
    desc: {
      en: "Track every expense in seconds. Five hand-crafted themes, iCloud sync, budgets that keep up with you — on iPhone and iPad.",
      zh: "几秒记下每一笔。五款精心设计的主题、iCloud 同步、跟得上你的预算 —— iPhone 与 iPad 都好用。",
    },
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6780538389",
    accent: "#00a38c",
    sectionClass: "sect-light",
    flip: false,
    icon: "/icons/mbudget.png",
    shot: "/shots/mbudget-home.jpg",
    shotAlt: { en: "M Budget home screen", zh: "M Budget 首页" },
  },
  {
    id: "relax",
    name: "M Alpha Relax",
    headlinePre: { en: "Tune out. ", zh: "放空，" },
    headlineGrad: { en: "Tune in.", zh: "回到当下。" },
    headlinePost: { en: "", zh: "" },
    gradientCss: "linear-gradient(100deg, #2f9de0, #6f5de0)",
    desc: {
      en: "Binaural beats and isochronic tones, engineered to settle your mind — for deep focus, better sleep, or one long breath in between.",
      zh: "双耳节拍与等时音调，为你安放思绪 —— 深度专注、更好睡眠，或只是长长地喘口气。",
    },
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6787405665",
    accent: "#2f80c9",
    sectionClass: "sect-relax",
    flip: true,
    icon: "/icons/malpharelax.png",
    shot: "/shots/malpharelax-home.jpg",
    shotAlt: { en: "M Alpha Relax home screen", zh: "M Alpha Relax 首页" },
  },
  {
    id: "camera",
    name: "M Double Camera",
    headlinePre: { en: "Both sides of ", zh: "同框，" },
    headlineGrad: { en: "the moment", zh: "此刻的两面" },
    headlinePost: { en: ".", zh: "。" },
    gradientCss: "linear-gradient(100deg, #ff9f0a, #ff5a3c)",
    desc: {
      en: "Front and back cameras in a single shot. Capture the sunset and your face lighting up — one photo, one video, zero editing.",
      zh: "前后摄像头，一次拍下。夕阳与你惊喜的脸同框 —— 一张照片、一段视频，无需后期。",
    },
    status: "soon",
    accent: "#e0620d",
    sectionClass: "sect-light",
    flip: false,
    icon: "/icons/mdoublecamera.png",
  },
  {
    id: "wallet",
    name: "M Card Wallet",
    headlinePre: { en: "Every card. ", zh: "所有卡片，" },
    headlineGrad: { en: "One glow.", zh: "一屏发光。" },
    headlinePost: { en: "", zh: "" },
    gradientCss: "linear-gradient(100deg, #e0479f, #0a9bd6)",
    desc: {
      en: "Your loyalty cards, reborn in glass and neon. Scan once, flash at the till forever — with automatic brightness boost when it counts.",
      zh: "会员卡，在玻璃与霓虹中重生。扫一次，此后每次亮出即可 —— 关键时刻自动调亮屏幕。",
    },
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6784640606",
    accent: "#d63f96",
    sectionClass: "sect-dark",
    flip: true,
    icon: "/icons/mcardwallet.png",
    shot: "/shots/mcardwallet-home.jpg",
    shotAlt: { en: "M Card Wallet home screen", zh: "M Card Wallet 首页" },
  },
  {
    id: "secret",
    name: "HelloSecret",
    headlinePre: { en: "Say it once. ", zh: "说出口，" },
    headlineGrad: { en: "Then it's gone.", zh: "便消失。" },
    headlinePost: { en: "", zh: "" },
    gradientCss: "linear-gradient(100deg, #7a68e8, #b76fd6)",
    desc: {
      en: "An anonymous well for the things you can't tell anyone. Drop one secret in, receive a stranger's in return — then both disappear forever.",
      zh: "一口匿名的井，盛放你说不出口的话。投下一个秘密，换回一个陌生人的 —— 然后两个都永远消失。",
    },
    status: "soon",
    accent: "#7a68e8",
    sectionClass: "sect-secret",
    flip: false,
    icon: "/icons/hellosecret.png",
    shot: "/shots/hellosecret-home.jpg",
    shotAlt: { en: "HelloSecret feed screen", zh: "HelloSecret 秘密流" },
  },
];
