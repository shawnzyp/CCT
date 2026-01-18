import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TrendingUp, Plus, Zap, Heart, Shield, Star, BookOpen } from "lucide-react";
import { SKILLS } from "@/components/character/SkillsPanel";

const STATS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export default function LevelUpDialog({ character, onConfirm, onClose }) {
  const newLevel = (character.level || 1) + 1;
  const [selectedStat, setSelectedStat] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hpIncrease] = useState(Math.floor(Math.random() * 6) + 3); // 3-8 HP
  
  const skills = character.skills || {};
  const availableSkills = SKILLS.filter(skill => {
    const current = skills[skill.key] || 'none';
    return current !== 'expert'; // Can improve if not already expert
  });
  
  const benefits = [
    { icon: Heart, label: `+${hpIncrease} HP`, color: 'text-red-400' },
    { icon: Zap, label: '+1 Power Upgrade Point', color: 'text-violet-400' },
    { icon: BookOpen, label: '+1 Skill Proficiency', color: 'text-green-400' },
  ];
  
  if (newLevel % 3 === 0) {
    benefits.push({ icon: Shield, label: '+1 Equipment Slot', color: 'text-blue-400' });
  }
  
  if (newLevel % 5 === 0) {
    benefits.push({ icon: Star, label: 'Learn New Power', color: 'text-amber-400' });
  }
  
  const handleConfirm = () => {
    if (!selectedStat || !selectedSkill) return;
    
    const currentSkillLevel = skills[selectedSkill] || 'none';
    const newSkillLevel = currentSkillLevel === 'none' ? 'proficient' : 'expert';
    
    const updates = {
      level: newLevel,
      current_xp: 0,
      max_hp: (character.max_hp || 30) + hpIncrease,
      current_hp: (character.current_hp || character.max_hp) + hpIncrease,
      ability_scores: {
        ...character.ability_scores,
        [selectedStat]: (character.ability_scores[selectedStat] || 10) + 1
      },
      skills: {
        ...skills,
        [selectedSkill]: newSkillLevel
      },
      milestones: [
        ...(character.milestones || []),
        {
          level: newLevel,
          achievement: `Leveled up to ${newLevel}`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    onConfirm(updates);
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            Level Up!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Level Progress */}
          <div className="text-center py-4 bg-slate-800/50 rounded-xl">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              {character.level || 1} → {newLevel}
            </div>
            <p className="text-slate-400 text-sm mt-1">New Level Achieved</p>
          </div>
          
          <Separator className="bg-slate-700" />
          
          {/* Benefits */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Benefits
            </h3>
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                  <benefit.icon className={cn("h-5 w-5", benefit.color)} />
                  <span className="text-white">{benefit.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="bg-slate-700" />
          
          {/* Stat Increase */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-violet-400" />
              Choose Ability Score to Increase
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {STATS.map(stat => (
                <button
                  key={stat}
                  onClick={() => setSelectedStat(stat)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    selectedStat === stat
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                >
                  <div className="text-xs text-slate-400">{stat}</div>
                  <div className="text-lg font-bold text-white">
                    {character.ability_scores?.[stat] || 10}
                  </div>
                  {selectedStat === stat && (
                    <Badge className="bg-violet-500 text-white text-xs mt-1">+1</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="bg-slate-700" />
          
          {/* Skill Proficiency */}
          <div>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-400" />
              Improve Skill Proficiency
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableSkills.map(skill => {
                const currentLevel = skills[skill.key] || 'none';
                const nextLevel = currentLevel === 'none' ? 'Proficient' : 'Expert';
                return (
                  <button
                    key={skill.key}
                    onClick={() => setSelectedSkill(skill.key)}
                    className={cn(
                      "p-2 rounded-lg border-2 text-left transition-all",
                      selectedSkill === skill.key
                        ? "border-green-500 bg-green-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    )}
                  >
                    <div className="text-sm font-medium text-white">{skill.label}</div>
                    <div className="text-xs text-slate-400">{skill.ability}</div>
                    {selectedSkill === skill.key && (
                      <Badge className="bg-green-500 text-white text-xs mt-1">→ {nextLevel}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedStat || !selectedSkill}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Confirm Level Up
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}