import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MsLogo from "@/components/MsLogo";
import { defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const content = {
  title: {
      en: "About Mind Studio",
      zh: "关于 Mind Studio",
      "zh-tw": "關於 Mind Studio",
      "ja": "Mind Studio について",
      "ko": "Mind Studio 소개",
      "fr": "À propos de Mind Studio",
      "de": "Über Mind Studio",
      "es": "Acerca de Mind Studio",
      "pt": "Sobre a Mind Studio",
      "ru": "О Mind Studio",
      "it": "Chi è Mind Studio",
      "ar": "نبذة عن Mind Studio",
    },
  intro: {
      en: "Mind Studio is one person and a laptop.",
      zh: "Mind Studio 就是一个人和一台电脑。",
      "zh-tw": "Mind Studio 就是一個人和一台筆電。",
      "ja": "Mind Studio は、ひとりとノートパソコン一台です。",
      "ko": "Mind Studio는 사람 한 명과 노트북 한 대입니다.",
      "fr": "Mind Studio, c'est une personne et un ordinateur portable.",
      "de": "Mind Studio ist eine Person und ein Laptop.",
      "es": "Mind Studio es una persona y un portátil.",
      "pt": "A Mind Studio é uma pessoa e um portátil.",
      "ru": "Mind Studio — это один человек и ноутбук.",
      "it": "Mind Studio è una persona e un portatile.",
      "ar": "‏Mind Studio هو شخص واحد وحاسوب محمول.",
    },
  paragraphs: [
    {
      en: "Every app here — the design, the code, the icons, even the words on this page — is made by the same pair of hands. There is no team, no investors, and no roadmap decided in a meeting. Just ideas that wouldn't leave me alone until I built them.",
      zh: "这里的每一款 App —— 设计、代码、图标，乃至这页上的文字 —— 都出自同一双手。没有团队、没有投资人，也没有会议室里定下的路线图。只有那些不肯放过我、非做出来不可的念头。",
      "zh-tw": "這裡的每一款 App —— 設計、程式碼、圖示，連這頁上的字 —— 都出自同一雙手。沒有團隊，沒有投資人，也沒有在會議室裡拍板的藍圖。只有一些不做出來就不肯放過我的念頭。",
      "ja": "ここにあるアプリはすべて —— デザインも、コードも、アイコンも、このページの文章さえも —— 同じ手から生まれています。チームも、投資家も、会議で決まるロードマップもありません。あるのは、つくるまで頭から離れなかったアイデアだけです。",
      "ko": "여기 있는 모든 앱 —— 디자인도, 코드도, 아이콘도, 이 페이지의 글까지 —— 같은 손에서 나왔습니다. 팀도, 투자자도, 회의에서 정해진 로드맵도 없습니다. 만들기 전까지 저를 놓아주지 않던 생각들이 있을 뿐입니다.",
      "fr": "Chaque app ici — le design, le code, les icônes, jusqu'aux mots de cette page — vient des mêmes mains. Pas d'équipe, pas d'investisseurs, pas de feuille de route décidée en réunion. Juste des idées qui ne m'ont pas lâché tant que je ne les avais pas faites.",
      "de": "Jede App hier — Design, Code, Icons, sogar die Worte auf dieser Seite — stammt aus denselben Händen. Kein Team, keine Investoren, keine in einem Meeting beschlossene Roadmap. Nur Ideen, die mich nicht in Ruhe ließen, bis ich sie gebaut hatte.",
      "es": "Cada app de aquí — el diseño, el código, los iconos, incluso las palabras de esta página — sale de las mismas manos. No hay equipo, ni inversores, ni una hoja de ruta decidida en una reunión. Solo ideas que no me dejaron en paz hasta que las construí.",
      "pt": "Cada app aqui — o design, o código, os ícones, até as palavras desta página — vem das mesmas mãos. Não há equipa, nem investidores, nem um roadmap decidido numa reunião. Só ideias que não me largaram até as construir.",
      "ru": "Каждое приложение здесь — дизайн, код, иконки и даже слова на этой странице — сделано одними руками. Ни команды, ни инвесторов, ни дорожной карты, утверждённой на совещании. Только идеи, которые не отпускали меня, пока я их не сделал.",
      "it": "Ogni app qui — il design, il codice, le icone, perfino le parole di questa pagina — viene dalle stesse mani. Nessun team, nessun investitore, nessuna roadmap decisa in riunione. Solo idee che non mi hanno lasciato in pace finché non le ho costruite.",
      "ar": "كل تطبيق هنا — التصميم والشيفرة والأيقونات، وحتى كلمات هذه الصفحة — من صنع اليدين نفسهما. لا فريق ولا مستثمرين ولا خارطة طريق تُقرَّر في اجتماع. مجرد أفكار لم تتركني حتى بنيتها.",
    },
    {
      en: "I make small, honest apps: tools I wanted for myself, polished until they felt right on my own phone. If a feature doesn't earn its place, it doesn't ship. If your data doesn't need to leave your device, it doesn't.",
      zh: "我做小而诚实的 App：都是我自己想用的工具，打磨到在我自己手机上顺手为止。一个功能配不上它的位置，就不会上线；你的数据没必要离开设备，就不会离开。",
      "zh-tw": "我做小而誠實的 App：先是我自己想要的工具，打磨到在我自己手機上用著順手為止。一個功能如果配不上它佔的位置，就不會出現。你的資料如果沒必要離開你的裝置，它就不會離開。",
      "ja": "小さく、誠実なアプリをつくっています。まず自分がほしかった道具を、自分の端末でしっくりくるまで磨いて。居場所に見合わない機能は入れません。端末から出る必要のないデータは、出しません。",
      "ko": "저는 작고 정직한 앱을 만듭니다. 제가 갖고 싶었던 도구를, 제 폰에서 손에 맞을 때까지 다듬어서. 자리값을 못 하는 기능은 넣지 않습니다. 기기를 떠날 필요가 없는 데이터는, 떠나지 않습니다.",
      "fr": "Je fais des apps petites et honnêtes : des outils que je voulais pour moi, peaufinés jusqu'à ce qu'ils sonnent juste sur mon propre téléphone. Si une fonction ne mérite pas sa place, elle ne sort pas. Si vos données n'ont pas besoin de quitter votre appareil, elles ne le quittent pas.",
      "de": "Ich mache kleine, ehrliche Apps: Werkzeuge, die ich selbst haben wollte, poliert, bis sie sich auf meinem eigenen Telefon richtig anfühlten. Wenn eine Funktion ihren Platz nicht verdient, kommt sie nicht rein. Wenn deine Daten dein Gerät nicht verlassen müssen, tun sie es nicht.",
      "es": "Hago apps pequeñas y honestas: herramientas que quería para mí, pulidas hasta sentirse bien en mi propio teléfono. Si una función no se gana su sitio, no sale. Si tus datos no necesitan salir de tu dispositivo, no salen.",
      "pt": "Faço apps pequenas e honestas: ferramentas que queria para mim, polidas até ficarem bem no meu próprio telemóvel. Se uma funcionalidade não merece o seu lugar, não sai. Se os teus dados não precisam de sair do dispositivo, não saem.",
      "ru": "Я делаю небольшие честные приложения: инструменты, которых мне не хватало самому, доведённые до того, чтобы они были удобны на моём собственном телефоне. Если функция не оправдывает своё место — она не выходит. Если вашим данным незачем покидать устройство — они его не покидают.",
      "it": "Faccio app piccole e oneste: strumenti che volevo per me, rifiniti finché non funzionavano bene sul mio telefono. Se una funzione non si merita il suo posto, non esce. Se i tuoi dati non devono lasciare il dispositivo, non lo lasciano.",
      "ar": "أصنع تطبيقات صغيرة وصادقة: أدوات أردتها لنفسي، صقلتها حتى صارت مريحة على هاتفي أنا. إن لم تستحق ميزةٌ مكانها، فلن تُطلق. وإن لم تكن بياناتك بحاجة إلى مغادرة جهازك، فلن تغادره.",
    },
    {
      en: "From an expense tracker to a sound machine to a camera that films both sides of a moment — they don't share a category, only a maker and a way of working: quietly, carefully, one app at a time.",
      zh: "从记账工具，到助眠声音，再到同时拍下此刻两面的相机 —— 它们不属于同一个品类，只共享同一个作者和同一种做事方式：安静、细致，一次做好一件。",
      "zh-tw": "從記帳、聲音機器，到能同時拍下瞬間兩面的相機 —— 它們不屬於同一個類別，共用的只是同一個作者和同一種做法：安靜、仔細，一次做一款。",
      "ja": "家計簿から、音のマシン、瞬間の両側を写すカメラまで —— カテゴリは違っても、つくり手とやり方は同じです。静かに、丁寧に、ひとつずつ。",
      "ko": "가계부에서 사운드 머신, 순간의 양면을 찍는 카메라까지 —— 분류는 다르지만 만든 사람과 방식은 같습니다. 조용히, 꼼꼼히, 한 번에 하나씩.",
      "fr": "D'un suivi de dépenses à une machine à sons, jusqu'à un appareil photo qui filme les deux côtés d'un instant — elles ne partagent pas une catégorie, seulement un auteur et une façon de faire : doucement, soigneusement, une app à la fois.",
      "de": "Vom Ausgaben-Tracker über die Klangmaschine bis zur Kamera, die beide Seiten eines Moments filmt — sie teilen keine Kategorie, nur einen Macher und eine Arbeitsweise: leise, sorgfältig, eine App nach der anderen.",
      "es": "De un control de gastos a una máquina de sonido o una cámara que graba los dos lados de un momento — no comparten categoría, solo un autor y una manera de trabajar: en silencio, con cuidado, una app cada vez.",
      "pt": "De um controlo de despesas a uma máquina de som ou uma câmara que filma os dois lados de um momento — não partilham categoria, só um autor e uma maneira de trabalhar: em silêncio, com cuidado, uma app de cada vez.",
      "ru": "От учёта расходов до звуковой машины и камеры, снимающей обе стороны момента, — их объединяет не категория, а автор и манера работы: тихо, внимательно, по одному приложению за раз.",
      "it": "Da un tracciaspese a una macchina del suono, fino a una fotocamera che riprende entrambi i lati di un momento — non condividono una categoria, solo un autore e un modo di lavorare: in silenzio, con cura, un'app alla volta.",
      "ar": "من متتبّع مصروفات إلى آلة صوت إلى كاميرا تصوّر وجهَي اللحظة — لا تجمعها فئة واحدة، بل صانع واحد وطريقة عمل واحدة: بهدوء، وبعناية، تطبيقاً تلو الآخر.",
    },
  ],
  workLine: {
      en: "Not all of it ends up on the App Store. A sushi restaurant near Milan runs its entire ordering operation — apps, ordering site, back office, riders, backend — on a system built here: ",
      zh: "并非所有产出都会出现在 App Store。米兰近郊的一家寿司餐厅，整套点单生意 —— App、点单网站、店内后台、骑手、后端 —— 都跑在这里做的系统上：",
      "zh-tw": "不是所有東西都會上 App Store。米蘭附近的一家壽司店，整套點餐業務 —— App、點餐網站、後台、外送、伺服器 —— 都跑在這裡做的系統上：",
      "ja": "すべてが App Store に並ぶわけではありません。ミラノ近郊の寿司店は、注文業務のすべて —— アプリ、注文サイト、管理画面、配達、バックエンド —— をここで作ったシステムで回しています：",
      "ko": "모두가 App Store에 오르는 것은 아닙니다. 밀라노 근교의 한 초밥집은 주문 업무 전체 —— 앱, 주문 사이트, 백오피스, 배달, 백엔드 —— 를 여기서 만든 시스템으로 운영합니다: ",
      "fr": "Tout ne finit pas sur l'App Store. Un restaurant de sushis près de Milan fait tourner toute sa prise de commande — apps, site de commande, back-office, livreurs, backend — sur un système construit ici : ",
      "de": "Nicht alles landet im App Store. Ein Sushi-Restaurant bei Mailand wickelt seinen gesamten Bestellbetrieb — Apps, Bestellseite, Backoffice, Fahrer, Backend — über ein hier gebautes System ab: ",
      "es": "No todo acaba en la App Store. Un restaurante de sushi cerca de Milán lleva toda su operación de pedidos — apps, web de pedidos, back office, repartidores, backend — con un sistema hecho aquí: ",
      "pt": "Nem tudo acaba na App Store. Um restaurante de sushi perto de Milão gere toda a operação de encomendas — apps, site de encomendas, back office, estafetas, backend — com um sistema feito aqui: ",
      "ru": "Не всё попадает в App Store. Суши-ресторан под Миланом ведёт весь приём заказов — приложения, сайт заказов, админка, курьеры, бэкенд — на системе, собранной здесь: ",
      "it": "Non tutto finisce sull'App Store. Un ristorante di sushi vicino a Milano gestisce tutta la sua operatività di ordini — app, sito ordini, back office, rider, backend — con un sistema costruito qui: ",
      "ar": "ليس كل شيء ينتهي على App Store. مطعم سوشي قرب ميلانو يدير عمليات الطلب بالكامل — التطبيقات وموقع الطلب ولوحة الإدارة والسائقين والخادم — عبر نظام بُني هنا: ",
    },
  workLink: {
      en: "the Mumi Sushi case study",
      zh: "Mumi Sushi 案例",
      "zh-tw": "Mumi Sushi 案例",
      "ja": "Mumi Sushi の事例",
      "ko": "Mumi Sushi 사례",
      "fr": "l'étude de cas Mumi Sushi",
      "de": "die Fallstudie Mumi Sushi",
      "es": "el caso de Mumi Sushi",
      "pt": "o caso Mumi Sushi",
      "ru": "кейс Mumi Sushi",
      "it": "il caso studio Mumi Sushi",
      "ar": "دراسة حالة Mumi Sushi",
    },
  closing: {
      en: "If something here resonates — or breaks — I'd love to hear from you.",
      zh: "如果这里有什么打动了你 —— 或者出了问题 —— 我很想听到你的声音。",
      "zh-tw": "如果這裡有什麼打動了你 —— 或者壞了 —— 都歡迎告訴我。",
      "ja": "ここに響くものがあったら —— あるいは壊れていたら —— ぜひ教えてください。",
      "ko": "여기에 마음에 닿는 게 있다면 —— 혹은 고장 났다면 —— 꼭 알려주세요.",
      "fr": "Si quelque chose ici vous parle — ou casse — j'aimerais beaucoup vous lire.",
      "de": "Wenn dich hier etwas anspricht — oder kaputtgeht — schreib mir gern.",
      "es": "Si algo de aquí te llega — o se rompe — me encantaría saberlo.",
      "pt": "Se algo aqui te tocar — ou avariar — adorava saber.",
      "ru": "Если что-то здесь откликнулось — или сломалось — напишите, буду рад.",
      "it": "Se qualcosa qui ti colpisce — o si rompe — mi farebbe piacere sentirti.",
      "ar": "إن لامسك شيء هنا — أو تعطّل — يسعدني أن أسمع منك.",
    },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return {
    title: `${pick(content.title, locale)} · Mind Studio`,
    description: pick(content.paragraphs[0], locale),
    alternates: { canonical: `https://mindstudioapps.com/${locale}/about` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <main className="prose-page about-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <div className="about-mark">
        <MsLogo label="Mind Studio logo" />
      </div>
      <h1>{pick(content.title, lang)}</h1>
      <p className="prose-intro">{pick(content.intro, lang)}</p>
      {content.paragraphs.map((p, i) => (
        <p key={i} className="about-para">
          {pick(p, lang)}
        </p>
      ))}
      <p className="about-para">
        {pick(content.workLine, lang)}
        <a href={`/${lang}/work/mumi-sushi`}>{pick(content.workLink, lang)}</a>
        {lang === "zh" ? "。" : "."}
      </p>
      <p className="about-para">
        {pick(content.closing, lang)}{" "}
        <a href="mailto:ayylchyql@gmail.com">ayylchyql@gmail.com</a>
      </p>
    </main>
  );
}
