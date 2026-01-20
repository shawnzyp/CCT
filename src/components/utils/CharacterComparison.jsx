import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import { getModifier } from "@/components/character/StatBlock";

export default function CharacterComparison({ characters }) {
  if (characters.length < 2) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-2 text-slate-500" />
          <p className="text-slate-400 text-sm">Need at least 2 characters to compare</p>
        </CardContent>
      </Card>
    );
  }

  const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-400" />
          Character Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Core Stats */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Ability Scores</h4>
              {stats.map(stat => (
                <div key={stat} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `100px repeat(${characters.length}, 1fr)` }}>
                  <div className="text-white font-mono text-sm">{stat}</div>
                  {characters.map(char => {
                    const value = char.ability_scores?.[stat] || 10;
                    const modifier = getModifier(value);
                    return (
                      <div key={char.id} className="bg-slate-700/50 rounded px-2 py-1 text-center text-xs">
                        <span className="text-white">{value}</span>
                        <span className="text-slate-400 ml-1">({modifier >= 0 ? '+' : ''}{modifier})</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Combat Stats */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Combat</h4>
              {['HP', 'TC', 'Speed'].map(stat => (
                <div key={stat} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `100px repeat(${characters.length}, 1fr)` }}>
                  <div className="text-white font-mono text-sm">{stat}</div>
                  {characters.map(char => (
                    <div key={char.id} className="bg-slate-700/50 rounded px-2 py-1 text-center text-xs text-white">
                      {stat === 'HP' && `${char.current_hp}/${char.max_hp}`}
                      {stat === 'TC' && char.toughness_class}
                      {stat === 'Speed' && `${char.speed}ft`}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Classifications */}
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Build</h4>
              <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `100px repeat(${characters.length}, 1fr)` }}>
                <div className="text-white font-mono text-sm">Class</div>
                {characters.map(char => (
                  <div key={char.id} className="text-xs">
                    <Badge className="bg-violet-600 text-white">{char.classification}</Badge>
                  </div>
                ))}
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `100px repeat(${characters.length}, 1fr)` }}>
                <div className="text-white font-mono text-sm">Powers</div>
                {characters.map(char => (
                  <div key={char.id} className="text-xs text-slate-400">
                    {char.power_styles?.join(', ') || 'None'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}