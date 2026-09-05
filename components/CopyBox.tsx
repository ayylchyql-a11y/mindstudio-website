"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 带复制按钮的代码块 / 提示词块。
 *
 * 🩸 `navigator.clipboard` 在**非 HTTPS 且非 localhost** 下是 undefined，
 *    不是「调用失败」而是「属性根本不存在」—— 直接 `.writeText()` 会抛
 *    TypeError 把整个 React 树打崩。所以必须先判存在。
 *    （本站线上是 HTTPS、本地是 localhost，两边都有；但局域网 IP 预览时没有。）
 */
export default function CopyBox({
  body,
  label,
  copyLabel,
  doneLabel,
  variant = "code",
}: {
  body: string;
  label?: string;
  copyLabel: string;
  doneLabel: string;
  variant?: "code" | "prompt";
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(body);
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1600);
    } catch {
      /* 用户拒绝了剪贴板权限。按钮保持原状即可，不值得弹一个错误出来。 */
    }
  }

  return (
    <figure className={`fx-copybox fx-copybox-${variant}`}>
      <div className="fx-copybox-bar">
        {label ? <span className="fx-copybox-label">{label}</span> : <span />}
        <button type="button" onClick={copy} className={done ? "is-done" : undefined}>
          {done ? doneLabel : copyLabel}
        </button>
      </div>
      <pre>
        <code>{body}</code>
      </pre>
    </figure>
  );
}
