import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Droplet, Wind, Sparkles, Swords, Shield, Target, Crosshair, Radio } from 'lucide-react';
import useSoundEffects from '@/components/sounds/useSoundEffects';

const effectIcons = {
  fire: Flame,
  lightning: Zap,
  ice: Droplet,
  wind: Wind,
  energy: Sparkles,
  physical: Swords,
  shield: Shield,
  psychic: Radio,
  elemental: Flame
};

const effectColors = {
  fire: { glow: 'shadow-orange-500/50', color: 'text-orange-400', bg: 'bg-orange-500/20', trail: 'from-orange-500 to-red-500' },
  lightning: { glow: 'shadow-violet-500/50', color: 'text-violet-400', bg: 'bg-violet-500/20', trail: 'from-violet-500 to-purple-500' },
  ice: { glow: 'shadow-cyan-500/50', color: 'text-cyan-400', bg: 'bg-cyan-500/20', trail: 'from-cyan-500 to-blue-500' },
  wind: { glow: 'shadow-green-500/50', color: 'text-green-400', bg: 'bg-green-500/20', trail: 'from-green-500 to-emerald-500' },
  energy: { glow: 'shadow-pink-500/50', color: 'text-pink-400', bg: 'bg-pink-500/20', trail: 'from-pink-500 to-purple-500' },
  physical: { glow: 'shadow-red-500/50', color: 'text-red-400', bg: 'bg-red-500/20', trail: 'from-red-500 to-orange-500' },
  shield: { glow: 'shadow-blue-500/50', color: 'text-blue-400', bg: 'bg-blue-500/20', trail: 'from-blue-500 to-cyan-500' },
  psychic: { glow: 'shadow-purple-500/50', color: 'text-purple-400', bg: 'bg-purple-500/20', trail: 'from-purple-500 to-pink-500' },
  elemental: { glow: 'shadow-amber-500/50', color: 'text-amber-400', bg: 'bg-amber-500/20', trail: 'from-amber-500 to-orange-500' }
};

// Attack targeting crosshair
export function TargetingReticle({ active, onComplete }) {
  if (!active) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Crosshair className="h-16 w-16 text-red-500" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute"
      >
        <Target className="h-24 w-24 text-red-500/50" strokeWidth={1} />
      </motion.div>
    </motion.div>
  );
}

