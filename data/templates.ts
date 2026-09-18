import type { Locale, Localized } from "@/lib/i18n";

/**
 * Templates = 网页设计模版。
 *
 * 每套模版是一个**完整的商铺网站**（意大利语、多屏、带菜单筛选/预约弹窗/购物车
 * 这类交互），不是 /lab 那种单个效果；同一个行业下有 4 种设计，各自是独立的品牌
 * 名和整套页面。文件放在 `public/templates/<slug>/` 与 `<slug>/<style>/`，
 * 由 `scripts/import-templates.mjs` 从桌面那套源目录搬进来 —— **别手改 public
 * 里的文件**，改了下次重跑脚本就没了。
 *
 * 展示层的做法沿用 /lab：iframe 里跑真的页面。跟 /lab 的差别是这里一页是一整个
 * 网站，所以框要高（720）、要能在框里滚，并且给「整页打开」。
 */

export type GroupId = "food" | "retail" | "supply" | "services";
export type StyleId = "original" | "editorial" | "night-glass" | "pop" | "claude" | "abisso" | "mercato";

export interface TemplateGroup {
  id: GroupId;
  title: Localized;
  intro: Localized;
  accent: string;
}

/**
 * 行业分组。用户 09-17 拍板「里面也要分开，比如餐饮板块、百货店、食品店板块」——
 * 所以这一层是**行业**，不是设计风格（风格是每套模版里面的 4 个 tab）。
 */
export const groups: TemplateGroup[] = [
  {
    id: "food",
    title: { en: "Restaurants & food", zh: "餐饮", "zh-tw": "餐飲", it: "Ristorazione", ja: "飲食店", ko: "음식점" },
    intro: {
      en: "Ramen bar, all-you-can-eat, sushi takeaway, poke. Menu with category filters, a bowl builder, table booking dialog, a cart that adds up an order.",
      zh: "拉面店、自助餐、寿司外卖、poke。带分类筛选的菜单、配碗器、订座弹窗、能加总的购物车。",
      "zh-tw": "拉麵店、吃到飽、壽司外帶、poke。帶分類篩選的菜單、配碗器、訂位彈窗、能加總的購物車。",
      it: "Ramen bar, all you can eat, sushi da asporto, poke. Menù con filtri per categoria, bowl da comporre, prenotazione del tavolo, carrello che somma l’ordine.",
    },
    accent: "#e05a3a",
  },
  {
    id: "retail",
    title: { en: "Department store", zh: "百货店", "zh-tw": "百貨店", it: "Grande magazzino", ja: "百貨店", ko: "백화점" },
    intro: {
      en: "A multi-floor store: departments, weekly new arrivals, services, opening hours and a shopping bag.",
      zh: "多层百货：楼层部门、每周新品、服务项目、营业时间、购物袋。",
      "zh-tw": "多層百貨：樓層部門、每週新品、服務項目、營業時間、購物袋。",
      it: "Un grande magazzino su più piani: reparti, novità della settimana, servizi, orari e shopping bag.",
    },
    accent: "#f4c63f",
  },
  {
    id: "supply",
    title: { en: "Food supply", zh: "食品供应", "zh-tw": "食品供應", it: "Forniture alimentari", ja: "食品卸", ko: "식자재 공급" },
    intro: {
      en: "B2B, one in Italian and one in Chinese: a catalogue with filters, supply chain and delivery zones, and a quote or enquiry request instead of a checkout.",
      zh: "面向餐厅酒店的 B2B，一套意大利语、一套中文：可筛选的产品目录、供应链与配送区域、用「索取报价 / 询价单」代替结账。",
      "zh-tw": "面向餐廳飯店的 B2B，一套義大利語、一套中文：可篩選的產品目錄、供應鏈與配送區域、用「索取報價 / 詢價單」代替結帳。",
      it: "B2B, uno in italiano e uno in cinese: catalogo con filtri, filiera e zone di consegna, richiesta di preventivo al posto del carrello.",
    },
    accent: "#234431",
  },
  {
    id: "services",
    title: { en: "Local services", zh: "生活服务", "zh-tw": "生活服務", it: "Servizi", ja: "サービス", ko: "서비스" },
    intro: {
      en: "Nail studio and phone repair: services with prices, how it works, guarantee, and an appointment form.",
      zh: "美甲店与手机维修店：带价格的服务清单、流程说明、保修条款、预约表单。",
      "zh-tw": "美甲店與手機維修店：帶價格的服務清單、流程說明、保固條款、預約表單。",
      it: "Nail studio e riparazioni smartphone: servizi con prezzi, come funziona, garanzia e modulo di prenotazione.",
    },
    accent: "#782f43",
  },
];

