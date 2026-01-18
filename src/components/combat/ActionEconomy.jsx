import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_TYPES = [
  { id: 'action', label: 'Action', description: 'Main action (attack, power, etc.)' },
  { id: 'movement', label: 'Movement', description: 'Move up to your speed' },
  { id: 'bonus_action', label: 'Bonus Action', description: 'Ready attack/power for next turn' },
  { id: 'reaction', label: 'Reaction', description: 'Once per round' }
];

export default function ActionEconomy({ usedActions = [], onToggle }) {
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {ACTION_TYPES.map(action => {
            const used = usedActions.includes(action.id);
            return (
              <button
                key={action.id}
                onClick={() => onToggle?.(action.id)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left",
                  used 
                    ? "border-slate-600 bg-slate-800/50" 
                    : "border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  used ? "border-slate-600 bg-slate-700" : "border-violet-500"
                )}>
                  {used && <Check className="h-3 w-3 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-xs font-semibold",
                    used ? "text-slate-500 line-through" : "text-white"
                  )}>
                    {action.label}
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    {action.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}