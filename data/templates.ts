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
export type StyleId = "original" | "editorial" | "night-glass" | "pop" | "claude" | "abisso" | "mercato" | "kaiten" | "tavolo" | "ukiyo" | "yoru" | "shizuka" | "yatai" | "manga" | "loop" | "showa" | "app" | "kraft";

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
      en: "Ramen bar, all-you-can-eat, sushi takeaway, poke, gelato, wine bar. Menu with category filters, a bowl builder, table, cake and tasting bookings, a cart that adds up an order.",
      zh: "拉面店、自助餐、寿司外卖、poke、冰淇淋、酒窖酒吧。带分类筛选的菜单、配碗器、订座/订蛋糕/品鉴弹窗、能加总的购物车。",
      "zh-tw": "拉麵店、吃到飽、壽司外帶、poke、冰淇淋、酒窖酒吧。帶分類篩選的菜單、配碗器、訂位/訂蛋糕/品鑑彈窗、能加總的購物車。",
      it: "Ramen bar, all you can eat, sushi da asporto, poke, gelato, enoteca. Menù con filtri per categoria, bowl da comporre, prenotazione di tavoli, torte e degustazioni, carrello che somma l’ordine.",
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
      en: "Nail studio, phone repair, florist: services with prices, how it works, guarantee, and booking or order forms.",
      zh: "美甲店、手机维修店、花店：带价格的服务清单、流程说明、保修条款、预约/下单表单。",
      "zh-tw": "美甲店、手機維修店、花店：帶價格的服務清單、流程說明、保固條款、預約/下單表單。",
      it: "Nail studio, riparazioni smartphone, fiorista: servizi con prezzi, come funziona, garanzia e moduli di prenotazione o ordine.",
    },
    accent: "#782f43",
  },
];

