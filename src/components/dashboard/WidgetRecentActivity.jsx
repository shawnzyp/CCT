import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Swords, BookOpen, User, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcon = { Character: User, Campaign: BookOpen, GameEvent: Zap, CombatEncounter: Swords };

export default function WidgetRecentActivity({ accentA, panel1, text0, text1, muted }) {
  const { data: characters = [] } = useQuery({
    queryKey: ['widget-chars'],
    queryFn: () => base44.entities.Character.list('-updated_date', 3),
    staleTime: 60_000,
  });
  const { data: events = [] } = useQuery({
    queryKey: ['widget-events'],
    queryFn: () => base44.entities.GameEvent.list('-created_date', 3),
    staleTime: 60_000,
  });

  const items = [
    ...characters.map(c => ({ label: `Character updated: ${c.name}`, time: c.updated_date, type: 'Character' })),
    ...events.map(e => ({ label: `Event: ${e.type}`, time: e.created_date, type: 'GameEvent' })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-[10px] font-mono text-center py-4" style={{ color: muted }}>NO RECENT ACTIVITY</p>
      )}
      {items.map((item, i) => {
        const Icon = typeIcon[item.type] || Clock;
        return (
          <div key={i} className="flex items-center gap-2.5 rounded p-2" style={{ background: panel1 }}>
            <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentA }} />
            <span className="text-[10px] font-mono flex-1 truncate" style={{ color: text1 }}>{item.label}</span>
            <span className="text-[9px] font-mono flex-shrink-0" style={{ color: muted }}>
              {item.time ? formatDistanceToNow(new Date(item.time), { addSuffix: true }) : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}