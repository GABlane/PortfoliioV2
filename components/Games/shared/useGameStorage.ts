'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_NAMESPACE = 'pv2.games.';

function readValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_NAMESPACE + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useGameStorage<T>(
  key: string,
  fallback: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readValue(key, fallback));

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_NAMESPACE + key) return;
      try {
        setValue(event.newValue === null ? fallback : JSON.parse(event.newValue));
      } catch {
        setValue(fallback);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, fallback]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(STORAGE_NAMESPACE + key, JSON.stringify(resolved));
        } catch {
          // storage unavailable — in-memory only
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}
