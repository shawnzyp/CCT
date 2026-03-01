import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Flame, Wind, Droplets, Swords } from 'lucide-react';

// Map power style to visual effect color + icon
const POWER_FX = {
  physical_powerhouse: { color: '#FF6B35', icon: '👊', label: 'KINETIC' },
  energy_manipulator:  { color: '#00E5FF', icon: '⚡', label: 'ENERGY' },
  speedster:           { color: '#FFD700', icon: '💨', label: 'SPEED' },
  telekinetic_psychic: { color: '#A855F7', icon: '🔮', label: 'PSYCHIC' },
  illusionist:         { color: '#EC4899', icon: '✨', label: 'ILLUSION' },
  shape_shifter:       { color: '#22C55E', icon: '🌀', label: 'MORPH' },
  elemental_controller:{ color: '#F97316', icon: '🔥', label: 'ELEMENTAL' },
};

const ENV_FX = {
  urban:                { bg: 'from-slate-900 to-slate-800', particle: '#6B7280', label: 'CITY STREETS' },
  underground:          { bg: 'from-stone-900 to-stone-800', particle: '#78716C', label: 'UNDERGROUND' },
  rooftop:              { bg: 'from-blue-950 to-indigo-900', particle: '#818CF8', label: 'ROOFTOP' },
  'corporate HQ':       { bg: 'from-zinc-900 to-neutral-800', particle: '#A1A1AA', label: 'CORP HQ' },
  'port district':      { bg: 'from-cyan-950 to-teal-900', particle: '#06B6D4', label: 'PORT' },
  suburbs:              { bg: 'from-green-950 to-emerald-900', particle: '#34D399', label: 'SUBURBS' },
  'abandoned facility': { bg: 'from-gray-950 to-gray-900', particle: '#9CA3AF', label: 'RUINS' },
  'government building':{ bg: 'from-slate-950 to-blue-950', particle: '#93C5FD', label: 'GOV. BLDG' },
};

function StatusBadge({ effects = [], color }) {
  if (!effects.length) return null;
  return (
    <div className="flex flex-wrap gap-1 justify-center mt-1">
      {effects.map((e, i) => (
        <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase"
          style={{ background: color + '30', color, border: `1px solid ${color}50` }}>
          {e}
        </motion.span>
      ))}
    </div>
  );
}

