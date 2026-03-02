import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, Users, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WidgetSessionStatus({ accentA, panel1, text0, text1, muted }) {
  const { data: sessions = [] } = useQuery({
    queryKey: ['widget-sessions-live'],
    queryFn: () => base44.entities.SessionLink.list('-created_date', 3),
    staleTime: 20_000,
  });

  const { data: presences = [] } = useQuery({
    queryKey: ['widget-presences'],
    queryFn: () => base44.entities.Presence.filter({ status: 'online' }, '-lastSeenAt', 20),
    staleTime: 15_000,
  });

  const activeSessions = sessions.filter(s => s.status === 'active');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Radio className={`h-3 w-3 ${activeSessions.length > 0 ? 'animate-pulse' : ''}`} style={{ color: activeSessions.length > 0 ? '#00D1B2' : muted }} />
        <span className="text-[10px] font-mono font-bold" style={{ color: activeSessions.length > 0 ? '#00D1B2' : muted }}>
          {activeSessions.length > 0 ? `${activeSessions.length} SESSION${activeSessions.length > 1 ? 'S' : ''} LIVE` : 'NO ACTIVE SESSIONS'}
        </span>
        {presences.length > 0 && <span className="ml-auto text-[9px] font-mono" style={{ color: muted }}><Users className="h-2.5 w-2.5 inline mr-0.5" />{presences.length} online</span>}
      </div>

      {activeSessions.map(s => (
        <Link key={s.id} to={createPageUrl(`AIGameSession?id=${s.sessionId}`)}>
          <div className="flex items-center gap-2 rounded px-2.5 py-2 hover:opacity-80 transition-all" style={{ background: panel1, border: `1px solid ${accentA}25` }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D1B2' }} />
            <span className="flex-1 text-[10px] font-mono truncate" style={{ color: text0 }}>{s.sessionName}</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#00D1B220', color: '#00D1B2' }}>JOIN</span>
          </div>
        </Link>
      ))}

      {activeSessions.length === 0 && (
        <p className="text-[9px] font-mono" style={{ color: muted }}>Director hasn't started a session yet.</p>
      )}
    </div>
  );
}