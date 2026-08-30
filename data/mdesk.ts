import type { Localized } from "@/lib/i18n";

/**
 * M Desk —— Mumi Sushi 背后的餐厅后台，工作室最难的项目，首页旗舰位。
 *
 * 文案只写 en / zh / it：意大利餐厅老板是这页的第二读者，其余语言按 pick() 回落到英文。
 * 截图按模块挂在 shot 上：没有截图时页面画占位框，不留空白。
 * 截图命名：/shots/mdesk-<module>-<en|it>.jpg（脱敏后的真实后台）。
 */

export interface DeskModule {
  id: string;
  name: Localized;
  lead: Localized;
  bullets: Localized[];
  /** 截图；缺省 = 占位框 */
  shot?: { src: Localized; alt: Localized };
}

export interface DeskPrinciple {
  title: Localized;
  body: Localized;
}

export const mdesk = {
  id: "m-desk",
  name: "M Desk",
  icon: "/icons/mdesk.svg",
  gradientCss: "linear-gradient(100deg, #ff7a1a, #e0483a)",
  // 🩸同一条橙渐变当「文字填充」用在浅底上只有 2.49:1（大字号也要 3:1）。
  //    标题专用这条压深版，按钮/序号块继续用上面那条（它们是白字压在渐变上，不受影响）。
  gradientTextCss: "linear-gradient(100deg, #d9481a, #b8331f)",
  accent: "#e8551f",
  since: "2026-06",
  tagline: {
    en: "The back office a restaurant actually runs its day on.",
    zh: "一家餐厅每天真正在用的后台。",
    it: "Il gestionale su cui un ristorante lavora davvero, ogni giorno.",
  } as Localized,
  facts: [
    { en: "Running at Mumi Sushi Vimercate since June 2026", zh: "2026 年 6 月起在 Mumi Sushi Vimercate 生产运行", it: "In produzione da Mumi Sushi Vimercate da giugno 2026" },
    { en: "12 modules · 13 languages", zh: "12 个模块 · 13 种语言", it: "12 moduli · 13 lingue" },
    { en: "Designed and built by one person", zh: "一个人设计与开发", it: "Progettato e costruito da una sola persona" },
  ] as Localized[],
  intro: [
    {
      en: "M Desk is the back office behind Mumi Sushi — the screen the restaurant runs its day on. It replaced a cloud till, an aggregator dashboard and two delivery-platform tablets with one system that takes every order, prints every ticket and pays every rider.",
      zh: "M Desk 是 Mumi Sushi 背后的后台 —— 餐厅每天靠它开门做生意。它取代了一套云收银、一个聚合中台和两块外卖平台平板，用一套系统接下每一张单、打出每一张票、算清每一个骑手的工钱。",
      it: "M Desk è il gestionale dietro Mumi Sushi: lo schermo su cui il ristorante manda avanti la giornata. Ha sostituito una cassa in cloud, un aggregatore e due tablet delle piattaforme con un unico sistema che riceve ogni ordine, stampa ogni comanda e paga ogni rider.",
    },
    {
      en: "It is the hardest thing built at this workshop. A real restaurant depends on it every service, so every feature below was shaped by something that actually went wrong on a Friday night — and had to be fixed before Saturday.",
      zh: "这是这间工作室做过最难的东西。一家真实的餐厅每一餐都靠它，所以下面每一个功能，都来自某个周五晚上真的出过的问题 —— 而且必须在周六之前修好。",
      it: "È la cosa più difficile uscita da questo laboratorio. Un ristorante vero ci lavora a ogni servizio, quindi ogni funzione qui sotto nasce da qualcosa che è andato storto davvero un venerdì sera — e andava sistemato prima del sabato.",
    },
  ] as Localized[],
  modulesLabel: { en: "What's inside", zh: "里面有什么", it: "Cosa c'è dentro" } as Localized,
  modules: [
    {
      id: "orders",
      name: { en: "Order board", zh: "订单看板", it: "Bacheca ordini" },
      lead: {
        en: "Every channel on one screen: website, apps, kiosk, Deliveroo, Just Eat, phone orders. A new order rings within 1.5 seconds and the tab title blinks until someone takes it.",
        zh: "所有渠道同一块屏：网站、App、自助机、Deliveroo、Just Eat、电话单。新单 1.5 秒内响铃，浏览器标签一直闪到有人接单。",
        it: "Tutti i canali su un solo schermo: sito, app, chiosco, Deliveroo, Just Eat, ordini al telefono. Un ordine nuovo suona entro 1,5 secondi e la scheda lampeggia finché qualcuno non lo prende.",
      },
      bullets: [
        { en: "Platform badges with the platform's own pickup code", zh: "平台徽章带平台自己的取餐码", it: "Badge della piattaforma con il suo codice di ritiro" },
        { en: "Assign a rider, confirm, cancel or refund from the card", zh: "在卡片上直接派骑手、确认、取消、退款", it: "Assegna il rider, conferma, annulla o rimborsa dalla scheda" },
        { en: "Pause intake, set prep time, cap active orders — customers see it at once", zh: "暂停接单、设出餐时间、限活跃单数 —— 顾客端即时可见", it: "Pausa ordini, tempo di preparazione, tetto agli ordini attivi: il cliente lo vede subito" },
        { en: "Card orders appear only once payment is confirmed", zh: "卡付单要付款确认后才出现", it: "Gli ordini con carta compaiono solo a pagamento confermato" },
      ],
      shot: {
        src: { en: "/shots/mdesk-orders-en.jpg", it: "/shots/mdesk-orders-it.jpg", zh: "/shots/mdesk-orders-en.jpg" },
        alt: { en: "Order board with orders from the website, the kiosk and Just Eat side by side", zh: "订单看板：网站、自助机、Just Eat 的单同屏", it: "Bacheca ordini: sito, chiosco e Just Eat sullo stesso schermo" },
      },
    },
    {
      id: "kitchen",
      name: { en: "Kitchen screen", zh: "厨房屏", it: "Schermo cucina" },
      lead: {
        en: "Big cards, a timer that changes colour as an order waits, one tap from start to ready. Filter by station so the sushi counter and the hot kitchen each see their own.",
        zh: "大卡片，等待越久颜色越深，从开始做到做好只要一下。按工位筛，寿司台和热厨各看各的。",
        it: "Schede grandi, un timer che cambia colore mentre l'ordine aspetta, un tocco da «inizio» a «pronto». Filtro per postazione: banco sushi e cucina calda vedono ciascuno il proprio.",
      },
      bullets: [
        { en: "Sold-out panel: mark a dish out and every channel — Deliveroo and Just Eat included — stops selling it", zh: "沽清面板：标一下，所有渠道 —— 包括 Deliveroo 和 Just Eat —— 立刻停售", it: "Pannello esauriti: segni un piatto e tutti i canali, Deliveroo e Just Eat compresi, smettono di venderlo" },
        { en: "Whole-order notes and cutlery in red", zh: "整单备注与餐具用红字", it: "Note dell'ordine e posate in rosso" },
        { en: "Scheduled orders surface 45 minutes before they are due", zh: "预约单提前 45 分钟才浮出来", it: "Gli ordini programmati compaiono 45 minuti prima" },
        { en: "Clock-in code on the top bar", zh: "顶栏就有打卡码", it: "Codice timbratura nella barra in alto" },
      ],
      shot: {
        src: { en: "/shots/mdesk-kitchen-en.jpg", it: "/shots/mdesk-kitchen-it.jpg", zh: "/shots/mdesk-kitchen-en.jpg" },
        alt: { en: "Kitchen screen with one card per order and a waiting timer", zh: "厨房屏：一单一张大卡片，带等待计时", it: "Schermo cucina con una scheda per ordine e il timer di attesa" },
      },
    },
    {
      id: "cassa",
      name: { en: "Till", zh: "收银台", it: "Cassa" },
      lead: {
        en: "A touch till for the counter: tap to add, pick sizes and extras, cash / card / pay later. Open tabs, split bills, add to a paid order, switch staff with a PIN.",
        zh: "柜台用的触屏收银：点一下加一个、选规格加料、现金/刷卡/待付。可开待付单、分开付、往已付单上追加、输 PIN 换人。",
        it: "Una cassa touch per il banco: tocca per aggiungere, scegli formati ed extra, contanti / carta / paga dopo. Conti aperti, conto diviso, aggiunta a un ordine già pagato, cambio operatore con PIN.",
      },
      bullets: [
        { en: "Membership card scanned at the counter", zh: "柜台扫会员码", it: "Tessera fedeltà scansionata al banco" },
        { en: "Cancel with a reason; refund only what was actually collected", zh: "取消要写原因；退款只退真正收到的", it: "Annulla con motivo; rimborsa solo quanto realmente incassato" },
        { en: "One collection dialog for everything — the cash portion is recorded for the day's drawer", zh: "所有收款走同一个弹窗 —— 现金部分单独记，日结抽屉才对得上", it: "Un solo dialogo di incasso: la parte in contanti va nel cassetto del giorno" },
        { en: "End-of-day closing report", zh: "日结报表", it: "Chiusura di giornata" },
      ],
      shot: {
        src: { en: "/shots/mdesk-cassa-en.jpg", it: "/shots/mdesk-cassa-it.jpg", zh: "/shots/mdesk-cassa-en.jpg" },
        alt: { en: "Touch till with the dish grid and the open bill", zh: "收银台：菜品宫格与右侧账单", it: "Cassa touch con la griglia dei piatti e il conto aperto" },
      },
    },
    {
      id: "menu",
      name: { en: "Menu & options library", zh: "菜单与选项库", it: "Menu e libreria opzioni" },
      lead: {
        en: "Categories, dishes, photos, allergens, a name in 13 languages. Sizes and extras live in reusable groups — change a group once and every dish that uses it follows.",
        zh: "分类、菜品、图片、过敏原、13 种语言的菜名。规格和加料是可复用的组 —— 改一次组，用到它的每道菜都跟着变。",
        it: "Categorie, piatti, foto, allergeni, nome in 13 lingue. Formati ed extra vivono in gruppi riutilizzabili: modifichi il gruppo una volta e ogni piatto che lo usa si aggiorna.",
      },
      bullets: [
        { en: "CSV export and import for bulk edits in Numbers or Excel", zh: "CSV 导出导入，批量改在 Numbers/Excel 里做", it: "Esporta e importa CSV per le modifiche in blocco su Numbers o Excel" },
        { en: "Selling windows per dish", zh: "每道菜可设可售时段", it: "Fasce orarie di vendita per piatto" },
        { en: "Preparation station per category or dish", zh: "按分类或菜品指定备餐工位", it: "Postazione di preparazione per categoria o piatto" },
        { en: "Platform price overrides", zh: "平台单独定价", it: "Prezzi diversi per le piattaforme" },
      ],
      shot: {
        src: { en: "/shots/mdesk-menu-en.jpg", it: "/shots/mdesk-menu-it.jpg", zh: "/shots/mdesk-menu-en.jpg" },
        alt: { en: "Menu editor with categories, dishes and CSV import", zh: "菜单编辑：分类、菜品与 CSV 导入", it: "Editor del menu con categorie, piatti e import CSV" },
      },
    },
    {
      id: "platforms",
      name: { en: "Deliveroo & Just Eat", zh: "Deliveroo 与 Just Eat", it: "Deliveroo e Just Eat" },
      lead: {
        en: "One HubRise connection instead of two tablets: menus pushed from here, sold-outs synced, order status reported back. Platform orders land on the same board as everyone else's.",
        zh: "用一条 HubRise 连接取代两块平板：菜单从这里推、沽清同步、状态回传。平台单和自家单落在同一块看板上。",
        it: "Una connessione HubRise al posto di due tablet: menu inviati da qui, esauriti sincronizzati, stato riportato. Gli ordini delle piattaforme arrivano sulla stessa bacheca di tutti gli altri.",
      },
      bullets: [
        { en: "A catalogue per brand (sushi and poke), each with its own mark-up", zh: "每个品牌一份目录（寿司与 poke），各自加价", it: "Un catalogo per marchio (sushi e poke), ciascuno con il proprio ricarico" },
        { en: "Extras re-ordered to the kitchen's sequence, not the platform's alphabetical one", zh: "加料按厨房顺序重排，不按平台的字母序", it: "Extra riordinati nella sequenza della cucina, non in quella alfabetica della piattaforma" },
        { en: "Photos resized to each platform's rules automatically", zh: "图片按各平台规格自动裁切", it: "Foto ridimensionate automaticamente secondo le regole di ogni piattaforma" },
        { en: "Ticket header shows the platform pickup code where riders need it", zh: "票头印平台取餐码，骑手到店对码", it: "In testa alla comanda il codice di ritiro della piattaforma, dove serve al rider" },
      ],
      shot: {
        src: { en: "/shots/mdesk-platforms-en.jpg", it: "/shots/mdesk-platforms-it.jpg", zh: "/shots/mdesk-platforms-en.jpg" },
        alt: { en: "Deliveroo and Just Eat catalogues pushed from one page", zh: "一页推送 Deliveroo 与 Just Eat 的目录", it: "Cataloghi Deliveroo e Just Eat inviati da un’unica pagina" },
      },
    },
    {
      id: "printing",
      name: { en: "Printing", zh: "打印", it: "Stampa" },
      lead: {
        en: "Thermal printers on USB or LAN, each subscribed to the ticket types it should print. Kitchen tickets split by station, a receipt for the customer, a delivery slip with a QR for the rider.",
        zh: "USB 或网口热敏打印机，每台订阅自己该打的票种。厨房票按工位拆，顾客有收银票，骑手有带二维码的配送票。",
        it: "Stampanti termiche USB o di rete, ciascuna abbonata ai tipi di comanda che deve stampare. Comande cucina divise per postazione, scontrino per il cliente, bolla di consegna con QR per il rider.",
      },
      bullets: [
        { en: "Content editor: 16 blocks × 6 ticket types — the preview is what prints", zh: "内容表：16 块 × 6 票种，预览即实打", it: "Editor dei contenuti: 16 blocchi × 6 tipi di comanda, l'anteprima è ciò che esce" },
        { en: "Style editor: size and weight per element, tested on paper", zh: "样式编辑器：每类元素的字号与粗细，纸上验过", it: "Editor dello stile: dimensione e spessore per elemento, provato su carta" },
        { en: "Printer offline? Jobs move to the backup with a banner on the ticket", zh: "打印机离线？任务转到备用机，票头带标记", it: "Stampante offline? Le stampe passano alla riserva, con un avviso in testa" },
        { en: "Unprinted-for-3-minutes alert with one-tap reassignment; beeper and cash drawer", zh: "3 分钟没打出来就报警、一键改派；蜂鸣与钱箱", it: "Avviso dopo 3 minuti senza stampa con riassegnazione a un tocco; cicalino e cassetto" },
      ],
      shot: {
        src: { en: "/shots/mdesk-printing-en.jpg", it: "/shots/mdesk-printing-it.jpg", zh: "/shots/mdesk-printing-en.jpg" },
        alt: { en: "Each printer subscribed to the ticket types it should print", zh: "每台打印机勾选自己该打的票种", it: "Ogni stampante abbonata ai tipi di comanda che deve stampare" },
      },
    },
    {
      id: "delivery",
      name: { en: "Delivery & riders", zh: "配送与骑手", it: "Consegne e rider" },
      lead: {
        en: "Delivery zones by postcode, each with its own fee and minimum. Riders get a native app — accept, on the way, delivered — and customers watch it on a live map.",
        zh: "按邮编划配送区，各自配送费与起送额。骑手有原生 App —— 接单、出发、送达 —— 顾客在实时地图上看。",
        it: "Zone di consegna per CAP, ciascuna con costo e minimo propri. I rider hanno un'app nativa (accetta, in viaggio, consegnato) e il cliente segue tutto su una mappa in tempo reale.",
      },
      bullets: [
        { en: "Rider clock-in via a rotating code on the board", zh: "骑手扫看板上的轮换码打卡", it: "Timbratura rider con il codice rotante sulla bacheca" },
        { en: "Per-rider hourly rate and per-zone delivery fee on one timesheet", zh: "每人时薪 + 每区送单费，同一张工时表", it: "Paga oraria per rider e compenso per zona, su un solo foglio ore" },
        { en: "Customer tracking page with the rider's position", zh: "顾客追踪页看得到骑手位置", it: "Pagina di tracking per il cliente con la posizione del rider" },
        { en: "Push notifications for new assignments", zh: "派单推送通知", it: "Notifiche push per le nuove assegnazioni" },
      ],
      shot: {
        src: { en: "/shots/mdesk-delivery-en.jpg", it: "/shots/mdesk-delivery-it.jpg", zh: "/shots/mdesk-delivery-en.jpg" },
        alt: { en: "Delivery zones by postcode with fee, minimum and rider pay", zh: "按邮编划的配送区：配送费、起送额、骑手费", it: "Zone di consegna per CAP con costo, minimo e compenso rider" },
      },
    },
    {
      id: "marketing",
      name: { en: "Coupons, loyalty, marketing", zh: "优惠券、会员与营销", it: "Coupon, fedeltà, marketing" },
      lead: {
        en: "Public codes, personal codes, template coupons, automatic ones for birthdays and win-backs. Tiers, points and store credit that customers spend at checkout.",
        zh: "公开码、专属码、模板券、生日与召回自动券。会员等级、积分、抵用额度，顾客结账直接用。",
        it: "Codici pubblici, codici personali, coupon da modello, automatici per compleanni e ritorni. Livelli, punti e credito che il cliente spende in cassa.",
      },
      bullets: [
        { en: "Customer-facing text must be Italian before it can be saved", zh: "顾客能看到的文案必须是意大利语才能保存", it: "I testi rivolti al cliente devono essere in italiano per poter essere salvati" },
        { en: "Campaign drafts for email or WhatsApp — never sent without a click", zh: "邮件/WhatsApp 营销草稿 —— 不点不发", it: "Bozze di campagne per email o WhatsApp: niente parte senza un clic" },
        { en: "Review invitation after delivery", zh: "送达后邀评", it: "Invito a recensire dopo la consegna" },
        { en: "Membership card with QR, in the apps and on the website", zh: "会员码，App 和网站都有", it: "Tessera con QR, nelle app e sul sito" },
      ],
      shot: {
        src: { en: "/shots/mdesk-marketing-en.jpg", it: "/shots/mdesk-marketing-it.jpg", zh: "/shots/mdesk-marketing-en.jpg" },
        alt: { en: "Template and personal coupons with issue and redemption counts", zh: "模板券与专属券，含发放与核销数", it: "Coupon modello e personali con emessi e riscattati" },
      },
    },
    {
      id: "reservations",
      name: { en: "Reservations", zh: "餐位预订", it: "Prenotazioni" },
      lead: {
        en: "Table bookings by slot and capacity, with the kitchen ticket printed just before the party is due.",
        zh: "按时段和容量接受订位，临近到店才打厨房票。",
        it: "Prenotazioni per fascia oraria e capienza, con la comanda stampata poco prima dell'arrivo.",
      },
      bullets: [
        { en: "Phone bookings entered by the front desk", zh: "电话订位前台录入", it: "Prenotazioni telefoniche inserite dal banco" },
        { en: "Live availability shown to customers online", zh: "线上实时显示可订状态", it: "Disponibilità mostrata in tempo reale ai clienti" },
      ],
    },
    {
      id: "procurement",
      name: { en: "Purchasing", zh: "订货", it: "Acquisti" },
      lead: {
        en: "A shared weekly draft the whole team adds to; the manager sends one order per supplier as a bilingual PDF.",
        zh: "全店共写一份每周草稿，管理员按供应商发出双语 PDF 订单。",
        it: "Una bozza settimanale condivisa a cui tutto il team aggiunge; il responsabile invia un ordine per fornitore come PDF bilingue.",
      },
      bullets: [
        { en: "Supplier catalogue with Chinese names for the wholesaler", zh: "供应商货品表带中文名，批发商看得懂", it: "Catalogo fornitori con nomi in cinese per il grossista" },
        { en: "Stock room view", zh: "库房视图", it: "Vista magazzino" },
      ],
      shot: {
        src: { en: "/shots/mdesk-procurement-en.jpg", it: "/shots/mdesk-procurement-it.jpg", zh: "/shots/mdesk-procurement-en.jpg" },
        alt: { en: "Shared purchasing draft with bilingual supplier items", zh: "共享订货草稿，货品中意双语", it: "Bozza di acquisto condivisa con articoli bilingui" },
      },
    },
    {
      id: "staff",
      name: { en: "Staff, time clock, audit", zh: "员工、打卡与操作日志", it: "Personale, timbrature, registro" },
      lead: {
        en: "Accounts by username, a module allow-list per role, PIN switching at the till. Everyone clocks in with the same rotating code — riders from their app, staff from their phone.",
        zh: "账号名登录、每个岗位一份模块白名单、收银台 PIN 换人。所有人用同一个轮换码打卡 —— 骑手在 App 里、店员在自己手机上。",
        it: "Account per nome utente, moduli visibili per ruolo, cambio con PIN in cassa. Tutti timbrano con lo stesso codice rotante: i rider dall'app, il personale dal proprio telefono.",
      },
      bullets: [
        { en: "Original punches are never overwritten; corrections are a second column with a note", zh: "打卡原值永不覆盖；调整另存一列并留备注", it: "Le timbrature originali non si sovrascrivono mai; le correzioni stanno in una seconda colonna con motivo" },
        { en: "Forgotten clock-outs are closed at closing time and flagged for review", zh: "忘打下班卡的封在打烊时刻，标出来等确认", it: "Le uscite dimenticate si chiudono all'orario di chiusura e restano da confermare" },
        { en: "Timesheet by station, CSV for the accountant", zh: "工时按工位分组，CSV 给会计", it: "Foglio ore per postazione, CSV per il commercialista" },
        { en: "Audit log of every back-office change, kept 180 days", zh: "后台每一处改动自动记录，保留 180 天", it: "Registro di ogni modifica in gestionale, conservato 180 giorni" },
      ],
      shot: {
        src: { en: "/shots/mdesk-staff-en.jpg", it: "/shots/mdesk-staff-it.jpg", zh: "/shots/mdesk-staff-en.jpg" },
        alt: { en: "Employee accounts with roles, permissions and last login", zh: "员工账号：角色、权限、上次登录", it: "Account dipendenti con ruoli, permessi e ultimo accesso" },
      },
    },
    {
      id: "ai",
      name: { en: "AI assistant", zh: "AI 助手", it: "Assistente AI" },
      lead: {
        en: "Ask for today's revenue, the rules of a coupon, or a campaign draft. It can propose changes — a new coupon, a store setting — but nothing is written until you tap confirm.",
        zh: "问它今天营收、某张券的规则、要一份营销草稿。它能提议改动 —— 建一张券、改一个设置 —— 但你不点确认，什么都不会写。",
        it: "Chiedi l'incasso di oggi, le regole di un coupon o una bozza di campagna. Può proporre modifiche (un coupon nuovo, un'impostazione), ma nulla viene scritto finché non confermi.",
      },
      bullets: [
        { en: "Customer data is masked before it reaches the model", zh: "顾客数据先脱敏再给模型", it: "I dati dei clienti vengono mascherati prima di arrivare al modello" },
        { en: "Money-related changes require a typed confirmation", zh: "涉钱的改动要打字确认", it: "Le modifiche che toccano i soldi richiedono una conferma scritta" },
        { en: "The rulebook it reads is generated from the code, so it cannot drift", zh: "它读的规则手册由代码生成，不会漂", it: "Il manuale delle regole che legge è generato dal codice: non può divergere" },
      ],
      shot: {
        src: { en: "/shots/mdesk-ai-en.jpg", it: "/shots/mdesk-ai-it.jpg", zh: "/shots/mdesk-ai-en.jpg" },
        alt: { en: "The management assistant proposing changes that need confirming", zh: "AI 助手提议改动，需确认才执行", it: "L’assistente che propone modifiche da confermare" },
      },
    },
  ] as DeskModule[],
  principlesLabel: {
    en: "Decisions you only make after running it",
    zh: "只有真的跑过才会做的决定",
    it: "Decisioni che prendi solo dopo averci lavorato",
  } as Localized,
  principles: [
    {
      title: { en: "A hesitating customer is not a ticket", zh: "犹豫中的顾客不是一张票", it: "Un cliente indeciso non è una comanda" },
      body: {
        en: "The board hides card orders until the payment is confirmed. Someone still deciding on the payment page should not be a card in the kitchen — and if they walk away, the order quietly expires.",
        zh: "看板会把卡付单藏到付款确认为止。还在支付页犹豫的人，不该已经是厨房里的一张卡；他要是走了，那张单就静静过期。",
        it: "La bacheca nasconde gli ordini con carta finché il pagamento non è confermato. Chi sta ancora decidendo sulla pagina di pagamento non deve essere una scheda in cucina; se se ne va, l'ordine scade in silenzio.",
      },
    },
    {
      title: { en: "Never edit a punch in place", zh: "打卡记录绝不原地改", it: "Mai modificare una timbratura sul posto" },
      body: {
        en: "Clock-in and clock-out are stored as pressed. A manager's correction lives in a second column with a note. Pay disputes are about trust, not minutes — the original must always be visible.",
        zh: "上下班时间按按下那一刻存。老板的调整写在另一列并附原因。工资争议争的是信任不是分钟 —— 原值必须一直看得见。",
        it: "Entrata e uscita restano come premute. La correzione del responsabile vive in una seconda colonna con una nota. Le discussioni sulla paga riguardano la fiducia, non i minuti: l'originale deve restare sempre visibile.",
      },
    },
    {
      title: { en: "Say what a button cannot do", zh: "按钮做不到的事要说出来", it: "Dire ciò che un pulsante non può fare" },
      body: {
        en: "Cancelling a Just Eat order from here changes nothing on Just Eat. Rather than pretend, the screen says so and points staff to where it actually works.",
        zh: "从这里取消一张 Just Eat 的单，Just Eat 那边什么都不会变。与其装作可以，界面直接说明，并告诉店员真正该去哪里操作。",
        it: "Annullare un ordine Just Eat da qui non cambia nulla su Just Eat. Invece di fingere, lo schermo lo dice e indica al personale dove farlo davvero.",
      },
    },
  ] as DeskPrinciple[],
  stackLabel: { en: "Built with", zh: "技术栈", it: "Costruito con" } as Localized,
  stack: ["Next.js", "NestJS", "Prisma", "PostgreSQL (Neon)", "Stripe", "HubRise", "ESC/POS", "Web Audio", "Claude"],
  caseLabel: { en: "Part of the Mumi Sushi system", zh: "Mumi Sushi 系统的一部分", it: "Parte del sistema Mumi Sushi" } as Localized,
  caseCta: { en: "See the whole case study", zh: "看完整案例", it: "Vedi il caso completo" } as Localized,
  contactTitle: { en: "Running a restaurant?", zh: "你也开餐厅？", it: "Hai un ristorante?" } as Localized,
  contactBody: {
    en: "M Desk currently runs at one restaurant. If yours needs something like it — a back office shaped around how you actually work — write and tell me about your place.",
    zh: "M Desk 目前只在一家餐厅运行。如果你的店也需要一套 —— 一个按你们真实工作方式长出来的后台 —— 写封信，聊聊你的店。",
    it: "Oggi M Desk gira in un solo ristorante. Se il tuo ha bisogno di qualcosa del genere — un gestionale modellato su come lavorate davvero — scrivimi e raccontami del tuo locale.",
  } as Localized,
  contactCta: { en: "Write to me", zh: "写信给我", it: "Scrivimi" } as Localized,
  contactEmail: "ayylchyql@gmail.com",
  shotSoon: { en: "Screenshot coming", zh: "截图即将补上", it: "Schermata in arrivo" } as Localized,
  /** 首页旗舰段 */
  home: {
    eyebrow: { en: "Flagship · M Desk", zh: "旗舰项目 · M Desk", it: "Progetto principale · M Desk" } as Localized,
    title: { en: "The restaurant's control room.", zh: "一家餐厅的驾驶舱。", it: "La sala di controllo del ristorante." } as Localized,
    body: {
      en: "Orders from every channel, the kitchen, the till, the printers, the riders, the coupons and the staff — one back office, built for a real restaurant near Milan and used there every single service.",
      zh: "所有渠道的订单、厨房、收银、打印机、骑手、优惠券和员工 —— 一套后台，为米兰近郊一家真实的餐厅而做，每一餐都在用。",
      it: "Ordini da ogni canale, cucina, cassa, stampanti, rider, coupon e personale: un solo gestionale, costruito per un ristorante vero vicino a Milano e usato lì a ogni servizio.",
    } as Localized,
    cta: { en: "Explore M Desk", zh: "了解 M Desk", it: "Scopri M Desk" } as Localized,
    tiles: [
      { id: "orders", title: { en: "Order board", zh: "订单看板", it: "Bacheca ordini" }, desc: { en: "Every channel, one screen, 1.5 s to the bell", zh: "全渠道同屏，1.5 秒响铃", it: "Tutti i canali, uno schermo, 1,5 s alla campanella" } },
      { id: "kitchen", title: { en: "Kitchen", zh: "厨房屏", it: "Cucina" }, desc: { en: "Stations, timers, sold-outs synced everywhere", zh: "工位、计时、沽清全渠道同步", it: "Postazioni, timer, esauriti sincronizzati ovunque" } },
      { id: "platforms", title: { en: "Platforms", zh: "平台对接", it: "Piattaforme" }, desc: { en: "Deliveroo and Just Eat without their tablets", zh: "不用平板接 Deliveroo 与 Just Eat", it: "Deliveroo e Just Eat senza i loro tablet" } },
      { id: "printing", title: { en: "Printing", zh: "打印", it: "Stampa" }, desc: { en: "Any printer, any ticket, never silently lost", zh: "任何打印机任何票，绝不静默丢票", it: "Ogni stampante, ogni comanda, mai persa in silenzio" } },
    ] as { id: string; title: Localized; desc: Localized }[],
  },
};
