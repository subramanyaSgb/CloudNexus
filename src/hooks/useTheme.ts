'use client';

import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/stores/settings';
import type { Theme } from '@/types';

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const resolvedTheme = useResolvedTheme(theme);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [resolvedTheme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
  }, [theme, setTheme]);

  return { theme, resolvedTheme, setTheme, toggle };
}

function useResolvedTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'dark' || theme === 'light') return theme;

  // For system theme, check media query
  if (typeof window === 'undefined') return 'dark';

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  return mql.matches ? 'dark' : 'light';
}
