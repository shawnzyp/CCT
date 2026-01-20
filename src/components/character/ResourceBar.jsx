import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSoundEffects from '@/components/sounds/useSoundEffects';

export default function ResourceBar({ 
  label, 
  current, 
  max, 
  color = "violet",
  onChange,
  showControls = true,
  size = "default"
}) {
  const [prevValue, setPrevValue] = useState(current);
  const { play } = useSoundEffects();
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  useEffect(() => {
    if (current !== prevValue) {
      const isHP = label.toLowerCase().includes('hp') || label.toLowerCase().includes('hit');
      const isSP = label.toLowerCase().includes('sp') || label.toLowerCase().includes('stamina');
      
      if (current < prevValue) {
        play(isHP ? 'hpLoss' : isSP ? 'spLoss' : 'error', 0.3);
      } else if (current > prevValue) {
        play(isHP ? 'hpGain' : isSP ? 'spGain' : 'success', 0.3);
      }
      setPrevValue(current);
    }
  }, [current, prevValue, label, play]);
  
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
      play('click', 0.1);
      onChange(newValue);
    }
  };

  const quickAdjust = (amount) => {
    if (onChange) {
      const newValue = Math.min(max, Math.max(0, current + amount));
      play('click', 0.1);
      onChange(newValue);
    }
  };
  
  return (
    <motion.div 
      className={cn("space-y-1 relative", size === "sm" && "space-y-0.5")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-medium uppercase tracking-wider font-mono",
          colors.text,
          size === "sm" ? "text-[10px]" : "text-xs"
        )}>
          {label}
        </span>
        <span className={cn(
          "font-bold text-white font-mono",
          size === "sm" ? "text-xs" : "text-sm"
        )}>
          {current} / {max}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {showControls && onChange && (
          <>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                onClick={() => quickAdjust(-5)}
                title="-5"
              >
                <span className="text-[10px] font-bold">-5</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-violet-500/20 border border-transparent hover:border-violet-500/30"
                onClick={() => handleChange(-1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </motion.div>
          </>
        )}
        
        <div className="flex-1 relative">
          <div className={cn(
            "rounded-full overflow-hidden",
            colors.track,
            size === "sm" ? "h-2" : "h-3"
          )}>
            <motion.div 
              className={cn(
                "h-full rounded-full transition-all duration-300",
                colors.bg,
                percentage > 50 && "shadow-lg",
                percentage > 50 && colors.glow
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <AnimatePresence>
            {current !== prevValue && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -20, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "absolute right-0 -top-5 text-xs font-bold pointer-events-none font-mono",
                  current > prevValue ? "text-green-400" : "text-red-400"
                )}
              >
                {current > prevValue ? '+' : ''}{current - prevValue}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {showControls && onChange && (
          <>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-violet-500/20 border border-transparent hover:border-violet-500/30"
                onClick={() => handleChange(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-slate-400 hover:text-green-400 hover:bg-green-500/20"
                onClick={() => quickAdjust(5)}
                title="+5"
              >
                <span className="text-[10px] font-bold">+5</span>
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}