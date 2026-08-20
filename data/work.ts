import type { Localized } from "@/lib/i18n";

export interface WorkFeature {
  title: Localized;
  desc: Localized;
}

export interface WorkPiece {
  /** 系统里的一块，例如「顾客 App」「骑手端」 */
  name: Localized;
  desc: Localized;
  tech: string;
}

export interface WorkShot {
  src: Localized;
  alt: Localized;
}

export interface WorkLink {
  label: Localized;
  href: string;
}

export interface WorkEntry {
  id: string;
  name: string;
  /** 商店里的正式名称，与桌面名不同时用得上 */
  storeName?: string;
  tagline: Localized;
  gradientCss: string;
  accent: string;
  icon: string;
  /** 案例概述，段落数组 */
  intro: Localized[];
  /** 署名：谁做的、谁发行的 */
  builtBy: Localized;
  publishedBy: Localized;
  appStoreUrl?: string;
  playStoreUrl?: string;
  /** Play 还在审核时置 true，徽章显示为待上架 */
  androidPending?: boolean;
  links: WorkLink[];
  pieces: WorkPiece[];
  features: WorkFeature[];
  gallery: WorkShot[];
  stack: string[];
}

export const work: WorkEntry[] = [
  {
    id: "mumi-sushi",
    name: "Mumi Sushi",
    storeName: "Mumi Sushi Vimercate",
    tagline: {
      en: "A restaurant's whole ordering stack, built end to end.",
      zh: "一家餐厅的完整点单系统，从头到尾一个人做完。",
    },
    gradientCss: "linear-gradient(100deg, #e0483a, #ff9f0a)",
    accent: "#d0402f",
    icon: "/icons/mumisushi.png",
    intro: [
      {
        en: "Mumi Sushi is a sushi and poke restaurant in Vimercate, near Milan. It needed to take its own orders instead of renting them from delivery platforms — so it got its own stack: native apps for customers, a back office for the kitchen, an app for the riders, and a backend tying all of it to the platforms it still works with.",
        zh: "Mumi Sushi 是米兰近郊 Vimercate 的一家寿司与 poke 餐厅。它需要自己接单，而不是把订单租给外卖平台 —— 于是有了这一整套：顾客用的原生 App、厨房用的后台、骑手用的 App，以及把这些和仍在合作的平台连起来的后端。",
      },
      {
        en: "Everything below — iOS app, Android app, ordering site, back office, rider app, backend, printer bridge — is designed and written by one person. It is the largest thing to come out of this workshop, and the reason a lot of the craft in the other apps exists at all.",
        zh: "下面的每一块 —— iOS App、安卓 App、点单网站、店内后台、骑手 App、后端、打印桥 —— 都由一个人设计和编写。它是这间工作室做过最大的东西，也是其它 App 里那些手艺的来处。",
      },
    ],
    builtBy: {
      en: "Designed and built by Mind Studio",
      zh: "由 Mind Studio 设计与开发",
    },
    publishedBy: {
      en: "Published on the App Store by L & Z SRL SEMPLIFICATA, the restaurant that runs it",
      zh: "由经营方 L & Z SRL SEMPLIFICATA 在 App Store 发行",
    },
    appStoreUrl: "https://apps.apple.com/it/app/mumi-sushi-vimercate/id6802294782",
    androidPending: true,
    links: [
      {
        label: { en: "Order online", zh: "在线点单" },
        href: "https://vimercate.mumisushi.it",
      },
      {
        label: { en: "App privacy policy", zh: "App 隐私政策" },
        href: "https://vimercate.mumisushi.it/privacy",
      },
      {
        label: { en: "Terms of service", zh: "服务条款" },
        href: "https://vimercate.mumisushi.it/termini",
      },
    ],
    pieces: [
      {
        name: { en: "Customer app — iOS", zh: "顾客 App · iOS" },
        desc: {
          en: "A native SwiftUI app that replaced an earlier web wrapper: full menu, step-by-step poke builder, Apple Pay, live order tracking, loyalty points, 13 languages.",
          zh: "用 SwiftUI 重写、取代了早期的网页壳：完整菜单、分步 poke 组合器、Apple Pay、实时订单追踪、积分体系、13 种语言。",
        },
        tech: "SwiftUI · StoreKit · MapKit · APNs",
      },
      {
        name: { en: "Customer app — Android", zh: "顾客 App · 安卓" },
        desc: {
          en: "The same app rebuilt natively in Compose — visually identical to iOS, but navigating the way Android users expect. Google Pay and Google sign-in included.",
          zh: "用 Compose 原生复刻的同一款 App —— 视觉与 iOS 一致，导航则遵循安卓习惯。含 Google Pay 与 Google 登录。",
        },
        tech: "Kotlin · Jetpack Compose · FCM",
      },
      {
        name: { en: "Ordering site", zh: "点单网站" },
        desc: {
          en: "The same menu, cart and checkout on the web — for anyone who would rather not install anything, plus the in-store kiosk and table-QR flows.",
          zh: "网页上的同一套菜单、购物车与结账 —— 给不想装 App 的人，也承载店内自助点单与扫码点餐。",
        },
        tech: "Next.js · React",
      },
      {
        name: { en: "Back office", zh: "店内后台" },
        desc: {
          en: "Where the restaurant actually runs the day: live order board, menu and stock, delivery zones, coupons and loyalty, reservations, reports.",
          zh: "餐厅每天真正在用的地方：实时订单看板、菜单与沽清、配送区域、优惠券与积分、餐位预订、报表。",
        },
        tech: "Next.js · role-based access",
      },
      {
        name: { en: "Rider app", zh: "骑手 App" },
        desc: {
          en: "Riders pick up runs, follow the route and settle cash at the end of a shift. Built native on Android specifically to keep reporting location after the screen locks.",
          zh: "骑手接单、跟路线、下班结算现金。之所以做成安卓原生，就是为了锁屏后还能持续上报位置。",
        },
        tech: "Kotlin · Compose · background location",
      },
      {
        name: { en: "Backend", zh: "后端" },
        desc: {
          en: "One API behind every screen: menu, orders, payments, the order state machine, push notifications, loyalty, and scheduled jobs.",
          zh: "所有界面背后的同一个 API：菜单、订单、支付、订单状态机、推送、积分与定时任务。",
        },
        tech: "NestJS · Prisma · PostgreSQL · Stripe",
      },
      {
        name: { en: "Platform bridge", zh: "平台对接" },
        desc: {
          en: "Deliveroo orders arrive automatically through HubRise and land in the same board as the restaurant's own — no second tablet on the counter. Adapters for the other platforms are in place.",
          zh: "Deliveroo 的订单经 HubRise 自动进来，和自有订单落在同一块看板上 —— 柜台不用再多一台平板。其它平台的适配层也已就位。",
        },
        tech: "HubRise · webhooks",
      },
      {
        name: { en: "Kitchen printing", zh: "厨房打印" },
        desc: {
          en: "A cloud print queue plus a small local agent driving the thermal printer over USB, so a ticket still prints when the shop's connection wobbles.",
          zh: "云端打印队列加一个本地小代理，通过 USB 驱动热敏打印机 —— 店里网络抖动时，票依然打得出来。",
        },
        tech: "Node agent · ESC/POS",
      },
    ],
    features: [
      {
        title: { en: "Order in a few taps", zh: "几步下单" },
        desc: {
          en: "Over 230 dishes in 18 categories, with photos, ingredients and allergens. New items and sold-out ones update in real time, so you only order what is actually there.",
          zh: "18 个分类、230 多道菜，配图、配料与过敏原齐全。上新与沽清实时更新，看到的就是真有的。",
        },
      },
      {
        title: { en: "Follow it to the door", zh: "一路追到家门口" },
        desc: {
          en: "From confirmation to delivery you can see where the order stands, and once the rider leaves you follow them on the map. Notifications mark every step.",
          zh: "从确认到送达都能看到进度，骑手一出发就能在地图上跟着走。每一步都有通知。",
        },
      },
      {
        title: { en: "Pay how you like", zh: "怎么付都行" },
        desc: {
          en: "Card or Apple Pay in the app, cash on delivery, or at the counter for takeaway. Card details are handled by Stripe — the restaurant never sees or stores them.",
          zh: "App 内刷卡或 Apple Pay，也可以货到付现，自取则在柜台付。卡信息由 Stripe 处理，餐厅既看不到也不保存。",
        },
      },
      {
        title: { en: "An optional ordering assistant", zh: "可选的点单助手" },
        desc: {
          en: "Type or say what you feel like — \"a poke with salmon and avocado\", \"do you deliver to Usmate?\" — and it fills the cart from the real menu. Entirely optional; the menu works fine on its own.",
          zh: "打字或说一句想吃什么 —— 「要个三文鱼牛油果 poke」「送不送 Usmate？」—— 它会照着真实菜单把购物车配好。完全可选，不用也不影响点单。",
        },
      },
    ],
    gallery: [
      {
        src: { en: "/shots/mumi-menu-en.jpg", zh: "/shots/mumi-menu-zh.jpg" },
        alt: { en: "Menu", zh: "菜单" },
      },
      {
        src: { en: "/shots/mumi-dish-en.jpg", zh: "/shots/mumi-dish-zh.jpg" },
        alt: { en: "Dish", zh: "菜品详情" },
      },
      {
        src: { en: "/shots/mumi-search-en.jpg", zh: "/shots/mumi-search-zh.jpg" },
        alt: { en: "Search", zh: "搜索" },
      },
      {
        src: { en: "/shots/mumi-schedule-en.jpg", zh: "/shots/mumi-schedule-zh.jpg" },
        alt: { en: "Order ahead", zh: "打烊时预约" },
      },
    ],
    stack: [
      "SwiftUI",
      "Jetpack Compose",
      "Next.js",
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "Stripe",
      "APNs / FCM",
      "HubRise",
    ],
  },
];

export function getWork(id: string): WorkEntry | undefined {
  return work.find((w) => w.id === id);
}
