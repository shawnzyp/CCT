import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function CalculatorResourceTracker({ 
  icon: Icon, 
  label, 
  current, 
  max, 
  color, 
  onUpdate,
  adjustments = [-1, -5, -10, -15, -20],
  type = 'HP'
}) {
  const percentage = (current / max) * 100;
  
  const colorClasses = {
    red: {
      bg: 'bg-red-950/30',
      border: 'border-red-900/50',
      text: 'text-red-300',
      icon: 'text-red-400',
      progress: 'bg-red-500',
      button: 'bg-red-600 hover:bg-red-700 border-red-500',
      buttonOutline: 'border-red-500/50 text-red-300 hover:bg-red-500/20'
    },
    blue: {
      bg: 'bg-blue-950/30',
      border: 'border-blue-900/50',
      text: 'text-blue-300',
      icon: 'text-blue-400',
      progress: 'bg-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
      buttonOutline: 'border-blue-500/50 text-blue-300 hover:bg-blue-500/20'
    }
  };
  
  const colors = colorClasses[color] || colorClasses.red;
  
  const adjustValue = (amount) => {
    const newValue = Math.max(0, Math.min(max, current + amount));
    onUpdate(newValue);
  };
  
  const resetToMax = () => {
    onUpdate(max);
  };
  
  return (
    <Card className={cn("overflow-hidden", colors.bg, colors.border)}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Icon className={cn("h-5 w-5", colors.icon)} />
          <span className={cn("text-sm font-semibold uppercase tracking-wide", colors.text)}>{label}</span>
        </div>
        
        {/* Display */}
        <div className="bg-slate-950/50 rounded-lg p-4 mb-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-white font-mono mb-1">
              {current}
            </div>
            <div className="text-sm text-slate-400">
              of {max}
            </div>
          </div>
          <Progress value={percentage} className={cn("h-2 mt-3", colors.progress)} />
        </div>
        
        {/* Quick Adjust Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1">
            {adjustments.map((adj) => (
              <Button
                key={adj}
                variant="outline"
                size="sm"
                onClick={() => adjustValue(adj)}
                className={cn("h-9 font-mono font-semibold", colors.buttonOutline)}
              >
                {adj}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustValue(-1)}
              className={cn("h-9 gap-1", colors.buttonOutline)}
            >
              <Minus className="h-3 w-3" />
              1
            </Button>
            <Button
              size="sm"
              onClick={resetToMax}
              className={cn("h-9 gap-1", colors.button)}
            >
              <RotateCcw className="h-3 w-3" />
              Full
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustValue(1)}
              className={cn("h-9 gap-1", colors.buttonOutline)}
            >
              <Plus className="h-3 w-3" />
              1
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}