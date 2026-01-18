import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export default function ResourceBar({ 
  label, 
  current, 
  max, 
  color = "violet",
  onChange,
  showControls = true,
  size = "default"
}) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  const colorClasses = {
    violet: {
      bg: "bg-violet-500",
      glow: "shadow-violet-500/50",
      text: "text-violet-400",
      track: "bg-violet-950"
    },
    red: {
      bg: "bg-red-500",
      glow: "shadow-red-500/50", 
      text: "text-red-400",
      track: "bg-red-950"
    },
    blue: {
      bg: "bg-blue-500",
      glow: "shadow-blue-500/50",
      text: "text-blue-400",
      track: "bg-blue-950"
    },
    amber: {
      bg: "bg-amber-500",
      glow: "shadow-amber-500/50",
      text: "text-amber-400",
      track: "bg-amber-950"
    }
  };
  
  const colors = colorClasses[color] || colorClasses.violet;
  
  const handleChange = (delta) => {
    if (onChange) {
      const newValue = Math.min(max, Math.max(0, current + delta));
      onChange(newValue);
    }
  };
  
  return (
    <div className={cn("space-y-1", size === "sm" && "space-y-0.5")}>
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-medium uppercase tracking-wider",
          colors.text,
          size === "sm" ? "text-[10px]" : "text-xs"
        )}>
          {label}
        </span>
        <span className={cn(
          "font-bold text-white",
          size === "sm" ? "text-xs" : "text-sm"
        )}>
          {current} / {max}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {showControls && onChange && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => handleChange(-1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
        
        <div className={cn(
          "flex-1 rounded-full overflow-hidden",
          colors.track,
          size === "sm" ? "h-2" : "h-3"
        )}>
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300",
              colors.bg,
              percentage > 50 && "shadow-lg",
              percentage > 50 && colors.glow
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {showControls && onChange && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => handleChange(1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}