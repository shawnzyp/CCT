import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Sword, Shield, Zap, Heart, Target } from "lucide-react";
import { calculateModifier, formatModifier } from "./StatBlock";

const statIcons = {
  STR: Sword,
  DEX: Target,
  CON: Shield,
  INT: Brain,
  WIS: Heart,
  CHA: Zap
};

const statColors = {
  STR: "text-red-400",
  DEX: "text-green-400",
  CON: "text-amber-400",
  INT: "text-blue-400",
  WIS: "text-purple-400",
  CHA: "text-pink-400"
};

const statBgColors = {
  STR: "bg-red-500/20",
  DEX: "bg-green-500/20",
  CON: "bg-amber-500/20",
  INT: "bg-blue-500/20",
  WIS: "bg-purple-500/20",
  CHA: "bg-pink-500/20"
};

export default function StatsVisual({ character }) {
  const scores = character.ability_scores || {};
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Ability Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(scores).map(([stat, score]) => {
            const Icon = statIcons[stat];
            const modifier = calculateModifier(score);
            const percentage = Math.min((score / 20) * 100, 100);
            
            return (
              <div key={stat} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${statBgColors[stat]} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${statColors[stat]}`} />
                    </div>
                    <span className="text-sm font-semibold text-white">{stat}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{score}</div>
                    <div className={`text-xs ${statColors[stat]}`}>
                      {formatModifier(modifier)}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}