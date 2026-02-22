import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const TRIGGER_THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children, className = '' }) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(null);
  const isPullingRef = useRef(false);

  const getScrollTop = useCallback(() => {
    const container = document.querySelector('[data-scroll-container]');
    return container ? container.scrollTop : window.scrollY;
  }, []);

  const onTouchStart = useCallback((e) => {
    if (getScrollTop() > 5) return;
    startYRef.current = e.touches[0].clientY;
  }, [getScrollTop]);

  const onTouchMove = useCallback((e) => {
    if (isRefreshing || startYRef.current === null) return;
    if (getScrollTop() > 5) {
      startYRef.current = null;
      return;
    }
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      isPullingRef.current = true;
      setPullY(Math.min(delta * 0.5, TRIGGER_THRESHOLD));
    }
  }, [isRefreshing, getScrollTop]);

  const onTouchEnd = useCallback(async () => {
    if (isRefreshing || !isPullingRef.current) return;
    if (pullY >= TRIGGER_THRESHOLD * 0.7) {
      setIsRefreshing(true);
      setPullY(0);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullY(0);
    }
    isPullingRef.current = false;
    startYRef.current = null;
  }, [pullY, isRefreshing, onRefresh]);

  const showIndicator = pullY > 5 || isRefreshing;
  const progress = Math.min(pullY / (TRIGGER_THRESHOLD * 0.7), 1);

  return (
    <div
      className={className}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            key="pull-indicator"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isRefreshing ? 44 : Math.max(pullY * 0.8, 8), opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 270 }}
              transition={isRefreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0.05 }}
            >
              <RefreshCw
                className="h-5 w-5"
                style={{ color: `rgba(139, 92, 246, ${0.3 + progress * 0.7})` }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}