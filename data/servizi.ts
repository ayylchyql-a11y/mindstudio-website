import type { Locale, Localized } from "@/lib/i18n";

/**
 * /servizi —— 给意大利客户看的报价页。用户 09-18 拍板：**只走月费**，五档、每档包含前一档；
 * 价格 49 / 129 / 199 / 239 / 269。没拍板的按我的建议先做：不收 setup、随时可停（30 天预告）、
 * 年付 -15%。文案意大利语是原文，en / zh 是给自己看的译文。
 */

export const SERVIZI_LANGS: readonly Locale[] = ["it", "en", "zh"];
export const CONTACT_EMAIL = "ayylchyql@gmail.com";
export const ANNUAL_DISCOUNT = 0.15;

export interface Tier {
  id: string;
  name: Localized;
  /** 一句话：这档给谁 */
  who: Localized;
  monthly: number;
  /** 每档在前一档之上加了什么；第一档是全部内容 */
  includes: Localized[];
  /** 交付周期 */
  time: Localized;
  /** 悬停时整段变成的颜色（照效果原样：每一行自带一个颜色） */
  tint: string;
  /** 右侧预览卡的底 */
  art: string;
}

export const tiers: Tier[] = [
  {
    id: "vetrina",
    name: { it: "Sito vetrina", en: "Showcase site", zh: "展示型网站" },
    who: { it: "Per chi vuole essere trovato e chiamato.", en: "For being found and called.", zh: "给想增加网上流量、让客人在网上找得到自己的店。" },
    monthly: 49,
    includes: [
      { it: "Sito da 5 a 8 pagine, disegnato per la tua attività", en: "5–8 page site designed for your business", zh: "5–8 页、按你的店设计" },
      { it: "Fino a 3 lingue", en: "Up to 3 languages", zh: "最多 3 种语言" },
      { it: "Dominio, hosting e certificato inclusi", en: "Domain, hosting and certificate included", zh: "域名、托管、证书全包" },
      { it: "Orari, mappa, WhatsApp, Google e Instagram collegati", en: "Hours, map, WhatsApp, Google and Instagram wired in", zh: "营业时间、地图、WhatsApp、Google、Instagram 接好" },
      { it: "2 modifiche al mese, correzioni senza limite", en: "2 content changes a month, fixes unlimited", zh: "每月 2 次内容修改，修 bug 不限" },
    ],
    time: { it: "Online in 2 settimane", en: "Live in 2 weeks", zh: "2 周上线" },
    tint: "#2f6fff",
    art: "linear-gradient(135deg,#bcd0ff,#2f6fff 55%,#0f2d8a)",
  },
  {
    id: "ordini",
    name: { it: "Ordini online", en: "Online ordering", zh: "线上点单" },
    who: { it: "Per chi vuole gli ordini senza pagare le commissioni delle piattaforme.", en: "For taking orders without platform commissions.", zh: "给想自己收单、不再给平台交抽成的店。" },
    monthly: 129,
    includes: [
      { it: "Tutto di Sito vetrina", en: "Everything in Showcase", zh: "展示型网站的全部" },
      { it: "Menù online con foto, varianti e allergeni", en: "Online menu with photos, options and allergens", zh: "带图、带选项、带过敏原的线上菜单" },
      { it: "Carrello, asporto e consegna, pagamento con carta (Stripe)", en: "Cart, pickup and delivery, card payments (Stripe)", zh: "购物车、外带/外送、刷卡支付（Stripe）" },
      { it: "Gestionale: ordini in tempo reale, menù, orari, statistiche", en: "Back office: live orders, menu, hours, stats", zh: "后台：实时订单、菜单、营业时间、统计" },
      { it: "Stampa automatica degli scontrini in cucina", en: "Automatic kitchen ticket printing", zh: "厨房小票自动打印" },
      { it: "Punti fedeltà e buoni sconto", en: "Loyalty points and coupons", zh: "积分与优惠券" },
    ],
    time: { it: "Online in 4 settimane", en: "Live in 4 weeks", zh: "4 周上线" },
    tint: "#16a37a",
    art: "linear-gradient(135deg,#b6f0dc,#16a37a 55%,#064d38)",
  },
  {
    id: "app",
    name: { it: "App e chiosco", en: "App and kiosk", zh: "App 与自助点单" },
    who: { it: "Per chi vuole stare sul telefono dei clienti e in sala.", en: "For living on customers’ phones and in the dining room.", zh: "给想让顾客手机里有自己的 App、店里有自助点单系统的店。" },
    monthly: 199,
    includes: [
      { it: "Tutto di Ordini online", en: "Everything in Online ordering", zh: "线上点单的全部" },
      { it: "App iOS e Android a tuo nome, pubblicate sugli store", en: "iOS and Android apps in your name, on both stores", zh: "以你的名义上架的 iOS / Android App" },
      { it: "Notifiche push: ordine pronto, promozioni", en: "Push notifications: order ready, promotions", zh: "推送：出餐通知、活动" },
      { it: "Chiosco self-service per il tavolo o l’ingresso", en: "Self-service kiosk for tables or the entrance", zh: "桌边扫码 / 门口自助点单系统" },
      { it: "Aggiornamenti degli store e dei sistemi inclusi", en: "Store and OS updates included", zh: "商店与系统更新全包" },
    ],
    time: { it: "Online in 8 settimane", en: "Live in 8 weeks", zh: "8 周上线" },
    tint: "#f26a1e",
    art: "linear-gradient(135deg,#ffd0a8,#f26a1e 55%,#7a2e08)",
  },
  {
    id: "piattaforme",
    name: { it: "Piattaforme e rider", en: "Platforms and riders", zh: "平台对接与骑手" },
    who: { it: "Per chi riceve ordini da Just Eat, Deliveroo o Glovo e vuole un solo schermo.", en: "For Just Eat, Deliveroo or Glovo orders on one screen.", zh: "给 Just Eat / Deliveroo / Glovo 都在接、只想盯一块屏的店。" },
    monthly: 239,
    includes: [
      { it: "Tutto di App e chiosco", en: "Everything in App and kiosk", zh: "App 与自助点单的全部" },
      { it: "Just Eat, Deliveroo, Glovo nella stessa dashboard", en: "Just Eat, Deliveroo, Glovo in the same dashboard", zh: "三大平台的单进同一个后台" },
      { it: "Menù e orari sincronizzati su tutte le piattaforme", en: "Menu and hours synced across platforms", zh: "菜单与营业时间同步到各平台" },
      { it: "App per i rider con mappa in tempo reale", en: "Rider app with live map", zh: "骑手 App，实时地图" },
      { it: "Tracciamento della consegna per il cliente", en: "Delivery tracking for the customer", zh: "顾客端配送追踪" },
    ],
    time: { it: "Online in 6 settimane", en: "Live in 6 weeks", zh: "6 周上线" },
    tint: "#c4247e",
    art: "linear-gradient(135deg,#ffb3dc,#c4247e 55%,#5a0c3a)",
  },
  {
    id: "ai",
    name: { it: "Assistente AI", en: "AI assistant", zh: "AI 助理" },
    who: { it: "Per chi vuole che il sito risponda e il gestionale pensi.", en: "For a site that answers and a back office that thinks.", zh: "给想让网站会回答顾客、后台会帮你干活的店。" },
    monthly: 269,
    includes: [
      { it: "Tutto di Piattaforme e rider", en: "Everything in Platforms and riders", zh: "平台对接与骑手的全部" },
      { it: "Assistente in chat per i clienti: consiglia, ordina, prenota", en: "Chat assistant for customers: recommends, orders, books", zh: "顾客端聊天助理：推荐、下单、订位" },
      { it: "AI nel gestionale: risponde alle recensioni, propone promozioni", en: "AI in the back office: answers reviews, proposes promotions", zh: "后台 AI：回复评价、提议活动" },
      { it: "Ristampa e correzioni degli scontrini a voce", en: "Reprints and ticket fixes by voice", zh: "语音重打/修正小票" },
      { it: "Ogni azione dell’AI la confermi tu: non scrive mai da sola", en: "Every AI action is yours to confirm: it never writes on its own", zh: "AI 的每个动作都由你确认，绝不自作主张" },
    ],
    time: { it: "Attivo in 2 settimane sull’esistente", en: "Active in 2 weeks on top of the rest", zh: "在现有基础上 2 周开通" },
    tint: "#5b46d9",
    art: "linear-gradient(135deg,#c9bfff,#5b46d9 55%,#22106b)",
  },
];

