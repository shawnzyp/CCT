import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/components/theme/useTheme';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scroll, RefreshCw, Zap, Target, Skull, Gift, Clock, MapPin, Save, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'deadly'];
const SETTING_OPTIONS = ['urban', 'underground', 'rooftop', 'corporate HQ', 'port district', 'suburbs', 'abandoned facility', 'government building'];
const THEME_OPTIONS = ['rescue', 'heist', 'assassination', 'defense', 'investigation', 'escort', 'sabotage', 'retrieval'];

export default function AIMissionGen() {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const panel1 = c.panel1 || '#202833';
  const text0 = c.text0 || '#E6F1FF';
  const text1 = c.text1 || '#8EA0B5';
  const muted = c.muted || '#5F6E80';

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
  });

  const [difficulty, setDifficulty] = useState('medium');
  const [setting, setSetting] = useState('urban');
  const [missionTheme, setMissionTheme] = useState('rescue');
  const [campaignId, setCampaignId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mission, setMission] = useState(null);
  const [saving, setSaving] = useState(false);

  const panelStyle = { background: panel0, border: `1px solid ${accentA}20` };

  const handleGenerate = async () => {
    setLoading(true);
    setMission(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a game master for "Catalyst Core", a superhero TTRPG. Generate a dynamic mission briefing.

Parameters:
- Difficulty: ${difficulty}
- Setting: ${setting}
- Mission theme: ${missionTheme}

Create a rich, detailed mission with a noir/superhero tone. Return JSON with:
- title: mission code name (e.g. "OPERATION DARKFALL")
- classification: security level (e.g. "ALPHA-3 CLEARANCE")
- briefing: 3-4 sentence atmospheric mission briefing in second person, as if from a handler
- primary_objective: one clear main goal
- secondary_objectives: array of 2 optional side objectives
- enemy_types: array of 3 enemy types with name and description (e.g. {name: "AEGIS Rogue Agents", description: "Former operatives gone dark"})
- location_details: 2 sentences describing the environment and tactical considerations
- complications: array of 2 potential mid-mission twists
- rewards: object with xp (number 100-2000 based on difficulty), credits (number 500-5000), special_item (string, optional unique item)
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
          rewards: { type: 'object', properties: { xp: { type: 'number' }, credits: { type: 'number' }, special_item: { type: 'string' } } },
          estimated_duration: { type: 'string' },
          recommended_team_size: { type: 'string' },
          threat_level: { type: 'string' },
        }
      }
    });

    setMission(res);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!mission || !campaignId) { toast.error('Select a campaign first'); return; }
    setSaving(true);
    await base44.entities.Mission.create({
      campaign_id: campaignId,
      title: mission.title,
      description: mission.briefing,
      objective: mission.primary_objective,
      difficulty,
      status: 'available',
      reward_xp: mission.rewards?.xp || 0,
      reward_credits: mission.rewards?.credits || 0,
      generated_by_ai: true,
    });
    toast.success('Mission saved to campaign!');
    setSaving(false);
  };

  const threatColors = { GUARDED: '#00D1B2', ELEVATED: '#FFC857', HIGH: '#FF9500', SEVERE: '#FF3B3B', CRITICAL: '#FF0000' };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: accentA + '20', border: `1px solid ${accentA}40` }}>
          <Scroll className="h-5 w-5" style={{ color: accentA }} />
        </div>
        <div>
          <h1 className="font-mono font-bold text-lg tracking-wider" style={{ color: text0 }}>MISSION GENERATOR</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>AI-Powered Mission Briefings</p>
        </div>
      </div>

      {/* Config */}
      <div className="rounded-lg p-4 mb-4" style={panelStyle}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mb-6 gap-2"
        style={{ background: accentA, color: '#000' }}
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {loading ? 'GENERATING MISSION...' : 'GENERATE MISSION BRIEFING'}
      </Button>

      <AnimatePresence>
        {mission && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Header card */}
            <div className="rounded-lg p-5" style={{ ...panelStyle, borderColor: (threatColors[mission.threat_level] || accentA) + '50' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>{mission.classification}</div>
                  <h2 className="font-mono font-bold text-xl tracking-wider" style={{ color: text0 }}>{mission.title}</h2>
                </div>
                {mission.threat_level && (
                  <span className="px-2 py-1 rounded text-[10px] font-mono font-bold uppercase" style={{ background: (threatColors[mission.threat_level] || accentA) + '20', color: threatColors[mission.threat_level] || accentA }}>
                    {mission.threat_level}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: text1 }}>"{mission.briefing}"</p>
              <div className="flex gap-4 mt-3 text-[10px] font-mono" style={{ color: muted }}>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mission.estimated_duration}</span>
                <span className="flex items-center gap-1"><Target className="h-3 w-3" />{mission.recommended_team_size}</span>
              </div>
            </div>

            {/* Objectives */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Objectives</div>
              <div className="flex items-start gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: accentA }} />
                <div>
                  <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>Primary</div>
                  <p className="text-sm" style={{ color: text0 }}>{mission.primary_objective}</p>
                </div>
              </div>
              {mission.secondary_objectives?.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: muted }} />
                  <div>
                    <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>Secondary</div>
                    <p className="text-sm" style={{ color: text1 }}>{obj}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enemies */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Hostile Forces</div>
              <div className="space-y-2">
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

            {/* Location & Complications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg p-4" style={panelStyle}>
                <div className="text-[10px] font-mono uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: accentA }}>
                  <MapPin className="h-3 w-3" />Location
                </div>
                <p className="text-xs leading-relaxed" style={{ color: text1 }}>{mission.location_details}</p>
              </div>
              <div className="rounded-lg p-4" style={panelStyle}>
                <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: c.warning || '#FFC857' }}>⚠ Complications</div>
                <ul className="space-y-1">
                  {mission.complications?.map((comp, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: text1 }}>
                      <span style={{ color: c.warning || '#FFC857' }}>›</span>{comp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rewards */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-3 flex items-center gap-1" style={{ color: accentA }}>
                <Gift className="h-3 w-3" />Rewards
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 rounded font-mono text-sm font-bold" style={{ background: panel1, color: accentA }}>{mission.rewards?.xp?.toLocaleString()} XP</div>
                <div className="px-3 py-1.5 rounded font-mono text-sm font-bold" style={{ background: panel1, color: c.warning || '#FFC857' }}>¢{mission.rewards?.credits?.toLocaleString()}</div>
                {mission.rewards?.special_item && (
                  <div className="px-3 py-1.5 rounded font-mono text-sm" style={{ background: panel1, color: c.success || '#00D1B2' }}>{mission.rewards.special_item}</div>
                )}
              </div>
            </div>

            {/* Save to campaign */}
            <div className="rounded-lg p-4" style={panelStyle}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: accentA }}>Save to Campaign</div>
              <div className="flex gap-2">
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger className="flex-1 text-xs" style={{ background: panel1, borderColor: accentA + '30', color: text0 }}>
                    <SelectValue placeholder="Select campaign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(camp => <SelectItem key={camp.id} value={camp.id}>{camp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleSave} disabled={saving || !campaignId} size="sm" className="gap-1.5">
                  {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </Button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}