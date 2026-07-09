export type AppStatus = "live" | "soon";

export interface AppEntry {
  id: string;
  name: string;
  eyebrow: string;
  headlinePre: string;
  headlineGrad: string;
  headlinePost: string;
  gradientCss: string;
  desc: string;
  status: AppStatus;
  appStoreUrl?: string;
  accent: string;
  sectionClass: "sect-light" | "sect-dark" | "sect-relax" | "sect-secret";
  flip: boolean;
  icon: string;
  shot?: string;
  shotAlt?: string;
}

export const apps: AppEntry[] = [
  {
    id: "budget",
    name: "M Budget",
    eyebrow: "M Budget",
    headlinePre: "Money, made ",
    headlineGrad: "mindful",
    headlinePost: ".",
    gradientCss: "linear-gradient(100deg, #00c2a8, #2563c9)",
    desc: "Track every expense in seconds. Five hand-crafted themes, iCloud sync, budgets that keep up with you — on iPhone and iPad.",
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6780538389",
    accent: "#00a38c",
    sectionClass: "sect-light",
    flip: false,
    icon: "/icons/mbudget.png",
    shot: "/shots/mbudget-home.jpg",
    shotAlt: "M Budget home screen",
  },
  {
    id: "relax",
    name: "M Alpha Relax",
    eyebrow: "M Alpha Relax",
    headlinePre: "Tune out. ",
    headlineGrad: "Tune in.",
    headlinePost: "",
    gradientCss: "linear-gradient(100deg, #2f9de0, #6f5de0)",
    desc: "Binaural beats and isochronic tones, engineered to settle your mind — for deep focus, better sleep, or one long breath in between.",
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6787405665",
    accent: "#2f80c9",
    sectionClass: "sect-relax",
    flip: true,
    icon: "/icons/malpharelax.png",
    shot: "/shots/malpharelax-home.jpg",
    shotAlt: "M Alpha Relax home screen",
  },
  {
    id: "camera",
    name: "M Double Camera",
    eyebrow: "M Double Camera",
    headlinePre: "Both sides of ",
    headlineGrad: "the moment",
    headlinePost: ".",
    gradientCss: "linear-gradient(100deg, #ff9f0a, #ff5a3c)",
    desc: "Front and back cameras in a single shot. Capture the sunset and your face lighting up — one photo, one video, zero editing.",
    status: "soon",
    accent: "#e0620d",
    sectionClass: "sect-light",
    flip: false,
    icon: "/icons/mdoublecamera.png",
  },
  {
    id: "wallet",
    name: "M Card Wallet",
    eyebrow: "M Card Wallet",
    headlinePre: "Every card. ",
    headlineGrad: "One glow.",
    headlinePost: "",
    gradientCss: "linear-gradient(100deg, #e0479f, #0a9bd6)",
    desc: "Your loyalty cards, reborn in glass and neon. Scan once, flash at the till forever — with automatic brightness boost when it counts.",
    status: "live",
    appStoreUrl: "https://apps.apple.com/app/id6784640606",
    accent: "#d63f96",
    sectionClass: "sect-dark",
    flip: true,
    icon: "/icons/mcardwallet.png",
    shot: "/shots/mcardwallet-home.jpg",
    shotAlt: "M Card Wallet home screen",
  },
  {
    id: "secret",
    name: "HelloSecret",
    eyebrow: "HelloSecret",
    headlinePre: "Say it once. ",
    headlineGrad: "Then it's gone.",
    headlinePost: "",
    gradientCss: "linear-gradient(100deg, #7a68e8, #b76fd6)",
    desc: "An anonymous well for the things you can't tell anyone. Drop one secret in, receive a stranger's in return — then both disappear forever.",
    status: "soon",
    accent: "#7a68e8",
    sectionClass: "sect-secret",
    flip: false,
    icon: "/icons/hellosecret.png",
    shot: "/shots/hellosecret-home.jpg",
    shotAlt: "HelloSecret feed screen",
  },
];
