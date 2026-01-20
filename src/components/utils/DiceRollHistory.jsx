import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dices, Trash2 } from "lucide-react";
import { format } from 'date-fns';

export default function DiceRollHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('diceRollHistory');
    if (saved) setHistory(JSON.parse(saved));

    // Listen for custom dice roll events
    const handleRoll = (e) => {
      const roll = {
        ...e.detail,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      setHistory(prev => {
        const updated = [roll, ...prev].slice(0, 50); // Keep last 50
        localStorage.setItem('diceRollHistory', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('diceRoll', handleRoll);
    return () => window.removeEventListener('diceRoll', handleRoll);
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('diceRollHistory');
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Dices className="h-4 w-4 text-violet-400" />
            Roll History
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearHistory}
            className="text-slate-400 hover:text-white"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map(roll => (
                <div key={roll.id} className="bg-slate-900/50 rounded p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{roll.character || 'Unknown'}</span>
                    <Badge className={roll.isCrit ? 'bg-yellow-600' : roll.isFail ? 'bg-red-600' : 'bg-slate-600'}>
                      {roll.roll}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{roll.type || 'Roll'}</span>
                    <span className="text-violet-400">Total: {roll.total}</span>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    {format(new Date(roll.timestamp), 'HH:mm:ss')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Dices className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">No rolls yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}