// Enhanced attack effect with weapon trails
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
      {/* Shockwave ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.6 }}
        className={`absolute w-24 h-24 rounded-full border-4 border-${colors.color.split('-')[1]}-500`}
      />
      
      {/* Main icon */}
      <div className={`w-24 h-24 rounded-full ${colors.bg} flex items-center justify-center shadow-2xl ${colors.glow} relative overflow-hidden`}>
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${colors.trail} opacity-30`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <Icon className={`h-12 w-12 ${colors.color} relative z-10`} />
      </div>
      
      {/* Energy particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i / 6) * Math.PI * 2) * 80,
            y: Math.sin((i / 6) * Math.PI * 2) * 80,
          }}
          transition={{ duration: 0.6, delay: i * 0.05 }}
          className={`absolute w-2 h-2 rounded-full ${colors.bg} ${colors.glow}`}
        />
      ))}
    </motion.div>
  );
}

// Power usage with energy burst
export function PowerBurstEffect({ type = 'energy', onComplete }) {
  const colors = effectColors[type] || effectColors.energy;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      {/* Main burst */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 0] }}
        transition={{ duration: 0.8 }}
        className={`w-32 h-32 rounded-full bg-gradient-radial ${colors.trail} opacity-60`}
      />
      
      {/* Expanding rings */}
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1, delay }}
          className={`absolute w-16 h-16 rounded-full border-2 border-${colors.color.split('-')[1]}-500`}
        />
      ))}
    </motion.div>
  );
}

// Hit effect with damage number
export function HitEffect({ damage, isCritical, onComplete }) {
  return (
    <>
      <motion.div
        initial={{ y: 0, opacity: 1, scale: 1 }}
        animate={{ 
          y: -60,
          opacity: 0,
          scale: isCritical ? 2 : 1.5
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
      >
        <div className={`text-4xl font-bold font-mono drop-shadow-[0_0_10px_rgba(248,113,113,0.8)] ${
          isCritical ? 'text-orange-400' : 'text-red-400'
        }`}>
          -{damage}
          {isCritical && <span className="text-xl ml-1">CRIT!</span>}
        </div>
      </motion.div>
      
      {/* Impact flash */}
      <motion.div
        initial={{ opacity: 0.8, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-red-500/30 rounded-lg pointer-events-none"
      />
    </>
  );
}

// Heal effect with restoration glow
export function HealEffect({ amount, onComplete }) {
  return (
    <>
      <motion.div
        initial={{ y: 0, opacity: 1, scale: 1 }}
        animate={{ 
          y: -60,
          opacity: 0,
          scale: 1.5
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-50"
      >
        <div className="text-4xl font-bold text-green-400 font-mono drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
          +{amount}
        </div>
      </motion.div>
      
      {/* Healing pulse */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-green-500/20 rounded-lg pointer-events-none"
      />
      
      {/* Rising particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0.8, x: (i - 2) * 10 }}
          animate={{ y: -40, opacity: 0 }}
          transition={{ duration: 1, delay: i * 0.1 }}
          className="absolute bottom-0 left-1/2 w-1 h-1 bg-green-400 rounded-full pointer-events-none"
        />
      ))}
    </>
  );
}

// Active power glow effect
export function PowerGlow({ active, type = 'energy' }) {
  if (!active) return null;
  
  const colors = effectColors[type] || effectColors.energy;
  
  return (
    <>
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-lg ${colors.bg} pointer-events-none`}
      />
      
      {/* Scanning line */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r ${colors.trail} opacity-50 pointer-events-none`}
      />
    </>
  );
}

// Status condition visual indicator
export function ConditionEffect({ condition }) {
  const conditionColors = {
    stunned: 'text-yellow-400 bg-yellow-500/20',
    blinded: 'text-gray-400 bg-gray-500/20',
    poisoned: 'text-green-400 bg-green-500/20',
    frightened: 'text-purple-400 bg-purple-500/20',
    paralyzed: 'text-blue-400 bg-blue-500/20',
    burning: 'text-orange-400 bg-orange-500/20',
    frozen: 'text-cyan-400 bg-cyan-500/20',
    concentrating: 'text-violet-400 bg-violet-500/20'
  };
  
  const color = conditionColors[condition.name.toLowerCase()] || 'text-slate-400 bg-slate-500/20';
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${color} flex items-center justify-center z-10 border border-current`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-1 h-1 bg-current rounded-full"
      />
    </motion.div>
  );
}

// Shield activation effect
export function ShieldEffect({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 1 }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 pointer-events-none z-40"
    >
      <div className="absolute inset-0 rounded-lg border-4 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
      />
    </motion.div>
  );
}

// Critical hit explosion
export function CriticalEffect({ onComplete }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      {/* Star burst */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: (i * 45) }}
          animate={{ scale: [0, 1, 0], x: Math.cos((i / 8) * Math.PI * 2) * 100, y: Math.sin((i / 8) * Math.PI * 2) * 100 }}
          transition={{ duration: 0.6 }}
          className="absolute w-1 h-12 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-full"
          style={{ transformOrigin: 'center' }}
        />
      ))}
      
      {/* Center flash */}
      <motion.div
        animate={{ scale: [1, 2, 0], opacity: [1, 0.5, 0] }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-full bg-gradient-radial from-orange-400 to-red-500"
      />
    </motion.div>
  );
}

// Miss/Dodge effect
export function DodgeEffect({ onComplete }) {
  return (
    <motion.div
      initial={{ x: 0, opacity: 1 }}
      animate={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
    >
      <div className="text-2xl font-bold text-slate-400 font-mono">
        MISS
      </div>
    </motion.div>
  );
}