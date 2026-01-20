import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { toast } from "sonner";

export default function SessionTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breakReminder, setBreakReminder] = useState(90 * 60); // 90 minutes

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => {
          const newTime = s + 1;
          
          // Break reminder every 90 minutes
          if (newTime === breakReminder) {
            toast.info("Break Time!", {
              description: "Consider taking a 10-minute break.",
              icon: <Coffee className="h-4 w-4" />
            });
            setBreakReminder(prev => prev + (90 * 60));
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, breakReminder]);

  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-violet-400" />
            <div>
              <div className="text-xs text-slate-400 uppercase">Session Time</div>
              <div className="text-2xl font-mono text-white">{formatTime(seconds)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRunning(!isRunning)}
              className="border-violet-500 text-violet-400"
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSeconds(0);
                setIsRunning(false);
                setBreakReminder(90 * 60);
              }}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}