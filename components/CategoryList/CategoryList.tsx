'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioItem } from '@/types/portfolio';
import ItemIcon from '@/components/ItemIcon/ItemIcon';
import styles from './CategoryList.module.css';

interface Props {
  items: PortfolioItem[];
  activeItemId: string;
  categoryId: string;
  onSelect: (id: string) => void;
}

export default function CategoryList({ items, activeItemId, categoryId, onSelect }: Props) {
  const ulRef = useRef<HTMLUListElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const el = ulRef.current;
    if (!el) return;
    const check = () => setCanScrollDown(el.scrollHeight > el.clientHeight + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  return (
    <div className={styles.list} role="listbox" aria-label="Items">
      <AnimatePresence mode="wait">
        <motion.ul
          ref={ulRef}
          key={categoryId}
          className={styles.ul}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {items.map((item, i) => {
            const isActive = item.id === activeItemId;
            return (
              <motion.li
                key={item.id}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                role="option"
                aria-selected={isActive}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isActive ? 1 : 0.42, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                onClick={() => onSelect(item.id)}
              >
                <span className={styles.iconWrap}>
                  {item.icon ? (
                    <ItemIcon type={item.icon} className={styles.icon} />
                  ) : (
                    <span className={styles.bullet}>{isActive ? '●' : '○'}</span>
                  )}
                </span>
                <span className={styles.text}>
                  <span className={styles.title}>{item.title}</span>
                  {isActive && (
                    <motion.span
                      className={styles.subtitle}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {item.subtitle}
                    </motion.span>
                  )}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </AnimatePresence>

      <AnimatePresence>
        {canScrollDown && (
          <motion.div
            className={styles.scrollHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          >
            ↓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
