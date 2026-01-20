import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CombatTurnTimer({ duration = 60 }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const reset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
  };

  const percentage = (timeLeft / duration) * 100;
  const isLow = percentage < 25;
  const isMedium = percentage < 50 && percentage >= 25;

  return (
    <Card className={cn(
      "bg-slate-800/50 border-2 transition-colors",
      isLow ? "border-red-500 shadow-lg shadow-red-500/30" :
      isMedium ? "border-yellow-500" : "border-slate-700"
    )}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <Clock className={cn(
            "h-4 w-4",
            isLow ? "text-red-400 animate-pulse" :
            isMedium ? "text-yellow-400" : "text-slate-400"
          )} />
          
          <div className="flex-1">
            <div className="text-2xl font-mono font-bold text-center mb-1" style={{
              color: isLow ? '#f87171' : isMedium ? '#fbbf24' : '#fff'
            }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isLow ? "bg-red-500" : isMedium ? "bg-yellow-500" : "bg-violet-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsRunning(!isRunning)}
              className="h-7 w-7"
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={reset}
              className="h-7 w-7"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}