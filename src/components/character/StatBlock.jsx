import React from 'react';
import { cn } from "@/lib/utils";

const STAT_NAMES = {
  STR: 'Strength',
  DEX: 'Dexterity', 
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
};

const getModifier = (score) => {
  return Math.floor((score - 10) / 2);
};

const formatModifier = (mod) => {
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export default function StatBlock({ scores, compact = false }) {
  if (!scores) return null;
  
  const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  
  if (compact) {
    return (
      <div className="grid grid-cols-6 gap-1">
        {stats.map(stat => (
          <div key={stat} className="text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{stat}</div>
            <div className="text-sm font-bold text-white">{scores[stat] || 10}</div>
            <div className="text-xs text-violet-400">{formatModifier(getModifier(scores[stat] || 10))}</div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {stats.map(stat => {
        const score = scores[stat] || 10;
        const mod = getModifier(score);
        return (
          <div 
            key={stat} 
            className={cn(
              "relative bg-slate-800/50 rounded-xl p-3 text-center",
              "border border-slate-700/50 hover:border-violet-500/50 transition-colors"
            )}
          >
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{stat}</div>
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className={cn(
              "text-sm font-medium mt-1 px-2 py-0.5 rounded-full inline-block",
              mod >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            )}>
              {formatModifier(mod)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{STAT_NAMES[stat]}</div>
          </div>
        );
      })}
    </div>
  );
}

export { getModifier, formatModifier };