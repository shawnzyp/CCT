import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dices, Swords, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import useSoundEffects from '@/components/sounds/useSoundEffects';
import { useHaptic } from '@/components/utils/useHaptic';

export default function DiceRollDialog({ 
  open, 
  onClose, 
  title, 
  modifier = 0,
  onRoll,
  type = 'attack' // 'attack', 'save', 'damage'
}) {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const { play } = useSoundEffects();
  const { haptic } = useHaptic();

  const rollDice = () => {
    setRolling(true);
    play('dice', 0.4);
    haptic('dice');
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    
    setTimeout(() => {
      setResult({ roll, total, modifier, isCrit: roll === 20, isFail: roll === 1 });
      setRolling(false);
      
      if (roll === 20) {
        play('success', 0.5);
        haptic('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else if (roll === 1) {
        play('error', 0.3);
        haptic('error');
      }
      
      if (onRoll) {
        onRoll({ roll, total, isCrit: roll === 20, isFail: roll === 1 });
      }
    }, 800);
  };

  const getIcon = () => {
    switch(type) {
      case 'attack': return Swords;
      case 'save': return Shield;
      case 'damage': return Zap;
      default: return Dices;
    }
  };

  const Icon = getIcon();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-violet-500 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon className="h-5 w-5 text-violet-400" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <AnimatePresence mode="wait">
              {!result && !rolling && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mb-4">
                    <Dices className="h-16 w-16 text-white" />
                  </div>
                  <p className="text-slate-400 text-sm">Roll 1d20 + {modifier}</p>
                </motion.div>
              )}

              {rolling && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ rotate: { duration: 0.8, ease: "linear" } }}
                >
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mb-4">
                    <Dices className="h-16 w-16 text-white" />
                  </div>
                  <p className="text-violet-400 text-sm font-medium">Rolling...</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className={`w-32 h-32 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                    result.isCrit 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                      : result.isFail
                        ? 'bg-gradient-to-br from-red-600 to-red-800'
                        : 'bg-gradient-to-br from-violet-600 to-purple-700'
                  }`}>
                    <div className="text-6xl font-bold text-white">{result.roll}</div>
                  </div>
                  
                  {result.isCrit && (
                    <Badge className="bg-amber-500 text-white mb-2">
                      Critical Hit! Double Damage Dice!
                    </Badge>
                  )}
                  {result.isFail && (
                    <Badge className="bg-red-500 text-white mb-2">
                      Critical Fail!
                    </Badge>
                  )}
                  
                  <div className="text-slate-400 text-sm space-y-1">
                    <div>Roll: <span className="text-white font-bold">{result.roll}</span></div>
                    {result.modifier !== 0 && (
                      <div>Modifier: <span className="text-emerald-400 font-bold">
                        {result.modifier >= 0 ? '+' : ''}{result.modifier}
                      </span></div>
                    )}
                    <div className="text-2xl font-bold text-violet-400 mt-2">
                      Total: {result.total}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            {!result && !rolling && (
              <Button 
                onClick={rollDice}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                <Dices className="h-4 w-4 mr-2" />
                Roll Dice
              </Button>
            )}
            {result && (
              <>
                <Button 
                  onClick={() => setResult(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Roll Again
                </Button>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}