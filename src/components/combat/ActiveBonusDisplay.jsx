import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Swords } from "lucide-react";
import { calculateAllBonuses, getBonusDescription } from "@/components/character/BonusCalculator";
import { cn } from "@/lib/utils";

export default function ActiveBonusDisplay({ character }) {
  const bonuses = calculateAllBonuses(character);

  const hasBonuses = bonuses.tc > 10 || bonuses.toHit > 0 || bonuses.damage > 0 || bonuses.special.length > 0;

  if (!hasBonuses) return null;

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          Active Bonuses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Core Stats */}
        {bonuses.tc > 10 && (
          <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white font-medium">Toughness Class</span>
            </div>
            <Badge className="bg-blue-500 text-white font-mono">{bonuses.tc}</Badge>
          </div>
        )}

        {bonuses.toHit > 0 && (
          <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-red-400" />
              <span className="text-sm text-white font-medium">To Hit</span>
            </div>
            <Badge className="bg-red-500 text-white font-mono">+{bonuses.toHit}</Badge>
          </div>
        )}

        {bonuses.damage > 0 && (
          <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-white font-medium">Damage</span>
            </div>
            <Badge className="bg-orange-500 text-white font-mono">+{bonuses.damage}</Badge>
          </div>
        )}

        {/* Special Bonuses */}
        {bonuses.special.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono mb-2">Special Abilities</div>
            {bonuses.special.map((bonus, idx) => (
              <div 
                key={idx}
                className="bg-violet-500/10 border border-violet-500/30 rounded-lg px-3 py-2"
              >
                <div className="text-xs font-medium text-violet-300 mb-0.5">{bonus.source}: {bonus.name}</div>
                <div className="text-xs text-slate-400">
                  {getBonusDescription(bonus)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}