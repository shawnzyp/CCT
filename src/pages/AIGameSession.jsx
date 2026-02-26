import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Users, Scroll, MessageSquare, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import CampaignChat from '@/components/ai-gm/CampaignChat';
import PrivatePlayerDM from '@/components/ai-gm/PrivatePlayerDM';
import MissionBoard from '@/components/ai-gm/MissionBoard';
import { useTheme } from '@/components/theme/useTheme';

export default function AIGameSessionPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const { theme } = useTheme();

  const accentA = theme?.colors?.accentA || '#00E5FF';
  const bg0 = theme?.colors?.bg0 || '#0F1216';
  const panel0 = theme?.colors?.panel0 || '#1A1F26';
  const panel1 = theme?.colors?.panel1 || '#202833';
  const text0 = theme?.colors?.text0 || '#E6F1FF';
  const text1 = theme?.colors?.text1 || '#8EA0B5';
  const muted = theme?.colors?.muted || '#5F6E80';

  const [session, setSession] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [openDMs, setOpenDMs] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const loadSession = async () => {
      const s = await base44.entities.AIGameSession.filter({ id: sessionId });
      if (s.length) {
        setSession(s[0]);
        const c = await base44.entities.Campaign.filter({ id: s[0].campaign_id });
        if (c.length) setCampaign(c[0]);

        const chars = await base44.entities.Character.filter({
          id: { $in: s[0].character_ids || [] }
        });
        setCharacters(chars);
      }
    };
    loadSession();
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg0 }}>
        <div className="text-center">
          <Radio className="h-8 w-8 mx-auto mb-4 animate-pulse" style={{ color: accentA }} />
          <p className="font-mono text-sm" style={{ color: muted }}>LOADING SESSION...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'chat', label: 'Campaign Chat', icon: MessageSquare },
    { id: 'missions', label: 'Mission Board', icon: Scroll },
    { id: 'party', label: 'Party', icon: Users },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg0 }}>
      {/* Header */}
      <div
        className="sticky top-16 z-40 border-b backdrop-blur-lg"
        style={{ background: panel0 + 'F0', borderColor: accentA + '25' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-mono font-bold" style={{ color: text0 }}>{session.session_name}</h1>
              <p className="text-xs font-mono" style={{ color: muted }}>{campaign?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold"
                style={{
                  background: session.status === 'active' ? '#00D1B2' + '25' : accentA + '15',
                  color: session.status === 'active' ? '#00D1B2' : accentA
                }}
              >
                {session.status.toUpperCase()}
              </div>
              <Button
                size="sm"
                variant="ghost"
                style={{ color: accentA }}
              >
                {session.status === 'active' ? (
                  <>
                    <Pause className="h-3.5 w-3.5 mr-1.5" />
                    PAUSE SESSION
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    RESUME
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-mono uppercase font-bold transition-all"
                  style={{
                    background: active ? accentA + '25' : 'transparent',
                    color: active ? accentA : muted,
                    borderBottom: active ? `2px solid ${accentA}` : 'none'
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main campaign chat */}
            <div className="lg:col-span-2 h-[600px]">
              <CampaignChat
                session_id={sessionId}
                campaign_id={session.campaign_id}
                accentA={accentA}
                panel0={panel0}
                panel1={panel1}
                text0={text0}
                text1={text1}
                muted={muted}
              />
            </div>

            {/* Private DMs sidebar */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono tracking-widest uppercase font-bold" style={{ color: text0 }}>
                Private Messages
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {characters.map(char => {
                  const isOpen = openDMs.includes(char.id);
                  return (
                    <motion.button
                      key={char.id}
                      onClick={() => setOpenDMs(prev =>
                        prev.includes(char.id)
                          ? prev.filter(id => id !== char.id)
                          : [...prev, char.id]
                      )}
                      className="w-full text-left p-2 rounded-lg border transition-all"
                      style={{
                        background: isOpen ? accentA + '20' : 'transparent',
                        borderColor: isOpen ? accentA + '50' : accentA + '15'
                      }}
                    >
                      <span className="text-[9px] font-mono font-bold" style={{ color: text1 }}>
                        {char.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Active DM panels */}
              <div className="space-y-2">
                {openDMs.map(charId => {
                  const char = characters.find(c => c.id === charId);
                  if (!char) return null;
                  return (
                    <div key={charId} className="h-64">
                      <PrivatePlayerDM
                        session_id={sessionId}
                        campaign_id={session.campaign_id}
                        player_id={charId}
                        player_name={char.name}
                        onClose={() => setOpenDMs(prev => prev.filter(id => id !== charId))}
                        accentA={accentA}
                        panel0={panel0}
                        panel1={panel1}
                        text0={text0}
                        text1={text1}
                        muted={muted}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl"
          >
            <MissionBoard
              campaign_id={session.campaign_id}
              character_id={characters[0]?.id}
              accentA={accentA}
              panel0={panel0}
              panel1={panel1}
              text0={text0}
              text1={text1}
              muted={muted}
            />
          </motion.div>
        )}

        {activeTab === 'party' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {characters.map(char => (
              <div
                key={char.id}
                className="p-4 rounded-lg border"
                style={{ background: panel0, borderColor: accentA + '25' }}
              >
                <h3 className="text-[11px] font-mono font-bold mb-2" style={{ color: accentA }}>
                  {char.name}
                </h3>
                <div className="space-y-1 text-[9px]">
                  <div style={{ color: text1 }}>Level {char.level}</div>
                  <div style={{ color: muted }}>{char.classification}</div>
                  <div style={{ color: text1 }}>HP: {char.current_hp}/{char.max_hp}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}