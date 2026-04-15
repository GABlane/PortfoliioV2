'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Theme } from '@/types/portfolio';

const STORAGE_KEY = 'psp-theme';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const manualOverrideRef = useRef(false);

  const applyTheme = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const hasSavedTheme = saved === 'dark' || saved === 'light';
    const initialTheme: Theme = hasSavedTheme ? (saved as Theme) : getSystemTheme();

    manualOverrideRef.current = hasSavedTheme;
    applyTheme(initialTheme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (manualOverrideRef.current) return;
      applyTheme(event.matches ? 'dark' : 'light');
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleSystemThemeChange);
      return () => media.removeEventListener('change', handleSystemThemeChange);
    }

    media.addListener(handleSystemThemeChange);
    return () => media.removeListener(handleSystemThemeChange);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    manualOverrideRef.current = true;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }, [theme, applyTheme]);

  return { theme, toggleTheme };
}
