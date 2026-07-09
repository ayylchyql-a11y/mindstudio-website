import type { Localized } from "@/lib/i18n";

export interface LegalSection {
  heading: Localized;
  body: Localized[];
}

export interface PrivacyDoc {
  updated: Localized;
  intro: Localized;
  sections: LegalSection[];
}

const contactSection: LegalSection = {
  heading: { en: "Contact", zh: "联系我们" },
  body: [
    {
      en: "For any privacy-related question, email ayylchyql@gmail.com.",
      zh: "如有任何隐私相关问题，请联系 ayylchyql@gmail.com。",
    },
  ],
};

const childrenSection: LegalSection = {
  heading: { en: "Children's privacy", zh: "儿童隐私" },
  body: [
    {
      en: "The app is not directed to children under 13 and does not knowingly collect their personal information.",
      zh: "本 App 不面向 13 岁以下儿童，也不会有意收集儿童的个人信息。",
    },
  ],
};

const changesSection: LegalSection = {
  heading: { en: "Changes to this policy", zh: "政策变更" },
  body: [
    {
      en: "If this policy changes, we will post the revised version on this page and update the date above.",
      zh: "如本政策有更新，我们会在此页面发布修订后的版本，并更新上方日期。",
    },
  ],
};

export const privacy: Record<string, PrivacyDoc> = {
  budget: {
    updated: { en: "Last updated: June 26, 2026", zh: "最后更新：2026 年 6 月 26 日" },
    intro: {
      en: "M Budget keeps your finances private. The developer does not collect, upload, or sell any of your data — your records stay on your own device and in your own iCloud.",
      zh: "M Budget 尊重你的财务隐私。开发者不收集、不上传、不出售你的任何数据 —— 你的记录只保存在你自己的设备和你自己的 iCloud 中。",
    },
    sections: [
      {
        heading: { en: "Information we collect", zh: "我们收集的信息" },
        body: [
          {
            en: "The developer collects no data. M Budget has no analytics, advertising, or tracking SDKs. It only stores what you enter yourself — transactions, accounts, budgets, category names, an optional display name, and any receipt photos or voice notes you attach.",
            zh: "开发者不收集任何数据。M Budget 没有接入任何分析、广告或追踪 SDK，只保存你自己录入的内容 —— 交易、账户、预算、分类名、可选的显示名，以及你附加的收据照片或语音备注。",
          },
        ],
      },
      {
        heading: { en: "Storage & sync", zh: "数据存储与同步" },
        body: [
          {
            en: "Your data is stored locally on your device via Apple's SwiftData. If you are signed in to iCloud, it syncs between your own devices through Apple's CloudKit private database — held in your private iCloud storage, governed by Apple's privacy policy, and not accessible to the developer.",
            zh: "数据通过 Apple 的 SwiftData 存储在你的设备本地。若你登录了 iCloud，数据会通过 Apple 的 CloudKit 私有数据库在你自己的设备间同步 —— 存于你的私人 iCloud 空间，受 Apple 隐私政策管辖，开发者无法访问。",
          },
        ],
      },
      {
        heading: { en: "Exchange rates", zh: "货币汇率" },
        body: [
          {
            en: "To convert currencies, M Budget fetches public exchange rates from a third-party rates API. These are standard requests that contain none of your personal data.",
            zh: "为换算货币，M Budget 会从第三方汇率 API 获取公开的货币汇率。这些是标准请求，不包含任何你的个人数据。",
          },
        ],
      },
      {
        heading: { en: "Permissions", zh: "权限说明" },
        body: [
          {
            en: "Camera and Photos — to attach a receipt image to a transaction. Microphone — to record a voice note. Face ID / Touch ID — to lock the app. All permissions are optional and processed on-device.",
            zh: "相机与相册 —— 用于给交易附加收据图片。麦克风 —— 用于录制语音备注。Face ID / Touch ID —— 用于锁定 App。所有权限均为可选，且都在设备本地处理。",
          },
        ],
      },
      {
        heading: { en: "Data sharing & deletion", zh: "数据共享与删除" },
        body: [
          {
            en: "We never share your data with third parties, because we do not hold it. You can delete any record in the app at any time. Uninstalling removes local data; synced data can be cleared in system Settings → your name → iCloud.",
            zh: "我们从不与第三方共享你的数据，因为我们根本不持有它。你可以随时在 App 内删除任意记录。卸载会移除本地数据；同步数据可在系统「设置 → 你的姓名 → iCloud」中清除。",
          },
        ],
      },
      childrenSection,
      changesSection,
      contactSection,
    ],
  },

  relax: {
    updated: { en: "Last updated: July 4, 2026", zh: "最后更新：2026 年 7 月 4 日" },
    intro: {
      en: "M Alpha Relax is built to collect nothing. There is no account, no tracking, and no server that holds your data — you open it and it simply plays.",
      zh: "M Alpha Relax 天生零采集。没有账号、没有追踪，也没有存放你数据的服务器 —— 打开即用。",
    },
    sections: [
      {
        heading: { en: "Information we collect", zh: "我们收集的信息" },
        body: [
          {
            en: "None. M Alpha Relax has no account system and integrates no analytics, advertising, or tracking SDKs. It does not know who you are.",
            zh: "没有。M Alpha Relax 没有账号系统，也没有接入任何分析、广告或追踪 SDK。它不知道你是谁。",
          },
        ],
      },
      {
        heading: { en: "Your settings stay on device", zh: "你的设置留在设备上" },
        body: [
          {
            en: "Your preferences — chosen tones, mixer levels, timer and theme — are stored locally on your device. They never leave it.",
            zh: "你的偏好 —— 所选音调、混音比例、计时与主题 —— 都保存在你的设备本地，从不外传。",
          },
        ],
      },
      {
        heading: { en: "Audio", zh: "音频" },
        body: [
          {
            en: "All sound is generated or played on-device. The app plays audio only; it does not use the microphone and does not record anything.",
            zh: "所有声音都在设备本地生成或播放。App 只负责播放音频，不使用麦克风，也不录制任何内容。",
          },
        ],
      },
      childrenSection,
      changesSection,
      contactSection,
    ],
  },

  camera: {
    updated: { en: "Last updated: July 2026", zh: "最后更新：2026 年 7 月" },
    intro: {
      en: "M Double Camera records front and back at once, entirely on your device. The developer does not collect, upload, or sell any of your data, and the app has no servers of its own.",
      zh: "M Double Camera 在你的设备本地同时记录前后画面。开发者不收集、不上传、不出售你的任何数据，App 也没有自己的服务器。",
    },
    sections: [
      {
        heading: { en: "Information we collect", zh: "我们收集的信息" },
        body: [
          {
            en: "The developer collects no data. There are no analytics, advertising, or tracking SDKs. Your photos and videos are yours.",
            zh: "开发者不收集任何数据。没有接入任何分析、广告或追踪 SDK。你的照片和视频都属于你自己。",
          },
        ],
      },
      {
        heading: { en: "Permissions", zh: "权限说明" },
        body: [
          {
            en: "Camera — required to capture from the front and back lenses at the same time. Microphone — used to record audio while filming video. Photo Library — used only to save the photos and videos you create. Everything is processed on-device and nothing is uploaded.",
            zh: "相机 —— 用于同时调用前后镜头拍摄。麦克风 —— 录制视频时用于收录声音。相册 —— 仅用于保存你拍摄的照片和视频。全部在设备本地处理，不上传任何内容。",
          },
        ],
      },
      {
        heading: { en: "Where your captures go", zh: "你的拍摄内容去了哪里" },
        body: [
          {
            en: "The photos and videos you capture are saved to your own Photo Library. They are never sent to the developer or any third party.",
            zh: "你拍摄的照片和视频会保存到你自己的相册，绝不会发送给开发者或任何第三方。",
          },
        ],
      },
      childrenSection,
      changesSection,
      contactSection,
    ],
  },

  wallet: {
    updated: { en: "Last updated: June 26, 2026", zh: "最后更新：2026 年 6 月 26 日" },
    intro: {
      en: "M Card Wallet takes your privacy seriously. The developer does not collect, upload, or sell any of your data — it stays only on your own device and in your own iCloud.",
      zh: "M Card Wallet 高度重视你的隐私。开发者不收集、不上传、不出售你的任何数据 —— 它只保存在你自己的设备和你自己的 iCloud 中。",
    },
    sections: [
      {
        heading: { en: "Information we collect", zh: "我们收集的信息" },
        body: [
          {
            en: "The developer collects no data. The app has no servers of its own and no third-party analytics, advertising, or tracking SDKs. Everything you enter is stored only locally and in your iCloud.",
            zh: "开发者不收集任何数据。本 App 没有自己的服务器，也没有接入任何第三方分析、广告或追踪 SDK。你录入的所有内容仅保存在本地与你的 iCloud。",
          },
        ],
      },
      {
        heading: { en: "Storage & sync", zh: "数据存储与同步" },
        body: [
          {
            en: "The card information you add (brand, card number, member code, points, tier, expiry, tags, custom card art, bound locations) is stored in a local database. If signed in to iCloud, it syncs between your own devices via Apple's CloudKit private database and is not accessible to the developer.",
            zh: "你添加的卡片信息（品牌、卡号、会员码、积分、等级、到期日、标签、自定义卡面、绑定地点）保存在本地数据库中。若登录 iCloud，会通过 Apple 的 CloudKit 私有数据库在你自己的设备间同步，开发者无法访问。",
          },
        ],
      },
      {
        heading: { en: "Permissions", zh: "权限说明" },
        body: [
          {
            en: "Camera — to scan a card's barcode or QR code. Photos — to pick an image to detect a code or set a card logo. Location — to bring the right card forward near a saved store (used on-device only). Notifications — to deliver local arrival reminders. All are optional and can be turned off in Settings.",
            zh: "相机 —— 扫描卡片的条形码 / 二维码。相册 —— 选图识别条码或设置卡面 Logo。定位 —— 在你靠近已绑定的常用门店时把对应卡片推到前面（仅在设备本地使用）。通知 —— 发送本地的到店提醒。以上均为可选，可随时在系统设置中关闭。",
          },
        ],
      },
      {
        heading: { en: "Data sharing & deletion", zh: "数据共享与删除" },
        body: [
          {
            en: "We do not share your data with any third party, because we do not hold it. You can delete any card at any time (deletions sync to your iCloud). Uninstalling removes local data; synced data can be cleared in system Settings → your name → iCloud.",
            zh: "我们不会与任何第三方共享你的数据，因为我们根本不持有它。你可以随时删除任意卡片（删除会同步到你的 iCloud）。卸载会移除本地数据；同步数据可在系统「设置 → 你的姓名 → iCloud」中清除。",
          },
        ],
      },
      childrenSection,
      changesSection,
      contactSection,
    ],
  },

  secret: {
    updated: { en: "Last updated: June 28, 2026", zh: "最后更新：2026 年 6 月 28 日" },
    intro: {
      en: "HelloSecret is built to collect as little as possible. It is an anonymous space for sharing a thought, being understood, and letting it go.",
      zh: "HelloSecret 力求收集最少的信息。它是一个匿名空间 —— 分享一个念头，被理解，然后放下。",
    },
    sections: [
      {
        heading: { en: "What we do not collect", zh: "我们不收集什么" },
        body: [
          {
            en: "We never collect your name, email, phone number, contacts, photos, camera, microphone, or precise location. Sign in with Apple gives us only a stable anonymous identifier — we never receive your name or email.",
            zh: "我们绝不收集你的姓名、邮箱、电话、通讯录、照片、相机、麦克风或精确位置。「通过 Apple 登录」只给我们一个稳定的匿名标识 —— 我们永远拿不到你的姓名或邮箱。",
          },
        ],
      },
      {
        heading: { en: "What we store", zh: "我们存储什么" },
        body: [
          {
            en: "A random anonymous name, the date you joined, the secrets and replies you post (text only), your reactions, the users you block, reports you send, and your language preference.",
            zh: "一个随机的匿名昵称、你加入的日期、你发布的秘密与回复（仅文本）、你的共情反应、你屏蔽的用户、你发送的举报，以及你的语言偏好。",
          },
        ],
      },
      {
        heading: { en: "Content moderation", zh: "内容审核" },
        body: [
          {
            en: "Every secret is checked by automated keyword and AI moderation before it appears, to keep the space safe. Moderation processes only the text you choose to publish.",
            zh: "每一条秘密在显示前都会经过关键词与 AI 自动审核，以保持空间安全。审核只处理你选择发布的文本。",
          },
        ],
      },
      {
        heading: { en: "Service providers", zh: "服务提供方" },
        body: [
          {
            en: "We use trusted infrastructure to run the app: Supabase (database, authentication, hosting; servers in the European Union) and Anthropic (AI content moderation). Text you publish is sent to these providers only to store it and to check it for safety. We do not sell your data or use it for advertising.",
            zh: "我们使用可信的基础设施来运行 App：Supabase（数据库、认证、托管；服务器位于欧盟）与 Anthropic（AI 内容审核）。你发布的文本仅为存储和安全检查而发送给这些提供方。我们不出售你的数据，也不用于广告。",
          },
        ],
      },
      {
        heading: { en: "Public content, reports & safety", zh: "公开内容、举报与安全" },
        body: [
          {
            en: "Secrets and replies are visible to other users until they close — please don't share anything that could identify you or others. You can report any content and block any user from the post menu; reports stay anonymous. Offending content and accounts are removed, typically within 24 hours.",
            zh: "秘密与回复在关闭前对其他用户可见 —— 请不要分享任何可能识别你或他人的信息。你可以在帖子菜单中举报任意内容、屏蔽任意用户；举报保持匿名。违规内容与账号会被移除，通常在 24 小时内。",
          },
        ],
      },
      {
        heading: { en: "Your rights & deletion", zh: "你的权利与删除" },
        body: [
          {
            en: "You can delete your account at any time from within the app, which removes your profile and all of your secrets, replies, and reactions. You can also contact us to remove specific content or exercise your data rights.",
            zh: "你可以随时在 App 内删除账号，这会移除你的资料以及你所有的秘密、回复与反应。你也可以联系我们删除特定内容或行使你的数据权利。",
          },
        ],
      },
      childrenSection,
      changesSection,
      contactSection,
    ],
  },
};

export function getPrivacy(id: string): PrivacyDoc | undefined {
  return privacy[id];
}
