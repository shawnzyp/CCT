import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function WidgetKPI({ accentA, panel1, text0, text1, muted }) {
  const { data: characters = [] } = useQuery({
    queryKey: ['widget-kpi-chars'],
    queryFn: () => base44.entities.Character.list('-created_date', 50),
    staleTime: 120_000,
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ['widget-kpi-camps'],
    queryFn: () => base44.entities.Campaign.list('-created_date', 50),
    staleTime: 120_000,
  });

  const avgLevel = characters.length
    ? (characters.reduce((s, c) => s + (c.level || 1), 0) / characters.length).toFixed(1)
    : '—';

  const kpis = [
    { label: 'OPERATIVES', value: characters.length },
    { label: 'CAMPAIGNS', value: campaigns.length },
    { label: 'AVG LEVEL', value: avgLevel },
    { label: 'ACTIVE CAMPS', value: campaigns.filter(c => c.status === 'active').length },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {kpis.map(k => (
        <div key={k.label} className="rounded p-3 text-center" style={{ background: panel1 }}>
          <div className="text-lg font-mono font-bold" style={{ color: accentA }}>{k.value}</div>
          <div className="text-[9px] font-mono tracking-widest mt-0.5" style={{ color: muted }}>{k.label}</div>
        </div>
      ))}
    </div>
  );
}