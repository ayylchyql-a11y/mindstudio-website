import type { Localized } from "@/lib/i18n";

/**
 * M Desk —— 餐厅管理软件（Mumi Sushi 三家店 + Ming·E 在用），按月订阅的产品页，首页旗舰位。
 * 10-30 用户定：面向老板写，不讲「一个人做的 / 工作室最难」；原则段改成「为什么换成 M Desk」；去掉技术栈。
 *
 * 文案只写 en / zh / it：意大利餐厅老板是这页的第二读者，其余语言按 pick() 回落到英文。
 * 截图按模块挂在 shot 上：没有截图时模块压成一栏文字，不画空窗框。
 * 截图命名：/shots/mdesk-<module>-<en|it>.jpg（中文读者看英文图）。
 * 10-30 全套换成 Vetro 皮肤的演示数据截图（假后端，客人名字编造），后台 1440×900、手机 390×844。
 * 🔴 平台只写店里真在跑的 Deliveroo 和 Just Eat（代码支持 Glovo / Uber Eats，但没有店在用，用户定不写）。
 */

export interface DeskShot { src: Localized; alt: Localized }

export interface DeskModule {
  id: string;
  name: Localized;
  lead: Localized;
  bullets: Localized[];
  /** 后台截图（浏览器窗框）；缺省 = 没有后台图 */
  shot?: DeskShot;
  /** 手机截图（手机框）：有 shot 时叠在窗框右下角，没有 shot 时单独居中 */
  phones?: DeskShot[];
}

export interface DeskPrinciple {
  title: Localized;
  body: Localized;
}

