import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Swords, Heart, Zap, Target, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const getActionIcon = (type) => {
  switch(type) {
    case 'attack': return Swords;
    case 'heal': return Heart;
    case 'power': return Zap;
    case 'damage': return Target;
    case 'defense': return Shield;
    default: return FileText;
  }
};

const getActionColor = (type) => {
  switch(type) {
    case 'attack': return 'text-red-400';
    case 'heal': return 'text-green-400';
    case 'power': return 'text-violet-400';
    case 'damage': return 'text-orange-400';
    case 'defense': return 'text-blue-400';
    default: return 'text-slate-400';
  }
};

export default function CombatLog({ log = [] }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-400" />
          Combat Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {log.length > 0 ? (
            <div className="space-y-2">
              {log.slice().reverse().map((entry, i) => {
                const Icon = getActionIcon(entry.type);
                const colorClass = getActionColor(entry.type);
                
                return (
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/30 rounded border border-slate-700/30">
                    <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", colorClass)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{entry.actor}</span>
                        {entry.round && (
                          <Badge variant="outline" className="text-xs h-5">
                            Round {entry.round}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{entry.action}</p>
                      {entry.result && (
                        <p className={cn(
                          "text-xs mt-1 font-medium",
                          entry.critical ? "text-yellow-400" : "text-slate-400"
                        )}>
                          {entry.result}
                        </p>
                      )}
                    </div>
                    {entry.timestamp && (
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No combat actions yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}