import React from 'react';
import { cn } from '@/lib/utils';
import { FACTION_THEMES } from './themeEngine';
import { useTheme } from './useTheme';
import { Check } from 'lucide-react';

export default function ThemeSwitcher() {
  const { factionId, setFaction, mode, setUiMode } = useTheme();

  return (
    <div className="space-y-4">
      {/* Faction Theme Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.values(FACTION_THEMES).map(t => {
          const active = factionId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setFaction(t.id)}
              className="relative p-3 text-left transition-all rounded-lg border"
              style={{
                background: t.colors.panel0,
                borderColor: active ? t.colors.accentA : t.colors.accentA + '25',
                boxShadow: active && t.hud.glowIntensity !== 'none' ? t.hud.glowIntensity : 'none',
                borderRadius: t.hud.panelRadius,
              }}
            >
              {active && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full flex items-center justify-center"
                  style={{ background: t.colors.accentA }}>
                  <Check className="h-2.5 w-2.5 text-black" />
                </div>
              )}
              {/* Accent swatch */}
              <div className="flex gap-1 mb-2">
                <div className="h-2 w-6 rounded-full" style={{ background: t.colors.accentA }} />
                <div className="h-2 w-3 rounded-full" style={{ background: t.colors.accentB }} />
              </div>
              <div className="text-xs font-bold tracking-wide" style={{ color: t.colors.text0 }}>{t.name}</div>
              <div className="text-[10px] mt-0.5" style={{ color: t.colors.muted }}>{t.faction}</div>
            </button>
          );
        })}
      </div>

      {/* Mode Toggle */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ borderColor: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 30%, transparent)', background: 'var(--cc-panel0)' }}
      >
        <div className="flex">
          {['field', 'command'].map(m => (
            <button
              key={m}
              onClick={() => setUiMode(m)}
              className="flex-1 py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.12em] transition-all"
              style={mode === m
                ? { background: 'var(--cc-accent-a)', color: '#000' }
                : { background: 'transparent', color: 'var(--cc-muted)' }
              }
            >
              {m} Mode
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}