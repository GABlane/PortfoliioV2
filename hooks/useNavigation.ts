'use client';

import { useState, useCallback, useRef } from 'react';
import type { NavigationState, PortfolioCategory } from '@/types/portfolio';
import { useNavSound } from './useNavSound';

export function useNavigation(categories: PortfolioCategory[]) {
  const { playMove, playTab, playSelect } = useNavSound();
  const [state, setState] = useState<NavigationState>({
    activeCategoryId: categories[0].id,
    activeItemId: categories[0].items[0].id,
    isTransitioning: false,
  });
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCategoryIndex = categories.findIndex(
    (c) => c.id === state.activeCategoryId,
  );
  const activeCategory = categories[activeCategoryIndex];
  const activeItemIndex = activeCategory.items.findIndex(
    (i) => i.id === state.activeItemId,
  );
  const activeItem = activeCategory.items[activeItemIndex];

  const startTransition = useCallback(() => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setState((s) => ({ ...s, isTransitioning: true }));
    transitionTimer.current = setTimeout(() => {
      setState((s) => ({ ...s, isTransitioning: false }));
    }, 320);
  }, []);

  const navigateLeft = useCallback(() => {
    if (activeCategoryIndex <= 0) return;
    const next = categories[activeCategoryIndex - 1];
    playTab();
    startTransition();
    setState({
      activeCategoryId: next.id,
      activeItemId: next.items[0].id,
      isTransitioning: true,
    });
  }, [activeCategoryIndex, categories, startTransition, playTab]);

  const navigateRight = useCallback(() => {
    if (activeCategoryIndex >= categories.length - 1) return;
    const next = categories[activeCategoryIndex + 1];
    playTab();
    startTransition();
    setState({
      activeCategoryId: next.id,
      activeItemId: next.items[0].id,
      isTransitioning: true,
    });
  }, [activeCategoryIndex, categories, startTransition, playTab]);

  const navigateUp = useCallback(() => {
    if (activeItemIndex <= 0) return;
    playMove();
    setState((s) => ({
      ...s,
      activeItemId: activeCategory.items[activeItemIndex - 1].id,
    }));
  }, [activeItemIndex, activeCategory, playMove]);

  const navigateDown = useCallback(() => {
    if (activeItemIndex >= activeCategory.items.length - 1) return;
    playMove();
    setState((s) => ({
      ...s,
      activeItemId: activeCategory.items[activeItemIndex + 1].id,
    }));
  }, [activeItemIndex, activeCategory, playMove]);

  const selectCategory = useCallback(
    (categoryId: string) => {
      const target = categories.find((c) => c.id === categoryId);
      if (!target) return;
      playSelect();
      startTransition();
      setState({
        activeCategoryId: target.id,
        activeItemId: target.items[0].id,
        isTransitioning: true,
      });
    },
    [categories, startTransition, playSelect],
  );

  const selectItem = useCallback((itemId: string) => {
    playSelect();
    setState((s) => ({ ...s, activeItemId: itemId }));
  }, [playSelect]);

  return {
    state,
    activeCategory,
    activeCategoryIndex,
    activeItem,
    activeItemIndex,
    navigateLeft,
    navigateRight,
    navigateUp,
    navigateDown,
    selectCategory,
    selectItem,
  };
}
