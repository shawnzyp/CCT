import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const LEVEL_CFG = {
  critical: { color: '#FF3B3B', Icon: AlertCircle },
  high:     { color: '#FF8C00', Icon: AlertTriangle },
  moderate: { color: '#FFC857', Icon: AlertTriangle },
  low:      { color: '#00D1B2', Icon: Info },
};

export default function WidgetThreatTicker({ accentA, panel1, text0, text1, muted }) {
  const { data: threats = [] } = useQuery({
    queryKey: ['widget-threats'],
    queryFn: () => base44.entities.ThreatIntel.filter({ is_active: true }, '-created_date', 4),
    staleTime: 30_000,
  });

  if (!threats.length) return (
    <div className="flex items-center justify-center gap-2 py-3">
      <Radio className="h-3 w-3 animate-pulse" style={{ color: '#00D1B2' }} />
      <p className="text-[10px] font-mono" style={{ color: '#00D1B2' }}>ALL CLEAR — NO ACTIVE THREATS</p>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {threats.map(t => {
        const cfg = LEVEL_CFG[t.threat_level] || LEVEL_CFG.low;
        const { Icon } = cfg;
        return (
          <Link key={t.id} to={createPageUrl('ThreatIntel')}>
            <div className="flex items-start gap-2 rounded px-2 py-1.5 hover:opacity-80 transition-all" style={{ background: panel1 }}>
              <Icon className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono font-bold truncate" style={{ color: text1 }}>{t.title}</div>
                <div className="text-[9px] font-mono" style={{ color: muted }}>{t.source || 'UNKNOWN SOURCE'}</div>
              </div>
              <span className="text-[8px] font-mono flex-shrink-0" style={{ color: cfg.color }}>{t.threat_level.toUpperCase()}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}