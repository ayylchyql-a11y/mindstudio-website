// Mind Studio 设计库的挂载壳：把 EasyUI 原版 demo 原样渲染进一个独立页面。
// 外框复刻 easyui.site 预览区（dark 主题、卡片底 #18181B、画布 min-h 440 / p-8 居中）。
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../src/lib/theme/useTheme';
import { INLINE_DEMO_COMPONENTS } from '../src/components/docs/detail/inline-demo-registry';

export function mount(meta: any, Demo: React.ComponentType<any>) {
  const el = document.getElementById('root')!;
  const replay = () => root.render(tree(Date.now()));
  const tree = (key: number) => (
    <ThemeProvider initialTheme="dark">
      <div className="relative min-h-screen p-2 sm:p-8 flex items-center justify-center text-text-primary overflow-hidden">
        <div className="w-full flex items-center justify-center">
          <Suspense fallback={<div className="min-h-48 w-full flex items-center justify-center text-xs text-text-muted">Loading preview…</div>}>
            <Demo key={key} component={meta} demoKey={key} inlineDemos={INLINE_DEMO_COMPONENTS} />
          </Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
  const root = createRoot(el);
  root.render(tree(0));
  // 设计库外框的「重播」按钮会 postMessage('replay') 进来
  window.addEventListener('message', (e) => { if (e.data === 'replay') replay(); });
}
