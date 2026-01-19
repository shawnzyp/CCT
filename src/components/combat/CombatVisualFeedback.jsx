import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ScreenFlash = ({ type, show }) => {
  if (!show) return null;

  const colors = {
    damage: 'bg-red-500',
    heal: 'bg-green-500',
    critical: 'bg-yellow-500',
    death: 'bg-black',
    levelup: 'bg-violet-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed inset-0 pointer-events-none z-50',
        colors[type] || 'bg-white'
      )}
    />
  );
};

export const FloatingDamageNumber = ({ value, type = 'damage', x, y, show }) => {
  if (!show) return null;

  const colors = {
    damage: 'text-red-500',
    heal: 'text-green-500',
    critical: 'text-yellow-500',
    sp: 'text-violet-500'
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className={cn(
        'fixed pointer-events-none z-50 font-bold text-4xl font-mono',
        colors[type] || 'text-white'
      )}
      style={{ left: x, top: y }}
    >
      {type === 'damage' ? `-${value}` : type === 'heal' ? `+${value}` : value}
    </motion.div>
  );
};

export const ShakeAnimation = ({ children, trigger }) => {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export const PulseGlow = ({ children, color = 'violet', active }) => {
  return (
    <motion.div
      animate={active ? {
        boxShadow: [
          `0 0 0px rgba(139, 92, 246, 0)`,
          `0 0 20px rgba(139, 92, 246, 0.6)`,
          `0 0 0px rgba(139, 92, 246, 0)`
        ],
        transition: { duration: 2, repeat: Infinity }
      } : {}}
      className="rounded-lg"
    >
      {children}
    </motion.div>
  );
};

export const CriticalHitEffect = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: [0, 1.2, 1], rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      <div className="text-yellow-400 font-bold text-9xl font-mono animate-pulse">
        CRIT!
      </div>
    </motion.div>
  );
};

export const DeathEffect = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.8] }}
      className="fixed inset-0 pointer-events-none z-50 bg-black/80 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="text-red-500 text-9xl"
      >
        💀
      </motion.div>
    </motion.div>
  );
};

export const ActionDeniedEffect = ({ message, show }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-red-900 border-2 border-red-500 rounded-lg px-6 py-3 text-white font-bold">
        ❌ {message}
      </div>
    </motion.div>
  );
};