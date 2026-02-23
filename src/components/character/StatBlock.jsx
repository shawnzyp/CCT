import React from 'react';
import { useTheme } from '@/components/theme/useTheme';

const STAT_NAMES = {
  STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution',
  INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma'
};

export const getModifier = (score) => Math.floor(((score || 10) - 10) / 2);
export const formatModifier = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

export default function StatBlock({ scores, compact = false }) {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  if (!scores) return null;
  const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  if (compact) {
    return (
      <div className="grid grid-cols-6 gap-1">
        {stats.map(stat => {
          const score = scores[stat] || 10;
          const mod = getModifier(score);
          return (
            <div key={stat} className="text-center rounded border py-1.5" style={{ background: panel1, borderColor: accentA + '18' }}>
              <div className="text-[9px] font-mono uppercase tracking-wider" style={{ color: muted }}>{stat}</div>
              <div className="text-sm font-mono font-bold" style={{ color: text0 }}>{score}</div>
              <div className="text-[10px] font-mono font-bold" style={{ color: accentA }}>{formatModifier(mod)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {stats.map(stat => {
        const score = scores[stat] || 10;
        const mod = getModifier(score);
        const modPositive = mod >= 0;
        return (
          <div
            key={stat}
            className="relative rounded-lg border p-2.5 text-center overflow-hidden"
            style={{ background: panel1, borderColor: accentA + '22' }}
          >
            <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: muted }}>{stat}</div>
            <div className="text-2xl font-mono font-bold leading-none" style={{ color: text0 }}>{score}</div>
            <div
              className="text-xs font-mono font-bold mt-1.5 rounded-sm px-1.5 py-0.5 inline-block"
              style={{
                background: modPositive ? (c.success || '#00D1B2') + '22' : (c.danger || '#FF3B3B') + '22',
                color: modPositive ? (c.success || '#00D1B2') : (c.danger || '#FF3B3B'),
              }}
            >
              {formatModifier(mod)}
            </div>
            <div className="text-[9px] font-mono mt-1 truncate" style={{ color: muted }}>{STAT_NAMES[stat]}</div>
          </div>
        );
      })}
    </div>
  );
}