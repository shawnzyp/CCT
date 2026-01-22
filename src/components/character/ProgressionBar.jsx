import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, Star, Award, Medal } from "lucide-react";

const XP_PER_LEVEL = 1000;

const TIER_LABELS = {
  0: 'Street Level',
  1: 'City Defender',
  2: 'Regional Hero',
  3: 'Global Guardian',
  4: 'Cosmic Protector',
  5: 'Legendary Icon'
};

export default function ProgressionBar({ character, onLevelUp }) {
  const level = character.level || 1;
  const tier = character.tier || 0;
  const currentXP = character.current_xp || 0;
  const xpForNextLevel = level * XP_PER_LEVEL;
  const progress = (currentXP / xpForNextLevel) * 100;
  const canLevelUp = currentXP >= xpForNextLevel;

  return (
    <Card className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 border-violet-500/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">Tier {tier} • Level {level}</span>
                {canLevelUp && (
                  <Badge className="bg-amber-500 text-white animate-pulse">
                    <Star className="h-3 w-3 mr-1" />
                    Ready!
                  </Badge>
                )}
              </div>
              <p className="text-xs text-violet-400 font-medium">
                {TIER_LABELS[tier]}
              </p>
              <p className="text-xs text-slate-400">
                {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>
          
          {/* Recent Achievements & Awards */}
          <div className="flex flex-col gap-2">
            {character.achievements?.slice(-3).length > 0 && (
              <div className="flex gap-1 items-center">
                <Award className="h-3 w-3 text-amber-400" />
                {character.achievements.slice(-3).reverse().map((achievement, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    title={achievement.name}
                  >
                    {achievement.icon || '🏆'}
                  </div>
                ))}
              </div>
            )}
            {character.milestones?.slice(-3).length > 0 && (
              <div className="flex gap-1 items-center">
                <Medal className="h-3 w-3 text-violet-400" />
                {character.milestones.slice(-3).reverse().map((milestone, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    title={`Level ${milestone.level}: ${milestone.achievement}`}
                  >
                    {milestone.level}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {canLevelUp && (
            <button
              onClick={onLevelUp}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              Level Up!
            </button>
          )}
        </div>
        
        {/* XP Progress Bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              canLevelUp 
                ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                : "bg-gradient-to-r from-violet-500 to-purple-600"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        {/* Milestones */}
        {character.milestones?.length > 0 && (
          <div className="mt-3 flex gap-1">
            {character.milestones.slice(-5).map((milestone, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400"
                title={`Level ${milestone.level}: ${milestone.achievement}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}