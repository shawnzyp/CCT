import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Award, Swords, BookOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';

const eventTypeConfig = {
  mission_completed: { icon: CheckCircle2, color: '#00D1B2', label: 'Mission Completed' },
  mission_failed:    { icon: XCircle,      color: '#FF3B3B', label: 'Mission Failed' },
  achievement:       { icon: Award,        color: '#FFC857', label: 'Achievement' },
  level_up:          { icon: Swords,       color: '#9C27B0', label: 'Level Up' },
  journal:           { icon: BookOpen,     color: '#5CCFFF', label: 'Journal Entry' },
};

export default function CharacterHistoryLog({ character }) {
  const [filter, setFilter] = useState('all');

  // Fetch missions this character participated in
  const { data: missions = [] } = useQuery({
    queryKey: ['character-missions', character.id],
    queryFn: async () => {
      const all = await base44.entities.Mission.list('-updated_date', 50);
      return all.filter(m =>
        m.joined_character_ids?.includes(character.id) ||
        m.assigned_operative === character.id ||
        m.accepted_by?.includes(character.id)
      );
    },
    staleTime: 60 * 1000,
  });

  // Build unified history events
  const events = [];

  missions.forEach(m => {
    if (m.status === 'completed') {
      events.push({
        type: 'mission_completed',
        title: m.title,
        detail: `+${m.reward_xp || 0} XP · +${m.reward_credits || 0} Credits`,
        date: m.completed_at || m.updated_date,
        id: 'mc-' + m.id,
      });
    } else if (m.status === 'failed') {
      events.push({
        type: 'mission_failed',
        title: m.title,
        detail: m.objective || 'Mission failed',
        date: m.updated_date,
        id: 'mf-' + m.id,
      });
    }
  });

  // Achievements from character data
  (character.achievements || []).forEach((a, i) => {
    events.push({
      type: 'achievement',
      title: a.name || a.title || 'Achievement Unlocked',
      detail: a.description || '',
      date: a.earned_at || character.updated_date,
      id: 'ach-' + i,
    });
  });

  // Level ups from milestones
  (character.milestones || []).forEach((m, i) => {
    if (m.type === 'level_up') {
      events.push({
        type: 'level_up',
        title: `Reached Level ${m.level || '?'}`,
        detail: m.notes || '',
        date: m.date || character.updated_date,
        id: 'lvl-' + i,
      });
    }
  });

  // Journal entries (recent, brief)
  (character.player_journal || []).slice(0, 10).forEach((j, i) => {
    events.push({
      type: 'journal',
      title: j.title || 'Journal Entry',
      detail: (j.content || '').slice(0, 80) + ((j.content?.length || 0) > 80 ? '…' : ''),
      date: j.updated_at || j.date || character.updated_date,
      id: 'jrn-' + i,
    });
  });

  // Sort by date descending
  events.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'mission_completed', label: 'Completed' },
    { key: 'mission_failed', label: 'Failed' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'level_up', label: 'Level Ups' },
    { key: 'journal', label: 'Journal' },
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-violet-400" />
          History Log
        </CardTitle>
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-[10px] font-mono px-2 py-1 rounded-md transition-all"
              style={{
                background: filter === f.key ? '#7C3AED' : 'rgba(255,255,255,0.06)',
                color: filter === f.key ? '#fff' : '#8EA0B5',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-mono">No history events yet.</p>
            <p className="text-xs mt-1 opacity-70">Complete missions, earn achievements, and level up to populate your log.</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-700" />

            {filtered.map((ev, i) => {
              const cfg = eventTypeConfig[ev.type] || eventTypeConfig.journal;
              const Icon = cfg.icon;
              const dateStr = ev.date ? (() => {
                try { return format(new Date(ev.date), 'MMM d, yyyy'); } catch { return ''; }
              })() : '';

              return (
                <div key={ev.id} className="flex gap-4 pb-5 relative">
                  {/* Icon circle */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center z-10 border-2"
                    style={{ background: cfg.color + '22', borderColor: cfg.color + '60' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge
                          className="text-[9px] font-mono mb-1 px-1.5 py-0"
                          style={{ background: cfg.color + '22', color: cfg.color, border: 'none' }}
                        >
                          {cfg.label}
                        </Badge>
                        <div className="text-sm font-semibold text-white leading-tight">{ev.title}</div>
                        {ev.detail && (
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{ev.detail}</div>
                        )}
                      </div>
                      {dateStr && (
                        <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap flex-shrink-0">{dateStr}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}