/**
 * 5 种设计。`original` 是每个行业自己那套（有真实照片的 hero、自己的配色）；
 * editorial / night-glass / pop 是同一套内容的三种视觉解读；`claude` 是另一只手
 * 按同一个行业另起的一版，店名、版式、文案都是它自己的（对外叫「特别版」，
 * 用户 09-18 拍板不露 Claude 字样；id 不改，路径 <slug>/claude/ 已上线）。
 * 不是每套模版都有全部 5 种 —— 看 SiteTemplate.designs。
 */
export const styles: { id: StyleId; title: Localized; gist: Localized }[] = [
  {
    id: "original",
    title: { en: "Original", zh: "原版", "zh-tw": "原版", it: "Originale", ja: "オリジナル", ko: "오리지널" },
    gist: {
      en: "Photo-led hero, the industry’s own palette, the full set of interactions.",
      zh: "照片打头的首屏、这个行业自己的配色、完整的交互。",
      "zh-tw": "照片打頭的首屏、這個行業自己的配色、完整的互動。",
      it: "Hero fotografico, palette del settore, tutte le interazioni.",
    },
  },
  {
    id: "editorial",
    title: { en: "Editorial", zh: "编辑杂志", "zh-tw": "編輯雜誌", it: "Editoriale", ja: "エディトリアル", ko: "에디토리얼" },
    gist: {
      en: "Cream paper, serif italics, a single red accent, one big glyph instead of a photo.",
      zh: "米色纸底、衬线斜体、只有一个红色强调色、用一个大字形代替照片。",
      "zh-tw": "米色紙底、襯線斜體、只有一個紅色強調色、用一個大字形代替照片。",
      it: "Carta avorio, corsivo serif, un solo accento rosso, un grande glifo al posto della foto.",
    },
  },
  {
    id: "night-glass",
    title: { en: "Night glass", zh: "夜间玻璃", "zh-tw": "夜間玻璃", it: "Vetro notturno", ja: "ナイトグラス", ko: "나이트 글라스" },
    gist: {
      en: "Near-black ground, cyan neon, a frosted glass card that glows.",
      zh: "近黑底、青色霓虹、一块发光的磨砂玻璃卡片。",
      "zh-tw": "近黑底、青色霓虹、一塊發光的磨砂玻璃卡片。",
      it: "Fondo quasi nero, neon ciano, una card in vetro smerigliato che brilla.",
    },
  },
  {
    id: "pop",
    title: { en: "Geometric pop", zh: "活力波普", "zh-tw": "活力波普", it: "Pop geometrico", ja: "ジオメトリック・ポップ", ko: "지오메트릭 팝" },
    gist: {
      en: "Yellow and hot pink, hard shadows, a heavy display face shouting in caps.",
      zh: "黄底配桃红、硬阴影、全大写的粗黑标题字。",
      "zh-tw": "黃底配桃紅、硬陰影、全大寫的粗黑標題字。",
      it: "Giallo e rosa acceso, ombre nette, un carattere display che grida in maiuscolo.",
    },
  },
  {
    id: "claude",
    title: { en: "Special edition", zh: "特别版", "zh-tw": "特別版", it: "Edizione speciale", ja: "特別版", ko: "스페셜 에디션" },
    gist: {
      en: "A second take on the same business: its own name, layout and copy. Hero photo filled in; gallery slots are still placeholders.",
      zh: "同一个行业另起的一版：店名、版式、文案都是它自己的。首屏照片已填，画廊位还是占位框。",
      "zh-tw": "同一個行業另起的一版：店名、版式、文案都是它自己的。首屏照片已填，畫廊位還是佔位框。",
      it: "Una seconda lettura della stessa attività: nome, layout e testi tutti suoi. Foto hero inserita; le foto della galleria sono ancora segnaposto.",
    },
  },
  // 09-18 为 pokeria 手作的两套；别的模版没有
  {
    id: "abisso",
    title: { en: "Deep sea", zh: "深海", "zh-tw": "深海", it: "Abisso", ja: "深海", ko: "심해" },
    gist: {
      en: "Dark chapters that stack as you scroll; the bowl of the day assembles itself from the scroll position; a shimmering headline and a bowl that tilts with the pointer.",
      zh: "深色章节随滚动一层层叠上来；当日碗按滚动位置自己组装；流光标题、跟着指针分层倾斜的碗。",
      "zh-tw": "深色章節隨捲動一層層疊上來；當日碗按捲動位置自己組裝；流光標題、跟著指標分層傾斜的碗。",
      it: "Capitoli scuri che si impilano scorrendo; la bowl del giorno si compone dalla posizione di scroll; titolo cangiante e una bowl che si inclina col puntatore.",
    },
  },
  {
    id: "mercato",
    title: { en: "Market board", zh: "市集板", "zh-tw": "市集板", it: "Mercato", ja: "マーケットボード", ko: "마켓 보드" },
    gist: {
      en: "Paper, ink and one coral: a menu board with a ticket, filter tabs that re-sort the cards with FLIP motion, a rolling chapter strip, a receipt that writes itself, and a remove button that eats its own label.",
      zh: "纸白、墨黑、一点珊瑚红：菜单板配小票；筛选标签重排卡片带 FLIP 位移；粘顶章节条翻滚；小票自己写；删除按钮把自己的字吃掉。",
      "zh-tw": "紙白、墨黑、一點珊瑚紅：菜單板配小票；篩選標籤重排卡片帶 FLIP 位移；黏頂章節條翻滾；小票自己寫；刪除按鈕把自己的字吃掉。",
      it: "Carta, inchiostro e un corallo: una lavagna con lo scontrino, filtri che riordinano le card con moto FLIP, una striscia di capitoli che rotola, uno scontrino che si scrive da solo e un tasto rimuovi che mangia la propria etichetta.",
    },
  },
];

