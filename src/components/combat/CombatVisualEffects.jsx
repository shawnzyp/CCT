import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Droplet, Wind, Sparkles, Swords, Shield } from 'lucide-react';

const effectIcons = {
  fire: Flame,
  lightning: Zap,
  ice: Droplet,
  wind: Wind,
  energy: Sparkles,
  physical: Swords,
  shield: Shield
};

const effectColors = {
  fire: { glow: 'shadow-orange-500/50', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  lightning: { glow: 'shadow-violet-500/50', color: 'text-violet-400', bg: 'bg-violet-500/20' },
  ice: { glow: 'shadow-cyan-500/50', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  wind: { glow: 'shadow-green-500/50', color: 'text-green-400', bg: 'bg-green-500/20' },
  energy: { glow: 'shadow-pink-500/50', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  physical: { glow: 'shadow-red-500/50', color: 'text-red-400', bg: 'bg-red-500/20' },
  shield: { glow: 'shadow-blue-500/50', color: 'text-blue-400', bg: 'bg-blue-500/20' }
};

export function AttackEffect({ type = 'physical', onComplete }) {
  const Icon = effectIcons[type] || Swords;
  const colors = effectColors[type] || effectColors.physical;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        rotate: [0, 360]
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <div className={`w-24 h-24 rounded-full ${colors.bg} flex items-center justify-center shadow-2xl ${colors.glow}`}>
        <Icon className={`h-12 w-12 ${colors.color}`} />
      </div>
    </motion.div>
  );
}

export function HitEffect({ damage, onComplete }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ 
        y: -50,
        opacity: 0,
        scale: 1.5
      }}
      transition={{ duration: 1, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
    >
      <div className="text-3xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]">
        -{damage}
      </div>
    </motion.div>
  );
}

export function HealEffect({ amount, onComplete }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ 
        y: -50,
        opacity: 0,
        scale: 1.5
      }}
      transition={{ duration: 1, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
    >
      <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
        +{amount}
      </div>
    </motion.div>
  );
}

export function PowerGlow({ active, type = 'energy' }) {
  if (!active) return null;
  
  const colors = effectColors[type] || effectColors.energy;
  
  return (
    <motion.div
      animate={{ 
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.05, 1]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`absolute inset-0 rounded-lg ${colors.bg} pointer-events-none`}
    />
  );
}