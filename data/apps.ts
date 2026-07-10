import type { Localized } from "@/lib/i18n";

export type AppStatus = "live" | "soon";

export interface Feature {
  title: Localized;
  desc: Localized;
}

export interface Shot {
  src: Localized;
  alt: Localized;
}

export interface Slide {
  src: Localized;
  alt: Localized;
}

export interface AppEntry {
  id: string;
  name: string;
  headlinePre: Localized;
  headlineGrad: Localized;
  headlinePost: Localized;
  gradientCss: string;
  desc: Localized;
  tagline: Localized;
  status: AppStatus;
  appStoreUrl?: string;
  accent: string;
  sectionClass: "sect-light" | "sect-dark" | "sect-relax" | "sect-secret";
  flip: boolean;
  icon: string;
  shot?: Localized;
  shotAlt?: Localized;
  features: Feature[];
  gallery: Shot[];
  slides?: Slide[];
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
    tagline: { en: "Personal finance, quietly powerful.", zh: "个人记账，安静而强大。" },
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6780538389",
    accent: "#00a38c",
    sectionClass: "sect-light",
    flip: false,
    icon: "/icons/mbudget.png",
    shot: { en: "/shots/mbudget-home-en.jpg", zh: "/shots/mbudget-home-zh.jpg" },
    shotAlt: { en: "M Budget home screen", zh: "M Budget 首页" },
    features: [
      {
        title: { en: "Five hand-crafted themes", zh: "五款精心设计的主题" },
        desc: {
          en: "From liquid glass to warm cream, pick the mood that fits you — on iPhone and iPad alike.",
          zh: "从流光玻璃到暖调奶油，挑一个合你心情的主题 —— iPhone 与 iPad 同样好看。",
        },
      },
      {
        title: { en: "iCloud sync, private to you", zh: "iCloud 同步，只属于你" },
        desc: {
          en: "Your records stay in sync across devices, stored in your own iCloud — never on our servers.",
          zh: "记录在多端实时同步，存于你自己的 iCloud —— 我们的服务器上没有你的数据。",
        },
      },
      {
        title: { en: "Budgets that see ahead", zh: "会预判的预算" },
        desc: {
          en: "Set monthly or yearly budgets and watch trends, savings rate and month-end forecasts.",
          zh: "设置月度或年度预算，看清趋势、储蓄率与月末预测。",
        },
      },
      {
        title: { en: "Multi-currency & auto-record", zh: "多币种与自动记账" },
        desc: {
          en: "Twelve languages, live exchange rates, and recurring entries that log themselves.",
          zh: "十二种语言、实时汇率，周期账单自动记录。",
        },
      },
    ],
    gallery: [
      {
        src: { en: "/shots/mbudget-home-en.jpg", zh: "/shots/mbudget-home-zh.jpg" },
        alt: { en: "Home", zh: "首页" },
      },
      {
        src: { en: "/shots/mbudget-stats-en.jpg", zh: "/shots/mbudget-stats-zh.jpg" },
        alt: { en: "Statistics", zh: "统计" },
      },
      {
        src: { en: "/shots/mbudget-budget-en.jpg", zh: "/shots/mbudget-budget-zh.jpg" },
        alt: { en: "Budget", zh: "预算" },
      },
      {
        src: { en: "/shots/mbudget-accounts-en.jpg", zh: "/shots/mbudget-accounts-zh.jpg" },
        alt: { en: "Accounts", zh: "账户" },
      },
      {
        src: { en: "/shots/mbudget-networth-en.jpg", zh: "/shots/mbudget-networth-zh.jpg" },
        alt: { en: "Net worth", zh: "净资产" },
      },
    ],
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
    tagline: { en: "Sound for a calmer mind.", zh: "用声音，安放思绪。" },
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6787405665",
    accent: "#2f80c9",
    sectionClass: "sect-relax",
    flip: true,
    icon: "/icons/malpharelax.png",
    shot: { en: "/shots/malpharelax-home.jpg", zh: "/shots/malpharelax-home.jpg" },
    shotAlt: { en: "M Alpha Relax home screen", zh: "M Alpha Relax 首页" },
    features: [
      {
        title: { en: "Binaural & isochronic tones", zh: "双耳节拍与等时音调" },
        desc: {
          en: "Choose a brainwave band — from delta to gamma — for focus, calm or sleep.",
          zh: "选择脑波频段 —— 从 δ 到 γ —— 用于专注、放松或睡眠。",
        },
      },
      {
        title: { en: "Ambient sound mixer", zh: "环境声混音器" },
        desc: {
          en: "Layer rain, waves and white noise over the tones, balanced exactly to your taste.",
          zh: "在节拍之上叠加雨声、海浪与白噪音，随心调配比例。",
        },
      },
      {
        title: { en: "Gentle session timer", zh: "柔和的会话计时" },
        desc: {
          en: "Set a length, press play, and let the sound fade you out on its own.",
          zh: "设定时长，按下播放，让声音自动淡出、送你入静。",
        },
      },
      {
        title: { en: "Private by design", zh: "隐私优先" },
        desc: {
          en: "No account, no tracking — open it and it simply plays.",
          zh: "无需账号、零追踪 —— 打开即用。",
        },
      },
    ],
    gallery: [
      { src: { en: "/shots/malpharelax-home.jpg", zh: "/shots/malpharelax-home.jpg" }, alt: { en: "Home", zh: "首页" } },
      { src: { en: "/shots/malpharelax-2.jpg", zh: "/shots/malpharelax-2.jpg" }, alt: { en: "Session", zh: "会话" } },
      { src: { en: "/shots/malpharelax-3.jpg", zh: "/shots/malpharelax-3.jpg" }, alt: { en: "Mixer", zh: "混音器" } },
      { src: { en: "/shots/malpharelax-4.jpg", zh: "/shots/malpharelax-4.jpg" }, alt: { en: "Stats", zh: "统计" } },
    ],
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
    tagline: { en: "Two cameras, one frame.", zh: "两个镜头，一个画面。" },
    status: "soon",
    accent: "#e0620d",
    sectionClass: "sect-light",
    flip: false,
    icon: "/icons/mdoublecamera.png",
    slides: [
      {
        src: { en: "/shots/camera-hero-en.jpg", zh: "/shots/camera-hero-zh.jpg" },
        alt: { en: "Front and back in one frame", zh: "前后同框" },
      },
      {
        src: { en: "/shots/camera-layout-en.jpg", zh: "/shots/camera-layout-zh.jpg" },
        alt: { en: "Three layouts, one tap", zh: "一键三种布局" },
      },
      {
        src: { en: "/shots/camera-control-en.jpg", zh: "/shots/camera-control-zh.jpg" },
        alt: { en: "Precise controls", zh: "精准控制" },
      },
      {
        src: { en: "/shots/camera-reaction-en.jpg", zh: "/shots/camera-reaction-zh.jpg" },
        alt: { en: "Reaction mode", zh: "反应模式" },
      },
      {
        src: { en: "/shots/camera-privacy-en.jpg", zh: "/shots/camera-privacy-zh.jpg" },
        alt: { en: "Private by design", zh: "隐私优先" },
      },
    ],
    features: [
      {
        title: { en: "Front and back, at once", zh: "前后，同时" },
        desc: {
          en: "Both cameras record together into a single photo or video — no stitching afterward.",
          zh: "前后摄像头同时记录，合成到一张照片或一段视频 —— 无需事后拼接。",
        },
      },
      {
        title: { en: "Picture-in-picture framing", zh: "画中画取景" },
        desc: {
          en: "Drag and resize the inset window so both sides sit exactly where you want.",
          zh: "自由拖动、缩放小窗，让两面都落在你想要的位置。",
        },
      },
      {
        title: { en: "4K reaction mode", zh: "4K 反应模式" },
        desc: {
          en: "Record what you see and your reaction to it, side by side, in crisp 4K.",
          zh: "以清晰 4K，同时记录你看到的画面和你的反应。",
        },
      },
    ],
    gallery: [],
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
    tagline: { en: "Your cards, beautifully kept.", zh: "你的卡片，优雅收纳。" },
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6784640606",
    accent: "#d63f96",
    sectionClass: "sect-dark",
    flip: true,
    icon: "/icons/mcardwallet.png",
    shot: { en: "/shots/mcardwallet-home.jpg", zh: "/shots/mcardwallet-home.jpg" },
    shotAlt: { en: "M Card Wallet home screen", zh: "M Card Wallet 首页" },
    features: [
      {
        title: { en: "Every card in one place", zh: "所有卡片集于一处" },
        desc: {
          en: "Scan the barcode once; your loyalty cards live together in glass and neon.",
          zh: "扫一次条形码，会员卡在玻璃与霓虹中收纳成册。",
        },
      },
      {
        title: { en: "Automatic brightness boost", zh: "自动调亮" },
        desc: {
          en: "The screen brightens the moment you show a card, so any scanner reads it fast.",
          zh: "出示卡片的瞬间屏幕自动调亮，任何扫码枪都能快速识别。",
        },
      },
      {
        title: { en: "Tags & custom colors", zh: "标签与自定义配色" },
        desc: {
          en: "Organize with tags and tune each card's color until it feels right.",
          zh: "用标签归类，为每张卡自定义专属配色。",
        },
      },
      {
        title: { en: "Yours only", zh: "只属于你" },
        desc: {
          en: "Everything stays on your device and your own iCloud — nothing collected.",
          zh: "所有数据只在你的设备和自己的 iCloud 中 —— 我们零采集。",
        },
      },
    ],
    gallery: [
      { src: { en: "/shots/mcardwallet-home.jpg", zh: "/shots/mcardwallet-home.jpg" }, alt: { en: "Wallet", zh: "卡包" } },
      { src: { en: "/shots/mcardwallet-2.jpg", zh: "/shots/mcardwallet-2.jpg" }, alt: { en: "Card detail", zh: "卡片详情" } },
      { src: { en: "/shots/mcardwallet-3.jpg", zh: "/shots/mcardwallet-3.jpg" }, alt: { en: "Edit card", zh: "编辑卡片" } },
      { src: { en: "/shots/mcardwallet-4.jpg", zh: "/shots/mcardwallet-4.jpg" }, alt: { en: "Profile", zh: "我的" } },
    ],
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
    tagline: { en: "A place for the unsaid.", zh: "存放未说出口的地方。" },
    status: "soon",
    accent: "#7a68e8",
    sectionClass: "sect-secret",
    flip: false,
    icon: "/icons/hellosecret.png",
    shot: { en: "/shots/hellosecret-home.jpg", zh: "/shots/hellosecret-home.jpg" },
    shotAlt: { en: "HelloSecret feed screen", zh: "HelloSecret 秘密流" },
    features: [
      {
        title: { en: "Anonymous by nature", zh: "天生匿名" },
        desc: {
          en: "No profile, no trace — just what you needed to say.",
          zh: "没有资料、不留痕迹 —— 只有你想说的那句话。",
        },
      },
      {
        title: { en: "One in, one out", zh: "一进一出" },
        desc: {
          en: "Drop a secret into the well to receive a stranger's in return.",
          zh: "向井中投下一个秘密，换回一个陌生人的。",
        },
      },
      {
        title: { en: "Burns after reading", zh: "阅后即焚" },
        desc: {
          en: "Both secrets disappear forever the moment they're seen.",
          zh: "两个秘密一旦被读到，便永远消失。",
        },
      },
      {
        title: { en: "Twelve languages", zh: "十二种语言" },
        desc: {
          en: "Speak your mind in the language that feels closest to you.",
          zh: "用离你最近的那种语言，说出心里话。",
        },
      },
    ],
    gallery: [
      { src: { en: "/shots/hellosecret-home.jpg", zh: "/shots/hellosecret-home.jpg" }, alt: { en: "Feed", zh: "秘密流" } },
      { src: { en: "/shots/hellosecret-2.jpg", zh: "/shots/hellosecret-2.jpg" }, alt: { en: "Compose", zh: "写下" } },
      { src: { en: "/shots/hellosecret-3.jpg", zh: "/shots/hellosecret-3.jpg" }, alt: { en: "Detail", zh: "详情" } },
      { src: { en: "/shots/hellosecret-4.jpg", zh: "/shots/hellosecret-4.jpg" }, alt: { en: "Me", zh: "我的" } },
    ],
  },
];

export function getApp(id: string): AppEntry | undefined {
  return apps.find((a) => a.id === id);
}
