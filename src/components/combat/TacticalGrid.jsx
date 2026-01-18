import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3x3 } from "lucide-react";

const GRID_SIZE = 10;
const CELL_SIZE = 40;

export default function TacticalGrid({ combatants, onPositionChange }) {
  const handleCellClick = (x, y, combatant) => {
    if (onPositionChange) {
      onPositionChange(combatant.id, { x, y });
    }
  };
  
  const getCombatantAtPosition = (x, y) => {
    return combatants.find(c => c.position?.x === x && c.position?.y === y);
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-violet-400" />
          Tactical Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="inline-block bg-slate-900 p-2 rounded-lg">
          <div 
            className="grid gap-px bg-slate-700"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const combatant = getCombatantAtPosition(x, y);
              
              return (
                <div
                  key={i}
                  onClick={() => handleCellClick(x, y, combatant)}
                  className={cn(
                    "bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors flex items-center justify-center text-xs font-bold",
                    combatant && "bg-violet-500/20 hover:bg-violet-500/30"
                  )}
                >
                  {combatant && (
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs border-2",
                        combatant.isEnemy 
                          ? "bg-red-500 border-red-600" 
                          : "bg-blue-500 border-blue-600"
                      )}
                      title={combatant.name}
                    >
                      {combatant.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600" />
            <span>Heroes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600" />
            <span>Enemies</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}