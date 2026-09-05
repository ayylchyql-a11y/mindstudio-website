"use client";

import { useState } from "react";
import { labCopy } from "@/data/effects";
import { pick, type Locale } from "@/lib/i18n";

/**
 * 一条效果的实时样板。
 *
 * 🩸 **iframe 必须渲染在服务端 HTML 里** —— 别再用 IntersectionObserver 去挂它。
 *    之前那版是「进视口才插入 iframe」，于是样板要等完整一条链路才出得来：
 *    下载 JS 块 → React 水合 → useEffect → IO 回调 → 插入 iframe → 取文件 → 绘制。
 *    在用户机器上这一串要好几秒，中间就是一个灰盒子，看着像效果坏了（他就是这么
 *    报过来的）；JS 要是压根没跑，那就是永远的灰盒子。
 *    写进 SSR 标记后浏览器一解析就能开始取，`loading="lazy"` 由原生负责推迟屏外的。
 *
 * 🩸 `loading="lazy"` 只在**解析时就存在**的 iframe 上才好使。同样这个属性配上
 *    「动态插入」会被 Chrome 推迟到后续布局帧，实测白框 3~5 秒 —— 也就是说
 *    上面那个错误做法叠加这个属性，两层延迟是会累加的。
 *
 * 占位层压在 iframe **下面**，不靠 JS 移除：iframe 画出来（每个 demo 都有不透明
 * 背景）自然就盖住它。这样即使一行 JS 都没跑，用户看到的也是效果本身而不是骨架。
 */
export default function EffectFrame({
  src,
  height,
  title,
  accent,
  lang,
}: {
  src: string;
  height: number;
  title: string;
  accent: string;
  lang: Locale;
}) {
  // 重播：换 key 强制重新挂载 = 干净重放。比往 iframe 里发消息可靠得多
  // （那要求每个 demo 都实现同一套协议）。这是纯增强，没有 JS 也只是没有重播。
  const [run, setRun] = useState(0);

  return (
    <div className="fx-frame" style={{ height }}>
      <div
        className="fx-poster"
        aria-hidden="true"
        style={{ background: `radial-gradient(120% 120% at 30% 0%, ${accent}1f, transparent 70%)` }}
      >
        <span className="fx-poster-bar" />
      </div>
      <iframe
        key={run}
        src={src}
        title={title}
        loading="lazy"
        /* allow-scripts 是必须的(demo 带 JS)；不给 allow-same-origin，
           所以 demo 拿不到本站的 storage / cookie。这两个一起给等于没有沙箱。 */
        sandbox="allow-scripts"
        style={{ height }}
      />
      <button type="button" className="fx-replay" onClick={() => setRun((n) => n + 1)}>
        {pick(labCopy.replay, lang)}
      </button>
    </div>
  );
}
