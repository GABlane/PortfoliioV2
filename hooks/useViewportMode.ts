'use client';

import { useState, useEffect } from 'react';
import type { ViewportMode } from '@/types/portfolio';

export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>('shell');

  useEffect(() => {
    const check = () => {
      setMode(window.innerWidth < 768 ? 'screen' : 'shell');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return mode;
}
