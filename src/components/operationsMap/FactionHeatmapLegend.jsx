// ── FACTION HEATMAP LEGEND ────────────────────────────────────────────────
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FACTION_ENTRIES = [
  { faction: 'OMNI',    color: '#00E5FF', label: 'O.M.N.I.' },
  { faction: 'PFV',     color: '#F59E0B', label: 'P.F.V.' },
  { faction: 'GREYLINE',color: '#64748B', label: 'Greyline' },
  { faction: 'CONCLAVE',color: '#8B5CF6', label: 'Conclave' },
  { faction: 'NEUTRAL', color: '#334155', label: 'Neutral' },
];

export default function FactionHeatmapLegend({ visible }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!visible) return null;

  return (
    <div
      className="absolute bottom-20 left-3 z-20 rounded-lg overflow-hidden shadow-xl"
      style={{
        background: 'color-mix(in srgb, var(--cc-panel0, #1A1F26) 92%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 18%, transparent)',
        backdropFilter: 'blur(8px)',
        minWidth: 130,
      }}
    >
      <button
        className="w-full flex items-center gap-2 px-2.5 py-1.5"
        onClick={() => setCollapsed(c => !c)}
      >
        <span className="text-[9px] font-mono uppercase tracking-widest flex-1 text-left"
          style={{ color: 'var(--cc-accent-a, #00E5FF)' }}>Influence</span>
        {collapsed
          ? <ChevronDown className="h-3 w-3" style={{ color: 'var(--cc-muted)' }} />
          : <ChevronUp className="h-3 w-3" style={{ color: 'var(--cc-muted)' }} />}
      </button>
      {!collapsed && (
        <div className="px-2.5 pb-2 space-y-1.5">
          {FACTION_ENTRIES.map(({ faction, color, label }) => (
            <div key={faction} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: color, opacity: 0.75, boxShadow: `0 0 4px ${color}60` }} />
              <span className="text-[10px] font-mono" style={{ color: 'var(--cc-text1, #8EA0B5)' }}>{label}</span>
            </div>
          ))}
          <div className="pt-1 border-t" style={{ borderColor: 'color-mix(in srgb, var(--cc-accent-a) 12%, transparent)' }}>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[0.2, 0.4, 0.6, 0.8, 1].map(o => (
                  <div key={o} className="w-2 h-2 rounded-sm"
                    style={{ background: `rgba(0,229,255,${o})` }} />
                ))}
              </div>
              <span className="text-[9px] font-mono" style={{ color: 'var(--cc-muted)' }}>intensity</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}