export interface SiteTemplate {
  slug: string;
  group: GroupId;
  /** ISO date，进 sitemap 的 lastModified */
  date: string;
  /** 原版的品牌名（虚构的） */
  name: string;
  /** 行业 + 城市，一行 */
  industry: Localized;
  city: string;
  /** 一句话说清这套模版里有什么。列表卡片 + <meta description> 都用它。 */
  gist: Localized;
  /** 页面里真的做出来的东西（不是「响应式」这种废话）。英文。 */
  features: string[];
  /** 各变体自己的品牌名（都是虚构的）；缺的键 = 这套没有那种设计 */
  variants: Partial<Record<Exclude<StyleId, "original">, string>>;
  /** 原版的主色，用在卡片占位与页面点缀 */
  accent: string;
  /** 模版本身的语言。绝大多数是意大利语，绿达康那套是中文 */
  lang: "it" | "zh";
}

export const templates: SiteTemplate[] = [
  {
    slug: "ramen",
    group: "food",
    date: "2026-07-18",
    name: "Kumo Ramen",
    industry: { en: "Ramen bar", zh: "拉面店", "zh-tw": "拉麵店", it: "Ramen bar", ja: "ラーメン店", ko: "라멘집" },
    city: "Milano",
    gist: {
      en: "A ramen bar on the Navigli: a bowl for every mood, the broth first, a quiet corner, and a table booking dialog.",
      zh: "运河区的拉面店：按心情选碗、先讲汤底、再讲店面，最后一个订座弹窗。",
      "zh-tw": "運河區的拉麵店：按心情選碗、先講湯底、再講店面，最後一個訂位彈窗。",
      it: "Un ramen bar sui Navigli: una ciotola per ogni umore, prima il brodo, un angolo quieto, e la prenotazione del tavolo.",
    },
    features: ["Menu with category filter", "Table booking dialog + toast", "Sticky header, mobile menu", "Reduced-motion aware"],
    variants: { editorial: "Kado Ramen", "night-glass": "Neon Broth", pop: "Ramen Pop", claude: "Kuroba Ramen" },
    accent: "#c8442a",
    lang: "it",
  },
  {
    slug: "all-you-can-eat",
    group: "food",
    date: "2026-07-18",
    name: "Mizu Infinity",
    industry: { en: "All you can eat", zh: "日式自助", "zh-tw": "日式吃到飽", it: "All you can eat", ja: "食べ放題", ko: "무한리필" },
    city: "Torino",
    gist: {
      en: "All-you-can-eat à la carte: the formula and its rules, prices by service, a hundred dishes with filters, an allergen register.",
      zh: "点单式自助：套餐规则、午晚市价格、上百道菜的筛选、过敏原登记。",
      "zh-tw": "點單式吃到飽：套餐規則、午晚市價格、上百道菜的篩選、過敏原登記。",
      it: "All you can eat à la carte: la formula e le regole, prezzi per servizio, cento piatti con filtri, registro allergeni.",
    },
    features: ["Formula + rules section", "Price table by service", "Menu filter", "Booking dialog", "Allergen register"],
    variants: { editorial: "Senza Fine", "night-glass": "Orbit Sushi", pop: "Mangia! Club", claude: "Momiji Sushi & Grill" },
    accent: "#1f6f8b",
    lang: "it",
  },
  {
    slug: "sushi-takeaway",
    group: "food",
    date: "2026-07-18",
    name: "Nori Express",
    industry: { en: "Sushi takeaway", zh: "寿司外卖", "zh-tw": "壽司外帶", it: "Sushi da asporto", ja: "持ち帰り寿司", ko: "스시 테이크아웃" },
    city: "Bologna",
    gist: {
      en: "Takeaway and delivery: pick boxes, add them to a cart that totals up, see how the packaging works and where the shop is.",
      zh: "外带与外送：选套盒、加进能算总价的购物车、看包装怎么做、店在哪。",
      "zh-tw": "外帶與外送：選套盒、加進能算總價的購物車、看包裝怎麼做、店在哪。",
      it: "Asporto e consegna: scegli i box, aggiungili a un carrello che fa il totale, la confezione, dove siamo.",
    },
    features: ["Box picker with filter", "Cart drawer with totals", "Group ordering section", "Packaging explainer"],
    variants: { editorial: "Maki 12", "night-glass": "Nori Night", pop: "Box Box", claude: "SakéBox Takeaway" },
    accent: "#e76649",
    lang: "it",
  },
  {
    slug: "pokeria",
    group: "food",
    date: "2026-09-18",
    name: "Mumi Poke",
    industry: { en: "Poke bowl bar", zh: "波奇碗店", "zh-tw": "波奇碗店", it: "Pokeria", ja: "ポキ丼店", ko: "포케 바" },
    city: "Vimercate",
    gist: {
      en: "Fast-casual poke in six designs, three of them hand-built from the Design Library: a bowl builder with a live price and a bowl that draws itself, a dark version where the bowl assembles from the scroll position, and a market-board version with FLIP-sorted cards and a self-writing receipt. All with a cart.",
      zh: "快餐式 poke，六种设计，其中三种是用设计资源库的效果手作的：配碗器价格实时加总、碗当场画出来；深海版的碗按滚动位置自己组装；市集板版卡片带 FLIP 重排、小票自己写。都带购物车。",
      "zh-tw": "快餐式 poke，六種設計，其中三種是用設計資源庫的效果手作的：配碗器價格即時加總、碗當場畫出來；深海版的碗按捲動位置自己組裝；市集板版卡片帶 FLIP 重排、小票自己寫。都帶購物車。",
      it: "Poke fast-casual in sei design, tre costruiti a mano con la Libreria design: una bowl da comporre con prezzo in tempo reale, una versione scura dove la bowl si compone scorrendo, e una lavagna da mercato con card riordinate in FLIP e uno scontrino che si scrive da solo. Tutte con carrello.",
    },
    features: [
      "Bowl builder: size, base, protein, toppings, sauce — live price",
      "SVG bowl redrawn from the current selection",
      "Section hue follows the hovered protein (registered --h)",
      "Signature rail with CSS scroll-snap",
      "Manifesto paragraph brightens word by word on scroll",
      "Staggered character reveal, drifting colour blobs, magnetic CTA",
      "Cart drawer with totals, delivery / pickup switch",
      "Deep sea: stacking chapters, scroll-assembled bowl, shimmer headline, pointer parallax",
      "Market board: FLIP-sorted cards, rolling chapter strip, self-writing receipt, label-eating remove button",
    ],
    variants: { editorial: "Onda Poke", "night-glass": "Poke Notte", pop: "Poke Pop", abisso: "Mumi Poke", mercato: "Mumi Poke" },
    accent: "#ff7a59",
    lang: "it",
  },
  {
    slug: "department-store",
    group: "retail",
    date: "2026-07-18",
    name: "Casa Mercato",
    industry: { en: "Department store", zh: "百货店", "zh-tw": "百貨店", it: "Department store", ja: "百貨店", ko: "백화점" },
    city: "Roma",
    gist: {
      en: "Seven floors of a department store: departments, weekly new arrivals, home colours, services, the store itself, a shopping bag.",
      zh: "七层百货：楼层部门、每周新品、家居色彩、服务、门店信息、购物袋。",
      "zh-tw": "七層百貨：樓層部門、每週新品、家居色彩、服務、門店資訊、購物袋。",
      it: "Sette piani: reparti, novità della settimana, la casa a colori, servizi, lo store, la shopping bag.",
    },
    features: ["Departments by floor", "New arrivals filter", "Shopping bag dialog", "Services grid", "Store hours"],
    variants: { editorial: "Piano Sette", "night-glass": "Nova Store", pop: "Tutto!", claude: "Grande Emporio" },
    accent: "#f4c63f",
    lang: "it",
  },
  {
    slug: "food-supplier",
    group: "supply",
    date: "2026-07-18",
    name: "Dispensa Pro",
    industry: { en: "Food supplier (B2B)", zh: "食品供应商 (B2B)", "zh-tw": "食品供應商 (B2B)", it: "Forniture alimentari B2B", ja: "食品卸 (B2B)", ko: "식자재 공급 (B2B)" },
    city: "Parma",
    gist: {
      en: "Fresh supply for restaurants, hotels and catering: a filterable catalogue, the chain from source to kitchen, delivery zones, and a quote form.",
      zh: "供餐厅、酒店、团餐的生鲜：可筛选的产品目录、从产地到后厨的链路、配送区域、索取报价表单。",
      "zh-tw": "供餐廳、飯店、團餐的生鮮：可篩選的產品目錄、從產地到後廚的鏈路、配送區域、索取報價表單。",
      it: "Forniture fresche per ristoranti, hotel e catering: catalogo con filtri, la filiera, le zone di consegna, il modulo preventivo.",
    },
    features: ["Catalogue with category filter", "Supply chain steps", "Delivery zones", "Quote request form"],
    variants: { editorial: "Fonte", "night-glass": "Chain Pro", pop: "Buono Bulk", claude: "Oriente Food Service" },
    accent: "#234431",
    lang: "it",
  },
  {
    slug: "fresh-supply",
    group: "supply",
    date: "2026-07-18",
    name: "青禾鲜供",
    industry: { en: "Fresh produce supplier (B2B, Chinese)", zh: "生鲜蔬菜供应商 (B2B · 中文)", "zh-tw": "生鮮蔬菜供應商 (B2B · 中文)", it: "Ortofrutta B2B (in cinese)", ja: "青果卸 (B2B・中国語)", ko: "신선 농산물 공급 (B2B · 중국어)" },
    city: "上海",
    gist: {
      en: "A Chinese-language B2B produce supplier for restaurants, hotels and canteens: today’s produce with category filters, an enquiry list instead of a cart, a purchasing request form, delivery zones across the Yangtze delta, and the cold chain from field to kitchen.",
      zh: "面向餐饮、酒店与团餐的中文 B2B 生鲜站：今日菜品带品类筛选、用「询价单」代替购物车、企业采购需求提交、长三角配送区域查询、从产地预冷到分拣冷链的流程展示。",
      "zh-tw": "面向餐飲、飯店與團膳的中文 B2B 生鮮站：今日菜品帶品類篩選、用「詢價單」代替購物車、企業採購需求提交、長三角配送區域查詢、從產地預冷到分揀冷鏈的流程展示。",
      it: "Fornitore B2B di ortofrutta in cinese, per ristoranti, hotel e mense: prodotti del giorno con filtri, lista di richiesta al posto del carrello, modulo acquisti, zone di consegna nel delta dello Yangtze, la catena del freddo dal campo alla cucina.",
    },
    features: ["Today’s produce with category filter", "Enquiry list (add items, no checkout)", "Purchasing request form", "Delivery zone lookup", "Cold-chain process section"],
    variants: {},
    accent: "#063d2d",
    lang: "zh",
  },
  {
    slug: "nail-salon",
    group: "services",
    date: "2026-07-18",
    name: "Atelier Lacca",
    industry: { en: "Nail studio", zh: "美甲店", "zh-tw": "美甲店", it: "Nail studio", ja: "ネイルサロン", ko: "네일숍" },
    city: "Firenze",
    gist: {
      en: "A one-client-at-a-time nail studio: rituals with prices, a mood gallery, the space, and appointment booking.",
      zh: "一次只服务一位客人的美甲工作室：带价格的项目、氛围图集、店面、预约。",
      "zh-tw": "一次只服務一位客人的美甲工作室：帶價格的項目、氛圍圖集、店面、預約。",
      it: "Uno studio una persona alla volta: rituali con prezzi, galleria di atmosfere, lo spazio, la prenotazione.",
    },
    features: ["Services with prices", "Mood gallery", "Booking dialog", "Sticky header"],
    variants: { editorial: "Unghia Studio", "night-glass": "Gloss Lab", pop: "Pop Nails", claude: "Atelier Unghie" },
    accent: "#782f43",
    lang: "it",
  },
  {
    slug: "phone-repair",
    group: "services",
    date: "2026-07-18",
    name: "Pronto Lab",
    industry: { en: "Phone repair", zh: "手机维修", "zh-tw": "手機維修", it: "Riparazioni smartphone", ja: "スマホ修理", ko: "휴대폰 수리" },
    city: "Milano",
    gist: {
      en: "Transparent phone repairs: what we fix, three steps, the guarantee, the shop, and a form that asks what broke and when you can come.",
      zh: "价格透明的手机维修：修什么、三步流程、保修、门店，以及一个问「坏了什么、什么时候来」的表单。",
      "zh-tw": "價格透明的手機維修：修什麼、三步流程、保固、門市，以及一個問「壞了什麼、什麼時候來」的表單。",
      it: "Riparazioni trasparenti: cosa ripariamo, tre passaggi, la garanzia, il negozio, e un modulo che chiede cosa si è rotto e quando puoi passare.",
    },
    features: ["Repairs list with prices", "Three-step process", "Guarantee section", "Two-step booking form"],
    variants: { editorial: "Officina Mobile", "night-glass": "Pixel Fix", pop: "Pronto Pop", claude: "FixPoint Riparazioni" },
    accent: "#1d4ed8",
    lang: "it",
  },
];

