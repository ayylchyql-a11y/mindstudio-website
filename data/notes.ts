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
