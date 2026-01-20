import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Zap, Award, ChevronUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getLevelInfo, getXPForNextLevel, canLevelUp, LEVEL_TABLE } from './ProgressionData';

export default function ProgressionTracker({ character, onLevelUp }) {
  const currentLevel = character.level || 1;
  const currentXP = character.current_xp || 0;
  const currentTier = character.tier || 5;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const currentLevelInfo = getLevelInfo(currentLevel);
  const nextLevelInfo = getLevelInfo(currentLevel + 1);
  const canLevel = canLevelUp(character);
  
  const xpProgress = currentLevel >= 20 ? 100 : (currentXP / nextLevelXP) * 100;
  
  const levelHistory = (character.milestones || [])
    .filter(m => m.level)
    .map(m => ({
      level: m.level,
      xp: LEVEL_TABLE.find(l => l.level === m.level)?.xpRequired || 0,
      hp: character.max_hp,
      date: new Date(m.timestamp).toLocaleDateString()
    }));

  const abilityScores = character.ability_scores || {};
  const radarData = [
    { ability: 'STR', value: abilityScores.STR || 10 },
    { ability: 'DEX', value: abilityScores.DEX || 10 },
    { ability: 'CON', value: abilityScores.CON || 10 },
    { ability: 'INT', value: abilityScores.INT || 10 },
    { ability: 'WIS', value: abilityScores.WIS || 10 },
    { ability: 'CHA', value: abilityScores.CHA || 10 }
  ];

  const milestones = character.milestones || [];

  return (
    <div className="space-y-4">
      {/* Current Progress */}
      <Card className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronUp className="h-5 w-5 text-violet-400" />
              Current Progress
            </div>
            {canLevel && (
              <Button
                onClick={onLevelUp}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Level Up!
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400">Level</div>
              <div className="text-2xl font-bold text-white">{currentLevel}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400">Tier</div>
              <div className="text-2xl font-bold text-violet-400">{currentTier}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400">Current XP</div>
              <div className="text-2xl font-bold text-emerald-400">{currentXP.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400">Next Level</div>
              <div className="text-2xl font-bold text-amber-400">
                {currentLevel >= 20 ? 'MAX' : nextLevelXP.toLocaleString()}
              </div>
            </div>
          </div>
          
          {currentLevel < 20 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progress to Level {currentLevel + 1}</span>
                <span className="text-violet-400">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
              </div>
              <Progress value={xpProgress} className="h-3 bg-slate-700" />
              <div className="text-xs text-slate-500 mt-1">
                {(nextLevelXP - currentXP).toLocaleString()} XP needed
              </div>
            </div>
          )}
          
          {nextLevelInfo && currentLevel < 20 && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-violet-500/30">
              <div className="text-xs text-violet-400 mb-1">Next Level Gains:</div>
              <div className="text-sm text-white">{nextLevelInfo.gains}</div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Augments (Feats) */}
      {(character.augments || []).length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Augments ({(character.augments || []).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(character.augments || []).map((augment, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <div className="font-semibold text-white mb-1">{augment.name}</div>
                  {augment.description && (
                    <div className="text-xs text-slate-400 italic mb-2">{augment.description}</div>
                  )}
                  <ul className="text-xs text-slate-300 space-y-1">
                    {augment.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-1">
                        <span className="text-violet-400">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* XP Progression */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            XP Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={levelHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* HP Progression */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-red-400" />
            HP Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={levelHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="level" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="hp" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ability Scores Radar */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            Ability Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="ability" stroke="#94a3b8" />
              <PolarRadiusAxis stroke="#94a3b8" />
              <Radar name="Stats" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded">
                  <Badge className="bg-yellow-600">{milestone.type}</Badge>
                  <span className="text-sm text-slate-300">{milestone.description}</span>
                  <span className="text-xs text-slate-500 ml-auto">{milestone.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}