/**
 * 这个板块的文案写了哪几种原文 —— 页面的 hreflang/canonical 与 sitemap 都读它。
 * 🩸 不能放在 page.tsx 里 export：Next 不允许 page 文件导出多余的东西，构建会红。
 */
export const TEMPLATES_LANGS: readonly Locale[] = ["en", "zh", "zh-tw", "it"];

export function templatesIn(group: GroupId): SiteTemplate[] {
  return templates.filter((t) => t.group === group);
}

/** 没有模版的分组不出现 —— 空分组页比没有分组更伤。 */
export function activeGroups(): TemplateGroup[] {
  return groups.filter((g) => templatesIn(g.id).length > 0);
}

export function groupById(id: string): TemplateGroup | undefined {
  return groups.find((g) => g.id === id);
}

export function templateBySlug(slug: string): SiteTemplate | undefined {
  return templates.find((t) => t.slug === slug);
}

/**
 * 页面与海报的路径都由 slug + style 推导，不在数据里手写。
 * 🩸 页面路径必须带 `index.html`：本站 proxy 会把不带点的路径按语言重定向，
 *    `/templates/ramen/` 会被送去 `/en/templates/ramen/` 而不是静态文件。
 */
export function pagePath(t: SiteTemplate, style: StyleId): string {
  return style === "original" ? `/templates/${t.slug}/index.html` : `/templates/${t.slug}/${style}/index.html`;
}
export function posterPath(t: SiteTemplate, style: StyleId): string {
  return `/templates/_posters/${t.slug}--${style}.jpg`;
}
export function brandOf(t: SiteTemplate, style: StyleId): string {
  return style === "original" ? t.name : (t.variants[style] ?? t.name);
}

