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
    updated: { en: "Last updated: November 15, 2026", zh: "最后更新：2026 年 11 月 15 日" },
    intro: {
      en: "M Budget (iPhone, iPad and Android) keeps your finances private. Your personal ledger stays on your own device and in your own cloud backup, needs no account, and is never uploaded to us. Only an Android shared ledger, if you choose to use one, is stored on our server so its members can sync it. We never sell your data or share it with advertisers.",
      zh: "M Budget（iPhone、iPad 与安卓）尊重你的财务隐私。你的个人账本只保存在你自己的设备和你自己的云备份里，不需要账号，也从不上传给我们。只有当你在安卓上主动使用共享账本时，那本共享账本才会存放在我们的服务器上，供成员之间同步。我们从不出售你的数据，也不与广告商共享。",
    },
    sections: [
      {
        heading: { en: "Information we collect", zh: "我们收集的信息" },
        body: [
          {
            en: "M Budget has no analytics, advertising, or tracking SDKs. It only stores what you enter yourself — transactions, accounts, budgets, category names, an optional display name, and any receipt photos or voice notes you attach.",
            zh: "M Budget 没有接入任何分析、广告或追踪 SDK，只保存你自己录入的内容 —— 交易、账户、预算、分类名、可选的显示名，以及你附加的收据照片或语音备注。",
          },
        ],
      },
      {
        heading: { en: "Storage, sync & backup", zh: "数据存储、同步与备份" },
        body: [
          {
            en: "iPhone / iPad: data is stored on your device with Apple's SwiftData. If you turn on iCloud sync, it syncs between your own devices through Apple's CloudKit private database and iCloud Drive backups — held in your private iCloud storage and not accessible to the developer.",
            zh: "iPhone / iPad：数据通过 Apple 的 SwiftData 存储在设备本地。若你开启 iCloud 同步，数据通过 Apple 的 CloudKit 私有数据库和 iCloud 云盘备份在你自己的设备间同步 —— 存于你的私人 iCloud 空间，开发者无法访问。",
          },
          {
            en: "Android: data is stored on your device in a local database. If Google backup is turned on in your system settings, Android backs up the app's data, encrypted, to your own Google account so it can be restored on a new phone. The developer cannot read these backups.",
            zh: "安卓：数据存储在设备本地数据库中。若你在系统设置里开启了 Google 备份，安卓会把 App 数据加密备份到你自己的 Google 账号，用于换机恢复。开发者无法读取这些备份。",
          },
        ],
      },
      {
        heading: { en: "Shared ledgers", zh: "共享账本" },
        body: [
          {
            en: "Shared ledgers are optional. On iPhone / iPad they use Apple iCloud sharing and are not stored on our server.",
            zh: "共享账本是可选功能。在 iPhone / iPad 上，共享账本使用 Apple iCloud 共享，不经过我们的服务器。",
          },
          {
            en: "On Android, creating or joining a shared ledger requires signing in with your email address. That ledger is stored on our server, operated for us by Supabase (database hosting in London, United Kingdom), encrypted in transit, and visible only to the members you invite. We store your email address (to sign you in), the display name and avatar you choose for the ledger, and the ledger's own records (transactions, accounts, categories, budgets and rules). Photos and voice notes are not uploaded. When the owner deletes a ledger its records are deleted from the server. To delete your account: in the app open Settings → My Shared Ledgers → Delete account — this immediately deletes your sign-in account and email address, every shared ledger you created, and your membership in other ledgers. If you no longer have the app, email ayylchyql@gmail.com from the address you signed in with and we will delete it within 30 days. iPhone and Android cannot join the same shared ledger.",
            zh: "在安卓上，新建或加入共享账本需要用邮箱登录。这本账本存放在我们的服务器上，由 Supabase 代为托管（数据库位于英国伦敦），传输加密，只有你邀请的成员能看到。我们会保存：你的邮箱（用于登录）、你在账本里设置的显示名和头像，以及这本共享账本自身的记录（交易、账户、分类、预算和规则）。照片和语音备注不会上传。账本创建者删除账本后，服务器上的记录随之删除。删除账号：在 App 里打开「设置 → 我的共享账本 → 删除账号」，会立即删除你的登录账号和邮箱、你创建的所有共享账本，以及你在别人账本里的成员身份。如果你已经没有这个 App，请用登录时的邮箱发信到 ayylchyql@gmail.com，我们会在 30 天内删除。iPhone 与安卓不能加入同一本共享账本。",
          },
        ],
      },
      {
        heading: { en: "Third-party services", zh: "第三方服务" },
        body: [
          {
            en: "Exchange rates come from ExchangeRate-API (open.er-api.com) and market prices from Yahoo Finance; these requests contain only currency codes or ticker symbols, never personal data. On iPhone / iPad the App Store lookup service is used to show what's new in an update. On Android, in-app purchases are processed by Google Play Billing — we never see your payment details.",
            zh: "汇率来自 ExchangeRate-API（open.er-api.com），行情来自 Yahoo Finance，这些请求只包含货币代码或证券代码，不含任何个人数据。在 iPhone / iPad 上会调用 App Store 查询接口显示更新说明。在安卓上，应用内购买由 Google Play 结算处理，我们看不到你的付款信息。",
          },
        ],
      },
      {
        heading: { en: "On-device AI", zh: "设备端 AI" },
        body: [
          {
            en: "AI entry, receipt scanning and spending insights run on your device — Apple Intelligence on iPhone / iPad, Gemini Nano on supported Android phones. Your text and images are not uploaded. Speech is recognized on the device whenever possible; otherwise the system speech service (Apple or Google) converts your voice to text. On Android these features use Google ML Kit: models are downloaded from Google on first use, and Google may collect anonymous usage statistics (never your text, images or financial records).",
            zh: "AI 记账、小票识别与消费洞察都在设备本地运行 —— iPhone / iPad 上用 Apple 智能，支持的安卓手机上用 Gemini Nano。你的文字和图片不会上传。语音尽量在设备上识别；设备不支持时，由系统语音服务（Apple 或 Google）转成文字。安卓上这些功能使用 Google ML Kit：模型首次使用时从 Google 下载，Google 可能收集匿名使用统计（绝不包括你的文字、图片或账目）。",
          },
        ],
      },
      {
        heading: { en: "Permissions", zh: "权限说明" },
        body: [
          {
            en: "Camera and Photos — to attach a receipt image (on Android through the system photo picker, so the app only sees the photos you choose). Microphone and speech recognition — for voice notes and voice entries. Notifications — for budget alerts and reminders. Face ID / Touch ID, fingerprint or face unlock — to lock the app. All permissions are optional.",
            zh: "相机与相册 —— 给交易附加收据图片（安卓上通过系统照片选择器，App 只能看到你选中的照片）。麦克风与语音识别 —— 语音备注与语音记账。通知 —— 预算提醒与到期提醒。Face ID / Touch ID、指纹或面容解锁 —— 锁定 App。所有权限均为可选。",
          },
        ],
      },
      {
        heading: { en: "Data sharing & deletion", zh: "数据共享与删除" },
        body: [
          {
            en: "We never sell or share your data with third parties. Your data only leaves your device when you choose: through your own iCloud or Google backup, or in a shared ledger, whose records are visible only to the members you invite. You can delete any record in the app at any time, or clear everything in Settings → Clear All Data. Uninstalling removes local data.",
            zh: "我们从不出售你的数据，也不与第三方共享。只有在你主动选择时数据才会离开设备：通过你自己的 iCloud 或 Google 备份，或者放进共享账本 —— 只有你邀请的成员能看到。你可以随时在 App 内删除任意记录，或在「设置 → 清除所有数据」中全部清空。卸载会移除本地数据。",
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

  emoji: {
    updated: { en: "Last updated: August 18, 2026", zh: "最后更新：2026 年 8 月 18 日" },
    intro: {
      en: "M Emoji runs entirely on your device. It has no network features at all — the developer collects nothing, uploads nothing, and sells nothing, because there is nowhere for your data to go.",
      zh: "M Emoji 完全在你的设备上运行，没有任何联网功能 —— 开发者不收集、不上传、不出售任何数据，因为你的数据根本没有地方可去。",
    },
    sections: [
      {
        heading: { en: "Information we collect", zh: "我们收集的信息" },
        body: [
          {
            en: "None. M Emoji has no analytics, advertising, or tracking SDKs, no account, and no server of its own. It never asks who you are.",
            zh: "没有。M Emoji 没有接入任何分析、广告或追踪 SDK，没有账号，也没有自己的服务器。它从不问你是谁。",
          },
        ],
      },
      {
        heading: { en: "Where your work is stored", zh: "作品存在哪里" },
        body: [
          {
            en: "Everything you make — the editable document and the finished sticker image — is written to storage on your own device, inside a container shared with the app's iMessage extension so the sticker panel can read it. Nothing is synced to iCloud or anywhere else. Deleting the app deletes all of it.",
            zh: "你做的一切 —— 可再编辑的作品文件和成品贴纸图 —— 都写在你自己设备的存储里，放在一个与本 App 的 iMessage 扩展共享的容器中，好让贴纸面板读得到。不同步到 iCloud，也不同步到别处。删掉 App 就一并删除。",
          },
        ],
      },
      {
        heading: { en: "The iMessage sticker panel", zh: "iMessage 贴纸面板" },
        body: [
          {
            en: "The bundled iMessage extension only reads the stickers already saved on this device and hands the one you tap to Messages. Sending is done by Apple's Messages app; the extension has no network access and sees nothing about your conversations.",
            zh: "随附的 iMessage 扩展只读取这台设备上已保存的贴纸，把你点选的那一张交给「信息」。发送由 Apple 的信息 App 完成；扩展不联网，也看不到你的任何对话内容。",
          },
        ],
      },
      {
        heading: { en: "Permissions", zh: "权限说明" },
        body: [
          {
            en: "M Emoji asks for one permission: add-only access to your photo library, used the moment you tap “Save to Photos” so the sticker can be written there. It cannot read, browse, or delete your existing photos. There is no camera, contacts, microphone, or location access.",
            zh: "M Emoji 只申请一个权限：相册的写入权限，仅在你点「存到相册」那一刻用来把贴纸写进去。它无法读取、浏览或删除你已有的照片。不使用相机、通讯录、麦克风与定位。",
          },
        ],
      },
      {
        heading: { en: "Purchases", zh: "购买" },
        body: [
          {
            en: "M Emoji Pro is a one-time purchase handled entirely by Apple's In-App Purchase. Apple processes the payment and tells the app only whether the purchase exists; the developer never sees your payment details or your Apple Account.",
            zh: "M Emoji Pro 是一次性买断，全程由 Apple 的 App 内购买处理。Apple 完成支付，只告诉 App「买过没有」这一件事；开发者看不到你的支付信息，也看不到你的 Apple 账户。",
          },
        ],
      },
      {
        heading: { en: "Artwork & third parties", zh: "素材与第三方" },
        body: [
          {
            en: "The parts are drawn by the developer. The emoji you can remix come from Microsoft's open-source Fluent Emoji set (MIT licence), bundled inside the app — they are not downloaded, and using them contacts no one. There are no other third-party components.",
            zh: "拼装部件由开发者绘制。可供改造的 emoji 底图来自微软开源的 Fluent Emoji（MIT 许可），已随 App 一起打包 —— 不需要下载，使用它们也不会联系任何人。除此之外没有其它第三方组件。",
          },
        ],
      },
      childrenSection,
      changesSection,
      contactSection,
    ],
  },
  roboss: {
    updated: { en: "Last updated: November 17, 2026", zh: "最后更新：2026 年 11 月 17 日" },
    intro: {
      en: "Roboss AI is a voice assistant. To answer you it uses Claude, an AI model made by Anthropic. This page explains what is sent where, what stays on your iPhone, and how to delete it.",
      zh: "Roboss AI 是一个语音助手，它用 Anthropic 公司的 AI 模型 Claude 来回答你。本页说明哪些数据发往哪里、哪些留在你的 iPhone 上，以及如何删除。",
    },
    sections: [
      {
        heading: { en: "Before anything is sent", zh: "发送之前" },
        body: [
          {
            en: "The first time you use Roboss it explains what is shared with Claude and asks for your permission (the box is not ticked for you). Without it, Roboss only does what needs no AI. You can withdraw the permission at any time in Settings → Privacy.",
            zh: "第一次使用时，Roboss 会说明哪些内容会发给 Claude，并征求你的同意（选框默认不勾）。不同意的话，Roboss 只做不需要 AI 的事。你可以随时在「设置 → 隐私」里撤回同意。",
          },
        ],
      },
      {
        heading: { en: "What is sent to the AI", zh: "发给 AI 的内容" },
        body: [
          {
            en: "When you ask something: the words you said or typed, the photos you choose to show it, the recent part of your conversation, and what Roboss reads on your iPhone to answer that question — for example your calendar events, reminders, alarms, the town you are in, the music playing, or the mail you ask about. It travels through the Roboss server to Anthropic (USA) and back. The server checks your subscription and counts usage; it does not keep the content.",
            zh: "你提问时，会发送：你说的或打的话、你选择给它看的照片、最近的一段对话，以及 Roboss 为回答这个问题在手机上读到的内容——比如日程、提醒、闹钟、你所在的城市、正在播放的音乐，或你问到的邮件。这些经 Roboss 服务器转发给 Anthropic（美国）再返回。服务器只核对订阅、统计用量，不保存内容。",
          },
          {
            en: "Anthropic does not use this data to train its models. It may keep it for a limited time to detect misuse, as described in Anthropic's privacy policy, then deletes it. Transfers to the USA rely on the European Commission's Standard Contractual Clauses.",
            zh: "Anthropic 不会用这些数据训练模型。按 Anthropic 隐私政策，它可能为防滥用保留一段有限的时间，之后删除。向美国的传输以欧盟委员会标准合同条款为依据。",
          },
        ],
      },
      {
        heading: { en: "What stays on your iPhone", zh: "留在 iPhone 上的" },
        body: [
          {
            en: "Your conversation, what Roboss remembers about you, your name, home and work, photos you showed it (kept for a week), translations, the mail list, settings and a diagnostic log are stored only on your iPhone. Speech is recognised on the device; Roboss's voice is made on the device. Your Gmail app password is kept in the iPhone's Keychain and only used to read your mail directly from Google.",
            zh: "你的对话、Roboss 记住的关于你的事、名字、家和公司地址、给它看过的照片（保留一周）、翻译、邮件列表、设置和诊断日志都只存在你的 iPhone 上。语音在手机上识别，Roboss 的声音也在手机上合成。Gmail 应用专用密码存在 iPhone 钥匙串里，只用来直接从 Google 读取你的邮件。",
          },
        ],
      },
      {
        heading: { en: "Your account", zh: "你的账号" },
        body: [
          {
            en: "You sign in with Apple. We receive an identifier for the app and, only if you choose to share it, an email address. We store that identifier, your subscription status (from Apple) and how many requests you made, to apply your plan. Payments are handled entirely by Apple; we never see your payment details.",
            zh: "使用「通过 Apple 登录」。我们收到一个本 App 专用的标识，只有你选择分享时才会收到邮箱。我们保存这个标识、你的订阅状态（来自 Apple）和请求次数，用于执行你的套餐。付款全部由 Apple 处理，我们看不到你的支付信息。",
          },
        ],
      },
      {
        heading: { en: "Other services Roboss uses", zh: "Roboss 用到的其他服务" },
        body: [
          {
            en: "Apple: weather (WeatherKit), maps, places and routes (MapKit), song recognition (ShazamKit) and, when on-device recognition is unavailable, Apple's speech recognition. Google: only if you connect your Gmail, to read and send your own mail. OpenFreeMap: the building outlines of the 3D city during navigation (requests reveal the area being shown). Roboss has no advertising and no analytics or tracking SDKs.",
            zh: "Apple：天气（WeatherKit）、地图、地点和路线（MapKit）、听歌识曲（ShazamKit），以及手机本地识别不可用时 Apple 的语音识别。Google：只有你连接 Gmail 时，用来读取和发送你自己的邮件。OpenFreeMap：导航时 3D 城市的楼宇轮廓（请求会透露显示的区域）。Roboss 没有广告，也没有任何分析或追踪 SDK。",
          },
        ],
      },
      {
        heading: { en: "Permissions", zh: "权限说明" },
        body: [
          {
            en: "Microphone and speech recognition — to hear you while Roboss is open. Location — for local weather, places and navigation. Calendars and Reminders — to read and, after you confirm, change them. Apple Music, Camera, Photos and Notifications — only when you use those features. Every permission is optional.",
            zh: "麦克风和语音识别——Roboss 打开时听你说话。定位——本地天气、地点和导航。日历和提醒事项——读取，并在你确认后修改。Apple Music、相机、相册和通知——只在你用到这些功能时。所有权限都可以不开。",
          },
        ],
      },
      {
        heading: { en: "Deleting your data", zh: "删除你的数据" },
        body: [
          {
            en: "In the app, Settings → Privacy → Delete all my data erases the conversation, memories, profile, photos, translations, mail cache and log on your iPhone, and deletes your account and usage records from the Roboss server. Deleting the app removes everything stored on the iPhone. You can also email us to delete your account.",
            zh: "在 App 里「设置 → 隐私 → 删除我的全部数据」会清除 iPhone 上的对话、记忆、个人资料、照片、翻译、邮件缓存和日志，并从 Roboss 服务器删除你的账号和用量记录。删除 App 会清除手机上的全部数据。也可以发邮件让我们删除账号。",
          },
          {
            en: "If you are in the EU you have the right to access, correct, delete and port your data and to object to its processing; you can also complain to your data protection authority.",
            zh: "如果你在欧盟，你有权访问、更正、删除和导出你的数据，并可反对处理；也可以向数据保护机构投诉。",
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
