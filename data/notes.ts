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
  | { t: "note"; en: string };

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