/** 这套模版实际有哪几种设计（按 styles 的顺序）。原版一定有，其余看 variants 里有没有名字。 */
export function designsOf(t: SiteTemplate): StyleId[] {
  return styles.map((s) => s.id).filter((id) => id === "original" || t.variants[id as Exclude<StyleId, "original">] !== undefined);
}

export const templatesCopy = {
  /** 导航栏那一格比页面标题短：导航容量是固定的 980px，加一项就得从别处省（见 globals.css .nav-links 的注释） */
  navLabel: { en: "Templates", zh: "网页模版", "zh-tw": "網頁模版", ja: "テンプレート", ko: "템플릿", it: "Template", fr: "Modèles", de: "Vorlagen", es: "Plantillas", pt: "Modelos", ru: "Шаблоны", ar: "قوالب" },
  title: { en: "Web templates", zh: "网页设计模版", "zh-tw": "網頁設計模版", ja: "Web テンプレート", ko: "웹 템플릿", it: "Template web" },
  intro: {
    en: "Complete websites for local businesses, built as working pages rather than mockups: menus you can filter, bookings you can open, carts that add up. Most are in Italian, one is in Chinese, and each business comes in up to five designs. Everything you see runs live in the page — scroll it, click it, or open it full screen.",
    zh: "为本地商家做的整站模版，做成能用的页面而不是效果图：菜单能筛选、预约能弹出、购物车能加总。大多是意大利语，有一套中文；每个行业最多五种设计。这里看到的都在页面里真的跑着 —— 可以滚、可以点、也可以整页打开。",
    "zh-tw": "為本地商家做的整站模版，做成能用的頁面而不是效果圖：菜單能篩選、預約能彈出、購物車能加總。大多是義大利語，有一套中文；每個行業最多五種設計。這裡看到的都在頁面裡真的跑著 —— 可以捲、可以點、也可以整頁打開。",
    it: "Siti completi per attività locali, costruiti come pagine funzionanti e non come mockup: menù con filtri, prenotazioni che si aprono, carrelli che fanno il totale. Quasi tutti in italiano, uno in cinese, e ogni attività in fino a cinque design. Tutto quello che vedi gira davvero nella pagina: scorri, clicca, oppure aprilo a schermo intero.",
  },
  count: { en: "templates", zh: "套模版", "zh-tw": "套模版", it: "template", ja: "テンプレート", ko: "템플릿" },
  countOne: { en: "template", zh: "套模版", "zh-tw": "套模版", it: "template", ja: "テンプレート", ko: "템플릿" },
  designs: { en: "designs", zh: "种设计", "zh-tw": "種設計", it: "design", ja: "デザイン", ko: "디자인" },
  openFull: { en: "Open full screen", zh: "整页打开", "zh-tw": "整頁打開", it: "Apri a schermo intero", ja: "全画面で開く", ko: "전체 화면으로 열기" },
  design: { en: "design", zh: "种设计", "zh-tw": "種設計", it: "design", ja: "デザイン", ko: "디자인" },
  featuresTitle: { en: "What is in it", zh: "里面有什么", "zh-tw": "裡面有什麼", it: "Cosa contiene", ja: "内容", ko: "구성" },
  allGroups: { en: "All templates", zh: "全部模版", "zh-tw": "全部模版", it: "Tutti i template", ja: "すべてのテンプレート", ko: "모든 템플릿" },
  demoNote: {
    en: "Names, addresses, prices and contacts are fictional demo content.",
    zh: "店名、地址、价格与联系方式均为虚构的演示内容。",
    "zh-tw": "店名、地址、價格與聯絡方式均為虛構的演示內容。",
    it: "Nomi, indirizzi, prezzi e contatti sono contenuti dimostrativi e fittizi.",
  },
  cta: {
    en: "Want one of these for your business? Write to",
    zh: "想给自己的店做一个？写信到",
    "zh-tw": "想給自己的店做一個？寫信到",
    it: "Ne vuoi uno per la tua attività? Scrivi a",
  },
} satisfies Record<string, Localized>;
