import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Target, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STATUS_COLOR = { completed: '#00D1B2', active: '#00E5FF', in_progress: '#00E5FF', failed: '#FF3B3B', pending: '#FFC857' };
const STATUS_ICON = { completed: CheckCircle, active: Clock, in_progress: Clock, failed: XCircle, pending: Target };

export default function WidgetMissionFeed({ accentA, panel1, text0, text1, muted }) {
  const { data: missions = [] } = useQuery({
    queryKey: ['widget-missions'],
    queryFn: () => base44.entities.Mission.list('-updated_date', 6),
    staleTime: 30_000,
  });

  if (!missions.length) return <p className="text-[10px] font-mono text-center py-3" style={{ color: muted }}>NO MISSIONS ON RECORD</p>;

  return (
    <div className="space-y-1.5">
      {missions.map(m => {
        const color = STATUS_COLOR[m.status] || muted;
        const Icon = STATUS_ICON[m.status] || Target;
        return (
          <Link key={m.id} to={createPageUrl('Missions')}>
            <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:opacity-80 transition-all" style={{ background: panel1 }}>
              <Icon className="h-3 w-3 flex-shrink-0" style={{ color }} />
              <span className="flex-1 text-[10px] font-mono truncate" style={{ color: text1 }}>{m.title}</span>
              {(m.joined_player_emails?.length || 0) > 0 && (
                <span className="flex items-center gap-0.5 text-[8px] font-mono" style={{ color: muted }}>
                  <Users className="h-2.5 w-2.5" />{m.joined_player_emails.length}
                </span>
              )}
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: color + '20', color }}>{m.status.toUpperCase()}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}