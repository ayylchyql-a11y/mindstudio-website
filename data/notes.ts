import type { Locale, Localized } from "@/lib/i18n";

/**
 * Notes = 技术长文。
 *
 * 为什么正文只有英文：这些文章吃的是搜索流量,而目标查询("Apple Development
 * certificate expired","SwiftData migration data loss")本来就只有英文有量。
 * 标题/摘要给双语,是为了中文站的列表页读得通;正文双语只会稀释同一个 URL 的主题。
 */

export type Block =
  | { t: "p"; en: string }
  | { t: "h2"; en: string }
  | { t: "code"; lang?: string; body: string; caption?: Localized }
  | { t: "ul"; items: string[] }
  | { t: "note"; en: string }
  | { t: "img"; src: string; alt: string; caption?: Localized };

export interface Note {
  slug: string;
  /** ISO date, 用于 <time> 与 sitemap */
  date: string;
  title: Localized;
  /** 列表页与 <meta description>。控制在 155 字符内(英文那份)。 */
  summary: Localized;
  /** 搜索者实际会输入的那句话 —— 写进正文第一段,不做关键词堆砌 */
  body: Block[];
}

export const notes: Note[] = [
  {
    slug: "wiped-production-database-shadow-database-url",
    date: "2026-08-22",
    title: {
      en: "I wiped my client's production database on a Friday night with a flag that doesn't look dangerous",
      zh: "周五晚上，我用一个看起来毫无危险的参数清空了客户的生产库",
    },
    summary: {
      en: "--shadow-database-url points at scratch space the tool is entitled to destroy. I passed it the production URL. What saved it was point-in-time recovery; what failed was keeping a blacklist of dangerous commands.",
      zh: "--shadow-database-url 指向的是工具有权销毁的临时空间，而我填了生产库地址。救回来靠的是时间点恢复；失效的是「危险命令黑名单」这个习惯。",
    },
    body: [
      { t: "p", en: "On a Friday evening, in the middle of dinner service, I emptied the production database of the restaurant whose entire ordering operation runs on software I wrote. Orders, menu, customers, the lot." },
      { t: "p", en: "It came back. This is what happened, why the thing I thought was protecting me wasn't, and the one question I now ask before typing any database URL anywhere." },
      { t: "h2", en: "The command" },
      { t: "p", en: "I was adding a migration. Prisma needs a second, throwaway database to diff schemas against — the <i>shadow database</i>. It creates it, uses it, and drops it. Normally it provisions one for you; in this setup it needed to be passed explicitly, so I passed one:" },
      { t: "code", lang: "bash", body: "npx prisma migrate dev \\\n  --shadow-database-url \"postgres://…\"   # ← I put the production URL here",
        caption: { en: "The shadow database is not a copy. It is scratch space the tool is entitled to destroy.", zh: "shadow database 不是副本，是工具有权销毁的临时空间。" } },
      { t: "p", en: "The URL I pasted was production. There was no confirmation prompt, and there shouldn't have been — from the tool's point of view I had just told it where its scratch space lives, and it did exactly what it is documented to do with scratch space." },
      { t: "note", en: "That is what makes this class of mistake dangerous. Nothing malfunctioned. Every piece of software behaved correctly. The damage was entirely in which string went in which slot." },
      { t: "h2", en: "Why the habit that usually saves me didn't" },
      { t: "p", en: "I have a rule about never pointing anything at production. What I actually had was a mental blacklist of the commands I consider dangerous — <code>drop</code>, <code>reset</code>, <code>truncate</code>, <code>--force</code>. I check those." },
      { t: "p", en: "<code>--shadow-database-url</code> was not on that list, because it doesn't look like a destructive flag. It looks like configuration. It reads like the sort of parameter that tells a tool where to <i>find</i> something, not what to <i>flatten</i>." },
      { t: "p", en: "<b>A blacklist can only stop the entries that are on it.</b> The one that gets you is by definition the one you never thought to add — and the more innocuous a flag looks, the more likely it is to be missing." },
      { t: "p", en: "So I replaced the blacklist with a question, asked of every parameter that takes a database URL, no exceptions:" },
      { t: "note", en: "Will this parameter write to, or clear, the database I'm about to name? If I can't answer that from memory, I go and read the docs before pressing enter." },
      { t: "p", en: "It is a slower rule and a much better one. It applies to flags I have never seen before, which is precisely where the blacklist failed." },
      { t: "h2", en: "There was a second trap underneath" },
      { t: "p", en: "This wasn't purely carelessness. The production URL was the easiest string in the project to reach for, because it's the default value of <code>DATABASE_URL</code> in the API's own env file:" },
      { t: "code", lang: "bash", body: "# apps/api/.env\nDATABASE_URL=\"postgres://…prod…\"   # this is production. it is the default.",
        caption: { en: "Local development connected to the production database by default. That's the real root cause.", zh: "本地开发默认连的就是生产库。这才是真正的根因。" } },
      { t: "p", en: "When production is what your shell already has loaded, one careless paste is all it takes. The mistake was mine; the loaded gun on the table was a design decision I had made months earlier and stopped noticing." },
      { t: "h2", en: "The twenty minutes after" },
      { t: "p", en: "The database is on Neon, which keeps a continuous write-ahead log and can restore to any point in time within the retention window. I did not have to find a backup file, or hope a nightly dump had run, or know when the last one was." },
      { t: "ul", items: ["<b>Stop writing immediately.</b> Every order that lands after the wipe is one you will have to reconcile by hand after the restore.", "<b>Pick a timestamp before the command, not before the alert.</b> I knew the exact minute I ran it, which made this trivial. If you're guessing, guess earlier — you lose a few minutes of data instead of restoring into the middle of the damage.", "<b>Restore into a branch first, then verify, then swap.</b> Restoring straight over the live database means a bad restore leaves you with nothing to try again from.", "<b>Then go and look at the actual rows</b> — count orders for the day, open the most recent one. \"The restore succeeded\" is a claim by the tool, not evidence."] },
      { t: "p", en: "Total downtime was about twenty minutes, during service, on the busiest evening of the week. Nothing was permanently lost." },
      { t: "h2", en: "What I changed" },
      { t: "p", en: "The honest ranking, most useful first:" },
      { t: "ul", items: ["<b>Point-in-time recovery, verified.</b> I had it by luck — it came with the managed database. Everything else here is prevention; this is the only thing that turns a catastrophe into an inconvenience. Restore from it once on purpose, so you know it works and how long it takes.", "<b>Local development no longer defaults to production.</b> The env file now points at a local database, and reaching production takes a deliberate act.", "<b>The question, not the blacklist.</b> \"Will this parameter write or clear what I'm naming?\"", "<b>A guard in the scripts that wrap destructive tooling</b> — a backstop, not a strategy, since it's still a blacklist:"] },
      { t: "code", lang: "bash", body: "# Refuse to run destructive tooling against anything that smells like prod.\ncase \"$SHADOW_DATABASE_URL\" in\n  *prod*|*neon.tech*) echo \"refusing: shadow db points at production\"; exit 1 ;;\nesac",
        caption: { en: "Cheap to add. It would have caught this specific mistake — and won't catch the next differently-shaped one.", zh: "加起来很便宜，能挡住这一次。但下一次换个形状的它照样挡不住。" } },
      { t: "h2", en: "The part worth keeping" },
      { t: "p", en: "I ran the command that did it. But the setup made it a one-paste mistake instead of a several-step one, and it stayed that way for months because nothing had gone wrong yet. Absence of an incident is not evidence that a setup is safe — it's the state every unsafe setup is in right up until it isn't." },
    ],
  },
  {
    slug: "position-sticky-stacking-context-modal-behind-page",
    date: "2026-08-22",
    title: {
      en: "A z-index of 99999 lost to a z-index of 1, and position: sticky was why",
      zh: "z-index 99999 输给了 z-index 1，元凶是 position: sticky",
    },
    summary: {
      en: "position: sticky always creates a stacking context, so a fixed overlay rendered inside one can never escape it — no matter how large its z-index is.",
      zh: "position: sticky 一定会创建层叠上下文。渲染在它内部的 fixed 弹窗永远逃不出去，z-index 写多大都没用。",
    },
    body: [
      { t: "p", en: "A modal in our back office started rendering <b>behind</b> the page. Not invisible — it was there, painted, obviously alive. It was just confined to a strip about sixty pixels tall at the top of the window, with the rest of the page drawn straight over it." },
      { t: "p", en: "Its CSS said <code>position: fixed; inset: 0; z-index: 99999</code>. The content it was losing to had <code>z-index: 1</code>." },
      { t: "h2", en: "The symptom points at the wrong thing" },
      { t: "p", en: "Because the overlay looked washed out where it did show, I spent the first stretch of this convinced it was a transparency problem. I went through <code>opacity</code>, then <code>backdrop-filter</code>, then background alpha, then whether some parent had a blend mode. All of it was wasted — there was nothing wrong with any of them. What I was seeing wasn't a translucent modal. It was page content drawn <i>on top of</i> an opaque one." },
      { t: "p", en: "The actual cause was one declaration on an ancestor, five levels up:" },
      { t: "code", lang: "html", body: "<div class=\"toolbar\">\n  Filters\n  <div class=\"overlay\">MODAL — z-index: 99999</div>\n</div>\n<div class=\"page\">page content, z-index: 1</div>\n\n.toolbar { position: sticky; top: 0; }        /* ← the entire bug */\n.overlay { position: fixed; inset: 0; z-index: 99999; }\n.page    { position: relative; z-index: 1; }",
        caption: { en: "This is the whole bug, reduced. Nothing else is required to reproduce it.", zh: "这就是整个 bug 的最小复现，不需要任何别的东西。" } },
      { t: "p", en: "Here is that markup rendered in a real browser, next to the identical markup with <code>position: sticky</code> deleted:" },
      { t: "img", src: "/notes/sticky-stacking-context.png", alt: "Side by side: with a sticky ancestor the fixed overlay only paints inside the toolbar; without it the overlay covers the viewport.",
        caption: { en: "同一份代码。左边有 sticky 祖先，z-index 99999 的全屏弹窗只画在工具栏那条里；右边删掉 sticky 就正常铺满。", zh: "同一份代码。左边有 sticky 祖先，z-index 99999 的全屏弹窗只画在工具栏那条里；右边删掉 sticky 就正常铺满。" } },
      { t: "h2", en: "Why sticky does this" },
      { t: "p", en: "<b>A <code>position: sticky</code> element always creates a stacking context.</b> Not conditionally, not only when you give it a <code>z-index</code> — always. That is different from <code>position: relative</code>, which only creates one once <code>z-index</code> is something other than <code>auto</code>, and it is why this catches people." },
      { t: "p", en: "Once an ancestor owns a stacking context, every <code>z-index</code> inside it is resolved <i>within</i> that context. Your 99999 doesn't compete with the rest of the page any more — it only competes with the toolbar's other children. The whole toolbar then takes its own place in the page's stacking order, and your modal is a passenger inside it. There is no number large enough to escape, because the number is being read in the wrong room." },
      { t: "note", en: "A useful way to hold it: z-index is not a global ranking. It is a rank among siblings inside whichever stacking context you happen to be in — and lots of ordinary CSS silently creates one." },
      { t: "h2", en: "Diagnosing it in one paste" },
      { t: "p", en: "You don't have to guess which ancestor is responsible. Walk up the tree and print every element that creates a stacking context:" },
      { t: "code", lang: "js", body: "// Paste this in the console while the broken modal is on screen.\n// Walk up from the overlay and print anything that creates a stacking context.\nlet el = document.querySelector('.overlay')\nwhile ((el = el.parentElement)) {\n  const s = getComputedStyle(el)\n  if (['sticky','fixed'].includes(s.position) ||\n      s.transform !== 'none' || s.filter !== 'none' ||\n      s.willChange !== 'auto' || s.opacity !== '1' ||\n      s.contain !== 'none' || s.isolation === 'isolate') {\n    console.log(el, s.position, s.transform, s.filter, s.opacity)\n  }\n}",
        caption: { en: "The first thing this prints is almost always your culprit.", zh: "打印出来的第一个，基本就是元凶。" } },
      { t: "p", en: "It is worth knowing the rest of that list, because <code>sticky</code> is only the one that caught me. <code>transform</code>, <code>filter</code>, <code>opacity</code> below 1, <code>will-change</code>, <code>contain</code>, <code>isolation: isolate</code>, and <code>backdrop-filter</code> all create a stacking context too. A CSS animation library that adds <code>transform: translateZ(0)</code> for GPU compositing will do this to you and never mention it." },
      { t: "h2", en: "The fix, and the rule that follows from it" },
      { t: "p", en: "Raising the z-index cannot work. The modal has to be rendered somewhere that isn't inside the trapping context at all — which in React means a portal:" },
      { t: "code", lang: "jsx", body: "import { createPortal } from 'react-dom'\n\nexport function Overlay({ children }) {\n  // Render into <body>, outside every stacking context on the page.\n  return createPortal(<div className=\"overlay\">{children}</div>, document.body)\n}",
        caption: { en: "Portals move where it renders in the DOM, not where it lives in your component tree. State and events still flow normally.", zh: "Portal 改的是「在 DOM 里渲染到哪」，不是「在组件树里属于谁」。状态和事件照常。" } },
      { t: "p", en: "The rule I now apply without thinking about it: <b>anything that must cover the viewport gets portaled to <code>document.body</code></b> — modals, dropdowns, toasts, tooltips, command palettes. Not because I know there's a stacking context in the way, but because I can't guarantee there isn't one, and the failure is silent, visual, and points at the wrong suspect." },
      { t: "ul", items: ["It compiles. There is no error, no warning, no console message.", "It renders — which is worse than not rendering, because it looks like a styling problem rather than a structural one.", "It is invisible in code review: the modal's own CSS is perfectly correct, and the line that breaks it is in a different file."] },
    ],
  },
  {
    slug: "storekit-products-empty-array-paywall-did-nothing",
    date: "2026-08-22",
    title: {
      en: "My paywall did nothing for six months, and StoreKit never once returned an error",
      zh: "我的付费墙静默失败了半年，而 StoreKit 一次错误都没报过",
    },
    summary: {
      en: "Product.products(for:) returns an empty array for a product that isn't on sale — it does not throw. If your paywall reads .first and returns early, the button goes silently dead.",
      zh: "商品没上架时 Product.products(for:) 返回的是空数组，不是抛错。付费墙如果取 .first 然后静默 return，购买按钮就成了一个死按钮。",
    },
    body: [
      { t: "p", en: "For about six months my app had roughly 185 downloads and <b>zero</b> purchases. I assumed the obvious thing: people didn't want to pay. I rewrote the paywall copy. I moved the upgrade entry point. I second-guessed the price." },
      { t: "p", en: "The actual reason was that the purchase button did nothing at all. Tap it, and the app did not show a sheet, did not show an error, did not log anything. It just sat there. And StoreKit was behaving exactly as documented the entire time." },
      { t: "h2", en: "Empty is not an error" },
      { t: "p", en: "In StoreKit 2 you fetch products like this:" },
      { t: "code", lang: "swift", body: "let products = try await Product.products(for: [Self.proProductId])",
        caption: { en: "A batch lookup. Ask for five IDs, get back however many the store recognises.", zh: "这是批量查询。问五个 ID，商店认得几个就还你几个。" } },
      { t: "p", en: "That call is a <b>batch</b> lookup, and it treats an unknown product ID the way a dictionary lookup treats a missing key: the ID simply isn't in the result. It does not throw. It does not warn. Ask for one product that isn't on sale and you get back an empty array, successfully." },
      { t: "p", en: "Which means this shape — and it is a very natural shape to write — is a silent dead end:" },
      { t: "code", lang: "swift", body: "// The bug\nlet products = try await Product.products(for: [proProductId])\nguard let product = products.first else { return }   // ← silently does nothing\nlet result = try await product.purchase()",
        caption: { en: "This compiles, runs, and reports success. The user just watches nothing happen.", zh: "这段代码编译过、跑得通、不报任何错。用户那边就是点了没反应。" } },
      { t: "p", en: "Every review of that code reads fine, because the failure it guards against feels impossible — of course my own product ID exists, I typed it myself. The <code>try</code> in front of the call makes it feel like errors are handled. They are, just not this one, because this one is not an error." },
      { t: "h2", en: "Why the store had never heard of my product" },
      { t: "p", en: "The product ID was correct. It existed in App Store Connect. Its status, which I had not looked at in months, was <b>Developer Rejected</b>." },
      { t: "p", en: "Here is the rule that caused it, and it is the part I had never seen written down clearly: <b>your first non-consumable in-app purchase has to be submitted for review attached to an app version.</b> It does not get reviewed on its own, so it rides along with a version submission." },
      { t: "p", en: "Which means the reverse is true as well. Months earlier I had withdrawn a version submission for an unrelated reason. Withdrawing it also cancelled the in-app purchase attached to it. The IAP dropped back to Developer Rejected — never on sale, never reviewed. App Store Connect did not warn me, and the app had no way to know." },
      { t: "note", en: "So the store was right to return an empty array. There genuinely was no purchasable product. Every layer behaved correctly, and the result was six months of a dead button." },
      { t: "h2", en: "Two rules that came out of this" },
      { t: "p", en: "<b>An empty product list must be a visible state, never an early return.</b> The fix is not clever — it is just refusing to swallow it:" },
      { t: "code", lang: "swift", body: "let products = try await Product.products(for: [Self.proProductId])\nguard let product = products.first else {\n    IAPDiagnostics.recordProductMissing()\n    throw EntitlementError.productNotFound\n}",
        caption: { en: "\"Can't fetch the product\" and \"the purchase failed\" are different diagnoses. Don't collapse them into one message.", zh: "「商品拉不到」和「购买失败了」是两种完全不同的病，别合并成同一句提示。" } },
      { t: "p", en: "<b>Product IDs are burned forever.</b> Separately, I had created a product ID in App Store Connect, deleted it, then later tried to reuse the same string. Apple keeps deleted product IDs reserved permanently — you cannot re-register one. I had to move to a new ID with a <code>2</code> on the end and make sure every reference in code matched it exactly." },
      { t: "h2", en: "The diagnostics screen I should have had on day one" },
      { t: "p", en: "There is a second version of this problem, and it bit me later during review. A reviewer rejected the app because the purchase failed for them. Their screenshot showed the price rendering correctly — so products were fetching fine — but the app's only feedback was a generic \"Purchase failed, please try again\". Whatever <code>product.purchase()</code> actually threw had been swallowed. With nothing but that screenshot, there was nothing to debug." },
      { t: "p", en: "So I built a diagnostics screen into settings. It does not attempt a purchase — in production that would charge real money. It just lays the black box open and makes every link in the chain readable and copyable:" },
      { t: "ul", items: ["Whether the product can be fetched at all, and at what price and currency", "Whether the device can make payments (<code>AppStore.canMakePayments</code>)", "Which StoreKit environment and which storefront region the app is actually in", "Any entitlement the user already holds", "<b>The last purchase error, raw</b> — domain, code and description, recorded at the moment it was thrown"] },
      { t: "p", en: "That last one matters most. A user who cannot pay you is not going to file a good bug report, and neither is a reviewer. Recording the raw error somewhere they can copy it turns \"it doesn't work\" into an actual diagnosis." },
      { t: "h2", en: "What I'd tell past me" },
      { t: "ul", items: ["Zero purchases is a <b>bug report</b> until proven otherwise. Six months of rewriting copy was six months spent optimising a button that was not connected to anything.", "Check the IAP's status in App Store Connect after <i>any</i> version submission is withdrawn, rejected or replaced. The two are coupled and nothing tells you.", "Never let \"the store returned nothing\" and \"the purchase failed\" collapse into the same user-facing message."] },
    ],
  },
  {
    slug: "apple-development-certificate-expired-no-crash-logs",
    date: "2026-08-22",
    title: {
      en: "Every app I'd built died on the same morning, and there were no crash logs",
      zh: "某天早上我做的 app 全死了，而且一条崩溃日志都没有",
    },
    summary: {
      en: "Apps installed from Xcode stop launching with no crash report at all. The cause is an expired Apple Development certificate — not the provisioning profile, whose expiry date is different and misleading.",
      zh: "从 Xcode 装的 app 点开就退、连一条崩溃报告都没有。真凶是 Apple Development 证书过期 —— 不是描述文件，它的到期日是另一个数字，而且会把你带偏。",
    },
    body: [
      {
        t: "p",
        en: "One morning every app I had ever built stopped working on my own phone. Tap the icon, the splash screen flashes for a fraction of a second, and you're back on the home screen. Twelve of my apps were installed on that device. Eight of them were dead. Apps from the App Store were all fine.",
      },
      {
        t: "p",
        en: "The part that cost me the most time: <b>there were no crash logs.</b> Not in Xcode's Devices window, not in Settings → Privacy → Analytics Data, nowhere. I spent a while assuming the logs were being hidden from me somehow, because an app that disappears half a second after launch has obviously crashed.",
      },
      {
        t: "p",
        en: "It hadn't. That's the whole clue, and it took me too long to hear it.",
      },
      { t: "h2", en: "No crash log means the process never started" },
      {
        t: "p",
        en: "A crash report is written by the crash reporter inside a running process. If the system refuses to start the process at all, there is nothing to report and nothing gets written. An empty Analytics Data list isn't a missing log — it's the answer.",
      },
      {
        t: "p",
        en: "So instead of hunting for logs, launch the app from the command line, where the failure has to be reported to you as an exit status:",
      },
      {
        t: "code",
        lang: "bash",
        body: "xcrun devicectl device process launch \\\n  --device <DEVICE-UDID> com.yourcompany.yourapp",
        caption: {
          en: "Any launch path that returns an error works. The point is to get a code instead of a silent bounce.",
          zh: "任何会把错误码还给你的启动方式都行。重点是拿到一个码，而不是一次静默的弹回。",
        },
      },
      {
        t: "p",
        en: "The error that comes back is <code>errno 85 (ENEEDAUTH)</code> — “Need authenticator”. That is the system telling you the binary's code signature is no longer trusted on this device. It is not a bug in your app. Your app was never given the chance to run.",
      },
      { t: "h2", en: "The certificate expires, not the profile" },
      {
        t: "p",
        en: "Here is the trap that made this take hours instead of minutes. I went and checked the provisioning profile's expiry date, saw it was almost a year away, and crossed signing off the list. Wrong date.",
      },
      {
        t: "p",
        en: "A provisioning profile and the signing certificate embedded inside it have <b>two different expiry dates</b>. I just checked a profile on this machine, right now:",
      },
      {
        t: "code",
        lang: "bash",
        body: "DIR=~/Library/Developer/Xcode/UserData/\"Provisioning Profiles\"\nPROFILE=\"$DIR/<uuid>.mobileprovision\"\n\n# The profile's own expiry — the number that misled me\nsecurity cms -D -i \"$PROFILE\" | plutil -p - | grep ExpirationDate\n#   \"ExpirationDate\" => 2027-08-12\n\n# The certificate actually embedded in that same profile\nsecurity cms -D -i \"$PROFILE\" \\\n  | plutil -extract DeveloperCertificates.0 raw -o - - \\\n  | base64 -d | openssl x509 -inform DER -noout -dates\n#   notBefore=Aug 10 15:05:28 2026 GMT\n#   notAfter =Aug 10 15:05:27 2027 GMT",
        caption: {
          en: "Same profile. The certificate inside it expires two days before the profile does.",
          zh: "同一个描述文件。里面那张证书比它本身早到期两天。",
        },
      },
      {
        t: "p",
        en: "Two days apart here — it can be much further apart in practice, because the profile gets regenerated on its own schedule. Either way, the certificate is the one that stops your apps from launching, and it's the one nobody looks at.",
      },
      { t: "h2", en: "The one command worth remembering" },
      {
        t: "p",
        en: "Skip the profile entirely. Ask the keychain what your signing certificates are and when they run out:",
      },
      {
        t: "code",
        lang: "bash",
        body: "security find-identity -v -p codesigning\n\nsecurity find-certificate -c \"Apple Development\" -p -a \\\n  | openssl x509 -noout -dates -subject",
        caption: {
          en: "If notAfter is in the past, you've found it. Free Apple Development certificates last exactly one year.",
          zh: "notAfter 是过去时间就对上了。免费的 Apple Development 证书正好一年。",
        },
      },
      {
        t: "p",
        en: "Look at <code>notBefore</code> as well as <code>notAfter</code>. That start date is the anniversary your apps will die on, and knowing it is the difference between an annoying morning and a lost one.",
      },
      { t: "h2", en: "Fixing it, and the two things that go wrong while you do" },
      {
        t: "p",
        en: "The fix itself is unremarkable: let Xcode issue a new certificate, then rebuild and reinstall each app. Nothing is lost — app data on the device survives, because you are replacing the binary, not the container. But two things reliably get in the way.",
      },
      {
        t: "p",
        en: "<b>Xcode stops with “No Account for Team”.</b> Your Apple ID session has quietly expired along with the certificate. There is no way to script around it — open Settings → Accounts and sign in again by hand before anything else will work.",
      },
      {
        t: "p",
        en: "<b>Fixing one app does not mean the others are fixed.</b> The renewal can issue more than one certificate on the same day, and the earlier one gets revoked. Some of your projects will have embedded the good one and some the dead one, so they fail independently. Check the certificate inside each project's profile rather than assuming a single fix covered everything.",
      },
      {
        t: "note",
        en: "The practical lesson: when the first one breaks, sweep the whole device at once. I fixed them one at a time as I noticed them, which meant discovering the same problem eight separate times.",
      },
      { t: "h2", en: "What I do now" },
      {
        t: "ul",
        items: [
          "A calendar reminder on the certificate's <code>notBefore</code> date, one week early. It is a fixed annual event, so there is no excuse for being surprised by it.",
          "When an app installed from Xcode won't launch, run <code>security find-identity -v -p codesigning</code> before anything else. It takes two seconds and rules out the most likely cause.",
          "No crash log is information, not an absence of information. It narrows the problem to “the process never started”, which is a much smaller space to search.",
        ],
      },
      {
        t: "p",
        en: "None of this affects anyone who installed your app from the App Store — those builds are signed by Apple with a distribution certificate and keep working. It only hits the apps you side-load onto your own device, which, if you build things for yourself, is most of them.",
      },
    ],
  },
];

export function noteBySlug(slug: string): Note | undefined {
  return notes.find((n) => n.slug === slug);
}

export function formatNoteDate(iso: string, locale: Locale): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}
