import React, { useState } from 'react';
import { X, Shield, Star, Lock, CheckCircle, TrendingUp, TrendingDown, Minus, Radio, Zap, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const STANDING_ORDER = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored', 'exalted'];
const STANDING_COLORS = {
  hostile: '#FF3B3B', unfriendly: '#FF8C42', neutral: '#8EA0B5',
  friendly: '#00D1B2', honored: '#FFD700', exalted: '#9B59B6'
};

function getStandingFromRep(rep) {
  if (rep < -500) return 'hostile';
  if (rep < -200) return 'unfriendly';
  if (rep < 100) return 'neutral';
  if (rep < 300) return 'friendly';
  if (rep < 600) return 'honored';
  return 'exalted';
}

function getNextTierThreshold(tiers, currentUnlocked) {
  if (!tiers || currentUnlocked >= tiers.length) return null;
  return tiers[currentUnlocked];
}

export default function FactionDetailModal({ faction, reputation, character, onClose, onUpdate }) {
  const [aligning, setAligning] = useState(false);
  const [testingRep, setTestingRep] = useState(false);

  const rep = reputation?.reputation ?? 0;
  const standing = reputation?.standing ?? 'neutral';
  const isAligned = reputation?.is_aligned ?? false;
  const unlockedTiers = reputation?.unlocked_tiers ?? [];
  const repPct = ((rep + 1000) / 2000) * 100;
  const nextTier = getNextTierThreshold(faction.unlock_tiers, unlockedTiers.length);

  async function handleAlign() {
    if (!character?.id) { toast.error('Select a character first'); return; }
    setAligning(true);
    try {
      const existing = await base44.entities.FactionReputation.filter({
        character_id: character.id, faction_key: faction.key
      });
      if (existing.length > 0) {
        await base44.entities.FactionReputation.update(existing[0].id, {
          is_aligned: !isAligned,
          alignment_date: new Date().toISOString()
        });
        toast.success(isAligned ? `Withdrew from ${faction.short_name}` : `Aligned with ${faction.short_name}!`);
      } else {
        await base44.entities.FactionReputation.create({
          character_id: character.id,
          faction_key: faction.key,
          reputation: 0,
          standing: 'neutral',
          is_aligned: true,
          alignment_date: new Date().toISOString(),
          unlocked_tiers: [],
          completed_missions: [],
          narrative_choices: []
        });
        toast.success(`Aligned with ${faction.short_name}!`);
      }
      onUpdate?.();
    } catch (e) {
      toast.error('Failed to update alignment');
    }
    setAligning(false);
  }

  async function handleGainRep(amount) {
    if (!character?.id) { toast.error('Select a character first'); return; }
    setTestingRep(true);
    try {
      const existing = await base44.entities.FactionReputation.filter({
        character_id: character.id, faction_key: faction.key
      });
      const newRep = Math.min(1000, Math.max(-1000, (existing[0]?.reputation ?? 0) + amount));
      const newStanding = getStandingFromRep(newRep);
      const newUnlocked = [...(existing[0]?.unlocked_tiers ?? [])];
      if (faction.unlock_tiers) {
        faction.unlock_tiers.forEach((tier, idx) => {
          if (newRep >= tier.rep && !newUnlocked.includes(idx)) newUnlocked.push(idx);
        });
      }
      if (existing.length > 0) {
        await base44.entities.FactionReputation.update(existing[0].id, {
          reputation: newRep, standing: newStanding, unlocked_tiers: newUnlocked
        });
      } else {
        await base44.entities.FactionReputation.create({
          character_id: character.id, faction_key: faction.key,
          reputation: newRep, standing: newStanding,
          is_aligned: false, unlocked_tiers: newUnlocked,
          completed_missions: [], narrative_choices: []
        });
      }
      toast.success(`${amount >= 0 ? '+' : ''}${amount} reputation with ${faction.short_name}`);
      onUpdate?.();
    } catch (e) {
      toast.error('Failed to update reputation');
    }
    setTestingRep(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background: '#141A22', borderColor: faction.color + '40' }}>

        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between"
          style={{ borderColor: faction.color + '25', background: `linear-gradient(135deg, #1A1F26, ${faction.color}18)` }}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Radio className="h-5 w-5" style={{ color: faction.color }} />
              <span className="font-bold text-xl font-mono" style={{ color: faction.color }}>
                {faction.short_name}
              </span>
              {isAligned && (
                <span className="text-xs px-2 py-0.5 rounded font-mono uppercase"
                  style={{ background: faction.color + '30', color: faction.color }}>ALIGNED</span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono">{faction.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed">{faction.description}</p>

          {/* Recent Event */}
          {faction.recent_event && (
            <div className="p-3 rounded-lg border text-xs font-mono text-gray-300"
              style={{ borderColor: faction.color + '30', background: faction.color + '08' }}>
              <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: faction.color }}>
                ⚡ LATEST INTEL
              </div>
              {faction.recent_event}
            </div>
          )}

          {/* Standing + Rep */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Reputation</span>
              <span className="text-sm font-mono font-bold" style={{ color: STANDING_COLORS[standing] }}>
                {standing.toUpperCase()} ({rep >= 0 ? '+' : ''}{rep})
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-1">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${repPct}%`, background: `linear-gradient(90deg, ${faction.color}90, ${faction.color})` }} />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-600">
              <span>HOSTILE (-1000)</span><span>NEUTRAL (0)</span><span>EXALTED (+1000)</span>
            </div>
          </div>

          {/* Unlock Tiers */}
          {faction.unlock_tiers && (
            <div>
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Reputation Tiers</div>
              <div className="space-y-2">
                {faction.unlock_tiers.map((tier, idx) => {
                  const isUnlocked = unlockedTiers.includes(idx);
                  return (
                    <div key={idx} className="p-3 rounded-lg border"
                      style={{
                        borderColor: isUnlocked ? faction.color + '60' : '#333',
                        background: isUnlocked ? faction.color + '10' : '#1A1F26'
                      }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {isUnlocked
                            ? <CheckCircle className="h-4 w-4" style={{ color: faction.color }} />
                            : <Lock className="h-4 w-4 text-gray-600" />}
                          <span className="text-xs font-mono font-bold" style={{ color: isUnlocked ? faction.color : '#666' }}>
                            TIER {idx + 1}: {tier.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">{tier.rep} REP</span>
                      </div>
                      <div className="ml-6 flex flex-wrap gap-1">
                        {tier.unlocks?.map((u, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded font-mono"
                            style={{ background: isUnlocked ? faction.color + '20' : '#222', color: isUnlocked ? faction.color : '#555' }}>
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Global Influence */}
          <div className="flex items-center gap-4 p-3 rounded-lg border text-xs font-mono"
            style={{ borderColor: '#333', background: '#1A1F26' }}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: faction.color }} />
              <span className="text-gray-400">GLOBAL INFLUENCE</span>
              <span className="font-bold" style={{ color: faction.color }}>{faction.global_influence}%</span>
            </div>
            <div className="h-4 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: faction.color }} />
              <span className="text-gray-400">STATUS</span>
              <span className="uppercase" style={{ color: faction.color }}>{faction.narrative_state}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleAlign}
              disabled={aligning}
              className="font-mono text-xs"
              style={{
                background: isAligned ? '#333' : faction.color,
                color: isAligned ? faction.color : '#000',
                border: isAligned ? `1px solid ${faction.color}50` : 'none'
              }}>
              {aligning ? 'UPDATING...' : isAligned ? '✕ WITHDRAW ALIGNMENT' : '+ ALIGN WITH FACTION'}
            </Button>

            {/* Dev test buttons */}
            {character && (
              <>
                <Button variant="outline" onClick={() => handleGainRep(50)} disabled={testingRep}
                  className="font-mono text-xs border-gray-600 text-gray-400 hover:text-white">
                  +50 REP (TEST)
                </Button>
                <Button variant="outline" onClick={() => handleGainRep(-50)} disabled={testingRep}
                  className="font-mono text-xs border-gray-600 text-gray-400 hover:text-white">
                  -50 REP (TEST)
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}