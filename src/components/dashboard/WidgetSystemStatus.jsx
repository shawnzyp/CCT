import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, WifiOff } from 'lucide-react';

function StatusRow({ label, status, accentA, muted, text1 }) {
  const color = status === 'ONLINE' ? '#00D1B2' : status === 'DEGRADED' ? '#FFC857' : '#FF3B3B';
  const Icon = status === 'ONLINE' ? CheckCircle : status === 'DEGRADED' ? AlertCircle : WifiOff;
  return (
    <div className="flex items-center justify-between text-[10px] font-mono py-1.5 border-b last:border-0" style={{ borderColor: accentA + '15' }}>
      <span style={{ color: text1 }}>{label}</span>
      <span className="flex items-center gap-1" style={{ color }}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    </div>
  );
}

export default function WidgetSystemStatus({ accentA, panel1, text0, text1, muted }) {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['widget-campaigns'],
    queryFn: () => base44.entities.Campaign.list('-updated_date', 1),
    staleTime: 60_000,
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['widget-sessions'],
    queryFn: () => base44.entities.SessionLink.list('-created_date', 1),
    staleTime: 30_000,
  });

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const rows = [
    { label: 'DATABASE', status: 'ONLINE' },
    { label: 'SYNC ENGINE', status: 'ONLINE' },
    { label: 'ACTIVE SESSIONS', status: activeSessions > 0 ? 'ONLINE' : 'STANDBY' },
    { label: 'CAMPAIGNS', status: activeCampaigns > 0 ? 'ONLINE' : 'STANDBY' },
  ];

  return (
    <div className="rounded p-2" style={{ background: panel1 }}>
      {rows.map(r => (
        <StatusRow key={r.label} {...r} accentA={accentA} muted={muted} text1={text1} />
      ))}
    </div>
  );
}