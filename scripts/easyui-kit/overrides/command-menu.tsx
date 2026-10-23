// command-menu 的演示壳：原站把 CommandMenu 挂在整站外壳上（⌘K 打开），
// 演示区本身只有一行提示文字 —— 单独打包时等于什么都没有。这里把原版组件挂进来。
// 🩸 沙箱 iframe 里键盘事件要先让 iframe 拿到焦点，所以 ⌘K 标签也能点开。
import React, { useEffect, useState } from 'react';
import { CommandMenu } from '../../src/components/ui/CommandMenu';

export default function CommandMenuDemo() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="py-10 text-center">
      <p className="text-xs text-[#A1A1A1] mb-3">
        Press{' '}
        <button type="button" onClick={() => setOpen(true)} className="px-1.5 py-0.5 rounded bg-[#141414] border border-[#1F1F1F] font-mono text-white cursor-pointer">⌘K</button>
        {' '}anywhere on the page to open.
      </p>
      <CommandMenu isOpen={open} onClose={() => setOpen(false)} onSelectComponent={() => {}} onNavigateDocs={() => {}} />
    </div>
  );
}