/** 后台截图：en / it 各一张，中文读者看英文图 */
const shot = (id: string, alt: Localized): DeskShot => ({
  src: { en: `/shots/mdesk-${id}-en.jpg`, it: `/shots/mdesk-${id}-it.jpg`, zh: `/shots/mdesk-${id}-en.jpg` },
  alt,
});
/** 只有一种语言的截图（骑手网页版只有意大利语） */
const one = (file: string, alt: Localized): DeskShot => ({ src: { en: file, it: file, zh: file }, alt });

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
  /** 对外写的起步月费：用户 10-30 定写 49（= /servizi 最低一档）。🩸那一档本身不含后台，后台从 129 那档起 */
  fromMonthly: 49,
  tagline: {
    en: "The back office a restaurant actually runs its day on.",
    zh: "一家餐厅每天真正在用的后台。",
    it: "Il gestionale su cui un ristorante lavora davvero, ogni giorno.",
  } as Localized,
  facts: [
    { en: "Used every day at 4 restaurants", zh: "4 家餐厅每天在用", it: "Usato ogni giorno in 4 ristoranti" },
    { en: "16 modules", zh: "16 个模块", it: "16 moduli" },
    { en: "From €49 a month", zh: "€49/月起", it: "Da 49 € al mese" },
  ] as Localized[],
  intro: [
    {
      en: "M Desk is management software for restaurants, sushi bars, pizzerias and delivery kitchens. One back office brings together orders from every channel, the till with fiscal receipts and e-invoices, the dining room, the kitchen screen and printers, the riders and the delivery platforms. It runs in the browser on a computer, an iPad or a phone, and it is used every service at Mumi Sushi's three restaurants and at Ming·E Poke & Sushi.",
      zh: "M Desk 是给餐厅、寿司店、披萨店和外卖店用的管理软件。一套后台管齐所有渠道的订单、收银与税务小票和电子发票、堂食、厨房屏和打印机、骑手，以及外卖平台。电脑、iPad、手机的浏览器都能用；Mumi Sushi 的三家店和 Ming·E Poke & Sushi 每一餐都在用它。",
      it: "M Desk è il gestionale per ristoranti, sushi bar, pizzerie e cucine da asporto. Un unico pannello riunisce gli ordini da ogni canale, la cassa con scontrino RT e fattura elettronica, la sala, lo schermo cucina e le stampanti, i rider e le piattaforme di consegna. Funziona dal browser su computer, iPad e telefono, ed è usato a ogni servizio nei tre ristoranti Mumi Sushi e da Ming·E Poke & Sushi.",
    },
  ] as Localized[],
  modulesLabel: { en: "What's inside", zh: "里面有什么", it: "Cosa c'è dentro" } as Localized,
  modules: [
    {
      id: "orders",
      name: { en: "Order board", zh: "订单看板", it: "Bacheca ordini" },
      lead: {
        en: "Every channel on one screen: your website and app, the kiosk, Deliveroo, Just Eat, phone orders and the dining room. A new order rings within 1.5 seconds and the tab title blinks until someone takes it.",
        zh: "所有渠道同一块屏：自家网站和 App、自助机、Deliveroo、Just Eat、电话单、堂食。新单 1.5 秒内响铃，浏览器标签一直闪到有人接单。",
        it: "Tutti i canali su un solo schermo: il tuo sito e la tua app, il chiosco, Deliveroo, Just Eat, gli ordini al telefono e la sala. Un ordine nuovo suona entro 1,5 secondi e la scheda lampeggia finché qualcuno non lo prende.",
      },
      bullets: [
        { en: "Platform badges with the platform's own pickup code", zh: "平台徽章带平台自己的取餐码", it: "Badge della piattaforma con il suo codice di ritiro" },
        { en: "Confirm, assign a rider, cancel or refund from the card", zh: "在卡片上直接确认、派骑手、取消、退款", it: "Conferma, assegna il rider, annulla o rimborsa dalla scheda" },
        { en: "Busy? Add 10 minutes or pause intake — customers see it at once", zh: "忙不过来？一键 +10 分钟或暂停接单 —— 顾客端即时可见", it: "Troppo lavoro? +10 minuti o pausa ordini con un tocco: il cliente lo vede subito" },
        { en: "Card orders appear only once payment is confirmed", zh: "卡付单要付款确认后才出现", it: "Gli ordini con carta compaiono solo a pagamento confermato" },
      ],
      shot: shot("orders", { en: "Order board on a Friday night: website, app, Deliveroo, Just Eat, phone and dine-in orders side by side", zh: "周五晚上的订单看板：网站、App、Deliveroo、Just Eat、电话、堂食的单同屏", it: "La bacheca ordini di un venerdì sera: sito, app, Deliveroo, Just Eat, telefono e sala sullo stesso schermo" }),
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
        { en: "Phone orders with address and delivery-zone check", zh: "电话单直接录地址，自动查配送区", it: "Ordini al telefono con indirizzo e controllo della zona di consegna" },
        { en: "Membership card scanned at the counter", zh: "柜台扫会员码", it: "Tessera fedeltà scansionata al banco" },
        { en: "Cancel with a reason; refund only what was actually collected", zh: "取消要写原因；退款只退真正收到的", it: "Annulla con motivo; rimborsa solo quanto realmente incassato" },
        { en: "One collection dialog for everything — the cash portion goes to the day's drawer", zh: "所有收款走同一个弹窗 —— 现金部分单独记，日结抽屉才对得上", it: "Un solo dialogo di incasso: la parte in contanti va nel cassetto del giorno" },
      ],
      shot: shot("cassa", { en: "Touch till with the dish grid, the open bill and the payment keys", zh: "收银台：菜品宫格、账单与收款键", it: "Cassa touch con la griglia dei piatti, il conto aperto e i tasti di incasso" }),
    },
    {
      id: "fiscal",
      name: { en: "Fiscal receipts & e-invoices", zh: "税务小票与电子发票", it: "Scontrino RT e fattura elettronica" },
      lead: {
        en: "The till talks to the RT fiscal printer: take the payment and the documento commerciale prints by itself — no second till, nothing typed twice. When a customer needs an invoice, the fattura elettronica goes to SdI from the same order.",
        zh: "收银台直连 RT 税控打印机：收完款，税务小票（documento commerciale）自己打出来 —— 不用第二台收银机，不用重复录入。客人要发票，同一张单直接开电子发票送 SdI。",
        it: "La cassa parla con il registratore telematico: incassi e il documento commerciale esce da solo — niente seconda cassa, niente da ribattere. Se il cliente vuole la fattura, la fattura elettronica parte verso lo SdI dallo stesso ordine.",
      },
      bullets: [
        { en: "Daily Z closing from the back office", zh: "日结 Z 在后台一键完成", it: "Chiusura giornaliera Z dal gestionale" },
        { en: "Customers' billing details saved for next time", zh: "客人的开票抬头存起来，下次直接选", it: "Dati di fatturazione del cliente salvati per la volta dopo" },
        { en: "Invoice timeline: sent, delivered, accepted — at a glance", zh: "发票时间线：已发、已送达、已接收，一眼看清", it: "Cronologia della fattura: inviata, consegnata, accettata, a colpo d'occhio" },
        { en: "Cash drawer opens from the till", zh: "钱箱从收银台直接弹开", it: "Il cassetto si apre dalla cassa" },
      ],
      shot: shot("fiscal", { en: "Payment taken at the till and the fiscal receipt issued", zh: "收银台收款，税务小票随即出票", it: "Incasso in cassa con lo scontrino emesso" }),
    },
    {
      id: "sala",
      name: { en: "Dining room & all-you-can-eat", zh: "堂食与放题", it: "Sala e All You Can Eat" },
      lead: {
        en: "One card per table with its state, covers and time seated. All-you-can-eat menus are priced per person with limits per round, and customers can order from their own phone by scanning the QR on the table.",
        zh: "一桌一张卡：状态、人数、坐了多久。放题（AYCE）按人计价、每轮限量；客人扫桌上的二维码，用自己的手机点单。",
        it: "Una scheda per tavolo con stato, coperti e tempo trascorso. I menu All You Can Eat si calcolano a persona con i limiti per giro, e i clienti ordinano dal proprio telefono inquadrando il QR sul tavolo.",
      },
      bullets: [
        { en: "Several rounds per table, one bill at the end", zh: "一桌多轮点单，最后一张账单", it: "Più giri per tavolo, un solo conto alla fine" },
        { en: "AYCE countdown; tables over time stand out", zh: "AYCE 倒计时，超时的桌子会标出来", it: "Conto alla rovescia AYCE; i tavoli fuori tempo saltano all'occhio" },
        { en: "Move and merge tables", zh: "换桌、并桌", it: "Sposta e unisci i tavoli" },
        { en: "Adult and child prices, cover charge", zh: "大人小孩分价、餐位费", it: "Prezzo adulti e bambini, coperto" },
      ],
      shot: shot("sala", { en: "Dining room grid with covers, AYCE timers and tables asking for the bill", zh: "堂食桌位：人数、AYCE 计时、要结账的桌", it: "La sala con coperti, timer AYCE e tavoli che chiedono il conto" }),
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
      shot: shot("kitchen", { en: "Kitchen screen with station filter and colour-coded waiting timers", zh: "厨房屏：工位切换与按等待时间变色的计时", it: "Schermo cucina con filtro per postazione e timer colorati" }),
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
      shot: shot("printing", { en: "Each printer subscribed to the ticket types it should print, with a live ticket preview", zh: "每台打印机勾选自己该打的票种，旁边是票面预览", it: "Ogni stampante abbonata ai suoi tipi di comanda, con l'anteprima dello scontrino" }),
    },
    {
      id: "delivery",
      name: { en: "Delivery & riders", zh: "配送与骑手", it: "Consegne e rider" },
      lead: {
        en: "Delivery zones by postcode, each with its own fee and minimum. Riders use a web app on their own phone — nothing to download from a store: scan the bag, navigate, call, mark delivered. The shop sees every stop live.",
        zh: "按邮编划配送区，各自配送费与起送额。骑手用自己手机上的网页 App —— 不用去应用商店下载：扫袋录单、导航、打电话、标送达。店里实时看到每一站。",
        it: "Zone di consegna per CAP, ciascuna con costo e minimo propri. I rider usano una web app sul proprio telefono — niente da scaricare dagli store: scansionano il sacchetto, navigano, chiamano, segnano consegnato. Il locale vede ogni tappa in tempo reale.",
      },
      bullets: [
        { en: "Cash or POS marked at the door; end-of-shift handover worked out to the cent", zh: "门口收现金还是刷 POS 当场标；收工交账精确到分", it: "Contanti o POS segnati alla porta; il versamento di fine turno torna al centesimo" },
        { en: "Live panel: each rider's next stop, delays and time back to the shop", zh: "在途面板：每个骑手的下一站、延误、预计回店时间", it: "Pannello in tempo reale: prossima tappa di ogni rider, ritardi e rientro al locale" },
        { en: "Per-zone delivery fee plus hourly pay on one timesheet", zh: "每区送单费 + 时薪，同一张工时表", it: "Compenso per zona più paga oraria, su un solo foglio ore" },
        { en: "Customer tracking page with the rider on a map", zh: "顾客追踪页在地图上看骑手", it: "Pagina di tracking con il rider sulla mappa" },
        { en: "No signal? Actions wait in a queue and are sent when it comes back", zh: "没信号？动作先排队，有网自动补发", it: "Niente campo? Le azioni restano in coda e partono quando torna il segnale" },
      ],
      shot: shot("delivery", { en: "Riders on the road: next stop, phone, door bell and time back to the shop", zh: "骑手在途：下一站、电话、门铃、预计回店", it: "Rider in consegna: prossima tappa, telefono, citofono e rientro al locale" }),
      phones: [
        one("/shots/mdesk-rider-app.jpg", { en: "Rider web app: the next delivery with cash to collect, call, navigate and Delivered", zh: "骑手网页 App：下一单、待收现金、拨号、导航、送达", it: "Web app del rider: la consegna successiva con incasso, Chiama, Naviga e Consegnato" }),
        one("/shots/mdesk-rider-conti.jpg", { en: "End of shift: cash to hand over, POS, per-zone fees and pay", zh: "收工交账：应交现金、POS、按区送单费与报酬", it: "Fine turno: contanti da versare, POS, compensi per zona e paga" }),
      ],
    },
    {
      id: "platforms",
      name: { en: "Deliveroo & Just Eat", zh: "Deliveroo 与 Just Eat", it: "Deliveroo e Just Eat" },
      lead: {
        en: "One HubRise connection instead of the tablets: menus pushed from here, sold-outs synced, order status reported back. Platform orders land on the same board as everyone else's.",
        zh: "用一条 HubRise 连接取代平板：菜单从这里推、沽清同步、状态回传。平台单和自家单落在同一块看板上。",
        it: "Una connessione HubRise al posto dei tablet: menu inviati da qui, esauriti sincronizzati, stato riportato. Gli ordini delle piattaforme arrivano sulla stessa bacheca di tutti gli altri.",
      },
      bullets: [
        { en: "Commission set per platform, VAT included — reports show what you actually keep", zh: "每个平台填佣金率（含 IVA），报表里看得到真正到手多少", it: "Commissione per piattaforma, IVA inclusa: i report mostrano quanto ti resta davvero" },
        { en: "A catalogue per brand (sushi and poke), each with its own mark-up", zh: "每个品牌一份目录（寿司与 poke），各自加价", it: "Un catalogo per marchio (sushi e poke), ciascuno con il proprio ricarico" },
        { en: "Extras re-ordered to the kitchen's sequence, not the platform's alphabetical one", zh: "加料按厨房顺序重排，不按平台的字母序", it: "Extra riordinati nella sequenza della cucina, non in quella alfabetica della piattaforma" },
        { en: "Photos resized to each platform's rules automatically", zh: "图片按各平台规格自动裁切", it: "Foto ridimensionate automaticamente secondo le regole di ogni piattaforma" },
      ],
      shot: shot("platforms", { en: "Deliveroo and Just Eat connected per brand, with commission and last menu push", zh: "按品牌接好 Deliveroo 与 Just Eat：佣金率与最近一次推送", it: "Deliveroo e Just Eat collegati per marchio, con commissione e ultimo invio del menu" }),
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
        { en: "One menu for every channel, with what each platform shows kept in sync", zh: "所有渠道一份菜单，各平台显示的内容保持同步", it: "Un solo menu per tutti i canali, con quello che mostra ogni piattaforma sempre allineato" },
        { en: "CSV export and import for bulk edits in Numbers or Excel", zh: "CSV 导出导入，批量改在 Numbers/Excel 里做", it: "Esporta e importa CSV per le modifiche in blocco su Numbers o Excel" },
        { en: "Selling windows per dish", zh: "每道菜可设可售时段", it: "Fasce orarie di vendita per piatto" },
        { en: "Platform price overrides", zh: "平台单独定价", it: "Prezzi diversi per le piattaforme" },
      ],
      shot: shot("menu", { en: "Menu editor with dish photos and the platform menus in sync", zh: "菜单编辑：带菜品图，平台菜单已同步", it: "Editor del menu con le foto dei piatti e i menu delle piattaforme sincronizzati" }),
    },
    {
      id: "ordering",
      name: { en: "Your own website & app", zh: "自家点单网站与 App", it: "Il tuo sito e la tua app" },
      lead: {
        en: "Customers order from the restaurant's own website and its iOS and Android app — menu with photos, pickup or delivery, card payment — with no platform commission. Those orders land on the same board.",
        zh: "顾客在餐厅自己的网站和 iOS / 安卓 App 上点单 —— 带图菜单、自取或外送、刷卡支付 —— 没有平台抽成。这些单同样进同一块看板。",
        it: "I clienti ordinano dal sito del ristorante e dalla sua app iOS e Android — menu con foto, ritiro o consegna, pagamento con carta — senza commissioni di piattaforma. Gli ordini arrivano sulla stessa bacheca.",
      },
      bullets: [
        { en: "13 languages for tourists and locals alike", zh: "13 种语言，本地人和游客都看得懂", it: "13 lingue, per clienti di casa e turisti" },
        { en: "Delivery-zone check and prep time shown before ordering", zh: "下单前就告诉顾客送不送得到、要等多久", it: "Zona di consegna e tempi d'attesa visibili prima di ordinare" },
        { en: "Order tracking with the rider on a live map", zh: "订单追踪，实时地图看骑手", it: "Tracciamento dell'ordine con il rider sulla mappa" },
        { en: "Self-service kiosk mode for the counter", zh: "柜台自助点单模式", it: "Modalità chiosco self-service per il banco" },
      ],
      phones: [
        shot("ordering", { en: "The restaurant's own ordering site on a phone", zh: "餐厅自己的点单网站（手机）", it: "Il sito di ordinazione del ristorante, sul telefono" }),
      ],
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
        { en: "Points and credit shared across a group's restaurants", zh: "同一品牌的几家店，积分和储值通用", it: "Punti e credito validi in tutti i locali dello stesso marchio" },
        { en: "Email campaigns and automations — nothing goes out without a click", zh: "邮件活动与自动化 —— 不点不发", it: "Campagne email e automazioni: niente parte senza un clic" },
        { en: "Customer-facing text must be Italian before it can be saved", zh: "顾客能看到的文案必须是意大利语才能保存", it: "I testi rivolti al cliente devono essere in italiano per poter essere salvati" },
        { en: "Membership card with QR, in the apps and on the website", zh: "会员码，App 和网站都有", it: "Tessera con QR, nelle app e sul sito" },
      ],
      shot: shot("marketing", { en: "Template and personal coupons with issue and redemption counts", zh: "模板券与专属券，含发放与核销数", it: "Coupon modello e personali con emessi e riscattati" }),
    },
    {
      id: "reports",
      name: { en: "Reports & closing", zh: "报表与日结", it: "Report e chiusura" },
      lead: {
        en: "Revenue trend against a goal line you drag into place, breakdowns by order type, channel and payment, and an end-of-day closing that matches the drawer.",
        zh: "营业额走势配一条可拖动的目标线，按订单类型、渠道、付款方式拆分，日结和钱箱对得上。",
        it: "Andamento dell'incasso con una linea obiettivo da trascinare, suddivisione per tipo d'ordine, canale e pagamento, e una chiusura di giornata che torna con il cassetto.",
      },
      bullets: [
        { en: "Daily, weekly and monthly goals", zh: "日、周、月目标各一条", it: "Obiettivi giornalieri, settimanali e mensili" },
        { en: "Platform orders shown before and after commission", zh: "平台单显示抽成前后两个数", it: "Ordini delle piattaforme prima e dopo la commissione" },
        { en: "End-of-day closing report", zh: "日结报表", it: "Report di chiusura giornaliera" },
        { en: "Rider hours and pay by month", zh: "骑手工时与报酬按月汇总", it: "Ore e paga dei rider, mese per mese" },
      ],
      shot: shot("reports", { en: "30-day revenue trend with weekend peaks and breakdowns by type, channel and payment", zh: "近 30 天营业额走势与按类型、渠道、付款方式的拆分", it: "Incasso degli ultimi 30 giorni con i picchi del weekend e le suddivisioni per tipo, canale e pagamento" }),
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
      shot: shot("procurement", { en: "Suppliers, items and the open purchase order side by side", zh: "供应商、货品、订货单三栏", it: "Fornitori, articoli e ordine d'acquisto aperto, fianco a fianco" }),
    },
    {
      id: "staff",
      name: { en: "Staff, time clock, audit", zh: "员工、打卡与操作日志", it: "Personale, timbrature, registro" },
      lead: {
        en: "Accounts by username, a module allow-list per role, PIN switching at the till. Everyone clocks in with the same rotating code — riders and staff from their own phone.",
        zh: "账号名登录、每个岗位一份模块白名单、收银台 PIN 换人。所有人用同一个轮换码打卡 —— 骑手和店员都在自己手机上。",
        it: "Account per nome utente, moduli visibili per ruolo, cambio con PIN in cassa. Tutti timbrano con lo stesso codice rotante, rider e personale dal proprio telefono.",
      },
      bullets: [
        { en: "Original punches are never overwritten; corrections are a second column with a note", zh: "打卡原值永不覆盖；调整另存一列并留备注", it: "Le timbrature originali non si sovrascrivono mai; le correzioni stanno in una seconda colonna con motivo" },
        { en: "Forgotten clock-outs are closed at closing time and flagged for review", zh: "忘打下班卡的封在打烊时刻，标出来等确认", it: "Le uscite dimenticate si chiudono all'orario di chiusura e restano da confermare" },
        { en: "Timesheet by station, CSV for the accountant", zh: "工时按工位分组，CSV 给会计", it: "Foglio ore per postazione, CSV per il commercialista" },
        { en: "Audit log of every back-office change, kept 180 days", zh: "后台每一处改动自动记录，保留 180 天", it: "Registro di ogni modifica in gestionale, conservato 180 giorni" },
      ],
      shot: shot("staff", { en: "Employee accounts with roles, permissions and last login", zh: "员工账号：角色、权限、上次登录", it: "Account dipendenti con ruoli, permessi e ultimo accesso" }),
    },
    {
      id: "ai",
      name: { en: "AI assistant", zh: "AI 助手", it: "Assistente AI" },
      lead: {
        en: "Ask for tonight's best seller, today's revenue, the rules of a coupon or a campaign draft. It can propose changes — a new coupon, a store setting — but nothing is written until you tap confirm.",
        zh: "问它今晚卖最好的是什么、今天营收多少、某张券的规则、要一份营销草稿。它能提议改动 —— 建一张券、改一个设置 —— 但你不点确认，什么都不会写。",
        it: "Chiedi il piatto più venduto stasera, l'incasso di oggi, le regole di un coupon o una bozza di campagna. Può proporre modifiche (un coupon nuovo, un'impostazione), ma nulla viene scritto finché non confermi.",
      },
      bullets: [
        { en: "Ask by voice or text, without leaving the order board", zh: "语音或打字都能问，不用离开订单看板", it: "Chiedi a voce o per iscritto, senza lasciare la bacheca" },
        { en: "Customer data is masked before it reaches the model", zh: "顾客数据先脱敏再给模型", it: "I dati dei clienti vengono mascherati prima di arrivare al modello" },
        { en: "Money-related changes require a typed confirmation", zh: "涉钱的改动要打字确认", it: "Le modifiche che toccano i soldi richiedono una conferma scritta" },
        { en: "The rulebook it reads is generated from the code, so it cannot drift", zh: "它读的规则手册由代码生成，不会漂", it: "Il manuale delle regole che legge è generato dal codice: non può divergere" },
      ],
      shot: shot("ai", { en: "Asking the assistant for tonight's best sellers, right next to the order board", zh: "在订单看板旁边问 AI 今晚卖得最好的菜", it: "L'assistente risponde sui piatti più venduti di stasera, accanto alla bacheca" }),
    },
  ] as DeskModule[],
  principlesLabel: {
    en: "Why restaurants switch to M Desk",
    zh: "为什么换成 M Desk",
    it: "Perché passare a M Desk",
  } as Localized,
  principles: [
    {
      title: { en: "One system instead of five", zh: "一套系统，替掉五样东西", it: "Un solo sistema al posto di cinque" },
      body: {
        en: "Cloud till, the fiscal printer's software, the platform tablets, an aggregator and the rider notebook — all on one screen. When you start, we import your menu and connect the printers, the RT and the delivery platforms.",
        zh: "云收银、税控机配套软件、外卖平台平板、聚合中台、手写的骑手账本，全部收进一块屏。上线时由我们导入菜单，接好打印机、税控机和外卖平台。",
        it: "Cassa in cloud, software del registratore, tablet delle piattaforme, aggregatore e quaderno dei rider: tutto su un solo schermo. All'avvio importiamo noi il menu e colleghiamo stampanti, registratore telematico e piattaforme.",
      },
    },
    {
      title: { en: "No money lost along the way", zh: "钱不会在路上漏掉", it: "Nessun soldo perso per strada" },
      body: {
        en: "Card orders reach the kitchen only once they are paid. Refunds can't exceed what was actually collected. Riders' end-of-shift cash adds up to the cent, and platform orders show what you keep after commission.",
        zh: "刷卡单付款成功才进厨房；退款只能退真正收到的钱；骑手收工交账精确到分；平台单直接显示扣完佣金到手多少。",
        it: "Gli ordini con carta arrivano in cucina solo se pagati. Non si rimborsa più di quanto incassato. Il versamento dei rider a fine turno torna al centesimo, e per gli ordini delle piattaforme vedi quanto ti resta dopo la commissione.",
      },
    },
    {
      title: { en: "When something goes wrong, you know at once", zh: "出了状况，马上就知道", it: "Se qualcosa si blocca, lo sai subito" },
      body: {
        en: "A printer goes offline and tickets move to the backup; nothing printed for 3 minutes raises an alert. Riders without signal keep working and their actions are sent when it returns. When something has to be done on the platform's side, the screen tells staff where.",
        zh: "打印机掉线，单子自动转到备用机；3 分钟没打出来就报警。骑手没信号照常操作，有网自动补发。平台那边要另外处理的事，界面直接告诉店员去哪里操作。",
        it: "Se una stampante va offline le comande passano alla riserva; dopo 3 minuti senza stampa scatta l'avviso. I rider senza campo continuano a lavorare e le azioni partono al ritorno del segnale. Quando serve intervenire sulla piattaforma, lo schermo dice al personale dove farlo.",
      },
    },
  ] as DeskPrinciple[],
  caseLabel: { en: "Part of the Mumi Sushi system", zh: "Mumi Sushi 系统的一部分", it: "Parte del sistema Mumi Sushi" } as Localized,
  caseCta: { en: "See the whole case study", zh: "看完整案例", it: "Vedi il caso completo" } as Localized,
  contactTitle: { en: "Running a restaurant?", zh: "你也开餐厅？", it: "Hai un ristorante?" } as Localized,
  contactBody: {
    en: "M Desk runs every service at four restaurants, and yours can have it too: a monthly subscription from €49, no setup fee, cancel any time with 30 days' notice. See what each plan includes, or write and tell me about your place.",
    zh: "M Desk 每一餐都在 4 家餐厅里跑，你的店也可以用：按月订阅，€49 起，没有开通费，提前 30 天说一声随时可停。看看每一档包含什么，或者写封信聊聊你的店。",
    it: "M Desk lavora a ogni servizio in quattro ristoranti, e può farlo anche nel tuo: abbonamento mensile da 49 €, nessun costo iniziale, disdici quando vuoi con 30 giorni di preavviso. Guarda cosa include ogni livello, oppure scrivimi e raccontami del tuo locale.",
  } as Localized,
  pricingCta: { en: "See the plans", zh: "看价目表", it: "Vedi i prezzi" } as Localized,
  contactCta: { en: "Write to me", zh: "写信给我", it: "Scrivimi" } as Localized,
  contactEmail: "ayylchyql@gmail.com",
  shotSoon: { en: "Screenshot coming", zh: "截图即将补上", it: "Schermata in arrivo" } as Localized,
  /** 首页旗舰段 */
  home: {
    eyebrow: { en: "Flagship · M Desk", zh: "旗舰项目 · M Desk", it: "Progetto principale · M Desk" } as Localized,
    title: { en: "The restaurant's control room.", zh: "一家餐厅的驾驶舱。", it: "La sala di controllo del ristorante." } as Localized,
    body: {
      en: "Orders from every channel, the till and fiscal receipts, the dining room, the kitchen, the printers, the riders and the staff — one back office, running every service at four restaurants and available as a monthly subscription.",
      zh: "所有渠道的订单、收银与税务小票、堂食、厨房、打印机、骑手和员工 —— 一套后台，4 家餐厅每一餐都在用，现在可以按月订阅。",
      it: "Ordini da ogni canale, cassa e scontrino fiscale, sala, cucina, stampanti, rider e personale: un solo gestionale, al lavoro a ogni servizio in quattro ristoranti e disponibile in abbonamento mensile.",
    } as Localized,
    cta: { en: "Explore M Desk", zh: "了解 M Desk", it: "Scopri M Desk" } as Localized,
    tiles: [
      { id: "orders", title: { en: "Order board", zh: "订单看板", it: "Bacheca ordini" }, desc: { en: "Every channel, one screen, 1.5 s to the bell", zh: "全渠道同屏，1.5 秒响铃", it: "Tutti i canali, uno schermo, 1,5 s alla campanella" } },
      { id: "fiscal", title: { en: "Fiscal receipts", zh: "税务小票", it: "Scontrino RT" }, desc: { en: "Take the payment, the receipt prints itself", zh: "收完款，税务小票自己打出来", it: "Incassi e lo scontrino esce da solo" } },
      { id: "delivery", title: { en: "Riders", zh: "骑手", it: "Rider" }, desc: { en: "A web app on their phone, cash counted to the cent", zh: "手机上的网页 App，交账精确到分", it: "Web app sul telefono, conti al centesimo" } },
      { id: "platforms", title: { en: "Platforms", zh: "平台对接", it: "Piattaforme" }, desc: { en: "Deliveroo and Just Eat without their tablets", zh: "不用平板接 Deliveroo 与 Just Eat", it: "Deliveroo e Just Eat senza i loro tablet" } },
    ] as { id: string; title: Localized; desc: Localized }[],
  },
};