function FloatingDamage({ damage, hit, side }) {
  return (
    <AnimatePresence>
      {damage !== null && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1.2 }}
          animate={{ opacity: 0, y: -40, scale: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 font-mono font-black text-lg pointer-events-none z-20"
          style={{ color: hit ? '#FF3B3B' : '#FFC857', textShadow: `0 0 12px ${hit ? '#FF3B3B' : '#FFC857'}` }}
        >
          {hit ? `-${damage}` : 'MISS!'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AttackBeam({ attacking, fromLeft, color, isCritical }) {
  return (
    <AnimatePresence>
      {attacking && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Main beam */}
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, transparent, ${color}, ${color}88)`, width: isCritical ? '60%' : '45%', marginLeft: fromLeft ? '5%' : isCritical ? '35%' : '50%' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.2 }}
          />
          {/* Secondary particle trail for critical */}
          {isCritical && (
            <motion.div
              className="absolute inset-0 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="h-3 rounded-full opacity-30" style={{ background: color, width: '70%', marginLeft: fromLeft ? '0' : '30%', filter: `blur(6px)` }} />
            </motion.div>
          )}
          {/* Screen flash on crit */}
          {isCritical && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.3 }}
              style={{ background: color }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EnvParticles({ color, active }) {
  if (!active) return null;
  return (
    <AnimatePresence>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ background: color, left: `${15 + i * 18}%`, top: '50%' }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: [-10, -40 - i * 10], x: [0, (i - 2) * 8] }}
            transition={{ duration: 0.8 + i * 0.1, delay: i * 0.06 }}
          />
        ))}
      </div>
    </AnimatePresence>
  );
}

export default function CombatArena({ charA, charB, hpA, hpB, maxHpA, maxHpB, currentAttacker, lastRound, environment, statusA = [], statusB = [] }) {
  const fxA = POWER_FX[charA?.primary_power_style] || { color: '#00E5FF', icon: '⚡', label: 'ENERGY' };
  const fxB = POWER_FX[charB?.primary_power_style] || { color: '#FF6B6B', icon: '💢', label: 'POWER' };
  const env = ENV_FX[environment] || ENV_FX['urban'];

  const hpPctA = Math.max(0, (hpA / maxHpA) * 100);
  const hpPctB = Math.max(0, (hpB / maxHpB) * 100);
  const hpColorA = hpPctA > 50 ? fxA.color : hpPctA > 25 ? '#FFC857' : '#FF3B3B';
  const hpColorB = hpPctB > 50 ? fxB.color : hpPctB > 25 ? '#FFC857' : '#FF3B3B';

  const lastHitA = lastRound?.attacker === charB?.name && lastRound?.hit;
  const lastHitB = lastRound?.attacker === charA?.name && lastRound?.hit;

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${env.bg} border border-white/10`} style={{ minHeight: 220 }}>
      {/* Environment label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest opacity-40 text-white z-10">{env.label}</div>

      {/* Attack beam */}
      <AttackBeam attacking={currentAttacker === 'A'} fromLeft color={fxA.color} />
      <AttackBeam attacking={currentAttacker === 'B'} fromLeft={false} color={fxB.color} />

      {/* Fighter A */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center w-28">
        <motion.div
          className="relative"
          animate={currentAttacker === 'A' ? { x: [0, 18, 0], rotate: [0, 5, 0] } : lastHitA ? { x: [0, -8, 0], rotate: [0, -4, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {charA?.portrait_url ? (
            <img src={charA.portrait_url} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: fxA.color }} alt="" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2" style={{ background: fxA.color + '20', borderColor: fxA.color }}>
              {fxA.icon}
            </div>
          )}
          {currentAttacker === 'A' && (
            <motion.div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ background: fxA.color }}
              animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.4 }}>
              ⚡
            </motion.div>
          )}
          <FloatingDamage damage={lastHitA ? lastRound.damage : (lastRound?.attacker === charB?.name && !lastRound?.hit ? 0 : null)} hit={lastHitA} side="a" />
        </motion.div>
        <div className="text-[10px] font-mono font-bold mt-1.5 text-center truncate w-full" style={{ color: fxA.color }}>{charA?.name}</div>
        <div className="w-full mt-1 h-1.5 rounded-full overflow-hidden bg-white/10">
          <motion.div className="h-full rounded-full" animate={{ width: `${hpPctA}%` }} transition={{ duration: 0.5 }} style={{ background: hpColorA }} />
        </div>
        <div className="text-[9px] font-mono mt-0.5" style={{ color: hpColorA }}>{hpA}/{maxHpA}</div>
        <StatusBadge effects={statusA} color={fxA.color} />
        <div className="text-[9px] font-mono mt-0.5 opacity-60 text-white">{fxA.label}</div>
      </div>

      {/* Center VS */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
          <Swords className="h-6 w-6 opacity-30 text-white" />
        </motion.div>
        <span className="text-[9px] font-mono text-white opacity-20 uppercase tracking-widest">VS</span>
      </div>

      {/* Fighter B */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center w-28">
        <motion.div
          className="relative"
          animate={currentAttacker === 'B' ? { x: [0, -18, 0], rotate: [0, -5, 0] } : lastHitB ? { x: [0, 8, 0], rotate: [0, 4, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {charB?.portrait_url ? (
            <img src={charB.portrait_url} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: fxB.color }} alt="" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2" style={{ background: fxB.color + '20', borderColor: fxB.color }}>
              {fxB.icon}
            </div>
          )}
          {currentAttacker === 'B' && (
            <motion.div className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ background: fxB.color }}
              animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.4 }}>
              ⚡
            </motion.div>
          )}
          <FloatingDamage damage={lastHitB ? lastRound.damage : (lastRound?.attacker === charA?.name && !lastRound?.hit ? 0 : null)} hit={lastHitB} side="b" />
        </motion.div>
        <div className="text-[10px] font-mono font-bold mt-1.5 text-center truncate w-full" style={{ color: fxB.color }}>{charB?.name}</div>
        <div className="w-full mt-1 h-1.5 rounded-full overflow-hidden bg-white/10">
          <motion.div className="h-full rounded-full" animate={{ width: `${hpPctB}%` }} transition={{ duration: 0.5 }} style={{ background: hpColorB }} />
        </div>
        <div className="text-[9px] font-mono mt-0.5" style={{ color: hpColorB }}>{hpB}/{maxHpB}</div>
        <StatusBadge effects={statusB} color={fxB.color} />
        <div className="text-[9px] font-mono mt-0.5 opacity-60 text-white">{fxB.label}</div>
      </div>
    </div>
  );
}