export interface Addon { id: string; name: Localized; monthly: number }
export const addons: Addon[] = [
  { id: "lingua", name: { it: "Lingua aggiuntiva", en: "Extra language", zh: "追加一种语言" }, monthly: 10 },
  { id: "sede", name: { it: "Seconda sede", en: "Second location", zh: "第二家门店" }, monthly: 59 },
  { id: "modifiche", name: { it: "Modifiche illimitate", en: "Unlimited changes", zh: "内容修改不限次" }, monthly: 39 },
];

export const copy = {
  navLabel: { it: "Preventivo", en: "Pricing", zh: "报价", "zh-tw": "報價" },   // 首页页脚的入口
  title: { it: "Siti, gestionali e app per chi ha un’attività.", en: "Sites, back offices and apps for people who run a business.", zh: "给开店的人做网站、后台和 App。" },
  intro: {
    it: "Una persona sola fa il sito, il gestionale e le app, quindi le tre cose si parlano davvero. Nessun costo iniziale: un canone mensile, tutto incluso, disdici quando vuoi con 30 giorni di preavviso.",
    en: "One person builds the site, the back office and the apps, so the three actually talk to each other. No upfront cost: one monthly fee, everything included, cancel any time with 30 days’ notice.",
    zh: "网站、后台、App 由同一个人做，三样东西真的接得上。没有前期费用：一个月费全包，随时可停，提前 30 天说一声。",
  },
  listinoEyebrow: { it: "Listino", en: "Plans", zh: "价目" },
  listinoTitle: { it: "Cinque livelli.\nOgnuno include il precedente.", en: "Five levels.\nEach includes the one before.", zh: "五档。\n每档包含前一档。" },
  hint: { it: "passa sopra un livello", en: "hover a plan", zh: "悬停一档" },
  perMonth: { it: "/ mese", en: "/ month", zh: "/ 月" },
  monthlyLabel: { it: "Mensile", en: "Monthly", zh: "月付" },
  annualLabel: { it: "Annuale · −15%", en: "Annual · −15%", zh: "年付 · −15%" },
  annualNote: { it: "pagando 12 mesi in anticipo", en: "paying 12 months up front", zh: "一次付 12 个月" },
  includesTitle: { it: "Cosa include", en: "What’s included", zh: "包含" },
  chooseBtn: { it: "Scegli questo livello", en: "Pick this plan", zh: "选这档" },
  composeEyebrow: { it: "Il tuo preventivo", en: "Your quote", zh: "你的报价" },
  composeTitle: { it: "Aggiungi quello che serve.", en: "Add what you need.", zh: "按需要加。" },
  composeIntro: { it: "Il livello scelto sopra, più gli extra. Il totale lo vedi subito; mandalo e ti rispondo entro 24 ore con il preventivo scritto.", en: "The plan chosen above plus extras. The total updates as you go; send it and you get a written quote within 24 hours.", zh: "上面选的档位加上附加项，合计实时显示；发过来，24 小时内回你书面报价。" },
  planLabel: { it: "Livello", en: "Plan", zh: "档位" },
  totalLabel: { it: "Totale", en: "Total", zh: "合计" },
  sendBtn: { it: "Richiedi il preventivo", en: "Request the quote", zh: "索取报价" },
  sendNote: { it: "Si apre la tua email con il riepilogo già scritto.", en: "Opens your email with the summary already written.", zh: "会打开你的邮箱，摘要已写好。" },
  howEyebrow: { it: "Come lavoro", en: "How I work", zh: "怎么合作" },
  how: [
    { t: { it: "Parliamo", en: "We talk", zh: "先聊" }, p: { it: "Trenta minuti al telefono o al locale. Capisco cosa vendi e come lavori adesso.", en: "Thirty minutes on the phone or at your place. I learn what you sell and how you work today.", zh: "电话或到店聊 30 分钟，搞清你卖什么、现在怎么干。" } },
    { t: { it: "Preventivo scritto", en: "Written quote", zh: "书面报价" }, p: { it: "Entro 48 ore: livello, extra, tempi, cosa serve da parte tua. Nessuna sorpresa dopo.", en: "Within 48 hours: plan, extras, timing, what I need from you. No surprises later.", zh: "48 小时内：档位、附加项、周期、需要你提供什么。之后不加价。" } },
    { t: { it: "Consegna a tappe", en: "Delivery in stages", zh: "分阶段交付" }, p: { it: "Vedi il sito mentre nasce. Il canone parte solo quando è online.", en: "You see the site as it takes shape. The fee starts only when it is live.", zh: "做的过程你都看得到。上线那天才开始收月费。" } },
  ],
  casesEyebrow: { it: "Fatto così", en: "Built like this", zh: "已经做出来的" },
  cases: [
    { t: "Mumi Sushi · Vimercate", p: { it: "Sito con ordini, gestionale, app iOS e Android, app rider, chiosco, Just Eat integrato, assistente AI. Il livello 5, in produzione da mesi.", en: "Ordering site, back office, iOS and Android apps, rider app, kiosk, Just Eat integration, AI assistant. Level 5, in production for months.", zh: "点单网站、后台、双端 App、骑手端、自助点单系统、Just Eat 对接、AI 助理。第五档，跑了几个月了。" }, href: "/work/mumi-sushi" },
    { t: "M Desk", p: { it: "Il gestionale: ordini, menù, stampa, statistiche, piattaforme. Quello che vedi nei livelli 2–5.", en: "The back office: orders, menu, printing, stats, platforms. What you get in levels 2–5.", zh: "后台本身：订单、菜单、打印、统计、平台。第 2–5 档里的那个。" }, href: "/work/m-desk" },
  ],
  faqEyebrow: { it: "Domande", en: "Questions", zh: "常见问题" },
  faq: [
    { q: { it: "Di chi è il sito?", en: "Who owns the site?", zh: "网站归谁？" }, a: { it: "Il sito e le app girano finché il canone è attivo. I tuoi dati — menù, clienti, ordini, dominio — sono tuoi e li esporti quando vuoi.", en: "Site and apps run while the fee is active. Your data — menu, customers, orders, domain — is yours and exportable any time.", zh: "月费有效期间网站和 App 一直在线。你的数据——菜单、顾客、订单、域名——随时能导出带走。" } },
    { q: { it: "Posso partire da un livello e salire dopo?", en: "Can I start low and move up later?", zh: "能先低档后升级吗？" }, a: { it: "Sì, è pensato così. Ogni livello aggiunge, non rifà: sali quando vuoi dal mese dopo.", en: "Yes, it is built for that. Each level adds, never rebuilds: move up from the next month.", zh: "可以，本来就这么设计的。每档是叠加不是重做，下个月起随时升。" } },
    { q: { it: "Cosa devo fare io?", en: "What do I need to do?", zh: "我要做什么？" }, a: { it: "Darmi menù, foto, orari e un logo se ce l’hai. Il resto — testi, traduzioni, negozi, stampanti — lo faccio io.", en: "Give me the menu, photos, hours and a logo if you have one. The rest — copy, translations, stores, printers — is on me.", zh: "给我菜单、照片、营业时间，有 logo 更好。文案、翻译、商店上架、打印机都我来。" } },
    { q: { it: "E se smetto?", en: "And if I stop?", zh: "不做了呢？" }, a: { it: "Trenta giorni di preavviso, nessuna penale. Ti consegno l’export dei dati e il dominio.", en: "Thirty days’ notice, no penalty. You get your data export and the domain.", zh: "提前 30 天说，没有违约金。数据导出和域名交给你。" } },
  ],
  ctaTitle: { it: "Scrivimi. Rispondo entro 24 ore.", en: "Write to me. I answer within 24 hours.", zh: "写信给我，24 小时内回。" },
  mailSubject: { it: "Preventivo", en: "Quote", zh: "报价" },
  mailBody: {
    it: "Ciao Ming,\n\nvorrei un preventivo per:\n\n{items}\n\nTotale indicativo: {total}\n\nAttività: \nCittà: \nTelefono: \n",
    en: "Hi Ming,\n\nI would like a quote for:\n\n{items}\n\nIndicative total: {total}\n\nBusiness: \nCity: \nPhone: \n",
    zh: "Ming 你好，\n\n想要以下项目的报价：\n\n{items}\n\n参考合计：{total}\n\n店名：\n城市：\n电话：\n",
  },
};
