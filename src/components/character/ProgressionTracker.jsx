import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Zap, Award } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ProgressionTracker({ character }) {
  // Mock progression data (in a real implementation, this would come from character history)
  const levelHistory = [
    { level: 1, xp: 0, hp: 30, date: 'Session 1' },
    { level: 2, xp: 300, hp: 35, date: 'Session 3' },
    { level: 3, xp: 900, hp: 40, date: 'Session 5' },
    { level: character.level || 1, xp: character.current_xp || 0, hp: character.max_hp, date: 'Current' }
  ];

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
          <ResponsiveContainer width="100%" height={300}>
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