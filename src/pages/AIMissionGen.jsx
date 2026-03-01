import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/theme/useTheme';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Scroll, RefreshCw, Zap, Target, Skull, Gift, Clock, MapPin, Users, PlayCircle, Globe, PlusCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'deadly'];
const SETTING_OPTIONS = ['urban', 'underground', 'rooftop', 'corporate HQ', 'port district', 'suburbs', 'abandoned facility', 'government building'];
const THEME_OPTIONS = ['rescue', 'heist', 'assassination', 'defense', 'investigation', 'escort', 'sabotage', 'retrieval'];

// Reward scaling by difficulty
const REWARD_SCALE = {
  easy:   { creditsMin: 200,  creditsMax: 800,  itemTier: 'common' },
  medium: { creditsMin: 800,  creditsMax: 2000, itemTier: 'uncommon' },
  hard:   { creditsMin: 2000, creditsMax: 4000, itemTier: 'rare' },
  deadly: { creditsMin: 4000, creditsMax: 8000, itemTier: 'legendary' },
};

const DAILY_MISSION_LIMIT = 5;
const DAILY_KEY = 'aiMissionDailyCount';

function getDailyCount() {
  const stored = localStorage.getItem(DAILY_KEY);
  if (!stored) return { count: 0, date: null };
  return JSON.parse(stored);
}

function incrementDailyCount() {
  const today = new Date().toDateString();
  const stored = getDailyCount();
  if (stored.date !== today) {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ count: 1, date: today }));
    return 1;
  }
  const next = stored.count + 1;
  localStorage.setItem(DAILY_KEY, JSON.stringify({ count: next, date: today }));
  return next;
}

function todayCount() {
  const stored = getDailyCount();
  const today = new Date().toDateString();
  if (stored.date !== today) return 0;
  return stored.count;
}

const threatColors = { GUARDED: '#00D1B2', ELEVATED: '#FFC857', HIGH: '#FF9500', SEVERE: '#FF3B3B', CRITICAL: '#FF0000' };

