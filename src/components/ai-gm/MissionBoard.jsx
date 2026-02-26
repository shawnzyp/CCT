import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Plus, CheckCircle, Clock, Zap, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function MissionBoard({ campaign_id, character_id, accentA, panel0, panel1, text0, text1, muted }) {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter] = useState('available');
  const [selectedMission, setSelectedMission] = useState(null);

  useEffect(() => {
    const loadMissions = async () => {
      const m = await base44.entities.Mission.filter({ campaign_id }, '-created_date');
      setMissions(m);
    };
    loadMissions();
  }, [campaign_id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.Mission.subscribe((event) => {
      if (event.data?.campaign_id !== campaign_id) return;
      setMissions(prev => {
        if (event.type === 'create') return [event.data, ...prev];
        if (event.type === 'update') return prev.map(m => m.id === event.data.id ? event.data : m);
        if (event.type === 'delete') return prev.filter(m => m.id !== event.id);
        return prev;
      });
    });
    return unsub;
  }, [campaign_id]);

  const handleAccept = async (mission) => {
    if (!mission.accepted_by?.includes(character_id)) {
      await base44.entities.Mission.update(mission.id, {
        accepted_by: [...(mission.accepted_by || []), character_id],
        status: 'accepted'
      });
    }
  };

  const filtered = missions.filter(m => {
    if (filter === 'available') return m.status === 'available';
    if (filter === 'accepted') return m.accepted_by?.includes(character_id);
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  const diffColor = {
    easy: '#00D1B2',
    medium: '#FFC857',
    hard: '#FF6B6B',
    deadly: '#FF3B3B'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scroll className="h-4 w-4" style={{ color: accentA }} />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: text0 }}>Mission Board</span>
        </div>
        <div className="flex gap-2">
          {['available', 'accepted', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2 py-1 rounded text-[9px] font-mono uppercase transition-all"
              style={{
                background: filter === f ? accentA + '30' : 'transparent',
                color: filter === f ? accentA : muted,
                border: `1px solid ${filter === f ? accentA + '50' : accentA + '15'}`
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filtered.map((mission) => (
            <motion.button
              key={mission.id}
              onClick={() => setSelectedMission(mission)}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full text-left p-3 rounded-lg border transition-all hover:opacity-80"
              style={{
                background: selectedMission?.id === mission.id ? panel1 : 'transparent',
                borderColor: selectedMission?.id === mission.id ? accentA + '50' : accentA + '15'
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-mono font-bold" style={{ color: text0 }}>{mission.title}</h4>
                  <p className="text-[9px] mt-1 line-clamp-2" style={{ color: muted }}>{mission.objective}</p>
                </div>
                <div
                  className="px-2 py-1 rounded text-[8px] font-mono font-bold flex-shrink-0"
                  style={{
                    background: diffColor[mission.difficulty] + '25',
                    color: diffColor[mission.difficulty]
                  }}
                >
                  {mission.difficulty}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3 mt-2">
                {mission.reward_xp > 0 && (
                  <div className="flex items-center gap-1 text-[8px]" style={{ color: muted }}>
                    <Zap className="h-2.5 w-2.5" />
                    {mission.reward_xp} XP
                  </div>
                )}
                {mission.reward_credits > 0 && (
                  <div className="flex items-center gap-1 text-[8px]" style={{ color: muted }}>
                    <Users className="h-2.5 w-2.5" />
                    {mission.reward_credits} Credits
                  </div>
                )}
                {mission.status === 'completed' && (
                  <CheckCircle className="h-3 w-3" style={{ color: '#00D1B2' }} />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-lg border"
            style={{ background: panel1, borderColor: accentA + '25' }}
          >
            <h3 className="text-[11px] font-mono font-bold mb-2" style={{ color: accentA }}>
              {selectedMission.title}
            </h3>
            <p className="text-[9px] leading-relaxed mb-3" style={{ color: text1 }}>
              {selectedMission.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3 text-[9px]">
              {selectedMission.location && (
                <div>
                  <span className="font-mono font-bold" style={{ color: muted }}>LOCATION:</span>
                  <div style={{ color: text1 }}>{selectedMission.location}</div>
                </div>
              )}
              {selectedMission.required_level && (
                <div>
                  <span className="font-mono font-bold" style={{ color: muted }}>REQUIRED LEVEL:</span>
                  <div style={{ color: text1 }}>{selectedMission.required_level}+</div>
                </div>
              )}
            </div>

            {selectedMission.status === 'available' && (
              <Button
                onClick={() => { handleAccept(selectedMission); setSelectedMission(null); }}
                size="sm"
                className="w-full gap-2"
                style={{ background: accentA, color: '#000' }}
              >
                <CheckCircle className="h-3 w-3" />
                Accept Mission
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}