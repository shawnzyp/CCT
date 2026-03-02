import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATE_CONFIG = {
  rising:    { color: '#00D1B2', Icon: TrendingUp },
  stable:    { color: '#00E5FF', Icon: Minus },
  declining: { color: '#FFC857', Icon: TrendingDown },
  crisis:    { color: '#FF3B3B', Icon: TrendingDown },
  dominant:  { color: '#A78BFA', Icon: TrendingUp },
};

export default function WidgetFactionPulse({ accentA, panel1, text0, text1, muted }) {
  const { data: factions = [] } = useQuery({
    queryKey: ['widget-factions'],
    queryFn: () => base44.entities.Faction.list('-global_influence', 5),
    staleTime: 60_000,
  });

  if (!factions.length) return <p className="text-[10px] font-mono text-center py-3" style={{ color: muted }}>NO FACTION DATA</p>;

  return (
    <div className="space-y-1.5">
      {factions.map(f => {
        const cfg = STATE_CONFIG[f.narrative_state] || STATE_CONFIG.stable;
        const { Icon } = cfg;
        const influence = f.global_influence ?? 50;
        return (
          <Link key={f.id} to={createPageUrl('Factions')}>
            <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:opacity-80 transition-all" style={{ background: panel1 }}>
              <Icon className="h-3 w-3 flex-shrink-0" style={{ color: cfg.color }} />
              <span className="flex-1 text-[10px] font-mono truncate font-bold" style={{ color: text1 }}>{f.short_name || f.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: panel1 }}>
                  <div className="h-full rounded-full" style={{ width: `${influence}%`, background: cfg.color }} />
                </div>
                <span className="text-[8px] font-mono" style={{ color: cfg.color }}>{influence}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}