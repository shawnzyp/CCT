import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, Heart, Zap, Sword, Target, Move, HelpCircle, Swords, 
  Eye, HandMetal, Shield as ShieldIcon, TrendingUp, Crosshair,
  Activity, Zap as BonusIcon, ArrowRight
} from "lucide-react";
import { getModifier, formatModifier } from "./StatBlock";
import { cn } from '@/lib/utils';
import CalculatorResourceTracker from './CalculatorResourceTracker';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COMBAT_ACTIONS = [
  { id: 'attack', name: 'Attack', description: 'Make a melee or ranged attack roll against an enemy\'s TC', icon: Sword },
  { id: 'power', name: 'Use Power', description: 'Activate one of your powers (costs SP)', icon: Zap },
  { id: 'dash', name: 'Dash', description: 'Move up to 2x your speed this turn', icon: Move },
  { id: 'disengage', name: 'Disengage', description: 'Move without provoking reactions', icon: Move },
  { id: 'dodge', name: 'Dodge', description: 'Enemies have disadvantage to hit you until your next turn', icon: ShieldIcon },
  { id: 'help', name: 'Help', description: 'Give ally advantage on their next attack or ability check', icon: HandMetal },
  { id: 'hide', name: 'Hide', description: 'Make a Stealth check to become hidden', icon: Eye },
  { id: 'ready', name: 'Ready', description: 'Prepare an action to trigger on a condition', icon: Target },
];

const COMBAT_REACTIONS = [
  { name: 'Opportunity Attack', description: 'When an enemy leaves your reach, make one melee attack' },
  { name: 'Counterspell', description: 'Use a power as reaction to negate another power' },
  { name: 'Block/Parry', description: 'Use equipment or power to reduce incoming damage' },
];

