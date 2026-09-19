import type { Locale, Localized } from "@/lib/i18n";

/**
 * Clients = 客户样板：给**真实商家**做的网站，跟 /templates（虚构店名的模版）分开放。
 *
 * 一条 = 一个客户的一个站，文件放在 `public/clients/<slug>/`（整站：index.html +
 * styles.css + app.js + assets），海报在 `public/clients/_posters/<slug>.jpg`
 * （1200×750，跟 /templates 同规格，headless Chrome 截 1280×800 再缩）。
 * 展示层复用 TemplateViewer：一条只有一种设计时它不出 tab，只剩取景框和「整页打开」。
 *
 * 🩸 iframe src 必须带 `index.html`：`/clients/<slug>/` 不带文件名会被 proxy 按
 *    语言重定向到 Next 页面（跟 /templates 一样的坑）。
 */
export interface ClientSite {
  slug: string;
  /** ISO date，进 sitemap 的 lastModified */
  date: string;
  /** 商家名（真实的） */
  name: string;
  /** 行业，一行 */
  industry: Localized;
  city: string;
  /** 一句话说这个站里做了什么。卡片 + <meta description> 都用它。 */
  gist: Localized;
  /** 案例背景：为什么这么做。段落数组 */
  story: Localized[];
  /** 页面里真的做出来的东西。 */
  features: string[];
  /** 主色，卡片占位与页面点缀 */
  accent: string;
  /** 站本身的语言 */
  lang: "it" | "zh" | "en";
  /** 站上线后的真实域名；还没上线就不填 */
  liveUrl?: string;
  /** 同一个客户的其它设计（取景框里当第 2、3 个 tab）。dir = public/clients/<slug>/<dir>/ */
  alt?: { id: string; dir: string; title: Localized; gist: Localized }[];
}

