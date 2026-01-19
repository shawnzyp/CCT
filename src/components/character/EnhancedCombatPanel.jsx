import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Shield, Heart, Zap, Sword, Target, Move, HelpCircle, Swords, Eye, HandMetal, Shield as ShieldIcon } from "lucide-react";
import { getModifier, formatModifier } from "./StatBlock";
import TutorialTooltip from '@/components/tutorial/TutorialTooltip';
import { cn } from '@/lib/utils';

const COMBAT_ACTIONS = [
  { id: 'attack', name: 'Attack', description: 'Make a melee or ranged attack roll against an enemy\'s TC', type: 'action', icon: Sword },
  { id: 'power', name: 'Use Power', description: 'Activate one of your powers (costs SP)', type: 'action', icon: Zap },
  { id: 'dash', name: 'Dash', description: 'Move up to 2x your speed this turn', type: 'action', icon: Move },
  { id: 'disengage', name: 'Disengage', description: 'Move without provoking reactions', type: 'action', icon: Move },
  { id: 'dodge', name: 'Dodge', description: 'Enemies have disadvantage to hit you until your next turn', type: 'action', icon: ShieldIcon },
  { id: 'help', name: 'Help', description: 'Give ally advantage on their next attack or ability check', type: 'action', icon: HandMetal },
  { id: 'hide', name: 'Hide', description: 'Make a Stealth check to become hidden', type: 'action', icon: Eye },
  { id: 'ready', name: 'Ready', description: 'Prepare an action to trigger on a condition', type: 'action', icon: Target },
];

const COMBAT_REACTIONS = [
  { name: 'Opportunity Attack', description: 'When an enemy leaves your reach, make one melee attack against them' },
  { name: 'Counterspell', description: 'Use a power as a reaction to negate or counter another power (if applicable)' },
  { name: 'Block/Parry', description: 'Use equipment or a power to reduce incoming damage (if applicable)' },
];

const BONUS_ACTIONS = [
  { name: 'Second Wind', description: 'Some powers or abilities can be used as bonus actions' },
  { name: 'Quick Power', description: 'Powers marked as "Bonus Action" in their description' },
];

