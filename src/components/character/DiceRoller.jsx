import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dices, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiceRoller({ onRoll, modifier = 0, label = "" }) {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);
  
  const rollDice = (sides = 20, count = 1) => {
    setRolling(true);
    
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
      
      setResult(finalResult);
      setHistory(prev => [finalResult, ...prev].slice(0, 5));
      setRolling(false);
      
      if (onRoll) onRoll(finalResult);
    }, 600);
  };
  
  const clearHistory = () => {
    setHistory([]);
    setResult(null);
  };
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Dices className="h-4 w-4 text-violet-400" />
          Dice Roller
          {label && <span className="text-slate-500">· {label}</span>}
        </h3>
        {history.length > 0 && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-500 hover:text-white"
            onClick={clearHistory}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
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
              "text-center py-4 mb-3 rounded-lg",
              result.isCrit && "bg-amber-500/20 border border-amber-500/50",
              result.isFail && "bg-red-500/20 border border-red-500/50",
              !result.isCrit && !result.isFail && "bg-slate-700/50"
            )}
          >
            {result.isCrit && (
              <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                Critical Hit!
              </div>
            )}
            {result.isFail && (
              <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">
                Critical Fail!
              </div>
            )}
            <div className="text-4xl font-bold text-white">{result.final}</div>
            <div className="text-xs text-slate-400 mt-1">
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
        <Button
          onClick={() => rollDice(20, 1)}
          disabled={rolling}
          variant="outline"
          className="border-violet-500/50 text-violet-400 hover:bg-violet-500/20"
        >
          d20
        </Button>
        <Button
          onClick={() => rollDice(10, 1)}
          disabled={rolling}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          d10
        </Button>
        <Button
          onClick={() => rollDice(6, 1)}
          disabled={rolling}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          d6
        </Button>
        <Button
          onClick={() => rollDice(4, 1)}
          disabled={rolling}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          d4
        </Button>
      </div>
      
      {/* Roll History */}
      {history.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Recent</div>
          <div className="flex gap-1 flex-wrap">
            {history.slice(1).map((h, i) => (
              <span key={h.timestamp} className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                {h.final}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}