export const clients: ClientSite[] = [
  {
    slug: "minge",
    date: "2026-09-19",
    name: "Ming·E Poke & Sushi",
    industry: { en: "Poke & sushi bar", zh: "Poke 与寿司店", "zh-tw": "Poke 與壽司店", it: "Pokeria e sushi bar" },
    city: "La Spezia",
    gist: {
      en: "A poke and sushi bar in La Spezia's old town. The first screen is the bowl builder itself — three sizes with what each includes, then base, ingredients, proteins, sauces and toppings, priced live; the nori tacos get a stage of cut-out photos; the whole sushi menu is in with real prices; the order is sent as a pre-filled WhatsApp message.",
      zh: "拉斯佩齐亚老城里的一家 poke 与寿司店。首屏就是配碗器——三档大小各自包含什么、再选 base/配料/蛋白/酱/topping，价格实时算；海苔 taco 用抠好的实拍图做成舞台；寿司全菜单按真实价格录入；订单生成一条写好的 WhatsApp 消息发给店里。",
      "zh-tw": "拉斯佩齊亞老城裡的一家 poke 與壽司店。首屏就是配碗器——三檔大小各自包含什麼、再選 base/配料/蛋白/醬/topping，價格即時算；海苔 taco 用去背的實拍圖做成舞台；壽司全菜單按真實價格錄入；訂單生成一條寫好的 WhatsApp 訊息發給店裡。",
      it: "Una pokeria e sushi bar nel centro storico della Spezia. La prima schermata è il compositore di bowl: tre formati con cosa includono, poi base, ingredienti, proteine, salse e topping, con il prezzo che si aggiorna; i tacos di nori hanno un palco di foto scontornate; tutto il menu sushi con i prezzi reali; l'ordine parte come messaggio WhatsApp già scritto.",
    },
    story: [
      {
        en: "Ming·E is a small counter on Via del Prione with a few tables: poke composed to order, sushi made in front of you, and a house speciality — tacos with a crisp nori shell. It had a Google listing and a paper menu, no website.",
        zh: "Ming·E 是 Via del Prione 上的一个小店面，几张桌子：poke 按单现配、寿司当面做，还有一样招牌——海苔脆壳的 taco。店里有 Google 地图页和纸质菜单，没有网站。",
        "zh-tw": "Ming·E 是 Via del Prione 上的一個小店面，幾張桌子：poke 按單現配、壽司當面做，還有一樣招牌——海苔脆殼的 taco。店裡有 Google 地圖頁和紙本菜單，沒有網站。",
        it: "Ming·E è un piccolo banco in Via del Prione con qualche tavolo: poke composte al momento, sushi preparato davanti a te e una specialità della casa, i tacos con la sfoglia di nori croccante. Aveva la scheda Google e il menu di carta, nessun sito.",
      },
      {
        en: "The site starts from the Mumi Poke design in the Web design section and is rebuilt around this shop: its olive-green mark and pink accent from the printed menu, the bowl builder promoted to the first screen because that is what people come for, and the six taco photos cut out from their studio shots so they sit straight on the page. Ordering goes through WhatsApp, with no backend to run.",
        zh: "这个站从「网页设计」里的 Mumi Poke 那一版出发，围着这家店重做：纸质菜单上的橄榄绿圆章和玫红点题色、配碗器提到首屏（顾客就是为这个来的）、六张 taco 影棚图抠掉底直接落在页面上。下单走 WhatsApp，店里不用维护任何后端。",
        "zh-tw": "這個站從「網頁設計」裡的 Mumi Poke 那一版出發，圍著這家店重做：紙本菜單上的橄欖綠圓章和玫紅點題色、配碗器提到首屏（顧客就是為這個來的）、六張 taco 影棚圖去背直接落在頁面上。下單走 WhatsApp，店裡不用維護任何後端。",
        it: "Il sito parte dal design Mumi Poke della sezione Web design e viene ricostruito attorno a questo locale: il marchio verde oliva e l'accento rosa del menu stampato, il compositore di bowl portato in prima schermata perché è quello per cui la gente entra, e le sei foto dei tacos scontornate dagli scatti in studio così da posarsi direttamente sulla pagina. L'ordine passa da WhatsApp, senza alcun backend da gestire.",
      },
    ],
    features: [
      "Bowl builder as the first screen: 3 sizes, each with its included counts; extras priced automatically",
      "Section hue follows the protein you hover, brand green until you choose",
      "Nori tacos stage: cut-out photos with transparent background, list drives the picture, auto-cycles when in view",
      "Full sushi menu, 9 categories / 63 items, two-price rows (2 pz / 6 pz etc.), every price adds to the order",
      "Order drawer → pre-filled WhatsApp message (mode, items, total, name and pickup time / address to fill)",
      "Google Maps embed, hours and phone from the live listing; 4.6★ shown from Google",
    ],
    accent: "#7f9b4f",
    lang: "it",
    alt: [
      {
        id: "ordina",
        dir: "ordina",
        title: { en: "Ordering site", zh: "点单站", "zh-tw": "點單站", it: "Sito d'ordinazione" },
        gist: {
          en: "The same menu in the visual language of the Mumi Sushi ordering site: cool two-tone ground, a floating glass top bar, a sticky category column with thumbnails, a two-column dish grid, the cart pinned on the right. The client saw that site and asked for its look — so here it is with their own name, hours, menu and WhatsApp number, in the brand's olive green.",
          zh: "同一份菜单，换成 Mumi Sushi 点单站的视觉语言：冷色双色底、悬浮玻璃顶栏、带缩略图的钉住分类栏、双列菜品卡、右侧固定购物车。客户看了那个站想要那种样子——这里换上他们自己的店名、营业时间、菜单和 WhatsApp 号，点题色用品牌的橄榄绿。",
          "zh-tw": "同一份菜單，換成 Mumi Sushi 點單站的視覺語言：冷色雙色底、懸浮玻璃頂欄、帶縮圖的釘住分類欄、雙列菜品卡、右側固定購物車。客戶看了那個站想要那種樣子——這裡換上他們自己的店名、營業時間、菜單和 WhatsApp 號，點題色用品牌的橄欖綠。",
          it: "Lo stesso menu nella lingua visiva del sito d'ordinazione Mumi Sushi: fondo freddo a due toni, barra superiore in vetro, colonna categorie fissa con miniature, griglia piatti a due colonne, carrello ancorato a destra. Il cliente ha visto quel sito e ne ha chiesto il look: eccolo con nome, orari, menu e numero WhatsApp suoi, nel verde oliva del marchio.",
        },
      },
    ],
  },
];

