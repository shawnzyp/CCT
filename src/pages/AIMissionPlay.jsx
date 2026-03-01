import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/components/theme/useTheme';
import { Button } from '@/components/ui/button';
import { Scroll, RefreshCw, ChevronRight, Shield, AlertTriangle, Trophy, Star, Users, Gift, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

// ── Performance score → reward multipliers ──────────────────────────────────
// score 0-100
// 90-100 = perfect  → full credits + guaranteed legendary item
// 75-89  = great    → full credits + base item tier
// 55-74  = good     → 70% credits + base item tier (no legendary)
// 35-54  = poor     → 40% credits + no item
// 0-34   = failed   → 10% credits + no item

const TIER_COLORS = {
  common:    '#9CA3AF',
  uncommon:  '#34D399',
  rare:      '#818CF8',
  legendary: '#F59E0B',
};

function scoreToRank(score) {
  if (score >= 90) return { label: 'PERFECT', color: '#F59E0B', stars: 5 };
  if (score >= 75) return { label: 'GREAT',   color: '#00D1B2', stars: 4 };
  if (score >= 55) return { label: 'GOOD',    color: '#FFC857', stars: 3 };
  if (score >= 35) return { label: 'POOR',    color: '#FF9500', stars: 2 };
  return             { label: 'FAILED',   color: '#FF3B3B', stars: 1 };
}

function applyScoreToRewards(score, baseCredits, baseItemTier, baseItemName, baseItemDesc) {
  let creditsMult, giveItem, itemTier;

  if (score >= 90) {
    creditsMult = 1.0; giveItem = true; itemTier = 'legendary';
  } else if (score >= 75) {
    creditsMult = 1.0; giveItem = true; itemTier = baseItemTier;
  } else if (score >= 55) {
    creditsMult = 0.7; giveItem = true; itemTier = baseItemTier === 'legendary' ? 'rare' : baseItemTier;
  } else if (score >= 35) {
    creditsMult = 0.4; giveItem = false; itemTier = null;
  } else {
    creditsMult = 0.1; giveItem = false; itemTier = null;
  }

  return {
    credits: Math.floor(baseCredits * creditsMult),
    item: giveItem ? { name: itemTier === 'legendary' ? `LEGENDARY: ${baseItemName}` : baseItemName, tier: itemTier, description: baseItemDesc } : null,
  };
}

export default function AIMissionPlay() {
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
  const logRef = useRef(null);

  // Get missionId from URL
  const missionId = new URLSearchParams(window.location.search).get('id');

  const [currentUser, setCurrentUser] = useState(null);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [phase, setPhase] = useState('briefing'); // briefing | playing | scoring | complete
  const [narrative, setNarrative] = useState([]);   // array of { type: 'gm'|'choice'|'consequence'|'event', text, scoreImpact? }
  const [choices, setChoices] = useState([]);        // current choice options from AI GM
  const [loadingGM, setLoadingGM] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(100); // starts perfect, degrades
  const [scoreLog, setScoreLog] = useState([]);      // { reason, delta } entries
  const [missionComplete, setMissionComplete] = useState(false);
  const [finalRewards, setFinalRewards] = useState(null);
  const [distributing, setDistributing] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [complication, setComplication] = useState(null); // active mid-mission complication

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    try {
      const stored = localStorage.getItem('currentCharacter');
      if (stored) setCurrentCharacter(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [narrative]);

  const { data: mission, isLoading: missionLoading } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const results = await base44.entities.Mission.filter({ id: missionId });
      return results[0] || null;
    },
    enabled: !!missionId,
  });

  const isParticipant = mission && (
    (mission.joined_player_emails || []).includes(currentUser?.email) ||
    mission.created_by === currentUser?.email
  );

  // ── Start mission: AI GM opens the scene ──────────────────────────────────
  const handleStart = async () => {
    setPhase('playing');
    setLoadingGM(true);
    const mData = mission.ai_mission_data || {};

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: buildGMPrompt(mData, [], 'START', mission.difficulty),
      response_json_schema: gmSchema(),
    });

    appendGM(res.narration);
    setChoices(res.choices || []);
    setLoadingGM(false);
    setTurnCount(1);
  };

  // ── Player picks a choice ─────────────────────────────────────────────────
  const handleChoice = async (choice) => {
    appendEntry('choice', `› ${choice.text}`);

    let scoreDelta = 0;
    if (choice.score_impact) {
      scoreDelta = choice.score_impact;
      applyScore(scoreDelta, choice.score_reason || choice.text);
    }

    setChoices([]);
    setComplication(null);
    setLoadingGM(true);

    const mData = mission.ai_mission_data || {};
    const historyText = narrative.map(e => `[${e.type.toUpperCase()}] ${e.text}`).join('\n');
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    const isFinalTurn = newTurn >= 6;
    const currentScoreNow = Math.max(0, Math.min(100, performanceScore + scoreDelta));

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: buildGMPrompt(mData, historyText, choice.text, mission.difficulty, isFinalTurn, currentScoreNow, newTurn),
      response_json_schema: gmSchema(),
    });

    appendGM(res.narration);

    if (res.score_impact) {
      applyScore(res.score_impact, res.score_reason || 'AI Director evaluation');
    }

    // Dynamic complication injected by the AI Director
    if (res.complication && !isFinalTurn) {
      setComplication(res.complication);
      appendEntry('event', `⚠ COMPLICATION: ${res.complication}`);
    }

    if (res.mission_complete || isFinalTurn) {
      setMissionComplete(true);
      setChoices([]);
      setPhase('scoring');
    } else {
      setChoices(res.choices || []);
    }

    setLoadingGM(false);
  };

  // ── Score helpers ─────────────────────────────────────────────────────────
  const applyScore = (delta, reason) => {
    setPerformanceScore(prev => Math.max(0, Math.min(100, prev + delta)));
    setScoreLog(prev => [...prev, { reason, delta }]);
  };

  const appendGM = (text) => {
    setNarrative(prev => [...prev, { type: 'gm', text }]);
  };

  const appendEntry = (type, text) => {
    setNarrative(prev => [...prev, { type, text }]);
  };

  // ── Build the GM prompt ───────────────────────────────────────────────────
  const buildGMPrompt = (mData, history, lastAction, difficulty, isFinal = false, currentScore = 100) => {
    return `You are the AI Game Master for "Catalyst Core", a superhero TTRPG mission.

MISSION: ${mData.title || 'Unknown'}
BRIEFING: ${mData.briefing || ''}
PRIMARY OBJECTIVE: ${mData.primary_objective || ''}
SETTING: ${mission?.mission_setting || 'urban'}
DIFFICULTY: ${difficulty}
ENEMIES: ${mData.enemy_types?.map(e => e.name).join(', ') || 'unknown hostiles'}
COMPLICATIONS: ${mData.complications?.join('; ') || 'none'}

HEROES ARE ALWAYS EXPECTED TO:
- Protect civilians and minimize casualties AT ALL COSTS
- Minimize property and collateral damage
- Use non-lethal force when possible
- Preserve life, even of enemies if possible

Current performance score: ${currentScore}/100 (starts at 100, degrades on poor choices)

PREVIOUS EVENTS:
${Array.isArray(history) ? 'none yet' : history || 'none yet'}

LAST PLAYER ACTION: ${lastAction}

${isFinal
  ? `This is the FINAL SCENE. Resolve the mission dramatically. Do NOT give more choices. Evaluate overall hero conduct.`
  : `Continue the mission. Present 3 distinct choices that test the heroes' values. Choices that endanger civilians or cause collateral damage should feel tempting but wrong.`
}