const BONUS_ACTIONS = [
  { name: 'Quick Power', description: 'Powers marked as "Bonus Action"' },
  { name: 'Second Wind', description: 'Some powers/abilities use bonus actions' },
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

  const strMod = getModifier(character.ability_scores?.STR || 10);
  const dexMod = getModifier(character.ability_scores?.DEX || 10);
  const initiativeBonus = character.initiative_modifier || dexMod;

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
    <TooltipProvider>
      <div className="space-y-4">
        {/* Section 1: Resources */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* HP Tracker */}
          <CalculatorResourceTracker
            icon={Heart}
            label="Hit Points"
            current={character.current_hp || character.max_hp}
            max={character.max_hp}
            color="red"
            onUpdate={(newHP) => onUpdate({ current_hp: newHP })}
            adjustments={[-1, -5, -10, -15, -20]}
            type="HP"
          />

          {/* SP Tracker */}
          <CalculatorResourceTracker
            icon={Zap}
            label="Stamina Points"
            current={character.current_sp || character.max_sp}
            max={character.max_sp}
            color="blue"
            onUpdate={(newSP) => onUpdate({ current_sp: newSP })}
            adjustments={[-1, -2, -3, -4, -5]}
            type="SP"
          />
        </div>

        {/* Section 2: Action Economy */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-white text-base">Action Economy</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Track what you've used this turn. Click to mark as used, then reset at turn end.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button size="sm" variant="outline" onClick={resetActions} className="h-7 text-xs">
                Reset Turn
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'action', label: 'Action', icon: Swords, desc: 'Attack, power, dash, dodge, etc.' },
                { id: 'movement', label: 'Movement', icon: Move, desc: 'Move up to your speed' },
                { id: 'bonus_action', label: 'Bonus Action', icon: BonusIcon, desc: 'Quick powers or abilities' },
                { id: 'reaction', label: 'Reaction', icon: Shield, desc: 'Opportunity attacks, blocks' }
              ].map(action => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleAction(action.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                        usedActions[action.id]
                          ? "border-slate-600 bg-slate-800/50"
                          : "border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20"
                      )}
                    >
                      <action.icon className={cn(
                        "h-5 w-5",
                        usedActions[action.id] ? "text-slate-500" : "text-violet-400"
                      )} />
                      <span className={cn(
                        "text-xs font-semibold text-center",
                        usedActions[action.id] ? "text-slate-500 line-through" : "text-white"
                      )}>
                        {action.label}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.desc}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            
            <div className="mt-3 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-slate-400 cursor-help">
                    <HelpCircle className="h-3 w-3" />
                    <span>What can I do?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="space-y-2">
                    <p className="font-semibold">Actions you can take on your turn:</p>
                    {COMBAT_ACTIONS.map(action => (
                      <div key={action.id} className="text-xs">
                        <span className="font-medium">{action.name}:</span> {action.description}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Combat Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Combat Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {COMBAT_ACTIONS.slice(0, 8).map(action => (
                <div key={action.id} className="p-2.5 bg-slate-700/30 rounded-lg flex items-center gap-2 hover:bg-slate-700/50 transition-colors">
                  <action.icon className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white">{action.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Attack Bonuses */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-base">Attack Bonuses</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Roll d20 + modifier vs. enemy TC. On hit, roll damage.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-4 bg-gradient-to-br from-red-950/30 to-red-900/10 border border-red-900/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-slate-300 text-sm font-semibold">Melee Attack</div>
                    <div className="text-xs text-slate-500 mt-0.5">STR modifier</div>
                  </div>
                  <div className="text-3xl font-bold text-red-300">
                    {formatModifier(strMod)}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-950/30 to-blue-900/10 border border-blue-900/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-slate-300 text-sm font-semibold">Ranged Attack</div>
                    <div className="text-xs text-slate-500 mt-0.5">DEX modifier</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-300">
                    {formatModifier(dexMod)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Powers */}
        {character.powers?.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-white text-base">Your Powers</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Powers cost SP to use. Check range, cooldown, and save DC before using.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {character.powers.map((power, idx) => (
                  <div key={idx} className="p-3 bg-gradient-to-br from-violet-950/30 to-purple-900/10 border border-violet-900/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-violet-400" />
                        <span className="text-white font-semibold">{power.name}</span>
                      </div>
                      <Badge className="bg-blue-500/30 border-blue-500/50 text-blue-200 text-xs">
                        {power.sp_cost} SP
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-2">
                      <span>Range: {power.range}</span>
                      {power.cooldown > 0 && <span>• CD: {power.cooldown}</span>}
                      {power.save && <span>• {power.save} save</span>}
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{power.effect}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 6: Combat Skills */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-base">Combat Skills</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Roll d20 + bonus for skill checks. Higher proficiency = better bonus.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { name: 'Athletics', stat: 'STR', skill: 'athletics' },
                { name: 'Acrobatics', stat: 'DEX', skill: 'acrobatics' },
                { name: 'Stealth', stat: 'DEX', skill: 'stealth' },
                { name: 'Perception', stat: 'WIS', skill: 'perception' }
              ].map(({ name, stat, skill }) => (
                <div key={skill} className="p-2.5 bg-slate-700/30 rounded flex justify-between items-center">
                  <span className="text-slate-200 text-sm font-medium">{name} ({stat})</span>
                  <Badge variant="outline" className="font-mono text-base text-white border-violet-500/50">
                    {formatModifier(getSkillBonus(skill, stat))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Reactions & Bonus Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-white text-sm">Reactions</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Special actions outside your turn, once per round, triggered by conditions.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {COMBAT_REACTIONS.map((reaction, idx) => (
                  <div key={idx} className="p-2 bg-orange-950/20 border border-orange-500/30 rounded text-xs">
                    <div className="font-semibold text-orange-300">{reaction.name}</div>
                    <div className="text-slate-400 mt-0.5">{reaction.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-white text-sm">Bonus Actions</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Quick actions that don't use your main Action.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {BONUS_ACTIONS.map((bonus, idx) => (
                  <div key={idx} className="p-2 bg-blue-950/20 border border-blue-500/30 rounded text-xs">
                    <div className="font-semibold text-blue-300">{bonus.name}</div>
                    <div className="text-slate-400 mt-0.5">{bonus.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 8: Equipped Gear */}
        {character.equipment?.filter(e => e.equipped).length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Equipped Gear</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2">
                {character.equipment.filter(e => e.equipped).map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-700/30 rounded flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      {item.bonus && (
                        <span className="text-violet-400 text-xs">{item.bonus}</span>
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
    </TooltipProvider>
  );
}