export default function AIMissionGen() {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';
  const panelStyle = { background: panel0, border: `1px solid ${accentA}20` };

  const queryClient = useQueryClient();
  const [tab, setTab] = useState('generate');
  const [difficulty, setDifficulty] = useState('medium');
  const [setting, setSetting] = useState('urban');
  const [missionTheme, setMissionTheme] = useState('rescue');
  const [loading, setLoading] = useState(false);
  const [mission, setMission] = useState(null);
  const [posting, setPosting] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [dailyUsed, setDailyUsed] = useState(todayCount());

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    try {
      const stored = localStorage.getItem('currentCharacter');
      if (stored) setCurrentCharacter(JSON.parse(stored));
    } catch {}
  }, []);

  // Community board missions
  const { data: communityMissions = [] } = useQuery({
    queryKey: ['community-missions'],
    queryFn: () => base44.entities.Mission.filter({ is_community_mission: true, status: 'available' }, '-created_date', 20),
    refetchInterval: 15000,
  });

  // My active missions
  const { data: myMissions = [] } = useQuery({
    queryKey: ['my-missions', currentUser?.email],
    queryFn: () => base44.entities.Mission.filter({ is_community_mission: true, created_by: currentUser?.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const handleGenerate = async () => {
    if (dailyUsed >= DAILY_MISSION_LIMIT) {
      toast.error(`Daily limit reached (${DAILY_MISSION_LIMIT}/day). Come back tomorrow.`);
      return;
    }
    setLoading(true);
    setMission(null);

    const scale = REWARD_SCALE[difficulty];
    const credits = Math.floor(Math.random() * (scale.creditsMax - scale.creditsMin) + scale.creditsMin);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a game master for "Catalyst Core", a superhero TTRPG. Generate a dynamic AI mission.

Parameters:
- Difficulty: ${difficulty}
- Setting: ${setting}
- Mission theme: ${missionTheme}
- Reward tier: ${scale.itemTier}
- Credit reward (pre-set): ${credits}

Create a rich, detailed mission with a noir/superhero tone. Return JSON with:
- title: mission code name (e.g. "OPERATION DARKFALL")
- classification: security level
- briefing: 3-4 sentence atmospheric mission briefing
- primary_objective: one clear main goal
- secondary_objectives: array of 2 optional side objectives
- enemy_types: array of 3 enemy types with name and description
- location_details: 2 sentences describing environment and tactical notes
- complications: array of 2 potential mid-mission twists
- special_item_name: a ${scale.itemTier}-tier item name reward (e.g. "Nano-Weave Body Armor", "Pulse Grenades x3")
- special_item_description: 1 sentence description of this item and its use
- estimated_duration: e.g. "2-3 hours"
- recommended_team_size: e.g. "2-4 operatives"
- threat_level: one of: GUARDED, ELEVATED, HIGH, SEVERE, CRITICAL`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          classification: { type: 'string' },
          briefing: { type: 'string' },
          primary_objective: { type: 'string' },
          secondary_objectives: { type: 'array', items: { type: 'string' } },
          enemy_types: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } },
          location_details: { type: 'string' },
          complications: { type: 'array', items: { type: 'string' } },
          special_item_name: { type: 'string' },
          special_item_description: { type: 'string' },
          estimated_duration: { type: 'string' },
          recommended_team_size: { type: 'string' },
          threat_level: { type: 'string' },
        }
      }
    });

    res._credits = credits;
    res._difficulty = difficulty;
    res._setting = setting;
    res._missionTheme = missionTheme;

    const newCount = incrementDailyCount();
    setDailyUsed(newCount);
    setMission(res);
    setLoading(false);
  };

  const handlePostToCommunity = async () => {
    if (!mission) return;
    setPosting(true);
    await base44.entities.Mission.create({
      title: mission.title,
      description: mission.briefing,
      objective: mission.primary_objective,
      difficulty: mission._difficulty,
      status: 'available',
      reward_xp: 0, // AI missions give no XP
      reward_credits: mission._credits,
      reward_items: [{
        name: mission.special_item_name,
        description: mission.special_item_description,
        tier: REWARD_SCALE[mission._difficulty].itemTier,
      }],
      mission_setting: mission._setting,
      mission_theme: mission._missionTheme,
      is_community_mission: true,
      generated_by_ai: true,
      created_by: currentUser?.email || 'unknown',
      joined_character_ids: [],
      joined_player_emails: [],
      ai_mission_data: mission,
      max_players: 4,
    });
    toast.success('Mission posted to community board!');
    queryClient.invalidateQueries({ queryKey: ['community-missions'] });
    setPosting(false);
    setMission(null);
    setTab('board');
  };

  const handleJoin = async (m) => {
    if (!currentCharacter || !currentUser) { toast.error('Select a character first'); return; }
    if ((m.joined_player_emails || []).includes(currentUser.email)) { toast.error('Already joined'); return; }
    if ((m.joined_character_ids || []).length >= (m.max_players || 4)) { toast.error('Mission is full'); return; }
    setJoiningId(m.id);
    await base44.entities.Mission.update(m.id, {
      joined_character_ids: [...(m.joined_character_ids || []), currentCharacter.id],
      joined_player_emails: [...(m.joined_player_emails || []), currentUser.email],
    });
    toast.success(`${currentCharacter.name} joined the mission!`);
    queryClient.invalidateQueries({ queryKey: ['community-missions'] });
    setJoiningId(null);
  };

  const hasJoined = (m) => (m.joined_player_emails || []).includes(currentUser?.email || '');

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentA + '20', border: `1px solid ${accentA}40` }}>
            <Scroll className="h-5 w-5" style={{ color: accentA }} />
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg tracking-wider" style={{ color: text0 }}>MISSION GENERATOR</h1>
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>AI-Powered · Community Board</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>Daily Missions</div>
          <div className="text-sm font-mono font-bold" style={{ color: dailyUsed >= DAILY_MISSION_LIMIT ? '#FF3B3B' : accentA }}>
            {dailyUsed}/{DAILY_MISSION_LIMIT}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-5">
          <TabsTrigger value="generate" className="flex-1 gap-1.5"><PlusCircle className="h-3.5 w-3.5" />Generate</TabsTrigger>
          <TabsTrigger value="board" className="flex-1 gap-1.5"><Globe className="h-3.5 w-3.5" />Community Board</TabsTrigger>
        </TabsList>

        {/* ── GENERATE TAB ── */}
        <TabsContent value="generate" className="space-y-4">
          <div className="rounded-lg p-4" style={panelStyle}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: muted }}>Mission Parameters</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {[
                { label: 'DIFFICULTY', value: difficulty, set: setDifficulty, options: DIFFICULTY_OPTIONS },
                { label: 'SETTING', value: setting, set: setSetting, options: SETTING_OPTIONS },
                { label: 'MISSION TYPE', value: missionTheme, set: setMissionTheme, options: THEME_OPTIONS },
              ].map(({ label, value, set, options }) => (
                <div key={label}>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>{label}</div>
                  <Select value={value} onValueChange={set}>
                    <SelectTrigger className="h-8 text-xs" style={{ background: panel1, borderColor: accentA + '30', color: text0 }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(o => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {/* Reward preview */}
            <div className="rounded p-2 text-[10px] font-mono" style={{ background: panel1 }}>
              <span style={{ color: muted }}>Est. Reward: </span>
              <span style={{ color: '#FFC857' }}>¢{REWARD_SCALE[difficulty].creditsMin.toLocaleString()}–{REWARD_SCALE[difficulty].creditsMax.toLocaleString()}</span>
              <span style={{ color: muted }}> + </span>
              <span style={{ color: { common: '#9CA3AF', uncommon: '#34D399', rare: '#818CF8', legendary: '#F59E0B' }[REWARD_SCALE[difficulty].itemTier] }}>
                {REWARD_SCALE[difficulty].itemTier} item
              </span>
              <span style={{ color: muted }}> · </span>
              <span style={{ color: '#FF9500' }}>No XP (credits & items only)</span>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading || dailyUsed >= DAILY_MISSION_LIMIT} className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? 'GENERATING...' : dailyUsed >= DAILY_MISSION_LIMIT ? `DAILY LIMIT REACHED (${DAILY_MISSION_LIMIT}/day)` : 'GENERATE MISSION'}
          </Button>

          <AnimatePresence>
            {mission && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <MissionCard mission={mission} accentA={accentA} panel0={panel0} panel1={panel1} text0={text0} text1={text1} muted={muted} c={c} />

                <Button onClick={handlePostToCommunity} disabled={posting} className="w-full gap-2" style={{ background: accentA + 'DD', color: '#000' }}>
                  {posting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  POST TO COMMUNITY BOARD
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── COMMUNITY BOARD TAB ── */}
        <TabsContent value="board" className="space-y-3">
          {!currentCharacter && (
            <div className="text-center py-4 rounded-lg text-xs font-mono" style={{ background: panel0, color: muted, border: `1px dashed ${accentA}20` }}>
              Select a character in the header to join missions
            </div>
          )}
          {communityMissions.length === 0 && (
            <div className="text-center py-10 rounded-lg" style={panelStyle}>
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: muted }} />
              <p className="text-xs font-mono" style={{ color: muted }}>No active community missions. Generate one and post it!</p>
            </div>
          )}
          {communityMissions.map(m => {
            const mData = m.ai_mission_data || {};
            const joined = hasJoined(m);
            const full = (m.joined_character_ids || []).length >= (m.max_players || 4);
            const isOwner = m.created_by === currentUser?.email;
            const tc = threatColors[mData.threat_level] || accentA;

            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-4" style={{ ...panelStyle, borderColor: tc + '40' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>{mData.classification || 'CLASSIFIED'}</div>
                    <div className="font-mono font-bold text-sm" style={{ color: text0 }}>{m.title}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase" style={{ background: tc + '20', color: tc }}>{mData.threat_level || m.difficulty}</span>
                    {isOwner && <span className="text-[9px] font-mono" style={{ color: accentA }}>YOUR MISSION</span>}
                  </div>
                </div>

                <p className="text-xs italic mb-3 leading-relaxed" style={{ color: text1 }}>"{m.description}"</p>

                {/* Rewards */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style={{ background: panel1, color: '#FFC857' }}>¢{(m.reward_credits || 0).toLocaleString()}</span>
                  {m.reward_items?.[0] && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: panel1, color: { common: '#9CA3AF', uncommon: '#34D399', rare: '#818CF8', legendary: '#F59E0B' }[m.reward_items[0].tier] || accentA }}>
                      {m.reward_items[0].name}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: panel1, color: '#FF9500' }}>No XP</span>
                </div>

                {/* Players */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: muted }}>
                    <Users className="h-3 w-3" />
                    {(m.joined_character_ids || []).length}/{m.max_players || 4} joined
                    {joined && <span style={{ color: accentA }}>· YOU'RE IN</span>}
                  </div>
                  <div className="flex gap-2">
                    {!joined && !full && (
                      <Button onClick={() => handleJoin(m)} disabled={joiningId === m.id || !currentCharacter} size="sm" className="gap-1.5 text-xs h-7" style={{ background: accentA, color: '#000' }}>
                        {joiningId === m.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
                        Join
                      </Button>
                    )}
                    {full && !joined && <span className="text-[10px] font-mono" style={{ color: muted }}>FULL</span>}
                    {joined && (
                      <Link to={createPageUrl(`AIMissionPlay?id=${m.id}`)}>
                        <Button size="sm" className="gap-1.5 text-xs h-7" style={{ background: accentA, color: '#000' }}>
                          <ChevronRight className="h-3 w-3" />
                          Play Mission
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MissionCard({ mission, accentA, panel0, panel1, text0, text1, muted, c }) {
  const tc = threatColors[mission.threat_level] || accentA;
  return (
    <div className="space-y-3">
      <div className="rounded-lg p-5" style={{ background: panel0, border: `1px solid ${tc}50` }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>{mission.classification}</div>
            <h2 className="font-mono font-bold text-xl tracking-wider" style={{ color: text0 }}>{mission.title}</h2>
          </div>
          {mission.threat_level && (
            <span className="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase" style={{ background: tc + '20', color: tc }}>{mission.threat_level}</span>
          )}
        </div>
        <p className="text-sm leading-relaxed italic mb-3" style={{ color: text1 }}>"{mission.briefing}"</p>
        <div className="flex gap-4 text-[10px] font-mono" style={{ color: muted }}>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mission.estimated_duration}</span>
          <span className="flex items-center gap-1"><Target className="h-3 w-3" />{mission.recommended_team_size}</span>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: '#FF9500' }}>No XP Reward</span>
        </div>
      </div>

      {/* Objectives */}
      <div className="rounded-lg p-4" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Objectives</div>
        <div className="flex items-start gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: accentA }} />
          <p className="text-xs" style={{ color: text0 }}>{mission.primary_objective}</p>
        </div>
        {mission.secondary_objectives?.map((obj, i) => (
          <div key={i} className="flex items-start gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: muted }} />
            <p className="text-xs" style={{ color: text1 }}>{obj}</p>
          </div>
        ))}
      </div>

      {/* Enemies */}
      <div className="rounded-lg p-4" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Hostile Forces</div>
        <div className="space-y-1.5">
          {mission.enemy_types?.map((e, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded" style={{ background: panel1 }}>
              <Skull className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: c.danger || '#FF3B3B' }} />
              <div>
                <div className="text-xs font-mono font-bold" style={{ color: text0 }}>{e.name}</div>
                <div className="text-[11px]" style={{ color: text1 }}>{e.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="rounded-lg p-4" style={{ background: panel0, border: `1px solid ${accentA}20` }}>
        <div className="text-[10px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: accentA }}>
          <Gift className="h-3 w-3" />Rewards (Credits + Item only — no XP)
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded font-mono text-sm font-bold" style={{ background: panel1, color: '#FFC857' }}>¢{(mission._credits || 0).toLocaleString()}</span>
          {mission.special_item_name && (
            <div className="px-3 py-1.5 rounded" style={{ background: panel1 }}>
              <div className="text-xs font-mono font-bold" style={{ color: { common: '#9CA3AF', uncommon: '#34D399', rare: '#818CF8', legendary: '#F59E0B' }[REWARD_SCALE[mission._difficulty]?.itemTier] || accentA }}>
                {mission.special_item_name}
              </div>
              {mission.special_item_description && (
                <div className="text-[10px]" style={{ color: muted }}>{mission.special_item_description}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}