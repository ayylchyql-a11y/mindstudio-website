"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 一条效果的实时样板。
 *
 * 两件事值得说明：
 *
 * 1. **为什么是 iframe。** 本站没有 Tailwind，全局选择器很多（`* {}`、裸 `a {}`、
 *    裸 `footer {}`…）。效果代码直接进主文档会双向污染，而且往往是「一边看着好、
 *    另一边悄悄坏」那种。iframe 给每条效果一个干净文档，代价只是一次请求。
 *
 * 2. **为什么懒加载。** 一个分类页会并排放十几条效果，十几个 iframe 一起挂 =
 *    十几个文档 + 十几份动画在跑。所以进视口才挂，`rootMargin` 提前 200px 起手，
 *    滚到的时候已经好了。
 *
 * 3. **为什么有重播。** 进场类动效（逐字浮现、卡片展开）只播一次；没有重播按钮，
 *    这个库里一半的效果你只能看见一次。改 key 强制重新挂载 iframe = 干净重放，
 *    比往 iframe 里发消息可靠得多（那要求每个 demo 都实现同一套协议）。
 */
export default function EffectFrame({
  src,
  height,
  title,
  accent,
  replayLabel,
}: {
  src: string;
  height: number;
  title: string;
  accent: string;
  replayLabel: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    // 老浏览器没有 IntersectionObserver：直接显示，别让它看见一个空框
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="fx-frame" ref={holder} style={{ height }}>
      {visible ? (
        <iframe
          key={run}
          src={src}
          title={title}
          /* 🩸 **别加 `loading="lazy"`**。懒加载已经由上面的 IntersectionObserver
             做了；两套叠在一起时，Chrome 会把这个「动态插入且标了 lazy」的 iframe
             推迟到后续的布局帧才真正取，实测白框要 3~5 秒才填上 —— 页面不报错、
             控制台干净，看起来就像效果本身坏了。 */
          sandbox="allow-scripts"
          style={{ height }}
          onLoad={() => setLoaded(true)}
        />
      ) : null}
      {/* 占位层盖到 iframe 真的 load 完为止。一个纯白的空框跟「效果坏了」
          长得一模一样，所以这里必须看得出是「还没好」而不是「没有东西」。 */}
      {loaded ? null : (
        <div
          className="fx-poster"
          aria-hidden="true"
          style={{ background: `radial-gradient(120% 120% at 30% 0%, ${accent}1f, transparent 70%)` }}
        >
          <span className="fx-poster-bar" />
        </div>
      )}
      <button
        type="button"
        className="fx-replay"
        onClick={() => {
          setLoaded(false);
          setVisible(true);
          setRun((n) => n + 1);
        }}
      >
        {replayLabel}
      </button>
    </div>
  );
}
