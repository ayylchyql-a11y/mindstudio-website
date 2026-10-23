// 替身：src/lib/theme/useTheme 在设计库里不跟系统/localStorage 走。
// 🩸 原版挂载后会按系统偏好改成浅色并写进 localStorage；沙箱 iframe 里 localStorage
//    直接抛错，于是变成「跟访客系统走」。样板固定成原站预览默认的深色，
//    要看浅色加 ?theme=light。
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export interface ThemeContextValue { theme: Theme; setTheme: (t: Theme) => void; toggleTheme: () => void; }

function initial(): Theme {
  try { return new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}
function apply(t: Theme) {
  const r = document.documentElement;
  r.classList.toggle('dark', t === 'dark');
  r.style.colorScheme = t;
  document.body && (document.body.style.background = t === 'dark' ? '#18181B' : '#F1F1F2');
}

const Ctx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children?: ReactNode; initialTheme?: Theme }) {
  const [theme, set] = useState<Theme>(() => { const t = initial(); apply(t); return t; });
  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: (t) => { apply(t); set(t); },
    toggleTheme: () => set((p) => { const n = p === 'dark' ? 'light' : 'dark'; apply(n); return n; }),
  }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(Ctx) ?? { theme: initial(), setTheme: () => {}, toggleTheme: () => {} };
}
