import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, Dices, Star, TrendingUp } from "lucide-react";
import { getModifier, formatModifier } from "@/components/character/StatBlock";
import SkillCheckDialog from "@/components/character/SkillCheckDialog";

export const SKILLS = [
  { key: 'athletics', label: 'Athletics', ability: 'STR', description: 'Climbing, jumping, swimming' },
  { key: 'acrobatics', label: 'Acrobatics', ability: 'DEX', description: 'Balance, dodge, tumble' },
  { key: 'stealth', label: 'Stealth', ability: 'DEX', description: 'Hide, move silently' },
  { key: 'investigation', label: 'Investigation', ability: 'INT', description: 'Find clues, research' },
  { key: 'perception', label: 'Perception', ability: 'WIS', description: 'Spot hidden, notice details' },
  { key: 'insight', label: 'Insight', ability: 'WIS', description: 'Read intentions, detect lies' },
  { key: 'persuasion', label: 'Persuasion', ability: 'CHA', description: 'Convince, negotiate' },
  { key: 'deception', label: 'Deception', ability: 'CHA', description: 'Lie, disguise, bluff' },
  { key: 'intimidation', label: 'Intimidation', ability: 'CHA', description: 'Threaten, coerce' },
  { key: 'technology', label: 'Technology', ability: 'INT', description: 'Hack, repair, operate devices' },
  { key: 'medicine', label: 'Medicine', ability: 'WIS', description: 'Heal, diagnose, stabilize' },
  { key: 'survival', label: 'Survival', ability: 'WIS', description: 'Track, forage, navigate' },
];

const PROFICIENCY_BONUS = {
  none: 0,
  proficient: 2,
  expert: 4
};

export default function SkillsPanel({ character, onUpdate }) {
  const [checkingSkill, setCheckingSkill] = useState(null);
  const skills = character.skills || {};
  
  const getSkillBonus = (skill) => {
    const abilityMod = getModifier(character.ability_scores?.[skill.ability] || 10);
    const profBonus = PROFICIENCY_BONUS[skills[skill.key] || 'none'];
    return abilityMod + profBonus;
  };
  
  const handleToggleProficiency = (skillKey) => {
    const current = skills[skillKey] || 'none';
    const next = current === 'none' ? 'proficient' : current === 'proficient' ? 'expert' : 'none';
    onUpdate({ ...skills, [skillKey]: next });
  };
  
  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-400" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {SKILLS.map(skill => {
              const proficiency = skills[skill.key] || 'none';
              const bonus = getSkillBonus(skill);
              
              return (
                <div
                  key={skill.key}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    proficiency !== 'none'
                      ? "border-violet-500/50 bg-violet-500/5"
                      : "border-slate-700 bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggleProficiency(skill.key)}
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center transition-all",
                          proficiency === 'expert' && "bg-amber-500",
                          proficiency === 'proficient' && "bg-violet-500",
                          proficiency === 'none' && "border-2 border-slate-600 hover:border-slate-500"
                        )}
                      >
                        {proficiency === 'expert' && <Star className="h-4 w-4 text-white fill-white" />}
                        {proficiency === 'proficient' && <Star className="h-4 w-4 text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{skill.label}</span>
                          <Badge variant="outline" className="text-xs bg-slate-700 text-slate-200 border-slate-600">
                            {skill.ability}
                          </Badge>
                          {proficiency === 'expert' && (
                            <Badge className="bg-amber-500 text-white text-xs border-2 border-amber-400">Expert</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{skill.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "text-lg font-bold min-w-[3rem] text-right",
                        bonus >= 0 ? "text-emerald-300" : "text-red-300"
                      )}>
                        {formatModifier(bonus)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCheckingSkill(skill)}
                        className="gap-1"
                      >
                        <Dices className="h-3 w-3" />
                        Roll
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <TrendingUp className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-300 mb-1">Proficiency Levels:</p>
                <p><Star className="h-3 w-3 inline text-violet-400" /> Proficient: +2 bonus</p>
                <p><Star className="h-3 w-3 inline text-amber-400 fill-amber-400" /> Expert: +4 bonus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {checkingSkill && (
        <SkillCheckDialog
          skill={checkingSkill}
          bonus={getSkillBonus(checkingSkill)}
          character={character}
          onClose={() => setCheckingSkill(null)}
        />
      )}
    </>
  );
}