/**
 * `original` 是每个行业自己那套（有真实照片的 hero、自己的配色）；
 * editorial / night-glass / pop 是同一套内容的三种视觉解读（🩸 09-18 起 night-glass 只有
 * enoteca 保留、pop 只有 gelateria 保留——用户觉得同款变体不适合别的行业，import 脚本里
 * 也拦了；**以后新板块不做生成器变体，每种设计都单独设计**）；`claude` 是另一只手
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
  // 09-18 为 sushi 手作的两套
  {
    id: "kaiten",
    title: { en: "Conveyor belt", zh: "回转", "zh-tw": "迴轉", it: "Kaiten", ja: "回転", ko: "회전" },
    gist: {
      en: "Bright and quick: a belt of real plates that never stops, four rim colours that are the prices — hover one and the section repaints — and a pile that stacks as you order.",
      zh: "明快：一条永不停的真盘子传送带；四种盘沿颜色就是价格，悬停哪个整段跟着换色；点单堆成一摞盘子。",
      "zh-tw": "明快：一條永不停的真盤子傳送帶；四種盤緣顏色就是價格，懸停哪個整段跟著換色；點單堆成一疊盤子。",
      it: "Chiaro e veloce: un nastro di piatti veri che non si ferma, quattro colori del bordo che sono i prezzi — passa su uno e la sezione si ridipinge — e una pila che cresce mentre ordini.",
    },
  },
  {
    id: "tavolo",
    title: { en: "At the table", zh: "桌边点单", "zh-tw": "桌邊點單", it: "Tavolo", ja: "テーブル注文", ko: "테이블 주문" },
    gist: {
      en: "QR ordering: scroll pushes you through a cloud tunnel into the menu, whose background hue follows the category you touch; titles rise one glyph at a time.",
      zh: "扫码点单：滚动穿过云雾隧道进入菜单，菜单背景色相跟着你碰的分类走；标题逐字升起。",
      "zh-tw": "掃碼點單：捲動穿過雲霧隧道進入菜單，菜單背景色相跟著你碰的分類走；標題逐字升起。",
      it: "Ordine dal tavolo: lo scroll ti spinge in un tunnel di nubi fino al menù, il cui colore segue la categoria che tocchi; i titoli salgono una lettera alla volta.",
    },
  },
  // 09-20 九套手作，每套一种完整的视觉语言（用户：不局限于设计库、结合各种风格）
  {
    id: "ukiyo",
    title: { en: "Ukiyo-e", zh: "浮世绘", "zh-tw": "浮世繪", it: "Ukiyo-e", ja: "浮世絵", ko: "우키요에" },
    gist: {
      en: "A woodblock print: washi cream, indigo waves that drift on three periods, a vermilion seal that stamps itself, four seasons as colour blocks, omakase tiers as torn tickets.",
      zh: "一张木版画：和纸米色、三层错周期漂移的靛蓝浪、自己盖上去的朱印、四季色块、撕下来的 Omakase 票根。",
      "zh-tw": "一張木版畫：和紙米色、三層錯週期漂移的靛藍浪、自己蓋上去的朱印、四季色塊、撕下來的 Omakase 票根。",
      it: "Una stampa su legno: carta washi, onde indaco che vanno su tre periodi diversi, un sigillo vermiglio che si timbra da solo, quattro stagioni a blocchi di colore, l’omakase come biglietti strappati.",
    },
  },
  {
    id: "yoru",
    title: { en: "Neon night", zh: "霓虹深夜", "zh-tw": "霓虹深夜", it: "Notte al neon", ja: "ネオンの夜", ko: "네온 나이트" },
    gist: {
      en: "A Tokyo alley at 1 a.m.: rain on a canvas, signs at five depths that drift with the pointer, one tube that flickers, a glitch title that settles, and a vending machine whose buttons light up and print a ticket.",
      zh: "凌晨一点的东京巷子：画布下雨、五层景深随指针漂移的招牌、一根会闪的灯管、抖一下才稳的标题、按下会亮灯并打出食券的自动贩卖机。",
      "zh-tw": "凌晨一點的東京巷子：畫布下雨、五層景深隨指標漂移的招牌、一根會閃的燈管、抖一下才穩的標題、按下會亮燈並印出食券的自動販賣機。",
      it: "Un vicolo di Tokyo all’una di notte: pioggia su canvas, insegne su cinque profondità che seguono il puntatore, un tubo che sfarfalla, un titolo glitch che si assesta, e un distributore i cui tasti si accendono e stampano il biglietto.",
    },
  },
  {
    id: "shizuka",
    title: { en: "Wabi-sabi", zh: "侘寂", "zh-tw": "侘寂", it: "Wabi-sabi", ja: "侘び寂び", ko: "와비사비" },
    gist: {
      en: "Almost nothing: an enso that draws itself, one course at a time on a 1.4s crossfade, a carta whose lines bring their photo along under the pointer, a form with no box around it.",
      zh: "几乎什么都没有：自己画出来的圆相、一次只给一道菜的 1.4 秒淡入淡出、悬停哪行菜哪张照片就跟着指针走、没有框的预约表。",
      "zh-tw": "幾乎什麼都沒有：自己畫出來的圓相、一次只給一道菜的 1.4 秒淡入淡出、懸停哪行菜哪張照片就跟著指標走、沒有框的預約表。",
      it: "Quasi niente: un enso che si disegna da solo, una portata alla volta con dissolvenza di 1,4 s, una carta le cui righe portano la loro foto sotto il puntatore, un modulo senza cornice.",
    },
  },
  {
    id: "yatai",
    title: { en: "Night stall", zh: "深夜屋台", "zh-tw": "深夜屋台", it: "Yatai", ja: "屋台", ko: "야타이" },
    gist: {
      en: "Dark wood, one lamp, real steam: a canvas of soft particles rising off the bowl, a broth clock counting hours since 06:00, a chalkboard menu, and a bowl builder whose drawing updates as you pick broth, noodles and toppings.",
      zh: "深色木台、一盏灯、真的蒸汽：画布粒子从碗沿升起，从早上六点算起的熬汤计时，粉笔黑板菜单，选汤底/面/配料时碗的画会跟着变的配碗器。",
      "zh-tw": "深色木檯、一盞燈、真的蒸汽：畫布粒子從碗緣升起，從早上六點算起的熬湯計時，粉筆黑板菜單，選湯底/麵/配料時碗的畫會跟著變的配碗器。",
      it: "Legno scuro, una lampada, vapore vero: particelle morbide che salgono dalla ciotola, un orologio del brodo che conta dalle sei, una lavagna col gesso, e una ciotola da comporre il cui disegno cambia mentre scegli brodo, noodles e topping.",
    },
  },
  {
    id: "manga",
    title: { en: "Manga", zh: "漫画", "zh-tw": "漫畫", it: "Manga", ja: "マンガ", ko: "만화" },
    gist: {
      en: "A comic: 4px ink panels with hard shadows, halftone and speed lines, speech bubbles that pop in, sound words in Bangers on every dish, a four-panel how-to-eat, and the story as a two-page spread.",
      zh: "一本漫画：4px 墨线分镜格与硬阴影、网点与速度线、弹出来的对话气泡、每道菜配一个拟声词、四格「怎么吃拉面」、跨页讲店史。",
      "zh-tw": "一本漫畫：4px 墨線分鏡格與硬陰影、網點與速度線、彈出來的對話氣泡、每道菜配一個擬聲詞、四格「怎麼吃拉麵」、跨頁講店史。",
      it: "Un fumetto: vignette con bordi da 4 px e ombre nette, retino e linee cinetiche, nuvolette che spuntano, un’onomatopea su ogni piatto, il «come si mangia» in quattro vignette, la storia come doppia pagina.",
    },
  },
  {
    id: "loop",
    title: { en: "Infinite loop", zh: "无限循环", "zh-tw": "無限迴圈", it: "Loop", ja: "ループ", ko: "루프" },
    gist: {
      en: "Kinetic type: three outlined words sliding opposite ways behind the hero, an ∞ that draws then flows, counters that count up, a price card that flips lunch↔dinner in 3D, and three belts of real plates you tap into your round.",
      zh: "动态字体：首屏后面三行反向滑动的描边大字、先画后流动的 ∞、自增计数、午晚市 3D 翻转的价格卡、三排真菜品传送带点一下进本轮点单。",
      "zh-tw": "動態字體：首屏後面三行反向滑動的描邊大字、先畫後流動的 ∞、自增計數、午晚市 3D 翻轉的價格卡、三排真菜品輸送帶點一下進本輪點單。",
      it: "Tipografia cinetica: tre parole in contorno che scorrono in direzioni opposte dietro l’hero, un ∞ che si disegna e poi scorre, contatori che salgono, una card prezzo che si gira in 3D pranzo↔cena, e tre nastri di piatti veri da toccare per il tuo giro.",
    },
  },
  {
    id: "showa",
    title: { en: "Shōwa diner", zh: "昭和食堂", "zh-tw": "昭和食堂", it: "Shōwa", ja: "昭和食堂", ko: "쇼와 식당" },
    gist: {
      en: "A 1970s Japanese diner: film grain, double rules, a checkered band, a plastic-sample showcase behind glass with a glare, flip-digit prices that flip lunch↔dinner, a waving lucky cat and a stamp card you tap round by round.",
      zh: "七十年代日本食堂：胶片颗粒、双线框、格纹带、带反光玻璃的食品样品橱窗、午晚市翻页数字价格、招手的招财猫、一轮一个章的集章卡。",
      "zh-tw": "七十年代日本食堂：膠片顆粒、雙線框、格紋帶、帶反光玻璃的食品樣品櫥窗、午晚市翻頁數字價格、招手的招財貓、一輪一個章的集章卡。",
      it: "Una tavola calda giapponese anni ’70: grana, doppi filetti, una fascia a scacchi, la vetrina dei campioni dietro un vetro con riflesso, prezzi a cifre che si girano pranzo↔cena, un maneki-neko che saluta e una tessera a timbri, un giro un timbro.",
    },
  },
  {
    id: "app",
    title: { en: "Delivery app", zh: "外卖应用", "zh-tw": "外送應用", it: "App", ja: "アプリ", ko: "앱" },
    gist: {
      en: "A delivery app as a website: search, a sticky category rail that follows the scroll, product sheets that slide up with options and quantity, pickup time slots, a cart drawer with a free-delivery progress bar, a bottom tab bar on phones.",
      zh: "把外卖 app 做成网站：搜索、跟着滚动走的粘顶分类条、带选项和数量的上滑商品页、取餐时段、带「免运费进度条」的购物车抽屉、手机端底部标签栏。",
      "zh-tw": "把外送 app 做成網站：搜尋、跟著捲動走的黏頂分類列、帶選項和數量的上滑商品頁、取餐時段、帶「免運費進度條」的購物車抽屜、手機端底部標籤列。",
      it: "Un’app di delivery come sito: ricerca, una barra di categorie che segue lo scroll, schede prodotto che salgono con opzioni e quantità, fasce orarie di ritiro, un carrello con la barra della consegna gratuita, una tab bar in basso sul telefono.",
    },
  },
  {
    id: "kraft",
    title: { en: "Kraft paper", zh: "牛皮纸", "zh-tw": "牛皮紙", it: "Kraft", ja: "クラフト紙", ko: "크라프트지" },
    gist: {
      en: "Packaging as the brand: kraft brown, a CSS box with a lid and a barcode label, rubber stamps that hit the page, die-cut windows on the box cards, and an order slip in typewriter type where you tick rows and the stamp lands on submit.",
      zh: "包装即品牌：牛皮纸棕、带盖子和条码标签的 CSS 纸盒、砸到页面上的橡皮章、模切开窗的盒子卡片、打字机字体的点单单——勾行加总、提交时盖章。",
      "zh-tw": "包裝即品牌：牛皮紙棕、帶蓋子和條碼標籤的 CSS 紙盒、砸到頁面上的橡皮章、模切開窗的盒子卡片、打字機字體的點單單——勾行加總、提交時蓋章。",
      it: "L’imballo come marchio: kraft, una scatola CSS con coperchio ed etichetta con codice a barre, timbri di gomma che battono sulla pagina, finestre fustellate sulle card delle scatole, e un foglio d’ordine a macchina da scrivere: spunti le righe, il timbro arriva all’invio.",
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
      en: "A ramen bar on the Navigli in five designs, two of them hand-built with the restaurant’s real dishes: a night stall with steam on a canvas and a bowl builder, and a manga with ink panels and sound words.",
      zh: "运河区的拉面店，五种设计，其中两种是用真菜品图手作的：深夜屋台（画布蒸汽、配碗器）和漫画（分镜格、拟声词）。",
      "zh-tw": "運河區的拉麵店，五種設計，其中兩種是用真菜品圖手作的：深夜屋台（畫布蒸汽、配碗器）和漫畫（分鏡格、擬聲詞）。",
      it: "Un ramen bar sui Navigli in cinque design, due costruiti a mano con i piatti veri: uno yatai notturno con vapore su canvas e ciotola da comporre, e un manga con vignette a china e onomatopee.",
    },
    features: ["Menu with category filter", "Table booking dialog + toast", "Sticky header, mobile menu", "Yatai: steam canvas, broth clock, chalkboard, bowl builder with a live drawing, takeaway tray", "Manga: ink panels, halftone, speech bubbles, sound words, four-panel how-to, booking", "Real dish photos from a live menu API"],
    variants: { editorial: "Kado Ramen", claude: "Kuroba Ramen", yatai: "Kumo Ramen", manga: "Kumo Ramen" },
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
      en: "All-you-can-eat à la carte in five designs, two hand-built with real dishes: a kinetic-type loop with three plate belts and a 3D price flip, and a 1970s Japanese diner with a sample showcase, flip-digit prices and a stamp card.",
      zh: "点单式自助，五种设计，其中两种用真菜品图手作：动态字体的无限循环（三排菜品带、3D 翻转价格）和七十年代昭和食堂（样品橱窗、翻页数字价格、集章卡）。",
      "zh-tw": "點單式吃到飽，五種設計，其中兩種用真菜品圖手作：動態字體的無限迴圈（三排菜品帶、3D 翻轉價格）和七十年代昭和食堂（樣品櫥窗、翻頁數字價格、集章卡）。",
      it: "All you can eat à la carte in cinque design, due costruiti a mano con i piatti veri: un loop di tipografia cinetica con tre nastri di piatti e il prezzo che si gira in 3D, e una tavola calda anni ’70 con vetrina dei campioni, prezzi a cifre e tessera a timbri.",
    },
    features: ["Formula + rules section", "Price table by service", "Menu filter", "Booking dialog", "Allergen register", "Loop: kinetic marquees, counters, 3D price flip, three belts of real plates, round drawer", "Shōwa: film grain, sample showcase with a card, flip-digit prices, stamp card, lucky cat", "Real dish photos from a live menu API"],
    variants: { editorial: "Senza Fine", claude: "Momiji Sushi & Grill", loop: "Mizu Infinity", showa: "Mizu" },
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
      en: "Sushi takeaway in five designs, two hand-built with real dishes: a delivery app as a website (search, sticky categories, product sheets, pickup slots, free-delivery bar) and a kraft-paper shop where you tick an order slip and the stamp lands on submit.",
      zh: "寿司外卖，五种设计，其中两种用真菜品图手作：把外卖 app 做成网站（搜索、粘顶分类、商品页、取餐时段、免运费进度条）和牛皮纸店（勾选点单单、提交时盖章）。",
      "zh-tw": "壽司外帶，五種設計，其中兩種用真菜品圖手作：把外送 app 做成網站（搜尋、黏頂分類、商品頁、取餐時段、免運費進度條）和牛皮紙店（勾選點單單、提交時蓋章）。",
      it: "Sushi da asporto in cinque design, due costruiti a mano con i piatti veri: un’app di delivery come sito (ricerca, categorie fisse, schede prodotto, fasce di ritiro, barra della consegna gratuita) e un negozio in carta kraft dove spunti il foglio d’ordine e il timbro arriva all’invio.",
    },
    features: ["Box picker with filter", "Cart drawer with totals", "Group ordering section", "Packaging explainer", "App: search, sticky categories, product sheets with options, pickup slots, free-delivery progress, tab bar", "Kraft: CSS box with lid and barcode label, rubber stamps, order slip with ticks and a live total", "Real dish photos from a live menu API"],
    variants: { editorial: "Maki 12", claude: "SakéBox Takeaway", app: "Nori Express", kraft: "Nori Express" },
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
    variants: { editorial: "Onda Poke", abisso: "Mumi Poke", mercato: "Mumi Poke" },
    accent: "#ff7a59",
    lang: "it",
  },
  {
    slug: "gelateria",
    group: "food",
    date: "2026-09-18",
    name: "Nuvola",
    industry: { en: "Gelateria", zh: "意式冰淇淋店", "zh-tw": "義式冰淇淋店", it: "Gelateria", ja: "ジェラート店", ko: "젤라또 가게" },
    city: "Monza",
    gist: {
      en: "An artisan gelateria built from four Design Library effects: a cone mascot whose eyes follow the cursor, today’s twelve flavours on a scroll-driven 3D ring, a lab card that scroll opens to full bleed, four seasonal flavours scrubbed as 3D scenes, and a cake-booking dialog. No photos — every scoop is CSS.",
      zh: "手工冰淇淋店，用了设计资源库四条效果：眼睛跟着鼠标转的甜筒吉祥物、今日十二种口味放在滚动驱动的 3D 环上、实验室卡片随滚动撑成全屏、四季口味做成 3D 场景切换，外加订蛋糕弹窗。没有照片——每一球都是 CSS 画的。",
      "zh-tw": "手工冰淇淋店，用了設計資源庫四條效果：眼睛跟著滑鼠轉的甜筒吉祥物、今日十二種口味放在捲動驅動的 3D 環上、實驗室卡片隨捲動撐成全螢幕、四季口味做成 3D 場景切換，外加訂蛋糕彈窗。沒有照片——每一球都是 CSS 畫的。",
      it: "Una gelateria artigianale costruita con quattro effetti della Libreria design: una mascotte a cono che segue il cursore con gli occhi, i dodici gusti di oggi su un anello 3D guidato dallo scroll, una card del laboratorio che si apre a tutto schermo, quattro gusti stagionali come scene 3D, e la prenotazione delle torte. Nessuna foto: ogni pallina è CSS.",
    },
    features: [
      "Cursor-gaze cone mascot (pupils clamped, brows lag, blink)",
      "Twelve flavours on a scroll-driven 3D ring with cross-fading captions",
      "Fullscreen expansion: the lab card’s clip window grows with scroll",
      "Four seasonal scenes scrubbed in 3D",
      "Price grid, cake-booking dialog with a +2-day minimum date",
    ],
    variants: { editorial: "Latte & Frutta", pop: "Scoop!" },
    accent: "#ff8fa3",
    lang: "it",
  },
  {
    slug: "enoteca",
    group: "food",
    date: "2026-09-18",
    name: "Vinaia",
    industry: { en: "Wine bar with kitchen", zh: "酒窖酒吧", "zh-tw": "酒窖酒吧", it: "Enoteca con cucina", ja: "ワインバー", ko: "와인 바" },
    city: "Bergamo Alta",
    gist: {
      en: "A wine bar built from four Design Library effects: a pinned hero that scroll takes apart (glass and bottle slide away, the ring swells, four fragments arrive), a lit cellar door on a dusk hillside that follows the pointer, a band of liquid glass refracting the wine list headline, and a loyalty card whose foil sheen follows the viewing angle. Twenty wines by the glass, a kitchen menu, Thursday tastings.",
      zh: "酒窖酒吧，用了设计资源库四条效果：钉住的首屏随滚动拆开（酒杯酒瓶各自滑走、光环胀大、四段文字进角落）；黄昏山坡上一扇发光的酒窖门跟着指针走；一条液体玻璃带划过酒单标题把它折射；会员卡的箔面光泽跟着视角走。二十款杯卖、厨房菜单、周四品鉴。",
      "zh-tw": "酒窖酒吧，用了設計資源庫四條效果：釘住的首屏隨捲動拆開（酒杯酒瓶各自滑走、光環脹大、四段文字進角落）；黃昏山坡上一扇發光的酒窖門跟著指標走；一條液體玻璃帶劃過酒單標題把它折射；會員卡的箔面光澤跟著視角走。二十款杯賣、廚房菜單、週四品鑑。",
      it: "Un’enoteca costruita con quattro effetti della Libreria design: un hero fermo che lo scroll smonta (calice e bottiglia scivolano via, l’anello si allarga, quattro frammenti arrivano), una porta di cantina illuminata su una collina al tramonto che segue il puntatore, una banda di vetro liquido che rifrange il titolo della carta, e una tessera la cui lamina segue l’angolo di visione. Venti vini al calice, cucina, degustazioni del giovedì.",
    },
    features: [
      "Pinned hero recomposition: --p / --p1 / --p2 with an overlapping window so it is never empty",
      "Luminous cellar door: five parallax layers, rising fog, 16-second dolly-in",
      "Liquid distortion band over the wine-list headline (clipped copy + screen sheen, no WebGL)",
      "Loyalty card: pointer tilt, foil phase tied to the angle, not a clock",
      "Wine list in three columns, kitchen menu, Thursday tasting dialog that defaults to the next Thursday",
    ],
    variants: { editorial: "Calice & Carta", "night-glass": "Notte in Cantina" },
    accent: "#7a1f3d",
    lang: "it",
  },
  {
    slug: "sushi",
    group: "food",
    date: "2026-09-18",
    name: "Mumi Sushi",
    industry: { en: "Sushi restaurant", zh: "寿司店", "zh-tw": "壽司店", it: "Ristorante giapponese", ja: "寿司店", ko: "스시 레스토랑" },
    city: "Vimercate",
    gist: {
      en: "Six hand-built designs for one sushi restaurant, with the restaurant’s real dish photos: three from the Design Library’s effects, three as complete visual languages (a woodblock print, a neon alley at 1 a.m., wabi-sabi). Omakase: the ten courses as a scroll-scrubbed sequence of real plates on a dark counter, then the twelve courses as stations along a lit path. Kaiten: a belt that never stops and rim colours that are the prices. Tavolo: a cloud tunnel into a menu whose hue follows the category.",
      zh: "同一家寿司店的六套手作设计，用的是店里真实的菜品照片：三套用设计库的效果，三套是完整的视觉语言（浮世绘、凌晨一点的霓虹巷子、侘寂）。Omakase：十道菜做成滚动逐帧序列摆在深色台面上，再把十二道当作发光路径上的站点；Kaiten：永不停的传送带、盘沿颜色就是价格；Tavolo：穿过云雾隧道进菜单，色相跟着分类走。",
      "zh-tw": "同一家壽司店的六套手作設計，用的是店裡真實的菜品照片：三套用設計庫的效果，三套是完整的視覺語言（浮世繪、凌晨一點的霓虹巷子、侘寂）。Omakase：十道菜做成捲動逐幀序列擺在深色檯面上，再把十二道當作發光路徑上的站點；Kaiten：永不停的傳送帶、盤緣顏色就是價格；Tavolo：穿過雲霧隧道進菜單，色相跟著分類走。",
      it: "Sei design costruiti a mano per un ristorante di sushi, con le foto vere dei piatti: tre dagli effetti della Libreria design, tre come linguaggi visivi completi (una stampa su legno, un vicolo al neon all’una, il wabi-sabi). Omakase: le dieci portate come sequenza di fotogrammi guidata dallo scroll su un banco scuro, poi le dodici portate come stazioni lungo un sentiero di luce. Kaiten: un nastro che non si ferma e i colori del bordo che sono i prezzi. Tavolo: un tunnel di nubi fino a un menù il cui colore segue la categoria.",
    },
    features: [
      "Omakase: scroll-scrubbed frame sequence (real photos), helix flythrough with three stations, counter booking dialog",
      "Kaiten: looping belt, hover-tinted price tiers, plate pile cart, magnetic CTA",
      "Tavolo: vortex transit hero, hue-follows-focus menu, staggered character titles, procedural QR",
      "Ukiyo: drifting woodblock waves, self-stamping seal, four seasons, ticket tiers, counter with real plates",
      "Yoru: rain canvas, parallax neon signs, glitch title, vending-machine menu that prints a ticket, hours strip",
      "Shizuka: self-drawing enso, one course at a time, ghost photo on the carta, quiet form",
      "Real dish photos from the restaurant’s own menu",
    ],
    variants: { editorial: "Banco & Riso", kaiten: "Mumi Sushi", tavolo: "Mumi Sushi", ukiyo: "Mumi Sushi", yoru: "Mumi Sushi", shizuka: "Mumi Sushi" },
    accent: "#d4a24c",
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
    variants: { editorial: "Piano Sette", claude: "Grande Emporio" },
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
    variants: { editorial: "Fonte", claude: "Oriente Food Service" },
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
    variants: { editorial: "Unghia Studio", claude: "Atelier Unghie" },
    accent: "#782f43",
    lang: "it",
  },
  {
    slug: "florist",
    group: "services",
    date: "2026-09-18",
    name: "Petalo",
    industry: { en: "Florist", zh: "花店", "zh-tw": "花店", it: "Fiorista", ja: "花屋", ko: "꽃집" },
    city: "Lecco",
    gist: {
      en: "A florist built from three Design Library effects: hover the wrapped bouquet and the kraft paper opens with flowers pouring out (leave, and it rewinds from wherever it got to); scroll walks the camera a full circle around the bouquet of the week; click to drop a seed and watch the hill turn green. Same-day order dialog. Every flower is CSS or canvas.",
      zh: "花店，用了设计资源库三条效果：悬停牛皮纸花束，纸打开、花涌出来（移开就从当前位置倒回去）；滚动绕本周花束转一整圈，每一面浮出自己的说明；点一下种子落地，绿色从落点长满整座小丘。当日送达的下单弹窗。花全是 CSS 和 canvas 画的。",
      "zh-tw": "花店，用了設計資源庫三條效果：懸停牛皮紙花束，紙打開、花湧出來（移開就從當前位置倒回去）；捲動繞本週花束轉一整圈，每一面浮出自己的說明；點一下種子落地，綠色從落點長滿整座小丘。當日送達的下單彈窗。花全是 CSS 和 canvas 畫的。",
      it: "Un fiorista costruito con tre effetti della Libreria design: passa sul bouquet incartato e la carta si apre con i fiori che escono (lascia, e riavvolge da dov’era); lo scroll gira intorno al bouquet della settimana; clicca e un seme cade e la collina diventa verde. Ordine con consegna in giornata. Ogni fiore è CSS o canvas.",
    },
    features: [
      "Hover-bloom wrap: one clock that runs both ways, per-bloom slices with overshoot",
      "Scroll-orbit turntable around the bouquet, notes windowed by angle",
      "Click-drop seed with gravity, squash and a spreading green front (canvas)",
      "Services grid, same-day order dialog, handwritten-card field",
    ],
    variants: { editorial: "Foglio & Gambo" },
    accent: "#e26d8f",
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
    variants: { editorial: "Officina Mobile", claude: "FixPoint Riparazioni" },
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
  navLabel: { en: "Web design", zh: "网页设计", "zh-tw": "網頁設計", ja: "Web デザイン", ko: "웹 디자인", it: "Web design", fr: "Web design", de: "Webdesign", es: "Diseño web", pt: "Sites", ru: "Сайты", ar: "تصميم الويب" },
  title: { en: "Web design", zh: "网页设计", "zh-tw": "網頁設計", ja: "Web デザイン", ko: "웹 디자인", it: "Web design" },
  intro: {
    en: "Websites designed for local businesses — restaurants, shops, studios — and built as working pages, not mockups: menus you can filter, bookings you can open, carts that add up. Each business is designed more than once, every design from scratch, with the effects from the Design Library doing the work. Most are in Italian, one in Chinese. Scroll them, click them, or open them full screen.",
    zh: "为本地商家——餐厅、店铺、工作室——设计的网站，做成能用的页面而不是效果图：菜单能筛选、预约能弹出、购物车能加总。同一家店会设计不止一版，每一版都从头来，动效用的是「设计库」里的零件。大多是意大利语，有一套中文。可以滚、可以点、也可以整页打开。",
    "zh-tw": "為本地商家——餐廳、店鋪、工作室——設計的網站，做成能用的頁面而不是效果圖：菜單能篩選、預約能彈出、購物車能加總。同一家店會設計不止一版，每一版都從頭來，動效用的是「設計庫」裡的零件。大多是義大利語，有一套中文。可以捲、可以點、也可以整頁打開。",
    it: "Siti progettati per attività locali — ristoranti, negozi, studi — e costruiti come pagine funzionanti, non mockup: menù con filtri, prenotazioni che si aprono, carrelli che fanno il totale. Ogni attività è progettata più di una volta, ogni versione da zero, con gli effetti della Libreria design a fare il lavoro. Quasi tutti in italiano, uno in cinese. Scorri, clicca, oppure apri a schermo intero.",
  },
  count: { en: "sites", zh: "个站", "zh-tw": "個站", it: "siti", ja: "サイト", ko: "사이트" },
  countOne: { en: "site", zh: "个站", "zh-tw": "個站", it: "sito", ja: "サイト", ko: "사이트" },
  designs: { en: "designs", zh: "种设计", "zh-tw": "種設計", it: "design", ja: "デザイン", ko: "디자인" },
  openFull: { en: "Open full screen", zh: "整页打开", "zh-tw": "整頁打開", it: "Apri a schermo intero", ja: "全画面で開く", ko: "전체 화면으로 열기" },
  design: { en: "design", zh: "种设计", "zh-tw": "種設計", it: "design", ja: "デザイン", ko: "디자인" },
  featuresTitle: { en: "What is in it", zh: "里面有什么", "zh-tw": "裡面有什麼", it: "Cosa contiene", ja: "内容", ko: "구성" },
  allGroups: { en: "All sites", zh: "全部网站", "zh-tw": "全部網站", it: "Tutti i siti", ja: "すべてのサイト", ko: "모든 사이트" },
  demoNote: {
    en: "Names, addresses, prices and contacts are fictional demo content.",
    zh: "店名、地址、价格与联系方式均为虚构的演示内容。",
    "zh-tw": "店名、地址、價格與聯絡方式均為虛構的演示內容。",
    it: "Nomi, indirizzi, prezzi e contatti sono contenuti dimostrativi e fittizi.",
  },
  cta: {
    en: "Want a site like this for your business? Write to",
    zh: "想给自己的店做一个这样的网站？写信到",
    "zh-tw": "想給自己的店做一個這樣的網站？寫信到",
    it: "Vuoi un sito così per la tua attività? Scrivi a",
  },
} satisfies Record<string, Localized>;
