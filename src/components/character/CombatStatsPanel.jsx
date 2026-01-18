import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Shield, Heart, Zap, Sword, Target, Move } from "lucide-react";
import { getModifier, formatModifier } from "./StatBlock";

export default function CombatStatsPanel({ character }) {
  const getSkillBonus = (skill, stat) => {
    const statMod = getModifier(character.ability_scores[stat]);
    const proficiency = character.skills?.[skill] || 'none';
    const profBonus = proficiency === 'expert' ? 4 : proficiency === 'proficient' ? 2 : 0;
    return statMod + profBonus;
  };

  const hpPercentage = (character.current_hp / character.max_hp) * 100;
  const spPercentage = character.current_sp ? (character.current_sp / character.max_hp) * 100 : 100;

  return (
    <div className="grid gap-4">
      {/* Quick Stats */}
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
              {character.current_sp || character.max_hp}/{character.max_hp}
            </div>
            <Progress value={spPercentage} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-violet-950/20 border-violet-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium">TC</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {character.toughness_class || 10}
            </div>
            <p className="text-xs text-slate-400 mt-1">Toughness Class</p>
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
            <p className="text-xs text-slate-400 mt-1">Movement</p>
          </CardContent>
        </Card>
      </div>

      {/* Ability Scores */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(character.ability_scores || {}).map(([stat, score]) => (
              <div key={stat} className="text-center bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 font-medium mb-1">{stat}</div>
                <div className="text-xl font-bold text-white">{score}</div>
                <div className="text-sm text-violet-400 mt-1">
                  {formatModifier(getModifier(score))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Combat Skills */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Combat Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Athletics (STR)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('athletics', 'STR'))}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Acrobatics (DEX)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('acrobatics', 'DEX'))}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Stealth (DEX)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('stealth', 'DEX'))}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Perception (WIS)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('perception', 'WIS'))}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Investigation (INT)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('investigation', 'INT'))}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Insight (WIS)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('insight', 'WIS'))}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Intimidation (CHA)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(getSkillBonus('intimidation', 'CHA'))}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <span className="text-slate-300 text-sm">Initiative (DEX)</span>
                <Badge variant="outline" className="font-mono">
                  {formatModifier(character.initiative_modifier || getModifier(character.ability_scores?.DEX || 10))}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Powers Quick Reference */}
      {character.powers?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Powers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.powers.map((power, idx) => (
                <div key={idx} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-white font-medium">{power.name}</span>
                      {power.is_signature_move && (
                        <Badge className="ml-2 bg-violet-500 text-xs">Signature</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {power.sp_cost} SP
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-400 mb-1">
                    <span>Range: {power.range}</span>
                    {power.cooldown > 0 && <span>• Cooldown: {power.cooldown}</span>}
                  </div>
                  <p className="text-sm text-slate-300">{power.effect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {character.equipment?.filter(e => e.equipped).length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Equipped Items</CardTitle>
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
                  <Badge variant="outline" className="text-xs capitalize">
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