/** 文案有原文的语言（sitemap / hreflang 只列这几种） */
export const CLIENTS_LANGS: readonly Locale[] = ["en", "zh", "zh-tw", "it"];

export function clientBySlug(slug: string): ClientSite | undefined {
  return clients.find((c) => c.slug === slug);
}
export function pagePath(c: ClientSite): string {
  return `/clients/${c.slug}/index.html`;
}
export function posterPath(c: ClientSite, alt?: string): string {
  return alt ? `/clients/_posters/${c.slug}--${alt}.jpg` : `/clients/_posters/${c.slug}.jpg`;
}
export function altPagePath(c: ClientSite, dir: string): string {
  return `/clients/${c.slug}/${dir}/index.html`;
}

export const clientsCopy = {
  /** 导航格：跟「设计库」「网页设计」并排，容量见 globals.css .nav-inner 的注释 */
  navLabel: { en: "Client sites", zh: "客户样板", "zh-tw": "客戶樣板", ja: "実績", ko: "고객 사이트", it: "Siti clienti", fr: "Sites clients", de: "Kundenseiten", es: "Clientes", pt: "Clientes", ru: "Клиенты", ar: "مواقع العملاء" },
  title: { en: "Client sites", zh: "客户样板", "zh-tw": "客戶樣板", ja: "クライアント実績", ko: "고객 사이트", it: "Siti per clienti" },
  intro: {
    en: "Sites built for real businesses, shown as they were delivered. Unlike the Web design section, these carry the shop's own name, menu, prices and contacts. Scroll them, click them, or open them full screen.",
    zh: "给真实商家做的网站，按交付时的样子放在这里。跟「网页设计」那些虚构店名的模版不同，这里的店名、菜单、价格和联系方式都是店家自己的。可以滚、可以点、也可以整页打开。",
    "zh-tw": "給真實商家做的網站，按交付時的樣子放在這裡。跟「網頁設計」那些虛構店名的模版不同，這裡的店名、菜單、價格和聯絡方式都是店家自己的。可以捲、可以點、也可以整頁打開。",
    it: "Siti costruiti per attività reali, mostrati come sono stati consegnati. A differenza della sezione Web design, qui nome, menu, prezzi e contatti sono quelli del locale. Scorri, clicca, oppure apri a schermo intero.",
  },
  delivered: { en: "Delivered site", zh: "交付版", "zh-tw": "交付版", it: "Sito consegnato", ja: "納品版", ko: "납품 버전" },
  openFull: { en: "Open full screen", zh: "整页打开", "zh-tw": "整頁打開", it: "Apri a schermo intero", ja: "全画面で開く", ko: "전체 화면으로 열기" },
  storyTitle: { en: "The brief", zh: "来龙去脉", "zh-tw": "來龍去脈", it: "Il brief", ja: "背景", ko: "배경" },
  featuresTitle: { en: "What is in it", zh: "里面有什么", "zh-tw": "裡面有什麼", it: "Cosa contiene", ja: "内容", ko: "구성" },
  all: { en: "All client sites", zh: "全部客户样板", "zh-tw": "全部客戶樣板", it: "Tutti i siti clienti", ja: "すべての実績", ko: "모든 고객 사이트" },
  live: { en: "Visit the live site", zh: "访问上线的站", "zh-tw": "前往上線的站", it: "Vai al sito online", ja: "公開サイトへ", ko: "실제 사이트 보기" },
  note: {
    en: "Menu and prices are the shop's at delivery time; the live site may have moved on since.",
    zh: "菜单与价格为交付时店家的版本，上线后的站可能已更新。",
    "zh-tw": "菜單與價格為交付時店家的版本，上線後的站可能已更新。",
    it: "Menu e prezzi sono quelli del locale al momento della consegna; il sito online può essere cambiato nel frattempo.",
  },
  cta: {
    en: "Want a site like this for your business? Write to",
    zh: "想给自己的店做一个这样的网站？写信到",
    "zh-tw": "想給自己的店做一個這樣的網站？寫信到",
    it: "Vuoi un sito così per la tua attività? Scrivi a",
  },
} satisfies Record<string, Localized>;
