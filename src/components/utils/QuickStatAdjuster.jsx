import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuickStatAdjuster({ current, max, onChange, label, color = "violet" }) {
  const adjustments = [1, 5, 10];

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {adjustments.map(amt => (
          <Button
            key={`minus-${amt}`}
            size="sm"
            variant="ghost"
            onClick={() => onChange(Math.max(0, current - amt))}
            className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
            disabled={current <= 0}
          >
            <Minus className="h-3 w-3" />
            <span className="text-[10px]">{amt}</span>
          </Button>
        ))}
      </div>
      <div className={cn(
        "px-3 py-1 rounded font-mono text-sm min-w-[80px] text-center",
        `bg-${color}-900/30 border border-${color}-500/50 text-white`
      )}>
        {current}/{max}
      </div>
      <div className="flex gap-0.5">
        {adjustments.map(amt => (
          <Button
            key={`plus-${amt}`}
            size="sm"
            variant="ghost"
            onClick={() => onChange(Math.min(max, current + amt))}
            className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
            disabled={current >= max}
          >
            <Plus className="h-3 w-3" />
            <span className="text-[10px]">{amt}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}