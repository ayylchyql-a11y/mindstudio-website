"use client";

import { useEffect, useRef, useState } from "react";
import { labCopy } from "@/data/effects";
import { pick, type Locale } from "@/lib/i18n";

export interface PreviewSlide {
  slug: string;
  title: string;
  accent: string;
  /** 橱窗录屏 + 海报（public/lab-video/，见 data/effects.ts 的 videoPath/posterPath） */
  video: string;
  poster: string;
  /** 这条效果自己的详情页地址。录屏不可交互 → 整格可点。 */
  href: string;
}

const AUTO_MS = 8000;

/**
 * 预览框高度。**400 是量出来的、不是拍的**：14 条效果在 data/effects.ts 里
 * 各自声明的 height 中位数就是 400（9 条写 400，其余 260–380）。
 * 原来是 260 —— 取的是最小值，等于把大多数样板压扁着展示。
 * 🩸 所有样板的根容器都是 min-height:100vh / height:100%，在 iframe 里
 *    100vh 就是这个框的高度，所以它们跟着框长、多给高度不浪费，
 *    滚动类还能多露一截场景。
 * 🩸 没做成正方形（两列时 610×610）：那比任何样板需要的都高 200px，
 *    卡片会从 527 长到 737，代价是标题行要多滚 282px。
 */
const FRAME_H = 400;

/**
 * 总览页每张模块卡里那个轮播预览。
 *
 * 为什么是这里、而不是分类页：分类页是**查阅**（扫一遍找到我要的那条），
 * 轮播一次只给一条，等于逼人点十几次才知道库里有什么。总览页反过来 ——
 * 人还没决定进不进，需要的是「这个模块里大概是什么东西」，
 * 而那件事四个标题说不清楚，一个在动的样板一眼就说清了。
 *
 * 2026-09-20 起轮播里放的是**录屏**而不是 iframe（橱窗模式，lib/lab-gate.ts）：
 * 公开访客本来就拿不到 demo 文件（401），而且视频比 iframe 轻、也不会吞掉点击 ——
 * 整格可以是链接了。完整版树的总览页也用同一份录屏，不值得为它单独维护一套 iframe 轮播。
 *
 * 🩸 **只有一个 <video>，轮播是换它的 key，不是挂/卸十几个**。第一条是 SSR 出来的
 *    （带 poster），浏览器解析到就有画面；IntersectionObserver 在这里**只用来停计时器**。
 * 🩸 `muted` 要在挂载后再用 ref 设一次：React 的 muted 只设 DOM 属性不写 attribute，
 *    Safari 会当它有声、拒绝自动播放（EffectVideo 同一个坑）。
 */
export default function CategoryPreview({
  slides,
  lang,
  height = FRAME_H,
}: {
  slides: PreviewSlide[];
  lang: Locale;
  height?: number;
}) {
  const [i, setI] = useState(0);
  /** 用户自己点过 = 从此不再自动轮播。WCAG 2.2.2：超过 5 秒的自动轮播必须给得出停的办法 */
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // 只有滚到视口里的那张卡才在轮播。屏外的卡继续转是白烧电，
  // 而且用户回来时看到的是转了一半的随机一条，不如停在他离开时那条。
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (slides.length < 2 || taken || paused || !inView) return;
    if (typeof window !== "undefined"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [i, slides.length, taken, paused, inView]);

  const cur = slides[i] ?? slides[0];
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void v.play().catch(() => {});
  }, [cur?.slug]);
  if (!cur) return null;

  return (
    <div
      className="cat-preview"
      ref={box}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="cat-preview-frame" style={{ height }}>
        {/* 占位层压在视频下面，不靠 JS 移除：海报一画出来自然盖住。换页那一瞬间它兜住，看不到白闪。 */}
        <div
          className="cat-preview-poster"
          aria-hidden="true"
          style={{ background: `radial-gradient(120% 120% at 30% 0%, ${cur.accent}26, transparent 70%)` }}
        />
        <a className="cat-preview-link" href={cur.href} aria-label={cur.title}>
          <video
            key={cur.slug}
            ref={vid}
            className="cat-preview-video"
            src={cur.video}
            poster={cur.poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            style={{ height }}
          />
        </a>
      </div>

      {/* 底栏：当前这条的标题 + 圆点。只有一条时（分类里只有一件作品）也照样渲染标题，
          否则那格就是一段没名字的视频。 */}
      <div className="cat-preview-bar">
        <span className="cat-preview-name">{cur.title}</span>
        {slides.length > 1 && (
          <span className="cat-preview-dots" role="tablist" aria-label={pick(labCopy.previewOf, lang)}>
            {slides.map((s, n) => (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={`${pick(labCopy.goToSlide, lang)} ${s.title}`}
                className={n === i ? "on" : undefined}
                onClick={() => { setI(n); setTaken(true); }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
