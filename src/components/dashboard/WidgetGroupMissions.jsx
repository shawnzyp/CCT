import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, UserMinus, Target, Zap, Star, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function WidgetGroupMissions({ accentA, panel1, panel0, text0, text1, muted }) {
  const qc = useQueryClient();
  const [currentChar] = useState(() => { try { return JSON.parse(localStorage.getItem('currentCharacter') || 'null'); } catch { return null; } });

  const { data: missions = [] } = useQuery({
    queryKey: ['group-missions'],
    queryFn: () => base44.entities.Mission.filter({ is_community_mission: true }, '-created_date', 10),
    staleTime: 15_000,
  });

  // Also show missions where player has joined
  const { data: joinedMissions = [] } = useQuery({
    queryKey: ['joined-missions', currentChar?.id],
    queryFn: async () => {
      if (!currentChar) return [];
      const all = await base44.entities.Mission.list('-updated_date', 20);
      return all.filter(m => m.joined_character_ids?.includes(currentChar.id) || m.joined_player_emails?.includes(currentChar.created_by));
    },
    staleTime: 15_000,
    enabled: !!currentChar,
  });

  const joinMission = useMutation({
    mutationFn: async (mission) => {
      const charIds = [...(mission.joined_character_ids || [])];
      const emails = [...(mission.joined_player_emails || [])];
      if (currentChar && !charIds.includes(currentChar.id)) charIds.push(currentChar.id);
      const user = await base44.auth.me().catch(() => null);
      if (user && !emails.includes(user.email)) emails.push(user.email);
      return base44.entities.Mission.update(mission.id, { joined_character_ids: charIds, joined_player_emails: emails });
    },
    onSuccess: () => { qc.invalidateQueries(['group-missions']); qc.invalidateQueries(['joined-missions']); toast.success('Joined mission squad'); },
  });

  const leaveMission = useMutation({
    mutationFn: async (mission) => {
      const charIds = (mission.joined_character_ids || []).filter(id => id !== currentChar?.id);
      const user = await base44.auth.me().catch(() => null);
      const emails = (mission.joined_player_emails || []).filter(e => e !== user?.email);
      return base44.entities.Mission.update(mission.id, { joined_character_ids: charIds, joined_player_emails: emails });
    },
    onSuccess: () => { qc.invalidateQueries(['group-missions']); qc.invalidateQueries(['joined-missions']); toast.success('Left mission squad'); },
  });

  const allMissions = [...new Map([...missions, ...joinedMissions].map(m => [m.id, m])).values()];

  const isJoined = (m) => currentChar && (m.joined_character_ids || []).includes(currentChar.id);

  return (
    <div className="space-y-2">
      {allMissions.length === 0 && (
        <div className="text-center py-4">
          <Users className="h-6 w-6 mx-auto mb-1 opacity-30" style={{ color: muted }} />
          <p className="text-[10px] font-mono" style={{ color: muted }}>NO GROUP MISSIONS AVAILABLE</p>
          <p className="text-[9px] font-mono mt-1 opacity-60" style={{ color: muted }}>Mark a mission as "Community Mission" to enable group play</p>
        </div>
      )}
      {allMissions.map(m => {
        const joined = isJoined(m);
        const squadSize = (m.joined_character_ids || []).length;
        const maxSlots = m.max_players || 4;
        const StatusIcon = m.status === 'completed' ? CheckCircle : Clock;
        const statusColor = m.status === 'completed' ? '#00D1B2' : m.status === 'active' ? accentA : '#FFC857';
        return (
          <div key={m.id} className="rounded-lg border p-3" style={{ background: panel1, borderColor: joined ? accentA + '50' : accentA + '15' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <StatusIcon className="h-3 w-3 flex-shrink-0" style={{ color: statusColor }} />
                  <span className="text-[10px] font-mono font-bold truncate" style={{ color: text0 }}>{m.title}</span>
                </div>
                {m.objective && <p className="text-[9px] leading-snug line-clamp-1" style={{ color: muted }}>{m.objective}</p>}
              </div>
              {currentChar && m.status !== 'completed' && (
                <button
                  onClick={() => joined ? leaveMission.mutate(m) : joinMission.mutate(m)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[8px] font-mono font-bold flex-shrink-0 transition-all hover:opacity-80"
                  style={joined
                    ? { background: '#FF3B3B20', color: '#FF3B3B', border: `1px solid #FF3B3B40` }
                    : { background: accentA + '20', color: accentA, border: `1px solid ${accentA}40` }}
                >
                  {joined ? <><UserMinus className="h-3 w-3" /> LEAVE</> : <><UserPlus className="h-3 w-3" /> JOIN</>}
                </button>
              )}
            </div>

            {/* Party slots */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: maxSlots }).map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-sm border"
                    style={{ background: i < squadSize ? accentA + '60' : 'transparent', borderColor: i < squadSize ? accentA : muted + '40' }} />
                ))}
              </div>
              <span className="text-[8px] font-mono" style={{ color: muted }}>{squadSize}/{maxSlots} OPERATIVES</span>
              {m.reward_xp > 0 && <span className="ml-auto text-[8px] font-mono" style={{ color: '#FFC857' }}><Star className="h-2.5 w-2.5 inline mr-0.5" />{m.reward_xp} XP</span>}
              {m.reward_credits > 0 && <span className="text-[8px] font-mono" style={{ color: '#00D1B2' }}><Zap className="h-2.5 w-2.5 inline mr-0.5" />{m.reward_credits} CR</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}