Return JSON with:
- narration: 2-4 sentences of vivid GM narration responding to the last action and advancing the scene
- choices: ${isFinal ? '[]' : 'array of exactly 3 choice objects, each with: text (short action label), score_impact (number, -20 to +10, negative for choices that harm civilians/property/cause unnecessary damage), score_reason (brief explanation of why score changes)'}
- score_impact: number (-25 to +5) reflecting overall hero conduct this turn (null if no change)
- score_reason: string explaining the evaluation
- mission_complete: ${isFinal ? 'true' : 'false (unless mission ends naturally)'}`;
  };

  // ── Final scoring & reward distribution ──────────────────────────────────
  const handleDistributeRewards = async () => {
    if (!mission || !currentUser) return;
    setDistributing(true);

    const finalScore = performanceScore;
    const rank = scoreToRank(finalScore);
    const baseCredits = mission.reward_credits || 0;
    const baseItem = mission.reward_items?.[0];
    const rewards = applyScoreToRewards(finalScore, baseCredits, baseItem?.tier || 'common', baseItem?.name || 'Reward Item', baseItem?.description || '');

    setFinalRewards({ ...rewards, score: finalScore, rank });

    const characterIds = mission.joined_character_ids || [];
    if (characterIds.length > 0) {
      const chars = (await Promise.all(characterIds.map(id => base44.entities.Character.filter({ id })))).flat();
      await Promise.all(chars.map(char => {
        const newInventory = [...(char.inventory || [])];
        if (rewards.item) {
          newInventory.push({
            id: `ai_mission_${Date.now()}_${char.id}`,
            name: rewards.item.name,
            description: rewards.item.description || '',
            tier: rewards.item.tier,
            quantity: 1,
            source: `AI Mission: ${mission.title}`,
          });
        }
        return base44.entities.Character.update(char.id, {
          credits: (char.credits || 0) + rewards.credits,
          inventory: newInventory,
        });
      }));
    }

    await base44.entities.Mission.update(mission.id, {
      status: 'completed',
      rewards_distributed: true,
      completed_at: new Date().toISOString(),
      ai_mission_data: { ...(mission.ai_mission_data || {}), final_score: finalScore, rank: rank.label },
    });

    queryClient.invalidateQueries({ queryKey: ['community-missions'] });
    setPhase('complete');
    setDistributing(false);
  };

  if (!missionId) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: panel0 }}>
      <div className="text-center">
        <p className="font-mono text-xs mb-4" style={{ color: muted }}>No mission specified.</p>
        <Link to={createPageUrl('AIMissionGen')}><Button variant="outline">Back to Mission Board</Button></Link>
      </div>
    </div>
  );

  if (missionLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="h-6 w-6 animate-spin" style={{ color: accentA }} />
    </div>
  );

  if (!mission) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-xs" style={{ color: muted }}>Mission not found.</p>
    </div>
  );

  const mData = mission.ai_mission_data || {};
  const rank = scoreToRank(performanceScore);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to={createPageUrl('AIMissionGen')}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><ArrowLeft className="h-3.5 w-3.5" />Board</Button>
        </Link>
        {phase === 'playing' && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] font-mono uppercase" style={{ color: muted }}>Performance</div>
              <div className="text-sm font-mono font-bold" style={{ color: rank.color }}>{performanceScore}/100 · {rank.label}</div>
            </div>
            <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: '#ffffff15' }}>
              <motion.div className="h-full rounded-full" animate={{ width: `${performanceScore}%` }} transition={{ duration: 0.5 }}
                style={{ background: rank.color }} />
            </div>
          </div>
        )}
      </div>

      {/* Mission title bar */}
      <div className="rounded-lg p-4 mb-4" style={{ ...panelStyle, borderColor: (threatColors[mData.threat_level] || accentA) + '50' }}>
        <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: muted }}>{mData.classification || 'AI MISSION'}</div>
        <div className="font-mono font-bold text-base" style={{ color: text0 }}>{mission.title}</div>
        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono" style={{ color: muted }}>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{(mission.joined_character_ids || []).length} operatives</span>
          <span style={{ color: '#FF9500' }}>Credits & Items only · No XP</span>
        </div>
      </div>

      {/* ── BRIEFING PHASE ── */}
      {phase === 'briefing' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-lg p-4" style={panelStyle}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: accentA }}>Mission Briefing</div>
            <p className="text-sm leading-relaxed italic mb-4" style={{ color: text1 }}>"{mData.briefing}"</p>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: accentA }}>Primary Objective</div>
            <p className="text-xs mb-3" style={{ color: text0 }}>{mData.primary_objective}</p>
            <div className="p-3 rounded text-xs font-mono leading-relaxed" style={{ background: '#FF9500' + '15', border: '1px solid #FF950040', color: '#FF9500' }}>
              ⚠ HERO CODE: You are bound to protect civilian life, minimize collateral damage, and use proportionate force. Your performance score reflects your adherence to these principles. Only perfect conduct guarantees legendary rewards.
            </div>
          </div>

          {!isParticipant && (
            <div className="text-center py-3 rounded text-xs font-mono" style={{ background: panel0, color: '#FF3B3B', border: '1px solid #FF3B3B40' }}>
              You have not joined this mission. Return to the board to join first.
            </div>
          )}

          <Button onClick={handleStart} disabled={!isParticipant} className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
            <Scroll className="h-4 w-4" />
            BEGIN MISSION
          </Button>
        </motion.div>
      )}

      {/* ── PLAYING PHASE ── */}
      {phase === 'playing' && (
        <div className="space-y-4">
          {/* Narrative log */}
          <div ref={logRef} className="rounded-lg p-4 space-y-3 max-h-[50vh] overflow-y-auto" style={panelStyle}>
            <AnimatePresence initial={false}>
              {narrative.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`text-sm leading-relaxed ${entry.type === 'choice' ? 'pl-3 border-l-2' : ''}`}
                  style={{
                    color: entry.type === 'gm' ? text1 : entry.type === 'choice' ? accentA : text0,
                    borderColor: entry.type === 'choice' ? accentA + '50' : 'transparent',
                    fontStyle: entry.type === 'gm' ? 'italic' : 'normal',
                    fontFamily: entry.type === 'gm' ? 'inherit' : 'monospace',
                    fontSize: entry.type === 'choice' ? '0.75rem' : '0.875rem',
                  }}>
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {loadingGM && (
              <div className="flex items-center gap-2 text-xs font-mono animate-pulse" style={{ color: muted }}>
                <RefreshCw className="h-3 w-3 animate-spin" />AI GM is narrating...
              </div>
            )}
          </div>

          {/* Choices */}
          {!loadingGM && choices.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>Choose your action:</div>
              {choices.map((choice, i) => (
                <button key={i} onClick={() => handleChoice(choice)}
                  className="w-full text-left rounded-lg p-3 text-sm transition-all hover:opacity-90"
                  style={{ background: panel0, border: `1px solid ${accentA}30`, color: text0 }}>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[10px] mt-0.5 flex-shrink-0" style={{ color: accentA }}>{String.fromCharCode(65 + i)}.</span>
                    <span>{choice.text}</span>
                  </div>
                  {choice.score_impact < 0 && (
                    <div className="text-[10px] font-mono mt-1 ml-4" style={{ color: '#FF9500' }}>
                      ⚠ May affect performance score
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* ── SCORING PHASE ── */}
      {phase === 'scoring' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Final narrative */}
          <div className="rounded-lg p-4 space-y-3 max-h-[35vh] overflow-y-auto" style={panelStyle}>
            {narrative.slice(-5).map((entry, i) => (
              <p key={i} className="text-sm leading-relaxed italic" style={{ color: text1 }}>{entry.text}</p>
            ))}
          </div>

          {/* Score breakdown */}
          <div className="rounded-lg p-5 text-center" style={{ background: panel0, border: `2px solid ${rank.color}50` }}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: muted }}>Mission Performance</div>
            <div className="text-5xl font-mono font-black mb-1" style={{ color: rank.color }}>{performanceScore}</div>
            <div className="font-mono text-lg font-bold mb-3" style={{ color: rank.color }}>{rank.label}</div>
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5" style={{ color: s <= rank.stars ? '#FFD700' : muted + '40', fill: s <= rank.stars ? '#FFD700' : 'none' }} />)}
            </div>

            {/* Score log */}
            {scoreLog.length > 0 && (
              <div className="text-left space-y-1 mb-4">
                <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>Score Breakdown</div>
                {scoreLog.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                    <span style={{ color: text1 }}>{entry.reason}</span>
                    <span style={{ color: entry.delta >= 0 ? '#00D1B2' : '#FF3B3B' }}>{entry.delta >= 0 ? '+' : ''}{entry.delta}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reward preview */}
            <div className="rounded p-3 text-left" style={{ background: panel1 }}>
              <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: muted }}>Projected Rewards</div>
              {(() => {
                const baseCredits = mission.reward_credits || 0;
                const baseItem = mission.reward_items?.[0];
                const rewards = applyScoreToRewards(performanceScore, baseCredits, baseItem?.tier || 'common', baseItem?.name || 'Reward Item', baseItem?.description || '');
                return (
                  <div className="space-y-1 text-xs font-mono">
                    <div style={{ color: '#FFC857' }}>¢{rewards.credits.toLocaleString()} credits</div>
                    {rewards.item ? (
                      <div style={{ color: TIER_COLORS[rewards.item.tier] || accentA }}>{rewards.item.name} ({rewards.item.tier})</div>
                    ) : (
                      <div style={{ color: muted }}>No item reward (performance too low)</div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <Button onClick={handleDistributeRewards} disabled={distributing} className="w-full gap-2" style={{ background: rank.color, color: '#000' }}>
            {distributing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            {distributing ? 'DISTRIBUTING REWARDS...' : 'CLAIM REWARDS'}
          </Button>
        </motion.div>
      )}

      {/* ── COMPLETE PHASE ── */}
      {phase === 'complete' && finalRewards && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="rounded-lg p-6 text-center" style={{ background: panel0, border: `2px solid ${finalRewards.rank.color}50` }}>
            <Trophy className="h-12 w-12 mx-auto mb-3" style={{ color: finalRewards.rank.color }} />
            <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: muted }}>Mission Complete</div>
            <div className="text-2xl font-mono font-bold mb-1" style={{ color: finalRewards.rank.color }}>{finalRewards.rank.label}</div>
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5" style={{ color: s <= finalRewards.rank.stars ? '#FFD700' : muted + '40', fill: s <= finalRewards.rank.stars ? '#FFD700' : 'none' }} />)}
            </div>

            <div className="space-y-2">
              <div className="px-4 py-2 rounded font-mono font-bold" style={{ background: panel1, color: '#FFC857' }}>
                ¢{finalRewards.credits.toLocaleString()} credits distributed
              </div>
              {finalRewards.item ? (
                <div className="px-4 py-2 rounded font-mono" style={{ background: panel1, color: TIER_COLORS[finalRewards.item.tier] || accentA }}>
                  {finalRewards.item.name} added to inventory
                </div>
              ) : (
                <div className="px-4 py-2 rounded font-mono text-xs" style={{ background: panel1, color: muted }}>
                  No item reward — improve performance next time
                </div>
              )}
            </div>
          </div>

          <Link to={createPageUrl('AIMissionGen')} className="block">
            <Button className="w-full gap-2" style={{ background: accentA, color: '#000' }}>
              <Scroll className="h-4 w-4" />
              BACK TO MISSION BOARD
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

const threatColors = { GUARDED: '#00D1B2', ELEVATED: '#FFC857', HIGH: '#FF9500', SEVERE: '#FF3B3B', CRITICAL: '#FF0000' };