export default function EnhancedCombatPanel({ character, onUpdate }) {
  const [usedActions, setUsedActions] = useState({
    action: false,
    movement: false,
    bonus_action: false,
    reaction: false
  });

  const getSkillBonus = (skill, stat) => {
    const statMod = getModifier(character.ability_scores[stat]);
    const proficiency = character.skills?.[skill] || 'none';
    const profBonus = proficiency === 'expert' ? 4 : proficiency === 'proficient' ? 2 : 0;
    return statMod + profBonus;
  };

  const hpPercentage = (character.current_hp / character.max_hp) * 100;
  const spPercentage = character.current_sp ? (character.current_sp / character.max_sp) * 100 : 100;

  const strMod = getModifier(character.ability_scores?.STR || 10);
  const dexMod = getModifier(character.ability_scores?.DEX || 10);

  const toggleAction = (actionType) => {
    setUsedActions(prev => ({
      ...prev,
      [actionType]: !prev[actionType]
    }));
  };

  const resetActions = () => {
    setUsedActions({
      action: false,
      movement: false,
      bonus_action: false,
      reaction: false
    });
  };

  return (
    <div className="space-y-4">
      {/* Core Combat Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-300 font-medium">HP</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {character.current_hp}/{character.max_hp}
            </div>
            <Progress value={hpPercentage} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-blue-950/20 border-blue-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">SP</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {character.current_sp || character.max_sp}/{character.max_sp}
            </div>
            <Progress value={spPercentage} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-violet-950/20 border-violet-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-violet-400" />
              <TutorialTooltip content="Toughness Class - Enemies must roll equal or higher to hit you. TC = 10 + DEX modifier + armor bonuses.">
                <span className="text-xs text-violet-300 font-medium">TC</span>
              </TutorialTooltip>
            </div>
            <div className="text-2xl font-bold text-white">
              {character.toughness_class || 10}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-950/20 border-emerald-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Move className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">Speed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {character.speed || 30} ft
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Economy */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">Action Economy</CardTitle>
            <Button size="sm" variant="outline" onClick={resetActions} className="h-7 text-xs">
              Reset Turn
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'action', label: 'Action', icon: Swords },
              { id: 'movement', label: 'Movement', icon: Move },
              { id: 'bonus_action', label: 'Bonus Action', icon: Zap },
              { id: 'reaction', label: 'Reaction', icon: Shield }
            ].map(action => (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  usedActions[action.id]
                    ? "border-slate-600 bg-slate-800/50"
                    : "border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20"
                )}
              >
                <action.icon className={cn(
                  "h-4 w-4",
                  usedActions[action.id] ? "text-slate-500" : "text-violet-400"
                )} />
                <span className={cn(
                  "text-sm font-semibold",
                  usedActions[action.id] ? "text-slate-500 line-through" : "text-white"
                )}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attack Bonuses */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Attack Bonuses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-slate-300 text-sm">Melee Attack</div>
                  <div className="text-xs text-slate-500">STR modifier</div>
                </div>
                <Badge className="bg-red-500/20 text-red-300 text-lg font-bold border-red-500/50">
                  {formatModifier(strMod)}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-slate-300 text-sm">Ranged Attack</div>
                  <div className="text-xs text-slate-500">DEX modifier</div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 text-lg font-bold border-blue-500/50">
                  {formatModifier(dexMod)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-violet-950/20 border border-violet-500/30 rounded-lg">
            <div className="flex items-start gap-2 text-xs text-violet-200">
              <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Attack Roll: d20 + modifier vs. enemy TC. On hit, roll weapon/power damage.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">Available Actions</CardTitle>
            <TutorialTooltip 
              content="These are the actions you can take on your turn. Most require using your Action from the Action Economy."
              position="left"
            >
              <span className="text-slate-400 text-xs">What can I do?</span>
            </TutorialTooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {COMBAT_ACTIONS.map(action => (
              <div key={action.id} className="p-2 bg-slate-700/30 rounded-lg flex items-start gap-2">
                <action.icon className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{action.name}</div>
                  <div className="text-xs text-slate-400">{action.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reactions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">Reactions</CardTitle>
            <TutorialTooltip 
              content="Reactions are special actions you can take outside your turn, once per round. They're triggered by specific conditions."
              position="left"
            >
              <HelpCircle className="h-4 w-4 text-slate-400" />
            </TutorialTooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMBAT_REACTIONS.map((reaction, idx) => (
              <div key={idx} className="p-2 bg-orange-950/20 border border-orange-500/30 rounded-lg">
                <div className="text-sm font-medium text-orange-300">{reaction.name}</div>
                <div className="text-xs text-slate-400">{reaction.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bonus Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Bonus Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BONUS_ACTIONS.map((bonus, idx) => (
              <div key={idx} className="p-2 bg-blue-950/20 border border-blue-500/30 rounded-lg">
                <div className="text-sm font-medium text-blue-300">{bonus.name}</div>
                <div className="text-xs text-slate-400">{bonus.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Combat Skills */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Combat Skills & Saves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            <div className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
              <span className="text-slate-200 text-sm">Athletics (STR)</span>
              <Badge variant="outline" className="font-mono text-white border-violet-500/50">
                {formatModifier(getSkillBonus('athletics', 'STR'))}
              </Badge>
            </div>
            <div className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
              <span className="text-slate-200 text-sm">Acrobatics (DEX)</span>
              <Badge variant="outline" className="font-mono text-white border-violet-500/50">
                {formatModifier(getSkillBonus('acrobatics', 'DEX'))}
              </Badge>
            </div>
            <div className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
              <span className="text-slate-200 text-sm">Stealth (DEX)</span>
              <Badge variant="outline" className="font-mono text-white border-violet-500/50">
                {formatModifier(getSkillBonus('stealth', 'DEX'))}
              </Badge>
            </div>
            <div className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
              <span className="text-slate-200 text-sm">Perception (WIS)</span>
              <Badge variant="outline" className="font-mono text-white border-violet-500/50">
                {formatModifier(getSkillBonus('perception', 'WIS'))}
              </Badge>
            </div>
            <div className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
              <TutorialTooltip content="Roll this at the start of combat to determine turn order">
                <span className="text-slate-200 text-sm">Initiative (DEX)</span>
              </TutorialTooltip>
              <Badge variant="outline" className="font-mono text-white border-violet-500/50">
                {formatModifier(character.initiative_modifier || getModifier(character.ability_scores?.DEX || 10))}
              </Badge>
            </div>
            <div className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
              <span className="text-slate-200 text-sm">Passive Perception</span>
              <Badge variant="outline" className="font-mono text-white border-violet-500/50">
                {10 + getSkillBonus('perception', 'WIS')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Powers in Combat */}
      {character.powers?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Powers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.powers.map((power, idx) => (
                <div key={idx} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{power.name}</span>
                      {power.is_signature_move && (
                        <Badge className="bg-violet-500 text-xs">Signature</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-500/20 border-blue-500/50 text-blue-300">
                      {power.sp_cost} SP
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-2">
                    <span>Range: {power.range}</span>
                    {power.cooldown > 0 && <span>• Cooldown: {power.cooldown} turns</span>}
                    {power.save && <span>• Save: {power.save}</span>}
                  </div>
                  <p className="text-sm text-slate-300">{power.effect}</p>
                  {power.damage_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {power.damage_type} damage
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipped Items */}
      {character.equipment?.filter(e => e.equipped).length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Equipped Gear</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.equipment.filter(e => e.equipped).map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-700/30 rounded flex justify-between items-center">
                  <div>
                    <span className="text-white text-sm font-medium">{item.name}</span>
                    {item.bonus && (
                      <span className="text-violet-400 text-xs ml-2">{item.bonus}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize border-slate-600">
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}