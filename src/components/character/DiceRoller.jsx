import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dices, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useHaptic } from '@/components/utils/useHaptic';

export default function DiceRoller({ onRoll, modifier = 0, label = "" }) {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const { play } = useSoundEffects();
  
  const rollDice = (sides = 20, count = 1) => {
    setRolling(true);
    play('dice', 0.4);
    
    setTimeout(() => {
      const rolls = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
      
      const total = rolls.reduce((a, b) => a + b, 0);
      const finalResult = {
        rolls,
        total,
        modifier,
        final: total + modifier,
        sides,
        count,
        isCrit: sides === 20 && count === 1 && rolls[0] === 20,
        isFail: sides === 20 && count === 1 && rolls[0] === 1,
        timestamp: Date.now()
      };
      
      if (finalResult.isCrit) play('success', 0.5);
      else if (finalResult.isFail) play('error', 0.3);
      
      setResult(finalResult);
      setHistory(prev => [finalResult, ...prev].slice(0, 5));
      setRolling(false);
      
      if (onRoll) onRoll(finalResult);
    }, 600);
  };
  
  const clearHistory = () => {
    setHistory([]);
    setResult(null);
    play('click', 0.2);
  };
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-violet-500/30 corner-frame">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Dices className="h-4 w-4 text-violet-400" />
          Dice Roller
          {label && <span className="text-slate-500">· {label}</span>}
        </h3>
        {history.length > 0 && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-slate-500 hover:text-white"
              onClick={clearHistory}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Result Display */}
      <AnimatePresence mode="wait">
        {result && !rolling && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn(
              "text-center py-4 mb-3 rounded-lg relative overflow-hidden",
              result.isCrit && "bg-amber-500/20 border border-amber-500/50",
              result.isFail && "bg-red-500/20 border border-red-500/50",
              !result.isCrit && !result.isFail && "bg-slate-700/50"
            )}
          >
            {result.isCrit && (
              <>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-500/0"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Critical Hit!
                </div>
              </>
            )}
            {result.isFail && (
              <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                Critical Fail!
              </div>
            )}
            <motion.div 
              className="text-4xl font-bold text-white font-mono"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {result.final}
            </motion.div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {result.count}d{result.sides}: [{result.rolls.join(', ')}]
              {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
            </div>
          </motion.div>
        )}
        
        {rolling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 mb-3"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Dices className="h-8 w-8 text-violet-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quick Roll Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { sides: 20, label: 'd20', special: true },
          { sides: 10, label: 'd10' },
          { sides: 6, label: 'd6' },
          { sides: 4, label: 'd4' }
        ].map(die => (
          <motion.div key={die.sides} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => rollDice(die.sides, 1)}
              disabled={rolling}
              variant="outline"
              className={cn(
                "font-mono",
                die.special 
                  ? "border-violet-500/50 text-violet-400 hover:bg-violet-500/20"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              )}
            >
              {die.label}
            </Button>
          </motion.div>
        ))}
      </div>
      
      {/* Roll History */}
      {history.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Recent</div>
          <div className="flex gap-1 flex-wrap">
            {history.slice(1).map((h, i) => (
              <motion.span 
                key={h.timestamp} 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded font-mono"
              >
                {h.final}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}